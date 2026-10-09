# LM Pudins — Experiência Digital Premium

> **Visão do produto + guia da primeira versão visual.** Este README registra a direção criativa, o escopo funcional e como executar o projeto localmente. A landing page inicial já está estruturada em React; imagens fotográficas finais e integrações comerciais ainda são etapas pendentes.

A LM Pudins quer apresentar seus pudins artesanais de forma memorável, unindo a identidade visual existente a uma experiência digital sofisticada, sensorial e preparada para evoluir futuramente para uma loja virtual.

**Repositório:** https://github.com/andre7184/lmpudins-page

---



## Status atual do repositório

### Já criado

- Aplicação React com Vite.
- Landing page responsiva com estética bordô, dourado e chocolate.
- Hero com ilustração decorativa de pudim construída em CSS e sensação de profundidade.
- Sete cards de sabores e filtros por perfil.
- Janela de detalhes de produto com descrição e ingredientes.
- Animações de entrada, flutuação e microinterações, com respeito a `prefers-reduced-motion`.
- Seções de marca, experiência, chamada para contato e rodapé.
- Formulário de consulta preparado para abrir o WhatsApp quando a variável de ambiente estiver configurada.
- Pasta reservada para as fotografias finais e documentação sobre os arquivos esperados.

### Ainda pendente

- As fotos enviadas na conversa **não foram transferidas para o repositório**.
- O visual do pudim é, nesta versão, uma ilustração CSS temporária; não deve ser confundida com fotografia real do produto nem com um modelo 3D físico.
- A geração de novas imagens não ficou disponível durante esta etapa.
- Não foi executado um build de validação dentro deste fluxo; rode os comandos abaixo antes de publicar.
- O número oficial do WhatsApp, links sociais e informações comerciais precisam ser configurados.
- Carrinho, checkout, pagamentos e gestão de pedidos não estão implementados.

## Executar com Docker

A aplicação pode ser construída e executada em um container. O Docker faz o build do React/Vite e entrega os arquivos estáticos usando Nginx.

### Pré-requisitos

- Docker Engine ou Docker Desktop instalado.
- Docker Compose v2 (comando `docker compose`).

### Iniciar o site

Na raiz do repositório, execute:

```bash
docker compose up --build -d
```

