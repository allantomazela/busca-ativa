// Placeholder de configuração em runtime.
//
// Em desenvolvimento (`pnpm dev`) este objeto fica vazio e a aplicação usa as
// variáveis de `.env.local` via Vite. No container Docker, o arquivo é
// sobrescrito pelo `docker-entrypoint.sh` com os valores reais do ambiente.
window.__ENV__ = {}
