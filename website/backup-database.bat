@echo off
REM HR Website Database Backup Script for Windows
REM This script creates a backup of the PostgreSQL database

set BACKUP_DIR=%~dp0backups
set DB_NAME=hrdb
set DB_USER=hruser
set TIMESTAMP=%date:~10,4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set BACKUP_FILE=%BACKUP_DIR%\hrdb_backup_%TIMESTAMP%.sql

REM Create backup directory if it doesn't exist
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

echo Creating database backup...
echo Backup file: %BACKUP_FILE%

REM Create database backup
pg_dump -h localhost -U %DB_USER% -d %DB_NAME% -f "%BACKUP_FILE%"

if %ERRORLEVEL% EQU 0 (
    echo Backup completed successfully!
    echo Backup saved to: %BACKUP_FILE%
) else (
    echo Backup failed! Please check your database connection and credentials.
    pause
    exit /b 1
)

REM Clean up old backups (keep only last 7 days)
forfiles /p "%BACKUP_DIR%" /s /m *.sql /d -7 /c "cmd /c del @path" 2>nul

echo Backup process completed.
pause