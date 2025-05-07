/**
 * ViajarMax - API de Voos
 * Este módulo lida com chamadas à API de Cheap Flights da RapidAPI para buscar informações sobre voos.
 * 
 * Observação: No ambiente do navegador, não temos acesso direto às variáveis de ambiente,
 * então vamos usar uma abordagem simplificada para demonstração.
 */

// Configuração da API (para demonstração)
const RAPIDAPI_KEY = "RAPIDAPI_KEY"; // Será substituído por uma abordagem de servidor em produção
const RAPIDAPI_HOST = 'priceline-com-provider.p.rapidapi.com';
const BASE_URL = 'https://priceline-com-provider.p.rapidapi.com';

/**
 * Busca voos com base nos parâmetros informados
 * @param {Object} params - Parâmetros de busca
 * @param {string} params.origin - Código do aeroporto de origem
 * @param {string} params.destination - Código do aeroporto de destino
 * @param {string} params.departDate - Data de partida (YYYY-MM-DD)
 * @param {string} [params.returnDate] - Data de retorno (YYYY-MM-DD) para voos de ida e volta
 * @param {number} [params.adults=1] - Número de adultos
 * @param {string} [params.cabinClass='ECO'] - Classe da cabine (ECO, BUS, FST)
 * @returns {Promise<Object>} - Resultados da busca de voos
 */
export async function searchFlights(params) {
    try {
        // Valida os parâmetros obrigatórios
        if (!params.origin || !params.destination || !params.departDate) {
            throw new Error('Parâmetros obrigatórios ausentes: origem, destino e data de partida são necessários');
        }

        console.log(`[ViajarMax] Buscando voos de ${params.origin} para ${params.destination} na data ${params.departDate}`);
        
        // Faz a requisição à API usando URL relativa
        const response = await fetch('/api/flights', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        });
        
        // Verifica se a resposta é válida
        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('[ViajarMax] Resultados da busca de voos:', data);
        
        return data;
    } catch (error) {
        console.error('[ViajarMax ERROR] Erro na API de voos:', error);
        
        // Se a API falhar, usa dados simulados como fallback
        console.log("[ViajarMax] Utilizando dados simulados de voos como fallback...");
        return getSimulatedFlights(params);
    }
}

/**
 * Obtém dados simulados de voos como fallback
 * @param {Object} params - Parâmetros de busca
 * @returns {Object} - Dados simulados de voos
 */
async function getSimulatedFlights(params) {
    // Simula um atraso para tornar a experiência mais realista
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Dados simulados para demonstração
    const departDate = new Date(params.departDate);
    const formattedDate = departDate.toISOString();
    
    // Gera voos fictícios com base nos parâmetros
    const mockFlights = generateMockFlights(params.origin, params.destination, formattedDate, params.cabinClass);
    
    // Estrutura da resposta simulada
    return {
        getAirFlightDepartures: {
            status: 'success',
            results: mockFlights
        }
    };
}

/**
 * Gera voos fictícios para demonstração
 * @param {string} origin - Código do aeroporto de origem
 * @param {string} destination - Código do aeroporto de destino
 * @param {string} date - Data de partida (ISO string)
 * @param {string} cabinClass - Classe da cabine
 * @returns {Array} - Array de voos fictícios
 */
