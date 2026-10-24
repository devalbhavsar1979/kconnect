"""
Create a Super Admin account.

Usage (run from the backend/ directory):
    python -m scripts.create_super_admin --email admin@kconnect.in --password "KConnect@1979"

Optional args:
    --first-name   (default: Super)
    --last-name    (default: Admin)
"""
import argparse
import sys
from pathlib import Path

# Allow running from repo root or backend/ directory
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.user import User, UserType, ProfileStatus


def main() -> None:
    parser = argparse.ArgumentParser(description="Create a Super Admin account")
    parser.add_argument("--email",      required=True,        help="Login email")
    parser.add_argument("--password",   required=True,        help="Login password")
    parser.add_argument("--first-name", default="Super",      dest="first_name")
    parser.add_argument("--last-name",  default="Admin",      dest="last_name")
    args = parser.parse_args()

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == args.email).first()
        if existing:
            print(f"[WARN] Account already exists: {args.email}  (no changes made)")
            sys.exit(0)

        admin = User(
            first_name     = args.first_name,
            last_name      = args.last_name,
            email          = args.email,
            password_hash  = hash_password(args.password),
            user_type      = UserType.SUPER_ADMIN,
            profile_status = ProfileStatus.COMPLETE,
            is_active      = True,
            is_verified    = True,
            consent        = True,
        )
        db.add(admin)
        db.commit()
        print(f"[OK] Super admin created successfully")
        print(f"     Email   : {args.email}")
        print(f"     Name    : {args.first_name} {args.last_name}")
        print(f"     Role    : SUPER_ADMIN")
    except Exception as exc:
        db.rollback()
        print(f"[ERROR] {exc}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
