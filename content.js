(function () {
  "use strict";

  const STORAGE_KEY = "xr_recent";
  const CUSTOM_CMDS_KEY = "xr_custom_cmds";
  const FAVS_KEY = "xr_favs";
  const MAX_RECENT = 6;

  let _xr_filling = false;

  // ─── Theme ──────────────────────────────────────────────────

  function getTheme() {
    const saved = localStorage.getItem("xr_theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  function setTheme(theme) {
    localStorage.setItem("xr_theme", theme);
    document.documentElement.dataset.xrTheme = theme;
  }

  function toggleTheme() {
    const current = document.documentElement.dataset.xrTheme || "dark";
    const next = current === "dark" ? "light" : "dark";
    setTheme(next);
    return next;
  }

  // ─── Utilities ───────────────────────────────────────────────

  function getRecent() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function addRecent(cmdObj) {
    const recent = getRecent().filter((c) => c.cmd !== cmdObj.cmd);
    recent.unshift(cmdObj);
    if (recent.length > MAX_RECENT) recent.pop();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
  }

  function setInputText(text) {
    const input = document.querySelector(
      '.input-message-input[contenteditable="true"]'
    );
    if (!input) return false;
    input.focus();
    _xr_filling = true;
    document.execCommand("selectAll", false, null);
    document.execCommand("insertText", false, text);
    setTimeout(() => { _xr_filling = false; }, 250);
    return true;
  }

  function showToast(msg, duration) {
    duration = duration || 1600;
    let toast = document.querySelector(".xr-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "xr-toast";
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add("xr-show");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove("xr-show"), duration);
  }

  function debounce(fn, ms) {
    let timer;
    return function () {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, arguments), ms);
    };
  }

  function escapeHtml(str) {
    if (!str) return "";
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  // ─── Custom Commands Storage ─────────────────────────────────

  function getCustomCommands() {
    try {
      return JSON.parse(localStorage.getItem(CUSTOM_CMDS_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveCustomCommands(cmds) {
    localStorage.setItem(CUSTOM_CMDS_KEY, JSON.stringify(cmds));
  }

  function addCustomCommand(cmdData) {
    const cmds = getCustomCommands();
    cmds.push(Object.assign({}, cmdData, {
      _custom: true,
      _id: Date.now() + "_" + Math.random().toString(36).slice(2, 6)
    }));
    saveCustomCommands(cmds);
    return cmds;
  }

  function updateCustomCommand(id, data) {
    const cmds = getCustomCommands();
    const idx = cmds.findIndex((c) => c._id === id);
    if (idx !== -1) {
      cmds[idx] = Object.assign({}, cmds[idx], data);
      saveCustomCommands(cmds);
    }
    return cmds;
  }

  function deleteCustomCommand(id) {
    let cmds = getCustomCommands();
    cmds = cmds.filter((c) => c._id !== id);
    saveCustomCommands(cmds);
    return cmds;
  }

  function getCustomCategories() {
    try {
      return JSON.parse(localStorage.getItem("xr_custom_cats")) || [];
    } catch {
      return [];
    }
  }

  function saveCustomCategories(cats) {
    localStorage.setItem("xr_custom_cats", JSON.stringify(cats));
  }

  // ─── Favorites Storage ───────────────────────────────────────

  function getFavorites() {
    try {
      return JSON.parse(localStorage.getItem(FAVS_KEY)) || [];
    } catch {
      return [];
    }
  }

  function toggleFavorite(cmdStr) {
    const favs = getFavorites();
    const idx = favs.indexOf(cmdStr);
    if (idx !== -1) {
      favs.splice(idx, 1);
    } else {
      favs.push(cmdStr);
    }
    localStorage.setItem(FAVS_KEY, JSON.stringify(favs));
    return idx === -1; // true = now favorited
  }

  function isFavorite(cmdStr) {
    return getFavorites().indexOf(cmdStr) !== -1;
  }

  // ─── Merged categories ───────────────────────────────────────

  function getMergedCategories() {
    const customCmds = getCustomCommands();
    const customCats = getCustomCategories();

    const merged = COMMAND_CATEGORIES.map((cat) => ({
      name: cat.name,
      icon: cat.icon,
      commands: cat.commands.concat(
        customCmds.filter((c) => c._category === cat.name)
      )
    }));

    for (const cc of customCats) {
      const catCmds = customCmds.filter((c) => c._category === cc.name);
      merged.push({ name: cc.name, icon: cc.icon, commands: catCmds });
    }

    return merged;
  }

  function getAllCommands() {
    const cats = getMergedCategories();
    const all = [];
    for (const cat of cats) {
      for (const c of cat.commands) {
        all.push(c);
      }
    }
    return all;
  }

  // ─── Build command item ──────────────────────────────────────

  function buildCmdItem(c, isRecent) {
    const isFaved = isFavorite(c.cmd);
    const favBtn = `<span class="xr-cmd-fav" data-fav="${isFaved ? "1" : "0"}">${isFaved ? "★" : "☆"}</span>`;
    const replyIcon = c.reply
      ? '<span class="xr-reply-icon" title="需回复消息使用">↩</span>'
      : "";
    const noteHtml = c.note
      ? `<span class="xr-cmd-note">${escapeHtml(c.note)}</span>`
      : "";
    const editHint = c._custom
      ? '<span class="xr-cmd-edit-hint">✎</span>'
      : "";
    const idAttr = c._id ? ` data-id="${c._id}"` : "";
    return (
      `<div class="xr-cmd-item${isRecent ? " xr-recent-item" : ""}${isFaved ? " xr-faved" : ""}"` +
      ` data-cmd="${escapeHtml(c.cmd)}" data-params="${escapeHtml(c.params || "")}"` +
      ` data-reply="${c.reply || false}"${idAttr}>` +
      '<div class="xr-cmd-row">' +
      favBtn +
      replyIcon +
      `<span class="xr-cmd-name">${escapeHtml(c.cmd)}</span>` +
      `<span class="xr-cmd-desc">${escapeHtml(c.desc || "")}</span>` +
      (c.params
        ? `<span class="xr-cmd-params">${escapeHtml(c.params.trim())}</span>`
        : "") +
      "</div>" +
      noteHtml +
      editHint +
      "</div>"
    );
  }

  // ─── Search matching ─────────────────────────────────────────

  function matchCmd(c, q) {
    if (!q) return true;
    const lq = q.toLowerCase();
    if (c.cmd.toLowerCase().includes(lq)) return true;
    if (c.desc && c.desc.toLowerCase().includes(lq)) return true;
    if (c.note && c.note.toLowerCase().includes(lq)) return true;
    if (c.tags && c.tags.some((t) => t.toLowerCase().includes(lq))) return true;
    return false;
  }

  // ─── Build section: Favorites ────────────────────────────────

  function buildFavSection() {
    const favStrs = getFavorites();
    if (favStrs.length === 0) return "";
    const all = getAllCommands();
    const items = all
      .filter((c) => favStrs.indexOf(c.cmd) !== -1)
      .map((c) => buildCmdItem(c))
      .join("");
    if (!items) return "";
    return (
      '<div class="xr-fav-section">' +
      '<div class="xr-recent-title">⭐ 固定命令</div>' +
      items +
      "</div>"
    );
  }

  // ─── Build section: Recent ───────────────────────────────────

  function buildRecentSection() {
    const recent = getRecent();
    if (recent.length === 0) return "";
    const items = recent.map((c) => buildCmdItem(c, true)).join("");
    return (
      '<div class="xr-recent-section">' +
      '<div class="xr-recent-title">最近使用</div>' +
      items +
      "</div>"
    );
  }

  // ─── Build categories HTML ───────────────────────────────────

  function buildCategories(filter) {
    const q = (filter || "").toLowerCase();
    const cats = getMergedCategories();
    let html = "";
    for (let i = 0; i < cats.length; i++) {
      const cat = cats[i];
      const cmds = cat.commands.filter((c) => matchCmd(c, q));
      if (cmds.length === 0) continue;
      const items = cmds.map((c) => buildCmdItem(c)).join("");
      const expanded = q ? " xr-expanded" : "";
      html +=
        `<div class="xr-category${expanded}" data-cat="${escapeHtml(cat.name)}">` +
        '<div class="xr-category-header">' +
        `<span class="xr-category-icon">${cat.icon}</span>` +
        `<span class="xr-category-name">${escapeHtml(cat.name)}</span>` +
        `<span class="xr-cat-count">${cmds.length}</span>` +
        '<span class="xr-category-arrow">▶</span>' +
        "</div>" +
        '<div class="xr-category-commands">' + items + "</div>" +
        "</div>";
    }
    return html;
  }

  // ─── Refresh panel ───────────────────────────────────────────

  function refreshPanel() {
    const panel = document.querySelector(".xr-panel");
    if (!panel) return;
    const searchBox = panel.querySelector(".xr-search-box");
    const body = panel.querySelector(".xr-panel-body");
    const q = searchBox ? searchBox.value.trim() : "";
    body.innerHTML = buildFavSection() + buildRecentSection() + buildCategories(q);
    bindCmdClicks(body);
  }

  // ─── Params parsing ──────────────────────────────────────────

  function parseParamTokens(str, choices) {
    if (!str) return [];
    str = str.trim();

    // If explicit choices are provided, create a single choice token
    if (choices && Array.isArray(choices) && choices.length > 0) {
      const name = str.replace(/^<(.+)>$/, "$1").replace(/[<>]/g, "").trim() || "选项";
      return [{ type: "choice", name, choices: choices.slice(), raw: str }];
    }

    const parts = str.split(/\s+/);
    const tokens = [];

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      // <name>*<count> pattern
      const qm = part.match(/^<(.+?)>\*<(.+?)>$/);
      if (qm) {
        tokens.push({ type: "quantity", name: qm[1], countLabel: qm[2], raw: part });
        continue;
      }

      // <...> pattern
      const m = part.match(/^<(.+)>$/);
      if (m) {
        const content = m[1];
        // Enum or choice inside <>
        if (content.indexOf("/") > 0) {
          tokens.push({ type: "choice", name: content, choices: content.split("/"), raw: part });
        } else if (content.indexOf("-") > 0 && !/[一-鿿]/.test(content)) {
          tokens.push({ type: "choice", name: content, choices: content.split("-"), raw: part });
        } else {
          tokens.push({ type: "input", name: content, raw: part });
        }
        continue;
      }

      // @mention
      if (part.indexOf("@") === 0) {
        tokens.push({ type: "mention", name: part, raw: part });
        continue;
      }

      // Static text (keywords like 起拍价)
      tokens.push({ type: "static", value: part, raw: part });
    }

    return tokens;
  }

  function fillParams(template, values) {
    // values: [{ name, value, count? }]
    let result = template;
    for (let i = 0; i < values.length; i++) {
      const v = values[i];
      if (v.count !== undefined) {
        result = result.replace(`<${v.name}>*<${v.countLabel}>`, v.value + "*" + v.count);
      } else if (v.noBrackets) {
        // Replace raw param text without <...> (e.g., "1/2/3/4" → selected value)
        if (result.indexOf(v.raw) !== -1) {
          result = result.replace(v.raw, v.value);
        }
      } else {
        result = result.replace(`<${v.name}>`, v.value);
      }
    }
    return result;
  }

  // ─── Param Form Modal ────────────────────────────────────────

  function openParamForm(cmdObj) {
    const tokens = parseParamTokens(cmdObj.params, cmdObj.choices);
    if (tokens.length === 0) return;

    let formHtml = "";
    const fieldIds = [];

    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      const id = "xr-pf-" + i;
      fieldIds.push(id);

      if (t.type === "input") {
        formHtml +=
          '<div class="xr-form-group">' +
          `<label class="xr-form-label">${escapeHtml(t.name)}</label>` +
          `<input class="xr-form-input" id="${id}" placeholder="${escapeHtml(t.name)}" />` +
          "</div>";
      } else if (t.type === "quantity") {
        formHtml +=
          '<div class="xr-form-row">' +
          '<div class="xr-form-group">' +
          `<label class="xr-form-label">${escapeHtml(t.name)}</label>` +
          `<input class="xr-form-input" id="${id}" placeholder="${escapeHtml(t.name)}" />` +
          "</div>" +
          '<div class="xr-form-group">' +
          `<label class="xr-form-label">${escapeHtml(t.countLabel)}</label>` +
          `<input class="xr-form-input" id="${id}-count" type="number" min="1" placeholder="${escapeHtml(t.countLabel)}" />` +
          "</div>" +
          "</div>";
        fieldIds.push(id + "-count");
      } else if (t.type === "choice") {
        let optsHtml = "";
        for (let j = 0; j < t.choices.length; j++) {
          const val = t.choices[j].trim();
          optsHtml +=
            `<label class="xr-pf-opt">` +
            `<input type="radio" name="pf-${i}" value="${escapeHtml(val)}"${j === 0 ? " checked" : ""} />` +
            `<span>${escapeHtml(val)}</span>` +
            "</label>";
        }
        formHtml +=
          '<div class="xr-form-group">' +
          `<label class="xr-form-label">${escapeHtml(t.name)}</label>` +
          `<div class="xr-pf-opts" id="${id}">${optsHtml}</div>` +
          "</div>";
      } else if (t.type === "mention") {
        formHtml +=
          '<div class="xr-form-group">' +
          `<label class="xr-form-label">${escapeHtml(t.name)}</label>` +
          `<input class="xr-form-input" id="${id}" placeholder="@用户名" />` +
          "</div>";
      }
      // static tokens are handled by fillParams keeping them as-is
    }

    const overlay = document.createElement("div");
    overlay.className = "xr-modal-overlay";
    overlay.innerHTML =
      '<div class="xr-modal xr-modal-sm">' +
      '<div class="xr-modal-header">' +
      `<span class="xr-modal-title">${escapeHtml(cmdObj.cmd)}</span>` +
      '<button class="xr-modal-close">✕</button>' +
      "</div>" +
      '<div class="xr-modal-body">' +
      formHtml +
      "</div>" +
      '<div class="xr-modal-footer">' +
      '<button class="xr-btn xr-btn-ghost" id="xr-pf-cancel">取消</button>' +
      '<button class="xr-btn xr-btn-primary" id="xr-pf-confirm">确认填入</button>' +
      "</div>" +
      "</div>";

    document.body.appendChild(overlay);

    function close() {
      overlay.remove();
    }

    overlay.querySelector(".xr-modal-close").addEventListener("click", close);
    overlay.querySelector("#xr-pf-cancel").addEventListener("click", close);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });

    overlay.querySelector("#xr-pf-confirm").addEventListener("click", () => {
      const values = [];
      let valid = true;

      for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];
        if (t.type === "static") continue;

        if (t.type === "quantity") {
          const val = document.getElementById("xr-pf-" + i).value.trim();
          const count = document.getElementById("xr-pf-" + i + "-count").value.trim();
          if (val && count) {
            values.push({ name: t.name, value: val, countLabel: t.countLabel, count: count });
          } else {
            valid = false;
            showToast("请填写完整参数", 1500);
          }
        } else if (t.type === "choice") {
          const sel = document.querySelector(`input[name="pf-${i}"]:checked`);
          if (sel) {
            const hasBrackets = t.raw.indexOf("<") === 0;
            values.push({ name: t.name, value: sel.value, raw: t.raw, noBrackets: !hasBrackets });
          }
        } else {
          const el = document.getElementById("xr-pf-" + i);
          const val = el ? el.value.trim() : "";
          if (val) {
            values.push({ name: t.name, value: val });
          } else {
            valid = false;
            showToast("请填写完整参数", 1500);
          }
        }
      }

      if (!valid) return;

      const filledParams = fillParams(cmdObj.params, values);
      const fullCmd = cmdObj.cmd + filledParams;
      const success = setInputText(fullCmd);
      if (success) {
        addRecent({ cmd: cmdObj.cmd, params: cmdObj.params, desc: cmdObj.desc || "" });
        document.querySelector(".xr-panel-wrap")?.classList.remove("xr-open");
        showToast(`已填入: ${cmdObj.cmd}`);
        close();
      } else {
        showToast("未找到输入框，请先打开聊天", 2000);
      }
    });

    // Focus first input
    const firstInput = overlay.querySelector("input:not([type=radio])");
    if (firstInput) firstInput.focus();
  }

  // ─── Command click handler ───────────────────────────────────

  function bindCmdClicks(container) {
    container.querySelectorAll(".xr-cmd-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        // Edit hint for custom commands
        if (e.target.closest(".xr-cmd-edit-hint")) {
          const id = item.dataset.id;
          if (id) openEditor(id);
          return;
        }

        // Favorite toggle
        if (e.target.closest(".xr-cmd-fav")) {
          const star = e.target.closest(".xr-cmd-fav");
          const cmdStr = item.dataset.cmd;
          const nowFaved = toggleFavorite(cmdStr);
          star.textContent = nowFaved ? "★" : "☆";
          star.dataset.fav = nowFaved ? "1" : "0";
          item.classList.toggle("xr-faved", nowFaved);
          // Refresh fav section
          const body = container.closest(".xr-panel-body");
          if (body && !body.querySelector(".xr-search-box")) {
            // Only refresh if not in search mode
            const panel = container.closest(".xr-panel");
            if (panel) {
              const searchBox = panel.querySelector(".xr-search-box");
              if (searchBox && !searchBox.value.trim()) {
                refreshPanel();
              }
            }
          }
          return;
        }

        // Command execution
        const cmd = item.dataset.cmd;
        const params = item.dataset.params;

        // If has params, open param form
        if (params) {
          // Find the full command object for labels
          const allCmds = getAllCommands();
          const cmdObj = allCmds.find((c) => c.cmd === cmd) || { cmd, params, desc: "" };
          openParamForm(cmdObj);
          return;
        }

        // No params - direct fill
        const success = setInputText(cmd);
        if (success) {
          addRecent({
            cmd: cmd,
            params: "",
            desc: (item.querySelector(".xr-cmd-desc") || {}).textContent || ""
          });
          document.querySelector(".xr-panel-wrap").classList.remove("xr-open");
          showToast("已填入: " + cmd);
        } else {
          showToast("未找到输入框，请先打开聊天", 2000);
        }
      });
    });
  }

  // ─── Position panel relative to FAB ──────────────────────────

  function positionPanel(fab, wrap) {
    const rect = fab.getBoundingClientRect();
    const panelW = 420;
    const panelMaxH = 520;
    const gap = 10;

    let left = rect.left + rect.width / 2 - panelW / 2;
    if (left < 10) left = 10;
    if (left + panelW > window.innerWidth - 10) {
      left = window.innerWidth - panelW - 10;
    }

    const spaceAbove = rect.top - gap;
    const spaceBelow = window.innerHeight - rect.bottom - gap;
    let top;
    if (spaceAbove >= panelMaxH || spaceAbove >= spaceBelow) {
      top = rect.top - gap - panelMaxH;
      if (top < 10) top = 10;
    } else {
      top = rect.bottom + gap;
    }

    wrap.style.left = left + "px";
    wrap.style.top = top + "px";
  }

  // ─── Editor Modal ────────────────────────────────────────────

  function openEditor(cmdId) {
    const allCustom = getCustomCommands();
    const editing = cmdId ? allCustom.find((c) => c._id === cmdId) : null;
    const merged = getMergedCategories();

    let catOptions = "";
    for (let i = 0; i < merged.length; i++) {
      const c = merged[i];
      catOptions +=
        `<option value="${escapeHtml(c.name)}"` +
        (editing && editing._category === c.name ? " selected" : "") +
        `>${c.icon} ${escapeHtml(c.name)}</option>`;
    }

    const overlay = document.createElement("div");
    overlay.className = "xr-modal-overlay";
    overlay.innerHTML =
      '<div class="xr-modal">' +
      '<div class="xr-modal-header">' +
      `<span class="xr-modal-title">${editing ? "编辑命令" : "新增命令"}</span>` +
      '<button class="xr-modal-close">✕</button>' +
      "</div>" +
      '<div class="xr-modal-body">' +
      '<div class="xr-form-group">' +
      '<label class="xr-form-label">命令 *</label>' +
      `<input class="xr-form-input" id="xr-editor-cmd" value="${editing ? escapeHtml(editing.cmd) : "."}" placeholder=".命令名" />` +
      "</div>" +
      '<div class="xr-form-group">' +
      '<label class="xr-form-label">描述</label>' +
      `<input class="xr-form-input" id="xr-editor-desc" value="${editing ? escapeHtml(editing.desc || "") : ""}" placeholder="简短说明命令作用" />` +
      "</div>" +
      '<div class="xr-form-group">' +
      '<label class="xr-form-label">参数模板 <span class="xr-form-hint">(可选)</span></label>' +
      `<input class="xr-form-input" id="xr-editor-params" value="${editing ? escapeHtml(editing.params || "") : ""}" placeholder="例: &lt;物品名&gt;*&lt;数量&gt;" />` +
      "</div>" +
      '<div class="xr-form-group">' +
      '<label class="xr-form-label">固定选项 <span class="xr-form-hint">(逗号分隔)</span></label>' +
      `<input class="xr-form-input" id="xr-editor-choices" value="${editing && editing.choices ? editing.choices.join(", ") : ""}" placeholder="例: 金, 木, 水, 火, 土（留空为文本输入）" />` +
      "</div>" +
      '<div class="xr-form-group">' +
      '<label class="xr-form-label">备注 <span class="xr-form-hint">(可选)</span></label>' +
      `<input class="xr-form-input" id="xr-editor-note" value="${editing ? escapeHtml(editing.note || "") : ""}" placeholder="冷却/限制条件说明" />` +
      "</div>" +
      '<div class="xr-form-group">' +
      '<label class="xr-form-label">标签 <span class="xr-form-hint">(逗号分隔)</span></label>' +
      `<input class="xr-form-input" id="xr-editor-tags" value="${editing && editing.tags ? editing.tags.join(", ") : ""}" placeholder="搜索标签, 如: 修炼, 战斗" />` +
      "</div>" +
      '<div class="xr-form-row">' +
      '<div class="xr-form-group">' +
      '<label class="xr-form-label">需回复消息</label>' +
      '<select class="xr-form-select" id="xr-editor-reply">' +
      '<option value="false">否</option>' +
      `<option value="true"${editing && editing.reply ? " selected" : ""}>是</option>` +
      "</select>" +
      "</div>" +
      '<div class="xr-form-group">' +
      '<label class="xr-form-label">所属分类</label>' +
      `<select class="xr-form-select" id="xr-editor-cat">${catOptions}</select>` +
      "</div>" +
      "</div>" +
      '<div class="xr-form-group">' +
      '<label class="xr-form-label">或新建分类</label>' +
      '<input class="xr-form-input" id="xr-editor-newcat" placeholder="输入新建分类名（留空使用上方分类）" />' +
      "</div>" +
      "</div>" +
      '<div class="xr-modal-footer">' +
      (editing ? '<button class="xr-btn xr-btn-danger" id="xr-editor-delete">删除</button>' : "") +
      '<button class="xr-btn xr-btn-ghost" id="xr-editor-cancel">取消</button>' +
      `<button class="xr-btn xr-btn-primary" id="xr-editor-save">${editing ? "保存" : "添加"}</button>` +
      "</div>" +
      "</div>";

    document.body.appendChild(overlay);

    function close() {
      overlay.remove();
      refreshPanel();
    }

    overlay.querySelector(".xr-modal-close").addEventListener("click", close);
    overlay.querySelector("#xr-editor-cancel").addEventListener("click", close);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });

    overlay.querySelector("#xr-editor-save").addEventListener("click", () => {
      const cmd = document.getElementById("xr-editor-cmd").value.trim();
      if (!cmd || cmd.indexOf(".") !== 0) {
        showToast("请输入以 . 开头的命令", 2000);
        return;
      }
      const desc = document.getElementById("xr-editor-desc").value.trim();
      const params = document.getElementById("xr-editor-params").value.trim();
      const note = document.getElementById("xr-editor-note").value.trim();
      const tags = document.getElementById("xr-editor-tags").value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const choices = document.getElementById("xr-editor-choices").value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const reply = document.getElementById("xr-editor-reply").value === "true";
      const newCat = document.getElementById("xr-editor-newcat").value.trim();
      const cat = document.getElementById("xr-editor-cat").value;

      const cmdData = {
        cmd, desc, tags, reply, _custom: true,
        params: params || null,
        choices: choices.length > 0 ? choices : undefined,
        note: note || null,
      };

      if (newCat) {
        cmdData._category = newCat;
        const customCats = getCustomCategories();
        if (!customCats.some((c) => c.name === newCat)) {
          customCats.push({ name: newCat, icon: "📂" });
          saveCustomCategories(customCats);
        }
      } else {
        cmdData._category = cat;
      }

      if (editing) {
        updateCustomCommand(editing._id, cmdData);
        showToast("命令已更新");
      } else {
        addCustomCommand(cmdData);
        showToast("命令已添加");
      }
      close();
    });

    const deleteBtn = overlay.querySelector("#xr-editor-delete");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        if (confirm("确定删除此命令？")) {
          deleteCustomCommand(editing._id);
          showToast("命令已删除");
          close();
        }
      });
    }

    document.getElementById("xr-editor-cmd").focus();
  }

  // ─── Autocomplete ────────────────────────────────────────────

  let acWrap = null;
  let acInput = null;
  let acSelectedIdx = -1;

  function initAutocomplete() {
    acWrap = document.createElement("div");
    acWrap.className = "xr-ac-wrap";
    acWrap.style.display = "none";
    document.body.appendChild(acWrap);

    acInput = document.querySelector('.input-message-input[contenteditable="true"]');
    if (!acInput) {
      // Telegram might not be ready yet
      setTimeout(initAutocomplete, 1500);
      return;
    }

    const onInput = debounce(() => {
      if (_xr_filling) return;
      const text = acInput.textContent || "";
      updateAutocomplete(text);
    }, 150);

    acInput.addEventListener("input", onInput);
    acInput.addEventListener("blur", () => {
      setTimeout(() => { if (acWrap) acWrap.style.display = "none"; }, 250);
    });
    acInput.addEventListener("keydown", onAcKeydown);
    document.addEventListener("scroll", positionAcList, true);
    window.addEventListener("resize", positionAcList);
  }

  function updateAutocomplete(text) {
    if (!acWrap || !acInput) return;

    // Only trigger when typing . + at least 1 char
    if (!text || text.indexOf(".") !== 0 || text.length < 2) {
      acWrap.style.display = "none";
      return;
    }

    const q = text.slice(1).toLowerCase(); // text after "."
    const all = getAllCommands();
    const matches = all.filter((c) => {
      const cmdName = c.cmd.slice(1).toLowerCase(); // remove leading "."
      return cmdName.indexOf(q) !== -1 ||
        (c.tags && c.tags.some((t) => t.toLowerCase().indexOf(q) !== -1));
    }).slice(0, 10);

    if (matches.length === 0) {
      acWrap.style.display = "none";
      return;
    }

    const rect = acInput.getBoundingClientRect();
    acWrap.innerHTML =
      '<div class="xr-ac-list">' +
      matches.map((c, i) =>
        `<div class="xr-ac-item" data-idx="${i}" data-cmd="${escapeHtml(c.cmd)}" data-params="${escapeHtml(c.params || "")}" data-desc="${escapeHtml(c.desc || "")}">` +
        `<span class="xr-ac-cmd">${escapeHtml(c.cmd)}</span>` +
        `<span class="xr-ac-desc">${escapeHtml(c.desc || "")}</span>` +
        (c.params ? `<span class="xr-ac-params">${escapeHtml(c.params.trim())}</span>` : "") +
        "</div>"
      ).join("") +
      "</div>";

    acWrap.style.left = rect.left + "px";
    acWrap.style.width = Math.max(rect.width, 320) + "px";
    acWrap.style.top = (rect.bottom + 4) + "px";
    acWrap.style.display = "block";

    acSelectedIdx = -1;

    // Click handler
    acWrap.querySelectorAll(".xr-ac-item").forEach((item) => {
      item.addEventListener("click", () => {
        selectAcItem(item);
      });
      item.addEventListener("mouseenter", () => {
        acWrap.querySelectorAll(".xr-ac-item").forEach((el) => el.classList.remove("xr-ac-sel"));
        item.classList.add("xr-ac-sel");
        acSelectedIdx = parseInt(item.dataset.idx);
      });
    });
  }

  function positionAcList() {
    if (!acWrap || acWrap.style.display === "none" || !acInput) return;
    const rect = acInput.getBoundingClientRect();
    acWrap.style.left = rect.left + "px";
    acWrap.style.width = Math.max(rect.width, 320) + "px";
    acWrap.style.top = (rect.bottom + 4) + "px";
  }

  function selectAcItem(item) {
    if (!item) return;
    const cmd = item.dataset.cmd;
    const params = item.dataset.params;
    const desc = item.dataset.desc;

    if (params) {
      // Has params: fill command name + open param form
      setInputText(cmd);
      acWrap.style.display = "none";
      const cmdObj = { cmd, params, desc };
      setTimeout(() => openParamForm(cmdObj), 100);
    } else {
      // No params: fill command directly
      setInputText(cmd);
      acWrap.style.display = "none";
      addRecent({ cmd, params: "", desc });
      showToast("已填入: " + cmd);
    }
  }

  function onAcKeydown(e) {
    if (!acWrap || acWrap.style.display === "none") return;
    const items = acWrap.querySelectorAll(".xr-ac-item");
    if (items.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      items.forEach((el) => el.classList.remove("xr-ac-sel"));
      acSelectedIdx = Math.min(acSelectedIdx + 1, items.length - 1);
      items[acSelectedIdx].classList.add("xr-ac-sel");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      items.forEach((el) => el.classList.remove("xr-ac-sel"));
      acSelectedIdx = Math.max(acSelectedIdx - 1, 0);
      items[acSelectedIdx].classList.add("xr-ac-sel");
    } else if (e.key === "Enter") {
      e.preventDefault();
      const sel = acWrap.querySelector(".xr-ac-sel");
      if (sel) {
        selectAcItem(sel);
      }
    } else if (e.key === "Escape") {
      acWrap.style.display = "none";
    }
  }

  // ─── Init ────────────────────────────────────────────────────

  function init() {
    console.log("[XrPanel] init() called");
    // Initialize theme
    document.documentElement.dataset.xrTheme = getTheme();

    if (document.querySelector(".xr-fab")) {
      console.log("[XrPanel] FAB already exists, skipping");
      return;
    }

    const fab = document.createElement("div");
    fab.className = "xr-fab";
    fab.textContent = "⌘";
    fab.title = "修仙命令面板";

    const wrap = document.createElement("div");
    wrap.className = "xr-panel-wrap";

    const panel = document.createElement("div");
    panel.className = "xr-panel";
    panel.innerHTML =
      '<div class="xr-panel-header">' +
      '<div class="xr-panel-title-row">' +
      '<div class="xr-panel-title"><span class="xr-title-icon">⚡</span>修仙命令面板</div>' +
      '<div class="xr-panel-actions">' +
      '<button class="xr-action-btn" id="xr-theme-btn" title="切换主题"></button>' +
      '<button class="xr-action-btn" id="xr-add-btn" title="新增命令">＋</button>' +
      "</div>" +
      "</div>" +
      '<input class="xr-search-box" type="text" placeholder="搜索命令..." spellcheck="false" />' +
      "</div>" +
      '<div class="xr-panel-body">' +
      buildFavSection() +
      buildRecentSection() +
      buildCategories("") +
      "</div>";

    wrap.appendChild(panel);
    document.body.appendChild(fab);
    document.body.appendChild(wrap);

    positionPanel(fab, wrap);

    // Toggle
    fab.addEventListener("click", (e) => {
      if (fab._dragged) {
        fab._dragged = false;
        return;
      }
      const isOpen = wrap.classList.toggle("xr-open");
      if (isOpen) {
        positionPanel(fab, wrap);
        const sb = panel.querySelector(".xr-search-box");
        if (sb) sb.focus();
      }
    });

    // Click outside
    document.addEventListener("click", (e) => {
      if (!wrap.contains(e.target) && !fab.contains(e.target)) {
        wrap.classList.remove("xr-open");
      }
    });

    // Search
    const searchBox = panel.querySelector(".xr-search-box");
    searchBox.addEventListener("input", debounce(() => {
      const body = panel.querySelector(".xr-panel-body");
      body.innerHTML = buildFavSection() + buildRecentSection() + buildCategories(searchBox.value.trim());
      bindCmdClicks(body);
    }, 120));

    // Category toggle
    panel.addEventListener("click", (e) => {
      const header = e.target.closest(".xr-category-header");
      if (header) {
        header.parentElement.classList.toggle("xr-expanded");
      }
    });

    // Add button
    panel.querySelector("#xr-add-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      openEditor(null);
    });

    // Theme toggle
    const themeBtn = panel.querySelector("#xr-theme-btn");
    themeBtn.textContent = document.documentElement.dataset.xrTheme === "dark" ? "☀️" : "🌙";
    themeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const t = toggleTheme();
      themeBtn.textContent = t === "dark" ? "☀️" : "🌙";
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        wrap.classList.toggle("xr-open");
        if (wrap.classList.contains("xr-open")) {
          positionPanel(fab, wrap);
          panel.querySelector(".xr-search-box").focus();
        }
      }
      if (e.key === "Escape" && wrap.classList.contains("xr-open") && !document.querySelector(".xr-modal-overlay")) {
        wrap.classList.remove("xr-open");
      }
    });

    // Reposition on resize
    window.addEventListener("resize", () => {
      if (wrap.classList.contains("xr-open")) {
        positionPanel(fab, wrap);
      }
    });

    // Command clicks
    bindCmdClicks(panel);

    // Drag
    enableDrag(fab, wrap);

    // Autocomplete
    initAutocomplete();
  }

  // ─── Drag ──────────────────────────────────────────────────

  function enableDrag(fab, wrap) {
    let startX, startY, startLeft, startTop;
    let moved = false;

    function getXY(e) {
      const t = e.touches ? e.touches[0] : e;
      return { x: t.clientX, y: t.clientY };
    }

    function onDown(e) {
      e.preventDefault();
      const p = getXY(e);
      startX = p.x;
      startY = p.y;
      const r = fab.getBoundingClientRect();
      startLeft = r.left;
      startTop = r.top;
      moved = false;
      fab.classList.add("dragging");
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
      document.addEventListener("touchmove", onMove, { passive: false });
      document.addEventListener("touchend", onUp);
    }

    function onMove(e) {
      e.preventDefault();
      const p = getXY(e);
      const dx = p.x - startX;
      const dy = p.y - startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
      fab.style.right = "auto";
      fab.style.bottom = "auto";
      fab.style.left = startLeft + dx + "px";
      fab.style.top = startTop + dy + "px";
      if (wrap.classList.contains("xr-open")) {
        positionPanel(fab, wrap);
      }
    }

    function onUp() {
      fab.classList.remove("dragging");
      if (moved) {
        fab._dragged = true;
        setTimeout(() => { fab._dragged = false; }, 100);
      }
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onUp);
    }

    fab.addEventListener("mousedown", onDown);
    fab.addEventListener("touchstart", onDown, { passive: false });
  }

  // ─── Launch ──────────────────────────────────────────────────
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