function generateMockFlights(origin, destination, date, cabinClass) {
    // Busca aeroportos de origem e destino
    const airports = [
        { code: 'GRU', name: 'Aeroporto Internacional de São Paulo-Guarulhos', cityName: 'São Paulo', stateCode: 'SP' },
        { code: 'CGH', name: 'Aeroporto de Congonhas', cityName: 'São Paulo', stateCode: 'SP' },
        { code: 'GIG', name: 'Aeroporto Internacional do Rio de Janeiro-Galeão', cityName: 'Rio de Janeiro', stateCode: 'RJ' },
        { code: 'SDU', name: 'Aeroporto Santos Dumont', cityName: 'Rio de Janeiro', stateCode: 'RJ' },
        { code: 'BSB', name: 'Aeroporto Internacional de Brasília', cityName: 'Brasília', stateCode: 'DF' },
        { code: 'CNF', name: 'Aeroporto Internacional de Belo Horizonte-Confins', cityName: 'Belo Horizonte', stateCode: 'MG' },
        { code: 'SSA', name: 'Aeroporto Internacional de Salvador', cityName: 'Salvador', stateCode: 'BA' },
        { code: 'REC', name: 'Aeroporto Internacional do Recife', cityName: 'Recife', stateCode: 'PE' },
        { code: 'FOR', name: 'Aeroporto Internacional de Fortaleza', cityName: 'Fortaleza', stateCode: 'CE' },
        { code: 'CWB', name: 'Aeroporto Internacional de Curitiba', cityName: 'Curitiba', stateCode: 'PR' },
        { code: 'POA', name: 'Aeroporto Internacional de Porto Alegre', cityName: 'Porto Alegre', stateCode: 'RS' }
    ];
    
    const originAirport = airports.find(a => a.code === origin) || {
        code: origin,
        name: `Aeroporto ${origin}`,
        cityName: origin,
        stateCode: 'BR'
    };
    
    const destinationAirport = airports.find(a => a.code === destination) || {
        code: destination,
        name: `Aeroporto ${destination}`,
        cityName: destination,
        stateCode: 'BR'
    };
    
    // Lista de companhias aéreas
    const airlines = [
        { code: 'AD', name: 'Azul Linhas Aéreas' },
        { code: 'G3', name: 'Gol Linhas Aéreas' },
        { code: 'LA', name: 'LATAM Airlines' },
        { code: 'JJ', name: 'LATAM Brasil' },
        { code: 'PS', name: 'Passaredo Linhas Aéreas' }
    ];
    
    // Gera entre 3 e 8 voos aleatórios
    const numberOfFlights = Math.floor(Math.random() * 6) + 3;
    const flights = [];
    
    const departureDate = new Date(date);
    
    for (let i = 0; i < numberOfFlights; i++) {
        // Seleciona uma companhia aérea aleatória
        const airline = airlines[Math.floor(Math.random() * airlines.length)];
        
        // Determina o horário de partida (entre 5h e 23h)
        const departureHour = Math.floor(Math.random() * 19) + 5;
        const departureMinute = Math.floor(Math.random() * 60);
        const departureTime = new Date(departureDate);
        departureTime.setHours(departureHour, departureMinute, 0);
        
        // Determina a duração do voo (entre 1h e 5h)
        const durationMinutes = Math.floor(Math.random() * 240) + 60;
        
        // Calcula o horário de chegada
        const arrivalTime = new Date(departureTime.getTime() + durationMinutes * 60 * 1000);
        
        // Determina o número de escalas (0 a 2)
        const stops = Math.min(Math.floor(Math.random() * 3), 2);
        
        // Gera segmentos de voo
        const segments = [];
        if (stops === 0) {
            // Voo direto
            segments.push({
                departureTime: departureTime.toISOString(),
                arrivalTime: arrivalTime.toISOString(),
                duration: durationMinutes,
                marketingCarrier: {
                    code: airline.code,
                    name: airline.name,
                    flightNumber: Math.floor(Math.random() * 9000) + 1000
                },
                departure: {
                    airport: {
                        code: originAirport.code,
                        name: originAirport.name,
                        cityName: originAirport.cityName
                    },
                    time: departureTime.toISOString()
                },
                arrival: {
                    airport: {
                        code: destinationAirport.code,
                        name: destinationAirport.name,
                        cityName: destinationAirport.cityName
                    },
                    time: arrivalTime.toISOString()
                }
            });
        } else {
            // Voo com escalas
            const intermediateAirports = airports.filter(a => 
                a.code !== origin && a.code !== destination
            );
            
            // Duração total dividida pelo número de segmentos
            const segmentDuration = Math.floor(durationMinutes / (stops + 1));
            
            // Horário inicial
            let currentTime = new Date(departureTime);
            
            // Para cada segmento
            for (let j = 0; j <= stops; j++) {
                const isLastSegment = j === stops;
                const segmentAirline = airlines[Math.floor(Math.random() * airlines.length)];
                
                // Determina o aeroporto de destino deste segmento
                const segmentDestination = isLastSegment
                    ? destinationAirport
                    : intermediateAirports[Math.floor(Math.random() * intermediateAirports.length)];
                
                // Horário de chegada deste segmento
                const segmentArrivalTime = new Date(currentTime.getTime() + segmentDuration * 60 * 1000);
                
                // Cria o segmento
                segments.push({
                    departureTime: currentTime.toISOString(),
                    arrivalTime: segmentArrivalTime.toISOString(),
                    duration: segmentDuration,
                    marketingCarrier: {
                        code: segmentAirline.code,
                        name: segmentAirline.name,
                        flightNumber: Math.floor(Math.random() * 9000) + 1000
                    },
                    departure: {
                        airport: {
                            code: j === 0 ? originAirport.code : segments[j-1].arrival.airport.code,
                            name: j === 0 ? originAirport.name : segments[j-1].arrival.airport.name,
                            cityName: j === 0 ? originAirport.cityName : segments[j-1].arrival.airport.cityName
                        },
                        time: currentTime.toISOString()
                    },
                    arrival: {
                        airport: {
                            code: segmentDestination.code,
                            name: segmentDestination.name,
                            cityName: segmentDestination.cityName
                        },
                        time: segmentArrivalTime.toISOString()
                    }
                });
                
                // Atualiza o horário para o próximo segmento (adiciona tempo de conexão)
                if (!isLastSegment) {
                    // Tempo de conexão entre 40min e 2h
                    const connectionTime = Math.floor(Math.random() * 80) + 40;
                    currentTime = new Date(segmentArrivalTime.getTime() + connectionTime * 60 * 1000);
                }
            }
        }
        
        // Determina o preço do voo
        const basePrice = Math.floor(Math.random() * 400) + 200; // Base entre 200 e 600 USD
        
        // Ajusta o preço com base na classe
        let priceMultiplier = 1;
        if (cabinClass === 'BUS') priceMultiplier = 2.5;
        else if (cabinClass === 'FST') priceMultiplier = 5;
        
        const flightPrice = Math.round(basePrice * priceMultiplier);
        
        // Cria o objeto de voo
        flights.push({
            id: `FL-${Date.now()}-${i}`,
            slices: [
                {
                    segments: segments,
                    duration: durationMinutes
                }
            ],
            price: {
                totalAmountUsd: {
                    amount: flightPrice,
                    currency: 'USD'
                }
            }
        });
    }
    
    // Ordena os voos pelo preço (do mais barato ao mais caro)
    flights.sort((a, b) => 
        a.price.totalAmountUsd.amount - b.price.totalAmountUsd.amount
    );
    
    return flights;
}

