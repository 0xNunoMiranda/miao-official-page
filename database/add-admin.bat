@echo off
REM Script para adicionar novo administrador ao MIAO Tools
REM Usage: add-admin.bat <wallet> <username> <password> <email>

if "%~4"=="" (
    echo Usage: add-admin.bat ^<wallet_address^> ^<username^> ^<password^> ^<email^>
    echo Example: add-admin.bat 0x742d35Cc6634C0532925a3b844Bc9e7FA9946aF4 nunoAdmin myPass123 nuno@miao.com
    exit /b 1
)

set WALLET=%~1
set USERNAME=%~2
set PASSWORD=%~3
set EMAIL=%~4

REM Configurações da BD
set DB_HOST=62.193.192.12
set DB_USER=miaotoke_miranda
set DB_PASS=_Miranda69_!
set DB_NAME=miaotoke_website

echo Adding new admin to MIAO Tools...
echo Wallet: %WALLET%
echo Username: %USERNAME%
echo Email: %EMAIL%
echo.

REM Criar arquivo SQL temporário
echo CALL sp_admin_create( > temp_admin.sql
echo   '%WALLET%', >> temp_admin.sql
echo   '%USERNAME%', >> temp_admin.sql
echo   SHA2('%PASSWORD%', 256), >> temp_admin.sql
echo   '%EMAIL%', >> temp_admin.sql
echo   1 >> temp_admin.sql
echo ); >> temp_admin.sql

REM Executar SQL
mysql -h %DB_HOST% -u %DB_USER% -p%DB_PASS% -D %DB_NAME% < temp_admin.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Admin created successfully!
    echo.
    echo Login credentials:
    echo   Username: %USERNAME%
    echo   Password: %PASSWORD%
    echo   Wallet: %WALLET%
    echo.
    echo ⚠️  Store these credentials securely!
) else (
    echo.
    echo ❌ Failed to create admin. Check database connection and credentials.
)

REM Limpar arquivo temporário
del temp_admin.sql

exit /b %ERRORLEVEL%
