# AutoRent Cherkaoui - Système de Gestion de Location de Voitures

## 🚗 Description

AutoRent Cherkaoui est une application web complète de gestion de location de voitures développée spécifiquement pour les entreprises de location au Maroc. L'application offre une interface bilingue (français/arabe) avec support RTL complet et toutes les fonctionnalités nécessaires pour gérer efficacement une entreprise de location de véhicules.

Cette solution moderne combine une interface utilisateur intuitive avec un backend robuste pour offrir une expérience de gestion complète, de la réservation à la facturation, en passant par la maintenance des véhicules.

## ✨ Fonctionnalités Principales

### ✅ **Fonctionnalités Implémentées et Testées**

#### 🔐 **Authentification et Sécurité**
- Système d'authentification JWT sécurisé
- Gestion des rôles et permissions (Admin, Manager, Employé)
- Sessions persistantes avec déconnexion automatique
- Protection contre les attaques CSRF et XSS
- Rate limiting pour prévenir les attaques par force brute

#### 🚙 **Gestion des Véhicules**
- CRUD complet (Créer, Lire, Modifier, Supprimer)
- Suivi de l'état des véhicules (Disponible, Loué, En maintenance, Hors service)
- Gestion des documents (Assurance, Carte grise, Contrôle technique)
- Alertes automatiques pour les documents expirés
- Historique complet des locations par véhicule
- Calcul automatique du kilométrage et de l'usure

#### 👥 **Gestion des Clients**
- Base de données clients complète avec validation
- Vérification automatique de l'éligibilité (âge, permis)
- Historique des locations et comportement client
- Système de liste noire et suspension
- Gestion des documents clients (CIN, Permis de conduire)
- Calcul automatique de la fidélité et des remises

#### 📅 **Gestion des Réservations**
- Système de réservation avec vérification de disponibilité
- Calendrier interactif pour visualiser les réservations
- Gestion des conflits de réservation automatique
- Calculs automatiques des prix et des suppléments
- Suivi des états (En attente, Confirmée, Active, Terminée, Annulée)
- Notifications automatiques pour les retards

#### 📊 **Tableau de Bord et Analyses**
- Statistiques en temps réel (Revenus, Véhicules actifs, Clients)
- Graphiques de performance et tendances
- Alertes et notifications importantes
- Métriques de performance de la flotte
- Rapports de rentabilité par véhicule

#### 🌐 **Internationalisation**
- Support complet français/arabe
- Interface RTL (Right-to-Left) pour l'arabe
- Changement de langue en temps réel
- Formatage des dates et devises localisé
- Documents PDF bilingues

### 🚧 **Fonctionnalités en Développement**

#### 💰 **Facturation Avancée**
- Génération automatique de factures PDF bilingues
- Calculs complexes avec taxes et suppléments
- Gestion des modes de paiement multiples
- Suivi des paiements et relances automatiques

#### 📋 **Contrats Automatisés**
- Génération de contrats PDF personnalisés
- Signatures électroniques intégrée
- Templates de contrats modifiables
- Archivage automatique des contrats

#### 🔧 **Gestion de la Maintenance**
- Planification de la maintenance préventive
- Suivi des coûts de maintenance par véhicule
- Historique des réparations et interventions
- Alertes de maintenance basées sur le kilométrage

#### 📈 **Rapports et Analyses Avancées**
- Rapports financiers détaillés
- Analyses de performance de la flotte
- Prévisions de revenus et de demande
- Exportation vers Excel et PDF

## 🛠️ Technologies Utilisées

### **Backend (API REST)**
- **Node.js 18+** - Runtime JavaScript haute performance
- **Express.js 4.18+** - Framework web minimaliste et flexible
- **MongoDB 6.0+** - Base de données NoSQL orientée documents
- **Mongoose 7.0+** - ODM (Object Document Mapper) pour MongoDB
- **JWT (jsonwebtoken)** - Authentification stateless sécurisée
- **bcryptjs** - Hachage sécurisé des mots de passe
- **express-validator** - Validation et sanitisation des données
- **helmet** - Sécurisation des en-têtes HTTP
- **cors** - Gestion des requêtes cross-origin
- **express-rate-limit** - Protection contre les attaques par déni de service

