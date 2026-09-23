import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/data";
import { CategoryIcon } from "@/components/product/category-icon";

export function ProductImage({
  image,
  alt = "",
  category,
  className,
  iconClassName,
}: {
  image?: string;
  alt?: string;
  category: Category;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-[#0a0a0d]",
        className,
      )}
    >
      {image ? (
        <Image
          src={image}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 380px, 50vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <>
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 120% at 20% 15%, rgba(232,35,47,.22), transparent 60%), linear-gradient(160deg, #151517, #000 75%)",
            }}
          />
          <CategoryIcon
            category={category}
            className={cn("relative text-white/15", iconClassName)}
            strokeWidth={1.25}
          />
        </>
      )}
    </div>
  );
}
