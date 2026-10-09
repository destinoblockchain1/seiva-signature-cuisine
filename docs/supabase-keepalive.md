# Keep alive do Supabase no Seiva

## Funcionamento

O cron da Vercel chama `GET /api/cron/supabase-keepalive` diariamente, às 12h UTC (`0 12 * * *`). O backend autentica o cabeçalho `Authorization: Bearer <CRON_SECRET>` e chama a RPC `public.run_app_keepalive()` pela Data API do projeto `fkuoqilgxtxujxjhccqb` (Seiva Admin). Funciona sem visitantes e sem manter uma aba aberta.

A RPC bloqueia a linha única de `seiva_keepalive.state`. Quando passaram pelo menos 72 horas desde o último ciclo bem-sucedido, insere e apaga o mesmo ID `seiva-keepalive` em `seiva_keepalive.pulse` e atualiza o timestamp e contador de ciclos na mesma transação. A tabela `pulse` fica vazia após o commit; somente o controle permanece. Chamadas anteriores ao vencimento retornam `skipped`, mas ainda fazem uma consulta real ao PostgreSQL.

No Hobby, o cron diário pode executar em qualquer minuto da hora configurada. Assim, o ciclo ocorre na primeira tentativa após 72 horas: tipicamente entre 72 e 97 horas, se todas as chamadas funcionarem. Falhas são tentadas novamente na próxima chamada diária. Não há garantia de horário exato ou retry imediato da Vercel.