### **Frontend (Interface Utilisateur)**
- **React.js 18+** - Bibliothèque JavaScript pour interfaces utilisateur
- **Vite 5.0+** - Outil de build ultra-rapide pour le développement
- **Tailwind CSS 3.3+** - Framework CSS utility-first
- **shadcn/ui** - Composants UI modernes et accessibles
- **Lucide React** - Icônes SVG optimisées
- **i18next** - Internationalisation complète
- **Axios** - Client HTTP pour les requêtes API
- **React Hook Form** - Gestion des formulaires performante

### **Outils de Développement**
- **pnpm** - Gestionnaire de paquets rapide et efficace
- **ESLint** - Linter JavaScript pour la qualité du code
- **Prettier** - Formateur de code automatique
- **Nodemon** - Rechargement automatique du serveur en développement

## 🖥️ Installation et Configuration (Windows)

### **Prérequis Système**

Avant de commencer l'installation, assurez-vous que votre système Windows dispose des éléments suivants :

#### **1. Node.js et npm**
```powershell
# Télécharger et installer Node.js depuis https://nodejs.org/
# Choisir la version LTS (Long Term Support)
# Vérifier l'installation
node --version  # Doit afficher v18.0.0 ou supérieur
npm --version   # Doit afficher 8.0.0 ou supérieur
```

#### **2. MongoDB**
```powershell
# Option 1: MongoDB Community Server (Recommandé pour le développement)
# Télécharger depuis https://www.mongodb.com/try/download/community
# Installer avec les options par défaut
# Le service MongoDB sera automatiquement configuré

# Option 2: MongoDB Atlas (Cloud - Recommandé pour la production)
# Créer un compte sur https://www.mongodb.com/atlas
# Créer un cluster gratuit et obtenir la chaîne de connexion
```

#### **3. Git (Optionnel mais recommandé)**
```powershell
# Télécharger depuis https://git-scm.com/download/win
# Installer avec les options par défaut
git --version  # Vérifier l'installation
```

#### **4. pnpm (Gestionnaire de paquets)**
```powershell
# Installer pnpm globalement
npm install -g pnpm

# Vérifier l'installation
pnpm --version
```

### **Installation du Projet**

#### **Étape 1 : Extraction et Préparation**
```powershell
# Extraire l'archive du projet
# Si vous avez un fichier .tar.gz, utilisez 7-Zip ou WinRAR
# Ou extraire directement si vous avez les dossiers

# Naviguer vers le répertoire du projet
cd C:\chemin\vers\autorent-cherkaoui
```

#### **Étape 2 : Configuration du Backend**
```powershell
# Naviguer vers le dossier backend
cd autorent-cherkaoui-backend

# Installer les dépendances
npm install

# Créer le fichier de configuration .env
# Copier le contenu suivant dans un fichier nommé .env
```

**Contenu du fichier `.env` :**
```env
# Configuration du serveur
PORT=5001
NODE_ENV=development

# Configuration de la base de données
# Pour MongoDB local
MONGODB_URI=mongodb://localhost:27017/autorent_cherkaoui

# Pour MongoDB Atlas (remplacer par votre chaîne de connexion)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/autorent_cherkaoui

# Configuration JWT (IMPORTANT: Changer en production)
JWT_SECRET=autorent_cherkaoui_secret_key_2024_change_in_production
JWT_EXPIRE=7d

# Configuration de l'environnement
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### **Étape 3 : Configuration du Frontend**
```powershell
# Ouvrir un nouveau terminal PowerShell
# Naviguer vers le dossier frontend
cd C:\chemin\vers\autorent-cherkaoui\autorent-cherkaoui-frontend

# Installer les dépendances avec pnpm
pnpm install

# Vérifier que l'installation s'est bien déroulée
pnpm list
```

### **Démarrage de l'Application**

#### **Étape 1 : Démarrer MongoDB (Si installation locale)**
```powershell
# Méthode 1: Via les services Windows
# Appuyer sur Win + R, taper "services.msc" et appuyer sur Entrée
# Chercher "MongoDB Server" et cliquer sur "Démarrer"

# Méthode 2: Via la ligne de commande (en tant qu'administrateur)
net start MongoDB

# Méthode 3: Via MongoDB Compass (interface graphique)
# Ouvrir MongoDB Compass et se connecter à mongodb://localhost:27017
```

#### **Étape 2 : Démarrer le Backend**
```powershell
# Dans le terminal du backend
cd C:\chemin\vers\autorent-cherkaoui\autorent-cherkaoui-backend

# Démarrer le serveur en mode développement
npm run dev

