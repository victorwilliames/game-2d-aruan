"""Conversor offline FBX -> GLB, com ufbx oficial e proveniência verificável.

Não substitui originais. Usa apenas stdlib e ufbx (requirements.txt).
Preserva baseColor PNG/JPEG embutido; mapas especiais têm diagnóstico explícito.
"""
from __future__ import annotations

import argparse
import array
import hashlib
import importlib.metadata
import json
import math
import os
from pathlib import Path
import struct
import sys
import time

CONVERTER_VERSION = "movalab-legacy/2"
# ufbx-python 0.0.5: keep the native ownership graph until process termination.
# CLI exits through os._exit after flushing, avoiding a binding finalizer crash.
# Run one input per subprocess; do not embed convert() in the long-lived service.
_NATIVE_OWNERS = []


def sha256(path):
    digest = hashlib.sha256()
    with open(path, "rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def matrix4(m):
    """ufbx affine columns -> glTF column-major MAT4."""
    return [*m.c0, 0.0, *m.c1, 0.0, *m.c2, 0.0, *m.c3, 1.0]


def image_header(data):
    """Recognize embedded PNG/JPEG by bytes, never by unsafe external paths.

    Header validation is not an image decoder. Browser QA must verify decoding.
    """
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        if len(data) < 33 or data[12:16] != b"IHDR" or struct.unpack_from(">I", data, 8)[0] != 13:
            raise ValueError("Cabeçalho PNG inválido")
        width, height = struct.unpack_from(">II", data, 16)
        alpha = data[25] in (4, 6)
        offset = 8
        while offset + 12 <= len(data):
            size = struct.unpack_from(">I", data, offset)[0]
            if offset + 12 + size > len(data):
                raise ValueError("Chunk PNG truncado")
            chunk = data[offset + 4:offset + 8]
            alpha |= chunk == b"tRNS"
            offset += size + 12
            if chunk == b"IEND":
                break
        else:
            raise ValueError("PNG sem IEND")
        if not width or not height:
            raise ValueError("PNG sem dimensões")
        return {"mimeType": "image/png", "width": width, "height": height, "hasAlpha": alpha}
    if data.startswith(b"\xff\xd8"):
        offset = 2
        while offset < len(data):
            if data[offset] != 0xFF:
                raise ValueError("Marcador JPEG inválido")
            while offset < len(data) and data[offset] == 0xFF:
                offset += 1
            if offset >= len(data):
                break
            marker = data[offset]
            offset += 1
            if marker in (0xD8, 0x01) or 0xD0 <= marker <= 0xD7:
                continue
            if marker in (0xD9, 0xDA) or offset + 2 > len(data):
                break
            size = struct.unpack_from(">H", data, offset)[0]
            if size < 2 or offset + size > len(data):
                raise ValueError("Segmento JPEG truncado")
            if marker in (0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF):
                if size < 8:
                    raise ValueError("Quadro JPEG inválido")
                height, width = struct.unpack_from(">HH", data, offset + 3)
                if not width or not height:
                    raise ValueError("JPEG sem dimensões")
                return {"mimeType": "image/jpeg", "width": width, "height": height, "hasAlpha": False}
            offset += size
        raise ValueError("JPEG sem quadro SOF suportado")
    raise ValueError("Formato embutido não é PNG/JPEG; conversão de imagem não implementada")


def triangulate(points):
    """Ear clipping in the dominant projection, preserving polygon winding.

    Unlike a triangle fan, concave FBX polygons are supported. Degenerate or
    self-intersecting polygons fail clearly instead of exporting fake topology.
    """
    if len(points) < 3:
        return []
    if len(points) == 3:
        return [0, 1, 2]
    normal = [0.0, 0.0, 0.0]
    for i, p in enumerate(points):
        q = points[(i + 1) % len(points)]
        normal[0] += (p[1] - q[1]) * (p[2] + q[2])
        normal[1] += (p[2] - q[2]) * (p[0] + q[0])
        normal[2] += (p[0] - q[0]) * (p[1] + q[1])
    drop = max(range(3), key=lambda i: abs(normal[i]))
    axes = [i for i in range(3) if i != drop]
    uv = [[p[i] for i in axes] for p in points]
    area = sum(p[0] * uv[(i + 1) % len(uv)][1] - uv[(i + 1) % len(uv)][0] * p[1]
               for i, p in enumerate(uv))
    orientation = 1 if area >= 0 else -1
    epsilon = max(1e-20, max(abs(v) for p in uv for v in p) ** 2 * 1e-12)

    def cross(a, b, c):
        return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])

    remaining, out = list(range(len(points))), []
    while len(remaining) > 3:
        for k, b in enumerate(remaining):
            a, c = remaining[k - 1], remaining[(k + 1) % len(remaining)]
            if orientation * cross(uv[a], uv[b], uv[c]) <= epsilon:
                continue
            inside = False
            for j in remaining:
                if j in (a, b, c):
                    continue
                if all(orientation * cross(uv[x], uv[y], uv[j]) >= -epsilon
                       for x, y in ((a, b), (b, c), (c, a))):
                    inside = True
                    break
            if inside:
                continue
            out.extend((a, b, c))
            remaining.pop(k)
            break
        else:
            raise ValueError("Polígono degenerado ou autointersectante: triangulação recusada")
    out.extend(remaining)
    return out


