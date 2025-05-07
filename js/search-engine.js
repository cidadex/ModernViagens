/**
 * ViajarMax - Motor de Busca
 * Este módulo integra a busca convencional e por linguagem natural
 */

// Importando os módulos necessários
import { processNaturalLanguageQuery } from './natural-language-processor.js';
import { searchFlights, formatFlightResults } from './flights-api.js';
import { initVoiceRecognition } from './voice-recognition.js';
import { searchLocalAirports } from './airports-data.js';

// Configuração de debug
const DEBUG = true;

// Logger melhorado
function logDebug(message, data) {
    if (DEBUG) {
        if (data) {
            console.log(`[ViajarMax] ${message}`, data);
        } else {
            console.log(`[ViajarMax] ${message}`);
        }
    }
}

// Logger para erros
function logError(message, error) {
    console.error(`[ViajarMax ERROR] ${message}`, error);
    
    // Adiciona logs adicionais para diagnóstico
    if (error && error.stack) {
        console.error(`Stack trace: ${error.stack}`);
    }
}

// Elementos do DOM
let searchModeTabs;
let searchModeContents;
let originInput;
let destinationInput;
let continueBtn;
let nlQueryTextarea;
let nlVoiceBtn;
let nlSearchBtn;
let nlFeedback;
let nlFeedbackText;
let nlExtractedData;
let airportsList;

let voiceRecognition = null;
let isRecording = false;

// Dados da busca
let searchData = {
    origin: null,
    destination: null,
    date: null,
    passengers: 1,
    cabinClass: 'economy'
};

// Torna o objeto searchData disponível globalmente
window.searchData = searchData;

/**
 * Inicializa o motor de busca quando o DOM estiver pronto
 */
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar elementos DOM
    initElements();
    
    // Configurar navegação de abas
    setupTabNavigation();
    
    // Configurar busca por linguagem natural
    setupNaturalLanguageSearch();
    
    // Configurar autocompletar de aeroportos
    setupAirportAutocomplete();
    
    // Configurar eventos de formulário padrão
    setupStandardSearch();
    
    logDebug('Motor de busca inicializado com sucesso');
});

/**
 * Inicializa referências aos elementos DOM
 */
function initElements() {
    searchModeTabs = document.querySelectorAll('.search-mode-tab');
    searchModeContents = document.querySelectorAll('.search-mode-content');
    originInput = document.getElementById('origin-input');
    destinationInput = document.getElementById('destination-input');
    continueBtn = document.getElementById('continue-search');
    nlQueryTextarea = document.getElementById('nl-query');
    nlVoiceBtn = document.getElementById('nl-voice-btn');
    nlSearchBtn = document.getElementById('nl-search-btn');
    nlFeedback = document.getElementById('nl-feedback');
    nlFeedbackText = document.getElementById('nl-feedback-text');
    nlExtractedData = document.getElementById('nl-extracted-data');
    
    // Log para depuração
    logDebug('Elementos DOM inicializados', {
        originInput: originInput,
        destinationInput: destinationInput,
        continueBtn: continueBtn
    });
}

/**
 * Configura a navegação entre abas (busca padrão / linguagem natural)
 */
function setupTabNavigation() {
    searchModeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove classe active de todas as abas
            searchModeTabs.forEach(t => t.classList.remove('active'));
            // Adiciona classe active na aba clicada
            tab.classList.add('active');
            
            // Esconde todos os conteúdos
            searchModeContents.forEach(content => content.classList.remove('active'));
            
            // Mostra o conteúdo correspondente à aba clicada
            const mode = tab.getAttribute('data-mode');
            document.getElementById(`${mode}-search`).classList.add('active');
            
            // Reseta feedback se mudar para outra aba
            nlFeedback.style.display = 'none';
        });
    });
}

/**
 * Configura a busca por linguagem natural (texto e voz)
 */
function setupNaturalLanguageSearch() {
    // Configura o botão de pesquisa por texto
    nlSearchBtn.addEventListener('click', async () => {
        const query = nlQueryTextarea.value.trim();
        if (query.length < 5) {
            showFeedback('Por favor, descreva sua viagem com mais detalhes.', 'error');
            return;
        }
        
        await processNaturalLanguage(query);
    });
    
    // Inicializa e configura o reconhecimento de voz
    voiceRecognition = initVoiceRecognition(
        // Callback para resultado reconhecido
        (result) => {
            nlQueryTextarea.value = result;
            showFeedback('Processando sua solicitação por voz...', 'info');
        },
        // Callback para fim do reconhecimento
        async () => {
            isRecording = false;
            nlVoiceBtn.classList.remove('recording');
            
            if (nlQueryTextarea.value.trim().length > 5) {
                await processNaturalLanguage(nlQueryTextarea.value);
            }
        }
    );
    
    // Configura o botão de reconhecimento de voz
    if (voiceRecognition) {
        nlVoiceBtn.addEventListener('click', () => {
            if (isRecording) {
                voiceRecognition.stop();
                isRecording = false;
                nlVoiceBtn.classList.remove('recording');
            } else {
                // Limpa o textarea ao iniciar novo reconhecimento
                nlQueryTextarea.value = '';
                showFeedback('Ouvindo... Fale seu destino e data de viagem.', 'info');
                
                voiceRecognition.start();
                isRecording = true;
                nlVoiceBtn.classList.add('recording');
            }
        });
    } else {
        // Se o reconhecimento de voz não for suportado
        nlVoiceBtn.disabled = true;
        nlVoiceBtn.title = 'Reconhecimento de voz não suportado neste navegador';
    }
}

