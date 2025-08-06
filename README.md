# PharmIA - Plateforme de Micro-Apprentissage à l'Officine

**PharmIA** est une plateforme innovante de micro-apprentissage pour les professionnels de la pharmacie. Elle offre des mémofiches interactives propulsées par l'IA pour réviser les "cas de comptoir" et renforcer les compétences officinales.

## À Propos de ce Dépôt

Ce dépôt contient le code source complet de l'application PharmIA, avec une architecture moderne conçue pour un déploiement cloud simple et efficace.

-   **`/` (Racine)** : L'application frontend développée en **React** et **TypeScript**.
-   **`/backend`** : Un backend **Node.js/Express** qui sert une API pour la gestion du contenu et se connecte à une base de données **MongoDB**.

## Fonctionnalités Principales

-   **Mémofiches Interactives** : Contenu riche avec sections dépliables, glossaire, et suivi de lecture.
-   **Outils Pédagogiques** : Flashcards animées, quiz interactifs avec feedback immédiat et explications.
-   **Générateur de Contenu IA** : Un formulaire qui utilise l'API Gemini de Google pour transformer un texte brut en une mémofiche structurée, sauvegardée directement en base de données.
-   **Backend Centralisé** : Toutes les données sont gérées par le backend et stockées dans MongoDB, assurant la cohérence et la persistance.
-   **Déploiement Automatisé** : Le projet inclut un fichier `render.yaml` pour un déploiement "Infrastructure as Code" sur la plateforme Render.

## Architecture Technique

### Frontend (Racine)
-   **Framework** : React 18 (avec Hooks)
-   **Langage** : TypeScript
-   **Styling** : Tailwind CSS
-   **Routing** : React Router
-   **API IA** : `@google/genai` pour l'interaction avec le modèle Gemini.
-   **Communication Backend** : Utilise `fetch` pour interagir avec l'API du backend Node.js.

### Backend (`/backend`)
-   **Framework** : Node.js, Express.js
-   **Base de données** : MongoDB
-   **API** : API REST pour la gestion des mémofiches, thèmes et systèmes.

## Déploiement sur Render (Recommandé)

Ce projet est optimisé pour un déploiement sur [Render](https://render.com/). Le fichier `render.yaml` à la racine automatise tout le processus.

### Étapes de Déploiement
1.  **Forkez ce dépôt** sur votre propre compte GitHub.
2.  Créez un compte sur [Render](https://render.com/).
3.  Dans le tableau de bord Render, cliquez sur **"New"** > **"Blueprint"**.
4.  Connectez votre compte GitHub et sélectionnez le dépôt que vous venez de forker.
5.  Render lira automatiquement le fichier `render.yaml` et planifiera la création des services (backend, frontend, base de données).
6.  **Configurez les Variables d'Environnement** : Avant de valider la création, Render vous demandera de fournir les valeurs pour les variables d'environnement secrètes. Allez dans l'onglet "Environment" du service `pharmia-backend` et ajoutez :
    -   `GEMINI_API_KEY`: Votre clé d'API Google Gemini.
    -   `MONGODB_URI`: Cette variable sera automatiquement remplie par Render car elle est liée à la base de données (`fromDatabase`).
7.  Cliquez sur **"Apply"** ou **"Create New Services"**. Render va construire et déployer votre application. Une fois terminé, vous pourrez accéder à votre application via l'URL fournie pour le service `pharmia-frontend`.

## Développement Local

### Prérequis
-   Node.js (v18.x ou v20.x)
-   npm ou yarn
-   Une clé d'API Google Gemini
-   Une chaîne de connexion MongoDB (vous pouvez en obtenir une gratuitement sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### 1. Configuration du Backend

1.  **Naviguez vers le dossier backend** : `cd backend`
2.  **Installez les dépendances** : `npm install`
3.  **Configurez les variables d'environnement** : Créez un fichier `.env` dans le dossier `/backend` et ajoutez-y :
    ```
    MONGODB_URI=VOTRE_CHAINE_DE_CONNEXION_MONGODB
    GEMINI_API_KEY=VOTRE_CLE_API_GEMINI
    ```
4.  **Lancez le serveur backend** :
    ```bash
    npm start
    ```
    Le serveur sera disponible sur `http://localhost:5001`.

### 2. Configuration du Frontend

1.  **Ouvrez un nouveau terminal** et restez à la racine du projet.
2.  Le frontend est une application statique. Il s'attend à ce que le backend tourne sur `http://localhost:5001`. Pour gérer cela localement, il faut un proxy. Une solution simple est d'utiliser `vite` pour le développement.
    - Installez Vite: `npm install -g vite`
    - Lancez le serveur de développement Vite avec proxy:
      ```bash
      vite --config vite.config.cjs
      ```
    - Pour cela, vous devrez créer un fichier `vite.config.cjs` à la racine :
      ```javascript
      // vite.config.cjs
      module.exports = {
        server: {
          proxy: {
            '/api': 'http://localhost:5001'
          }
        }
      };
      ```
3.  Ouvrez votre navigateur sur l'adresse fournie par Vite (généralement `http://localhost:5173`).

---

**© 2025 PharmIA. Micro-apprentissage à l'officine**
