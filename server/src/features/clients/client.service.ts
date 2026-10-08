import { Types } from 'mongoose'
import { AppError } from '../../utils/AppError.js'
import {
  buildPaginatedResult,
  buildSearchFilter,
  parsePagination,
} from '../../utils/pagination.js'
import type { UserRole } from '../auth/auth.types.js'
import { resolveActorFullName } from '../notifications/actor-name.js'
import { dispatchDomainEventSafe } from '../notifications/notification.service.js'
import { Project } from '../projects/project.model.js'
import {
  Client,
  type ClientAddress,
  type ClientPrimaryContact,
  type ClientStatus,
  type IClient,
} from './client.model.js'
import type {
  CreateClientInput,
  ListClientsQuery,
  QuickCreateClientInput,
  UpdateClientInput,
} from './client.validation.js'

export type ClientActor = {
  id: string
  companyId: string
  role: UserRole
}

export type ClientProjectSummaryDto = {
  id: string
  projectCode: string
  name: string
  status: string
  progress: number
  startDate: string
  endDate: string
  contractValue?: number
}

export type ClientDto = {
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
}

export type ClientDetailDto = ClientDto & {
  projects: ClientProjectSummaryDto[]
}

export type ClientOptionDto = {
  id: string
  name: string
  clientCode: string
  status: ClientStatus
}

function toDateString(value: Date): string {
  return value.toISOString().slice(0, 10)
}

function canViewCommercialDetails(role: UserRole): boolean {
  return role === 'admin' || role === 'hr' || role === 'superadmin'
}

function emptyToUndefined(value?: string): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

function cleanAddress(address?: ClientAddress): ClientAddress | undefined {
  if (!address) return undefined
  const cleaned: ClientAddress = {
    ...(emptyToUndefined(address.country) ? { country: emptyToUndefined(address.country) } : {}),
    ...(emptyToUndefined(address.city) ? { city: emptyToUndefined(address.city) } : {}),
    ...(emptyToUndefined(address.addressLine)
      ? { addressLine: emptyToUndefined(address.addressLine) }
      : {}),
    ...(emptyToUndefined(address.postalCode)
      ? { postalCode: emptyToUndefined(address.postalCode) }
      : {}),
  }
  return Object.keys(cleaned).length > 0 ? cleaned : undefined
}

function cleanPrimaryContact(
  contact?: ClientPrimaryContact,
): ClientPrimaryContact | undefined {
  if (!contact) return undefined
  const cleaned: ClientPrimaryContact = {
    ...(emptyToUndefined(contact.name) ? { name: emptyToUndefined(contact.name) } : {}),
    ...(emptyToUndefined(contact.email) ? { email: emptyToUndefined(contact.email) } : {}),
    ...(emptyToUndefined(contact.phone) ? { phone: emptyToUndefined(contact.phone) } : {}),
  }
  return Object.keys(cleaned).length > 0 ? cleaned : undefined
}

async function nextClientCode(companyId: string): Promise<string> {
  const latest = await Client.findOne({ companyId })
    .sort({ createdAt: -1 })
    .select('clientCode')
    .lean()

  let next = 1
  if (latest?.clientCode) {
    const num = Number.parseInt(latest.clientCode.replace(/\D/g, ''), 10)
    if (!Number.isNaN(num)) next = num + 1
  }

  return `CLT-${String(next).padStart(4, '0')}`
}

async function projectStatsForClients(
  companyId: string,
  clientIds: Types.ObjectId[],
): Promise<
  Map<
    string,
    { activeProjectCount: number; completedProjectCount: number; totalContractValue: number }
  >
