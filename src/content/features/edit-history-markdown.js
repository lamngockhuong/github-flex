// Minimal markdown-to-DOM renderer (XSS-safe, no innerHTML with user data)

export function renderMarkdown(container, text) {
  const lines = text.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.startsWith("```")) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      const pre = document.createElement("pre");
      const code = document.createElement("code");
      code.textContent = codeLines.join("\n");
      pre.appendChild(code);
      container.appendChild(pre);
      continue;
    }

    // Empty line
    if (!line.trim()) {
      i++;
      continue;
    }

    // Headers
    const headerMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headerMatch) {
      const level = Math.min(headerMatch[1].length, 6);
      const el = document.createElement(`h${level}`);
      renderInline(el, headerMatch[2]);
      container.appendChild(el);
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      const bq = document.createElement("blockquote");
      const bqLines = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        bqLines.push(lines[i].slice(2));
        i++;
      }
      renderMarkdown(bq, bqLines.join("\n"));
      container.appendChild(bq);
      continue;
    }

    // Unordered list
    if (/^[-*]\s/.test(line)) {
      const ul = document.createElement("ul");
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        const li = document.createElement("li");
        renderInline(li, lines[i].replace(/^[-*]\s+/, ""));
        ul.appendChild(li);
        i++;
      }
      container.appendChild(ul);
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const ol = document.createElement("ol");
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        const li = document.createElement("li");
        renderInline(li, lines[i].replace(/^\d+\.\s+/, ""));
        ol.appendChild(li);
        i++;
      }
      container.appendChild(ol);
      continue;
    }

    // Table
    if (line.includes("|") && lines[i + 1]?.match(/^\|?\s*-+/)) {
      container.appendChild(renderTable(lines, i));
      while (i < lines.length && lines[i]?.includes("|")) i++;
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      container.appendChild(document.createElement("hr"));
      i++;
      continue;
    }

    // Self-closing HTML tags on their own line (e.g. <br>, <hr />)
    const selfCloseMatch = line.match(/^<(\w+)\s*\/?>$/);
    if (selfCloseMatch && SAFE_TAGS.has(selfCloseMatch[1].toLowerCase())) {
      container.appendChild(
        document.createElement(selfCloseMatch[1].toLowerCase()),
      );
      i++;
      continue;
    }

    // Inline HTML tags (e.g. <h2 id="...">text</h2>)
    const htmlMatch = line.match(/^<(\w+)(\s[^>]*)?>(.+?)<\/\1>$/);
    if (htmlMatch) {
      const el = createSafeHtmlElement(
        htmlMatch[1],
        htmlMatch[2],
        htmlMatch[3],
      );
      if (el) {
        container.appendChild(el);
        i++;
        continue;
      }
    }

    // Paragraph
    const p = document.createElement("p");
    renderInline(p, line);
    container.appendChild(p);
    i++;
  }
}

const SAFE_TAGS = new Set([
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "span",
  "div",
  "em",
  "strong",
  "b",
  "i",
  "s",
  "u",
  "sub",
  "sup",
  "br",
  "hr",
  "details",
  "summary",
]);
const SAFE_ATTRS = new Set(["id", "class", "title", "name", "open"]);

function createSafeHtmlElement(tag, attrsStr, content) {
  const tagLower = tag.toLowerCase();
  if (!SAFE_TAGS.has(tagLower)) return null;

  const el = document.createElement(tagLower);

  if (attrsStr) {
    for (const m of attrsStr.matchAll(/(\w+)="([^"]*)"/g)) {
      if (SAFE_ATTRS.has(m[1].toLowerCase())) {
        el.setAttribute(m[1], m[2]);
      }
    }
  }

  renderInline(el, content);
  return el;
}

function renderTable(lines, start) {
  const table = document.createElement("table");
  const headerCells = parseTableRow(lines[start]);
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  for (const cell of headerCells) {
    const th = document.createElement("th");
    renderInline(th, cell);
    headerRow.appendChild(th);
  }
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  for (let i = start + 2; i < lines.length && lines[i]?.includes("|"); i++) {
    const cells = parseTableRow(lines[i]);
    const tr = document.createElement("tr");
    for (const cell of cells) {
      const td = document.createElement("td");
      renderInline(td, cell);
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  return table;
}

function parseTableRow(line) {
  return line
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((c) => c.trim());
}

function stripBackslashEscapes(str) {
  return str.replace(/\\([\\`*_{}[\]()#+\-.!~|>])/g, "$1");
}

function renderInline(el, text) {
  const tokens = tokenizeInline(text);
  for (const token of tokens) {
    if (token.type === "text") {
      const cleaned = stripBackslashEscapes(token.value);
      const brParts = cleaned.split(/<br\s*\/?>/gi);
      for (let j = 0; j < brParts.length; j++) {
        if (j > 0) el.appendChild(document.createElement("br"));
        if (brParts[j]) {
          el.appendChild(document.createTextNode(brParts[j]));
        }
      }
    } else if (token.tag === "img") {
      const img = document.createElement("img");
      img.src = token.src;
      img.alt = token.value || "";
      img.style.maxWidth = "100%";
      el.appendChild(img);
    } else {
      const span = document.createElement(token.tag);
      if (token.href) span.href = token.href;
      span.textContent = token.value;
      el.appendChild(span);
    }
  }
}

const INLINE_RULES = [
  { pattern: /`([^`]+)`/g, tag: "code", group: 1 },
  { pattern: /\*\*([^*]+)\*\*/g, tag: "strong", group: 1 },
  { pattern: /\*([^*]+)\*/g, tag: "em", group: 1 },
  { pattern: /~~([^~]+)~~/g, tag: "s", group: 1 },
  {
    pattern: /!\[([^\]]*)]\(([^)]+)\)/g,
    tag: "img",
    group: 1,
    srcGroup: 2,
  },
  {
    pattern: /\[([^\]]+)]\(([^)]+)\)/g,
    tag: "a",
    group: 1,
    hrefGroup: 2,
  },
];

function tokenizeInline(text) {
  const tokens = [];
  let remaining = text;

  while (remaining.length > 0) {
    let earliest = null;
    let earliestIndex = remaining.length;
    let earliestRule = null;

    for (const rule of INLINE_RULES) {
      rule.pattern.lastIndex = 0;
      const match = rule.pattern.exec(remaining);
      if (match && match.index < earliestIndex) {
        earliest = match;
        earliestIndex = match.index;
        earliestRule = rule;
      }
    }

    if (!earliest) {
      tokens.push({ type: "text", value: remaining });
      break;
    }

    if (earliestIndex > 0) {
      tokens.push({ type: "text", value: remaining.slice(0, earliestIndex) });
    }

    tokens.push({
      type: "inline",
      tag: earliestRule.tag,
      value: earliest[earliestRule.group],
      href: earliestRule.hrefGroup ? earliest[earliestRule.hrefGroup] : null,
      src: earliestRule.srcGroup ? earliest[earliestRule.srcGroup] : null,
    });

    remaining = remaining.slice(earliestIndex + earliest[0].length);
  }

  return tokens;
}
