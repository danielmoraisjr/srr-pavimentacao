# S.R.R. Prestação de Serviços · Pavimentação asfáltica

Site estático (sem build). Rodar local: `cd srr && python3 -m http.server 8000`.

## Como está montado
Base comercial, a mesma linha do site do Alemão Pneus: topo escuro com o caminhão da logo,
atalhos (orçamento, recapeamento, pavimentação, ligar), carrossel de serviços, comparação
antes/depois de arrastar, galeria de obras em carrossel, passo a passo, orçamento pelo
WhatsApp e botão flutuante do WhatsApp.

## Fotos das obras (carrossel)
1. Coloque as fotos em `assets/obras/` (de preferência .webp ou .jpg, na horizontal).
2. Liste em `js/main.js`, na constante `OBRAS`:
   `{ src: "assets/obras/01.webp", legenda: "Recapeamento · Rua X, Bauru" }`
Sem fotos, o carrossel mostra espaços reservados.

## Dados usados (vindos do cliente)
- Nome, slogan, serviço e telefones: tirados da logo (`tools/logo-original.png`).
- WhatsApp do formulário e dos botões: (14) 99721-7335, do Rafael.
- Horário: "horário comercial". No site está como "Horário comercial, de segunda a sexta".
- Endereço: **não aparece no site**, porque é residencial. Só a região: "Interior de São Paulo · DDD 14".

## Pendente: confirmar com o cliente
- **Cidade(s) atendida(s)**: com elas dá para melhorar o SEO local (title, description, JSON-LD `areaServed`).
- **Segundo número (98810-1699)**: de quem é? Hoje aparece sem nome.
- **Sábado**: abrem ou não?
- **Onde aplicamos** (ruas, condomínios, pátios e estacionamentos, acessos de empresas,
  loteamentos) e as etapas de "Como fazemos": são o padrão do serviço. Confirmar que
  a S.R.R. faz todas elas.
- **Fotos reais de obras**, principalmente de antes e depois. O site não usa nenhuma foto
  inventada: as texturas de asfalto são geradas em `tools/textures.py`. Quando as fotos
  chegarem, entra uma seção de obras entre "O serviço" e "Como fazemos".
- **Domínio**: assim que houver um, trocar `og:image` por URL absoluta.

## Arquivos
- `index.html`, `css/style.css`, `js/main.js` (JS puro, sem bibliotecas).
- `fonts/`: Kanit (títulos) e Barlow (texto), servidas localmente.
- `assets/img/asphalt-*.webp`: texturas que se repetem sem emenda (`python3 tools/textures.py`).
