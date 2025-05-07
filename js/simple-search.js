/**
 * ViajarMax - JavaScript de busca simplificada
 * Este script lida com o formulário de busca unificado
 */
document.addEventListener("DOMContentLoaded", function() {
    console.log("ViajarMax website loaded successfully!");
    
    // Funções para navegar entre abas (busca padrão / linguagem natural)
    function setupTabNavigation() {
        const tabs = document.querySelectorAll('.search-mode-tab');
        const contents = document.querySelectorAll('.search-mode-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove classe ativa de todas as abas
                tabs.forEach(t => t.classList.remove('active'));
                // Adiciona classe ativa na aba clicada
                tab.classList.add('active');
                
                // Esconde todos os conteúdos
                contents.forEach(content => content.classList.remove('active'));
                
                // Mostra o conteúdo relacionado à aba
                const mode = tab.getAttribute('data-mode');
                document.getElementById(`${mode}-search`).classList.add('active');
            });
        });
    }
    
    // Inicializa a navegação entre abas
    setupTabNavigation();
    
    // Configura processamento de linguagem natural
    setupNaturalLanguageProcessing();
    // Inicialização de variáveis
    const searchData = {
        origin: null,
        destination: null,
        date: null,
        returnDate: null,
        passengers: 1,
        cabinClass: 'economy',
        tripType: 'oneway' // oneway ou roundtrip
    };

    // Elementos do DOM - Formulário de busca
    const originInput = document.getElementById('origin-input');
    const originCode = document.getElementById('origin-code');
    const destinationInput = document.getElementById('destination-input');
    const destinationCode = document.getElementById('destination-code');
    const departDate = document.getElementById('depart-date');
    const returnDate = document.getElementById('return-date');
    const returnDateGroup = document.getElementById('return-date-group');
    const onewayRadio = document.getElementById('oneway-radio');
    const roundtripRadio = document.getElementById('roundtrip-radio');
    const searchButton = document.getElementById('search-button');
    const adultsCount = document.getElementById('adults-count');
    const decreaseBtn = document.querySelector('.decrease-btn[data-type="adults"]');
    const increaseBtn = document.querySelector('.increase-btn[data-type="adults"]');

    // Valores mínimos para a data (hoje)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Formata as datas para o formato YYYY-MM-DD
    const formatDateForInput = (date) => {
        return date.toISOString().split('T')[0];
    };
    
    // Define as datas mínimas
    departDate.min = formatDateForInput(today);
    returnDate.min = formatDateForInput(tomorrow);

    // Set default value to today
    departDate.value = formatDateForInput(today);
    searchData.date = departDate.value;

    // Set default value for return (tomorrow)
    returnDate.value = formatDateForInput(tomorrow);

    // Dados de exemplo de aeroportos - Mesmo conjunto usado para o autocompletar
    const demoAirports = [
        { code: 'GRU', city: 'São Paulo', name: 'Aeroporto Internacional de Guarulhos', country: 'Brasil' },
        { code: 'CGH', city: 'São Paulo', name: 'Aeroporto de Congonhas', country: 'Brasil' },
        { code: 'SDU', city: 'Rio de Janeiro', name: 'Aeroporto Santos Dumont', country: 'Brasil' },
        { code: 'GIG', city: 'Rio de Janeiro', name: 'Aeroporto Internacional do Galeão', country: 'Brasil' },
        { code: 'BSB', city: 'Brasília', name: 'Aeroporto Internacional de Brasília', country: 'Brasil' },
        { code: 'CNF', city: 'Belo Horizonte', name: 'Aeroporto Internacional de Confins', country: 'Brasil' },
        { code: 'SSA', city: 'Salvador', name: 'Aeroporto Internacional de Salvador', country: 'Brasil' },
        { code: 'REC', city: 'Recife', name: 'Aeroporto Internacional de Recife', country: 'Brasil' },
        { code: 'FOR', city: 'Fortaleza', name: 'Aeroporto Internacional de Fortaleza', country: 'Brasil' },
        { code: 'CWB', city: 'Curitiba', name: 'Aeroporto Internacional de Curitiba', country: 'Brasil' },
        { code: 'POA', city: 'Porto Alegre', name: 'Aeroporto Internacional de Porto Alegre', country: 'Brasil' },
        { code: 'VCP', city: 'Campinas', name: 'Aeroporto Internacional de Viracopos', country: 'Brasil' },
        { code: 'FLN', city: 'Florianópolis', name: 'Aeroporto Internacional de Florianópolis', country: 'Brasil' },
        { code: 'NAT', city: 'Natal', name: 'Aeroporto Internacional de Natal', country: 'Brasil' },
        { code: 'BEL', city: 'Belém', name: 'Aeroporto Internacional de Belém', country: 'Brasil' },
        { code: 'MCZ', city: 'Maceió', name: 'Aeroporto Internacional de Maceió', country: 'Brasil' },
        { code: 'JPA', city: 'João Pessoa', name: 'Aeroporto Internacional de João Pessoa', country: 'Brasil' },
        { code: 'AJU', city: 'Aracaju', name: 'Aeroporto de Aracaju', country: 'Brasil' },
        { code: 'THE', city: 'Teresina', name: 'Aeroporto de Teresina', country: 'Brasil' },
        { code: 'SLZ', city: 'São Luís', name: 'Aeroporto Internacional de São Luís', country: 'Brasil' }
    ];

    // Log auxiliar para debugging
    function logInfo(message, data = null) {
        if (data) {
            console.log(`[ViajarMax] ${message}`, data);
        } else {
            console.log(`[ViajarMax] ${message}`);
        }
    }

    // Função para configurar autocompletar de aeroportos
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
                            searchData.origin = airport.code;
                        } else {
                            searchData.destination = airport.code;
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

    // Configurar tipo de viagem (ida ou ida e volta)
    function setupTripType() {
        // Funcionamento do radio de tipo de viagem
        onewayRadio.addEventListener('change', () => {
            if (onewayRadio.checked) {
                searchData.tripType = 'oneway';
                returnDateGroup.style.display = 'none';
                logInfo('Tipo de viagem alterado para só ida');
            }
        });
        
        roundtripRadio.addEventListener('change', () => {
            if (roundtripRadio.checked) {
                searchData.tripType = 'roundtrip';
                returnDateGroup.style.display = 'block';
                logInfo('Tipo de viagem alterado para ida e volta');
            }
        });
    }

    // Configurar controle de passageiros
    function setupPassengerCounters() {
        decreaseBtn.addEventListener('click', () => {
            let count = parseInt(adultsCount.textContent);
            if (count > 1) {
                count--;
                adultsCount.textContent = count;
                searchData.passengers = count;
            }
        });
        
        increaseBtn.addEventListener('click', () => {
            let count = parseInt(adultsCount.textContent);
            count++;
            adultsCount.textContent = count;
            searchData.passengers = count;
        });
    }

    // Lidar com alterações nos campos de data
    departDate.addEventListener('change', (e) => {
        searchData.date = e.target.value;
        
        // Atualiza o mínimo para a data de retorno
        returnDate.min = e.target.value;
        
        // Se a data de retorno for anterior à data de ida, ajusta
        if (returnDate.value < e.target.value) {
            returnDate.value = e.target.value;
            searchData.returnDate = e.target.value;
        }
    });
    
    returnDate.addEventListener('change', (e) => {
        searchData.returnDate = e.target.value;
    });

    // Configurar o botão de busca
    function setupSearch() {
        searchButton.addEventListener('click', () => {
            console.log("Botão de busca clicado", searchData);
            
            // Obter os valores atuais diretamente dos inputs
            const originCodeText = originCode.textContent;
            const destinationCodeText = destinationCode.textContent;
            const departDateValue = departDate.value;
            
            // Tentar usar valores dos inputs se os dados no objeto searchData estiverem ausentes
            if (!searchData.origin && originCodeText) {
                searchData.origin = originCodeText;
            }
            
            if (!searchData.destination && destinationCodeText) {
                searchData.destination = destinationCodeText;
            }
            
            if (!searchData.date && departDateValue) {
                searchData.date = departDateValue;
            }
            
            // Validação dos dados principais
            if (!originCodeText || !destinationCodeText || !departDateValue) {
                alert('Por favor, preencha todos os campos: origem, destino e data de ida.');
                return;
            }
            
            // Validação de data de retorno para viagens de ida e volta
            if (roundtripRadio.checked && !returnDate.value) {
                alert('Para viagens de ida e volta, por favor selecione a data de retorno.');
                return;
            }
            
            // Verifica se origem e destino são diferentes
            if (originCodeText === destinationCodeText) {
                alert('Origem e destino não podem ser iguais.');
                return;
            }
            
            // Armazena os dados para a página de resultados
            const searchDataForResults = {
                origin: originCodeText,
                destination: destinationCodeText,
                departDate: departDateValue,
                adults: parseInt(adultsCount.textContent),
                cabinClass: searchData.cabinClass || 'economy',
                tripType: roundtripRadio.checked ? 'roundtrip' : 'oneway'
            };
            
            // Adiciona data de retorno se for viagem de ida e volta
            if (roundtripRadio.checked) {
                searchDataForResults.returnDate = returnDate.value;
            }
            
            console.log("Dados de busca:", searchDataForResults);
            
            // Salva dados para a próxima página
            sessionStorage.setItem('searchData', JSON.stringify(searchDataForResults));
            
            logInfo('Redirecionando para resultados com dados:', searchDataForResults);
            
            // Redireciona para a página de resultados
            window.location.href = 'flight-results.html';
        });
    }

    // Configuração da busca por linguagem natural
    function setupNaturalLanguageProcessing() {
        const nlQuery = document.getElementById('nl-query');
        const nlSearchBtn = document.getElementById('nl-search-btn');
        const nlVoiceBtn = document.getElementById('nl-voice-btn');
        const nlFeedback = document.getElementById('nl-feedback');
        const nlFeedbackText = document.getElementById('nl-feedback-text');
        const nlExtractedData = document.getElementById('nl-extracted-data');
        
        // Processamento de texto em linguagem natural
        async function processNaturalLanguage(query) {
            // Mostra feedback de processamento
            nlFeedback.style.display = 'block';
            nlFeedbackText.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando sua solicitação...';
            nlExtractedData.innerHTML = '';
            
            try {
                logInfo('Processando consulta em linguagem natural:', query);
                
                // Chama a API de processamento de linguagem natural
                const response = await fetch('/api/nlp/process', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ query })
                });
                
                if (!response.ok) {
                    throw new Error('Erro ao processar a linguagem natural');
                }
                
                const data = await response.json();
                logInfo('Dados extraídos:', data);
                
                // Se tiver dados extraídos com sucesso
                if (data && data.success) {
                    nlFeedbackText.innerHTML = '<i class="fas fa-check-circle"></i> Informações identificadas com sucesso!';
                    
                    // Exibe os dados extraídos
                    displayExtractedData(data.data);
                    
                    // Preenche o formulário padrão após 2 segundos
                    setTimeout(() => {
                        fillFormWithNLData(data.data);
                        
                        // Troca para o formulário padrão automaticamente
                        document.querySelector('.search-mode-tab[data-mode="standard"]').click();
                    }, 2000);
                } else {
                    nlFeedbackText.innerHTML = '<i class="fas fa-exclamation-circle"></i> Não consegui entender completamente. Tente ser mais específico.';
                }
            } catch (error) {
                logInfo('Erro ao processar linguagem natural:', error);
                nlFeedbackText.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Ocorreu um erro ao processar sua solicitação.';
            }
        }
        
        // Exibe os dados extraídos em uma forma compreensível
        function displayExtractedData(data) {
            let html = '';
            
            if (data.origin) {
                html += `<div><strong>Origem:</strong> ${data.origin.city || data.origin}</div>`;
            }
            
            if (data.destination) {
                html += `<div><strong>Destino:</strong> ${data.destination.city || data.destination}</div>`;
            }
            
            if (data.date) {
                html += `<div><strong>Data de ida:</strong> ${formatDate(data.date)}</div>`;
            }
            
            if (data.returnDate) {
                html += `<div><strong>Data de volta:</strong> ${formatDate(data.returnDate)}</div>`;
            }
            
            if (data.tripType) {
                html += `<div><strong>Tipo de viagem:</strong> ${data.tripType === 'oneway' ? 'Só ida' : 'Ida e volta'}</div>`;
            }
            
            if (data.passengers) {
                html += `<div><strong>Passageiros:</strong> ${data.passengers}</div>`;
            }
            
            if (data.cabinClass) {
                html += `<div><strong>Classe:</strong> ${formatCabinClass(data.cabinClass)}</div>`;
            }
            
            nlExtractedData.innerHTML = html;
        }
        
        // Formata a data para exibição
        function formatDate(dateStr) {
            if (!dateStr) return '';
            
            const date = new Date(dateStr);
            return date.toLocaleDateString('pt-BR');
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
        
        // Preenche o formulário padrão com os dados extraídos
        function fillFormWithNLData(data) {
            // Encontrar o aeroporto de origem
            if (data.origin) {
                if (typeof data.origin === 'string') {
                    // Busca o aeroporto pelo nome da cidade
                    const originAirport = demoAirports.find(airport => 
                        airport.city.toLowerCase().includes(data.origin.toLowerCase())
                    );
                    
                    if (originAirport) {
                        originInput.value = `${originAirport.city} (${originAirport.code})`;
                        originCode.textContent = originAirport.code;
                        searchData.origin = originAirport.code;
                    }
                } else if (data.origin.code) {
                    originInput.value = `${data.origin.city} (${data.origin.code})`;
                    originCode.textContent = data.origin.code;
                    searchData.origin = data.origin.code;
                }
            }
            
            // Encontrar o aeroporto de destino
            if (data.destination) {
                if (typeof data.destination === 'string') {
                    // Busca o aeroporto pelo nome da cidade
                    const destAirport = demoAirports.find(airport => 
                        airport.city.toLowerCase().includes(data.destination.toLowerCase())
                    );
                    
                    if (destAirport) {
                        destinationInput.value = `${destAirport.city} (${destAirport.code})`;
                        destinationCode.textContent = destAirport.code;
                        searchData.destination = destAirport.code;
                    }
                } else if (data.destination.code) {
                    destinationInput.value = `${data.destination.city} (${data.destination.code})`;
                    destinationCode.textContent = data.destination.code;
                    searchData.destination = data.destination.code;
                }
            }
            
            // Configurar datas
            if (data.date) {
                const dateObj = new Date(data.date);
                if (!isNaN(dateObj.getTime())) {
                    departDate.value = formatDateForInput(dateObj);
                    searchData.date = departDate.value;
                }
            }
            
            // Configurar tipo de viagem e data de retorno
            if (data.tripType) {
                if (data.tripType === 'roundtrip') {
                    roundtripRadio.checked = true;
                    returnDateGroup.style.display = 'block';
                    searchData.tripType = 'roundtrip';
                    
                    if (data.returnDate) {
                        const returnDateObj = new Date(data.returnDate);
                        if (!isNaN(returnDateObj.getTime())) {
                            returnDate.value = formatDateForInput(returnDateObj);
                            searchData.returnDate = returnDate.value;
                        }
                    }
                } else {
                    onewayRadio.checked = true;
                    returnDateGroup.style.display = 'none';
                    searchData.tripType = 'oneway';
                }
            }
            
            // Configurar passageiros
            if (data.passengers && !isNaN(parseInt(data.passengers))) {
                const passengerCount = parseInt(data.passengers);
                adultsCount.textContent = passengerCount;
                searchData.passengers = passengerCount;
            }
            
            // Configurar classe da cabine
            if (data.cabinClass) {
                searchData.cabinClass = data.cabinClass;
            }
        }
        
        // Event listeners para NLP
        if (nlSearchBtn) {
            nlSearchBtn.addEventListener('click', () => {
                const query = nlQuery.value.trim();
                if (query) {
                    processNaturalLanguage(query);
                } else {
                    alert('Por favor, descreva sua viagem no campo de texto.');
                }
            });
        }
        
        // Adicionar processamento de voz
        if (nlVoiceBtn) {
            let recognition = null;
            let isRecording = false;
            
            // Verifica se o navegador suporta reconhecimento de voz
            if ('webkitSpeechRecognition' in window) {
                recognition = new webkitSpeechRecognition();
                recognition.lang = 'pt-BR';
                recognition.continuous = false;
                recognition.interimResults = false;
                
                recognition.onstart = () => {
                    isRecording = true;
                    nlVoiceBtn.classList.add('recording');
                    nlVoiceBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
                    logInfo('Gravação de voz iniciada');
                };
                
                recognition.onend = () => {
                    isRecording = false;
                    nlVoiceBtn.classList.remove('recording');
                    nlVoiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
                    logInfo('Gravação de voz finalizada');
                };
                
                recognition.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    nlQuery.value = transcript;
                    logInfo('Texto reconhecido:', transcript);
                    
                    // Processa o texto reconhecido
                    setTimeout(() => {
                        processNaturalLanguage(transcript);
                    }, 500);
                };
                
                recognition.onerror = (event) => {
                    logInfo('Erro no reconhecimento de voz:', event.error);
                    isRecording = false;
                    nlVoiceBtn.classList.remove('recording');
                    nlVoiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
                    
                    if (event.error === 'not-allowed') {
                        alert('O acesso ao microfone não foi permitido. Por favor, permita o acesso ao microfone nas configurações do seu navegador.');
                    }
                };
                
                nlVoiceBtn.addEventListener('click', () => {
                    if (isRecording) {
                        recognition.stop();
                    } else {
                        nlQuery.value = '';
                        nlFeedback.style.display = 'none';
                        recognition.start();
                    }
                });
            } else {
                nlVoiceBtn.style.display = 'none';
                logInfo('Reconhecimento de voz não suportado neste navegador');
            }
        }
    }
    
    // Inicialização
    function initialize() {
        // Configuração de autocompletar para aeroportos
        setupAirportAutocomplete(originInput, originCode, true);
        setupAirportAutocomplete(destinationInput, destinationCode, false);
        
        // Configuração do tipo de viagem
        setupTripType();
        
        // Configuração de contadores de passageiros
        setupPassengerCounters();
        
        // Configuração da busca
        setupSearch();
        
        logInfo('Sistema de busca simplificada inicializado com sucesso');
    }
    
    // Inicia tudo
    initialize();
});