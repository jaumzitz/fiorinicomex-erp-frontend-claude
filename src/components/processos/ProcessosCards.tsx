import { Calendar } from 'lucide-react'

import { StatusBadge } from '@/components/StatusBadge'
import { ModalIcon } from '@/components/ModalIcon'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { getCliente, getEmpresa } from '@/lib/domain-queries'
import { formatarData } from '@/lib/date'
import { MODAL_LABELS, type ProcessoImportacao } from '@/types/domain'

export function ProcessosCards({
  processos,
  onSelecionar,
}: {
  processos: ProcessoImportacao[]
  onSelecionar: (id: string) => void
}) {
  if (processos.length === 0) {
    return (
      <div className="text-muted-foreground rounded-lg border py-10 text-center text-sm">
        Nenhum processo encontrado com os filtros atuais.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {processos.map((p) => {
        const cliente = getCliente(p.clienteId)
        const exportador = p.exportadorId ? getEmpresa(p.exportadorId) : undefined
        return (
          <Card
            key={p.id}
            className="cursor-pointer gap-3 py-4 transition-shadow hover:shadow-md"
            onClick={() => onSelecionar(p.id)}
          >
            <CardHeader className="grid-cols-1 gap-1 px-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{p.numero}</span>
                <StatusBadge status={p.status} />
              </div>
              <span className="text-muted-foreground truncate text-sm">{cliente?.nomeFantasia}</span>
            </CardHeader>
            <CardContent className="flex flex-col gap-1.5 px-4 text-sm">
              <div className="flex items-center gap-1.5">
                <ModalIcon modal={p.modal} className="text-muted-foreground size-3.5 shrink-0" />
                <span>{MODAL_LABELS[p.modal]}</span>
                {exportador && (
                  <span className="text-muted-foreground truncate">— {exportador.nomeFantasia}</span>
                )}
              </div>
              {(p.previsaoEmbarque || p.previsaoChegada) && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="text-muted-foreground size-3.5 shrink-0" />
                  <span className="text-muted-foreground">
                    {p.previsaoEmbarque && `Embarque ${formatarData(p.previsaoEmbarque)}`}
                    {p.previsaoEmbarque && p.previsaoChegada && ' · '}
                    {p.previsaoChegada && `Chegada ${formatarData(p.previsaoChegada)}`}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
