// 核心入口 — 初始化 / 事件绑定 / UI 工具 / 拖拽
(function () {
  "use strict";

  let _xr_filling = false;
  let _xrAllExpanded = false;
  let _xrActiveTab = "freq";
  const _xrTabs = [
    { id: "freq", label: "常用", icon: "⚡" },
    { id: "commands", label: "命令", icon: "📋" },
    { id: "items", label: "物品", icon: "📖" },
  ];

  // ─── SVG Icons ─────────────────────────────────────────────────

  const _SVG_DOWN = '<svg viewBox="0 0 1024 1024" width="14" height="14"><path d="M512 928c229.76 0 416-186.24 416-416S741.76 96 512 96 96 282.24 96 512s186.24 416 416 416z m0-64c-194.4 0-352-157.6-352-352s157.6-352 352-352 352 157.6 352 352-157.6 352-352 352z m1.36-213.52c7.76-0.32 15.424-3.424 21.344-9.344l181.008-181.024a32 32 0 1 0-45.248-45.248L512 573.312l-158.464-158.448a32 32 0 1 0-45.248 45.248L489.28 641.136c5.92 5.92 13.6 9.04 21.344 9.344h2.72z" fill="currentColor"/></svg>';
  const _SVG_UP = '<svg viewBox="0 0 1024 1024" width="14" height="14"><path d="M512 928c229.76 0 416-186.24 416-416S741.76 96 512 96 96 282.24 96 512s186.24 416 416 416z m0-64c-194.4 0-352-157.6-352-352s157.6-352 352-352 352 157.6 352 352-157.6 352-352 352z m1.36-213.52c7.76-0.32 15.424-3.424 21.344-9.344l181.008-181.024a32 32 0 1 0-45.248-45.248L512 573.312l-158.464-158.448a32 32 0 1 0-45.248 45.248L489.28 641.136c5.92 5.92 13.6 9.04 21.344 9.344h2.72z" transform="rotate(180 512 512)" fill="currentColor"/></svg>';

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

  function appendInputText(text) {
    const input = document.querySelector(
      '.input-message-input[contenteditable="true"]'
    );
    if (!input) return false;
    input.focus();
    _xr_filling = true;
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(input);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    document.execCommand("insertText", false, " " + text);
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

  function closePanel() {
    document.querySelector(".xr-panel-wrap")?.classList.remove("xr-open");
  }

  function shouldAutoClose() {
    return XrStorage.getSetting("cmd_click_auto_close", true);
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
    setInputText, appendInputText, showToast, debounce, escapeHtml,
    _xr_filling: _xr_filling,
    get xr_filling() { return _xr_filling; },
    set xr_filling(v) { _xr_filling = v; }
  };

  // ─── Command click handler ───────────────────────────────────

  function bindCmdClicks(container) {
    container.querySelectorAll(".xr-cmd-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        // Quick command: delete button
        if (e.target.closest(".xr-quick-del")) {
          const idx = parseInt(item.dataset.qidx);
          if (!isNaN(idx)) {
            XrStorage.removeQuickCommand(idx);
            XrPanel.refreshPanel();
          }
          return;
        }

        // Quick command: click to input full command directly (no dialog)
        if (item.classList.contains("xr-quick-item")) {
          const fullText = item.dataset.full;
          if (fullText) {
            const success = setInputText(fullText);
            if (success) {
              if (shouldAutoClose()) closePanel();
              showToast("已填入: " + fullText);
            } else {
              showToast("未找到输入框，请先打开聊天", 2000);
            }
          }
          return;
        }

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
          if (shouldAutoClose()) closePanel();
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
    const panelEl = wrap.querySelector(".xr-panel");
    const panelW = panelEl ? panelEl.offsetWidth : 420;
    const panelMaxH = panelEl ? panelEl.offsetHeight : 520;
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
      '<button class="xr-action-btn" id="xr-expand-btn" title="展开/收起全部">' + _SVG_DOWN + '</button>' +
      '<button class="xr-action-btn" id="xr-settings-btn" title="设置">⚙</button>' +
      '<button class="xr-action-btn" id="xr-add-btn" title="新增命令">＋</button>' +
      "</div>" +
      "</div>" +
      '<div class="xr-search-wrap">' +
      '<input class="xr-search-box" type="text" placeholder="搜索..." spellcheck="false" />' +
      '<button class="xr-search-clear">✕</button>' +
      '</div>' +
      "</div>" +
      '<div class="xr-tab-bar">' +
      _xrTabs.map((t, i) =>
        `<button class="xr-tab-btn${i === 0 ? " active" : ""}" data-tab="${t.id}">${t.icon}${t.label}</button>`
      ).join("") +
      "</div>" +
      '<div class="xr-panel-body"></div>';

    wrap.appendChild(panel);
    document.body.appendChild(fab);
    document.body.appendChild(wrap);

    // Apply saved panel preset
    const preset = XrStorage.getPanelPreset();
    panel.style.width = preset.w + "px";
    panel.style.maxHeight = preset.h + "px";

    positionPanel(fab, wrap);

    async function renderBody() {
      const body = panel.querySelector(".xr-panel-body");
      const q = (panel.querySelector(".xr-search-box").value || "").trim();
      const sb = panel.querySelector(".xr-search-box");
      if (_xrActiveTab === "freq") {
        body.innerHTML = XrPanel.buildQuickSection() + XrPanel.buildFavSection() + XrPanel.buildRecentSection();
        bindCmdClicks(body);
        sb.placeholder = "搜索...";
      } else if (_xrActiveTab === "commands") {
        body.innerHTML = XrPanel.buildCategories(q);
        bindCmdClicks(body);
        sb.placeholder = "搜索命令...";
      } else if (_xrActiveTab === "items") {
        body.innerHTML = '<div class="xr-loading">加载中...</div>';
        try {
          const html = await XrItems.renderItemTab(q);
          body.innerHTML = html;
          XrItems.bindItemClicks(body);
        } catch (e) {
          body.innerHTML = '<div class="xr-loading">加载失败</div>';
        }
        sb.placeholder = "搜索物品...";
      }
    }

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
      if (XrStorage.getSetting("click_outside_close", true) &&
          !wrap.contains(e.target) && !fab.contains(e.target)) {
        wrap.classList.remove("xr-open");
      }
    });

    // Search
    const searchBox = panel.querySelector(".xr-search-box");
    searchBox.addEventListener("input", debounce(() => {
      renderBody();
    }, 120));
    searchBox.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && searchBox.value) {
        e.stopPropagation();
        searchBox.value = "";
        renderBody();
      }
    });

    const clearBtn = panel.querySelector(".xr-search-clear");
    clearBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      searchBox.value = "";
      renderBody();
      searchBox.focus();
    });

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

    // Expand/collapse all
    const expandBtn = panel.querySelector("#xr-expand-btn");
    expandBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      _xrAllExpanded = !_xrAllExpanded;
      expandBtn.innerHTML = _xrAllExpanded ? _SVG_UP : _SVG_DOWN;
      panel.querySelectorAll(".xr-category").forEach((cat) => {
        cat.classList.toggle("xr-expanded", _xrAllExpanded);
      });
    });

    // Settings button & modal
    const settingsBtn = panel.querySelector("#xr-settings-btn");
    settingsBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const clickOutside = XrStorage.getSetting("click_outside_close", true);
      const cmdAutoClose = XrStorage.getSetting("cmd_click_auto_close", true);
      const currentTheme = XrStorage.getTheme();
      const presets = XrStorage.PANEL_PRESETS;
      const curPresetKey = XrStorage.getSetting("panel_preset", "medium");

      const sOverlay = document.createElement("div");
      sOverlay.className = "xr-modal-overlay";
      sOverlay.innerHTML =
        '<div class="xr-modal xr-modal-sm">' +
        '<div class="xr-modal-header">' +
        '<span class="xr-modal-title">⚙ 设置</span>' +
        '<button class="xr-modal-close">✕</button>' +
        "</div>" +
        '<div class="xr-modal-body">' +
        '<div class="xr-settings-card">' +
        '<label class="xr-settings-row">' +
        '<span class="xr-settings-label">🖱 点击外部关闭面板</span>' +
        '<div class="xr-toggle' + (clickOutside ? ' on' : '') + '"><div class="xr-toggle-slider"></div></div>' +
        "</label>" +
        '<label class="xr-settings-row">' +
        '<span class="xr-settings-label">✅ 点击命令关闭面板</span>' +
        '<div class="xr-toggle' + (cmdAutoClose ? ' on' : '') + '"><div class="xr-toggle-slider"></div></div>' +
        "</label>" +
        '<label class="xr-settings-row">' +
        '<span class="xr-settings-label" id="xr-set-theme-label">' + (currentTheme === "dark" ? "🌙" : "☀️") + ' 深色模式</span>' +
        '<div class="xr-toggle' + (currentTheme === "dark" ? " on" : "") + '"><div class="xr-toggle-slider"></div></div>' +
        "</label>" +
        "</div>" +
        '<div class="xr-settings-card">' +
        '<div class="xr-settings-row">' +
        '<span class="xr-settings-label">📐 面板尺寸</span>' +
        '<select class="xr-form-select xr-settings-select" id="xr-set-preset">' +
        Object.keys(presets).map(k => {
          const p = presets[k];
          return `<option value="${k}"${k === curPresetKey ? ' selected' : ''}>${p.label} (${p.w}×${p.h})</option>`;
        }).join("") +
        '</select>' +
        "</div>" +
        "</div>" +
        "</div>" +
        '<div class="xr-modal-footer">' +
        '<button class="xr-btn xr-btn-primary" id="xr-settings-close">确定</button>' +
        "</div>" +
        "</div>";
      document.body.appendChild(sOverlay);

      // Toggle: click outside
      const toggleOutside = sOverlay.querySelector(".xr-settings-card .xr-toggle");
      toggleOutside.addEventListener("click", (ev) => {
        ev.stopPropagation();
        toggleOutside.classList.toggle("on");
      });

      // Toggle: cmd click auto close
      const toggles = sOverlay.querySelectorAll(".xr-settings-card .xr-toggle");
      const toggleAutoClose = toggles[1];
      toggleAutoClose.addEventListener("click", (ev) => {
        ev.stopPropagation();
        toggleAutoClose.classList.toggle("on");
      });

      // Toggle: dark mode
      const toggleTheme = toggles[2];
      const themeLabel = document.getElementById("xr-set-theme-label");
      toggleTheme.addEventListener("click", (ev) => {
        ev.stopPropagation();
        toggleTheme.classList.toggle("on");
        if (themeLabel) {
          themeLabel.textContent = (toggleTheme.classList.contains("on") ? "🌙" : "☀️") + " 深色模式";
        }
      });

      function applySettings() {
        XrStorage.setSetting("click_outside_close", toggleOutside.classList.contains("on"));
        XrStorage.setSetting("cmd_click_auto_close", toggleAutoClose.classList.contains("on"));
        const isDark = toggleTheme.classList.contains("on");
        XrStorage.setTheme(isDark ? "dark" : "light");
        const presetKey = document.getElementById("xr-set-preset").value;
        XrStorage.setPanelPreset(presetKey);
        const p = XrStorage.getPanelPreset();
        panel.style.width = p.w + "px";
        panel.style.maxHeight = p.h + "px";
        positionPanel(fab, wrap);
        sOverlay.remove();
      }

      sOverlay.querySelector("#xr-settings-close").addEventListener("click", applySettings);
      sOverlay.querySelector(".xr-modal-close").addEventListener("click", () => sOverlay.remove());
      sOverlay.addEventListener("click", (ev) => {
        if (ev.target === sOverlay) applySettings();
      });
    });

    // Tab switching
    panel.querySelectorAll(".xr-tab-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const tabId = btn.dataset.tab;
        if (tabId === _xrActiveTab) return;
        _xrActiveTab = tabId;
        panel.querySelectorAll(".xr-tab-btn").forEach(b => b.classList.toggle("active", b.dataset.tab === tabId));
        const sb = panel.querySelector(".xr-search-box");
        sb.value = "";
        renderBody();
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

    // Initial render
    renderBody();

    // Drag
    enableDrag(fab, wrap);

    // Autocomplete
    XrAutocomplete.initAutocomplete();

    XrCore.renderPanel = renderBody;
  }

  window.XrCore = {
    bindCmdClicks, positionPanel, enableDrag,
    closePanel, shouldAutoClose,
    renderPanel: null,
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
