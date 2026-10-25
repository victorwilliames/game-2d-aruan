param([Parameter(Mandatory=$true)][string[]]$Roots)
$ErrorActionPreference='Stop'
# FileStandardInfo.AllocationSize measures allocated NTFS bytes, not just Length.
Add-Type -TypeDefinition @'
using System;
using System.IO;
using System.Runtime.InteropServices;
using Microsoft.Win32.SafeHandles;
public static class MixamoAllocation {
 [StructLayout(LayoutKind.Sequential)] public struct StandardInfo {
  public long AllocationSize; public long EndOfFile; public uint NumberOfLinks;
  [MarshalAs(UnmanagedType.U1)] public bool DeletePending;
  [MarshalAs(UnmanagedType.U1)] public bool Directory;
 }
 [DllImport("kernel32.dll", SetLastError=true)] static extern bool GetFileInformationByHandleEx(SafeFileHandle handle, int infoClass, out StandardInfo info, uint size);
 public static long Bytes(string path) {
  using(var stream=new FileStream(path,FileMode.Open,FileAccess.Read,FileShare.ReadWrite|FileShare.Delete)) {
   StandardInfo info;
   if(!GetFileInformationByHandleEx(stream.SafeFileHandle,1,out info,(uint)Marshal.SizeOf(typeof(StandardInfo)))) throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error());
   return info.AllocationSize;
  }
 }
}
'@
$results=foreach($root in $Roots){
 $resolved=(Resolve-Path -LiteralPath $root).Path
 [long]$logical=0;[long]$allocated=0;[int]$count=0
 Get-ChildItem -LiteralPath $resolved -Recurse -File -Force | Where-Object { -not ($_.Attributes -band [IO.FileAttributes]::ReparsePoint) } | ForEach-Object {
  $logical+=$_.Length
  $allocated+=[MixamoAllocation]::Bytes($_.FullName)
  $count++
 }
 [pscustomobject]@{Root=$resolved;Files=$count;LogicalBytes=$logical;AllocatedBytes=$allocated;CheckedAt=[DateTime]::UtcNow.ToString('o')}
}
$results | ConvertTo-Json -Depth 3
