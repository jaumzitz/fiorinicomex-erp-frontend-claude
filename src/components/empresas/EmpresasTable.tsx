import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { TIPO_RELACIONAMENTO_EMPRESA_LABELS, type Empresa } from '@/types/domain'

export function EmpresasTable({
  empresas,
  onSelecionar,
}: {
  empresas: Empresa[]
  onSelecionar: (id: string) => void
}) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome fantasia</TableHead>
            <TableHead>Razão social</TableHead>
            <TableHead>Tipo de relacionamento</TableHead>
            <TableHead>CNPJ / Tax ID</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Contatos</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {empresas.map((e) => (
            <TableRow key={e.id} className="cursor-pointer" onClick={() => onSelecionar(e.id)}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {e.nomeFantasia || '—'}
                  {!e.ativo && (
                    <Badge variant="outline" className="text-xs font-normal">
                      Inativa
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>{e.razaoSocial}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {e.tiposRelacionamento.map((tipo) => (
                    <Badge key={tipo} variant="outline" className="text-xs font-normal">
                      {TIPO_RELACIONAMENTO_EMPRESA_LABELS[tipo]}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                {e.estrangeira ? [e.taxId, e.pais].filter(Boolean).join(' — ') || '—' : e.cnpj || '—'}
              </TableCell>
              <TableCell>{e.telefone || '—'}</TableCell>
              <TableCell>{e.email || '—'}</TableCell>
              <TableCell className="text-muted-foreground">
                {e.contatos.filter((c) => c.ativo).length}
              </TableCell>
            </TableRow>
          ))}
          {empresas.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-muted-foreground py-10 text-center">
                Nenhuma empresa encontrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
