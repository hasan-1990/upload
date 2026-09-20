# 🚀 UploadVault

<div align="center">

**Modern, Lightweight & Secure Self-Hosted File Sharing Service**  
**سامانه سبک، مدرن و امن آپلود و اشتراک‌گذاری فایل**

[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.1-000000?style=flat&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[**English**](#-english) • [**فارسی**](#-فارسی)

</div>

---

<a name="-english"></a>
## 🇬🇧 English

### ✨ Key Features
- 📤 **Batch File Upload:** Upload single or multiple files seamlessly with an intuitive drag-and-drop interface.
- 🌐 **Remote URL Fetcher:** Upload files directly by providing an external HTTP/HTTPS download link.
- 🔒 **Secure Tokenized Storage:** Files are stored with unique UUID tokens, preventing filename collisions and path traversal attacks.
- 👁️ **Inline Preview & Direct Download:** Fast file previews (images, PDFs, media) in-browser or forced downloads with original filenames.
- 🗂️ **File Management:** Live search, dynamic sorting, file size formatting, and one-click file deletion.
- 🐳 **Docker & Production-Ready:** Packaged with **Gunicorn** and configured with a dedicated non-root user (`appuser`) for enhanced security.
- ⚙️ **Configurable Architecture:** Supports custom URL prefix routing (`APP_PREFIX`) and customizable file size limits (`MAX_UPLOAD_BYTES`).

### 🛠️ Tech Stack
- **Backend:** Python 3.12, Flask 3.1, Werkzeug, Requests, Gunicorn
- **Frontend:** Vanilla JavaScript (ES6+), Modern HTML5, Responsive CSS3
- **Containerization:** Docker, Docker Compose
- **Data Store:** File-based metadata index (`JSON`) with persistent storage volumes

### 🚀 Getting Started

#### Option 1: Run with Docker Compose (Recommended)
```bash
# Clone the repository
git clone https://github.com/hasan-1990/upload.git
cd upload

# Build and run containers
docker compose up -d --build
```
Access the application at: `http://localhost:5001/upload`

#### Option 2: Local Development Setup
```bash
# Clone the repository
git clone https://github.com/hasan-1990/upload.git
cd upload

# Create virtual environment & activate
python -m venv .venv
source .venv/bin/activate  # On Windows: .\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Run the app
python app.py
```

### ⚙️ Environment Variables
| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5001` | Server listening port |
| `APP_PREFIX` | `/upload` | Sub-path URL prefix (useful behind reverse proxies) |
| `MAX_UPLOAD_BYTES` | `2147483648` (2 GB) | Maximum allowed file upload size |

### 📡 REST API Reference
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/files` | Get list of all uploaded files with metadata |
| `POST` | `/api/upload` | Upload one or multiple files (`multipart/form-data`) |
| `POST` | `/api/from-url` | Download and save a file from an external URL |
| `GET` | `/f/<token>` | Download file by unique 32-character token |
| `GET` | `/f/<token>?inline=1` | Preview file directly in browser |
| `DELETE`| `/api/files/<token>` | Permanently delete file and metadata |

---

<a name="-فارسی"></a>
## 🇮🇷 فارسی

### ✨ ویژگی‌های برجسته
- 📤 **آپلود گروهی و تکی:** قابلیت آپلود همزمان چندین فایل با رابط کاربری روان کشیدن و رها کردن (Drag & Drop).
- 🌐 **آپلود مستقیم از طریق لینک (Remote URL):** امکان دانلود و ذخیره مستقیم فایل‌ها بر روی سرور تنها با وارد کردن لینک اینترنتی.
- 🔒 **ذخیره‌سازی امن با توکن‌های یکتا:** نام‌گذاری فایل‌ها با هش و شناسه‌های UUID جهت جلوگیری از تداخل نام فایل‌ها و خطرات امنیتی Directory Traversal.
- 👁️ **پیش‌نمایش آنلاین و لینک دانلود اختصاصی:** امکان مشاهده مستقیم فایل‌ها (تصاویر، PDF و فایل‌های متنی) درون مرورگر یا دانلود با نام اصلی.
- 🗂️ **مدیریت فایل‌ها:** جستجوی آنی، مرتب‌سازی داینامیک، نمایش حجم به صورت خوانا و امکان حذف آسان.
- 🐳 **آماده اجرا در محیط عملیاتی (Docker & Production):** مجهز به وب‌سرور **Gunicorn** و تنظیم‌شده با کاربر غیر-روت (`appuser`) جهت تضمین امنیت سرور.
- ⚙️ **تنظیمات منعطف:** پشتیبانی از پیشوند دلخواه آدرس (`APP_PREFIX`) مناسب برای قرارگیری پشت Reverse Proxy (مانند Nginx).

### 🛠️ تکنولوژی‌های استفاده‌شده
- **بک‌اند (Backend):** پایتون ۳.۱۲، فریم‌ورک Flask 3.1، کتابخانه‌های Werkzeug و Requests، سرور WSGI با Gunicorn
- **فرانت‌اند (Frontend):** جاوااسکریپت خالص (Vanilla ES6+)، ساختار HTML5 و استایل‌های مدرن و رسپانسیو CSS3
- **دواپس و کانتینر:** Docker و Docker Compose
- **مدیریت داده‌ها:** ذخیره‌سازی داده‌ها و متادیتا در فایل `JSON` با ولوم‌های ماندگار داکر

### 🚀 نحوه راه‌اندازی سریع

#### روش اول: اجرا با داکر کامپوز (پیشنهادی)
```bash
# دریافت پروژه
git clone https://github.com/hasan-1990/upload.git
cd upload

# بیلد و اجرای کانتینر در پس‌زمینه
docker compose up -d --build
```
سپس در مرورگر به آدرس `http://localhost:5001/upload` بروید.

#### روش دوم: راه‌اندازی دستی در محیط پایتون
```bash
# دریافت پروژه
git clone https://github.com/hasan-1990/upload.git
cd upload

# ساخت و فعال‌سازی محیط مجازی
python -m venv .venv
.\.venv\Scripts\Activate.ps1   # در لینوکس یا مک: source .venv/bin/activate

# نصب کتابخانه‌ها
pip install -r requirements.txt

# اجرای برنامه
python app.py
```

### ⚙️ متغیرهای محیطی (Environment Variables)
| متغیر | مقدار پیش‌فرض | توضیحات |
| :--- | :--- | :--- |
| `PORT` | `5001` | پورتی که سرور روی آن پاسخگو است |
| `APP_PREFIX` | `/upload` | پیشوند مسیر URL برنامه (مناسب برای Nginx) |
| `MAX_UPLOAD_BYTES` | `2147483648` (۲ گیگابایت) | حداکثر حجم مجاز برای آپلود هر فایل |

### 📡 مستندات API
| متد | روت (Endpoint) | توضیحات |
| :--- | :--- | :--- |
| `GET` | `/api/files` | دریافت فهرست کلیه فایل‌ها به همراه متادیتا و لینک‌ها |
| `POST` | `/api/upload` | ارسال و آپلود یک یا چند فایل |
| `POST` | `/api/from-url` | بارگیری و ذخیره فایل از طریق URL |
| `GET` | `/f/<token>` | دانلود فایل بر اساس توکن ۳۲ کاراکتری |
| `GET` | `/f/<token>?inline=1` | مشاهده و پیش‌نمایش مستقیم فایل در مرورگر |
| `DELETE`| `/api/files/<token>` | حذف دائمی فایل و اطلاعات آن از سرور |

---

## 🔒 امنیت (Security)
- اجرا تحت یک کاربر غیر روت (`UID: 10001`) در کانتینر لینوکس
- پالایش اسامی فایل‌های دریافتی به کمک `secure_filename`
- محافظت در برابر پر شدن حافظه موقت با استریم کردن تکه‌تکه (Chunking) فایل‌های دانلودی

---

## 📝 لایسنس (License)
این پروژه تحت مجوز [MIT License](LICENSE) منتشر شده است.
