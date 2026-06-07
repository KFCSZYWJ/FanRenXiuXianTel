// 修仙游戏 bot 命令配置 — 凡人修仙录 V9.5
// 数据来源: 官方天道总纲 + 玩家整理命令汇总
// 格式: { cmd, desc, params, note, reply, tags }

const COMMAND_CATEGORIES = [
  // ===== 1. 入门基础 =====
  {
    name: "入门基础",
    icon: "🚪",
    commands: [
      { cmd: ".检测灵根", desc: "创建角色并生成灵根/道号", params: null, tags: ["创建", "角色", "灵根"] },
      { cmd: ".我的灵根", desc: "查看角色面板（境界/修为/道号/灵根/宗门/状态）", params: null, tags: ["查看", "属性", "面板"] },
      { cmd: ".宗门列表", desc: "查看可加入的宗门及条件", params: null, tags: ["宗门", "查看"] },
      { cmd: ".储物袋", desc: "查看拥有的所有物品", params: null, tags: ["背包", "物品", "查看"] },
      { cmd: ".状态", desc: "查看修士状态及法宝耐久", params: null, tags: ["查看", "状态", "耐久"] },
    ]
  },

  // ===== 2. 修炼丹药 =====
  {
    name: "修炼丹药",
    icon: "🧘",
    commands: [
      { cmd: ".闭关修炼", desc: "主动修炼获取修为", params: null, note: "冷却10~15分钟；有成功/失败/走火入魔", tags: ["修炼", "闭关"] },
      { cmd: ".服用", desc: "服用丹药或使用物品", params: " <丹药名>*<数量>", note: "受境界限制；同类丹药24h内叠丹毒", tags: ["丹药", "服用", "吃药"] },
      { cmd: ".深度闭关", desc: "8小时挂机修炼", params: null, note: "冷却40分钟；结束后下次发言结算", tags: ["挂机", "修炼", "自动"] },
      { cmd: ".查看闭关", desc: "查看深度闭关剩余时间", params: null, tags: ["查看", "闭关"] },
      { cmd: ".强行出关", desc: "提前结束深度闭关", params: null, note: "收益会大打折扣", tags: ["闭关", "结束"] },
      { cmd: ".避世", desc: "开启和平模式", params: null, note: "仅炼气期可用；不能攻击也不能被攻击", tags: ["和平", "安全", "炼气"] },
      { cmd: ".入世", desc: "关闭和平模式", params: null, tags: ["和平", "关闭"] },
    ]
  },

  // ===== 3. 宗门通用 =====
  {
    name: "宗门通用",
    icon: "🏛️",
    commands: [
      { cmd: ".拜入宗门", desc: "加入指定宗门", params: " <宗门名>", note: "需满足宗门加入条件", tags: ["宗门", "加入"] },
      { cmd: ".我的宗门", desc: "查看宗门详情及同门名单", params: null, tags: ["宗门", "查看"] },
      { cmd: ".叛出宗门", desc: "退出当前宗门", params: null, note: "24h冷却；贡献清零；宗门资产失效", tags: ["宗门", "退出", "叛门"] },
      { cmd: ".宗门宝库", desc: "查看并兑换宗门珍稀物品", params: null, note: "宗门弟子专属", tags: ["宗门", "宝库", "兑换"] },
      { cmd: ".兑换", desc: "在宗门宝库中购买物品", params: " <物品名>*<数量>", note: "消耗贡献", tags: ["宗门", "兑换", "购买"] },
      { cmd: ".宗门点卯", desc: "每日签到领取贡献", params: null, note: "每日1次；连续3天/7天有额外大奖", tags: ["宗门", "签到", "每日"] },
      { cmd: ".宗门传功", desc: "分享心得获取贡献", params: null, note: "需回复自己的有价值发言；每日上限3次", reply: true, tags: ["宗门", "贡献"] },
      { cmd: ".宗门捐献", desc: "上交材料换取贡献", params: " <材料名>*<数量>", note: "按宗门兑换价七成折算", tags: ["宗门", "捐献", "材料"] },
      { cmd: ".宗门悬赏", desc: "查看宗门发布的任务", params: null, tags: ["宗门", "任务", "悬赏"] },
      { cmd: ".提交任务", desc: "完成并提交宗门悬赏任务", params: " <要求>", tags: ["宗门", "任务", "提交"] },
    ]
  },

  // ===== 4. 黄枫谷 =====
  {
    name: "黄枫谷",
    icon: "🪴",
    commands: [
      { cmd: ".小药园", desc: "查看灵田状态", params: null, note: "首次使用自动开辟灵田", tags: ["黄枫谷", "药园", "灵田"] },
      { cmd: ".播种", desc: "在灵田种下种子", params: " <地块> <种子>", note: "不带地块可一键播种", tags: ["黄枫谷", "播种", "种植"] },
      { cmd: ".采药", desc: "收获成熟的灵草", params: " <地块>", note: "不带地块可一键采药", tags: ["黄枫谷", "采药", "收获"] },
      { cmd: ".除草", desc: "处理药园杂草", params: " <地块>", tags: ["黄枫谷", "药园", "维护"] },
      { cmd: ".除虫", desc: "处理药园虫害", params: " <地块>", tags: ["黄枫谷", "药园", "维护"] },
      { cmd: ".浇水", desc: "给灵田浇水", params: " <地块>", tags: ["黄枫谷", "药园", "维护"] },
      { cmd: ".扩建药园", desc: "增加灵田数量", params: null, note: "上限11块", tags: ["黄枫谷", "扩建", "药园"] },
      { cmd: ".晋升长老", desc: "晋升丹道长老解锁专属灵田", params: null, note: "筑基中期可尝试", tags: ["黄枫谷", "晋升", "长老"] },
      { cmd: ".洞天寻宝", desc: "在9-11号灵田探寻秘境", params: " <地块>", note: "太上长老专属", tags: ["黄枫谷", "寻宝", "秘境"] },
    ]
  },

  // ===== 5. 太一门 =====
  {
    name: "太一门",
    icon: "🔮",
    commands: [
      { cmd: ".引道", desc: "参悟大道获得神识和增益", params: " <金/木/水/火/土>", choices: ["金","木","水","火","土"], note: "冷却12h；获得100神识；增益12h", tags: ["太一门", "引道", "增益", "五行"] },
      { cmd: ".神识冲击", desc: "对斗法失败方进行追击", params: null, note: "需回复斗法战报；消耗100神识", reply: true, tags: ["太一门", "神识", "战斗"] },
    ]
  },

  // ===== 6. 星宫 =====
  {
    name: "星宫",
    icon: "✨",
    commands: [
      { cmd: ".我的侍妾", desc: "查看道心侍妾状态", params: null, tags: ["星宫", "侍妾"] },
      { cmd: ".每日问安", desc: "提升侍妾情缘", params: null, note: "每次+30情缘", tags: ["星宫", "侍妾", "每日"] },
      { cmd: ".赠予侍妾", desc: "送礼给侍妾", params: " <物品>", tags: ["星宫", "侍妾", "礼物"] },
      { cmd: ".灵力反哺", desc: "侍妾返还修为", params: null, tags: ["星宫", "侍妾", "修为"] },
      { cmd: ".侍妾卜算", desc: "侍妾占卜", params: null, tags: ["星宫", "侍妾", "占卜"] },
      { cmd: ".启阵", desc: "开启周天星斗大阵", params: null, note: "等他人助阵", tags: ["星宫", "星阵", "开启"] },
      { cmd: ".助阵", desc: "参与星阵", params: null, note: "需回复启阵消息；个人冷却12h", reply: true, tags: ["星宫", "星阵", "参与"] },
      { cmd: ".观星", desc: "推演世界事件", params: null, note: "每日1次", tags: ["星宫", "观星", "推演"] },
      { cmd: ".改换星移", desc: "转移观星结果", params: " @目标", note: "需回复观星结果", reply: true, tags: ["星宫", "观星", "转移"] },
      { cmd: ".观星台", desc: "查看引星盘状态", params: null, tags: ["星宫", "观星台", "引星盘"] },
      { cmd: ".牵引星辰", desc: "在引星盘凝聚材料", params: " <编号> <星名>", note: "消耗修为", tags: ["星宫", "星辰", "牵引"] },
      { cmd: ".安抚星辰", desc: "处理引星盘异变", params: " <编号>", note: "不带编号处理全部", tags: ["星宫", "星辰", "安抚"] },
      { cmd: ".收集精华", desc: "收取星辰凝聚产物", params: " <编号>", note: "情缘500后有双倍判定", tags: ["星宫", "星辰", "收集"] },
      { cmd: ".扩建星台", desc: "增加引星盘数量", params: null, note: "消耗贡献", tags: ["星宫", "扩建", "观星台"] },
      { cmd: ".晋升星宫长老", desc: "晋升长老解锁天雷星", params: null, note: "5000贡献+结丹中期以上", tags: ["星宫", "晋升", "长老"] },
    ]
  },

  // ===== 7. 凌霄宫 =====
  {
    name: "凌霄宫",
    icon: "☁️",
    commands: [
      { cmd: ".凌霄宫", desc: "查看凌霄宫总览", params: null, tags: ["凌霄宫", "查看"] },
      { cmd: ".天阶状态", desc: "查看云阶进度与冷却", params: null, tags: ["凌霄宫", "天阶", "状态"] },
      { cmd: ".问心台", desc: "获得登阶加持", params: null, note: "每日1次", tags: ["凌霄宫", "问心", "增益"] },
      { cmd: ".登天阶", desc: "攀登云阶获取奖励", params: null, note: "默认冷却4h", tags: ["凌霄宫", "登阶", "修炼"] },
      { cmd: ".引九天罡风", desc: "罡风淬体稳固根基", params: null, note: "1周天后解锁；冷却12h；消耗260修为", tags: ["凌霄宫", "罡风", "淬体"] },
      { cmd: ".借天门势", desc: "短时间强化斗法战力", params: null, note: "3周天后解锁；冷却18h；消耗880修为；持续6h", tags: ["凌霄宫", "天门", "战力"] },
      { cmd: ".晋升凌霄长老", desc: "缩短登阶冷却", params: null, note: "结丹初期+4200贡献", tags: ["凌霄宫", "晋升", "长老"] },
      { cmd: ".晋升凌霄太上长老", desc: "竞逐唯一太上长老", params: " <总贡献> <总灵石>", note: "结丹后期+风雷翅+20000贡献+50000灵石", tags: ["凌霄宫", "晋升", "太上长老"] },
    ]
  },

  // ===== 8. 合欢宗 =====
  {
    name: "合欢宗",
    icon: "🌸",
    commands: [
      { cmd: ".闭关双修", desc: "与人双修获取修为", params: null, note: "炼气四层可用；合欢宗收益+10%", reply: true, tags: ["合欢宗", "双修", "修炼"] },
      { cmd: ".缔结同参", desc: "建立7日契印", params: " @目标", tags: ["合欢宗", "同参", "契印"] },
      { cmd: ".结印", desc: "确认同参邀请", params: null, tags: ["合欢宗", "同参", "确认"] },
      { cmd: ".双修 温养", desc: "同参状态下温养修炼", params: null, note: "收益更高", reply: true, tags: ["合欢宗", "双修", "温养"] },
      { cmd: ".种下心印", desc: "对目标发起心神之战", params: " @目标", note: "目标境界不能高于自己", tags: ["合欢宗", "心印", "控制"] },
      { cmd: ".双修 采补", desc: "采补炉鼎获取修为", params: null, note: "目标需处于炉鼎状态", reply: true, tags: ["合欢宗", "双修", "采补"] },
      { cmd: ".挣脱心印", desc: "反抗心印控制", params: null, note: "炉鼎方可用", tags: ["合欢宗", "心印", "反抗"] },
    ]
  },

  // ===== 9. 阴罗宗 =====
  {
    name: "阴罗宗",
    icon: "🩸",
    commands: [
      { cmd: ".我的阴罗幡", desc: "查看幡体等阶/煞气/魂魄/炼化槽", params: null, tags: ["阴罗宗", "阴罗幡", "查看"] },
      { cmd: ".升级阴罗幡", desc: "提升幡旗品阶", params: null, note: "解锁槽位、提高煞气上限", tags: ["阴罗宗", "阴罗幡", "升级"] },
      { cmd: ".每日献祭", desc: "补充煞气", params: null, note: "杀戮值越高收益越多", tags: ["阴罗宗", "献祭", "每日", "煞气"] },
      { cmd: ".化功为煞", desc: "修为转煞气", params: " <修为值>", note: "5:1转换；有反噬风险", tags: ["阴罗宗", "煞气", "转化"] },
      { cmd: ".血洗山林", desc: "获取妖兽精魄", params: null, note: "冷却4h", tags: ["阴罗宗", "PVE", "精魄"] },
      { cmd: ".召唤魔影", desc: "召唤魔域投影获取凶兽戾魄", params: null, note: "结丹期可用；冷却24h", tags: ["阴罗宗", "PVE", "戾魄"] },
      { cmd: ".囚禁魂魄", desc: "将魂魄打入槽位开始炼化", params: " <槽位> <魂魄名>", tags: ["阴罗宗", "炼魂", "炼化"] },
      { cmd: ".收取精华", desc: "收取炼化产物", params: " <槽位>", tags: ["阴罗宗", "炼魂", "收取"] },
      { cmd: ".一键收取精华", desc: "批量收取所有炼化产物", params: null, tags: ["阴罗宗", "炼魂", "一键"] },
      { cmd: ".安抚幡灵", desc: "修复异常炼化槽", params: " <槽位>", note: "消耗修为", tags: ["阴罗宗", "炼魂", "安抚"] },
      { cmd: ".一键安抚幡灵", desc: "批量修复异常槽", params: null, note: "消耗修为", tags: ["阴罗宗", "炼魂", "一键"] },
      { cmd: ".下咒", desc: "对目标施丹魔侵蚀", params: " @目标", note: "消耗丹魔心萃+500修为", tags: ["阴罗宗", "咒术", "下咒"] },
      { cmd: ".收割", desc: "收割下咒吸取的修为", params: null, note: "仅施咒者可用", tags: ["阴罗宗", "咒术", "收割"] },
      { cmd: ".血咒四方", desc: "群体施咒", params: " <敌对宗门名>", note: "结丹期可用；消耗极大", tags: ["阴罗宗", "咒术", "群体"] },
      { cmd: ".夺舍", desc: "奴役对方神魂", params: " @目标", note: "筑基期可用；持续35min；冷却3h", tags: ["阴罗宗", "夺舍", "控制"] },
      { cmd: ".魔染红尘", desc: "掳走星宫弟子侍妾", params: null, note: "需回复星宫弟子；持续24h", reply: true, tags: ["阴罗宗", "魔染", "侍妾"] },
    ]
  },

  // ===== 10. 万灵宗 =====
  {
    name: "万灵宗",
    icon: "🐾",
    commands: [
      { cmd: ".寻觅灵兽", desc: "搜索并驯化灵兽", params: null, note: "基础冷却6h；风雷翅4.2h", tags: ["万灵宗", "灵兽", "寻找"] },
      { cmd: ".我的灵兽", desc: "查看灵兽状态", params: null, tags: ["万灵宗", "灵兽", "查看"] },
      { cmd: ".喂养", desc: "喂养灵兽提升等级/战力", params: " <灵兽名> <物品名>*<数量>", tags: ["万灵宗", "灵兽", "喂养"] },
      { cmd: ".灵兽出战", desc: "指定灵兽助战", params: " <灵兽名>", tags: ["万灵宗", "灵兽", "出战"] },
      { cmd: ".灵兽休息", desc: "召回所有出战灵兽", params: null, tags: ["万灵宗", "灵兽", "休息"] },
      { cmd: ".灵兽改名", desc: "为灵兽改名", params: " <旧名字> <新名字>", tags: ["万灵宗", "灵兽", "改名"] },
      { cmd: ".放生", desc: "放归灵兽", params: " <灵兽名>", note: "谨慎使用", tags: ["万灵宗", "灵兽", "放生"] },
      { cmd: ".一键放养", desc: "灵兽外出觅食4h", params: null, tags: ["万灵宗", "灵兽", "一键"] },
      { cmd: ".灵兽偷菜", desc: "偷黄枫谷药园灵草", params: null, note: "失败会受伤；有保底", tags: ["万灵宗", "灵兽", "偷菜"] },
      { cmd: ".寄养灵兽", desc: "寄养到小世界", params: " <灵兽名>", note: "化神修士叛宗前保护灵兽", tags: ["万灵宗", "灵兽", "寄养"] },
      { cmd: ".召回灵兽", desc: "召回寄养的灵兽", params: null, note: "重新拜入万灵宗后可用", tags: ["万灵宗", "灵兽", "召回"] },
      { cmd: ".探渊", desc: "探索万兽渊", params: null, note: "化神期可用", tags: ["万灵宗", "探渊", "探索"] },
    ]
  },

  // ===== 11. 落云宗 =====
  {
    name: "落云宗",
    icon: "🌳",
    commands: [
      { cmd: ".灵树状态", desc: "查看灵树状态/贡献榜", params: null, tags: ["落云宗", "灵树", "状态"] },
      { cmd: ".灵树灌溉", desc: "注入灵力增加贡献", params: null, note: "消耗300修为；环境每小时变化", tags: ["落云宗", "灵树", "灌溉"] },
      { cmd: ".协同守山", desc: "抵御古剑门入侵", params: null, note: "事件触发时可用", tags: ["落云宗", "灵树", "守山"] },
      { cmd: ".采摘灵果", desc: "领取灵树成熟奖励", params: null, note: "有贡献者可采摘一次", tags: ["落云宗", "灵树", "采摘"] },
    ]
  },

  // ===== 12. 元婴宗 =====
  {
    name: "元婴宗",
    icon: "👶",
    commands: [
      { cmd: ".元婴状态", desc: "查看元婴等级/经验/状态", params: null, tags: ["元婴宗", "元婴", "查看"] },
      { cmd: ".元婴出窍", desc: "元婴神游寻宝8h", params: null, note: "元婴期可用；未完成召回无收益", tags: ["元婴宗", "元婴", "寻宝"] },
      { cmd: ".元婴闭关", desc: "元婴自动修炼增修为", params: null, note: "元婴宗专属；每8h阶段结算", tags: ["元婴宗", "元婴", "闭关"] },
      { cmd: ".元婴归窍", desc: "召回元婴并结算", params: null, note: "闭关则结算；出窍则中断无收益", tags: ["元婴宗", "元婴", "召回"] },
      { cmd: ".探寻裂缝", desc: "寻找法则碎片和化神机缘", params: null, note: "元婴期可用；冷却12h", tags: ["元婴宗", "化神", "法则"] },
      { cmd: ".问道", desc: "向化神长老请教", params: null, note: "元婴宗专属；消耗1000修为；冷却12h", tags: ["元婴宗", "问道", "机缘"] },
      { cmd: ".参悟功法 青元剑诀", desc: "学习青元剑诀", params: null, note: "需集齐上中下三卷残本", tags: ["元婴宗", "功法", "青元剑诀"] },
    ]
  },

  // ===== 13. 天星宗 =====
  {
    name: "天星宗",
    icon: "☯️",
    commands: [
      { cmd: ".观命", desc: "查看今日命星", params: null, tags: ["天星宗", "观命", "命星"] },
      { cmd: ".定命", desc: "锁定今日命星主修路线", params: " <天府-紫微-贪狼-太阴>", choices: ["天府","紫微","贪狼","太阴"], tags: ["天星宗", "定命", "命星"] },
      { cmd: ".推命", desc: "押注接下来的路线", params: " <闭关-炼制-探索-斗法>", choices: ["闭关","炼制","探索","斗法"], note: "有效期8h；命中积攒天机值", tags: ["天星宗", "推命", "天机"] },
      { cmd: ".改命", desc: "改换推命路线", params: " <闭关-炼制-探索-斗法>", choices: ["闭关","炼制","探索","斗法"], note: "使用天机值", tags: ["天星宗", "改命", "天机"] },
      { cmd: ".天机盘", desc: "查看推命/改命与逆命劫", params: null, tags: ["天星宗", "天机盘", "查看"] },
    ]
  },

  // ===== 14. 战斗试炼 =====
  {
    name: "战斗试炼",
    icon: "⚔️",
    commands: [
      { cmd: ".斗法", desc: "发起斗法", params: null, note: "每日神念限制约10次", tags: ["战斗", "斗法", "PVP"] },
      { cmd: ".决斗", desc: "发起决斗", params: null, note: "计入战斗限制", tags: ["战斗", "决斗", "PVP"] },
      { cmd: ".修为榜", desc: "查看修为排行", params: null, tags: ["战斗", "排行", "修为"] },
      { cmd: ".恶人榜", desc: "查看杀戮排行", params: null, tags: ["战斗", "排行", "杀戮"] },
      { cmd: ".我的仇敌", desc: "查看仇敌名单", params: null, note: "对仇敌斗法战力+5%", tags: ["战斗", "仇敌", "复仇"] },
      { cmd: ".切磋木人", desc: "测试战力", params: " <境界>", note: "消耗1灵石；冷却2min；不掉修为", tags: ["战斗", "测试", "木人"] },
      { cmd: ".战力", desc: "测试对某境界战力", params: " <境界>", note: "不消耗灵石", tags: ["战斗", "测试", "战力"] },
      { cmd: ".天机遭遇战", desc: "查看/设置遭遇战", params: null, note: "每日最多2次", tags: ["战斗", "遭遇战"] },
      { cmd: ".天机遭遇战谨慎", desc: "遭遇战优先避让", params: null, tags: ["战斗", "遭遇战"] },
      { cmd: ".天机遭遇战均衡", desc: "遭遇战试探交锋", params: null, tags: ["战斗", "遭遇战"] },
      { cmd: ".天机遭遇战夺宝", desc: "遭遇战主动争利", params: null, tags: ["战斗", "遭遇战"] },
      { cmd: ".天机遭遇战关闭", desc: "退出遭遇池", params: null, tags: ["战斗", "遭遇战"] },
      { cmd: ".遭遇记录", desc: "查看最近遭遇", params: null, tags: ["战斗", "遭遇战", "记录"] },
      { cmd: ".我的阵法", desc: "查看已学和已激活阵法", params: null, tags: ["战斗", "阵法", "查看"] },
      { cmd: ".布阵", desc: "激活防护阵法", params: " <阵法名>", note: "消耗灵石与修为", tags: ["战斗", "阵法", "布阵"] },
      { cmd: ".撤阵", desc: "关闭当前阵法", params: null, tags: ["战斗", "阵法", "撤阵"] },
      { cmd: ".闯塔", desc: "挑战试炼古塔", params: null, note: "每日1次免费", tags: ["战斗", "古塔", "闯塔"] },
      { cmd: ".继续闯塔", desc: "继续古塔挑战", params: null, tags: ["战斗", "古塔", "继续"] },
      { cmd: ".退出古塔", desc: "退出古塔挑战", params: null, tags: ["战斗", "古塔", "退出"] },
      { cmd: ".琉璃塔榜", desc: "查看古塔排行", params: null, tags: ["战斗", "古塔", "排行"] },
      { cmd: ".重置古塔", desc: "消耗修为换额外挑战", params: null, tags: ["战斗", "古塔", "重置"] },
    ]
  },

  // ===== 15. 法宝器灵 =====
  {
    name: "法宝器灵",
    icon: "🗡️",
    commands: [
      { cmd: ".学习", desc: "学习配方（炼制前置）", params: " <图纸/丹方名>", tags: ["法宝", "学习", "配方"] },
      { cmd: ".炼制", desc: "炼制物品", params: " <物品名>*<数量>", note: "单独输入可看已学配方", tags: ["法宝", "炼制", "制造"] },
      { cmd: ".修理", desc: "修复法宝耐久", params: " <法宝名>", note: "消耗灵石和修为", tags: ["法宝", "修理", "耐久"] },
      { cmd: ".一键修理", desc: "批量修复法宝", params: null, tags: ["法宝", "修理", "一键"] },
      { cmd: ".卸下法宝", desc: "卸下装备的法宝", params: null, tags: ["法宝", "卸下", "装备"] },
      { cmd: ".炼剑", desc: "重铸青竹蜂云剑（神雷版）", params: null, note: "需72把青竹蜂云剑+72天雷竹", tags: ["法宝", "炼剑", "青竹蜂云剑"] },
      { cmd: ".唤醒器灵", desc: "为法宝唤醒器灵", params: " <法宝名>", note: "灵石×5000+养魂木×20；唤醒后绑定", tags: ["法宝", "器灵", "唤醒"] },
      { cmd: ".抚摸法宝", desc: "提升器灵默契和经验", params: " <法宝名>", note: "冷却120min", tags: ["法宝", "器灵", "抚摸"] },
      { cmd: ".温养器灵", desc: "深度温养器灵", params: " <法宝名>", note: "灵石×3000+养魂木×3；冷却6h", tags: ["法宝", "器灵", "温养"] },
      { cmd: ".我的器灵", desc: "查看所有器灵", params: null, tags: ["法宝", "器灵", "查看"] },
      { cmd: ".器灵", desc: "查看特定器灵详情", params: " <法宝名/器灵名>", tags: ["法宝", "器灵", "详情"] },
      { cmd: ".器灵护主", desc: "器灵爆发临时增益", params: " <法宝名>", note: "持续1h；冷却12h", tags: ["法宝", "器灵", "爆发"] },
      { cmd: ".催发器灵", desc: "同器灵护主", params: " <法宝名>", tags: ["法宝", "器灵", "爆发"] },
    ]
  },

  // ===== 16. 洞府经营 =====
  {
    name: "洞府经营",
    icon: "🏠",
    commands: [
      { cmd: ".洞府", desc: "查看洞府总览", params: null, tags: ["洞府", "查看"] },
      { cmd: ".开辟洞府", desc: "开辟专属洞府", params: null, note: "筑基初期+灵石500+二级妖丹5", tags: ["洞府", "开辟"] },
      { cmd: ".升级灵脉", desc: "提升灵气产出", params: null, tags: ["洞府", "灵脉", "升级"] },
      { cmd: ".升级静室", desc: "提升灵气转修为效率", params: null, tags: ["洞府", "静室", "升级"] },
      { cmd: ".升级丹房", desc: "提升炼丹成功率", params: null, tags: ["洞府", "丹房", "升级"] },
      { cmd: ".升级器室", desc: "降低修理费用", params: null, tags: ["洞府", "器室", "升级"] },
      { cmd: ".升级大阵", desc: "提升护府灵阵", params: null, tags: ["洞府", "大阵", "升级"] },
      { cmd: ".切换阵势 聚灵", desc: "提升灵脉产出", params: null, tags: ["洞府", "阵势", "聚灵"] },
      { cmd: ".切换阵势 守府", desc: "洞府防护", params: null, tags: ["洞府", "阵势", "守府"] },
      { cmd: ".切换阵势 迎客", desc: "访客与往来", params: null, tags: ["洞府", "阵势", "迎客"] },
      { cmd: ".洞天绘卷", desc: "查看洞府景观", params: null, tags: ["洞府", "景观", "绘卷"] },
      { cmd: ".布置景观", desc: "布置洞府景观", params: " <景观名>", tags: ["洞府", "景观", "布置"] },
      { cmd: ".上架至万宝阁", desc: "展示珍宝", params: " <物品名>", note: "最多展示3件", tags: ["洞府", "万宝阁", "展示"] },
      { cmd: ".从万宝阁取下", desc: "取回展品", params: " <物品名>", tags: ["洞府", "万宝阁", "取下"] },
      { cmd: ".查看访客", desc: "查看洞府访客", params: null, note: "需5分钟内处理", tags: ["洞府", "访客", "查看"] },
      { cmd: ".接待访客", desc: "接待访客触发机缘", params: null, tags: ["洞府", "访客", "接待"] },
      { cmd: ".驱逐访客", desc: "驱逐访客", params: null, tags: ["洞府", "访客", "驱逐"] },
      { cmd: ".拜访洞府", desc: "参观他人洞府", params: " @用户名", tags: ["洞府", "拜访", "社交"] },
      { cmd: ".洞府留言", desc: "在他人洞府留言", params: " <内容>", tags: ["洞府", "留言", "社交"] },
      { cmd: ".查看留言", desc: "查看自家访客留言", params: null, tags: ["洞府", "留言", "查看"] },
    ]
  },

  // ===== 17. 副本挑战 =====
  {
    name: "副本挑战",
    icon: "🏯",
    commands: [
      { cmd: ".开启血色试炼", desc: "创建血色试炼房间", params: null, note: "1-3人；炼气五层-筑基后期", tags: ["副本", "血色试炼", "创建"] },
      { cmd: ".加入血色试炼", desc: "加入血色试炼队伍", params: " <房间ID>", tags: ["副本", "血色试炼", "加入"] },
      { cmd: ".进入血色试炼", desc: "出发血色试炼", params: null, note: "队长使用", tags: ["副本", "血色试炼", "出发"] },
      { cmd: ".血色抉择", desc: "选择路线或撤离", params: " 1/2/3/4", choices: ["1","2","3","4"], note: "队长操作", tags: ["副本", "血色试炼", "抉择"] },
      { cmd: ".血色试炼状态", desc: "查看回合/血雾/药篓", params: null, tags: ["副本", "血色试炼", "状态"] },
      { cmd: ".血色试炼奖励", desc: "查看奖励", params: null, tags: ["副本", "血色试炼", "奖励"] },
      { cmd: ".解散血色试炼", desc: "解散房间", params: null, note: "队长使用", tags: ["副本", "血色试炼", "解散"] },
      { cmd: ".开启虚天殿", desc: "创建虚天殿房间", params: null, note: "消耗1张虚天残图；5人副本", tags: ["副本", "虚天殿", "创建"] },
      { cmd: ".加入副本", desc: "加入虚天殿队伍", params: " <房间ID>", tags: ["副本", "虚天殿", "加入"] },
      { cmd: ".请离", desc: "请离队员", params: " @道友", note: "队长使用", tags: ["副本", "虚天殿", "请离"] },
      { cmd: ".进入虚天殿", desc: "满员出发", params: null, note: "队长使用", tags: ["副本", "虚天殿", "出发"] },
      { cmd: ".选择道路", desc: "选择冰路或火路", params: " 冰/火", choices: ["冰","火"], note: "队长操作", tags: ["副本", "虚天殿", "选择"] },
      { cmd: ".争鼎", desc: "最终争宝选择", params: " 求稳/夺鼎", choices: ["求稳","夺鼎"], note: "队长操作", tags: ["副本", "虚天殿", "争鼎"] },
      { cmd: ".虚天殿奖励", desc: "查看奖励池", params: null, tags: ["副本", "虚天殿", "奖励"] },
      { cmd: ".解散副本", desc: "解散副本房间", params: null, note: "未出发返还残图", tags: ["副本", "虚天殿", "解散"] },
      { cmd: ".开启昆吾山", desc: "创建昆吾山房间", params: null, note: "需昆吾通行令；最多3人", tags: ["副本", "昆吾山", "创建"] },
      { cmd: ".加入昆吾山", desc: "加入昆吾山队伍", params: " <房间ID>", tags: ["副本", "昆吾山", "加入"] },
      { cmd: ".进入昆吾山", desc: "队长带队出发", params: null, tags: ["副本", "昆吾山", "出发"] },
      { cmd: ".选择岔路", desc: "选择楼层岔路", params: " <编号>", note: "队长操作", tags: ["副本", "昆吾山", "选择"] },
      { cmd: ".昆吾山奖励", desc: "查看奖励说明", params: null, tags: ["副本", "昆吾山", "奖励"] },
      { cmd: ".解散昆吾山", desc: "解散房间", params: null, note: "队长使用", tags: ["副本", "昆吾山", "解散"] },
      { cmd: ".催动挪移令", desc: "使用大挪移令", params: null, note: "登顶奖励", tags: ["副本", "昆吾山", "挪移"] },
      { cmd: ".开启坠魔谷", desc: "创建坠魔谷房间", params: null, note: "消耗1枚禁制令；5人副本", tags: ["副本", "坠魔谷", "创建"] },
      { cmd: ".加入坠魔谷", desc: "加入坠魔谷队伍", params: " <房间ID>", tags: ["副本", "坠魔谷", "加入"] },
      { cmd: ".进入坠魔谷", desc: "满员开本", params: null, note: "队长使用", tags: ["副本", "坠魔谷", "出发"] },
      { cmd: ".坠魔抉择", desc: "副本内选择", params: " 路径1/路径2/路径3", choices: ["路径1","路径2","路径3"], note: "队长操作", tags: ["副本", "坠魔谷", "抉择"] },
      { cmd: ".坠魔谷状态", desc: "查看进度/魔染/封印/士气", params: null, tags: ["副本", "坠魔谷", "状态"] },
      { cmd: ".坠魔谷奖励", desc: "查看奖励池", params: null, tags: ["副本", "坠魔谷", "奖励"] },
      { cmd: ".解散坠魔谷", desc: "解散房间", params: null, note: "未出发返还禁制令", tags: ["副本", "坠魔谷", "解散"] },
      { cmd: ".按图索骥", desc: "合成通天灵宝", params: null, note: "需集齐4块残片", tags: ["副本", "灵宝", "合成"] },
    ]
  },

  // ===== 18. 交易经济 =====
  {
    name: "交易经济",
    icon: "💰",
    commands: [
      { cmd: ".上架", desc: "在万宝楼出售物品", params: " <物品名>*<数量> 换 <所需物品>*<总数>", tags: ["交易", "万宝楼", "上架"] },
      { cmd: ".万宝楼", desc: "查看万宝楼商品", params: null, note: "支持翻页/搜索/筛选", tags: ["交易", "万宝楼", "浏览"] },
      { cmd: ".万宝楼 搜索", desc: "搜索万宝楼商品", params: " <物品名>", tags: ["交易", "万宝楼", "搜索"] },
      { cmd: ".万宝楼 筛选", desc: "按类型筛选商品", params: " <丹药/法宝/材料/图纸/种子>", choices: ["丹药","法宝","材料","图纸","种子"], tags: ["交易", "万宝楼", "筛选"] },
      { cmd: ".购买", desc: "购买万宝楼商品", params: " <挂单ID>*<数量>", tags: ["交易", "万宝楼", "购买"] },
      { cmd: ".我的货摊", desc: "查看自己挂单", params: null, tags: ["交易", "万宝楼", "货摊"] },
      { cmd: ".下架", desc: "收回万宝楼商品", params: " <挂单ID>", tags: ["交易", "万宝楼", "下架"] },
      { cmd: ".赠送", desc: "赠送物品给他人", params: " <物品名>*<数量>", note: "需回复对方消息；有因果税", reply: true, tags: ["交易", "赠送", "转移"] },
      { cmd: ".拍卖", desc: "上架物品进行拍卖", params: " <物品名>*<数量> 起拍价 <价格> 时长 <小时>", tags: ["交易", "拍卖", "上架"] },
      { cmd: ".拍卖行", desc: "查看拍卖列表", params: null, tags: ["交易", "拍卖", "浏览"] },
      { cmd: ".竞拍", desc: "出价竞拍", params: " <拍卖ID> <价格>", tags: ["交易", "拍卖", "竞拍"] },
      { cmd: ".撤销拍卖", desc: "卖家撤拍", params: " <拍卖ID>", tags: ["交易", "拍卖", "撤销"] },
      { cmd: ".股市", desc: "查看市场大盘", params: null, tags: ["交易", "股市", "大盘"] },
      { cmd: ".大盘", desc: "同.股市", params: null, tags: ["交易", "股市", "大盘"] },
      { cmd: ".个股", desc: "查看个股详情", params: " <代码>", tags: ["交易", "股市", "个股"] },
      { cmd: ".风向", desc: "查看韩天尊建议", params: null, tags: ["交易", "股市", "建议"] },
      { cmd: ".买入", desc: "买入股票", params: " <代码> <金额>", tags: ["交易", "股市", "买入"] },
      { cmd: ".卖出", desc: "卖出股票", params: " <代码> <数量/全部>", tags: ["交易", "股市", "卖出"] },
      { cmd: ".我的持仓", desc: "查看持仓盈亏", params: null, tags: ["交易", "股市", "持仓"] },
      { cmd: ".融资买入", desc: "2倍杠杆买入", params: " <代码> <本金>", note: "结丹期解锁", tags: ["交易", "股市", "融资"] },
      { cmd: ".融资平仓", desc: "卖出融资仓", params: " <代码>", tags: ["交易", "股市", "融资"] },
      { cmd: ".股市任务", desc: "查看每日股市任务", params: null, tags: ["交易", "股市", "任务"] },
      { cmd: ".领股息", desc: "领取股息", params: null, note: "需持仓满24h", tags: ["交易", "股市", "股息"] },
      { cmd: ".发布悬赏", desc: "悬赏项上人头", params: " @目标 <灵石>", note: "最低1000灵石", tags: ["交易", "悬赏", "发布"] },
      { cmd: ".悬赏榜", desc: "查看悬赏列表", params: null, tags: ["交易", "悬赏", "查看"] },
      { cmd: ".接单", desc: "接取悬赏任务", params: " <悬赏ID>", tags: ["交易", "悬赏", "接单"] },
      { cmd: ".放弃任务", desc: "放弃悬赏任务", params: " <ID>", note: "有违约金", tags: ["交易", "悬赏", "放弃"] },
      { cmd: ".撤销悬赏", desc: "撤销未被接取的悬赏", params: null, tags: ["交易", "悬赏", "撤销"] },
      { cmd: ".氪金", desc: "打开商城入口", params: null, tags: ["交易", "商城", "氪金"] },
      { cmd: ".小卖部", desc: "打开材料商店", params: null, tags: ["交易", "商城", "小卖部"] },
      { cmd: ".佩戴徽章", desc: "佩戴徽章", params: " <徽章名>", tags: ["交易", "徽章", "佩戴"] },
      { cmd: ".亲吻徽章", desc: "触发始皇的新衣主动效果", params: null, note: "战力+15%，持续1h，冷却12h", tags: ["交易", "徽章", "主动"] },
    ]
  },

  // ===== 19. 其他玩法 =====
  {
    name: "其他玩法",
    icon: "🎲",
    commands: [
      { cmd: ".鬼赌坊", desc: "查看赌坊玩法", params: null, tags: ["赌坊", "查看"] },
      { cmd: ".押", desc: "天机骰押注", params: " <类型> <金额>", tags: ["赌坊", "天机骰", "押注"] },
      { cmd: ".对赌", desc: "玲珑骰1v1对赌", params: " <金额>", note: "回复他人发起", reply: true, tags: ["赌坊", "玲珑骰", "对赌"] },
      { cmd: ".应战", desc: "接受对赌", params: null, tags: ["赌坊", "玲珑骰", "应战"] },
      { cmd: ".神识对决", desc: "21点类玩法", params: " <金额>", note: "回复他人发起", reply: true, tags: ["赌坊", "神识对决", "21点"] },
      { cmd: ".接引", desc: "接受神识对决", params: null, tags: ["赌坊", "神识对决", "接受"] },
      { cmd: ".凝神", desc: "要牌（增加神识强度）", params: null, tags: ["赌坊", "神识对决", "要牌"] },
      { cmd: ".固元", desc: "停牌", params: null, tags: ["赌坊", "神识对决", "停牌"] },
      { cmd: ".六道轮回盘", desc: "查看彩票奖池", params: null, tags: ["赌坊", "彩票", "六道轮回"] },
      { cmd: ".卜卦", desc: "彩票自选号码", params: " <红1,红2...红6> <蓝>", tags: ["赌坊", "彩票", "卜卦"] },
      { cmd: ".卜卦 机选", desc: "彩票随机号码", params: " <数量>", tags: ["赌坊", "彩票", "机选"] },
      { cmd: ".我的赌册", desc: "查看赌博记录", params: null, tags: ["赌坊", "记录"] },
      { cmd: ".卜玉简", desc: "天命玉简闯关", params: " <金额>", tags: ["赌坊", "玉简"] },
      { cmd: ".赌石", desc: "进入赌石坊", params: null, note: "支付500灵石", tags: ["赌坊", "赌石"] },
      { cmd: ".切", desc: "切开原石", params: " <编号>", tags: ["赌坊", "赌石", "切石"] },
      { cmd: ".天下大势", desc: "查看所有宗门外交关系", params: null, tags: ["外交", "天下大势", "查看"] },
      { cmd: ".宗门外交", desc: "查看本宗外交状态", params: null, tags: ["外交", "宗门", "查看"] },
      { cmd: ".示好", desc: "向宗门释放善意", params: " <宗门名>", note: "掌门专属", tags: ["外交", "示好", "掌门"] },
      { cmd: ".敌对", desc: "将宗门列为敌对", params: " <宗门名>", note: "掌门专属", tags: ["外交", "敌对", "掌门"] },
      { cmd: ".结盟", desc: "与友好宗门结盟", params: " <宗门名>", note: "掌门专属", tags: ["外交", "结盟", "掌门"] },
      { cmd: ".解除", desc: "解除外交关系", params: " <关系> <宗门名>", note: "掌门专属", tags: ["外交", "解除", "掌门"] },
      { cmd: ".立誓", desc: "选择心契誓约", params: " 护道/守秘/共修", choices: ["护道","守秘","共修"], tags: ["道侣", "誓约", "立誓"] },
      { cmd: ".毁誓", desc: "解除当前誓约", params: null, note: "有冷却", tags: ["道侣", "誓约", "毁誓"] },
      { cmd: ".安置侍妾", desc: "安置到藏娇阁", params: null, tags: ["道侣", "侍妾", "安置"] },
      { cmd: ".入梦寻图", desc: "寻找虚天残图碎片", params: null, note: "冷却8h", tags: ["道侣", "残图", "入梦"] },
      { cmd: ".残图", desc: "查看残图碎片", params: null, tags: ["道侣", "残图", "查看"] },
      { cmd: ".拼图", desc: "合成虚天残图", params: null, note: "需4/4碎片", tags: ["道侣", "残图", "合成"] },
      { cmd: ".共历心劫", desc: "触发心劫玩法", params: null, note: "冷却10h", tags: ["道侣", "心劫"] },
      { cmd: ".天机代卜", desc: "消耗修为换增益", params: null, note: "持续12h，冷却12h", tags: ["道侣", "天机", "增益"] },
      { cmd: ".奇袭 夺宝", desc: "风雷翅·无相劫掠", params: " @目标", note: "消耗2500修为；冷却6h", tags: ["战斗", "奇袭", "夺宝", "风雷翅"] },
      { cmd: ".奇袭 破阵", desc: "风雷翅·寂灭神雷", params: " @目标", note: "消耗2500修为；冷却6h", tags: ["战斗", "奇袭", "破阵", "风雷翅"] },
      { cmd: ".奇袭 瞬杀", desc: "风雷翅·血色惊雷", params: " @目标", note: "消耗2500修为；冷却6h；自身损失10%修为", tags: ["战斗", "奇袭", "瞬杀", "风雷翅"] },
      { cmd: ".冲击结丹", desc: "筑基→结丹", params: null, note: "需结丹三宝", tags: ["突破", "结丹"] },
      { cmd: ".冲击元婴", desc: "结丹→元婴", params: null, note: "需结婴三宝", tags: ["突破", "元婴"] },
      { cmd: ".五行淬体", desc: "化神前置", params: null, note: "金木水火土法则碎片各10", tags: ["突破", "化神", "五行"] },
      { cmd: ".冲击化神", desc: "元婴→化神", params: null, note: "需化神三宝+战力判定", tags: ["突破", "化神"] },
      { cmd: ".天机回溯", desc: "渡劫失败后回退", params: null, note: "消耗灵石与修为", tags: ["突破", "回溯", "渡劫"] },
      { cmd: ".改道号", desc: "修改道号", params: " <新道号>", note: "限时活动命令", tags: ["杂项", "道号", "改名"] },
      { cmd: ".赎罪", desc: "洗刷罪业", params: null, note: "被封禁者专属", tags: ["杂项", "赎罪"] },
      { cmd: ".静思悟道", desc: "减少杀戮值", params: null, note: "消耗资源", tags: ["杂项", "悟道", "杀戮"] },
      { cmd: ".中断悟道", desc: "退出悟道状态", params: null, tags: ["杂项", "悟道", "中断"] },
      { cmd: ".切换", desc: "切换操控角色", params: " <道号/ID/主魂>", note: "化身系统", tags: ["杂项", "化身", "切换"] },
      { cmd: ".兑换", desc: "兑换物品", params: " <物品名>*<数量>", note: "万宝楼/宗门宝库通用", tags: ["交易", "兑换"] },
    ]
  },
];
