// 存储管理层 — 主题 / 最近 / 收藏 / 自定义命令 / 分类合并
(function () {
  "use strict";

  const STORAGE_KEY = "xr_recent";
  const CUSTOM_CMDS_KEY = "xr_custom_cmds";
  const FAVS_KEY = "xr_favs";
  const MAX_RECENT = 6;

  // ─── Theme ──────────────────────────────────────────────────

  function getTheme() {
    const saved = localStorage.getItem("xr_theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  function setTheme(theme) {
    localStorage.setItem("xr_theme", theme);
    document.documentElement.dataset.xrTheme = theme;
  }

  function toggleTheme() {
    const current = document.documentElement.dataset.xrTheme || "dark";
    const next = current === "dark" ? "light" : "dark";
    setTheme(next);
    return next;
  }

  // ─── Recent ─────────────────────────────────────────────────

  function getRecent() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function addRecent(cmdObj) {
    const recent = getRecent().filter((c) => c.cmd !== cmdObj.cmd);
    recent.unshift(cmdObj);
    if (recent.length > MAX_RECENT) recent.pop();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
  }

  // ─── Custom Commands ────────────────────────────────────────

  function getCustomCommands() {
    try {
      return JSON.parse(localStorage.getItem(CUSTOM_CMDS_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveCustomCommands(cmds) {
    localStorage.setItem(CUSTOM_CMDS_KEY, JSON.stringify(cmds));
  }

  function addCustomCommand(cmdData) {
    const cmds = getCustomCommands();
    cmds.push(Object.assign({}, cmdData, {
      _custom: true,
      _id: Date.now() + "_" + Math.random().toString(36).slice(2, 6)
    }));
    saveCustomCommands(cmds);
    return cmds;
  }

  function updateCustomCommand(id, data) {
    const cmds = getCustomCommands();
    const idx = cmds.findIndex((c) => c._id === id);
    if (idx !== -1) {
      cmds[idx] = Object.assign({}, cmds[idx], data);
      saveCustomCommands(cmds);
    }
    return cmds;
  }

  function deleteCustomCommand(id) {
    let cmds = getCustomCommands();
    cmds = cmds.filter((c) => c._id !== id);
    saveCustomCommands(cmds);
    return cmds;
  }

  function getCustomCategories() {
    try {
      return JSON.parse(localStorage.getItem("xr_custom_cats")) || [];
    } catch {
      return [];
    }
  }

  function saveCustomCategories(cats) {
    localStorage.setItem("xr_custom_cats", JSON.stringify(cats));
  }

  // ─── Favorites ──────────────────────────────────────────────

  function getFavorites() {
    try {
      return JSON.parse(localStorage.getItem(FAVS_KEY)) || [];
    } catch {
      return [];
    }
  }

  function toggleFavorite(cmdStr) {
    const favs = getFavorites();
    const idx = favs.indexOf(cmdStr);
    if (idx !== -1) {
      favs.splice(idx, 1);
    } else {
      favs.push(cmdStr);
    }
    localStorage.setItem(FAVS_KEY, JSON.stringify(favs));
    return idx === -1;
  }

  function isFavorite(cmdStr) {
    return getFavorites().indexOf(cmdStr) !== -1;
  }

  // ─── Merged categories (built-in + custom) ──────────────────

  function getMergedCategories() {
    const customCmds = getCustomCommands();
    const customCats = getCustomCategories();
    const merged = COMMAND_CATEGORIES.map((cat) => ({
      name: cat.name,
      icon: cat.icon,
      commands: cat.commands.concat(
        customCmds.filter((c) => c._category === cat.name)
      )
    }));
    for (const cc of customCats) {
      const catCmds = customCmds.filter((c) => c._category === cc.name);
      merged.push({ name: cc.name, icon: cc.icon, commands: catCmds });
    }
    return merged;
  }

  function getAllCommands() {
    const cats = getMergedCategories();
    const all = [];
    for (const cat of cats) {
      for (const c of cat.commands) {
        all.push(c);
      }
    }
    return all;
  }

  window.XrStorage = {
    getTheme, setTheme, toggleTheme,
    getRecent, addRecent,
    getCustomCommands, saveCustomCommands,
    addCustomCommand, updateCustomCommand, deleteCustomCommand,
    getCustomCategories, saveCustomCategories,
    getFavorites, toggleFavorite, isFavorite,
    getMergedCategories, getAllCommands
  };
})();
