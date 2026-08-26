# ORION AR EDU — Circulação Sanguínea

Primeiro protótipo de WebAR baseado em reconhecimento da imagem da página.

## O que já está preparado

- imagem-alvo em `assets/target.jpg`
- WebAR com MindAR + A-Frame
- reconhecimento da página
- animação de fluxo azul/vermelho
- destaque pulsante do coração
- narração em português via `speechSynthesis`
- quiz simples
- interface para iPhone/iPad
- compilador local de target em `compile.html`

## 1. Gerar targets.mind

A experiência precisa do arquivo binário `targets.mind`.

Opção mais simples: abra o compilador oficial do MindAR:
https://hiukim.github.io/mind-ar-js-doc/tools/compile/

Envie `assets/target.jpg`, compile e baixe `targets.mind`.

Depois coloque `targets.mind` na mesma pasta de `index.html`.

Também existe `compile.html` neste projeto, que tenta fazer a compilação diretamente no navegador.

## 2. Hospedar por HTTPS

Câmera em navegador exige contexto seguro. Para teste público, publique a pasta em um serviço HTTPS, por exemplo GitHub Pages, Netlify, Vercel ou outro servidor HTTPS.

## 3. Testar

Abra `index.html` pelo endereço HTTPS no Safari do iPhone/iPad.

Toque em `INICIAR EXPERIÊNCIA AR`, permita a câmera e aponte para a imagem-alvo.

## 4. Próxima evolução

Esta primeira versão usa partículas 2D/2.5D ancoradas no target. O próximo passo é separar o conteúdo em camadas mais precisas e substituir os caminhos aproximados por trajetórias alinhadas exatamente às artérias, veias, pulmões e coração.

Depois podemos adicionar:
- modelos 3D GLB;
- hotspots nos órgãos;
- narração profissional;
- animação de sangue;
- botão de pausa;
- controle de velocidade;
- modo professor/aluno;
- QR Code;
- banco de experiências ORION AR EDU.
