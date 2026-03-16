import { Lineup } from './lineup.model';

/** Structure sérialisée en JSON dans snapshotJson */
export interface ExecSnapshot {
  dragPositions: Record<string, { x: number; y: number }>;
  grenadeCounters: Record<string, number>;
  grenades: Array<{
    id: string;
    type: 'smoke' | 'flash' | 'molotov' | 'he';
    label: string;
    name: string;
    defaultX: number;
    defaultY: number;
  }>;
  links: Array<{ playerId: string; grenadeId: string }>;
}

export interface Exec {
  id: string;
  name: string;
  mapName: string;
  snapshotJson: string;
  lineups: Lineup[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ExecRequest {
  name: string;
  mapName: string;
  snapshotJson: string;
  lineupIds: string[];
}
