# Migration du Port 8080 vers 5173

## Problème rencontré
Le projet avait une configuration mixte avec deux ports différents :
- Port 8080 configuré dans le `vite.config.ts` racine
- Port 5173 configuré dans le `client/vite.config.ts`

Cette situation créait des conflits et de la confusion.

## Solution appliquée
1. **Archivage de l'ancienne configuration** :
   - `vite.config.ts.bak` : sauvegarde de l'ancienne configuration port 8080
   - `src-old/` : ancien dossier src configuré pour le port 8080

2. **Standardisation sur le port 5173** :
   - Modification du `vite.config.ts` racine pour utiliser le port 5173
   - Le dossier `client/` utilise déjà le port 5173

## Structure finale
- **Application principale** : http://localhost:5173/login (basée sur `client/src`)
- **Configuration unifiée** : port 5173 partout
- **Proxy API** : `/api` → `http://localhost:3001`

## Commandes pour démarrer
```bash
# Démarrer le client (port 5173)
cd client && npm run dev

# Démarrer le serveur backend (port 3001)
cd server && npm run dev
```

## Notes importantes
- Utiliser uniquement http://localhost:5173/login
- L'ancien port 8080 est maintenant archivé
- Le proxy API redirige vers le backend sur le port 3001 