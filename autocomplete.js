// Telegram 输入框命令自动补全
(function () {
  "use strict";

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
      setTimeout(initAutocomplete, 1500);
      return;
    }

    const onInput = XrUtils.debounce(() => {
      if (XrUtils.xr_filling) return;
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

    if (!text || text.indexOf(".") !== 0 || text.length < 2) {
      acWrap.style.display = "none";
      return;
    }

    const q = text.slice(1).toLowerCase();
    const all = XrStorage.getAllCommands();
    const matches = all.filter((c) => {
      const cmdName = c.cmd.slice(1).toLowerCase();
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
        `<div class="xr-ac-item" data-idx="${i}" data-cmd="${XrUtils.escapeHtml(c.cmd)}" data-params="${XrUtils.escapeHtml(c.params || "")}" data-desc="${XrUtils.escapeHtml(c.desc || "")}">` +
        `<span class="xr-ac-cmd">${XrUtils.escapeHtml(c.cmd)}</span>` +
        `<span class="xr-ac-desc">${XrUtils.escapeHtml(c.desc || "")}</span>` +
        (c.params ? `<span class="xr-ac-params">${XrUtils.escapeHtml(c.params.trim())}</span>` : "") +
        "</div>"
      ).join("") +
      "</div>";

    acWrap.style.left = rect.left + "px";
    acWrap.style.width = Math.max(rect.width, 320) + "px";
    acWrap.style.top = (rect.bottom + 4) + "px";
    acWrap.style.display = "block";

    acSelectedIdx = -1;

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
      XrUtils.setInputText(cmd);
      acWrap.style.display = "none";
      const cmdObj = { cmd, params, desc };
      setTimeout(() => XrParamForm.openParamForm(cmdObj), 100);
    } else {
      XrUtils.setInputText(cmd);
      acWrap.style.display = "none";
      XrStorage.addRecent({ cmd, params: "", desc });
      XrUtils.showToast("已填入: " + cmd);
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
      if (sel) selectAcItem(sel);
    } else if (e.key === "Escape") {
      acWrap.style.display = "none";
    }
  }

  window.XrAutocomplete = {
    initAutocomplete, updateAutocomplete,
    positionAcList, selectAcItem, onAcKeydown
  };
})();