> {
  const map = new Map<
    string,
    { activeProjectCount: number; completedProjectCount: number; totalContractValue: number }
  >()

  if (clientIds.length === 0) return map

  const rows = await Project.aggregate<{
    _id: Types.ObjectId
    activeProjectCount: number
    completedProjectCount: number
    totalContractValue: number
  }>([
    {
      $match: {
        companyId: new Types.ObjectId(companyId),
        clientId: { $in: clientIds },
      },
    },
    {
      $group: {
        _id: '$clientId',
        activeProjectCount: {
          $sum: { $cond: [{ $ne: ['$status', 'completed'] }, 1, 0] },
        },
        completedProjectCount: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
        },
        totalContractValue: {
          $sum: { $ifNull: ['$contractValue', 0] },
        },
      },
    },
  ])

  for (const row of rows) {
    map.set(row._id.toString(), {
      activeProjectCount: row.activeProjectCount,
      completedProjectCount: row.completedProjectCount,
      totalContractValue: row.totalContractValue,
    })
  }

  return map
}

function toClientDto(
  client: IClient,
  stats?: {
    activeProjectCount: number
    completedProjectCount: number
    totalContractValue: number
  },
  acting?: ClientActor,
): ClientDto {
  const includeCommercial = !acting || canViewCommercialDetails(acting.role)
  return {
    id: client._id.toString(),
    clientCode: client.clientCode,
    name: client.name,
    ...(client.email ? { email: client.email } : {}),
    ...(client.phone ? { phone: client.phone } : {}),
    ...(client.website ? { website: client.website } : {}),
    ...(client.industry ? { industry: client.industry } : {}),
    ...(client.address ? { address: client.address } : {}),
    ...(client.primaryContact ? { primaryContact: client.primaryContact } : {}),
    status: client.status,
    ...(client.notes ? { notes: client.notes } : {}),
    activeProjectCount: stats?.activeProjectCount ?? 0,
    completedProjectCount: stats?.completedProjectCount ?? 0,
    totalContractValue: includeCommercial ? (stats?.totalContractValue ?? 0) : 0,
    createdAt: client.createdAt.toISOString(),
    updatedAt: client.updatedAt.toISOString(),
  }
}

export async function listClients(query: ListClientsQuery, acting: ClientActor) {
  const { page, limit, skip } = parsePagination(query)
  const filter: Record<string, unknown> = { companyId: acting.companyId }

  if (query.status) filter.status = query.status

  const searchFilter = buildSearchFilter(query.search, [
    'name',
    'clientCode',
    'email',
    'phone',
    'industry',
  ])
  if (searchFilter) Object.assign(filter, searchFilter)

  const [clients, total] = await Promise.all([
    Client.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Client.countDocuments(filter),
  ])

  const statsMap = await projectStatsForClients(
    acting.companyId,
    clients.map((c) => c._id),
  )

  const items = clients.map((client) =>
    toClientDto(client, statsMap.get(client._id.toString()), acting),
  )
  const result = buildPaginatedResult(items, total, page, limit)

  return {
    clients: result.items,
    pagination: result.pagination,
  }
}

export async function listClientOptions(acting: ClientActor): Promise<{
  clients: ClientOptionDto[]
}> {
  const clients = await Client.find({
    companyId: acting.companyId,
    status: 'active',
  })
    .sort({ name: 1 })
    .select('name clientCode status')
    .lean()

  return {
    clients: clients.map((client) => ({
      id: client._id.toString(),
      name: client.name,
      clientCode: client.clientCode,
      status: client.status,
    })),
  }
}

