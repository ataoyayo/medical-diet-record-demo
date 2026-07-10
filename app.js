const STORAGE_KEY = "lightBodyManagerMvpData";
const ANALYTICS_KEY = "lightBodyManagerMvpAnalytics";
const DEFAULT_RECORD_DATE = "2026-05-12";
const MEDICAL_DATE_START = "2026-05-01";
const MEDICAL_DATE_END = "2028-12-31";

const activityLevels = {
  sedentary: { label: "久坐少动", factor: 1.2 },
  light: { label: "轻度活动", factor: 1.375 },
  moderate: { label: "中度活动", factor: 1.55 },
  high: { label: "高活动量", factor: 1.725 },
  extreme: { label: "极高活动量", factor: 1.9 }
};

const goalLabels = {
  fat_loss: "减脂",
  maintain: "维持",
  muscle_gain: "增肌"
};

const dayStatusLabels = {
  rest: "休息日",
  normal: "普通活动日",
  workout: "运动日"
};

const exerciseCategories = {
  "有氧类": [
    "户外步行",
    "室内步行",
    "户外跑步",
    "室内跑步",
    "骑行",
    "动感单车",
    "椭圆机",
    "划船机",
    "跳绳",
    "爬楼梯"
  ],
  "力量与塑形": [
    "传统力量训练",
    "功能性力量训练",
    "核心训练",
    "HIIT",
    "普拉提",
    "瑜伽",
    "拉伸"
  ],
  "球类与运动": [
    "篮球",
    "足球",
    "羽毛球",
    "网球",
    "乒乓球",
    "游泳",
    "拳击 / 搏击"
  ],
  "户外": [
    "徒步",
    "徒步爬山",
    "登山"
  ]
};

const exerciseMETs = {
  "户外步行": 3.5,
  "室内步行": 3.0,
  "户外跑步": 8.5,
  "室内跑步": 8.0,
  "骑行": 6.8,
  "动感单车": 7.0,
  "椭圆机": 5.0,
  "划船机": 6.0,
  "跳绳": 10.0,
  "爬楼梯": 8.0,
  "传统力量训练": 4.5,
  "功能性力量训练": 5.5,
  "核心训练": 4.0,
  "HIIT": 8.0,
  "普拉提": 3.0,
  "瑜伽": 2.5,
  "拉伸": 2.0,
  "篮球": 6.5,
  "足球": 7.0,
  "羽毛球": 5.5,
  "网球": 7.0,
  "乒乓球": 4.0,
  "游泳": 7.0,
  "拳击 / 搏击": 8.0,
  "徒步": 5.0,
  "徒步爬山": 6.5,
  "登山": 7.5
};

const dietStyleLabels = {
  restaurant: "外食为主",
  home: "自己做饭为主",
  mixed: "混合"
};

const trackingPreferenceLabels = {
  quick_estimate: "快速估算",
  more_accurate: "较精确",
  manual_precise: "手动精确"
};

const confidenceLabels = {
  high: "高",
  medium: "中",
  medium_low: "中低",
  low: "低"
};

let data = null;
let currentDate = "";
let expandedDates = [];
let showNewDayForm = false;
let selectedMedicalIngredientCategory = "";
let selectedMedicalIngredientId = "";
let selectedMealTemplateId = "";
let visibleMealTemplateIds = [];
let selectedCookingMethod = "light_stir_fry";
let selectedMedicalVariantId = "";
let isMedicalSettingsEditing = false;
let medicalAdviceInputText = "";
let parsedMedicalAdviceResults = [];
let parsedMedicalAdviceMicroNotes = {};
let parsedMedicalAdviceReminderUpdates = null;
let parsedMedicalAdviceContext = null;
let medicalAdviceParserHasRun = false;
let isDatePickerOpen = false;
let calendarViewYear = 2026;
let calendarViewMonth = 5;
let medicalDraft = {
  ingredientWeight: "",
  sharedPeople: "2",
  userPortion: "1",
  eatAll: false,
  oilOption: "auto",
  customOilGrams: ""
};

let medicalArchiveState = {
  isOpen: false,
  rangeDays: 7,
  selectedDate: null,
  view: "list"
};
let activeSource = "restaurant";
let selectedTemplateId = "";
let activeIngredientCategory = "主食类";
let ingredientSearchQuery = "";
let currentEstimate = null;
let customRestaurantAddOns = [];
let showCustomAddonForm = false;

const restaurantAddOns = [
  { id: "friedEgg", name: "煎蛋", calories: 90, protein: 6, carbs: 0.5, fat: 7, aliases: ["煎鸡蛋"] },
  { id: "boiledEgg", name: "水煮蛋", calories: 70, protein: 6, carbs: 0.5, fat: 5, aliases: ["鸡蛋", "白煮蛋"] },
  { id: "mincedMeat", name: "肉末", calories: 120, protein: 10, carbs: 1, fat: 8, aliases: ["肉臊", "臊子"] },
  { id: "beefSlices", name: "牛肉片", calories: 150, protein: 18, carbs: 0, fat: 8, aliases: ["牛肉"] },
  { id: "sausage", name: "香肠", calories: 160, protein: 7, carbs: 6, fat: 12, aliases: ["肠"] },
  { id: "chickenFeet", name: "鸡脚", calories: 120, protein: 10, carbs: 3, fat: 7, aliases: ["鸡爪"] },
  { id: "tofu", name: "豆腐 / 豆干", calories: 100, protein: 9, carbs: 4, fat: 5, aliases: ["豆腐", "豆干"] },
  { id: "vegetables", name: "蔬菜", calories: 40, protein: 2, carbs: 7, fat: 0.5, aliases: ["青菜", "菜"] },
  { id: "extraNoodles", name: "加面 / 加粉", calories: 180, protein: 5, carbs: 38, fat: 1, aliases: ["加面", "加粉"] },
  { id: "extraRice", name: "加米饭", calories: 180, protein: 3, carbs: 40, fat: 0.5, aliases: ["加饭"] }
];

const restaurantTemplates = [
  ["重庆小面", "面条粉类", 560, 18, 78, 19],
  ["兰州拉面", "面条粉类", 590, 28, 82, 16],
  ["牛肉面", "面条粉类", 620, 30, 86, 18],
  ["热干面", "面条粉类", 650, 17, 92, 25],
  ["炸酱面", "面条粉类", 680, 24, 88, 26],
  ["螺蛳粉", "面条粉类", 720, 20, 96, 28],
  ["蛋炒饭", "炒饭炒面", 700, 20, 98, 24],
  ["炒面", "炒饭炒面", 760, 22, 100, 30],
  ["炒粉", "炒饭炒面", 740, 18, 102, 28],
  ["黄焖鸡米饭", "米饭套餐", 820, 38, 105, 27],
  ["卤肉饭", "米饭套餐", 780, 28, 96, 30],
  ["烧腊饭", "米饭套餐", 850, 36, 102, 32],
  ["盖浇饭", "米饭套餐", 760, 30, 100, 25],
  ["沙县鸡腿饭", "米饭套餐", 790, 35, 98, 28],
  // TODO: 后续可单独开发麻辣烫 / 冒菜组合构建器。
  ["素菜包", "早餐小吃", 180, 6, 32, 4, "medium", ["菜包", "青菜包", "素包子", "素包"]],
  ["猪肉包", "早餐小吃", 250, 10, 34, 9, "medium", ["肉包", "猪肉包子"]],
  ["牛肉包", "早餐小吃", 260, 11, 34, 10, "medium", ["牛肉包子"]],
  ["羊肉包", "早餐小吃", 280, 11, 34, 12, "medium", ["羊肉包子"]],
  ["奶黄包 / 甜包", "早餐小吃", 240, 6, 42, 6, "medium", ["甜包", "奶黄包子", "奶黄包"]],
  ["煎饼果子", "早餐小吃", 520, 18, 60, 22],
  ["肉夹馍", "早餐小吃", 480, 22, 48, 22],
  ["馄饨", "早餐小吃", 420, 20, 55, 13]
].map(toRestaurantTemplate);

const homeTemplates = [
  ["番茄炒蛋", 320, 17, 13, 22],
  ["青椒炒蛋", 300, 16, 10, 21],
  ["蒸蛋", 160, 12, 4, 10],
  ["煎蛋", 120, 7, 1, 9],
  ["青椒肉丝", 360, 30, 14, 20],
  ["鱼香肉丝", 460, 28, 32, 24],
  ["宫保鸡丁", 520, 36, 28, 30],
  ["回锅肉", 620, 28, 18, 50],
  ["西兰花炒牛肉", 380, 34, 16, 20],
  ["洋葱炒牛肉", 420, 32, 20, 23],
  ["西红柿牛腩", 480, 36, 18, 29],
  ["炒青菜", 160, 5, 12, 10],
  ["酸辣土豆丝", 260, 5, 38, 10],
  ["手撕包菜", 210, 6, 18, 13],
  ["蒜蓉西兰花", 190, 8, 16, 10],
  ["麻婆豆腐", 420, 24, 18, 28],
  ["家常豆腐", 430, 22, 20, 29],
  ["红烧肉", 720, 26, 20, 60],
  ["清蒸鱼", 300, 42, 3, 13],
  ["芹菜炒肉", 340, 28, 14, 18]
].map(toHomeTemplate);

const ingredientCategories = {
  "主食类": [
    ["米饭", "100g 熟重", 130, 2.4, 28, 0.3, ["白米饭", "熟米饭", "米饭"]],
    ["面条", "100g 熟重", 150, 5, 30, 1, ["面", "熟面条", "汤面"]],
    ["干面", "100g 干重", 350, 11, 72, 1.5, ["挂面", "干挂面", "干面条"]],
    ["馒头", "100g", 223, 7, 47, 1.1, ["白馒头", "馍"]],
    ["包子皮 / 面点皮", "100g", 230, 7, 48, 1.5, ["包子皮", "面皮", "面点"]],
    ["红薯", "100g", 86, 1.6, 20, 0.1, ["地瓜", "番薯"]],
    ["玉米", "100g", 112, 4, 22, 1.2, ["玉米粒", "甜玉米"]],
    ["土豆", "100g", 77, 2, 17, 0.1, ["马铃薯"]],
    ["燕麦", "100g 干重", 380, 13, 67, 7, ["燕麦片", "即食燕麦"]],
    ["粥", "100g", 46, 1.1, 10, 0.1, ["白粥", "大米粥", "稀饭"]],
    ["饺子皮", "100g", 250, 8, 52, 1, ["水饺皮"]],
    ["馄饨皮", "100g", 260, 8, 54, 1, ["云吞皮"]]
  ],
  "蛋白质类": [
    ["鸡蛋", "1个", 70, 6, 0.5, 5, ["蛋", "全蛋"]],
    ["猪瘦肉", "100g", 143, 20, 0, 6, ["瘦猪肉", "里脊肉", "猪里脊", "瘦肉"]],
    ["猪里脊", "100g", 150, 21, 0, 7, ["里脊肉", "猪里脊肉"]],
    ["猪梅花肉", "100g", 250, 18, 0, 20, ["梅花肉", "猪梅肉"]],
    ["猪五花肉", "100g", 500, 9, 0, 52, ["五花肉", "肥瘦肉", "猪五花"]],
    ["猪排骨", "100g", 278, 17, 0, 23, ["排骨", "肋排"]],
    ["猪肉末", "100g", 260, 17, 0, 21, ["肉末", "猪绞肉"]],
    ["猪肝", "100g", 129, 20, 3, 4, ["肝", "猪肝片"]],
    ["猪蹄", "100g", 260, 23, 0, 18, ["猪脚"]],
    ["鸡胸肉", "100g 熟重", 165, 31, 0, 3.6, ["鸡胸", "鸡肉"]],
    ["鸡腿肉", "100g 熟重", 210, 25, 0, 12, ["鸡腿", "去骨鸡腿肉"]],
    ["鸡翅", "100g", 220, 19, 0, 16, ["鸡中翅", "翅中"]],
    ["鸡爪", "100g", 254, 23, 3, 16, ["鸡脚", "凤爪"]],
    ["鸭肉", "100g", 240, 16, 0, 20, ["鸭子"]],
    ["鸭腿", "100g", 260, 18, 0, 21, ["鸭腿肉"]],
    ["鸭胸", "100g", 200, 22, 0, 12, ["鸭胸肉"]],
    ["牛肉", "100g", 200, 26, 0, 10, ["瘦牛肉"]],
    ["牛腩", "100g", 280, 18, 0, 22, ["牛腩肉"]],
    ["牛肉末", "100g", 250, 20, 0, 18, ["牛绞肉", "牛肉馅"]],
    ["肥牛卷", "100g", 320, 16, 0, 28, ["肥牛", "牛肉卷"]],
    ["牛排", "100g", 230, 24, 0, 14, ["牛扒"]],
    ["羊肉", "100g", 220, 20, 0, 15, ["羊腿肉"]],
    ["羊肉卷", "100g", 300, 16, 0, 26, ["羊肉片", "涮羊肉"]],
    ["羊排", "100g", 290, 18, 0, 24, ["羊肋排"]],
    ["鱼肉", "100g", 120, 20, 0, 4, ["鱼片", "白鱼肉"]],
    ["三文鱼", "100g", 208, 20, 0, 13, [" salmon ", "鲑鱼"]],
    ["鳕鱼", "100g", 90, 20, 0, 1, [" cod "]],
    ["鲈鱼", "100g", 105, 19, 0, 3, ["海鲈鱼"]],
    ["带鱼", "100g", 127, 18, 0, 5, ["刀鱼"]],
    ["虾仁", "100g", 99, 21, 1, 1, ["虾", "鲜虾"]],
    ["虾", "100g", 93, 20, 1, 1, ["鲜虾", "大虾"]],
    ["鱿鱼", "100g", 92, 16, 3, 1.5, [" squid "]],
    ["扇贝", "100g", 88, 17, 2, 1, ["贝柱", "干贝"]],
    ["蟹肉", "100g", 97, 19, 0, 1.5, ["螃蟹肉"]],
    ["火腿肠", "100g", 250, 12, 10, 18, ["香肠", "肠"]],
    ["午餐肉", "100g", 300, 13, 5, 26, ["罐头午餐肉"]],
    ["培根", "100g", 450, 14, 2, 42, ["bacon"]],
    ["香肠", "100g", 320, 13, 8, 28, ["腊香肠", "肠"]],
    ["腊肠", "100g", 420, 18, 12, 34, ["广式腊肠"]],
    ["鱼丸", "100g", 140, 10, 16, 4, ["鱼蛋"]],
    ["牛肉丸", "100g", 220, 14, 12, 14, ["牛丸"]],
    ["贡丸", "100g", 250, 12, 12, 17, ["猪肉丸"]],
    ["蟹棒", "100g", 95, 8, 13, 1, ["蟹柳", "蟹味棒"]],
    ["豆腐", "100g", 80, 8, 2, 5, ["老豆腐", "北豆腐"]],
    ["嫩豆腐", "100g", 55, 5, 2, 3, ["内酯豆腐", "软豆腐"]],
    ["豆干", "100g", 150, 16, 8, 7, ["香干", "豆腐干"]],
    ["腐竹", "100g 干重", 460, 45, 22, 22, ["腐皮"]],
    ["豆皮", "100g", 200, 20, 8, 10, ["油豆皮"]],
    ["千张", "100g", 260, 24, 12, 14, ["百叶", "豆腐皮"]],
    ["素鸡", "100g", 190, 16, 8, 10, ["素鸡豆制品"]],
    ["毛豆", "100g", 131, 13, 10, 5, ["青豆"]]
  ],
  "脂肪类": [
    ["食用油", "10g", 90, 0, 0, 10, ["油", "炒菜油", "植物油"]],
    ["橄榄油", "10g", 90, 0, 0, 10, ["olive oil"]],
    ["猪油", "10g", 90, 0, 0, 10, ["荤油"]],
    ["黄油", "10g", 72, 0, 0, 8, ["butter"]],
    ["花生", "100g", 567, 25, 16, 49, ["熟花生", "花生米"]],
    ["核桃", "100g", 654, 15, 14, 65, ["核桃仁"]],
    ["杏仁", "100g", 579, 21, 22, 50, ["巴旦木"]],
    ["混合坚果", "100g", 600, 18, 20, 52, ["每日坚果", "坚果"]],
    ["芝麻酱", "10g", 63, 2, 1.5, 5.5, ["麻酱"]],
    ["花生酱", "10g", 60, 2.5, 2, 5, ["peanut butter"]],
    ["沙拉酱", "10g", 65, 0.2, 1, 6.5, ["蛋黄酱", "美乃滋"]],
    ["奶油", "10g", 34, 0.2, 0.3, 3.5, ["淡奶油", "cream"]]
  ],
  "蔬菜类": [
    ["青菜", "100g", 20, 1.5, 3, 0.2, ["小青菜", "上海青"]],
    ["白菜", "100g", 17, 1.5, 3.2, 0.1, ["大白菜"]],
    ["包菜", "100g", 24, 1.3, 5, 0.2, ["卷心菜", "圆白菜"]],
    ["西兰花", "100g", 34, 2.8, 7, 0.4, ["西蓝花"]],
    ["番茄", "100g", 18, 0.9, 3.9, 0.2, ["西红柿"]],
    ["黄瓜", "100g", 16, 0.7, 3.6, 0.1, ["青瓜"]],
    ["胡萝卜", "100g", 41, 0.9, 10, 0.2, ["红萝卜"]],
    ["洋葱", "100g", 40, 1.1, 9, 0.1, ["洋葱头"]],
    ["青椒", "100g", 22, 1, 5, 0.2, ["辣椒", "菜椒"]],
    ["茄子", "100g", 25, 1, 6, 0.2, ["紫茄子"]],
    ["冬瓜", "100g", 12, 0.4, 2.6, 0.2, []],
    ["菠菜", "100g", 23, 2.9, 3.6, 0.4, []]
  ],
  "水果类": [
    ["苹果", "100g", 52, 0.3, 14, 0.2, ["苹果"]],
    ["香蕉", "100g", 89, 1.1, 23, 0.3, ["banana"]],
    ["橙子", "100g", 47, 0.9, 12, 0.1, ["橙", "橘橙"]],
    ["梨", "100g", 57, 0.4, 15, 0.1, ["雪梨"]],
    ["西瓜", "100g", 30, 0.6, 8, 0.2, []],
    ["葡萄", "100g", 69, 0.7, 18, 0.2, []],
    ["草莓", "100g", 32, 0.7, 7.7, 0.3, []],
    ["蓝莓", "100g", 57, 0.7, 14.5, 0.3, []],
    ["猕猴桃", "100g", 61, 1.1, 14.7, 0.5, ["kiwi", "奇异果"]],
    ["芒果", "100g", 60, 0.8, 15, 0.4, []]
  ],
  "奶豆类": [
    ["牛奶", "250ml", 150, 8, 12, 8, ["纯牛奶"]],
    ["低脂牛奶", "250ml", 110, 8, 12, 3, ["脱脂牛奶"]],
    ["酸奶", "100g", 60, 5, 7, 1, ["无糖酸奶", "原味酸奶"]],
    ["豆浆", "250ml", 120, 8, 12, 4, ["无糖豆浆"]],
    ["豆腐", "100g", 80, 8, 2, 5, ["老豆腐"]],
    ["豆干", "100g", 150, 16, 8, 7, ["香干"]]
  ],
  "调味料类": [
    ["白糖", "10g", 40, 0, 10, 0, ["糖", "砂糖"]],
    ["生抽", "10g", 6, 1, 0.5, 0, ["酱油"]],
    ["老抽", "10g", 10, 1, 1.5, 0, []],
    ["蚝油", "10g", 20, 0.5, 4, 0, []],
    ["辣椒油", "10g", 90, 0, 0, 10, ["红油"]],
    ["料酒", "10g", 7, 0, 0.5, 0, []],
    ["淀粉", "10g", 35, 0, 8.8, 0, ["玉米淀粉", "生粉"]],
    ["番茄酱", "10g", 12, 0.2, 3, 0, ["ketchup"]],
    ["辣椒酱", "10g", 25, 0.5, 3, 1, []],
    ["豆瓣酱", "10g", 18, 1, 2, 0.8, ["郫县豆瓣"]]
  ]
};

const ingredientTemplates = Object.entries(ingredientCategories).flatMap(([category, items]) => {
  return items.map((item, index) => toIngredientTemplate(item, category, index));
});

const snackTemplates = [
  ["美式咖啡", 10, 0.5, 1, 0, "medium"],
  ["拿铁", 180, 9, 14, 8, "medium"],
  ["奶茶", 430, 5, 62, 15, "medium_low"],
  ["豆浆", 120, 7, 12, 4, "medium"],
  ["牛奶", 150, 8, 12, 8, "medium"],
  ["无糖可乐", 0, 0, 0, 0, "high"],
  ["面包", 260, 8, 45, 6, "medium"],
  ["饼干", 220, 3, 30, 10, "medium"],
  ["巧克力", 280, 4, 28, 18, "medium"],
  ["坚果", 300, 10, 12, 26, "medium"]
].map(toSnackTemplate);

const sourceConfig = {
  restaurant: { label: "外食快餐", templates: restaurantTemplates },
  home: { label: "家常菜", templates: homeTemplates },
  ingredient: { label: "基础食材", templates: ingredientTemplates },
  snack: { label: "饮品零食", templates: snackTemplates },
  manual: { label: "手动输入", templates: [] }
};

const medicalNutrientConfig = {
  protein: { label: "蛋白质", unit: "g" },
  sodium: { label: "钠", unit: "mg" },
  potassium: { label: "钾", unit: "mg" },
  phosphorus: { label: "磷", unit: "mg" },
  carbs: { label: "碳水", unit: "g" },
  fat: { label: "脂肪", unit: "g" },
  calories: { label: "总热量", unit: "kcal" },
  water: { label: "饮水量", unit: "ml" }
};

const mainMedicalNutrients = ["protein", "carbs", "fat"];
const microMedicalNutrients = ["sodium", "potassium", "phosphorus"];

const kidneyReminderConfig = {
  sodium: { label: "钠 / 低盐", shortLabel: "低盐", status: "low_sodium", keywords: ["低盐", "限盐", "限钠", "少盐", "清淡", "避免腌制", "避免重酱", "减少酱油", "减少蚝油", "减少豆瓣酱"] },
  potassium: { label: "钾", shortLabel: "钾关注", status: "attention", keywords: ["钾", "高钾", "低钾", "限钾", "避免高钾", "血钾"] },
  phosphorus: { label: "磷", shortLabel: "磷关注", status: "attention", keywords: ["磷", "高磷", "限磷", "血磷", "避免高磷", "磷结合剂"] }
};

const extraReminderConfig = {
  calcium: { label: "钙关注", shortLabel: "钙关注", keywords: ["钙", "血钙", "低钙", "高钙", "补钙", "钙片", "钙磷", "甲旁亢", "骨代谢"] },
  fluid: { label: "限水 / 液体提醒", shortLabel: "限水提醒", keywords: ["饮水", "限水", "控水", "水肿", "尿量", "每日饮水", "液体摄入"] },
  sugar: { label: "控糖提醒", shortLabel: "控糖提醒", keywords: ["控糖", "血糖", "糖尿病", "低糖", "少糖", "主食控制", "碳水控制"] },
  purine: { label: "嘌呤 / 尿酸提醒", shortLabel: "嘌呤关注", keywords: ["嘌呤", "尿酸", "高尿酸", "痛风", "动物内脏", "海鲜", "浓肉汤"] }
};

const cookingOilOptions = {
  auto: { label: "自动估算", grams: null },
  steam: { label: "清蒸/水煮", grams: 0 },
  soup: { label: "炖汤", grams: 2 },
  light_stir_fry: { label: "少油清炒", grams: 5 },
  normal_stir_fry: { label: "正常炒", grams: 10 },
  braised: { label: "红烧/重酱", grams: 8 },
  oily: { label: "偏油炒", grams: 15 },
  custom: { label: "自定义", grams: null }
};
const medicalProcessedRiskTerms = ["加工肉", "火腿肠", "午餐肉", "香肠", "腊肉", "培根", "鱼丸", "牛肉丸", "贡丸", "蟹棒", "腌制肉类"];
const medicalProcessedRiskPattern = new RegExp(medicalProcessedRiskTerms.map(escapeRegExp).join("|"));

const nutrientParseConfig = {
  protein: {
    label: "蛋白质",
    unit: "g",
    keywords: ["蛋白质", "蛋白", "肉类", "鸡蛋", "豆制品", "高蛋白", "低蛋白"]
  },
  sodium: {
    label: "钠",
    unit: "mg",
    keywords: ["钠", "盐", "低盐", "限盐", "咸", "腌制", "酱油", "蚝油", "豆瓣酱", ...medicalProcessedRiskTerms]
  },
  potassium: {
    label: "钾",
    unit: "mg",
    keywords: ["钾", "高钾", "低钾"]
  },
  phosphorus: {
    label: "磷",
    unit: "mg",
    keywords: ["磷", "高磷", "低磷"]
  },
  carbs: {
    label: "碳水",
    unit: "g",
    keywords: ["碳水", "糖", "控糖", "主食", "米饭", "面条", "淀粉"]
  },
  fat: {
    label: "脂肪",
    unit: "g",
    keywords: ["脂肪", "低脂", "少油", "油炸", "肥肉", "奶油", "高脂"]
  },
  calories: {
    label: "总热量",
    unit: "kcal",
    keywords: ["热量", "能量", "卡路里", "千卡", "kcal"]
  },
  water: {
    label: "饮水量",
    unit: "ml",
    keywords: ["饮水", "饮水量", "水分", "限水", "控水", "喝水"]
  }
};

const restrictionStatusLabels = {
  strict: "严格限制",
  moderate: "适度控制",
  reminder: "仅提醒",
  none: "不限制",
  unknown: "不确定"
};

const restrictionStatusOrder = ["none", "strict", "moderate", "reminder", "unknown"];

const medicalIngredientCategoryLabels = {
  protein: "蛋白质类",
  carbs: "碳水主食类",
  vegetables: "蔬菜纤维类",
  fats: "脂肪来源类",
  seasonings: "调味料类",
  processed: "加工食品类"
};

const medicalSelectorCategoryLabels = {
  meat: "荤菜",
  vegetable: "素菜",
  staple: "主食"
};

const medicalSelectorIngredients = {
  meat: ["牛肉", "鸡肉", "猪瘦肉", "鱼肉", "虾仁", "鸡蛋", "豆腐", "豆干"],
  vegetable: ["芹菜", "青椒", "洋葱", "白菜", "西兰花", "番茄", "黄瓜", "茄子", "胡萝卜", "菜花", "菠菜", "生菜", "冬瓜", "西葫芦"],
  staple: ["米饭", "面条", "馒头", "红薯", "土豆", "玉米", "燕麦", "粥", "南瓜", "山药"]
};

const medicalSelectableIngredientNames = new Set(Object.values(medicalSelectorIngredients).flat());

const medicalIngredientVariants = {
  "牛肉": [
    { id: "lean", label: "偏瘦", per100g: { calories: 180, protein: 22, fat: 8, carbs: 0 }, note: "默认按相对偏瘦牛肉估算，不同部位脂肪差异较大。" },
    { id: "regular", label: "普通", per100g: { calories: 220, protein: 24, fat: 12, carbs: 0 }, note: "普通牛肉脂肪更高，适合不确定部位时估算。" },
    { id: "fatty", label: "偏肥", per100g: { calories: 280, protein: 20, fat: 22, carbs: 0 }, note: "偏肥牛肉会明显增加脂肪摄入。" }
  ],
  "猪瘦肉": [
    { id: "tenderloin", label: "瘦肉/里脊", per100g: { calories: 130, protein: 21, fat: 4, carbs: 0 }, note: "按里脊或较瘦部位估算。" },
    { id: "regular_lean", label: "普通瘦肉", per100g: { calories: 143, protein: 20, fat: 6, carbs: 0 }, note: "按普通瘦猪肉估算。" },
    { id: "fatty_pork", label: "五花/偏肥", per100g: { calories: 500, protein: 9, fat: 52, carbs: 0 }, note: "五花或偏肥猪肉脂肪很高，需谨慎估算。" }
  ],
  "鸡肉": [
    { id: "breast", label: "鸡胸", per100g: { calories: 165, protein: 31, fat: 3.6, carbs: 0 }, note: "按去皮鸡胸估算。" },
    { id: "skinless_thigh", label: "鸡腿去皮", per100g: { calories: 180, protein: 24, fat: 8, carbs: 0 }, note: "鸡腿去皮脂肪高于鸡胸。" },
    { id: "thigh_skin", label: "鸡腿带皮", per100g: { calories: 220, protein: 22, fat: 14, carbs: 0 }, note: "带皮会增加脂肪摄入。" },
    { id: "wing", label: "鸡翅", per100g: { calories: 220, protein: 19, fat: 16, carbs: 0 }, note: "鸡翅脂肪较高。" }
  ],
  "鱼肉": [
    { id: "low_fat", label: "低脂鱼", per100g: { calories: 90, protein: 20, fat: 1, carbs: 0 }, note: "按鳕鱼等低脂鱼估算。" },
    { id: "regular", label: "普通鱼", per100g: { calories: 120, protein: 20, fat: 4, carbs: 0 }, note: "按普通鱼肉估算。" },
    { id: "high_fat", label: "高脂鱼", per100g: { calories: 208, protein: 20, fat: 13, carbs: 0 }, note: "按三文鱼等高脂鱼估算。" }
  ]
};

const cookingMethodLabels = {
  steamed: "清蒸 / 水煮",
  light_stir_fry: "少油清炒",
  normal_stir_fry: "正常炒",
  braised: "红烧 / 重酱",
  fried: "油炸",
  cured: "腌制 / 卤制"
};

