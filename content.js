// 核心入口 — 初始化 / 事件绑定 / UI 工具 / 拖拽
(function () {
  "use strict";

  let _xr_filling = false;
  let _xrAllExpanded = false;

  // ─── Utilities (exposed for other modules) ───────────────────

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

  window.XrUtils = {
    setInputText, showToast, debounce, escapeHtml,
    _xr_filling: _xr_filling,
    get xr_filling() { return _xr_filling; },
    set xr_filling(v) { _xr_filling = v; }
  };

  // ─── Command click handler ───────────────────────────────────

  function bindCmdClicks(container) {
    container.querySelectorAll(".xr-cmd-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        if (e.target.closest(".xr-cmd-edit-hint")) {
          const id = item.dataset.id;
          if (id) XrEditor.openEditor(id);
          return;
        }

        if (e.target.closest(".xr-cmd-fav")) {
          const star = e.target.closest(".xr-cmd-fav");
          const cmdStr = item.dataset.cmd;
          const nowFaved = XrStorage.toggleFavorite(cmdStr);
          star.textContent = nowFaved ? "★" : "☆";
          star.dataset.fav = nowFaved ? "1" : "0";
          item.classList.toggle("xr-faved", nowFaved);
          const body = container.closest(".xr-panel-body");
          if (body && !body.querySelector(".xr-search-box")) {
            const panel = container.closest(".xr-panel");
            if (panel) {
              const searchBox = panel.querySelector(".xr-search-box");
              if (searchBox && !searchBox.value.trim()) {
                XrPanel.refreshPanel();
              }
            }
          }
          return;
        }

        const cmd = item.dataset.cmd;
        const params = item.dataset.params;

        if (params) {
          const allCmds = XrStorage.getAllCommands();
          const cmdObj = allCmds.find((c) => c.cmd === cmd) || { cmd, params, desc: "" };
          XrParamForm.openParamForm(cmdObj);
          return;
        }

        const success = setInputText(cmd);
        if (success) {
          XrStorage.addRecent({
            cmd: cmd, params: "",
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

  // ─── Init ────────────────────────────────────────────────────

  function init() {
    console.log("[XrPanel] init() called");
    document.documentElement.dataset.xrTheme = XrStorage.getTheme();

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
      '<button class="xr-action-btn" id="xr-expand-btn" title="展开/收起全部">⤢</button>' +
      '<button class="xr-action-btn" id="xr-theme-btn" title="切换主题"></button>' +
      '<button class="xr-action-btn" id="xr-add-btn" title="新增命令">＋</button>' +
      "</div>" +
      "</div>" +
      '<input class="xr-search-box" type="text" placeholder="搜索命令..." spellcheck="false" />' +
      "</div>" +
      '<div class="xr-panel-body">' +
      XrPanel.buildFavSection() +
      XrPanel.buildRecentSection() +
      XrPanel.buildCategories("") +
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
      body.innerHTML = XrPanel.buildFavSection() + XrPanel.buildRecentSection() + XrPanel.buildCategories(searchBox.value.trim());
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
      XrEditor.openEditor(null);
    });

    // Theme toggle
    const themeBtn = panel.querySelector("#xr-theme-btn");
    themeBtn.textContent = document.documentElement.dataset.xrTheme === "dark" ? "☀️" : "🌙";
    themeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const t = XrStorage.toggleTheme();
      themeBtn.textContent = t === "dark" ? "☀️" : "🌙";
    });

    // Expand/collapse all
    const expandBtn = panel.querySelector("#xr-expand-btn");
    expandBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      _xrAllExpanded = !_xrAllExpanded;
      expandBtn.textContent = _xrAllExpanded ? "⤡" : "⤢";
      panel.querySelectorAll(".xr-category").forEach((cat) => {
        cat.classList.toggle("xr-expanded", _xrAllExpanded);
      });
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
    XrAutocomplete.initAutocomplete();
  }

  window.XrCore = {
    bindCmdClicks, positionPanel, enableDrag,
    get xrAllExpanded() { return _xrAllExpanded; },
    set xrAllExpanded(v) { _xrAllExpanded = v; }
  };

  // ─── Launch ──────────────────────────────────────────────────
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