/**
 * Processa uma consulta em linguagem natural
 * @param {string} query - A consulta do usuário
 */
async function processNaturalLanguage(query) {
    showFeedback('Processando sua solicitação...', 'info');
    
    try {
        // Envia consulta para processamento (IA)
        const extractedData = await processNaturalLanguageQuery(query);
        
        if (!extractedData.origin || !extractedData.destination) {
            showFeedback('Não foi possível identificar a origem ou o destino. Por favor, forneça mais detalhes.', 'error');
            return;
        }
        
        // Atualiza os dados de pesquisa
        searchData = {
            origin: extractedData.origin,
            destination: extractedData.destination,
            date: extractedData.date,
            passengers: extractedData.passengers || 1,
            cabinClass: extractedData.cabinClass || 'economy'
        };
        
        // Mostra os dados extraídos
        displayExtractedData(extractedData);
        
        // Preenche o formulário padrão com os dados extraídos
        fillStandardForm(extractedData);
        
        // Mostra um feedback positivo
        showFeedback('Informações extraídas com sucesso!', 'success');
        
        // Após um curto atraso, vai para a próxima etapa
        setTimeout(() => {
            continueBtn.click();
        }, 1500);
    } catch (error) {
        logError('Erro ao processar linguagem natural', error);
        showFeedback('Não foi possível processar sua solicitação. Por favor, tente novamente ou use a busca padrão.', 'error');
    }
}

/**
 * Exibe o feedback ao usuário
 * @param {string} message - Mensagem de feedback
 * @param {string} type - Tipo de feedback (info, success, error)
 */
function showFeedback(message, type = 'info') {
    nlFeedback.style.display = 'block';
    nlFeedbackText.textContent = message;
    
    // Remove classes anteriores
    nlFeedback.classList.remove('info', 'success', 'error');
    // Adiciona a classe correspondente ao tipo
    nlFeedback.classList.add(type);
    
    // Se for erro, esconde os dados extraídos
    if (type === 'error') {
        nlExtractedData.style.display = 'none';
    }
}

/**
 * Exibe os dados extraídos da linguagem natural
 * @param {Object} data - Dados extraídos
 */
function displayExtractedData(data) {
    // Formata dados para exibição
    const formattedDate = data.date ? new Date(data.date).toLocaleDateString('pt-BR') : 'Não especificada';
    
    // Cria HTML com os dados
    const html = `
        <strong>Origem:</strong> ${data.origin}<br>
        <strong>Destino:</strong> ${data.destination}<br>
        <strong>Data:</strong> ${formattedDate}<br>
        <strong>Passageiros:</strong> ${data.passengers || 1}<br>
        <strong>Classe:</strong> ${formatCabinClass(data.cabinClass || 'economy')}
    `;
    
    // Exibe os dados
    nlExtractedData.innerHTML = html;
    nlExtractedData.style.display = 'block';
}

/**
 * Preenche o formulário padrão com os dados extraídos
 * @param {Object} data - Dados extraídos
 */
function fillStandardForm(data) {
    if (data.origin) {
        originInput.value = data.origin;
        updateAirportCode('origin', data.origin);
    }
    
    if (data.destination) {
        destinationInput.value = data.destination;
        updateAirportCode('destination', data.destination);
    }
    
    // Nota: a data e outros campos serão preenchidos na próxima etapa
}

/**
 * Configura o autocompletar para campos de aeroporto
 */
