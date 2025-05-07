import http.server
import socketserver
import urllib.request
import urllib.error
import urllib.parse
import json
import sys
import os

# Porta do servidor API
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
            
    def do_OPTIONS(self):
        """Trata requisições OPTIONS (para CORS)."""
        if self.path.startswith('/api/'):
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
        else:
            self.send_error(404, "Endpoint não encontrado")
    
    def handle_api_request(self, method):
        """Encaminha requisições para o servidor de API."""
        api_url = f"http://localhost:{API_PORT}{self.path}"
        print(f"Encaminhando {method} requisição para: {api_url}")
        
        try:
            # Prepara a requisição
            headers = {}
            for key, value in self.headers.items():
                if key.lower() not in ('host', 'content-length'):
                    headers[key] = value
            
            # Se for POST, adiciona o corpo da requisição
            body = None
            if method == 'POST':
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length) if content_length else None
            
            # Faz a requisição para o servidor de API
            req = urllib.request.Request(
                url=api_url,
                data=body,
                headers=headers,
                method=method
            )
            
            # Abre a conexão e obtém a resposta
            with urllib.request.urlopen(req) as response:
                # Envia o status code
                self.send_response(response.status)
                
                # Envia os headers da resposta, exceto os problemáticos
                for key, value in response.getheaders():
                    if key.lower() not in ('transfer-encoding', 'connection'):
                        self.send_header(key, value)
                
                # Adiciona headers CORS
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
                self.send_header('Access-Control-Allow-Headers', 'Content-Type')
                
                self.end_headers()
                
                # Envia o corpo da resposta
                self.wfile.write(response.read())
                
        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            error_message = json.dumps({"error": str(e.reason)})
            self.wfile.write(error_message.encode())
            
        except urllib.error.URLError as e:
            self.send_response(502)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            error_message = json.dumps({"error": f"Erro ao acessar o servidor de API: {e.reason}"})
            self.wfile.write(error_message.encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            error_message = json.dumps({"error": f"Erro interno no proxy: {str(e)}"})
            self.wfile.write(error_message.encode())

def run_server(port=5000):
    """Inicia o servidor na porta especificada."""
    handler = ProxyHandler
    handler.protocol_version = "HTTP/1.1"
    
    # Cria e inicia o servidor
    socketserver.TCPServer.allow_reuse_address = True
    server = socketserver.TCPServer(("", port), handler)
    print(f"Servidor proxy rodando na porta {port}, redirecionando API para a porta {API_PORT}")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("Servidor encerrado pelo usuário")
        server.server_close()
        sys.exit(0)

if __name__ == "__main__":
    # Verificando se o argumento da porta foi fornecido
    port = 5000
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print(f"Porta inválida: {sys.argv[1]}. Usando porta padrão: {port}")
    
    run_server(port)