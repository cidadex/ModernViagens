import os
import json
import http.server
import socketserver
import urllib.parse
import requests
# Importa a biblioteca anthropic se estiver disponível
try:
    from anthropic import Anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False
    print("AVISO: Biblioteca Anthropic não encontrada. Alguns recursos estarão indisponíveis.")
from urllib.parse import parse_qs

# Configuração das chaves de API
ANTHROPIC_API_KEY = os.environ.get('ANTHROPIC_API_KEY', '')
RAPIDAPI_KEY = os.environ.get('RAPIDAPI_KEY', '')

# Configuração de endpoints
RAPIDAPI_HOST = 'priceline-com-provider.p.rapidapi.com'
RAPIDAPI_BASE_URL = 'https://priceline-com-provider.p.rapidapi.com'

# Cliente Anthropic (se disponível)
anthropic_client = None
if ANTHROPIC_AVAILABLE and ANTHROPIC_API_KEY:
    try:
        anthropic_client = Anthropic(api_key=ANTHROPIC_API_KEY)
    except Exception as e:
        print(f"Erro ao criar cliente Anthropic: {e}")

class APIHandler(http.server.SimpleHTTPRequestHandler):
    """Servidor HTTP para servir arquivos estáticos e proxear requisições de API."""
    
    def end_headers(self):
        """Adiciona headers de CORS antes de finalizar os headers."""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_OPTIONS(self):
        """Trata requisições OPTIONS (preflight para CORS)."""
        self.send_response(200)
        self.end_headers()
    
    def do_GET(self):
        """Trata requisições GET."""
        # Verifica se é uma requisição para a API
        if self.path.startswith('/api/'):
            self.handle_api_request()
        elif self.path == '/api-keys':
            # Rota para verificar se as chaves de API estão configuradas
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            # Verifica se as chaves estão presentes (sem mostrar os valores)
            response = {
                'anthropic': bool(ANTHROPIC_API_KEY),
                'rapidapi': bool(RAPIDAPI_KEY)
            }
            
            self.wfile.write(json.dumps(response).encode())
        else:
            # Para outras requisições, delega ao handler padrão (arquivos estáticos)
            super().do_GET()
    
    def do_POST(self):
        """Trata requisições POST."""
        if self.path.startswith('/api/'):
            self.handle_api_request()
        else:
            self.send_error(404, "Endpoint não encontrado")
    
    def handle_api_request(self):
        """Processa requisições para endpoints da API."""
        # Extrai o endpoint específico da API
        endpoint = self.path.replace('/api/', '')
        
        # Remove parâmetros de consulta para extrair apenas o endpoint
        if '?' in endpoint:
            endpoint = endpoint.split('?')[0]
            
        print(f"Endpoint requisitado: '{endpoint}' (path original: '{self.path}')")
        
        # Lida com diferentes endpoints
        if endpoint == 'airports':
            self.handle_airports_search()
        elif endpoint == 'flights':
            self.handle_flights_search()
        elif endpoint == 'nlp':
            self.handle_nlp_processing()
        else:
            self.send_error(404, "Endpoint de API não encontrado")
    
    def handle_airports_search(self):
        """Busca aeroportos ou usa dados locais."""
        # Extrai o parâmetro de consulta
        parsed_url = urllib.parse.urlparse(self.path)
        query_params = parse_qs(parsed_url.query)
        
        # Verifica se o parâmetro 'q' está presente
        if 'q' not in query_params:
            self.send_error(400, "Parâmetro de consulta 'q' é obrigatório")
            return
        
        query = query_params['q'][0]
        if not query or len(query) < 2:
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps([]).encode())
            return
            
        # Lista simplificada de aeroportos brasileiros para uso local
        airports_data = [
            {"code": "GRU", "cityName": "Sao Paulo", "airportName": "Aeroporto Internacional de Guarulhos"},
            {"code": "CGH", "cityName": "Sao Paulo", "airportName": "Aeroporto de Congonhas"},
            {"code": "VCP", "cityName": "Campinas", "airportName": "Aeroporto Internacional de Viracopos"},
            {"code": "GIG", "cityName": "Rio de Janeiro", "airportName": "Aeroporto Internacional do Galeao"},
            {"code": "SDU", "cityName": "Rio de Janeiro", "airportName": "Aeroporto Santos Dumont"},
            {"code": "BSB", "cityName": "Brasilia", "airportName": "Aeroporto Internacional de Brasilia"},
            {"code": "CNF", "cityName": "Belo Horizonte", "airportName": "Aeroporto Internacional de Confins"},
            {"code": "SSA", "cityName": "Salvador", "airportName": "Aeroporto Internacional de Salvador"},
            {"code": "REC", "cityName": "Recife", "airportName": "Aeroporto Internacional de Recife"},
            {"code": "FOR", "cityName": "Fortaleza", "airportName": "Aeroporto Internacional de Fortaleza"},
            {"code": "CWB", "cityName": "Curitiba", "airportName": "Aeroporto Internacional de Curitiba"},
            {"code": "POA", "cityName": "Porto Alegre", "airportName": "Aeroporto Internacional de Porto Alegre"},
            {"code": "FLN", "cityName": "Florianopolis", "airportName": "Aeroporto Internacional de Florianopolis"},
            {"code": "VIX", "cityName": "Vitoria", "airportName": "Aeroporto de Vitoria"},
            {"code": "MAO", "cityName": "Manaus", "airportName": "Aeroporto Internacional de Manaus"},
            {"code": "NAT", "cityName": "Natal", "airportName": "Aeroporto Internacional de Natal"},
            {"code": "BEL", "cityName": "Belem", "airportName": "Aeroporto Internacional de Belem"},
            {"code": "GYN", "cityName": "Goiania", "airportName": "Aeroporto de Goiania"},
            {"code": "MCZ", "cityName": "Maceio", "airportName": "Aeroporto Internacional de Maceio"},
            {"code": "CGB", "cityName": "Cuiaba", "airportName": "Aeroporto Internacional de Cuiaba"},
            {"code": "JPA", "cityName": "Joao Pessoa", "airportName": "Aeroporto Internacional de Joao Pessoa"},
            {"code": "SLZ", "cityName": "Sao Luis", "airportName": "Aeroporto Internacional de Sao Luis"},
            {"code": "AJU", "cityName": "Aracaju", "airportName": "Aeroporto de Aracaju"},
            {"code": "PMW", "cityName": "Palmas", "airportName": "Aeroporto de Palmas"},
            {"code": "THE", "cityName": "Teresina", "airportName": "Aeroporto de Teresina"}
        ]
        
        # Filtra os aeroportos com base na consulta (case insensitive)
        query_lower = query.lower()
        filtered_airports = []
        
        for airport in airports_data:
            city_name = airport["cityName"].lower()
            airport_name = airport["airportName"].lower()
            code = airport["code"].lower()
            
            # Verifica se a consulta existe em qualquer um dos campos
            if (query_lower in city_name or 
                query_lower in airport_name or 
                query_lower in code):
                filtered_airports.append(airport)
        
        print(f"Consulta: '{query_lower}', Encontrados: {len(filtered_airports)} aeroportos")
        
        # Envia a resposta
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(filtered_airports).encode())
    
    def handle_flights_search(self):
        """Busca voos na API da RapidAPI."""
        # Extrai parâmetros da consulta
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        params = json.loads(post_data)
        
        # Valida os parâmetros obrigatórios
        required_params = ['origin', 'destination', 'departDate']
        missing_params = [p for p in required_params if p not in params or not params[p]]
        
        if missing_params:
            self.send_error(400, f"Parâmetros obrigatórios ausentes: {', '.join(missing_params)}")
            return
        
        try:
            # Configura a requisição para a API
            url = f"{RAPIDAPI_BASE_URL}/v1/flights/search"
            headers = {
                'X-RapidAPI-Key': RAPIDAPI_KEY,
                'X-RapidAPI-Host': RAPIDAPI_HOST,
                'Content-Type': 'application/json'
            }
            
            # Prepara os parâmetros
            api_params = {
                'sid': 'iSiX639',
                'origin_airport_code': params['origin'],
                'destination_airport_code': params['destination'],
                'departure_date': params['departDate'],
                'adults': params.get('adults', 1)
            }
            
            # Adiciona parâmetros opcionais se presentes
            if 'returnDate' in params and params['returnDate']:
                api_params['return_date'] = params['returnDate']
            
            if 'cabinClass' in params and params['cabinClass']:
                api_params['cabin_class'] = params['cabinClass']
            
            # Faz a requisição à API
            response = requests.get(url, headers=headers, params=api_params)
            
            # Verifica se a resposta é válida
            if response.status_code == 200:
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(response.content)
            else:
                self.send_error(response.status_code, f"Erro da API externa: {response.text}")
        
        except Exception as e:
            self.send_error(500, f"Erro interno: {str(e)}")
    
    def handle_nlp_processing(self):
        """Processa linguagem natural utilizando a API da Anthropic ou processamento local."""
        # Extrai o texto da requisição
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data)
        
        # Verifica se o texto está presente
        if 'query' not in data or not data['query'].strip():
            self.send_error(400, "Parâmetro 'query' é obrigatório")
            return
        
        query = data['query']
        
        # Verifica se o cliente Anthropic está disponível
        if not anthropic_client:
            print("Cliente Anthropic não disponível. Usando extração local.")
            # Usa um processamento local simplificado
            result = self.extract_travel_info(query)
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode())
            return
        
        try:
            # Configuração para a API da Anthropic
            system_prompt = """
            Você é um assistente especializado em extrair informações de viagens a partir de consultas em linguagem natural.
            Sua tarefa é analisar a consulta do usuário e extrair as seguintes informações:
            - Cidade/aeroporto de origem
            - Cidade/aeroporto de destino
            - Data da viagem (convertida para o formato YYYY-MM-DD)
            - Número de passageiros (se mencionado, senão assumir 1)
            - Classe da cabine (se mencionada, senão assumir "economy")
            
            Responda APENAS com um objeto JSON contendo esses dados, sem explicações adicionais.
            Se alguma informação estiver faltando, deixe o campo correspondente como null.
            Formato de resposta: 
            {
              "origin": "cidade ou código de aeroporto",
              "destination": "cidade ou código de aeroporto",
              "date": "YYYY-MM-DD",
              "passengers": número,
              "cabinClass": "economy/business/first"
            }
            """
            
            # o modelo mais recente da Anthropic é "claude-3-7-sonnet-20250219" que foi lançado em 24 de fevereiro de 2025
            message = anthropic_client.messages.create(
                model="claude-3-7-sonnet-20250219",
                max_tokens=1024,
                system=system_prompt,
                messages=[
                    {"role": "user", "content": query}
                ]
            )
            
            # Extrai o conteúdo da resposta
            content = message.content[0].text
            
            # Tenta analisar o JSON da resposta
            try:
                extracted_data = json.loads(content)
                
                # Responde com os dados extraídos
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(extracted_data).encode())
            
            except json.JSONDecodeError:
                # Se não for possível analisar o JSON
                self.send_error(500, "Erro ao processar a resposta da API")
        
        except Exception as e:
            self.send_error(500, f"Erro interno: {str(e)}")
    
    def extract_travel_info(self, text):
        """Extrator de informações básico para processamento local."""
        text = text.lower()
        
        # Dicionário de cidades e seus códigos de aeroporto
        cities = {
            'são paulo': 'GRU',
            'sao paulo': 'GRU',
            'rio de janeiro': 'GIG',
            'rio': 'GIG',
            'brasília': 'BSB',
            'brasilia': 'BSB',
            'salvador': 'SSA',
            'recife': 'REC',
            'fortaleza': 'FOR',
            'belo horizonte': 'CNF',
            'curitiba': 'CWB',
            'porto alegre': 'POA',
            'manaus': 'MAO',
            'belém': 'BEL',
            'belem': 'BEL'
        }
        
        # Extração de origem
        origin = None
        origin_patterns = ['de ', 'partindo de ', 'saindo de ', 'estou em ', 'origem ']
        for pattern in origin_patterns:
            if pattern in text:
                for city in cities:
                    if pattern + city in text:
                        origin = cities[city]
                        break
                if origin:
                    break
                
        # Extração de destino
        destination = None
        dest_patterns = ['para ', 'indo para ', 'destino ', 'chegando em ', 'ir para ']
        for pattern in dest_patterns:
            if pattern in text:
                for city in cities:
                    if pattern + city in text:
                        destination = cities[city]
                        break
                if destination:
                    break
        
        # Extração de data (simplificada)
        date = None
        months = {
            'janeiro': '01', 'fevereiro': '02', 'março': '03', 'marco': '03', 
            'abril': '04', 'maio': '05', 'junho': '06', 'julho': '07', 
            'agosto': '08', 'setembro': '09', 'outubro': '10', 
            'novembro': '11', 'dezembro': '12'
        }
        
        import re
        date_regex = re.compile(r'dia (\d{1,2}) de ([a-zç]+)', re.IGNORECASE)
        match = date_regex.search(text)
        
        if match:
            day = match.group(1).zfill(2)
            month_name = match.group(2).lower()
            if month_name in months:
                month = months[month_name]
                # Usando o ano atual
                import datetime
                year = datetime.datetime.now().year
                date = f"{year}-{month}-{day}"
        
        # Extração de número de passageiros
        passengers = 1  # Valor padrão
        passengers_regex = re.compile(r'(\d+) (passageiros|pessoas|adultos)', re.IGNORECASE)
        passengers_match = passengers_regex.search(text)
        if passengers_match:
            passengers = int(passengers_match.group(1))
        
        # Extração de classe da cabine
        cabin_class = "economy"  # Valor padrão
        if "executiva" in text or "business" in text:
            cabin_class = "business"
        elif "primeira classe" in text or "first class" in text:
            cabin_class = "first"
        
        return {
            "origin": origin,
            "destination": destination,
            "date": date,
            "passengers": passengers,
            "cabinClass": cabin_class
        }

def run_server(port=8000):
    """Inicia o servidor na porta especificada."""
    handler = APIHandler
    
    # Define o diretório de arquivos estáticos
    handler.directory = os.getcwd()
    
    with socketserver.TCPServer(("0.0.0.0", port), handler) as httpd:
        print(f"Servidor rodando na porta {port}")
        httpd.serve_forever()

if __name__ == "__main__":
    # Verifica se as chaves de API estão configuradas
    if not ANTHROPIC_API_KEY:
        print("AVISO: Variável de ambiente ANTHROPIC_API_KEY não configurada!")
    
    if not RAPIDAPI_KEY:
        print("AVISO: Variável de ambiente RAPIDAPI_KEY não configurada!")
    
    # Inicia o servidor
    # Usando porta 8081 para evitar conflito
    run_server(port=8081)