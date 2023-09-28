// Contract references are read out loud over crystal balls, so no 0/O or 1/I/L.
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'

/** "HH-7KQ2". Four characters is plenty for a castle. */
export function contractReference(random: () => number = Math.random): string {
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += ALPHABET[Math.floor(random() * ALPHABET.length)]
  }
  return `HH-${code}`
}

export const STANDARD_TERMS = `1. The Overlord shall provide a lair of suitable size, temperature and darkness.
2. The monster shall not be asked to fight heroes on more than three days per week.
3. Two weeks of holiday per year, to be spent at Bandage Castle at the Overlord's expense.
4. Bandage Castle may inspect the lair once per year with one month's notice (and one raven).
5. Should either party wish to end the arrangement, the monster returns to Bandage Castle, not to the wild.`
