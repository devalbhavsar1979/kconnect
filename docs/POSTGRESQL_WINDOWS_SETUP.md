# K-CONNECT — PostgreSQL Setup on Windows Server 2012 R2

## Compatible Version

Use **PostgreSQL 15.x** (x64).

PostgreSQL 16 may fail installation on Windows Server 2012 R2.
If PostgreSQL 15 has issues, fall back to **PostgreSQL 14.x** (supported until November 2026).

---

## Step 1 — Download PostgreSQL

Download the Windows x86-64 installer from EnterpriseDB:

```
https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
```

Select: **PostgreSQL 15.x** → **Windows x86-64**

---

## Step 2 — Install PostgreSQL

Run the installer as Administrator.

During installation:
- **Installation directory**: `C:\Program Files\PostgreSQL\15`
- **Data directory**: `C:\Program Files\PostgreSQL\15\data`
- **Password**: Set a strong password for the `postgres` superuser
- **Port**: `5432` (default)
- **Locale**: Default

When asked about Stack Builder, you may skip it.

---

## Step 3 — Verify Service is Running

```powershell
Get-Service -Name "postgresql*"
# Should show: postgresql-x64-15   Running
```

If not running:
```powershell
Start-Service -Name "postgresql-x64-15"
```

Set to start automatically:
```powershell
Set-Service -Name "postgresql-x64-15" -StartupType Automatic
```

---

## Step 4 — Add psql to PATH

```powershell
# Add PostgreSQL bin to system PATH permanently
$pgPath = "C:\Program Files\PostgreSQL\15\bin"
[Environment]::SetEnvironmentVariable(
    "Path",
    [Environment]::GetEnvironmentVariable("Path", "Machine") + ";$pgPath",
    "Machine"
)
```

Open a new PowerShell window after running this.

---

## Step 5 — Connect as postgres Superuser

```powershell
psql -U postgres
# Enter the password you set during installation
```

You should see:
```
psql (15.x)
Type "help" for help.
postgres=#
```

---

## Step 6 — Create the Application Database

Run these commands inside psql:

```sql
-- Create the application database
CREATE DATABASE kconnect_db
    ENCODING 'UTF8'
    LC_COLLATE 'English_United States.1252'
    LC_CTYPE 'English_United States.1252'
    TEMPLATE template0;
```

---

## Step 7 — Create the Application User

```sql
-- Create user with a strong password
CREATE USER kconnect_user WITH PASSWORD 'CHANGE_TO_A_STRONG_PASSWORD';

-- Grant connection rights
GRANT CONNECT ON DATABASE kconnect_db TO kconnect_user;
```

---

## Step 8 — Grant Permissions

Connect to kconnect_db:

```sql
\c kconnect_db
```

Grant schema permissions:

```sql
-- Grant usage and create on the public schema
GRANT USAGE ON SCHEMA public TO kconnect_user;
GRANT CREATE ON SCHEMA public TO kconnect_user;

-- Grant permissions on all existing tables (run after migrations too)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO kconnect_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO kconnect_user;

-- Make future tables automatically accessible
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON TABLES TO kconnect_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON SEQUENCES TO kconnect_user;
```

Exit psql:
```sql
\q
```

---

## Step 9 — Configure pg_hba.conf (Local Access)

The configuration file is at:
```
C:\Program Files\PostgreSQL\15\data\pg_hba.conf
```

Open it in Notepad (run as Administrator) and verify these lines exist:

```
# IPv4 local connections:
host    all             all             127.0.0.1/32            scram-sha-256
host    all             all             ::1/128                 scram-sha-256
```

The default installation includes these. No change needed for local-only access.

After any change to `pg_hba.conf`, reload PostgreSQL:
```powershell
& "C:\Program Files\PostgreSQL\15\bin\pg_ctl.exe" reload -D "C:\Program Files\PostgreSQL\15\data"
```

---

## Step 10 — Verify the Connection

Test that the application user can connect:

```powershell
psql -U kconnect_user -d kconnect_db -h localhost
# Enter the password for kconnect_user
```

You should see:
```
psql (15.x)
kconnect_db=>
```

---

## Step 11 — Configure Backend .env

In `backend/.env`, set:

```env
DATABASE_URL=postgresql+psycopg://kconnect_user:YOUR_PASSWORD@localhost:5432/kconnect_db
```

---

## Step 12 — Run Alembic Migrations

From `backend/` with the virtual environment active:

```powershell
# Activate virtual environment
venv\Scripts\activate

# Apply initial migration (creates all tables)
alembic upgrade head
```

Expected output:
```
INFO  [alembic.runtime.migration] Context impl PostgreSQLImpl.
INFO  [alembic.runtime.migration] Will assume transactional DDL.
INFO  [alembic.runtime.migration] Running upgrade  -> 001, Initial schema
```

---

## Step 13 — Verify Tables Were Created

```powershell
psql -U kconnect_user -d kconnect_db -h localhost -c "\dt"
```

Expected output:
```
            List of relations
 Schema |      Name       | Type  |     Owner
--------+-----------------+-------+---------------
 public | alembic_version | table | kconnect_user
 public | applications    | table | kconnect_user
 public | opportunities   | table | kconnect_user
 public | organizations   | table | kconnect_user
 public | refresh_tokens  | table | kconnect_user
 public | users           | table | kconnect_user
```

---

## Step 14 — Verify Enum Types

```sql
-- In psql connected to kconnect_db
SELECT typname FROM pg_type
WHERE typtype = 'e'
ORDER BY typname;
```

Expected:
```
applicationstatus
locationtype
opportunitystatus
opportunitytype
organizationtype
profilestatus
usertype
```

---

## Firewall Configuration

PostgreSQL should only be accessible from localhost (not external internet).

```powershell
# Block external PostgreSQL access (keep port 5432 internal only)
New-NetFirewallRule `
    -DisplayName "Block PostgreSQL External" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 5432 `
    -RemoteAddress Internet `
    -Action Block
```

---

## Useful psql Commands

```sql
-- List databases
\l

-- Connect to database
\c kconnect_db

-- List tables
\dt

-- Describe a table
\d users

-- List enum types
SELECT typname, enumlabel FROM pg_enum
JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
ORDER BY typname, enumsortorder;

-- Check current connections
SELECT * FROM pg_stat_activity WHERE datname = 'kconnect_db';

-- Exit psql
\q
```

---

## Alembic Migration Reference

```powershell
# Run all pending migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# Rollback all migrations
alembic downgrade base

# Check current migration version
alembic current

# Show migration history
alembic history --verbose

# Create a new migration (after changing models)
alembic revision --autogenerate -m "describe_your_change"
```

---

## Troubleshooting

### psycopg connection error
```
connection refused
```
Check the PostgreSQL service is running:
```powershell
Get-Service -Name "postgresql-x64-15"
Start-Service -Name "postgresql-x64-15"
```

### Authentication failed
```
password authentication failed for user "kconnect_user"
```
Reset the password in psql as postgres superuser:
```sql
ALTER USER kconnect_user WITH PASSWORD 'new_strong_password';
```
Then update `DATABASE_URL` in `.env`.

### Alembic: Can't locate revision '001'
Ensure you are running `alembic upgrade head` from the `backend/` directory with the virtual environment active.

### Column type mismatch after model change
Create a new migration:
```powershell
alembic revision --autogenerate -m "fix_column_type"
alembic upgrade head
```