Abra [http://localhost:8080](http://localhost:8080).

Para acompanhar os logs:

```bash
docker compose logs -f
```

Para parar e remover o container:

```bash
docker compose down
```

### Configurações opcionais

Por padrão, o site fica disponível na porta `8080`. Para usar outra porta, crie um arquivo `.env` na raiz do projeto:

```env
PORTA_SITE=8090
VITE_WHATSAPP_NUMBER=55DDDNUMERO
```

Substitua `55DDDNUMERO` pelo número oficial da marca, em formato internacional e somente com dígitos. Depois, reconstrua a imagem para aplicar a configuração:

```bash
docker compose up --build -d
```

A variável `VITE_WHATSAPP_NUMBER` é usada durante o build do frontend; alterar o arquivo `.env` sem reconstruir a imagem não atualiza o valor incorporado ao site. Não coloque senhas ou segredos em variáveis `VITE_*`, pois elas são públicas no frontend.

### Arquivos Docker

- `Dockerfile`: build em múltiplas etapas (Node.js para compilar e Nginx para servir).
- `docker-compose.yml`: inicialização simples, porta configurável e reinício automático.
- `nginx.conf`: entrega de arquivos estáticos, fallback para rotas do frontend e cabeçalhos básicos de segurança.
- `.dockerignore`: evita copiar dependências locais e arquivos desnecessários para a imagem.

## Executar localmente

Requisitos: Node.js em versão LTS e npm.

```bash
npm install
npm run dev
```

Para validar a versão de produção:

```bash
npm run build
npm run preview
```

### Configurar o WhatsApp

Crie um arquivo `.env.local` na raiz e defina o número oficial em formato internacional, somente com dígitos e código do país, sem espaços ou sinais:

```env
VITE_WHATSAPP_NUMBER=55DDDNUMERO
```

Substitua o exemplo pelo número real da LM Pudins. Não publique credenciais ou dados privados em variáveis `VITE_*`; elas são incorporadas ao frontend.


## 1. Visão do projeto

Criar uma landing page responsiva, elegante e inovadora, que desperte o desejo de experimentar os produtos e facilite o caminho entre conhecer os sabores e realizar um pedido.

A página deve ir além de um catálogo estático. A proposta é construir uma experiência gastronômica digital com:

- Identidade visual baseada em bordô, dourado, tons de chocolate e reflexos quentes.
- Fotografia de sobremesas com aparência apetitosa, texturas evidentes e iluminação cinematográfica.
- Animações delicadas, profundidade visual e efeitos tridimensionais refinados.
- Catálogo dos sete sabores oficiais, com descrições alinhadas ao PDF fornecido.
- Navegação simples, acessível e pensada primeiro para celulares.
- Estrutura organizada para incorporar futuramente carrinho, checkout, pagamentos e gestão de pedidos, sem simular que esses recursos já existem.

### Objetivo principal

Transformar visitantes em pessoas interessadas nos produtos, conduzindo-as de forma clara do impacto visual à descoberta dos sabores e, posteriormente, ao contato ou à compra.

### Princípios da experiência

1. **Desejo antes da complexidade:** os produtos são o centro da página.
2. **Sofisticação sem exagero:** animações valorizam a sobremesa, mas não competem com ela.
3. **Fidelidade à marca:** preservar o logo e sua paleta visual.
4. **Conteúdo verdadeiro:** não publicar preços, avaliações, prêmios, ingredientes ou promessas que não tenham sido confirmados.
5. **Desempenho e acessibilidade:** oferecer uma boa experiência mesmo em celulares intermediários e conexões mais lentas.
6. **Evolução gradual:** começar pela apresentação da marca e do catálogo; adicionar funcionalidades de comércio eletrônico em etapas.

---

## 2. Direção de arte

### 2.1 Paleta e atmosfera

A direção escolhida é **luxo e sofisticação**, com alguns pontos de cor vindos dos próprios sabores.

- **Bordô profundo:** fundos, áreas de destaque e identidade principal.
- **Dourado:** contornos, ícones, divisórias, detalhes e chamadas para ação.
- **Chocolate escuro:** contraste, profundidade e enquadramento das fotografias.
- **Creme e marfim:** textos, áreas de leitura e superfícies que precisam de leveza.
- **Cores naturais dos sabores:** vermelho das frutas, laranja cítrica, marrom do chocolate, amarelo do maracujá e tons claros dos pudins.

O dourado deve ser usado com moderação para manter a aparência premium. Evitar excesso de gradientes, brilhos artificiais, bordas decorativas ou animações simultâneas.

### 2.2 Tipografia

Combinar uma fonte serifada elegante para títulos e mensagens de marca com uma fonte simples e legível para descrições, ingredientes e navegação. Uma fonte cursiva pode ser usada pontualmente em frases de assinatura, sem comprometer a leitura.

### 2.3 Fotografia e imagens

A proposta é produzir ou selecionar imagens próprias e coerentes entre si, com:

- Pudins em primeiro plano e textura cremosa visível.
- Calda de caramelo brilhante e natural.
- Ingredientes que correspondam a cada sabor.
- Iluminação quente e fundos em tons bordô, chocolate e dourado.
- Composições horizontais para o destaque principal e imagens verticais ou quadradas para os cards.
- Versões otimizadas para telas menores e carregamento progressivo.

Imagens conceituais podem orientar o visual durante o desenvolvimento. Antes da publicação, verificar a qualidade, a licença e a correspondência de cada imagem com o produto real. Não apresentar uma imagem ilustrativa como fotografia fiel do produto sem validação.

### 2.4 Uso do logo

O logo fornecido pela LM Pudins deve ser a referência principal da identidade. Priorizar um arquivo de boa resolução e, se disponível, uma versão com fundo transparente. Não redesenhar, distorcer ou alterar a proporção do logo. Preparar uma versão adequada para o cabeçalho e outra para o rodapé, caso o arquivo original permita.

---

## 3. Conceito de animação 3D

A página deve transmitir profundidade e movimento de forma refinada. O 3D é um recurso de apoio à narrativa do produto, não um obstáculo à navegação.

### 3.1 Hero — a primeira impressão

A seção inicial deve combinar uma fotografia ou composição de um pudim em destaque com uma mensagem curta e um botão principal.

**Direção de texto sugerida:**

> **Mais que uma sobremesa, é uma experiência.**

Texto de apoio sugerido:

> Pudins artesanais preparados para transformar pequenos momentos em lembranças especiais.

A redação é uma proposta criativa e deve ser validada pela marca antes da publicação.

Efeitos planejados:
- Entrada suave do título e do botão.
- Movimento sutil de profundidade no fundo e nos elementos decorativos.
- Destaque luminoso controlado sobre a calda.
- Parallax discreto com o movimento do cursor em telas compatíveis.
- CTA para explorar os sabores.

O pudim pode ser apresentado como imagem de alta qualidade com profundidade visual ou como objeto 3D real. A decisão deve considerar qualidade final, desempenho, custo de produção e compatibilidade com celulares. Não é necessário usar um modelo 3D pesado se uma composição otimizada entregar uma experiência melhor.

### 3.2 Transições durante a rolagem

- Elementos aparecem com transições curtas quando entram na área visível.
- Fotografias podem ganhar profundidade ou escala de maneira discreta.
- Divisórias douradas e pequenos elementos gráficos reforçam a continuidade visual.
- A rolagem permanece natural e nunca deve ficar bloqueada por animações.

### 3.3 Interação com os sabores

Ao selecionar um sabor, o visitante deve conseguir abrir seus detalhes com uma transição clara. A interface pode realçar a cor e os ingredientes associados ao produto, sem exigir que a pessoa interaja com elementos 3D para ler as informações.

### 3.4 Regras de desempenho e acessibilidade

- Respeitar a preferência do sistema por movimento reduzido, por meio de prefers-reduced-motion.
- Evitar animações contínuas que consumam bateria ou distraiam.
- Oferecer imagens estáticas de reserva quando o 3D não for suportado.
- Não depender apenas de cor ou movimento para transmitir informações.
- Garantir foco visível, navegação por teclado e contraste suficiente.
- Carregar recursos pesados somente quando forem necessários.
- Verificar o resultado em aparelhos móveis reais antes da publicação.

---

## 4. Estrutura proposta da landing page

### 4.1 Cabeçalho e navegação

Cabeçalho discreto com logo, links de navegação e acesso ao catálogo. Em telas pequenas, a navegação deve se adaptar a um menu compacto.

Links sugeridos:
- Início
- Sabores
- Nossa história
- Galeria
- Pedidos
- Contato

A opção **Loja virtual** pode aparecer como acesso futuro. Enquanto carrinho e checkout não estiverem implementados, ela deve direcionar para uma área informativa ou de contato, e não fingir que uma compra foi concluída.

### 4.2 Hero — apresentação da marca

- Logo LM Pudins.
- Mensagem principal.
- Texto de apoio curto.
- Fotografia principal de pudim com calda.
- CTA “Conheça nossos sabores”.
- Detalhes dourados e profundidade visual moderada.

### 4.3 Nossa história

Uma seção editorial para apresentar a origem da marca, o cuidado com as receitas e a proposta artesanal. O texto definitivo deve ser fornecido ou aprovado pela LM Pudins; não inventar datas de fundação, histórias pessoais, processos ou certificações.

### 4.4 Catálogo — sete sabores oficiais

O catálogo deve apresentar exatamente os sete sabores abaixo, mantendo a descrição do PDF como base editorial. As descrições podem receber ajustes leves de pontuação e formatação, mas mudanças de significado precisam ser aprovadas.

#### 1. Pudim de Frutas Vermelhas

**Descrição do catálogo:** sobremesa com textura firme e cremosa, contrastada pela acidez suave da geleia caseira e com o sabor arredondado pelo toque do leite em pó.

**Ingredientes informados:** caramelo, leite integral, creme de leite, ovos, açúcar, leite em pó, extrato de baunilha e geleia caseira de frutas vermelhas.

**Direção visual:** frutas vermelhas, calda avermelhada e contraste entre creme e geleia.

#### 2. Pudim de Laranja

**Descrição do catálogo:** pudim leve e aromático, com equilíbrio entre o doce do caramelo especiado e o toque cítrico da laranja.

**Ingredientes informados:** caramelo, leite integral, creme de leite, ovos, açúcar, extrato de baunilha, raspas de laranja e geleia caseira de laranja.

**Direção visual:** laranja fresca, raspas cítricas e caramelo dourado.

#### 3. Pudim de Chocolate com Café

**Descrição do catálogo:** pudim de perfil intenso e sofisticado, equilibrando o amargor marcante do café com a profundidade do chocolate amargo.

**Ingredientes informados:** caramelo, leite integral, creme de leite, ovos, açúcar, extrato de baunilha, chocolate em pó 70%, café solúvel e raspas de chocolate para decoração.

**Direção visual:** chocolate escuro, raspas de chocolate e elementos de café.

#### 4. Pudim de Caldo de Cana

**Descrição do catálogo:** versão de inspiração brasileira, adoçada com redução de melaço caseiro, com notas de limão.

**Ingredientes informados:** caramelo de melaço de cana, leite integral, creme de leite, ovos, melaço de cana na massa, extrato de baunilha e raspas de limão.

**Direção visual:** tons âmbar, cana-de-açúcar e detalhes cítricos. Confirmar com a marca a apresentação visual mais fiel à receita.

#### 5. Pudim de Maracujá

**Descrição do catálogo:** pudim cítrico e equilibrado, com acidez suavizada pelo leite em pó e contraste de textura proporcionado pelas sementes in natura.

**Ingredientes informados:** caramelo, leite integral, creme de leite, ovos, açúcar, leite em pó integral, extrato de baunilha, sal, geleia caseira de maracujá e sementes frescas de maracujá.

**Direção visual:** polpa amarela, sementes e cores tropicais.

#### 6. Pudim de 4 Leites

**Descrição do catálogo:** pudim extremamente cremoso, doce na medida e com textura aveludada, finalizado com cobertura em pó.

**Ingredientes informados:** caramelo, leite condensado, creme de leite, leite integral, leite em pó integral, ovos, extrato de baunilha e sal.

**Direção visual:** tons de creme e marfim, textura aveludada e acabamento delicado.

#### 7. Pudim Romeu e Julieta

**Descrição do catálogo:** pudim liso de padrão premium, estruturado com cream cheese para trazer uma nota levemente salgada que contrasta com a goiabada.

**Ingredientes informados:** caramelo, leite integral, creme de leite, ovos, açúcar, cream cheese, extrato de baunilha, sal, geleia caseira de goiabada e queijo meia cura ou parmesão opcional para decoração.

**Direção visual:** goiabada vermelha e tons claros do queijo e do pudim.

### 4.5 Comportamento dos cards

Cada card deve conter:
- Imagem do sabor.
- Nome.
- Descrição curta.
- Ação para ver detalhes.
- Apresentação consistente em desktop e celular.

Os detalhes podem abrir em uma página individual, modal acessível ou painel expansível. A escolha deve preservar o histórico de navegação e facilitar o compartilhamento de um produto no futuro.

Não exibir preços, disponibilidade, tamanhos, peso, validade ou informações nutricionais enquanto esses dados não forem confirmados pela marca.

### 4.6 Diferenciais e confiança

Uma seção visual pode destacar aspectos confirmados pela marca, como seleção de ingredientes e cuidado artesanal. Expressões como “100% natural”, “sem conservantes”, “o melhor”, “entrega garantida” ou “pagamento seguro” só devem ser publicadas se houver confirmação e condições reais para sustentá-las.

### 4.7 Galeria gastronômica

Galeria com fotografias de produtos e detalhes de textura, cobertura e ingredientes. A experiência deve priorizar as imagens e permitir visualização confortável em dispositivos móveis.

### 4.8 Chamada para ação

Uma seção de destaque no final da página convida o visitante a conhecer o catálogo e iniciar um pedido.

Texto sugerido:

> **Um sabor especial para o seu momento.**

O CTA poderá direcionar para o WhatsApp quando o número oficial for configurado. Futuramente, poderá direcionar para o carrinho da loja virtual.

### 4.9 Rodapé

- Logo.
- Links principais.
- Contatos e redes sociais oficiais.
- Informações comerciais confirmadas.
- Links para política de privacidade e termos, quando preparados.
- Aviso de direitos autorais.

Não publicar links sociais, endereço, horários ou contatos fictícios.

---

## 5. Jornada de compra e evolução para loja virtual

A decisão é preparar a estrutura para uma futura loja virtual, sem exigir que a primeira versão já processe pagamentos.

### Etapa 1 — Landing page e catálogo

- Apresentar a marca e os sete sabores.
- Abrir detalhes dos produtos.
- Permitir contato por um canal oficial configurado.
- Medir cliques nos CTAs, se houver ferramenta de métricas aprovada.

### Etapa 2 — Solicitação de pedido

- Formulário ou fluxo de contato.
- Seleção de sabor e quantidade, se a operação confirmar que esses dados são suficientes.
- Resumo da solicitação antes de encaminhar.
- Confirmação explícita de que o pedido foi apenas solicitado, não pago ou confirmado, quando esse for o caso.

### Etapa 3 — Loja virtual

Funcionalidades futuras possíveis:
- Páginas individuais de produtos.
- Preços, tamanhos e disponibilidade gerenciados pela marca.
- Carrinho persistente.
- Cálculo de entrega ou retirada conforme as regras comerciais.
- Checkout.
- Integração com provedor de pagamento.
- Confirmações de pedido e pagamento.
- Gestão de pedidos e estados da encomenda.
- Políticas de cancelamento, privacidade, entrega e reembolso.

### Princípios importantes

- Não armazenar dados de cartão diretamente na aplicação.
- Usar um provedor de pagamento adequado e seguir suas recomendações de segurança.
- Não mostrar um pedido como pago até que o estado seja confirmado pelo sistema de pagamento.
- Não assumir que preço, frete, estoque ou prazo são fixos; esses dados devem ser configuráveis.
- Definir política de privacidade e tratamento de dados antes de coletar informações pessoais.

---

## 6. Proposta técnica

A tecnologia definitiva deve ser confirmada pela inspeção do repositório e dos requisitos de implantação. A direção inicial sugerida é:

### Interface

- **React** para componentes e composição da interface.
- **Vite** para desenvolvimento e build, se compatível com a estrutura escolhida.
- **CSS moderno** para responsividade, efeitos visuais e animações leves.
- **Three.js / React Three Fiber**, somente se o 3D real trouxer valor suficiente.
- **GSAP** ou recursos nativos de animação para transições e efeitos ligados à rolagem, avaliando bundle e acessibilidade.

Não é necessário adotar todas essas bibliotecas. A escolha final deve evitar dependências redundantes e manter o carregamento rápido.

### Organização sugerida

A estrutura exata será ajustada à aplicação real. Uma possível organização é:

    lmpudins-page/
    ├── public/
    │   ├── images/
    │   ├── logo/
    │   └── models/
    ├── src/
    │   ├── components/
    │   ├── sections/
    │   ├── data/
    │   │   └── products
    │   ├── hooks/
    │   ├── styles/
    │   ├── utils/
    │   ├── App
    │   └── main
    ├── README.md
    ├── package.json
    └── vite.config

A estrutura acima é uma referência de organização, não uma afirmação sobre os arquivos atualmente presentes no repositório.

### Conteúdo separado da interface

Manter nomes, descrições, ingredientes, caminhos das imagens e, no futuro, preços em uma fonte de dados organizada. Isso facilita atualizar o catálogo sem duplicar informações em vários componentes.

### Modelos 3D e imagens

- Preferir formatos eficientes e dimensões adequadas à tela.
- Comprimir imagens e gerar variantes responsivas.
- Carregar imagens abaixo da dobra de forma preguiçosa.
- Reservar espaço para as imagens para evitar mudanças bruscas no layout.
- Manter uma alternativa estática quando o modelo 3D não carregar.

### Preparação para expansão

Evitar misturar a apresentação visual com lógica de pagamento ou regras comerciais. Quando a loja for implementada, catálogo, carrinho, pedidos e integração de pagamento devem ser tratados como módulos separados, com validações próprias.

---

## 7. Responsividade, acessibilidade e qualidade

### Responsividade

- Desktop: composição cinematográfica com espaço para imagem principal e conteúdo.
- Tablet: reduzir efeitos e reorganizar colunas.
- Celular: priorizar título, imagem, CTA e catálogo em uma coluna ou carrossel acessível.
- Garantir que textos, botões e detalhes dos produtos permaneçam legíveis sem zoom.

### Acessibilidade

- HTML semântico.
- Textos alternativos úteis nas imagens.
- Contraste adequado.
- Navegação completa por teclado.
- Indicadores de foco visíveis.
- Botões com nomes acessíveis.
- Modais com foco controlado e fechamento acessível, caso sejam usados.
- Respeito à preferência por movimento reduzido do sistema.

### Desempenho

- Otimizar fontes, imagens, scripts e modelos 3D.
- Evitar vídeo ou 3D pesado como requisito para visualizar o conteúdo.
- Medir o carregamento e a experiência em rede móvel.
- Verificar Core Web Vitals antes de publicar.
- Evitar efeitos que provoquem deslocamentos inesperados de layout.

### SEO e compartilhamento

- Título e descrição únicos.
- Metadados Open Graph para compartilhamento.
- Ícone do site.
- URLs legíveis, quando houver páginas de produtos.
- Dados estruturados de produto somente quando as informações comerciais necessárias estiverem corretas e disponíveis.
- Conteúdo essencial acessível sem depender exclusivamente de JavaScript ou animações.

---

## 8. Etapas sugeridas de implementação

### Fase 1 — Base visual e conteúdo

- Conferir os arquivos existentes no repositório.
- Preparar a identidade visual com o logo oficial.
- Estruturar o layout responsivo.
- Cadastrar os sete sabores e suas descrições.
- Criar os componentes de navegação, cards e rodapé.

### Fase 2 — Experiência visual

- Produzir e otimizar as imagens necessárias.
- Implementar o hero cinematográfico.
- Adicionar transições, profundidade e microinterações.
- Avaliar se o modelo 3D real é melhor do que uma composição visual otimizada.
- Criar alternativas para movimento reduzido e dispositivos mais limitados.

### Fase 3 — Conversão e contato

- Configurar o canal de contato oficial.
- Implementar CTAs e fluxo de solicitação de pedido.
- Validar a experiência em telas pequenas.
- Não inventar dados comerciais nem simular pagamentos.

### Fase 4 — Preparação e evolução da loja

- Definir regras comerciais e estrutura de dados.
- Escolher o provedor de pagamento.
- Planejar carrinho, checkout, estoque e gestão de pedidos.
- Tratar segurança, privacidade, erros e confirmações.
- Implementar essas funções somente após definir e validar os requisitos.

### Fase 5 — Revisão e publicação

- Revisar ortografia e conteúdo dos sete sabores.
- Validar direitos de uso das imagens.
- Testar links, navegação, acessibilidade e responsividade.
- Medir desempenho em dispositivos reais.
- Configurar domínio, hospedagem e monitoramento conforme a escolha da marca.

---

## 9. Critérios de aceite da primeira versão

A primeira versão poderá ser considerada pronta quando:

- [ ] O logo oficial estiver integrado sem distorção.
- [ ] A paleta bordô e dourada estiver consistente.
- [ ] Os sete sabores do catálogo estiverem presentes e corretamente identificados.
- [ ] As descrições e os ingredientes estiverem de acordo com o catálogo aprovado.
- [ ] As imagens estiverem otimizadas e coerentes com cada produto.
- [ ] A navegação funcionar em desktop, tablet e celular.
- [ ] Os CTAs levarem a destinos válidos e configurados.
- [ ] As animações não impedirem a leitura ou navegação.
- [ ] A preferência por movimento reduzido for respeitada.
- [ ] Não houver preços, contatos, avaliações ou promessas inventadas.
- [ ] A documentação distinguir claramente recursos planejados dos implementados.
- [ ] A página passar por uma revisão final de desempenho e acessibilidade.

---

## 10. Informações que precisam ser confirmadas pela LM Pudins

Antes da publicação, confirmar:

- Logo em alta resolução e versão transparente, se disponível.
- Fotografias reais dos produtos ou autorização para usar imagens conceituais.
- Texto oficial sobre a história e os diferenciais da marca.
- Número de WhatsApp e links oficiais de redes sociais.
- Cidade e região de atendimento, entrega ou retirada.
- Tamanhos, pesos, preços e disponibilidade de cada sabor, se forem divulgados.
- Regras de encomenda, prazo mínimo e formas de pagamento.
- Informações de validade, conservação e alergênicos, caso sejam publicadas.
- Domínio e plataforma de hospedagem desejados.

Esses dados não são presumidos neste documento.

---

## 11. Referência de conteúdo

O catálogo oficial fornecido pela marca — **“receitas LM pudins.pdf”** — é a referência para os sete sabores, descrições e ingredientes apresentados neste README.

A direção visual deste documento é uma proposta criativa para o site; não substitui a confirmação das informações comerciais e dos processos reais de produção.

---

## 12. Resumo da proposta

A LM Pudins terá uma presença digital com estética premium, baseada em bordô, dourado, imagens gastronômicas marcantes e animações 3D discretas. O site apresentará a marca, contará sua história, valorizará os sete sabores e conduzirá o visitante a um canal de pedido.

A arquitetura será pensada para evoluir de uma landing page para uma loja virtual, sem adicionar complexidade prematuramente nem apresentar como concluídos recursos que ainda não foram construídos.

**Direção escolhida:** luxo e sofisticação, com bordô, dourado e 3D refinado.  
**Evolução desejada:** landing page → catálogo interativo → solicitação de pedido → loja virtual.

---

*Documento de visão e planejamento do projeto LM Pudins.*
