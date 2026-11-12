# Integração de tabelas nutricionais — LM Pudins

## Objetivo

O sistema de receitas e produção calcula e finaliza a tabela nutricional. Quando o operador clicar em **Enviar para o site LM Pudins**, ele envia os dados para esta API. O site armazena a tabela no cadastro do sabor e a exibe na página pública correspondente.

## Dados de conexão

- URL base: `https://www.lmpudins.com.br/api/integrations/products`
- Método: `POST`
- Identificador: campo `integration_id` do produto, exibido no Admin junto ao QR Code.
- Cabeçalho de autenticação: `X-LM-API-Key: <chave>`
- URL final: `{URL_BASE}/{integration_id}/nutrition`

A chave pode ser consultada na janela **Integração API** do site, após autenticação administrativa. Ela não deve ser gravada no frontend público, no QR Code, no corpo da requisição ou em logs.

## Exemplo de requisição

```http
POST https://www.lmpudins.com.br/api/integrations/products/UUID_DO_PRODUTO/nutrition
Content-Type: application/json
X-LM-API-Key: CHAVE_DA_API
```

Corpo:

```json
{
  "nutrition": {
    "porcao": "140 g (1 unidade / pote)",
    "nutrientes": [
      ["Valor energético", "220 kcal = 924 kJ", "11%"],
      ["Carboidratos", "37 g", "12%"],
      ["Açúcares totais", "31 g", "—"],
      ["Açúcares adicionados", "24 g", "48%"],
      ["Proteínas", "4,6 g", "6%"],
      ["Gorduras totais", "6,5 g", "10%"],
      ["Gorduras saturadas", "3,5 g", "16%"],
      ["Gorduras trans", "0 g", "**"],
      ["Fibra alimentar", "0,8 g", "3%"],
      ["Sódio", "65 mg", "3%"]
    ],
    "nota_vd": "* Percentual de valores diários fornecidos pela porção. ** VD não estabelecido.",
    "alergenicos": "DECLARAÇÃO DE ALERGÊNICOS",
    "conservantes": "DECLARAÇÃO DE CONSERVANTES"
  }
}
```

Os valores acima são apenas ilustrativos. O sistema remetente deve enviar os dados aprovados para o produto.

## Resposta de sucesso

```json
{
  "success": true,
  "message": "Tabela nutricional atualizada.",
  "product": {
    "integration_id": "UUID_DO_PRODUTO",
    "slug": "frutas-vermelhas",
    "name": "Pudim de Frutas Vermelhas",
    "updated_at": "..."
  }
}
```

## Comportamento

- O `integration_id` é gerado uma única vez e não muda quando o nome ou slug do produto é alterado.
- O envio substitui a tabela nutricional do produto pelo objeto enviado em `nutrition`.
- O QR Code continua apontando para a página pública do sabor; o ID de integração é independente do QR Code.
- A API rejeita chave inválida, ID inexistente e corpo sem um objeto `nutrition` válido.
- O envio deve ocorrer somente após o operador confirmar a tabela no sistema de origem.
- Esta versão atualiza a tabela nutricional principal do sabor. Não há seleção de tabela diferente por apresentação/tamanho neste contrato.

## Códigos HTTP

- `200`: tabela atualizada.
- `400`: corpo inválido ou tabela ausente.
- `401`: chave de integração ausente ou inválida.
- `404`: ID de produto não encontrado.
- `429`: limite de requisições excedido.