const ingredientNutritionProfiles = [
  medicalIngredient("beef", "牛肉", "protein", "main_protein", { calories: 180, protein: 22, fat: 8, carbs: 0, sodium: null, potassium: null, phosphorus: null }, { protein: "high", fat: "medium", carbs: "low", sodium: "low", potassium: "medium", phosphorus: "medium" }, ["默认按相对偏瘦牛肉估算，不同部位脂肪差异较大。"]),
  medicalIngredient("chicken", "鸡肉", "protein", "main_protein", { calories: 165, protein: 31, fat: 3.6, carbs: 0, sodium: null, potassium: null, phosphorus: null }, { protein: "high", fat: "low", carbs: "low", sodium: "low", potassium: "unknown", phosphorus: "unknown" }, ["鸡肉属于主蛋白食材，去皮做法更容易控制脂肪。"]),
  medicalIngredient("lean_pork", "猪瘦肉", "protein", "main_protein", { calories: 143, protein: 20, fat: 6, carbs: 0, sodium: null, potassium: null, phosphorus: null }, { protein: "high", fat: "medium", carbs: "low", sodium: "low", potassium: "unknown", phosphorus: "unknown" }, ["猪瘦肉属于主蛋白食材，仍需按份量估算。"]),
  medicalIngredient("fish", "鱼肉", "protein", "main_protein", { calories: 120, protein: 20, fat: 4, carbs: 0, sodium: null, potassium: null, phosphorus: null }, { protein: "high", fat: "low", carbs: "low", sodium: "low", potassium: "unknown", phosphorus: "unknown" }, ["鱼肉属于主蛋白食材，清蒸或水煮比红烧更易控制油盐。"]),
  medicalIngredient("shrimp", "虾仁", "protein", "main_protein", { calories: 99, protein: 21, fat: 1, carbs: 1, sodium: null, potassium: null, phosphorus: null }, { protein: "high", fat: "low", carbs: "low", sodium: "unknown", potassium: "unknown", phosphorus: "unknown" }, ["虾仁属于主蛋白食材，如需限制蛋白质，应控制份量。"]),
  medicalIngredient("egg", "鸡蛋", "protein", "main_protein", { calories: 143, protein: 13, fat: 10, carbs: 1, sodium: null, potassium: null, phosphorus: null }, { protein: "medium", fat: "medium", carbs: "low", sodium: "low", potassium: "unknown", phosphorus: "unknown" }, ["鸡蛋会增加蛋白质和脂肪摄入，不建议与多种高蛋白食材叠加。"]),
  medicalIngredient("tofu", "豆腐", "protein", "main_protein", { calories: 80, protein: 8, fat: 5, carbs: 2, sodium: null, potassium: null, phosphorus: null }, { protein: "medium", fat: "medium", carbs: "low", sodium: "low", potassium: "unknown", phosphorus: "unknown" }, ["豆腐也属于蛋白来源，如需限制蛋白质，应纳入份量估算。"]),
  medicalIngredient("dried_tofu", "豆干", "protein", "main_protein", { calories: 150, protein: 16, fat: 7, carbs: 8, sodium: null, potassium: null, phosphorus: null }, { protein: "high", fat: "medium", carbs: "medium", sodium: "unknown", potassium: "unknown", phosphorus: "unknown" }, ["豆干蛋白质更集中，加工调味豆干可能增加钠摄入。"]),
  medicalIngredient("rice", "米饭", "carbs", "main_carb", { calories: 130, protein: 2.4, fat: 0.3, carbs: 28, sodium: null, potassium: null, phosphorus: null }, { protein: "low", fat: "low", carbs: "high", sodium: "low", potassium: "unknown", phosphorus: "unknown" }, ["米饭是主碳水食材，如需控制碳水，应控制份量。"]),
  medicalIngredient("noodles", "面条", "carbs", "main_carb", { calories: 150, protein: 4, fat: 0.8, carbs: 31, sodium: null, potassium: null, phosphorus: null }, { protein: "low", fat: "low", carbs: "high", sodium: "unknown", potassium: "unknown", phosphorus: "unknown" }, ["面条属于主碳水食材，汤面调味可能增加钠摄入。"]),
  medicalIngredient("mantou", "馒头", "carbs", "main_carb", { calories: 223, protein: 7, fat: 1.1, carbs: 47, sodium: null, potassium: null, phosphorus: null }, { protein: "low", fat: "low", carbs: "high", sodium: "unknown", potassium: "unknown", phosphorus: "unknown" }, ["馒头属于主碳水食材，如需控制碳水，应控制份量。"]),
  medicalIngredient("potato", "土豆", "carbs", "main_carb", { calories: 77, protein: 2, fat: 0.1, carbs: 17, sodium: null, potassium: null, phosphorus: null }, { protein: "low", fat: "low", carbs: "medium", sodium: "low", potassium: "unknown", phosphorus: "unknown" }, ["土豆可作为碳水来源，油炸做法会显著增加脂肪。"]),
  medicalIngredient("sweet_potato", "红薯", "carbs", "main_carb", { calories: 86, protein: 1.6, fat: 0.1, carbs: 20, sodium: null, potassium: null, phosphorus: null }, { protein: "low", fat: "low", carbs: "medium", sodium: "low", potassium: "unknown", phosphorus: "unknown" }, ["红薯属于碳水来源，如需控制碳水，应纳入总量。"]),
  medicalIngredient("corn", "玉米", "carbs", "main_carb", { calories: 112, protein: 4, fat: 1.2, carbs: 22, sodium: null, potassium: null, phosphorus: null }, { protein: "low", fat: "low", carbs: "medium", sodium: "low", potassium: "unknown", phosphorus: "unknown" }, ["玉米可作为主食或配菜，仍需计入碳水。"]),
  medicalIngredient("oats", "燕麦", "carbs", "main_carb", { calories: 370, protein: 13, fat: 7, carbs: 60, sodium: null, potassium: null, phosphorus: null }, { protein: "medium", fat: "medium", carbs: "high", sodium: "low", potassium: "unknown", phosphorus: "unknown" }, ["燕麦干重营养密度较高，应按实际食用量估算。"]),
  medicalIngredient("porridge", "粥", "carbs", "main_carb", { calories: 46, protein: 1.1, fat: 0.3, carbs: 10, sodium: null, potassium: null, phosphorus: null }, { protein: "low", fat: "low", carbs: "medium", sodium: "low", potassium: "unknown", phosphorus: "unknown" }, ["粥属于主食，应计入碳水。"]),
  medicalIngredient("pumpkin", "南瓜", "carbs", "main_carb", { calories: 23, protein: 0.7, fat: 0.1, carbs: 5.3, sodium: null, potassium: null, phosphorus: null }, { protein: "low", fat: "low", carbs: "medium", sodium: "low", potassium: "unknown", phosphorus: "unknown" }, ["南瓜可作为主食或配菜，限制碳水时需计入总量。"]),
  medicalIngredient("yam", "山药", "carbs", "main_carb", { calories: 57, protein: 1.9, fat: 0.2, carbs: 12.4, sodium: null, potassium: null, phosphorus: null }, { protein: "low", fat: "low", carbs: "medium", sodium: "low", potassium: "unknown", phosphorus: "unknown" }, ["山药属于淀粉类食材，限制碳水时需计入总量。"]),
  ...["芹菜", "青椒", "洋葱", "白菜", "西兰花", "番茄", "黄瓜", "茄子", "胡萝卜", "菜花", "菠菜", "生菜", "冬瓜", "西葫芦"].map((name, index) => medicalIngredient(`veg_${index}`, name, "vegetables", "vegetable_fiber", { calories: [16, 22, 40, 17, 34, 18, 16, 25, 41, 25, 23, 15, 12, 19][index], protein: [0.7, 1, 1.1, 1.5, 2.8, 0.9, 0.7, 1, 0.9, 2, 2.9, 1.4, 0.4, 1.2][index], fat: [0.2, 0.2, 0.1, 0.1, 0.4, 0.2, 0.1, 0.2, 0.2, 0.3, 0.4, 0.2, 0.2, 0.2][index], carbs: [3, 5, 9, 3.2, 7, 3.9, 3.6, 6, 10, 5, 3.6, 2.9, 2.6, 3.1][index], sodium: null, potassium: null, phosphorus: null }, { protein: "low", fat: "low", carbs: ["胡萝卜", "番茄", "洋葱", "西兰花", "菜花", "茄子"].includes(name) ? "medium" : "low", sodium: "low", potassium: ["芹菜", "菠菜"].includes(name) ? "medium" : "unknown", phosphorus: "low" }, ["蔬菜可作为搭配食材，但特殊限制下仍需参考医生或营养师意见。"], [], getVegetableCarbType(name))),
  medicalIngredient("oil", "食用油", "fats", "fat_source", { calories: 900, protein: 0, fat: 100, carbs: 0, sodium: null, potassium: null, phosphorus: null }, { protein: "low", fat: "high", carbs: "low", sodium: "low", potassium: "unknown", phosphorus: "unknown" }, ["食用油是高脂肪来源，少油做法更可控。"]),
  medicalIngredient("olive_oil", "橄榄油", "fats", "fat_source", { calories: 900, protein: 0, fat: 100, carbs: 0, sodium: null, potassium: null, phosphorus: null }, { protein: "low", fat: "high", carbs: "low", sodium: "low", potassium: "unknown", phosphorus: "unknown" }, ["橄榄油仍属于脂肪来源，需要控制用量。"]),
  medicalIngredient("nuts", "坚果", "fats", "fat_source", { calories: 600, protein: 18, fat: 52, carbs: 20, sodium: null, potassium: null, phosphorus: null }, { protein: "medium", fat: "high", carbs: "medium", sodium: "unknown", potassium: "unknown", phosphorus: "unknown" }, ["坚果脂肪密度高，也可能带来蛋白质叠加。"]),
  medicalIngredient("peanut_butter", "花生酱", "fats", "fat_source", { calories: 600, protein: 25, fat: 50, carbs: 20, sodium: null, potassium: null, phosphorus: null }, { protein: "medium", fat: "high", carbs: "medium", sodium: "unknown", potassium: "unknown", phosphorus: "unknown" }, ["花生酱脂肪和能量密度高，部分产品钠含量也可能较高。"]),
  medicalIngredient("sesame_paste", "芝麻酱", "fats", "fat_source", { calories: 630, protein: 20, fat: 55, carbs: 15, sodium: null, potassium: null, phosphorus: null }, { protein: "medium", fat: "high", carbs: "medium", sodium: "unknown", potassium: "unknown", phosphorus: "unknown" }, ["芝麻酱脂肪密度高，用量应可控。"]),
  ...["盐", "生抽", "老抽", "蚝油", "豆瓣酱", "辣椒酱", "醋", "蒜末", "姜", "葱", "小米辣"].map((name, index) => medicalIngredient(`seasoning_${index}`, name, "seasonings", "seasoning", { calories: null, protein: null, fat: null, carbs: null, sodium: null, potassium: null, phosphorus: null }, { protein: "low", fat: "low", carbs: "low", sodium: index <= 5 ? "high" : "unknown", potassium: "unknown", phosphorus: "unknown" }, ["调味料第一阶段仅用于风险提醒，不进行精确克数追踪。"])),
  ...["火腿肠", "午餐肉", "香肠", "鱼丸", "牛肉丸", "腊肉"].map((name, index) => medicalIngredient(`processed_${index}`, name, "processed", "processed_food", { calories: [250, 300, 320, 140, 220, 420][index], protein: [12, 13, 13, 10, 14, 18][index], fat: [18, 26, 28, 4, 14, 34][index], carbs: [10, 5, 8, 16, 12, 12][index], sodium: null, potassium: null, phosphorus: null }, { protein: "medium", fat: "high", carbs: "medium", sodium: "high", potassium: "unknown", phosphorus: "medium" }, ["加工食品通常钠风险较高，且可能叠加脂肪和蛋白质。"]))
];

const mealTemplates = buildMedicalMealTemplates();

function toRestaurantTemplate(item, index) {
  return {
    id: `restaurant-${index}`,
    sourceType: "restaurant",
    name: item[0],
    category: item[1],
    calories: item[2],
    protein: item[3],
    carbs: item[4],
    fat: item[5],
    confidence: item[6] || "medium_low",
    aliases: item[7] || []
  };
}

function toHomeTemplate(item, index) {
  return {
    id: `home-${index}`,
    sourceType: "home",
    name: item[0],
    category: "家常菜",
    calories: item[1],
    protein: item[2],
    carbs: item[3],
    fat: item[4],
    confidence: "medium",
    aliases: []
  };
}

function toIngredientTemplate(item, category, index) {
  const baseUnit = extractBaseUnit(item[1]);
  return {
    id: `ingredient-${category}-${index}`,
    sourceType: "ingredient",
    name: item[0],
    category,
    baseUnit,
    referenceUnit: item[1],
    displayUnit: getUnitMeasure(baseUnit),
    caloriesPerBase: item[2],
    proteinPerBase: item[3],
    carbsPerBase: item[4],
    fatPerBase: item[5],
    calories: item[2],
    protein: item[3],
    carbs: item[4],
    fat: item[5],
    confidence: "high",
    aliases: item[6] || []
  };
}

function toSnackTemplate(item, index) {
  return {
    id: `snack-${index}`,
    sourceType: "snack",
    name: item[0],
    category: "饮品零食",
    calories: item[1],
    protein: item[2],
    carbs: item[3],
    fat: item[4],
    confidence: item[5]
  };
}

function medicalIngredient(id, name, category, role, per100g, riskTags, notes = [], microRiskNotes = [], carbType = null, purineRisk = null) {
  const microRiskTags = {
    sodium: riskTags.sodium || "unknown",
    potassium: riskTags.potassium || "unknown",
    phosphorus: riskTags.phosphorus || "unknown"
  };
  return {
    id,
    name,
    category: medicalIngredientCategoryLabels[category],
    categoryKey: category,
    role,
    per100g,
    riskTags: {
      protein: riskTags.protein || "unknown",
      fat: riskTags.fat || "unknown",
      carbs: riskTags.carbs || "unknown"
    },
    microRiskTags,
    microRiskNotes: microRiskNotes.length ? microRiskNotes : buildDefaultMicroRiskNotes(name, role, microRiskTags),
    purineRisk: ["low", "medium", "high", "unknown"].includes(purineRisk) ? purineRisk : getDefaultPurineRisk(name, role),
    dataConfidence: Object.values(per100g).some((value) => value === null) ? "medium" : "high",
    carbType,
    notes
  };
}

function getDefaultPurineRisk(name, role) {
  if (/动物内脏|浓肉汤|沙丁鱼|凤尾鱼|火锅老汤|部分海鲜/.test(name)) return "high";
  if (["牛肉", "猪瘦肉", "鸡肉", "鱼肉", "虾仁", "豆腐", "豆干"].includes(name)) return "medium";
  if (name === "鸡蛋" || role === "main_carb" || role === "vegetable_fiber" || /牛奶|酸奶/.test(name)) return "low";
  return "unknown";
}

function getVegetableCarbType(name) {
  if (["胡萝卜", "番茄", "洋葱", "西兰花", "菜花", "茄子"].includes(name)) return "moderate_carb_vegetable";
  if (["土豆", "红薯", "玉米", "南瓜", "山药"].includes(name)) return "starchy_vegetable";
  return "low_carb_vegetable";
}

function buildDefaultMicroRiskNotes(name, role, microRiskTags) {
  const notes = [];
  if (microRiskTags.sodium === "high") notes.push(`${name}的钠风险较高。如医嘱提到低盐或限钠，建议优先选择更少加工、少调味的食材或做法。`);
  if (microRiskTags.potassium === "medium" || microRiskTags.potassium === "high") notes.push(`${name}的钾可作为关注项。如医嘱提到限制钾或注意高钾食物，请根据医生或营养师建议控制份量或处理方式。`);
  if (microRiskTags.phosphorus === "medium" || microRiskTags.phosphorus === "high") notes.push(`${name}的磷可作为关注项。当前版本仅做风险提示，不计算磷摄入进度。`);
  if (!notes.length && role === "vegetable_fiber") notes.push("暂无特别标记的微量元素风险。");
  return notes;
}

function mealTemplate(id, name, mainIngredient, pairedIngredients, cookingMethod, riskFocus, avoidAdding) {
  const ingredients = buildMealTemplateIngredients(mainIngredient, pairedIngredients);
  return {
    id,
    name,
    image: "",
    mainIngredient,
    triggerIngredients: ingredients.map((item) => item.name),
    ingredients,
    pairedIngredients,
    defaultCookingMethod: cookingMethod,
    cookingMethod,
    tags: riskFocus.map(getMedicalRiskLabel),
    seasoningAdvice: "可用葱姜蒜、小米辣等增加风味；如需限制钠，减少盐、酱油、蚝油、豆瓣酱等重钠调味。",
    nutritionRole: {
      main: "主食材",
      complements: ["蔬菜纤维", "部分微量营养素"]
    },
    whySuggested: [
      `${mainIngredient}已经提供本餐主要营养来源，因此不建议再叠加同类高风险食材。`,
      `${pairedIngredients.join("、")}作为搭配，可让家庭菜品更容易控制份量和做法。`,
      "简单少油少盐做法比红烧、卤制、油炸更容易控制油盐。"
    ],
    risks: [
      `${mainIngredient}仍需按用户录入的医嘱限制控制份量。`,
      "调味方式会影响实际钠摄入。",
      "如存在特殊限制，请以医生或营养师意见为准。"
    ],
    avoidAdding,
    riskFocus,
    whyShort: "主食材搭配低风险蔬菜，做法更容易控制。",
    cookingMethodKey: "light_stir_fry"
  };
}

function getMedicalRiskLabel(key) {
  if (key === "purine") return "嘌呤";
  return medicalNutrientConfig[key]?.label || key;
}

function buildMealTemplateIngredients(mainIngredient, pairedIngredients) {
  return [
    {
      name: mainIngredient,
      defaultWeight: getDefaultMealIngredientWeight(mainIngredient),
      unit: "g",
      role: getMealIngredientRole(mainIngredient)
    },
    ...pairedIngredients.map((name) => ({
      name,
      defaultWeight: getDefaultMealIngredientWeight(name),
      unit: "g",
      role: getMealIngredientRole(name)
    }))
  ];
}

function getDefaultMealIngredientWeight(name) {
  if (medicalSelectorIngredients.meat.includes(name)) return 150;
  if (medicalSelectorIngredients.staple.includes(name)) return 150;
  return 100;
}

function getMealIngredientRole(name) {
  const ingredient = ingredientNutritionProfiles.find((item) => item.name === name);
  if (!ingredient) return "paired";
  if (ingredient.role === "main_protein") return "main_protein";
  if (ingredient.role === "main_carb") return "main_carb";
  if (ingredient.role === "vegetable_fiber") return "vegetable";
  return ingredient.role || "paired";
}

function isMedicalSelectableIngredientName(name) {
  return medicalSelectableIngredientNames.has(name);
}

function isMedicalMealTemplateAllowed(name, mainIngredient, pairedIngredients = []) {
  const text = [name, mainIngredient, ...pairedIngredients].join("、");
  return !medicalProcessedRiskPattern.test(text)
    && [mainIngredient, ...pairedIngredients].every(isMedicalSelectableIngredientName);
}

function buildMedicalMealTemplates() {
  const rows = [
    ["芹菜炒牛肉", "牛肉", ["芹菜"]], ["洋葱炒牛肉", "牛肉", ["洋葱"]], ["青椒牛肉丝", "牛肉", ["青椒"]], ["番茄牛肉片", "牛肉", ["番茄"]],
    ["西兰花牛肉", "牛肉", ["西兰花"]], ["胡萝卜牛肉丝", "牛肉", ["胡萝卜"]], ["菜花牛肉片", "牛肉", ["菜花"]], ["冬瓜牛肉片", "牛肉", ["冬瓜"]],
    ["青椒鸡丁", "鸡肉", ["青椒"]], ["西兰花鸡胸肉", "鸡肉", ["西兰花"]], ["番茄鸡肉片", "鸡肉", ["番茄"]], ["洋葱炒鸡肉", "鸡肉", ["洋葱"]],
    ["黄瓜鸡丁", "鸡肉", ["黄瓜"]], ["冬瓜鸡肉片", "鸡肉", ["冬瓜"]], ["白菜鸡肉片", "鸡肉", ["白菜"]], ["胡萝卜鸡丁", "鸡肉", ["胡萝卜"]],
    ["青椒肉丝", "猪瘦肉", ["青椒"]], ["芹菜炒肉丝", "猪瘦肉", ["芹菜"]], ["洋葱炒肉片", "猪瘦肉", ["洋葱"]], ["白菜肉片", "猪瘦肉", ["白菜"]],
    ["番茄肉片", "猪瘦肉", ["番茄"]], ["西葫芦肉片", "猪瘦肉", ["西葫芦"]], ["菜花肉片", "猪瘦肉", ["菜花"]], ["冬瓜肉片", "猪瘦肉", ["冬瓜"]],
    ["清蒸鱼片", "鱼肉", []], ["番茄鱼片", "鱼肉", ["番茄"]], ["冬瓜鱼片汤", "鱼肉", ["冬瓜"]], ["白菜鱼片", "鱼肉", ["白菜"]],
    ["青椒鱼片", "鱼肉", ["青椒"]], ["西兰花鱼片", "鱼肉", ["西兰花"]],
    ["西兰花虾仁", "虾仁", ["西兰花"]], ["黄瓜虾仁", "虾仁", ["黄瓜"]], ["番茄虾仁", "虾仁", ["番茄"]],
    ["青椒虾仁", "虾仁", ["青椒"]], ["冬瓜虾仁", "虾仁", ["冬瓜"]], ["白菜虾仁", "虾仁", ["白菜"]],
    ["番茄炒蛋", "鸡蛋", ["番茄"]], ["黄瓜炒蛋", "鸡蛋", ["黄瓜"]], ["青椒炒蛋", "鸡蛋", ["青椒"]],
    ["洋葱炒蛋", "鸡蛋", ["洋葱"]], ["西葫芦炒蛋", "鸡蛋", ["西葫芦"]], ["白菜炒蛋", "鸡蛋", ["白菜"]],
    ["白菜豆腐", "豆腐", ["白菜"]], ["番茄豆腐", "豆腐", ["番茄"]], ["青椒豆腐", "豆腐", ["青椒"]],
    ["冬瓜豆腐汤", "豆腐", ["冬瓜"]], ["西兰花豆腐", "豆腐", ["西兰花"]], ["芹菜豆腐", "豆腐", ["芹菜"]],
    ["芹菜豆干", "豆干", ["芹菜"]], ["青椒豆干", "豆干", ["青椒"]], ["白菜豆干", "豆干", ["白菜"]], ["番茄豆干", "豆干", ["番茄"]],
    ["芹菜鸡丁", "芹菜", ["鸡肉"]], ["芹菜虾仁", "芹菜", ["虾仁"]], ["青椒豆腐", "青椒", ["豆腐"]],
    ["洋葱炒肉片", "洋葱", ["猪瘦肉"]], ["番茄豆腐", "番茄", ["豆腐"]], ["西兰花豆腐", "西兰花", ["豆腐"]], ["白菜炒蛋", "白菜", ["鸡蛋"]]
  ];
  return rows
    .filter(([name, main, paired]) => isMedicalMealTemplateAllowed(name, main, paired))
    .map(([name, main, paired], index) => {
      const method = name.includes("清蒸") || name.includes("汤") ? "清蒸 / 水煮" : "少油清炒";
      return mealTemplate(`medical_meal_${index}`, name, main, paired, method, getTemplateRiskFocus(main, paired), ["鸡蛋", "豆腐", "香肠", "午餐肉", "腊肉", "重酱汁"]);
    });
}

function getTemplateRiskFocus(mainIngredient, pairedIngredients) {
  const all = [mainIngredient, ...pairedIngredients].join("、");
  const focus = [];
  if (/牛肉|鸡肉|猪瘦肉|鱼肉|虾仁|鸡蛋|豆腐|豆干/.test(all)) focus.push("protein");
  focus.push("sodium");
  const hasPurineRisk = [mainIngredient, ...pairedIngredients]
    .map((name) => ingredientNutritionProfiles.find((item) => item.name === name))
    .some((ingredient) => ["medium", "high"].includes(ingredient?.purineRisk));
  if (hasPurineRisk) focus.push("purine");
  if (/蛋|豆腐|豆干|牛肉/.test(all)) focus.push("fat");
  return [...new Set(focus)];
}

function createDefaultData() {
  return {
    appMode: "body_management",
    profile: null,
    settings: { formula: "mifflin_st_jeor", currentDate: DEFAULT_RECORD_DATE },
    medicalDietProfile: getDefaultMedicalDietProfile(),
    dailyLogs: {},
    customMeals: []
  };
}

function getDefaultMedicalDietProfile() {
  return {
    enabled: false,
    restrictions: Object.fromEntries(Object.entries(medicalNutrientConfig).map(([key, config]) => [key, {
      status: "none",
      limitValue: null,
      unit: config.unit,
      note: ""
    }])),
    doctorAdviceNote: "",
    context: {
      detectedContext: "",
      detectedKeywords: [],
      source: "user_advice_text"
    },
    microNutrientNotes: {
      sodium: "",
      potassium: "",
      phosphorus: "",
      other: ""
    },
    kidneyReminders: Object.fromEntries(Object.keys(kidneyReminderConfig).map((key) => [key, { enabled: false, status: "none", note: "" }])),
    extraReminders: Object.fromEntries(Object.keys(extraReminderConfig).map((key) => [key, { enabled: false, note: "" }]))
  };
}

function createDefaultAnalytics() {
  return {
    appOpenCount: 0,
    profileCreatedCount: 0,
    profileEditedCount: 0,
    foodEntryAddCount: 0,
    foodEntryDeleteCount: 0,
    clearTodayCount: 0,
    exportCount: 0,
    importCount: 0,
    searchCount: 0,
    searchNoResultCount: 0,
    entrySourceCounts: {
      restaurant: 0,
      home: 0,
      ingredient: 0,
      drink: 0,
      manual: 0,
      search: 0
    },
    templateUsage: {},
    searchKeywords: {},
    noResultKeywords: {}
  };
}

function getAnalytics() {
  try {
    const saved = localStorage.getItem(ANALYTICS_KEY);
    const defaults = createDefaultAnalytics();
    if (!saved) return defaults;
    const parsed = JSON.parse(saved);
    return {
      ...defaults,
      ...parsed,
      entrySourceCounts: { ...defaults.entrySourceCounts, ...(parsed.entrySourceCounts || {}) },
      templateUsage: parsed.templateUsage || {},
      searchKeywords: parsed.searchKeywords || {},
      noResultKeywords: parsed.noResultKeywords || {}
    };
  } catch (error) {
    return createDefaultAnalytics();
  }
}

function saveAnalytics(analytics) {
  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
}

function incrementCounter(key) {
  const analytics = getAnalytics();
  analytics[key] = Number(analytics[key] || 0) + 1;
  saveAnalytics(analytics);
}

function incrementMapValue(mapName, key) {
  const cleanKey = String(key || "").trim();
  if (!cleanKey) return;
  const analytics = getAnalytics();
  analytics[mapName] = analytics[mapName] || {};
  analytics[mapName][cleanKey] = Number(analytics[mapName][cleanKey] || 0) + 1;
  saveAnalytics(analytics);
}

function trackEvent(eventName, payload = {}) {
  const sourceMap = { restaurant: "restaurant", home: "home", ingredient: "ingredient", snack: "drink", manual: "manual" };
  if (eventName === "app_open") incrementCounter("appOpenCount");
  if (eventName === "profile_created") incrementCounter("profileCreatedCount");
  if (eventName === "profile_edited") incrementCounter("profileEditedCount");
  if (eventName === "food_entry_add") {
    incrementCounter("foodEntryAddCount");
    incrementMapValue("templateUsage", payload.name);
    const sourceKey = sourceMap[payload.sourceType] || payload.sourceType;
    if (sourceKey) incrementMapValue("entrySourceCounts", sourceKey);
    if (payload.viaSearch) incrementMapValue("entrySourceCounts", "search");
  }
  if (eventName === "food_entry_delete") incrementCounter("foodEntryDeleteCount");
  if (eventName === "clear_today") incrementCounter("clearTodayCount");
  if (eventName === "export_json") incrementCounter("exportCount");
  if (eventName === "import_json") incrementCounter("importCount");
  if (eventName === "search") {
    incrementCounter("searchCount");
    incrementMapValue("searchKeywords", payload.keyword);
    if (payload.noResult) {
      incrementCounter("searchNoResultCount");
      incrementMapValue("noResultKeywords", payload.keyword);
    }
  }
}

function exportAnalytics() {
  const blob = new Blob([JSON.stringify(getAnalytics(), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "analytics.json";
  link.click();
  URL.revokeObjectURL(url);
}

function clearAnalytics() {
  localStorage.removeItem(ANALYTICS_KEY);
}

function clearLocalTestData() {
  if (!confirm("确定要清空本地测试数据吗？此操作会删除本浏览器中的饮食记录和设置。")) return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(ANALYTICS_KEY);
  window.location.reload();
}

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    data = saved ? { ...createDefaultData(), ...JSON.parse(saved) } : createDefaultData();
    migrateOldDataIfNeeded();
  } catch (error) {
    data = createDefaultData();
    migrateOldDataIfNeeded();
    showImportMessage("本地数据读取失败，已临时使用空数据。", true);
  }
}

function saveData() {
  data.settings = data.settings || {};
  data.settings.currentDate = getCurrentDate();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function todayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function migrateOldDataIfNeeded() {
  data.appMode = ["body_management", "medical_diet"].includes(data.appMode) ? data.appMode : "body_management";
  data.settings = { ...createDefaultData().settings, ...(data.settings || {}) };
  data.medicalDietProfile = normalizeMedicalDietProfile(data.medicalDietProfile);
  data.dailyLogs = data.dailyLogs || {};
  if (Array.isArray(data.foodEntries) || Array.isArray(data.exerciseEntries)) {
    const date = todayKey();
    data.dailyLogs[date] = {
      ...(data.dailyLogs[date] || {}),
      date,
      dayStatus: data.dayStatus || "normal",
      foodEntries: data.foodEntries || [],
      exerciseEntries: data.exerciseEntries || []
    };
    delete data.foodEntries;
    delete data.exerciseEntries;
    delete data.dayStatus;
  }
  if (Object.keys(data.dailyLogs).length === 0) createDailyLog(DEFAULT_RECORD_DATE);
  Object.keys(data.dailyLogs).forEach((key) => {
    data.dailyLogs[key] = normalizeDailyLog(key, data.dailyLogs[key]);
  });
  currentDate = isValidDateString(data.settings.currentDate) && data.dailyLogs[data.settings.currentDate]
    ? data.settings.currentDate
    : data.settings.currentDate || DEFAULT_RECORD_DATE;
  ensureDailyLog(currentDate);
  if (!expandedDates.length) expandedDates = [currentDate];
  expandedDates = expandedDates.filter((date) => data.dailyLogs[date]).slice(-2);
}

function migrateV3DataIfNeeded() {
  data.appMode = ["body_management", "medical_diet"].includes(data.appMode) ? data.appMode : "body_management";
  data.medicalDietProfile = normalizeMedicalDietProfile(data.medicalDietProfile);
}

function normalizeMedicalDietProfile(profile) {
  const defaults = getDefaultMedicalDietProfile();
  const source = profile && typeof profile === "object" ? profile : {};
  const restrictions = {};
  Object.entries(defaults.restrictions).forEach(([key, defaultRestriction]) => {
    const saved = source.restrictions?.[key] || {};
    restrictions[key] = {
      ...defaultRestriction,
      ...saved,
      status: Object.keys(restrictionStatusLabels).includes(saved.status) ? saved.status : defaultRestriction.status,
      limitValue: saved.limitValue === "" || saved.limitValue === undefined || saved.limitValue === null ? null : Number(saved.limitValue),
      unit: defaultRestriction.unit,
      note: saved.note || ""
    };
  });
  const microNutrientNotes = {
    ...defaults.microNutrientNotes,
    ...(source.microNutrientNotes || {})
  };
  const kidneyReminders = {};
  Object.entries(defaults.kidneyReminders).forEach(([key, defaultReminder]) => {
    const saved = source.kidneyReminders?.[key] || {};
    const legacyNote = microNutrientNotes[key] || source.restrictions?.[key]?.note || "";
    const inferredEnabled = Boolean(saved.enabled) || Boolean(legacyNote);
    kidneyReminders[key] = {
      ...defaultReminder,
      ...saved,
      enabled: inferredEnabled,
      status: saved.status && saved.status !== "none" ? saved.status : (inferredEnabled ? kidneyReminderConfig[key]?.status || "attention" : "none"),
      note: saved.note || legacyNote || ""
    };
  });
  const extraReminders = {};
  Object.entries(defaults.extraReminders).forEach(([key, defaultReminder]) => {
    const saved = source.extraReminders?.[key] || {};
    extraReminders[key] = {
      ...defaultReminder,
      ...saved,
      enabled: Boolean(saved.enabled),
      note: saved.note || ""
    };
  });
  const savedContext = source.context && typeof source.context === "object" ? source.context : {};
  return {
    enabled: Boolean(source.enabled),
    restrictions,
    doctorAdviceNote: source.doctorAdviceNote || "",
    context: {
      detectedContext: typeof savedContext.detectedContext === "string" ? savedContext.detectedContext : "",
      detectedKeywords: Array.isArray(savedContext.detectedKeywords) ? savedContext.detectedKeywords.filter((item) => typeof item === "string") : [],
      source: "user_advice_text"
    },
    microNutrientNotes,
    kidneyReminders,
    extraReminders
  };
}

function normalizeDailyLog(date, log) {
  const nextLog = log && typeof log === "object" ? log : {};
  const validStatus = ["rest", "normal", "workout"].includes(nextLog.dayStatus) ? nextLog.dayStatus : "normal";
  const now = new Date().toISOString();
  return {
    ...nextLog,
    date: nextLog.date || date,
    dayStatus: validStatus,
    foodEntries: Array.isArray(nextLog.foodEntries) ? nextLog.foodEntries : [],
    exerciseEntries: Array.isArray(nextLog.exerciseEntries) ? nextLog.exerciseEntries : [],
    createdAt: nextLog.createdAt || now,
    updatedAt: nextLog.updatedAt || now
  };
}

function getCurrentDate() {
  if (!currentDate) currentDate = data.settings?.currentDate || todayKey();
  return currentDate;
}

function setCurrentDate(date) {
  if (!isValidDateString(date)) return;
  ensureDailyLog(date);
  currentDate = date;
  data.settings.currentDate = date;
  if (!expandedDates.includes(date)) toggleExpandedDate(date, false);
  saveData();
  renderAll();
}

function switchOrCreateDate(date) {
  if (!isValidDateString(date)) return false;
  if (!data.dailyLogs[date]) createDailyLog(date);
  currentDate = date;
  data.settings.currentDate = date;
  expandedDates = expandedDates.filter((item) => item !== date);
  expandedDates.push(date);
  if (expandedDates.length > 2) expandedDates.shift();
  showNewDayForm = false;
  saveData();
  renderAll();
  return true;
}

function createDailyLog(date) {
  if (!isValidDateString(date) || data.dailyLogs[date]) return false;
  const now = new Date().toISOString();
  data.dailyLogs[date] = {
    date,
    dayStatus: "normal",
    foodEntries: [],
    exerciseEntries: [],
    createdAt: now,
    updatedAt: now
  };
  return true;
}

function ensureDailyLog(date = getCurrentDate()) {
  if (!data.dailyLogs[date]) createDailyLog(date);
  data.dailyLogs[date] = normalizeDailyLog(date, data.dailyLogs[date]);
  return data.dailyLogs[date];
}

function ensureTodayLog() {
  return ensureDailyLog(getCurrentDate());
}

function touchDailyLog(date) {
  ensureDailyLog(date).updatedAt = new Date().toISOString();
}

function getSortedDates() {
  return Object.keys(data.dailyLogs || {}).sort((a, b) => b.localeCompare(a));
}

function getNextDateAfterLatest() {
  const dates = getSortedDates();
  const base = dates.length ? dates[0] : todayKey();
  const next = new Date(`${base}T00:00:00`);
  next.setDate(next.getDate() + 1);
  return formatDateInputValue(next);
}

function getNextRecordDate() {
  const base = new Date(`${getCurrentDate()}T00:00:00`);
  if (Number.isNaN(base.getTime())) return getNextDateAfterLatest();
  let next = new Date(base);
  do {
    next.setDate(next.getDate() + 1);
  } while (data.dailyLogs[formatDateInputValue(next)]);
  return formatDateInputValue(next);
}

function formatDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isValidDateString(date) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(date || ""));
}

