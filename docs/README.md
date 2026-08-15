# Documentação — Fiorini Comex ERP

Este diretório documenta o estado atual do sistema para orientar quem (pessoa ou
agente) for trabalhar no back-end, no banco de dados, ou em novas telas do
front-end. É complementar ao [`fiorini-comex-contexto.md`](../fiorini-comex-contexto.md)
na raiz do repositório, que é o documento de requisitos original do cliente
(com itens `[A DECIDIR]`/`[A CONFIRMAR]`).

## Como ler

Leia nesta ordem se for a primeira vez no projeto:

1. **[01-dominio-negocio.md](01-dominio-negocio.md)** — o que é a Fiorini Comex, glossário
   do domínio (PI, DI, Numerário, etc.), fluxo de status, papéis de empresa.
2. **[02-frontend.md](02-frontend.md)** — arquitetura do front-end atual (Fase 1):
   stack, estrutura de pastas, gerenciamento de estado, padrões de UI, e
   lacunas conhecidas que o back-end precisa resolver.
3. **[03-modelo-dominio.md](03-modelo-dominio.md)** — as entidades e campos do domínio,
   como estão modeladas hoje em TypeScript (`src/types/domain.ts`), com o
   significado de cada campo.
4. **[04-schema-banco.md](04-schema-banco.md)** — proposta de schema relacional
   (Supabase/Postgres) derivada do modelo de domínio, com diagrama ER.

## Estado do projeto (resumo rápido)

- **Fase atual**: front-end completo (React + Vite + TypeScript + Tailwind v4),
  rodando inteiramente sobre **dados mockados em memória** (`src/data/mock-data.ts`
  + React Context). Não há back-end, banco de dados real, nem autenticação
  ainda — tudo isso é o próximo passo.
- **Próximo passo** (o motivo desta pasta existir): modelar e provisionar o
  banco de dados relacional no Supabase, depois substituir os Context
  providers mockados por chamadas reais à API/Supabase client, mantendo os
  mesmos nomes de campo (em português, `camelCase` no front, `snake_case` no
  banco) para minimizar o retrabalho de UI.
- Existe um rascunho de migração SQL em `supabase/migrations/`, mantido em
  sincronia com o modelo de domínio atual — ver [04-schema-banco.md](04-schema-banco.md).
- Repositório: `https://github.com/jaumzitz/fiorinicomex-erp-frontend-claude`,
  branch de trabalho `develop`.

## Convenções úteis para quem for mexer no back-end

- **Nomenclatura**: todo o domínio é em português (`processos`, `numerario`,
  `comentarios`, `visivelNoPortal`, etc.) — manter essa convenção no banco e na
  API evita uma camada de tradução desnecessária.
- **IDs**: o front-end usa `crypto.randomUUID()` para gerar IDs client-side;
  o banco deve usar `uuid` com `gen_random_uuid()` como default, e o front
  deve parar de gerar IDs assim que a API estiver no ar (passar a usar o ID
  retornado pelo insert).
- **Datas**: armazenadas como string `YYYY-MM-DD` (ver `src/lib/date.ts`),
  exibidas como `dd/mm/aaaa`. No banco devem virar `date` (ou `timestamptz`
  quando o campo também carrega hora, como `criadoEm`/`atualizadoEm`).
- **Enums**: status de PI, status de numerário, modal de transporte, tipo de
  carga e tipo de relacionamento de empresa são todos conjuntos fechados de
  string no front (`as const` arrays) — candidatos naturais a `enum` do
  Postgres, já refletido no schema proposto.
