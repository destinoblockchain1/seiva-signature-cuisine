# Aviso de pausa do Seiva em 15 de outubro de 2026

## Diagnóstico confirmado antes da alteração

O e-mail enviado pelo usuário identifica `Seiva Admin`, ref `fkuoqilgxtxujxjhccqb`, e avisa de pausa futura por atividade insuficiente; não confirma uma pausa já ocorrida. A data exata de recebimento foi solicitada porque a imagem não mostra o dia.

Às `2026-10-15 11:08 UTC`, o projeto correto estava `ACTIVE_HEALTHY`. A linha de controle tinha dois ciclos concluídos, último em `2026-10-12 12:00:14.85359 UTC`, próximo elegível em `2026-10-15 12:00:14.85359 UTC`, e zero entradas pendentes.

O deployment `dpl_AMQrnWZSaeiCcfc7onymRAQ4VGCb`, SHA `8afee3b6de2c4343fae409bf7a3ceec85921a6f2`, continuava `READY`, com o cron diário habilitado. Logs Vercel confirmaram HTTP 200 às 12:00 UTC em 9, 10, 11, 12, 13 e 14 de outubro; dia 12 `executed`, demais `skipped`. Os logs independentes Supabase na janela de 14/10 11:15 a 15/10 11:15 UTC tinham uma requisição de gateway e uma de PostgREST. Não houve falha do agendamento demonstrada nessa janela.

A [política oficial](https://supabase.com/docs/guides/platform/free-project-pausing) avalia atividade suficiente em sete dias e orienta qualitativamente algumas requisições diárias ao banco. A versão anterior gerava uma chamada de API diária. Isso pode ser insuficiente, mas não demonstra a fórmula interna aplicada ao aviso. Não há documentação dizendo que RPC, `service_role`, schema privado ou transação que insere e apaga sejam excluídos. A rotina também persiste timestamp e contador; portanto não se pode atribuir o aviso apenas ao desaparecimento da entrada.

## Plano em oito critérios

1. **Diagnóstico estrutural versus paliativo:** manter agendamento externo e aumentar de uma para três requisições de API diárias aproxima a atividade da orientação qualitativa documentada. Continua sendo mitigação no Free; a única garantia oficial contra pausa por inatividade é um plano pago. Três é uma escolha operacional limitada, não um limiar publicado pelo provedor.
2. **Contra-diagnóstico:** considerar e-mail atrasado ou janela anterior, algoritmo de atividade, falha de rede, credenciais, projeto incorreto, pausas e falhas de cron. Ref e organização foram conferidos ao vivo; banco e cron funcionaram. A data do e-mail continua necessária para estabelecer sua ordem temporal exata.
3. **Alcance e cascata:** alterar somente o módulo HTTP do keep alive, testes e runbook. O cron mantém uma invocação diária; cada uma faz três RPCs HTTP sequenciais. Preservar o contrato de `status`, timestamps, token e `no-store`, acrescentando progresso e versão técnica 2. Nenhuma DDL, nova permissão, interface ou regra comercial.
4. **Modos de falha:** prazo total de dez segundos engloba todas as requisições e leitura dos corpos. Interromper na primeira falha, registrar progresso e não alegar sucesso completo. Se uma chamada concluir a transação e outra falhar, o commit anterior permanece; repetir não duplica o ciclo devido ao gate e lock SQL existentes. Preservar `executed` se qualquer chamada tiver executado, mesmo que as demais retornem `skipped`.
5. **Persistência, performance e observabilidade:** três requisições diárias, tamanho e prazo limitados, acesso ao singleton técnico. A criação/remoção permanece na primeira chamada após 72 horas. Sem histórico crescente, dados comerciais ou credenciais nos logs. Distinguir escrita ignorada por ainda não vencer de consultas de atividade realizadas com sucesso.
6. **Verificação e rollback:** testar três chamadas, agregação de resultados, falha intermediária e timeout global; manter testes SQL de permissões, transação e 72 horas. Exigir build, deployment `READY`, SHA e domínio, header versão 2, disparo pelo cron, logs com três respostas válidas e leitura independente do banco. Abrir e recarregar o app em navegador real. Rollback limitado ao módulo e teste do commit anterior; não remover tabelas nem resetar timestamps.
7. **Contexto solicitado:** perguntar se o aviso chegou em 15/10 ou em outra data. A imagem já identifica o alvo e o tipo de aviso. Essa data melhora a correlação; não bloqueia a confirmação dos logs nem a melhoria limitada de atividade.
8. **Plano executivo:** preparar o módulo e testes no checkout isolado, atualizar runbook, validar, publicar a correção no mesmo projeto autorizado, executar o cron e conferir banco e navegação. Preservar o trabalho local preexistente de arquivamento. Não contratar plano nem enviar mensagens a terceiros.

## Verificação local da versão 2

Passaram 71 testes: 57 HTTP e 14 SQL. A suíte cobre três requisições sequenciais, resultado consolidado `executed`, falha parcial, resposta malformada e prazo global durante a segunda chamada ou leitura do corpo da terceira. ESLint dos arquivos alterados e build cliente/SSR passaram. Revisão independente não encontrou bug material. Não houve alteração de SQL, permissões, pacotes ou locks.

## Limites da conclusão

Este diagnóstico confirma execução técnica e baixo número de chamadas, não que o Supabase tenha cancelado a pausa programada. O estado ativo imediato não prova que o aviso foi retirado. A avaliação futura é do provedor; não há garantia publicada para um número específico de chamadas no plano Free.

Fontes: [Project Pausing](https://supabase.com/docs/guides/platform/free-project-pausing), [Production Checklist — Availability](https://supabase.com/docs/guides/deployment/going-into-prod#availability), [HTTP status codes](https://supabase.com/docs/guides/troubleshooting/http-status-codes).
