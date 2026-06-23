import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState, useRef, useEffect, type FormEvent } from "react";
import { Toaster, toast } from "sonner";
import { Resend } from "resend";
import Autoplay from "embla-carousel-autoplay";

import chefsImg from "@/assets/chefs-collective.webp";
import matchpoint1 from "@/assets/matchpoint-1.jpg";
import matchpoint2 from "@/assets/matchpoint-2.jpg";
import matchpoint3 from "@/assets/matchpoint-3.jpg";
import matchpoint4 from "@/assets/matchpoint-4.jpg";
import matchpoint5 from "@/assets/matchpoint-5.jpg";
import matchpoint6 from "@/assets/matchpoint-6.jpg";
import matchpoint7 from "@/assets/matchpoint-7.jpg";

import img6589 from "@/assets/IMG_6589.webp";
import img6608 from "@/assets/IMG_6608.webp";
import img7088 from "@/assets/IMG_7088.webp";
import img7145 from "@/assets/IMG_7145.webp";
import img8396 from "@/assets/IMG_8396.webp";
import logoSeiva from "@/assets/logo seiva.webp";

import { copy, type Lang } from "@/lib/i18n";
import { Logo, TriadIcon } from "@/components/Logo";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "preload", as: "image", href: logoSeiva, fetchPriority: "high" }
    ],
    meta: [
      { title: "SEIVA | Luxury Private Chef & Bespoke Catering | South Florida & Brazil" },
      { name: "description", content: "SEIVA is an international culinary collective offering luxury catering, bespoke dining, and private chef services for private dining, brand activation catering, and luxury weddings." },
      { property: "og:title", content: "SEIVA | Signature Cuisine, Tailor-Made" },
      { property: "og:description", content: "Ultra-luxury catering and private chef services. Specializing in bespoke dining, brand activation catering, and luxury weddings." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://seivaculinary.com" },
      { property: "og:image", content: "https://seivaculinary.com/chefs-collective.jpg" }
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": ["LocalBusiness", "FoodService"],
          "name": "SEIVA Culinary Collective",
          "image": "https://seivaculinary.com/chefs-collective.jpg",
          "description": "SEIVA offers high-end luxury catering, bespoke dining, and private chef services. We specialize in exclusive private dining, luxury weddings, and brand activation catering.",
          "url": "https://seivaculinary.com",
          "priceRange": "$$$$",
          "servesCuisine": "Signature Cuisine, Tailor-Made",
          "areaServed": [
            { "@type": "City", "name": "Miami", "addressRegion": "FL", "addressCountry": "US" },
            { "@type": "City", "name": "Boca Raton", "addressRegion": "FL", "addressCountry": "US" },
            { "@type": "City", "name": "Delray Beach", "addressRegion": "FL", "addressCountry": "US" },
            { "@type": "City", "name": "West Palm Beach", "addressRegion": "FL", "addressCountry": "US" },
            { "@type": "City", "name": "Coral Springs", "addressRegion": "FL", "addressCountry": "US" },
            { "@type": "City", "name": "Rio de Janeiro", "addressRegion": "RJ", "addressCountry": "BR" },
            { "@type": "City", "name": "Florianópolis", "addressRegion": "SC", "addressCountry": "BR" },
            { "@type": "City", "name": "Balneário Camboriú", "addressRegion": "SC", "addressCountry": "BR" },
            { "@type": "City", "name": "Itajaí", "addressRegion": "SC", "addressCountry": "BR" }
          ]
        })
      }
    ]
  }),
});

function t<T extends { en: any; pt: any }>(obj: T, l: Lang) { return obj[l]; }

function Landing() {
  const [lang, setLang] = useState<Lang>("en");

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background">
      <Nav lang={lang} setLang={setLang} />
      <Hero lang={lang} />
      <Manifesto lang={lang} />
      <Chefs lang={lang} />
      <CaseStudy lang={lang} />
      <Experiences lang={lang} />
      <Inquire lang={lang} />
      <Footer lang={lang} />
    </main>
  );
}

function Nav({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const c = copy.nav;
  const link = (href: string, label: string) => (
    <a href={href} className="eyebrow text-muted-foreground transition-colors hover:text-foreground">{label}</a>
  );
  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 md:px-12">
        <a href="#top" className="flex items-center gap-3 text-foreground transition-opacity hover:opacity-80">
          <img src={logoSeiva} alt="SEIVA Logo" width="150" height="80" className="h-16 md:h-20 w-auto" />
        </a>
        <nav className="hidden items-center gap-10 md:flex">
          {link("#manifesto", t(c.manifesto, lang))}
          {link("#chefs", t(c.chefs, lang))}
          {link("#case", t(c.case, lang))}
          {link("#experiences", t(c.experiences, lang))}
          {link("#inquire", t(c.inquire, lang))}
        </nav>
        <div className="flex items-center gap-3 text-[0.7rem] tracking-[0.2em]">
          <button onClick={() => setLang("en")} className={lang === "en" ? "text-foreground font-medium" : "text-muted-foreground"}>EN</button>
          <span className="text-muted-foreground">/</span>
          <button onClick={() => setLang("pt")} className={lang === "pt" ? "text-foreground font-medium" : "text-muted-foreground"}>PT</button>
        </div>
      </div>
    </header>
  );
}

