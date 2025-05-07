# ViajarMax - Sistema de Busca de Voos

Um sistema moderno de busca de voos para o mercado brasileiro, com interface simplificada e intuitiva.

## Funcionalidades

- Interface de busca simplificada e intuitiva
- Busca padrão com seleção de origem/destino, datas e número de passageiros
- Busca por linguagem natural (NLP) usando API Claude da Anthropic
- Reconhecimento de voz para comandos de busca
- Resultados de voos organizados e filtráveis
- Design responsivo com interface moderna

## Tecnologias Utilizadas

- Frontend: HTML5, CSS3, JavaScript (vanilla)
- Backend: Python (servidor unificado)
- APIs: Anthropic Claude (processamento de linguagem natural), RapidAPI (dados de voos)
- Servidor HTTP para servir arquivos estáticos e APIs

## Estrutura do Projeto

- `index.html` - Página principal com o formulário de busca
- `flight-results.html` - Página de resultados de voos
- `css/` - Estilos CSS
- `js/` - Scripts JavaScript
- `unified_server.py` - Servidor Python unificado

## Como Executar

1. Certifique-se de ter Python 3.7+ instalado
2. Clone este repositório
3. Instale as dependências: `pip install anthropic requests trafilatura`
4. Configure as variáveis de ambiente:
   - `ANTHROPIC_API_KEY` - Chave de API da Anthropic
   - `RAPIDAPI_KEY` - Chave de API da RapidAPI
5. Execute o servidor: `python unified_server.py`
6. Acesse `http://localhost:5000` no navegador

## Melhorias Futuras

- Implementação de filtros adicionais nos resultados
- Inclusão de opções para hospedagem
- Sistema de autenticação de usuários
- Histórico de pesquisas
- Alertas de preços

## Criado por

Desenvolvido como parte do projeto de modernização do site ViajarMax.com.br