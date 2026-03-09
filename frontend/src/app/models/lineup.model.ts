export type Side = 'T' | 'CT';
export type UtilityType = 'SMOKE' | 'FLASH' | 'MOLOTOV' | 'HE';

export interface Lineup {
  id: string;
  mapName: string;
  side: Side;
  utilityType: UtilityType;
  name: string;
  description?: string;
  throwPosition?: string;
  aimPosition?: string;
  imageUrl?: string;
  videoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  favorite?: boolean;
}

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

export interface LineupFilter {
  map?: string;
  side?: Side;
  type?: UtilityType;
  search?: string;
}