function setupAirportAutocomplete() {
    // Configurar debounce para evitar muitas chamadas
    let searchTimeout;
    
    // Cria elementos de dropdown para cada input
    const originDropdown = document.createElement('div');
    originDropdown.className = 'airport-dropdown';
    originDropdown.id = 'origin-dropdown';
    originInput.parentNode.appendChild(originDropdown);
    
    const destinationDropdown = document.createElement('div');
    destinationDropdown.className = 'airport-dropdown';
    destinationDropdown.id = 'destination-dropdown';
    destinationInput.parentNode.appendChild(destinationDropdown);
    
    // Aplica estilos CSS inline para os dropdowns
    const style = document.createElement('style');
    style.textContent = `
        .airport-dropdown {
            position: absolute;
            width: 100%;
            max-height: 200px;
            overflow-y: auto;
            background: white;
            border: 1px solid #ddd;
            border-radius: 0 0 5px 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            z-index: 1000;
            display: none;
        }
        .airport-dropdown.active {
            display: block;
        }
        .airport-option {
            padding: 8px 12px;
            cursor: pointer;
            transition: background 0.2s;
        }
        .airport-option:hover {
            background: #f0f8ff;
        }
        .airport-city {
            font-weight: 500;
        }
        .airport-code {
            font-weight: bold;
            color: #3498db;
        }
        .airport-name {
            font-size: 0.8em;
            color: #666;
        }
    `;
    document.head.appendChild(style);
    
    const setupInputEvents = (input, type) => {
        const dropdown = type === 'origin' ? originDropdown : destinationDropdown;
        
        input.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            
            // Espera um pouco antes de fazer a busca
            searchTimeout = setTimeout(async () => {
                const query = input.value.trim();
                
                // Limpa o dropdown atual
                dropdown.innerHTML = '';
                
                // Só busca após 2 caracteres
                if (query.length < 2) {
                    dropdown.classList.remove('active');
                    return;
                }
                
                try {
                    // Busca aeroportos usando dados locais diretamente
                    const airports = searchLocalAirports(query);
                    
                    // Exibe o dropdown se tiver resultados
                    if (airports.length > 0) {
                        dropdown.classList.add('active');
                        
                        // Adiciona os resultados ao dropdown
                        airports.forEach(airport => {
                            const option = document.createElement('div');
                            option.className = 'airport-option';
                            option.innerHTML = `
                                <span class="airport-city">${airport.cityName}</span> - 
                                <span class="airport-code">${airport.code}</span><br>
                                <span class="airport-name">${airport.airportName}</span>
                            `;
                            
                            // Evento de clique
                            option.addEventListener('click', () => {
                                input.value = `${airport.cityName} - ${airport.code}`;
                                dropdown.classList.remove('active');
                                
                                // Atualiza o código de aeroporto exibido
                                updateAirportCode(type, input.value);
                                
                                // Atualiza os dados da busca
                                searchData[type] = airport.code;
                                
                                // Log para debug
                                logDebug(`Aeroporto ${type} selecionado`, airport);
                            });
                            
                            dropdown.appendChild(option);
                        });
                    } else {
                        dropdown.classList.remove('active');
                    }
                } catch (error) {
                    logError('Erro ao buscar aeroportos', error);
                    dropdown.classList.remove('active');
                }
            }, 300);
        });
        
        // Fecha o dropdown quando clicar fora
        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
        
        // Fecha o dropdown quando perder o foco
        input.addEventListener('blur', () => {
            // Pequeno delay para permitir o clique na opção
            setTimeout(() => {
                dropdown.classList.remove('active');
            }, 200);
        });
        
        // Atualiza o código do aeroporto quando uma opção for selecionada
        input.addEventListener('change', () => {
            updateAirportCode(type, input.value);
        });
    };
    
    // Configura os eventos para ambos os campos
    setupInputEvents(originInput, 'origin');
    setupInputEvents(destinationInput, 'destination');
}

/**
 * Atualiza o código de aeroporto exibido
 * @param {string} type - Tipo (origin ou destination)
 * @param {string} value - Valor do input
 */
function updateAirportCode(type, value) {
    // Extrai o código do aeroporto (após o hífen)
    const codeMatch = value.match(/- ([A-Z]{3})$/);
    
    // Também tenta o formato antigo com parênteses como fallback
    const parenthesesMatch = value.match(/\(([A-Z]{3})\)/);
    
    if (codeMatch && codeMatch[1]) {
        // Se encontrou um código com o novo formato, atualiza o elemento
        document.getElementById(`${type}-code`).textContent = codeMatch[1];
        
        // Atualiza os dados de pesquisa
        searchData[type] = codeMatch[1];
    } 
    else if (parenthesesMatch && parenthesesMatch[1]) {
        // Fallback para o formato antigo com parênteses
        document.getElementById(`${type}-code`).textContent = parenthesesMatch[1];
        
        // Atualiza os dados de pesquisa
        searchData[type] = parenthesesMatch[1];
    }
}

/**
 * Configura a busca padrão por formulário
 */
function setupStandardSearch() {
    // A navegação entre etapas é gerenciada pelo search-flow.js
    // Este código apenas prepara os dados para a pesquisa
    
    continueBtn.addEventListener('click', () => {
        // Coleta e valida dados do formulário
        const originCode = document.getElementById('origin-code').textContent;
        const destCode = document.getElementById('destination-code').textContent;
        
        if (!originCode || !destCode) {
            alert('Por favor, informe origem e destino válidos.');
            return;
        }
        
        // Atualiza os dados de pesquisa
        searchData.origin = originCode;
        searchData.destination = destCode;
        
        // A data será definida na próxima etapa
        // O restante do fluxo é gerenciado pelo search-flow.js
    });
}

/**
 * Formata a classe da cabine para exibição
 * @param {string} cabinClass - Classe da cabine
 * @returns {string} - Classe formatada
 */
function formatCabinClass(cabinClass) {
    const classMap = {
        'economy': 'Econômica',
        'business': 'Executiva',
        'first': 'Primeira Classe'
    };
    
    return classMap[cabinClass.toLowerCase()] || 'Econômica';
}

// Exporta funções e dados para uso em outros módulos
export { searchData, processNaturalLanguage };