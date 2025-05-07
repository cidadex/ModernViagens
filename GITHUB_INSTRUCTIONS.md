# Instruções para Upload no GitHub

Siga este guia passo a passo para fazer o upload deste projeto para o GitHub e disponibilizá-lo para acesso pelo ChatGPT.

## 1. Criar uma conta no GitHub (se ainda não tiver)

- Acesse [GitHub](https://github.com)
- Clique em "Sign Up" e siga as instruções para criar uma conta

## 2. Criar um novo repositório

1. Após fazer login, clique no botão "+" no canto superior direito
2. Selecione "New repository"
3. Preencha os detalhes:
   - Nome do repositório: `viajarmax-flight-search` (ou outro nome de sua preferência)
   - Descrição: "Sistema moderno de busca de voos para o mercado brasileiro"
   - Visibilidade: Public (para que o ChatGPT possa acessar)
   - Deixe as opções "Add a README file", "Add .gitignore", e "Choose a license" desmarcadas
4. Clique em "Create repository"

## 3. Baixar o código deste projeto

1. Na interface da Replit, clique nos três pontos verticais ao lado de cada arquivo ou pasta
2. Selecione "Download" para baixar os arquivos individualmente
3. Alternativamente, crie um arquivo ZIP com todo o conteúdo:
   - Na Replit, clique no menu lateral "Files"
   - Selecione os arquivos e pastas principais:
     - Diretório `css/`
     - Diretório `js/`
     - Arquivo `index.html`
     - Arquivo `flight-results.html`
     - Arquivo `unified_server.py`
     - Arquivo `README.md`
     - Arquivo `.gitignore`
     - Arquivo `dependencies.txt`
   - Clique com o botão direito e escolha "Download" para baixar os arquivos selecionados

## 4. Fazer o upload para o GitHub

### Método 1: Upload via interface web (mais fácil)

1. No seu repositório GitHub recém-criado, clique no link "uploading an existing file"
2. Arraste e solte os arquivos e pastas baixados para a área indicada
3. Adicione uma mensagem de commit como "Versão inicial do sistema de busca de voos"
4. Clique em "Commit changes"

### Método 2: Usando Git na linha de comando (mais completo)

Se você tem o Git instalado no seu computador:

1. Clone o repositório vazio:
   ```
   git clone https://github.com/seu-username/viajarmax-flight-search.git
   cd viajarmax-flight-search
   ```

2. Copie todos os arquivos baixados para esta pasta

3. Adicione os arquivos, faça commit e push:
   ```
   git add .
   git commit -m "Versão inicial do sistema de busca de voos"
   git push origin main
   ```

## 5. Verificar os arquivos no GitHub

- Após o upload, verifique se todos os arquivos e diretórios estão visíveis no GitHub
- Certifique-se de que a estrutura do projeto está correta

## 6. Tornar o repositório acessível ao ChatGPT

Para permitir que o ChatGPT visualize e analise seu código:

1. Garanta que o repositório está público
2. Copie a URL do repositório (exemplo: `https://github.com/seu-username/viajarmax-flight-search`)
3. Compartilhe esta URL em sua conversa com o ChatGPT

## 7. Arquivos importantes para incluir

Certifique-se de incluir no mínimo:

- **HTML**: `index.html`, `flight-results.html`
- **CSS**: Pasta `css/` completa
- **JavaScript**: Pasta `js/` completa
- **Python**: `unified_server.py`
- **Documentação**: `README.md`, `.gitignore`, `dependencies.txt`

Nota: Evite fazer upload de arquivos com informações sensíveis, como chaves de API ou senhas.