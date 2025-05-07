/**
 * ViajarMax - Fluxo Unificado Simplificado
 * Este script lida com todo o fluxo de busca de uma forma simplificada
 * para evitar problemas com imports/modules
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando fluxo unificado ViajarMax...');

    // ===== Constantes para dados de demonstração =====
    const demoAirports = [
        { code: 'GRU', name: 'Aeroporto Internacional de São Paulo', city: 'São Paulo', country: 'Brasil' },
        { code: 'CGH', name: 'Aeroporto de Congonhas', city: 'São Paulo', country: 'Brasil' },
        { code: 'GIG', name: 'Aeroporto Internacional do Galeão', city: 'Rio de Janeiro', country: 'Brasil' },
        { code: 'SDU', name: 'Aeroporto Santos Dumont', city: 'Rio de Janeiro', country: 'Brasil' },
        { code: 'BSB', name: 'Aeroporto Internacional de Brasília', city: 'Brasília', country: 'Brasil' },
        { code: 'CNF', name: 'Aeroporto Internacional de Confins', city: 'Belo Horizonte', country: 'Brasil' },
        { code: 'SSA', name: 'Aeroporto Internacional de Salvador', city: 'Salvador', country: 'Brasil' },
        { code: 'FOR', name: 'Aeroporto Internacional de Fortaleza', city: 'Fortaleza', country: 'Brasil' },
        { code: 'REC', name: 'Aeroporto Internacional de Recife', city: 'Recife', country: 'Brasil' },
        { code: 'POA', name: 'Aeroporto Internacional de Porto Alegre', city: 'Porto Alegre', country: 'Brasil' },
        { code: 'CWB', name: 'Aeroporto Internacional de Curitiba', city: 'Curitiba', country: 'Brasil' },
        { code: 'FLN', name: 'Aeroporto Internacional de Florianópolis', city: 'Florianópolis', country: 'Brasil' },
        { code: 'VCP', name: 'Aeroporto Internacional de Viracopos', city: 'Campinas', country: 'Brasil' },
        { code: 'NAT', name: 'Aeroporto Internacional de Natal', city: 'Natal', country: 'Brasil' },
        { code: 'BEL', name: 'Aeroporto Internacional de Belém', city: 'Belém', country: 'Brasil' },
        { code: 'MCZ', name: 'Aeroporto Internacional de Maceió', city: 'Maceió', country: 'Brasil' },
        { code: 'VIX', name: 'Aeroporto de Vitória', city: 'Vitória', country: 'Brasil' },
        { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'Nova York', country: 'Estados Unidos' },
        { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'Estados Unidos' },
        { code: 'MIA', name: 'Miami International Airport', city: 'Miami', country: 'Estados Unidos' },
        { code: 'MAD', name: 'Aeroporto de Madrid-Barajas', city: 'Madrid', country: 'Espanha' },
        { code: 'FCO', name: 'Aeroporto Leonardo da Vinci', city: 'Roma', country: 'Itália' },
        { code: 'CDG', name: 'Aeroporto Charles de Gaulle', city: 'Paris', country: 'França' },
        { code: 'LHR', name: 'Aeroporto de Heathrow', city: 'Londres', country: 'Reino Unido' }
    ];

    // ===== ELEMENTOS DA INTERFACE PRINCIPAL =====
    
    // Elementos das etapas
    const searchStep1 = document.getElementById('search-step-1');
    const searchStep2 = document.getElementById('search-step-2');
    
    // Botões de navegação
    const continueBtn = document.getElementById('continue-search');
    const backBtn = document.querySelector('.btn-back');
    
    // Campos de aeroporto
    const originInput = document.getElementById('origin-input');
    const destinationInput = document.getElementById('destination-input');
    const originCode = document.getElementById('origin-code');
    const destinationCode = document.getElementById('destination-code');
    const originDisplay = document.getElementById('origin-display');
    const destinationDisplay = document.getElementById('destination-display');
    
    // Elementos do calendário
    const monthYearDisplay = document.querySelector('.month-navigation h4');
    const calendarContainer = document.querySelector('.days');
    const prevMonthBtn = document.querySelector('.btn-prev-month');
    const nextMonthBtn = document.querySelector('.btn-next-month');
    
    // Botões de passageiros
    const decreaseBtns = document.querySelectorAll('.btn-decrease');
    const increaseBtns = document.querySelectorAll('.btn-increase');
    const passengerCounts = document.querySelectorAll('.count');
    
    // Botão de busca
    const searchButton = document.querySelector('.search-button');
    
    // ===== DADOS GLOBAIS =====
    window.searchData = window.searchData || {
        origin: null,
        destination: null,
        date: null,
        returnDate: null, // Para voos de ida e volta
        passengers: 1,
        cabinClass: 'economy',
        tripType: 'oneway' // oneway ou roundtrip
    };
    
    // ===== FUNÇÃO AUXILIAR DE LOG =====
    function logInfo(message, data) {
        if (data) {
            console.log(`[ViajarMax] ${message}`, data);
        } else {
            console.log(`[ViajarMax] ${message}`);
        }
    }
    
    // ===== INICIALIZAÇÃO =====
    function initScreen() {
        if (searchStep1 && searchStep2) {
            // Começar na etapa 1 (seleção de aeroportos)
            searchStep1.classList.remove('hidden');
            searchStep1.style.display = 'block';
            searchStep2.classList.add('hidden');
            searchStep2.style.display = 'none';
            
            logInfo('Tela de busca inicializada na etapa 1');
        } else {
            console.error('Elementos das etapas não encontrados');
        }
    }
    
    // ===== AUTOCOMPLETAR DE AEROPORTOS =====
    function setupAirportAutocomplete(input, codeElement, isOrigin) {
        let autocompleteList = null;
        
        input.addEventListener('input', () => {
            const query = input.value.trim().toLowerCase();
            
            // Limpa o elemento de código
            codeElement.textContent = '';
            
            // Remove autocomplete anterior se existir
            if (autocompleteList) {
                autocompleteList.remove();
                autocompleteList = null;
            }
            
            if (query.length < 2) return;
            
            // Filtra aeroportos baseado na consulta
            const filteredAirports = demoAirports.filter(airport => {
                return airport.code.toLowerCase().includes(query) || 
                       airport.city.toLowerCase().includes(query) ||
                       airport.name.toLowerCase().includes(query);
            }).slice(0, 5); // Limita a 5 resultados
            
            // Cria a lista de autocompletar
            autocompleteList = document.createElement('div');
            autocompleteList.className = 'autocomplete-list';
            
            if (filteredAirports.length === 0) {
                const noResults = document.createElement('div');
                noResults.className = 'autocomplete-item no-results';
                noResults.textContent = 'Nenhum aeroporto encontrado';
                autocompleteList.appendChild(noResults);
            } else {
                filteredAirports.forEach(airport => {
                    const item = document.createElement('div');
                    item.className = 'autocomplete-item';
                    
                    const airportName = document.createElement('div');
                    airportName.className = 'airport-name';
                    airportName.textContent = airport.name;
                    
                    const airportDetail = document.createElement('div');
                    airportDetail.className = 'airport-detail';
                    airportDetail.textContent = `${airport.city}, ${airport.country} (${airport.code})`;
                    
                    item.appendChild(airportName);
                    item.appendChild(airportDetail);
                    
                    item.addEventListener('click', () => {
                        input.value = `${airport.city} (${airport.code})`;
                        codeElement.textContent = airport.code;
                        
                        // Atualiza os dados da busca
                        if (isOrigin) {
                            window.searchData.origin = airport.code;
                        } else {
                            window.searchData.destination = airport.code;
                        }
                        
                        // Remove a lista de autocompletar
                        autocompleteList.remove();
                        autocompleteList = null;
                    });
                    
                    autocompleteList.appendChild(item);
                });
            }
            
            // Adiciona a lista ao DOM
            input.parentNode.style.position = 'relative';
            input.parentNode.appendChild(autocompleteList);
        });
        
        // Fecha o autocomplete quando clicar fora
        document.addEventListener('click', (e) => {
            if (autocompleteList && !input.contains(e.target) && !autocompleteList.contains(e.target)) {
                autocompleteList.remove();
                autocompleteList = null;
            }
        });
    }
    
    // ===== NAVEGAÇÃO ENTRE ETAPAS =====
    function setupNavigation() {
        // Voltar para a etapa 1
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                searchStep2.classList.add('hidden');
                searchStep2.style.display = 'none';
                
                searchStep1.classList.remove('hidden');
                searchStep1.style.display = 'block';
                
                logInfo('Voltando para a etapa 1');
            });
        }
        
        // Continuar para a etapa 2
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                // Validação
                const originValue = originCode.textContent;
                const destValue = destinationCode.textContent;
                
                if (!originValue || !destValue) {
                    alert('Por favor, selecione um aeroporto de origem e destino válidos.');
                    return;
                }
                
                // Atualiza dados da busca
                window.searchData.origin = originValue;
                window.searchData.destination = destValue;
                
                logInfo('Dados de busca atualizados', window.searchData);
                
                // Atualiza a etapa 2
                if (originDisplay && destinationDisplay) {
                    originDisplay.textContent = originValue;
                    destinationDisplay.textContent = destValue;
                }
                
                // Muda para a etapa 2
                searchStep1.classList.add('hidden');
                searchStep1.style.display = 'none';
                
                searchStep2.classList.remove('hidden');
                searchStep2.style.display = 'block';
                
                logInfo('Avançando para etapa 2 (calendário)');
                
                // Gera o calendário com os novos dados (função assíncrona)
                generateCalendar(new Date().getMonth(), new Date().getFullYear())
                    .catch(error => logError('Erro ao gerar calendário inicial', error));
            });
        }
    }
    
    // ===== CONTROLE DE PASSAGEIROS =====
    function setupPassengerCounters() {
        // Diminuir contador
        decreaseBtns.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                let count = parseInt(passengerCounts[index].textContent);
                
                // Adultos sempre pelo menos 1
                if (index === 0) {
                    if (count > 1) count--;
                } else {
                    if (count > 0) count--;
                }
                
                passengerCounts[index].textContent = count;
                
                // Adultos
                if (index === 0) {
                    window.searchData.passengers = count;
                }
            });
        });
        
        // Aumentar contador
        increaseBtns.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                let count = parseInt(passengerCounts[index].textContent);
                count++;
                
                passengerCounts[index].textContent = count;
                
                // Adultos
                if (index === 0) {
                    window.searchData.passengers = count;
                }
            });
        });
    }
    
    // ===== CALENDÁRIO =====
    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    
    // Busca preços da API para o calendário
    async function getCalendarPrices(month, year) {
        try {
            if (!window.searchData.origin || !window.searchData.destination) {
                logInfo('Origem ou destino não definidos, impossível buscar preços');
                return {};
            }
            
            logInfo(`Buscando preços para ${monthNames[month]} de ${year}`);
            
            // Determina o início e fim do mês para busca
            const startDate = new Date(year, month, 1);
            // Último dia do mês
            const lastDay = new Date(year, month + 1, 0).getDate();
            const endDate = new Date(year, month, lastDay);
            
            // Formata as datas para a API
            const startDateStr = startDate.toISOString().split('T')[0];
            const endDateStr = endDate.toISOString().split('T')[0];
            
            // Prepara os dados para a requisição
            const requestData = {
                origin: window.searchData.origin,
                destination: window.searchData.destination,
                departDate: startDateStr,
                endDate: endDateStr
            };
            
            logInfo('Enviando requisição de preços para a API', requestData);
            
            // Faz a requisição à API
            const response = await fetch('/api/prices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });
            
            if (!response.ok) {
                throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            logInfo('Preços obtidos da API:', data);
            
            return data.prices || {};
            
        } catch (error) {
            logError('Erro ao buscar preços do calendário', error);
            
            // Em caso de erro, retorna um objeto vazio
            return {};
        }
    }
    
    // Função principal para gerar o calendário
    async function generateCalendar(month, year) {
        logInfo(`Gerando calendário para ${monthNames[month]} de ${year}`);
        
        if (!calendarContainer) {
            console.error('Container do calendário não encontrado');
            return;
        }
        
        // Mostra indicador de carregamento
        calendarContainer.innerHTML = '';
        const loadingElement = document.createElement('div');
        loadingElement.className = 'calendar-loading';
        loadingElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando preços...';
        calendarContainer.appendChild(loadingElement);
        
        // Atualiza o título
        if (monthYearDisplay) {
            monthYearDisplay.textContent = `${monthNames[month]} de ${year}`;
        }
        
        // Obtém os preços da API (via API)
        const prices = await getCalendarPrices(month, year);
        
        // Calcula mínimo e máximo para colorização
        let minPrice = Number.MAX_VALUE;
        let maxPrice = 0;
        
        Object.values(prices).forEach(price => {
            if (price < minPrice) minPrice = price;
            if (price > maxPrice) maxPrice = price;
        });
        
        // Limpa o container
        calendarContainer.innerHTML = '';
        
        // Adiciona espaços vazios para o primeiro dia
        const firstDay = new Date(year, month, 1).getDay();
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'day empty';
            calendarContainer.appendChild(emptyDay);
        }
        
        // Adiciona os dias do mês
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'day';
            
            // Data no formato ISO
            const paddedMonth = (month + 1).toString().padStart(2, '0');
            const paddedDay = i.toString().padStart(2, '0');
            const dateStr = `${year}-${paddedMonth}-${paddedDay}`;
            
            // Conteúdo (número + preço)
            const dayContent = document.createElement('div');
            dayContent.className = 'day-content';
            
            // Número do dia
            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = i;
            dayContent.appendChild(dayNumber);
            
            // Preço do dia
            if (prices[dateStr]) {
                const priceElement = document.createElement('div');
                priceElement.className = 'day-price';
                
                // Formata o preço
                const formattedPrice = new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }).format(prices[dateStr]);
                
                priceElement.textContent = formattedPrice;
                dayContent.appendChild(priceElement);
                
                // Adiciona classe para dia com preço
                dayElement.classList.add('has-price');
                
                // Adiciona cor pelo preço (baixo, médio, alto)
                const priceRange = maxPrice - minPrice;
                if (priceRange > 0) {
                    const percentage = (prices[dateStr] - minPrice) / priceRange;
                    
                    if (percentage < 0.25) {
                        dayElement.classList.add('price-low');
                    } else if (percentage < 0.75) {
                        dayElement.classList.add('price-medium');
                    } else {
                        dayElement.classList.add('price-high');
                    }
                }
            }
            
            dayElement.appendChild(dayContent);
            
            // Marca o dia atual
            if (month === new Date().getMonth() && 
                year === new Date().getFullYear() && 
                i === new Date().getDate()) {
                dayElement.classList.add('today');
            }
            
            // Verifica se é dia passado
            const dayDate = new Date(year, month, i);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (dayDate >= today) {
                // Permite seleção
                dayElement.addEventListener('click', () => {
                    const tripType = window.searchData.tripType;
                    
                    // Lógica para viagem só de ida
                    if (tripType === 'oneway') {
                        // Remove seleção anterior
                        document.querySelectorAll('.day').forEach(d => {
                            d.classList.remove('selected');
                            d.classList.remove('departure-date');
                        });
                        
                        // Marca como selecionado
                        dayElement.classList.add('selected');
                        dayElement.classList.add('departure-date');
                        
                        // Armazena a data
                        window.searchData.date = dateStr;
                        window.searchData.returnDate = null;
                        
                        logInfo(`Data de ida selecionada: ${dateStr}, preço: ${prices[dateStr] || 'N/A'}`);
                    } 
                    // Lógica para viagem de ida e volta
                    else if (tripType === 'roundtrip') {
                        // Se não tem data de ida selecionada ou está clicando na mesma data
                        if (!window.searchData.date || window.searchData.date === dateStr) {
                            // Remove todas as seleções
                            document.querySelectorAll('.day').forEach(d => {
                                d.classList.remove('selected');
                                d.classList.remove('departure-date');
                                d.classList.remove('return-date');
                            });
                            
                            // Marca como data de ida
                            dayElement.classList.add('selected');
                            dayElement.classList.add('departure-date');
                            
                            // Armazena a data de ida
                            window.searchData.date = dateStr;
                            window.searchData.returnDate = null;
                            
                            logInfo(`Data de ida selecionada: ${dateStr}, preço: ${prices[dateStr] || 'N/A'}`);
                        }
                        // Se já tem data de ida e está selecionando data de volta
                        else {
                            // Verifica se a data selecionada é posterior à data de ida
                            const departDate = new Date(window.searchData.date);
                            const selectedDate = new Date(dateStr);
                            
                            if (selectedDate < departDate) {
                                alert('A data de volta deve ser posterior à data de ida.');
                                return;
                            }
                            
                            // Remove apenas a seleção de volta anterior
                            document.querySelectorAll('.day.return-date').forEach(d => {
                                d.classList.remove('selected');
                                d.classList.remove('return-date');
                            });
                            
                            // Marca como data de volta
                            dayElement.classList.add('selected');
                            dayElement.classList.add('return-date');
                            
                            // Armazena a data de volta
                            window.searchData.returnDate = dateStr;
                            
                            logInfo(`Data de volta selecionada: ${dateStr}, preço: ${prices[dateStr] || 'N/A'}`);
                        }
                    }
                });
            } else {
                // Dias passados ficam desabilitados
                dayElement.classList.add('disabled');
            }
            
            calendarContainer.appendChild(dayElement);
        }
    }
    
    // ===== NAVEGAÇÃO DO CALENDÁRIO =====
    function setupCalendarNavigation() {
        if (prevMonthBtn) {
            prevMonthBtn.addEventListener('click', () => {
                currentMonth--;
                if (currentMonth < 0) {
                    currentMonth = 11;
                    currentYear--;
                }
                // Chamada da função assíncrona
                generateCalendar(currentMonth, currentYear).catch(error => {
                    logError('Erro ao gerar calendário anterior', error);
                });
            });
        }
        
        if (nextMonthBtn) {
            nextMonthBtn.addEventListener('click', () => {
                currentMonth++;
                if (currentMonth > 11) {
                    currentMonth = 0;
                    currentYear++;
                }
                // Chamada da função assíncrona
                generateCalendar(currentMonth, currentYear).catch(error => {
                    logError('Erro ao gerar próximo calendário', error);
                });
            });
        }
    }
    
    // ===== BUSCA FINAL =====
    function setupSearch() {
        if (searchButton) {
            searchButton.addEventListener('click', () => {
                // Validação dos dados principais
                if (!window.searchData.origin || 
                    !window.searchData.destination || 
                    !window.searchData.date) {
                    alert('Por favor, preencha todos os campos: origem, destino e data de viagem.');
                    return;
                }
                
                // Verifica se precisa validar data de retorno
                if (window.searchData.tripType === 'roundtrip' && !window.searchData.returnDate) {
                    alert('Para viagens de ida e volta, por favor selecione também a data de retorno.');
                    return;
                }
                
                // Armazena os dados para a página de resultados
                const searchDataForResults = {
                    origin: window.searchData.origin,
                    destination: window.searchData.destination,
                    departDate: window.searchData.date,
                    adults: window.searchData.passengers,
                    cabinClass: window.searchData.cabinClass || 'economy',
                    tripType: window.searchData.tripType
                };
                
                // Adiciona data de retorno se for viagem de ida e volta
                if (window.searchData.tripType === 'roundtrip') {
                    searchDataForResults.returnDate = window.searchData.returnDate;
                }
                
                sessionStorage.setItem('searchData', JSON.stringify(searchDataForResults));
                
                logInfo('Redirecionando para resultados com dados:', window.searchData);
                
                // Redireciona para a página de resultados
                window.location.href = 'flight-results.html';
            });
        }
    }
    
    // ===== CONFIGURAR TIPO DE VIAGEM =====
    function setupTripType() {
        // Obter elementos de radio
        const onewayRadio = document.getElementById('oneway-radio');
        const roundtripRadio = document.getElementById('roundtrip-radio');
        
        if (!onewayRadio || !roundtripRadio) {
            logInfo('Elementos de tipo de viagem não encontrados');
            return;
        }
        
        // Atualizar quando mudar seleção
        onewayRadio.addEventListener('change', () => {
            if (onewayRadio.checked) {
                window.searchData.tripType = 'oneway';
                window.searchData.returnDate = null;
                logInfo('Tipo de viagem alterado para só ida');
                
                // Alterar título do calendário para indicar só ida
                const calendarTitle = document.querySelector('.calendar h4');
                if (calendarTitle) {
                    calendarTitle.innerHTML = 'Selecione a data de <strong>ida</strong>';
                }
            }
        });
        
        roundtripRadio.addEventListener('change', () => {
            if (roundtripRadio.checked) {
                window.searchData.tripType = 'roundtrip';
                logInfo('Tipo de viagem alterado para ida e volta');
                
                // Alterar título do calendário para indicar ida e volta
                const calendarTitle = document.querySelector('.calendar h4');
                if (calendarTitle) {
                    calendarTitle.innerHTML = 'Selecione a data de <strong>ida</strong> e <strong>volta</strong>';
                }
            }
        });
    }
    
    // ===== INICIALIZAÇÃO =====
    async function initialize() {
        // Inicialização da tela
        initScreen();
        
        // Configuração de autocompletar para aeroportos
        setupAirportAutocomplete(originInput, originCode, true);
        setupAirportAutocomplete(destinationInput, destinationCode, false);
        
        // Configuração de navegação
        setupNavigation();
        
        // Configuração de contadores de passageiros
        setupPassengerCounters();
        
        // Configuração da navegação do calendário
        setupCalendarNavigation();
        
        // Configuração do tipo de viagem
        setupTripType();
        
        // Configuração da busca
        setupSearch();
        
        logInfo('Sistema ViajarMax inicializado com sucesso');
        
        // Gera o calendário inicial (após definir origem/destino)
        // O calendário será carregado automaticamente após selecionar origem e destino
    }
    
    // Inicia tudo
    initialize().catch(error => {
        logError('Erro ao inicializar aplicação', error);
    });
});