# Ou démarrer en mode production
npm start
```

**Vous devriez voir :**
```
[dotenv] injecting env (7) from .env
Server running on port 5001
Environment: development
MongoDB connected successfully
```

#### **Étape 3 : Démarrer le Frontend**
```powershell
# Dans un nouveau terminal PowerShell
cd C:\chemin\vers\autorent-cherkaoui\autorent-cherkaoui-frontend

# Démarrer le serveur de développement
pnpm run dev
```

**Vous devriez voir :**
```
VITE v6.3.5  ready in 378 ms
➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

### **Accès à l'Application**

#### **URLs d'Accès**
- **Frontend (Interface utilisateur)** : http://localhost:5173
- **Backend (API)** : http://localhost:5001
- **API Health Check** : http://localhost:5001/api/health

#### **Compte Administrateur par Défaut**
```
Email : Cherkaoui@admin.com
Mot de passe : cherkaoui123
```

> **Note importante** : L'email sera automatiquement normalisé en minuscules par le système, donc `Cherkaoui@admin.com` devient `cherkaoui@admin.com` en interne, mais vous pouvez utiliser la casse originale pour vous connecter.

## 🎯 Guide d'Utilisation

### **Première Connexion**

1. **Ouvrir l'application** dans votre navigateur : http://localhost:5173
2. **Se connecter** avec les identifiants par défaut :
   - Email : `Cherkaoui@admin.com`
   - Mot de passe : `cherkaoui123`
3. **Changer la langue** si nécessaire (bouton en haut à droite)
4. **Explorer le tableau de bord** pour avoir une vue d'ensemble

### **Navigation dans l'Application**

#### **📊 Tableau de Bord**
Le tableau de bord offre une vue d'ensemble de votre activité :
- **Statistiques clés** : Nombre de véhicules, locations actives, revenus totaux
- **Graphiques de performance** : Évolution des revenus, statut des véhicules
- **Alertes importantes** : Documents expirés, véhicules en retard
- **Métriques en temps réel** : Taux d'occupation, revenus du jour

#### **🚙 Gestion des Véhicules**
- **Ajouter un véhicule** : Cliquer sur "Ajouter un Véhicule"
- **Rechercher** : Utiliser la barre de recherche pour filtrer
- **Filtrer par statut** : Disponible, Loué, En Maintenance, Hors Service
- **Modifier** : Cliquer sur un véhicule pour voir les détails et modifier
- **Gérer les documents** : Télécharger et suivre les dates d'expiration

#### **👥 Gestion des Clients**
- **Ajouter un client** : Formulaire complet avec validation
- **Rechercher** : Par nom, email, numéro de téléphone, CIN
- **Filtrer par statut** : Actif, Liste noire, Suspendu
- **Historique** : Voir toutes les locations d'un client
- **Gestion des documents** : CIN, permis de conduire, justificatifs

#### **📅 Gestion des Réservations**
- **Créer une réservation** : Sélectionner client, véhicule, dates
- **Vue calendrier** : Visualiser toutes les réservations
- **Filtrer par statut** : En attente, Confirmée, Active, Terminée, Annulée
- **Modifier** : Changer les dates, véhicule, ou conditions
- **Gérer les retards** : Alertes automatiques et actions

### **Fonctionnalités Avancées**

