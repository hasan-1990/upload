from __future__ import annotations

import json
import mimetypes
import os
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

import requests
from flask import Flask, abort, jsonify, render_template, request, send_file
from werkzeug.exceptions import HTTPException
from werkzeug.utils import secure_filename

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"
INDEX_PATH = BASE_DIR / "data" / "index.json"
MAX_BYTES = int(os.environ.get("MAX_UPLOAD_BYTES", str(2 * 1024 * 1024 * 1024)))
FETCH_TIMEOUT = 30

UPLOAD_DIR.mkdir(exist_ok=True)
INDEX_PATH.parent.mkdir(exist_ok=True)

APP_PREFIX = os.environ.get("APP_PREFIX", "/upload").rstrip("/") or ""

app = Flask(__name__, static_url_path=f"{APP_PREFIX}/static" if APP_PREFIX else "/static")
app.config["MAX_CONTENT_LENGTH"] = MAX_BYTES


@app.errorhandler(413)
def too_large(_err):
    return jsonify({"error": "حجم فایل از حد مجاز بیشتر است."}), 413


@app.errorhandler(Exception)
def unhandled(err):
    if isinstance(err, HTTPException):
        return err
    app.logger.exception(err)
    if isinstance(err, PermissionError):
        return jsonify({"error": "سرور اجازه نوشتن فایل را ندارد."}), 500
    return jsonify({"error": "خطای داخلی سرور."}), 500


def public_base() -> str:
    return request.host_url.rstrip("/") + APP_PREFIX


def load_index() -> list[dict]:
    if not INDEX_PATH.exists():
        return []
    try:
        data = json.loads(INDEX_PATH.read_text(encoding="utf-8"))
        return data if isinstance(data, list) else []
    except (json.JSONDecodeError, OSError):
        return []


def save_index(items: list[dict]) -> None:
    INDEX_PATH.write_text(
        json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8"
    )


def human_size(n: int) -> str:
    units = ["B", "KB", "MB", "GB"]
    size = float(n)
    for unit in units:
        if size < 1024 or unit == units[-1]:
            if unit == "B":
                return f"{int(size)} {unit}"
            return f"{size:.1f} {unit}"
        size /= 1024
    return f"{n} B"


def public_item(item: dict, base_url: str) -> dict:
    token = item["token"]
    return {
        "token": token,
        "name": item["name"],
        "size": item["size"],
        "size_label": human_size(item["size"]),
        "mime": item.get("mime") or "application/octet-stream",
        "created_at": item["created_at"],
        "download_url": f"{base_url}/f/{token}",
        "preview_url": f"{base_url}/f/{token}?inline=1",
    }


