/**
 * ViajarMax - JavaScript para busca simplificada
 * Combina todos os elementos de busca em uma única página
 */

import { searchAirports } from './flights-api.js';
import { processNaturalLanguageQuery } from './natural-language-processor.js';
import { initVoiceRecognition } from './voice-recognition.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando busca simplificada...');
    
    // Elementos do DOM - Tabs
    const searchTabs = document.querySelectorAll('.search-tabs .tab');
    const searchForms = document.querySelectorAll('.search-form');
    
    // Elementos do DOM - Standard Search
    const tripTypeRadios = document.querySelectorAll('input[name="trip-type"]');
    const returnDateInput = document.getElementById('return-date');
    const originInput = document.getElementById('origin-input');
    const destinationInput = document.getElementById('destination-input');
    const originCode = document.getElementById('origin-code');
    const destinationCode = document.getElementById('destination-code');
    const departDateInput = document.getElementById('depart-date');
    const cabinClassSelect = document.getElementById('cabin-class');
    const searchButton = document.getElementById('search-flights-btn');
    
    // Elementos do DOM - Passageiros
    const decreaseBtns = document.querySelectorAll('.btn-decrease');
    const increaseBtns = document.querySelectorAll('.btn-increase');
    const adultCount = document.getElementById('adults-count');
    const childrenCount = document.getElementById('children-count');
    const infantsCount = document.getElementById('infants-count');
    
    // Elementos do DOM - Calendário
    const calendarDays = document.getElementById('calendar-days');
    const monthYearDisplay = document.getElementById('month-year-display');
    const prevMonthBtn = document.querySelector('.btn-prev-month');
    const nextMonthBtn = document.querySelector('.btn-next-month');
    
    // Elementos do DOM - Natural Language
    const nlQuery = document.getElementById('nl-query');
    const nlVoiceBtn = document.getElementById('nl-voice-btn');
    const nlSearchBtn = document.getElementById('nl-search-btn');
    const nlFeedback = document.getElementById('nl-feedback');
    const nlFeedbackText = document.getElementById('nl-feedback-text');
    const nlExtractedData = document.getElementById('nl-extracted-data');
    
    // Dados da busca
    const searchData = {
        tripType: 'one-way',
        origin: null,
        destination: null,
        departDate: null,
        returnDate: null,
        adults: 1,
        children: 0,
        infants: 0,
        cabinClass: 'economy'
    };
    
    // =============================================
    // FUNCIONALIDADES DE NAVEGAÇÃO ENTRE ABAS
    // =============================================
    
    // Navegação entre as abas de busca (padrão/linguagem natural)
    searchTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabType = tab.getAttribute('data-type');
            
            // Atualiza as abas ativas
            searchTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Atualiza os formulários visíveis
            searchForms.forEach(form => form.classList.remove('active'));
            document.getElementById(`${tabType}-search`).classList.add('active');
        });
    });
    
    // =============================================
    // FUNCIONALIDADES DA BUSCA PADRÃO
    // =============================================
    
    // Configurar as datas mínimas
    const today = new Date();
    const todayISO = today.toISOString().split('T')[0];
    
    departDateInput.min = todayISO;
    returnDateInput.min = todayISO;
    
    // Configurar o tipo de viagem (ida/ida e volta)
    tripTypeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.checked) {
                searchData.tripType = radio.value;
                returnDateInput.disabled = (radio.value === 'one-way');
                
                if (radio.value === 'one-way') {
                    returnDateInput.value = '';
                    searchData.returnDate = null;
                }
            }
        });
    });
    
    // Autocompletar para aeroportos
    function setupAirportAutocomplete(input, codeElement, isOrigin) {
        let currentSuggestions = [];
        let autocompleteList = null;
        
        input.addEventListener('input', async () => {
            const query = input.value.trim();
            
            if (query.length < 2) {
                if (autocompleteList) {
                    autocompleteList.remove();
                    autocompleteList = null;
                }
                return;
            }
            
            try {
                const airports = await searchAirports(query);
                currentSuggestions = airports;
                
                // Remove a lista anterior se existir
                if (autocompleteList) {
                    autocompleteList.remove();
                }
                
                // Cria a nova lista de sugestões
                autocompleteList = document.createElement('div');
                autocompleteList.className = 'autocomplete-list';
                
                if (airports.length === 0) {
                    const noResults = document.createElement('div');
                    noResults.className = 'autocomplete-item no-results';
                    noResults.textContent = 'Nenhum aeroporto encontrado';
                    autocompleteList.appendChild(noResults);
                } else {
                    airports.forEach((airport, index) => {
                        const item = document.createElement('div');
                        item.className = 'autocomplete-item';
                        
                        const airportName = document.createElement('div');
                        airportName.className = 'airport-name';
                        airportName.textContent = `${airport.name}`;
                        
                        const airportDetail = document.createElement('div');
                        airportDetail.className = 'airport-detail';
                        airportDetail.textContent = `${airport.city}, ${airport.country} (${airport.code})`;
                        
                        item.appendChild(airportName);
                        item.appendChild(airportDetail);
                        
                        item.addEventListener('click', () => {
                            input.value = `${airport.city} (${airport.code})`;
                            codeElement.textContent = airport.code;
                            
                            if (isOrigin) {
                                searchData.origin = airport.code;
                            } else {
                                searchData.destination = airport.code;
                            }
                            
                            // Verifica se é possível buscar preços para o calendário
                            if (searchData.origin && searchData.destination) {
                                updateCalendar();
                            }
                            
                            // Remove a lista de sugestões
                            autocompleteList.remove();
                            autocompleteList = null;
                        });
                        
                        autocompleteList.appendChild(item);
                    });
                }
                
                // Adiciona a lista de sugestões ao DOM
                input.parentNode.style.position = 'relative';
                input.parentNode.appendChild(autocompleteList);
                
            } catch (error) {
                console.error('Erro ao buscar aeroportos:', error);
            }
        });
        
        // Fecha a lista quando clicar fora
        document.addEventListener('click', (e) => {
            if (autocompleteList && !input.contains(e.target) && !autocompleteList.contains(e.target)) {
                autocompleteList.remove();
                autocompleteList = null;
            }
        });
    }
    
    // Configura autocompletar
    setupAirportAutocomplete(originInput, originCode, true);
    setupAirportAutocomplete(destinationInput, destinationCode, false);
    
    // Eventos de data
    departDateInput.addEventListener('change', () => {
        searchData.departDate = departDateInput.value;
        
        // Atualiza a data mínima de retorno
        if (departDateInput.value) {
            returnDateInput.min = departDateInput.value;
            
            // Se a data de retorno for anterior à data de ida, atualiza
            if (returnDateInput.value && returnDateInput.value < departDateInput.value) {
                returnDateInput.value = departDateInput.value;
                searchData.returnDate = departDateInput.value;
            }
        }
    });
    
    returnDateInput.addEventListener('change', () => {
        searchData.returnDate = returnDateInput.value;
    });
    
    // Evento de classe de cabine
    cabinClassSelect.addEventListener('change', () => {
        searchData.cabinClass = cabinClassSelect.value;
        
        // Se tiver origem e destino, atualiza o calendário com a nova classe
        if (searchData.origin && searchData.destination) {
            updateCalendar();
        }
    });
    
    // Configuração dos contadores de passageiros
    function setupPassengerCounters() {
        // Diminuir contador
        decreaseBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.getAttribute('data-type');
                const countElement = document.getElementById(`${type}-count`);
                let count = parseInt(countElement.textContent);
                
                // Lógica para diminuir com limites
                if (type === 'adults') {
                    if (count > 1) {
                        count--;
                    }
                } else {
                    if (count > 0) {
                        count--;
                    }
                }
                
                countElement.textContent = count;
                searchData[type] = count;
            });
        });
        
        // Aumentar contador
        increaseBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.getAttribute('data-type');
                const countElement = document.getElementById(`${type}-count`);
                let count = parseInt(countElement.textContent);
                
                // Adiciona limite superior (9 passageiros para adultos, 5 para crianças/bebês)
                const maxCount = type === 'adults' ? 9 : 5;
                
                if (count < maxCount) {
                    count++;
                    countElement.textContent = count;
                    searchData[type] = count;
                }
            });
        });
    }
    
    setupPassengerCounters();
    
    // =============================================
    // FUNCIONALIDADES DO CALENDÁRIO
    // =============================================
    
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();
    
    // Nomes dos meses em português
    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    // Função para obter preços para o mês
    async function getMonthPrices(month, year) {
        // Somente carrega preços se tiver origem e destino
        if (!searchData.origin || !searchData.destination) {
            return {};
        }
        
        try {
            // Cria datas no formato ISO (YYYY-MM-DD)
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            
            const startDate = firstDay.toISOString().split('T')[0];
            const endDate = lastDay.toISOString().split('T')[0];
            
            // Prepara os parâmetros para a API
            const params = {
                origin: searchData.origin,
                destination: searchData.destination,
                departDate: startDate,
                endDate: endDate,
                adults: searchData.adults,
                cabinClass: searchData.cabinClass
            };
            
            console.log('Buscando preços do mês:', params);
            
            // Faz a requisição para a API
            const response = await fetch('/api/prices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(params)
            });
            
            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data && data.prices) {
                return data.prices;
            } else {
                throw new Error('API não retornou preços válidos');
            }
        } catch (error) {
            console.error('Erro ao carregar preços:', error);
            
            // Gera preços simulados para demonstração
            // (em produção, mostraríamos uma mensagem de erro)
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const simulatedPrices = {};
            
            for (let i = 1; i <= daysInMonth; i++) {
                const day = i.toString().padStart(2, '0');
                const monthStr = (month + 1).toString().padStart(2, '0');
                const dateStr = `${year}-${monthStr}-${day}`;
                
                // Preço base entre R$ 300 e R$ 1200
                const basePrice = Math.floor(Math.random() * 900) + 300;
                simulatedPrices[dateStr] = basePrice;
            }
            
            return simulatedPrices;
        }
    }
    
    // Função para atualizar o calendário
    async function updateCalendar() {
        if (!calendarDays) return;
        
        // Mostra indicador de carregamento
        calendarDays.innerHTML = '';
        const loadingElement = document.createElement('div');
        loadingElement.className = 'calendar-loading';
        loadingElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando preços...';
        calendarDays.appendChild(loadingElement);
        
        // Atualiza o título do mês
        if (monthYearDisplay) {
            monthYearDisplay.textContent = `${monthNames[currentMonth]} de ${currentYear}`;
        }
        
        try {
            // Se origem e destino estiverem definidos, carrega preços
            if (searchData.origin && searchData.destination) {
                const prices = await getMonthPrices(currentMonth, currentYear);
                
                // Encontra o menor e o maior preço
                let minPrice = Number.MAX_VALUE;
                let maxPrice = 0;
                
                Object.values(prices).forEach(price => {
                    if (price < minPrice) minPrice = price;
                    if (price > maxPrice) maxPrice = price;
                });
                
                console.log(`Faixa de preços: Min ${minPrice}, Max ${maxPrice}`);
                
                // Limpa o conteúdo e gera os dias
                calendarDays.innerHTML = '';
                
                // Determina o primeiro dia do mês (0 = Domingo, 1 = Segunda, etc.)
                const firstDay = new Date(currentYear, currentMonth, 1).getDay();
                
                // Adiciona os dias vazios antes do início do mês
                for (let i = 0; i < firstDay; i++) {
                    const emptyDay = document.createElement('div');
                    emptyDay.className = 'day empty';
                    calendarDays.appendChild(emptyDay);
                }
                
                // Número de dias no mês
                const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                
                // Gera os dias do mês
                for (let i = 1; i <= daysInMonth; i++) {
                    const dayElement = document.createElement('div');
                    dayElement.className = 'day';
                    
                    // Data formatada
                    const paddedMonth = (currentMonth + 1).toString().padStart(2, '0');
                    const paddedDay = i.toString().padStart(2, '0');
                    const dateStr = `${currentYear}-${paddedMonth}-${paddedDay}`;
                    
                    // Conteúdo do dia (número + preço)
                    const dayContent = document.createElement('div');
                    dayContent.className = 'day-content';
                    
                    // Número do dia
                    const dayNumber = document.createElement('div');
                    dayNumber.className = 'day-number';
                    dayNumber.textContent = i;
                    dayContent.appendChild(dayNumber);
                    
                    // Preço (se disponível)
                    if (prices && prices[dateStr]) {
                        const priceElement = document.createElement('div');
                        priceElement.className = 'day-price';
                        
                        const formattedPrice = new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                        }).format(prices[dateStr]);
                        
                        priceElement.textContent = formattedPrice;
                        dayContent.appendChild(priceElement);
                        
                        // Marca como dia com preço
                        dayElement.classList.add('has-price');
                        
                        // Adiciona classe para indicar faixa de preço (baixo, médio, alto)
                        const priceRange = maxPrice - minPrice;
                        const priceValue = prices[dateStr];
                        
                        if (priceRange > 0) {
                            const pricePercentage = (priceValue - minPrice) / priceRange;
                            
                            if (pricePercentage < 0.25) {
                                dayElement.classList.add('price-low');
                            } else if (pricePercentage < 0.75) {
                                dayElement.classList.add('price-medium');
                            } else {
                                dayElement.classList.add('price-high');
                            }
                        }
                    }
                    
                    dayElement.appendChild(dayContent);
                    
                    // Marca o dia atual
                    if (currentMonth === today.getMonth() && 
                        currentYear === today.getFullYear() && 
                        i === today.getDate()) {
                        dayElement.classList.add('today');
                    }
                    
                    // Verifica se o dia é passado
                    const dayDate = new Date(currentYear, currentMonth, i);
                    today.setHours(0, 0, 0, 0);
                    
                    if (dayDate >= today) {
                        dayElement.addEventListener('click', () => {
                            // Seleciona o dia e atualiza o input de data
                            document.querySelectorAll('.day').forEach(d => {
                                d.classList.remove('selected');
                            });
                            
                            dayElement.classList.add('selected');
                            
                            const selectedDate = dateStr;
                            searchData.departDate = selectedDate;
                            departDateInput.value = selectedDate;
                            
                            // Atualiza a data mínima de retorno
                            returnDateInput.min = selectedDate;
                            
                            // Se a data de retorno for anterior à data de ida, atualiza
                            if (returnDateInput.value && returnDateInput.value < selectedDate) {
                                returnDateInput.value = selectedDate;
                                searchData.returnDate = selectedDate;
                            }
                            
                            console.log(`Data selecionada: ${selectedDate} (Preço: ${prices[dateStr] ? prices[dateStr] : 'N/A'})`);
                        });
                    } else {
                        // Dias passados ficam desabilitados
                        dayElement.classList.add('disabled');
                    }
                    
                    calendarDays.appendChild(dayElement);
                }
            } else {
                // Se não tiver origem e destino, mostra mensagem
                calendarDays.innerHTML = '';
                const infoElement = document.createElement('div');
                infoElement.className = 'calendar-info';
                infoElement.innerHTML = '<i class="fas fa-info-circle"></i><span>Selecione origem e destino para ver preços</span>';
                calendarDays.appendChild(infoElement);
            }
        } catch (error) {
            console.error('Erro ao gerar calendário:', error);
            
            // Exibe mensagem de erro
            calendarDays.innerHTML = '';
            const errorElement = document.createElement('div');
            errorElement.className = 'calendar-error';
            errorElement.innerHTML = '<i class="fas fa-exclamation-circle"></i> Não foi possível carregar o calendário. Tente novamente.';
            calendarDays.appendChild(errorElement);
        }
    }
    
    // Navegar entre os meses
    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            updateCalendar();
        });
    }
    
    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            updateCalendar();
        });
    }
    
    // Inicializa o calendário
    updateCalendar();
    
    // =============================================
    // BUSCA POR LINGUAGEM NATURAL
    // =============================================
    
    // Reconhecimento de voz
    if (nlVoiceBtn) {
        nlVoiceBtn.addEventListener('click', () => {
            // Mostra feedback
            showNLFeedback('Diga para onde você quer viajar...', 'recording');
            
            const voiceRecognition = initVoiceRecognition(
                // Callback para texto reconhecido
                (text) => {
                    nlQuery.value = text;
                    showNLFeedback('Processando sua solicitação...', 'processing');
                },
                // Callback para fim do reconhecimento
                () => {
                    if (nlQuery.value.trim().length > 0) {
                        processNL(nlQuery.value);
                    } else {
                        hideNLFeedback();
                    }
                }
            );
            
            // Inicia o reconhecimento
            voiceRecognition.start();
        });
    }
    
    // Botão de busca por linguagem natural
    if (nlSearchBtn) {
        nlSearchBtn.addEventListener('click', () => {
            const query = nlQuery.value.trim();
            
            if (query.length > 0) {
                processNL(query);
            }
        });
    }
    
    // Processar consulta em linguagem natural
    async function processNL(query) {
        showNLFeedback('Processando sua solicitação...', 'processing');
        
        try {
            const result = await processNaturalLanguageQuery(query);
            
            if (result) {
                showNLFeedback('Informações extraídas com sucesso!', 'success');
                
                // Preenche os campos do formulário com os dados extraídos
                fillFormWithNLData(result);
                
                // Exibe os dados extraídos
                displayExtractedData(result);
                
                // Muda para a aba de busca padrão
                searchTabs[0].click();
            } else {
                showNLFeedback('Não foi possível extrair informações da sua solicitação. Por favor, tente novamente.', 'error');
            }
        } catch (error) {
            console.error('Erro ao processar linguagem natural:', error);
            showNLFeedback('Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.', 'error');
        }
    }
    
    // Mostra feedback da busca por linguagem natural
    function showNLFeedback(message, status) {
        nlFeedback.style.display = 'block';
        nlFeedbackText.textContent = message;
        
        // Remove classes de status anteriores
        nlFeedback.classList.remove('recording', 'processing', 'success', 'error');
        
        // Adiciona classe de status atual
        if (status) {
            nlFeedback.classList.add(status);
        }
    }
    
    // Esconde feedback da busca por linguagem natural
    function hideNLFeedback() {
        nlFeedback.style.display = 'none';
    }
    
    // Exibe dados extraídos
    function displayExtractedData(data) {
        if (!nlExtractedData) return;
        
        nlExtractedData.innerHTML = '';
        
        if (data.origin) {
            const originItem = document.createElement('div');
            originItem.innerHTML = `<strong>Origem:</strong> ${data.origin}`;
            nlExtractedData.appendChild(originItem);
        }
        
        if (data.destination) {
            const destItem = document.createElement('div');
            destItem.innerHTML = `<strong>Destino:</strong> ${data.destination}`;
            nlExtractedData.appendChild(destItem);
        }
        
        if (data.date) {
            const dateItem = document.createElement('div');
            dateItem.innerHTML = `<strong>Data:</strong> ${formatDate(data.date)}`;
            nlExtractedData.appendChild(dateItem);
        }
        
        if (data.returnDate) {
            const returnItem = document.createElement('div');
            returnItem.innerHTML = `<strong>Retorno:</strong> ${formatDate(data.returnDate)}`;
            nlExtractedData.appendChild(returnItem);
        }
        
        if (data.passengers) {
            const passengersItem = document.createElement('div');
            passengersItem.innerHTML = `<strong>Passageiros:</strong> ${data.passengers}`;
            nlExtractedData.appendChild(passengersItem);
        }
        
        if (data.cabinClass) {
            const classItem = document.createElement('div');
            classItem.innerHTML = `<strong>Classe:</strong> ${formatCabinClass(data.cabinClass)}`;
            nlExtractedData.appendChild(classItem);
        }
    }
    
    // Preenche o formulário com dados de linguagem natural
    function fillFormWithNLData(data) {
        if (data.origin) {
            originInput.value = data.origin;
            originCode.textContent = data.origin;
            searchData.origin = data.origin;
        }
        
        if (data.destination) {
            destinationInput.value = data.destination;
            destinationCode.textContent = data.destination;
            searchData.destination = data.destination;
        }
        
        if (data.date) {
            const formattedDate = formatDateToISO(data.date);
            departDateInput.value = formattedDate;
            searchData.departDate = formattedDate;
        }
        
        if (data.returnDate) {
            const formattedReturnDate = formatDateToISO(data.returnDate);
            
            // Ativa viagem de ida e volta
            tripTypeRadios[1].checked = true;
            returnDateInput.disabled = false;
            searchData.tripType = 'round-trip';
            
            returnDateInput.value = formattedReturnDate;
            searchData.returnDate = formattedReturnDate;
        }
        
        if (data.passengers) {
            const passengers = parseInt(data.passengers) || 1;
            adultCount.textContent = passengers;
            searchData.adults = passengers;
        }
        
        if (data.cabinClass) {
            cabinClassSelect.value = data.cabinClass;
            searchData.cabinClass = data.cabinClass;
        }
        
        // Atualiza o calendário se origem e destino foram definidos
        if (searchData.origin && searchData.destination) {
            updateCalendar();
        }
    }
    
    // Formata uma data para exibição
    function formatDate(date) {
        if (!date) return '';
        
        const isISO = date.includes('-');
        let dateObj;
        
        if (isISO) {
            const parts = date.split('-');
            dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
        } else {
            dateObj = new Date(date);
        }
        
        return dateObj.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
    
    // Formata uma data para formato ISO (YYYY-MM-DD)
    function formatDateToISO(date) {
        if (!date) return '';
        
        const isISO = date.includes('-') && date.split('-')[0].length === 4;
        
        if (isISO) return date;
        
        const dateObj = new Date(date);
        
        const year = dateObj.getFullYear();
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const day = dateObj.getDate().toString().padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    }
    
    // Formata a classe da cabine para exibição
    function formatCabinClass(cabinClass) {
        const classes = {
            'economy': 'Econômica',
            'premium_economy': 'Econômica Premium',
            'business': 'Executiva',
            'first': 'Primeira Classe'
        };
        
        return classes[cabinClass] || 'Econômica';
    }
    
    // =============================================
    // BUSCA DE VOOS
    // =============================================
    
    // Botão de busca de voos
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            // Validação dos campos obrigatórios
            if (!searchData.origin || !searchData.destination || !searchData.departDate) {
                alert('Por favor, preencha os campos obrigatórios: origem, destino e data de ida.');
                return;
            }
            
            // Para viagem de ida e volta, valida data de retorno
            if (searchData.tripType === 'round-trip' && !searchData.returnDate) {
                alert('Para viagens de ida e volta, por favor selecione uma data de retorno.');
                return;
            }
            
            // Prepara os dados para enviar à página de resultados
            const searchParams = {
                origin: searchData.origin,
                destination: searchData.destination,
                departDate: searchData.departDate,
                returnDate: searchData.returnDate,
                adults: searchData.adults,
                children: searchData.children,
                infants: searchData.infants,
                cabinClass: searchData.cabinClass,
                tripType: searchData.tripType
            };
            
            // Armazena os dados no sessionStorage
            sessionStorage.setItem('searchData', JSON.stringify(searchParams));
            
            // Redireciona para a página de resultados
            window.location.href = 'flight-results.html';
        });
    }
});