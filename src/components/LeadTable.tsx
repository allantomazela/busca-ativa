import { Lead } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getLeadTableRow, type LeadTableRow } from '@/lib/lead-table'
import {
  formatSocialHandle,
  normalizeFacebookUrl,
  normalizeInstagramUrl,
  normalizeWebsiteUrl,
} from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Star,
  Phone,
  Globe,
  MapPin,
  Eye,
  CheckCircle2,
  XCircle,
  AtSign,
  Share2,
} from 'lucide-react'

interface LeadTableProps {
  leads: Lead[]
  onViewDetails: (lead: Lead) => void
}

const desktopColumns = ['Empresa', 'Localização', 'Contato', 'Redes e site', 'Avaliação'] as const

export function LeadTable({ leads, onViewDetails }: LeadTableProps) {
  if (leads.length === 0) return null

  return (
    <div className="hidden overflow-x-auto rounded-lg border border-border/60 bg-card shadow-sm md:block">
      <Table className="min-w-[920px]">
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            {desktopColumns.map((label) => (
              <TableHead
                key={label}
                className="whitespace-nowrap text-xs font-semibold uppercase tracking-wider"
              >
                {label}
              </TableHead>
            ))}
            <TableHead className="w-[60px]">
              <span className="sr-only">Ações</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => {
            const row = getLeadTableRow(lead)

            return (
              <TableRow key={lead.id} className="align-top transition-colors hover:bg-muted/30">
                <TableCell className="max-w-[280px] py-4">
                  <p className="font-medium leading-snug">{row.name}</p>
                  <p className="mt-1 flex items-start gap-1.5 text-xs leading-snug text-muted-foreground">
                    <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                    <span className="line-clamp-2">{row.address}</span>
                  </p>
                </TableCell>
                <TableCell className="whitespace-nowrap py-4">
                  <p className="text-sm">{row.city || '—'}</p>
                  {row.state && (
                    <Badge variant="secondary" className="mt-1 px-1.5 py-0 text-[11px]">
                      {row.state}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap py-4">
                  {row.phone ? (
                    <span className="flex items-center gap-1.5 text-sm">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-brand-pink" />
                      {row.phone}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="py-4">
                  <SocialLinks row={row} />
                </TableCell>
                <TableCell className="whitespace-nowrap py-4">
                  {lead.rating > 0 ? (
                    <span className="flex items-center gap-1 text-sm font-medium">
                      <Star className="h-3.5 w-3.5 fill-brand-yellow text-brand-orange" />
                      {row.rating}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">{row.rating}</span>
                  )}
                  <div className="mt-1.5">
                    <StatusBadge isOpen={lead.is_open} />
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(lead)}
                    className="h-8 w-8 p-0"
                    aria-label={`Ver detalhes de ${lead.name}`}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

function SocialLinks({ row }: { row: LeadTableRow }) {
  const hasAny = row.website || row.instagram || row.facebook
  if (!hasAny) return <span className="text-sm text-muted-foreground">—</span>

  return (
    <div className="flex flex-col gap-1">
      {row.website && (
        <a
          href={normalizeWebsiteUrl(row.website)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <Globe className="h-3.5 w-3.5 shrink-0" />
          Website
        </a>
      )}
      {row.instagram && (
        <a
          href={normalizeInstagramUrl(row.instagram)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex max-w-[180px] items-center gap-1.5 text-sm text-brand-pink hover:underline"
        >
          <AtSign className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{formatSocialHandle(row.instagram)}</span>
        </a>
      )}
      {row.facebook && (
        <a
          href={normalizeFacebookUrl(row.facebook)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex max-w-[180px] items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <Share2 className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{formatSocialHandle(row.facebook)}</span>
        </a>
      )}
    </div>
  )
}

export function LeadCardsMobile({ leads, onViewDetails }: LeadTableProps) {
  if (leads.length === 0) return null

  return (
    <div className="space-y-3 md:hidden">
      {leads.map((lead) => {
        const row = getLeadTableRow(lead)

        return (
          <div
            key={lead.id}
            className="rounded-lg border border-border/60 bg-card p-4 shadow-sm transition-transform active:scale-[0.99]"
            onClick={() => onViewDetails(lead)}
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold leading-tight">{row.name}</h3>
              <StatusBadge isOpen={lead.is_open} />
            </div>
            <div className="mb-2 flex items-start gap-1.5 text-xs text-muted-foreground">
              <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
              <span>{row.address}</span>
            </div>
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge variant="secondary">{row.city || 'Cidade não informada'}</Badge>
              <Badge variant="outline">{row.state || 'UF não informada'}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              {row.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3 text-brand-pink" />
                  {row.phone}
                </span>
              )}
              {lead.rating > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-brand-yellow text-brand-orange" />
                  {row.rating}
                </span>
              )}
              {row.website && (
                <span className="flex items-center gap-1 text-primary">
                  <Globe className="h-3 w-3" />
                  Website
                </span>
              )}
              {row.instagram && (
                <span className="flex items-center gap-1 text-brand-pink">
                  <AtSign className="h-3 w-3" />
                  IG
                </span>
              )}
              {row.facebook && (
                <span className="flex items-center gap-1 text-primary">
                  <Share2 className="h-3 w-3" />
                  FB
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function StatusBadge({ isOpen }: { isOpen: boolean }) {
  return isOpen ? (
    <Badge
      variant="outline"
      className="shrink-0 gap-1 border-emerald-500/20 bg-emerald-500/10 text-emerald-700"
    >
      <CheckCircle2 className="h-3 w-3" /> Aberto
    </Badge>
  ) : (
    <Badge
      variant="outline"
      className="shrink-0 gap-1 border-red-500/20 bg-red-500/10 text-red-700"
    >
      <XCircle className="h-3 w-3" /> Fechado
    </Badge>
  )
}
