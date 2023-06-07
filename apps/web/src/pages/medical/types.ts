export type Treatment = {
  id: number
  name: string
  status: 'PLANNED' | 'ONGOING' | 'COMPLETE'
  startedAt: string | null
  endedAt: string | null
  notes: string | null
}

export type Prescription = {
  id: number
  remedy: string
  form: 'POTION' | 'SALVE' | 'TINCTURE' | 'POULTICE' | 'ELIXIR'
  dosage: string
  frequency: string
  startDate: string
  endDate: string | null
  notes: string | null
}

export type MedicalRecord = {
  prescriptions: Prescription[]
  id: number
  monsterId: number
  vetId: number
  visitDate: string
  summary: string
  diagnosis: string | null
  notes: string | null
  treatments: Treatment[]
}

export type Patient = {
  id: number
  name: string
  species: string | null
  records: MedicalRecord[]
}