function calculateBMR(profile) {
  const base = 10 * Number(profile.weightKg) + 6.25 * Number(profile.heightCm) - 5 * Number(profile.age);
  return profile.sex === "male" ? base + 5 : base - 161;
}

function calculateTDEE(profile) {
  return calculateBMR(profile) * activityLevels[profile.activityLevel].factor;
}

function calculateTargets(profile) {
  const bmr = calculateBMR(profile);
  const tdee = calculateTDEE(profile);
  let targetCalories = tdee;
  if (profile.goal === "fat_loss") targetCalories = Math.max(bmr, tdee - 400);
  if (profile.goal === "muscle_gain") targetCalories = tdee + 250;

  const proteinFactor = profile.goal === "fat_loss" ? 2 : profile.goal === "muscle_gain" ? 1.8 : 1.6;
  const protein = Number(profile.weightKg) * proteinFactor;
  const fat = Number(profile.weightKg) * 0.8;
  let carbs = (targetCalories - protein * 4 - fat * 9) / 4;
  const macroWarning = carbs < 0;
  if (carbs < 0) carbs = 0;

  return {
    bmr: round(bmr),
    tdee: round(tdee),
    calories: round(targetCalories),
    protein: round(protein),
    carbs: round(carbs),
    fat: round(fat),
    macroWarning
  };
}

function renderProfile() {
  const section = document.getElementById("profileSection");
  const profile = data.profile || {
    sex: "male",
    age: 25,
    heightCm: 183,
    weightKg: 69.5,
    targetWeightKg: 66,
    goal: "fat_loss",
    activityLevel: "moderate",
    dietStyle: "mixed",
    trackingPreference: "quick_estimate"
  };
  const targets = data.profile ? calculateTargets(data.profile) : null;

  section.innerHTML = `
    <div class="card">
      <div class="section-heading">
        <div>
          <p class="eyebrow">${data.profile ? "修改后自动重新计算目标" : "第一次使用需要建立资料"}</p>
          <h2>建立个人资料</h2>
        </div>
      </div>
      <form id="profileForm" class="profile-form">
        <div class="form-field">
          <label for="sex">性别</label>
          <select id="sex" name="sex">
            <option value="male" ${profile.sex === "male" ? "selected" : ""}>男</option>
            <option value="female" ${profile.sex === "female" ? "selected" : ""}>女</option>
          </select>
        </div>
        <div class="form-field">
          <label for="age">年龄</label>
          <input id="age" name="age" type="number" min="1" value="${profile.age}" required>
        </div>
        <div class="form-field">
          <label for="heightCm">身高 cm</label>
          <input id="heightCm" name="heightCm" type="number" min="80" step="0.1" value="${profile.heightCm}" required>
        </div>
        <div class="form-field">
          <label for="weightKg">当前体重 kg</label>
          <input id="weightKg" name="weightKg" type="number" min="20" step="0.1" value="${profile.weightKg}" required>
        </div>
        <div class="form-field">
          <label for="targetWeightKg">目标体重 kg</label>
          <input id="targetWeightKg" name="targetWeightKg" type="number" min="20" step="0.1" value="${profile.targetWeightKg}" required>
        </div>
        <div class="form-field">
          <label for="goal">目标类型</label>
          <select id="goal" name="goal">
            <option value="fat_loss" ${profile.goal === "fat_loss" ? "selected" : ""}>减脂</option>
            <option value="maintain" ${profile.goal === "maintain" ? "selected" : ""}>维持</option>
            <option value="muscle_gain" ${profile.goal === "muscle_gain" ? "selected" : ""}>增肌</option>
          </select>
        </div>
        <div class="form-field">
          <label for="activityLevel">日常活动水平</label>
          <select id="activityLevel" name="activityLevel">
            <option value="sedentary" ${profile.activityLevel === "sedentary" ? "selected" : ""}>久坐少动：大部分时间坐着，几乎不运动</option>
            <option value="light" ${profile.activityLevel === "light" ? "selected" : ""}>轻度活动：偶尔运动或日常走动较多</option>
            <option value="moderate" ${profile.activityLevel === "moderate" ? "selected" : ""}>中度活动：每周规律运动 3–5 次</option>
            <option value="high" ${profile.activityLevel === "high" ? "selected" : ""}>高活动量：几乎每天运动或工作活动量较大</option>
            <option value="extreme" ${profile.activityLevel === "extreme" ? "selected" : ""}>极高活动量：高强度训练或重体力劳动</option>
          </select>
          <p class="field-hint">系统会根据你的日常活动情况，估算你一天大概会消耗多少热量。</p>
        </div>
        <div class="form-field">
          <label for="dietStyle">饮食场景</label>
          <select id="dietStyle" name="dietStyle">
            <option value="restaurant" ${profile.dietStyle === "restaurant" ? "selected" : ""}>外食为主</option>
            <option value="home" ${profile.dietStyle === "home" ? "selected" : ""}>自己做饭为主</option>
            <option value="mixed" ${profile.dietStyle === "mixed" ? "selected" : ""}>混合</option>
          </select>
        </div>
        <div class="form-field">
          <label for="trackingPreference">记录偏好</label>
          <select id="trackingPreference" name="trackingPreference">
            <option value="quick_estimate" ${profile.trackingPreference === "quick_estimate" ? "selected" : ""}>快速估算</option>
            <option value="more_accurate" ${profile.trackingPreference === "more_accurate" ? "selected" : ""}>较精确</option>
            <option value="manual_precise" ${profile.trackingPreference === "manual_precise" ? "selected" : ""}>手动精确</option>
          </select>
        </div>
        <div class="form-field full">
          <button type="submit">保存资料并生成估算目标</button>
        </div>
      </form>
      ${targets ? renderTargetPreview(targets) : ""}
    </div>
  `;

  document.getElementById("profileForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const hadProfile = Boolean(data.profile);
    data.profile = {
      sex: form.get("sex"),
      age: Number(form.get("age")),
      heightCm: Number(form.get("heightCm")),
      weightKg: Number(form.get("weightKg")),
      targetWeightKg: Number(form.get("targetWeightKg")),
      goal: form.get("goal"),
      activityLevel: form.get("activityLevel"),
      dietStyle: form.get("dietStyle"),
      trackingPreference: form.get("trackingPreference")
    };
    saveData();
    trackEvent(hadProfile ? "profile_edited" : "profile_created");
    showMain();
  });
}

function renderTargetPreview(targets) {
  return `
    <div class="target-grid" style="margin-top:16px">
      ${stat("基础代谢估算（BMR）", `${targets.bmr} kcal`, "身体维持呼吸、心跳、体温等基本运行所需的热量。")}
      ${stat("每日总消耗估算（TDEE）", `${targets.tdee} kcal`, "基础代谢加上日常活动后，一天大概会消耗的总热量。")}
      ${stat("今日建议摄入热量", `${targets.calories} kcal`, "根据你的目标生成。减脂时会预留一定热量缺口。")}
      ${stat("蛋白质目标估算", `${targets.protein}g`)}
      ${stat("碳水目标估算", `${targets.carbs}g`)}
      ${stat("脂肪目标估算", `${targets.fat}g`)}
    </div>
    ${targets.macroWarning ? `<p class="warning">当前热量目标过低，三大营养素可能无法合理分配。</p>` : ""}
  `;
}

function renderDashboard() {
  if (!data.profile) return;
  if (data.appMode === "medical_diet") {
    renderMedicalDietOverview();
    return;
  }
  renderBodyManagementDashboard();
}

function renderBodyManagementDashboard() {
  const date = getCurrentDate();
  const summary = calculateDailySummary(date);
  const targets = calculateTargets(data.profile);
  document.querySelector(".app-header h1").textContent = "轻量身材管家";
  document.querySelector(".app-header .eyebrow").textContent = "本地估算工具";
  document.getElementById("dashboardTitle").textContent = "个人目标概览";
  document.getElementById("todayDate").textContent = "普通身材管理";
  document.getElementById("dashboard").innerHTML = `
    ${renderModeSwitcher()}
    ${renderCurrentDateControls()}
    ${renderDayStatus(date, "dashboard")}
    <div class="stats-grid">
      ${stat("当前目标类型", goalLabels[data.profile.goal])}
      ${stat("今日状态", dayStatusLabels[summary.dayStatus])}
      ${stat("基础代谢估算（BMR）", `${targets.bmr} kcal`, "身体维持呼吸、心跳、体温等基本运行所需的热量。")}
      ${stat("每日总消耗估算（TDEE）", `${targets.tdee} kcal`, "基础代谢加上日常活动后，一天大概会消耗的总热量。")}
      ${stat("今日建议摄入热量", `${round(summary.adjustedTargetCalories)} kcal`, "按当前日期状态和运动记录调整。")}
      ${stat("今日还可摄入", summary.remainingCalories >= 0 ? `${round(summary.remainingCalories)} kcal` : `已超出 ${round(Math.abs(summary.remainingCalories))} kcal`, "按记录日期计算。")}
    </div>
    ${targets.macroWarning ? `<p class="warning">当前热量目标过低，三大营养素可能无法合理分配。</p>` : ""}
  `;
  bindCurrentDateControls();
  bindModeSwitcher();
  document.getElementById("dashboard").querySelectorAll(".day-status-input").forEach((input) => {
    input.addEventListener("change", () => updateDayStatus(input.value, date));
  });
  renderExerciseModule(date);
}

function renderMedicalDietOverview() {
  const date = getCurrentDate();
  document.querySelector(".app-header h1").textContent = "医嘱饮食记录";
  document.querySelector(".app-header .eyebrow").textContent = "本地医嘱估算工具";
  document.getElementById("dashboardTitle").textContent = "今日限制状态";
  document.getElementById("todayDate").textContent = "医嘱饮食记录";
  document.getElementById("exerciseModule").innerHTML = "";
  document.getElementById("dashboard").innerHTML = `
      ${renderModeSwitcher()}
      ${renderDateSelector()}
      ${renderMedicalNutritionProgress(date)}
      ${renderKidneyDietReminders()}
      <div class="medical-overview">
      <details class="medical-disclaimer">
        <summary>使用说明</summary>
        <p>本工具仅根据你录入的医嘱限制进行饮食估算，不替代医生或营养师建议。</p>
      </details>
    </div>
  `;
  bindDateSelector();
  bindModeSwitcher();
}

function renderModeSwitcher() {
  return `
    <div class="mode-switcher">
      <span>当前模式：</span>
      <button class="mode-btn ${data.appMode === "body_management" ? "active" : ""}" data-mode="body_management" onclick="setAppMode('body_management')" type="button">普通身材管理模式</button>
      <button class="mode-btn ${data.appMode === "medical_diet" ? "active" : ""}" data-mode="medical_diet" onclick="setAppMode('medical_diet')" type="button">医嘱限制饮食模式</button>
    </div>
  `;
}

function bindModeSwitcher() {
  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => setAppMode(button.dataset.mode));
  });
}

function setAppMode(mode) {
  if (!["body_management", "medical_diet"].includes(mode) || data.appMode === mode) return;
  data.appMode = mode;
  if (mode === "medical_diet") {
    data.medicalDietProfile.enabled = true;
  }
  saveData();
  renderAll();
}

window.setAppMode = setAppMode;

function renderCurrentDateControls() {
  const dates = getSortedDates();
  const current = getCurrentDate();
  return `
    <div class="record-date-panel">
      <div class="record-date-heading">
        <div>
          <p class="eyebrow">全局设置</p>
          <h3>记录日期</h3>
        </div>
        <strong>当前正在记录：${current}</strong>
      </div>
      <div class="date-tools simplified-date-tools">
        <div class="form-field">
          <label for="currentDateSelect">选择已有日期</label>
          <select id="currentDateSelect">
            ${dates.map((date) => `<option value="${date}" ${date === current ? "selected" : ""}>${date}</option>`).join("")}
          </select>
        </div>
        <button id="toggleNewDayBtn" class="ghost-btn" type="button">添加新的一天</button>
        <button id="toggleOtherDateBtn" class="ghost-btn" type="button">选择其他日期</button>
      </div>
      <div id="newDayPanel" class="${showNewDayForm ? "new-day-panel" : "hidden"}">
        <div class="date-tools compact-date-tools">
          <div class="form-field">
            <label for="newDayDate">选择日期</label>
            <input id="newDayDate" type="date" value="${getNextRecordDate()}">
          </div>
          <div class="form-field date-action-field">
            <label>&nbsp;</label>
            <button id="createNewDayBtn" type="button">使用 / 创建该日期</button>
          </div>
        </div>
        <p id="newDayMessage" class="message" role="status"></p>
      </div>
    </div>
  `;
}

function renderDateSelector() {
  let current = getCurrentDate();
  if (!data.settings.medicalDateInitialized || !isDateInRange(current)) {
    current = DEFAULT_RECORD_DATE;
    currentDate = current;
    data.settings.currentDate = current;
    data.settings.medicalDateInitialized = true;
    ensureDailyLog(current);
    saveData();
  }
  if (!calendarViewYear || !calendarViewMonth) {
    const viewDate = parseDateString(current);
    calendarViewYear = viewDate.getFullYear();
    calendarViewMonth = viewDate.getMonth() + 1;
  }
  return `
    <div class="record-date-panel medical-date-selector">
      <div class="record-date-heading">
        <div>
          <p class="eyebrow">全局设置</p>
          <h3>记录日期</h3>
        </div>
        <strong>当前选择日期：${current}</strong>
      </div>
      <div class="date-picker-anchor">
        <button id="openDatePickerBtn" type="button">选择日期</button>
        ${isDatePickerOpen ? renderDatePicker() : ""}
      </div>
    </div>
  `;
}

function bindDateSelector() {
  const openButton = document.getElementById("openDatePickerBtn");
  if (openButton) openButton.addEventListener("click", (event) => {
    event.stopPropagation();
    openDatePicker();
  });
  const closeButton = document.getElementById("closeDatePickerBtn");
  if (closeButton) closeButton.addEventListener("click", closeDatePicker);
  const defaultButton = document.getElementById("defaultDateBtn");
  if (defaultButton) defaultButton.addEventListener("click", () => selectCalendarDate(DEFAULT_RECORD_DATE));
  const previousButton = document.getElementById("previousMonthBtn");
  if (previousButton) previousButton.addEventListener("click", goToPreviousMonth);
  const nextButton = document.getElementById("nextMonthBtn");
  if (nextButton) nextButton.addEventListener("click", goToNextMonth);
  document.querySelectorAll("[data-calendar-date]").forEach((button) => {
    button.addEventListener("click", () => selectCalendarDate(button.dataset.calendarDate));
  });
  const popover = document.getElementById("datePickerPopover");
  if (popover) {
    popover.addEventListener("click", (event) => event.stopPropagation());
    window.setTimeout(() => {
      document.addEventListener("click", handleDatePickerOutsideClick, { once: true });
    }, 0);
  }
}

function handleDatePickerOutsideClick() {
  if (!isDatePickerOpen) return;
  closeDatePicker();
}

function getDateOptions(startDate, endDate) {
  if (!isValidDateString(startDate) || !isValidDateString(endDate)) return [];
  const dates = [];
  const current = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  while (current <= end) {
    dates.push(formatDateYYYYMMDD(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function renderDatePicker() {
  return `
    <div id="datePickerPopover" class="date-picker-popover">
      <div class="date-picker-header">
        <button id="previousMonthBtn" class="icon-btn" type="button" ${canGoToPreviousMonth() ? "" : "disabled"}>&lt;</button>
        <strong>${calendarViewYear} 年 ${calendarViewMonth} 月</strong>
        <button id="nextMonthBtn" class="icon-btn" type="button" ${canGoToNextMonth() ? "" : "disabled"}>&gt;</button>
      </div>
      ${renderCalendarMonth(calendarViewYear, calendarViewMonth)}
      <div class="date-picker-actions">
        <button id="defaultDateBtn" class="ghost-btn" type="button">默认日期</button>
        <button id="closeDatePickerBtn" class="ghost-btn" type="button">关闭</button>
      </div>
    </div>
  `;
}

function openDatePicker() {
  const current = parseDateString(getCurrentDate());
  calendarViewYear = current.getFullYear();
  calendarViewMonth = current.getMonth() + 1;
  isDatePickerOpen = true;
  renderAll();
}

function closeDatePicker() {
  isDatePickerOpen = false;
  renderAll();
}

function renderCalendarMonth(year, month) {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0).getDate();
  const leadingBlanks = (firstDay.getDay() + 6) % 7;
  const cells = [];
  for (let index = 0; index < leadingBlanks; index += 1) {
    cells.push(`<span class="calendar-day empty-day"></span>`);
  }
  for (let day = 1; day <= lastDay; day += 1) {
    const date = formatDateYYYYMMDD(new Date(year, month - 1, day));
    const selected = date === getCurrentDate();
    const disabled = !isDateInRange(date);
    cells.push(`
      <button class="calendar-day ${selected ? "selected" : ""}" data-calendar-date="${date}" type="button" ${disabled ? "disabled" : ""}>
        ${day}
      </button>
    `);
  }
  return `
    <div class="calendar-weekdays">
      ${["一", "二", "三", "四", "五", "六", "日"].map((day) => `<span>${day}</span>`).join("")}
    </div>
    <div class="calendar-grid">${cells.join("")}</div>
  `;
}

function goToPreviousMonth() {
  const date = new Date(calendarViewYear, calendarViewMonth - 2, 1);
  calendarViewYear = date.getFullYear();
  calendarViewMonth = date.getMonth() + 1;
  isDatePickerOpen = true;
  renderAll();
}

function goToNextMonth() {
  const date = new Date(calendarViewYear, calendarViewMonth, 1);
  calendarViewYear = date.getFullYear();
  calendarViewMonth = date.getMonth() + 1;
  isDatePickerOpen = true;
  renderAll();
}

function selectCalendarDate(date) {
  if (!isDateInRange(date)) return;
  isDatePickerOpen = false;
  setCurrentDate(date);
  refreshMedicalDietView();
}

function isDateInRange(date) {
  if (!isValidDateString(date)) return false;
  return date >= MEDICAL_DATE_START && date <= MEDICAL_DATE_END;
}

function formatDateYYYYMMDD(date) {
  return formatDateInputValue(date);
}

function parseDateString(date) {
  return new Date(`${isValidDateString(date) ? date : DEFAULT_RECORD_DATE}T00:00:00`);
}

function canGoToPreviousMonth() {
  const previous = new Date(calendarViewYear, calendarViewMonth - 2, 1);
  const lastDayOfPrevious = new Date(previous.getFullYear(), previous.getMonth() + 1, 0);
  return formatDateYYYYMMDD(lastDayOfPrevious) >= MEDICAL_DATE_START;
}

function canGoToNextMonth() {
  const next = new Date(calendarViewYear, calendarViewMonth, 1);
  return formatDateYYYYMMDD(next) <= MEDICAL_DATE_END;
}

function bindCurrentDateControls() {
  const select = document.getElementById("currentDateSelect");
  if (select) select.addEventListener("change", (event) => setCurrentDate(event.target.value));
  const toggleButton = document.getElementById("toggleNewDayBtn");
  if (toggleButton) {
    toggleButton.addEventListener("click", () => {
      switchOrCreateDate(getNextRecordDate());
    });
  }
  const otherDateButton = document.getElementById("toggleOtherDateBtn");
  if (otherDateButton) {
    otherDateButton.addEventListener("click", () => {
      showNewDayForm = !showNewDayForm;
      renderDashboard();
    });
  }
  const createButton = document.getElementById("createNewDayBtn");
  if (createButton) {
    createButton.addEventListener("click", () => {
      const date = document.getElementById("newDayDate").value;
      const message = document.getElementById("newDayMessage");
      if (!isValidDateString(date)) {
        if (message) showInlineMessage(message, "请选择有效日期。", true);
        return;
      }
      switchOrCreateDate(date);
    });
  }
}

function renderDailyAdvice(date) {
  const summary = calculateDailySummary(date);
  const log = ensureDailyLog(date);
  const advice = [];
  const mediumLowCount = log.foodEntries.filter((entry) => entry.confidence === "medium_low").length;

  const hasWorkoutProteinAdvice = summary.dayStatus === "workout" && summary.remainingProtein > 5;
  if (hasWorkoutProteinAdvice) advice.push(`该日有运动记录，蛋白质还差 ${round(summary.remainingProtein)}g，建议优先补充高蛋白食物。`);
  if (summary.dayStatus === "workout" && summary.totalExerciseBurned >= 400 && summary.foodCalories < summary.adjustedTargetCalories * 0.55) advice.push("该日运动量较高，摄入偏低，建议适当补充碳水和蛋白质。");
  if (summary.dayStatus === "workout" && data.profile.goal === "fat_loss" && summary.totalExerciseBurned > 0) advice.push("减脂期间运动消耗不建议全部吃回，系统默认只计入部分运动消耗。");
  if (summary.dayStatus === "rest") advice.push("该日为休息日，建议保持蛋白质摄入，控制高油高糖零食。");
  if (!hasWorkoutProteinAdvice && summary.remainingProtein > 5) advice.push(`蛋白质还差 ${round(summary.remainingProtein)}g，建议优先补充鸡胸肉、牛肉、鸡蛋、蛋白粉或高蛋白酸奶。`);
  if (summary.remainingCarbs > 10) advice.push(`碳水还差 ${round(summary.remainingCarbs)}g，可以根据饥饿程度补充米饭、面、土豆或水果。`);
  if (summary.remainingFat < 0) advice.push(`脂肪已超过目标 ${round(Math.abs(summary.remainingFat))}g，建议减少高油零食和重油菜。`);
  if (summary.remainingCalories > 500) advice.push(`该日热量还剩 ${round(summary.remainingCalories)} kcal，可以根据蛋白质和碳水缺口安排一顿完整正餐。`);
  if (summary.remainingCalories < 0) advice.push(`该日热量已超出 ${round(Math.abs(summary.remainingCalories))} kcal，后续建议减少额外摄入。`);
  if (mediumLowCount >= 2) advice.push(`该日有 ${mediumLowCount} 条外食估算记录，热量可能存在偏差，建议优先选择更容易估算的食物。`);
  if (advice.length === 0) advice.push("该日主要目标进展正常，继续保持记录即可。");

  return `<div class="advice-list">${advice.map((item) => `<div class="advice-item">${item}</div>`).join("")}</div>`;
}

function renderAdvice(date = getCurrentDate()) {
  const target = document.getElementById("advice");
  if (target) target.innerHTML = renderDailyAdvice(date);
}

function renderDayStatus(date = getCurrentDate(), context = "panel") {
  const { dayStatus } = ensureDailyLog(date);
  return `
    <div class="day-status-panel" aria-label="今日状态">
      ${Object.entries(dayStatusLabels).map(([value, label]) => `
        <label class="status-option ${dayStatus === value ? "active" : ""}">
          <input class="day-status-input" type="radio" name="dayStatus-${date}-${context}" value="${value}" ${dayStatus === value ? "checked" : ""}>
          <span>${label}</span>
        </label>
      `).join("")}
    </div>
  `;
}

function updateDayStatus(status, date = getCurrentDate()) {
  const log = ensureDailyLog(date);
  log.dayStatus = ["rest", "normal", "workout"].includes(status) ? status : "normal";
  touchDailyLog(date);
  saveData();
  renderAll();
}

function renderExerciseModule(date = getCurrentDate()) {
  const target = document.getElementById("exerciseModule");
  if (!target) return;
  const log = ensureDailyLog(date);
  if (log.dayStatus !== "workout") {
    target.innerHTML = "";
    return;
  }
  target.innerHTML = `
    <div class="exercise-box">
      <div class="section-heading compact-heading">
        <div>
          <p class="eyebrow">今日运动</p>
          <h3>添加运动记录</h3>
        </div>
      </div>
      <form id="exerciseForm" class="exercise-form">
        <div class="form-field">
          <label for="exerciseType">运动类型</label>
          <select id="exerciseType" name="type">
            ${Object.entries(exerciseCategories).map(([category, types]) => `
              <optgroup label="${category}">
                ${types.map((type) => `<option value="${type}">${type}</option>`).join("")}
              </optgroup>
            `).join("")}
          </select>
        </div>
        <div class="form-field">
          <label for="exerciseDuration">运动时长（分钟）</label>
          <input id="exerciseDuration" name="durationMinutes" type="number" min="1" step="1" required>
        </div>
        <div class="form-field full">
          <label for="exerciseNote">备注（可选）</label>
          <textarea id="exerciseNote" name="note"></textarea>
        </div>
        <div class="form-field full">
          <button type="submit">添加运动</button>
        </div>
      </form>
      <p class="hint">运动消耗为估算值。由于无法实时读取心率、速度、坡度和海拔，本工具只根据运动类型、时长和体重进行估算。</p>
    </div>
  `;
  document.getElementById("exerciseForm").addEventListener("submit", handleExerciseSubmit);
}

function handleExerciseSubmit(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const type = form.get("type");
  const durationMinutes = Math.max(1, Number(form.get("durationMinutes")) || 0);
  const caloriesBurned = calculateExerciseCalories(type, durationMinutes, Number(data.profile.weightKg) || 0);
  const caloriesAdded = round(caloriesBurned * getExerciseEatBackRate(data.profile.goal));
  addExerciseEntry(getCurrentDate(), {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    type,
    durationMinutes,
    caloriesBurned,
    caloriesAdded,
    note: form.get("note").trim()
  });
  event.currentTarget.reset();
}

function addExerciseEntry(date, entry) {
  ensureDailyLog(date).exerciseEntries.push(entry);
  touchDailyLog(date);
  saveData();
  renderAll();
}

function deleteExerciseEntry(date, id) {
  const log = ensureDailyLog(date);
  log.exerciseEntries = log.exerciseEntries.filter((entry) => entry.id !== id);
  touchDailyLog(date);
  saveData();
  renderAll();
}

function calculateExerciseCalories(type, durationMinutes, weightKg) {
  const met = exerciseMETs[type] || 0;
  return round(met * Number(weightKg || 0) * (Number(durationMinutes || 0) / 60));
}

function getTotalExerciseBurned(date = getCurrentDate()) {
  const log = ensureDailyLog(date);
  if (log.dayStatus !== "workout") return 0;
  return round(log.exerciseEntries.reduce((sum, entry) => sum + (Number(entry.caloriesBurned) || 0), 0));
}

function getExerciseEatBackRate(goal) {
  if (goal === "fat_loss") return 0.5;
  if (goal === "maintain") return 0.8;
  if (goal === "muscle_gain") return 1;
  return 0.8;
}

function calculateAdjustedDailyTargets(date = getCurrentDate()) {
  const summary = calculateDailySummary(date);
  return {
    targets: calculateTargets(data.profile),
    dayStatus: summary.dayStatus,
    totalExerciseBurned: summary.totalExerciseBurned,
    exerciseEatBackRate: getExerciseEatBackRate(data.profile.goal),
    exerciseCaloriesAdded: summary.exerciseCaloriesAdded,
    adjustedTargetCalories: summary.adjustedTargetCalories
  };
}

function calculateDailySummary(date) {
  const targets = calculateTargets(data.profile);
  const log = ensureDailyLog(date);
  const foodTotals = getFoodTotals(date);
  const totalExerciseBurned = getTotalExerciseBurned(date);
  const exerciseEatBackRate = getExerciseEatBackRate(data.profile.goal);
  const exerciseCaloriesAdded = log.dayStatus === "workout" ? round(totalExerciseBurned * exerciseEatBackRate) : 0;
  const baseTargetCalories = targets.calories;
  let adjustedTargetCalories = targets.calories;

  if (log.dayStatus === "rest") {
    adjustedTargetCalories = data.profile.goal === "fat_loss"
      ? Math.max(targets.bmr, targets.calories - 100)
      : targets.calories;
  }
  if (log.dayStatus === "workout") {
    adjustedTargetCalories = targets.calories + exerciseCaloriesAdded;
  }

  return {
    date,
    dayStatus: log.dayStatus,
    foodCalories: round(foodTotals.calories),
    protein: round(foodTotals.protein),
    carbs: round(foodTotals.carbs),
    fat: round(foodTotals.fat),
    totalExerciseBurned,
    exerciseCaloriesAdded: round(exerciseCaloriesAdded),
    baseTargetCalories,
    adjustedTargetCalories: round(adjustedTargetCalories),
    remainingCalories: round(adjustedTargetCalories - foodTotals.calories),
    remainingProtein: round(targets.protein - foodTotals.protein),
    remainingCarbs: round(targets.carbs - foodTotals.carbs),
    remainingFat: round(targets.fat - foodTotals.fat)
  };
}

function renderMedicalDietMode() {
  document.getElementById("entryTitle").textContent = "食材与菜品";
  document.querySelector("#entryTitle").previousElementSibling.textContent = "医嘱饮食记录";
  document.getElementById("entryTabs").innerHTML = "";
  document.getElementById("estimatePanel").innerHTML = "";
  document.getElementById("templatePanel").innerHTML = `
    <div class="medical-mode">
      ${renderIngredientSelector()}
      <div id="medicalPortionCalculator"></div>
      ${renderMedicalDietSettings()}
    </div>
  `;
  bindIngredientSelector();
  renderIngredientNutritionPreview();
  bindMedicalDietSettings();
}

function renderMedicalDietSettings() {
  const profile = data.medicalDietProfile;
  if (!isMedicalSettingsEditing) {
    return `
      <section class="medical-section medical-settings-summary">
        <div class="section-heading compact-heading">
          <div>
            <p class="eyebrow">摘要</p>
            <h3>我的饮食限制</h3>
            <p class="medical-settings-available">可设置：蛋白质 / 碳水 / 脂肪 / 钠钾磷 / 钙 / 限水 / 控糖 / 嘌呤</p>
          </div>
          <button id="editMedicalSettingsBtn" class="ghost-btn small-btn" type="button">编辑限制</button>
        </div>
        <div class="medical-limit-summary">${renderMedicalSettingsSummary(profile)}</div>
        ${renderMedicalPublicBetaNotes()}
      </section>
    `;
  }
  return `
    <section class="medical-section">
      <div class="section-heading compact-heading">
        <div>
          <p class="eyebrow">用户手动录入</p>
          <h3>编辑饮食限制</h3>
        </div>
        <button id="closeMedicalSettingsBtn" class="ghost-btn small-btn" type="button">收起</button>
      </div>
      ${renderMedicalAdviceParser()}
      <form id="medicalDietSettingsForm" class="medical-settings-form">
        ${mainMedicalNutrients.map((key) => {
          const config = medicalNutrientConfig[key];
          const restriction = profile.restrictions[key];
          return `
            <div class="medical-restriction-row">
              <strong>${config.label}</strong>
              <select name="${key}_status" aria-label="${config.label}限制状态">
                ${restrictionStatusOrder.map((value) => `<option value="${value}" ${restriction.status === value ? "selected" : ""}>${restrictionStatusLabels[value]}</option>`).join("")}
              </select>
              <input name="${key}_limit" type="number" min="0" step="0.1" value="${restriction.limitValue ?? ""}" placeholder="每日上限">
              <span>${config.unit}</span>
              <input name="${key}_note" value="${escapeHTML(restriction.note)}" placeholder="备注，可选">
            </div>
          `;
        }).join("")}
        ${renderMedicalReminderSettings(profile)}
        <div class="form-field full">
          <label for="doctorAdviceNote">医生或营养师说明</label>
          <textarea id="doctorAdviceNote" name="doctorAdviceNote" placeholder="仅记录用户收到的建议，不做自动解析">${escapeHTML(profile.doctorAdviceNote)}</textarea>
        </div>
        <button type="submit">保存医嘱限制设置</button>
      </form>
    </section>
  `;
}

function renderMedicalPublicBetaNotes() {
  return `
    <div class="public-beta-notes">
      <p class="entry-meta">当前版本：v0.3.0 public beta。公开测试版，仅用于功能体验和饮食估算流程测试。</p>
      <details>
        <summary>使用边界说明</summary>
        <p class="hint">本工具仅根据你录入的医嘱限制进行饮食估算，不提供诊断、治疗或个体化营养处方。饮食限制需以医生或注册营养师建议为准。食材数据、菜品搭配和用油量均为估算值，实际摄入会因品牌、部位、熟重/生重、烹饪方式和份量差异而变化。</p>
      </details>
      <details>
        <summary>数据说明</summary>
        <p class="hint">食材营养数据为常见食材估算值。肉类默认按较常见家庭食用部位估算，牛肉默认按偏瘦牛肉估算；不同部位、品牌、熟重/生重、调味和烹饪方式会造成差异。用油量按烹饪方式默认估算，用户可以手动修改。钠、钾、磷、钙、限水、控糖、嘌呤等项目仅作为医嘱提醒，不生成自动饮食处方。</p>
      </details>
      <details>
        <summary>本地数据管理</summary>
        <button id="clearLocalTestDataBtn" class="ghost-btn small-btn" type="button">清空本地测试数据</button>
      </details>
    </div>
  `;
}

function renderMedicalReminderSettings(profile) {
  const kidneyReminders = profile.kidneyReminders || {};
  const extraReminders = profile.extraReminders || {};
  return `
    <section class="medical-reminder-settings">
      <div>
        <strong>基础提醒</strong>
        <div class="reminder-option-grid">
          ${Object.entries(kidneyReminderConfig).map(([key, config]) => {
            const reminder = kidneyReminders[key] || {};
            const parsedEnabled = parsedMedicalAdviceReminderUpdates?.kidneyReminders?.[key]?.enabled;
            return `
              <label class="check-option reminder-check">
                <input type="checkbox" name="kidney_${key}_enabled" ${reminder.enabled || parsedEnabled ? "checked" : ""}>
                <span>${config.label}</span>
              </label>
              <input name="kidney_${key}_note" value="${escapeHTML(reminder.note || "")}" placeholder="备注，可选">
            `;
          }).join("")}
        </div>
      </div>
        <p class="hint">以下项目仅在医嘱或合并症需要时启用，不是所有用户都需要管理。</p>
      <details class="extra-reminder-settings">
        <summary>更多提醒：钙 / 限水 / 控糖 / 嘌呤</summary>
        <div class="reminder-option-grid">
          ${Object.entries(extraReminderConfig).map(([key, config]) => {
            const reminder = extraReminders[key] || {};
            const parsedEnabled = parsedMedicalAdviceReminderUpdates?.extraReminders?.[key]?.enabled;
            return `
              <label class="check-option reminder-check">
                <input type="checkbox" name="extra_${key}_enabled" ${reminder.enabled || parsedEnabled ? "checked" : ""}>
                <span>${config.label}</span>
              </label>
              <input name="extra_${key}_note" value="${escapeHTML(reminder.note || "")}" placeholder="备注，可选">
            `;
          }).join("")}
        </div>
      </details>
    </section>
  `;
}

function bindMedicalDietSettings() {
  const editButton = document.getElementById("editMedicalSettingsBtn");
  if (editButton) {
    editButton.addEventListener("click", () => {
      isMedicalSettingsEditing = true;
      renderMedicalDietMode();
    });
  }
  const closeButton = document.getElementById("closeMedicalSettingsBtn");
  if (closeButton) {
    closeButton.addEventListener("click", () => {
      isMedicalSettingsEditing = false;
      renderMedicalDietMode();
    });
  }
  bindMedicalAdviceParser();
  document.getElementById("clearLocalTestDataBtn")?.addEventListener("click", clearLocalTestData);
  const form = document.getElementById("medicalDietSettingsForm");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    saveMedicalDietSettings(new FormData(form));
  });
}

function renderMedicalSettingsSummary(profile) {
  const hasRestrictions = mainMedicalNutrients.some((key) => profile.restrictions[key]?.status !== "none")
    || Object.values(profile.kidneyReminders || {}).some((item) => item?.enabled)
    || Object.values(profile.extraReminders || {}).some((item) => item?.enabled);
  if (!hasRestrictions) {
    return [
      "尚未设置",
      "更多提醒：未启用",
      "可设置：钙 / 限水 / 控糖 / 嘌呤"
    ].map((item) => `<p class="entry-meta">${escapeHTML(item)}</p>`).join("");
  }
  const macroItems = mainMedicalNutrients.map((key) => {
    const restriction = profile.restrictions[key];
    const label = medicalNutrientConfig[key].label;
    if (!restriction || restriction.status === "none") return `${label}：未设置`;
    if (restriction.limitValue) return `${label}：${restriction.limitValue}${restriction.unit}/天`;
    return `${label}：${restrictionStatusLabels[restriction.status] || "仅提醒"}`;
  });
  const microItems = microMedicalNutrients.map((key) => `${medicalNutrientConfig[key].label}：${getKidneyReminderStatus(key)}`);
  const extraItems = Object.entries(extraReminderConfig)
    .filter(([key]) => profile.extraReminders?.[key]?.enabled)
    .map(([, config]) => config.shortLabel);
  const summaryItems = [...macroItems, ...microItems];
  if (extraItems.length) {
    summaryItems.push(`更多提醒：${extraItems.join("｜")}`);
  } else {
    summaryItems.push("更多提醒：未启用", "可设置：钙 / 限水 / 控糖 / 嘌呤");
  }
  return summaryItems.map((item) => `<p class="entry-meta">${escapeHTML(item)}</p>`).join("");
}

function renderMedicalAdviceParser() {
  return `
    <div class="medical-advice-parser">
      <div class="section-heading compact-heading">
        <div>
          <p class="eyebrow">文本辅助</p>
          <h3>一键录入医嘱</h3>
        </div>
      </div>
      <textarea id="medicalAdviceInput" class="medical-advice-input" placeholder="例如：控制蛋白质，脂肪不超过40g，低盐，注意高钾食物……">${escapeHTML(medicalAdviceInputText)}</textarea>
      <div class="parser-actions">
        <button id="parseMedicalAdviceBtn" type="button">一键解析</button>
        ${medicalAdviceParserHasRun ? `<button id="clearParsedAdviceBtn" class="ghost-btn" type="button">清空解析结果</button>` : ""}
      </div>
      <div id="parsedAdvicePreview">${renderParsedAdvicePreview(parsedMedicalAdviceResults, medicalAdviceParserHasRun)}</div>
    </div>
  `;
}

function bindMedicalAdviceParser() {
  const input = document.getElementById("medicalAdviceInput");
  if (input) {
    input.addEventListener("input", (event) => {
      medicalAdviceInputText = event.target.value;
    });
  }
  const parseButton = document.getElementById("parseMedicalAdviceBtn");
  if (parseButton) {
    parseButton.addEventListener("click", () => {
      medicalAdviceInputText = input ? input.value : "";
      const parsedAdvice = parseMedicalAdviceText(medicalAdviceInputText);
      parsedMedicalAdviceResults = parsedAdvice.nutrientResults;
      parsedMedicalAdviceMicroNotes = extractMicroNutrientNotes(medicalAdviceInputText);
      parsedMedicalAdviceReminderUpdates = parsedAdvice.reminderUpdates;
      parsedMedicalAdviceContext = parsedAdvice.context;
      medicalAdviceParserHasRun = true;
      renderMedicalDietMode();
    });
  }
  const clearButton = document.getElementById("clearParsedAdviceBtn");
  if (clearButton) {
    clearButton.addEventListener("click", () => {
      parsedMedicalAdviceResults = [];
      parsedMedicalAdviceMicroNotes = {};
      parsedMedicalAdviceReminderUpdates = null;
      parsedMedicalAdviceContext = null;
      medicalAdviceInputText = "";
      medicalAdviceParserHasRun = false;
      renderMedicalDietMode();
    });
  }
  document.querySelectorAll("[data-apply-parsed-advice]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const result = parsedMedicalAdviceResults.find((item) => item.key === checkbox.dataset.applyParsedAdvice);
      if (result) result.apply = checkbox.checked;
    });
  });
  const applyButton = document.getElementById("applyParsedAdviceBtn");
  if (applyButton) {
    applyButton.addEventListener("click", () => {
      document.querySelectorAll("[data-apply-parsed-advice]").forEach((checkbox) => {
        const result = parsedMedicalAdviceResults.find((item) => item.key === checkbox.dataset.applyParsedAdvice);
        if (result) result.apply = checkbox.checked;
      });
      applyParsedAdviceToProfile(parsedMedicalAdviceResults.filter((item) => item.apply));
    });
  }
}

