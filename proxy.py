import http.server
import socketserver
import urllib.request
import urllib.error
import urllib.parse
import json
import sys

# API server port
API_PORT = 8081

class ProxyHandler(http.server.SimpleHTTPRequestHandler):
    """Servidor HTTP para servir arquivos estáticos e proxear requisições para a API."""
    
    def do_GET(self):
        """Trata requisições GET."""
        # Verifica se é uma requisição para a API
        if self.path.startswith('/api/'):
            self.handle_api_request('GET')
        else:
            # Para outras requisições, delega ao handler padrão (arquivos estáticos)
            super().do_GET()
    
    def do_POST(self):
        """Trata requisições POST."""
        if self.path.startswith('/api/'):
            self.handle_api_request('POST')
        else:
            self.send_error(404, "Endpoint não encontrado")
    
    def handle_api_request(self, method):
        """Encaminha requisições para o servidor de API."""
        api_url = f"http://localhost:{API_PORT}{self.path}"
        print(f"Encaminhando {method} requisição para: {api_url}")
        
        try:
            headers = {key: self.headers[key] for key in self.headers.keys()}
            
            # Prepara a requisição
            request = urllib.request.Request(api_url, method=method)
            
            # Adiciona os headers
            for key, value in headers.items():
                if key.lower() not in ('host', 'content-length'):
                    request.add_header(key, value)
            
            # Se for POST, adiciona o corpo da requisição
            if method == 'POST':
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length) if content_length else None
                if body:
                    request.data = body
            
            # Faz a requisição para o servidor de API
            response = urllib.request.urlopen(request)
            
            # Envia o status code e os headers
            self.send_response(response.status)
            for key, value in response.headers.items():
                if key.lower() not in ('transfer-encoding', 'connection'):
                    self.send_header(key, value)
            self.end_headers()
            
            # Envia o corpo da resposta
            self.wfile.write(response.read())
            
        except urllib.error.HTTPError as e:
            self.send_error(e.code, e.reason)
        except urllib.error.URLError as e:
            self.send_error(502, f"Erro ao acessar o servidor de API: {e.reason}")
        except Exception as e:
            self.send_error(500, f"Erro interno no proxy: {str(e)}")

def run_server(port=5000):
    """Inicia o servidor na porta especificada."""
    handler = ProxyHandler
    
    # Configura para não usar o cache do navegador
    handler.protocol_version = "HTTP/1.1"
    
    # Configura para permitir CORS
    old_end_headers = handler.end_headers
    
    def end_headers(self):
        """Adiciona headers de CORS à resposta."""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        old_end_headers(self)
    
    handler.end_headers = end_headers
    
    # Cria e inicia o servidor
    server = socketserver.ThreadingTCPServer(("", port), handler)
    print(f"Servidor proxy rodando na porta {port}, redirecionando API para a porta {API_PORT}")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("Servidor encerrado pelo usuário")
        server.server_close()
        sys.exit(0)

if __name__ == "__main__":
    run_server()