// generates a placeholder "portrait" so we dont need real photos yet

const EMOJI: any = {
  dragon: '🐉',
  wyvern: '🐲',
  troll: '🧌',
  ogre: '👹',
  goblin: '👺',
  ghost: '👻',
  wraith: '👻',
  banshee: '👻',
  spider: '🕷️',
  'giant spider': '🕷️',
  kraken: '🦑',
  'sea serpent': '🐍',
  basilisk: '🐍',
  werewolf: '🐺',
  griffin: '🦅',
  slime: '🟢',
}

function hash(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

export function placeholderSvg(name: string, species: string) {
  const hue = hash(species || name || 'x') % 360
  const emoji = EMOJI[(species || '').toLowerCase()] || (name ? name[0].toUpperCase() : '?')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="hsl(${hue},45%,70%)"/>
  <circle cx="100" cy="90" r="60" fill="hsl(${hue},45%,85%)"/>
  <text x="100" y="112" font-size="64" text-anchor="middle">${emoji}</text>
  <text x="100" y="185" font-size="16" text-anchor="middle" font-family="Georgia" fill="#3b2a1a">${(name || '').replace(/[<>&]/g, '')}</text>
</svg>`
}
