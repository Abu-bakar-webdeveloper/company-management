import nodemailer from 'nodemailer'
import { env, isMailConfigured } from '../config/env.js'
import {
  brandFromName,
  brandReplyTo,
  PLATFORM_BRAND_NAME,
  renderBrandedEmail,
  type EmailBrand,
  type EmailDetailRow,
} from './mail.templates.js'

export {
  companyEmailBrand,
  platformEmailBrand,
  type EmailBrand,
} from './mail.templates.js'

const ROLE_LABELS: Record<string, string> = {
  superadmin: 'Super Admin',
  admin: 'Company Administrator',
  manager: 'Manager',
  hr: 'HR',
  employee: 'Employee',
}

export function emailRoleLabel(role: string, customRoleName?: string | null): string {
  const custom = customRoleName?.trim()
  if (custom) return custom
  return ROLE_LABELS[role] ?? role
}

function getTransporter() {
  if (!isMailConfigured()) return null

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    auth:
      env.SMTP_USER && env.SMTP_PASS
        ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
        : undefined,
  })
}

function headerSafeName(name: string): string {
  return name.replace(/[\r\n"<>]/g, '').trim() || PLATFORM_BRAND_NAME
}

function firstName(fullName: string): string {
  const part = fullName.trim().split(/\s+/)[0]
  return part || 'there'
}

function formatDurationHours(hours: number): string {
  if (hours % 24 === 0 && hours >= 24) {
    const days = hours / 24
    return days === 1 ? '1 day' : `${days} days`
  }
  return hours === 1 ? '1 hour' : `${hours} hours`
}

function formatExpiryAt(hours: number): string {
  const at = new Date(Date.now() + hours * 60 * 60 * 1000)
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: 'UTC',
    timeZoneName: 'short',
  }).format(at)
}

function formatNow(): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: 'UTC',
    timeZoneName: 'short',
  }).format(new Date())
}

function formatPlan(plan?: string): string | undefined {
  if (!plan) return undefined
  const labels: Record<string, string> = {
    basic: 'Basic',
    pro: 'Pro',
    enterprise: 'Enterprise',
  }
  return labels[plan] ?? plan
}

function compactDetails(rows: Array<EmailDetailRow | null | undefined>): EmailDetailRow[] {
  return rows.filter((row): row is EmailDetailRow => Boolean(row?.value?.trim()))
}

async function sendMail(options: {
  to: string
  subject: string
  html: string
  text: string
  fromName: string
  replyTo?: string
  logLabel: string
  logUrl?: string
}): Promise<void> {
  if (!isMailConfigured() || !env.MAIL_FROM) {
    console.info(`[mail:dev] ${options.logLabel} → ${options.to}`)
    if (options.logUrl) console.info(`[mail:dev] Link: ${options.logUrl}`)
    return
  }

  const transporter = getTransporter()
  if (!transporter) return

  await transporter.sendMail({
    from: {
      name: headerSafeName(options.fromName),
      address: env.MAIL_FROM,
    },
    to: options.to,
    replyTo: options.replyTo,
    subject: options.subject,
    html: options.html,
    text: options.text,
  })
}

export type InviteEmailPurpose = 'company_admin' | 'staff'

