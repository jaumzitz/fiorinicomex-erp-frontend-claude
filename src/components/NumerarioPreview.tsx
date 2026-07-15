import { Package } from 'lucide-react'

import { Separator } from '@/components/ui/separator'
import { getCliente } from '@/lib/domain-queries'
import type { ProcessoImportacao } from '@/types/domain'

function formatMoeda(valor: number) {
  if (valor === 0) return '—'
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function NumerarioPreview({ processo }: { processo: ProcessoImportacao }) {
  const numerario = processo.numerario
  if (!numerario) return null

  const cliente = getCliente(processo.clienteId)
  const total = numerario.tributos.reduce((soma, item) => soma + item.valor, 0)

  return (
    <div className="rounded-md border bg-white p-6 text-sm text-neutral-900">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-md">
            <Package className="size-5" />
          </div>
          <div>
            <div className="font-semibold">Fiorini Comex</div>
            <div className="text-muted-foreground text-xs">
              conectando você ao mundo
            </div>
          </div>
        </div>
        <div className="text-right text-xs text-neutral-600">
          <div className="font-medium">FIORINI COMERCIO EXTERIOR LTDA</div>
          <div>Itajaí — SC</div>
        </div>
      </div>

      <h2 className="mt-4 text-center text-base font-semibold tracking-wide">
        NUMERÁRIO — {processo.numero}
      </h2>

      <Separator className="my-4" />

      <div className="bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white uppercase">
        Informações do processo
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 border border-t-0 p-3">
        <div>
          <span className="text-muted-foreground">Cliente: </span>
          {cliente?.nome}
        </div>
        <div>
          <span className="text-muted-foreground">Produto: </span>
          {numerario.produto}
        </div>
        <div>
          <span className="text-muted-foreground">Invoice: </span>
          {numerario.invoice}
        </div>
        <div>
          <span className="text-muted-foreground">Exportador: </span>
          {numerario.exportador}
        </div>
        <div>
          <span className="text-muted-foreground">Cotação moeda: </span>
          {numerario.cotacaoMoeda.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })}
        </div>
      </div>

      <div className="mt-4 bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white uppercase">
        Tributos / Despesas
      </div>
      <div className="border border-t-0">
        {numerario.tributos.map((item) => (
          <div
            key={item.descricao}
            className="flex items-center justify-between border-b px-3 py-1.5 last:border-b-0"
          >
            <span>{item.descricao}</span>
            <span>{formatMoeda(item.valor)}</span>
          </div>
        ))}
      </div>

      <div className="mt-2 flex items-center justify-between border-2 border-neutral-900 px-3 py-2 font-semibold">
        <span>TOTAL SOLICITADO</span>
        <span>
          {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>
      </div>

      <div className="mt-5 flex items-center justify-between text-xs">
        <div>
          <div className="font-semibold">Dados Bancários:</div>
          <div>{numerario.dadosBancarios.banco}</div>
          <div>Ag: {numerario.dadosBancarios.agencia}</div>
          <div>Conta: {numerario.dadosBancarios.conta}</div>
          <div>PIX: {numerario.dadosBancarios.pix}</div>
        </div>
        <div className="text-right">
          <div className="font-semibold italic">Fiorini Comercio Exterior Ltda</div>
        </div>
      </div>
    </div>
  )
}