#### **🔄 Changement de Langue**
- Cliquer sur le bouton de langue en haut à droite
- Choisir entre Français et العربية (Arabe)
- L'interface s'adapte automatiquement (RTL pour l'arabe)
- Les documents générés respectent la langue sélectionnée

#### **🔐 Gestion des Utilisateurs**
- **Profil** : Modifier les informations personnelles
- **Préférences** : Langue, thème, notifications
- **Sécurité** : Changer le mot de passe
- **Déconnexion** : Bouton en haut à droite

## 🏗️ Structure du Projet

```
autorent-cherkaoui/
├── 📁 autorent-cherkaoui-backend/          # API Backend Node.js
│   ├── 📁 models/                          # Modèles MongoDB (Mongoose)
│   │   ├── 📄 User.js                      # Modèle utilisateur
│   │   ├── 📄 Vehicle.js                   # Modèle véhicule
│   │   ├── 📄 Client.js                    # Modèle client
│   │   └── 📄 Reservation.js               # Modèle réservation
│   ├── 📁 routes/                          # Routes API REST
│   │   ├── 📄 auth.js                      # Authentification
│   │   ├── 📄 vehicles.js                  # Gestion véhicules
│   │   ├── 📄 clients.js                   # Gestion clients
│   │   ├── 📄 reservations.js              # Gestion réservations
│   │   ├── 📄 billing.js                   # Facturation
│   │   ├── 📄 contracts.js                 # Contrats
│   │   ├── 📄 maintenance.js               # Maintenance
│   │   └── 📄 dashboard.js                 # Tableau de bord
│   ├── 📁 middleware/                      # Middlewares Express
│   │   └── 📄 auth.js                      # Middleware d'authentification
│   ├── 📄 server.js                        # Point d'entrée du serveur
│   ├── 📄 package.json                     # Dépendances Node.js
│   └── 📄 .env                             # Variables d'environnement
├── 📁 autorent-cherkaoui-frontend/         # Interface React.js
│   ├── 📁 src/
│   │   ├── 📁 components/                  # Composants React
│   │   │   ├── 📄 Layout.jsx               # Layout principal
│   │   │   ├── 📄 Dashboard.jsx            # Tableau de bord
│   │   │   ├── 📄 VehicleManagement.jsx    # Gestion véhicules
│   │   │   ├── 📄 ClientManagement.jsx     # Gestion clients
│   │   │   ├── 📄 ReservationManagement.jsx # Gestion réservations
│   │   │   ├── 📄 Login.jsx                # Page de connexion
│   │   │   └── 📄 LanguageSwitcher.jsx     # Changement de langue
│   │   ├── 📁 services/                    # Services API
│   │   │   └── 📄 api.js                   # Configuration Axios
│   │   ├── 📄 App.jsx                      # Composant principal
│   │   ├── 📄 main.jsx                     # Point d'entrée React
│   │   └── 📄 i18n.js                      # Configuration i18next
│   ├── 📄 package.json                     # Dépendances React
│   ├── 📄 vite.config.js                   # Configuration Vite
│   └── 📄 tailwind.config.js               # Configuration Tailwind
├── 📄 README.md                            # Documentation (ce fichier)
└── 📄 requirements_analysis.md             # Analyse des exigences
```

## 🔌 Documentation de l'API

### **Endpoints d'Authentification**

#### **POST /api/auth/login**
Connexion utilisateur avec email et mot de passe.

**Requête :**
```json
{
  "email": "Cherkaoui@admin.com",
  "password": "cherkaoui123"
}
```

**Réponse (Succès) :**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "username": "cherkaoui_admin",
    "email": "cherkaoui@admin.com",
    "firstName": "Cherkaoui",
    "lastName": "Admin",
    "role": "admin",
    "preferences": {
      "language": "fr",
      "theme": "light"
    }
  }
}
```

#### **POST /api/auth/register**
Inscription d'un nouvel utilisateur (accès restreint).

#### **GET /api/auth/me**
Récupération du profil utilisateur connecté.

### **Endpoints des Véhicules**

#### **GET /api/vehicles**
Liste de tous les véhicules avec pagination et filtres.

**Paramètres de requête :**
- `page` : Numéro de page (défaut: 1)
- `limit` : Nombre d'éléments par page (défaut: 10)
- `status` : Filtrer par statut (available, rented, maintenance, out_of_service)
- `search` : Recherche textuelle (marque, modèle, plaque)

#### **POST /api/vehicles**
Création d'un nouveau véhicule.

#### **PUT /api/vehicles/:id**
Modification d'un véhicule existant.

#### **DELETE /api/vehicles/:id**
Suppression d'un véhicule.

#### **GET /api/vehicles/:id/check-availability**
Vérification de la disponibilité d'un véhicule pour des dates données.

### **Endpoints des Clients**

#### **GET /api/clients**
Liste de tous les clients avec pagination et filtres.

#### **POST /api/clients**
Création d'un nouveau client.

#### **PUT /api/clients/:id**
Modification d'un client existant.

#### **DELETE /api/clients/:id**
Suppression d'un client.

#### **GET /api/clients/:id/rental-history**
Historique des locations d'un client.

### **Endpoints des Réservations**

#### **GET /api/reservations**
Liste de toutes les réservations avec pagination et filtres.

#### **POST /api/reservations**
Création d'une nouvelle réservation.

#### **PUT /api/reservations/:id**
Modification d'une réservation existante.

#### **DELETE /api/reservations/:id**
Suppression d'une réservation.

#### **GET /api/reservations/calendar-view**
Vue calendrier des réservations.

### **Endpoints du Tableau de Bord**

#### **GET /api/dashboard/stats**
Statistiques générales de l'application.

#### **GET /api/dashboard/revenue**
Données de revenus avec filtres temporels.

#### **GET /api/dashboard/alerts**
Alertes et notifications importantes.

## 🚀 Déploiement en Production

### **Préparation pour la Production**

#### **1. Configuration de l'Environnement**
```env
# .env pour la production
NODE_ENV=production
PORT=5001

