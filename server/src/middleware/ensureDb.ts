import type { NextFunction, Request, Response } from 'express'
import { connectDB } from '../db/connect.js'

/** Ensures MongoDB is connected before handling the request (serverless-friendly). */
export async function ensureDb(_req: Request, _res: Response, next: NextFunction) {
  try {
    await connectDB()
    next()
  } catch (err) {
    next(err)
  }
}
