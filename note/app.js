const NOTE_DATA_URL = "./data/notes.json";
const TAG_ALL = "全部";

const fallbackNotes = [
  {
    id: "fallback-dex-net",
    title: "Dex-Net: A Cloud-Based Network of 3D Objects for Robust Grasp Planning",
    authors: "Mahler et al.",
    year: "2017",
    venue: "ICRA",
    tags: ["grasping", "dex-net", "robotics"],
    status: "精读中",
    pdf: "",
    summary: "围绕大规模合成数据和鲁棒抓取评估，构建面向机器人抓取规划的数据与学习框架。",
    content: `# Dex-Net

## 核心问题
- 机器人如何在未知物体上规划稳定抓取？
- 能否用大规模合成数据降低真实标注成本？

## 方法
- 构建 3D 物体数据集与物理抓取评估。
- 用抓取质量模型预测候选抓取的成功概率。`,
    updatedAt: "2026-07-01T00:00:00.000Z"
  }
];

const state = {
  notes: [],
  activeId: "",
  query: "",
  selectedTag: TAG_ALL
};

const els = {
  statusText: document.querySelector("#statusText"),
  searchInput: document.querySelector("#searchInput"),
  tagFilters: document.querySelector("#tagFilters"),
  paperCount: document.querySelector("#paperCount"),
  paperList: document.querySelector("#paperList"),
  emptyState: document.querySelector("#emptyState"),
  noteContent: document.querySelector("#noteContent"),
  noteStatus: document.querySelector("#noteStatus"),
  noteTitle: document.querySelector("#noteTitle"),
  noteMeta: document.querySelector("#noteMeta"),
  noteSummary: document.querySelector("#noteSummary"),
  noteTags: document.querySelector("#noteTags"),
  pdfLink: document.querySelector("#pdfLink"),
  markdownBody: document.querySelector("#markdownBody")
};

function normalizeNote(note) {
  return {
    id: String(note.id || note.title || crypto.randomUUID()),
    title: String(note.title || "未命名论文").trim(),
    authors: String(note.authors || "").trim(),
    year: String(note.year || "").trim(),
    venue: String(note.venue || "").trim(),
    tags: Array.isArray(note.tags) ? note.tags.map(String).filter(Boolean) : splitTags(note.tags),
    status: ["待读", "精读中", "已读", "重点"].includes(note.status) ? note.status : "待读",
    pdf: String(note.pdf || "").trim(),
    summary: String(note.summary || "").trim(),
    content: String(note.content || "").trim(),
    updatedAt: String(note.updatedAt || note.createdAt || "")
  };
}

function splitTags(value) {
  return String(value || "")
    .split(/[,，;；]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

async function loadNotes() {
  try {
    const response = await fetch(NOTE_DATA_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    const notes = Array.isArray(payload.notes) ? payload.notes.map(normalizeNote) : [];
    if (notes.length) {
      state.notes = sortNotes(notes);
      state.activeId = state.notes[0].id;
      els.statusText.textContent = `已加载 ${notes.length} 篇笔记`;
      render();
      return;
    }
  } catch {
    state.notes = sortNotes(fallbackNotes.map(normalizeNote));
    state.activeId = state.notes[0]?.id || "";
    els.statusText.textContent = "未找到仓库笔记，显示示例";
    render();
  }
}

function sortNotes(notes) {
  return [...notes].sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
}

function activeNote() {
  return state.notes.find((note) => note.id === state.activeId) || state.notes[0] || null;
}

function allTags() {
  return [...new Set(state.notes.flatMap((note) => note.tags))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
}

function filteredNotes() {
  const query = state.query.trim().toLowerCase();
  return state.notes.filter((note) => {
    const tagOk = state.selectedTag === TAG_ALL || note.tags.includes(state.selectedTag);
    if (!tagOk) return false;
    if (!query) return true;

    const haystack = [note.title, note.authors, note.year, note.venue, note.summary, note.tags.join(" ")]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
}

function render() {
  const notes = filteredNotes();
  if (notes.length && !notes.some((note) => note.id === state.activeId)) {
    state.activeId = notes[0].id;
  }

  renderTagFilters();
  renderList(notes);
  renderNote();
}

function renderTagFilters() {
  const tags = [TAG_ALL, ...allTags()];
  els.tagFilters.innerHTML = tags
    .map((tag) => {
      const active = tag === state.selectedTag ? " is-active" : "";
      return `<button class="filter${active}" type="button" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</button>`;
    })
    .join("");
}

function renderList(notes = filteredNotes()) {
  els.paperCount.textContent = `${notes.length} / ${state.notes.length} 篇论文`;

  if (!notes.length) {
    els.paperList.innerHTML = `<div class="list-empty">没有匹配的标签或论文</div>`;
    return;
  }

  els.paperList.innerHTML = notes
    .map((note) => {
      const meta = [note.authors, note.year, note.venue].filter(Boolean).join(" · ");
      const tags = note.tags.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
      return `<button class="paper-card${note.id === state.activeId ? " is-active" : ""}" type="button" data-id="${escapeHtml(note.id)}">
        <strong>${escapeHtml(note.title)}</strong>
        <small>${escapeHtml(meta || "未填写来源")}</small>
        <span class="mini-tags">${tags}</span>
      </button>`;
    })
    .join("");
}

function renderNote() {
  const note = activeNote();
  const hasNote = Boolean(note);

  els.emptyState.hidden = hasNote;
  els.noteContent.hidden = !hasNote;
  if (!note) return;

  els.noteStatus.textContent = note.tags[0] || "论文笔记";
  els.noteTitle.textContent = note.title;
  els.noteMeta.textContent = [note.authors, note.year, note.venue].filter(Boolean).join(" · ");
  els.noteSummary.textContent = note.summary;
  els.noteSummary.hidden = !note.summary;
  els.noteTags.innerHTML = note.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
  els.markdownBody.innerHTML = renderMarkdown(note.content || "暂无正文。");

  if (note.pdf) {
    els.pdfLink.href = note.pdf;
    els.pdfLink.hidden = false;
  } else {
    els.pdfLink.hidden = true;
    els.pdfLink.href = "#";
  }
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
      html.push(inCode ? "</code></pre>" : "<pre><code>");
      inCode = !inCode;
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

function bindEvents() {
  els.searchInput.addEventListener("input", () => {
    state.query = els.searchInput.value;
    render();
  });

  els.tagFilters.addEventListener("click", (event) => {
    const button = event.target.closest(".filter");
    if (!button) return;
    state.selectedTag = button.dataset.tag || TAG_ALL;
    render();
  });

  els.paperList.addEventListener("click", (event) => {
    const card = event.target.closest(".paper-card");
    if (!card) return;
    state.activeId = card.dataset.id;
    render();
  });
}

bindEvents();
loadNotes();
