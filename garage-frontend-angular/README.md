# Garage Frontend (Angular)

Front-end em **Angular 18** (standalone components, signals) para o microsserviço
`garage-service`, recriando visualmente a tela de garagem do **Gran Turismo 4**.

---

## Stack

- Angular 18 (standalone components — sem NgModules)
- Signals (`signal`, `computed`) para todo o estado reativo
- `HttpClient` para consumir a API REST do backend
- CSS puro (sem framework de UI), com o design system GT4 inteiro em `src/styles.css`
- TypeScript estrito

---

## Como rodar

Pré-requisitos: **Node.js 18+** e **npm**.

```bash
cd garage-frontend-angular
npm install
npm start
```

A aplicação abre em `http://localhost:4200`.

> O `npm install` precisa de acesso à internet (baixa o Angular e dependências do
> `package.json`). Esse passo não pôde ser executado no ambiente onde o projeto
> foi gerado — rode-o na sua máquina antes do primeiro `npm start`.

> **Dica de velocidade:** rode `npm install` numa pasta fixa e **não delete
> `node_modules`** entre uma alteração e outra. Se a IA te devolver só os
> arquivos que mudaram (em vez do projeto zipado de novo), copie-os por cima
> dessa mesma pasta — assim você reaproveita o `node_modules` já instalado e o
> cache de build do Angular (`.angular/cache`), e o `ng serve`/`ng build`
> ficam na casa de segundos em vez de reinstalar tudo do zero a cada mudança.
> Para um build local rápido (sem a otimização completa de produção), use
> `npm run build:dev`.

---

## Conectando ao backend

O front-end espera o `garage-service` rodando em `http://localhost:8080` (a porta
padrão definida no `application.yml` do backend).

Isso está configurado em:

```
src/environments/environment.ts        (desenvolvimento — usado pelo `npm start`)
src/environments/environment.prod.ts   (produção — usado pelo `npm run build`)
```

```ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080/api/v1',
  tokenRefreshIntervalMs: 5 * 60 * 1000, // fallback; o valor real vem do backend no login
};
```

Se o backend estiver em outro host/porta, basta editar `apiBaseUrl` nesses dois
arquivos.

### CORS

O backend já vem com CORS liberado em `/api/**` (ver `CorsConfig.java` no projeto
do back-end), então não é necessário nenhum proxy adicional para desenvolvimento.

### Suba o backend primeiro

```bash
cd garage-service
mvn spring-boot:run
```

Sem o backend rodando, a tela carrega normalmente mas mostra um aviso vermelho
("Could not reach the garage-service backend...") e a tabela fica vazia — é o
comportamento esperado, não um bug.

---

## Estrutura do projeto

```
src/
├── index.html
├── main.ts                      → bootstrap da aplicação standalone
├── styles.css                   → design system GT4 completo (cores, tipografia, layout)
├── environments/                 → URL base da API (dev/prod)
├── assets/
│   ├── flags/                   → bandeiras dos 9 países (SVG)
│   ├── logos/                   → logos das 67 marcas (PNG) — usados como fallback visual;
│   │                              a tabela também pode consumir os logos direto do backend
│   │                              via GET /api/v1/brands/{id}/logo
│   └── cursor/                  → cursor customizado estilo GT4 (SVG)
└── app/
    ├── app.component.ts           → shell raiz, hospeda apenas o <router-outlet>
    ├── app.routes.ts               → rotas: /login (pública) e '' (garagem, com guard)
    ├── app.config.ts               → providers (HttpClient + interceptor, Animations, Router)
    ├── garage-shell.component.ts   → tela da garagem (o antigo conteúdo de AppComponent)
    ├── guards/
    │   └── auth.guard.ts           → bloqueia a rota da garagem sem token
    ├── interceptors/
    │   └── auth.interceptor.ts     → anexa o Bearer token e trata 401 (logout + redirect)
    ├── models/                    → interfaces TS que espelham os DTOs do backend
    │   ├── country.model.ts
    │   ├── brand.model.ts
    │   ├── car.model.ts
    │   ├── drivetrain.model.ts
    │   ├── engine-layout.model.ts
    │   ├── color-bands.model.ts  → parsing/serialização das bandas de cor
    │   ├── asset-lookup.model.ts → mapa país→bandeira e marca→logo (uso local)
    │   └── auth.model.ts         → LoginRequest / TokenResponse (espelha AuthDto)
    ├── services/
    │   ├── garage-api.service.ts    → todas as chamadas HTTP ao backend
    │   ├── garage-state.service.ts  → estado central (signals): lista de carros,
    │   │                                filtros, busca, ordenação, coluna variável,
    │   │                                ordem manual (drag & drop), CRUD
    │   └── auth.service.ts          → login, logout, token em sessionStorage,
    │                                    agendamento do refresh automático (5 min)
    └── components/
        ├── login/                → tela de login (usuário/senha)
        ├── garage-header/        → cabeçalho "Garage" + carro selecionado + Log out
        ├── filter-bar/           → Country / Manufacturer / Drivetrain / Search + "New car"
        ├── column-picker/        → escolha das colunas B/C/D variáveis
        ├── car-table/            → tabela principal (sort, seleção, drag-to-reorder, ações)
        ├── color-rect/
        │   ├── color-rect.component.ts        → retângulo vertical de cor (somente leitura)
        │   └── color-band-editor.component.ts → editor de cor com múltiplas bandas
        ├── car-form-modal/       → modal de criar/editar carro (todos os campos)
        ├── confirm-modal/        → confirmação de exclusão
        └── toast/                → notificações flutuantes
```

