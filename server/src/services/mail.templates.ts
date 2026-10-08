export const PLATFORM_BRAND_NAME = 'BizFlow'
export const PLATFORM_PRIMARY = '#00284F'
export const PLATFORM_ACCENT = '#136DEC'

export type EmailBrand =
  | { kind: 'platform' }
  | {
      kind: 'company'
      name: string
      logoUrl?: string | null
      primaryColor?: string
      secondaryColor?: string
      email?: string
      phone?: string
      addressLine?: string
      city?: string
      country?: string
      postalCode?: string
    }

export type CompanyEmailBrandInput = {
  name: string
  logoUrl?: string | null
  primaryColor?: string
  secondaryColor?: string
  email?: string
  phone?: string
  addressLine?: string
  city?: string
  country?: string
  postalCode?: string
}

export type EmailDetailRow = {
  label: string
  value: string
}

export type EmailStep = {
  title: string
  body: string
}

export function platformEmailBrand(): EmailBrand {
  return { kind: 'platform' }
}

export function companyEmailBrand(company: CompanyEmailBrandInput): EmailBrand {
  return {
    kind: 'company',
    name: company.name,
    logoUrl: company.logoUrl,
    primaryColor: company.primaryColor,
    secondaryColor: company.secondaryColor,
    email: company.email,
    phone: company.phone,
    addressLine: company.addressLine,
    city: company.city,
    country: company.country,
    postalCode: company.postalCode,
  }
}

export function brandFromName(brand: EmailBrand): string {
  if (brand.kind === 'company') return brand.name.trim() || PLATFORM_BRAND_NAME
  return PLATFORM_BRAND_NAME
}

