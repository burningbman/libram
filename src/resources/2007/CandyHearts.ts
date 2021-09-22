import { $items, $skill } from "../../template-string";
import { have as _have } from "../../lib";

export const summonSkill = $skill`Summon Candy Heart`;
const libramItems = $items`green candy heart, lavender candy heart, orange candy heart, pink candy heart, white candy heart, yellow candy heart`;

/**
 * Returns true if the player can summon candy hearts
 */
export function have(): boolean {
  return _have(summonSkill);
}

/**
 * Returns A map containing the chance of an item to be summoned
 */
export function expected(): Map<Item, number> {
  const results = new Map<Item, number>();
  libramItems.forEach((item) => results.set(item, 1.0 / libramItems.length));
  return results;
}