/**
 * Busca aeroportos com base em uma consulta de texto
 * @param {string} query - Texto para buscar aeroportos (nome da cidade, código, etc.)
 * @returns {Promise<Array>} - Lista de aeroportos encontrados
 */
export async function searchAirports(query) {
    try {
        if (!query || query.length < 2) {
            console.log('Query muito curta para busca de aeroportos:', query);
            return [];
        }

        console.log(`[ViajarMax] Buscando aeroportos para "${query}"`);

        // Faz a requisição à API usando URL relativa para evitar problemas de CORS
        const url = `/api/airports?q=${encodeURIComponent(query)}`;
        console.log('[ViajarMax] URL da requisição:', url);
        
        const response = await fetch(url);
        
        // Verifica se a resposta é válida
        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        console.log('[ViajarMax] Aeroportos encontrados:', data);
        
        // Verifica o formato dos dados recebidos
        if (!Array.isArray(data)) {
            console.warn('[ViajarMax WARN] Resposta da API não é um array:', data);
            return [];
        }
        
        // Mapeia para garantir o formato correto
        const formattedData = data.map(airport => ({
            code: airport.code,
            cityName: airport.cityName || 'Cidade desconhecida',
            airportName: airport.airportName || 'Aeroporto'
        }));
        
        return formattedData;
    } catch (error) {
        console.error('Erro ao buscar aeroportos:', error);
        
        // Se a API falhar, usa aeroportos locais de fallback
        console.log("Utilizando dados de aeroportos locais como fallback...");
        return getLocalAirports(query);
    }
}

