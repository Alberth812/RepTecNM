import { getHomeContent } from "@/payload/globals/get-home";
import { HeroCarousel } from "@/components/home/hero-carousel";
import {
  AfiliacionSection,
  ContactoSection,
  MisionVisionSection,
  NosotrosSection,
  QueHacemosSection,
  StatsSection,
  TestimoniosSection,
} from "@/components/home/home-sections";

import { ImportantNoticesModal } from "@/components/avisos/important-notices-modal";
import { queryActiveImportantNotices } from "@/payload/queries/avisos";

// Regenera la página cada 60s (ISR) en vez de pegarle a la base de datos en
// cada request. Súbelo, bájalo o quítalo (usa `export const dynamic =
// "force-dynamic"` en su lugar) según qué tan al instante necesites ver los
// cambios del CMS reflejados en producción.
export const revalidate = 60;

export default async function HomePage() {
  const [home, importantNotices] = await Promise.all([
    getHomeContent(),
    queryActiveImportantNotices(),
  ]);

  return (
    <div>
      <ImportantNoticesModal notices={importantNotices} />
      <HeroCarousel slides={home.hero.slides} />
      <StatsSection />
      <NosotrosSection {...home.nosotros} />
      <MisionVisionSection
        mision={home.mision}
        vision={home.vision}
      />
      <AfiliacionSection {...home.afiliacion} />
      <QueHacemosSection {...home.queHacemos} />
      <TestimoniosSection testimonios={home.testimonios} />
      <ContactoSection {...home.contacto} />
    </div>
  );
}
