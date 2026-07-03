#!/usr/bin/env python3
"""
start.py — Garage Project Launcher
Sobe PostgreSQL (Docker), backend (Spring Boot) e frontend (Angular).

Uso:
    python start.py          → inicia tudo
    python start.py stop     → para tudo (processos + container Docker)
"""

import json
import os
import platform
import signal
import socket
import subprocess
import sys
import time
import urllib.request
import urllib.error
from pathlib import Path

# ─── Caminhos ────────────────────────────────────────────────────────────────

BASE_DIR = Path(__file__).resolve().parent
BACKEND  = BASE_DIR / "garage-service"
FRONTEND = BASE_DIR / "garage-frontend-angular"
PID_FILE = BASE_DIR / "_garage_pids.json"
LOG_DIR  = BASE_DIR / "_logs"
LOG_BACK = LOG_DIR  / "backend.log"
LOG_FRNT = LOG_DIR  / "frontend.log"

# ─── Configurações ───────────────────────────────────────────────────────────

CONTAINER_NAME = "garage-postgres"
POSTGRES_PORT  = 1883
BACKEND_PORT   = 8080
FRONTEND_PORT  = 4200
HEALTH_URL     = f"http://localhost:{BACKEND_PORT}/actuator/health"

IS_WINDOWS = platform.system() == "Windows"

# ─── Cores ANSI ──────────────────────────────────────────────────────────────

class C:
    RESET  = "\033[0m"
    BOLD   = "\033[1m"
    GREEN  = "\033[92m"
    YELLOW = "\033[93m"
    RED    = "\033[91m"
    CYAN   = "\033[96m"
    GRAY   = "\033[90m"

def _ok(msg):   print(f"  {C.GREEN}✔{C.RESET}  {msg}")
def _warn(msg): print(f"  {C.YELLOW}⚠{C.RESET}  {msg}")
def _err(msg):  print(f"  {C.RED}✖{C.RESET}  {msg}")
def _info(msg): print(f"  {C.CYAN}→{C.RESET}  {msg}")
def _head(msg): print(f"\n{C.BOLD}{C.CYAN}{msg}{C.RESET}")

# ─── Utilitários ─────────────────────────────────────────────────────────────

def _run(cmd: str) -> subprocess.CompletedProcess:
    return subprocess.run(
        cmd, shell=True, capture_output=True, text=True,
        timeout=30
    )


def _popen(cmd: str, log_path: Path, cwd: Path = None) -> subprocess.Popen:
    """Inicia um processo em background, redirecionando stdout+stderr para log_path."""
    log_path.parent.mkdir(parents=True, exist_ok=True)
    log_file = open(log_path, "w", encoding="utf-8", errors="replace")

    kwargs = dict(
        shell=True,
        stdout=log_file,
        stderr=subprocess.STDOUT,
        cwd=str(cwd) if cwd else None,
    )
    # No Unix, criamos um grupo de processos separado para matar a árvore toda.
    if not IS_WINDOWS:
        kwargs["preexec_fn"] = os.setsid

    return subprocess.Popen(cmd, **kwargs)


def _save_pids(data: dict):
    PID_FILE.write_text(json.dumps(data, indent=2), encoding="utf-8")


