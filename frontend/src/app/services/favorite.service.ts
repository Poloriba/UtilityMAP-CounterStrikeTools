import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Lineup } from '../models/lineup.model';
import { environment } from '../../environments/environment';

/** Service gérant les favoris de l'utilisateur courant (identifié par environment.defaultUserId) */
@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private readonly apiUrl = `${environment.apiUrl}/users`;
  private readonly userId = environment.defaultUserId; // ID de l'utilisateur fixé en configuration

  constructor(private http: HttpClient) {}

  // Récupère toutes les lineups mises en favori par l'utilisateur
  getFavorites(): Observable<Lineup[]> {
    return this.http.get<Lineup[]>(`${this.apiUrl}/${this.userId}/favorites`);
  }

  // Ajoute une lineup aux favoris
  addFavorite(lineupId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${this.userId}/favorites/${lineupId}`, {});
  }

  // Retire une lineup des favoris
  removeFavorite(lineupId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${this.userId}/favorites/${lineupId}`);
  }
}
