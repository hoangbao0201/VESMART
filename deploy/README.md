# Deploy (local only)

Scripts in this folder push `fe/` + `be/` to the VPS via Paramiko/SSH.

**Never commit** passwords, `.env` upserts with secrets, `*.tar.gz`, or `*.log`.

Typical entrypoints (run from `web/`):

```bash
python deploy/deploy_fe.py
python deploy/deploy_revert_sync.py   # FE + BE full sync
```

Required locally: Python 3 + `paramiko`, SSH access to the VPS.
