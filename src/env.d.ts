/// <reference path="../.astro/types.d.ts" />
interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL?: string;
  readonly PUBLIC_WHATSAPP_URL?: string;
  readonly PUBLIC_GA4_ID?: string;
  readonly PUBLIC_GTM_ID?: string;
  readonly PUBLIC_META_PIXEL_ID?: string;
  readonly PUBLIC_REQUIRE_CONSENT?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