O objetivo é gerar atividade técnica periódica. A [política do Supabase Free](https://supabase.com/docs/guides/platform/free-project-pausing) considera atividade suficiente em uma janela de sete dias e não promete que este volume impeça a pausa. O usuário relata pausa observada após cinco dias sem registros. A garantia oficial contra pausa por inatividade é o plano pago; este mecanismo precisa ser acompanhado pelos logs e avisos da plataforma.

## Análise em oito critérios

1. **Diagnóstico estrutural:** o agendamento externo resolve a dependência de visitas ao app. É uma mitigação da inatividade no plano Free, não uma alteração da política do provedor.
2. **Contra-diagnóstico:** projeto pausado, credencial inválida, RLS, configuração incorreta, rede e timeout precisam ser distinguidos. Um keep alive não retoma automaticamente um projeto já pausado.
3. **Alcance:** muda somente o servidor do app, o cron e objetos técnicos novos. Não altera leads, propostas, usuários, e-mails nem a interface. A URL Supabase aceita exclusivamente o projeto Seiva confirmado.
4. **Modos de falha:** lock do singleton impede ciclos duplicados; falha de insert/delete faz rollback; cleanup que não remove a linha gera erro. Timeout após commit não produz um segundo ciclo na repetição. Falta de configuração rejeita a operação. Preview da Vercel fica desativado.
5. **Persistência, performance e observabilidade:** uma RPC por dia, acesso por chave primária e lock somente técnico com limite de espera de três segundos. Não cria histórico crescente ou consultas N+1. Logs registram resultado, código estável e duração; jamais cabeçalhos, credenciais ou resposta bruta do banco.
6. **Verificação e rollback:** testes HTTP e PostgreSQL local validam permissões, intervalo e transação. Antes de declarar ativo, exigir teste publicado, leitura persistida e navegação real. Desativar o cron encerra as chamadas; remover os objetos técnicos não exige mudanças em dados comerciais.
7. **Contexto solicitado:** aviso de pausa e horário preferido. O usuário informou que já retomou o banco e aceita qualquer horário.
8. **Sequência executiva:** preparar migração, handler, cron e testes; confirmar alvo; aplicar somente a migração técnica; configurar segredo; publicar somente esta mudança; executar os gates de ativação abaixo.

## Configuração de produção

Projeto Vercel: `seiva-signature-cuisine`, ID `prj_tbNW7XVYUVjsEtgvsiUQvQBEXgQt`, escopo `team_IYxkPtqZypxuPAC2s9eKoMF8`. Projeto Supabase: `fkuoqilgxtxujxjhccqb`, organização `vjvgrqjxyrjuyfodvgrn`.

Variáveis de runtime, somente no servidor:

| Variável                    | Uso                                                                                                                   |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `CRON_SECRET`               | Valor aleatório forte, recomendado 32 bytes; salvo como segredo de produção. A Vercel envia o Bearer automaticamente. |
| `SUPABASE_URL`              | `https://fkuoqilgxtxujxjhccqb.supabase.co`                                                                            |
| `SUPABASE_SERVICE_ROLE_KEY` | Credencial existente do servidor para a Data API. Nunca prefixar com `VITE_` ou `NEXT_PUBLIC_`.                       |

A inspeção de nomes das variáveis encontrou `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` em produção; `CRON_SECRET` ainda não existia. Valores não foram lidos nem copiados. O handler valida o alvo em runtime e recusa URL de outro projeto. Se `VERCEL_ENV` estiver definido e não for `production`, retorna `disabled` sem consultar o banco.

Aplicar `supabase/migrations/20261009030641_app_keepalive.sql` pelo canal de migrações ao alvo confirmado. Não usar um `db push` indiscriminado: este checkout contém uma migração de arquivamento de leads e outras alterações preexistentes que não fazem parte deste escopo. A publicação também deve usar somente os arquivos desta mudança.

O schema privado tem RLS, sem policies públicas. A função é `SECURITY INVOKER`, tem `search_path` vazio, e `EXECUTE` somente para `service_role`. O papel tem apenas os grants necessários nas tabelas técnicas e precisa manter seu atributo Supabase `BYPASSRLS`. Nenhuma credencial privilegiada vai para o browser.

## Gates de ativação

1. Confirmar organização, project ref e projeto Vercel; registrar baseline comercial sem expor dados de clientes.
2. Aplicar somente esta migração; verificar schema privado, RLS, grants e `EXECUTE` público revogado.
3. Configurar `CRON_SECRET` somente em produção e confirmar configuração do servidor sem exibir valores.
4. Publicar somente o keep alive, confirmar deployment `READY`, domínio e versão/SHA correspondente; conferir o cron registrado.
5. Navegar no endpoint publicado sem token: deve rejeitar. Executar com token por canal seguro: deve retornar `executed` inicialmente, depois `skipped`, com `last_success_at` e `next_due_at` válidos.
6. Reconsultar o banco após o retorno: timestamp e contador persistidos, nenhuma linha em `pulse`, leads/propostas preservados. Navegar no site e recarregar para confirmar que o servidor continua atendendo o fluxo normal.
7. Acompanhar o primeiro disparo agendado em logs da Vercel. `configuration`, `upstream`, `invalid_upstream_response` e `timeout` exigem diagnóstico. Vercel não repete falhas automaticamente; a tentativa diária seguinte é o mecanismo de recuperação.

Consulta administrativa de acompanhamento (não expõe dados de clientes):

```sql
select last_success_at,
       last_success_at + interval '72 hours' as next_due_at,
       completed_cycles,
       clock_timestamp() - last_success_at as elapsed_since_success,
       (select count(*) from seiva_keepalive.pulse) as pending_pulses
from seiva_keepalive.state where singleton = true;
```

Esperado: `pending_pulses = 0`; `completed_cycles` cresce apenas após ciclos completos. Sucesso do endpoint e leitura persistida comprovam o mecanismo, não a decisão futura de pausa do provedor.

## Desativação e remoção

Desativar primeiro o cron no projeto Vercel, ou retirar o item `crons` de `vercel.json` e publicar. O app permanece funcionando. Para remover definitivamente os objetos técnicos, confirmar que não há chamadas em andamento e aplicar uma migração separada e revisada:

```sql
drop function public.run_app_keepalive();
drop table seiva_keepalive.pulse;
drop table seiva_keepalive.state;
drop schema seiva_keepalive;
```

Não usar `CASCADE`: dependências inesperadas devem interromper a remoção. Remover `CRON_SECRET` somente se não for compartilhado por outros crons do projeto.

## Fontes e limites da validação

- [Pausa de projetos Free — Supabase](https://supabase.com/docs/guides/platform/free-project-pausing)
- [Segurança e falhas de cron — Vercel](https://vercel.com/docs/cron-jobs/manage-cron-jobs)
- [Precisão e limites do cron Hobby — Vercel](https://vercel.com/docs/cron-jobs/usage-and-pricing)

Os testes de SQL usam PostgreSQL em memória (PGlite), sem banco remoto. O harness tem uma única conexão: verifica transação e duplicação, mas não reproduz contenção entre conexões reais. O SQL usa `FOR UPDATE` e `lock_timeout` para esse cenário; essa evidência não deve ser apresentada como um teste distribuído.

Validação local em 8 de outubro de 2026:

| Verificação                       | Resultado                                                                                                                                                              |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Suíte completa `npm test`         | 83 testes passaram; 50 HTTP e 14 PostgreSQL específicos do keep alive.                                                                                                 |
| `npm run build`                   | Build do cliente e do servidor passou.                                                                                                                                 |
| ESLint dos arquivos do keep alive | Passou.                                                                                                                                                                |
| Bundle do cliente                 | Sem handler, RPC ou comparação de segredo; código técnico somente no servidor.                                                                                         |
| Endpoint no servidor local        | Sem token: 401; token local fictício sem credenciais de banco: 503; POST: 405. Todas as respostas `no-store`.                                                          |
| Navegação local pelo navegador    | Bloqueada por `net::ERR_BLOCKED_BY_CLIENT`, tanto no in-app browser (`127.0.0.1` e `localhost`) quanto no Chrome (`localhost`). Não foi validado end-to-end publicado. |
| TypeScript global                 | Três erros preexistentes de `inquiryId` em `src/routes/quotes.tsx`; nenhuma alteração nesse arquivo.                                                                   |
| Ativação remota                   | Pendente: migração não aplicada, cron não publicado, `CRON_SECRET` ainda não configurado.                                                                              |

O bootstrap de `tests/inquiry-archive.database.test.ts` recebeu apenas a criação do papel `service_role` do ambiente de testes e a exclusão desta migração do bloco histórico de grants amplos. Esse bloco reaplicava permissões no histórico de arquivamento após a migração nova e gerou uma falha na primeira suíte completa. A mudança corrige somente a simulação de permissões do harness; não muda a funcionalidade de arquivamento.
