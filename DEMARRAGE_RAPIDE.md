# 🚀 Guide de Démarrage Rapide - AutoRent Cherkaoui

## ⚡ Démarrage Automatique (Recommandé)

### Option 1: Script PowerShell (Windows 10/11)
```powershell
# Clic droit sur start_autorent.ps1 > "Exécuter avec PowerShell"
# Ou dans PowerShell :
.\start_autorent.ps1
```

### Option 2: Script Batch (Toutes versions Windows)
```cmd
# Double-clic sur start_autorent.bat
# Ou dans l'invite de commande :
start_autorent.bat
```

## 🔧 Démarrage Manuel

### 1. Démarrer MongoDB
```powershell
# Via les services Windows
services.msc
# Chercher "MongoDB Server" et démarrer

# Ou via la ligne de commande
net start MongoDB
```

### 2. Démarrer le Backend
```powershell
cd autorent-cherkaoui-backend
npm run dev
```

### 3. Démarrer le Frontend
```powershell
cd autorent-cherkaoui-frontend
pnpm run dev
```

## 🌐 Accès à l'Application

- **Interface utilisateur** : http://localhost:5173
- **API Backend** : http://localhost:5001

## 🔑 Connexion

- **Email** : `Cherkaoui@admin.com`
- **Mot de passe** : `cherkaoui123`

## 🆘 Problèmes Courants

### MongoDB ne démarre pas
```powershell
# Vérifier l'installation
net start | findstr MongoDB

# Redémarrer le service
net stop MongoDB
net start MongoDB
```

### Port déjà utilisé
```powershell
# Vérifier les ports
netstat -an | findstr :5001
netstat -an | findstr :5173

# Arrêter les processus Node.js
taskkill /f /im node.exe
```

### Dépendances manquantes
```powershell
# Backend
cd autorent-cherkaoui-backend
npm install

# Frontend
cd autorent-cherkaoui-frontend
pnpm install
```

## 📞 Support

Si vous rencontrez des problèmes, consultez le fichier `README.md` pour une documentation complète ou contactez le support technique.