# Base de données MongoDB Atlas (recommandé)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/autorent_cherkaoui

# JWT Secret (OBLIGATOIRE: Générer une clé forte)
JWT_SECRET=your_super_secure_jwt_secret_key_here_minimum_32_characters

# Configuration de sécurité
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50
```

#### **2. Build du Frontend**
```powershell
cd autorent-cherkaoui-frontend
pnpm run build
```

#### **3. Optimisation du Backend**
```powershell
cd autorent-cherkaoui-backend
npm install --production
```

### **Options de Déploiement**

#### **Option 1 : Serveur Windows (IIS)**
1. Installer Node.js sur le serveur
2. Configurer IIS avec iisnode
3. Déployer les fichiers de l'application
4. Configurer les variables d'environnement
5. Configurer le reverse proxy pour l'API

#### **Option 2 : Services Cloud**
- **Frontend** : Vercel, Netlify, ou Azure Static Web Apps
- **Backend** : Render, Railway, ou Azure App Service
- **Base de données** : MongoDB Atlas

#### **Option 3 : Docker (Recommandé)**
```dockerfile
# Dockerfile pour le backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5001
CMD ["npm", "start"]
```

## 🔧 Développement et Personnalisation

### **Scripts de Développement**

#### **Backend**
```powershell
npm run dev      # Démarrage avec nodemon (rechargement automatique)
npm start        # Démarrage en mode production
npm test         # Exécution des tests (à implémenter)
npm run lint     # Vérification du code avec ESLint
```

#### **Frontend**
```powershell
pnpm run dev     # Serveur de développement Vite
pnpm run build   # Build pour la production
pnpm run preview # Aperçu du build de production
pnpm run lint    # Vérification du code
```

### **Personnalisation de l'Interface**

#### **Thèmes et Couleurs**
Modifier le fichier `tailwind.config.js` :
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
        // Ajouter vos couleurs personnalisées
      }
    }
  }
}
```

#### **Traductions**
Ajouter de nouvelles langues dans `src/i18n.js` :
```javascript
const resources = {
  fr: { translation: frTranslations },
  ar: { translation: arTranslations },
  en: { translation: enTranslations }, // Nouvelle langue
};
```

### **Extension des Fonctionnalités**

#### **Ajouter un Nouveau Module**
1. Créer le modèle MongoDB dans `models/`
2. Créer les routes API dans `routes/`
3. Créer le composant React dans `components/`
4. Ajouter les traductions nécessaires
5. Mettre à jour la navigation

#### **Intégration de Services Externes**
- **Paiement** : Stripe, PayPal, ou solutions locales
- **SMS** : Twilio pour les notifications
- **Email** : SendGrid ou Mailgun
- **Stockage** : AWS S3 pour les documents

## 🛡️ Sécurité et Bonnes Pratiques

### **Sécurité Implémentée**

#### **Backend**
- **Authentification JWT** avec expiration
- **Hachage des mots de passe** avec bcrypt (12 rounds)
- **Validation des données** avec express-validator
- **Protection CSRF** avec helmet
- **Rate limiting** contre les attaques par déni de service
- **Sanitisation des entrées** pour prévenir les injections

#### **Frontend**
- **Validation côté client** avec React Hook Form
- **Gestion sécurisée des tokens** dans localStorage
- **Protection XSS** avec sanitisation des données
- **HTTPS obligatoire** en production

### **Recommandations de Sécurité**

#### **En Production**
1. **Changer le JWT_SECRET** par une clé forte et unique
2. **Utiliser HTTPS** pour toutes les communications
3. **Configurer un firewall** pour limiter l'accès aux ports
4. **Mettre en place des sauvegardes** régulières de la base de données
5. **Surveiller les logs** pour détecter les activités suspectes
6. **Mettre à jour régulièrement** les dépendances

#### **Gestion des Utilisateurs**
1. **Politique de mots de passe** forte
2. **Authentification à deux facteurs** (à implémenter)
3. **Audit des actions** utilisateur
4. **Gestion des sessions** avec timeout automatique

