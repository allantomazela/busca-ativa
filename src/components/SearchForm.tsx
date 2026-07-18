import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { searchFormSchema, type SearchFormValues } from '@/lib/schemas'
import { Search, MapPin, Loader2, AlertCircle } from 'lucide-react'

interface SearchFormProps {
  onSearch: (keyword: string, location: string) => Promise<void>
  isLoading: boolean
  error?: string | null
  onClearError?: () => void
}

export function SearchForm({ onSearch, isLoading, error, onClearError }: SearchFormProps) {
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: { keyword: '', location: '' },
    mode: 'onSubmit',
  })

  const handleSubmit = async (values: SearchFormValues) => {
    onClearError?.()
    await onSearch(values.keyword, values.location)
  }

  return (
    <Card className="relative overflow-hidden border-primary/15 shadow-sm">
      <div className="brand-gradient absolute inset-x-0 top-0 h-1" />
      <CardContent className="p-5 sm:p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="keyword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-1.5">
                      <Search className="h-3.5 w-3.5 text-primary" />
                      Termo de Busca
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: padaria, restaurante, clínica..."
                        disabled={isLoading}
                        className="h-11"
                        autoFocus
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-brand-orange" />
                      Localização
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: São Paulo, SP"
                        disabled={isLoading}
                        className="h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg p-3 animate-fade-in-up">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="h-11 w-full px-8 text-base font-semibold shadow-md shadow-primary/20 transition-transform hover:-translate-y-0.5 sm:w-auto"
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
        </Form>
      </CardContent>
    </Card>
  )
}