def store_written_file(dest: Path, original_name: str, mime: str | None) -> dict:
    safe = secure_filename(original_name) or "file"
    mime = mime or mimetypes.guess_type(safe)[0] or "application/octet-stream"
    stored = dest.name
    token = stored.split("_", 1)[0]
    item = {
        "token": token,
        "name": original_name or safe,
        "stored": stored,
        "size": dest.stat().st_size,
        "mime": mime,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    items = load_index()
    items.insert(0, item)
    save_index(items)
    return item


def new_dest(original_name: str) -> tuple[str, Path]:
    safe = secure_filename(original_name) or "file"
    token = uuid.uuid4().hex
    stored = f"{token}_{safe}"
    return token, UPLOAD_DIR / stored


def store_upload(file_storage) -> dict | None:
    _, dest = new_dest(file_storage.filename)
    file_storage.save(dest)
    if dest.stat().st_size == 0:
        dest.unlink(missing_ok=True)
        return None
    return store_written_file(dest, file_storage.filename, file_storage.mimetype)


def store_bytes(raw: bytes, original_name: str, mime: str | None) -> dict:
    _, dest = new_dest(original_name)
    dest.write_bytes(raw)
    return store_written_file(dest, original_name, mime)


def name_from_url(url: str, content_type: str | None, disposition: str | None) -> str:
    if disposition:
        match = re.search(
            r'filename\*?=(?:UTF-8\'\')?"?([^";]+)"?', disposition, re.I
        )
        if match:
            return match.group(1).strip()
    path = urlparse(url).path
    name = os.path.basename(path.rstrip("/"))
    if name:
        return name
    ext = mimetypes.guess_extension((content_type or "").split(";")[0].strip()) or ""
    return f"download{ext}"


@app.get(f"{APP_PREFIX}/")
@app.get(APP_PREFIX or "/")
def home():
    return render_template("index.html", app_prefix=APP_PREFIX or "")


@app.get(f"{APP_PREFIX}/api/files")
def api_files():
    base = public_base()
    return jsonify([public_item(item, base) for item in load_index()])


@app.post(f"{APP_PREFIX}/api/upload")
def api_upload():
    files = request.files.getlist("files")
    if not files:
        return jsonify({"error": "هیچ فایلی ارسال نشده است."}), 400
    base = public_base()
    saved = []
    for file in files:
        if not file or not file.filename:
            continue
        item = store_upload(file)
        if item:
            saved.append(public_item(item, base))
    if not saved:
        return jsonify({"error": "فایل خالی است."}), 400
    return jsonify({"files": saved})


@app.post(f"{APP_PREFIX}/api/from-url")
def api_from_url():
    payload = request.get_json(silent=True) or {}
    url = str(payload.get("url") or "").strip()
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        return jsonify({"error": "لینک معتبر نیست."}), 400
    try:
        response = requests.get(
            url,
            timeout=FETCH_TIMEOUT,
            stream=True,
            headers={"User-Agent": "UploadVault/1.0"},
        )
        response.raise_for_status()
    except requests.RequestException:
        return jsonify({"error": "دانلود از لینک ناموفق بود."}), 400

    name = name_from_url(
        url,
        response.headers.get("Content-Type"),
        response.headers.get("Content-Disposition"),
    )
    mime = (response.headers.get("Content-Type") or "").split(";")[0].strip()
    _, dest = new_dest(name)
    total = 0
    try:
        with dest.open("wb") as out:
            for chunk in response.iter_content(chunk_size=1024 * 1024):
                if not chunk:
                    continue
                total += len(chunk)
                if total > MAX_BYTES:
                    out.close()
                    dest.unlink(missing_ok=True)
                    return jsonify({"error": "حجم فایل از حد مجاز بیشتر است."}), 413
                out.write(chunk)
    except OSError:
        dest.unlink(missing_ok=True)
        return jsonify({"error": "ذخیره فایل ناموفق بود."}), 500
    if total == 0:
        dest.unlink(missing_ok=True)
        return jsonify({"error": "لینک محتوای خالی برگرداند."}), 400
    item = store_written_file(dest, name, mime or None)
    return jsonify({"file": public_item(item, public_base())})


@app.get(f"{APP_PREFIX}/f/<token>")
def download(token: str):
    if not re.fullmatch(r"[0-9a-f]{32}", token):
        abort(404)
    item = next((row for row in load_index() if row["token"] == token), None)
    if not item:
        abort(404)
    path = UPLOAD_DIR / item["stored"]
    if not path.is_file():
        abort(404)
    inline = request.args.get("inline") == "1"
    return send_file(
        path,
        as_attachment=not inline,
        download_name=item["name"],
        mimetype=item.get("mime") or "application/octet-stream",
    )


@app.delete(f"{APP_PREFIX}/api/files/<token>")
def api_delete(token: str):
    if not re.fullmatch(r"[0-9a-f]{32}", token):
        abort(404)
    items = load_index()
    item = next((row for row in items if row["token"] == token), None)
    if not item:
        abort(404)
    remaining = [row for row in items if row["token"] != token]
    save_index(remaining)
    path = UPLOAD_DIR / item["stored"]
    if path.is_file():
        path.unlink()
    return jsonify({"ok": True})


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=int(os.environ.get("PORT", "5001")), debug=False)