export function brandReplyTo(brand: EmailBrand): string | undefined {
  if (brand.kind !== 'company') return undefined
  const email = brand.email?.trim()
  return email || undefined
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function sanitizeHexColor(value: string | undefined, fallback: string): string {
  if (!value) return fallback
  const hex = value.trim()
  return /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : fallback
}

function brandColors(brand: EmailBrand): { primary: string; accent: string } {
  if (brand.kind === 'company') {
    return {
      primary: sanitizeHexColor(brand.primaryColor, PLATFORM_PRIMARY),
      accent: sanitizeHexColor(brand.secondaryColor, PLATFORM_ACCENT),
    }
  }
  return { primary: PLATFORM_PRIMARY, accent: PLATFORM_ACCENT }
}

function headerMark(brand: EmailBrand, onDark: boolean): string {
  const { primary, accent } = brandColors(brand)
  const wordColor = onDark ? '#FFFFFF' : primary
  const accentColor = onDark ? '#8EC0FF' : accent

  if (brand.kind === 'company') {
    const name = escapeHtml(brand.name)
    const logoUrl = brand.logoUrl?.trim()
    if (logoUrl && /^https?:\/\//i.test(logoUrl)) {
      return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="background-color:#ffffff;border-radius:10px;padding:8px 12px;"><img src="${escapeHtml(logoUrl)}" alt="${name}" height="32" style="display:block;height:32px;max-width:180px;width:auto;border:0;outline:none;text-decoration:none;" /></td></tr></table>`
    }
    return `<span style="font-size:20px;line-height:24px;font-weight:700;color:${wordColor};letter-spacing:-0.3px;">${name}</span>`
  }

  return `<span style="font-size:20px;line-height:24px;font-weight:700;letter-spacing:-0.3px;color:${wordColor};">Biz<span style="color:${accentColor};">Flow</span></span>`
}

function brandLocation(brand: EmailBrand): string | null {
  if (brand.kind !== 'company') return null
  const parts = [brand.addressLine, brand.city, brand.country, brand.postalCode]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
  return parts.length ? parts.join(', ') : null
}

function brandContactLine(brand: EmailBrand): string | null {
  if (brand.kind !== 'company') return null
  const parts = [brand.email?.trim(), brand.phone?.trim()].filter(
    (part): part is string => Boolean(part),
  )
  return parts.length ? parts.join(' · ') : null
}

export type BrandedEmailContent = {
  brand: EmailBrand
  title: string
  preheader: string
  eyebrow: string
  headline: string
  greeting: string
  paragraphs: string[]
  details?: EmailDetailRow[]
  ctaLabel: string
  ctaUrl: string
  steps?: EmailStep[]
  noticeTitle?: string
  noticeBody?: string
  noticeTone?: 'neutral' | 'warning'
  footerNote: string
}

function renderDetails(rows: EmailDetailRow[], accent: string): string {
  if (!rows.length) return ''

  const items = rows
    .map((row, index) => {
      const last = index === rows.length - 1
      const border = last ? 'none' : '1px solid #E6EDF5'
      return `<tr>
        <td valign="top" style="padding:11px 0;border-bottom:${border};width:38%;font-size:11px;line-height:16px;letter-spacing:0.08em;text-transform:uppercase;font-weight:700;color:#64748B;">${escapeHtml(row.label)}</td>
        <td valign="top" style="padding:11px 0;border-bottom:${border};font-size:14px;line-height:20px;font-weight:600;color:#0F172A;">${escapeHtml(row.value)}</td>
      </tr>`
    })
    .join('')

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 28px 0;background-color:#F7FAFD;border:1px solid #E6EDF5;border-radius:12px;border-left:4px solid ${accent};">
    <tr>
      <td style="padding:8px 20px 8px 18px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${items}</table>
      </td>
    </tr>
  </table>`
}

function renderSteps(steps: EmailStep[], primary: string, accent: string): string {
  if (!steps.length) return ''

  const items = steps
    .map((step, index) => {
      const n = String(index + 1).padStart(2, '0')
      return `<tr>
        <td valign="top" width="44" style="padding:0 12px 16px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center" valign="middle" width="36" height="36" style="width:36px;height:36px;border-radius:18px;background-color:${primary};">
                <span style="font-size:12px;line-height:36px;font-weight:700;color:#ffffff;">${n}</span>
              </td>
            </tr>
          </table>
        </td>
        <td valign="top" style="padding:0 0 16px 0;">
          <p style="margin:2px 0 4px 0;font-size:14px;line-height:20px;font-weight:700;color:${primary};">${escapeHtml(step.title)}</p>
          <p style="margin:0;font-size:13px;line-height:20px;color:#64748B;">${escapeHtml(step.body)}</p>
        </td>
      </tr>`
    })
    .join('')

  return `<p style="margin:28px 0 14px 0;font-size:11px;line-height:16px;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;color:${accent};">What happens next</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${items}</table>`
}

function renderNotice(
  title: string | undefined,
  body: string | undefined,
  tone: 'neutral' | 'warning' = 'neutral',
): string {
  if (!title && !body) return ''
  const border = tone === 'warning' ? '#F59E0B' : '#94A3B8'
  const background = tone === 'warning' ? '#FFFBEB' : '#F8FAFC'
  const titleColor = tone === 'warning' ? '#92400E' : '#334155'
  const bodyColor = tone === 'warning' ? '#78350F' : '#64748B'

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 0 0;background-color:${background};border:1px solid ${tone === 'warning' ? '#FDE68A' : '#E2E8F0'};border-radius:10px;border-left:4px solid ${border};">
    <tr>
      <td style="padding:14px 16px;">
        ${title ? `<p style="margin:0 0 4px 0;font-size:13px;line-height:18px;font-weight:700;color:${titleColor};">${escapeHtml(title)}</p>` : ''}
        ${body ? `<p style="margin:0;font-size:13px;line-height:20px;color:${bodyColor};">${escapeHtml(body)}</p>` : ''}
      </td>
    </tr>
  </table>`
}

export function renderBrandedEmail(content: BrandedEmailContent): { html: string; text: string } {
  const { primary, accent } = brandColors(content.brand)
  const senderName = brandFromName(content.brand)
  const title = escapeHtml(content.title)
  const preheader = escapeHtml(content.preheader)
  const eyebrow = escapeHtml(content.eyebrow)
  const headline = escapeHtml(content.headline)
  const greeting = escapeHtml(content.greeting)
  const paragraphs = content.paragraphs.map((p) => escapeHtml(p))
  const details = (content.details ?? []).filter((row) => row.value.trim())
  const ctaLabel = escapeHtml(content.ctaLabel)
  const ctaUrl = escapeHtml(content.ctaUrl)
  const steps = content.steps ?? []
  const footerNote = escapeHtml(content.footerNote)
  const year = new Date().getFullYear()
  const location = brandLocation(content.brand)
  const contact = brandContactLine(content.brand)
  const poweredBy =
    content.brand.kind === 'company' ? ` · Powered by ${PLATFORM_BRAND_NAME}` : ''

  const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="x-ua-compatible" content="ie=edge" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#E8EEF4;font-family:'Segoe UI',Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:transparent;opacity:0;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#E8EEF4;margin:0;padding:0;">
    <tr>
      <td align="center" style="padding:32px 16px 40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
          <tr>
            <td style="background-color:${primary};border-radius:16px 16px 0 0;padding:28px 40px;">
              ${headerMark(content.brand, true)}
            </td>
          </tr>
          <tr>
            <td style="height:4px;line-height:4px;font-size:0;background-color:${accent};">&nbsp;</td>
          </tr>
          <tr>
            <td style="background-color:#ffffff;padding:36px 40px 12px 40px;">
              <p style="margin:0 0 8px 0;font-size:11px;line-height:16px;letter-spacing:0.14em;text-transform:uppercase;font-weight:700;color:${accent};">${eyebrow}</p>
              <h1 style="margin:0 0 20px 0;font-size:26px;line-height:34px;font-weight:700;letter-spacing:-0.4px;color:${primary};">${headline}</h1>
              <p style="margin:0 0 14px 0;font-size:16px;line-height:24px;font-weight:700;color:${primary};">${greeting}</p>
              ${paragraphs
                .map(
                  (p) =>
                    `<p style="margin:0 0 14px 0;font-size:15px;line-height:24px;color:#475569;">${p}</p>`,
                )
                .join('')}
              ${renderDetails(details, accent)}
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 20px 0;">
                <tr>
                  <td align="center" bgcolor="${accent}" style="border-radius:10px;background-color:${accent};">
                    <a href="${ctaUrl}" target="_blank" style="display:inline-block;padding:14px 28px;font-size:15px;line-height:20px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;letter-spacing:0.01em;">${ctaLabel}</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 6px 0;font-size:12px;line-height:18px;color:#64748B;">If the button does not work, copy and paste this link into your browser:</p>
              <p style="margin:0;font-size:12px;line-height:18px;word-break:break-all;"><a href="${ctaUrl}" style="color:${accent};text-decoration:underline;">${ctaUrl}</a></p>
              ${renderNotice(content.noticeTitle, content.noticeBody, content.noticeTone)}
              ${renderSteps(steps, primary, accent)}
            </td>
          </tr>
          <tr>
            <td style="background-color:#ffffff;border-radius:0 0 16px 16px;padding:8px 40px 32px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="border-top:1px solid #E6EDF5;padding-top:20px;font-size:12px;line-height:20px;color:#94A3B8;">
                    ${footerNote}<br /><br />
                    &copy; ${year} ${escapeHtml(senderName)}${escapeHtml(poweredBy)}
                    ${location ? `<br />${escapeHtml(location)}` : ''}
                    ${contact ? `<br />${escapeHtml(contact)}` : ''}
                    <br />This is a transactional message related to your ${escapeHtml(PLATFORM_BRAND_NAME)} account. Please do not reply to this email.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  const textLines = [
    content.headline,
    '',
    content.greeting,
    '',
    ...content.paragraphs,
    '',
    ...(details.length
      ? ['Details', ...details.map((row) => `${row.label}: ${row.value}`), '']
      : []),
    `${content.ctaLabel}: ${content.ctaUrl}`,
    '',
    content.noticeTitle ? content.noticeTitle : '',
    content.noticeBody ? content.noticeBody : '',
    '',
    ...(steps.length
      ? [
          'What happens next',
          ...steps.map((step, index) => `${index + 1}. ${step.title} — ${step.body}`),
          '',
        ]
      : []),
    content.footerNote,
    location ?? '',
    contact ?? '',
    content.brand.kind === 'company'
      ? `© ${year} ${senderName} · Powered by ${PLATFORM_BRAND_NAME}`
      : `© ${year} ${senderName}`,
  ].filter((line) => line !== undefined && line !== '')

  return { html, text: textLines.join('\n') }
}
