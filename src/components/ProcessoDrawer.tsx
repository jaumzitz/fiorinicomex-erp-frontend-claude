import { useState } from 'react'
import { Paperclip, MessageSquare, FileText } from 'lucide-react'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { StatusBadge } from '@/components/StatusBadge'
import { NumerarioPreview } from '@/components/NumerarioPreview'
import { getCliente } from '@/lib/domain-queries'
import { fornecedoresFrete } from '@/data/mock-data'
import { MODAL_LABELS, type ProcessoImportacao } from '@/types/domain'

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="text-sm">{value ?? '—'}</span>
    </div>
  )
}

export function ProcessoDrawer({
  processo,
  open,
  onOpenChange,
}: {
  processo: ProcessoImportacao | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [numerarioAberto, setNumerarioAberto] = useState(false)

  if (!processo) return null

  const cliente = getCliente(processo.clienteId)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <SheetTitle className="text-lg">{processo.numero}</SheetTitle>
            <StatusBadge status={processo.status} />
          </div>
          <SheetDescription>{cliente?.nome}</SheetDescription>
          {processo.numerario && (
            <Button
              size="sm"
              variant="outline"
              className="mt-1 w-fit"
              onClick={() => setNumerarioAberto(true)}
            >
              <FileText className="size-4" />
              Ver Numerário
            </Button>
          )}
        </SheetHeader>

        {processo.numerario && (
          <Dialog open={numerarioAberto} onOpenChange={setNumerarioAberto}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Numerário — {processo.numero}</DialogTitle>
                <DialogDescription>
                  Prévia do documento enviado ao cliente
                  {processo.numerarioEnviadoEm
                    ? ` em ${processo.numerarioEnviadoEm}`
                    : ''}
                  .
                </DialogDescription>
              </DialogHeader>
              <NumerarioPreview processo={processo} />
            </DialogContent>
          </Dialog>
        )}

        <Separator />

        <div className="grid grid-cols-2 gap-x-4 gap-y-4 px-5 py-5">
          <Field label="Cliente" value={cliente?.nome} />
          <Field label="CNPJ" value={cliente?.cnpj} />
          <Field label="Modal" value={MODAL_LABELS[processo.modal]} />
          <Field label="Porto de destino" value={processo.portoDestino} />
          <Field label="Previsão de embarque" value={processo.previsaoEmbarque} />
          <Field label="Previsão de chegada" value={processo.previsaoChegada} />
          <Field label="Data de chegada" value={processo.dataChegada} />
          <Field label="Numerário enviado em" value={processo.numerarioEnviadoEm} />
          <Field label="Numerário pago em" value={processo.numerarioPagoEm} />
        </div>

        {(processo.fornecedoresCotadosIds?.length ?? 0) > 0 && (
          <>
            <Separator />
            <div className="flex flex-col gap-2 px-5 py-5">
              <span className="text-sm font-medium">Frete internacional</span>
              <div className="flex flex-wrap gap-2">
                {processo.fornecedoresCotadosIds!.map((id) => {
                  const f = fornecedoresFrete.find((f) => f.id === id)
                  const aceito = id === processo.fornecedorFreteId
                  return (
                    <Badge key={id} variant={aceito ? 'default' : 'outline'}>
                      {f?.nome}
                      {aceito ? ' · Aceito' : ''}
                    </Badge>
                  )
                })}
              </div>
            </div>
          </>
        )}

        <Separator />

        <div className="flex flex-col gap-3 px-5 py-5">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Paperclip className="size-4" />
            Anexos
            <Badge variant="secondary">{processo.anexos.length}</Badge>
          </div>
          {processo.anexos.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhum anexo.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {processo.anexos.map((a) => (
                <li key={a.id} className="flex items-center justify-between text-sm">
                  <span>{a.nomeArquivo}</span>
                  <span className="text-muted-foreground text-xs">
                    {(a.tamanhoBytes / 1024).toFixed(0)} KB
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Separator />

        <div className="flex flex-col gap-3 px-5 py-5">
          <div className="flex items-center gap-2 text-sm font-medium">
            <MessageSquare className="size-4" />
            Comentários
            <Badge variant="secondary">{processo.comentarios.length}</Badge>
          </div>
          {processo.comentarios.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhum comentário.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {processo.comentarios.map((c) => (
                <li key={c.id} className="flex flex-col gap-1 rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{c.autor}</span>
                    <div className="flex items-center gap-2">
                      {c.visivelNoPortal && (
                        <Badge variant="outline" className="text-xs">
                          Visível no portal
                        </Badge>
                      )}
                      <span className="text-muted-foreground text-xs">
                        {c.criadoEm}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm">{c.texto}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
