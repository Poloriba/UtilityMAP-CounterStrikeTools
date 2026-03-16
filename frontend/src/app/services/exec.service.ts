import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Exec, ExecRequest } from '../models/exec.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ExecService {
  private readonly apiUrl = `${environment.apiUrl}/execs`;

  constructor(private http: HttpClient) {}

  getAll(mapName?: string): Observable<Exec[]> {
    let params = new HttpParams();
    if (mapName) params = params.set('map', mapName);
    return this.http.get<Exec[]>(this.apiUrl, { params });
  }

  getById(id: string): Observable<Exec> {
    return this.http.get<Exec>(`${this.apiUrl}/${id}`);
  }

  create(request: ExecRequest): Observable<Exec> {
    return this.http.post<Exec>(this.apiUrl, request);
  }

  update(id: string, request: ExecRequest): Observable<Exec> {
    return this.http.put<Exec>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  addLineup(execId: string, lineupId: string): Observable<Exec> {
    return this.http.post<Exec>(`${this.apiUrl}/${execId}/lineups/${lineupId}`, {});
  }

  removeLineup(execId: string, lineupId: string): Observable<Exec> {
    return this.http.delete<Exec>(`${this.apiUrl}/${execId}/lineups/${lineupId}`);
  }
}