class Glb:
    def __init__(self):
        self.data = bytearray()
        self.doc = {"asset": {"version": "2.0", "generator": CONVERTER_VERSION},
                    "scene": 0, "scenes": [{"nodes": []}], "nodes": [], "meshes": [],
                    "materials": [], "skins": [], "accessors": [], "bufferViews": [], "buffers": []}

    def blob(self, data):
        while len(self.data) % 4:
            self.data.append(0)
        offset = len(self.data)
        self.data.extend(data)
        self.doc["bufferViews"].append({"buffer": 0, "byteOffset": offset, "byteLength": len(data)})
        return len(self.doc["bufferViews"]) - 1

    def accessor(self, values, components, component_type=5126, kind=None, bounds=False):
        if not values or len(values) % components:
            raise ValueError("Accessor vazio ou com dimensões inválidas")
        if not all(math.isfinite(v) for v in values):
            raise ValueError("NaN/Infinity nos dados de saída")
        while len(self.data) % 4:
            self.data.append(0)
        offset = len(self.data)
        code = {5126: "f", 5125: "I", 5123: "H"}[component_type]
        binary = array.array(code, values)
        if sys.byteorder != "little":
            binary.byteswap()
        self.data.extend(binary.tobytes())
        self.doc["bufferViews"].append({"buffer": 0, "byteOffset": offset, "byteLength": len(binary) * binary.itemsize})
        entry = {"bufferView": len(self.doc["bufferViews"]) - 1, "componentType": component_type,
                 "count": len(values) // components, "type": kind or {1: "SCALAR", 2: "VEC2", 3: "VEC3", 4: "VEC4", 16: "MAT4"}[components]}
        if bounds:
            entry["min"] = [min(values[i::components]) for i in range(components)]
            entry["max"] = [max(values[i::components]) for i in range(components)]
        self.doc["accessors"].append(entry)
        return len(self.doc["accessors"]) - 1

    def bytes(self):
        self.doc["buffers"] = [{"byteLength": len(self.data)}]
        text = json.dumps(self.doc, ensure_ascii=False, allow_nan=False, separators=(",", ":")).encode("utf-8")
        text += b" " * (-len(text) % 4)
        data = bytes(self.data) + b"\0" * (-len(self.data) % 4)
        total = 12 + 8 + len(text) + 8 + len(data)
        return struct.pack("<III", 0x46546C67, 2, total) + struct.pack("<II", len(text), 0x4E4F534A) + text + struct.pack("<II", len(data), 0x004E4942) + data


def convert(source, destination, *, fps=30, include_animation=True):
    import ufbx
    source, destination = Path(source).resolve(), Path(destination).resolve()
    if source == destination or destination.suffix.lower() != ".glb":
        raise ValueError("A saída deve ser outro arquivo .glb; original nunca é substituído")
    report_path = destination.with_suffix(".conversion.json")
    if destination.exists() or report_path.exists():
        raise FileExistsError("Derivado/relatório já existe; escolha outra saída")
    if not 1 <= fps <= 120:
        raise ValueError("Amostragem deve estar entre 1 e 120 FPS")
    started, original_hash = time.perf_counter(), sha256(source)
    scene = ufbx.load_file(str(source), target_axes=ufbx.axes_right_handed_y_up,
                           target_unit_meters=1.0, generate_missing_normals=True,
                           geometry_transform_handling=ufbx.GeometryTransformHandling.HELPER_NODES,
                           inherit_mode_handling=ufbx.InheritModeHandling.HELPER_NODES,
                           load_external_files=False)
    # Keep native owners/lists alive. ufbx-python 0.0.5 views must not outlive
    # temporary wrapper objects (especially skin vertex and material views).
    owners = [scene]
    _NATIVE_OWNERS.append(owners)
    def keep(value):
        owners.append(value)
        return value
    nodes = list(keep(scene.nodes))
    index = {n.element_id: i for i, n in enumerate(nodes)}
    glb = Glb()
    doc = glb.doc
    for node in nodes:
        transform = node.local_transform
        entry = {"name": node.name, "translation": list(transform.translation),
                 "rotation": list(transform.rotation), "scale": list(transform.scale)}
        children = [keep(child) for child in keep(node.children)]
        if len(children):
            entry["children"] = [index[c.element_id] for c in children]
        doc["nodes"].append(entry)
        if keep(node.parent) is None:
            doc["scenes"][0]["nodes"].append(index[node.element_id])
    diagnostics = {"meshes": [], "textures": [], "warnings": [
        "BaseColor PNG/JPEG embutido preservado; shaders FBX e mapas normal/specular/roughness não são convertidos.",
        "Imagens com alpha são exportadas como recorte 0.5; transparência blend FBX não é reproduzida.",
        "No máximo quatro influências por vértice, normalizadas; perdas são medidas por malha.",
        "Blend shapes, constraints e câmeras/luzes não são exportados."]}
    # Inventory embedded bytes only. Never open texture.filename, even when a
    # malicious file records absolute paths or '..' segments in its metadata.
    textures = [keep(texture) for texture in keep(scene.textures)]
    texture_diagnostics = {}
    embedded_hashes = set()
    for texture in textures:
        data = texture.content
        digest = hashlib.sha256(data).hexdigest() if data else None
        if digest:
            embedded_hashes.add(digest)
        item = {"sourceTextureId": texture.element_id,
                "name": Path(texture.relative_filename.replace("\\", "/")).name or texture.name,
                "embeddedBytes": len(data), "sha256": digest, "exportedAsBaseColor": False,
                "reason": "Mapa fora de baseColor/diffuse ou sem conexão de material exportada"}
        diagnostics["textures"].append(item)
        texture_diagnostics[texture.element_id] = item
    images_by_hash, textures_by_image_sampler, samplers_by_wrap = {}, {}, {}

    def base_texture(texture):
        if texture is None:
            return None
        item = texture_diagnostics.get(texture.element_id)
        if item is None:
            return None
        data = texture.content
        if not data:
            item["reason"] = "Textura sem bytes embutidos; leitura externa desativada"
            return None
        if texture.has_uv_transform:
            item["reason"] = "Transform UV FBX não convertido; mapa omitido"
            return None
        if len(data) > 64 * 1024 * 1024:
            item["reason"] = "Imagem embutida excede 64 MiB; mapa omitido"
            return None
        try:
            info = image_header(data)
        except ValueError as exc:
            item["reason"] = str(exc)
            return None
        digest = item["sha256"]
        if digest not in images_by_hash:
            image_index = len(doc.setdefault("images", []))
            doc["images"].append({"name": item["name"], "mimeType": info["mimeType"], "bufferView": glb.blob(data)})
            images_by_hash[digest] = image_index
        image_index = images_by_hash[digest]
        wrap = tuple(33071 if int(mode) == 1 else 10497 for mode in (texture.wrap_u, texture.wrap_v))
        if wrap not in samplers_by_wrap:
            sampler_index = len(doc.setdefault("samplers", []))
            doc["samplers"].append({"wrapS": wrap[0], "wrapT": wrap[1], "magFilter": 9729, "minFilter": 9987})
            samplers_by_wrap[wrap] = sampler_index
        key = (image_index, samplers_by_wrap[wrap])
        if key not in textures_by_image_sampler:
            texture_index = len(doc.setdefault("textures", []))
            doc["textures"].append({"source": image_index, "sampler": key[1]})
            textures_by_image_sampler[key] = texture_index
        item.update(info)
        item.update({"exportedAsBaseColor": True, "reason": "PNG/JPEG embutido copiado sem recompressão",
                     "imageIndex": image_index, "textureIndex": textures_by_image_sampler[key]})
        return {"index": textures_by_image_sampler[key], "hasAlpha": info["hasAlpha"]}

    material_index = {}
    materials = [keep(material) for material in keep(scene.materials)]
    for material in materials:
        connections = [keep(connection) for connection in keep(material.textures)]
        for connection in connections:
            connected = keep(connection.texture)
            item = texture_diagnostics.get(connected.element_id) if connected else None
            if item is not None:
                item.setdefault("materialConnections", []).append({"material": material.name, "property": connection.material_prop})
        pbr = keep(material.pbr)
        color_map = keep(pbr.base_color)
        rgba = list(color_map.value_vec4)
        rgba = [min(1.0, max(0.0, v)) for v in rgba[:3]] + [1.0]
        fbx = keep(material.fbx)
        diffuse = keep(fbx.diffuse_color)
        if not color_map.has_value:
            rgba = [min(1.0, max(0.0, v)) for v in diffuse.value_vec4[:3]] + [1.0]
        material_index[material.element_id] = len(doc["materials"])
        entry = {"name": material.name, "doubleSided": True,
                 "pbrMetallicRoughness": {"baseColorFactor": rgba, "metallicFactor": 0.0, "roughnessFactor": 0.8}}
        texture = keep(color_map.texture) or keep(diffuse.texture)
        converted_texture = base_texture(texture)
        if converted_texture:
            entry["pbrMetallicRoughness"]["baseColorTexture"] = {"index": converted_texture["index"], "texCoord": 0}
            if converted_texture["hasAlpha"]:
                entry.update({"alphaMode": "MASK", "alphaCutoff": 0.5})
        doc["materials"].append(entry)
    omitted_textures = [item for item in diagnostics["textures"] if not item["exportedAsBaseColor"]]
    if omitted_textures:
        diagnostics["warnings"].append(str(len(omitted_textures)) + " mapas de textura omitidos; motivos em diagnostics.textures")
    diagnostics["embeddedImagesDetected"] = len(embedded_hashes)
    meshes = [keep(mesh) for mesh in keep(scene.meshes)]
    for mesh in meshes:
        vp = keep(mesh.vertex_position)
        positions, position_indices = keep(vp.values), keep(vp.indices)
        vn = keep(mesh.vertex_normal)
        normals, normal_indices = keep(vn.values), keep(vn.indices)
        vt = keep(mesh.vertex_uv)
        uvs, uv_indices = keep(vt.values), keep(vt.indices)
        vertex_indices = keep(mesh.vertex_indices)
        skin_deformers = keep(mesh.skin_deformers)
        skin = keep(skin_deformers[0]) if len(skin_deformers) else None
        if len(skin_deformers) > 1:
            raise ValueError("Mais de um skin deformer: conversão ambígua recusada")
        clusters = [keep(cluster) for cluster in keep(skin.clusters)] if skin else []
        skin_vertices, skin_weights = (keep(skin.vertices), keep(skin.weights)) if skin else (None, None)
        p, n, uv, joints, weights = [], [], [], [], []
        max_discarded, unweighted = 0.0, 0
        for i in range(mesh.num_indices):
            p.extend(positions[position_indices[i]])
            if vn.exists:
                n.extend(normals[normal_indices[i]])
            if vt.exists:
                coord = uvs[uv_indices[i]]
                # glTF samples embedded images with flipY=false. FBX uses the
                # opposite V image origin; invert V while copying bytes exactly.
                uv.extend((coord[0], 1.0 - coord[1]))
            if skin:
                vertex = skin_vertices[vertex_indices[i]]
                influence = [skin_weights[k] for k in range(vertex.weight_begin, vertex.weight_begin + vertex.num_weights)]
                influence.sort(key=lambda w: w.weight, reverse=True)
                max_discarded = max(max_discarded, sum(w.weight for w in influence[4:]))
                selected = influence[:4]
                total = sum(w.weight for w in selected)
                if total <= 0:
                    raise ValueError("Vértice sem peso em malha skinned: " + mesh.name + ":" + str(i))
                joints.extend([w.cluster_index for w in selected] + [0] * (4 - len(selected)))
                weights.extend([w.weight / total for w in selected] + [0.0] * (4 - len(selected)))
        attributes = {"POSITION": glb.accessor(p, 3, bounds=True)}
        if n:
            attributes["NORMAL"] = glb.accessor(n, 3)
        if uv:
            attributes["TEXCOORD_0"] = glb.accessor(uv, 2)
        if skin:
            attributes["JOINTS_0"] = glb.accessor(joints, 4, 5123)
            attributes["WEIGHTS_0"] = glb.accessor(weights, 4)
        faces = keep(mesh.faces)
        face_material = keep(mesh.face_material)
        mesh_materials = [keep(material) for material in keep(mesh.materials)]
        grouped = {}
        triangles = 0
        for fi, face in enumerate(faces):
            if face.num_indices < 3:
                continue
            start, count = face.index_begin, face.num_indices
            points = [p[(start + i) * 3:(start + i) * 3 + 3] for i in range(count)]
            result = triangulate(points)
            triangles += len(result) // 3
            mi = face_material[fi] if len(face_material) else 0
            grouped.setdefault(mi, []).extend(start + i for i in result)
        primitives = []
        for mi, indices in grouped.items():
            primitive = {"attributes": attributes, "indices": glb.accessor(indices, 1, 5125), "mode": 4}
            if mi < len(mesh_materials):
                primitive["material"] = material_index[mesh_materials[mi].element_id]
            primitives.append(primitive)
        if not primitives:
            raise ValueError("Malha sem triângulos exportáveis: " + mesh.name)
        mesh_id = len(doc["meshes"])
        doc["meshes"].append({"name": mesh.name, "primitives": primitives})
        instances = [keep(instance) for instance in keep(mesh.instances)]
        for instance in instances:
            # Geometry helpers from ufbx keep mesh-space and bind matrices aligned.
            node_id = index[instance.element_id]
            doc["nodes"][node_id]["mesh"] = mesh_id
            if skin:
                inverse_bind = []
                joint_ids = []
                for cluster in clusters:
                    bone = keep(cluster.bone_node)
                    if bone is None:
                        raise ValueError("Cluster sem osso: " + mesh.name)
                    joint_ids.append(index[bone.element_id])
                    inverse_bind.extend(matrix4(cluster.geometry_to_bone))
                doc["nodes"][node_id]["skin"] = len(doc["skins"])
                doc["skins"].append({"joints": joint_ids, "inverseBindMatrices": glb.accessor(inverse_bind, 16)})
        diagnostics["meshes"].append({"name": mesh.name, "vertices": mesh.num_vertices, "polygonVertices": mesh.num_indices,
                                       "triangles": triangles, "joints": len(clusters), "maxDiscardedWeight": max_discarded,
                                       "unweightedPolygonVertices": unweighted})
    stacks = [keep(stack) for stack in keep(scene.anim_stacks)]
    if include_animation:
        animations = []
        for stack in stacks:
            duration = stack.time_end - stack.time_begin
            if duration <= 0:
                continue
            if duration > 300:
                raise ValueError("Animação acima de 300s: conversão recusada")
            count = max(2, math.ceil(duration * fps) + 1)
            times = [i * duration / (count - 1) for i in range(count)]
            time_accessor = glb.accessor(times, 1, bounds=True)
            animation = {"name": stack.name, "samplers": [], "channels": []}
            anim = keep(stack.anim)
            for node in nodes:
                channels = {"translation": [], "rotation": [], "scale": []}
                for t in times:
                    transform = ufbx.evaluate_transform(anim, node, stack.time_begin + t)
                    channels["translation"].extend(transform.translation)
                    channels["rotation"].extend(transform.rotation)
                    channels["scale"].extend(transform.scale)
                for channel, values in channels.items():
                    components = 4 if channel == "rotation" else 3
                    first = values[:components]
                    rest = list(getattr(node.local_transform, channel))
                    if (all(abs(v - first[i % components]) < 1e-7 for i, v in enumerate(values))
                            and all(abs(v - rest[i]) < 1e-7 for i, v in enumerate(first))):
                        continue
                    output = glb.accessor(values, components)
                    animation["samplers"].append({"input": time_accessor, "output": output, "interpolation": "LINEAR"})
                    animation["channels"].append({"sampler": len(animation["samplers"]) - 1,
                                                   "target": {"node": index[node.element_id], "path": channel}})
            if animation["channels"]:
                animations.append(animation)
        if animations:
            doc["animations"] = animations
    if sha256(source) != original_hash:
        raise RuntimeError("Original mudou durante a conversão; saída não foi gravada")
    metadata = keep(scene.metadata)
    report = {"schemaVersion": 1, "converter": CONVERTER_VERSION,
              "ufbxPythonVersion": importlib.metadata.version("ufbx"),
              "source": {"name": source.name, "sha256": original_hash, "bytes": source.stat().st_size, "fbxVersion": metadata.version},
              "output": {"name": destination.name, "format": "glTF 2.0 binary", "units": "meters", "axes": "right-handed Y-up"},
              "settings": {"fps": fps, "includeAnimation": include_animation, "maxSkinInfluences": 4},
              "counts": {"nodes": len(doc["nodes"]), "meshes": len(doc["meshes"]), "skins": len(doc["skins"]),
                         "materials": len(doc["materials"]), "sourceAnimStacks": len(stacks),
                         "images": len(doc.get("images", [])), "textures": len(doc.get("textures", [])),
                         "animations": len(doc.get("animations", []))},
              "diagnostics": diagnostics, "elapsedSeconds": round(time.perf_counter() - started, 3)}
    data = glb.bytes()
    report["output"].update({"sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data)})
    destination.parent.mkdir(parents=True, exist_ok=True)
    # Exclusive creation prevents overwriting another run or user-owned output.
    with destination.open("xb") as stream:
        stream.write(data)
    with report_path.open("x", encoding="utf-8", newline="\n") as stream:
        json.dump(report, stream, ensure_ascii=False, indent=2, allow_nan=False)
        stream.write("\n")
    return report


def main():
    parser = argparse.ArgumentParser(description="Converter FBX legado para GLB sem alterar originais")
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    parser.add_argument("--fps", type=int, default=30)
    parser.add_argument("--no-animation", action="store_true")
    args = parser.parse_args()
    try:
        report = convert(args.source, args.destination, fps=args.fps, include_animation=not args.no_animation)
    except Exception as exc:
        print("Conversão recusada: " + str(exc), file=sys.stderr, flush=True)
        return 1
    print(json.dumps(report, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
    status = main()
    sys.stdout.flush()
    sys.stderr.flush()
    os._exit(status)
