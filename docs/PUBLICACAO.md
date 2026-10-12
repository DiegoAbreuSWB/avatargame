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

Publicado em **https://diegoabreuswb.github.io/avatargame/** a partir do repositório https://github.com/DiegoAbreuSWB/avatargame.

Como funciona: o workflow `.github/workflows/pages.yml` roda a cada push na `main` e espelha o site na branch `gh-pages`
(ação `peaceiris/actions-gh-pages`, excluindo `.github`, `tests/out` e `dist`). Em repositório público, o GitHub ativa o Pages
sozinho quando a branch `gh-pages` aparece; não é preciso mexer em Settings → Pages.

Por que não a fonte "GitHub Actions": a ação `configure-pages` precisa criar o site pela API e o token padrão do workflow
não tem essa permissão ("Resource not accessible by integration"); exigiria uma ativação manual nas configurações.

Para publicar uma nova versão: faça push na `main` (ou Actions → "Publicar no GitHub Pages" → Run workflow). O site atualiza em um ou dois minutos.
Todos os caminhos são relativos, então funciona na subpasta `/avatargame/`; o `sw.js` tem escopo dessa pasta.

## Qualquer servidor próprio

Copie a pasta para o servidor e sirva por https (o service worker e a Gamepad API em alguns navegadores exigem https ou localhost).
Para testar localmente com PWA: `npx serve .` ou `python -m http.server 8080` e abra `http://localhost:8080/`.

## Checklist antes de publicar

- `node tests/run.js all` e `node tests/run.js all --3d` passando.
- `node tools/frame-data.js` atualizado.
- Versão em `sw.js` (`VERSION`) incrementada, senão navegadores antigos continuam com o cache velho.
- `docs/DECISOES.md` com as decisões da versão.
