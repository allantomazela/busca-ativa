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

## Docker

A imagem serve a SPA via Nginx e injeta as variáveis de ambiente **em runtime**
(`env.js`), permitindo construir uma única imagem e reutilizá-la em dev, homolog
e produção apenas trocando as variáveis do container.

### Com docker-compose (recomendado)

```bash
cp .env.docker.example .env.docker                       # preencha URL e chave
docker compose --env-file .env.docker up -d --build      # http://localhost:8080
docker compose --env-file .env.docker logs -f            # acompanhar logs
docker compose --env-file .env.docker down               # parar
```

A porta do host é configurável por `APP_PORT` (padrão `8080`); o container sempre
expõe a porta `80` internamente.

### Sem compose (build + run manual)

```bash
docker build -t busca-ativa-web:latest .

docker run -d --name busca-ativa \
  -p 8080:80 \
  -e VITE_SUPABASE_URL="https://seu-projeto.supabase.co" \
  -e VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_sua_chave" \
  -e VITE_APP_NAME="Busca Ativa Replay Sports" \
  busca-ativa-web:latest
```

> Ambientes separados: mantenha um `.env.docker` por ambiente (ex.: `.env.docker-dev`,
> `.env.docker-homolog`, `.env.docker-prod`) e aponte com
> `docker compose --env-file .env.docker-prod up -d`.
> Ao publicar em um domínio, lembre de incluí-lo em `ALLOWED_ORIGINS` da Edge Function.

O backend (Supabase) é gerenciado e **não** faz parte desta imagem — apenas o
frontend é containerizado.

### Imagem publicada (GHCR)

O workflow `Docker Publish` constrói e envia a imagem para o GitHub Container
Registry a cada push na `main` e a cada tag `vX.Y.Z`. Para usar a imagem pronta:

```bash
docker pull ghcr.io/allantomazela/busca-ativa:latest

docker run -d --name busca-ativa \
  -p 8080:80 \
  -e VITE_SUPABASE_URL="https://seu-projeto.supabase.co" \
  -e VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_sua_chave" \
  ghcr.io/allantomazela/busca-ativa:latest
```

## Integração contínua (CI/CD)

- `.github/workflows/ci.yml` — a cada push/PR na `main` roda formatação, lint,
  typecheck, testes e build.
- `.github/workflows/docker-publish.yml` — publica a imagem no GHCR (usa o
  `GITHUB_TOKEN`, sem segredos adicionais). Gere uma versão com `git tag v0.0.3`
  e `git push --tags` para taguear a imagem.

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
