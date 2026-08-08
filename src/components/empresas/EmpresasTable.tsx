import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { EmpresaCadastrada } from '@/types/domain'

export function EmpresasTable({
  empresas,
  onSelecionar,
}: {
  empresas: EmpresaCadastrada[]
  onSelecionar: (id: string) => void
}) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome fantasia</TableHead>
            <TableHead>Razão social</TableHead>
            <TableHead>CNPJ</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Contatos</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {empresas.map((e) => (
            <TableRow key={e.id} className="cursor-pointer" onClick={() => onSelecionar(e.id)}>
              <TableCell className="font-medium">{e.nomeFantasia || '—'}</TableCell>
              <TableCell>{e.razaoSocial}</TableCell>
              <TableCell>{e.cnpj}</TableCell>
              <TableCell>{e.telefone || '—'}</TableCell>
              <TableCell>{e.email || '—'}</TableCell>
              <TableCell className="text-muted-foreground">{e.contatos.length}</TableCell>
            </TableRow>
          ))}
          {empresas.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-muted-foreground py-10 text-center">
                Nenhuma empresa encontrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
