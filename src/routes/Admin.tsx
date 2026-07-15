import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { fornecedoresFrete } from '@/data/mock-data'

export default function Admin() {
  return (
    <div>
      <PageHeader
        title="Administração"
        description="Dados da empresa, usuários e fornecedores"
      />

      <div className="flex flex-col gap-6 px-8 py-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Empresa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid max-w-lg grid-cols-1 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nome-empresa">Nome</Label>
                <Input id="nome-empresa" defaultValue="Fiorini Comex" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cnpj-empresa">CNPJ</Label>
                <Input id="cnpj-empresa" placeholder="00.000.000/0001-00" />
              </div>
              <div>
                <Button size="sm">Salvar alterações</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fornecedores de frete</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>E-mail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fornecedoresFrete.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.nome}</TableCell>
                    <TableCell>{f.contato}</TableCell>
                    <TableCell>{f.email}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Operação de um único usuário administrativo — gestão de múltiplos
              usuários fica para quando fizer sentido para a operação.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
