import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import chefsImg from "@/assets/chefs-collective.jpg";
import { copy, type Lang } from "@/lib/i18n";
import { Logo, TriadIcon } from "@/components/Logo";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "SEIVA — Signature Cuisine, Tailor-Made" },
      { name: "description", content: "An international collective of three chefs. Private dinners, brand activations and exclusive celebrations across Brazil, Italy and the USA." },
      { property: "og:title", content: "SEIVA — Signature Cuisine, Tailor-Made" },
      { property: "og:description", content: "A horizontal collective of three chefs crafting bespoke culinary experiences for iconic brands and VIP hosts." },
    ],
  }),
});

function t<T extends { en: any; pt: any }>(obj: T, l: Lang) { return obj[l]; }

function Landing() {
  const [lang, setLang] = useState<Lang>("en");
  const c = copy;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background">
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
        <a href="#top" className="flex items-center gap-3 text-foreground">
          <TriadIcon size={20} />
          <span className="font-serif text-xl tracking-[0.5em] leading-none">SEIVA</span>
        </a>
        <nav className="hidden items-center gap-10 md:flex">
          {link("#manifesto", t(c.manifesto, lang))}
          {link("#chefs", t(c.chefs, lang))}
          {link("#case", t(c.case, lang))}
          {link("#experiences", t(c.experiences, lang))}
          {link("#inquire", t(c.inquire, lang))}
        </nav>
        <div className="flex items-center gap-3 text-[0.7rem] tracking-[0.2em]">
          <button onClick={() => setLang("en")} className={lang === "en" ? "text-foreground" : "text-muted-foreground"}>EN</button>
          <span className="text-muted-foreground">/</span>
          <button onClick={() => setLang("pt")} className={lang === "pt" ? "text-foreground" : "text-muted-foreground"}>PT</button>
        </div>
      </div>
    </header>
  );
}

function Hero({ lang }: { lang: Lang }) {
  const c = copy.hero;
  return (
    <section id="top" className="relative flex min-h-screen items-end overflow-hidden px-6 pb-24 pt-40 md:px-12 md:pb-32">
      {/* Decorative serif glyph */}
      <div aria-hidden className="pointer-events-none absolute -right-20 top-32 select-none editorial-display text-[28rem] leading-none text-secondary md:text-[44rem]">S</div>
      <div className="relative mx-auto w-full max-w-[1400px]">
        <p className="eyebrow text-muted-foreground">{t(c.eyebrow, lang)}</p>
        <h1 className="editorial-display mt-10 whitespace-pre-line text-[14vw] md:text-[9.5rem]">
          {t(c.headline, lang)}
        </h1>
        <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-12">
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
  return (
    <section id="manifesto" className="border-t border-border px-6 py-32 md:px-12 md:py-48">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-3">
            <p className="eyebrow text-muted-foreground">{t(c.eyebrow, lang)}</p>
          </div>
          <div className="col-span-12 md:col-span-9">
            <p className="editorial-display text-3xl italic md:text-5xl">
              "{t(c.pull, lang)}"
            </p>
            <div className="mt-16 max-w-3xl space-y-6 text-base font-light leading-[1.8] text-foreground/85 md:text-lg">
              {t(c.body, lang).map((p: string, i: number) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <p className="editorial-display mt-16 text-xl italic text-accent">{t(c.signoff, lang)}</p>
          </div>
        </div>
      </div>
    </section>
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
            <h2 className="editorial-display whitespace-pre-line text-5xl md:text-7xl">{t(c.title, lang)}</h2>
            <p className="mt-8 max-w-xl text-base font-light leading-relaxed text-muted-foreground md:text-lg">{t(c.intro, lang)}</p>
          </div>
        </div>

        <figure className="mt-20">
          <div className="relative">
            <img
              src={chefsImg}
              alt="The three chefs of SEIVA: Bernardo Simões, Juliana Redoi, Tobia Messa"
              className="block h-auto w-full"
            />
          </div>
          <figcaption className="eyebrow mt-4 text-muted-foreground">
            {lang === "en" ? "Left to right — Bernardo Simões, Juliana Redoi, Tobia Messa" : "Da esquerda à direita — Bernardo Simões, Juliana Redoi, Tobia Messa"}
          </figcaption>
        </figure>

        <div className="mt-20 grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-10">
          {c.list.map((chef) => (
            <article key={chef.name} className="border-t border-border pt-8">
              <div className="group relative mb-8 aspect-[4/5] w-full overflow-hidden bg-secondary">
                <img
                  src={chef.photo}
                  alt={chef.name}
                  loading="lazy"
                  className="h-full w-full object-cover grayscale contrast-125 transition-all duration-1000 ease-in-out transform group-hover:grayscale-0 group-hover:contrast-100 group-hover:scale-105"
                />
              </div>
              <p className="eyebrow text-muted-foreground">{t(chef.origin, lang)}</p>
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
            <h2 className="editorial-display whitespace-pre-line text-5xl md:text-7xl">{t(c.title, lang)}</h2>
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
      </div>
    </section>
  );
}

function Experiences({ lang }: { lang: Lang }) {
  const c = copy.experiences;
  return (
    <section id="experiences" className="border-t border-border bg-foreground px-6 py-32 text-background md:px-12 md:py-48">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-3">
            <p className="eyebrow text-background/50">{t(c.eyebrow, lang)}</p>
          </div>
          <div className="col-span-12 md:col-span-9">
            <h2 className="editorial-display whitespace-pre-line text-5xl md:text-7xl">{t(c.title, lang)}</h2>
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

function Inquire({ lang }: { lang: Lang }) {
  const c = copy.inquire;
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const inputCls = "w-full border-0 border-b border-border bg-transparent py-4 text-base font-light text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none focus:ring-0";

  return (
    <section id="inquire" className="border-t border-border px-6 py-32 md:px-12 md:py-48">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-3">
            <p className="eyebrow text-muted-foreground">{t(c.eyebrow, lang)}</p>
          </div>
          <div className="col-span-12 md:col-span-9">
            <h2 className="editorial-display whitespace-pre-line text-5xl md:text-7xl">{t(c.title, lang)}</h2>
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
                <Field label={t(c.fields.name, lang)}><input required type="text" className={inputCls} /></Field>
                <Field label={t(c.fields.company, lang)}><input type="text" className={inputCls} /></Field>
                <Field label={t(c.fields.email, lang)}><input required type="email" className={inputCls} /></Field>
                <Field label={t(c.fields.date, lang)}><input type="date" className={inputCls} /></Field>
                <Field label={t(c.fields.location, lang)}>
                  <select className={inputCls} defaultValue="">
                    <option value="" disabled>—</option>
                    {t(c.fields.locationOptions, lang).map((o: string) => <option key={o}>{o}</option>)}
                  </select>
                </Field>
                <Field label={t(c.fields.guests, lang)}><input type="number" min={1} className={inputCls} /></Field>
                <div className="md:col-span-2">
                  <Field label={t(c.fields.vision, lang)}>
                    <textarea rows={5} className={inputCls + " resize-none"} />
                  </Field>
                </div>
                <div className="mt-10 md:col-span-2">
                  <button type="submit" className="eyebrow border-b border-foreground pb-2 text-foreground transition-opacity hover:opacity-60">
                    {t(c.submit, lang)} →
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
    <footer className="border-t border-border px-6 py-16 md:px-12">
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
