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
          const customEl = document.getElementById("xr-pf-" + i + "-custom");
          const customVal = customEl ? customEl.value.trim() : "";
          if (customVal) {
            const hasBrackets = t.raw.indexOf("<") === 0;
            values.push({ name: t.name, value: customVal, raw: t.raw, noBrackets: !hasBrackets });
          } else {
            const sel = document.getElementById("xr-pf-" + i);
            if (sel && sel.value) {
              const hasBrackets = t.raw.indexOf("<") === 0;
              values.push({ name: t.name, value: sel.value, raw: t.raw, noBrackets: !hasBrackets });
            } else {
              valid = false;
              showToast("请选择一个选项或输入自定义值", 1500);
            }
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
        XrStorage.addRecent({ cmd: cmdObj.cmd, params: cmdObj.params, desc: cmdObj.desc || "" });
        document.querySelector(".xr-panel-wrap")?.classList.remove("xr-open");
        showToast(`已填入: ${cmdObj.cmd}`);
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