function Hero({ lang }: { lang: Lang }) {
  const c = copy.hero;
  const customHeadline = { en: "Signature Cuisine,\nTailor-Made.", pt: "Alta Gastronomia,\nSob Medida." };

  return (
    <section id="top" className="relative flex min-h-screen items-end overflow-hidden px-6 pb-24 pt-40 md:px-12 md:pb-32">
      <div aria-hidden className="pointer-events-none absolute -right-20 top-32 select-none font-serif text-[28rem] leading-none text-secondary md:text-[44rem] opacity-30">S</div>
      <div className="relative mx-auto w-full max-w-[1400px]">
        <p className="eyebrow text-muted-foreground">{t(c.eyebrow, lang)}</p>
        <h1 className="editorial-display mt-10 whitespace-pre-line text-[14vw] md:text-[9.5rem] leading-tight">
          {t(customHeadline, lang)}
        </h1>
        <div className="mt-4 md:mt-8 grid grid-cols-1 gap-8 md:grid-cols-12 items-center">
          <div className="md:col-span-5">
            <img src={logoSeiva} alt="SEIVA Logo" width="600" height="400" fetchPriority="high" decoding="sync" className="h-72 md:h-[24rem] max-h-[35vh] opacity-40 w-auto max-w-full object-contain object-left" />
          </div>
          <div className="md:col-span-5 md:col-start-7">
            <p className="text-base font-light leading-relaxed text-muted-foreground md:text-lg">
              {t(c.sub, lang)}
            </p>
            <a href="#inquire" className="eyebrow mt-10 inline-block border-b border-foreground pb-2 text-foreground transition-opacity hover:opacity-60">
              {t(c.cta, lang)} →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Manifesto({ lang }: { lang: Lang }) {
  const c = copy.manifesto;
  const bodyParagraphs = t(c.body, lang);
  return (
    <section id="manifesto" className="border-t border-border px-6 py-32 md:px-12 md:py-48 overflow-hidden">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-12 gap-8 md:gap-16 items-start">
          <div className="hidden md:flex col-span-3 flex-col gap-16 mt-20">
            <ScrollColoredImage src={img8396} alt="SEIVA Gastronomy - Raw Crudo Caviar Detail" width="600" height="800" aspectClass="aspect-[3/4] w-full" />
            <ScrollColoredImage src={img6589} alt="SEIVA Gastronomy - Seared Tuna Crudo Detail" width="600" height="800" aspectClass="aspect-[3/4] w-full" />
          </div>
          <div className="col-span-12 md:col-span-6">
            <p className="eyebrow text-muted-foreground mb-8">{t(c.eyebrow, lang)}</p>
            <p className="editorial-display text-3xl italic md:text-5xl leading-tight">"{t(c.pull, lang)}"</p>
            <div className="mt-16 space-y-6 text-base font-light leading-[1.8] text-foreground/85 md:text-lg">
              {bodyParagraphs.slice(0, 2).map((p: string, i: number) => <p key={i}>{p}</p>)}
            </div>
            <div className="my-14 overflow-hidden rounded-sm bg-neutral-950 border border-border/10 shadow-lg">
              <ScrollColoredImage src={img7088} alt="SEIVA Gastronomy - Cucumber Ribbon Presentation Detail" width="1200" height="750" aspectClass="aspect-[16/10] w-full" />
            </div>
            <div className="space-y-6 text-base font-light leading-[1.8] text-foreground/85 md:text-lg">
              {bodyParagraphs.slice(2).map((p: string, i: number) => <p key={i + 2}>{p}</p>)}
            </div>
            <p className="editorial-display mt-16 text-xl italic text-accent">{t(c.signoff, lang)}</p>
          </div>
          <div className="hidden md:flex col-span-3 flex-col gap-16 mt-36">
            <ScrollColoredImage src={img6608} alt="SEIVA Gastronomy - Elegant Seafood Plating Detail" width="600" height="800" aspectClass="aspect-[3/4] w-full" />
            <ScrollColoredImage src={img7145} alt="SEIVA Gastronomy - Finished Fine Plating Detail" width="600" height="800" aspectClass="aspect-[3/4] w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}

function ScrollColoredImage({ src, alt, width, height, aspectClass }: { src: string; alt: string; width: string; height: string; aspectClass: string }) {
  return (
    <div className="group relative overflow-hidden bg-neutral-950 border border-border/10 rounded-sm shadow-xl transition-all duration-700">
      <div className={aspectClass}>
        <img src={src} alt={alt} width={width} height={height} loading="lazy" className="h-full w-full object-cover" />
      </div>
    </div>
  );
}

// ... (Mantenha o resto dos seus componentes abaixo, apenas certifique-se de adicionar width e height em todas as tags <img>)
function Chefs({ lang }: { lang: Lang }) { return <section id="chefs"></section>; }
function CaseStudy({ lang }: { lang: Lang }) { return <section id="case"></section>; }
function CaseStudyGallery({ lang }: { lang: Lang }) { return null; }
function Experiences({ lang }: { lang: Lang }) { return <section id="experiences"></section>; }
function Inquire({ lang }: { lang: Lang }) { return <section id="inquire"></section>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return null; }
function Footer({ lang }: { lang: Lang }) { return <footer></footer>; }
```eof