function saveMedicalDietSettings(form) {
  const profile = normalizeMedicalDietProfile(data.medicalDietProfile);
  profile.enabled = true;
  mainMedicalNutrients.forEach((key) => {
    const rawLimit = form.get(`${key}_limit`);
    profile.restrictions[key] = {
      ...profile.restrictions[key],
      status: form.get(`${key}_status`),
      limitValue: rawLimit === "" || rawLimit === null ? null : Number(rawLimit),
      note: String(form.get(`${key}_note`) || "").trim()
    };
  });
  profile.doctorAdviceNote = String(form.get("doctorAdviceNote") || "").trim();
  Object.entries(kidneyReminderConfig).forEach(([key, config]) => {
    const enabled = form.get(`kidney_${key}_enabled`) === "on";
    const note = String(form.get(`kidney_${key}_note`) || "").trim();
    profile.kidneyReminders[key] = {
      enabled,
      status: enabled ? config.status : "none",
      note
    };
    profile.microNutrientNotes[key] = note;
  });
  Object.entries(extraReminderConfig).forEach(([key]) => {
    profile.extraReminders[key] = {
      enabled: form.get(`extra_${key}_enabled`) === "on",
      note: String(form.get(`extra_${key}_note`) || "").trim()
    };
  });
  data.medicalDietProfile = normalizeMedicalDietProfile(profile);
  saveData();
  renderAll();
}

function parseMedicalAdviceText(text) {
  const sourceText = String(text || "").trim();
  if (!sourceText) return { nutrientResults: [], reminderUpdates: extractReminderUpdates(""), context: detectMedicalAdviceContext("") };
  const nutrientResults = mainMedicalNutrients.map((key) => [key, nutrientParseConfig[key]])
    .map(([key, config]) => extractNutrientRestriction(sourceText, { key, ...config }))
    .filter(Boolean);
  return {
    nutrientResults,
    reminderUpdates: extractReminderUpdates(sourceText),
    context: detectMedicalAdviceContext(sourceText)
  };
}

function detectMedicalAdviceContext(text) {
  const source = String(text || "");
  const detectedKeywords = [];
  if (/CKD|慢性肾病|肾病|肾脏|肾功能|尿蛋白/.test(source)) detectedKeywords.push("肾病相关");
  if (/糖尿病|血糖|控糖|低糖|少糖|主食控制|碳水控制/.test(source)) detectedKeywords.push("控糖");
  if (/高尿酸|尿酸|痛风|嘌呤/.test(source)) detectedKeywords.push("嘌呤 / 尿酸");
  let detectedContext = "";
  if (detectedKeywords.includes("肾病相关")) detectedContext = "肾病相关饮食提醒";
  else if (detectedKeywords.includes("控糖")) detectedContext = "控糖提醒";
  else if (detectedKeywords.includes("嘌呤 / 尿酸")) detectedContext = "嘌呤 / 尿酸提醒";
  return {
    detectedContext,
    detectedKeywords,
    source: "user_advice_text"
  };
}

function extractNutrientRestriction(text, nutrientConfig) {
  const snippets = getRelevantAdviceSnippets(text, nutrientConfig.keywords);
  if (!snippets.length) return null;
  const scopedText = snippets.join("；");
  const limitResult = extractLimitValue(scopedText, nutrientConfig.key);
  const parsedResult = {
    key: nutrientConfig.key,
    label: nutrientConfig.label,
    status: limitResult.limitValue !== null ? "strict" : getRestrictionStatusFromText(scopedText, nutrientConfig.key),
    limitValue: limitResult.limitValue,
    unit: nutrientConfig.unit,
    snippets,
    saltLimitMention: limitResult.saltLimitMention,
    apply: true
  };
  parsedResult.note = buildRestrictionNote(text, nutrientConfig.key, parsedResult);
  return parsedResult;
}

function extractLimitValue(text, nutrientKey) {
  const config = nutrientParseConfig[nutrientKey];
  const unit = config.unit;
  const normalized = String(text || "").replace(/\s+/g, "");
  if (nutrientKey === "sodium" && /(盐|食盐).{0,12}(不超过|少于|低于|控制在|限制在|以内).{0,10}\d+(?:\.\d+)?g/i.test(normalized)) {
    return { limitValue: null, saltLimitMention: true };
  }
  const unitPattern = getParseUnitPattern(unit);
  const keywordPattern = config.keywords.map(escapeRegExp).join("|");
  const patterns = [
    new RegExp(`(?:${keywordPattern}).{0,18}?(?:每日|每天|一日)?(?:不超过|少于|低于|控制在|限制在|上限|以内)?(\\d+(?:\\.\\d+)?)\\s*(?:${unitPattern})(?:以内)?`, "i"),
    new RegExp(`(?:每日|每天|一日)?(?:不超过|少于|低于|控制在|限制在|上限)?(\\d+(?:\\.\\d+)?)\\s*(?:${unitPattern})(?:以内)?.{0,18}?(?:${keywordPattern})`, "i")
  ];
  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match) return { limitValue: Number(match[1]), saltLimitMention: false };
  }
  return { limitValue: null, saltLimitMention: false };
}

function getRestrictionStatusFromText(text, nutrientKey) {
  const scopedText = String(text || "");
  if (/暂未|未给出|没有明确|视情况|根据情况|不确定/.test(scopedText)) return "unknown";
  const strictWords = ["严格限制", "明显限制", "每日不超过", "每天不超过", "不超过", "低盐", "限盐", "限水", "低钾", "低磷", "低蛋白", "禁止", "不得", "控制在", "限制在"];
  const moderateWords = ["适度控制", "注意控制", "建议控制", "避免过量", "控制", "减少", "少吃", "少油", "低脂", "控糖", "控制主食"];
  const reminderWords = ["需注意", "注意", "关注", "谨慎", "留意", "建议观察"];
  if (strictWords.some((word) => scopedText.includes(word))) return "strict";
  if (moderateWords.some((word) => scopedText.includes(word))) return "moderate";
  if (scopedText.includes("避免")) return "strict";
  if (reminderWords.some((word) => scopedText.includes(word))) return "reminder";
  if (nutrientKey === "sodium" && (/盐|腌制|酱油|蚝油|豆瓣酱/.test(scopedText) || medicalProcessedRiskPattern.test(scopedText))) return "reminder";
  if (nutrientKey === "fat" && /油炸|肥肉|高脂/.test(scopedText)) return "reminder";
  return "unknown";
}

function buildRestrictionNote(text, nutrientKey, parsedResult) {
  const label = nutrientParseConfig[nutrientKey].label;
  const snippetText = parsedResult.snippets.join("；");
  const parts = [
    `医嘱文本相关片段：${snippetText}`,
    `系统识别为${label}${restrictionStatusLabels[parsedResult.status]}。`
  ];
  if (parsedResult.limitValue !== null) {
    parts.push(`识别到明确上限：${parsedResult.limitValue}${parsedResult.unit}。`);
  } else {
    parts.push(`未识别到明确${label}摄入上限，请根据医生或营养师建议手动填写。`);
  }
  if (parsedResult.saltLimitMention) {
    parts.push("原文提到盐的克数上限，盐和钠不是同一个单位，本工具未自动换算为钠，请用户自行确认是否需要换算。");
  }
  parts.push("解析结果仅为文本辅助识别，请以原始医嘱和专业人员意见为准。");
  return parts.join("");
}

function renderParsedAdvicePreview(parsedResults, hasRun = true) {
  if (!hasRun) return "";
  const microNoteEntries = Object.entries(parsedMedicalAdviceMicroNotes).filter(([, note]) => note);
  const hasReminderUpdates = hasParsedReminderUpdates(parsedMedicalAdviceReminderUpdates);
  const hasContext = Boolean(parsedMedicalAdviceContext?.detectedContext);
  if (!parsedResults.length && !microNoteEntries.length && !hasReminderUpdates && !hasContext) {
    return `<p class="empty">未识别到明确的营养素限制。你可以手动设置需要限制的项目。</p>`;
  }
  return `
    <div class="parsed-advice-preview">
      <h3>解析结果预览</h3>
      ${renderMedicalContextPreview(parsedMedicalAdviceContext, Boolean(parsedResults.length || microNoteEntries.length || hasReminderUpdates))}
      ${parsedResults.length ? `
        <div class="parsed-advice-table">
          <div class="parsed-advice-head">营养素</div>
          <div class="parsed-advice-head">识别状态</div>
          <div class="parsed-advice-head">识别上限</div>
          <div class="parsed-advice-head">单位</div>
          <div class="parsed-advice-head">备注</div>
          <div class="parsed-advice-head">是否应用</div>
          ${parsedResults.map((result) => `
            <div>${escapeHTML(result.label)}</div>
            <div>${restrictionStatusLabels[result.status] || "不确定"}</div>
            <div>${result.limitValue === null ? "未识别" : result.limitValue}</div>
            <div>${escapeHTML(result.unit)}</div>
            <div class="parsed-note">${escapeHTML(result.note)}</div>
            <label class="check-option compact-check">
              <input type="checkbox" data-apply-parsed-advice="${result.key}" ${result.apply ? "checked" : ""}>
              <span>应用</span>
            </label>
          `).join("")}
        </div>
      ` : `<p class="empty">未识别到蛋白质、碳水或脂肪限制。可核对下方微量元素风险备注。</p>`}
      ${microNoteEntries.length ? `
        <div class="micro-note-preview">
          <strong>微量元素风险备注</strong>
          ${microNoteEntries.map(([key, note]) => `<p class="hint">${medicalNutrientConfig[key]?.label || "其他"}：${escapeHTML(note)}</p>`).join("")}
        </div>
      ` : ""}
      ${renderParsedReminderPreview(parsedMedicalAdviceReminderUpdates)}
      <button id="applyParsedAdviceBtn" type="button">确认应用到医嘱限制</button>
    </div>
  `;
}

function renderMedicalContextPreview(context, hasRestrictionItems) {
  if (context?.detectedContext) {
    return `<div class="micro-note-preview"><strong>识别结果：</strong><p class="hint">相关场景：${escapeHTML(context.detectedContext)}</p></div>`;
  }
  return `<div class="micro-note-preview"><strong>识别结果：</strong><p class="hint">已识别饮食限制项</p><p class="hint">未识别到具体疾病场景</p></div>`;
}

function applyParsedAdviceToProfile(selectedResults) {
  const hasMicroNotes = Object.values(parsedMedicalAdviceMicroNotes).some(Boolean);
  const hasReminderUpdates = hasParsedReminderUpdates(parsedMedicalAdviceReminderUpdates);
  const hasContext = Boolean(parsedMedicalAdviceContext?.detectedContext);
  if (!selectedResults.length && !hasMicroNotes && !hasReminderUpdates && !hasContext) {
    alert("请至少勾选一个解析结果。");
    return;
  }
  const overwriteItems = selectedResults.filter((result) => {
    const current = data.medicalDietProfile.restrictions[result.key];
    return result.limitValue !== null && current?.limitValue !== null && current?.limitValue !== undefined && Number(current.limitValue) !== Number(result.limitValue);
  });
  if (overwriteItems.length) {
    const names = overwriteItems.map((item) => item.label).join("、");
    if (!confirm(`这将覆盖当前 ${names} 的上限值。`)) return;
  }
  const profile = normalizeMedicalDietProfile(data.medicalDietProfile);
  profile.enabled = true;
  selectedResults.forEach((result) => {
    const current = profile.restrictions[result.key] || getDefaultMedicalDietProfile().restrictions[result.key];
    profile.restrictions[result.key] = {
      ...current,
      status: result.status,
      unit: result.unit,
      limitValue: result.limitValue === null ? current.limitValue : result.limitValue,
      note: result.note
    };
  });
  profile.doctorAdviceNote = medicalAdviceInputText.trim();
  profile.context = parsedMedicalAdviceContext || profile.context;
  profile.microNutrientNotes = {
    ...profile.microNutrientNotes,
    ...parsedMedicalAdviceMicroNotes
  };
  applyReminderUpdatesToProfile(profile, parsedMedicalAdviceReminderUpdates);
  data.medicalDietProfile = normalizeMedicalDietProfile(profile);
  parsedMedicalAdviceResults = [];
  parsedMedicalAdviceMicroNotes = {};
  parsedMedicalAdviceReminderUpdates = null;
  parsedMedicalAdviceContext = null;
  medicalAdviceParserHasRun = false;
  saveData();
  renderAll();
}

function extractReminderUpdates(text) {
  const source = String(text || "");
  const kidneyReminders = {};
  Object.entries(kidneyReminderConfig).forEach(([key, config]) => {
    const snippets = getRelevantAdviceSnippets(source, config.keywords);
    if (snippets.length) {
      kidneyReminders[key] = {
        enabled: true,
        status: config.status,
        note: `医嘱文本提到${snippets.join("；")}。`
      };
    }
  });
  const extraReminders = {};
  Object.entries(extraReminderConfig).forEach(([key, config]) => {
    const snippets = getRelevantAdviceSnippets(source, config.keywords);
    if (snippets.length) {
      extraReminders[key] = {
        enabled: true,
        note: `医嘱文本提到${snippets.join("；")}。`
      };
    }
  });
  return { kidneyReminders, extraReminders };
}

function hasParsedReminderUpdates(updates) {
  return Boolean(updates && (Object.keys(updates.kidneyReminders || {}).length || Object.keys(updates.extraReminders || {}).length));
}

function applyReminderUpdatesToProfile(profile, updates) {
  if (!hasParsedReminderUpdates(updates)) return;
  Object.entries(updates.kidneyReminders || {}).forEach(([key, value]) => {
    profile.kidneyReminders[key] = { ...(profile.kidneyReminders[key] || {}), ...value };
    profile.microNutrientNotes[key] = value.note || profile.microNutrientNotes[key] || "";
  });
  Object.entries(updates.extraReminders || {}).forEach(([key, value]) => {
    profile.extraReminders[key] = { ...(profile.extraReminders[key] || {}), ...value };
  });
}

function renderParsedReminderPreview(updates) {
  if (!hasParsedReminderUpdates(updates)) return "";
  const kidneyItems = Object.entries(updates.kidneyReminders || {}).map(([key]) => kidneyReminderConfig[key]?.shortLabel || kidneyReminderConfig[key]?.label || key);
  const extraItems = Object.entries(updates.extraReminders || {}).map(([key]) => extraReminderConfig[key]?.shortLabel || extraReminderConfig[key]?.label || key);
  return `
    <div class="micro-note-preview">
      <strong>提醒项识别</strong>
      ${kidneyItems.length ? `<p class="hint">基础提醒：${kidneyItems.map(escapeHTML).join("｜")}</p>` : ""}
      ${extraItems.length ? `<p class="hint">更多提醒：${extraItems.map(escapeHTML).join("｜")}</p>` : ""}
    </div>
  `;
}

function extractMicroNutrientNotes(text) {
  const sourceText = String(text || "").trim();
  const notes = {};
  microMedicalNutrients.forEach((key) => {
    const config = nutrientParseConfig[key];
    const snippets = getRelevantAdviceSnippets(sourceText, config.keywords);
    if (snippets.length) {
      notes[key] = `医嘱文本提到${snippets.join("；")}。具体食材选择请以医生或营养师建议为准。`;
    }
  });
  return notes;
}

function getRelevantAdviceSnippets(text, keywords) {
  const sentences = String(text || "")
    .split(/[。！？；;\n，,]/)
    .map((item) => item.trim())
    .filter(Boolean);
  const source = sentences.length ? sentences : [String(text || "").trim()];
  return source.filter((sentence) => keywords.some((keyword) => sentence.includes(keyword)));
}

