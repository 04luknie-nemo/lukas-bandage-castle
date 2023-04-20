import type { Lair, Species } from '@prisma/client'

export type HabitatWarning = { field: 'temperature' | 'humidity' | 'darkness'; message: string }

/** How far a lair's conditions are from what a species needs. Empty array = perfect fit. */
export function habitatWarnings(lair: Pick<Lair, 'temperatureC' | 'humidity' | 'darkness'>, species: Species): HabitatWarning[] {
  const warnings: HabitatWarning[] = []
  if (lair.temperatureC < species.tempMinC) {
    warnings.push({ field: 'temperature', message: `Too cold: ${lair.temperatureC} °C, ${species.name} needs at least ${species.tempMinC} °C` })
  } else if (lair.temperatureC > species.tempMaxC) {
    warnings.push({ field: 'temperature', message: `Too hot: ${lair.temperatureC} °C, ${species.name} needs at most ${species.tempMaxC} °C` })
  }
  if (lair.humidity < species.humidityMin) {
    warnings.push({ field: 'humidity', message: `Too dry: ${lair.humidity} %, ${species.name} needs ${species.humidityMin}–${species.humidityMax} %` })
  } else if (lair.humidity > species.humidityMax) {
    warnings.push({ field: 'humidity', message: `Too damp: ${lair.humidity} %, ${species.name} needs ${species.humidityMin}–${species.humidityMax} %` })
  }
  // Darkness is a preference, so allow some slack.
  if (Math.abs(lair.darkness - species.darkness) > 25) {
    warnings.push({
      field: 'darkness',
      message: lair.darkness < species.darkness ? `Too bright for a ${species.name}` : `Too dark for a ${species.name}`,
    })
  }
  return warnings
}
