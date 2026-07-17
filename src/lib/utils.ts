import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function exportToCSV(leads: any[], filename: string) {
  const BOM = '\uFEFF'
  const headers = [
    'Nome',
    'Endereço',
    'Telefone',
    'Site',
    'Avaliação',
    'Total de Avaliações',
    'Latitude',
    'Longitude',
    'Aberto Agora',
  ]

  const rows = leads.map((lead) => {
    return [
      `"${lead.name?.replace(/"/g, '""') || ''}"`,
      `"${lead.formatted_address?.replace(/"/g, '""') || ''}"`,
      `"${lead.phone_number || ''}"`,
      `"${lead.website || ''}"`,
      lead.rating || 0,
      lead.user_ratings_total || 0,
      lead.latitude || '',
      lead.longitude || '',
      lead.is_open ? 'Sim' : 'Não',
    ].join(',')
  })

  const csvContent = BOM + headers.join(',') + '\n' + rows.join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
