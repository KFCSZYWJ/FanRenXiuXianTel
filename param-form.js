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
        XrStorage.addRecent({ cmd: cmdObj.cmd, params: cmdObj.params, desc: cmdObj.desc || "" });
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

  window.XrParamForm = {
    parseParamTokens, fillParams, openParamForm
  };
})();
