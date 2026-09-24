export type Category =
  | "گردنبند"
  | "دستبند"
  | "انگشتر"
  | "گوشواره"
  | "پیرسینگ"
  | "فیجت"
  | "جاکلیدی"
  | "ست هدیه";

export type ProductBadge = "پرفروش" | "جدید" | "تخفیف" | string;

export interface Product {
  id: string;
  name: string;
  cat: Category;
  price: number;
  oldPrice?: number;
  badge: ProductBadge;
  image: string;
  popularity: number;
  rating: number;
  colors: { label: string; swatch: string }[];
  sizes: string[];
  description: string;
  specs: { k: string; v: string }[];
}

export const CATEGORIES: Category[] = [
  "گردنبند",
  "دستبند",
  "انگشتر",
  "گوشواره",
  "پیرسینگ",
  "فیجت",
  "جاکلیدی",
  "ست هدیه",
];

export const PRODUCTS: Product[] = [
  {
    id: "f1",
    name: "فیجت اژدهای مفصلی مشکی Toothless",
    cat: "فیجت",
    price: 490000,
    oldPrice: 580000,
    badge: "پرفروش",
    image: "/products/fidget-dragon-black.png",
    popularity: 99,
    rating: 4.9,
    colors: [
      { label: "مشکی مات", swatch: "#15151a" },
      { label: "سفید صدفی", swatch: "#eaeaea" },
    ],
    sizes: ["متوسط (۱۸cm)", "بزرگ (۲۴cm)"],
    description:
      "فیجت اژدهای مفصلی تمام متحرک با پرینت سه‌بعدی باکیفیت و بال‌های انعطاف‌پذیر. مفاصل روان با حس لمس فوق‌العاده و چشم‌های نگین‌دار سبز، ضد استرس و دکوری خاص میز کار.",
    specs: [
      { k: "جنس", v: "PLA+ تقویت‌شده و نشکن" },
      { k: "طول", v: "۲۲ سانتی‌متر" },
      { k: "مفاصل", v: "تمام مفصلی (۳۲ بند متحرک)" },
      { k: "ارسال", v: "آماده ارسال فوری" },
    ],
  },
  {
    id: "n1",
    name: "گردنبند استیل سیم‌خاردار گوتیک",
    cat: "گردنبند",
    price: 680000,
    oldPrice: 850000,
    badge: "پرفروش",
    image: "/products/necklace-barbed-wire.png",
    popularity: 98,
    rating: 4.9,
    colors: [
      { label: "مشکی آنتیک", swatch: "#1c1c22" },
      { label: "نقره‌ای دودی", swatch: "#b5b8c2" },
    ],
    sizes: ["۵۰cm", "۶۰cm"],
    description:
      "طراحی خشن و خاص سیم‌خاردار ساخته‌شده از استیل عیار ۳۱۶ با روکش دودی ثابت. کاملاً ضدحساسیت و ضدآب، مناسب استایل‌های دارک و استریت‌ویر.",
    specs: [
      { k: "جنس", v: "استیل ۳۱۶L رنگ ثابت" },
      { k: "طول زنجیر", v: "۵۵ سانتی‌متر" },
      { k: "قفل", v: "طوطی تقویت‌شده" },
      { k: "ویژگی", v: "ضدحساسیت و ضدزنگ" },
    ],
  },
  {
    id: "w1",
    name: "جاکارتی چرم طبیعی دست‌دوز طرح کراس",
    cat: "ست هدیه",
    price: 590000,
    badge: "جدید",
    image: "/products/wallet-gothic-cross.png",
    popularity: 95,
    rating: 4.8,
    colors: [
      { label: "مشکی با چاپ سفید", swatch: "#111114" },
      { label: "مشکی تمام مات", swatch: "#1a1a1f" },
    ],
    sizes: ["ابعاد جیبی (۱۰×۸ cm)"],
    description:
      "جاکارتی جیبی دست‌دوز از چرم طبیعی گاوی درجه یک با چاپ گوتیک کراس طرح کروم هارتس. دارای ۴ جای کارت و محفظه میانی اسکناس، لبه‌دوزی مقاوم و جمع‌وجور.",
    specs: [
      { k: "جنس", v: "چرم طبیعی گاوی" },
      { k: "ظرفیت", v: "۶ تا ۸ عدد کارت + اسکناس" },
      { k: "دوخت", v: "دست‌دوز با نخ موم‌زده" },
      { k: "گارانتی", v: "ضمانت ۶ ماهه اصالت چرم" },
    ],
  },
  {
    id: "n2",
    name: "گردنبند نقشه ایران و پلاک فروهر مشکی",
    cat: "گردنبند",
    price: 540000,
    oldPrice: 650000,
    badge: "پرفروش",
    image: "/products/necklace-farvahar-black.png",
    popularity: 97,
    rating: 5,
    colors: [
      { label: "مشکی مات با حک نقره‌ای", swatch: "#18181c" },
    ],
    sizes: ["۵۰cm", "۶۰cm"],
    description:
      "گردنبند دولایه با پلاک پترن نقشه ایران و نشان فروهر از جنس استیل مقاوم. زنجیر کارتیر ریز مشکی با پولیش براق، مناسب خانم‌ها و آقایان.",
    specs: [
      { k: "جنس", v: "استیل ۳۱۶ با رنگ کوره ثابت" },
      { k: "ابعاد پلاک", v: "۳.۵ × ۳ سانتی‌متر" },
      { k: "زنجیر", v: "کارتیر ۶۰ سانتی‌متری" },
      { k: "ارسال", v: "ارسال در جعبه کادویی COOL" },
    ],
  },
  {
    id: "n3",
    name: "گردنبند درفش کاویانی و فروهر طلایی",
    cat: "گردنبند",
    price: 620000,
    badge: "جدید",
    image: "/products/necklace-derafsh-gold.png",
    popularity: 92,
    rating: 4.8,
    colors: [
      { label: "طلایی با میناکاری سرمه‌ای و قرمز", swatch: "#d4af37" },
    ],
    sizes: ["۵۵cm"],
    description:
      "پلاک دورو نشان باستانی درفش کاویانی همراه بال‌های فروهر با آبکاری طلایی درخشان و میناکاری دست‌ساز. همراه با زنجیر ماری استیل طلایی.",
    specs: [
      { k: "جنس", v: "استیل با آبکاری طلای ۱۸ عیار" },
      { k: "نوع زنجیر", v: "ماری ظریف ۵۵cm" },
      { k: "لعاب", v: "میناکاری مقاوم و شفاف" },
      { k: "ارسال", v: "۲۴ تا ۴۸ ساعته" },
    ],
  },
  {
    id: "f2",
    name: "ست دو عددی اژدهای مفصلی (سیاه و سفید)",
    cat: "ست هدیه",
    price: 890000,
    oldPrice: 1100000,
    badge: "تخفیف",
    image: "/products/fidget-dragons-pair.png",
    popularity: 94,
    rating: 5,
    colors: [{ label: "ست شب و روز (Black & White)", swatch: "#222" }],
    sizes: ["ست دوتایی"],
    description:
      "پک دوتایی محبوب شامل اژدهای خشم شب (Toothless) و خشم روز (Light Fury). بهترین گزینه برای ست کاپلی، هدیه تولد و دکوراسیون میز گیمینگ.",
    specs: [
      { k: "محتویات", v: "۲ عدد اژدهای مفصلی کامل" },
      { k: "بسته‌بندی", v: "جعبه هدیه مشکی مات COOL" },
      { k: "ارسال", v: "ارسال رایگان سراسر کشور" },
    ],
  },
  {
    id: "f3",
    name: "فیجت گیربکس و زنجیر چرخ‌دنده فلزی",
    cat: "فیجت",
    price: 650000,
    oldPrice: 790000,
    badge: "پرفروش",
    image: "/products/fidget-gear-chain.png",
    popularity: 91,
    rating: 4.9,
    colors: [{ label: "استیل پولیش‌خورده", swatch: "#c2c5cd" }],
    sizes: ["استاندارد"],
    description:
      "فیجت تمام‌فلزی سنگین با چرخ‌دنده‌های دقیق و زنجیر فولادی صنعتی. چرخش بی‌نهایت روان و لذت‌بخش با صدای مکانیکی ملایم برای تمرکز و رفع اضطراب.",
    specs: [
      { k: "جنس", v: "فولاد ضدزنگ سنگین" },
      { k: "وزن", v: "۱۴۵ گرم" },
      { k: "بلبرینگ", v: "بلبرینگ کروم صنعتی بی‌صدا" },
      { k: "ارسال", v: "ارسال فوری" },
    ],
  },
  {
    id: "b1",
    name: "دستبند کوبایی استیل ۳۱۶ دو رنگ",
    cat: "دستبند",
    price: 480000,
    badge: "جدید",
    image: "/products/bracelet-cuban-steel.png",
    popularity: 86,
    rating: 4.7,
    colors: [
      { label: "ترکیب استیل و مشکی مات", swatch: "#7b7d85" },
      { label: "استیل نقره‌ای تمام براق", swatch: "#d0d2d8" },
    ],
    sizes: ["۱۸cm", "۲۰cm", "۲۲cm"],
    description:
      "دستبند زنجیر ضخیم کوبایی (Cuban Link) با قفل جعبه‌ای امنیتی. ترکیب حلقه‌های مشکی مات و استیل نقره‌ای برای استایل خیابانی و کژوال مدرن.",
    specs: [
      { k: "جنس", v: "استیل ۳۱۶L رنگ ثابت" },
      { k: "عرض زنجیر", v: "۱۰ میلی‌متر" },
      { k: "قفل", v: "قفل فشاری با ضامن ایمنی" },
      { k: "ارسال", v: "۲۴ ساعته" },
    ],
  },
  {
    id: "r1",
    name: "انگشتر استیل بولد اسکلت و گوتیک",
    cat: "انگشتر",
    price: 360000,
    badge: "",
    image: "/products/ring-bold-steel.png",
    popularity: 88,
    rating: 4.7,
    colors: [
      { label: "سیلور با سیاه‌قلم دودی", swatch: "#82848c" },
    ],
    sizes: ["سایز ۹", "سایز ۱۰", "سایز ۱۱", "سایز ۱۲"],
    description:
      "انگشتر سنگین و درشت با حکاکی اسکلت شاخدار و پترن‌های گوتیک دودی. کاملاً توپر، ضدحساسیت و بدون تغییر رنگ با شستشو و تعریق.",
    specs: [
      { k: "جنس", v: "استیل خالص توپر ۳۱۶" },
      { k: "پرداخت", v: "سیاه‌قلم دست‌ساز و مات" },
      { k: "ضدحساسیت", v: "۱۰۰٪ تضمینی" },
      { k: "ارسال", v: "همراه با جعبه هدیه" },
    ],
  },
  {
    id: "e1",
    name: "پک گوشواره و پیرسینگ استیل مشکی",
    cat: "گوشواره",
    price: 290000,
    badge: "جدید",
    image: "/products/earring-piercing.png",
    popularity: 83,
    rating: 4.6,
    colors: [
      { label: "مشکی مات کوره ای", swatch: "#161618" },
      { label: "استیل نقره‌ای", swatch: "#c9ccd3" },
    ],
    sizes: ["پک ۶ عددی متنوع"],
    description:
      "مجموعه ۶ عددی شامل ۳ جفت گوشواره حلقه هاگی مینیمال و پیرسینگ‌های میله‌ای توپی. مناسب لاله و غضروف گوش، سبک و بدون ایجاد حساسیت.",
    specs: [
      { k: "جنس", v: "تیتانیوم و استیل پزشکی" },
      { k: "تعداد در بسته", v: "۶ عدد (۳ جفت)" },
      { k: "ضدحساسیت", v: "مناسب گوش‌های حساس" },
      { k: "ارسال", v: "۲۴ ساعته" },
    ],
  },
  {
    id: "x1",
    name: "پیرسینگ تیتانیوم نگین‌دار استریل",
    cat: "پیرسینگ",
    price: 195000,
    badge: "",
    image: "/products/earring-piercing.png",
    popularity: 79,
    rating: 4.5,
    colors: [
      { label: "استیل نقره‌ای", swatch: "#c9ccd3" },
      { label: "مشکی", swatch: "#161618" },
    ],
    sizes: ["میله ۶mm", "میله ۸mm"],
    description:
      "پیرسینگ تک نگین‌دار تیتانیومی با گرید پزشکی. ضدعفونی‌شده و مناسب بافت‌های حساس با پیچ مخفی بدون گیر کردن به لباس و مو.",
    specs: [
      { k: "جنس", v: "تیتانیوم گرید ۲۳ ایمپلنت" },
      { k: "بسته‌بندی", v: "بسته استریل پلمپ" },
      { k: "ضدحساسیت", v: "تضمین عدم ایجاد آلرژی" },
    ],
  },
  {
    id: "k1",
    name: "جاکلیدی اژدهای مفصلی مشکی",
    cat: "جاکلیدی",
    price: 260000,
    badge: "",
    image: "/products/fidget-dragon-black.png",
    popularity: 87,
    rating: 4.8,
    colors: [
      { label: "مشکی مات", swatch: "#15151a" },
      { label: "سفید صدفی", swatch: "#eaeaea" },
    ],
    sizes: ["طول ۱۲ سانتی‌متر"],
    description:
      "جاکلیدی اژدهای متحرک با حلقه و زنجیر استیل محکم. هم به عنوان فیجت ضد استرس جیبی و هم به عنوان آویز سوئیچ ماشین و کوله‌پشتی.",
    specs: [
      { k: "جنس", v: "رزین نشکن + حلقه استیل" },
      { k: "طول", v: "۱۲ سانتی‌متر" },
      { k: "قفل حلقه", v: "حلقه دوبل تخت ضدسرقت" },
      { k: "ارسال", v: "۲۴ ساعته" },
    ],
  },
];

