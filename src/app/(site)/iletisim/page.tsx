"use client";

import { useState, type FormEvent } from "react";
import { Mail, MapPin, Phone, Send, Clock } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { Container } from "@/components/ui/section";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { DEFAULT_COMMON_UI } from "@/lib/defaults/ui-common";
import type { CommonUiText, PageHeadersMap } from "@/lib/types";

export default function IletisimPage() {
  const { addMessage, siteSettings, pageBlocks } = useStore();
  const headers = (pageBlocks["page.headers"] as PageHeadersMap | undefined)
    ?.iletisim;
  const ui =
    (pageBlocks["ui.common"] as CommonUiText | undefined) ?? DEFAULT_COMMON_UI;
  const contactUi = { ...DEFAULT_COMMON_UI.contact, ...(ui.contact ?? {}) };
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setLoading(true);
    setTimeout(() => {
      addMessage({
        name: String(data.get("name") ?? ""),
        email: String(data.get("email") ?? ""),
        subject: String(data.get("subject") ?? ""),
        message: String(data.get("message") ?? ""),
      });
      toast({
        tone: "success",
        title: contactUi.successTitle,
        description: contactUi.successDescription,
      });
      form.reset();
      setLoading(false);
    }, 600);
  };

  return (
    <>
      <PageHeader
        title={headers?.title ?? "İletişim"}
        description={headers?.description ?? ""}
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "İletişim" },
        ]}
      />
      <Container className="py-14 grid md:grid-cols-12 gap-8">
        <div className="md:col-span-7">
          <div className="rounded-2xl border border-border bg-white p-7">
            <h2 className="text-2xl font-semibold text-brand-900">
              {contactUi.formTitle}
            </h2>
            <p className="text-muted-foreground mt-2">
              {contactUi.formDescription}
            </p>
            <form
              onSubmit={handleSubmit}
              className="mt-7 grid sm:grid-cols-2 gap-5"
            >
              <Field label="Ad Soyad" htmlFor="name" required>
                <Input id="name" name="name" required placeholder="Adınız Soyadınız" />
              </Field>
              <Field label="E-posta" htmlFor="email" required>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="ornek@eposta.com"
                />
              </Field>
              <Field label="Konu" htmlFor="subject" required>
                <Input
                  id="subject"
                  name="subject"
                  required
                  className="sm:col-span-2"
                  placeholder="Mesajınızın konusu"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Mesajınız" htmlFor="message" required>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    placeholder="Bize iletmek istediğiniz mesajı yazın..."
                  />
                </Field>
              </div>
              <div className="sm:col-span-2 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {contactUi.kvkkNote}
                </p>
                <Button
                  type="submit"
                  loading={loading}
                  rightIcon={<Send className="h-4 w-4" />}
                >
                  {contactUi.submitButton}
                </Button>
              </div>
            </form>
          </div>
        </div>

        <aside className="md:col-span-5 space-y-4">
          <div className="rounded-2xl border border-border bg-white p-6">
            <h3 className="text-sm font-semibold text-brand-900 uppercase tracking-wider">
              {contactUi.sidebarTitle}
            </h3>
            <ul className="mt-5 space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-md bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">Adres</div>
                  {siteSettings.contactAddress ? (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteSettings.contactAddress)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-900 mt-0.5 leading-relaxed block hover:text-brand-700 underline-offset-2 hover:underline"
                      title="Haritada aç"
                    >
                      {siteSettings.contactAddress}
                    </a>
                  ) : null}
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-md bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">Telefon</div>
                  {siteSettings.contactPhone ? (
                    <a
                      href={`tel:${siteSettings.contactPhone.replace(/\s+/g, "")}`}
                      className="text-brand-900 mt-0.5 block hover:text-brand-700 underline-offset-2 hover:underline"
                      title="Ara"
                    >
                      {siteSettings.contactPhone}
                    </a>
                  ) : null}
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-md bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">E-posta</div>
                  {siteSettings.contactEmail ? (
                    <a
                      href={`mailto:${siteSettings.contactEmail}`}
                      className="text-brand-900 mt-0.5 block break-all hover:text-brand-700 underline-offset-2 hover:underline"
                      title="E-posta gönder"
                    >
                      {siteSettings.contactEmail}
                    </a>
                  ) : null}
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-md bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Çalışma saatleri</div>
                  <div className="text-brand-900 mt-0.5">
                    {siteSettings.contactWorkingHours}
                  </div>
                </div>
              </li>
            </ul>
          </div>
          {siteSettings.mapEmbedUrl && (
            <div className="rounded-2xl overflow-hidden border border-border bg-muted h-64">
              <iframe
                src={siteSettings.mapEmbedUrl}
                className="w-full h-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Konum"
              />
            </div>
          )}
        </aside>
      </Container>
    </>
  );
}
