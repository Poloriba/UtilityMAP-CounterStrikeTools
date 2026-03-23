import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Exec, ExecRequest } from '../models/exec.model';
import { environment } from '../../environments/environment';

/** Service responsable de toutes les opérations CRUD sur les execs via l'API REST */
@Injectable({ providedIn: 'root' })
export class ExecService {
  private readonly apiUrl = `${environment.apiUrl}/execs`;

  constructor(private http: HttpClient) {}

  // Récupère toutes les execs, filtrées par map si fournie
  getAll(mapName?: string): Observable<Exec[]> {
    let params = new HttpParams();
    if (mapName) params = params.set('map', mapName);
    return this.http.get<Exec[]>(this.apiUrl, { params });
  }

  // Récupère une exec par son ID (utilisé pour restaurer depuis l'URL ?exec=id)
  getById(id: string): Observable<Exec> {
    return this.http.get<Exec>(`${this.apiUrl}/${id}`);
  }

  // Crée une nouvelle exec
  create(request: ExecRequest): Observable<Exec> {
    return this.http.post<Exec>(this.apiUrl, request);
  }

  // Met à jour une exec existante (nom, snapshot, lineups associées)
  update(id: string, request: ExecRequest): Observable<Exec> {
    return this.http.put<Exec>(`${this.apiUrl}/${id}`, request);
  }

  // Supprime une exec
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Associe une lineup existante à une exec
  addLineup(execId: string, lineupId: string): Observable<Exec> {
    return this.http.post<Exec>(`${this.apiUrl}/${execId}/lineups/${lineupId}`, {});
  }

  // Retire une lineup d'une exec
  removeLineup(execId: string, lineupId: string): Observable<Exec> {
    return this.http.delete<Exec>(`${this.apiUrl}/${execId}/lineups/${lineupId}`);
  }
}
