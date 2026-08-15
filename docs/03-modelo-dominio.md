# Modelo de domínio

Fonte de verdade: [`src/types/domain.ts`](../src/types/domain.ts). Este
documento descreve cada tipo em prosa, para quem for desenhar o schema do
banco ou uma API sem precisar ler TypeScript.

## Enums (conjuntos fechados de string)

| Tipo | Valores | Usado em |
|---|---|---|
| `PiStatus` | `aberto`, `contratacao_frete`, `em_transito`, `desembaraco`, `carregamento`, `encerramento`, `cancelado` | `ProcessoImportacao.status` |
| `Modal` | `maritimo`, `rodoviario`, `aereo`, `ferroviario` | `ProcessoImportacao.modal` |
| `TipoCarga` | `FCL`, `LCL` | `ProcessoImportacao.tipoCarga` (só relevante quando `modal === 'maritimo'`) |
| `TipoRelacionamentoEmpresa` | `cliente`, `exportador`, `fornecedor_frete`, `agente_carga`, `transportador`, `recinto` | `Empresa.tiposRelacionamento` (array — uma empresa pode ter vários papéis) |
| `NumerarioStatus` | `nao_liberado`, `liberado`, `pago`, `cancelado` | `Numerario.status` |

## `Empresa`

Entidade unificada para qualquer contraparte com quem a Fiorini se
relaciona: clientes, exportadores, fornecedores de frete, agentes de carga,
transportadores, recintos. Uma linha pode acumular múltiplos papéis via
`tiposRelacionamento`.

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| `id` | string (uuid) | sim | |
| `nomeFantasia` | string | sim | |
| `razaoSocial` | string | sim | |
| `tiposRelacionamento` | `TipoRelacionamentoEmpresa[]` | sim (não-vazio na prática) | modelar como tabela associativa N:N, não array |
| `estrangeira` | boolean | sim | determina se usa `cnpj` (`false`) ou `taxId`+`pais` (`true`) |
| `cnpj` | string | condicional | preenchido quando `estrangeira === false` |
| `taxId` | string | condicional | equivalente ao CNPJ para empresa estrangeira (EIN, VAT number, etc.), preenchido quando `estrangeira === true` |
| `pais` | string | condicional | só relevante quando `estrangeira === true` |
| `site`, `telefone`, `email` | string | não | |
| `contatos` | `ContatoEmpresa[]` | sim (pode ser vazio) | relação 1:N |
| `ativo` | boolean | sim | soft delete — ver nota abaixo |

`ContatoEmpresa`: `id`, `nome` (obrigatório), `telefone?`, `email?`, `ativo` (soft
delete — mesmo padrão de `TributoCatalogo.ativo`, ver abaixo).

`Empresa.ativo`: soft delete no mesmo padrão — "inativar" uma empresa não a
remove, só some das sugestões (exportador, fornecedor de frete, etc.) e da
listagem padrão da tela de Cadastro de Empresas. Resolvido 2026-08-15.

## `EmpresaConfig`

Perfil da própria Fiorini Comex (**linha única** — não é uma lista). Usado
para montar o cabeçalho do Numerário e a identidade visual do app (logo,
ícone/favicon).

| Campo | Tipo | Observação |
|---|---|---|
| `nome`, `razaoSocial`, `cnpj`, `responsavel`, `endereco`, `email`, `telefone` | string | dados institucionais |
| `dadosBancarios` | `DadosBancarios` (`banco`, `agencia`, `conta`, `pix`, todos string) | exibidos no rodapé do Numerário |
| `logoHorizontalUrl?`, `iconeUrl?` | string | hoje são object URLs locais (upload não persiste); no back-end viram paths no Supabase Storage |

## `Usuario`

Modelado no domínio (`id`, `nome`, `email`, `cargo?`, `criadoEm`) mas **ainda
não usado em nenhuma tela** — a Fase 1 não tem autenticação nem gestão de
usuários funcional. A operação é de uma pessoa só; múltiplos usuários é uma
necessidade futura, não confirmada.

## `ProcessoImportacao` (o PI — entidade central)

