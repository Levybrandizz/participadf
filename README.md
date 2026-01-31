#  Participa DF - Ouvidoria Digital

![Badge: Concluído](https://img.shields.io/static/v1?label=STATUS&message=CONCLUÍDO&color=green&style=for-the-badge)
![Badge: PWA](https://img.shields.io/static/v1?label=PLATAFORMA&message=PWA%20MOBILE&color=blue&style=for-the-badge)
![Badge: Acessibilidade WCAG 2.1 AA](https://img.shields.io/static/v1?label=WCAG&message=2.1%20AA&color=orange&style=for-the-badge)

> Solução individual para o Hackathon em Controle Social do DF. Um PWA acessível, resiliente e com chatbot integrado.

---

## 📑 Sumário

- [🎯 Objetivo](#objetivo)
- [💡 Funcionalidades](#funcionalidades)
- [⚙️ Tecnologias](#tecnologias)
- [📹 Demonstração](#demonstracao)
- [⚡️ Primeiros Passos](#primeiros-passos)
  - [Pré-requisitos](#pre-requisitos)
  - [Instalação](#instalacao)
  - [Execução](#execucao)
    - [Opção A: Servidor Node.js (Recomendado)](#opcao-a-servidor-nodejs-recomendado)
    - [Opção B: Abertura Direta no Navegador](#opcao-b-abertura-direta-no-navegador)
- [♿ Acessibilidade](#acessibilidade)
- [🗂 Estrutura](#estrutura)
- [👨‍💻 Autor](#autor)

---

## 🎯 Objetivo

Modernizar o acesso à Ouvidoria do Distrito Federal, oferecendo uma solução web acessível, responsiva e disponível mesmo offline.

## 💡 Funcionalidades

*   **Multicanalidade:** Envio de manifestações por texto, áudio, vídeo e foto.
*   **Geolocalização:** Marcação de ocorrências no mapa.
*   **Chatbot IZA:** Assistente virtual para auxiliar no registro.
*   **Resiliência:** Operação offline e salvamento automático de rascunhos.
*   **Acessibilidade:** Conformidade com WCAG 2.1 AA e VLibras.

## ⚙️ Tecnologias

*   HTML5, CSS3, JavaScript (ES6+)
*   Bootstrap 5.3
*   Leaflet.js
*   SweetAlert2
*   Driver.js
*   Animate.css
*   Express.js

<div align="center">

| **🏠 Home & Login** | **🤖 Chatbot IZA** | **📍 Print 3** |
|:---:|:---:|:---:|
| <img src="./img/1.png" width="250" alt="Tela Inicial"> | <img src="./img/2.png" width="250" alt="Seleção de Tipo"> | <img src="./img/3.png" width="250" alt="Geolocalização"> |
| *Acesso via Gov.br ou Anônimo* | *Interface intuitiva para categorias* | *Mapa interativo e Uploads* |

| **🤖 Print 4** | **🎫 Print 5** | ** Print 6** |
|:---:|:---:|:---:|
| <img src="./img/5.png" width="250" alt="Chatbot IZA"> | <img src="./img/4.png" width="250" alt="Sucesso"> | <img src="./img/6.png" width="250" alt="Acessibilidade"> |
| *IA para triagem automática* | *Comprovante digital imediato* | *Alto contraste e Fontes* |

</div>

> *Nota: O layout é responsivo e adaptado para dispositivos móveis (Mobile-First).*

---


## 📹 Demonstração

Confira o vídeo da solução em ação:

[![Vídeo Demo](https://img.youtube.com/vi/[link aqui]/maxresdefault.jpg)](https://youtu.be/link aq)
> **Link:** [https://youtu.be/link d video aq](https://youtu.be/link do video aq)

---

## ⚡️ Primeiros Passos

### Pré-requisitos

*   Editor de código (VS Code, Sublime Text, etc.)
*   Navegador web moderno (Chrome, Firefox, etc.)
*   Node.js e npm (opcional, para execução via servidor)

### Instalação

1.  Clone o repositório:
    ```bash
    git clone https://github.com/Levybrandizz/PwaDF.git
    cd PwaDF
    ```
2.  (Opcional) Se optar por executar via servidor Node.js, instale as dependências:
    ```bash
    npm install
    ```

### Execução

Você pode executar o projeto de duas formas:

#### Opção A: Servidor Node.js (Recomendado)

1.  Após instalar as dependências, inicie o servidor:
    ```bash
    npm start
    ```
2.  Acesse `http://localhost:3000` no navegador.

#### Opção B: Abertura Direta no Navegador

1.  Navegue até a pasta do projeto no seu sistema de arquivos.
2.  Abra o arquivo `index.html` diretamente no navegador (dê um duplo clique nele).
3.  **Observação:** Algumas funcionalidades (como o Service Worker) podem ser restritas ao executar desta forma.

## ♿ Acessibilidade

*   Menu de acessibilidade com opções de alto contraste, fonte para dislexia e ajuste de tamanho.
*   VLibras para tradução automática para LIBRAS.
*   Conformidade com WCAG 2.1 AA.

## 🗂 Estrutura
## 👨‍💻 Autor

Levy Brandizzi

*   GitHub: [https://github.com/Levybrandizz](https://github.com/Levybrandizz)


---

<p align="center">
  Feito de ❤️
</p>
