# Painel administrativo LM Pudins

O painel é servido no mesmo domínio em `/admin`; a API fica em `/api` e o PostgreSQL é interno à rede Docker. A base mantém os produtos e os campos nutricionais em JSONB.

## Configuração no servidor

1. Crie um arquivo `.env` a partir de `.env.example`.
2. Troque obrigatoriamente `POSTGRES_PASSWORD`, `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_USERNAME` e `ADMIN_PASSWORD` por valores fortes e exclusivos.
3. Confirme que `COOKIE_SECURE=true` está configurado para HTTPS.
4. Execute `docker compose config` para validar as variáveis e depois `docker compose up -d --build`.
5. Abra `https://www.lmpudins.com.br/admin` e entre com as credenciais configuradas.

O usuário inicial é criado apenas quando não existe usuário com aquele nome. Alterar `ADMIN_PASSWORD` no ambiente não troca automaticamente uma senha já gravada no banco; a redefinição segura da senha será adicionada numa próxima etapa.

## API

- `GET /api/health`: verifica API e banco.
- `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`.
- `GET /api/products`: produtos publicados, incluindo a imagem principal e a galeria `images` (lista de objetos com `url` e `description`).
- No painel, o campo “Galeria de imagens e descrições” aceita JSON; selecione uma foto e use “Enviar para galeria” para anexá-la com uma descrição. Salve o produto para publicar. As imagens da galeria aparecem na ficha do produto e no carrossel da landing page.
- `POST /api/admin/uploads`: upload autenticado de imagem (JPG, PNG, WebP ou AVIF, máximo 5 MB); os arquivos ficam no volume persistente `lm_pudins_uploads` e são servidos em `/uploads/`.
- `GET/POST /api/admin/products`, `PUT/DELETE /api/admin/products/:id`: operações administrativas autenticadas.

## Segurança e limites conhecidos

- Nunca publique o arquivo `.env` nem credenciais nos commits.
- O banco não tem porta publicada para a internet; o acesso é pela rede Docker.
- Use HTTPS no Traefik.
- O formulário de nutrição aceita JSON e exibe os campos cadastrados nos detalhes do produto; os valores devem ser revisados com os rótulos oficiais.
- Nesta primeira etapa o cadastro grava no banco; a ligação do catálogo React público a `GET /api/products`, o upload de imagens e a gestão de usuários serão concluídos nas próximas etapas.
