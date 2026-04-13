# UtilityMAP CS2

Lineup manager (smokes, flashes, molotovs, HE grenades) for CS2.

## Ownership & License

This project is owned by **Paul RIBA**.  
The source code is open source. Any use, modification or redistribution of the code is permitted provided that you send an authorization request email to [paul.riba@epitech.eu](mailto:paul.riba@epitech.eu).

## Stack
- **Backend**: Spring Boot 3, Spring Data JPA, PostgreSQL / H2
- **Frontend**: Angular 17 (standalone), Angular Material
- **Dev**: Docker Compose

## Getting Started

### Quick dev mode (H2 in-memory)
```bash
# Backend (from /backend)
./mvnw spring-boot:run

# Frontend (from /frontend)
npm install
npm start
```
- Backend: http://localhost:8080
- Frontend: http://localhost:4200
- H2 Console: http://localhost:8080/h2-console

### Docker Compose mode (PostgreSQL)
```bash
docker-compose up --build
```
- App: http://localhost:4200
- API: http://localhost:8080/api/lineups

## API Reference
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/lineups | List with filters (?map=Mirage&side=T&type=SMOKE&search=window) |
| GET | /api/lineups/{id} | Lineup detail |
| POST | /api/lineups | Create a lineup |
| PUT | /api/lineups/{id} | Update a lineup |
| DELETE | /api/lineups/{id} | Delete a lineup |
| POST | /api/users/{userId}/favorites/{lineupId} | Add to favorites |
| DELETE | /api/users/{userId}/favorites/{lineupId} | Remove from favorites |
| GET | /api/users/{userId}/favorites | List favorites |

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
