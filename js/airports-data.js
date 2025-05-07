/**
 * ViajarMax - Dados de Aeroportos
 * Este arquivo contém dados estáticos de aeroportos brasileiros para uso na aplicação
 */

// Lista de aeroportos brasileiros
const airportsData = [
    { code: "GRU", cityName: "São Paulo", airportName: "Aeroporto Internacional de Guarulhos" },
    { code: "CGH", cityName: "São Paulo", airportName: "Aeroporto de Congonhas" },
    { code: "VCP", cityName: "Campinas", airportName: "Aeroporto Internacional de Viracopos" },
    { code: "GIG", cityName: "Rio de Janeiro", airportName: "Aeroporto Internacional do Galeão" },
    { code: "SDU", cityName: "Rio de Janeiro", airportName: "Aeroporto Santos Dumont" },
    { code: "BSB", cityName: "Brasília", airportName: "Aeroporto Internacional de Brasília" },
    { code: "CNF", cityName: "Belo Horizonte", airportName: "Aeroporto Internacional de Confins" },
    { code: "SSA", cityName: "Salvador", airportName: "Aeroporto Internacional de Salvador" },
    { code: "REC", cityName: "Recife", airportName: "Aeroporto Internacional de Recife" },
    { code: "FOR", cityName: "Fortaleza", airportName: "Aeroporto Internacional de Fortaleza" },
    { code: "CWB", cityName: "Curitiba", airportName: "Aeroporto Internacional de Curitiba" },
    { code: "POA", cityName: "Porto Alegre", airportName: "Aeroporto Internacional de Porto Alegre" },
    { code: "FLN", cityName: "Florianópolis", airportName: "Aeroporto Internacional de Florianópolis" },
    { code: "VIX", cityName: "Vitória", airportName: "Aeroporto de Vitória" },
    { code: "MAO", cityName: "Manaus", airportName: "Aeroporto Internacional de Manaus" },
    { code: "NAT", cityName: "Natal", airportName: "Aeroporto Internacional de Natal" },
    { code: "BEL", cityName: "Belém", airportName: "Aeroporto Internacional de Belém" },
    { code: "GYN", cityName: "Goiânia", airportName: "Aeroporto de Goiânia" },
    { code: "MCZ", cityName: "Maceió", airportName: "Aeroporto Internacional de Maceió" },
    { code: "CGB", cityName: "Cuiabá", airportName: "Aeroporto Internacional de Cuiabá" },
    { code: "JPA", cityName: "João Pessoa", airportName: "Aeroporto Internacional de João Pessoa" },
    { code: "SLZ", cityName: "São Luís", airportName: "Aeroporto Internacional de São Luís" },
    { code: "AJU", cityName: "Aracaju", airportName: "Aeroporto de Aracaju" },
    { code: "PMW", cityName: "Palmas", airportName: "Aeroporto de Palmas" },
    { code: "THE", cityName: "Teresina", airportName: "Aeroporto de Teresina" }
];

/**
 * Função para buscar aeroportos com base em uma consulta
 * @param {string} query - Texto para filtrar aeroportos
 * @returns {Array} - Lista de aeroportos filtrados
 */
export function searchLocalAirports(query) {
    // Se não houver consulta ou for muito curta, retorna lista vazia
    if (!query || query.length < 2) {
        return [];
    }
    
    // Normaliza a consulta (remove acentos, caixa baixa)
    const normalizedQuery = query.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    
    // Filtra os aeroportos com base na consulta
    return airportsData.filter(airport => {
        // Normaliza os campos para comparação
        const cityName = airport.cityName.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
        
        const airportName = airport.airportName.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
        
        const code = airport.code.toLowerCase();
        
        // Verifica se a consulta existe em qualquer um dos campos
        return cityName.includes(normalizedQuery) || 
               airportName.includes(normalizedQuery) || 
               code.includes(normalizedQuery);
    });
}

// Exporta os dados para uso em outros módulos
export { airportsData };