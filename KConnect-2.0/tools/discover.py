"""Read-only source discovery. Never imports/starts the legacy application.

Run from any directory: python KConnect-2.0/tools/discover.py
Outputs are confined to this new workspace. No network or third-party packages.
"""
import ast
import hashlib
import json
import re
from pathlib import Path

NEW = Path(__file__).resolve().parents[1]
OLD = NEW.parent
OUT = NEW / "docs" / "phase-0" / "generated"
METHODS = {"get", "post", "put", "patch", "delete"}


def read(path):
    return path.read_text(encoding="utf-8-sig")


def expr(node):
    return ast.unparse(node) if node is not None else None


def digest(path):
    h = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def emit(name, data):
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / name).write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def location(path, node):
    return f"{path.relative_to(OLD).as_posix()}:{node.lineno}"


def legacy_manifest():
    # Includes original code/docs/config examples, excludes secrets, personal uploads,
    # VCS internals and generated dependencies. Their exclusions are explicit evidence limits.
    excluded = {".git", "KConnect-2.0", "node_modules", "venv", ".venv", "__pycache__", "uploads"}
    files = {}
    for path in sorted(OLD.rglob("*")):
        relative = path.relative_to(OLD)
        if any(part in excluded for part in relative.parts) or not path.is_file():
            continue
        if path.name.startswith(".env") and path.name != ".env.example":
            continue
        files[relative.as_posix()] = digest(path)
    return files


def route_inventory():
    main = OLD / "backend/app/main.py"
    tree = ast.parse(read(main))
    imports = {}
    for node in tree.body:
        if isinstance(node, ast.ImportFrom) and node.module and node.module.startswith("app.api"):
            for item in node.names:
                imports[item.asname or item.name] = node.module + "." + item.name
    routers = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr == "include_router":
            key = node.args[0].value.id
            prefix = next(ast.literal_eval(k.value) for k in node.keywords if k.arg == "prefix")
            routers.append((OLD / "backend" / (imports[key].replace(".", "/") + ".py"), prefix))
    routers.append((main, ""))
    result = []
    for path, prefix in routers:
        for node in ast.parse(read(path)).body:
            if not isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                continue
            for deco in node.decorator_list:
                if not isinstance(deco, ast.Call) or not isinstance(deco.func, ast.Attribute) or deco.func.attr not in METHODS:
                    continue
                kwargs = {k.arg: expr(k.value) for k in deco.keywords}
                args = node.args.posonlyargs + node.args.args
                defaults = [None] * (len(args) - len(node.args.defaults)) + node.args.defaults
                params = [{"name": arg.arg, "annotation": expr(arg.annotation), "default": expr(default)} for arg, default in zip(args, defaults)]
                deps = [expr(n.args[0]) for n in ast.walk(node) if isinstance(n, ast.Call) and expr(n.func) == "Depends" and n.args]
                errors = [{k.arg: expr(k.value) for k in n.keywords} for n in ast.walk(node) if isinstance(n, ast.Call) and expr(n.func) == "HTTPException"]
                body = ast.get_source_segment(read(path), node)
                auth = next((d for d in deps if d.startswith("require_")), "get_current_user" if "get_current_user" in deps else "public")
                result.append({
                    "method": deco.func.attr.upper(), "path": prefix + ast.literal_eval(deco.args[0]),
                    "handler": node.name, "source": location(path, node),
                    "response_model": kwargs.get("response_model"), "status_expression": kwargs.get("status_code", "200"),
                    "parameters": params, "dependencies": deps, "auth_dependency": auth,
                    "handler_errors": errors,
                    "ownership_evidence": [line.strip() for line in body.splitlines() if "current_user.id" in line],
                    "query_evidence": [line.strip() for line in body.splitlines() if any(s in line for s in ("order_by", "nullslast", "on_conflict", "array_to_string", ".any(", "exclude_unset"))],
                    "behavior": "placeholder" if "coming soon" in body or node.name == "list_users" and prefix == "/api/v1/users" else "implemented-source",
                    "runtime_verified": False,
                    "limits": "Handler-local errors only; inherited/dependency/service errors require the separate source review and runtime capture."
                })
    return sorted(result, key=lambda row: (row["path"], row["method"]))


def class_inventory(folder):
    result = []
    for path in sorted((OLD / folder).rglob("*.py")):
        for node in ast.parse(read(path)).body:
            if not isinstance(node, ast.ClassDef):
                continue
            fields = []
            table = None
            for child in node.body:
                if isinstance(child, ast.AnnAssign):
                    fields.append({"name": expr(child.target), "annotation": expr(child.annotation), "value": expr(child.value)})
                elif isinstance(child, ast.Assign):
                    for target in child.targets:
                        if expr(target) == "__tablename__":
                            table = ast.literal_eval(child.value)
                        fields.append({"name": expr(target), "annotation": None, "value": expr(child.value)})
            result.append({"class": node.name, "bases": [expr(b) for b in node.bases], "source": location(path, node), "table": table, "fields": fields,
                           "methods": [ast.get_source_segment(read(path), n) for n in node.body if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef))]})
    return result


