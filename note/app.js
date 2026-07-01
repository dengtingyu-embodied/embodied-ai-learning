const STORAGE_KEY = "embodied-paper-notes-v1";

const templateContent = `## 核心问题
- 

## 方法
- 

## 实验与结论
- 

## 我的理解
- 

## 可追踪问题
- `;

const seedNotes = [
  {
    id: "seed-dex-net",
    title: "Dex-Net: A Cloud-Based Network of 3D Objects for Robust Grasp Planning",
    authors: "Mahler et al.",
    year: "2017",
    venue: "ICRA",
    tags: ["grasping", "dex-net", "robotics"],
    status: "精读中",
    pdf: "../test/pdf2zh-output/Dex-Net.no_watermark.zh.mono.pdf",
    summary: "围绕大规模合成数据和鲁棒抓取评估，构建面向机器人抓取规划的数据与学习框架。",
    content: `## 核心问题
- 机器人如何在未知物体上规划稳定抓取？
- 能否用大规模合成数据降低真实标注成本？

## 方法
- 构建 3D 物体数据集与物理抓取评估。
- 用抓取质量模型预测候选抓取的成功概率。

## 我想继续看
- 抓取质量标签如何生成。
- 与后续 Dex-Net 2.0 / GQ-CNN 的关系。`,
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z"
  },
  {
    id: "seed-graspnet",
    title: "GraspNet-1Billion: A Large-Scale Benchmark for General Object Grasping",
    authors: "Fang et al.",
    year: "2020",
    venue: "CVPR",
    tags: ["grasping", "benchmark", "dataset"],
    status: "待读",
    pdf: "../test/pdf2zh-output/GraspNet.no_watermark.zh.mono.pdf",
    summary: "提出面向通用物体抓取的大规模数据集、评价标准与基准任务。",
    content: templateContent,
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z"
  }
];

let state = {
  notes: [],
  activeId: "",
  filter: "全部",
  query: "",
  mode: "edit"
};

const els = {
  statusText: document.querySelector("#statusText"),
  importBtn: document.querySelector("#importBtn"),
  newBtn: document.querySelector("#newBtn"),
  exportAllBtn: document.querySelector("#exportAllBtn"),
  fileInput: document.querySelector("#fileInput"),
  searchInput: document.querySelector("#searchInput"),
  paperCount: document.querySelector("#paperCount"),
  paperList: document.querySelector("#paperList"),
  noteForm: document.querySelector("#noteForm"),
  titleInput: document.querySelector("#titleInput"),
  authorsInput: document.querySelector("#authorsInput"),
  yearInput: document.querySelector("#yearInput"),
  venueInput: document.querySelector("#venueInput"),
  tagsInput: document.querySelector("#tagsInput"),
  statusInput: document.querySelector("#statusInput"),
  pdfInput: document.querySelector("#pdfInput"),
  summaryInput: document.querySelector("#summaryInput"),
  contentInput: document.querySelector("#contentInput"),
  editTab: document.querySelector("#editTab"),
  previewTab: document.querySelector("#previewTab"),
  preview: document.querySelector("#preview"),
  pdfLink: document.querySelector("#pdfLink"),
  exportMdBtn: document.querySelector("#exportMdBtn"),
  deleteBtn: document.querySelector("#deleteBtn")
};

function nowIso() {
  return new Date().toISOString();
}

