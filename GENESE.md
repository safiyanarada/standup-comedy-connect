# 🎭 Stand Up Connect - Genèse & Feuille de route

## 1. Vision & Mission

Stand Up Connect vise à révolutionner la connexion entre humoristes et organisateurs d'événements en France grâce à une plateforme intelligente, gamifiée et communautaire. L'objectif est de bâtir une infrastructure technique robuste, évolutive et sécurisée, capable de supporter la croissance vers 10K+ utilisateurs.

## 2. État initial du projet

- **Frontend React** (Vite, TypeScript, shadcn-ui, Tailwind CSS) prêt, UX/UI validée (Lovable)
- **Aucune base backend** : pas de code Node.js, Express, FastAPI, ni de gestion réelle de base de données
- **Gestion d'état mockée** : Authentification, profils, événements, candidatures, messages, notifications simulés côté frontend via Contexts React et données mockées
- **Types structurés** : Les entités principales (User, Event, Application, etc.) sont bien typées dans `src/types/`
- **README** : Documentation Lovable, aucune mention de backend, ni d'API, ni de base de données

## 3. Analyse de la structure actuelle

- **Pas de backend** : Aucun dossier ou fichier backend, aucune logique serveur, aucune persistance
- **Pas de base de données** : Pas de schéma, pas de connexion à PostgreSQL
- **Authentification simulée** : Pas de JWT, pas de hashing, pas de gestion de sessions réelles
- **Sécurité absente** : Aucune validation côté serveur, aucune protection des routes
- **Notifications simulées** : Pas de WebSocket, pas d'envoi d'emails
- **Matching IA absent** : Pas d'algorithme côté serveur, tout est statique/mocké

## 4. ✅ Améliorations apportées (Système complet de géolocalisation)

### Comptes de test fonctionnels
- **Humoriste** : `demo@standup.com` / `Demo123!` (Paris, 50km de mobilité)
- **Organisateur** : `org@standup.com` / `Org123!` (Comedy Club Paris)
- **Connexions rapides** : Boutons de test pour faciliter les changements de compte

### Système de géolocalisation intelligent
- **Géolocalisation HTML5** : Détection automatique de la position GPS des humoristes via navigateur
- **Géocodage d'adresses** : API OpenStreetMap Nominatim pour convertir adresses d'événements en coordonnées GPS
- **Calcul de distances réelles** : Formule haversine pour des distances précises entre humoristes et événements
- **Fallback intelligent** : Base de données des principales villes françaises si l'API échoue
- **Interface intuitive** : Composant LocationSelector pour humoristes et création d'événements

### 🆕 Système de géolocalisation différencié
- **Humoristes** : Géolocalisation GPS personnelle + zone de mobilité configurable (5-200km)
- **Organisateurs** : Informations d'adresse venue (adresse, ville, code postal, téléphone) SANS GPS personnel
- **Événements** : Géolocalisation GPS obligatoire pour chaque événement créé (permet le matching)
- **Matching intelligent** : Les humoristes voient les événements dans leur zone selon les coordonnées GPS de l'événement

### 🆕 Connexion humoristes ↔ organisateurs fonctionnelle
- **Filtrage intelligent** : Les humoristes voient uniquement les événements dans leur zone de mobilité
- **Candidatures avec géolocalisation** : Distance réelle affichée lors des candidatures
- **Gestion des candidatures** : Interface organisateur pour voir les candidatures avec distances
- **Notifications en temps réel** : Système complet de notifications entre les deux profils

### Dashboards séparés et fonctionnels
- **Dashboard humoriste** : Score viral, candidatures, opportunités filtrées par zone GPS, onglet localisation GPS
- **Dashboard organisateur** : Création d'événements géolocalisés, gestion candidatures avec distances, infos venue
- **Navigation unifiée** : Onglets cohérents (Dashboard, Événements/Opportunités, Candidatures, Messages, Localisation/Venue, Profil)
- **Pages dédiées** : EventsPage, ApplicationsPage avec calculs de distance en temps réel

### Données mockées géolocalisées étendues
- **Événements multi-villes** : Paris, Lyon, Marseille, Toulouse avec vraies coordonnées GPS
- **Organisateurs répartis** : 4 organisateurs avec adresses complètes (adresse, ville, code postal, téléphone)
- **Calculs de distance réels** : Tous les calculs utilisent les coordonnées GPS des événements
- **Système de candidatures complet** : Notifications, acceptation/refus, historique

