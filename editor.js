// 自定义命令编辑器
(function () {
  "use strict";

  function openEditor(cmdId) {
    const { escapeHtml, showToast } = XrUtils;

    const allCustom = XrStorage.getCustomCommands();
    const editing = cmdId ? allCustom.find((c) => c._id === cmdId) : null;
    const merged = XrStorage.getMergedCategories();

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
      XrPanel.refreshPanel();
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
        .split(",").map((s) => s.trim()).filter(Boolean);
      const choices = document.getElementById("xr-editor-choices").value
        .split(",").map((s) => s.trim()).filter(Boolean);
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
        const customCats = XrStorage.getCustomCategories();
        if (!customCats.some((c) => c.name === newCat)) {
          customCats.push({ name: newCat, icon: "📂" });
          XrStorage.saveCustomCategories(customCats);
        }
      } else {
        cmdData._category = cat;
      }

      if (editing) {
        XrStorage.updateCustomCommand(editing._id, cmdData);
        showToast("命令已更新");
      } else {
        XrStorage.addCustomCommand(cmdData);
        showToast("命令已添加");
      }
      close();
    });

    const deleteBtn = overlay.querySelector("#xr-editor-delete");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        if (confirm("确定删除此命令？")) {
          XrStorage.deleteCustomCommand(editing._id);
          showToast("命令已删除");
          close();
        }
      });
    }

    document.getElementById("xr-editor-cmd").focus();
  }

  window.XrEditor = { openEditor };
})();
