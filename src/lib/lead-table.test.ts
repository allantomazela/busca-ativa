import { describe, expect, it } from 'vitest'
import { parseCityState, resolveLeadLocation } from './lead-table'

describe('parseCityState', () => {
  it('separa cidade e UF com vírgula', () => {
    expect(parseCityState('Campinas, SP')).toEqual({ city: 'Campinas', state: 'SP' })
  })

  it('separa cidade e UF com hífen', () => {
    expect(parseCityState('Botucatu-SP')).toEqual({ city: 'Botucatu', state: 'SP' })
    expect(parseCityState('Botucatu - SP')).toEqual({ city: 'Botucatu', state: 'SP' })
  })

  it('extrai cidade e UF do endereço completo', () => {
    expect(parseCityState('Rua A, 10 - Centro, Curitiba, PR')).toEqual({
      city: 'Curitiba',
      state: 'PR',
    })
    expect(parseCityState('Av. Brasil, 200 - Centro, Botucatu-SP')).toEqual({
      city: 'Botucatu',
      state: 'SP',
    })
  })
})

describe('resolveLeadLocation', () => {
  it('corrige cidade combinada já persistida', () => {
    expect(
      resolveLeadLocation({
        city: 'Botucatu-SP',
        state: '',
        formatted_address: 'Rua A - Centro, Botucatu-SP',
      }),
    ).toEqual({ city: 'Botucatu', state: 'SP' })
  })

  it('extrai cidade e UF do endereço legado', () => {
    expect(resolveLeadLocation({ formatted_address: 'Rua A, 10 - Centro, Curitiba, PR' })).toEqual({
      city: 'Curitiba',
      state: 'PR',
    })
  })
})
