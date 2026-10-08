import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { protect } from '../../middleware/auth.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { validate } from '../../middleware/validate.js'
import * as authController from './auth.controller.js'
import {
  acceptInviteSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
} from './auth.validation.js'

const authRouter = Router()

/** Strict limit for credential / token-issuance endpoints only — not refresh/logout/me. */
const authAttemptLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: 'Too many auth attempts, please try again later', code: 'RATE_LIMITED' },
  },
})

authRouter.post(
  '/login',
  authAttemptLimiter,
  validate(loginSchema),
  asyncHandler(authController.login),
)
authRouter.post(
  '/accept-invite',
  authAttemptLimiter,
  validate(acceptInviteSchema),
  asyncHandler(authController.acceptInviteHandler),
)
authRouter.post(
  '/forgot-password',
  authAttemptLimiter,
  validate(forgotPasswordSchema),
  asyncHandler(authController.forgotPassword),
)
authRouter.post(
  '/reset-password',
  authAttemptLimiter,
  validate(resetPasswordSchema),
  asyncHandler(authController.resetPasswordHandler),
)
authRouter.post('/refresh', asyncHandler(authController.refresh))
authRouter.post('/logout', asyncHandler(authController.logout))
authRouter.get('/me', protect, asyncHandler(authController.me))

export default authRouter
