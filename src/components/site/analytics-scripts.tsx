/**
 * Site genelinde takip ve reklam kodlarını render eden bileşen.
 *
 * Admin panelinden girilen ID'ler boşsa ilgili script hiç gönderilmez —
 * gereksiz network isteği oluşmaz, sayfa hızı etkilenmez.
 *
 * Bu bir server component'tir; tüm değerler ilk HTML response'da gömülür,
 * istemci tarafında veri akışı veya ek RPC gerekmez.
 *
 * Yapılan optimizasyonlar:
 * - GA4 ve Pixel için strategy="afterInteractive" — sayfa interactive olduktan
 *   sonra yüklenir, FCP/LCP'yi etkilemez.
 * - GTM için strategy="afterInteractive" + body başında noscript fallback.
 * - AdSense için strategy="afterInteractive" + crossorigin="anonymous".
 * - Custom HTML için server-side raw inject — herhangi bir runtime maliyeti yok.
 */
import Script from "next/script";
import type { SiteSettings } from "@/lib/types";

type Props = { settings: SiteSettings };

/**
 * Body kapanışından önce render edilir — tüm `next/script` tag'leri ve özel
 * takip HTML'i burada toplanır.
 */
export function AnalyticsScripts({ settings }: Props) {
  const {
    gaMeasurementId,
    gtmContainerId,
    metaPixelId,
    adsensePublisherId,
    customTrackingHtml,
  } = settings;

  return (
    <>
      {/* Google Analytics 4 — gtag.js */}
      {gaMeasurementId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaMeasurementId)}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', ${JSON.stringify(gaMeasurementId)});`}
          </Script>
        </>
      ) : null}

      {/* Google Tag Manager — head script (noscript fallback body başında) */}
      {gtmContainerId ? (
        <Script id="gtm-init" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer',${JSON.stringify(gtmContainerId)});`}
        </Script>
      ) : null}

      {/* Meta (Facebook) Pixel */}
      {metaPixelId ? (
        <Script id="meta-pixel-init" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', ${JSON.stringify(metaPixelId)});
fbq('track', 'PageView');`}
        </Script>
      ) : null}

      {/* Google AdSense — Auto Ads */}
      {adsensePublisherId ? (
        <Script
          id="adsense-auto-ads"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(adsensePublisherId)}`}
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
      ) : null}

      {/* Özel takip / reklam HTML — admin tarafından yapıştırılan raw HTML */}
      {customTrackingHtml ? (
        <div
          aria-hidden
          style={{ display: "contents" }}
          dangerouslySetInnerHTML={{ __html: customTrackingHtml }}
        />
      ) : null}
    </>
  );
}

/**
 * Body'nin EN BAŞINA konur — yalnızca GTM ve Meta Pixel için noscript
 * fallback'lerini içerir. JS kapalı tarayıcılarda bile takip çalışsın.
 */
export function AnalyticsNoscriptFallbacks({ settings }: Props) {
  const { gtmContainerId, metaPixelId } = settings;
  if (!gtmContainerId && !metaPixelId) return null;

  return (
    <>
      {gtmContainerId ? (
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(gtmContainerId)}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
      ) : null}
      {metaPixelId ? (
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${encodeURIComponent(metaPixelId)}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      ) : null}
    </>
  );
}
