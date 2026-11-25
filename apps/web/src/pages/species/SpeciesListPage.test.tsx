// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { Species } from '../../types/species'
import SpeciesListPage from './SpeciesListPage'

const dragon: Species = {
  id: 1,
  name: 'Dragon',
  slug: 'dragon',
  description: null,
  diet: 'Sheep, Goats',
  dietType: 'CARNIVORE',
  mealsPerDay: 2,
  portionKg: 40,
  dangerLevel: 5,
  tempMinC: 20,
  tempMaxC: 60,
  humidityMin: 10,
  humidityMax: 40,
  darkness: 50,
  lifespanYears: 1000,
  residentCount: 1,
  incompatibleWith: [],
}

vi.mock('../../hooks/useApi', () => ({
  useApi: () => ({ data: [dragon], loading: false, error: null }),
}))

afterEach(cleanup)

function search(text: string) {
  render(
    <MemoryRouter>
      <SpeciesListPage />
    </MemoryRouter>,
  )
  fireEvent.change(screen.getByPlaceholderText('Search species...'), { target: { value: text } })
}

// Issue #7: the species search must not care about upper and lower case.
describe('SpeciesListPage search', () => {
  it.each(['Dragon', 'dragon', 'DRAGON'])('finds the dragon when searching for %s', (text) => {
    search(text)
    expect(screen.queryByRole('heading', { name: 'Dragon' })).not.toBeNull()
  })

  it('finds a species by its diet in any case', () => {
    search('sheep')
    expect(screen.queryByRole('heading', { name: 'Dragon' })).not.toBeNull()
  })
})