function getParseUnitPattern(unit) {
  if (unit === "mg") return "mg|毫克";
  if (unit === "g") return "g|克";
  if (unit === "kcal") return "kcal|千卡|大卡|卡路里";
  if (unit === "ml") return "ml|mL|毫升";
  return escapeRegExp(unit);
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function calculateMedicalDietProgress(date) {
  const profile = data.medicalDietProfile;
  const totals = {};
  const validCounts = {};
  const entries = getMedicalDietEntries(date);
  mainMedicalNutrients.forEach((key) => {
    totals[key] = 0;
    validCounts[key] = 0;
  });
  entries.forEach((entry) => {
    const nutrition = calculateEntryNutrition(entry);
    mainMedicalNutrients.forEach((key) => {
      const value = nutrition[key];
      if (value !== null && value !== undefined && Number.isFinite(Number(value))) {
        totals[key] += Number(value);
        validCounts[key] += 1;
      }
    });
  });

  const progress = {};
  mainMedicalNutrients.forEach((key) => {
    const restriction = profile.restrictions[key];
    if (!["strict", "moderate", "reminder"].includes(restriction.status)) return;
    const limit = Number(restriction.limitValue);
    const hasLimit = Number.isFinite(limit) && limit > 0;
    const current = entries.length > 0 && validCounts[key] === 0 ? null : round(totals[key] || 0);
    const percent = hasLimit && current !== null ? round((current / limit) * 100) : null;
    progress[key] = {
      current,
      limit: hasLimit ? limit : null,
      unit: restriction.unit,
      percent,
      colorState: hasLimit && current !== null ? getProgressColorState(percent) : "none",
      message: !hasLimit ? restrictionStatusLabels[restriction.status] : current === null ? "暂无可靠数据" : getProgressMessage(percent),
      confidence: key === "sodium" || key === "potassium" || key === "phosphorus" ? "low" : "medium"
    };
  });
  return progress;
}

function isMedicalDietEntry(entry) {
  return entry?.type === "medical_meal_suggestion"
    || entry?.sourceType === "medical_meal_suggestion"
    || entry?.type === "medical_ingredient"
    || entry?.sourceType === "medical_ingredient"
    || entry?.category === "医嘱限制饮食";
}

function getMedicalDietEntries(date) {
  return ensureDailyLog(date).foodEntries.filter(isMedicalDietEntry);
}

function renderNutrientProgressBars(date) {
  const progress = calculateMedicalDietProgress(date);
  const entries = Object.entries(progress);
  if (!entries.length) {
    return `<div class="medical-progress-panel"><h3>医嘱限制进度</h3><p class="empty">尚未启用具体限制项。请先在医嘱限制设置中录入。</p></div>`;
  }
  return `
    <div class="medical-progress-panel">
      <h3>医嘱限制进度</h3>
      <div class="progress-list">
        ${entries.map(([key, item]) => `
          <div class="progress-item">
            <div class="progress-head">
              <strong>${medicalNutrientConfig[key].label}</strong>
              <span>${round(item.current)}${item.unit}${item.limit ? ` / ${item.limit}${item.unit}` : ""}${item.percent !== null ? `｜${round(item.percent)}%` : ""}</span>
            </div>
            ${item.percent !== null ? `<div class="progress-track"><div class="progress-fill ${item.colorState}" style="width:${Math.min(item.percent, 100)}%"></div></div>` : ""}
            <p class="hint">${item.message}</p>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function getProgressColorState(percent) {
  if (percent > 100) return "red";
  if (percent >= 90) return "orange-red";
  if (percent >= 70) return "yellow";
  return "green";
}

function getProgressMessage(percent) {
  if (percent > 100) return "已超过上限，后续建议减少。";
  if (percent >= 90) return "接近上限，后续谨慎增加。";
  if (percent >= 70) return "接近限制值，后续注意控制。";
  return "当前仍在范围内。";
}

function renderIngredientSelector() {
  return `
    <section class="medical-section">
      <div class="section-heading compact-heading">
        <div>
          <p class="eyebrow">家庭做饭场景</p>
          <h3>选择主食材</h3>
        </div>
      </div>
      <div class="control-grid">
        <div class="form-field">
          <label for="medicalIngredientCategory">菜品分类</label>
          <select id="medicalIngredientCategory">
            <option value="" ${selectedMedicalIngredientCategory ? "" : "selected"}>请选择分类</option>
            ${Object.entries(medicalSelectorCategoryLabels).map(([key, label]) => `<option value="${key}" ${selectedMedicalIngredientCategory === key ? "selected" : ""}>${label}</option>`).join("")}
          </select>
        </div>
        <div class="form-field">
          <label for="medicalIngredientSelect">具体食材</label>
          <select id="medicalIngredientSelect" ${selectedMedicalIngredientCategory ? "" : "disabled"}>
            <option value="">${selectedMedicalIngredientCategory ? "请选择食材" : "请先选择分类"}</option>
            ${getIngredientsByCategory(selectedMedicalIngredientCategory).map((ingredient) => `<option value="${ingredient.id}" ${selectedMedicalIngredientId === ingredient.id ? "selected" : ""}>${ingredient.name}</option>`).join("")}
          </select>
        </div>
      </div>
    </section>
  `;
}

function bindIngredientSelector() {
  const categorySelect = document.getElementById("medicalIngredientCategory");
  const ingredientSelect = document.getElementById("medicalIngredientSelect");
  if (categorySelect) {
    categorySelect.addEventListener("change", (event) => {
      selectedMedicalIngredientCategory = event.target.value;
      selectedMedicalIngredientId = "";
      selectedMealTemplateId = "";
      selectedMedicalVariantId = "";
      visibleMealTemplateIds = [];
      refreshMedicalDietView();
    });
  }
  if (ingredientSelect) {
    ingredientSelect.addEventListener("change", (event) => {
      selectedMedicalIngredientId = event.target.value;
      selectedMealTemplateId = "";
      selectedMedicalVariantId = "";
      visibleMealTemplateIds = [];
      renderIngredientNutritionPreview();
      renderMedicalDietRecords();
    });
  }
}

function getIngredientsByCategory(category) {
  const names = medicalSelectorIngredients[category] || [];
  return names
    .map((name) => ingredientNutritionProfiles.find((ingredient) => ingredient.name === name))
    .filter(Boolean);
}

function getSelectedMedicalIngredient() {
  if (!selectedMedicalIngredientId) return null;
  const selected = ingredientNutritionProfiles.find((ingredient) => ingredient.id === selectedMedicalIngredientId);
  if (selected && isMedicalSelectableIngredientName(selected.name)) return selected;
  return null;
}

function renderSelectedIngredient() {
  const target = document.getElementById("selectedMedicalIngredient");
  const ingredient = getSelectedMedicalIngredient();
  if (!target) return;
  if (!ingredient) {
    target.innerHTML = `
      <section class="medical-side-section compact-risk-card">
        <h3>当前食材风险</h3>
        <p class="empty">请选择食材后查看风险提醒。</p>
      </section>
    `;
    return;
  }
  target.innerHTML = `
    <div class="selected-ingredient-card compact-risk-card">
      <h3>${ingredient.name}</h3>
      <p class="entry-meta">${getIngredientSummaryLabels(ingredient).join("｜")}</p>
      <p class="entry-meta medical-risk-summary"><strong>风险：</strong>${getIngredientRiskLabels(ingredient).join(" / ")}</p>
      <div class="risk-pill-row">${renderIngredientRiskBadges(ingredient)}</div>
      <ul class="compact-list">${getIngredientCompactTips(ingredient).concat(getLinkedMicroRiskTips(ingredient)).map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>
    </div>
  `;
}

function getIngredientRiskLabels(ingredient) {
  const labels = [];
  if (ingredient.role === "main_protein") labels.push("蛋白质");
  if (isStapleIngredient(ingredient)) labels.push("碳水");
  if (ingredient.microRiskTags?.sodium === "high") labels.push("钠");
  if (["medium", "high"].includes(ingredient.microRiskTags?.potassium)) labels.push("钾");
  if (["medium", "high"].includes(ingredient.microRiskTags?.phosphorus)) labels.push("磷");
  if (["medium", "high"].includes(ingredient.purineRisk)) labels.push("嘌呤");
  const sortedLabels = sortMedicalRiskTags(labels).map(getMedicalRiskLabel);
  return sortedLabels.length ? sortedLabels : ["一般提醒"];
}

function getIngredientSummaryLabels(ingredient) {
  if (ingredient.role === "vegetable_fiber") {
    return [
      "素菜",
      "低蛋白",
      "低脂肪",
      getVegetableCarbLabel(ingredient.carbType)
    ];
  }
  if (isStapleIngredient(ingredient)) return ["主食", "碳水来源"];
  return [getMedicalSelectorCategoryLabel(ingredient), riskLabel("protein", ingredient.riskTags.protein), riskLabel("fat", ingredient.riskTags.fat), riskLabel("carbs", ingredient.riskTags.carbs)];
}

function getVegetableCarbLabel(carbType) {
  if (carbType === "moderate_carb_vegetable") return "中等碳水";
  if (carbType === "starchy_vegetable") return "接近主食";
  return "低碳水";
}

function getMedicalSelectorCategoryLabel(ingredient) {
  if (medicalSelectorIngredients.meat.includes(ingredient.name)) return "荤菜";
  if (medicalSelectorIngredients.staple.includes(ingredient.name)) return "主食";
  return "素菜";
}

function getIngredientCompactTips(ingredient) {
  if (isStapleIngredient(ingredient)) {
    return ["属于主食/碳水来源", "限碳水：控制份量", "避免同餐叠加米饭、面条、红薯等主食"];
  }
  if (ingredient.role === "main_protein") {
    const tips = ["限蛋白：控制份量"];
    if (["medium", "high"].includes(ingredient.riskTags.fat)) tips.push("限脂肪：优先瘦肉、少油做法");
    if (["medium", "high"].includes(ingredient.microRiskTags?.potassium) || ["medium", "high"].includes(ingredient.microRiskTags?.phosphorus)) tips.push("钾/磷：按医嘱关注");
    return tips;
  }
  const tips = ["可作为配菜"];
  if (ingredient.carbType === "moderate_carb_vegetable") tips.push("若限制碳水，注意份量");
  if (["medium", "high"].includes(ingredient.microRiskTags?.potassium)) tips.push("钾：需关注时按医嘱处理");
  return tips;
}

function isStapleIngredient(ingredient) {
  return ingredient?.role === "main_carb" || medicalSelectorIngredients.staple.includes(ingredient?.name);
}

function getIngredientRoleLabels(ingredient) {
  if (ingredient.role === "main_protein") return ["主蛋白食材", "蛋白质来源"];
  if (ingredient.role === "vegetable_fiber") return ["膳食纤维", "蔬菜配菜", "低蛋白", "低脂肪"];
  if (ingredient.role === "main_carb") return ["主食/碳水来源"];
  if (ingredient.role === "fat_source") return ["脂肪来源"];
  if (ingredient.categoryKey === "processed") return ["加工食品", "钠风险关注"];
  return [ingredient.category];
}

function getIngredientRoleAdvice(ingredient) {
  if (ingredient.categoryKey === "processed") return "加工食品。通常需关注钠风险，优先选择新鲜食材。";
  if (ingredient.role === "main_protein") return "主蛋白来源。若限制蛋白质，控制份量，避免叠加鸡蛋/豆腐/奶制品。";
  if (ingredient.role === "vegetable_fiber") return "低蛋白/低脂/低碳水。若该食材标记钾风险，请按医嘱控制。";
  if (ingredient.role === "main_carb") return "主食来源。若限制碳水，控制份量，避免与米饭/面条/土豆等叠加。";
  if (ingredient.role === "fat_source") return "脂肪来源。若限制脂肪，控制份量，避免油炸和重油。";
  return "按食材风险提示控制份量。";
}

function renderMicroRiskNotes(ingredient) {
  const notes = ingredient.microRiskNotes || [];
  const profileNotes = data.medicalDietProfile?.microNutrientNotes || {};
  const adviceNotes = microMedicalNutrients
    .filter((key) => profileNotes[key] && ["medium", "high"].includes(ingredient.microRiskTags?.[key]))
    .map((key) => `你的医嘱备注提到${medicalNutrientConfig[key].label}相关限制；当前食材该项为${riskLevelText(ingredient.microRiskTags[key])}，请结合专业建议判断份量。`);
  const allNotes = [...notes, ...adviceNotes];
  if (!allNotes.length) return `<p class="hint">暂无特别标记的微量元素风险。</p>`;
  return allNotes.map((note) => `<p class="hint">${escapeHTML(note)}</p>`).join("");
}

function renderIngredientRiskBadges(ingredient) {
  const macroBadges = [
    ["protein", "蛋白质"],
    ["fat", "脂肪"],
    ["carbs", "碳水"]
  ].map(([key, label]) => `<span class="risk-pill">${label}：${riskBurdenText(ingredient.riskTags?.[key])}</span>`);
  const microBadges = microMedicalNutrients
    .filter((key) => ["medium", "high"].includes(ingredient.microRiskTags?.[key]))
    .map((key) => `<span class="risk-pill micro">${medicalNutrientConfig[key].label}：需关注</span>`);
  const purineBadge = ["medium", "high"].includes(ingredient.purineRisk)
    ? `<span class="risk-pill micro">嘌呤：需关注</span>`
    : "";
  return [...macroBadges, ...microBadges, purineBadge].join("") || `<span class="risk-pill">暂无特别风险</span>`;
}

function riskBurdenText(level) {
  if (level === "high") return "高负担";
  if (level === "medium") return "中等";
  if (level === "low") return "低负担";
  return "未知";
}

function riskLevelText(level) {
  return { low: "低", medium: "中", high: "高", unknown: "未知" }[level] || "未知";
}

function renderIngredientNutritionPreview() {
  const target = document.getElementById("medicalPortionCalculator");
  const ingredient = getSelectedMedicalIngredient();
  if (!target) return;
  if (!ingredient) {
    target.innerHTML = `
      <section class="medical-section">
        <div class="section-heading compact-heading">
          <div>
            <p class="eyebrow">食物重量计算</p>
            <h3>食物重量计算</h3>
          </div>
        </div>
        <p class="empty">请选择食材并输入重量后估算。</p>
      </section>
    `;
    return;
  }
  const variants = medicalIngredientVariants[ingredient.name] || [];
  const selectedVariant = getSelectedMedicalVariant(ingredient);
  target.innerHTML = `
    <section class="medical-section">
      <div class="section-heading compact-heading">
        <div>
          <p class="eyebrow">平均分食</p>
          <h3>食物重量计算</h3>
        </div>
      </div>
      <div class="control-grid">
        ${variants.length ? `
          <div class="form-field">
            <label for="medicalIngredientVariant">肥瘦程度 / 部位</label>
            <select id="medicalIngredientVariant">
              ${variants.map((variant) => `<option value="${variant.id}" ${selectedVariant?.id === variant.id ? "selected" : ""}>${variant.label}</option>`).join("")}
            </select>
          </div>
        ` : ""}
        <div class="form-field"><label for="medicalTotalWeight">当前食材用量 g</label><input id="medicalTotalWeight" type="number" min="0" step="1" value="${escapeHTML(medicalDraft.ingredientWeight)}"></div>
        <div class="form-field"><label for="medicalSharedPeople">共同食用人数</label><input id="medicalSharedPeople" type="number" min="1" step="1" value="${medicalDraft.eatAll ? "" : escapeHTML(medicalDraft.sharedPeople)}" placeholder="${medicalDraft.eatAll ? "不适用" : ""}" ${medicalDraft.eatAll ? "disabled" : ""}></div>
        <div class="form-field"><label for="medicalUserPortion">自己吃几份</label><input id="medicalUserPortion" type="number" min="0" step="0.5" value="${medicalDraft.eatAll ? "" : escapeHTML(medicalDraft.userPortion)}" placeholder="${medicalDraft.eatAll ? "不适用" : ""}" ${medicalDraft.eatAll ? "disabled" : ""}></div>
        <label class="check-option"><input id="medicalEatAll" type="checkbox" ${medicalDraft.eatAll ? "checked" : ""}> <span>一个人吃完</span></label>
      </div>
      ${selectedVariant?.note ? `<p class="hint">${escapeHTML(selectedVariant.note)}</p>` : ""}
      <p id="medicalPortionHint" class="hint">${medicalDraft.eatAll ? "已按一个人吃完整份计算。" : "按平均分食估算。"}</p>
      <div id="medicalWeightResult"></div>
    </section>
  `;
  bindMedicalWeightInputs();
  updateWeightCalculationResultOnly();
}

function calculatePersonalIngredientPortion() {
  const totalWeight = Math.max(0, Number(medicalDraft.ingredientWeight) || 0);
  const sharedPeople = Math.max(1, Number(medicalDraft.sharedPeople) || 1);
  const userPortion = Math.max(0, Number(medicalDraft.userPortion) || 0);
  const eatAll = Boolean(medicalDraft.eatAll);
  return {
    totalWeight,
    sharedPeople,
    userPortion,
    eatAll,
    personalWeight: eatAll ? totalWeight : round((totalWeight / sharedPeople) * userPortion)
  };
}

function parseFiniteNumber(value) {
  if (value === "" || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function getMedicalDraftValidationErrors(template = null, ingredient = getSelectedMedicalIngredient()) {
  const errors = [];
  if (!ingredient) {
    errors.push("请先选择食材。");
    return errors;
  }
  const weight = parseFiniteNumber(medicalDraft.ingredientWeight);
  if (weight === null || weight < 1 || weight > 2000) errors.push("请输入 1–2000g 之间的食材重量。");
  if (!medicalDraft.eatAll) {
    const sharedPeople = parseFiniteNumber(medicalDraft.sharedPeople);
    const userPortion = parseFiniteNumber(medicalDraft.userPortion);
    if (sharedPeople === null || sharedPeople < 1 || sharedPeople > 20) {
      errors.push("共同食用人数需为 1–20。");
    }
    if (userPortion === null || userPortion < 1) {
      errors.push("自己吃几份需为 1–共同食用人数。");
    } else if (sharedPeople !== null && sharedPeople >= 1 && sharedPeople <= 20 && userPortion > sharedPeople) {
      errors.push("自己吃的份数不能超过共同食用人数。");
    }
  }
  const resolvedOilOption = resolveOilOption(template, ingredient);
  if (resolvedOilOption === "custom") {
    const oil = parseFiniteNumber(medicalDraft.customOilGrams);
    if (oil === null || oil < 0 || oil > 100) errors.push("用油量需为 0–100g。");
  }
  return [...new Set(errors)];
}

function renderMedicalValidation(errors) {
  return `<div id="medicalValidationMessage" class="${errors.length ? "warning" : "hidden"}">${errors.map(escapeHTML).join("<br>")}</div>`;
}

function bindMedicalWeightInputs() {
  const variant = document.getElementById("medicalIngredientVariant");
  const totalWeight = document.getElementById("medicalTotalWeight");
  const sharedPeople = document.getElementById("medicalSharedPeople");
  const userPortion = document.getElementById("medicalUserPortion");
  const eatAll = document.getElementById("medicalEatAll");
  if (variant) variant.addEventListener("change", (event) => {
    selectedMedicalVariantId = event.target.value;
    updateWeightCalculationResultOnly();
  });
  if (totalWeight) totalWeight.addEventListener("input", (event) => {
    medicalDraft.ingredientWeight = event.target.value;
    updateWeightCalculationResultOnly();
  });
  if (sharedPeople) sharedPeople.addEventListener("input", (event) => {
    medicalDraft.sharedPeople = event.target.value;
    updateWeightCalculationResultOnly();
  });
  if (userPortion) userPortion.addEventListener("input", (event) => {
    medicalDraft.userPortion = event.target.value;
    updateWeightCalculationResultOnly();
  });
  if (eatAll) eatAll.addEventListener("change", (event) => {
    medicalDraft.eatAll = event.target.checked;
    if (!medicalDraft.eatAll) {
      medicalDraft.sharedPeople = "2";
      medicalDraft.userPortion = "1";
    }
    updateMedicalShareInputsState();
    updateWeightCalculationResultOnly();
  });
}

function updateMedicalShareInputsState() {
  const sharedPeople = document.getElementById("medicalSharedPeople");
  const userPortion = document.getElementById("medicalUserPortion");
  const hint = document.getElementById("medicalPortionHint");
  if (sharedPeople) {
    sharedPeople.disabled = Boolean(medicalDraft.eatAll);
    sharedPeople.placeholder = medicalDraft.eatAll ? "不适用" : "";
    sharedPeople.value = medicalDraft.eatAll ? "" : medicalDraft.sharedPeople;
  }
  if (userPortion) {
    userPortion.disabled = Boolean(medicalDraft.eatAll);
    userPortion.placeholder = medicalDraft.eatAll ? "不适用" : "";
    userPortion.value = medicalDraft.eatAll ? "" : medicalDraft.userPortion;
  }
  if (hint) hint.textContent = medicalDraft.eatAll ? "已按一个人吃完整份计算。" : "按平均分食估算。";
}

function updateWeightCalculationResultOnly() {
  const target = document.getElementById("medicalWeightResult");
  const ingredient = getSelectedMedicalIngredient();
  if (!target || !ingredient) return;
  const portion = calculatePersonalIngredientPortion();
  const errors = getMedicalDraftValidationErrors(null, ingredient).filter((message) => !message.includes("用油量"));
  if (errors.length) {
    target.innerHTML = `<p class="warning">${errors.map(escapeHTML).join("<br>")}</p>`;
    renderMealTemplateDetail();
    return;
  }
  const nutrition = calculateMedicalIngredientNutrition(ingredient, portion.personalWeight);
  target.innerHTML = `
    <div class="nutrition-preview compact-nutrition-preview">
      <p class="entry-meta"><strong>个人估算摄入：</strong>${formatMedicalWeight(portion.personalWeight)}</p>
      ${renderNutritionRows(nutrition)}
    </div>
  `;
  renderMealTemplateDetail();
}

function renderTemplateWeightLines(template, selectedIngredient) {
  return renderTemplateWeightLinesFromIngredients(buildMealEntryIngredients(template, selectedIngredient, medicalDraft));
}

function renderTemplateWeightLinesFromIngredients(entryIngredients) {
  const totalLine = entryIngredients.map((item) => `${item.name} ${formatMedicalWeight(item.totalWeight)}`).join(" + ");
  const personalLine = entryIngredients.map((item) => `${item.name} ${formatMedicalWeight(item.personalWeight)}`).join(" + ");
  return `
    <div class="add-composition-box">
      <p><strong>将加入：</strong>${escapeHTML(totalLine)}</p>
      ${medicalDraft.eatAll ? "" : `<p><strong>个人估算：</strong>${escapeHTML(personalLine)}</p>`}
    </div>
  `;
}

function calculateMedicalIngredientNutrition(ingredient, personalWeight) {
  const factor = Number(personalWeight || 0) / 100;
  const nutrition = {};
  Object.entries(getEffectiveMedicalPer100g(ingredient)).forEach(([key, value]) => {
    nutrition[key] = value === null ? null : round(value * factor);
  });
  return nutrition;
}

function getEffectiveMedicalPer100g(ingredient) {
  const variant = getSelectedMedicalVariant(ingredient);
  return variant ? { ...ingredient.per100g, ...variant.per100g } : ingredient.per100g;
}

function getSelectedMedicalVariant(ingredient) {
  const variants = medicalIngredientVariants[ingredient?.name] || [];
  if (!variants.length) return null;
  return variants.find((item) => item.id === selectedMedicalVariantId) || variants[0];
}

function buildMealEntryIngredients(template, selectedIngredient, draft) {
  const portion = calculatePersonalIngredientPortion();
  const sharedPeople = Math.max(1, Number(draft.sharedPeople) || 1);
  const userPortion = Math.max(0, Number(draft.userPortion) || 0);
  const orderedIngredients = [...template.ingredients].sort((a, b) => {
    if (a.name === selectedIngredient.name) return -1;
    if (b.name === selectedIngredient.name) return 1;
    return 0;
  });
  return orderedIngredients.map((item) => {
    const totalWeight = item.name === selectedIngredient.name
      ? Math.max(0, Number(draft.ingredientWeight) || 0)
      : Number(item.defaultWeight) || 0;
    return {
      name: item.name,
      totalWeight,
      personalWeight: draft.eatAll ? totalWeight : round((totalWeight / sharedPeople) * userPortion),
      unit: item.unit || "g",
      role: item.role || getMealIngredientRole(item.name)
    };
  });
}

function calculateMealTemplateNutrition(entryIngredients) {
  const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, sodium: null, potassium: null, phosphorus: null };
  const validCounts = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  entryIngredients.forEach((entryIngredient) => {
    const profile = ingredientNutritionProfiles.find((item) => item.name === entryIngredient.name);
    if (!profile) return;
    const nutrition = calculateMedicalIngredientNutrition(profile, entryIngredient.personalWeight);
    ["calories", "protein", "carbs", "fat"].forEach((key) => {
      if (nutrition[key] !== null && nutrition[key] !== undefined) {
        totals[key] += Number(nutrition[key]) || 0;
        validCounts[key] += 1;
      }
    });
  });
  ["calories", "protein", "carbs", "fat"].forEach((key) => {
    totals[key] = validCounts[key] ? round(totals[key]) : null;
  });
  return totals;
}

function calculateEntryNutrition(entry) {
  const saved = entry?.estimatedNutrition || entry?.nutrition;
  if (saved && typeof saved === "object") return sanitizeNutrition(saved);
  const totals = calculateMealTemplateNutrition(Array.isArray(entry?.ingredients) ? entry.ingredients : []);
  return sanitizeNutrition(applyCookingOilToNutrition(totals, Number(entry?.oilGrams) || 0));
}

function calculatePreviewNutrition(entry) {
  return calculateEntryNutrition(entry);
}

function sanitizeNutrition(nutrition) {
  const next = { calories: null, protein: null, carbs: null, fat: null, sodium: null, potassium: null, phosphorus: null };
  Object.keys(next).forEach((key) => {
    const value = nutrition?.[key];
    if (value === null || value === undefined || value === "") return;
    const numeric = Number(value);
    next[key] = Number.isFinite(numeric) ? round(numeric) : null;
  });
  return next;
}

function buildSingleIngredientEntry(selectedIngredient, draft) {
  const portion = calculatePersonalIngredientPortion();
  const baseNutrition = calculateMedicalIngredientNutrition(selectedIngredient, portion.personalWeight);
  const personalOilGrams = calculatePersonalOilGrams(null, selectedIngredient);
  const nutrition = sanitizeNutrition(applyCookingOilToNutrition(baseNutrition, personalOilGrams));
  const conclusion = buildMealConclusion(nutrition, selectedIngredient);
  const entry = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    type: "medical_ingredient",
    sourceType: "medical_ingredient",
    category: "医嘱限制饮食",
    name: selectedIngredient.name,
    portion: `${selectedIngredient.name}个人估算 ${portion.personalWeight}g`,
    mainIngredient: selectedIngredient.name,
    mainIngredientWeight: portion.totalWeight,
    personalEstimatedWeight: portion.personalWeight,
    ingredients: [{
      name: selectedIngredient.name,
      totalWeight: portion.totalWeight,
      personalWeight: portion.personalWeight,
      unit: "g",
      role: selectedIngredient.role
    }],
    oilGrams: personalOilGrams,
    totalOilGrams: getTotalOilGrams(null, selectedIngredient),
    sharedPeople: portion.sharedPeople,
    userPortion: portion.userPortion,
    pairedIngredients: [],
    cookingMethod: cookingOilOptions[resolveOilOption(null, selectedIngredient)]?.label || "单食材估算",
    estimatedNutrition: nutrition,
    calories: nutrition.calories || 0,
    protein: nutrition.protein || 0,
    fat: nutrition.fat || 0,
    carbs: nutrition.carbs || 0,
    sodium: nutrition.sodium,
    potassium: nutrition.potassium,
    phosphorus: nutrition.phosphorus,
    riskMessages: [],
    mealConclusion: conclusion,
    dataConfidence: selectedIngredient.dataConfidence,
    confidence: selectedIngredient.dataConfidence === "high" ? "high" : "medium"
  };
  entry.riskMessages = getMealRiskMessages(entry);
  entry.riskTags = getEntryRiskTags(entry);
  return entry;
}

function buildMealEntryFromTemplate(template, selectedIngredient, draft) {
  const portion = calculatePersonalIngredientPortion();
  const entryIngredients = buildMealEntryIngredients(template, selectedIngredient, draft);
  const baseNutrition = calculateMealTemplateNutrition(entryIngredients);
  const personalOilGrams = calculatePersonalOilGrams(template, selectedIngredient);
  const nutrition = sanitizeNutrition(applyCookingOilToNutrition(baseNutrition, personalOilGrams));
  const conclusion = buildMealConclusion(nutrition, selectedIngredient, template);
  const entry = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    type: "medical_meal_suggestion",
    sourceType: "medical_meal_suggestion",
    category: "医嘱限制饮食",
    name: template.name,
    portion: `个人估算：${formatEntryIngredients(entryIngredients)}`,
    mainIngredient: selectedIngredient.name,
    mainIngredientWeight: portion.totalWeight,
    personalEstimatedWeight: portion.personalWeight,
    ingredients: entryIngredients,
    oilGrams: personalOilGrams,
    totalOilGrams: getTotalOilGrams(template, selectedIngredient),
    sharedPeople: portion.sharedPeople,
    userPortion: portion.userPortion,
    pairedIngredients: template.ingredients.filter((item) => item.name !== selectedIngredient.name),
    cookingMethod: cookingMethodLabels[selectedCookingMethod] || template.defaultCookingMethod,
    estimatedNutrition: nutrition,
    calories: nutrition.calories || 0,
    protein: nutrition.protein || 0,
    fat: nutrition.fat || 0,
    carbs: nutrition.carbs || 0,
    sodium: nutrition.sodium,
    potassium: nutrition.potassium,
    phosphorus: nutrition.phosphorus,
    riskMessages: [],
    mealConclusion: conclusion,
    riskTags: template.riskFocus,
    dataConfidence: selectedIngredient.dataConfidence,
    confidence: selectedIngredient.dataConfidence === "high" ? "high" : "medium"
  };
  entry.riskMessages = getMealRiskMessages(entry);
  entry.riskTags = getEntryRiskTags(entry);
  return entry;
}

function buildMealConclusion(nutrition, selectedIngredient, template = null) {
  const afterProgress = calculateProgressAfterNutrition(nutrition);
  const protein = afterProgress.protein;
  const carbs = afterProgress.carbs;
  const fat = afterProgress.fat;
  if (protein?.limit && protein.percent >= 90) return "本餐已接近蛋白质上限，下一餐建议减少肉蛋豆制品。";
  if (protein?.limit && protein.percent >= 70) return "本餐蛋白质占比较高，下一餐可考虑减少肉蛋豆制品叠加。";
  if (carbs?.limit && carbs.percent >= 80) return "本餐以主食或碳水为主，下一餐注意减少米饭、面条叠加。";
  if (fat?.limit && fat.percent >= 80) return "本餐脂肪占比较高，下一餐建议少油并避开偏肥肉类。";
  if (isStapleIngredient(selectedIngredient)) return "本餐以主食为主，若限制碳水，下一餐注意主食份量。";
  if (template?.riskFocus?.includes("protein")) return "本餐包含主蛋白食材，下一餐建议避免肉蛋豆制品重复叠加。";
  return "本餐较清淡，主要注意份量和调味。";
}

function calculateProgressAfterNutrition(nutrition) {
  const current = calculateMedicalDietProgress(getCurrentDate());
  const result = {};
  mainMedicalNutrients.forEach((key) => {
    const item = current[key];
    if (!item) return;
    const added = Number(nutrition[key]) || 0;
    const nextCurrent = (item.current === null ? 0 : Number(item.current) || 0) + added;
    result[key] = {
      ...item,
      current: round(nextCurrent),
      percent: item.limit ? round((nextCurrent / item.limit) * 100) : null
    };
  });
  return result;
}

function formatEntryIngredients(entryIngredients) {
  return entryIngredients.map((item) => `${item.name} ${formatMedicalWeight(item.personalWeight)}`).join(" + ");
}

function formatEntryTotalIngredients(entryIngredients) {
  return entryIngredients.map((item) => `${item.name} ${formatMedicalWeight(item.totalWeight ?? item.personalWeight)}`).join(" + ");
}

function renderNutritionRows(nutrition) {
  const keys = ["calories", "protein", "carbs", "fat"];
  return `<div class="nutrition-grid">${keys.map((key) => {
    const config = medicalNutrientConfig[key];
    const value = nutrition[key];
    return `<div class="nutrition-cell"><span>${config.label}</span><strong>${value === null ? "暂无可靠数据" : `${value}${config.unit}`}</strong>${value === null ? `<p>不计入精确进度</p>` : ""}</div>`;
  }).join("")}</div>`;
}

function renderRestrictionImpact(nutrition) {
  const progress = calculateMedicalDietProgress(getCurrentDate());
  const rows = Object.entries(progress).filter(([key]) => nutrition[key] !== null && nutrition[key] !== undefined);
  if (!rows.length) return `<p class="hint">当前选择对已录入限制项暂无可计算影响；缺失数据会显示为暂无可靠数据。</p>`;
  return `
    <div class="impact-box">
      <h3>对医嘱限制进度的影响</h3>
      ${rows.map(([key, item]) => {
        const before = item.current;
        const beforeValue = before === null ? 0 : before;
        const after = round(beforeValue + Number(nutrition[key] || 0));
        const percent = item.limit ? round((after / item.limit) * 100) : null;
        return `<p class="hint">${medicalNutrientConfig[key].label}：${before === null ? "暂无可靠数据" : `${before}${item.unit}`} → ${after}${item.unit}${percent !== null ? `。状态：${getProgressMessage(percent)}` : "。未录入医嘱上限，仅显示风险提醒。"}</p>`;
      }).join("")}
    </div>
  `;
}

function renderMealSuggestions() {
  return renderMealSuggestionCards();
}

function getMealTemplatesByIngredient(mainIngredient) {
  if (!isMedicalSelectableIngredientName(mainIngredient)) return [];
  const ingredient = ingredientNutritionProfiles.find((item) => item.name === mainIngredient);
  if (isStapleIngredient(ingredient)) return [];
  const matched = mealTemplates.filter((template) => {
    if (!isMedicalMealTemplateAllowed(template.name, template.mainIngredient, template.pairedIngredients)) return false;
    return (template.triggerIngredients || []).includes(mainIngredient)
      || template.mainIngredient === mainIngredient
      || template.pairedIngredients.includes(mainIngredient);
  });
  if (matched.length >= 6) return matched;
  return [...matched, ...buildSupplementMealTemplates(mainIngredient, matched)].slice(0, 8);
}

function getMealTemplateRiskTags(template) {
  const tags = new Set(template?.riskFocus || []);
  const profile = normalizeMedicalDietProfile(data.medicalDietProfile);
  const ingredients = (template?.ingredients || [])
    .map((item) => ingredientNutritionProfiles.find((ingredient) => ingredient.name === item.name))
    .filter(Boolean);
  if (ingredients.some((ingredient) => ingredient.role === "main_protein")) tags.add("protein");
  if (ingredients.some((ingredient) => ["medium", "high"].includes(ingredient.purineRisk))) tags.add("purine");
  if (profile.kidneyReminders?.potassium?.enabled && ingredients.some((ingredient) => ["medium", "high"].includes(ingredient.microRiskTags?.potassium))) tags.add("potassium");
  return sortMedicalRiskTags([...tags]);
}

function getEntryRiskTags(entry) {
  const tags = new Set(Array.isArray(entry?.riskTags) ? entry.riskTags : []);
  const profile = normalizeMedicalDietProfile(data.medicalDietProfile);
  const ingredients = (entry?.ingredients || [])
    .map((item) => ingredientNutritionProfiles.find((ingredient) => ingredient.name === item.name))
    .filter(Boolean);
  if (ingredients.some((ingredient) => ingredient.role === "main_protein")) tags.add("protein");
  if (ingredients.some(isStapleIngredient)) tags.add("carbs");
  if (ingredients.some((ingredient) => ["medium", "high"].includes(ingredient.purineRisk))) tags.add("purine");
  if (profile.kidneyReminders?.potassium?.enabled && ingredients.some((ingredient) => ["medium", "high"].includes(ingredient.microRiskTags?.potassium))) tags.add("potassium");
  if (profile.kidneyReminders?.phosphorus?.enabled && ingredients.some((ingredient) => ["medium", "high"].includes(ingredient.microRiskTags?.phosphorus))) tags.add("phosphorus");
  if (ingredients.some((ingredient) => ingredient.microRiskTags?.sodium === "high" || ingredient.categoryKey === "processed")) tags.add("sodium");
  if (entry?.type === "medical_meal_suggestion" || /红烧|重酱|腌制|卤|酱|蚝油|豆瓣酱/.test(entry?.cookingMethod || "")) tags.add("sodium");
  if (Number(entry?.oilGrams) >= 10 || ingredients.some((ingredient) => ingredient.riskTags?.fat === "high")) tags.add("fat");
  return sortMedicalRiskTags([...tags]);
}

function sortMedicalRiskTags(tags) {
  const order = ["protein", "sodium", "purine", "potassium", "phosphorus", "carbs", "fat"];
  const rank = (key) => order.includes(key) ? order.indexOf(key) : order.length;
  return [...new Set(tags)].sort((left, right) => rank(left) - rank(right));
}

function buildSupplementMealTemplates(ingredientName, existingTemplates) {
  if (!isMedicalSelectableIngredientName(ingredientName)) return [];
  const existingNames = new Set(existingTemplates.map((template) => template.name));
  const isVegetable = medicalSelectorIngredients.vegetable.includes(ingredientName);
  const pairings = isVegetable
    ? ["牛肉", "鸡肉", "猪瘦肉", "虾仁", "豆腐", "鸡蛋"]
    : ["芹菜", "青椒", "番茄", "白菜", "西兰花", "冬瓜"];
  return pairings
    .map((paired, index) => {
      const name = isVegetable ? `${ingredientName}${paired}` : `${paired}${ingredientName}`;
      if (existingNames.has(name)) return null;
      const main = isVegetable ? ingredientName : ingredientName;
      const pairedIngredients = isVegetable ? [paired] : [paired];
      if (!isMedicalMealTemplateAllowed(name, main, pairedIngredients)) return null;
      return mealTemplate(`supplement_${ingredientName}_${index}`, name, main, pairedIngredients, "少油清炒", getTemplateRiskFocus(main, pairedIngredients), ["鸡蛋", "豆腐", "香肠", "午餐肉", "腊肉", "重酱汁"]);
    })
    .filter(Boolean);
}

function getVisibleMealTemplates(templates) {
  const validIds = new Set(templates.map((template) => template.id));
  const visible = visibleMealTemplateIds
    .filter((id) => validIds.has(id))
    .map((id) => templates.find((template) => template.id === id))
    .filter(Boolean);
  if (visible.length) return visible;
  visibleMealTemplateIds = templates.slice(0, 4).map((template) => template.id);
  return visibleMealTemplateIds.map((id) => templates.find((template) => template.id === id)).filter(Boolean);
}

function pickMealSuggestionIds(templates) {
  if (templates.length <= 4) return templates.map((template) => template.id);
  return shuffleArray(templates).slice(0, 4).map((template) => template.id);
}

function shuffleArray(items) {
  const array = [...items];
  for (let index = array.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [array[index], array[swapIndex]] = [array[swapIndex], array[index]];
  }
  return array;
}

function shuffleMealSuggestions() {
  const ingredient = getSelectedMedicalIngredient();
  const templates = getMealTemplatesByIngredient(ingredient.name);
  const previous = visibleMealTemplateIds.join("|");
  let next = pickMealSuggestionIds(templates);
  if (templates.length > 4) {
    let attempts = 0;
    while (next.join("|") === previous && attempts < 5) {
      next = pickMealSuggestionIds(templates);
      attempts += 1;
    }
  }
  visibleMealTemplateIds = next;
  renderMealSuggestionCards();
  renderMealTemplateDetail();
}

function renderMealSuggestionCards() {
  const target = document.getElementById("medicalMealSuggestions");
  const ingredient = getSelectedMedicalIngredient();
  if (!target) return;
  if (!ingredient) {
    target.innerHTML = `
      <section class="medical-section">
        <div class="section-heading compact-heading">
          <div>
            <p class="eyebrow">搭配建议</p>
            <h3>可考虑菜品</h3>
          </div>
        </div>
        <p class="empty">选择食材后，将显示可考虑菜品。</p>
      </section>
    `;
    return;
  }
  if (isStapleIngredient(ingredient)) {
    selectedMealTemplateId = "";
    target.innerHTML = `
      <section class="medical-section">
        <div class="section-heading compact-heading">
          <div>
            <p class="eyebrow">主食估算</p>
            <h3>主食记录</h3>
          </div>
        </div>
        <p class="empty">主食只计算重量和碳水，不生成菜品。</p>
      </section>
    `;
    return;
  }
  const templates = getMealTemplatesByIngredient(ingredient.name);
  const visibleTemplates = getVisibleMealTemplates(templates);
  target.innerHTML = `
    <section class="medical-section">
      <div class="section-heading compact-heading">
        <div>
          <p class="eyebrow">搭配建议</p>
          <h3>可考虑菜品</h3>
        </div>
        ${templates.length > 4 ? `<button id="shuffleMealSuggestionsBtn" class="ghost-btn small-btn" type="button">换一批</button>` : ""}
      </div>
      <div class="meal-card-grid">
        ${visibleTemplates.length ? visibleTemplates.map((template) => `
          <button class="meal-suggestion-card ${template.id === selectedMealTemplateId ? "active" : ""}" data-meal-template="${template.id}" type="button">
            <strong>${template.name}</strong>
            <span>${formatMealCombo(template)}</span>
            <small>${template.cookingMethod}</small>
            <small>${getMealTemplateRiskTags(template).slice(0, 4).map(getMedicalRiskLabel).join("｜")}</small>
          </button>
        `).join("") : `<p class="empty">暂无推荐菜品，可先加入单食材。</p>`}
      </div>
    </section>
  `;
  document.getElementById("shuffleMealSuggestionsBtn")?.addEventListener("click", shuffleMealSuggestions);
  document.querySelectorAll("[data-meal-template]").forEach((button) => {
    button.addEventListener("click", () => selectMealTemplate(button.dataset.mealTemplate));
  });
}

function selectMealTemplate(templateId) {
  selectedMealTemplateId = templateId;
  renderMealSuggestionCards();
  renderMealTemplateDetail();
}

function cancelMealTemplateSelection() {
  selectedMealTemplateId = "";
  renderMealSuggestionCards();
  renderMealTemplateDetail();
}

function renderMealTemplateDetail() {
  const target = document.getElementById("medicalMealDetail");
  if (!target) return;
  const ingredient = getSelectedMedicalIngredient();
  if (!ingredient) {
    target.innerHTML = `
      <section class="medical-section">
        <div class="section-heading compact-heading">
          <div>
            <p class="eyebrow">记录方式</p>
            <h3>菜品方案 / 单食材记录</h3>
          </div>
        </div>
        <p class="entry-meta"><strong>当前记录方式：</strong>未选择食材</p>
        <p class="empty">请选择食材并输入重量后估算。</p>
      </section>
    `;
    return;
  }
  if (isStapleIngredient(ingredient)) {
    const errors = getMedicalDraftValidationErrors(null, ingredient);
    const entry = errors.length ? null : buildSingleIngredientEntry(ingredient, medicalDraft);
    const nutrition = entry ? calculatePreviewNutrition(entry) : sanitizeNutrition({});
    target.innerHTML = `
      <section class="medical-section">
        <div class="section-heading compact-heading">
          <div>
            <p class="eyebrow">主食记录</p>
            <h3>主食记录</h3>
          </div>
        </div>
        ${renderRecordModeStatus(null)}
        ${renderMedicalValidation(errors)}
        <p><strong>当前食材：</strong>${escapeHTML(ingredient.name)}</p>
        <p class="hint">主食只计算重量和碳水，不生成菜品。按当前重量估算。</p>
        ${renderCookingOilControl(null, ingredient)}
        ${entry ? renderExpectedNutritionImpact(nutrition, entry.oilGrams) : ""}
        <button id="addMedicalStapleBtn" type="button" ${errors.length ? "disabled" : ""}>加入主食记录</button>
      </section>
    `;
    bindCookingOilControls();
    document.getElementById("addMedicalStapleBtn").addEventListener("click", addMedicalMealToTodayLog);
    return;
  }
  const template = getMealTemplatesByIngredient(ingredient.name).find((item) => item.id === selectedMealTemplateId);
  if (!template) {
    const errors = getMedicalDraftValidationErrors(null, ingredient);
    const entry = errors.length ? null : buildSingleIngredientEntry(ingredient, medicalDraft);
    const nutrition = entry ? calculatePreviewNutrition(entry) : sanitizeNutrition({});
    target.innerHTML = `
      <section class="medical-section">
        <div class="section-heading compact-heading">
          <div>
            <p class="eyebrow">单食材记录</p>
            <h3>加入单食材</h3>
          </div>
        </div>
        ${renderRecordModeStatus(null)}
        ${renderMedicalValidation(errors)}
        <p class="hint">当前只记录这个食材。按当前重量估算。</p>
        ${renderCookingOilControl(null, ingredient)}
        ${entry ? renderExpectedNutritionImpact(nutrition, entry.oilGrams) : ""}
        <button id="addMedicalSingleIngredientBtn" type="button" ${errors.length ? "disabled" : ""}>加入单食材</button>
      </section>
    `;
    bindCookingOilControls();
    document.getElementById("addMedicalSingleIngredientBtn").addEventListener("click", addMedicalMealToTodayLog);
    return;
  }
  const entryIngredients = buildMealEntryIngredients(template, ingredient, medicalDraft);
  const errors = getMedicalDraftValidationErrors(template, ingredient);
  const entry = errors.length ? null : buildMealEntryFromTemplate(template, ingredient, medicalDraft);
  const nutrition = entry ? calculatePreviewNutrition(entry) : sanitizeNutrition({});
  const riskMessage = getCookingMethodRiskMessage(selectedCookingMethod);
  const linkedMealRisks = getLinkedMealRiskTips(template, ingredient, selectedCookingMethod);
  target.innerHTML = `
    <section class="medical-section">
      <div class="section-heading compact-heading">
        <div>
          <p class="eyebrow">菜品方案</p>
          <h3>已选择：${template.name}</h3>
        </div>
        <button id="cancelMealTemplateBtn" class="ghost-btn small-btn" type="button">取消菜品选择</button>
      </div>
      ${renderRecordModeStatus(template)}
      ${renderMedicalValidation(errors)}
      <p><strong>组合：</strong>${formatMealCombo(template)}</p>
      ${renderTemplateWeightLinesFromIngredients(entryIngredients)}
      <p><strong>做法：</strong>${template.cookingMethod}，少盐少酱。</p>
      <p><strong>风险：</strong>${getMealTemplateRiskTags(template).map(getMedicalRiskLabel).join(" / ")}</p>
      <div><strong>注意：</strong><ul class="compact-list">${getMealTemplateCompactNotes(template).concat(linkedMealRisks).map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul></div>
      <p><strong>不建议叠加：</strong>${template.avoidAdding.slice(0, 4).join(" / ")}</p>
      <div class="form-field">
        <label for="medicalCookingMethod">烹饪方式 / 调味程度</label>
        <select id="medicalCookingMethod">
          ${Object.entries(cookingMethodLabels).map(([key, label]) => `<option value="${key}" ${selectedCookingMethod === key ? "selected" : ""}>${label}</option>`).join("")}
        </select>
      </div>
      ${riskMessage ? `<p class="warning">${riskMessage}</p>` : ""}
      ${renderCookingOilControl(template, ingredient)}
      ${entry ? renderExpectedNutritionImpact(nutrition, entry.oilGrams) : ""}
      <button id="addMedicalMealBtn" type="button" ${errors.length ? "disabled" : ""}>加入这道菜</button>
    </section>
  `;
  document.getElementById("cancelMealTemplateBtn")?.addEventListener("click", cancelMealTemplateSelection);
  document.getElementById("medicalCookingMethod").addEventListener("change", (event) => {
    selectedCookingMethod = event.target.value;
    renderMealTemplateDetail();
  });
  bindCookingOilControls();
  document.getElementById("addMedicalMealBtn").addEventListener("click", addMedicalMealToTodayLog);
}

function getDefaultOilOptionForContext(template, ingredient) {
  if (isStapleIngredient(ingredient)) return "steam";
  const method = template?.defaultCookingMethod || selectedCookingMethod || template?.cookingMethod || "light_stir_fry";
  if (/steam|boil|清蒸|水煮|白灼/.test(method)) return "steam";
  if (/soup|炖|汤/.test(method)) return "soup";
  if (/braised|红烧|重酱|酱/.test(method)) return "braised";
  if (/fried|油炸|偏油/.test(method)) return "oily";
  if (/stir|炒/.test(method)) return "light_stir_fry";
  return "light_stir_fry";
}

function resolveOilOption(template, ingredient) {
  return medicalDraft.oilOption === "auto" ? getDefaultOilOptionForContext(template, ingredient) : medicalDraft.oilOption;
}

function getTotalOilGrams(template = null, ingredient = null) {
  if (isStapleIngredient(ingredient)) return 0;
  const option = resolveOilOption(template, ingredient);
  if (option === "custom") return Math.max(0, Number(medicalDraft.customOilGrams) || 0);
  return Number(cookingOilOptions[option]?.grams) || 0;
}

function calculatePersonalOilGrams(template = null, ingredient = null) {
  const totalOil = getTotalOilGrams(template, ingredient);
  if (medicalDraft.eatAll) return round(totalOil);
  const sharedPeople = Math.max(1, Number(medicalDraft.sharedPeople) || 1);
  const userPortion = Math.max(0, Number(medicalDraft.userPortion) || 0);
  return round((totalOil / sharedPeople) * userPortion);
}

function applyCookingOilToNutrition(nutrition, personalOilGrams) {
  const next = { ...nutrition };
  const oil = Math.max(0, Number(personalOilGrams) || 0);
  next.fat = next.fat === null || next.fat === undefined ? null : round(Number(next.fat) + oil);
  next.calories = next.calories === null || next.calories === undefined ? null : round(Number(next.calories) + oil * 9);
  return next;
}

function renderCookingOilControl(template = null, ingredient = null) {
  const resolved = resolveOilOption(template, ingredient);
  const totalOil = getTotalOilGrams(template, ingredient);
  const personalOil = calculatePersonalOilGrams(template, ingredient);
  if (isStapleIngredient(ingredient)) {
    return `<div class="oil-estimate-box"><strong>用油估算：</strong>主食默认 0g</div>`;
  }
  return `
    <div class="oil-estimate-box">
      <div class="oil-estimate-summary">
        <strong>用油估算：</strong>${escapeHTML(cookingOilOptions[resolved]?.label || "少油清炒")} ${round(totalOil)}g${medicalDraft.eatAll ? "" : `｜个人 ${round(personalOil)}g`}
      </div>
      <div class="oil-option-row">
        ${Object.entries(cookingOilOptions).filter(([key]) => key !== "auto").map(([key, option]) => `
          <button class="ghost-btn small-btn ${resolved === key ? "active" : ""}" data-oil-option="${key}" type="button">${option.label}${option.grams !== null ? ` ${option.grams}g` : ""}</button>
        `).join("")}
      </div>
      ${resolved === "custom" ? `<div class="form-field compact-oil-input"><label for="customOilGrams">用油 g</label><input id="customOilGrams" type="number" min="0" step="0.5" value="${escapeHTML(medicalDraft.customOilGrams)}"></div>` : ""}
    </div>
  `;
}

function bindCookingOilControls() {
  document.querySelectorAll("[data-oil-option]").forEach((button) => {
    button.addEventListener("click", () => {
      medicalDraft.oilOption = button.dataset.oilOption;
      renderSelectedIngredient();
      renderMealTemplateDetail();
    });
  });
  const customOil = document.getElementById("customOilGrams");
  if (customOil) {
    customOil.addEventListener("input", (event) => {
      medicalDraft.customOilGrams = event.target.value;
      refreshOilPreviewOnly();
    });
  }
}

function refreshOilPreviewOnly() {
  const ingredient = getSelectedMedicalIngredient();
  const template = selectedMealTemplateId ? getMealTemplatesByIngredient(ingredient.name).find((item) => item.id === selectedMealTemplateId) : null;
  if (!ingredient) return;
  const errors = getMedicalDraftValidationErrors(template, ingredient);
  const validation = document.getElementById("medicalValidationMessage");
  if (validation) {
    validation.className = errors.length ? "warning" : "hidden";
    validation.innerHTML = errors.map(escapeHTML).join("<br>");
  }
  ["addMedicalStapleBtn", "addMedicalSingleIngredientBtn", "addMedicalMealBtn"].forEach((id) => {
    const button = document.getElementById(id);
    if (button) button.disabled = Boolean(errors.length);
  });
  const resolved = resolveOilOption(template, ingredient);
  const totalOil = getTotalOilGrams(template, ingredient);
  const personalOil = calculatePersonalOilGrams(template, ingredient);
  const summary = document.querySelector(".oil-estimate-summary");
  if (summary) {
    summary.innerHTML = "<strong>用油估算：</strong>" + escapeHTML(cookingOilOptions[resolved]?.label || "少油清炒") + " " + round(totalOil) + "g" + (medicalDraft.eatAll ? "" : "｜个人 " + round(personalOil) + "g");
  }
  const entry = template
    ? buildMealEntryFromTemplate(template, ingredient, medicalDraft)
    : buildSingleIngredientEntry(ingredient, medicalDraft);
  const nextImpact = errors.length ? "" : renderExpectedNutritionImpact(calculatePreviewNutrition(entry), personalOil);
  const currentImpact = document.querySelector(".expected-impact-box");
  if (currentImpact && nextImpact) {
    currentImpact.outerHTML = nextImpact;
  } else if (currentImpact && !nextImpact) {
    currentImpact.innerHTML = "";
  }
}

function renderRecordModeStatus(template) {
  return `
    <div class="record-mode-status">
      <span>当前记录方式：${template ? "整道菜" : "单食材"}</span>
      ${template ? `<strong>已选择：${escapeHTML(template.name)}</strong>` : ""}
    </div>
  `;
}

function renderExpectedNutritionImpact(nutrition, oilGrams = 0) {
  const after = calculateProgressAfterNutrition(nutrition);
  const increaseRows = mainMedicalNutrients.map((key) => {
    const value = Number(nutrition[key]) || 0;
    if (value <= 0) return "";
    const config = medicalNutrientConfig[key];
    return `<p>${config.label} +${round(value)}${config.unit}</p>`;
  }).filter(Boolean);
  const calories = Number(nutrition.calories) || 0;
  if (calories > 0) {
    increaseRows.push(`<p>热量 +${round(calories)}kcal</p>`);
  }
  if (Number(oilGrams) > 0) {
    increaseRows.push(`<p>其中用油 +${round(oilGrams)}g</p>`);
  }
  const afterRows = mainMedicalNutrients.map((key) => {
    const restriction = data.medicalDietProfile?.restrictions?.[key];
    if (!restriction || restriction.status === "none") return "";
    const config = medicalNutrientConfig[key];
    const item = after[key];
    if (!item) return "";
    if (item.limit) return `<p>${config.label} ${round(item.current)}${config.unit} / ${item.limit}${config.unit}</p>`;
    if (restriction.status === "reminder") return `<p>${config.label}：仅提醒</p>`;
    return "";
  }).filter(Boolean);
  if (!increaseRows.length && !afterRows.length) return "";
  return `
    <div class="expected-impact-box">
      ${increaseRows.length ? `<strong>本次增加：</strong>${increaseRows.join("")}` : ""}
      ${afterRows.length ? `<strong>加入后预计：</strong>${afterRows.join("")}` : ""}
    </div>
  `;
}

function getLinkedMicroRiskTips(ingredient) {
  const tips = [];
  if (!ingredient) return tips;
  const profile = normalizeMedicalDietProfile(data.medicalDietProfile);
  if (profile.kidneyReminders?.potassium?.enabled && ["medium", "high"].includes(ingredient.microRiskTags?.potassium)) {
    tips.push("钾：当前医嘱关注，注意份量或处理方式。");
  }
  if (profile.kidneyReminders?.phosphorus?.enabled && (ingredient.role === "main_protein" || ["medium", "high"].includes(ingredient.microRiskTags?.phosphorus) || /牛肉|猪|鸡|鱼|虾|鸡蛋|豆腐|豆干|牛奶|奶/.test(ingredient.name))) {
    tips.push("磷：肉蛋豆制品需按医嘱关注。");
  }
  if (profile.kidneyReminders?.sodium?.enabled && (ingredient.categoryKey === "processed" || ingredient.microRiskTags?.sodium === "high")) {
    tips.push("钠：低盐提醒，优先减少加工食品和重口调味。");
  }
  if (profile.extraReminders?.calcium?.enabled && /奶|牛奶|酸奶|钙|补剂|钙片/.test(ingredient.name)) {
    tips.push("钙：如医嘱涉及血钙、补钙或钙磷异常，请按医生建议处理。");
  }
  if (profile.extraReminders?.fluid?.enabled && (/粥|汤|汤面|饮品|奶茶|咖啡|豆浆|牛奶/.test(ingredient.name) || resolveOilOption(null, ingredient) === "soup")) {
    tips.push("液体：如有控水医嘱，请把汤水和饮品计入当日液体摄入。");
  }
  if (profile.extraReminders?.sugar?.enabled && (isStapleIngredient(ingredient) || ingredient.riskTags?.carbs === "high" || /甜|糖|饮料|奶茶|面包|饼干|巧克力/.test(ingredient.name))) {
    tips.push("控糖：注意主食和含糖食物份量。");
  }
  if (["medium", "high"].includes(ingredient.purineRisk)) {
    tips.push(profile.extraReminders?.purine?.enabled
      ? "嘌呤：已启用尿酸/嘌呤提醒，请注意肉类、鱼虾和浓肉汤摄入频率。"
      : "嘌呤：如有高尿酸或痛风医嘱，请注意份量和频率。");
  }
  return tips;
}

function getLinkedMealRiskTips(template, ingredient, method) {
  const tips = getLinkedMicroRiskTips(ingredient).filter((item) => !item.startsWith("嘌呤："));
  const profile = normalizeMedicalDietProfile(data.medicalDietProfile);
  const methodSource = `${method || ""} ${template?.cookingMethod || ""} ${resolveOilOption(template, ingredient)}`;
  const dishSource = `${template?.name || ""} ${template?.mainIngredient || ""} ${(template?.pairedIngredients || []).join(" ")}`;
  if (profile.kidneyReminders?.sodium?.enabled && /braised|cured|红烧|重酱|腌制|卤|酱|蚝油|豆瓣酱/.test(methodSource)) {
    tips.push("钠：低盐提醒，建议减少酱油、蚝油、豆瓣酱等重钠调味。");
  }
  if (profile.extraReminders?.fluid?.enabled && /粥|汤|汤面|炖汤|饮品|soup/.test(dishSource + methodSource)) {
    tips.push("液体：如有控水医嘱，请把汤水和饮品计入当日液体摄入。");
  }
  if (profile.extraReminders?.sugar?.enabled && /米饭|面条|馒头|粥|红薯|土豆|玉米|燕麦|南瓜|山药|甜|糖|饮料|奶茶|面包|饼干|巧克力/.test(dishSource)) {
    tips.push("控糖：注意主食和含糖食物份量。");
  }
  const hasPurineRisk = (template?.ingredients || [])
    .map((item) => ingredientNutritionProfiles.find((profileItem) => profileItem.name === item.name))
    .some((profileItem) => ["medium", "high"].includes(profileItem?.purineRisk));
  if (hasPurineRisk) {
    tips.push(profile.extraReminders?.purine?.enabled
      ? "嘌呤：已启用尿酸/嘌呤提醒，请注意肉类、鱼虾和浓肉汤摄入频率。"
      : "嘌呤：肉类/鱼虾类食材需按高尿酸或痛风医嘱控制频率。");
  }
  if (profile.extraReminders?.calcium?.enabled && /奶|牛奶|酸奶|钙强化|补剂|钙片/.test(dishSource)) {
    tips.push("钙：如医嘱涉及血钙、补钙或钙磷异常，请按医生建议处理。");
  }
  return [...new Set(tips)];
}

function getMealRiskMessages(entry) {
  const profile = normalizeMedicalDietProfile(data.medicalDietProfile);
  const messages = [];
  const ingredients = Array.isArray(entry.ingredients) ? entry.ingredients : [];
  ingredients.forEach((entryIngredient) => {
    const ingredient = ingredientNutritionProfiles.find((item) => item.name === entryIngredient.name);
    if (!ingredient) return;
    if (ingredient.role === "main_protein") messages.push(`蛋白质：${ingredient.name}为主蛋白，注意份量。`);
    if (ingredient.riskTags?.fat === "high") messages.push(`脂肪：${ingredient.name}脂肪负担较高。`);
    if (isStapleIngredient(ingredient)) messages.push(`碳水：${ingredient.name}按主食计入。`);
    if (profile.kidneyReminders?.potassium?.enabled && ["medium", "high"].includes(ingredient.microRiskTags?.potassium)) {
      messages.push(`钾：当前医嘱关注，${ingredient.name}需注意份量或处理方式。`);
    }
    if (profile.kidneyReminders?.phosphorus?.enabled && (ingredient.role === "main_protein" || ["medium", "high"].includes(ingredient.microRiskTags?.phosphorus))) {
      messages.push(`磷：当前医嘱关注，${ingredient.name}需按份量估算。`);
    }
    if (profile.kidneyReminders?.sodium?.enabled && (ingredient.microRiskTags?.sodium === "high" || ingredient.categoryKey === "processed")) {
      messages.push(`钠：低盐提醒，${ingredient.name}不建议叠加重口调味。`);
    }
    if (profile.extraReminders?.calcium?.enabled && /奶|牛奶|酸奶|钙|补剂|钙片/.test(ingredient.name)) {
      messages.push("钙：如医嘱涉及血钙、补钙或钙磷异常，请按医生建议处理。");
    }
    if (profile.extraReminders?.fluid?.enabled && /粥|汤|汤面|饮品|奶茶|咖啡|豆浆|牛奶/.test(ingredient.name)) {
      messages.push("液体：如有控水医嘱，请把汤水和饮品计入当日液体摄入。");
    }
    if (profile.extraReminders?.sugar?.enabled && (isStapleIngredient(ingredient) || ingredient.riskTags?.carbs === "high")) {
      messages.push("控糖：注意主食和含糖食物份量。");
    }
    if (["medium", "high"].includes(ingredient.purineRisk)) {
      messages.push(profile.extraReminders?.purine?.enabled
        ? "嘌呤：已启用尿酸/嘌呤提醒，请注意肉类、鱼虾和浓肉汤摄入频率。"
        : "嘌呤：如有高尿酸或痛风医嘱，请注意份量和频率。");
    }
  });
  const methodSource = `${entry.cookingMethod || ""}`;
  if (profile.extraReminders?.fluid?.enabled && /粥|汤|汤面|炖汤|饮品/.test(`${entry.name || ""} ${methodSource}`)) {
    messages.push("液体：如有控水医嘱，请把汤水和饮品计入当日液体摄入。");
  }
  if (/红烧|重酱|腌制|卤|酱|蚝油|豆瓣酱/.test(methodSource)) {
    messages.push("钠：低盐提醒，少用酱油、蚝油、豆瓣酱。");
  }
  if (Number(entry.oilGrams) > 0) messages.push(`用油：已按 ${round(entry.oilGrams)}g 计入脂肪估算。`);
  if (Number(entry.oilGrams) >= 10) messages.push("脂肪：本餐用油较多，后续可选择清蒸或水煮。");
  if (!messages.length) messages.push(entry.ingredients?.length > 1 ? "整道菜记录。" : "单食材记录。");
  return [...new Set(messages)];
}

function formatMealCombo(template) {
  const names = template.ingredients?.map((item) => item.name) || [template.mainIngredient, ...(template.pairedIngredients || [])];
  return names.length
    ? names.join(" + ")
    : template.mainIngredient;
}

function getMealTemplateCompactNotes(template) {
  const notes = [];
  const proteinIngredient = template.ingredients?.find((item) => getMealIngredientRole(item.name) === "main_protein")?.name || template.mainIngredient;
  if (template.riskFocus.includes("protein") || getSelectedMedicalIngredient()?.role === "main_protein") notes.push(`${proteinIngredient}是主蛋白，控制份量`);
  if (template.riskFocus.includes("sodium")) notes.push("限钠：避免重酱。");
  if (template.riskFocus.includes("fat")) notes.push("限脂：少油。");
  return notes.slice(0, 3);
}

function getCookingMethodRiskMessage(method) {
  if (method === "braised") return "该做法可能增加钠摄入。如需限制钠，建议减少酱油、蚝油、豆瓣酱等重钠调味。";
  if (method === "fried") return "该做法可能增加脂肪摄入。如需限制脂肪，建议改为清蒸、水煮或少油清炒。";
  if (method === "cured") return "该做法通常钠风险较高。如需限制钠，建议避免或减少频率。";
  return "";
}

function addMedicalMealToTodayLog() {
  const ingredient = getSelectedMedicalIngredient();
  if (!ingredient) return;
  const template = getMealTemplatesByIngredient(ingredient.name).find((item) => item.id === selectedMealTemplateId);
  const errors = getMedicalDraftValidationErrors(template, ingredient);
  if (errors.length) {
    alert(errors[0]);
    renderMealTemplateDetail();
    return;
  }
  const entry = template
    ? buildMealEntryFromTemplate(template, ingredient, medicalDraft)
    : buildSingleIngredientEntry(ingredient, medicalDraft);
  addFoodEntry(getCurrentDate(), entry);
  updateMedicalDietProgressAfterAdd();
}

function updateMedicalDietProgressAfterAdd() {
  renderAll();
}

function riskLabel(nutrient, value) {
  const prefix = medicalNutrientConfig[nutrient]?.label || "";
  const labels = { high: "高", medium: nutrient === "carbs" ? "中等" : "中", low: "低", unknown: "未知" };
  return `${labels[value] || "未知"}${prefix}`;
}

function isRestrictionEnabled(key) {
  return ["strict", "moderate", "reminder"].includes(data.medicalDietProfile?.restrictions?.[key]?.status);
}

function renderTemplatePanel() {
  document.getElementById("entryTitle").textContent = "饮食记录入口";
  const eyebrow = document.querySelector("#entryTitle")?.previousElementSibling;
  if (eyebrow) eyebrow.textContent = "低摩擦记录";
  const tabs = Object.keys(sourceConfig).map((key) => {
    return `<button class="tab-btn ${activeSource === key ? "active" : ""}" data-source="${key}" type="button">${sourceConfig[key].label}</button>`;
  });
  document.getElementById("entryTabs").innerHTML = tabs.join("");
  document.querySelectorAll("[data-source]").forEach((button) => {
    button.addEventListener("click", () => {
      activeSource = button.dataset.source;
      selectedTemplateId = "";
      ingredientSearchQuery = "";
      customRestaurantAddOns = [];
      showCustomAddonForm = false;
      currentEstimate = null;
      renderTemplatePanel();
    });
  });

  if (activeSource === "manual") {
    document.getElementById("templatePanel").innerHTML = renderManualForm();
    document.getElementById("estimatePanel").innerHTML = "";
    document.getElementById("manualForm").addEventListener("submit", addManualEntry);
    return;
  }

  if (activeSource === "ingredient") {
    renderIngredientPanel();
    return;
  }

  const templates = sourceConfig[activeSource].templates;
  if (!selectedTemplateId) selectedTemplateId = templates[0].id;
  const selected = templates.find((template) => template.id === selectedTemplateId);

  document.getElementById("templatePanel").innerHTML = `
    <div class="template-grid">
      ${templates.map((template) => `
        <button class="template-btn ${template.id === selectedTemplateId ? "active" : ""}" data-template="${template.id}" type="button">
          <strong>${template.name}</strong>
          <small>${template.category}｜可信度：${confidenceLabels[template.confidence]}</small>
        </button>
      `).join("")}
    </div>
    ${renderControls(selected)}
  `;

  document.querySelectorAll("[data-template]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedTemplateId = button.dataset.template;
      customRestaurantAddOns = [];
      showCustomAddonForm = false;
      currentEstimate = null;
      renderTemplatePanel();
    });
  });
  document.querySelectorAll(".estimate-control").forEach((control) => {
    control.addEventListener("input", updateEstimate);
    control.addEventListener("change", updateEstimate);
  });
  bindRestaurantCustomAddonControls();
  updateEstimate();
}

