import {
  CircleDot,
  Disc3,
  Gem,
  Gift,
  KeyRound,
  Link2,
  Sparkle,
  Sparkles,
  type LucideProps,
} from "lucide-react";

import type { Category } from "@/lib/data";

export function CategoryIcon({ category, ...props }: LucideProps & { category: Category }) {
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
    case "ست هدیه":
      return <Gift {...props} />;
    default:
      return <Gem {...props} />;
  }
}
