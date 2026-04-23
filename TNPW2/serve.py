#!/usr/bin/env python3
"""SPA dev server – slouží soubory ze složky src/, neznámé cesty vrátí index.html."""

import os
from http.server import HTTPServer, SimpleHTTPRequestHandler

ROOT = os.path.join(os.path.dirname(__file__), "src")


class SPAHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def do_GET(self):
        candidate = os.path.join(ROOT, self.path.lstrip("/"))
        if not os.path.exists(candidate) or os.path.isdir(candidate):
            self.path = "/index.html"
        super().do_GET()

    def log_message(self, fmt, *args):
        pass  # tiché logování – zakomentuj pro debug


if __name__ == "__main__":
    port = 8001
    server = HTTPServer(("", port), SPAHandler)
    print(f"Frontend běží na http://localhost:{port}")
    server.serve_forever()
