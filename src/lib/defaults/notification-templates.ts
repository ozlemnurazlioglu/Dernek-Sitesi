import type { NotificationTemplates } from "../types";

/**
 * Bildirim şablonları için varsayılan içerik. Admin paneli ilk açılışta bu
 * şablonları gösterir; düzenleyince DB'ye kaydolur ve buradaki değerler
 * fallback olarak kalır.
 *
 * Desteklenen placeholder'lar (renderTemplate fonksiyonunda işlenir):
 *   {fullName}        — başvuranın ad soyadı
 *   {applicationId}   — başvuru numarası (örn. 2026burs01)
 *   {associationName} — derneğin adı (site_settings.name)
 *   {reason}          — admin'in yazdığı opsiyonel red gerekçesi
 *   {updateRequest}   — admin'in needs_update için yazdığı not
 *   {applicationLink} — kullanıcının başvurusunu göreceği link (/hesabim)
 *   {year}            — şu anki yıl
 */
export const DEFAULT_NOTIFICATION_TEMPLATES: NotificationTemplates = {
  approved: {
    emailSubject: "Burs başvurunuz onaylandı — {associationName}",
    emailHtml: `<p>Sayın {fullName},</p>
<p>
  <strong>{applicationId}</strong> numaralı burs başvurunuz komisyonumuz
  tarafından <strong>onaylanmıştır</strong>. Tebrikler!
</p>
<p>
  Önümüzdeki dönem için detayları ve ödeme planını ilerleyen günlerde
  sizinle paylaşacağız. Üyelik panelinizden başvurunuzun durumunu her zaman
  takip edebilirsiniz: <a href="{applicationLink}">{applicationLink}</a>
</p>
<p>Saygılarımızla,<br/>{associationName}</p>`,
    sms: "Sn. {fullName}, {applicationId} numarali burs basvurunuz ONAYLANDI. Detaylar paneliniz uzerinden paylasilacaktir. {associationName}",
  },
  rejected: {
    emailSubject: "Burs başvurunuzun sonucu — {associationName}",
    emailHtml: `<p>Sayın {fullName},</p>
<p>
  <strong>{applicationId}</strong> numaralı burs başvurunuz değerlendirilmiş;
  ne yazık ki bu dönem için <strong>uygun bulunmamıştır</strong>.
</p>
<p><em>Gerekçe:</em> {reason}</p>
<p>
  Önümüzdeki dönemlerde tekrar başvuruda bulunabilirsiniz. Eğitim
  yolculuğunuzda başarılar dileriz.
</p>
<p>Saygılarımızla,<br/>{associationName}</p>`,
    sms: "Sn. {fullName}, {applicationId} numarali burs basvurunuz bu donem icin uygun gorulmedi. Detay: panel/eposta. {associationName}",
  },
  needsUpdate: {
    emailSubject: "Burs başvurunuzda güncelleme bekleniyor — {associationName}",
    emailHtml: `<p>Sayın {fullName},</p>
<p>
  <strong>{applicationId}</strong> numaralı başvurunuzu inceledik; komisyonumuz
  aşağıdaki bilgilerin güncellenmesini talep etmektedir:
</p>
<blockquote style="border-left:3px solid #d97706;padding:8px 16px;background:#fffbeb;color:#92400e;">
  {updateRequest}
</blockquote>
<p>
  Lütfen üye panelinizden başvurunuzu açıp ilgili alanları/belgeyi
  güncelledikten sonra kaydedin. Güncelleme sonrası başvurunuz otomatik
  olarak yeniden incelemeye alınacaktır.
</p>
<p>
  Panel adresiniz: <a href="{applicationLink}">{applicationLink}</a>
</p>
<p>Saygılarımızla,<br/>{associationName}</p>`,
    sms: "Sn. {fullName}, {applicationId} basvurunuzda guncelleme bekleniyor. Panele girip aciklamayi okuyup duzenleyiniz. {associationName}",
  },
};
