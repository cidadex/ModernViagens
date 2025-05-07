/**
 * ViajarMax - Search Flow JavaScript
 * This file contains the interactive functionality for the multi-step flight search
 */

import { searchFlights, formatFlightResults } from './flights-api.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("Iniciando fluxo de busca...");
    
    // Elements
    const searchStep1 = document.getElementById('search-step-1');
    const searchStep2 = document.getElementById('search-step-2');
    const continueBtn = document.getElementById('continue-search');
    const backBtn = document.querySelector('.btn-back');
    const originInput = document.getElementById('origin-input');
    const destinationInput = document.getElementById('destination-input');
    const originCode = document.getElementById('origin-code');
    const destinationCode = document.getElementById('destination-code');
    const originDisplay = document.getElementById('origin-display');
    const destinationDisplay = document.getElementById('destination-display');
    const calendarDays = document.querySelectorAll('.day:not(.empty)');
    const decreaseBtns = document.querySelectorAll('.btn-decrease');
    const increaseBtns = document.querySelectorAll('.btn-increase');
    const passengerCounts = document.querySelectorAll('.count');
    const searchButton = document.querySelector('.search-button');
    
    // Objeto global para armazenar os dados da busca
    window.searchData = window.searchData || {
        origin: null,
        destination: null,
        date: null,
        passengers: 1,
        cabinClass: 'economy'
    };
    
    // Forçar a exibição da primeira etapa (busca de aeroportos)
    console.log("Forçando exibição da etapa 1...");
    
    // Código de depuração para verificar se os elementos foram encontrados
    console.log("searchStep1:", searchStep1);
    console.log("searchStep2:", searchStep2);
    
    // MODO NORMAL - Exibir a primeira etapa
    const demoMode = false; // Mudando para false para garantir a navegação correta
    
    if (searchStep1 && searchStep2) {
        // Remover todas as classes que possam interferir
        if (demoMode) {
            // Modo de demonstração: pular para a etapa 2
            searchStep1.style.display = "none";
            searchStep2.style.display = "block";
            searchStep1.classList.add('hidden');
            searchStep2.classList.remove('hidden');
        } else {
            // Modo normal: começar na etapa 1
            searchStep1.style.display = "block";
            searchStep2.style.display = "none";
            searchStep1.classList.remove('hidden');
            searchStep2.classList.add('hidden');
        }
        
        console.log("Estado após alteração - Step1 hidden:", searchStep1.classList.contains('hidden'));
        console.log("Estado após alteração - Step2 hidden:", searchStep2.classList.contains('hidden'));
    }
    
    // Go back to step 1
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            searchStep2.classList.add('hidden');
            searchStep2.style.display = 'none';
            
            searchStep1.classList.remove('hidden');
            searchStep1.style.display = 'block';
            
            console.log("Voltando para a etapa 1 - Busca");
        });
    }
    
    // Continue to step 2 (calendar view)
    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            // Validação de entradas
            const originValue = originCode.textContent;
            const destValue = destinationCode.textContent;
            
            if (!originValue || !destValue) {
                alert('Por favor, selecione um aeroporto de origem e destino válidos.');
                return;
            }
            
            // Atualiza os dados de busca
            window.searchData = window.searchData || {};
            window.searchData.origin = originValue;
            window.searchData.destination = destValue;
            
            console.log('🔄 Dados de pesquisa atualizados:', window.searchData);
            
            // Muda para a etapa 2
            searchStep1.classList.add('hidden');
            searchStep1.style.display = 'none';
            
            searchStep2.classList.remove('hidden');
            searchStep2.style.display = 'block';
            
            console.log("🚀 Navegando para a etapa 2 - Calendário");
            
            // Update the display in step 2 with the selected airports
            if (originDisplay && destinationDisplay) {
                originDisplay.textContent = originValue;
                destinationDisplay.textContent = destValue;
            }
            
            // ⚠️ IMPORTANTE: Força o calendário a ser atualizado com os novos dados
            // após navegar para a etapa 2
            if (typeof generateCalendar === 'function') {
                console.log('🔄 Atualizando calendário com os novos aeroportos');
                setTimeout(() => generateCalendar(currentMonth, currentYear), 100);
            }
        });
    }
    
    // Variáveis para controlar o calendário
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    
    // Elementos do calendário
    const calendarContainer = document.querySelector('.days');
    const monthYearDisplay = document.querySelector('.month-navigation h4');
    const prevMonthBtn = document.querySelector('.btn-prev-month');
    const nextMonthBtn = document.querySelector('.btn-next-month');
    
    // Nomes dos meses em português
    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    // Função para carregar preços para o mês
    async function loadPricesForMonth(month, year) {
        // Adiciona log de depuração para verificar os dados disponíveis
        console.log('🔍 Verificando dados para busca de preços:', {
            month: month + 1, // +1 porque janeiro é 0
            year,
            origin: window.searchData ? window.searchData.origin : 'não definido',
            destination: window.searchData ? window.searchData.destination : 'não definido',
        });
        
        // Somente carrega preços se tiver origem e destino definidos
        if (!window.searchData || !window.searchData.origin || !window.searchData.destination) {
            console.log('⚠️ Origem ou destino não definidos, não é possível carregar preços');
            
            // Demonstração de função trabalhando - SOMENTE PARA TESTE
            // Em ambiente de produção real, retornaria um objeto vazio
            console.log('⚠️ Usando preços de demonstração para testes de interface');
            
            // Gera preços de demonstração para testar a interface visual
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const demoData = {};
            
            for (let i = 1; i <= daysInMonth; i++) {
                const day = i.toString().padStart(2, '0');
                const monthStr = (month + 1).toString().padStart(2, '0');
                const date = `${year}-${monthStr}-${day}`;
                
                // Preços com variação para mostrar o efeito visual
                const precoBase = 400;  // Base de R$ 400
                const diaSemana = new Date(year, month, i).getDay();
                
                // Final de semana 30% mais caro
                let multiplicador = (diaSemana === 0 || diaSemana === 6) ? 1.3 : 1.0;
                
                // 2ª semana mais barata, 3ª semana mais cara
                const semana = Math.floor(i / 7) + 1;
                if (semana === 2) multiplicador *= 0.8;
                if (semana === 3) multiplicador *= 1.4;
                
                const precoFinal = Math.round(precoBase * multiplicador);
                demoData[date] = precoFinal;
            }
            
            return demoData;
        }
        
        try {
            // Cria o primeiro dia do mês
            const firstDayOfMonth = new Date(year, month, 1);
            // Cria o último dia do mês
            const lastDayOfMonth = new Date(year, month + 1, 0);
            
            // Formata as datas para o formato ISO (YYYY-MM-DD)
            const startDate = firstDayOfMonth.toISOString().split('T')[0];
            const endDate = lastDayOfMonth.toISOString().split('T')[0];
            
            console.log(`🔍 Carregando preços de ${startDate} até ${endDate}`);
            
            // Constrói os parâmetros para a busca de voos
            const params = {
                origin: window.searchData.origin,
                destination: window.searchData.destination,
                departDate: startDate,
                endDate: endDate, // Período completo para buscar preços
                adults: window.searchData.passengers || 1,
                cabinClass: window.searchData.cabinClass || 'economy'
            };
            
            console.log('📝 Parâmetros da busca de preços:', params);
            
            // Faz a requisição à API usando URL relativa
            console.log('🌐 Enviando requisição para /api/prices...');
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
            console.log('✅ Preços obtidos da API:', data);
            
            // Retorna objeto com preços por data
            if (data && data.prices) {
                console.log('📊 Número de dias com preços:', Object.keys(data.prices).length);
                return data.prices;
            } else {
                throw new Error('A API não retornou preços válidos');
            }
        } catch (error) {
            console.error('❌ Erro ao carregar preços:', error);
            
            // Mesmo em caso de erro, precisamos mostrar algo para demonstração
            // Isto é apenas um fallback em caso de falha da API
            console.log('⚠️ Usando preços simulados devido a erro na API');
            
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const simulatedPrices = {};
            
            for (let i = 1; i <= daysInMonth; i++) {
                const day = i.toString().padStart(2, '0');
                const monthStr = (month + 1).toString().padStart(2, '0');
                const date = `${year}-${monthStr}-${day}`;
                
                // Preço base entre R$ 250 e R$ 950
                const basePrice = Math.floor(Math.random() * 700) + 250;
                simulatedPrices[date] = basePrice;
            }
            
            return simulatedPrices;
        }
    }
    
    // Função para gerar o calendário
    async function generateCalendar(month, year) {
        // Limpa o conteúdo atual do calendário
        if (calendarContainer) {
            calendarContainer.innerHTML = '';
            
            // Mostra um indicador de carregamento
            const loadingElement = document.createElement('div');
            loadingElement.className = 'calendar-loading';
            loadingElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando preços...';
            calendarContainer.appendChild(loadingElement);
            
            // Atualiza o display do mês/ano
            if (monthYearDisplay) {
                monthYearDisplay.textContent = `${monthNames[month]} de ${year}`;
            }
            
            try {
                // Carrega os preços para o mês atual
                const prices = await loadPricesForMonth(month, year);
                
                // Encontra o menor e o maior preço para classificação visual
                let minPrice = Number.MAX_VALUE;
                let maxPrice = 0;
                
                Object.values(prices).forEach(price => {
                    if (price < minPrice) minPrice = price;
                    if (price > maxPrice) maxPrice = price;
                });
                
                console.log(`Faixa de preços: Min ${minPrice}, Max ${maxPrice}`);
                
                // Remove o indicador de carregamento
                calendarContainer.innerHTML = '';
                
                // Determina o primeiro dia do mês (0 = Domingo, 1 = Segunda, etc.)
                const firstDay = new Date(year, month, 1).getDay();
                
                // Adiciona os espaços vazios antes do primeiro dia
                for (let i = 0; i < firstDay; i++) {
                    const emptyDay = document.createElement('div');
                    emptyDay.className = 'day empty';
                    calendarContainer.appendChild(emptyDay);
                }
                
                // Determina o número de dias no mês
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                
                // Adiciona os dias do mês
                for (let i = 1; i <= daysInMonth; i++) {
                    const dayElement = document.createElement('div');
                    dayElement.className = 'day';
                    
                    // Constrói a data no formato ISO
                    const paddedMonth = (month + 1).toString().padStart(2, '0');
                    const paddedDay = i.toString().padStart(2, '0');
                    const dateStr = `${year}-${paddedMonth}-${paddedDay}`;
                    
                    // Estrutura interna do dia com número e preço
                    const dayContent = document.createElement('div');
                    dayContent.className = 'day-content';
                    
                    // Número do dia
                    const dayNumber = document.createElement('div');
                    dayNumber.className = 'day-number';
                    dayNumber.textContent = i;
                    dayContent.appendChild(dayNumber);
                    
                    // Preço do dia (se disponível)
                    if (prices && prices[dateStr]) {
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
                        
                        // Adiciona classe especial para dias com preço
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
                    
                    // Marca o dia atual se estiver visualizando o mês atual
                    if (month === new Date().getMonth() && 
                        year === new Date().getFullYear() && 
                        i === new Date().getDate()) {
                        dayElement.classList.add('today');
                    }
                    
                    // Se o dia for hoje ou futuro, permite selecionar
                    const dayDate = new Date(year, month, i);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    if (dayDate >= today) {
                        dayElement.addEventListener('click', () => {
                            // Remove a classe 'selected' de todos os dias
                            document.querySelectorAll('.day').forEach(d => {
                                d.classList.remove('selected');
                            });
                            
                            // Adiciona a classe 'selected' ao dia clicado
                            dayElement.classList.add('selected');
                            
                            // Armazena a data selecionada (formato ISO: YYYY-MM-DD)
                            const selectedDate = dateStr;
                            
                            // Armazena a data no objeto de dados de pesquisa
                            window.searchData.date = selectedDate;
                            
                            console.log(`Data selecionada: ${selectedDate} (Preço: ${prices[dateStr] ? prices[dateStr] : 'N/A'})`);
                        });
                    } else {
                        // Dias passados ficam desabilitados
                        dayElement.classList.add('disabled');
                    }
                    
                    calendarContainer.appendChild(dayElement);
                }
            } catch (error) {
                console.error('Erro ao gerar calendário:', error);
                
                // Em caso de erro, exibe uma mensagem
                calendarContainer.innerHTML = '';
                const errorElement = document.createElement('div');
                errorElement.className = 'calendar-error';
                errorElement.innerHTML = '<i class="fas fa-exclamation-circle"></i> Não foi possível carregar o calendário. Tente novamente.';
                calendarContainer.appendChild(errorElement);
            }
        }
    }
    
    // Configura os botões de navegação do calendário
    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            generateCalendar(currentMonth, currentYear);
        });
    }
    
    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            generateCalendar(currentMonth, currentYear);
        });
    }
    
    // Gera o calendário para o mês atual na inicialização
    generateCalendar(currentMonth, currentYear);
    
    // Passenger counter functionality
    if (decreaseBtns.length && increaseBtns.length) {
        // Decrease passenger count
        decreaseBtns.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                let count = parseInt(passengerCounts[index].textContent);
                if (count > 0) {
                    count--;
                    passengerCounts[index].textContent = count;
                }
                // Ensure at least 1 adult passenger
                if (index === 0 && count === 0) {
                    passengerCounts[index].textContent = 1;
                }
                
                // Atualiza o objeto de dados da busca com o número de passageiros adultos
                if (index === 0) {
                    window.searchData.passengers = parseInt(passengerCounts[index].textContent);
                }
            });
        });
        
        // Increase passenger count
        increaseBtns.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                let count = parseInt(passengerCounts[index].textContent);
                count++;
                passengerCounts[index].textContent = count;
                
                // Atualiza o objeto de dados da busca com o número de passageiros adultos
                if (index === 0) {
                    window.searchData.passengers = count;
                }
            });
        });
    }
    
    // Configura os radio buttons da classe de cabine
    const cabinClassRadios = document.querySelectorAll('input[name="travel-class"]');
    const cabinClassMappings = [
        { label: 'Econômica', value: 'economy' },
        { label: 'Executiva', value: 'business' },
        { label: 'Primeira Classe', value: 'first' },
        { label: 'Econômica Premium', value: 'premium_economy' }
    ];
    
    cabinClassRadios.forEach((radio, index) => {
        radio.addEventListener('change', () => {
            if (radio.checked) {
                // Atualiza o objeto de dados da busca com a classe selecionada
                window.searchData.cabinClass = cabinClassMappings[index].value;
            }
        });
    });
    
    // Configura o botão de busca
    if (searchButton) {
        searchButton.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // Validar dados antes de prosseguir
            if (!window.searchData.origin || !window.searchData.destination || !window.searchData.date) {
                alert('Por favor, preencha todos os campos obrigatórios: origem, destino e data.');
                return;
            }
            
            console.log('Dados de busca:', window.searchData);
            
            // Armazena os dados no sessionStorage para usar na página de resultados
            sessionStorage.setItem('searchData', JSON.stringify({
                origin: window.searchData.origin,
                destination: window.searchData.destination,
                departDate: window.searchData.date,
                adults: window.searchData.passengers,
                cabinClass: window.searchData.cabinClass
            }));
            
            // Redireciona para a página de resultados
            window.location.href = 'flight-results.html';
        });
    }
});