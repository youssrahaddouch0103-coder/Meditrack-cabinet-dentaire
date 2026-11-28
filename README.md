# MediTrack

Application de gestion d'un centre médical : dossiers patients, rendez-vous, consultations, ordonnances et pharmacie.

Stack : Angular 17 (front) · Express + MongoDB (API) · Docker.

Backlog : projet Jira **MED** (4 sprints d'une semaine).

## Structure

```
frontend/       Angular 17 (site public + espace de gestion)
backend/        API Express + Mongoose
  src/config       variables d'environnement, connexion MongoDB
  src/routes       routes, montées sous /api
  src/controllers  logique des routes
  src/models       schémas Mongoose
  src/middlewares  erreurs, 404, auth
  tests/           tests Jest + Supertest
```

## Démarrer en local

```bash
cp .env.example .env          # puis remplir JWT_SECRET et ADMIN_PASSWORD
cd backend && npm install && npm run seed && npm run dev      # API sur http://localhost:3000
cd frontend && npm install && npm start       # front sur http://localhost:4200 (proxy /api -> 3000)
```

Tests de l'API : `cd backend && npm test` (Jest + Supertest, MongoDB en mémoire, aucune base à lancer).
Couverture de l'API : `npm run test:coverage` (seuil minimal 60 %).
Tests du front : `cd frontend && npm run test:ci` (Karma + Jasmine en Chrome headless, couverture dans `coverage/frontend`).

Il faut une base MongoDB qui tourne sur `localhost:27017` (ou lancer seulement `docker compose up -d mongo`).

## Lancer avec Docker

```bash
cp .env.example .env                    # remplir JWT_SECRET (32 caractères min.) et ADMIN_PASSWORD
docker compose up -d --build            # mongo + api + front
docker compose exec api npm run seed    # admin, spécialités et médecins (une seule fois)
```

Le site est sur http://localhost:8080 (port modifiable avec `WEB_PORT`, adresse publique avec `PUBLIC_URL`). Nginx sert le front et relaie `/api` vers l'API.
Les données MongoDB et les fichiers envoyés sont gardés dans les volumes `mongo-data` et `uploads`.

## Convention Git

Une branche par ticket Jira, avec la clé dans le nom et les commits : `MED-12-docker`, `MED-12 ajoute docker-compose`.
