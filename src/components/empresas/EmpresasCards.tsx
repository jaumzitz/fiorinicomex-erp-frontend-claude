import { Building2, Mail, Phone } from 'lucide-react'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { EmpresaCadastrada } from '@/types/domain'

export function EmpresasCards({
  empresas,
  onSelecionar,
}: {
  empresas: EmpresaCadastrada[]
  onSelecionar: (id: string) => void
}) {
  if (empresas.length === 0) {
    return (
      <div className="text-muted-foreground rounded-lg border py-10 text-center text-sm">
        Nenhuma empresa encontrada.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {empresas.map((e) => (
        <Card
          key={e.id}
          className="cursor-pointer gap-3 py-4 transition-shadow hover:shadow-md"
          onClick={() => onSelecionar(e.id)}
        >
          <CardHeader className="grid-cols-1 gap-1 px-4">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate font-semibold">
                {e.nomeFantasia || 'Sem nome fantasia'}
              </span>
              <Badge variant="secondary" className="shrink-0">
                {e.contatos.length} {e.contatos.length === 1 ? 'contato' : 'contatos'}
              </Badge>
            </div>
            <span className="text-muted-foreground truncate text-sm">{e.razaoSocial}</span>
          </CardHeader>
          <CardContent className="flex flex-col gap-1.5 px-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Building2 className="text-muted-foreground size-3.5 shrink-0" />
              <span className="text-muted-foreground">{e.cnpj}</span>
            </div>
            {e.telefone && (
              <div className="flex items-center gap-1.5">
                <Phone className="text-muted-foreground size-3.5 shrink-0" />
                <span>{e.telefone}</span>
              </div>
            )}
            {e.email && (
              <div className="flex items-center gap-1.5">
                <Mail className="text-muted-foreground size-3.5 shrink-0" />
                <span className="truncate">{e.email}</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
