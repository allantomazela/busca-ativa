import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Search, MapPin, Loader2, AlertCircle } from 'lucide-react'

interface SearchFormProps {
  onSearch: (keyword: string, location: string) => Promise<void>
  isLoading: boolean
  error?: string | null
  onClearError?: () => void
}

export function SearchForm({ onSearch, isLoading, error, onClearError }: SearchFormProps) {
  const [keyword, setKeyword] = useState('')
  const [location, setLocation] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!keyword.trim()) return
    onClearError?.()
    await onSearch(keyword.trim(), location.trim())
  }

  return (
    <Card className="shadow-sm border-border/60">
      <CardContent className="p-5 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="keyword" className="text-sm font-medium flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-muted-foreground" />
                Termo de Busca
              </Label>
              <Input
                id="keyword"
                placeholder="Ex: padaria, restaurante, clínica..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                disabled={isLoading}
                className="h-11"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                Localização
              </Label>
              <Input
                id="location"
                placeholder="Ex: São Paulo, SP"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={isLoading}
                className="h-11"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg p-3 animate-fade-in-up">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading || !keyword.trim()}
            className="w-full sm:w-auto h-11 px-8 text-base font-medium"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Buscar
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
