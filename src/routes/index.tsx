// new html file
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState, useRef, useEffect, type FormEvent } from "react";
import { Toaster, toast } from "sonner";
import { Resend } from "resend";
import Autoplay from "embla-carousel-autoplay";

import chefsImg from "@/assets/chefs-collective.jpg";
import matchpoint1 from "@/assets/matchpoint-1.jpg";
import matchpoint2 from "@/assets/matchpoint-2.jpg";
import matchpoint3 from "@/assets/matchpoint-3.jpg";
import matchpoint4 from "@/assets/matchpoint-4.jpg";
import matchpoint5 from "@/assets/matchpoint-5.jpg";
import matchpoint6 from "@/assets/matchpoint-6.jpg";
import matchpoint7 from "@/assets/matchpoint-7.jpg";

import img6589 from "@/assets/IMG_6589.jpg";
import img6608 from "@/assets/IMG_6608.jpg";
import img7088 from "@/assets/IMG_7088.jpg";
import img7145 from "@/assets/IMG_7145.jpg";
import img8396 from "@/assets/IMG_8396.jpg";
import logoSeiva from "@/assets/logo seiva.webp";

import { copy, type Lang } from "@/lib/i18n";
import { Logo, TriadIcon } from "@/components/Logo";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "SEIVA | Luxury Private Chef & Bespoke Catering | South Florida & Brazil" },
      { name: "description", content: "SEIVA is an international culinary collective offering luxury catering, bespoke dining, and private chef services for private dining, brand activation catering, and luxury weddings." },
      { property: "og:title", content: "SEIVA | Signature Cuisine, Tailor-Made" },
      { property: "og:description", content: "Ultra-luxury catering and private chef services. Specializing in bespoke dining, brand activation catering, and luxury weddings." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://seivaculinary.com" },
      { property: "og:image", content: "https://seivaculinary.com/chefs-collective.jpg" }
    ],
    // Injeção segura de Schema JSON-LD no <head> com SEO Local e MML otimizado
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
    <div className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background">
      {/* O Schema JSON-LD foi movido com segurança para a definição da 'Route' no topo do arquivo */}
      <Nav lang={lang} setLang={setLang} />
      <Hero lang={lang} />
      <Manifesto lang={lang} />
      <Chefs lang={lang} />
      <CaseStudy lang={lang} />
      <Experiences lang={lang} />
      <Inquire lang={lang} />
      <Footer lang={lang} />
    </div>
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
          <img src={logoSeiva} alt="SEIVA Logo" className="h-16 md:h-20 w-auto" />
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
  
  const customHeadline = {
    en: "Signature Cuisine,\nTailor-Made.",
    pt: "Alta Gastronomia,\nSob Medida."
  };

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
            <img src={logoSeiva} alt="SEIVA Logo" className="h-72 md:h-[24rem] max-h-[35vh] opacity-40 w-auto max-w-full object-contain object-left" />
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
          
          {/* Left Lateral Column: Expanded to col-span-3 for a larger editorial layout representation */}
          <div className="hidden md:flex col-span-3 flex-col gap-16 mt-20">
            <ScrollColoredImage 
              src={img8396} 
              alt="SEIVA Gastronomy - Raw Crudo Caviar Detail" 
              aspectClass="aspect-[3/4] w-full" 
            />
            <ScrollColoredImage 
              src={img6589} 
              alt="SEIVA Gastronomy - Seared Tuna Crudo Detail" 
              aspectClass="aspect-[3/4] w-full" 
            />
          </div>
          
          {/* Center Column: Reduced from 8 to 6 to fit the larger side grid precisely (3 + 6 + 3 = 12) */}
          <div className="col-span-12 md:col-span-6">
            <p className="eyebrow text-muted-foreground mb-8">{t(c.eyebrow, lang)}</p>
            <p className="editorial-display text-3xl italic md:text-5xl leading-tight">
              "{t(c.pull, lang)}"
            </p>
            
            {/* Displaying first two paragraphs */}
            <div className="mt-16 space-y-6 text-base font-light leading-[1.8] text-foreground/85 md:text-lg">
              {bodyParagraphs.slice(0, 2).map((p: string, i: number) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {/* Content separating visual break */}
            <div className="my-14 overflow-hidden rounded-sm bg-neutral-950 border border-border/10 shadow-lg">
              <ScrollColoredImage 
                src={img7088} 
                alt="SEIVA Gastronomy - Cucumber Ribbon Presentation Detail" 
                aspectClass="aspect-[16/10] w-full" 
              />
            </div>

            {/* Displaying final four paragraphs */}
            <div className="space-y-6 text-base font-light leading-[1.8] text-foreground/85 md:text-lg">
              {bodyParagraphs.slice(2).map((p: string, i: number) => (
                <p key={i + 2}>{p}</p>
              ))}
            </div>
            
            <p className="editorial-display mt-16 text-xl italic text-accent">{t(c.signoff, lang)}</p>
          </div>

          {/* Right Lateral Column: Expanded to col-span-3 for a larger editorial layout representation */}
          <div className="hidden md:flex col-span-3 flex-col gap-16 mt-36">
            <ScrollColoredImage 
              src={img6608} 
              alt="SEIVA Gastronomy - Elegant Seafood Plating Detail" 
              aspectClass="aspect-[3/4] w-full" 
            />
            <ScrollColoredImage 
              src={img7145} 
              alt="SEIVA Gastronomy - Finished Fine Plating Detail" 
              aspectClass="aspect-[3/4] w-full" 
            />
          </div>

        </div>
      </div>
    </section>
  );
}

