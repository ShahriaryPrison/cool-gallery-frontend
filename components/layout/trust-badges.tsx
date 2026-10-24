/* eslint-disable @next/next/no-img-element -- the seals must be the issuers' own live images */
import type { TrustBadges as Badges } from "@/lib/licenses";

/** The `id` (and Enamad's `Code`) query params of a seal link, or {} for a malformed one. */
function sealParams(link: string | undefined): { id?: string; code?: string } {
  if (!link) return {};
  try {
    const url = new URL(link);
    return {
      id: url.searchParams.get("id") ?? undefined,
      code: url.searchParams.get("Code") ?? url.searchParams.get("code") ?? undefined,
    };
  } catch {
    return {};
  }
}

/**
 * Enamad's own trust-seal embed: Shaparak and the banks check for the seal image itself
 * (loaded with an `origin` referrer) when approving a gateway, not just a link to it.
 */
function EnamadSeal({ code, link }: NonNullable<Badges["enamad"]>) {
  const params = sealParams(link);
  const id = params.id ?? code;
  const href = link ?? `https://trustseal.enamad.ir/?id=${encodeURIComponent(id ?? "")}`;
  const src = `https://trustseal.enamad.ir/logo.aspx?id=${encodeURIComponent(id ?? "")}${
    params.code ? `&Code=${encodeURIComponent(params.code)}` : ""
  }`;
  const sealCode = params.code ?? code;

  return (
    <a href={href} target="_blank" rel="noopener" referrerPolicy="origin" title="نماد اعتماد الکترونیکی (اینماد)">
      <img
        referrerPolicy="origin"
        src={src}
        alt="نماد اعتماد الکترونیکی (اینماد)"
        width={64}
        height={64}
        className="size-16 object-contain"
        {...(sealCode ? ({ code: sealCode } as React.ImgHTMLAttributes<HTMLImageElement>) : {})}
      />
    </a>
  );
}

function SamandehiSeal({ code, link, badgeImage }: NonNullable<Badges["samandehi"]>) {
  const id = code ?? sealParams(link).id;
  const href = link ?? (id ? `https://logo.samandehi.ir/Verify.aspx?id=${encodeURIComponent(id)}` : "https://samandehi.ir");
  const src = badgeImage ?? (id ? `https://logo.samandehi.ir/logo.aspx?id=${encodeURIComponent(id)}` : null);
  if (!src) return null;

  return (
    <a href={href} target="_blank" rel="noopener" referrerPolicy="origin" title="نشان ملی ثبت رسانه‌های دیجیتال (ساماندهی)">
      <img
        referrerPolicy="origin"
        src={src}
        alt="نشان ملی ثبت رسانه‌های دیجیتال (ساماندهی)"
        width={64}
        height={64}
        className="size-16 object-contain"
      />
    </a>
  );
}

/** The store's Enamad / Samandehi seals on white tiles (the seals are drawn for a light page). */
export function TrustBadges({ badges }: { badges: Badges }) {
  if (!badges.enamad && !badges.samandehi) return null;

  return (
    <div className="flex flex-wrap items-center gap-2.5" aria-label="مجوزها و نمادهای اعتماد">
      {badges.enamad && (
        <div className="rounded-2xl bg-white p-1.5 transition hover:opacity-85">
          <EnamadSeal {...badges.enamad} />
        </div>
      )}
      {badges.samandehi && (
        <div className="rounded-2xl bg-white p-1.5 transition hover:opacity-85">
          <SamandehiSeal {...badges.samandehi} />
        </div>
      )}
    </div>
  );
}
