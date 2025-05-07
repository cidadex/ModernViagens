/**
 * ViajarMax - Flight Results JS
 * Este arquivo gerencia a exibição de resultados de voos
 */

import { searchFlights, formatFlightResults } from './flights-api.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Página de resultados de voo carregada');
    
    // Elementos DOM
    const flightsList = document.querySelector('.flights-list');
    const sortPriceBtn = document.querySelector('.sort-btn:nth-child(2)');
    const sortDurationBtn = document.querySelector('.sort-btn:nth-child(3)');
    const sortTimeBtn = document.querySelector('.sort-btn:nth-child(4)');
    const routeInfo = document.querySelector('.route-info h1');
    const flightDetailsText = document.querySelector('.route-info p');
    const modifySearchBtn = document.querySelector('.btn-modify');
    
    // Recupera os dados da busca do sessionStorage
    const searchData = JSON.parse(sessionStorage.getItem('searchData'));
    
    // Se não houver dados de busca, redireciona para a página inicial
    if (!searchData) {
        console.error('Nenhum dado de busca encontrado!');
        alert('Por favor, realize uma busca de voos.');
        window.location.href = 'index.html';
        return;
    }
    
    console.log('Dados de busca recuperados:', searchData);
    
    // Atualiza as informações da rota na página
    if (routeInfo) {
        routeInfo.innerHTML = `Voos de <span class="highlight">${searchData.origin}</span> para <span class="highlight">${searchData.destination}</span>`;
    }
    
    // Formata a data para exibição
    const formattedDate = formatDate(searchData.departDate);
    const cabinClassName = formatCabinClass(searchData.cabinClass);
    
    // Atualiza os detalhes do voo
    if (flightDetailsText) {
        flightDetailsText.textContent = `${formattedDate} • ${searchData.adults} ${searchData.adults > 1 ? 'Passageiros' : 'Passageiro'} • ${cabinClassName}`;
    }
    
    // Configura o botão de modificar busca
    if (modifySearchBtn) {
        modifySearchBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
    
    // Busca os voos
    try {
        // Mostrar indicador de carregamento
        const loadingHtml = `
            <div class="loading-indicator">
                <div class="spinner"></div>
                <p>Buscando os melhores voos para você...</p>
            </div>
        `;
        
        // Insere após os botões de ordenação
        const sortOptions = document.querySelector('.sort-options');
        if (sortOptions && sortOptions.nextElementSibling) {
            sortOptions.insertAdjacentHTML('afterend', loadingHtml);
        } else if (flightsList) {
            flightsList.innerHTML = loadingHtml;
        }
        
        // Faz a requisição à API
        const flightResults = await searchFlights(searchData);
        
        // Remove o indicador de carregamento
        const loadingIndicator = document.querySelector('.loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
        
        // Formata os resultados para exibição
        const formattedResults = formatFlightResults(flightResults);
        
        if (formattedResults.length === 0) {
            // Exibe mensagem se não houver resultados
            flightsList.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>Nenhum voo encontrado</h3>
                    <p>Tente alterar sua data ou aeroportos de origem/destino.</p>
                    <button class="btn-search-again" onclick="window.location.href='index.html'">Buscar Novamente</button>
                </div>
            `;
            return;
        }
        
        // Variável para armazenar os resultados para ordenação
        let currentResults = [...formattedResults];
        
        // Função para renderizar os resultados
        const renderResults = (results) => {
            // Remove os cards existentes (exceto o elemento de ordenação)
            const existingCards = document.querySelectorAll('.flight-card');
            existingCards.forEach(card => card.remove());
            
            // Adiciona os novos cards
            results.forEach(flight => {
                const cardHtml = createFlightCard(flight);
                
                // Insere após os botões de ordenação
                if (sortOptions) {
                    sortOptions.insertAdjacentHTML('afterend', cardHtml);
                } else {
                    flightsList.insertAdjacentHTML('beforeend', cardHtml);
                }
            });
            
            // Adiciona evento de seleção aos novos botões
            document.querySelectorAll('.btn-select').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const flightCard = e.target.closest('.flight-card');
                    const flightId = flightCard.getAttribute('data-flight-id');
                    console.log(`Voo selecionado: ${flightId}`);
                    
                    // Aqui você poderia adicionar código para prosseguir com a reserva
                    alert('Funcionalidade de reserva será implementada em uma versão futura.');
                });
            });
        };
        
        // Renderiza os resultados iniciais
        renderResults(currentResults);
        
        // Função de ordenação por preço
        if (sortPriceBtn) {
            sortPriceBtn.addEventListener('click', () => {
                // Atualiza os botões ativos
                document.querySelectorAll('.sort-btn').forEach(btn => btn.classList.remove('active'));
                sortPriceBtn.classList.add('active');
                
                // Ordena por preço (menor para maior)
                currentResults.sort((a, b) => a.price.amount - b.price.amount);
                renderResults(currentResults);
            });
        }
        
        // Função de ordenação por duração
        if (sortDurationBtn) {
            sortDurationBtn.addEventListener('click', () => {
                // Atualiza os botões ativos
                document.querySelectorAll('.sort-btn').forEach(btn => btn.classList.remove('active'));
                sortDurationBtn.classList.add('active');
                
                // Converte a duração (ex: "1h 10m") para minutos para ordenação
                const getDurationMinutes = (flight) => {
                    const durationParts = flight.duration.match(/(\d+)h (\d+)m/);
                    if (durationParts) {
                        return parseInt(durationParts[1]) * 60 + parseInt(durationParts[2]);
                    }
                    return 0;
                };
                
                // Ordena por duração (menor para maior)
                currentResults.sort((a, b) => getDurationMinutes(a) - getDurationMinutes(b));
                renderResults(currentResults);
            });
        }
        
        // Função de ordenação por horário
        if (sortTimeBtn) {
            sortTimeBtn.addEventListener('click', () => {
                // Atualiza os botões ativos
                document.querySelectorAll('.sort-btn').forEach(btn => btn.classList.remove('active'));
                sortTimeBtn.classList.add('active');
                
                // Converte o horário (ex: "08:15") para minutos para ordenação
                const getTimeMinutes = (flight) => {
                    const timeParts = flight.departure.time.match(/(\d+):(\d+)/);
                    if (timeParts) {
                        return parseInt(timeParts[1]) * 60 + parseInt(timeParts[2]);
                    }
                    return 0;
                };
                
                // Ordena por horário de partida (mais cedo para mais tarde)
                currentResults.sort((a, b) => getTimeMinutes(a) - getTimeMinutes(b));
                renderResults(currentResults);
            });
        }
        
    } catch (error) {
        console.error('Erro ao buscar voos:', error);
        
        // Exibe mensagem de erro
        flightsList.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Erro ao buscar voos</h3>
                <p>Ocorreu um erro ao buscar os voos. Por favor, tente novamente.</p>
                <button class="btn-search-again" onclick="window.location.href='index.html'">Buscar Novamente</button>
            </div>
        `;
    }
});

// Função para criar um card de voo
function createFlightCard(flight) {
    const bestPriceTag = flight.isBestPrice ? '<div class="tag-promo">Melhor preço</div>' : '';
    const stopInfo = flight.stops === 0 ? 'Direto' : `${flight.stops} ${flight.stops === 1 ? 'escala' : 'escalas'}`;
    
    // Verifica se a URL da logo existe ou usa uma imagem padrão
    let logoUrl = flight.airline.logo;
    if (!logoUrl || !logoUrl.startsWith('/images/')) {
        // Se não tiver logo ou caminho válido, usa logo padrão genérica
        logoUrl = '/images/airline-generic.png';
    }
    
    return `
        <div class="flight-card" data-flight-id="${flight.id}">
            ${bestPriceTag}
            <div class="airline-info">
                <img src="${logoUrl}" alt="${flight.airline.name}" class="airline-logo" onerror="this.src='/images/airline-generic.png'">
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
                        <span class="direct">${stopInfo}</span>
                    </div>
                    <div class="arrival">
                        <span class="time">${flight.arrival.time}</span>
                        <span class="airport">${flight.arrival.airport}</span>
                    </div>
                </div>
                
                <div class="flight-info">
                    <span class="flight-number">${flight.flightNumber}</span>
                    <span class="aircraft">${flight.aircraft || 'Informação não disponível'}</span>
                </div>
            </div>
            
            <div class="price-actions">
                <div class="price-info">
                    <span class="price">${flight.price.formatted}</span>
                    <span class="traveler-info">Preço por adulto</span>
                    <span class="installments">em até 10x sem juros</span>
                </div>
                <button class="btn-select">Selecionar</button>
            </div>
        </div>
    `;
}

// Função para formatar a data (YYYY-MM-DD para DD de Mês, YYYY)
function formatDate(dateString) {
    if (!dateString) return '';
    
    const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    const dateParts = dateString.split('-');
    const year = dateParts[0];
    const month = parseInt(dateParts[1]) - 1; // Mês começa em 0
    const day = parseInt(dateParts[2]);
    
    return `${day} de ${months[month]}, ${year}`;
}

// Função para formatar a classe da cabine
function formatCabinClass(cabinClass) {
    const classMap = {
        'economy': 'Econômica',
        'business': 'Executiva',
        'first': 'Primeira Classe',
        'premium_economy': 'Econômica Premium'
    };
    
    return classMap[cabinClass.toLowerCase()] || 'Econômica';
}