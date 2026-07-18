import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Lead } from '@/lib/types'
import { getLeadTableRow, leadTableColumns } from '@/lib/lead-table'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeWebsiteUrl(website: string) {
  const trimmed = website.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

export function normalizeInstagramUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed

  const handle = trimmed
    .replace(/^@/, '')
    .replace(/^(www\.)?instagram\.com\//i, '')
    .replace(/\/+$/, '')

  return `https://instagram.com/${handle}`
}

export function normalizeFacebookUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed

  const handle = trimmed
    .replace(/^@/, '')
    .replace(/^(www\.)?facebook\.com\//i, '')
    .replace(/\/+$/, '')

  return `https://facebook.com/${handle}`
}

export function formatSocialHandle(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('@')) return trimmed
  if (/instagram\.com|facebook\.com/i.test(trimmed)) {
    const handle = trimmed
      .replace(/^https?:\/\//i, '')
      .replace(/^(www\.)?(instagram|facebook)\.com\//i, '')
      .replace(/\/+$/, '')
    return handle ? `@${handle}` : trimmed
  }
  return `@${trimmed.replace(/^@/, '')}`
}

export function exportToCSV(leads: Lead[], filename: string) {
  const blob = new Blob([createLeadCsv(leads)], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function createLeadCsv(leads: Lead[]): string {
  const headers = leadTableColumns.map((column) => escapeCsvValue(column.label))
  const rows = leads.map((lead) => {
    const row = getLeadTableRow(lead)
    return leadTableColumns.map((column) => escapeCsvValue(row[column.key])).join(CSV_SEPARATOR)
  })

  return `${UTF8_BOM}${headers.join(CSV_SEPARATOR)}\r\n${rows.join('\r\n')}`
}

function escapeCsvValue(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

const UTF8_BOM = '\uFEFF'
const CSV_SEPARATOR = ';'
