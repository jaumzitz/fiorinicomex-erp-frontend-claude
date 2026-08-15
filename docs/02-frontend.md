# Front-end (Fase 1)

## Stack

- **React 19** + **Vite** + **TypeScript**, **Tailwind CSS v4**.
- Componentes de UI no estilo shadcn/ui, mas **escritos à mão** em
  `src/components/ui/` (não instalados via CLI shadcn — houve um bug de
  `EPERM` do CLI escaneando pastas especiais do Windows/OneDrive, então os
  componentes primitivos foram copiados/adaptados diretamente do padrão
  shadcn, sobre primitivas Radix UI).
- **React Router** para navegação entre telas.
- **React Context + `useState`** para estado da aplicação — não há Redux nem
  outra lib de state management. Cada domínio principal tem seu próprio
  Context Provider (ver "Estado" abaixo).
- Ícones: `lucide-react`.
- Sem framework de testes configurado ainda.

## Estrutura de pastas

```
src/
  components/
    ui/            # primitivas estilo shadcn (button, input, select, sheet, dialog, table, ...)
    layout/         # AppLayout, Sidebar, MobileTopBar, PageHeader
    processos/      # tabela/cards/kanban de PIs + configuração de colunas
    empresas/       # tabela/cards/drawer de empresas cadastradas
    ProcessoDrawer.tsx    # o drawer de detalhe do PI — o componente mais complexo do app
    SecaoDrawer.tsx       # seção colapsável reutilizável dentro do drawer
    NumerarioPreview.tsx  # prévia HTML do numerário (documento a ser gerado em PDF no back-end)
    EditableField.tsx     # input com label, usado nos campos do drawer
    StatusBadge.tsx / ModalIcon.tsx  # badges/ícones por enum
  data/
    mock-data.ts    # todos os dados iniciais (seed) — substitui o banco na Fase 1
  hooks/
    use-media-query.ts
  lib/
    date.ts             # formatação de datas
    domain-queries.ts    # consultas derivadas (contagens, próximos embarques, etc.) — candidatas a virar queries SQL/RPC
    utils.ts             # cn() (clsx + tailwind-merge)
  routes/
    Welcome.tsx, ProcessosImportacao.tsx, EmpresasCadastro.tsx, BI.tsx, Admin.tsx
  store/
    ProcessosContext.tsx           # estado de processos (PIs) + todas as mutações
    EmpresasCadastradasContext.tsx # estado de empresas cadastradas + mutações
    EmpresaConfigContext.tsx       # perfil da própria Fiorini (linha única)
    TributosCatalogoContext.tsx    # catálogo compartilhado de tributos/despesas
  types/
    domain.ts       # única fonte de verdade do modelo de domínio (ver 03-modelo-dominio.md)
```

## Rotas

| Caminho | Tela | Descrição |
|---|---|---|
| `/` | Welcome | Dashboard com KPIs (processos ativos, numerários pendentes, embarques/chegadas) |
| `/processos` | ProcessosImportacao | Tela principal — tabela/cards/kanban de PIs, drawer de detalhe |
| `/empresas` | EmpresasCadastro | CRUD de empresas (clientes, exportadores, fornecedores, etc.) |
| `/bi` | BI | Indicadores: processos por estágio, por cliente, próximos embarques/chegadas |
| `/admin` | Admin | Perfil da empresa (Fiorini), dados bancários, identidade visual, catálogo de tributos, usuários |

## Estado (Context providers, aninhados em `App.tsx`)

```
EmpresaConfigProvider
  ProcessosProvider
    EmpresasCadastradasProvider
      TributosCatalogoProvider
        <Routes>
```

Cada provider guarda um array (ou objeto) em memória via `useState`,
inicializado a partir de `src/data/mock-data.ts`, e expõe funções de mutação
que fazem `setState` com um novo array (nunca mutam in-place). **Nada é
persistido** — um F5 na página descarta qualquer alteração feita na sessão.
Isso é o gap que o back-end precisa fechar: cada função de mutação do
Context (`atualizarProcesso`, `adicionarComentario`, `criarEmpresa`, etc.)
deve virar uma chamada de API/Supabase, mantendo a mesma assinatura onde
fizer sentido para minimizar mudança nos componentes de UI.

### Gap conhecido: duas fontes de verdade para `Empresa` (parcialmente resolvido 2026-08-15)

