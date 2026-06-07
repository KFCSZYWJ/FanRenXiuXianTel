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
    talisman:   { label: "符箓",   icon: "📿" },
    special_item:  { label: "特殊物品", icon: "✨" },
    special_tool:  { label: "特殊工具", icon: "🔧" },
    loot_box:   { label: "战利品箱", icon: "🎁" },
    recipe_internal: { label: "内部配方", icon: "📄" },
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

  function getCachedItems() {
    return _cache;
  }

  function queryItems(typeFilter, query) {
    if (!_cache) return [];
    const q = (query || "").toLowerCase();
    return _cache.filter((item) => {
      if (typeFilter && item.type !== typeFilter) return false;
      if (q && !item.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }

  function matchItem(item, q) {
    if (!q) return true;
    return item.name.toLowerCase().includes(q);
  }

  // Param name → item type mapping for autocomplete
  const PARAM_ITEM_MAP = {
    "丹药名": "elixir",
    "法宝": "treasure",
    "法宝名": "treasure",
    "物品": null,
    "物品名": null,
    "材料名": "material",
    "阵法": "formation",
    "阵法名": "formation",
    "徽章": "badge",
    "徽章名": "badge",
  };

  function getItemTypeForParam(paramName) {
    for (const key of Object.keys(PARAM_ITEM_MAP)) {
      if (paramName.indexOf(key) !== -1) return PARAM_ITEM_MAP[key];
    }
    return undefined;
  }

  function buildItemHtml(item) {
    const meta = TYPE_META[item.type] || { label: item.type, icon: "📋" };
    return (
      `<div class="xr-cmd-item" data-item-name="${XrUtils.escapeHtml(item.name)}">` +
      '<div class="xr-cmd-row">' +
      `<span class="xr-item-type-badge">${meta.icon}</span>` +
      `<span class="xr-item-name">${XrUtils.escapeHtml(item.name)}</span>` +
      '<span class="xr-item-copy" title="复制到剪贴板">📋</span>' +
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
      item.addEventListener("click", (e) => {
        if (e.target.closest(".xr-item-copy")) {
          const name = item.dataset.itemName;
          navigator.clipboard.writeText(name).then(() => {
            XrUtils.showToast("已复制: " + name, 1200);
          }).catch(() => {
            XrUtils.showToast("复制失败", 1500);
          });
          return;
        }
        const name = item.dataset.itemName;
        const success = XrUtils.appendInputText(name);
        if (success) {
          if (XrCore.shouldAutoClose()) XrCore.closePanel();
          XrUtils.showToast("已填入: " + name);
        } else {
          XrUtils.showToast("未找到输入框，请先打开聊天", 2000);
        }
      });
    });
  }

  window.XrItems = {
    loadItems, getCachedItems, queryItems, getItemTypeForParam,
    renderItemTab,
    bindItemClicks,
  };
})();
