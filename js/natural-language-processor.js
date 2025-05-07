/**
 * ViajarMax - Processador de Linguagem Natural
 * Este módulo utiliza a API da Anthropic (Claude) para processar consultas em linguagem natural
 * e extrair informações sobre viagens.
 * 
 * Observação: No ambiente do navegador, não temos acesso direto ao SDK da Anthropic,
 * então vamos usar fetch para chamar a API diretamente.
 */

// A chave da API será carregada do servidor
const ANTHROPIC_API_KEY = "ANTHROPIC_API_KEY";

/**
 * Processa uma consulta em linguagem natural e extrai informações relevantes sobre a viagem
 * @param {string} query - A consulta em linguagem natural (ex: "quero viajar pra São Paulo, estou no Rio de Janeiro, dia 25")
 * @returns {Promise<Object>} - Objeto com os dados extraídos (origem, destino, data)
 */
export async function processNaturalLanguageQuery(query) {
    try {
        console.log("Processando consulta natural:", query);
        
        // Chama a API de processamento de linguagem natural usando URL relativa
        const response = await fetch('/api/nlp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query })
        });
        
        // Verifica se a resposta é válida
        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        // Obtém os dados extraídos
        const result = await response.json();
        console.log("Dados extraídos da consulta em linguagem natural:", result);
        
        return result;
    } catch (error) {
        console.error("Erro ao processar a consulta em linguagem natural:", error);
        
        // Se a API falhar, tenta usar a extração básica como fallback
        console.log("Utilizando extração básica como fallback...");
        const fallbackResult = extractBasicTravelInfo(query);
        
        return fallbackResult;
    }
}

/**
 * Função auxiliar para extrair informações básicas de viagem do texto
 * Implementação simplificada para uso como fallback
 * @param {string} text - O texto da consulta
 * @returns {Object} - Objeto com dados extraídos
 */
function extractBasicTravelInfo(text) {
    text = text.toLowerCase();

    // Dicionário de cidades e seus códigos de aeroporto
    const cities = {
        'são paulo': 'GRU',
        'sao paulo': 'GRU',
        'rio de janeiro': 'GIG',
        'rio': 'GIG',
        'brasília': 'BSB',
        'brasilia': 'BSB',
        'salvador': 'SSA',
        'recife': 'REC',
        'fortaleza': 'FOR',
        'belo horizonte': 'CNF',
        'curitiba': 'CWB',
        'porto alegre': 'POA',
        'manaus': 'MAO',
        'belém': 'BEL',
        'belem': 'BEL',
        'florianópolis': 'FLN',
        'florianopolis': 'FLN',
        'natal': 'NAT',
        'goiânia': 'GYN',
        'goiania': 'GYN'
    };

    // Extração de origem
    let origin = null;
    const originPatterns = ['de ', 'partindo de ', 'saindo de ', 'estou em ', 'origem '];
    for (const pattern of originPatterns) {
        if (text.includes(pattern)) {
            for (const city in cities) {
                if (text.includes(pattern + city)) {
                    origin = cities[city];
                    break;
                }
            }
            if (origin) break;
        }
    }

    // Extração de destino
    let destination = null;
    const destPatterns = ['para ', 'indo para ', 'destino ', 'chegando em ', 'ir para '];
    for (const pattern of destPatterns) {
        if (text.includes(pattern)) {
            for (const city in cities) {
                if (text.includes(pattern + city)) {
                    destination = cities[city];
                    break;
                }
            }
            if (destination) break;
        }
    }

    // Extração de data (simplificada)
    let date = null;
    const months = {
        'janeiro': '01', 'fevereiro': '02', 'março': '03', 'marco': '03', 
        'abril': '04', 'maio': '05', 'junho': '06', 'julho': '07', 
        'agosto': '08', 'setembro': '09', 'outubro': '10', 
        'novembro': '11', 'dezembro': '12'
    };
    
    // Padrão: "dia X de MÊS"
    const dateRegex = /dia (\d{1,2}) de ([a-zç]+)/i;
    const match = text.match(dateRegex);

    if (match) {
        const day = match[1].padStart(2, '0');
        const monthName = match[2].toLowerCase();
        if (months[monthName]) {
            const month = months[monthName];
            // Assumindo o ano atual para simplificar
            const year = new Date().getFullYear();
            date = `${year}-${month}-${day}`;
        }
    }

    // Extração de número de passageiros
    let passengers = 1; // Valor padrão
    const passengersRegex = /(\d+) (passageiros|pessoas|adultos)/i;
    const passengersMatch = text.match(passengersRegex);
    if (passengersMatch) {
        passengers = parseInt(passengersMatch[1], 10);
    }

    // Extração de classe da cabine
    let cabinClass = 'economy'; // Valor padrão
    if (text.includes('executiva') || text.includes('business')) {
        cabinClass = 'business';
    } else if (text.includes('primeira classe') || text.includes('first class')) {
        cabinClass = 'first';
    }

    return {
        origin,
        destination,
        date,
        passengers,
        cabinClass
    };
}