# COOL Gallery

فروشگاه اکسسوری «COOL» — بازسازی رابط کاربری از روی طرح اولیه (`cool-gallery-shop.html`) با استک زیر:

- **Next.js 16** (App Router, Turbopack) + **React 19** + TypeScript
- **Tailwind CSS v4**
- **shadcn/ui** (روی [Base UI](https://base-ui.com)) برای کامپوننت‌ها — Sheet، Drawer، Select، Switch، Sonner و ...
- فونت [Vazirmatn](https://fonts.google.com/specimen/Vazirmatn) برای متن فارسی و [Bowlby One](https://fonts.google.com/specimen/Bowlby+One) برای اعداد نمایشی
- راست‌به‌چپ (RTL) به‌صورت کامل

این نسخه فقط **رابط کاربری با داده‌ی نمایشی (mock)** است — بدون بک‌اند یا پرداخت واقعی. سبد خرید در `localStorage` مرورگر ذخیره می‌شود.

## اجرا در محیط توسعه

```bash
npm install
npm run dev
```

سپس [http://localhost:3000](http://localhost:3000) را باز کنید.

## ساختار پروژه

```
app/
  page.tsx                 صفحه خانه
  shop/page.tsx             فروشگاه (جست‌وجو، دسته‌بندی، فیلتر، مرتب‌سازی)
  product/[id]/page.tsx     جزئیات محصول
  checkout/page.tsx         تکمیل خرید
  checkout/success/page.tsx تایید سفارش
components/
  cart/                     Context سبد خرید (localStorage) + Drawer سبد
  layout/                   هدر، تیکر، فوتر، ناوبری پایین، منوی موبایل
  product/                  کارت محصول، گالری، انتخاب رنگ/سایز
  shop/                     منطق فیلتر/جست‌وجو/مرتب‌سازی فروشگاه
  ui/                       کامپوننت‌های shadcn/ui
lib/
  data.ts                   داده‌های محصول، دسته‌بندی، روش ارسال/پرداخت
  format.ts                 تبدیل اعداد به فارسی و فرمت تومان
```

تصاویر محصول در طرح اصلی مسیرهای placeholder بودند (فایل واقعی نداشتند)، بنابراین در این نسخه هر کارت محصول یک آیکون مرتبط با دسته‌بندی روی گرادیان برند نمایش می‌دهد به‌جای تصویر شکسته یا عکس استوک بی‌ربط.

## دستورات

```bash
npm run dev      # سرور توسعه (Turbopack)
npm run build    # بیلد نسخه production
npm run start    # اجرای نسخه production بیلدشده
npm run lint     # ESLint
```

## دیپلوی

این پروژه یک اپ استاندارد Next.js است و روی هر پلتفرمی که از Next.js پشتیبانی می‌کند (مثل [Vercel](https://vercel.com/new)) قابل دیپلوی است:

```bash
npx vercel
```

یا برای هاست‌های دیگر:

```bash
npm run build
npm run start
```

هیچ متغیر محیطی (env) یا سرویس خارجی‌ای لازم نیست — همه‌چیز استاتیک و mock است.