function ScrollColoredImage({
  src,
  alt,
  className = "",
  aspectClass = "",
  loading = "lazy",
  objectCover = true,
}: {
  src: string;
  alt: string;
  className?: string;
  aspectClass?: string;
  loading?: "lazy" | "eager";
  objectCover?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setInView(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      {
        threshold: 0.5,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [isMobile]);

  const active = isMobile ? inView : isHovered;

  return (
    <div 
      ref={containerRef} 
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
      className="group relative overflow-hidden bg-neutral-950 border border-border/10 rounded-sm shadow-xl transition-all duration-700"
    >
      <div className={aspectClass}>
        <img 
          src={src} 
          alt={alt} 
          loading={loading} 
          className={`transition-all duration-1000 ease-out transform ${objectCover ? "h-full w-full object-cover" : "h-auto w-full"} ${className}`} 
          style={{
            filter: active
              ? "grayscale(0%) sepia(0%) contrast(0.94) saturate(95%) brightness(1.0)"
              : "grayscale(100%) sepia(12%) contrast(1.04) saturate(70%) brightness(0.85)",
            transform: active ? "scale(1.04)" : "scale(1)"
          }}
        />
        <div 
          className="absolute inset-0 bg-neutral-900/10 mix-blend-multiply pointer-events-none transition-opacity duration-1000"
          style={{ opacity: active ? 0 : 1 }}
        />
      </div>
    </div>
  );
}

function Chefs({ lang }: { lang: Lang }) {
  const c = copy.chefs;
  return (
    <section id="chefs" className="border-t border-border bg-secondary/40 px-6 py-32 md:px-12 md:py-48">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-3">
            <p className="eyebrow text-muted-foreground">{t(c.eyebrow, lang)}</p>
          </div>
          <div className="col-span-12 md:col-span-9">
            <h2 className="editorial-display whitespace-pre-line text-5xl md:text-7xl leading-tight">{t(c.title, lang)}</h2>
            <p className="mt-8 max-w-xl text-base font-light leading-relaxed text-muted-foreground md:text-lg">{t(c.intro, lang)}</p>
          </div>
        </div>

        <figure className="mt-20">
          <ScrollColoredImage
            src={chefsImg}
            alt="The three chefs of SEIVA: Bernardo Simões, Juliana Redoi, Tobia Messa"
            className="block h-auto w-full"
            objectCover={false}
          />
          <figcaption className="eyebrow mt-4 text-muted-foreground">
            {lang === "en" ? "Left to right — Bernardo Simões, Juliana Redoi, Tobia Messa" : "Da esquerda à direita — Bernardo Simões, Juliana Redoi, Tobia Messa"}
          </figcaption>
        </figure>

        <div className="mt-20 grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-10">
          {c.list.map((chef) => (
            <article key={chef.name} className="border-t border-border pt-8">
              <ScrollColoredImage
                src={chef.photo}
                alt={chef.name}
                aspectClass="mb-8 aspect-[4/5] w-full bg-secondary"
                loading="lazy"
              />
              <p className="eyebrow text-muted-foreground my-0 min-h-[1.25rem]">{t(chef.origin, lang)}</p>
              <h3 className="editorial-display mt-4 text-3xl md:text-4xl">{chef.name}</h3>
              <p className="mt-6 text-sm font-light leading-[1.75] text-foreground/80 md:text-base">{t(chef.bio, lang)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CaseStudy({ lang }: { lang: Lang }) {
  const c = copy.caseStudy;
  return (
    <section id="case" className="border-t border-border px-6 py-32 md:px-12 md:py-48">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-3">
            <p className="eyebrow text-muted-foreground">{t(c.eyebrow, lang)}</p>
          </div>
          <div className="col-span-12 md:col-span-9">
            <h2 className="editorial-display whitespace-pre-line text-5xl md:text-7xl leading-tight">{t(c.title, lang)}</h2>
            <p className="mt-10 max-w-2xl text-base font-light leading-relaxed text-foreground/85 md:text-lg">{t(c.lede, lang)}</p>
          </div>
        </div>

        <div className="mt-24 grid grid-cols-1 divide-y divide-border border-y border-border md:grid-cols-3 md:divide-x md:divide-y-0">
          {c.stats.map((s) => (
            <div key={s.n} className="px-6 py-12 md:px-10 md:py-16">
              <p className="editorial-display text-6xl text-foreground md:text-8xl">{s.n}</p>
              <p className="mt-6 max-w-[18ch] text-sm font-light leading-snug text-muted-foreground">{t(s.l, lang)}</p>
            </div>
          ))}
        </div>

        <CaseStudyGallery lang={lang} />
      </div>
    </section>
  );
}

function CaseStudyGallery({ lang }: { lang: Lang }) {
  const images: Array<{ src: string; alt: string }> = [
    { src: matchpoint1, alt: "Match Point Mansion Rio Open — tablescape on court" },
    { src: matchpoint2, alt: "Match Point Mansion Rio Open — oyster amuse-bouche" },
    { src: matchpoint3, alt: "Match Point Mansion Rio Open — sesame-crusted tuna" },
    { src: matchpoint4, alt: "Match Point Mansion Rio Open — plated course with racquet" },
    { src: matchpoint5, alt: "Match Point Mansion Rio Open — candlelit court tablescape" },
    { src: matchpoint6, alt: "Match Point Mansion Rio Open — shrimp and tomato skewers" },
    { src: matchpoint7, alt: "Match Point Mansion Rio Open — tortellini service" },
  ];
  const autoplay = useRef(Autoplay({ delay: 3500, stopOnInteraction: false, stopOnMouseEnter: true }));
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setSelectedIndex(api.selectedScrollSnap());
    };

    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  return (
    <div className="mt-24">
      <p className="eyebrow text-muted-foreground">
        {lang === "en" ? "Gallery — Match Point Mansion, Rio Open" : "Galeria — Match Point Mansion, Rio Open"}
      </p>
      <Carousel
        setApi={setApi}
        opts={{ loop: true, align: "start" }}
        plugins={[autoplay.current]}
        className="mt-8 -mx-6 md:-mx-12"
      >
        <CarouselContent className="px-6 md:px-12">
          {images.map((img, i) => (
            <CarouselItem key={i} className="basis-[90%] md:basis-2/3 lg:basis-1/2">
              <figure className="group relative aspect-[3/4] w-full overflow-hidden bg-secondary">
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  className={`h-full w-full object-cover transition-all duration-700 ease-out transform ${
                    isMobile
                      ? i === selectedIndex
                        ? "grayscale-0 contrast-100 scale-105"
                        : "grayscale contrast-125"
                      : "grayscale contrast-125 group-hover:grayscale-0 group-hover:contrast-100 group-hover:scale-105"
                  }`}
                />
              </figure>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}

function Experiences({ lang }: { lang: Lang }) {
  const c = copy.experiences;
  return (
    <section id="experiences" className="border-t border-border bg-foreground px-6 py-32 text-background md:px-12 md:py-48 font-sans">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-3">
            <p className="eyebrow text-background/50">{t(c.eyebrow, lang)}</p>
          </div>
          <div className="col-span-12 md:col-span-9">
            <h2 className="editorial-display whitespace-pre-line text-5xl md:text-7xl leading-tight">{t(c.title, lang)}</h2>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-px bg-background/20 md:grid-cols-3">
          {c.items.map((item) => (
            <div key={item.n} className="bg-foreground p-10 md:p-12">
              <p className="editorial-display text-2xl text-background/40">{item.n}</p>
              <h3 className="editorial-display mt-8 text-3xl md:text-4xl">{t(item.t, lang)}</h3>
              <p className="mt-6 text-sm font-light leading-[1.8] text-background/70 md:text-base">{t(item.d, lang)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const sendInquiryEmail = createServerFn({ method: "POST" })
  .inputValidator((data: {
    name: string;
    company: string;
    email: string;
    date: string;
    location: string;
    guests: string;
    vision: string;
  }) => data)
  .handler(async ({ data }) => {
    const resendApiKey = process.env.RESEND || process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error("Resend API Key is missing!");
      throw new Error("Resend API Key is not configured on the server.");
    }

    const toEmail = process.env.NOTIFICATION_EMAIL || "seivaculinary@gmail.com";
    const fromEmail = process.env.SENDER_EMAIL || "onboarding@resend.dev";

    const htmlContent = `
      <h2>Novo Inquiry de SEIVA</h2>
      <p><strong>Nome Completo:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Empresa / Anfitrião:</strong> ${data.company || "Não informado"}</p>
      <p><strong>Data do Evento:</strong> ${data.date || "Não informada"}</p>
      <p><strong>Localização:</strong> ${data.location || "Não informada"}</p>
      <p><strong>Número de Convidados:</strong> ${data.guests || "Não informado"}</p>
      <br />
      <p><strong>Visão / Mensagem:</strong></p>
      <p style="white-space: pre-wrap; font-family: sans-serif; background-color: #f9f9f9; padding: 15px; border-radius: 4px; border-left: 4px solid #ccc;">${data.vision || "Não informada"}</p>
    `;

    const resend = new Resend(resendApiKey);

    const { data: resData, error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: `Novo Inquiry de ${data.name}`,
      html: htmlContent,
    });

    if (error) {
      console.error("Resend SDK Error:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return { success: true };
  });

function Inquire({ lang }: { lang: Lang }) {
  const c = copy.inquire;
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      company: formData.get("company") as string,
      email: formData.get("email") as string,
      date: formData.get("date") as string,
      location: formData.get("location") as string,
      guests: formData.get("guests") as string,
      vision: formData.get("vision") as string,
    };

    if (!data.name || !data.email) {
      const msg = lang === "pt" ? "Por favor, preencha todos os campos obrigatórios." : "Please fill in all required fields.";
      setError(msg);
      toast.error(msg);
      setSubmitting(false);
      return;
    }

    try {
      const res = await sendInquiryEmail({ data });
      if (res && res.success) {
        setSubmitted(true);
        toast.success(
          lang === "pt"
            ? "Formulário enviado com sucesso!"
            : "Form submitted successfully!"
        );
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err: any) {
      console.error("Error sending inquiry:", err);
      const errMsg = lang === "pt"
        ? "Erro ao enviar o formulário. Por favor, tente novamente."
        : "An error occurred while sending the form. Please try again.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full border-0 border-b border-border bg-transparent py-4 text-base font-light text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none focus:ring-0";

  return (
    <section id="inquire" className="border-t border-border px-6 py-32 md:px-12 md:py-48">
      <Toaster position="top-right" richColors />
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-3">
            <p className="eyebrow text-muted-foreground">{t(c.eyebrow, lang)}</p>
          </div>
          <div className="col-span-12 md:col-span-9">
            <h2 className="editorial-display whitespace-pre-line text-5xl md:text-7xl leading-tight">{t(c.title, lang)}</h2>
            <p className="mt-10 max-w-2xl text-base font-light leading-relaxed text-muted-foreground md:text-lg">{t(c.sub, lang)}</p>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-9 md:col-start-4">
            {submitted ? (
              <p className="editorial-display max-w-xl text-2xl italic text-foreground md:text-3xl">
                {t(c.success, lang)}
              </p>
            ) : (
              <form onSubmit={onSubmit} className="grid grid-cols-1 gap-x-10 gap-y-2 md:grid-cols-2">
                <Field label={t(c.fields.name, lang)}><input required name="name" type="text" className={inputCls} /></Field>
                <Field label={t(c.fields.company, lang)}><input name="company" type="text" className={inputCls} /></Field>
                <Field label={t(c.fields.email, lang)}><input required name="email" type="email" className={inputCls} /></Field>
                <Field label={t(c.fields.date, lang)}><input name="date" type="date" className={inputCls} /></Field>
                <Field label={t(c.fields.location, lang)}>
                  <select name="location" className={inputCls} defaultValue="">
                    <option value="" disabled>—</option>
                    {t(c.fields.locationOptions, lang).map((o: string) => <option key={o}>{o}</option>)}
                  </select>
                </Field>
                <Field label={t(c.fields.guests, lang)}><input name="guests" type="number" min={1} className={inputCls} /></Field>
                <div className="md:col-span-2">
                  <Field label={t(c.fields.vision, lang)}>
                    <textarea name="vision" rows={5} className={inputCls + " resize-none"} />
                  </Field>
                </div>
                {error && (
                  <div className="mt-4 md:col-span-2 text-red-500 text-sm">
                    {error}
                  </div>
                )}
                <div className="mt-10 md:col-span-2">
                  <button type="submit" disabled={submitting} className="eyebrow border-b border-foreground pb-2 text-foreground transition-opacity hover:opacity-60 disabled:opacity-40">
                    {submitting ? (lang === "pt" ? "Enviando..." : "Sending...") : (t(c.submit, lang) + " →")}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block pt-8">
      <span className="eyebrow text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Footer({ lang }: { lang: Lang }) {
  const c = copy.footer;
  return (
    <footer className="border-t border-border px-6 py-16 md:px-12 bg-neutral-950">
      <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-8 md:flex-row md:items-center">
        <div>
          <Logo
            size="md"
            align="start"
            subtext={lang === "pt" ? "SEIVA • COZINHA AUTORAL" : "SEIVA • SIGNATURE CUISINE"}
          />
          <p className="eyebrow mt-4 text-muted-foreground">{t(c.tag, lang)}</p>
        </div>
        <div className="text-right">
          <p className="eyebrow text-muted-foreground">{t(c.cities, lang)}</p>
          <p className="eyebrow mt-3 text-muted-foreground">© {new Date().getFullYear()} SEIVA · {t(c.rights, lang)}</p>
        </div>
      </div>
    </footer>
  );
}
