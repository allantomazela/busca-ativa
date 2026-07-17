import { Lead } from '@/lib/types'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Star, Phone, Globe, MapPin, Clock, Navigation, Users, Building2 } from 'lucide-react'

interface LeadDetailsSheetProps {
  lead: Lead | null
  isOpen: boolean
  onClose: () => void
}

export function LeadDetailsSheet({ lead, isOpen, onClose }: LeadDetailsSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        {lead && (
          <>
            <SheetHeader>
              <SheetTitle className="text-xl flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                {lead.name}
              </SheetTitle>
              <SheetDescription className="sr-only">Detalhes do lead</SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-5">
              <div className="flex flex-wrap gap-2">
                {lead.is_open ? (
                  <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20">
                    Aberto Agora
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-500/20">
                    Fechado
                  </Badge>
                )}
                {lead.rating > 0 && (
                  <Badge variant="outline" className="gap-1">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    {lead.rating.toFixed(1)}
                  </Badge>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-muted p-2 rounded-lg shrink-0">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground mb-0.5">
                      Endereço Completo
                    </p>
                    <p className="text-sm break-words">{lead.formatted_address}</p>
                  </div>
                </div>

                {lead.phone_number && (
                  <div className="flex items-start gap-3">
                    <div className="bg-muted p-2 rounded-lg shrink-0">
                      <Phone className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-0.5">Telefone</p>
                      <a
                        href={`tel:${lead.phone_number}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {lead.phone_number}
                      </a>
                    </div>
                  </div>
                )}

                {lead.website && (
                  <div className="flex items-start gap-3">
                    <div className="bg-muted p-2 rounded-lg shrink-0">
                      <Globe className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-muted-foreground mb-0.5">Website</p>
                      <a
                        href={`https://${lead.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline break-all"
                      >
                        {lead.website}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="bg-muted p-2 rounded-lg shrink-0">
                    <Users className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-0.5">Avaliações</p>
                    <p className="text-sm">{lead.user_ratings_total} avaliações no Google</p>
                  </div>
                </div>

                {lead.opening_hours && lead.opening_hours.length > 0 && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <div className="bg-muted p-2 rounded-lg shrink-0">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Horário de Funcionamento
                        </p>
                        <div className="space-y-0.5">
                          {lead.opening_hours.map((hours, idx) => (
                            <p key={idx} className="text-sm">
                              {hours}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <div className="flex items-start gap-3">
                  <div className="bg-muted p-2 rounded-lg shrink-0">
                    <Navigation className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-0.5">Coordenadas</p>
                    <p className="text-sm font-mono text-muted-foreground">
                      {lead.latitude.toFixed(6)}, {lead.longitude.toFixed(6)}
                    </p>
                    <a
                      href={`https://www.google.com/maps?q=${lead.latitude},${lead.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline mt-1 inline-block"
                    >
                      Ver no Google Maps →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