| Campo | Tipo | Obrigatório | Seção do drawer | Observação |
|---|---|---|---|---|
| `id` | string (uuid) | sim | — | |
| `numero` | string | sim | — | `PI-{sequência}`, único |
| `clienteId` | string (uuid → Empresa) | sim | — | FK |
| `status` | `PiStatus` | sim | header | default `aberto` |
| `modal` | `Modal` | sim | Transporte | |
| `fornecedoresCotadosIds` | string[] (uuid → Empresa) | não | Frete internacional | fornecedores convidados a cotar — N:N |
| `fornecedorFreteId` | string (uuid → Empresa) | não | Frete internacional | qual cotação foi aceita, subconjunto de `fornecedoresCotadosIds` |
| `exportadorId` | string (uuid → Empresa) | não | Informações primárias | FK — ver nota abaixo |
| `referenciaCliente` | string | não | Informações primárias | |
| `licencaImportacao` | boolean | não | Transporte | rotulado "LPCO" na UI |
| `tipoCarga` | `TipoCarga` | não | Transporte | só quando `modal === 'maritimo'` |
| `navio` | string | não | Transporte | só quando `modal === 'maritimo'` |
| `origem`, `destino` | string | não | Transporte | |
| `previsaoEmbarque`, `previsaoChegada` | string (data) | não | Transporte | |
| `hblHawb` | string | não | Transporte | |
| `conhecimentoEmbarque` | string | não | Transporte | "CE Mercante", só maritimo na prática |
| `dataLiberacaoMapa` | string (data) | não | Transporte | |
| `dataChegada` | string (data) | não | Transporte | |
| `dataPresencaCarga` | string (data) | não | Transporte | |
| `numerario` | `Numerario` \| undefined | não | Financeiro | ver seção própria abaixo — 1:1 opcional |
| `numerarioEnviadoEm` | string (data) | não | Financeiro | "Data de emissão" |
| `numerarioPagoEm` | string (data) | não | Financeiro | "Data de pagamento" |
| `numeroDi` | string | não | Desembaraço | |
| `dataCi` | string (data) | não | Desembaraço | significado não 100% confirmado, ver domínio de negócio |
| `dataSiscargo` | string (data) | não | Desembaraço | idem |
| `dataIcms` | string (data) | não | Desembaraço | "Pagamento ICMS" |
| `dataEncerramento` | string (data) | não | Desembaraço | |
| `produtos` | string[] | sim (pode ser vazio) | Processo | lista simples de nomes de produto, sem entidade própria |
| `criadoEm`, `atualizadoEm` | string (data) | sim | — | `atualizadoEm` é atualizado automaticamente a cada `atualizarProcesso()` |
| `comentarios` | `Comentario[]` | sim (pode ser vazio) | aba Comentários | 1:N |
| `anexos` | `Anexo[]` | sim (pode ser vazio) | aba Anexos | 1:N |

> **`exportadorId` — resolvido 2026-08-15**: é FK para `Empresa` (não texto
> livre). O seletor no drawer do PI (`ComboBoxTexto`) sugere `Empresa`s cujo
> `tiposRelacionamento` inclui `exportador`; se o nome digitado não
> corresponder a nenhuma sugestão, o front-end **cria automaticamente** um
> novo registro de `Empresa` (`tiposRelacionamento: ['exportador']`,
> `estrangeira: true`) e liga o PI a ele — isso preserva a ergonomia de não
> exigir cadastro prévio, sem abrir mão de ser uma FK de verdade.

## `Numerario` (embutido em `ProcessoImportacao.numerario`, opcional)

Representa o documento de cobrança estimada enviado ao cliente. Um PI tem
**no máximo um** numerário (relação 1:1 opcional) — hoje é embutido como
objeto, mas no banco relacional vira tabela própria com FK única para
`processos`.

| Campo | Tipo | Observação |
|---|---|---|
| `invoice` | string | número da invoice comercial |
| `cotacaoMoeda` | number | taxa de câmbio usada para converter os valores |
| `tributos` | `ItemTributo[]` | linha de tributo/despesa: `{ descricao: string, valor: number }` — 1:N |
| `status` | `NumerarioStatus` | ver fluxo em [01-dominio-negocio.md](01-dominio-negocio.md) |

Antes tinha também `produto` e `exportador`, removidos por duplicarem campos
já existentes no `ProcessoImportacao` (`produtos`, `exportador`) — a prévia
do numerário (`NumerarioPreview.tsx`) deriva esses dois valores do processo
pai, não os armazena de novo.

## `TributoCatalogo`

Catálogo compartilhado (não vinculado a um PI específico) de descrições de
tributo/despesa sugeridas ao preencher `ItemTributo.descricao`.

| Campo | Tipo | Observação |
|---|---|---|
| `nome` | string | chave natural — hoje usado como identificador (não há `id` separado no front) |
| `ativo` | boolean | soft delete — item inativo some das sugestões mas nunca é removido |

Seed inicial (sempre entra em todo numerário novo): *Frete Internacional e
Taxas, IPI, PIS, COFINS, Taxa Siscomex, ICMS*.

## `Comentario`

| Campo | Tipo | Observação |
|---|---|---|
| `id` | string (uuid) | |
| `autor` | string | hoje sempre `"Fiorini"` (não há multi-usuário ainda) |
| `texto` | string | |
| `criadoEm` | string (data) | |
| `visivelNoPortal` | boolean | **default `false`** — usuário decide explicitamente exibir no portal |
| `estagio` | `PiStatus` \| undefined | status do PI no momento do comentário, para dar contexto na timeline |
| `ativo` | boolean | soft delete — "inativar" um comentário some da timeline mas nunca remove o registro (resolvido 2026-08-15) |

## `Anexo`

| Campo | Tipo | Observação |
|---|---|---|
| `id` | string (uuid) | |
| `nomeArquivo` | string | editável depois do upload |
| `tamanhoBytes` | number | |
| `enviadoEm` | string (data) | |
| `visivelNoPortal` | boolean | **default `false`**, igual comentário |
| `url` | string \| undefined | hoje é um `URL.createObjectURL()` local (não sobrevive a reload); no back-end vira o path/URL assinada do Supabase Storage |
