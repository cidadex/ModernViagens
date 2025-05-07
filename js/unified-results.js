/**
 * ViajarMax - Resultados de Voos Unificado
 * Script simplificado para exibir os resultados na página de voos
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando página de resultados de voos...');
    
    // Elementos DOM
    const resultsContainer = document.querySelector('.flight-results-list');
    const sortPriceBtn = document.getElementById('sort-price');
    const sortDurationBtn = document.getElementById('sort-duration');
    const sortDepartureBtn = document.getElementById('sort-departure');
    const filterNonstopBtn = document.getElementById('filter-nonstop');
    const searchSummary = document.querySelector('.search-summary');
    
    // Dados da busca (do sessionStorage)
    let searchData = {};
    
    try {
        const savedData = sessionStorage.getItem('searchData');
        if (savedData) {
            searchData = JSON.parse(savedData);
            console.log('Dados recuperados da busca:', searchData);
        } else {
            console.warn('Nenhum dado de busca encontrado, usando dados de demonstração');
            // Dados de demonstração caso não tenha dados salvos
            searchData = {
                origin: 'GRU',
                destination: 'GIG',
                departDate: '2025-05-15',
                returnDate: null,
                adults: 1,
                cabinClass: 'economy',
                tripType: 'oneway'
            };
        }
    } catch (error) {
        console.error('Erro ao carregar dados da busca:', error);
    }
    
    // Atualizar o resumo da busca
    function updateSearchSummary() {
        if (searchSummary) {
            // Formata a data de ida para exibição
            const departureDateObj = new Date(searchData.departDate);
            const formattedDepartureDate = departureDateObj.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            
            // Formata a data de volta para exibição (se for viagem de ida e volta)
            let formattedReturnDate = '';
            if (searchData.tripType === 'roundtrip' && searchData.returnDate) {
                const returnDateObj = new Date(searchData.returnDate);
                formattedReturnDate = returnDateObj.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
            }
            
            // Formata a classe para exibição
            const cabinMap = {
                'economy': 'Econômica',
                'premium_economy': 'Econômica Premium',
                'business': 'Executiva',
                'first': 'Primeira Classe'
            };
            
            const cabinClass = cabinMap[searchData.cabinClass] || 'Econômica';
            
            // Tipo de viagem
            const tripTypeText = searchData.tripType === 'roundtrip' ? 'Ida e Volta' : 'Só Ida';
            
            // Define o texto do resumo
            let summaryHTML = `
                <p>Voos de <strong>${searchData.origin}</strong> para <strong>${searchData.destination}</strong> | <strong>${tripTypeText}</strong></p>
                <p>Ida: <strong>${formattedDepartureDate}</strong>`;
                
            // Adiciona data de volta se for ida e volta
            if (searchData.tripType === 'roundtrip' && formattedReturnDate) {
                summaryHTML += ` | Volta: <strong>${formattedReturnDate}</strong>`;
            }
            
            summaryHTML += ` | Passageiros: <strong>${searchData.adults || 1}</strong> | Classe: <strong>${cabinClass}</strong></p>`;
            
            searchSummary.innerHTML = summaryHTML;
        }
    }
    
    // Gerar resultados de voos simulados
    function generateFlights() {
        // Dados de demonstração das companhias
        const airlines = [
            { code: 'LA', name: 'LATAM Airlines', logo: '/images/latam-logo-new.jpg' },
            { code: 'G3', name: 'GOL Linhas Aéreas', logo: '/images/gol-logo.png' },
            { code: 'AD', name: 'Azul Linhas Aéreas', logo: '/images/azul-logo-new.png' },
            { code: 'JJ', name: 'LATAM Airlines', logo: '/images/latam-logo-new.jpg' },
            { code: 'O6', name: 'ONE Airlines', logo: '/images/one-logo.png' }
        ];
        
        // Gera voos simulados (10 voos)
        const flights = [];
        const date = new Date(searchData.departDate);
        const baseHour = 6; // Começar às 6h
        
        for (let i = 0; i < 10; i++) {
            // Calcula hora de partida (entre 6h e 20h)
            const departureHour = (baseHour + i * 1.5) % 18;
            const departureHourInt = Math.floor(departureHour);
            const departureMinutes = Math.floor((departureHour - departureHourInt) * 60);
            
            // Duração entre 1h e 2h30
            const durationMinutes = Math.floor(60 + Math.random() * 90);
            
            // Cria objeto Date para partida
            const departureTime = new Date(date);
            departureTime.setHours(departureHourInt, departureMinutes, 0);
            
            // Cria objeto Date para chegada (partida + duração)
            const arrivalTime = new Date(departureTime);
            arrivalTime.setMinutes(arrivalTime.getMinutes() + durationMinutes);
            
            // Escolhe companhia aleatória
            const airline = airlines[Math.floor(Math.random() * airlines.length)];
            
            // Determina se tem escala (30% de chance)
            const hasStops = Math.random() < 0.3;
            const stops = hasStops ? 1 : 0;
            
            // Preço base + variações aleatórias
            const basePrice = 300;
            const priceVariation = Math.floor(Math.random() * 400);
            const price = basePrice + priceVariation;
            
            // Formata o preço
            const formattedPrice = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(price);
            
            // Formata a duração
            const durationHours = Math.floor(durationMinutes / 60);
            const durationMins = durationMinutes % 60;
            const formattedDuration = `${durationHours}h ${durationMins.toString().padStart(2, '0')}m`;
            
            // Número do voo
            const flightNumber = `${airline.code}${1000 + Math.floor(Math.random() * 1000)}`;
            
            // Adiciona à lista de voos
            flights.push({
                id: `flight-${i + 1}`,
                airline: {
                    code: airline.code,
                    name: airline.name,
                    logo: airline.logo
                },
                departure: {
                    time: departureTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                    airport: searchData.origin,
                    city: getCityFromCode(searchData.origin)
                },
                arrival: {
                    time: arrivalTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                    airport: searchData.destination,
                    city: getCityFromCode(searchData.destination)
                },
                duration: formattedDuration,
                durationMinutes: durationMinutes,
                stops: stops,
                price: {
                    amount: price,
                    formatted: formattedPrice
                },
                flightNumber: flightNumber,
                isBestPrice: i === 0 // Marca o primeiro como melhor preço
            });
        }
        
        return flights;
    }
    
    // Função auxiliar para obter nome da cidade a partir do código
    function getCityFromCode(code) {
        const cityMap = {
            'GRU': 'São Paulo',
            'CGH': 'São Paulo',
            'GIG': 'Rio de Janeiro',
            'SDU': 'Rio de Janeiro',
            'BSB': 'Brasília',
            'CNF': 'Belo Horizonte',
            'SSA': 'Salvador',
            'FOR': 'Fortaleza',
            'REC': 'Recife',
            'POA': 'Porto Alegre',
            'CWB': 'Curitiba',
            'FLN': 'Florianópolis'
        };
        
        return cityMap[code] || code;
    }
    
    // Função para renderizar os resultados
    let currentResults = [];
    
    function renderResults(flights) {
        if (!resultsContainer) {
            console.error('Container de resultados não encontrado');
            return;
        }
        
        // Limpa resultados anteriores
        resultsContainer.innerHTML = '';
        
        if (flights.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <p>Nenhum voo encontrado para esta busca.</p>
                </div>
            `;
            return;
        }
        
        // Renderiza cada voo
        flights.forEach(flight => {
            const flightCard = createFlightCard(flight);
            resultsContainer.appendChild(flightCard);
        });
    }
    
    // Função para criar o card de voo
    function createFlightCard(flight) {
        const card = document.createElement('div');
        card.className = 'flight-card';
        if (flight.isBestPrice) {
            card.classList.add('best-price');
        }
        
        // Status de melhor preço
        let bestPriceTag = '';
        if (flight.isBestPrice) {
            bestPriceTag = `<div class="best-price-tag">Melhor preço</div>`;
        }
        
        // Status de paradas
        let stopStatus = 'Direto';
        if (flight.stops > 0) {
            stopStatus = `${flight.stops} ${flight.stops > 1 ? 'paradas' : 'parada'}`;
        }
        
        // HTML interno do card
        card.innerHTML = `
            ${bestPriceTag}
            <div class="flight-content">
                <div class="flight-header">
                    <div class="airline">
                        <img src="${flight.airline.logo}" alt="${flight.airline.name}" class="airline-logo">
                        <span class="airline-name">${flight.airline.name}</span>
                    </div>
                    
                    <div class="flight-details">
                        <div class="flight-time">
                            <div class="departure">
                                <span class="time">${flight.departure.time}</span>
                                <span class="airport">${flight.departure.airport}</span>
                            </div>
                            <div class="flight-duration">
                                <span class="duration">${flight.duration}</span>
                                <div class="flight-line">
                                    <div class="dot"></div>
                                    <div class="line"></div>
                                    <div class="dot"></div>
                                </div>
                                <span class="direct">${stopStatus}</span>
                            </div>
                            <div class="arrival">
                                <span class="time">${flight.arrival.time}</span>
                                <span class="airport">${flight.arrival.airport}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flight-price">
                        <span class="price">${flight.price.formatted}</span>
                        <span class="price-detail">por adulto</span>
                        <button class="btn-select">Selecionar</button>
                    </div>
                </div>
                
                <div class="flight-footer">
                    <div class="flight-number">
                        <span>Voo ${flight.flightNumber}</span>
                    </div>
                    <div class="flight-details-toggle">
                        <button class="btn-details">
                            <i class="fas fa-chevron-down"></i>
                            <span>Detalhes</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Adiciona ação para o botão selecionar
        const selectButton = card.querySelector('.btn-select');
        if (selectButton) {
            selectButton.addEventListener('click', () => {
                alert(`Voo ${flight.flightNumber} selecionado! Redirecionando para a página de pagamento...`);
            });
        }
        
        // Adiciona ação para o botão de detalhes
        const detailsButton = card.querySelector('.btn-details');
        if (detailsButton) {
            detailsButton.addEventListener('click', () => {
                alert(`Detalhes do voo ${flight.flightNumber} (tela em construção)`);
            });
        }
        
        return card;
    }
    
    // Funções de ordenação e filtro
    function setupFiltersAndSorting() {
        // Ordenar por preço
        if (sortPriceBtn) {
            sortPriceBtn.addEventListener('click', () => {
                document.querySelectorAll('.sort-btn').forEach(btn => btn.classList.remove('active'));
                sortPriceBtn.classList.add('active');
                
                currentResults.sort((a, b) => a.price.amount - b.price.amount);
                renderResults(currentResults);
            });
        }
        
        // Ordenar por duração
        if (sortDurationBtn) {
            sortDurationBtn.addEventListener('click', () => {
                document.querySelectorAll('.sort-btn').forEach(btn => btn.classList.remove('active'));
                sortDurationBtn.classList.add('active');
                
                currentResults.sort((a, b) => a.durationMinutes - b.durationMinutes);
                renderResults(currentResults);
            });
        }
        
        // Ordenar por horário de partida
        if (sortDepartureBtn) {
            sortDepartureBtn.addEventListener('click', () => {
                document.querySelectorAll('.sort-btn').forEach(btn => btn.classList.remove('active'));
                sortDepartureBtn.classList.add('active');
                
                // Converte string de hora para objeto Date para comparação
                currentResults.sort((a, b) => {
                    const timeA = a.departure.time.split(':');
                    const timeB = b.departure.time.split(':');
                    
                    const dateA = new Date();
                    dateA.setHours(parseInt(timeA[0]), parseInt(timeA[1]));
                    
                    const dateB = new Date();
                    dateB.setHours(parseInt(timeB[0]), parseInt(timeB[1]));
                    
                    return dateA - dateB;
                });
                
                renderResults(currentResults);
            });
        }
        
        // Filtrar apenas voos diretos
        if (filterNonstopBtn) {
            filterNonstopBtn.addEventListener('click', () => {
                const isActive = filterNonstopBtn.classList.toggle('active');
                
                if (isActive) {
                    // Filtra apenas voos diretos
                    const filteredResults = currentResults.filter(flight => flight.stops === 0);
                    renderResults(filteredResults);
                } else {
                    // Remove o filtro
                    renderResults(currentResults);
                }
            });
        }
    }
    
    // Inicializa a página
    function initialize() {
        // Atualiza o resumo da busca
        updateSearchSummary();
        
        // Gera e renderiza voos
        currentResults = generateFlights();
        
        // Ordena por preço (padrão)
        currentResults.sort((a, b) => a.price.amount - b.price.amount);
        
        // Cria um cabeçalho para os voos de ida
        if (searchData.tripType === 'roundtrip') {
            const departureHeader = document.createElement('div');
            departureHeader.className = 'flight-section-header';
            departureHeader.innerHTML = `<h3>Voos de Ida - ${getCityFromCode(searchData.origin)} para ${getCityFromCode(searchData.destination)}</h3>`;
            resultsContainer.appendChild(departureHeader);
        }
        
        // Renderiza os resultados (voos de ida)
        renderResults(currentResults);
        
        // Se for ida e volta, gera também os voos de volta
        if (searchData.tripType === 'roundtrip' && searchData.returnDate) {
            // Salva os voos de ida
            const departureFlights = [...currentResults];
            
            // Inverte origem e destino para os voos de volta
            const tempOrigin = searchData.origin;
            searchData.origin = searchData.destination;
            searchData.destination = tempOrigin;
            
            // Usa a data de retorno
            searchData.departDate = searchData.returnDate;
            
            // Gera voos de volta
            const returnFlights = generateFlights();
            
            // Ordena por preço
            returnFlights.sort((a, b) => a.price.amount - b.price.amount);
            
            // Adiciona um cabeçalho para os voos de volta
            const returnHeader = document.createElement('div');
            returnHeader.className = 'flight-section-header';
            returnHeader.innerHTML = `<h3>Voos de Volta - ${getCityFromCode(searchData.origin)} para ${getCityFromCode(searchData.destination)}</h3>`;
            resultsContainer.appendChild(returnHeader);
            
            // Renderiza os voos de volta
            renderResults(returnFlights);
            
            // Restaura os dados originais
            searchData.origin = searchData.destination;
            searchData.destination = tempOrigin;
            searchData.departDate = searchData.departDate;
            
            // Combina os dois conjuntos de voos para filtros
            currentResults = [...departureFlights, ...returnFlights];
        }
        
        // Configura filtros e ordenação
        setupFiltersAndSorting();
        
        // Marca o botão de preço como ativo inicialmente
        if (sortPriceBtn) {
            sortPriceBtn.classList.add('active');
        }
        
        console.log('Página de resultados inicializada com sucesso');
    }
    
    // Inicia tudo
    initialize();
});