---

## Sobre a cor do carro (retângulo vertical)

O backend guarda a cor como uma string (`colorHex`). Para reproduzir o efeito das
referências do GT4 — um retângulo vertical dividido em faixas de cores, cada uma
ocupando uma porcentagem diferente — o front-end usa um formato compacto:

```
#FFFFFF:40;#8B0000:35;#C0C0C0:25
```

ou seja, `HEX:percentual` separados por `;`, até 4 bandas. Uma cor simples
(`#C40233`, sem `:` nem `;`) continua funcionando normalmente e é tratada como
uma única banda de 100%.

O componente `app-color-band-editor` (usado no modal de criar/editar carro) já
oferece a interface para adicionar/remover bandas e ajustar cor + percentual com
um preview em tempo real; o componente `app-color-rect` (usado na tabela) apenas
desenha o resultado.

> O backend foi ajustado (`Car.colorHex` agora aceita até 60 caracteres, e a
> validação em `CarDto.Request` aceita tanto o formato simples quanto o de
> múltiplas bandas) para suportar esse formato. Se você está usando uma versão
> mais antiga do backend, atualize-a com o `CarDto.java` e `Car.java` deste pacote.

---

## Login e sessão

O backend agora exige autenticação (ver README do `garage-service`). O front-end:

1. Mostra a tela de login (`/login`) com usuário/senha.
2. Ao logar com sucesso, guarda o token JWT em `sessionStorage` (sobrevive a um reload
   da página na mesma aba; some ao fechar a aba/navegador).
3. Anexa automaticamente `Authorization: Bearer <token>` em toda chamada à API
   (`AuthInterceptor`).
4. **Renova o token automaticamente em segundo plano**, sempre um pouco antes dele
   expirar (o backend emite tokens de 5 minutos; o front agenda a renovação ~30s antes
   do vencimento), então a sessão permanece ativa enquanto a aba estiver aberta — sem
   pedir a senha de novo.
5. Se qualquer chamada retornar `401` (token ausente/expirado/inválido e a renovação já
   tiver falhado), o usuário é deslogado e redirecionado para `/login` automaticamente.
6. O botão **Log out** no cabeçalho encerra a sessão manualmente.

Usuário único, igual ao backend:

```
usuário: admin
senha:   user1234
```

---

## Funcionalidades implementadas

- **Login obrigatório**: tela de login, sessão com renovação automática de token a
  cada ~5 minutos, e logout manual pelo cabeçalho.
- **Listagem estilo GT4**: bandeira do país, logo da marca, nome, retângulo de
  cor, ano, e três colunas variáveis.
- **Colunas variáveis** (escolhidas pelo usuário no seletor acima da tabela):
  - Coluna B: Motor **ou** Drivetrain
  - Coluna C: Cavalos (HP), Torque **ou** RPM
  - Coluna D: Peso, Altura, Comprimento **ou** Largura
- **Filtros**: Country, Manufacturer (já filtrado pelo país escolhido) e
  Drivetrain — todos combináveis.
- **Busca** por nome do carro.
- **Ordenação** por clique no cabeçalho (nome, ano, ou qualquer uma das colunas
  variáveis B/C/D), com indicador de direção (▲/▼).
- **Reordenação manual** por arrastar-e-soltar (drag & drop) nas linhas da
  tabela — ao reordenar manualmente, a ordenação por cabeçalho é desativada até
  você clicar em um cabeçalho novamente.
- **CRUD completo de carros**:
  - Criar (`+ New car`)
  - Editar (ícone de lápis em cada linha)
  - Excluir, com modal de confirmação (ícone × em cada linha)
  - Todos os campos do backend são editáveis: nome, marca, cor (com múltiplas
    bandas), ano, cavalos, drivetrain, torque, RPM, motor (nome + layout), peso
    e as três dimensões.
- **Cursor customizado** estilo GT4 (a seta dourada em formato de dardo) em toda
  a aplicação.
- **Notificações** (toast) de sucesso/erro ao salvar, editar ou excluir.

---

## Build de produção

```bash
npm run build
```

Gera os arquivos estáticos em `dist/garage-frontend/`, prontos para servir por
qualquer servidor HTTP (Nginx, Apache, `serve`, etc.).

---

## Sobre a fonte

O design usa **Helvetica Pan-European LT Std** como fonte primária
(`--font-display` em `styles.css`). Essa é uma fonte comercial licenciada pela
Linotype/Monotype e **não está incluída** neste pacote (não pode ser
redistribuída livremente).

Se você tiver uma licença da fonte, converta o arquivo para `.woff2` e:

1. Coloque-o em `src/assets/fonts/HelveticaPanEuropeanLTStd.woff2`
2. Em `src/styles.css`, descomente o bloco `@font-face` no topo do arquivo e
   ajuste o caminho se necessário.

Sem isso, o layout usa automaticamente o fallback (`Helvetica Neue`/`Helvetica`/
`Arial`, todas em negrito), que já reproduz fielmente o peso e o estilo visual
da UI original.
