export type ApiErrorBody = {
  message: string
  code?: string
  details?: unknown
}

export type ApiSuccessBody<T> = {
  success: true
  data: T
  message?: string
}

export type ApiFailureBody = {
  success: false
  error: ApiErrorBody
}

export type ApiEnvelope<T> = ApiSuccessBody<T> | ApiFailureBody
