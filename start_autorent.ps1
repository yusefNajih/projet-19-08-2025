# AutoRent Cherkaoui - Script de démarrage PowerShell
Write-Host "========================================" -ForegroundColor Green
Write-Host "   AutoRent Cherkaoui - Démarrage" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Vérification de Node.js
Write-Host "Vérification de Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERREUR: Node.js n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    Write-Host "Veuillez installer Node.js depuis https://nodejs.org/" -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour quitter"
    exit 1
}

# Vérification de pnpm
Write-Host "Vérification de pnpm..." -ForegroundColor Yellow
try {
    $pnpmVersion = pnpm --version
    Write-Host "pnpm version: $pnpmVersion" -ForegroundColor Green
} catch {
    Write-Host "ATTENTION: pnpm n'est pas installé" -ForegroundColor Yellow
    Write-Host "Installation de pnpm..." -ForegroundColor Yellow
    npm install -g pnpm
}

# Vérification de MongoDB
Write-Host "Vérification de MongoDB..." -ForegroundColor Yellow
$mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
if ($mongoService) {
    if ($mongoService.Status -ne "Running") {
        Write-Host "Démarrage de MongoDB..." -ForegroundColor Yellow
        Start-Service -Name "MongoDB"
    }
    Write-Host "MongoDB est en cours d'exécution" -ForegroundColor Green
} else {
    Write-Host "ATTENTION: Service MongoDB non trouvé" -ForegroundColor Yellow
    Write-Host "Veuillez vous assurer que MongoDB est installé et configuré" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Démarrage du Backend..." -ForegroundColor Yellow
Set-Location "autorent-cherkaoui-backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "Attente de 5 secondes pour le démarrage du backend..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "Démarrage du Frontend..." -ForegroundColor Yellow
Set-Location "..\autorent-cherkaoui-frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "pnpm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   AutoRent Cherkaoui démarré !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:5001" -ForegroundColor Cyan
Write-Host ""
Write-Host "Connexion:" -ForegroundColor White
Write-Host "Email:    Cherkaoui@admin.com" -ForegroundColor White
Write-Host "Password: cherkaoui123" -ForegroundColor White
Write-Host ""

Read-Host "Appuyez sur Entrée pour ouvrir l'application"

Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "L'application s'ouvre dans votre navigateur..." -ForegroundColor Green
Write-Host "Fermez cette fenêtre quand vous avez terminé." -ForegroundColor Yellow
Read-Host "Appuyez sur Entrée pour quitter"
