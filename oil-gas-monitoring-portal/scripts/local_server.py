"""Loopback evaluation server; credentials are stored in mode-600 local files."""
import os
import secrets
from pathlib import Path

import uvicorn
from app.main import create_app

if __name__ == '__main__':
    root = Path(__file__).resolve().parents[1]
    runtime = root / '.runtime'
    runtime.mkdir(mode=0o700, exist_ok=True)
    os.chmod(runtime, 0o700)
    tokens = []
    for role in ('ingest', 'reviewer'):
        path = runtime / f'{role}.token'
        if not path.exists():
            fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
            with os.fdopen(fd, 'w') as handle:
                handle.write(secrets.token_urlsafe(48))
        os.chmod(path, 0o600)
        tokens.append(path.read_text().strip())
    application = create_app(f'sqlite:///{runtime}/local.db', *tokens, initialize=True)
    uvicorn.run(application, host='127.0.0.1', port=8805, access_log=False)