function renderIngredientPanel() {
  const categories = Object.keys(ingredientCategories);

  document.getElementById("templatePanel").innerHTML = `
    <div class="ingredient-tools">
      <p class="module-note">基础食材适合自己做饭、称重记录，或大致知道食材重量的情况。如果是外卖、食堂或餐馆菜品，建议优先使用外食快餐或家常菜模板估算。</p>
      <div class="control-grid">
        <div class="form-field">
          <label for="ingredientCategory">食材分类</label>
          <select id="ingredientCategory">
            ${categories.map((category) => `<option value="${category}" ${category === activeIngredientCategory ? "selected" : ""}>${category}</option>`).join("")}
          </select>
        </div>
        <div class="form-field">
          <label for="ingredientSearch">智能搜索</label>
          <input id="ingredientSearch" type="search" value="${escapeHTML(ingredientSearchQuery)}" placeholder="可搜名称、分类、别名，如西红柿、红油、地瓜">
        </div>
      </div>
    </div>
    <div id="ingredientSearchResults"></div>
    <div id="ingredientControls"></div>
  `;

  document.getElementById("ingredientCategory").addEventListener("change", (event) => {
    activeIngredientCategory = event.target.value;
    selectedTemplateId = "";
    currentEstimate = null;
    renderIngredientPanel();
  });
  bindSearchInput(document.getElementById("ingredientSearch"), (value) => {
    ingredientSearchQuery = value;
    selectedTemplateId = "";
    currentEstimate = null;
    trackIngredientSearch();
    renderIngredientSearchResults();
  });
  renderIngredientSearchResults();
}