def _load_pids() -> dict:
    if PID_FILE.exists():
        try:
            return json.loads(PID_FILE.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {}


def _kill(pid: int, name: str):
    """Mata um processo (e seus filhos) pelo PID."""
    try:
        if IS_WINDOWS:
            _run(f"taskkill /F /T /PID {pid}")
        else:
            os.killpg(os.getpgid(pid), signal.SIGTERM)
        _ok(f"{name} encerrado (PID {pid}).")
    except Exception as e:
        _warn(f"Não foi possível encerrar {name} (PID {pid}): {e}")


def _wait_port(host: str, port: int, timeout: int = 90) -> bool:
    """Aguarda até a porta TCP aceitar conexões."""
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with socket.create_connection((host, port), timeout=2):
                print()
                return True
        except OSError:
            pass
        print(".", end="", flush=True)
        time.sleep(2)
    print()
    return False


def _wait_http(url: str, timeout: int = 150) -> bool:
    """Aguarda até a URL retornar HTTP 200."""
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(url, timeout=5) as r:
                if r.status == 200:
                    print()
                    return True
        except Exception:
            pass
        print(".", end="", flush=True)
        time.sleep(3)
    print()
    return False


def _check_cmd(cmd: str) -> bool:
    """Retorna True se o comando existe e executa sem erro."""
    try:
        r = _run(cmd)
        return r.returncode == 0
    except Exception:
        return False

# ─── 1. PostgreSQL via Docker ─────────────────────────────────────────────────

def start_postgres():
    _head("1/3  PostgreSQL (Docker)")

    # Verificar Docker Desktop
    if not _check_cmd("docker info"):
        _err("Docker não encontrado ou não está rodando.")
        _err("Abra o Docker Desktop e aguarde ele inicializar, depois tente novamente.")
        sys.exit(1)

    # Container já está rodando?
    r = _run(f"docker inspect -f {{{{{{{{.State.Running}}}}}}}} {CONTAINER_NAME}")
    if r.returncode == 0 and r.stdout.strip().lower() == "true":
        _ok(f"Container '{CONTAINER_NAME}' já está rodando — reutilizando.")
        return

    # Container existe mas está parado → reiniciar
    r2 = _run(f"docker inspect {CONTAINER_NAME}")
    if r2.returncode == 0:
        _info(f"Container '{CONTAINER_NAME}' existe (parado) → reiniciando...")
        r3 = _run(f"docker start {CONTAINER_NAME}")
        if r3.returncode != 0:
            _err(f"Falha ao reiniciar container:\n{r3.stderr}")
            sys.exit(1)
    else:
        # Criar do zero
        _info("Criando container postgres:16-alpine na porta 1883...")
        cmd = (
            f"docker run -d"
            f" --name {CONTAINER_NAME}"
            f" --restart unless-stopped"
            f" -e POSTGRES_DB=garage_db"
            f" -e POSTGRES_USER=garage_user"
            f" -e POSTGRES_PASSWORD=garage_pass"
            f" -p {POSTGRES_PORT}:5432"
            f" -v garage_postgres_data:/var/lib/postgresql/data"
            f" postgres:16-alpine"
        )
        r3 = _run(cmd)
        if r3.returncode != 0:
            _err(f"Falha ao criar container:\n{r3.stderr.strip()}")
            sys.exit(1)

    # Aguardar porta TCP
    _info(f"Aguardando Postgres aceitar conexões na porta {POSTGRES_PORT} ")
    if not _wait_port("localhost", POSTGRES_PORT, timeout=60):
        _err("Postgres não respondeu em 60s.")
        _err(f"Verifique com: docker logs {CONTAINER_NAME}")
        sys.exit(1)

    # Aguardar pg_isready (banco pode estar inicializando ainda)
    for _ in range(15):
        r4 = _run(
            f"docker exec {CONTAINER_NAME} pg_isready -U garage_user -d garage_db"
        )
        if r4.returncode == 0:
            break
        time.sleep(2)

    _ok("PostgreSQL pronto  (garage_db · garage_user · porta 1883)")


# ─── 2. Backend (Spring Boot) ─────────────────────────────────────────────────

def start_backend():
    _head("2/3  Backend (Spring Boot)")

    if not BACKEND.exists():
        _err(f"Pasta não encontrada: {BACKEND}")
        _err("Certifique-se de que start.py está na raiz do projeto (junto a garage-service/).")
        sys.exit(1)

    if not _check_cmd("mvn -version"):
        _err("Maven (mvn) não encontrado no PATH.")
        _err("Instale o Maven e adicione ao PATH: https://maven.apache.org/install.html")
        sys.exit(1)

    _info(f"Iniciando Spring Boot...   log → {LOG_BACK}")
    proc = _popen("mvn spring-boot:run", LOG_BACK, cwd=BACKEND)

    _info(f"Aguardando health check em {HEALTH_URL} ")
    if not _wait_http(HEALTH_URL, timeout=150):
        _err(f"Backend não respondeu em 150s. Veja o log:")
        _err(f"  {LOG_BACK}")
        proc.terminate()
        sys.exit(1)

    _ok(f"Backend rodando  →  http://localhost:{BACKEND_PORT}")
    return proc


# ─── 3. Frontend (Angular) ────────────────────────────────────────────────────

def start_frontend():
    _head("3/3  Frontend (Angular)")

    if not FRONTEND.exists():
        _err(f"Pasta não encontrada: {FRONTEND}")
        sys.exit(1)

    if not _check_cmd("npm -version") and not _check_cmd("npm --version"):
        _err("npm não encontrado no PATH. Instale o Node.js: https://nodejs.org")
        sys.exit(1)

    # Instalar dependências se necessário
    if not (FRONTEND / "node_modules").exists():
        _info("node_modules não encontrado → rodando npm install (pode demorar na 1ª vez)...")
        r = subprocess.run("npm install", shell=True, cwd=str(FRONTEND))
        if r.returncode != 0:
            _err("npm install falhou. Verifique sua conexão e o log acima.")
            sys.exit(1)
        _ok("npm install concluído.")
    else:
        _info("node_modules encontrado — pulando npm install.")

    _info(f"Iniciando ng serve...   log → {LOG_FRNT}")
    proc = _popen("npm start", LOG_FRNT, cwd=FRONTEND)

    _info(f"Aguardando frontend na porta {FRONTEND_PORT} ")
    if not _wait_port("localhost", FRONTEND_PORT, timeout=120):
        _err(f"Frontend não respondeu em 120s. Veja o log:")
        _err(f"  {LOG_FRNT}")
        proc.terminate()
        sys.exit(1)

    _ok(f"Frontend rodando  →  http://localhost:{FRONTEND_PORT}")
    return proc


# ─── Parar tudo ───────────────────────────────────────────────────────────────

def stop():
    _head("Parando o Garage Project")
    pids = _load_pids()

    if not pids:
        _warn("Nenhum PID salvo encontrado. Os processos podem ter sido encerrados manualmente.")

    for name, pid in pids.items():
        _info(f"Encerrando {name} (PID {pid})...")
        _kill(pid, name)

    _info(f"Parando container Docker '{CONTAINER_NAME}'...")
    r = _run(f"docker stop {CONTAINER_NAME}")
    if r.returncode == 0:
        _ok("Container PostgreSQL parado (dados preservados no volume Docker).")
    else:
        _warn(f"Container '{CONTAINER_NAME}' não encontrado ou já estava parado.")

    if PID_FILE.exists():
        PID_FILE.unlink()

    _ok("Tudo encerrado.\n")


# ─── Iniciar tudo ─────────────────────────────────────────────────────────────

def start():
    # Habilitar cores ANSI no terminal Windows
    if IS_WINDOWS:
        os.system("")

    banner = f"""
{C.BOLD}{C.CYAN}╔══════════════════════════════════════════════╗
║          GARAGE PROJECT — Launcher           ║
╚══════════════════════════════════════════════╝{C.RESET}
"""
    print(banner)

    start_postgres()
    back_proc  = start_backend()
    front_proc = start_frontend()

    _save_pids({
        "backend":  back_proc.pid,
        "frontend": front_proc.pid,
    })

    success = f"""
{C.BOLD}{C.GREEN}╔══════════════════════════════════════════════╗
║              TUDO RODANDO! 🚀                ║
╠══════════════════════════════════════════════╣
║  🌐 Frontend  →  http://localhost:4200       ║
║  ⚙  Backend   →  http://localhost:8080       ║
║  📄 Swagger   →  http://localhost:8080       ║
║                   /swagger-ui.html           ║
║  🗄  H2 console→  http://localhost:8080       ║
║                   /h2-console (só fallback)  ║
╠══════════════════════════════════════════════╣
║  🔑 Login: admin  /  user1234               ║
╠══════════════════════════════════════════════╣
║  Para encerrar:  python start.py stop        ║
║  Ou pressione:   Ctrl+C                      ║
╚══════════════════════════════════════════════╝{C.RESET}
"""
    print(success)
    print(f"{C.GRAY}  Logs em: {LOG_DIR}{C.RESET}\n")

    # Abrir browser automaticamente
    try:
        import webbrowser
        webbrowser.open(f"http://localhost:{FRONTEND_PORT}")
    except Exception:
        pass

    # Mantém o script vivo e monitora os processos
    try:
        while True:
            time.sleep(10)
            if back_proc.poll() is not None:
                _warn(f"Backend encerrou inesperadamente (código {back_proc.returncode}).")
                _warn(f"Veja o log: {LOG_BACK}")
            if front_proc.poll() is not None:
                _warn(f"Frontend encerrou inesperadamente (código {front_proc.returncode}).")
                _warn(f"Veja o log: {LOG_FRNT}")
    except KeyboardInterrupt:
        print(f"\n{C.YELLOW}  Ctrl+C detectado — encerrando tudo...{C.RESET}")
        stop()


# ─── Entry point ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    cmd = sys.argv[1].strip().lower() if len(sys.argv) > 1 else "start"

    if cmd == "stop":
        stop()
    elif cmd == "start":
        start()
    else:
        print(f"Comando desconhecido: '{cmd}'")
        print("Uso: python start.py [start|stop]")
        sys.exit(1)
