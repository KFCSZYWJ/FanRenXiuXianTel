// 核心入口 — 初始化 / 事件绑定 / UI 工具 / 拖拽
(function () {
  "use strict";

  let _xr_filling = false;
  let _xrAllExpanded = false;
  let _xrActiveTab = "freq";

  // ─── SVG Icons ─────────────────────────────────────────────────

  const _SVG_DOWN = '<svg viewBox="0 0 1024 1024" width="14" height="14"><path d="M512 928c229.76 0 416-186.24 416-416S741.76 96 512 96 96 282.24 96 512s186.24 416 416 416z m0-64c-194.4 0-352-157.6-352-352s157.6-352 352-352 352 157.6 352 352-157.6 352-352 352z m1.36-213.52c7.76-0.32 15.424-3.424 21.344-9.344l181.008-181.024a32 32 0 1 0-45.248-45.248L512 573.312l-158.464-158.448a32 32 0 1 0-45.248 45.248L489.28 641.136c5.92 5.92 13.6 9.04 21.344 9.344h2.72z" fill="currentColor"/></svg>';
  const _SVG_UP = '<svg viewBox="0 0 1024 1024" width="14" height="14"><path d="M512 928c229.76 0 416-186.24 416-416S741.76 96 512 96 96 282.24 96 512s186.24 416 416 416z m0-64c-194.4 0-352-157.6-352-352s157.6-352 352-352 352 157.6 352 352-157.6 352-352 352z m1.36-213.52c7.76-0.32 15.424-3.424 21.344-9.344l181.008-181.024a32 32 0 1 0-45.248-45.248L512 573.312l-158.464-158.448a32 32 0 1 0-45.248 45.248L489.28 641.136c5.92 5.92 13.6 9.04 21.344 9.344h2.72z" transform="rotate(180 512 512)" fill="currentColor"/></svg>';

  // ─── UI SVG Icons ──────────────────────────────────────────────
  const _SVG_SETTINGS = '<svg viewBox="0 0 1024 1024" width="14" height="14"><path d="M469.333333 60.693333a85.333333 85.333333 0 0 1 85.333334 0l326.826666 188.714667a85.333333 85.333333 0 0 1 42.666667 73.898667v377.386666a85.333333 85.333333 0 0 1-42.666667 73.898667L554.666667 963.306667a85.333333 85.333333 0 0 1-85.333334 0L142.506667 774.592a85.333333 85.333333 0 0 1-42.666667-73.898667v-377.386666a85.333333 85.333333 0 0 1 42.666667-73.898667z m42.666667 73.898667L185.173333 323.306667v377.386666L512 889.408l326.826667-188.714667v-377.386666L512 134.592zM512 341.333333a170.666667 170.666667 0 1 1 0 341.333334 170.666667 170.666667 0 0 1 0-341.333334z m0 85.333334a85.333333 85.333333 0 1 0 0 170.666666 85.333333 85.333333 0 0 0 0-170.666666z" fill="currentColor"/></svg>';
  const _SVG_STAR = '<svg viewBox="0 0 1066 1024" width="12" height="12"><path d="M267.971323 1023.938914a104.02484 104.02484 0 0 1-102.30493-120.986701l39.024141-234.026235a15.004723 15.004723 0 0 0-4.270119-12.988278L31.335571 489.877523a103.787611 103.787611 0 0 1 57.409375-176.61686l234.619308-35.228481a14.886109 14.886109 0 0 0 11.090447-8.06578L440.436679 57.765219a103.728303 103.728303 0 0 1 185.690862 0l105.981977 212.26049a14.708187 14.708187 0 0 0 11.031141 8.006473l234.619307 35.228481a103.787611 103.787611 0 0 1 57.409376 176.61686l-169.084845 166.41602a14.64888 14.64888 0 0 0-4.270119 12.928971l39.024142 234.026235a103.787611 103.787611 0 0 1-150.225153 109.184567l-210.540582-109.421796a14.589573 14.589573 0 0 0-13.640658 0l-210.540581 109.421796a103.846918 103.846918 0 0 1-47.920223 11.505598z m265.281133-211.845341a104.084147 104.084147 0 0 1 47.860916 11.861442l210.481274 109.421795a14.826802 14.826802 0 0 0 21.469209-15.597795l-38.964835-234.026236a103.906225 103.906225 0 0 1 29.653603-91.036561l169.084845-166.060177a14.886109 14.886109 0 0 0-8.184395-25.26487l-234.619307-35.22848a103.728303 103.728303 0 0 1-77.455211-56.223232l-106.041285-212.91287c-7.116865-14.293037-19.393456-14.293037-26.510321 0L413.985665 309.28708a103.787611 103.787611 0 0 1-77.455211 56.223231l-234.560001 35.228481a14.886109 14.886109 0 0 0-8.243701 25.26487l169.144152 166.060177a104.084147 104.084147 0 0 1 29.653603 90.977254l-39.024142 234.085542a14.826802 14.826802 0 0 0 21.409901 15.597796l210.540582-109.421796a104.084147 104.084147 0 0 1 47.801608-11.209062z" fill="currentColor"/></svg>';
  const _SVG_CMD = '<svg viewBox="0 0 1024 1024" width="12" height="12"><path d="M824.07619093 43.88571413H199.92380907c-85.82095253 0-156.03809493 70.2171424-156.03809494 156.03809494v624.15238186c0 85.82095253 70.2171424 156.03809493 156.03809494 156.03809494h624.15238186c85.82095253 0 156.03809493-70.2171424 156.03809494-156.03809494V199.92380907c0-85.82095253-70.2171424-156.03809493-156.03809494-156.03809494z m78.01904747 780.1904768c0 42.91047573-35.10857173 78.01904747-78.01904747 78.01904747H199.92380907c-42.91047573 0-78.01904747-35.10857173-78.01904747-78.01904747V199.92380907c0-42.91047573 35.10857173-78.01904747 78.01904747-78.01904747h624.15238186c42.91047573 0 78.01904747 35.10857173 78.01904747 78.01904747v624.15238186z m-546.13333333-78.01904853h312.07618986V668.03809493H355.96190507v78.01904747zM199.92380907 668.03809493h78.01904853V590.01904747H199.92380907v78.01904746z m0-390.09523733v78.01904747h78.01904853V277.9428576H199.92380907z m156.038096 234.0571424H277.9428576v78.01904747h78.01904747V512zM277.9428576 355.96190507v78.01904746h78.01904747V355.96190507H277.9428576z m156.03809493 78.01904746H355.96190507v78.01904747h78.01904746V433.98095253z" fill="currentColor"/></svg>';
  const _SVG_ITEM = '<svg viewBox="0 0 1024 1024" width="12" height="12"><path d="M833.8 928.2H192.6c-69.4 0-125.8-56.4-125.8-125.8v-301c0-24.7 20-44.6 44.6-44.6h150.9c33.6 0 65.2 13.1 89 36.8 23.8 23.8 36.9 55.4 36.8 89v7.1c0 20.1 16.4 36.5 36.5 36.5h173.1c20.1 0 36.5-16.4 36.5-36.5v-7.1c0-69.4 56.4-125.8 125.8-125.8h155c24.7 0 44.6 20 44.6 44.6v301c0 69.4-56.4 125.8-125.8 125.8zM156 546v256.4c0 20.1 16.4 36.5 36.5 36.5h641.3c20.1 0 36.5-16.4 36.5-36.5V546H760.2c-20.1 0-36.5 16.4-36.5 36.5v7.1c0 69.4-56.4 125.8-125.8 125.8H424.7c-69.4 0-125.8-56.4-125.8-125.8v-7.1c0-9.8-3.8-18.9-10.7-25.8-6.9-6.9-16.1-10.7-25.8-10.7H156z" fill="currentColor"/><path d="M111.4 546.1c-4.8 0-9.7-0.8-14.5-2.4-23.3-8-35.7-33.4-27.7-56.7l102.6-298.3c17.5-50.8 65.3-84.9 119-84.9h444.9c53.7 0 101.5 34.1 119 84.9L957.3 487c8 23.3-4.4 48.7-27.7 56.7-23.3 8.1-48.7-4.4-56.7-27.7L770.2 217.6c-5.1-14.8-19-24.7-34.6-24.7H290.8c-15.6 0-29.5 9.9-34.5 24.7L153.6 515.9c-6.4 18.5-23.7 30.2-42.2 30.2z" fill="currentColor"/></svg>';
  const _SVG_TITLE = '<svg viewBox="0 0 1024 1024" width="16" height="16"><path d="M508.928 144.896m-126.976 0a126.976 126.976 0 1 0 253.952 0 126.976 126.976 0 1 0-253.952 0Z" fill="currentColor"/><path d="M218.112 743.424l291.328-146.432 289.28 147.456c45.568-16.896 35.84-72.704 35.84-72.704l-33.792-141.824c-22.016-92.16-53.248-132.096-53.248-132.096-35.84-55.808-98.304-93.184-169.472-93.184H440.32c-71.168 0-133.632 37.376-169.472 93.184s-31.232 39.936-53.248 132.096l-33.792 141.824c0-0.512-9.728 53.76 34.304 71.68zM271.36 572.928l142.848-70.144 29.184-69.632c1.024-4.096 10.752-32.256 33.28-36.864 7.68-1.536 19.456-0.512 32.256 11.776 12.8-12.288 24.576-13.312 32.256-11.776 22.016 4.608 31.744 32.256 33.792 37.888l28.672 68.096 142.848 70.144c7.168 3.584 10.24 12.288 6.656 19.968-2.56 5.12-7.68 8.192-13.312 8.192-2.048 0-4.608-0.512-6.656-1.536l-147.456-71.68c-3.072-1.536-5.632-4.096-7.168-7.68l-31.232-74.752c-3.072-10.24-9.216-18.944-11.776-19.456-0.512 0-3.584 1.024-7.68 6.144-4.608 5.632-12.288 6.144-18.432 2.56-6.144 3.584-13.824 2.56-18.432-2.56-4.608-5.12-7.168-6.144-7.68-6.144-2.56 0.512-8.704 9.216-11.264 17.92L440.32 519.168c-1.536 3.072-4.096 6.144-7.168 7.68l-147.968 72.704c-2.048 1.024-4.096 1.536-6.656 1.536-5.632 0-10.752-3.072-13.312-8.192-4.608-7.168-1.536-16.384 6.144-19.968z" fill="currentColor"/><path d="M899.072 853.504L690.176 778.24v-56.32l-181.248-92.16L327.68 720.896V778.24l-208.384 75.264h1.024c-30.208 10.752-51.712 39.424-51.712 72.704v2.048c0 42.496 34.816 77.312 77.312 77.312h726.528c42.496 0 77.312-34.816 77.312-77.312v-2.048c0-33.28-21.504-61.952-50.688-72.704z" fill="currentColor"/></svg>';

  const _xrTabs = [
    { id: "freq", label: "常用", icon: _SVG_STAR },
    { id: "commands", label: "命令", icon: _SVG_CMD },
    { id: "items", label: "物品", icon: _SVG_ITEM },
  ];

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
          e.stopPropagation();
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
          e.stopPropagation();
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
      '<div class="xr-panel-title"><span class="xr-title-icon">' + _SVG_TITLE + '</span>修仙命令面板</div>' +
      '<div class="xr-panel-actions">' +
      '<button class="xr-action-btn" id="xr-expand-btn" title="展开/收起全部">' + _SVG_UP + '</button>' +
      '<button class="xr-action-btn" id="xr-settings-btn" title="设置">' + _SVG_SETTINGS + '</button>' +
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
        body.innerHTML = XrPanel.buildQuickSection(q) + XrPanel.buildFavSection(q) + XrPanel.buildRecentSection(q);
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

    // Click outside (exclude modal overlays)
    document.addEventListener("click", (e) => {
      if (XrStorage.getSetting("click_outside_close", true) &&
          !wrap.contains(e.target) && !fab.contains(e.target) &&
          !e.target.closest(".xr-modal-overlay")) {
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
      expandBtn.innerHTML = _xrAllExpanded ? _SVG_DOWN : _SVG_UP;
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
        '<span class="xr-modal-title">' + _SVG_SETTINGS + ' 设置</span>' +
        '<button class="xr-modal-close">✕</button>' +
        "</div>" +
        '<div class="xr-modal-body">' +
        '<div class="xr-settings-card">' +
        '<label class="xr-settings-row">' +
        '<span class="xr-settings-label">🖱 点击外部关闭面板</span>' +
        '<div class="xr-toggle' + (clickOutside ? ' on' : '') + '"><div class="xr-toggle-slider"></div></div>' +
        "</label>" +
        '<label class="xr-settings-row">' +
        '<span class="xr-settings-label">✅ 点击命令后收起面板</span>' +
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