## 🐛 Dépannage

### **Problèmes Courants**

#### **Le serveur backend ne démarre pas**
```powershell
# Vérifier que MongoDB est démarré
net start MongoDB

# Vérifier les variables d'environnement
echo $env:MONGODB_URI

# Vérifier les ports utilisés
netstat -an | findstr :5001
```

#### **Le frontend ne se connecte pas au backend**
1. Vérifier que le backend est démarré sur le port 5001
2. Vérifier l'URL de l'API dans `src/services/api.js`
3. Vérifier la configuration CORS du backend
4. Vérifier les logs de la console du navigateur

#### **Problèmes de base de données**
```powershell
# Vérifier la connexion MongoDB
mongo mongodb://localhost:27017/autorent_cherkaoui

# Vérifier l'espace disque
dir C:\ 

# Redémarrer MongoDB
net stop MongoDB
net start MongoDB
```

#### **Erreurs de dépendances**
```powershell
# Nettoyer le cache npm
npm cache clean --force

# Réinstaller les dépendances
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install

# Pour pnpm
pnpm store prune
Remove-Item -Recurse -Force node_modules, pnpm-lock.yaml
pnpm install
```

### **Logs et Débogage**

#### **Activer les logs détaillés**
```env
# Dans le fichier .env
NODE_ENV=development
DEBUG=autorent:*
```

#### **Vérifier les logs**
- **Backend** : Les logs s'affichent dans la console PowerShell
- **Frontend** : Ouvrir les outils de développement du navigateur (F12)
- **MongoDB** : Logs dans le répertoire d'installation MongoDB

## 📞 Support et Contribution

### **Obtenir de l'Aide**

#### **Documentation**
- **README.md** : Ce fichier (documentation principale)
- **API Documentation** : Endpoints et exemples d'utilisation
- **Code Comments** : Commentaires détaillés dans le code source

#### **Communauté**
- **Issues GitHub** : Signaler des bugs ou demander des fonctionnalités
- **Discussions** : Poser des questions à la communauté
- **Wiki** : Documentation collaborative

### **Contribuer au Projet**

#### **Processus de Contribution**
1. **Fork** le projet sur GitHub
2. **Créer une branche** pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. **Commiter** vos changements (`git commit -m 'Add some AmazingFeature'`)
4. **Pousser** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrir une Pull Request** avec une description détaillée

#### **Standards de Code**
- **ESLint** : Respecter les règles de linting
- **Prettier** : Formater le code automatiquement
- **Tests** : Ajouter des tests pour les nouvelles fonctionnalités
- **Documentation** : Mettre à jour la documentation si nécessaire

#### **Types de Contributions**
- **Corrections de bugs** : Signaler et corriger les problèmes
- **Nouvelles fonctionnalités** : Proposer et implémenter de nouvelles features
- **Amélioration de l'UI/UX** : Améliorer l'interface utilisateur
- **Optimisation des performances** : Améliorer la vitesse et l'efficacité
- **Traductions** : Ajouter de nouvelles langues
- **Documentation** : Améliorer et étendre la documentation

## 📄 Licence et Crédits

### **Licence**
Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

### **Crédits**
- **Développé par** : Haytam Raba & Youssef Najih
- **Conçu pour** : AutoRent Cherkaoui
- **Technologies** : React.js, Node.js, MongoDB, Tailwind CSS
- **Icônes** : Lucide React
- **Composants UI** : shadcn/ui

### **Remerciements**
Merci à toutes les bibliothèques open source qui ont rendu ce projet possible :
- React.js et l'écosystème React
- Node.js et Express.js
- MongoDB et Mongoose
- Tailwind CSS et shadcn/ui
- Vite et les outils de développement modernes

---

## 🎉 Conclusion

AutoRent Cherkaoui est une solution complète et moderne pour la gestion de location de voitures. Avec son interface bilingue, ses fonctionnalités avancées et sa architecture robuste, elle répond aux besoins spécifiques du marché marocain tout en offrant une expérience utilisateur exceptionnelle.

L'application est conçue pour évoluer avec votre entreprise, avec des fonctionnalités extensibles et une architecture modulaire qui permet d'ajouter facilement de nouvelles fonctionnalités selon vos besoins.

Pour toute question ou assistance, n'hésitez pas à consulter la documentation ou à contacter l'équipe de support.

**Bonne utilisation d'AutoRent Cherkaoui ! 🚗✨**