export type ClientStatsDto = {
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

export async function getClientStats(acting: ClientActor): Promise<{ stats: ClientStatsDto }> {
  const companyId = new Types.ObjectId(acting.companyId)
  const includeCommercial = canViewCommercialDetails(acting.role)

  const [statusRows, delayedGrouped, valueRows, totalAgg] = await Promise.all([
    Client.aggregate<{ _id: ClientStatus; count: number }>([
      { $match: { companyId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Project.aggregate<{
      _id: Types.ObjectId
      delayedProjectCount: number
      totalContractValue: number
    }>([
      {
        $match: {
          companyId,
          clientId: { $exists: true, $ne: null },
          status: 'delayed',
        },
      },
      {
        $group: {
          _id: '$clientId',
          delayedProjectCount: { $sum: 1 },
          totalContractValue: { $sum: { $ifNull: ['$contractValue', 0] } },
        },
      },
      { $sort: { delayedProjectCount: -1 } },
    ]),
    Project.aggregate<{
      _id: Types.ObjectId
      totalContractValue: number
      activeProjectCount: number
    }>([
      {
        $match: {
          companyId,
          clientId: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$clientId',
          totalContractValue: { $sum: { $ifNull: ['$contractValue', 0] } },
          activeProjectCount: {
            $sum: { $cond: [{ $ne: ['$status', 'completed'] }, 1, 0] },
          },
        },
      },
      { $sort: { totalContractValue: -1 } },
      { $limit: 8 },
    ]),
    includeCommercial
      ? Project.aggregate<{ total: number }>([
          {
            $match: {
              companyId,
              clientId: { $exists: true, $ne: null },
            },
          },
          { $group: { _id: null, total: { $sum: { $ifNull: ['$contractValue', 0] } } } },
        ])
      : Promise.resolve([] as { total: number }[]),
  ])

  const byStatus = Object.fromEntries(statusRows.map((r) => [r._id, r.count])) as Record<
    string,
    number
  >

  const atRiskSlice = delayedGrouped.slice(0, 8)
  const clientIds = [
    ...new Set([
      ...atRiskSlice.map((r) => r._id.toString()),
      ...valueRows.map((r) => r._id.toString()),
    ]),
  ].filter(Boolean)

  const clientDocs =
    clientIds.length > 0
      ? await Client.find({
          companyId,
          _id: { $in: clientIds.map((id) => new Types.ObjectId(id)) },
        })
          .select('name')
          .lean()
      : []
  const nameById = new Map(clientDocs.map((c) => [c._id.toString(), c.name]))

  return {
    stats: {
      activeClients: byStatus.active ?? 0,
      inactiveClients: byStatus.inactive ?? 0,
      totalContractValue: includeCommercial ? (totalAgg[0]?.total ?? 0) : 0,
      clientsWithDelayedProject: delayedGrouped.length,
      topClientsByContractValue: includeCommercial
        ? valueRows.map((row) => ({
            id: row._id.toString(),
            name: nameById.get(row._id.toString()) ?? 'Client',
            totalContractValue: row.totalContractValue,
            activeProjectCount: row.activeProjectCount,
          }))
        : [],
      atRiskClients: atRiskSlice.map((row) => ({
        id: row._id.toString(),
        name: nameById.get(row._id.toString()) ?? 'Client',
        delayedProjectCount: row.delayedProjectCount,
        totalContractValue: includeCommercial ? row.totalContractValue : 0,
      })),
    },
  }
}

export async function getClientById(
  clientId: string,
  acting: ClientActor,
): Promise<ClientDetailDto> {
  const client = await Client.findOne({ _id: clientId, companyId: acting.companyId })
  if (!client) {
    throw new AppError('Client not found', 404, 'CLIENT_NOT_FOUND')
  }

  const [statsMap, projects] = await Promise.all([
    projectStatsForClients(acting.companyId, [client._id]),
    Project.find({ companyId: acting.companyId, clientId: client._id }).sort({
      createdAt: -1,
    }),
  ])

  const includeCommercial = canViewCommercialDetails(acting.role)
  const projectSummaries: ClientProjectSummaryDto[] = projects.map((project) => ({
    id: project._id.toString(),
    projectCode: project.projectCode,
    name: project.name,
    status: project.status,
    progress: project.progress,
    startDate: toDateString(project.startDate),
    endDate: toDateString(project.endDate),
    ...(includeCommercial && project.contractValue != null
      ? { contractValue: project.contractValue }
      : {}),
  }))

  return {
    ...toClientDto(client, statsMap.get(client._id.toString()), acting),
    projects: projectSummaries,
  }
}

export async function createClient(
  payload: CreateClientInput,
  acting: ClientActor,
): Promise<ClientDto> {
  const clientCode = await nextClientCode(acting.companyId)
  const client = await Client.create({
    companyId: acting.companyId,
    clientCode,
    name: payload.name,
    email: emptyToUndefined(payload.email),
    phone: emptyToUndefined(payload.phone),
    website: emptyToUndefined(payload.website),
    industry: emptyToUndefined(payload.industry),
    address: cleanAddress(payload.address),
    primaryContact: cleanPrimaryContact(payload.primaryContact),
    status: payload.status,
    notes: emptyToUndefined(payload.notes),
  })

  await dispatchDomainEventSafe({
    type: 'client.created',
    actor: {
      id: acting.id,
      fullName: await resolveActorFullName(acting.id),
      companyId: acting.companyId,
    },
    entityId: client._id.toString(),
    context: { entityLabel: client.name },
  })

  return toClientDto(client, undefined, acting)
}

/** Used by project create-with-new-client flow. */
export async function createClientQuick(
  payload: QuickCreateClientInput,
  acting: ClientActor,
): Promise<IClient> {
  const clientCode = await nextClientCode(acting.companyId)
  const client = await Client.create({
    companyId: acting.companyId,
    clientCode,
    name: payload.name,
    email: emptyToUndefined(payload.email),
    phone: emptyToUndefined(payload.phone),
    status: 'active',
  })

  await dispatchDomainEventSafe({
    type: 'client.created',
    actor: {
      id: acting.id,
      fullName: await resolveActorFullName(acting.id),
      companyId: acting.companyId,
    },
    entityId: client._id.toString(),
    context: { entityLabel: client.name },
  })

  return client
}

export async function assertClientInCompany(
  clientId: string,
  companyId: string,
): Promise<IClient> {
  const client = await Client.findOne({ _id: clientId, companyId })
  if (!client) {
    throw new AppError('Client not found in this company', 400, 'INVALID_CLIENT')
  }
  return client
}

export async function updateClient(
  clientId: string,
  payload: UpdateClientInput,
  acting: ClientActor,
): Promise<ClientDto> {
  const client = await Client.findOne({ _id: clientId, companyId: acting.companyId })
  if (!client) {
    throw new AppError('Client not found', 404, 'CLIENT_NOT_FOUND')
  }

  if (payload.name !== undefined) client.name = payload.name
  if (payload.email !== undefined) client.email = emptyToUndefined(payload.email)
  if (payload.phone !== undefined) client.phone = emptyToUndefined(payload.phone)
  if (payload.website !== undefined) client.website = emptyToUndefined(payload.website)
  if (payload.industry !== undefined) client.industry = emptyToUndefined(payload.industry)
  if (payload.address !== undefined) client.address = cleanAddress(payload.address)
  if (payload.primaryContact !== undefined) {
    client.primaryContact = cleanPrimaryContact(payload.primaryContact)
  }
  if (payload.status !== undefined) client.status = payload.status
  if (payload.notes !== undefined) client.notes = emptyToUndefined(payload.notes)

  await client.save()

  const statsMap = await projectStatsForClients(acting.companyId, [client._id])
  return toClientDto(client, statsMap.get(client._id.toString()), acting)
}

export async function deleteClient(clientId: string, acting: ClientActor): Promise<void> {
  const client = await Client.findOne({ _id: clientId, companyId: acting.companyId })
  if (!client) {
    throw new AppError('Client not found', 404, 'CLIENT_NOT_FOUND')
  }

  const activeCount = await Project.countDocuments({
    companyId: acting.companyId,
    clientId: client._id,
    status: { $ne: 'completed' },
  })

  if (activeCount > 0) {
    throw new AppError(
      'Cannot delete a client with active projects. Mark inactive or reassign projects first.',
      400,
      'CLIENT_HAS_ACTIVE_PROJECTS',
    )
  }

  await client.deleteOne()
}
