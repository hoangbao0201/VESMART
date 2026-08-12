const SITE_URL = "https://vesmart.vn";

export const SITE_CONFIG = {
  name: "VESMART",
  email: "vesmart98@gmail.com",
  phone: "0971183153",
  address: "634/24 Trưng Nữ Vương, phường Hòa Thuận Tây, Đà Nẵng",
  description: "Trung tâm sửa chữa robot hút bụi VESMART",
  facebook: "https://facebook.com/suachuarobothutbuidanang",
  tiktok: "https://tiktok.com/@vesmart98",
  zalo: "https://zalo.me/0971183153",
  mapsLink: "https://maps.app.goo.gl/i4ytMYC3rUJ8X1CQ8",
  mapsEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3834.3828530087208!2d108.20662828836059!3d16.045610647988134!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3142194a4da17273%3A0x90da618d63baeaf6!2zVkVTTUFSVCAtIFRydW5nIHTDom0gc-G7rWEgY2jhu69hIHJvYm90IGjDunQgYuG7pWkgdsOgIHRoaeG6v3QgYuG7iyBTbWFydCBIb21l!5e0!3m2!1svi!2s!4v1774927403558!5m2!1svi!2s",
  url: SITE_URL,
  logo: "/logo.png",
  icon: "/icon.png",
  theme: "light",
  language: "vi",
  currency: "VND",
  timezone: "Asia/Ho_Chi_Minh",
  themeColor: "#0f766e",
  sameAs: [
    "https://facebook.com/suachuarobothutbuidanang",
    "https://tiktok.com/@vesmart98",
    "https://zalo.me/0971183153",
  ],

  merchant: {
    shipping: {
      rateValueVnd: 0,
      destinationCountry: "VN",
      handlingDaysMin: 1,
      handlingDaysMax: 2,
      transitDaysMin: 2,
      transitDaysMax: 7,
    },
    returns: {
      applicableCountry: "VN",
      merchantReturnDays: 7,
      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
      returnMethod: "https://schema.org/ReturnByMail",
      returnFees: "https://schema.org/FreeReturn",
      policyPageUrl: SITE_URL,
    },
  },
} as const;

export type SiteConfig = typeof SITE_CONFIG;

/** Digits-only phone for tel: links. */
export function sitePhoneTelHref(phone = SITE_CONFIG.phone): string {
  const digits = phone.replace(/\D/g, "");
  return `tel:${digits}`;
}
