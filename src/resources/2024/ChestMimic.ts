import { Monster, runChoice, toMonster, visitUrl, xpath } from "kolmafia";
import { have as have_ } from "../../lib";
import { get } from "../../property";
import { $familiar, $item } from "../../template-string";

const familiar = $familiar`Chest Mimic`;

/**
 * @returns Whether you `have` the Chest Mimic familiar.
 */
export function have(): boolean {
  return have_(familiar);
}

const visitBank = () =>
  visitUrl("place.php?whichplace=town_right&action=townright_dna", false);

const canDonate = () => have_($item`mimic egg`) && get("_mimicEggsDonated");
const canReceive = () => familiar.experience >= 100;

const makeXpath = (selectNumber: number, disabled: boolean): string =>
  `//select[@name="mid][${selectNumber}]/option[position()>0]${
    disabled ? "[@disabled]" : ""
  }/@value`;

function getMonsters(selectNumber: number, page: string): Monster[] {
  const total = xpath(page, makeXpath(selectNumber, false));
  const disabled = new Set(xpath(page, makeXpath(selectNumber, true)));
  return total
    .filter((m) => !disabled.has(m))
    .map((id) => toMonster(Number(id)));
}

/**
 * @returns List of monsters available for donation at this time
 */
export function getDonableMonsters(): Monster[] {
  if (!canDonate()) return [];
  const selectNumber = canReceive() ? 2 : 1;

  try {
    const page = visitBank();
    return getMonsters(selectNumber, page);
  } finally {
    visitUrl("main.php");
  }
}

/**
 * @returns List of monsters available to receive as an egg at this time
 */
export function getReceivableMonsters(): Monster[] {
  if (!canReceive()) return [];
  try {
    const page = visitBank();
    return getMonsters(1, page);
  } finally {
    visitUrl("main.php");
  }
}

/**
 * Donate an egg to the DNA bank
 *
 * @param monster The monster whose egg you want to donate
 * @returns Whether we succeeded in our endeavor
 */
export function donate(monster: Monster): boolean {
  if (!canDonate()) return false;

  const selectNumber = canReceive() ? 2 : 1;
  const page = visitBank();
  const available = getMonsters(selectNumber, page);
  try {
    if (!available.includes(monster)) return false;
    return runChoice(1, `mid=${monster.id}`).includes(
      "You donate your egg to science."
    );
  } finally {
    visitUrl("main.php");
  }
}

/**
 * Receive an egg from the DNA bank
 *
 * @param monster The monster whose egg you want to receive
 * @returns Whether we succeeded in our endeavor
 */
export function receive(monster: Monster): boolean {
  if (!canReceive()) return false;

  const page = visitBank();
  const available = getMonsters(1, page);
  try {
    if (!available.includes(monster)) return false;
    return runChoice(2, `mid=${monster.id}`).includes(
      "Your mimic pops into a backroom and returns a few moments later with a fresh mimic egg!"
    );
  } finally {
    visitUrl("main.php");
  }
}