/**
 * Obtém aeroportos locais de fallback para caso a API falhe
 * @param {string} query - Consulta de busca
 * @returns {Array} - Aeroportos filtrados
 */
function getLocalAirports(query) {
    // Lista de aeroportos principais do Brasil (para fallback)
    const airportsList = [
        { code: 'GRU', airportName: 'Aeroporto Internacional de São Paulo-Guarulhos', cityName: 'São Paulo' },
        { code: 'SDU', airportName: 'Aeroporto Santos Dumont', cityName: 'Rio de Janeiro' },
        { code: 'BSB', airportName: 'Aeroporto Internacional de Brasília', cityName: 'Brasília' },
        { code: 'CNF', airportName: 'Aeroporto Internacional de Belo Horizonte-Confins', cityName: 'Belo Horizonte' },
        { code: 'SSA', airportName: 'Aeroporto Internacional de Salvador', cityName: 'Salvador' },
        { code: 'REC', airportName: 'Aeroporto Internacional do Recife', cityName: 'Recife' },
        { code: 'FOR', airportName: 'Aeroporto Internacional de Fortaleza', cityName: 'Fortaleza' },
        { code: 'CWB', airportName: 'Aeroporto Internacional de Curitiba', cityName: 'Curitiba' },
        { code: 'POA', airportName: 'Aeroporto Internacional de Porto Alegre', cityName: 'Porto Alegre' },
        { code: 'VCP', airportName: 'Aeroporto Internacional de Viracopos', cityName: 'Campinas' },
        { code: 'FLN', airportName: 'Aeroporto Internacional de Florianópolis', cityName: 'Florianópolis' },
        { code: 'NAT', airportName: 'Aeroporto Internacional de Natal', cityName: 'Natal' },
        { code: 'BEL', airportName: 'Aeroporto Internacional de Belém', cityName: 'Belém' },
        { code: 'MAO', airportName: 'Aeroporto Internacional de Manaus', cityName: 'Manaus' },
        { code: 'GYN', airportName: 'Aeroporto de Goiânia', cityName: 'Goiânia' },
        { code: 'MCZ', airportName: 'Aeroporto Internacional de Maceió', cityName: 'Maceió' },
        { code: 'VIX', airportName: 'Aeroporto de Vitória', cityName: 'Vitória' },
        { code: 'CGB', airportName: 'Aeroporto Internacional de Cuiabá', cityName: 'Cuiabá' }
    ];

    console.log('Usando busca local para aeroportos com query:', query);

    // Filtra os aeroportos com base na consulta
    const queryLower = query.toLowerCase();
    const filteredAirports = airportsList.filter(airport => {
        const nameMatch = airport.airportName.toLowerCase().includes(queryLower);
        const cityMatch = airport.cityName.toLowerCase().includes(queryLower);
        const codeMatch = airport.code.toLowerCase() === queryLower;
        
        return nameMatch || cityMatch || codeMatch;
    });
    
    console.log('Aeroportos locais encontrados:', filteredAirports);
    return filteredAirports;
}

/**
 * Formata resultados de voos para exibição na interface
 * @param {Object} flightData - Dados de voos retornados pela API
 * @returns {Array} - Array de voos formatados para exibição
 */
