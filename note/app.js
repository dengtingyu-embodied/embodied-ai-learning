const NOTE_DATA_URL = "./data/notes.json";
const PENDING_CATEGORY = "待定";

const fallbackNotes = [
  {
    id: "fallback-dex-net",
    title: "Dex-Net: A Cloud-Based Network of 3D Objects for Robust Grasp Planning",
    authors: "Mahler et al.",
    year: "2017",
    venue: "ICRA",
    category: "基础方法",
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
  query: ""
};

const els = {
  statusText: document.querySelector("#statusText"),
  searchInput: document.querySelector("#searchInput"),
  paperCount: document.querySelector("#paperCount"),
  paperList: document.querySelector("#paperList"),
  emptyState: document.querySelector("#emptyState"),
  emptyTitle: document.querySelector("#emptyTitle"),
  emptyMessage: document.querySelector("#emptyMessage"),
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
    category: String(note.category || PENDING_CATEGORY).trim() || PENDING_CATEGORY,
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

function searchTerms() {
  return state.query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

function noteSearchText(note) {
  const fields = [note.title, note.authors, note.year, note.venue, note.category, note.summary, note.tags.join(" ")];
  fields.push(note.content);
  return fields.join(" ").toLowerCase();
}

function filteredNotes() {
  const terms = searchTerms();
  return state.notes.filter((note) => {
    if (!terms.length) return true;
    const haystack = noteSearchText(note);
    return terms.every((term) => haystack.includes(term));
  });
}

function render() {
  const notes = filteredNotes();
  if (notes.length && !notes.some((note) => note.id === state.activeId)) {
    state.activeId = notes[0].id;
  }

  renderList(notes);
  renderNote(notes);
}

function groupedNotes(notes) {
  const groups = new Map();
  notes.forEach((note) => {
    const category = note.category || PENDING_CATEGORY;
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push(note);
  });

  if (!state.query.trim() && !groups.has(PENDING_CATEGORY)) {
    groups.set(PENDING_CATEGORY, []);
  }

  return [...groups.entries()].sort(([a], [b]) => {
    if (a === PENDING_CATEGORY && b !== PENDING_CATEGORY) return 1;
    if (b === PENDING_CATEGORY && a !== PENDING_CATEGORY) return -1;
    return a.localeCompare(b, "zh-Hans-CN");
  });
}

function renderList(notes = filteredNotes()) {
  const groups = groupedNotes(notes);
  const query = state.query.trim();
  els.paperCount.textContent = query
    ? `找到 ${notes.length} 篇匹配笔记`
    : `${notes.length} 篇论文 · ${groups.length} 个大类`;

  if (!notes.length) {
    els.paperList.innerHTML = `<div class="list-empty">没有匹配的论文</div>`;
    return;
  }

  els.paperList.innerHTML = groups
    .map(([category, groupNotes]) => {
      const papers = groupNotes.length
        ? groupNotes.map(renderPaperCard).join("")
        : `<div class="category-empty">暂无论文</div>`;
      return `<details class="category-group"${state.query.trim() ? " open" : ""}>
        <summary>
          <span>${escapeHtml(category)}</span>
          <small>${groupNotes.length}</small>
        </summary>
        <div class="category-papers">${papers}</div>
      </details>`;
    })
    .join("");
}

function renderPaperCard(note) {
  const meta = [note.authors, note.year, note.venue].filter(Boolean).join(" · ");
  const tags = note.tags.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
  const snippet = contentMatchSnippet(note);
  return `<button class="paper-card${note.id === state.activeId ? " is-active" : ""}" type="button" data-id="${escapeHtml(note.id)}">
        <strong>${escapeHtml(note.title)}</strong>
        <small>${escapeHtml(meta || "未填写来源")}</small>
        ${snippet ? `<span class="match-snippet">正文：${escapeHtml(snippet)}</span>` : ""}
        <span class="mini-tags">${tags}</span>
      </button>`;
}

function plainText(value) {
  return String(value || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^[#>*+-]+\s*/gm, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function contentMatchSnippet(note) {
  const terms = searchTerms();
  if (!terms.length) return "";

  const content = plainText(note.content);
  const lowerContent = content.toLowerCase();
  const positions = terms.map((term) => lowerContent.indexOf(term)).filter((index) => index >= 0);
  if (!positions.length) return "";

  const matchAt = Math.min(...positions);
  const start = Math.max(0, matchAt - 32);
  const end = Math.min(content.length, matchAt + 92);
  return `${start > 0 ? "…" : ""}${content.slice(start, end)}${end < content.length ? "…" : ""}`;
}

function renderNote(visibleNotes = filteredNotes()) {
  const note = visibleNotes.find((item) => item.id === state.activeId) || visibleNotes[0] || null;
  const hasNote = Boolean(note);

  els.emptyState.hidden = hasNote;
  els.noteContent.hidden = !hasNote;
  if (!note) {
    const hasQuery = Boolean(state.query.trim());
    els.emptyTitle.textContent = hasQuery ? "没有匹配的笔记" : "还没有笔记";
    els.emptyMessage.textContent = hasQuery
      ? "换一个关键词试试，搜索范围包括标题、作者、分类、标签、摘要和正文。"
      : "把 Markdown 文件放进仓库的 notes/ 文件夹，然后 push，网站会自动更新。";
    return;
  }

  els.noteStatus.textContent = note.category || PENDING_CATEGORY;
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

  els.paperList.addEventListener("click", (event) => {
    const card = event.target.closest(".paper-card");
    if (!card) return;
    state.activeId = card.dataset.id;
    render();
  });
}

bindEvents();
loadNotes();
