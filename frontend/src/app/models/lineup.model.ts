// Côté d'une équipe : T (Terroriste) ou CT (Contre-terroriste)
export type Side = 'T' | 'CT';

// Type de grenade supporté par l'application
export type UtilityType = 'SMOKE' | 'FLASH' | 'MOLOTOV' | 'HE';

// Représente une lineup telle que renvoyée par l'API
export interface Lineup {
  id: string;
  mapName: string;
  side: Side;
  utilityType: UtilityType;
  name: string;
  description?: string;
  throwPosition?: string; // position depuis laquelle le joueur se place
  aimPosition?: string;   // point de visée pour exécuter le lancer
  imageUrl?: string;
  videoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  favorite?: boolean; // true si l'utilisateur courant a mis en favori
}

// Corps de requête pour créer ou modifier une lineup
export interface LineupRequest {
  mapName: string;
  side: Side;
  utilityType: UtilityType;
  name: string;
  description?: string;
  throwPosition?: string;
  aimPosition?: string;
  imageUrl?: string;
  videoUrl?: string;
}

// Paramètres de filtre utilisés dans la liste des lineups
export interface LineupFilter {
  map?: string;
  side?: Side;
  type?: UtilityType;
  search?: string;
}
