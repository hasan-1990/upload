# 🚀 UploadVault

A sleek, lightweight, and secure self-hosted file upload and sharing service built with **Python (Flask)**, **Vanilla JS**, and **Docker**.

[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.1-000000?style=flat&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ✨ Key Features

- 📤 **Batch File Upload:** Upload single or multiple files seamlessly with an intuitive drag-and-drop interface.
- 🌐 **Remote URL Fetcher:** Upload files directly by providing an external HTTP/HTTPS download link.
- 🔒 **Secure Tokenized Storage:** Files are stored with unique UUID tokens, preventing filename collisions and path traversal attacks.
- 👁️ **Inline Preview & Direct Download:** Fast file previews (images, PDFs, media) in-browser or forced downloads with original filenames.
- 🗂️ **File Management:** Live search, dynamic sorting, file size formatting, and one-click file deletion.
- 🐳 **Docker & Production-Ready:** Packaged with **Gunicorn** and configured with a dedicated non-root user (`appuser`) for enhanced security.
- ⚙️ **Configurable Architecture:** Supports custom URL prefix routing (`APP_PREFIX`) and customizable file size limits (`MAX_UPLOAD_BYTES`).

---

## 🛠️ Tech Stack

- **Backend:** Python 3.12, Flask 3.1, Werkzeug, Requests, Gunicorn
- **Frontend:** Vanilla JavaScript (ES6+), Modern HTML5, Responsive CSS3
- **Containerization:** Docker, Docker Compose
- **Data Store:** File-based metadata index (`JSON`) with persistent storage volumes

---

## 🚀 Getting Started

### Option 1: Run with Docker Compose (Recommended)

The easiest and fastest way to deploy UploadVault in production:

```bash
# Clone the repository
git clone https://github.com/hasan-1990/upload.git
cd upload

# Build and start the container
docker compose up -d --build
```

The application will be accessible at: `http://localhost:5001/upload` (or configured port/prefix).

---

### Option 2: Local Development Setup

Ensure you have **Python 3.10+** installed on your system.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/hasan-1990/upload.git
   cd upload
   ```

2. **Create and activate a virtual environment:**
   ```bash
   # Windows (PowerShell)
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1

   # Linux / macOS
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application:**
   ```bash
   python app.py
   ```

5. Open your browser and navigate to `http://127.0.0.1:5001/upload`.

---

## ⚙️ Environment Variables

You can configure the behavior of the application using the following environment variables:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5001` | The network port the server listens on |
| `APP_PREFIX` | `/upload` | Sub-path URL prefix (useful behind reverse proxies like NGINX / Caddy) |
| `MAX_UPLOAD_BYTES` | `2147483648` (2 GB) | Maximum allowed file upload size in bytes |

---

## 📡 REST API Reference

UploadVault comes with a clean RESTful API:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/files` | Retrieve list of all uploaded files with metadata and links |
| `POST` | `/api/upload` | Upload one or multiple files (`multipart/form-data`) |
| `POST` | `/api/from-url` | Download and store a file from an external URL (`{"url": "..."}`) |
| `GET` | `/f/<token>` | Download file by unique 32-character token |
| `GET` | `/f/<token>?inline=1` | Preview file directly in browser |
| `DELETE`| `/api/files/<token>` | Permanently delete file and metadata |

---

## 🔒 Security Practices

- **Non-Root Execution:** Docker image creates and switches to a dedicated unprivileged user (`UID: 10001`).
- **Filename Sanitization:** All incoming filenames are sanitized using Werkzeug's `secure_filename`.
- **Token Obfuscation:** Stored files are prefixed with cryptographic 128-bit UUIDs to prevent unauthorized enumeration.
- **Resource Constraints:** Stream-based chunk processing with strict size bounds to avoid server memory exhaustion.

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).