`EmpresasCadastradasContext` mantém seu próprio array de `Empresa[]`, e
`src/lib/domain-queries.ts` (`getEmpresa`, `getCliente`) ainda importa
`empresas` diretamente de `src/data/mock-data.ts` (o array estático
original), não do Context — usado em `colunas.ts`, `ProcessosCards.tsx`,
`Welcome.tsx`, `BI.tsx`, `NumerarioPreview.tsx` (só para o cliente do
config). **`ProcessoDrawer.tsx` foi corrigido para usar
`useEmpresasCadastradas()`** (estado vivo) em vez do import estático — é o
ponto onde isso mais importava, porque é onde o seletor de Exportador cria
empresas novas automaticamente (ver `03-modelo-dominio.md`) e precisa
enxergar essa criação imediatamente na mesma sessão. `NumerarioPreview.tsx`
também foi corrigido para resolver `exportadorId` via o Context, já que é
aberto a partir do mesmo drawer. Os demais consumidores de
`domain-queries.ts` (`colunas.ts`, `ProcessosCards.tsx`, `Welcome.tsx`,
`BI.tsx`) continuam lendo o array estático — uma empresa criada na sessão
pode não aparecer ali até recarregar a página. Isso desaparece por completo
ao migrar para uma única tabela `empresas` no banco, consultada da mesma
forma em toda a app.

## Padrões de UI que valem a pena conhecer

- **`localStorage`** é usado para persistir *preferências de interface* (não
  dados de negócio): colunas visíveis da tabela de PIs
  (`fiorini-comex:colunas-processos`), modo de visualização (tabela/cards/kanban,
  `fiorini-comex:visualizacao-processos`). Esse padrão deve continuar mesmo
  depois do back-end existir — são preferências client-side, não pertencem
  ao banco.
- **Abas do drawer do PI**: Processo, Financeiro, Digitação de DI (placeholder,
  "em construção"), Anexos, Comentários. Cada aba reseta para o estado padrão
  ao trocar de PI (não fica "lembrando" qual aba/seção estava aberta de um
  PI para outro).
- **Combobox reutilizável** (`ComboBoxTexto` dentro de `ProcessoDrawer.tsx`):
  input de texto livre com sugestões filtráveis vindas de uma lista, usado
  tanto para o catálogo de tributos quanto para o campo Exportador. Os dois
  casos resolvem "criar item novo" de formas diferentes: tributos usa a prop
  `permitirNovo` + `aoCriarNovo` do próprio componente (mostra um item
  "Adicionar 'X'" explícito no dropdown); Exportador não usa `permitirNovo` —
  em vez disso, o `onChange` passado pelo pai (`selecionarExportador`) faz a
  resolução: procura uma `Empresa` existente com `tiposRelacionamento`
  incluindo `exportador` e mesmo `nomeFantasia` (case-insensitive) e, se não
  achar, chama `criarEmpresa(...)` automaticamente antes de gravar
  `exportadorId` no PI (resolvido 2026-08-15).
- **Soft delete via `ativo`**: o catálogo de tributos, comentários, contatos
  de empresa e empresas nunca são excluídos de verdade, só alternam
  `ativo: true/false` — os itens somem das sugestões/listagens padrão mas
  ficam preservados para não quebrar referências existentes (numerários que
  citam um tributo do catálogo, PIs que apontam para uma empresa inativada,
  etc.). Esse é o padrão a replicar no banco (coluna `ativo`, sem `DELETE`).
- **Números de PI**: gerados client-side como `PI-{maior número atual + 1}`
  (`proximoNumero()` em `ProcessosContext.tsx`). Em produção com múltiplas
  escritas concorrentes isso precisa virar uma sequence/lock no banco para
  evitar colisão — hoje funciona porque só existe uma sessão de um usuário
  por vez.
- **IDs client-side**: `crypto.randomUUID()` é usado para gerar IDs de tudo
  que é criado na sessão (comentários, anexos, PIs, empresas, contatos). Ao
  ligar no banco, o ideal é deixar o Postgres gerar o `uuid` (`gen_random_uuid()`)
  e o front usar o ID retornado pelo insert, não mais gerar client-side.

## O que falta para a Fase 2 (back-end)

1. Provisionar Supabase (auth, storage, Postgres) — ver [04-schema-banco.md](04-schema-banco.md).
2. Trocar os quatro Context providers de `useState` para buscar/gravar via
   Supabase client (ou uma camada de API própria), mantendo os nomes de
   campo em português já usados no front.
3. Resolver o gap de "duas fontes de verdade para Empresa" citado acima —
   deve resolver-se sozinho ao consultar a mesma tabela `empresas` em toda a
   aplicação.
4. Implementar upload real de anexos (Supabase Storage) — hoje é só uma
   `URL.createObjectURL()` local, que não sobrevive a um reload.
5. Geração do Numerário em PDF (hoje só existe a prévia em HTML/tela).
6. Autenticação (o app não tem login nenhum hoje — é uma SPA totalmente
   aberta, pensada para uso local/pessoal na Fase 1).
7. Portal do cliente (tela nova, fora do escopo deste front-end interno).
