# Etapa 4 — Métricas confiáveis

## Objetivo

Impedir que sinais das plataformas de mídia sejam apresentados como receita, venda ou retorno financeiro confirmado.

## Regras implementadas

- Receita: soma exclusiva de vendas não-DEMO com `paymentStatus = completed`.
- ROAS financeiro: receita de vendas concluídas dividida pelo investimento de mídia.
- CPA: investimento dividido somente por vendas concluídas atribuídas à campanha.
- Conversão de plataforma: preservada separadamente como dado de mídia; nunca substitui venda.
- Campanha sem venda atribuída: ROAS e CPA aparecem como indisponíveis (`—`), não como zero ou valor estimado.
- Leads qualificados: definidos pelo campo `qualified`, não pela existência de valor estimado.
- Séries de receita: construídas com vendas concluídas, sem usar `conversionValue` como fallback.
- Dados DEMO: excluídos do dashboard e dos serviços de KPI.

## Governança para tráfego

Uma campanha só pode ser classificada como lucrativa quando houver simultaneamente:

1. investimento sincronizado com origem conhecida;
2. venda concluída e não-DEMO;
3. atribuição da venda à campanha;
4. período de análise compatível.

Sem esses quatro elementos, o sistema pode mostrar métricas de mídia (impressões, cliques, CTR, CPC e conversões reportadas), mas não deve recomendar escala com base em ROAS ou CPA financeiro.

## Validação

Execute `npm run test:data-trust`, `npm run test:integrations` e `npm run build`.

## Dependência pendente

A migração `prisma/migrations/20260720_data_provenance/migration.sql` ainda precisa ser aplicada ao Neon antes do deploy.
