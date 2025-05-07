import os
import json
import http.server
import socketserver
import urllib.parse
import requests
import threading
import time
import random
import datetime
import calendar
from urllib.parse import parse_qs

# Importa a biblioteca anthropic se estiver disponível
try:
    from anthropic import Anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False
    print("AVISO: Biblioteca Anthropic não encontrada. Alguns recursos estarão indisponíveis.")

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

class UnifiedAPIHandler(http.server.SimpleHTTPRequestHandler):
    """Servidor HTTP unificado para servir arquivos estáticos e endpoints de API."""
    
    def normalize_text(self, text):
        """Remove acentos e caracteres especiais para melhorar a busca"""
        import unicodedata
        return ''.join(c for c in unicodedata.normalize('NFD', text)
                      if unicodedata.category(c) != 'Mn')
    
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
        elif endpoint == 'prices':
            self.handle_prices_search()
        elif endpoint == 'nlp':
            self.handle_nlp_processing()
        else:
            self.send_error(404, f"Endpoint de API não encontrado: {endpoint}")
    
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
            {"code": "GRU", "cityName": "São Paulo", "airportName": "Aeroporto Internacional de Guarulhos"},
            {"code": "CGH", "cityName": "São Paulo", "airportName": "Aeroporto de Congonhas"},
            {"code": "VCP", "cityName": "Campinas", "airportName": "Aeroporto Internacional de Viracopos"},
            {"code": "GIG", "cityName": "Rio de Janeiro", "airportName": "Aeroporto Internacional do Galeão"},
            {"code": "SDU", "cityName": "Rio de Janeiro", "airportName": "Aeroporto Santos Dumont"},
            {"code": "BSB", "cityName": "Brasília", "airportName": "Aeroporto Internacional de Brasília"},
            {"code": "CNF", "cityName": "Belo Horizonte", "airportName": "Aeroporto Internacional de Confins"},
            {"code": "SSA", "cityName": "Salvador", "airportName": "Aeroporto Internacional de Salvador"},
            {"code": "REC", "cityName": "Recife", "airportName": "Aeroporto Internacional de Recife"},
            {"code": "FOR", "cityName": "Fortaleza", "airportName": "Aeroporto Internacional de Fortaleza"},
            {"code": "CWB", "cityName": "Curitiba", "airportName": "Aeroporto Internacional de Curitiba"},
            {"code": "POA", "cityName": "Porto Alegre", "airportName": "Aeroporto Internacional de Porto Alegre"},
            {"code": "FLN", "cityName": "Florianópolis", "airportName": "Aeroporto Internacional de Florianópolis"},
            {"code": "VIX", "cityName": "Vitória", "airportName": "Aeroporto de Vitória"},
            {"code": "MAO", "cityName": "Manaus", "airportName": "Aeroporto Internacional de Manaus"},
            {"code": "NAT", "cityName": "Natal", "airportName": "Aeroporto Internacional de Natal"},
            {"code": "BEL", "cityName": "Belém", "airportName": "Aeroporto Internacional de Belém"},
            {"code": "GYN", "cityName": "Goiânia", "airportName": "Aeroporto de Goiânia"},
            {"code": "MCZ", "cityName": "Maceió", "airportName": "Aeroporto Internacional de Maceió"},
            {"code": "CGB", "cityName": "Cuiabá", "airportName": "Aeroporto Internacional de Cuiabá"},
            {"code": "JPA", "cityName": "João Pessoa", "airportName": "Aeroporto Internacional de João Pessoa"},
            {"code": "SLZ", "cityName": "São Luís", "airportName": "Aeroporto Internacional de São Luís"},
            {"code": "AJU", "cityName": "Aracaju", "airportName": "Aeroporto de Aracaju"},
            {"code": "PMW", "cityName": "Palmas", "airportName": "Aeroporto de Palmas"},
            {"code": "THE", "cityName": "Teresina", "airportName": "Aeroporto de Teresina"}
        ]
        
        # Filtra os aeroportos com base na consulta (case insensitive)
        query_lower = query.lower()
        filtered_airports = []
        
        # Primeiro tenta buscar por código exato (prioridade)
        for airport in airports_data:
            if airport["code"].lower() == query_lower:
                filtered_airports.append(airport)
        
        # Se não encontrar por código, busca por cidade ou nome do aeroporto
        if not filtered_airports:
            for airport in airports_data:
                city_name = airport["cityName"].lower()
                airport_name = airport["airportName"].lower()
                
                # Substitui acentos para normalizar a busca
                city_name_normalized = self.normalize_text(city_name)
                airport_name_normalized = self.normalize_text(airport_name)
                query_normalized = self.normalize_text(query_lower)
                
                # Verifica se a consulta existe em qualquer um dos campos
                if (query_normalized in city_name_normalized or 
                    query_normalized in airport_name_normalized or
                    query_lower in city_name or 
                    query_lower in airport_name):
                    filtered_airports.append(airport)
        
        # Log detalhado para depuração
        print(f"Endpoint requisitado: 'airports' (path original: '{self.path}')")
        print(f"Consulta: '{query_lower}', Encontrados: {len(filtered_airports)} aeroportos")
        if filtered_airports:
            print(f"Primeiro resultado: {filtered_airports[0]}")
        
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
    
    def handle_prices_search(self):
        """Busca preços de voos para um período."""
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
            # Determina o período (início e fim)
            start_date = datetime.datetime.strptime(params['departDate'], '%Y-%m-%d')
            
            # Se não houver data final, usa o final do mês
            if 'endDate' in params and params['endDate']:
                end_date = datetime.datetime.strptime(params['endDate'], '%Y-%m-%d')
            else:
                # Usa o último dia do mês como data final
                _, last_day = calendar.monthrange(start_date.year, start_date.month)
                end_date = datetime.datetime(start_date.year, start_date.month, last_day)
            
            # Verifica se temos a chave de API necessária para RapidAPI
            if not RAPIDAPI_KEY:
                print("AVISO: Chave RAPIDAPI_KEY não encontrada. Usando preços simulados.")
                # Se não tivermos acesso à API, geramos dados simulados
                price_data = self._generate_simulated_prices(start_date, end_date)
            else:
                # Usa API para obter preços reais
                price_data = self._get_real_prices_from_api(params['origin'], params['destination'], start_date, end_date)
            
            # Prepara a resposta
            response_data = {
                'origin': params['origin'],
                'destination': params['destination'],
                'startDate': params['departDate'],
                'endDate': end_date.strftime('%Y-%m-%d'),
                'prices': price_data
            }
            
            # Envia a resposta
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode())
            
        except Exception as e:
            print(f"Erro na busca de preços: {str(e)}")
            self.send_error(500, f"Erro interno: {str(e)}")
            
    def _get_real_prices_from_api(self, origin, destination, start_date, end_date):
        """Obtém preços reais da API para cada dia no intervalo solicitado."""
        try:
            # Formata as datas para o formato esperado pela API
            start_str = start_date.strftime('%Y-%m-%d')
            end_str = end_date.strftime('%Y-%m-%d')
            
            print(f"Buscando preços para rotas {origin} -> {destination} ({start_str} a {end_str})")
            
            # Como não temos acesso ao endpoint de calendário, vamos usar o endpoint de busca 
            # de voos normal e gerar um conjunto de preços com base nele
            
            # Prepara os parâmetros da requisição
            url = f"{RAPIDAPI_BASE_URL}/v1/flights/search"
            
            headers = {
                "X-RapidAPI-Key": RAPIDAPI_KEY,
                "X-RapidAPI-Host": RAPIDAPI_HOST
            }
            
            # Preços por dia
            price_data = {}
            
            # Vamos amostrar alguns dias do período para obter estimativas de preço
            # Isso reduz o número de chamadas à API
            
            # Calcula o número de dias no intervalo
            delta = (end_date - start_date).days + 1
            
            # Se são mais de 15 dias, seleciona 5 dias para amostrar
            # Caso contrário, faz para cada dia
            sample_days = min(delta, 5)
            step = max(1, delta // sample_days)
            
            for i in range(0, delta, step):
                current_date = start_date + datetime.timedelta(days=i)
                date_str = current_date.strftime('%Y-%m-%d')
                
                # Parâmetros da requisição para esta data específica
                querystring = {
                    "adults": "1",
                    "origin_airport_code": origin,
                    "destination_airport_code": destination,
                    "departure_date": date_str,
                    "cabin_class": "ECO"
                }
                
                print(f"Amostrando preços para {date_str}")
                
                try:
                    # Realiza a requisição à API
                    response = requests.get(url, headers=headers, params=querystring)
                    
                    # Verifica se a requisição foi bem-sucedida
                    if response.status_code == 200:
                        data = response.json()
                        
                        # Obtém o preço mais barato disponível
                        min_price = None
                        
                        # Estrutura esperada pode variar por API
                        if 'airline_flights' in data:
                            for airline in data['airline_flights']:
                                for flight in airline.get('flights', []):
                                    price = flight.get('price', {}).get('total_price', {}).get('amount')
                                    if price and (min_price is None or price < min_price):
                                        min_price = price
                        
                        if min_price:
                            price_data[date_str] = float(min_price)
                            print(f"Preço para {date_str}: {min_price}")
                    else:
                        print(f"Erro na API para {date_str}: {response.status_code}")
                
                except Exception as e:
                    print(f"Erro ao buscar preço para {date_str}: {str(e)}")
            
            # Se temos alguns preços, vamos interpolar para preencher os dias faltantes
            if price_data and len(price_data) > 1:
                print(f"Temos {len(price_data)} preços reais, interpolando para o período completo")
                price_data = self._interpolate_prices(price_data, start_date, end_date)
            else:
                print("Não conseguimos dados suficientes da API para interpolação")
            
            # Se não temos preços suficientes, usamos dados simulados
            if len(price_data) < delta * 0.5:  # Menos da metade dos dias têm preços
                print("Usando preços simulados como complemento para dias sem dados")
                simulated = self._generate_simulated_prices(start_date, end_date)
                
                # Combina os dados reais com os simulados para dias sem dados
                for date_str, price in simulated.items():
                    if date_str not in price_data:
                        price_data[date_str] = price
            
            print(f"Retornando {len(price_data)} preços para o calendário")
            return price_data
            
        except Exception as e:
            print(f"Erro geral ao buscar preços: {str(e)}")
            # Em caso de erro, gera preços simulados como fallback
            return self._generate_simulated_prices(start_date, end_date)
    
    def _interpolate_prices(self, partial_prices, start_date, end_date):
        """Interpola preços para preencher dias sem preço."""
        # Dicionário ordenado de preços
        all_dates = []
        current = start_date
        while current <= end_date:
            all_dates.append(current.strftime('%Y-%m-%d'))
            current += datetime.timedelta(days=1)
        
        # Preços completos (incluindo interpolados)
        complete_prices = {}
        
        # Cria lista de datas e preços conhecidos para interpolação
        known_dates = sorted(list(partial_prices.keys()))
        
        if len(known_dates) < 2:
            return partial_prices  # Não podemos interpolar com menos de 2 pontos
        
        # Para cada data no período
        for date_str in all_dates:
            # Se já temos o preço, mantém
            if date_str in partial_prices:
                complete_prices[date_str] = partial_prices[date_str]
                continue
            
            # Procura data conhecida anterior e posterior
            date_obj = datetime.datetime.strptime(date_str, '%Y-%m-%d')
            
            prev_date = None
            next_date = None
            
            for known_date in known_dates:
                known_obj = datetime.datetime.strptime(known_date, '%Y-%m-%d')
                if known_obj < date_obj:
                    prev_date = known_date
                elif known_obj > date_obj:
                    next_date = known_date
                    break
            
            # Interpola com base nas datas conhecidas
            if prev_date and next_date:
                # Interpolação linear
                prev_obj = datetime.datetime.strptime(prev_date, '%Y-%m-%d')
                next_obj = datetime.datetime.strptime(next_date, '%Y-%m-%d')
                
                total_days = (next_obj - prev_obj).days
                days_passed = (date_obj - prev_obj).days
                
                # Fator de interpolação (0 a 1)
                factor = days_passed / total_days if total_days > 0 else 0
                
                # Preço interpolado
                prev_price = partial_prices[prev_date]
                next_price = partial_prices[next_date]
                interpolated = prev_price + factor * (next_price - prev_price)
                
                complete_prices[date_str] = round(interpolated, 2)
            # Se só temos datas anteriores, usa o último preço conhecido
            elif prev_date:
                complete_prices[date_str] = partial_prices[prev_date]
            # Se só temos datas posteriores, usa o primeiro preço conhecido
            elif next_date:
                complete_prices[date_str] = partial_prices[next_date]
        
        return complete_prices
    
    def _generate_simulated_prices(self, start_date, end_date):
        """Gera preços simulados para o período especificado (apenas para fallback)."""
        print("Gerando preços simulados para o calendário")
        price_data = {}
        current_date = start_date
        
        while current_date <= end_date:
            date_str = current_date.strftime('%Y-%m-%d')
            
            # Gera um preço base entre R$ 250 e R$ 850
            base_price = random.randint(250, 850)
            
            # Ajusta o preço com base no dia da semana
            # Fim de semana (sexta a domingo) geralmente são mais caros
            weekday = current_date.weekday()
            if weekday >= 4:  # Sexta (4), Sábado (5), Domingo (6)
                base_price = int(base_price * 1.2)  # 20% mais caro
            
            # Adiciona ao dicionário de preços
            price_data[date_str] = base_price
            
            # Avança para o próximo dia
            current_date += datetime.timedelta(days=1)
            
        return price_data
    
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

def run_server(port=5000):
    """Inicia o servidor na porta especificada."""
    handler = UnifiedAPIHandler
    
    # Configura para não usar o cache do navegador
    handler.protocol_version = "HTTP/1.1"
    
    # Cria e inicia o servidor
    socketserver.TCPServer.allow_reuse_address = True
    server = socketserver.ThreadingTCPServer(("", port), handler)
    print(f"Servidor unificado rodando na porta {port}")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("Servidor encerrado pelo usuário")
        server.server_close()

if __name__ == "__main__":
    import sys
    
    # Verifica se a porta foi especificada como argumento
    port = 5000
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print(f"Porta inválida: {sys.argv[1]}. Usando a porta padrão: {port}")
    
    # Inicia o servidor
    run_server(port)