# Publicação

O jogo é um site estático: qualquer hospedagem que sirva arquivos funciona. O modo 3D carrega o Three.js
de um CDN, então o jogador precisa de internet na primeira visita; depois disso o service worker guarda tudo
(inclusive o CDN) para jogar offline.

## Pacote

```powershell
.\tools\package.ps1 -Version 0.5.0
```

Gera `dist/avatar-arena-0.5.0.zip` com `index.html` na raiz, `css/`, `js/`, `icons/`, `manifest.webmanifest`, `sw.js` e o README.

## itch.io

1. Crie um projeto em https://itch.io/game/new com **Kind of project: HTML**.
2. Envie o zip e marque **"This file will be played in the browser"**.
3. Em *Embed options*: viewport **1280 x 720**, marque **Fullscreen button** e **Mobile friendly** (os controles de toque aparecem sozinhos em telas sensíveis ao toque).
4. Em *Frame options* deixe **SharedArrayBuffer support** desmarcado (não é usado).
5. Salve como *Public* ou *Restricted* e teste o link. O itch serve por https, então o PWA e o service worker funcionam.

Observação: dentro do iframe do itch o teclado só responde depois de um clique no jogo; o overlay "Pressione Enter" já cobre isso.

## GitHub Pages

1. Crie um repositório no GitHub e envie o conteúdo (`git remote add origin ...` e `git push -u origin main`).
2. Em **Settings → Pages**, escolha *Deploy from a branch*, branch `main`, pasta `/ (root)`.
3. O jogo fica em `https://<usuario>.github.io/<repositorio>/`. Todos os caminhos são relativos, então funciona em subpasta.
4. O `sw.js` tem escopo da pasta do repositório; se publicar em outro caminho, nada precisa mudar.

## Qualquer servidor próprio

Copie a pasta para o servidor e sirva por https (o service worker e a Gamepad API em alguns navegadores exigem https ou localhost).
Para testar localmente com PWA: `npx serve .` ou `python -m http.server 8080` e abra `http://localhost:8080/`.

## Checklist antes de publicar

- `node tests/run.js all` e `node tests/run.js all --3d` passando.
- `node tools/frame-data.js` atualizado.
- Versão em `sw.js` (`VERSION`) incrementada, senão navegadores antigos continuam com o cache velho.
- `docs/DECISOES.md` com as decisões da versão.
