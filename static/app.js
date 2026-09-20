const APP_BASE = window.APP_BASE || "";
const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");
const urlForm = document.getElementById("urlForm");
const urlInput = document.getElementById("urlInput");
const statusEl = document.getElementById("status");
const toastEl = document.getElementById("toast");
let toastTimer = null;
const listEl = document.getElementById("list");
const countEl = document.getElementById("count");
const progressWrap = document.getElementById("progressWrap");
const progressBar = document.getElementById("progressBar");
const progressPct = document.getElementById("progressPct");
const progressSpeed = document.getElementById("progressSpeed");
const progressBytes = document.getElementById("progressBytes");
const modal = document.getElementById("deleteModal");
const modalName = document.getElementById("deleteModalName");
const modalCancel = document.getElementById("deleteCancel");
const modalConfirm = document.getElementById("deleteConfirm");
let pendingDelete = null;

function toFaDigits(value) {
  return String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);
}

function setStatus(text, isError = false) {
  statusEl.hidden = !text;
  statusEl.textContent = text;
  statusEl.classList.toggle("err", isError);
}

function showCopiedToast() {
  toastEl.hidden = false;
  toastEl.textContent = "لینک کپی شد";
  setStatus("لینک کپی شد.");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.hidden = true;
  }, 2500);
}

function copyText(text) {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.top = "0";
  area.style.left = "0";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.focus();
  area.select();
  area.setSelectionRange(0, area.value.length);
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch (_) {
    ok = false;
  }
  document.body.removeChild(area);
  return ok;
}

function copyLink(text) {
  if (!text) {
    setStatus("لینک خالی است.", true);
    return;
  }
  const done = () => showCopiedToast();
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(done, () => {
      copyText(text);
      done();
    });
    return;
  }
  copyText(text);
  done();
}

async function loadFiles() {
  const res = await fetch(`${APP_BASE}/api/files`);
  const files = await res.json();
  countEl.textContent = `${toFaDigits(files.length)} مورد`;
  if (!files.length) {
    listEl.innerHTML = `<article class="row"><p class="dim">هنوز فایلی نیست.</p></article>`;
    return;
  }
  listEl.innerHTML = files
    .map(
      (f) => `
      <article class="row">
        <div class="meta">
          <p class="name">${escapeHtml(f.name)}</p>
          <p class="dim">${escapeHtml(f.size_label)} · ${escapeHtml(f.mime)}</p>
        </div>
        <div class="actions">
          <a class="btn" href="${f.download_url}">دانلود</a>
          <button class="btn ghost" data-copy="${f.download_url}">کپی لینک</button>
          <button class="btn danger" data-del="${f.token}" data-name="${escapeHtml(f.name)}">حذف</button>
        </div>
        <div class="link-row">
          <input class="copy-input" readonly value="${f.download_url}" />
        </div>
      </article>`
    )
    .join("");
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatBytes(n) {
  const units = ["B", "KB", "MB", "GB"];
  let size = Math.max(0, n);
  let i = 0;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i += 1;
  }
  const value = i === 0 ? String(Math.round(size)) : size.toFixed(1);
  return `${toFaDigits(value)} ${units[i]}`;
}

function resetProgress() {
  progressBar.style.width = "0";
  progressPct.textContent = `${toFaDigits(0)}٪`;
  progressSpeed.textContent = `${toFaDigits(0)} KB/s`;
  progressBytes.textContent = `${formatBytes(0)} / ${formatBytes(0)}`;
}

function uploadFiles(files) {
  if (!files.length) return;
  const body = new FormData();
  for (const file of files) body.append("files", file);
  const xhr = new XMLHttpRequest();
  xhr.open("POST", `${APP_BASE}/api/upload`);
  progressWrap.hidden = false;
  resetProgress();
  let lastLoaded = 0;
  let lastAt = performance.now();
  let emaBps = 0;
  xhr.upload.onprogress = (e) => {
    if (!e.lengthComputable) return;
    const now = performance.now();
    const dt = (now - lastAt) / 1000;
    const pct = Math.min(100, Math.round((e.loaded / e.total) * 100));
    progressBar.style.width = `${pct}%`;
    progressPct.textContent = `${toFaDigits(pct)}٪`;
    progressBytes.textContent = `${formatBytes(e.loaded)} / ${formatBytes(e.total)}`;
    if (dt >= 0.12) {
      const instant = (e.loaded - lastLoaded) / dt;
      emaBps = emaBps === 0 ? instant : emaBps * 0.7 + instant * 0.3;
      progressSpeed.textContent = `${formatBytes(emaBps)}/s`;
      lastLoaded = e.loaded;
      lastAt = now;
    }
  };
  xhr.onload = async () => {
    progressBar.style.width = "100%";
    progressPct.textContent = `${toFaDigits(100)}٪`;
    if (xhr.status >= 200 && xhr.status < 300) {
      setStatus("آپلود انجام شد.");
      await loadFiles();
      setTimeout(() => {
        progressWrap.hidden = true;
        resetProgress();
      }, 700);
    } else {
      progressWrap.hidden = true;
      resetProgress();
      let msg = "آپلود ناموفق بود.";
      try {
        msg = JSON.parse(xhr.responseText).error || msg;
      } catch (_) {}
      setStatus(msg, true);
    }
  };
  xhr.onerror = () => {
    progressWrap.hidden = true;
    resetProgress();
    setStatus("ارتباط با سرور قطع شد.", true);
  };
  xhr.send(body);
}

dropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropzone.classList.add("drag");
});
dropzone.addEventListener("dragleave", () => dropzone.classList.remove("drag"));
dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropzone.classList.remove("drag");
  uploadFiles([...e.dataTransfer.files]);
});
fileInput.addEventListener("change", () => {
  uploadFiles([...fileInput.files]);
  fileInput.value = "";
});

urlForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  setStatus("در حال دریافت از لینک...");
  const res = await fetch(`${APP_BASE}/api/from-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: urlInput.value.trim() }),
  });
  const data = await res.json();
  if (!res.ok) {
    setStatus(data.error || "خطا", true);
    return;
  }
  urlInput.value = "";
  setStatus("فایل از لینک ذخیره شد.");
  await loadFiles();
});

listEl.addEventListener("click", (e) => {
  const copyBtn = e.target.closest("[data-copy]");
  if (copyBtn) {
    const row = copyBtn.closest(".row");
    const field = row ? row.querySelector(".copy-input") : null;
    copyLink((field && field.value) || copyBtn.dataset.copy);
    return;
  }
  const delBtn = e.target.closest("[data-del]");
  if (!delBtn) return;
  pendingDelete = { token: delBtn.dataset.del, name: delBtn.dataset.name || "این فایل" };
  modalName.textContent = pendingDelete.name;
  modal.hidden = false;
  document.body.style.overflow = "hidden";
});

function closeModal() {
  pendingDelete = null;
  modal.hidden = true;
  document.body.style.overflow = "";
}

modalCancel.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modal.hidden) closeModal();
});

modalConfirm.addEventListener("click", async () => {
  if (!pendingDelete) return;
  const token = pendingDelete.token;
  modalConfirm.disabled = true;
  const res = await fetch(`${APP_BASE}/api/files/${token}`, { method: "DELETE" });
  modalConfirm.disabled = false;
  closeModal();
  if (!res.ok) {
    setStatus("حذف ناموفق بود.", true);
    return;
  }
  setStatus("فایل حذف شد.");
  await loadFiles();
});

loadFiles();
