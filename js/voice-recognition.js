/**
 * ViajarMax - Reconhecimento de Voz
 * Este módulo lida com o reconhecimento de voz para busca por comando de voz
 */

/**
 * Inicializa o reconhecimento de voz
 * @param {Function} onResultCallback - Função de callback para receber o texto reconhecido
 * @param {Function} onEndCallback - Função de callback para quando o reconhecimento terminar
 * @returns {Object} - Objeto com métodos para controlar o reconhecimento de voz
 */
export function initVoiceRecognition(onResultCallback, onEndCallback) {
    // Verifica se o navegador suporta a API de reconhecimento de voz
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.error('Seu navegador não suporta reconhecimento de voz.');
        return null;
    }

    // Inicializa o objeto de reconhecimento de voz
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    // Configuração
    recognition.lang = 'pt-BR'; // Configurado para português brasileiro
    recognition.continuous = false; // Não continua escutando depois de terminar
    recognition.interimResults = false; // Só retorna resultados finais

    // Evento de resultado
    recognition.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        console.log('Texto reconhecido:', speechResult);
        
        if (onResultCallback && typeof onResultCallback === 'function') {
            onResultCallback(speechResult);
        }
    };

    // Evento de erro
    recognition.onerror = (event) => {
        console.error('Erro no reconhecimento de voz:', event.error);
    };

    // Evento de fim de reconhecimento
    recognition.onend = () => {
        console.log('Reconhecimento de voz finalizado');
        
        if (onEndCallback && typeof onEndCallback === 'function') {
            onEndCallback();
        }
    };

    // Retorna um objeto com métodos para controlar o reconhecimento
    return {
        start: () => {
            try {
                recognition.start();
                console.log('Reconhecimento de voz iniciado');
            } catch (error) {
                console.error('Erro ao iniciar reconhecimento de voz:', error);
            }
        },
        stop: () => {
            try {
                recognition.stop();
                console.log('Reconhecimento de voz interrompido');
            } catch (error) {
                console.error('Erro ao interromper reconhecimento de voz:', error);
            }
        },
        abort: () => {
            try {
                recognition.abort();
                console.log('Reconhecimento de voz abortado');
            } catch (error) {
                console.error('Erro ao abortar reconhecimento de voz:', error);
            }
        }
    };
}