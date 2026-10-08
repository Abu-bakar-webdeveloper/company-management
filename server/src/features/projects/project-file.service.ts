import { Types } from 'mongoose'
import { AppError } from '../../utils/AppError.js'
import { Project } from './project.model.js'
import {
  MAX_PROJECT_FILES,
  ProjectFile,
  type IProjectFile,
  type ProjectFileKind,
} from './project-file.model.js'
import type { ProjectActor } from './project.service.js'
import type { CreateProjectFileInput } from './project-file.validation.js'

export type ProjectFileDto = {
  id: string
  projectId: string
  kind: ProjectFileKind
  title: string
  url: string
  publicId?: string | null
  fileName?: string
  mimeType?: string
  sizeBytes?: number
  createdById: string
  sortOrder: number
  createdAt: string
}

function membershipOk(
  project: { managerId: Types.ObjectId; teamMemberIds: Types.ObjectId[] },
  acting: ProjectActor,
) {
  if (acting.role !== 'employee' || acting.canWrite) return true
  return (
    project.managerId.toString() === acting.id ||
    project.teamMemberIds.some((id) => id.toString() === acting.id)
  )
}

async function getProjectForActor(projectId: string, acting: ProjectActor) {
  const project = await Project.findOne({ _id: projectId, companyId: acting.companyId })
  if (!project || !membershipOk(project, acting)) {
    throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND')
  }
  return project
}

function toProjectFileDto(item: IProjectFile): ProjectFileDto {
  return {
    id: item._id.toString(),
    projectId: item.projectId.toString(),
    kind: item.kind,
    title: item.title,
    url: item.url,
    ...(item.publicId != null ? { publicId: item.publicId } : {}),
    ...(item.fileName ? { fileName: item.fileName } : {}),
    ...(item.mimeType ? { mimeType: item.mimeType } : {}),
    ...(item.sizeBytes != null ? { sizeBytes: item.sizeBytes } : {}),
    createdById: item.createdById.toString(),
    sortOrder: item.sortOrder,
    createdAt: item.createdAt.toISOString(),
  }
}

export async function listProjectFiles(
  projectId: string,
  acting: ProjectActor,
): Promise<{ files: ProjectFileDto[] }> {
  await getProjectForActor(projectId, acting)

  const files = await ProjectFile.find({
    projectId,
    companyId: acting.companyId,
  }).sort({ sortOrder: 1, createdAt: -1 })

  return {
    files: files.map((item) => toProjectFileDto(item)),
  }
}

export async function createProjectFile(
  projectId: string,
  payload: CreateProjectFileInput,
  acting: ProjectActor,
): Promise<{ file: ProjectFileDto }> {
  if (!acting.canWrite) {
    throw new AppError('Insufficient permissions', 403, 'FORBIDDEN')
  }

  const project = await getProjectForActor(projectId, acting)
  const count = await ProjectFile.countDocuments({ projectId: project._id })
  if (count >= MAX_PROJECT_FILES) {
    throw new AppError(
      `A project can have at most ${MAX_PROJECT_FILES} files and links`,
      400,
      'PROJECT_FILE_LIMIT',
    )
  }

  let title: string
  if (payload.kind === 'link') {
    title = payload.title
  } else {
    const customTitle = typeof payload.title === 'string' ? payload.title.trim() : ''
    title = customTitle || payload.fileName
  }

  const doc = await ProjectFile.create({
    companyId: acting.companyId,
    projectId: project._id,
    kind: payload.kind,
    title,
    url: payload.url,
    ...(payload.kind === 'file'
      ? {
          publicId: payload.publicId ?? null,
          fileName: payload.fileName,
          mimeType: payload.mimeType,
          sizeBytes: payload.sizeBytes,
        }
      : {}),
    createdById: new Types.ObjectId(acting.id),
    sortOrder: count,
  })

  return {
    file: toProjectFileDto(doc),
  }
}

export async function deleteProjectFile(
  projectId: string,
  fileId: string,
  acting: ProjectActor,
): Promise<void> {
  if (!acting.canWrite) {
    throw new AppError('Insufficient permissions', 403, 'FORBIDDEN')
  }

  await getProjectForActor(projectId, acting)

  const item = await ProjectFile.findOne({
    _id: fileId,
    projectId,
    companyId: acting.companyId,
  })
  if (!item) {
    throw new AppError('File not found', 404, 'PROJECT_FILE_NOT_FOUND')
  }

  await item.deleteOne()
}
