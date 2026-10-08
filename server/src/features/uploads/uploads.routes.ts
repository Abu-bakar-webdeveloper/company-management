import { Router } from 'express'
import { protect } from '../../middleware/auth.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { requireActive } from '../../middleware/requireActive.js'
import * as uploadsController from './uploads.controller.js'

const uploadsRouter = Router()

uploadsRouter.use(protect, requireActive)

// Permission checked inside controller based on upload purpose (avatar | task)
uploadsRouter.post('/cloudinary-sign', asyncHandler(uploadsController.signCloudinaryUpload))

export default uploadsRouter
