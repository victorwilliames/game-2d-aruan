"""Unit tests + optional isolated conversion of the five real FBX 6100 files."""
import argparse
import hashlib
import json
import math
from pathlib import Path
import struct
import subprocess
import sys
import tempfile
import unittest

from convert_fbx import Glb, triangulate


def read_glb(path):
    data = Path(path).read_bytes()
    magic, version, size = struct.unpack_from("<III", data)
    assert (magic, version, size) == (0x46546C67, 2, len(data))
    length, kind = struct.unpack_from("<II", data, 12)
    assert kind == 0x4E4F534A and length % 4 == 0
    doc = json.loads(data[20:20 + length])
    offset = 20 + length
    binary_length, binary_kind = struct.unpack_from("<II", data, offset)
    assert binary_kind == 0x004E4942 and offset + 8 + binary_length == len(data)
    binary = data[offset + 8:]
    for view in doc["bufferViews"]:
        assert view.get("byteOffset", 0) % 4 == 0
        assert view.get("byteOffset", 0) + view["byteLength"] <= doc["buffers"][0]["byteLength"]
    return doc, binary


class UnitTests(unittest.TestCase):
    def test_concave_triangulation_preserves_area_and_winding(self):
        polygon = [(0, 0, 0), (2, 0, 0), (2, 2, 0), (1, 1, 0), (0, 2, 0)]
        for points in (polygon, polygon[::-1]):
            triangles = triangulate(points)
            self.assertEqual(len(triangles), 9)
            area = 0
            for i in range(0, len(triangles), 3):
                a, b, c = (points[j] for j in triangles[i:i + 3])
                cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
                self.assertGreater(cross * (1 if points is polygon else -1), 0)
                area += abs(cross) / 2
            self.assertAlmostEqual(area, 3)

    def test_self_intersecting_polygon_rejected(self):
        with self.assertRaises(ValueError):
            triangulate([(0, 0, 0), (1, 1, 0), (0, 1, 0), (1, 0, 0)])

    def test_glb_alignment_bounds_and_invalid_numbers(self):
        glb = Glb()
        accessor = glb.accessor([0, 1, 2, 3, 4, 5], 3, bounds=True)
        self.assertEqual(glb.doc["accessors"][accessor]["min"], [0, 1, 2])
        self.assertEqual(glb.doc["accessors"][accessor]["max"], [3, 4, 5])
        with self.assertRaises(ValueError):
            glb.accessor([math.nan], 1)
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "tiny.glb"
            path.write_bytes(glb.bytes())
            read_glb(path)


REAL_INPUTS = ["Characters3D/y-bot.fbx", "Characters3D/theboss.fbx",
               "Characters3D/male-realista.fbx", "Characters3D/gordo.fbx",
               "Animations/Male Locomotion Pack/Y Bot.fbx"]


def test_pack(pack, output):
    """Run native binding only in single-input subprocesses (bounded memory)."""
    output.mkdir(parents=True, exist_ok=True)
    reports = []
    for number, relative in enumerate(REAL_INPUTS, 1):
        source = pack / relative
        original = hashlib.sha256(source.read_bytes()).hexdigest()
        destination = output / (str(number) + "-" + source.stem + ".glb")
        command = [sys.executable, "-X", "faulthandler", str(Path(__file__).with_name("convert_fbx.py")),
                   str(source), str(destination)]
        result = subprocess.run(command, capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=180)
        assert result.returncode == 0, relative + ": " + result.stdout + result.stderr
        report = json.loads(destination.with_suffix(".conversion.json").read_text(encoding="utf-8"))
        assert report["source"]["fbxVersion"] == 6100
        assert report["source"]["sha256"] == original == hashlib.sha256(source.read_bytes()).hexdigest()
        assert report["output"]["sha256"] == hashlib.sha256(destination.read_bytes()).hexdigest()
        doc, binary = read_glb(destination)
        assert doc["meshes"] and doc["skins"] and doc["materials"]
        for mesh in doc["meshes"]:
            for primitive in mesh["primitives"]:
                attr = primitive["attributes"]
                assert all(key in attr for key in ("POSITION", "NORMAL", "JOINTS_0", "WEIGHTS_0"))
                accessor = doc["accessors"][attr["WEIGHTS_0"]]
                view = doc["bufferViews"][accessor["bufferView"]]
                weights = struct.unpack_from("<" + str(accessor["count"] * 4) + "f", binary, view.get("byteOffset", 0))
                assert all(abs(sum(weights[i:i + 4]) - 1) < 1e-5 for i in range(0, len(weights), 4))
        for skin in doc["skins"]:
            assert all(0 <= joint < len(doc["nodes"]) for joint in skin["joints"])
            assert doc["accessors"][skin["inverseBindMatrices"]]["count"] == len(skin["joints"])
        # Existing output must fail, preserving both derived output and original.
        second = subprocess.run(command, capture_output=True, timeout=30)
        assert second.returncode != 0
        assert report["output"]["sha256"] == hashlib.sha256(destination.read_bytes()).hexdigest()
        reports.append({"source": relative, "output": str(destination), **report["counts"],
                        "triangles": sum(m["triangles"] for m in report["diagnostics"]["meshes"]),
                        "maxDiscardedWeight": max(m["maxDiscardedWeight"] for m in report["diagnostics"]["meshes"]),
                        "sourceSHA256": original, "outputSHA256": report["output"]["sha256"]})
        print(json.dumps(reports[-1]), flush=True)
    (output / "pack-report.json").write_text(json.dumps(reports, indent=2) + "\n", encoding="utf-8")
    return reports


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--pack", type=Path)
    parser.add_argument("--output", type=Path)
    args, rest = parser.parse_known_args()
    result = unittest.TextTestRunner().run(unittest.defaultTestLoader.loadTestsFromTestCase(UnitTests))
    if not result.wasSuccessful():
        sys.exit(1)
    if args.pack:
        if not args.output:
            parser.error("--output é obrigatório com --pack; originais nunca recebem derivados")
        test_pack(args.pack.resolve(), args.output.resolve())
