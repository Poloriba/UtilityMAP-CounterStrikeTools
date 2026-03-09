# UtilityMAP CS2

Gestionnaire de lineups (smokes, flashs, molotovs, HE) pour CS2.

## Stack
- **Backend** : Spring Boot 3, Spring Data JPA, PostgreSQL / H2
- **Frontend** : Angular 17 (standalone), Angular Material
- **Dev** : Docker Compose

## Lancer le projet

### Mode dev rapide (H2 en mémoire)
```bash
# Backend (depuis /backend)
./mvnw spring-boot:run

# Frontend (depuis /frontend)
npm install
npm start
```
- Backend : http://localhost:8080
- Frontend : http://localhost:4200
- H2 Console : http://localhost:8080/h2-console

### Mode Docker Compose (PostgreSQL)
```bash
docker-compose up --build
```
- App : http://localhost:4200
- API : http://localhost:8080/api/lineups

## API Reference
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/lineups | Liste avec filtres (?map=Mirage&side=T&type=SMOKE&search=window) |
| GET | /api/lineups/{id} | Détail d'une lineup |
| POST | /api/lineups | Créer une lineup |
| PUT | /api/lineups/{id} | Modifier une lineup |
| DELETE | /api/lineups/{id} | Supprimer une lineup |
| POST | /api/users/{userId}/favorites/{lineupId} | Ajouter aux favoris |
| DELETE | /api/users/{userId}/favorites/{lineupId} | Retirer des favoris |
| GET | /api/users/{userId}/favorites | Liste des favoris |

## Structure
```
UtilityMAP-CS/
├── backend/
│   ├── src/main/java/com/utilitymap/
│   │   ├── entity/          # UtilityLineup, AppUser, FavoriteLineup
│   │   ├── repository/      # JPA Repositories
│   │   ├── service/         # LineupService, FavoriteService
│   │   ├── controller/      # LineupController, UserController
│   │   ├── dto/             # LineupRequest, LineupResponse
│   │   └── config/          # CORS, GlobalExceptionHandler, DataSeeder
│   └── Dockerfile
├── frontend/
│   ├── src/app/
│   │   ├── models/          # lineup.model.ts
│   │   ├── services/        # lineup.service.ts, favorite.service.ts
│   │   └── pages/           # lineup-list, lineup-detail, lineup-form
│   └── Dockerfile
└── docker-compose.yml
```