export interface PriceBand {
  key: string;
  label: string;
  lo: number;
  hi: number;
}

export const PRICE_BANDS: PriceBand[] = [
  { key: "all", label: "همه قیمت‌ها", lo: 0, hi: Infinity },
  { key: "a", label: "زیر ۳۰۰ هزار تومان", lo: 0, hi: 300000 },
  { key: "b", label: "۳۰۰ تا ۶۰۰ هزار تومان", lo: 300000, hi: 600000 },
  { key: "c", label: "بالای ۶۰۰ هزار تومان", lo: 600000, hi: Infinity },
];

export interface ShippingOption {
  key: string;
  label: string;
  cost: number;
}

export const SHIPPING_OPTIONS: ShippingOption[] = [
  { key: "post", label: "پست پیشتاز (سراسر کشور)", cost: 55000 },
  { key: "tip", label: "تیپاکس (تحویل ۱ تا ۲ روزه)", cost: 85000 },
  { key: "exp", label: "پیک فوری تهران (تحویل همان روز)", cost: 110000 },
];

export interface PaymentOption {
  key: string;
  label: string;
}

export const PAYMENT_OPTIONS: PaymentOption[] = [
  { key: "gate", label: "پرداخت آنلاین (شتاب)" },
  { key: "card", label: "کارت به کارت" },
];

export const FREE_SHIPPING_THRESHOLD = 700000;
export const DISCOUNT_CODE = "COOL30";
export const DISCOUNT_RATE = 0.3;

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function getBestSellers(limit = 4): Product[] {
  return [...PRODUCTS].sort((a, b) => b.popularity - a.popularity).slice(0, limit);
}

export function getFreshProducts(limit = 6): Product[] {
  return PRODUCTS.slice(0, limit);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  const sameCategory = PRODUCTS.filter((p) => p.cat === product.cat && p.id !== product.id);
  const rest = PRODUCTS.filter((p) => p.cat !== product.cat);
  return [...sameCategory, ...rest].slice(0, limit);
}
