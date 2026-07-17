# Webhook de Pagamento — confirmar venda automaticamente

Quando o pagamento é confirmado (Pix caiu, cartão aprovado, pedido pago),
seu gateway/CRM faz um POST para o Hergé e a venda entra na dashboard
(Vendas, CPA, ROAS e funil) automaticamente.

## Endpoint
POST https://SEU-DOMINIO/api/webhooks/conversion

## Autenticação
Header: `Authorization: Bearer <CONVERSION_WEBHOOK_SECRET>`
(o mesmo valor da env var CONVERSION_WEBHOOK_SECRET)

## Corpo (JSON)
```json
{
  "channel": "META",
  "source_type": "API",
  "amount": 1890.00,
  "external_id": "pedido-12345",
  "metadata": {
    "account": "1501790135057764",
    "phone": "+55 51 9....",
    "ctwa_clid": "<opcional: id do clique do anuncio>"
  }
}
```

- `amount`: valor da venda (R$). Obrigatorio para contar como venda.
- `metadata.account`: id da conta de anuncios (sem "act_"). Liga a venda a conta certa.
- `metadata.phone`: telefone do cliente (casa a conversa com a venda).
- `metadata.ctwa_clid`: opcional; habilita atribuicao por criativo no futuro (CAPI).

## Exemplo (curl)
```bash
curl -X POST https://SEU-DOMINIO/api/webhooks/conversion \
  -H "Authorization: Bearer $CONVERSION_WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"channel":"META","source_type":"API","amount":1890,"external_id":"pedido-12345","metadata":{"account":"1501790135057764","phone":"+5551900000000"}}'
```

## Integracoes comuns
- Mercado Pago / Pix: configurar webhook de "payment.approved" -> mapear para o corpo acima.
- Hotmart/Eduzz/Kiwify: webhook de "compra aprovada".
- CRM (RD/Pipedrive): automacao "negocio ganho" -> POST.
