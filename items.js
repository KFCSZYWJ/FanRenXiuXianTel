// 物品图鉴 — 浏览/搜索/填入物品名
(function () {
  "use strict";

  const ITEMS_URL = chrome.runtime.getURL("data/items/all_items.json");

  const TYPE_META = {
    material:   { label: "材料",   icon: "🪨" },
    elixir:     { label: "丹药",   icon: "💊" },
    treasure:   { label: "法器",   icon: "💎" },
    recipe:     { label: "配方",   icon: "📜" },
    seed:       { label: "种子",   icon: "🌱" },
    formation:  { label: "阵法",   icon: "🔮" },
    quest_item: { label: "任务物品", icon: "📦" },
    badge:      { label: "徽章",   icon: "🏅" },
  };

  let _cache = null;

  function loadItems() {
    if (_cache) return Promise.resolve(_cache);
    return fetch(ITEMS_URL)
      .then((r) => r.json())
      .then((data) => {
        _cache = data;
        return data;
      });
  }

  function matchItem(item, q) {
    if (!q) return true;
    return item.name.toLowerCase().includes(q);
  }

  function buildItemHtml(item) {
    const meta = TYPE_META[item.type] || { label: item.type, icon: "📋" };
    return (
      `<div class="xr-cmd-item" data-item-name="${XrUtils.escapeHtml(item.name)}">` +
      '<div class="xr-cmd-row">' +
      `<span class="xr-item-type-badge">${meta.icon}</span>` +
      `<span class="xr-item-name">${XrUtils.escapeHtml(item.name)}</span>` +
      "</div>" +
      "</div>"
    );
  }

  function groupItems(items) {
    const groups = {};
    items.forEach((item) => {
      if (!groups[item.type]) groups[item.type] = [];
      groups[item.type].push(item);
    });
    const order = Object.keys(TYPE_META);
    const sorted = [];
    order.forEach((type) => {
      if (groups[type]) sorted.push({ type, items: groups[type] });
    });
    Object.keys(groups).forEach((type) => {
      if (!order.includes(type)) sorted.push({ type, items: groups[type] });
    });
    return sorted;
  }

  function renderItemTab(filter) {
    return loadItems().then((data) => {
      const q = (filter || "").toLowerCase();
      const filtered = data.filter((item) => matchItem(item, q));
      const groups = groupItems(filtered);
      if (groups.length === 0) {
        return '<div class="xr-loading">未找到匹配物品</div>';
      }
      let html = "";
      groups.forEach((group) => {
        const meta = TYPE_META[group.type] || { label: group.type, icon: "📋" };
        const expanded = q ? " xr-expanded" : "";
        html +=
          `<div class="xr-category${expanded}" data-cat="item-${group.type}">` +
          '<div class="xr-category-header">' +
          `<span class="xr-category-icon">${meta.icon}</span>` +
          `<span class="xr-category-name">${meta.label}</span>` +
          `<span class="xr-cat-count">${group.items.length}</span>` +
          '<span class="xr-category-arrow">▶</span>' +
          "</div>" +
          '<div class="xr-category-commands">' +
          group.items.map(buildItemHtml).join("") +
          "</div>" +
          "</div>";
      });
      return html;
    });
  }

  function bindItemClicks(container) {
    container.querySelectorAll(".xr-cmd-item[data-item-name]").forEach((item) => {
      item.addEventListener("click", () => {
        const name = item.dataset.itemName;
        const success = XrUtils.setInputText(name);
        if (success) {
          document.querySelector(".xr-panel-wrap").classList.remove("xr-open");
          XrUtils.showToast("已填入: " + name);
        } else {
          XrUtils.showToast("未找到输入框，请先打开聊天", 2000);
        }
      });
    });
  }

  window.XrItems = {
    loadItems,
    renderItemTab,
    bindItemClicks,
  };
})();