function uid() {
  return `note-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    state.notes = clone(seedNotes);
    state.activeId = state.notes[0]?.id || "";
    persist("已载入示例笔记");
    return;
  }

  try {
    const parsed = JSON.parse(saved);
    state.notes = Array.isArray(parsed.notes) ? parsed.notes : [];
    state.activeId = parsed.activeId || state.notes[0]?.id || "";
  } catch {
    state.notes = clone(seedNotes);
    state.activeId = state.notes[0]?.id || "";
  }
}

function persist(message = "已自动保存") {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      notes: state.notes,
      activeId: state.activeId
    })
  );
  els.statusText.textContent = message;
}

function activeNote() {
  return state.notes.find((note) => note.id === state.activeId) || state.notes[0] || null;
}

function normalizeNote(note) {
  const normalized = {
    id: note.id || uid(),
    title: String(note.title || "未命名论文").trim(),
    authors: String(note.authors || "").trim(),
    year: String(note.year || "").trim(),
    venue: String(note.venue || "").trim(),
    tags: Array.isArray(note.tags) ? note.tags : splitTags(note.tags || ""),
    status: ["待读", "精读中", "已读", "重点"].includes(note.status) ? note.status : "待读",
    pdf: String(note.pdf || "").trim(),
    summary: String(note.summary || "").trim(),
    content: String(note.content || templateContent).trim(),
    createdAt: note.createdAt || nowIso(),
    updatedAt: note.updatedAt || nowIso()
  };
  if (!normalized.title) normalized.title = "未命名论文";
  return normalized;
}

function splitTags(value) {
  return String(value)
    .split(/[,，;；]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function noteMatches(note) {
  const query = state.query.trim().toLowerCase();
  const filterOk = state.filter === "全部" || note.status === state.filter;
  if (!query) return filterOk;
  const haystack = [note.title, note.authors, note.year, note.venue, note.summary, note.tags.join(" ")]
    .join(" ")
    .toLowerCase();
  return filterOk && haystack.includes(query);
}

function renderList() {
  const notes = state.notes.filter(noteMatches).sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  els.paperCount.textContent = `${notes.length} / ${state.notes.length} 篇论文`;

  if (!notes.length) {
    els.paperList.innerHTML = `<div class="empty">没有匹配的笔记</div>`;
    return;
  }

  els.paperList.innerHTML = notes
    .map((note) => {
      const meta = [note.authors, note.year, note.venue].filter(Boolean).join(" · ");
      const tags = note.tags.slice(0, 4).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");
      return `<button class="paper-card${note.id === state.activeId ? " is-active" : ""}" type="button" data-id="${note.id}">
        <p class="paper-title">${escapeHtml(note.title)}</p>
        <p class="paper-meta">${escapeHtml(meta || "未填写作者与出处")}</p>
        <div class="tag-row"><span class="status-pill">${escapeHtml(note.status)}</span>${tags}</div>
      </button>`;
    })
    .join("");
}

function renderForm() {
  const note = activeNote();
  const disabled = !note;
  els.noteForm.querySelectorAll("input, select, textarea, button").forEach((control) => {
    if (!["importBtn", "newBtn"].includes(control.id)) control.disabled = disabled;
  });

  if (!note) {
    els.titleInput.value = "";
    els.authorsInput.value = "";
    els.yearInput.value = "";
    els.venueInput.value = "";
    els.tagsInput.value = "";
    els.statusInput.value = "待读";
    els.pdfInput.value = "";
    els.summaryInput.value = "";
    els.contentInput.value = "";
    els.preview.innerHTML = "";
    updatePdfLink("");
    return;
  }

  els.titleInput.value = note.title;
  els.authorsInput.value = note.authors;
  els.yearInput.value = note.year;
  els.venueInput.value = note.venue;
  els.tagsInput.value = note.tags.join(", ");
  els.statusInput.value = note.status;
  els.pdfInput.value = note.pdf;
  els.summaryInput.value = note.summary;
  els.contentInput.value = note.content;
  els.preview.innerHTML = renderMarkdown(note.content);
  updatePdfLink(note.pdf);
  applyMode();
}

function updatePdfLink(pdf) {
  if (pdf) {
    els.pdfLink.href = pdf;
    els.pdfLink.classList.remove("is-disabled");
  } else {
    els.pdfLink.href = "#";
    els.pdfLink.classList.add("is-disabled");
  }
}

function updateFromForm() {
  const note = activeNote();
  if (!note) return;

  note.title = els.titleInput.value.trim() || "未命名论文";
  note.authors = els.authorsInput.value.trim();
  note.year = els.yearInput.value.trim();
  note.venue = els.venueInput.value.trim();
  note.tags = splitTags(els.tagsInput.value);
  note.status = els.statusInput.value;
  note.pdf = els.pdfInput.value.trim();
  note.summary = els.summaryInput.value.trim();
  note.content = els.contentInput.value.trim();
  note.updatedAt = nowIso();

  els.preview.innerHTML = renderMarkdown(note.content);
  updatePdfLink(note.pdf);
  persist();
  renderList();
}

function createNote() {
  const note = normalizeNote({
    title: "新论文笔记",
    status: "待读",
    content: templateContent
  });
  state.notes.unshift(note);
  state.activeId = note.id;
  state.mode = "edit";
  persist("已新建笔记");
  render();
  els.titleInput.focus();
  els.titleInput.select();
}

function deleteActive() {
  const note = activeNote();
  if (!note) return;
  const ok = window.confirm(`删除《${note.title}》？`);
  if (!ok) return;
  state.notes = state.notes.filter((item) => item.id !== note.id);
  state.activeId = state.notes[0]?.id || "";
  persist("已删除笔记");
  render();
}

async function importFiles(files) {
  const imported = [];
  for (const file of files) {
    const text = await file.text();
    if (file.name.toLowerCase().endsWith(".json")) {
      imported.push(...parseJsonNotes(text));
    } else {
      imported.push(parseMarkdownNote(text, file.name));
    }
  }

  const normalized = imported.filter(Boolean).map(normalizeNote);
  if (!normalized.length) {
    els.statusText.textContent = "没有可导入的笔记";
    return;
  }

  state.notes = [...normalized, ...state.notes];
  state.activeId = normalized[0].id;
  persist(`已导入 ${normalized.length} 篇笔记`);
  render();
}

function parseJsonNotes(text) {
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed.notes)) return parsed.notes;
    if (parsed.title || parsed.content) return [parsed];
  } catch {
    return [];
  }
  return [];
}

function parseMarkdownNote(text, filename) {
  const { meta, body } = extractFrontmatter(text);
  const firstTitle = body.match(/^#\s+(.+)$/m)?.[1]?.trim();
  const titleFromFile = filename.replace(/\.(md|markdown)$/i, "").replace(/[-_]/g, " ");
  return {
    title: meta.title || firstTitle || titleFromFile,
    authors: meta.authors || meta.author || "",
    year: meta.year || "",
    venue: meta.venue || "",
    tags: splitTags(meta.tags || ""),
    status: meta.status || "待读",
    pdf: meta.pdf || "",
    summary: meta.summary || "",
    content: body.trim() || templateContent
  };
}

function extractFrontmatter(text) {
  const match = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!match) return { meta: {}, body: text };

  const meta = {};
  match[1].split(/\r?\n/).forEach((line) => {
    const pair = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!pair) return;
    meta[pair[1].trim()] = pair[2].trim().replace(/^["']|["']$/g, "");
  });
  return { meta, body: text.slice(match[0].length) };
}

function exportAll() {
  download(
    "embodied-paper-notes.json",
    JSON.stringify({ notes: state.notes }, null, 2),
    "application/json;charset=utf-8"
  );
  els.statusText.textContent = "已导出全部笔记";
}

function exportCurrentMarkdown() {
  const note = activeNote();
  if (!note) return;
  download(`${slugify(note.title)}.md`, toMarkdown(note), "text/markdown;charset=utf-8");
  els.statusText.textContent = "已导出当前笔记";
}

function toMarkdown(note) {
  const frontmatter = [
    "---",
    `title: "${note.title.replaceAll('"', '\\"')}"`,
    `authors: "${note.authors.replaceAll('"', '\\"')}"`,
    `year: "${note.year}"`,
    `venue: "${note.venue.replaceAll('"', '\\"')}"`,
    `tags: "${note.tags.join(", ")}"`,
    `status: "${note.status}"`,
    `pdf: "${note.pdf.replaceAll('"', '\\"')}"`,
    `summary: "${note.summary.replaceAll('"', '\\"')}"`,
    "---"
  ].join("\n");
  return `${frontmatter}\n\n# ${note.title}\n\n${note.content}\n`;
}