### Interface de création d'événements avancée
- **Géolocalisation obligatoire** : Impossible de créer un événement sans coordonnées GPS précises
- **Interface intuitive** : Modal en deux colonnes avec géolocalisation dédiée pour l'événement
- **Validation en temps réel** : Bouton désactivé tant que la position de l'événement n'est pas configurée
- **Feedback visuel** : Indicateurs de statut GPS, coordonnées affichées pour l'événement

### Gestion des candidatures géolocalisées
- **Page dédiée organisateurs** : Vue complète de toutes les candidatures reçues
- **Informations de distance** : Distance exacte entre l'humoriste et l'événement
- **Profils détaillés** : Informations complètes sur les humoristes candidats avec leur zone de mobilité
- **Actions en un clic** : Accepter/refuser avec notifications automatiques

### 🆕 Profils différenciés par type d'utilisateur
- **Profil humoriste** : GPS personnel + zone de mobilité + bio + nom de scène + genres
- **Profil organisateur** : Infos entreprise + adresse venue + téléphone + site web (SANS GPS personnel)
- **Logique métier** : Seuls les événements ont besoin de coordonnées GPS pour le matching
- **Interface adaptée** : Page "Localisation" pour humoristes, page "Informations Entreprise" pour organisateurs

## 5. Prochaines étapes selon la genèse

### Phase 1 : Foundation (Semaine 1-2) - ✅ TERMINÉE
1. **✅ Frontend testé et validé**
   - Interface utilisateur fonctionnelle avec géolocalisation complète
   - Deux types d'utilisateurs distincts avec dashboards séparés
   - Système de candidatures fonctionnel avec géolocalisation
   - Création d'événements avec géolocalisation obligatoire
   - Connexion complète humoristes ↔ organisateurs

### Phase 2 : Initialisation Backend (Semaine 3) - PROCHAINE ÉTAPE
1. **🚧 Setup du backend géolocalisé** - À FAIRE
   - Créer un dossier `/backend` (Node.js + Express recommandé)
   - Initialiser le projet (`npm init`, `tsconfig`, `eslint`)
   - Installer les dépendances : `express`, `prisma`, `jsonwebtoken`, `bcrypt`, `dotenv`, etc.
   - Configurer PostgreSQL localement et Prisma (`npx prisma init`)
   - Définir le schéma Prisma avec support des coordonnées GPS obligatoires
   - Tables : users, humorist_profiles, organizer_profiles, events (avec coordonnées), applications, messages
   - Générer et migrer la base (`npx prisma migrate dev`)

2. **⏭️ API de géolocalisation backend**
   - Endpoints : `/api/location/geocode`, `/api/location/reverse`, `/api/location/distance`
   - Service de géolocalisation côté serveur (cache des résultats)
   - Validation et nettoyage des coordonnées GPS
   - Calcul de distances optimisé côté serveur avec index spatial

3. **⏭️ Système d'authentification avec géolocalisation**
   - Endpoints : `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`
   - JWT pour les sessions, bcrypt pour le hash des mots de passe
   - Middleware de protection des routes selon le type d'utilisateur
   - Envoi d'email (SendGrid/Mailgun) pour la vérification et le reset
   - Stockage obligatoire des coordonnées GPS dans les profils

### Phase 3 : Core Features avec Géolocalisation (Semaine 4-5)
1. **Gestion des profils géolocalisés**
   - CRUD pour humoristes et organisateurs avec coordonnées GPS obligatoires
   - Upload d'images (Cloudinary/S3)
   - Endpoints : `/api/users/profile`, `/api/humorists`, `/api/organizers`
   - Gestion de la zone de mobilité et mise à jour de localisation

2. **Gestion des événements géolocalisés**
   - CRUD événements avec coordonnées GPS obligatoires
   - Endpoints : `/api/events`, `/api/applications`
   - Filtrage par zone de mobilité côté serveur avec requêtes optimisées
   - Optimisation des requêtes de géolocalisation (index spatial PostGIS)

3. **Système de candidatures géolocalisées**
   - Endpoints : `/api/applications/apply`, `/api/applications/respond`
   - Calcul automatique des distances lors des candidatures
   - Notifications automatiques avec informations de distance
   - Historique des candidatures avec métriques géographiques