export function formatFlightResults(flightData) {
    // Se não houver dados ou itinerários, retorna um array vazio
    if (!flightData || !flightData.getAirFlightDepartures || !flightData.getAirFlightDepartures.results) {
        console.warn('Dados de voo inválidos ou ausentes:', flightData);
        return [];
    }

    const results = flightData.getAirFlightDepartures.results;
    console.log(`Formatando ${results.length} resultados de voos`);
    
    // Mapeia os resultados para um formato mais simples para a interface
    return results.map((result, index) => {
        try {
            const firstSlice = result.slices[0];
            const firstSegment = firstSlice.segments[0];
            const lastSegment = firstSlice.segments[firstSlice.segments.length - 1];
            
            // Determina o logo da companhia aérea
            let logoPath = '';
            const airlineCode = firstSegment.marketingCarrier.code.toLowerCase();
            
            // Mapeamento de códigos de companhias aéreas para logos
            const airlineLogos = {
                'la': 'latam-logo-new.jpg',
                'jj': 'latam-logo-new.jpg',
                'g3': 'gol-logo.png',
                'ad': 'azul-logo-new.png',
                'o6': 'one-logo.png'
            };
            
            if (airlineCode in airlineLogos) {
                logoPath = `/images/${airlineLogos[airlineCode]}`;
            } else {
                logoPath = '/images/airline-generic.png';
            }
            
            // Determina se é o melhor preço (consideramos o mais barato como melhor preço)
            const isBestPrice = index === 0;
            
            // Determina se possui algum equipamento especial
            const aircraft = firstSegment.marketingCarrier.aircraft 
                ? firstSegment.marketingCarrier.aircraft 
                : 'Informação não disponível';
            
            return {
                id: result.id || `flight-${index}`,
                airline: {
                    code: firstSegment.marketingCarrier.code,
                    name: firstSegment.marketingCarrier.name,
                    logo: logoPath
                },
                departure: {
                    time: formatTime(firstSegment.departure.time),
                    airport: firstSegment.departure.airport.code,
                    city: firstSegment.departure.airport.cityName
                },
                arrival: {
                    time: formatTime(lastSegment.arrival.time),
                    airport: lastSegment.arrival.airport.code,
                    city: lastSegment.arrival.airport.cityName
                },
                duration: formatDuration(firstSlice.duration),
                stops: firstSlice.segments.length - 1,
                isBestPrice: isBestPrice,
                price: {
                    amount: result.price.totalAmountUsd.amount,
                    currency: 'BRL', // Convertendo para BRL para exibição
                    formatted: formatPrice(result.price.totalAmountUsd.amount * 5.1) // Conversão aproximada USD para BRL
                },
                flightNumber: `${firstSegment.marketingCarrier.code}${firstSegment.marketingCarrier.flightNumber}`,
                aircraft: aircraft
            };
        } catch (error) {
            console.error(`Erro ao formatar resultado ${index}:`, error);
            // Retorna um objeto de voo padrão em caso de erro
            return {
                id: `flight-error-${index}`,
                airline: {
                    code: 'ERR',
                    name: 'Erro ao carregar',
                    logo: '/images/airline-generic.png'
                },
                departure: {
                    time: '--:--',
                    airport: '???',
                    city: 'Não disponível'
                },
                arrival: {
                    time: '--:--',
                    airport: '???',
                    city: 'Não disponível'
                },
                duration: 'N/A',
                stops: 0,
                isBestPrice: false,
                price: {
                    amount: 0,
                    currency: 'BRL',
                    formatted: 'Indisponível'
                },
                flightNumber: 'N/A',
                aircraft: 'N/A'
            };
        }
    });
}

// Funções auxiliares
function formatTime(timeString) {
    const date = new Date(timeString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
}

function formatPrice(amount) {
    return amount.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2
    });
}