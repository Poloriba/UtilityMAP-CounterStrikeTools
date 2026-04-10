import { UtilityType } from './lineup.model';

// Couleurs principales associées à chaque type de grenade (badges, indicateurs, export canvas)
export const UTILITY_COLORS: Record<UtilityType, string> = {
  SMOKE: '#607d8b',
  FLASH: '#fbc02d',
  MOLOTOV: '#e64a19',
  HE: '#388e3c'
};

// Couleurs claires utilisées pour les flèches SVG du playground (variante plus lumineuse pour SMOKE)
export const UTILITY_COLORS_LIGHT: Record<string, string> = {
  smoke: '#90a4ae',
  flash: '#fbc02d',
  molotov: '#e64a19',
  he: '#388e3c'
};

// Helper : récupère la couleur à partir d'un type en minuscule ou majuscule
export function getUtilityColor(type: string): string {
  return UTILITY_COLORS[type.toUpperCase() as UtilityType]
    ?? UTILITY_COLORS_LIGHT[type.toLowerCase()]
    ?? '#999';
}
