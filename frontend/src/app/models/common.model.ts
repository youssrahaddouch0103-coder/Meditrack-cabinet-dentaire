/**
 * Identifiant renvoyé par l'API Express : ObjectId MongoDB sérialisé en chaîne
 * (champ `id`, copie de `_id`).
 */
export type EntityId = string;

/** Vrai si l'identifiant vient de la base (et non d'un élément local pas encore enregistré). */
export function isPersistedId(id?: EntityId | null): boolean {
  return !!id && id !== '0' && !id.startsWith('-') && !id.startsWith('tmp');
}