function renderIngredientSearchResults() {
  const visibleTemplates = getVisibleIngredientTemplates();
  const query = normalizeSearchQuery(ingredientSearchQuery);
  const mixedDishSearch = isMixedDishSearch(query);
  const addOnMatches = addOnSearchMatches(query);
  const selected = selectedTemplateId
    ? findTemplateById(selectedTemplateId)
    : null;

  const resultsTarget = document.getElementById("ingredientSearchResults");
  const controlsTarget = document.getElementById("ingredientControls");
  if (!resultsTarget || !controlsTarget) return;

  resultsTarget.innerHTML = `
    <div class="template-grid ingredient-grid">
      ${visibleTemplates.map((template) => `
        <button class="template-btn ${template.id === selectedTemplateId ? "active" : ""}" data-template="${template.id}" type="button">
          <strong>${template.name}</strong>
          <small>${template.category}</small>
          <small>${template.sourceType === "ingredient" ? nutritionReference(template, true) : `约 ${template.calories} kcal`}</small>
          <small>可信度：${confidenceLabels[template.confidence]}</small>
        </button>
      `).join("") || ""}
    </div>
    ${mixedDishSearch ? `<p class="warning">该类型食物差异较大，建议使用基础食材或手动输入进行拆分记录。</p>` : ""}
    ${addOnMatches.length && visibleTemplates.length === 0 ? `<p class="hint">找到相关加料：${addOnMatches.map((addon) => addon.name).join("、")}。加料可在外食快餐模板中多选。</p>` : ""}
    ${!visibleTemplates.length && !mixedDishSearch ? `<p class="empty">没有找到匹配食材或模板。可以换个名称、别名，或用手动输入记录。</p>` : ""}
  `;
  controlsTarget.innerHTML = selected
    ? renderControls(selected)
    : `<p class="empty">请选择一个基础食材或模板后，再填写食用量并确认估算。</p>`;

  document.querySelectorAll("[data-template]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedTemplateId = button.dataset.template;
      customRestaurantAddOns = [];
      showCustomAddonForm = false;
      currentEstimate = null;
      renderIngredientSearchResults();
    });
  });
  document.querySelectorAll(".estimate-control").forEach((control) => {
    control.addEventListener("input", updateEstimate);
    control.addEventListener("change", updateEstimate);
  });
  bindRestaurantCustomAddonControls();

  if (selected) {
    updateEstimate();
  } else {
    document.getElementById("estimatePanel").innerHTML = "";
  }
}

function bindSearchInput(inputEl, onSearch) {
  if (!inputEl) return;
  let isComposing = false;

  inputEl.addEventListener("compositionstart", () => {
    isComposing = true;
  });

  inputEl.addEventListener("compositionend", (event) => {
    isComposing = false;
    onSearch(event.target.value);
  });

  inputEl.addEventListener("input", (event) => {
    if (isComposing) return;
    onSearch(event.target.value);
  });

  inputEl.addEventListener("keydown", (event) => {
    if (event.isComposing) return;
  });
}

function trackIngredientSearch() {
  const query = normalizeSearchQuery(ingredientSearchQuery);
  if (!query) return;
  const nextResults = [...sourceConfig.ingredient.templates, ...sourceConfig.restaurant.templates].filter((template) => matchesSearch(template, query));
  trackEvent("search", {
    keyword: query,
    noResult: nextResults.length === 0
  });
}

function renderControls(template) {
  if (template.sourceType === "restaurant") {
    return `
      <div class="estimate-box">
        <div class="control-grid">
          ${selectControl("portion", "份量", restaurantPortionOptions(template))}
          ${selectControl("oil", "油量", [["less", "少油"], ["normal", "正常油"], ["heavy", "重油"]])}
          ${selectControl("sauce", "酱汁", [["less", "少酱"], ["normal", "正常"], ["more", "多酱 / 浓酱"]])}
        </div>
        <div class="addon-block">
          <label>可选加料</label>
          <div class="checkbox-grid">
            ${restaurantAddOns.map((addon) => `
              <label class="check-option">
                <input class="estimate-control" type="checkbox" name="restaurantAddOns" value="${addon.id}">
                <span>${addon.name}</span>
              </label>
            `).join("")}
          </div>
        </div>
        <div class="custom-addon-block">
          <button id="toggleCustomAddonBtn" class="ghost-btn" type="button">添加自定义加料</button>
          <div id="customAddonForm" class="${showCustomAddonForm ? "" : "hidden"}">
            <div class="control-grid">
              <div class="form-field"><label for="customAddonName">加料名称</label><input id="customAddonName" type="text"></div>
              <div class="form-field"><label for="customAddonCalories">热量 kcal</label><input id="customAddonCalories" type="number" min="0" step="1"></div>
              <div class="form-field"><label for="customAddonProtein">蛋白质 g</label><input id="customAddonProtein" type="number" min="0" step="0.1"></div>
              <div class="form-field"><label for="customAddonCarbs">碳水 g</label><input id="customAddonCarbs" type="number" min="0" step="0.1"></div>
              <div class="form-field"><label for="customAddonFat">脂肪 g</label><input id="customAddonFat" type="number" min="0" step="0.1"></div>
              <div class="form-field"><label>&nbsp;</label><button id="addCustomAddonBtn" type="button">加入自定义加料</button></div>
            </div>
          </div>
          ${customRestaurantAddOns.length ? `<p class="hint">已添加自定义加料：${customRestaurantAddOns.map((addon) => escapeHTML(addon.name)).join("、")}</p>` : ""}
        </div>
        <p class="hint">外食份量、油量和加料差异较大，结果仅为估算。若加料较多，请使用多选加料或自定义加料补充。</p>
      </div>
    `;
  }
  if (template.sourceType === "home") {
    return `
      <div class="estimate-box">
        <p class="hint">家常菜模板为估算值，适合快速记录。如果能称重记录食材和油量，建议使用基础食材拆分记录，可信度更高。</p>
        <div class="control-grid">
          ${selectControl("portion", "食用量", [["half", "半份"], ["standard", "一份"], ["one_half", "一份半"]])}
          ${selectControl("oil", "油量", [["less", "少油"], ["normal", "正常油"], ["heavy", "重油"]])}
          ${selectControl("sauce", "酱汁", [["less", "少"], ["normal", "正常"], ["more", "多"]])}
          ${selectControl("sugar", "糖", [["none", "无糖 / 不加糖"], ["less", "少糖"], ["sweet", "偏甜"]])}
        </div>
      </div>
    `;
  }
  if (template.sourceType === "ingredient") {
    return `
      <div class="estimate-box">
        <p class="hint">基础食材适合称重或知道大致重量时使用。肉类肥瘦差异会影响热量，结果仍为估算。</p>
        <div class="control-grid">
          <div class="form-field">
            <label for="ingredientAmount">实际食用量（${template.displayUnit}）</label>
            <input class="estimate-control" id="ingredientAmount" name="ingredientAmount" type="number" min="0" step="0.1" value="${getBaseAmount(template.baseUnit)}">
          </div>
        </div>
      </div>
    `;
  }
  return `
    <div class="estimate-box">
      <div class="control-grid">
        ${selectControl("size", "规格", [["small", "小杯 / 小份"], ["standard", "标准"], ["large", "大杯 / 大份"]])}
        ${selectControl("sugar", "糖", [["none", "无糖"], ["less", "少糖"], ["sweet", "偏甜"]])}
        ${selectControl("extra", "加料", [["none", "无"], ["pearl", "珍珠 / 椰果"], ["cream", "奶盖"]])}
      </div>
    </div>
  `;
}

function selectControl(name, label, options) {
  return `
    <div class="form-field">
      <label for="${name}">${label}</label>
      <select class="estimate-control" id="${name}" name="${name}">
        ${options.map(([value, text]) => `<option value="${value}">${text}</option>`).join("")}
      </select>
    </div>
  `;
}

function bindRestaurantCustomAddonControls() {
  const toggleButton = document.getElementById("toggleCustomAddonBtn");
  if (toggleButton) {
    toggleButton.addEventListener("click", () => {
      showCustomAddonForm = !showCustomAddonForm;
      renderTemplatePanel();
    });
  }
  const addButton = document.getElementById("addCustomAddonBtn");
  if (addButton) {
    addButton.addEventListener("click", () => {
      const name = document.getElementById("customAddonName").value.trim();
      const calories = Number(document.getElementById("customAddonCalories").value) || 0;
      if (!name || calories <= 0) return;
      customRestaurantAddOns.push({
        name,
        calories,
        protein: Number(document.getElementById("customAddonProtein").value) || 0,
        carbs: Number(document.getElementById("customAddonCarbs").value) || 0,
        fat: Number(document.getElementById("customAddonFat").value) || 0
      });
      showCustomAddonForm = false;
      renderTemplatePanel();
    });
  }
}

function restaurantPortionOptions(template) {
  const labels = restaurantPortionLabels(template.category);
  return [["small", labels.small], ["standard", labels.standard], ["large", labels.large]];
}

function restaurantPortionLabels(category) {
  if (category === "面条粉类") {
    return {
      small: "小份：约 180g 熟面 / 粉",
      standard: "标准：约 250g 熟面 / 粉",
      large: "大份：约 330g 熟面 / 粉"
    };
  }
  if (category === "米饭套餐") {
    return {
      small: "小份：约 150g 熟米饭",
      standard: "标准：约 220g 熟米饭",
      large: "大份：约 300g 熟米饭"
    };
  }
  if (category === "炒饭炒面") {
    return {
      small: "小份：约 250g 成品",
      standard: "标准：约 350g 成品",
      large: "大份：约 450g 成品"
    };
  }
  return {
    small: "小份：1 个 / 小份",
    standard: "标准：1 个标准份",
    large: "大份：加大份 / 2 个"
  };
}

function getCheckedRestaurantAddOns() {
  return Array.from(document.querySelectorAll('[name="restaurantAddOns"]:checked'))
    .map((input) => restaurantAddOns.find((addon) => addon.id === input.value))
    .filter(Boolean);
}

function getVisibleIngredientTemplates() {
  const query = normalizeSearchQuery(ingredientSearchQuery);
  if (!query) {
    return sourceConfig.ingredient.templates.filter((template) => template.category === activeIngredientCategory);
  }
  return [...sourceConfig.ingredient.templates, ...sourceConfig.restaurant.templates].filter((template) => {
    return matchesSearch(template, query);
  });
}

function normalizeSearchQuery(query) {
  return String(query || "").trim().toLowerCase();
}

function matchesSearch(item, query) {
  const q = normalizeSearchQuery(query);
  if (!q) return true;
  const aliases = item.aliases || [];
  const searchable = [item.name, item.category, ...aliases].join(" ").toLowerCase();
  return searchable.includes(q);
}

function isMixedDishSearch(query) {
  return ["麻辣烫", "冒菜"].some((keyword) => query.includes(keyword));
}

function addOnSearchMatches(query) {
  if (!query) return [];
  return restaurantAddOns.filter((addon) => {
    return [addon.name, ...(addon.aliases || [])].join(" ").toLowerCase().includes(query);
  });
}

function findTemplateById(id) {
  return Object.values(sourceConfig)
    .flatMap((config) => config.templates)
    .find((template) => template.id === id);
}

function calculateIngredientNutrition(ingredient, inputAmount) {
  const ratio = inputAmount / getBaseAmount(ingredient.baseUnit);
  return {
    calories: ingredient.caloriesPerBase * ratio,
    protein: ingredient.proteinPerBase * ratio,
    carbs: ingredient.carbsPerBase * ratio,
    fat: ingredient.fatPerBase * ratio
  };
}

function nutritionReference(ingredient, short = false) {
  const prefix = `每 ${ingredient.referenceUnit}`;
  if (short) return `${prefix}约 ${ingredient.caloriesPerBase} kcal`;
  return `营养参考：${prefix}约 ${ingredient.caloriesPerBase} kcal，蛋白质 ${ingredient.proteinPerBase}g，碳水 ${ingredient.carbsPerBase}g，脂肪 ${ingredient.fatPerBase}g`;
}

function calculateTemplateEstimate() {
  const template = findTemplateById(selectedTemplateId);
  let estimate = { ...template };
  const details = [];

  if (template.sourceType === "restaurant") {
    const portion = getControl("portion");
    const oil = getControl("oil");
    const sauce = getControl("sauce");
    const addOns = getCheckedRestaurantAddOns();
    const portionFactor = portion === "small" ? 0.75 : portion === "large" ? 1.25 : 1;
    estimate = multiplyNutrition(estimate, portionFactor);
    applyOil(estimate, oil);
    applySauce(estimate, sauce, "restaurant");
    [...addOns, ...customRestaurantAddOns].forEach((addon) => addNutrition(estimate, addon));
    estimate.selectedAddOns = addOns.map((addon) => addon.name);
    estimate.customAddOns = customRestaurantAddOns.map((addon) => addon.name);
    const addonText = addOns.length ? `加料：${addOns.map((addon) => addon.name).join("、")}` : "加料：无";
    const customText = customRestaurantAddOns.length ? `自定义加料：${customRestaurantAddOns.map((addon) => addon.name).join("、")}` : "";
    details.push(labelOf("portion"), labelOf("oil"), labelOf("sauce"), addonText);
    if (customText) details.push(customText);
  }

  if (template.sourceType === "home") {
    const portion = getControl("portion");
    const oil = getControl("oil");
    const sauce = getControl("sauce");
    const sugar = getControl("sugar");
    const portionFactor = portion === "half" ? 0.5 : portion === "one_half" ? 1.5 : 1;
    estimate = multiplyNutrition(estimate, portionFactor);
    applyOil(estimate, oil);
    applySauce(estimate, sauce, "home");
    applySugar(estimate, sugar);
    details.push(labelOf("portion"), labelOf("oil"), labelOf("sauce"), labelOf("sugar"));
  }

  if (template.sourceType === "ingredient") {
    const inputAmount = Math.max(0, Number(getControl("ingredientAmount")) || 0);
    const nutrition = calculateIngredientNutrition(template, inputAmount);
    estimate = { ...estimate, ...nutrition };
    estimate.amount = round(inputAmount);
    estimate.amountUnit = template.displayUnit;
    details.push(`实际食用量：${round(inputAmount)}${template.displayUnit}`);
  }

  if (template.sourceType === "snack") {
    const size = getControl("size");
    const sugar = getControl("sugar");
    const extra = getControl("extra");
    const sizeFactor = size === "small" ? 0.75 : size === "large" ? 1.3 : 1;
    estimate = multiplyNutrition(estimate, sizeFactor);
    applySnackSugar(estimate, sugar);
    applySnackExtra(estimate, extra);
    details.push(labelOf("size"), labelOf("sugar"), labelOf("extra"));
  }

  estimate.calories = Math.max(0, round(estimate.calories));
  estimate.protein = Math.max(0, round(estimate.protein));
  estimate.carbs = Math.max(0, round(estimate.carbs));
  estimate.fat = Math.max(0, round(estimate.fat));
  estimate.portion = details.join(" / ");
  return estimate;
}

function updateEstimate() {
  currentEstimate = calculateTemplateEstimate();
  const isIngredient = currentEstimate.sourceType === "ingredient";
  const detailLine = isIngredient
    ? nutritionReference(currentEstimate)
    : `${currentEstimate.category}｜${currentEstimate.portion}`;
  const hint = isIngredient
    ? "基础食材适合自己做饭、称重记录，或大致知道食用量的情况。系统会根据每 100g / 每份的营养参考自动估算。"
    : "模板结果为估算。外食受油量、份量、酱汁影响较大；自己做菜和基础食材的可信度相对更高。";
  document.getElementById("estimatePanel").innerHTML = `
    <div class="estimate-box">
      <h3>${currentEstimate.name}</h3>
      <p class="entry-meta">${detailLine}</p>
      ${isIngredient ? `<p class="entry-meta">${currentEstimate.portion}</p>` : ""}
      <div class="macro-line">
        <strong>约 ${currentEstimate.calories} kcal</strong>
        <span>蛋白质 ${currentEstimate.protein}g</span>
        <span>碳水 ${currentEstimate.carbs}g</span>
        <span>脂肪 ${currentEstimate.fat}g</span>
      </div>
      <p class="entry-meta">可信度：${confidenceLabels[currentEstimate.confidence]}</p>
      <p class="hint">${hint}</p>
      <button id="addTemplateBtn" type="button">加入当前日期记录</button>
    </div>
  `;
  document.getElementById("addTemplateBtn").addEventListener("click", addTemplateEntry);
}

function addTemplateEntry() {
  if (!currentEstimate) currentEstimate = calculateTemplateEstimate();
  const entry = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    sourceType: currentEstimate.sourceType,
    category: currentEstimate.category,
    name: currentEstimate.name,
    portion: currentEstimate.portion,
    calories: currentEstimate.calories,
    protein: currentEstimate.protein,
    carbs: currentEstimate.carbs,
    fat: currentEstimate.fat,
    confidence: currentEstimate.confidence,
    note: ""
  };
  if (currentEstimate.sourceType === "ingredient") {
    entry.amount = currentEstimate.amount;
    entry.amountUnit = currentEstimate.amountUnit;
  }
  if (currentEstimate.sourceType === "restaurant") {
    entry.selectedAddOns = currentEstimate.selectedAddOns || [];
    entry.customAddOns = currentEstimate.customAddOns || [];
  }
  addFoodEntry(getCurrentDate(), entry);
  trackEvent("food_entry_add", {
    name: entry.name,
    sourceType: entry.sourceType,
    viaSearch: Boolean(ingredientSearchQuery)
  });
}

function addManualEntry(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const entry = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    sourceType: "manual",
    category: "手动输入",
    name: form.get("name").trim() || "手动记录",
    portion: form.get("portion").trim() || "未填写份量",
    calories: Number(form.get("calories")) || 0,
    protein: Number(form.get("protein")) || 0,
    carbs: Number(form.get("carbs")) || 0,
    fat: Number(form.get("fat")) || 0,
    confidence: "high",
    note: form.get("note").trim()
  };
  addFoodEntry(getCurrentDate(), entry);
  trackEvent("food_entry_add", {
    name: entry.name,
    sourceType: entry.sourceType
  });
  event.currentTarget.reset();
}

function addFoodEntry(date, entry) {
  ensureDailyLog(date).foodEntries.push(entry);
  touchDailyLog(date);
  saveData();
  renderAll();
}

function deleteFoodEntry(date, entryId) {
  const log = ensureDailyLog(date);
  const beforeCount = log.foodEntries.length;
  log.foodEntries = log.foodEntries.filter((entry) => entry.id !== entryId);
  touchDailyLog(date);
  saveData();
  if (log.foodEntries.length < beforeCount) trackEvent("food_entry_delete");
  renderAll();
}

function deleteEntry(id) {
  deleteFoodEntry(getCurrentDate(), id);
}

function clearFoodEntries(date) {
  if (!confirm(`确定清空 ${date} 的所有饮食记录吗？`)) return;
  ensureDailyLog(date).foodEntries = [];
  touchDailyLog(date);
  saveData();
  trackEvent("clear_today");
  renderAll();
}

function clearExerciseEntries(date) {
  if (!confirm(`确定清空 ${date} 的所有运动记录吗？`)) return;
  ensureDailyLog(date).exerciseEntries = [];
  touchDailyLog(date);
  saveData();
  renderAll();
}

function deleteDailyLog(date) {
  if (!confirm(`确定删除 ${date} 的全部记录吗？该操作不会影响其他日期和用户资料。`)) return;
  delete data.dailyLogs[date];
  expandedDates = expandedDates.filter((item) => item !== date);
  const dates = getSortedDates();
  if (currentDate === date) currentDate = dates[0] || todayKey();
  if (!data.dailyLogs[currentDate]) createDailyLog(currentDate);
  data.settings.currentDate = currentDate;
  if (!expandedDates.length) expandedDates = [currentDate];
  saveData();
  renderAll();
}

function exportJSON() {
  const exportData = {
    ...data,
    analytics: getAnalytics()
  };
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `body-manager-data-${getCurrentDate()}.json`;
  link.click();
  URL.revokeObjectURL(url);
  trackEvent("export_json");
}

function importJSON(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!parsed || typeof parsed !== "object" || !parsed.profile) {
        throw new Error("missing-fields");
      }
      const { analytics, ...appData } = parsed;
      data = { ...createDefaultData(), ...appData };
      if (analytics && typeof analytics === "object") saveAnalytics(analytics);
      migrateOldDataIfNeeded();
      saveData();
      trackEvent("import_json");
      showImportMessage("导入成功，当前数据已覆盖。", false);
      showMain();
    } catch (error) {
      showImportMessage("导入失败：JSON 格式不正确，或缺少 profile。", true);
    }
  };
  reader.onerror = () => showImportMessage("导入失败：无法读取文件。", true);
  reader.readAsText(file);
}

function renderDailyStats() {
  const target = document.getElementById("dailyStats");
  if (!target) return;
  if (data.appMode === "medical_diet") {
    renderMedicalDietRecords();
    return;
  }
  document.getElementById("dailyStatsTitle").textContent = "每日统计";
  document.querySelector("#dailyStatsTitle").previousElementSibling.textContent = "按日期收纳";
  const dates = getSortedDates();
  if (!dates.length) {
    target.innerHTML = `<p class="empty">暂无每日记录。可以先添加新的一天，或直接从左侧开始记录。</p>`;
    return;
  }
  target.innerHTML = `
    <div class="daily-list">
      ${dates.map((date) => renderDailyLogCard(date)).join("")}
    </div>
  `;
  bindDailyStatsActions();
}

function renderMedicalDietRecords() {
  const target = document.getElementById("dailyStats");
  if (!target) return;
  document.getElementById("dailyStatsTitle").textContent = "今日已摄入";
  document.querySelector("#dailyStatsTitle").previousElementSibling.textContent = "医嘱饮食记录";
  const current = getCurrentDate();
  target.innerHTML = `
    <div class="medical-records current-medical-records">
      <div id="selectedMedicalIngredient"></div>
      <div id="medicalMealSuggestions"></div>
      <div id="medicalMealDetail"></div>
      ${renderNextMealAdvice(current)}
      ${renderConsumedDietList(current)}
    </div>
    ${renderMedicalArchiveDrawer()}
  `;
  renderSelectedIngredient();
  renderMealSuggestionCards();
  renderMealTemplateDetail();
  bindConsumedDietActions();
  bindMedicalArchiveActions();
}

function renderMedicalNutritionProgress(date) {
  const progress = calculateMedicalDietProgress(date);
  const entries = Object.entries(progress);
  return `
    <section class="medical-side-section medical-top-progress">
      <div class="section-heading compact-heading">
        <div>
          <p class="eyebrow">${date}</p>
          <h3>三大营养素今日进度</h3>
        </div>
      </div>
      ${entries.length ? `
        <div class="progress-list">
          ${entries.map(([key, item]) => renderMedicalNutritionProgressItem(key, item)).join("")}
        </div>
      ` : `<p class="empty compact-empty">设置蛋白质、碳水或脂肪上限后，将显示摄入进度。</p>`}
      <p class="medical-status-summary">${escapeHTML(buildMedicalTodayStatusSummary(progress))}</p>
    </section>
  `;
}

function renderMedicalNutritionProgressItem(key, item) {
  const label = medicalNutrientConfig[key].label;
  const currentText = item.current === null ? "暂无可靠数据" : `${round(item.current)}${item.unit}`;
  const limitText = item.limit ? `${item.limit}${item.unit}` : item.message;
  const percentText = item.percent !== null ? `${round(item.percent)}%` : "";
  const remaining = item.limit && item.current !== null ? round(item.limit - item.current) : null;
  return `
    <div class="progress-item nutrition-progress-item">
      <div class="progress-head">
        <strong>${label}</strong>
        <span>${item.limit ? `${currentText} / ${limitText}` : limitText}</span>
      </div>
      ${item.percent !== null ? `<div class="progress-track"><div class="progress-fill ${item.colorState}" style="width:${Math.min(item.percent, 100)}%"></div></div>` : ""}
      <p class="hint">${remaining !== null ? `剩余 ${Math.max(0, remaining)}${item.unit}｜` : ""}${percentText ? `${percentText}｜` : ""}${item.message}</p>
      ${remaining !== null ? `<p class="hint">${getRemainingNutrientAdvice(key, remaining, item.limit)}</p>` : ""}
    </div>
  `;
}

function buildMedicalTodayStatusSummary(progress) {
  const items = mainMedicalNutrients
    .map((key) => ({ key, item: progress[key] }))
    .filter(({ item }) => item?.limit && item.current !== null);
  if (!items.length) return "设置限制后，将显示今日状态提醒。";
  const protein = progress.protein;
  const carbs = progress.carbs;
  const fat = progress.fat;
  if (protein?.limit && protein.current !== null) {
    const remaining = round(protein.limit - protein.current);
    if (remaining <= Math.max(8, protein.limit * 0.2)) return `今日状态：蛋白质剩余 ${Math.max(0, remaining)}g，下一餐建议减少肉蛋豆制品。`;
  }
  if (carbs?.limit && carbs.current !== null) {
    const remaining = round(carbs.limit - carbs.current);
    if (remaining <= Math.max(30, carbs.limit * 0.2)) return "今日状态：碳水剩余较少，后续减少米饭、面条、土豆叠加。";
  }
  if (fat?.limit && fat.current !== null) {
    const remaining = round(fat.limit - fat.current);
    if (remaining <= Math.max(10, fat.limit * 0.2)) return "今日状态：脂肪剩余较少，后续少油并避开偏肥肉类。";
  }
  return "今日状态：目前仍在设定范围内，后续继续少油少盐。";
}

function getRemainingNutrientAdvice(key, remaining, limit) {
  const low = remaining <= Math.max(limit * 0.2, key === "protein" ? 8 : key === "fat" ? 10 : 30);
  if (key === "protein") return low ? "后续建议：减少肉蛋豆制品叠加。" : "后续建议：按份量安排主蛋白。";
  if (key === "fat") return low ? "后续建议：少油，避开偏肥肉类。" : "后续建议：继续控制用油。";
  if (key === "carbs") return low ? "后续建议：减少米饭、面条等主食叠加。" : "后续建议：主食继续按重量估算。";
  return "";
}

function renderKidneyDietReminders() {
  const labels = getEnabledMedicalReminderLabels();
  const context = data.medicalDietProfile?.context?.detectedContext;
  return `
    <section class="medical-side-section kidney-reminder-panel">
      <div class="section-heading compact-heading">
        <div>
          <p class="eyebrow">医嘱提醒</p>
          <h3>饮食限制提醒</h3>
        </div>
      </div>
      ${context ? `<p class="hint">根据你粘贴的医嘱文本，识别到：${escapeHTML(context)}</p>` : ""}
      ${labels.length ? `<p class="kidney-reminder-line">${labels.map(escapeHTML).join("｜")}</p>` : `<p class="empty compact-empty">尚未启用饮食提醒。<br>粘贴医嘱后，系统会辅助识别低盐、钾、磷、控糖、限水等提醒项。</p>`}
    </section>
  `;
}

function getEnabledMedicalReminderLabels() {
  const profile = normalizeMedicalDietProfile(data.medicalDietProfile);
  const labels = [];
  Object.entries(kidneyReminderConfig).forEach(([key, config]) => {
    const reminder = profile.kidneyReminders?.[key];
    if (reminder?.enabled) labels.push(config.shortLabel);
  });
  Object.entries(extraReminderConfig).forEach(([key, config]) => {
    const reminder = profile.extraReminders?.[key];
    if (reminder?.enabled) labels.push(config.shortLabel);
  });
  return labels;
}

function getKidneyReminderStatus(key) {
  const profile = normalizeMedicalDietProfile(data.medicalDietProfile);
  const kidneyReminder = profile.kidneyReminders?.[key];
  if (kidneyReminder?.enabled) {
    if (key === "sodium") return "低盐提醒";
    return "关注";
  }
  const note = profile.microNutrientNotes?.[key] || profile.restrictions?.[key]?.note || "";
  const restriction = profile.restrictions?.[key];
  if (key === "sodium" && /低盐|限盐|限钠|钠|盐/.test(note)) return "低盐提醒";
  if (key === "potassium" && /高钾|限钾|低钾|避免高钾|钾/.test(note)) return "关注";
  if (key === "phosphorus" && /高磷|限磷|低磷|避免高磷|磷/.test(note)) return "关注";
  if (restriction && ["strict", "moderate", "reminder"].includes(restriction.status)) return restrictionStatusLabels[restriction.status] || "关注";
  return "未设置";
}

function isExtraReminderEnabled(key) {
  return Boolean(normalizeMedicalDietProfile(data.medicalDietProfile).extraReminders?.[key]?.enabled);
}

function renderMedicalArchiveDrawer() {
  if (!medicalArchiveState.isOpen) return "";
  return `
    <div class="medical-archive-backdrop" data-close-medical-archive></div>
    <aside class="medical-archive-drawer" id="medicalArchiveDrawer" aria-label="近段时间饮食记录">
      <div class="archive-drawer-header">
        <div>
          <p class="eyebrow">饮食资料归档</p>
          <h3>${medicalArchiveState.view === "detail" && medicalArchiveState.selectedDate ? `${medicalArchiveState.selectedDate} 饮食详情` : "近段时间饮食记录"}</h3>
        </div>
        <button class="ghost-btn small-btn" data-close-medical-archive type="button">关闭 X</button>
      </div>
      ${medicalArchiveState.view === "detail" && medicalArchiveState.selectedDate ? renderMedicalArchiveDetail(medicalArchiveState.selectedDate) : renderMedicalArchiveList()}
      <button class="archive-main-btn" data-return-main-medical type="button">回到主使用界面</button>
    </aside>
  `;
}

function renderMedicalArchiveList() {
  const summaries = getDateRangeLogs(medicalArchiveState.rangeDays);
  const recordedSummaries = summaries.filter((item) => item.hasEntries);
  const emptyCount = summaries.length - recordedSummaries.length;
  return `
    <div class="archive-range-tabs">
      ${[7, 14, 30].map((days) => `<button class="ghost-btn small-btn ${medicalArchiveState.rangeDays === days ? "active" : ""}" data-archive-range="${days}" type="button">近${days}天</button>`).join("")}
    </div>
    <div class="archive-date-list">
      ${recordedSummaries.length ? recordedSummaries.map((item) => `
        <button class="archive-date-card" data-archive-date="${item.date}" type="button">
          <strong>日期：${item.date}</strong>
          <span>饮食摄入：${escapeHTML(item.foodNamesText)}</span>
          <span>营养素：蛋白质 ${round(item.summary.protein)}g｜碳水 ${round(item.summary.carbs)}g｜脂肪 ${round(item.summary.fat)}g</span>
          <em class="archive-status ${item.statusClass}">${item.statusLabel}</em>
        </button>
      `).join("") : `<p class="empty">近 ${medicalArchiveState.rangeDays} 天暂无饮食记录。</p>`}
      ${recordedSummaries.length && emptyCount ? `<p class="hint">其余日期暂无记录。</p>` : ""}
    </div>
  `;
}

function renderMedicalArchiveDetail(date) {
  const summary = getDailyNutritionSummary(date);
  const entries = getMedicalDietEntries(date);
  return `
    <div class="archive-detail-view">
      <button class="ghost-btn small-btn" data-archive-back-list type="button">返回记录列表</button>
      <section class="archive-detail-section">
        <h4>当日营养素汇总</h4>
        ${mainMedicalNutrients.map((key) => renderArchiveNutrientLine(key, summary[key])).join("")}
      </section>
      <section class="archive-detail-section">
        <h4>当日饮食记录列表</h4>
        ${entries.length ? entries.map((entry) => `
          <article class="archive-entry-card">
            <strong>${escapeHTML(entry.name || "未命名记录")}</strong>
            <p>${escapeHTML(renderConsumedIngredientLine(entry))}</p>
            ${renderMedicalEntryNutritionCompact(entry)}
          </article>
        `).join("") : `<p class="empty">暂无饮食记录。</p>`}
      </section>
      <section class="archive-detail-section">
        <h4>当日提醒</h4>
        <p class="hint">${escapeHTML(buildTodayMedicalAdvice(date))}</p>
      </section>
    </div>
  `;
}

function renderArchiveNutrientLine(key, value) {
  const config = medicalNutrientConfig[key];
  const restriction = data.medicalDietProfile?.restrictions?.[key];
  const limit = Number(restriction?.limitValue);
  if (Number.isFinite(limit) && limit > 0) return `<p>${config.label} ${round(value)}${config.unit} / ${limit}${config.unit}</p>`;
  return `<p>${config.label} ${round(value)}${config.unit}</p>`;
}

function bindMedicalArchiveActions() {
  document.getElementById("openMedicalArchiveBtn")?.addEventListener("click", openMedicalArchiveDrawer);
  document.querySelectorAll("[data-close-medical-archive]").forEach((item) => item.addEventListener("click", closeMedicalArchiveDrawer));
  document.querySelectorAll("[data-return-main-medical]").forEach((item) => item.addEventListener("click", closeMedicalArchiveDrawer));
  document.querySelectorAll("[data-archive-range]").forEach((button) => {
    button.addEventListener("click", () => {
      medicalArchiveState.rangeDays = Number(button.dataset.archiveRange) || 7;
      medicalArchiveState.view = "list";
      medicalArchiveState.selectedDate = null;
      renderMedicalDietRecords();
    });
  });
  document.querySelectorAll("[data-archive-date]").forEach((button) => {
    button.addEventListener("click", () => {
      medicalArchiveState.view = "detail";
      medicalArchiveState.selectedDate = button.dataset.archiveDate;
      renderMedicalDietRecords();
    });
  });
  document.querySelectorAll("[data-archive-back-list]").forEach((button) => {
    button.addEventListener("click", () => {
      medicalArchiveState.view = "list";
      medicalArchiveState.selectedDate = null;
      renderMedicalDietRecords();
    });
  });
}

