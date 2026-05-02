import { PageHeader } from "@/components/site/page-header";
import { Container } from "@/components/ui/section";
import { ApplicationForm } from "@/components/burs/application-form";

export const metadata = { title: "Burs Başvurusu" };

export default function BursBasvuruPage() {
  return (
    <>
      <PageHeader
        title="Burs Başvurusu"
        description="Lütfen tüm adımları eksiksiz doldurun. Yıldız (*) işaretli alanlar zorunludur."
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Burs", href: "/burs" },
          { label: "Başvuru" },
        ]}
      />
      <Container className="py-12">
        <ApplicationForm />
      </Container>
    </>
  );
}