function formatDateOnly(value?: Date | string): string | undefined {
  if (!value) return undefined
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return undefined
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export type InviteEmailInput = {
  to: string
  inviteUrl: string
  recipientName: string
  companyName: string
  brand: EmailBrand
  purpose: InviteEmailPurpose
  roleLabel: string
  jobTitle?: string
  department?: string
  employeeCode?: string
  invitedBy?: string
  companyLocation?: string
  subscriptionPlan?: string
  joinDate?: Date | string
}

export async function sendInviteEmail(input: InviteEmailInput): Promise<void> {
  const fromName = brandFromName(input.brand)
  const hours = env.INVITE_TOKEN_EXPIRES_HOURS
  const duration = formatDurationHours(hours)
  const expiresAt = formatExpiryAt(hours)
  const greetingName = firstName(input.recipientName)
  const isAdmin = input.purpose === 'company_admin'

  const details = compactDetails([
    { label: 'Organization', value: input.companyName },
    { label: 'Your role', value: input.roleLabel },
    input.jobTitle && input.jobTitle !== input.roleLabel
      ? { label: 'Job title', value: input.jobTitle }
      : null,
    input.department ? { label: 'Department', value: input.department } : null,
    input.employeeCode ? { label: 'Employee ID', value: input.employeeCode } : null,
    formatDateOnly(input.joinDate)
      ? { label: 'Start date', value: formatDateOnly(input.joinDate)! }
      : null,
    { label: 'Account email', value: input.to },
    input.invitedBy ? { label: 'Invited by', value: input.invitedBy } : null,
    input.companyLocation ? { label: 'Location', value: input.companyLocation } : null,
    formatPlan(input.subscriptionPlan)
      ? { label: 'Plan', value: formatPlan(input.subscriptionPlan)! }
      : null,
    { label: 'Link expires', value: `${duration} · ${expiresAt}` },
  ])

  const { html, text } = renderBrandedEmail({
    brand: input.brand,
    title: isAdmin
      ? `Activate ${input.companyName} on ${PLATFORM_BRAND_NAME}`
      : `Join ${input.companyName} on ${PLATFORM_BRAND_NAME}`,
    preheader: isAdmin
      ? `Your ${input.companyName} workspace is ready. Set up your administrator password. This invitation expires in ${duration}.`
      : `${input.companyName} invited you as ${input.roleLabel}. Set up your password to get started. Expires in ${duration}.`,
    eyebrow: isAdmin ? 'Workspace invitation' : 'Team invitation',
    headline: isAdmin ? 'Your workspace is ready' : `You're invited to ${input.companyName}`,
    greeting: `Hi ${greetingName},`,
    paragraphs: isAdmin
      ? [
          `${PLATFORM_BRAND_NAME} has prepared a company workspace for ${input.companyName}. As the company administrator, you will manage people, settings, and access for your organization.`,
          'Set a password to activate your account. After that you can sign in, invite your team, and configure the workspace.',
        ]
      : [
          `You have been invited to join ${input.companyName} on ${PLATFORM_BRAND_NAME} as a ${input.roleLabel}.`,
          'Set a password to activate your account. Use the email address on this invitation when you sign in.',
        ],
    details,
    ctaLabel: 'Set up your password',
    ctaUrl: input.inviteUrl,
    noticeTitle: 'This invitation is personal',
    noticeBody: `This link is intended only for ${input.to} and expires in ${duration} (${expiresAt}). If you were not expecting this invitation, you can ignore this email and no account will be activated.`,
    noticeTone: 'neutral',
    steps: isAdmin
      ? [
          {
            title: 'Create your password',
            body: 'Choose a strong password to unlock administrator access.',
          },
          {
            title: 'Sign in to your workspace',
            body: `Use ${input.to} to access ${input.companyName} on ${PLATFORM_BRAND_NAME}.`,
          },
          {
            title: 'Invite your team',
            body: 'Add people, assign roles, and configure company settings.',
          },
        ]
      : [
          {
            title: 'Create your password',
            body: 'Activate your account with a secure password of your choice.',
          },
          {
            title: 'Sign in',
            body: `Use ${input.to} to open the ${input.companyName} workspace.`,
          },
          {
            title: 'Get to work',
            body: 'Review your profile, then pick up tasks, attendance, and team updates.',
          },
        ],
    footerNote: isAdmin
      ? `This invitation was sent by ${PLATFORM_BRAND_NAME} to set up ${input.companyName}. If you did not expect it, no further action is required.`
      : `This invitation was sent by ${fromName}. If you did not expect it, no further action is required.`,
  })

  await sendMail({
    to: input.to,
    subject: isAdmin
      ? `Activate your ${input.companyName} workspace on ${PLATFORM_BRAND_NAME}`
      : `${input.companyName} invited you to ${PLATFORM_BRAND_NAME}`,
    html,
    text,
    fromName,
    replyTo: brandReplyTo(input.brand),
    logLabel: `Invite email (${input.companyName} · ${input.purpose}) from ${fromName}`,
    logUrl: input.inviteUrl,
  })
}

export type PasswordResetEmailInput = {
  to: string
  resetUrl: string
  recipientName: string
  brand: EmailBrand
  companyName?: string
}

export async function sendPasswordResetEmail(input: PasswordResetEmailInput): Promise<void> {
  const fromName = brandFromName(input.brand)
  const hours = env.RESET_TOKEN_EXPIRES_HOURS
  const duration = formatDurationHours(hours)
  const expiresAt = formatExpiryAt(hours)
  const requestedAt = formatNow()
  const greetingName = firstName(input.recipientName)
  const workspace = input.companyName?.trim() || fromName

  const details = compactDetails([
    { label: 'Account', value: input.to },
    { label: 'Workspace', value: workspace },
    { label: 'Requested', value: requestedAt },
    { label: 'Link expires', value: `${duration} · ${expiresAt}` },
  ])

  const { html, text } = renderBrandedEmail({
    brand: input.brand,
    title: `Reset your ${fromName} password`,
    preheader: `A password reset was requested for ${input.to}. This link expires in ${duration}. If this was not you, you can ignore this email.`,
    eyebrow: 'Security notice',
    headline: 'Reset your password',
    greeting: `Hi ${greetingName},`,
    paragraphs: [
      `We received a request to reset the password for the ${PLATFORM_BRAND_NAME} account associated with ${input.to}.`,
      'If you made this request, choose a new password with the button below. Your current password stays active until you complete the reset.',
    ],
    details,
    ctaLabel: 'Reset your password',
    ctaUrl: input.resetUrl,
    noticeTitle: 'Did not request this?',
    noticeBody:
      'You can safely ignore this email. Do not share this link with anyone. Our team will never ask you for your password or this reset link.',
    noticeTone: 'warning',
    steps: [
      {
        title: 'Choose a new password',
        body: `This reset link is valid for ${duration} and can be used only once.`,
      },
      {
        title: 'Sign in again',
        body: 'Use your email and new password to return to your workspace.',
      },
      {
        title: 'Review account security',
        body: 'If you did not request this change, contact your administrator after signing in.',
      },
    ],
    footerNote: `This security message was sent by ${fromName} because a password reset was requested for ${input.to}.`,
  })

  await sendMail({
    to: input.to,
    subject: `Reset your ${fromName} password`,
    html,
    text,
    fromName,
    replyTo: brandReplyTo(input.brand),
    logLabel: `Password reset email from ${fromName}`,
    logUrl: input.resetUrl,
  })
}

export function buildInviteUrl(rawToken: string): string {
  return `${env.APP_URL}/accept-invite?token=${encodeURIComponent(rawToken)}`
}

export function buildResetPasswordUrl(rawToken: string): string {
  return `${env.APP_URL}/reset-password?token=${encodeURIComponent(rawToken)}`
}