### Phase 4 : Intelligence (Semaine 6-7)
1. **Algorithme de matching géolocalisé**
   - Implémenter la logique de matching avec distance GPS prioritaire
   - Endpoints : `/api/matching/events/:humoristId`, `/api/matching/humorists/:eventId`
   - Scoring basé sur distance, profil, historique et proximité géographique
   - Cache intelligent des calculs de distance et pré-calculs

2. **Notifications géolocalisées en temps réel**
   - WebSocket (Socket.io) pour le temps réel
   - Notifications basées sur la proximité géographique
   - Emails automatiques pour les événements dans la zone de mobilité
   - Push notifications mobile pour les événements proches

### Phase 5 : Optimisation (Semaine 8)
1. **Performance géospatiale avancée**
   - Index spatial en base de données (PostGIS obligatoire)
   - Cache Redis pour les calculs de distance fréquents et zones populaires
   - Optimisation des requêtes géolocalisées avec pagination spatiale
   - Clustering des événements par zone géographique

2. **Intégration frontend complète**
   - Connecter le frontend existant aux endpoints backend
   - Adapter les Contexts React pour consommer l'API réelle géolocalisée
   - Migration progressive des données mockées vers la vraie base
   - Tests de charge avec données géolocalisées réelles

## 6. Tests à effectuer actuellement

### ✅ Validation du système de géolocalisation complet
- [x] **Géolocalisation GPS** : Détection automatique pour humoristes et organisateurs
- [x] **Géocodage d'adresses** : Recherche d'adresses pour création d'événements
- [x] **Calcul de distances** : Distances réelles entre humoristes et événements
- [x] **Zone de mobilité** : Filtrage intelligent des événements par zone
- [x] **Interface de configuration** : Pages dédiées géolocalisation
- [x] **Connexion humoriste** : Tester `demo@standup.com` / `Demo123!`
- [x] **Connexion organisateur** : Tester `org@standup.com` / `Org123!`

### ✅ Fonctionnalités validées
- [x] **Candidature avec géolocalisation** : Candidater avec distances réelles affichées
- [x] **Création d'événement géolocalisé** : Événements avec géolocalisation obligatoire
- [x] **Gestion organisateur** : Accepter/refuser candidatures avec distances
- [x] **Interface séparée** : Dashboards distincts humoristes/organisateurs
- [x] **Système de notifications** : Notifications en temps réel entre profils

### 🎯 Tests avancés à effectuer
- [ ] **Performance avec volume** : Tester avec plus d'événements et utilisateurs
- [ ] **Précision géolocalisation** : Valider la précision des calculs de distance
- [ ] **Cas limites** : Tester comportement sans GPS ou API indisponible
- [ ] **UX mobile** : Valider l'expérience sur mobile avec géolocalisation
- [ ] **Sécurité géolocalisation** : Validation côté serveur des coordonnées

## 7. Principes à respecter
- **Géolocalisation obligatoire** : Coordonnées GPS requises pour événements et profils
- **Robustesse** : Architecture évolutive, gestion d'erreurs complète
- **Sécurité** : Validation des coordonnées, protection contre manipulation GPS
- **Performance** : Cache intelligent, index spatial, optimisation requêtes
- **Privacy** : Respect des données de localisation, consentement utilisateur
- **Testing** : Tests unitaires et d'intégration obligatoires
- **Documentation** : Code commenté et documentation API complète

---

**Ce document doit être suivi et mis à jour à chaque étape clé du développement.**

## 8. Notes de session actuelle

✅ **Succès majeurs** :
- **Système de géolocalisation complet** : GPS + géocodage pour humoristes et organisateurs
- **Connexion fonctionnelle** : Humoristes voient événements selon leur zone, organisateurs reçoivent candidatures
- **Création d'événements géolocalisés** : Interface avancée avec géolocalisation obligatoire
- **Dashboards séparés** : Navigation cohérente et fonctionnalités dédiées par type d'utilisateur
- **Gestion des candidatures** : Interface complète avec distances et profils détaillés
- **Calculs de distance précis** : Formule haversine avec coordonnées GPS réelles
- **Interface intuitive** : Composants réutilisables et expérience utilisateur fluide

🎯 **Système connecté et prêt** : La plateforme frontend est maintenant entièrement fonctionnelle avec géolocalisation complète, connexion entre profils, et toutes les fonctionnalités principales implémentées. Prêt pour intégration backend avec persistance PostgreSQL + PostGIS.

**État actuel** : Système frontend complet, géolocalisé et connecté. Prochaine étape = Backend avec persistance et optimisations géospatiales. 