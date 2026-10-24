import type { SiteConfig } from "./types";

export interface TrustBadges {
  enamad: { code?: string; link?: string } | null;
  samandehi: { code?: string; link?: string; badgeImage?: string } | null;
}

const clean = (v: string | null | undefined) => v?.trim() || undefined;

/**
 * The footer's trust seals from the store's licence settings (Avval admin → مجوزها): each one
 * the merchant filled in and didn't switch off, else null. The older `settings.enamad` and
 * `organization.enamad` still count for Enamad.
 */
export function resolveTrustBadges(site: Pick<SiteConfig, "settings" | "organization"> | null): TrustBadges {
  const lic = site?.settings.licenses;
  const legacy = site?.settings.enamad ?? site?.organization?.enamad;

  const enamadCode = clean(lic?.enamad?.code) ?? clean(legacy?.code);
  const enamadLink = clean(lic?.enamad?.link) ?? clean(legacy?.link);
  const samandehi = lic?.samandehi;
  const samandehiCode = clean(samandehi?.code);
  const samandehiLink = clean(samandehi?.link);
  const samandehiImage = clean(samandehi?.badge_image);

  return {
    enamad:
      lic?.enamad?.enabled !== false && (enamadCode || enamadLink) ? { code: enamadCode, link: enamadLink } : null,
    samandehi:
      samandehi?.enabled !== false && (samandehiCode || samandehiLink || samandehiImage)
        ? { code: samandehiCode, link: samandehiLink, badgeImage: samandehiImage }
        : null,
  };
}
