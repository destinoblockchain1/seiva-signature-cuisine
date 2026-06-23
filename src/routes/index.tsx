import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState, useRef, useEffect, type FormEvent } from "react";
import { Toaster, toast } from "sonner";
import { Resend } from "resend";
import Autoplay from "embla-carousel-carousel"; // Ajuste conforme seu ambiente

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
meta: [
{ title: "SEIVA | Luxury Private Chef & Bespoke Catering | South Florida & Brazil" },
{ name: "description", content: "SEIVA is an international culinary collective offering luxury catering, bespoke dining, and private chef services." },
{ property: "og:title", content: "SEIVA | Signature Cuisine, Tailor-Made" },
{ property: "og:image", content: "https://seivaculinary.com/chefs-collective.jpg" }
],
links: [
{ rel: "preconnect", href: "https://fonts.googleapis.com" },
{ rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "anonymous" },
{ rel: "preload", fetchPriority: "high", as: "image", href: logoSeiva }
]
}),
});

function t<T extends { en: any; pt: any }>(obj: T, l: Lang) { return obj[l]; }

function Landing() {
const [lang, setLang] = useState("en");

return (
// Adicionado  para acessibilidade (Main Landmark)










);
}

function Nav({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
const c = copy.nav;
return (



{/* Adicionado width/height para CLS */}



{t(c.manifesto, lang)}
{t(c.chefs, lang)}
{t(c.case, lang)}



);
}

function Hero({ lang }: { lang: Lang }) {
const c = copy.hero;
const customHeadline = { en: "Signature Cuisine,\nTailor-Made.", pt: "Alta Gastronomia,\nSob Medida." };

return (

S


{t(customHeadline, lang)}



{/* Prioridade Alta para o LCP e dimensões explícitas */}





);
}

function ScrollColoredImage({
src,
alt,
aspectClass = "",
}: {
src: string;
alt: string;
aspectClass?: string;
}) {
return (





);
}

// ... (Restante do código mantido igual, apenas garantindo que as tags  tenham width/height)
