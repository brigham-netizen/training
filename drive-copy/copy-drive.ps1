<#
  copy-drive.ps1 - Copy everything from an external drive onto this Windows computer.

  Usage (PowerShell):
    .\copy-drive.ps1 -Source E:\ -Destination "C:\Users\<you>\OldDrive"

  - Never deletes or changes anything on the source drive.
  - Safe to re-run: files already copied are skipped, so an interrupted copy resumes.
  - Writes a log file next to the destination folder.
#>
param(
    [Parameter(Mandatory = $true)][string]$Source,
    [Parameter(Mandatory = $true)][string]$Destination
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $Source)) { throw "Source '$Source' not found. Is the external drive plugged in?" }
New-Item -ItemType Directory -Force -Path $Destination | Out-Null

# Make sure the destination drive has room.
$srcDrive = Get-PSDrive -Name ((Resolve-Path -LiteralPath $Source).Drive.Name)
$dstDrive = Get-PSDrive -Name ((Resolve-Path -LiteralPath $Destination).Drive.Name)
$needGB = [math]::Round($srcDrive.Used / 1GB, 1)
$freeGB = [math]::Round($dstDrive.Free / 1GB, 1)
Write-Host "Source uses ~$needGB GB; destination has $freeGB GB free."
if ($srcDrive.Used -gt $dstDrive.Free) { throw "Not enough free space on the destination drive." }

$log = Join-Path (Split-Path -Parent $Destination) ("drive-copy-{0:yyyyMMdd-HHmmss}.log" -f (Get-Date))
Write-Host "Copying... log: $log"

# /E all subfolders, /COPY:DAT data+attributes+timestamps, /R:2 /W:5 retry bad files briefly,
# /MT:16 multithreaded, /XJ skip junction loops, /XD skip Windows system folders on the drive.
robocopy $Source $Destination /E /COPY:DAT /DCOPY:DAT /R:2 /W:5 /MT:16 /XJ /NP /TEE `
    /XD "System Volume Information" '$RECYCLE.BIN' `
    /LOG+:$log

# Robocopy exit codes 0-7 mean success; 8+ means some files failed.
if ($LASTEXITCODE -ge 8) {
    Write-Warning "Some files could not be copied (code $LASTEXITCODE). Search the log for 'ERROR', then re-run this script to retry."
    exit 1
}
Write-Host "Done. Re-run the same command any time to verify - it should report 0 files copied."
