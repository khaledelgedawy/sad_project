"""Simple HTTP server that properly serves OneDrive files."""
import http.server
import os
import mimetypes

class OneDriveHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Get the file path
        path = self.translate_path(self.path)
        
        if os.path.isfile(path):
            # Force read the file in binary mode
            try:
                with open(path, 'rb') as f:
                    content = f.read()
                
                # Determine content type
                content_type, _ = mimetypes.guess_type(path)
                if content_type is None:
                    content_type = 'application/octet-stream'
                
                self.send_response(200)
                self.send_header('Content-Type', content_type)
                self.send_header('Content-Length', str(len(content)))
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Cache-Control', 'no-cache')
                self.end_headers()
                self.wfile.write(content)
            except Exception as e:
                self.send_error(500, f'Error reading file: {e}')
        else:
            super().do_GET()

if __name__ == '__main__':
    PORT = 8090
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    with http.server.ThreadingHTTPServer(('', PORT), OneDriveHandler) as httpd:
        print(f'Serving at http://127.0.0.1:{PORT}')
        httpd.serve_forever()
