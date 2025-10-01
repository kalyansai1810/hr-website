@echo off
REM HR Website Database Restore Script for Windows
REM This script restores a PostgreSQL database from backup

set BACKUP_DIR=%~dp0backups
set DB_NAME=hrdb
set DB_USER=hruser

echo Available backup files:
echo.
dir /b "%BACKUP_DIR%\*.sql" 2>nul
echo.

if "%1"=="" (
    set /p BACKUP_FILE="Enter the backup filename (without path): "
) else (
    set BACKUP_FILE=%1
)

set FULL_BACKUP_PATH=%BACKUP_DIR%\%BACKUP_FILE%

if not exist "%FULL_BACKUP_PATH%" (
    echo Error: Backup file not found: %FULL_BACKUP_PATH%
    pause
    exit /b 1
)

echo WARNING: This will replace all data in the database %DB_NAME%
set /p CONFIRM="Are you sure you want to continue? (y/N): "

if /i not "%CONFIRM%"=="y" (
    echo Restore cancelled.
    pause
    exit /b 0
)

echo Dropping existing database...
dropdb -h localhost -U %DB_USER% %DB_NAME% 2>nul

echo Creating new database...
createdb -h localhost -U %DB_USER% %DB_NAME%

if %ERRORLEVEL% NEQ 0 (
    echo Failed to create database!
    pause
    exit /b 1
)

echo Restoring database from backup...
psql -h localhost -U %DB_USER% -d %DB_NAME% -f "%FULL_BACKUP_PATH%"

if %ERRORLEVEL% EQU 0 (
    echo Database restored successfully!
) else (
    echo Restore failed! Please check the backup file and database connection.
    pause
    exit /b 1
)

echo Restore process completed.
pause