function openMedicalArchiveDrawer() {
  medicalArchiveState.isOpen = true;
  medicalArchiveState.rangeDays = 7;
  medicalArchiveState.view = "list";
  medicalArchiveState.selectedDate = null;
  renderMedicalDietRecords();
}

function closeMedicalArchiveDrawer() {
  medicalArchiveState.isOpen = false;
  medicalArchiveState.view = "list";
  medicalArchiveState.selectedDate = null;
  renderMedicalDietRecords();
}

function getDailyNutritionSummary(date) {
  return getMedicalDietEntries(date).reduce((sum, entry) => {
    const nutrition = calculateEntryNutrition(entry);
    ["calories", "protein", "carbs", "fat"].forEach((key) => {
      sum[key] += Number(nutrition[key]) || 0;
    });
    return sum;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
}

function getDateRangeLogs(days) {
  const range = [];
  const base = parseDateString(getCurrentDate());
  for (let index = 0; index < days; index += 1) {
    const date = new Date(base);
    date.setDate(base.getDate() - index);
    const key = formatDateKey(date);
    const entries = getMedicalDietEntries(key);
    const summary = getDailyNutritionSummary(key);
    range.push({
      date: key,
      hasEntries: entries.length > 0,
      summary,
      foodNamesText: getDailyFoodNames(key),
      ...getArchiveStatus(summary)
    });
  }
  return range;
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDailyFoodNames(date) {
  const entries = getMedicalDietEntries(date);
  if (!entries.length) return "暂无饮食记录";
  const names = entries.map((entry) => entry.name || entry.mainIngredient || "未命名记录");
  const visible = names.slice(0, 3).join("、");
  return names.length > 3 ? `${visible} 等 ${names.length} 项` : visible;
}

function getArchiveStatus(summary) {
  let nearLimit = false;
  let overLimit = false;
  mainMedicalNutrients.forEach((key) => {
    const restriction = data.medicalDietProfile?.restrictions?.[key];
    const limit = Number(restriction?.limitValue);
    if (!Number.isFinite(limit) || limit <= 0) return;
    const percent = (Number(summary[key]) || 0) / limit;
    if (percent > 1) overLimit = true;
    else if (percent >= 0.9) nearLimit = true;
  });
  if (overLimit) return { statusLabel: "已超过", statusClass: "over" };
  if (nearLimit) return { statusLabel: "接近上限", statusClass: "near" };
  return { statusLabel: "正常", statusClass: "normal" };
}

function renderConsumedDietList(date) {
  const entries = getMedicalDietEntries(date);
  return `
    <section class="medical-side-section">
      <div class="section-heading compact-heading">
        <div>
          <p class="eyebrow">${date}</p>
          <h3>已摄入饮食</h3>
        </div>
        <button id="openMedicalArchiveBtn" class="ghost-btn small-btn" type="button">饮食记录</button>
      </div>
      ${entries.length ? `
        <div class="entries-list">
          ${entries.map((entry) => `
            <article class="entry-card">
              <header>
                <div>
                  <h3>${escapeHTML(entry.name || "未命名记录")}</h3>
                  <p class="entry-meta">${escapeHTML(renderConsumedIngredientLine(entry))}</p>
                </div>
                <button class="delete-btn" data-delete-consumed="${date}|${entry.id}" type="button">删除</button>
              </header>
              ${renderMedicalEntryNutritionCompact(entry)}
              ${renderMedicalEntryImpact(entry)}
              <p class="entry-meta">风险：${formatConsumedRiskLabels(entry).join(" / ")}</p>
              ${renderEntryShortReminder(entry)}
            </article>
          `).join("")}
        </div>
      ` : `<p class="empty">暂无记录。</p>`}
    </section>
  `;
}

function renderNextMealAdvice(date) {
  const advice = buildTodayMedicalAdvice(date);
  return `
    <section class="medical-side-section">
      <div class="section-heading compact-heading">
        <div>
          <p class="eyebrow">下一餐</p>
          <h3>今日提醒</h3>
        </div>
      </div>
      <p class="hint">${escapeHTML(advice)}</p>
    </section>
  `;
}

function buildTodayMedicalAdvice(date) {
  const progress = calculateMedicalDietProgress(date);
  if (!getMedicalDietEntries(date).length && !Object.keys(progress).length) return "设置限制或加入记录后显示。";
  const protein = progress.protein;
  const carbs = progress.carbs;
  const fat = progress.fat;
  if (protein?.limit && protein.current !== null && protein.limit - protein.current <= Math.max(8, protein.limit * 0.2)) return "蛋白质剩余较少，下一餐建议减少肉蛋豆制品。";
  if (carbs?.limit && carbs.current !== null && carbs.limit - carbs.current <= Math.max(30, carbs.limit * 0.2)) return "碳水剩余较少，下一餐建议减少米饭、面条、土豆等叠加。";
  if (fat?.limit && fat.current !== null && fat.limit - fat.current <= Math.max(10, fat.limit * 0.2)) return "脂肪接近上限，后续建议减少煎炒和重油做法。";
  const latestOil = getMedicalDietEntries(date).slice(-1)[0]?.oilGrams || 0;
  if (latestOil >= 10) return "本餐用油较多，下一餐建议选择清蒸、水煮或少油做法。";
  return "目前仍在设定范围内，后续继续少油少盐。";
}

function renderConsumedIngredientLine(entry) {
  const oilText = Number(entry.oilGrams) > 0 ? `｜用油 ${formatMedicalWeight(entry.oilGrams)}` : "";
  if (Array.isArray(entry.ingredients) && entry.ingredients.length) {
    return `${formatEntryIngredients(entry.ingredients)}${oilText}`;
  }
  return `${entry.mainIngredient || "未记录"} ${formatMedicalWeight(entry.personalEstimatedWeight)}${oilText}`;
}

function renderMedicalEntryNutritionCompact(entry) {
  const nutrition = calculateEntryNutrition(entry);
  const keys = ["protein", "carbs", "fat"];
  return `<p class="entry-meta macro-line"><strong>摄入：</strong>${keys.map((key) => {
    const config = medicalNutrientConfig[key];
    const value = nutrition[key];
    return `${config.label} ${value === null || value === undefined ? "暂无" : `${round(value)}${config.unit}`}`;
  }).join("｜")}</p>`;
}

function renderMedicalEntryImpact(entry) {
  const nutrition = calculateEntryNutrition(entry);
  const rows = mainMedicalNutrients.map((key) => {
    const config = medicalNutrientConfig[key];
    const rawValue = nutrition[key];
    if (rawValue === null || rawValue === undefined || !Number.isFinite(Number(rawValue))) {
      return `
        <div class="entry-impact-row no-bar">
          <span>${config.label}</span>
          <span class="entry-impact-spacer"></span>
          <strong>暂无可靠数据</strong>
        </div>
      `;
    }
    const value = Number(rawValue);
    const restriction = data.medicalDietProfile?.restrictions?.[key];
    const limit = Number(restriction?.limitValue);
    const hasLimit = Number.isFinite(limit) && limit > 0;
    const percent = hasLimit ? round((value / limit) * 100) : null;
    const exceeded = percent !== null && percent > 100;
    const stateClass = exceeded ? "danger" : percent !== null && percent >= 75 ? "warning" : "";
    const detail = hasLimit
      ? `+${round(value)}${config.unit}｜${exceeded ? `超过上限（${percent}%）` : `${percent}%`}`
      : restriction?.status === "reminder"
        ? "仅提醒"
        : `+${round(value)}${config.unit}`;
    return `
      <div class="entry-impact-row ${hasLimit ? "" : "no-bar"}">
        <span>${config.label}</span>
        ${hasLimit ? `<div class="entry-impact-bar"><div class="entry-impact-fill ${stateClass}" style="--impact-width:${Math.min(Math.max(percent, 0), 100)}%"></div></div>` : `<span class="entry-impact-spacer"></span>`}
        <strong>${detail}</strong>
      </div>
    `;
  }).filter(Boolean);
  if (!rows.length) return "";
  return `<div class="entry-impact-list"><span class="entry-impact-title">本条占今日上限</span>${rows.join("")}</div>`;
}

function formatConsumedRiskLabels(entry) {
  const labels = getEntryRiskTags(entry).slice(0, 4).map(getMedicalRiskLabel);
  return labels.length ? labels : ["一般提醒"];
}

function renderEntryShortReminder(entry) {
  const messages = Array.isArray(entry.riskMessages) ? entry.riskMessages : [];
  const message = messages.find((item) => item.startsWith("嘌呤：")) || entry.mealConclusion || messages[0];
  return message ? `<p class="entry-risk-note">${escapeHTML(message)}</p>` : "";
}

function bindConsumedDietActions() {
  document.querySelectorAll("[data-delete-consumed]").forEach((button) => {
    button.addEventListener("click", () => {
      const [date, id] = button.dataset.deleteConsumed.split("|");
      deleteConsumedDietEntry(date, id);
    });
  });
}

function deleteConsumedDietEntry(date, entryId) {
  deleteFoodEntry(date, entryId);
}

function refreshMedicalDietView() {
  renderAll();
}

function formatMedicalWeight(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? `${round(numericValue)}g` : "暂无可靠数据";
}

function renderMedicalDateCard(date) {
  const summary = calculateMedicalDietRecordSummary(date);
  const expanded = expandedDates.includes(date);
  const isCurrent = date === getCurrentDate();
  return `
    <article class="daily-card ${expanded ? "expanded" : ""} ${isCurrent ? "current-date-card" : ""}" data-date="${date}">
      <header class="daily-card-header">
        <div>
          <h3>${date}</h3>
          <p class="entry-meta">已记录菜品 ${summary.recordCount} 个${summary.dishNames.length ? `｜${summary.dishNames.join("、")}` : ""}</p>
          <p class="entry-meta">${summary.progressSummary || "尚无可计算的医嘱限制进度"}</p>
          ${summary.riskSummary ? `<p class="entry-meta">${summary.riskSummary}</p>` : ""}
        </div>
        <div class="daily-card-actions">
          <button class="ghost-btn" data-toggle-medical-date="${date}" type="button">${expanded ? "收起" : "展开"}</button>
          <button class="danger-ghost-btn" data-delete-date="${date}" type="button">删除该日记录</button>
        </div>
      </header>
      ${expanded ? renderMedicalDateDetails(date, false) : ""}
    </article>
  `;
}

function renderMedicalDateCardLegacy(date) {
  const summary = calculateMedicalDietRecordSummary(date);
  const expanded = expandedDates.includes(date);
  const isCurrent = date === getCurrentDate();
  return `
    <article class="daily-card ${expanded ? "expanded" : ""} ${isCurrent ? "current-date-card" : ""}" data-date="${date}">
      <header class="daily-card-header">
        <div>
          <h3>${date}</h3>
          <p class="entry-meta">已记录菜品 ${summary.recordCount} 个${summary.dishNames.length ? `｜${summary.dishNames.join("、")}` : ""}</p>
          <p class="entry-meta">${summary.progressSummary || "尚无可计算的医嘱限制进度"}</p>
          ${summary.riskSummary ? `<p class="entry-meta">${summary.riskSummary}</p>` : ""}
        </div>
        <div class="daily-card-actions">
          <button class="ghost-btn" data-toggle-medical-date="${date}" type="button">${expanded ? "收起" : "展开"}</button>
          <button class="danger-ghost-btn" data-delete-date="${date}" type="button">删除该日记录</button>
        </div>
      </header>
      ${expanded ? renderMedicalDateDetails(date, false) : ""}
    </article>
  `;
}

function renderMedicalDateCardOldUnused(date) {
  return renderMedicalDateCardLegacy(date);
}

function renderMedicalDateDetails(date, isToday) {
  const summary = calculateMedicalDietRecordSummary(date);
  return `
    <div class="daily-details">
      <section class="daily-section">
        <div class="section-heading compact-heading">
          <div>
            <p class="eyebrow">${isToday ? "当前日期" : "当日"}记录</p>
            <h3>已摄入饮食</h3>
          </div>
        </div>
        ${renderMedicalFoodEntries(date, summary.entries)}
      </section>
      <section class="daily-section">
        <div class="section-heading compact-heading">
          <div>
            <p class="eyebrow">限制摘要</p>
            <h3>医嘱限制进度摘要</h3>
          </div>
        </div>
        ${renderMedicalProgressSummary(date)}
      </section>
    </div>
  `;
}

function renderMedicalFoodEntries(date, entries) {
  if (!entries.length) return `<p class="empty">当前日期暂无已摄入饮食。请选择主食材并加入记录。</p>`;
  return `
    <div class="entries-list">
      ${entries.map((entry) => `
        <article class="entry-card">
          <header>
            <div>
              <h3>${escapeHTML(entry.name)}</h3>
              <p class="entry-meta">${escapeHTML(renderConsumedIngredientLine(entry))}</p>
              ${Array.isArray(entry.ingredients) && entry.ingredients.length > 1 ? `<p class="entry-meta">整道菜用量：${escapeHTML(formatEntryTotalIngredients(entry.ingredients))}</p>` : ""}
            </div>
            <button class="delete-btn" data-delete-food="${date}|${entry.id}" type="button">删除</button>
          </header>
          ${renderMedicalEntryNutrition(entry)}
          ${renderMedicalEntryImpact(entry)}
          ${entry.mealConclusion ? `<p class="hint">结论：${escapeHTML(entry.mealConclusion)}</p>` : ""}
          ${(entry.riskMessages || []).length ? `<p class="hint">风险：${formatConsumedRiskLabels(entry).join(" / ")}</p>` : ""}
        </article>
      `).join("")}
    </div>
  `;
}

function renderMedicalEntryNutrition(entry) {
  const nutrition = calculateEntryNutrition(entry);
  const keys = ["calories", "protein", "carbs", "fat"];
  return `
    <p class="macro-line">
      ${keys.map((key) => {
        const value = nutrition[key];
        const config = medicalNutrientConfig[key];
        const numericValue = Number(value);
        return `<span>${config.label} ${value === null || value === undefined || !Number.isFinite(numericValue) ? "暂无可靠数据" : `${round(numericValue)}${config.unit}`}</span>`;
      }).join("")}
    </p>
  `;
}

function renderMedicalProgressSummary(date) {
  const progress = calculateMedicalDietProgress(date);
  const entries = Object.entries(progress);
  if (!entries.length) return `<p class="empty">尚未启用具体限制项。</p>`;
  return `
    <div class="progress-list">
      ${entries.map(([key, item]) => `
        <div class="progress-item">
          <div class="progress-head">
            <strong>${medicalNutrientConfig[key].label}</strong>
            <span>${item.current === null ? "暂无可靠数据" : `${round(item.current)}${item.unit}`}${item.limit ? ` / ${item.limit}${item.unit}` : "｜仅提醒"}</span>
          </div>
          ${item.percent !== null ? `<div class="progress-track"><div class="progress-fill ${item.colorState}" style="width:${Math.min(item.percent, 100)}%"></div></div>` : ""}
          <p class="hint">${item.message}</p>
        </div>
      `).join("")}
    </div>
  `;
}

function calculateMedicalDietRecordSummary(date) {
  const entries = getMedicalDietEntries(date);
  const progress = calculateMedicalDietProgress(date);
  const progressSummary = Object.entries(progress).map(([key, item]) => {
    const label = medicalNutrientConfig[key].label;
    if (!item.limit) return `${label}：仅提醒`;
    return `${label} ${item.current === null ? "暂无可靠数据" : `${round(item.current)}${item.unit}`}/${item.limit}${item.unit}`;
  }).join("｜");
  const riskMessages = entries.flatMap((entry) => entry.riskMessages || []);
  return {
    date,
    entries,
    recordCount: entries.length,
    dishNames: entries.map((entry) => entry.name).slice(0, 3),
    progressSummary,
    riskSummary: riskMessages.length ? `风险提醒 ${riskMessages.length} 条` : ""
  };
}

function bindMedicalRecordActions() {
  document.querySelectorAll("[data-toggle-medical-date]").forEach((button) => {
    button.addEventListener("click", () => {
      toggleExpandedDate(button.dataset.toggleMedicalDate, false);
      renderMedicalDietRecords();
    });
  });
  document.querySelectorAll("[data-delete-date]").forEach((button) => {
    button.addEventListener("click", () => deleteDailyLog(button.dataset.deleteDate));
  });
  document.querySelectorAll("[data-delete-food]").forEach((button) => {
    button.addEventListener("click", () => {
      const [date, id] = button.dataset.deleteFood.split("|");
      deleteFoodEntry(date, id);
    });
  });
}

function renderDailyLogCard(date) {
  const log = ensureDailyLog(date);
  const summary = calculateDailySummary(date);
  const expanded = expandedDates.includes(date);
  const isCurrent = date === getCurrentDate();
  return `
    <article class="daily-card ${expanded ? "expanded" : ""} ${isCurrent ? "current-date-card" : ""}" data-date="${date}">
      <header class="daily-card-header">
        <div>
          <h3>${date}</h3>
          <p class="entry-meta">${goalLabels[data.profile.goal]}｜${dayStatusLabels[summary.dayStatus]}</p>
          <p class="entry-meta">摄入 ${round(summary.foodCalories)} kcal｜运动消耗 ${round(summary.totalExerciseBurned)} kcal｜${summary.remainingCalories >= 0 ? `还可摄入 ${round(summary.remainingCalories)} kcal` : `已超出 ${round(Math.abs(summary.remainingCalories))} kcal`}</p>
        </div>
        <div class="daily-card-actions">
          <button class="ghost-btn" data-toggle-date="${date}" type="button">${expanded ? "收起" : "展开"}</button>
          <button class="danger-ghost-btn" data-delete-date="${date}" type="button">删除该日期</button>
        </div>
      </header>
      ${expanded ? renderDailyLogDetails(date, log, summary) : ""}
    </article>
  `;
}

function renderDailyLogDetails(date, log, summary) {
  return `
    <div class="daily-details">
      <section class="daily-section">
        <div class="section-heading compact-heading">
          <div>
            <p class="eyebrow">日期状态</p>
            <h3>今日状态</h3>
          </div>
        </div>
        ${renderDayStatus(date, `card-${date}`)}
      </section>
      <section class="daily-section">
        <div class="section-heading compact-heading">
          <div>
            <p class="eyebrow">运动记录</p>
            <h3>今日运动</h3>
          </div>
          <button class="danger-ghost-btn" data-clear-exercise="${date}" type="button">清空该日运动</button>
        </div>
        ${renderDailyExerciseList(date, log.exerciseEntries)}
      </section>
      <section class="daily-section">
        <div class="section-heading compact-heading">
          <div>
            <p class="eyebrow">饮食记录</p>
            <h3>今日摄入饮食</h3>
          </div>
          <button class="danger-ghost-btn" data-clear-food="${date}" type="button">清空该日饮食</button>
        </div>
        ${renderDailyFoodList(date, log.foodEntries)}
      </section>
      <section class="daily-section">
        <div class="section-heading compact-heading">
          <div>
            <p class="eyebrow">汇总</p>
            <h3>今日汇总</h3>
          </div>
        </div>
        ${renderDailySummaryTable(summary)}
      </section>
      <section class="daily-section">
        <div class="section-heading compact-heading">
          <div>
            <p class="eyebrow">建议</p>
            <h3>今日建议</h3>
          </div>
        </div>
        ${renderDailyAdvice(date)}
      </section>
    </div>
  `;
}

function renderDailyFoodList(date, entries) {
  if (!entries.length) return `<p class="empty">今天暂无饮食记录。</p>`;
  return `
    <div class="entries-list">
      ${entries.map((entry, index) => `
        <article class="entry-card">
          <header>
            <div>
              <h3>${index + 1}. ${escapeHTML(entry.name)}</h3>
              <p class="entry-meta">${escapeHTML(entry.category)}｜${escapeHTML(entry.portion)}</p>
            </div>
            <button class="delete-btn" data-delete-food="${date}|${entry.id}" type="button">删除</button>
          </header>
          <p><strong>约 ${round(entry.calories)} kcal</strong></p>
          <p class="macro-line">
            <span>蛋白质 ${round(entry.protein)}g</span>
            <span>碳水 ${round(entry.carbs)}g</span>
            <span>脂肪 ${round(entry.fat)}g</span>
          </p>
          <p class="entry-meta">可信度：${confidenceLabels[entry.confidence]}</p>
          ${entry.note ? `<p class="hint">备注：${escapeHTML(entry.note)}</p>` : ""}
        </article>
      `).join("")}
    </div>
  `;
}

function renderDailyExerciseList(date, entries) {
  if (!entries.length) return `<p class="empty">今天暂无运动记录。</p>`;
  return `
    <div class="entries-list">
      ${entries.map((entry, index) => `
        <article class="entry-card">
          <header>
            <div>
              <h3>${index + 1}. ${escapeHTML(entry.type)}</h3>
              <p class="entry-meta">时长：${round(entry.durationMinutes)} 分钟</p>
            </div>
            <button class="delete-btn" data-delete-exercise="${date}|${entry.id}" type="button">删除</button>
          </header>
          <p><strong>运动消耗估算：约 ${round(entry.caloriesBurned)} kcal</strong></p>
          <p class="entry-meta">计入今日可摄入：约 ${round(entry.caloriesAdded)} kcal</p>
          <p class="hint">说明：运动消耗为估算值，实际会受速度、坡度、心率、海拔和个人状态影响。</p>
          ${entry.note ? `<p class="hint">备注：${escapeHTML(entry.note)}</p>` : ""}
        </article>
      `).join("")}
    </div>
  `;
}

function renderDailySummaryTable(summary) {
  const rows = [
    ["已摄入热量", `${round(summary.foodCalories)} kcal`],
    ["运动消耗估算", `${round(summary.totalExerciseBurned)} kcal`],
    ["运动计入热量", `${round(summary.exerciseCaloriesAdded)} kcal`],
    ["今日建议摄入热量", `${round(summary.adjustedTargetCalories)} kcal`],
    ["今日还可摄入", summary.remainingCalories >= 0 ? `${round(summary.remainingCalories)} kcal` : `已超出 ${round(Math.abs(summary.remainingCalories))} kcal`],
    ["蛋白质", `${round(summary.protein)}g / ${calculateTargets(data.profile).protein}g / ${formatRemaining(summary.remainingProtein, "g")}`],
    ["碳水", `${round(summary.carbs)}g / ${calculateTargets(data.profile).carbs}g / ${formatRemaining(summary.remainingCarbs, "g")}`],
    ["脂肪", `${round(summary.fat)}g / ${calculateTargets(data.profile).fat}g / ${formatRemaining(summary.remainingFat, "g")}`]
  ];
  return `
    <div class="summary-wrap">
      <table>
        <tbody>${rows.map(([name, value]) => `<tr><th>${name}</th><td>${value}</td></tr>`).join("")}</tbody>
      </table>
    </div>
  `;
}

function bindDailyStatsActions() {
  document.querySelectorAll("[data-toggle-date]").forEach((button) => {
    button.addEventListener("click", () => toggleExpandedDate(button.dataset.toggleDate));
  });
  document.querySelectorAll("[data-delete-date]").forEach((button) => {
    button.addEventListener("click", () => deleteDailyLog(button.dataset.deleteDate));
  });
  document.querySelectorAll("[data-clear-food]").forEach((button) => {
    button.addEventListener("click", () => clearFoodEntries(button.dataset.clearFood));
  });
  document.querySelectorAll("[data-clear-exercise]").forEach((button) => {
    button.addEventListener("click", () => clearExerciseEntries(button.dataset.clearExercise));
  });
  document.querySelectorAll("[data-delete-food]").forEach((button) => {
    button.addEventListener("click", () => {
      const [date, id] = button.dataset.deleteFood.split("|");
      deleteFoodEntry(date, id);
    });
  });
  document.querySelectorAll("[data-delete-exercise]").forEach((button) => {
    button.addEventListener("click", () => {
      const [date, id] = button.dataset.deleteExercise.split("|");
      deleteExerciseEntry(date, id);
    });
  });
  document.querySelectorAll(".daily-card .day-status-input").forEach((input) => {
    const card = input.closest("[data-date]");
    if (card) input.addEventListener("change", () => updateDayStatus(input.value, card.dataset.date));
  });
}

function toggleExpandedDate(date, shouldRender = true) {
  if (expandedDates.includes(date)) {
    expandedDates = expandedDates.filter((item) => item !== date);
  } else {
    expandedDates.push(date);
    if (expandedDates.length > 2) expandedDates.shift();
  }
  if (shouldRender) renderDailyStats();
}

function renderManualForm() {
  return `
    <div class="manual-box">
      <form id="manualForm" class="manual-form">
        <div class="form-field"><label for="manualName">名称</label><input id="manualName" name="name" required></div>
        <div class="form-field"><label for="manualPortion">份量</label><input id="manualPortion" name="portion" placeholder="例如 1盒 / 100g"></div>
        <div class="form-field"><label for="manualCalories">热量 kcal</label><input id="manualCalories" name="calories" type="number" min="0" step="1" required></div>
        <div class="form-field"><label for="manualProtein">蛋白质 g</label><input id="manualProtein" name="protein" type="number" min="0" step="0.1" required></div>
        <div class="form-field"><label for="manualCarbs">碳水 g</label><input id="manualCarbs" name="carbs" type="number" min="0" step="0.1" required></div>
        <div class="form-field"><label for="manualFat">脂肪 g</label><input id="manualFat" name="fat" type="number" min="0" step="0.1" required></div>
        <div class="form-field full"><label for="manualNote">备注</label><textarea id="manualNote" name="note"></textarea></div>
        <div class="form-field full"><button type="submit">加入今日记录</button></div>
      </form>
      <p class="hint">手动输入默认可信度为高，适合已有明确营养标签的数据。</p>
    </div>
  `;
}

function showProfile() {
  document.getElementById("profileSection").classList.remove("hidden");
  document.getElementById("mainSection").classList.add("hidden");
  renderProfile();
}

function showMain() {
  if (!data.profile) {
    showProfile();
    return;
  }
  document.getElementById("profileSection").classList.add("hidden");
  document.getElementById("mainSection").classList.remove("hidden");
  renderAll();
}

function renderAll() {
  renderMainByMode();
  renderSettingsHint();
}

function renderMainByMode() {
  const isMedicalMode = data.appMode === "medical_diet";
  document.body.classList.toggle("medical-diet-mode", isMedicalMode);
  document.getElementById("settingsCard")?.classList.toggle("hidden", isMedicalMode);
  if (data.appMode === "medical_diet") {
    renderMedicalDietOverview();
    renderMedicalDietMode();
    renderMedicalDietRecords();
    return;
  }
  renderBodyManagementMode();
}

function renderBodyManagementMode() {
  renderBodyManagementDashboard();
  renderTemplatePanel();
  renderDailyStats();
}

function renderSettingsHint() {
  const hint = document.querySelector(".settings-actions .hint");
  if (!hint) return;
  hint.textContent = data.appMode === "medical_diet"
    ? "数据仅保存在本机浏览器 localStorage。本工具仅用于根据用户录入的医嘱限制进行饮食记录、风险提醒和搭配建议，不替代医生或营养师建议。"
    : "数据仅保存在本机浏览器 localStorage。本工具用于饮食估算，不是医疗工具。";
}

function getFoodTotals(date = getCurrentDate()) {
  return ensureDailyLog(date).foodEntries.reduce((sum, entry) => {
    sum.calories += Number(entry.calories) || 0;
    sum.protein += Number(entry.protein) || 0;
    sum.carbs += Number(entry.carbs) || 0;
    sum.fat += Number(entry.fat) || 0;
    return sum;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
}

function getTodayTotals() {
  return getFoodTotals(getCurrentDate());
}

function stat(label, value, description = "") {
  return `<div class="stat"><span>${label}</span><strong>${value}</strong>${description ? `<p>${description}</p>` : ""}</div>`;
}

function round(value) {
  return Math.round(Number(value) * 10) / 10;
}

function formatRemaining(value, unit) {
  return value >= 0 ? `剩余 ${round(value)}${unit}` : `已超出 ${round(Math.abs(value))}${unit}`;
}

function getControl(name) {
  const control = document.querySelector(`[name="${name}"]`);
  return control ? control.value : "";
}

function extractBaseUnit(unit) {
  const match = String(unit).match(/\d+(?:\.\d+)?\s*(?:g|ml|个|份)/i);
  return match ? match[0].replace(/\s+/g, "") : String(unit);
}

function getBaseAmount(unit) {
  const match = String(unit).match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : 1;
}

function getUnitMeasure(unit) {
  if (String(unit).includes("ml")) return "ml";
  if (String(unit).includes("g")) return "g";
  if (String(unit).includes("个")) return "个";
  if (String(unit).includes("份")) return "份";
  return "";
}

function labelOf(name) {
  const control = document.querySelector(`[name="${name}"]`);
  return control.options ? control.options[control.selectedIndex].text : control.value;
}

function multiplyNutrition(item, factor) {
  return {
    ...item,
    calories: item.calories * factor,
    protein: item.protein * factor,
    carbs: item.carbs * factor,
    fat: item.fat * factor
  };
}

function addNutrition(item, addon) {
  item.calories += Number(addon.calories) || 0;
  item.protein += Number(addon.protein) || 0;
  item.carbs += Number(addon.carbs) || 0;
  item.fat += Number(addon.fat) || 0;
}

function applyOil(item, oil) {
  if (oil === "less") {
    item.calories -= 50;
    item.fat -= 5.5;
  }
  if (oil === "heavy") {
    item.calories += 120;
    item.fat += 13;
  }
}

function applySauce(item, sauce, type) {
  if (sauce === "less") {
    item.calories -= type === "restaurant" ? 30 : 20;
    item.carbs -= type === "restaurant" ? 5 : 3;
    item.fat -= 1;
  }
  if (sauce === "more") {
    item.calories += type === "restaurant" ? 90 : 60;
    item.carbs += type === "restaurant" ? 12 : 8;
    item.fat += type === "restaurant" ? 4 : 2;
  }
}

function applyExtra(item, extra) {
  if (extra === "egg") {
    item.calories += 70;
    item.protein += 6;
    item.carbs += 0.5;
    item.fat += 5;
  }
  if (extra === "meat") {
    item.calories += 150;
    item.protein += 18;
    item.fat += 8;
  }
  if (extra === "carb") {
    item.calories += 180;
    item.protein += 5;
    item.carbs += 38;
    item.fat += 1;
  }
}

function applySugar(item, sugar) {
  if (sugar === "less") {
    item.calories += 20;
    item.carbs += 5;
  }
  if (sugar === "sweet") {
    item.calories += 60;
    item.carbs += 15;
  }
}

function applySnackSugar(item, sugar) {
  if (sugar === "none") {
    item.calories -= 80;
    item.carbs -= 20;
  }
  if (sugar === "less") {
    item.calories -= 30;
    item.carbs -= 8;
  }
  if (sugar === "sweet") {
    item.calories += 80;
    item.carbs += 20;
  }
}

function applySnackExtra(item, extra) {
  if (extra === "pearl") {
    item.calories += 120;
    item.carbs += 28;
  }
  if (extra === "cream") {
    item.calories += 180;
    item.protein += 2;
    item.carbs += 10;
    item.fat += 14;
  }
}

function showImportMessage(text, isError) {
  const message = document.getElementById("importMessage");
  if (!message) return;
  message.textContent = text;
  message.classList.toggle("error", Boolean(isError));
}

function showInlineMessage(target, text, isError = false) {
  target.textContent = text;
  target.classList.toggle("error", Boolean(isError));
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

document.addEventListener("DOMContentLoaded", () => {
  trackEvent("app_open");
  loadData();
  document.getElementById("editProfileBtn").addEventListener("click", showProfile);
  document.getElementById("exportBtn").addEventListener("click", exportJSON);
  document.getElementById("importInput").addEventListener("change", (event) => importJSON(event.target.files[0]));
  if (data.profile) showMain();
  else showProfile();
});