def ui_inventory():
    path = OLD / "frontend/src/routes/index.tsx"
    source = read(path)
    imports = {}
    for match in re.finditer(r"import\s*\{([^}]+)\}\s*from\s*'([^']+)'", source):
        for item in match[1].split(","):
            parts = item.strip().split(" as ")
            imports[parts[-1]] = match[2].replace("@/", "frontend/src/") + ".tsx"
    result = []
    for match in re.finditer(r"path:\s*'([^']+)'\s*,\s*element:\s*\(?\s*<(\w+)", source):
        route, component = match.groups()
        component_file = imports.get(component)
        component_text = read(OLD / component_file) if component_file and (OLD / component_file).exists() else ""
        category = "implemented-source"
        if component == "Navigate":
            category = "redirect"
        elif component == "PlaceholderPage" or "<PlaceholderPage" in component_text:
            category = "placeholder"
        elif route == "/dashboard":
            category = "static-demo-with-auth-user"
        guard = "SUPER_ADMIN" if route.startswith("/admin") else "PublicRoute" if route in ("/login", "/register") else "none" if route == "/" else "ProtectedRoute"
        result.append({"path": route, "component": component, "component_source": component_file, "guard": guard, "classification": category, "source": f"frontend/src/routes/index.tsx:{source[:match.start()].count(chr(10)) + 1}", "screenshots": "pending-runtime", "interactions": "pending-runtime"})
    return result


def upload_inventory():
    roots = []
    for relative in ("backend/uploads", "uploads"):
        files = []
        root = OLD / relative
        for path in sorted(root.rglob("*")) if root.exists() else []:
            if path.is_file() and path.name != ".gitkeep":
                # Avoid putting personal filenames or user IDs into shareable evidence.
                files.append({"path_sha256": hashlib.sha256(path.relative_to(root).as_posix().encode()).hexdigest(), "extension": path.suffix.lower(), "bytes": path.stat().st_size, "sha256": digest(path)})
        roots.append({"root": relative, "files": files, "count": len(files), "total_bytes": sum(f["bytes"] for f in files)})
    return {"scope": "Local checkout only; no production DB-to-file reconciliation. Filenames intentionally redacted.", "roots": roots}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = legacy_manifest()
    frozen = OUT / "legacy-source-hashes.json"
    if frozen.exists() and json.loads(read(frozen)) != manifest:
        raise SystemExit("Legacy source differs from frozen baseline. Review differences; baseline was not overwritten.")
    routes = route_inventory()
    ui = ui_inventory()
    models = class_inventory("backend/app/models")
    schemas = class_inventory("backend/app/schemas")
    assert len(routes) == 59, "Route count changed; review baseline."
    assert len({(r['method'], r['path']) for r in routes}) == len(routes)
    assert sum(bool(m["table"]) for m in models) == 13
    emit("legacy-source-hashes.json", manifest)
    emit("api-inventory.json", routes)
    emit("schema-inventory.json", schemas)
    emit("model-inventory.json", models)
    emit("ui-inventory.json", ui)
    emit("local-upload-inventory.json", upload_inventory())
    cases = []
    for row in routes:
        cases.append({"id": row["method"] + " " + row["path"], "source": row["source"], "request_parameters": row["parameters"], "expected_schema": row["response_model"], "success_status_expression": row["status_expression"], "capture_status": "pending-runtime", "required_cases": ["success-or-preserved-placeholder", "validation-boundaries", "missing-or-invalid-token" if row["auth_dependency"] != "public" else "public-contract", "role-and-ownership" if row["auth_dependency"] != "public" else "abuse-and-input-validation"], "observed_response": None})
    emit("contract-capture-matrix.json", cases)
    lines = ["# Generated source baseline", "", "Source-derived only; runtime responses and screenshots are not captured.", "", "## API and permission inventory", "", "| Method | Path | Auth dependency | Behavior | Source |", "|---|---|---|---|---|"]
    for row in routes:
        lines.append(f"| {row['method']} | `{row['path']}` | `{row['auth_dependency']}` | {row['behavior']} | `{row['source']}` |")
    lines += ["", "## UI inventory", "", "| Route | Component | Classification | Guard |", "|---|---|---|---|"]
    for row in ui:
        lines.append(f"| `{row['path']}` | {row['component']} | {row['classification']} | {row['guard']} |")
    (OUT / "BASELINE.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    assert legacy_manifest() == manifest, "Legacy source changed during discovery."
    print(json.dumps({"api_operations_including_health": len(routes), "ui_routes": len(ui), "tables": sum(bool(m['table']) for m in models), "schema_classes": len(schemas), "legacy_files_hashed": len(manifest), "legacy_unchanged": True}))


if __name__ == "__main__":
    main()
