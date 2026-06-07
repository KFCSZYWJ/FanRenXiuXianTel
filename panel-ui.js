// 面板 UI 渲染 — 分类 / 搜索 / 收藏 / 最近
(function () {
  "use strict";

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

  // ─── Build command item ──────────────────────────────────────

  function buildCmdItem(c, isRecent) {
    const isFaved = XrStorage.isFavorite(c.cmd);
    const favBtn = `<span class="xr-cmd-fav" data-fav="${isFaved ? "1" : "0"}">${isFaved ? "★" : "☆"}</span>`;
    const replyIcon = c.reply
      ? '<span class="xr-reply-icon" title="需回复消息使用">↩</span>'
      : "";
    const noteHtml = c.note
      ? `<span class="xr-cmd-note">${XrUtils.escapeHtml(c.note)}</span>`
      : "";
    const editHint = c._custom
      ? '<span class="xr-cmd-edit-hint">✎</span>'
      : "";
    const idAttr = c._id ? ` data-id="${c._id}"` : "";
    return (
      `<div class="xr-cmd-item${isRecent ? " xr-recent-item" : ""}${isFaved ? " xr-faved" : ""}"` +
      ` data-cmd="${XrUtils.escapeHtml(c.cmd)}" data-params="${XrUtils.escapeHtml(c.params || "")}"` +
      ` data-reply="${c.reply || false}"${idAttr}>` +
      '<div class="xr-cmd-row">' +
      favBtn +
      replyIcon +
      `<span class="xr-cmd-name">${XrUtils.escapeHtml(c.cmd)}</span>` +
      `<span class="xr-cmd-desc">${XrUtils.escapeHtml(c.desc || "")}</span>` +
      (c.params
        ? `<span class="xr-cmd-params">${XrUtils.escapeHtml(c.params.trim())}</span>`
        : "") +
      "</div>" +
      noteHtml +
      editHint +
      "</div>"
    );
  }

  // ─── Build section: Quick Commands ─────────────────────────

  function buildQuickSection() {
    const quickCmds = XrStorage.getQuickCommands();
    if (quickCmds.length === 0) return "";
    const items = quickCmds.map((qc, idx) =>
      '<div class="xr-cmd-item xr-quick-item" data-qidx="' + idx +
      '" data-full="' + XrUtils.escapeHtml(qc.fullText) + '">' +
      '<div class="xr-cmd-row">' +
      '<span class="xr-cmd-name">' + XrUtils.escapeHtml(qc.label) + '</span>' +
      '<span class="xr-cmd-desc">' + XrUtils.escapeHtml(qc.fullText) + '</span>' +
      '<span class="xr-quick-del" title="删除">✕</span>' +
      "</div>" +
      "</div>"
    ).join("");
    return (
      '<div class="xr-quick-section">' +
      '<div class="xr-recent-title">📌 常用命令</div>' +
      items +
      "</div>"
    );
  }

  // ─── Build section: Favorites ────────────────────────────────

  function buildFavSection() {
    const favStrs = XrStorage.getFavorites();
    if (favStrs.length === 0) return "";
    const all = XrStorage.getAllCommands();
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
    const recent = XrStorage.getRecent();
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
    const cats = XrStorage.getMergedCategories();
    let html = "";
    for (let i = 0; i < cats.length; i++) {
      const cat = cats[i];
      const cmds = cat.commands.filter((c) => matchCmd(c, q));
      if (cmds.length === 0) continue;
      const items = cmds.map((c) => buildCmdItem(c)).join("");
      const isAllExpanded = window.XrCore && XrCore.xrAllExpanded;
      const expanded = q ? " xr-expanded" : (isAllExpanded ? " xr-expanded" : "");
      html +=
        `<div class="xr-category${expanded}" data-cat="${XrUtils.escapeHtml(cat.name)}">` +
        '<div class="xr-category-header">' +
        `<span class="xr-category-icon">${cat.icon}</span>` +
        `<span class="xr-category-name">${XrUtils.escapeHtml(cat.name)}</span>` +
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
    if (window.XrCore && XrCore.renderPanel) {
      XrCore.renderPanel();
    }
  }

  window.XrPanel = {
    matchCmd, buildCmdItem,
    buildQuickSection, buildFavSection, buildRecentSection, buildCategories,
    refreshPanel
  };
})();
