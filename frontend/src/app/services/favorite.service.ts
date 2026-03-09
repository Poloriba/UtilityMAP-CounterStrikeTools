import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Lineup } from '../models/lineup.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private readonly apiUrl = `${environment.apiUrl}/users`;
  private readonly userId = environment.defaultUserId;

  constructor(private http: HttpClient) {}

  getFavorites(): Observable<Lineup[]> {
    return this.http.get<Lineup[]>(`${this.apiUrl}/${this.userId}/favorites`);
  }

  addFavorite(lineupId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${this.userId}/favorites/${lineupId}`, {});
  }

  removeFavorite(lineupId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${this.userId}/favorites/${lineupId}`);
  }
}
