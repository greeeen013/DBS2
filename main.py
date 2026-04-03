"""
Pretorian MMA – univerzální spouštěč projektu
Spusť z kořenového adresáře projektu: python main.py
"""

import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
PRO2 = os.path.join(ROOT, "PRO2")
TNPW2 = os.path.join(ROOT, "TNPW2")
TNPW2_SRC = os.path.join(TNPW2, "src")
DBS2 = os.path.join(ROOT, "DBS2")

BACKEND_CMD = [sys.executable, "-m", "uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]
FRONTEND_CMD = [sys.executable, "-m", "http.server", "8001"]

# pid → popis (pro výpis v menu)
_procs: dict[int, str] = {}


def header(text: str) -> None:
    print(f"\n{'='*50}")
    print(f"  {text}")
    print(f"{'='*50}")


def _open_window(title: str, cwd: str, cmd: list[str]) -> subprocess.Popen:
    """Otevře nové CMD okno s daným titulkem a příkazem (Windows)."""
    inner = " ".join(f'"{c}"' if " " in c else c for c in cmd)
    full_cmd = f'title {title} && cd /d "{cwd}" && {inner}'
    proc = subprocess.Popen(
        ["cmd", "/k", full_cmd],
        creationflags=subprocess.CREATE_NEW_CONSOLE,
    )
    _procs[proc.pid] = title
    return proc


def run_backend_window() -> None:
    proc = _open_window("Pretorian – Backend :8000", PRO2, BACKEND_CMD)
    print(f"  Otevřeno okno '{_procs[proc.pid]}'  (PID {proc.pid})")
    print("  http://localhost:8000  |  Swagger: http://localhost:8000/docs")


def run_frontend_window() -> None:
    proc = _open_window("Pretorian – Frontend :8001", TNPW2_SRC, FRONTEND_CMD)
    print(f"  Otevřeno okno '{_procs[proc.pid]}'  (PID {proc.pid})")
    print("  http://localhost:8001")


def start_backend() -> None:
    header("Spouštím Backend (FastAPI)")
    run_backend_window()
    print("\n  Okno je otevřeno. Enter pro návrat do menu...")
    input()


def start_frontend() -> None:
    header("Spouštím Frontend (HTTP server)")
    run_frontend_window()
    print("\n  Okno je otevřeno. Enter pro návrat do menu...")
    input()


def start_both() -> None:
    header("Spouštím Backend + Frontend")
    run_backend_window()
    run_frontend_window()
    print("\n  Obě okna jsou otevřena. Enter pro návrat do menu...")
    input()


def stop_all() -> None:
    if not _procs:
        print("  Žádné procesy neběží.")
        return
    for pid, title in list(_procs.items()):
        # taskkill /T ukončí i dceřiné procesy (uvicorn, http.server)
        result = subprocess.run(
            ["taskkill", "/F", "/T", "/PID", str(pid)],
            capture_output=True,
        )
        if result.returncode == 0:
            print(f"  ✓ Ukončeno: {title}  (PID {pid})")
        else:
            print(f"  ~ Proces již neběží: {title}  (PID {pid})")
    _procs.clear()


def docker_export() -> None:
    header("Export Docker images do souborů")
    out_dir = os.path.join(DBS2, "docker_export")
    os.makedirs(out_dir, exist_ok=True)
    images = {
        "postgres:16": os.path.join(out_dir, "postgres16.tar"),
        "adminer":     os.path.join(out_dir, "adminer.tar"),
    }
    for image, path in images.items():
        print(f"  Exportuji {image} → {path} ...")
        result = subprocess.run(["docker", "save", image, "-o", path])
        if result.returncode == 0:
            print(f"  ✓ {image} uložen")
        else:
            print(f"  ✗ Chyba při exportu {image}")
    print()
    input("  Hotovo. Stiskni Enter...")


def docker_import() -> None:
    header("Import Docker images ze souborů")
    out_dir = os.path.join(DBS2, "docker_export")
    tarballs = [
        os.path.join(out_dir, "postgres16.tar"),
        os.path.join(out_dir, "adminer.tar"),
    ]
    for path in tarballs:
        if not os.path.exists(path):
            print(f"  ✗ Soubor nenalezen: {path}")
            continue
        print(f"  Importuji {path} ...")
        result = subprocess.run(["docker", "load", "-i", path])
        if result.returncode == 0:
            print(f"  ✓ Importováno")
        else:
            print(f"  ✗ Chyba při importu {path}")
    print()
    input("  Hotovo. Stiskni Enter...")


def run_js_tests() -> None:
    header("JavaScript testy – IR01 (TNPW2)")
    result = subprocess.run(["node", "tests/runAllTests.mjs"], cwd=TNPW2)
    print()
    input(f"  Testy dokončeny (kód {result.returncode}). Stiskni Enter...")


MENU = [
    ("Spustit backend na pozadí",            start_backend),
    ("Spustit frontend na pozadí",           start_frontend),
    ("Spustit backend + frontend na pozadí", start_both),
    ("Exportovat Docker images",             docker_export),
    ("Importovat Docker images",             docker_import),
    ("Spustit JavaScript testy (IR01)",      run_js_tests),
    ("Ukončit všechny spuštěné procesy",     stop_all),
]


def menu() -> None:
    while True:
        header("Pretorian MMA – spouštěč")
        for i, (label, _) in enumerate(MENU, 1):
            print(f"  {i}. {label}")
        print("  0. Ukončit")
        print()
        choice = input("  Volba: ").strip()
        if choice == "0":
            stop_all()
            print("  Nashledanou!")
            break
        if choice.isdigit() and 1 <= int(choice) <= len(MENU):
            MENU[int(choice) - 1][1]()
        else:
            print("  Neplatná volba.\n")


if __name__ == "__main__":
    try:
        menu()
    except KeyboardInterrupt:
        print("\n\n  Přerušeno (Ctrl+C). Ukončuji procesy...")
        stop_all()
