"""
Lingua — standalone desktop launcher.

Opens the Lingua language-learning app in its own native window
(via pywebview), not inside a browser tab.

Usage:
    python lingua.py          # run from source (opens .py-backed window)
    pyinstaller lingua.py     # build lingua.exe (standalone .exe)
"""

from __future__ import annotations

import http.server
import os
import socket
import sys
import threading
import webbrowser

import webview

APP_NAME = "Lingua"
PORT = 8765


def base_dir() -> str:
    """Return the base directory for locating web assets.

    When running from a PyInstaller bundle, assets are extracted to
    sys._MEIPASS. When running from source, use the script's directory.
    """
    if hasattr(sys, "_MEIPASS"):
        return sys._MEIPASS
    return os.path.dirname(os.path.abspath(__file__))


def find_free_port(preferred: int = PORT) -> int:
    """Return a free TCP port, preferring `preferred` when available."""
    import socket

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(("127.0.0.1", preferred))
            return preferred
        except OSError:
            s.bind(("127.0.0.1", 0))
            return s.getsockname()[1]


def start_server(dist_dir: str, port: int) -> http.server.HTTPServer:
    """Start a lightweight file server for the built web app."""
    os.chdir(dist_dir)

    class Handler(http.server.SimpleHTTPRequestHandler):
        def log_message(self, fmt, *args):  # silence console noise
            pass

        def end_headers(self):
            # Cache control so updates reload during development
            self.send_header("Cache-Control", "no-store")
            super().end_headers()

    server = http.server.HTTPServer(("127.0.0.1", port), Handler)
    return server


def find_dist_dir() -> str | None:
    """Locate a built Expo web export directory."""
    base = base_dir()
    # Ordered from most-likely to fallback
    candidates = [
        os.path.join(base, "dist"),       # expo export --web output
        os.path.join(base, "web-build"),
        os.path.join(base, "build", "web"),
    ]
    for c in candidates:
        if os.path.isdir(c) and os.path.isfile(os.path.join(c, "index.html")):
            return c
    return None


def main() -> None:
    dist_dir = find_dist_dir()
    if dist_dir is None:
        print("No built web export found. Building one now...")
        project = os.path.dirname(os.path.abspath(__file__))
        output = os.path.join(base_dir(), "dist")
        os.system(f'cd "{project}" && npx expo export --output-dir "{output}" -p web')
        dist_dir = output

    if not os.path.isdir(dist_dir):
        raise SystemExit(f"Could not find web build at: {dist_dir!r}")

    port = find_free_port(PORT)
    server = start_server(dist_dir, port)

    # Run server in a background daemon thread
    t = threading.Thread(target=server.serve_forever, daemon=True)
    t.start()

    url = f"http://127.0.0.1:{port}/"
    print(f"Serving {APP_NAME} from {dist_dir} at {url}")
    print("Opening standalone window...")

    webview.create_window(
        APP_NAME,
        url,
        width=1024,
        height=800,
        min_size=(700, 600),
        resizable=True,
    )
    webview.start(http_server=False, debug=False)

    server.shutdown()


if __name__ == "__main__":
    main()