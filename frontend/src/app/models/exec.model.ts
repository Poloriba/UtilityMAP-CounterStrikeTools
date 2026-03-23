import { Lineup } from './lineup.model';

/**
 * Snapshot du plateau sauvegardé dans une exec.
 * Contient toutes les informations nécessaires pour restaurer
 * l'état exact du Playground (positions, grenades, flèches).
 */
export interface ExecSnapshot {
  // Offsets CDK finaux de chaque jeton (joueurs + grenades), en pixels
  dragPositions: Record<string, { x: number; y: number }>;
  // Compteur par type de grenade (pour générer des IDs uniques à la restauration)
  grenadeCounters: Record<string, number>;
  // Liste des grenades présentes sur le plateau au moment de la sauvegarde
  grenades: Array<{
    id: string;
    type: 'smoke' | 'flash' | 'molotov' | 'he';
    label: string;
    name: string;
    defaultX: number; // position initiale en %
    defaultY: number;
  }>;
  // Flèches dessinées entre joueurs et grenades
  links: Array<{ playerId: string; grenadeId: string }>;
}

// Une exec sauvegardée, telle que renvoyée par l'API
export interface Exec {
  id: string;
  name: string;
  mapName: string;
  snapshotJson: string; // JSON de ExecSnapshot
  lineups: Lineup[];    // lineups associées manuellement à cette exec
  createdAt?: string;
  updatedAt?: string;
}

// Corps de requête pour créer ou mettre à jour une exec
export interface ExecRequest {
  name: string;
  mapName: string;
  snapshotJson: string;
  lineupIds: string[]; // IDs des lineups à associer
}
