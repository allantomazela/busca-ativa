import { Lead } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Star, Phone, Globe, MapPin, Eye, CheckCircle2, XCircle } from 'lucide-react'

interface LeadTableProps {
  leads: Lead[]
  onViewDetails: (lead: Lead) => void
}

export function LeadTable({ leads, onViewDetails }: LeadTableProps) {
  if (leads.length === 0) return null

  return (
    <div className="hidden md:block rounded-lg border border-border/60 bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-semibold text-xs uppercase tracking-wider">Nome</TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wider">
              Endereço
            </TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wider">
              Telefone
            </TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wider">
              Avaliação
            </TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wider">Status</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id} className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-medium max-w-[200px]">
                <div className="flex items-center gap-2">
                  {lead.website && <Globe className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                  <span className="truncate">{lead.name}</span>
                </div>
              </TableCell>
              <TableCell className="max-w-[220px]">
                <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span className="truncate">{lead.formatted_address}</span>
                </div>
              </TableCell>
              <TableCell>
                {lead.phone_number ? (
                  <span className="flex items-center gap-1.5 text-sm">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    {lead.phone_number}
                  </span>
                ) : (
                  <span className="text-muted-foreground text-sm">—</span>
                )}
              </TableCell>
              <TableCell>
                {lead.rating > 0 ? (
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="font-medium text-sm">{lead.rating.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">
                      ({lead.user_ratings_total})
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">—</span>
                )}
              </TableCell>
              <TableCell>
                {lead.is_open ? (
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" /> Aberto
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-red-500/10 text-red-700 border-red-500/20 gap-1"
                  >
                    <XCircle className="w-3 h-3" /> Fechado
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(lead)}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function LeadCardsMobile({ leads, onViewDetails }: LeadTableProps) {
  if (leads.length === 0) return null

  return (
    <div className="md:hidden space-y-3">
      {leads.map((lead) => (
        <div
          key={lead.id}
          className="rounded-lg border border-border/60 bg-card p-4 shadow-sm active:scale-[0.99] transition-transform"
          onClick={() => onViewDetails(lead)}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-sm leading-tight">{lead.name}</h3>
            {lead.is_open ? (
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 shrink-0"
              >
                Aberto
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-red-500/10 text-red-700 border-red-500/20 shrink-0"
              >
                Fechado
              </Badge>
            )}
          </div>
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground mb-2">
            <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
            <span>{lead.formatted_address}</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            {lead.phone_number && (
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-emerald-600" />
                {lead.phone_number}
              </span>
            )}
            {lead.rating > 0 && (
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                {lead.rating.toFixed(1)} ({lead.user_ratings_total})
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
