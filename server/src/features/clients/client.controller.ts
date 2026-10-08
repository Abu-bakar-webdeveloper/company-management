import type { Request, Response } from 'express'
import { AppError } from '../../utils/AppError.js'
import { sendSuccess } from '../../utils/apiResponse.js'
import type { UserRole } from '../auth/auth.types.js'
import {
  createClient,
  deleteClient,
  getClientById,
  getClientStats,
  listClientOptions,
  listClients,
  updateClient,
  type ClientActor,
} from './client.service.js'
import type {
  CreateClientInput,
  ListClientsQuery,
  UpdateClientInput,
} from './client.validation.js'

function getClientActor(req: Request): ClientActor {
  const companyId = req.user!.companyId
  if (!companyId) {
    throw new AppError('Company context required', 403, 'FORBIDDEN')
  }

  return {
    id: req.user!.id,
    companyId,
    role: req.user!.role as UserRole,
  }
}

export async function listClientsHandler(req: Request, res: Response): Promise<void> {
  const result = await listClients(req.validatedQuery as ListClientsQuery, getClientActor(req))
  sendSuccess(res, result)
}

export async function listClientOptionsHandler(req: Request, res: Response): Promise<void> {
  const result = await listClientOptions(getClientActor(req))
  sendSuccess(res, result)
}

export async function getClientStatsHandler(req: Request, res: Response): Promise<void> {
  const result = await getClientStats(getClientActor(req))
  sendSuccess(res, result)
}

export async function getClientHandler(req: Request, res: Response): Promise<void> {
  const client = await getClientById(req.params.id as string, getClientActor(req))
  sendSuccess(res, { client })
}

export async function createClientHandler(req: Request, res: Response): Promise<void> {
  const client = await createClient(req.body as CreateClientInput, getClientActor(req))
  sendSuccess(res, { client }, { statusCode: 201, message: 'Client created successfully' })
}

export async function updateClientHandler(req: Request, res: Response): Promise<void> {
  const client = await updateClient(
    req.params.id as string,
    req.body as UpdateClientInput,
    getClientActor(req),
  )
  sendSuccess(res, { client }, { message: 'Client updated successfully' })
}

export async function deleteClientHandler(req: Request, res: Response): Promise<void> {
  await deleteClient(req.params.id as string, getClientActor(req))
  sendSuccess(res, { message: 'Client deleted successfully' })
}
