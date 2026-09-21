# K-CONNECT — Windows Server 2012 R2 Compatibility

## Target Environment

- **OS**: Windows Server 2012 R2 (Build 9600)
- **IIS**: 8.5 (built-in)
- **Architecture**: x64

---

## Compatibility Matrix

| Component | Recommended Version | Max Compatible | Notes |
|-----------|-------------------|----------------|-------|
| Node.js | **18.20.x LTS** | 18.x | Node 20+ dropped WS 2012 R2 |
| Python | **3.12.x** | 3.12.x | Python 3.13 dropped WS 2012 R2 |
| PostgreSQL | **15.x** | 15.x | PG 16 may lack installer support |
| IIS | 8.5 | 8.5 | Built-in, no installation needed |
| URL Rewrite Module | **2.1** | 2.1 | Download from Microsoft IIS site |
| ARR | **3.0** | 3.0 | Download from Microsoft IIS site |
| NSSM | **2.24** | Any | No OS-version dependency |

---

## Node.js

### Recommended: Node.js 18.20.x LTS

**Why not Node.js 20 or later?**

Node.js 20+ requires:
- Windows 10 or later
- Windows Server 2016 or later

Node.js 18 LTS minimum requirements:
- Windows 8.1
- Windows Server 2012 R2 ✅

**Download**: https://nodejs.org/dist/latest-v18.x/

**Verify after install:**
```cmd
node --version
# Expected: v18.x.x

npm --version
# Expected: 10.x.x
```

**Risk**: Node.js 18 LTS reaches End of Life in April 2025. Plan to migrate the server OS before or alongside a Node.js upgrade.

---

## Python

### Recommended: Python 3.12.x

**Why not Python 3.13?**

Python 3.13 raised the minimum Windows requirement. Windows Server 2012 R2 support was dropped.

Python 3.12 minimum requirements:
- Windows 8.1
- Windows Server 2012 R2 ✅

**Why not Python 3.11 or earlier?**

Python 3.12 provides:
- Improved performance
- Better error messages
- Still receives security patches

**Download**: https://www.python.org/downloads/release/python-3120/
Choose: `Windows installer (64-bit)`

**Verify after install:**
```cmd
python --version
# Expected: Python 3.12.x

pip --version
```

**Important**: During installation, check:
- ✅ Add Python to PATH
- ✅ Install for all users (recommended for NSSM service)

---

## PostgreSQL

### Recommended: PostgreSQL 15.x

**Why not PostgreSQL 16?**

PostgreSQL 16 introduced installer and runtime dependencies that may not be satisfied by Windows Server 2012 R2. Community reports indicate installation failures on this OS version.

PostgreSQL 15.x:
- Confirmed working on Windows Server 2012 R2 ✅
- Receives security updates until November 2027

**Download**: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
Choose: PostgreSQL 15.x — Windows x86-64

**Fallback**: If PostgreSQL 15.x has issues, use **PostgreSQL 14.x** (supported until November 2026).

**Default Configuration:**
```
Host: localhost
Port: 5432
Superuser: postgres
Service name: postgresql-x64-15
```

**Verify after install:**
```cmd
psql -U postgres -c "SELECT version();"
```

---

## IIS

### IIS 8.5 — Built-in

Windows Server 2012 R2 ships with IIS 8.5. No separate download needed.

**Enable via Server Manager:**
1. Server Manager → Add Roles and Features
2. Web Server (IIS)
3. Required Role Services:
   - Static Content
   - Default Document
   - HTTP Errors
   - Request Filtering
   - URL Authorization
   - Windows Authentication (optional)

**Verify:**
```powershell
Get-WindowsFeature -Name Web-Server
```

---

## URL Rewrite Module

### Recommended: URL Rewrite 2.1

Required for:
- SPA fallback routing (React Router)
- Redirecting `/api/*` to ARR

**Download**: https://www.iis.net/downloads/microsoft/url-rewrite

**Compatible with**: IIS 7.x, 8.x, 10.x ✅

**Verify in IIS Manager:**
IIS Manager → Server level → URL Rewrite icon should appear.

---

## Application Request Routing (ARR)

### Recommended: ARR 3.0

Required for:
- Reverse proxying `/api/*` requests to Uvicorn on port 8000

**Download**: https://www.iis.net/downloads/microsoft/application-request-routing

**Prerequisite**: URL Rewrite 2.1 must be installed first.

**Enable proxy in ARR:**
1. IIS Manager → Server level → Application Request Routing Cache
2. Server Proxy Settings → Enable Proxy ✅

---

## NSSM (Non-Sucking Service Manager)

### Recommended: NSSM 2.24

Used to run Uvicorn as a Windows Service.

**Download**: https://nssm.cc/download

No OS-version compatibility issues. Works on all Windows versions.

**Install steps:**
```cmd
# Copy nssm.exe to C:\tools\nssm\
# Add C:\tools\nssm\ to system PATH

nssm install kconnect-api
```

---

## .NET Framework

URL Rewrite and ARR require .NET Framework 4.5+.

Windows Server 2012 R2 ships with .NET Framework 4.5.1.
URL Rewrite and ARR are compatible. ✅

---

## SSL / TLS

IIS 8.5 on Windows Server 2012 R2 supports:
- TLS 1.0, 1.1, 1.2 ✅
- TLS 1.3 ❌ (requires Windows Server 2019+)

For production, use a valid SSL certificate (Let's Encrypt via win-acme, or a commercial cert).

Disable TLS 1.0 and 1.1 via registry or IIS Crypto tool for security hardening.

---

## Firewall Ports Required

| Port | Service | Direction |
|------|---------|-----------|
| 80 | IIS HTTP | Inbound |
| 443 | IIS HTTPS | Inbound |
| 5432 | PostgreSQL | Internal only |
| 8000 | Uvicorn | Internal only (loopback) |

---

## Compatibility Risks Summary

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Node.js 18 EOL (April 2025) | Medium | Plan OS upgrade to WS 2016+ |
| Python 3.12 is last compatible version | Low | No action needed now |
| PG 16+ may not install on WS 2012 R2 | Medium | Use PostgreSQL 15.x |
| TLS 1.3 not supported | Low | TLS 1.2 is adequate for now |
| WS 2012 R2 itself is EOL (Oct 2023) | High | Plan OS migration; apply ESU patches |

---

## Windows Server 2012 R2 End of Life Note

Windows Server 2012 R2 reached **mainstream end of support on October 9, 2018** and **extended end of support on October 10, 2023**.

Microsoft offers **Extended Security Updates (ESU)** through 2026 for customers using Azure Arc.

**Recommendation**: Plan migration to Windows Server 2019 or 2022 within 12–18 months. The K-CONNECT codebase is designed to be portable — no OS-specific dependencies in application code.
