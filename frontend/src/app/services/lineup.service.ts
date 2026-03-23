import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Lineup, LineupFilter, LineupRequest } from '../models/lineup.model';
import { environment } from '../../environments/environment';

/** Service responsable de toutes les opérations CRUD sur les lineups via l'API REST */
@Injectable({ providedIn: 'root' })
export class LineupService {
  private readonly apiUrl = `${environment.apiUrl}/lineups`;

  constructor(private http: HttpClient) {}

  // Récupère toutes les lineups, avec des filtres optionnels (map, côté, type, recherche)
  getAll(filter: LineupFilter = {}): Observable<Lineup[]> {
    let params = new HttpParams();
    if (filter.map) params = params.set('map', filter.map);
    if (filter.side) params = params.set('side', filter.side);
    if (filter.type) params = params.set('type', filter.type);
    if (filter.search) params = params.set('search', filter.search);
    return this.http.get<Lineup[]>(this.apiUrl, { params });
  }

  // Récupère une lineup par son ID
  getById(id: string): Observable<Lineup> {
    return this.http.get<Lineup>(`${this.apiUrl}/${id}`);
  }

  // Crée une nouvelle lineup
  create(request: LineupRequest): Observable<Lineup> {
    return this.http.post<Lineup>(this.apiUrl, request);
  }

  // Met à jour une lineup existante
  update(id: string, request: LineupRequest): Observable<Lineup> {
    return this.http.put<Lineup>(`${this.apiUrl}/${id}`, request);
  }

  // Supprime une lineup
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