function download(filename, text, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function slugify(value) {
  return value
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80) || "paper-note";
}

function renderMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/);
  const html = [];
  let inUl = false;
  let inOl = false;
  let inCode = false;

  const closeLists = () => {
    if (inUl) {
      html.push("</ul>");
      inUl = false;
    }
    if (inOl) {
      html.push("</ol>");
      inOl = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (line.startsWith("```")) {
      closeLists();
      if (inCode) {
        html.push("</code></pre>");
        inCode = false;
      } else {
        html.push("<pre><code>");
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      html.push(`${escapeHtml(rawLine)}\n`);
      continue;
    }

    if (!line.trim()) {
      closeLists();
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      closeLists();
      const level = heading[1].length;
      html.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      continue;
    }

    const bullet = line.match(/^[-*]\s+(.+)$/);
    if (bullet) {
      if (inOl) {
        html.push("</ol>");
        inOl = false;
      }
      if (!inUl) {
        html.push("<ul>");
        inUl = true;
      }
      html.push(`<li>${renderInline(bullet[1])}</li>`);
      continue;
    }

    const ordered = line.match(/^\d+\.\s+(.+)$/);
    if (ordered) {
      if (inUl) {
        html.push("</ul>");
        inUl = false;
      }
      if (!inOl) {
        html.push("<ol>");
        inOl = true;
      }
      html.push(`<li>${renderInline(ordered[1])}</li>`);
      continue;
    }

    closeLists();
    html.push(`<p>${renderInline(line)}</p>`);
  }

  closeLists();
  if (inCode) html.push("</code></pre>");
  return html.join("");
}

function renderInline(value) {
  return escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function applyMode() {
  const preview = state.mode === "preview";
  els.contentInput.hidden = preview;
  els.preview.hidden = !preview;
  els.editTab.classList.toggle("is-active", !preview);
  els.previewTab.classList.toggle("is-active", preview);
}

function render() {
  renderList();
  renderForm();
}

function bindEvents() {
  els.importBtn.addEventListener("click", () => els.fileInput.click());
  els.fileInput.addEventListener("change", (event) => {
    importFiles([...event.target.files]);
    event.target.value = "";
  });
  els.newBtn.addEventListener("click", createNote);
  els.exportAllBtn.addEventListener("click", exportAll);
  els.exportMdBtn.addEventListener("click", exportCurrentMarkdown);
  els.deleteBtn.addEventListener("click", deleteActive);

  els.searchInput.addEventListener("input", () => {
    state.query = els.searchInput.value;
    renderList();
  });

  document.querySelectorAll(".filter").forEach((button) => {
    button.addEventListener("click", () => {
      state.filter = button.dataset.filter;
      document.querySelectorAll(".filter").forEach((item) => {
        item.classList.toggle("is-active", item === button);
      });
      renderList();
    });
  });

  els.paperList.addEventListener("click", (event) => {
    const card = event.target.closest(".paper-card");
    if (!card) return;
    state.activeId = card.dataset.id;
    persist();
    render();
  });

  els.noteForm.addEventListener("input", updateFromForm);
  els.statusInput.addEventListener("change", updateFromForm);

  els.editTab.addEventListener("click", () => {
    state.mode = "edit";
    applyMode();
  });
  els.previewTab.addEventListener("click", () => {
    state.mode = "preview";
    els.preview.innerHTML = renderMarkdown(els.contentInput.value);
    applyMode();
  });
}

loadState();
bindEvents();
render();
