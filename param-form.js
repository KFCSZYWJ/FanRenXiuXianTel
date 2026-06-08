// 参数解析与参数表单弹窗
(function () {
  "use strict";

  // ─── Params parsing ──────────────────────────────────────────

  function parseParamTokens(str, choices) {
    if (!str) return [];
    str = str.trim();

    if (choices && Array.isArray(choices) && choices.length > 0) {
      const name = str.replace(/^<(.+)>$/, "$1").replace(/[<>]/g, "").trim() || "选项";
      return [{ type: "choice", name, choices: choices.slice(), raw: str }];
    }

    const parts = str.split(/\s+/);
    const tokens = [];

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      const qm = part.match(/^<(.+?)>\*<(.+?)>$/);
      if (qm) {
        tokens.push({ type: "quantity", name: qm[1], countLabel: qm[2], raw: part });
        continue;
      }

      const m = part.match(/^<(.+)>$/);
      if (m) {
        const content = m[1];
        if (content.indexOf("/") > 0) {
          tokens.push({ type: "choice", name: content, choices: content.split("/"), raw: part });
        } else if (content.indexOf("-") > 0 && !/[一-鿿]/.test(content)) {
          tokens.push({ type: "choice", name: content, choices: content.split("-"), raw: part });
        } else {
          tokens.push({ type: "input", name: content, raw: part });
        }
        continue;
      }

      if (part.indexOf("@") === 0) {
        tokens.push({ type: "mention", name: part, raw: part });
        continue;
      }

      const optBracket = part.match(/^\[(.+)\]$/);
      if (optBracket) {
        tokens.push({ type: "input", name: optBracket[1], raw: part });
        continue;
      }

      tokens.push({ type: "static", value: part, raw: part });
    }

    return tokens;
  }

  function fillParams(template, values) {
    let result = template;
    for (let i = 0; i < values.length; i++) {
      const v = values[i];
      if (v.count !== undefined) {
        result = result.replace(`<${v.name}>*<${v.countLabel}>`, v.value + "*" + v.count);
      } else if (v.noBrackets) {
        if (result.indexOf(v.raw) !== -1) {
          result = result.replace(v.raw, v.value);
        }
      } else {
        result = result.replace(`<${v.name}>`, v.value);
      }
    }
    result = result.replace(/<[^>]+>\*<[^>]+>/g, "");
    return result;
  }

  // ─── Param Memory (localStorage) ─────────────────────────────

  function saveParamMemory(cmdStr, fieldValues) {
    try {
      const mem = JSON.parse(localStorage.getItem("xr_param_memory")) || {};
      mem[cmdStr] = fieldValues;
      const keys = Object.keys(mem);
      if (keys.length > 50) {
        const toDelete = keys.slice(0, keys.length - 50);
        toDelete.forEach((k) => delete mem[k]);
      }
      localStorage.setItem("xr_param_memory", JSON.stringify(mem));
    } catch (e) { /* ignore */ }
  }

  function loadParamMemory(cmdStr) {
    try {
      const mem = JSON.parse(localStorage.getItem("xr_param_memory")) || {};
      return mem[cmdStr] || null;
    } catch (e) { return null; }
  }

  // ─── Param Form Modal ────────────────────────────────────────

  function openParamForm(cmdObj) {
    const tokens = parseParamTokens(cmdObj.params, cmdObj.choices);
    if (tokens.length === 0) return;

    const { escapeHtml, showToast, setInputText } = XrUtils;

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
        let optsHtml = `<select class="xr-form-input xr-form-select" id="${id}">`;
        optsHtml += `<option value="">-- 请选择 --</option>`;
        for (let j = 0; j < t.choices.length; j++) {
          const val = t.choices[j].trim();
          optsHtml += `<option value="${escapeHtml(val)}">${escapeHtml(val)}</option>`;
        }
        optsHtml += `</select>`;
        formHtml +=
          '<div class="xr-form-group">' +
          `<label class="xr-form-label">${escapeHtml(t.name)}</label>` +
          optsHtml +
          `<div class="xr-pf-custom-row">` +
          `<input class="xr-form-input" id="${id}-custom" placeholder="或在此输入自定义值" />` +
          `</div>` +
          "</div>";
        fieldIds.push(id + "-custom");
      } else if (t.type === "mention") {
        formHtml +=
          '<div class="xr-form-group">' +
          `<label class="xr-form-label">${escapeHtml(t.name)}</label>` +
          `<input class="xr-form-input" id="${id}" placeholder="@用户名" />` +
          "</div>";
      }
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
      '<div class="xr-pf-save-row">' +
      '<label class="xr-pf-save-label">' +
      '<input type="checkbox" id="xr-pf-save-quick" />' +
      ' 保存为常用命令' +
      '</label>' +
      '<div class="xr-pf-save-name-row" style="display:none">' +
      '<input class="xr-form-input" id="xr-pf-save-name" placeholder="名称（可选，默认为命令名）" />' +
      '</div>' +
      '</div>' +
      "</div>" +
      '<div class="xr-modal-footer">' +
      '<button class="xr-btn xr-btn-ghost" id="xr-pf-cancel">取消</button>' +
      '<button class="xr-btn xr-btn-primary" id="xr-pf-confirm">确认填入</button>' +
      "</div>" +
      "</div>";

    document.body.appendChild(overlay);

    // Restore param memory
    const savedMemory = loadParamMemory(cmdObj.cmd);
    if (savedMemory) {
      Object.keys(savedMemory).forEach((key) => {
        const el = document.getElementById(key);
        if (!el) return;
        if (el.tagName === "DIV" && el.classList.contains("xr-pf-opts")) {
          const radio = el.querySelector(`input[type="radio"][value="${savedMemory[key]}"]`);
          if (radio) radio.checked = true;
        } else {
          el.value = savedMemory[key];
        }
      });
    }

    // ─── Items DB autocomplete for matching params ──────────────
    (function setupItemAutocomplete() {
      const items = XrItems.getCachedItems();
      if (!items) {
        XrItems.loadItems().then(() => setupItemAutocomplete());
        return;
      }
      for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];
        if (t.type !== "input" && t.type !== "quantity") continue;
        const itemType = XrItems.getItemTypeForParam(t.name);
        if (itemType === undefined) continue;
        const listId = "xr-items-dl-" + i;
        const input = document.getElementById("xr-pf-" + i);
        if (!input) continue;
        input.setAttribute("list", listId);
        const matched = itemType === null
          ? items
          : items.filter((it) => it.type === itemType);
        let optsHtml = "";
        for (const it of matched) {
          optsHtml += `<option value="${escapeHtml(it.name)}">${escapeHtml(it.name)}</option>`;
        }
        const dl = document.createElement("datalist");
        dl.id = listId;
        dl.innerHTML = optsHtml;
        input.parentNode.appendChild(dl);
      }
    })();

    function close(e) {
      if (e) e.stopPropagation();
      overlay.remove();
    }

    overlay.querySelector(".xr-modal-close").addEventListener("click", close);
    overlay.querySelector("#xr-pf-cancel").addEventListener("click", close);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close(e);
    });

    // Show/hide save name input on checkbox change, save immediately
    const saveCb = overlay.querySelector("#xr-pf-save-quick");
    if (saveCb) {
      saveCb.addEventListener("change", function () {
        const nr = document.getElementById("xr-pf-save-name-row");
        if (nr) nr.style.display = this.checked ? "" : "none";

        if (this.checked) {
          // Collect current form values and save immediately
          const vals = [];
          for (let i = 0; i < tokens.length; i++) {
            const t = tokens[i];
            if (t.type === "static") continue;
            let el, val, count;
            if (t.type === "quantity") {
              el = document.getElementById("xr-pf-" + i);
              const cntEl = document.getElementById("xr-pf-" + i + "-count");
              val = el ? el.value.trim() : "";
              count = cntEl ? cntEl.value.trim() : "";
              if (val && count) vals.push({ name: t.name, value: val, countLabel: t.countLabel, count });
            } else if (t.type === "choice") {
              const custom = document.getElementById("xr-pf-" + i + "-custom");
              const customVal = custom ? custom.value.trim() : "";
              if (customVal) {
                vals.push({ name: t.name, value: customVal, raw: t.raw, noBrackets: t.raw.indexOf("<") !== 0 });
              } else {
                el = document.getElementById("xr-pf-" + i);
                vals.push({ name: t.name, value: el ? el.value : "", raw: t.raw, noBrackets: t.raw.indexOf("<") !== 0 });
              }
            } else {
              el = document.getElementById("xr-pf-" + i);
              val = el ? el.value.trim() : "";
              if (t.raw && t.raw.indexOf("[") === 0) {
                vals.push({ name: t.name, value: val, raw: t.raw, noBrackets: true });
              } else {
                vals.push({ name: t.name, value: val });
              }
            }
          }
          const filled = fillParams(cmdObj.params, vals);
          const full = cmdObj.cmd + filled;
          try {
            XrStorage.addQuickCommand(cmdObj.cmd, full);
            showToast("已保存常用命令：" + cmdObj.cmd, 2000);
          } catch (e) {
            showToast("保存失败", 2000);
          }
        }
      });
    }

    const confirmBtn = overlay.querySelector("#xr-pf-confirm");
    confirmBtn.addEventListener("click", function () {
      const values = [];
      for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];
        if (t.type === "static") continue;

        if (t.type === "quantity") {
          const val = document.getElementById("xr-pf-" + i).value.trim();
          const count = document.getElementById("xr-pf-" + i + "-count").value.trim();
          if (val && count) {
            values.push({ name: t.name, value: val, countLabel: t.countLabel, count: count });
          }
        } else if (t.type === "choice") {
          const customEl = document.getElementById("xr-pf-" + i + "-custom");
          const customVal = customEl ? customEl.value.trim() : "";
          if (customVal) {
            values.push({ name: t.name, value: customVal, raw: t.raw, noBrackets: t.raw.indexOf("<") !== 0 });
          } else {
            const sel = document.getElementById("xr-pf-" + i);
            const selVal = sel ? sel.value : "";
            values.push({ name: t.name, value: selVal, raw: t.raw, noBrackets: t.raw.indexOf("<") !== 0 });
          }
        } else if (t.type === "mention") {
          const el = document.getElementById("xr-pf-" + i);
          const val = el ? el.value.trim() : "";
          values.push({ name: t.name, value: val, raw: t.raw, noBrackets: true });
        } else {
          const el = document.getElementById("xr-pf-" + i);
          const val = el ? el.value.trim() : "";
          if (t.raw && t.raw.indexOf("[") === 0) {
            values.push({ name: t.name, value: val, raw: t.raw, noBrackets: true });
          } else {
            values.push({ name: t.name, value: val });
          }
        }
      }

      const filledParams = fillParams(cmdObj.params, values);
      const hasContent = filledParams.trim().length > 0;
      const fullCmd = cmdObj.cmd + filledParams;
      const success = setInputText(fullCmd);
      if (success) {
        XrStorage.addRecent({ cmd: cmdObj.cmd, params: hasContent ? cmdObj.params : "", desc: cmdObj.desc || "" });
        showToast(`已填入: ${cmdObj.cmd}`);
        if (XrCore.shouldAutoClose()) XrCore.closePanel();
        // Save param memory
        const fieldValues = {};
        for (let i = 0; i < tokens.length; i++) {
          const t = tokens[i];
          if (t.type === "static") continue;
          const id = "xr-pf-" + i;
          if (t.type === "choice") {
            const sel = document.getElementById("xr-pf-" + i);
            if (sel && sel.value) fieldValues[id] = sel.value;
          } else if (t.type === "quantity") {
            const valEl = document.getElementById(id);
            const cntEl = document.getElementById(id + "-count");
            if (valEl && valEl.value.trim()) fieldValues[id] = valEl.value.trim();
            if (cntEl && cntEl.value.trim()) fieldValues[id + "-count"] = cntEl.value.trim();
          } else {
            const el = document.getElementById(id);
            if (el && el.value.trim()) fieldValues[id] = el.value.trim();
          }
        }
        if (Object.keys(fieldValues).length > 0) saveParamMemory(cmdObj.cmd, fieldValues);
        close();
      } else {
        showToast("未找到输入框，请先打开聊天", 2000);
      }
    });

    // Focus first input
    const firstInput = overlay.querySelector("input:not([type=radio])");
    if (firstInput) firstInput.focus();
  }

  window.XrParamForm = {
    parseParamTokens, fillParams, openParamForm
  };
})();
