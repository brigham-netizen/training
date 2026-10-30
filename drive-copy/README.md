# Drive copy

Copies an entire external hard drive into a folder on a new computer. Nothing on the external drive is deleted or modified, and the copy can be stopped and restarted. Re-running it picks up where it left off.

## Windows (PowerShell)

1. Plug in the external drive and note its letter in File Explorer (for example `E:`).
2. Run:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\copy-drive.ps1 -Source E:\ -Destination "C:\Users\<you>\OldDrive"
   ```

## Mac / Linux

1. Plug in the external drive. On a Mac it appears under `/Volumes/<DriveName>`.
2. Run:
   ```bash
   ./copy-drive.sh "/Volumes/<DriveName>" ~/OldDrive
   ```
   On a Mac, if you get "Operation not permitted", give your terminal (or VS Code) **Full Disk Access** under System Settings → Privacy & Security.

## Good to know

- About 500 GB takes roughly 1.5–3 hours over USB 3, and much longer over USB 2.
- Each run writes a log file named `drive-copy-<date>.log` next to the destination folder.
- When it finishes, run the same command a second time. If it copies 0 files, everything made it over.
