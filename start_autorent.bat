@echo off
echo ========================================
echo   AutoRent Cherkaoui - Demarrage
echo ========================================
echo.

echo Verification de Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERREUR: Node.js n'est pas installe ou n'est pas dans le PATH
    echo Veuillez installer Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

echo Verification de MongoDB...
net start | findstr /i "mongodb" >nul
if %errorlevel% neq 0 (
    echo Demarrage de MongoDB...
    net start MongoDB >nul 2>&1
    if %errorlevel% neq 0 (
        echo ATTENTION: Impossible de demarrer MongoDB automatiquement
        echo Veuillez demarrer MongoDB manuellement
    )
)

echo.
echo Demarrage du Backend...
cd autorent-cherkaoui-backend
start "AutoRent Backend" cmd /k "npm run dev"

echo.
echo Attente de 5 secondes pour le demarrage du backend...
timeout /t 5 /nobreak >nul

echo.
echo Demarrage du Frontend...
cd ..\autorent-cherkaoui-frontend
start "AutoRent Frontend" cmd /k "pnpm run dev"

echo.
echo ========================================
echo   AutoRent Cherkaoui demarre !
echo ========================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5001
echo.
echo Connexion:
echo Email:    Cherkaoui@admin.com
echo Password: cherkaoui123
echo.
echo Appuyez sur une touche pour ouvrir l'application...
pause >nul

start http://localhost:5173

echo.
echo L'application s'ouvre dans votre navigateur...
echo Fermez cette fenetre quand vous avez termine.
pause
