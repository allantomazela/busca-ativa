# Busca Ativa Replay Sports

Aplicação web para busca e organização de leads comerciais.

## Stack

- React 19
- Vite 8
- TypeScript
- Tailwind CSS
- Shadcn UI
- React Router
- Supabase (Auth, PostgreSQL e Edge Functions)
- Vitest

## Pré-requisitos

- Node.js `^20.19.0` ou `>=22.12.0`
- pnpm `>=10`

## Instalação

```bash
pnpm install
```

Crie o arquivo de ambiente local a partir do exemplo:

```bash
copy .env.example .env.local
```

Preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`. Nunca coloque uma chave
`service_role`, `secret` ou da Google no frontend.

## Scripts

```bash
pnpm dev          # desenvolvimento em http://localhost:5878
pnpm typecheck    # validação TypeScript
pnpm lint         # análise estática
pnpm format       # formatação
pnpm test         # testes unitários
pnpm build        # typecheck + build de produção
pnpm preview      # visualizar build local
```

> A porta é derivada automaticamente do nome da pasta do projeto (via `vite.config.ts`),
> garantindo uma porta estável e única por projeto. Para forçar outra porta, use a variável
> de ambiente `PORT` (ex.: `PORT=3000 pnpm dev`).

## Arquitetura de produção

- o acesso exige autenticação por e-mail e senha;
- novos usuários se cadastram em `/signup` e ficam pendentes até aprovação do administrador;
- o administrador gerencia liberações em `/admin/users`;
- todos os usuários aprovados podem alterar nome, foto e senha nas configurações;
- configurações de API e banco aparecem somente para administradores;
- avatares ficam em bucket privado, limitados a 2 MB e protegidos por RLS;
- pesquisas e leads são persistidos no PostgreSQL;
- RLS garante que cada usuário acesse somente os próprios dados aprovados;
- a Edge Function `google-places-search` protege a chave da Google Places API;
- o CORS aceita somente origens explicitamente configuradas.

## Configuração do Supabase

O projeto remoto configurado é `rqxtwzkrwvxqsqrmbtxj`. Para publicar a estrutura:

```bash
pnpm dlx supabase login
pnpm dlx supabase link --project-ref rqxtwzkrwvxqsqrmbtxj
pnpm dlx supabase db push
pnpm dlx supabase functions deploy google-places-search
pnpm dlx supabase secrets set GOOGLE_PLACES_API_KEY=sua_chave
pnpm dlx supabase secrets set ALLOWED_ORIGINS=https://seu-dominio.com.br
```

No Dashboard do Supabase:

1. Em **Authentication**, desative cadastro público e mantenha login por e-mail/senha.
2. Convide os usuários autorizados pelo painel administrativo.
3. Configure a URL do site e os redirects com o domínio definitivo de produção.
4. Ative a Google Places API (New) no Google Cloud e restrinja a chave ao uso dessa API.

Enquanto `GOOGLE_PLACES_API_KEY` não estiver configurada, a busca retorna uma mensagem de
indisponibilidade sem expor credenciais. A API do Google Places não fornece perfis sociais
separados; Instagram ou Facebook só são preenchidos quando o próprio website retornado aponta para
uma dessas redes. Uma fonte de enriquecimento específica será necessária para cobertura maior.

## Validação antes do deploy

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

O servidor que hospedar a SPA deve redirecionar rotas desconhecidas para `index.html`.
