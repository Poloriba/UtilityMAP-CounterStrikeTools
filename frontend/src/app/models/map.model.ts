export interface GameMap {
  id: string;       // ex: de_mirage
  name: string;     // ex: Mirage
  radarUrl: string; // image 2D overhead (radar)
  color: string;    // couleur de fallback si l'image ne charge pas
  activeDuty: boolean;
}

// Images radar : placer les PNG dans src/assets/maps/{id}.png  (ex: de_mirage.png)
// Si le fichier local n'existe pas, le composant affiche un fallback coloré.
// Source images communautaire : https://github.com/ghostcap-gaming/cs2-map-images
export const CS2_MAPS: GameMap[] = [
  {
    id: 'de_mirage',
    name: 'Mirage',
    radarUrl: 'assets/maps/de_mirage.png',
    color: '#c8a96e',
    activeDuty: true
  },
  {
    id: 'de_inferno',
    name: 'Inferno',
    radarUrl: 'assets/maps/de_inferno.png',
    color: '#e8a04a',
    activeDuty: true
  },
  {
    id: 'de_ancient',
    name: 'Ancient',
    radarUrl: 'assets/maps/de_ancient.png',
    color: '#8b6f4e',
    activeDuty: true
  },
  {
    id: 'de_anubis',
    name: 'Anubis',
    radarUrl: 'assets/maps/de_anubis.png',
    color: '#c4a882',
    activeDuty: true
  },
  {
    id: 'de_dust2',
    name: 'Dust2',
    radarUrl: 'assets/maps/de_dust.png',
    color: '#deb887',
    activeDuty: false
  },
  {
    id: 'de_overpass',
    name: 'Overpass',
    radarUrl: 'assets/maps/de_overpass.png',
    color: '#5d7a5d',
    activeDuty: false
  }
];
