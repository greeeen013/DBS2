#!/usr/bin/env python3
"""Spustí frontend na http://localhost:8001 a otevře prohlížeč."""

import os
import threading
import webbrowser
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = 8001
SRC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "src")

if __name__ == "__main__":
    os.chdir(SRC_DIR)
    server = HTTPServer(("", PORT), SimpleHTTPRequestHandler)
    print(f"✅ Frontend běží: http://localhost:{PORT}")
    print("   Zastav pomocí Ctrl+C\n")
    threading.Timer(0.5, lambda: webbrowser.open(f"http://localhost:{PORT}")).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server zastaven.")
