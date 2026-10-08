export type ClientStatus = 'active' | 'inactive'

export type ClientDetailTab = 'overview' | 'projects'

export type ClientAddress = {
  country?: string
  city?: string
  addressLine?: string
  postalCode?: string
}

export type ClientPrimaryContact = {
  name?: string
  email?: string
  phone?: string
}

export type ClientProjectSummary = {
  id: string
  projectCode: string
  name: string
  status: string
  progress: number
  startDate: string
  endDate: string
  contractValue?: number
}

export type Client = {
  id: string
  clientCode: string
  name: string
  email?: string
  phone?: string
  website?: string
  industry?: string
  address?: ClientAddress
  primaryContact?: ClientPrimaryContact
  status: ClientStatus
  notes?: string
  activeProjectCount: number
  completedProjectCount: number
  totalContractValue: number
  createdAt: string
  updatedAt: string
  projects?: ClientProjectSummary[]
}

export type ClientOption = {
  id: string
  name: string
  clientCode: string
  status: ClientStatus
}

export type ClientListFilters = {
  search: string
  status: ClientStatus | 'all'
}

export type ClientStats = {
  activeClients: number
  inactiveClients: number
  totalContractValue: number
  clientsWithDelayedProject: number
  topClientsByContractValue: Array<{
    id: string
    name: string
    totalContractValue: number
    activeProjectCount: number
  }>
  atRiskClients: Array<{
    id: string
    name: string
    delayedProjectCount: number
    totalContractValue: number
  }>
}
