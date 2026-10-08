import { randomBytes } from 'node:crypto'

export const passwordSchemaRegex = {
  minLength: 8,
  uppercase: /[A-Z]/,
  number: /[0-9]/,
}

export function generatePlaceholderPassword(): string {
  return randomBytes(32).toString('hex')
}
