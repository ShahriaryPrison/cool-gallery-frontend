import {
  CircleDot,
  Disc3,
  Gem,
  Gift,
  KeyRound,
  Link2,
  Sparkle,
  Sparkles,
  Crown,
  ShoppingBag,
  Bot,
  Flame,
  Zap,
  Droplets,
  Cpu,
  Watch,
  CreditCard,
  type LucideProps,
} from "lucide-react";

import type { Category } from "@/lib/data";

export function CategoryIcon({ category, ...props }: LucideProps & { category: Category | string }) {
  switch (category) {
    case "گردنبند":
      return <Gem {...props} />;
    case "دستبند":
      return <Link2 {...props} />;
    case "انگشتر":
      return <CircleDot {...props} />;
    case "گوشواره":
      return <Sparkle {...props} />;
    case "پیرسینگ":
      return <Sparkles {...props} />;
    case "فیجت":
      return <Disc3 {...props} />;
    case "جاکلیدی":
      return <KeyRound {...props} />;
    case "جاکارتی":
      return <CreditCard {...props} />;
    case "ست هدیه":
      return <Gift {...props} />;
    case "کلاه":
      return <Crown {...props} />;
    case "کیف":
      return <ShoppingBag {...props} />;
    case "فیگور":
      return <Bot {...props} />;
    case "پاد":
    case "پاد یکبار مصرف":
      return <Flame {...props} />;
    case "پاد دائمی":
      return <Zap {...props} />;
    case "سالت":
      return <Droplets {...props} />;
    case "کویل و کارتریج":
      return <Cpu {...props} />;
    case "ساعت":
      return <Watch {...props} />;
    default:
      return <Gem {...props} />;
  }
}
