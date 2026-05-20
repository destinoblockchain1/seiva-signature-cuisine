export type Lang = "en" | "pt";

export const copy = {
  nav: {
    manifesto: { en: "Manifesto", pt: "Manifesto" },
    chefs: { en: "The Chefs", pt: "Os Chefs" },
    case: { en: "Case Study", pt: "Caso" },
    experiences: { en: "Experiences", pt: "Experiências" },
    inquire: { en: "Inquire", pt: "Contato" },
  },
  hero: {
    eyebrow: { en: "International Culinary Collective — Brazil · Italy · USA", pt: "Coletivo Culinário Internacional — Brasil · Itália · EUA" },
    headline: {
      en: "Signature Cuisine,\nTailor-Made.",
      pt: "Alta Gastronomia,\nSob Medida.",
    },
    sub: {
      en: "A horizontal collective of three chefs composing bespoke dinners and exclusive activations for iconic brands and private VIP hosts across three continents.",
      pt: "Um coletivo horizontal de três chefs que compõe jantares sob medida e ativações exclusivas para marcas icônicas e anfitriões VIP em três continentes.",
    },
    cta: { en: "Schedule a Private Consultation", pt: "Agendar uma Consulta Privada" },
  },
  manifesto: {
    eyebrow: { en: "The Manifesto", pt: "O Manifesto" },
    pull: {
      en: "Nature does not rush, yet everything is accomplished. We bring that exact harmony to the table.",
      pt: "A natureza não tem pressa, e ainda assim tudo se realiza. Levamos essa exata harmonia para a mesa.",
    },
    body: {
      en: [
        "In nature, seiva is the quiet, vital force that flows beneath the surface. It carries the purest essence of the earth upward, sustaining life, fueling growth, and transforming raw elements into something magnificent. We chose this name because it is exactly what we do.",
        "SEIVA is a horizontal, international collective of three chefs. We are three distinct culinary lifelines that have crossed borders, cultures and oceans to merge into a single, uncompromising vision. We bring the rigorous, time-honored discipline of the Piedmontese hills in Italy; the vibrant, soulful precision of the litorals and hills of Southern Brazil; and the sharp, high-performance execution honed in the culinary capitals of the United States.",
        "We are not a traditional catering company. We do not mass-produce, and we do not compromise. We are a chef-driven culinary house built exclusively for those who view a gathering not just as an event, but as an art form.",
        "For our private clients, we bring the intimacy of an authorial, Michelin-caliber restaurant directly into the sanctuary of your home. For our corporate partners, we translate your brand's prestige into a tailored sensory narrative — proving that we can execute with surgical, high-volume logistics for thousands without ever losing the delicate touch of a hand-placed micro-green.",
        "From exclusive wine-paired galas for iconic brands like BMW and La Roche-Posay to intimate milestone celebrations, we handle the pressure so you can inherit the peace.",
        "We respect the farmer. We honor the micro-season. We obsess over the temperature, the texture, the lineage of the wine, and the geometry of the plate. But above all, we respect the trust you place in our hands. When you sit at a SEIVA table, you are tasting a global journey, executed in flawless harmony.",
      ],
      pt: [
        "Na natureza, a seiva é a força silenciosa e vital que flui sob a superfície. Ela conduz a essência mais pura da terra para cima, sustentando a vida, alimentando o crescimento e transformando elementos brutos em algo magnífico. Escolhemos este nome porque é exatamente o que fazemos.",
        "SEIVA é um coletivo horizontal e internacional de três chefs. Somos três linhas culinárias distintas que cruzaram fronteiras, culturas e oceanos para se unirem em uma visão única e intransigente. Trazemos a disciplina rigorosa e atemporal das colinas do Piemonte, na Itália; a precisão vibrante e cheia de alma do litoral e das serras do Sul do Brasil; e a execução afiada e de alta performance forjada nas capitais culinárias dos Estados Unidos.",
        "Não somos uma empresa tradicional de catering. Não produzimos em massa e não fazemos concessões. Somos uma casa culinária conduzida pelos chefs, construída exclusivamente para quem enxerga um encontro não como um evento, mas como uma forma de arte.",
        "Para nossos clientes privados, levamos a intimidade de um restaurante autoral, em nível Michelin, diretamente para o santuário da sua casa. Para nossos parceiros corporativos, traduzimos o prestígio da sua marca em uma narrativa sensorial sob medida — provando que sabemos executar com logística cirúrgica e alto volume para milhares de convidados sem jamais perder o toque delicado de um microgreen colocado à mão.",
        "De jantares de gala harmonizados para marcas icônicas como BMW e La Roche-Posay até celebrações íntimas de marcos pessoais, assumimos a pressão para que você herde a serenidade.",
        "Respeitamos o produtor. Honramos a micro-estação. Somos obcecados pela temperatura, pela textura, pela linhagem do vinho e pela geometria do prato. Mas, acima de tudo, respeitamos a confiança depositada em nossas mãos. Quando você se senta a uma mesa SEIVA, está provando uma jornada global, executada em perfeita harmonia.",
      ],
    },
    signoff: { en: "SEIVA. Signature Cuisine, Tailor-Made.", pt: "SEIVA. Alta Gastronomia, Sob Medida." },
  },
  chefs: {
    eyebrow: { en: "The Collective", pt: "O Coletivo" },
    title: { en: "Three Lineages.\nOne Table.", pt: "Três Linhagens.\nUma Mesa." },
    intro: {
      en: "A strictly horizontal partnership. No single signature — a single, multiplied vision.",
      pt: "Uma parceria estritamente horizontal. Nenhuma assinatura individual — uma única visão, multiplicada.",
    },
    list: [
      {
        name: "Bernardo Simões",
        origin: { en: "Brazil / United States", pt: "Brasil / Estados Unidos" },
        photo: "/src/assets/chef-bernardo.png",
        bio: {
          en: "Forged in the high-performance kitchens of Boston, Bernardo served as Chef de Cuisine at Eataly Boston before bringing his expertise in culinary logistics and sustainable gastronomy into the collective. A Slow Food advocate, he ensures every SEIVA service moves with precision — from the source to the final plate.",
          pt: "Forjado nas cozinhas de alta performance de Boston, Bernardo foi Chef de Cuisine do Eataly Boston antes de trazer sua expertise em logística culinária e gastronomia sustentável para o coletivo. Defensor do Slow Food, garante que cada serviço SEIVA aconteça com precisão — da origem ao prato final.",
        },
      },
      {
        name: "Tobia Messa",
        origin: { en: "BRAZIL - FLORIANÓPOLIS", pt: "BRASIL - FLORIANÓPOLIS" },
        photo: "https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=900&h=1125&fit=crop&crop=faces",
        bio: {
          en: "Born in Piedmont and established in Rio de Janeiro, Tobia carries the discipline of classical Italian tradition with the pedigree of Terra Madre Turin. His work is a study in rigor — pasta, fire, fermentation and time — translated into contemporary tasting menus that honor lineage above trend.",
          pt: "Nascido no Piemonte e radicado no Rio de Janeiro, Tobia carrega a disciplina da tradição clássica italiana com o pedigree do Terra Madre de Turim. Seu trabalho é um estudo de rigor — massa, fogo, fermentação e tempo — traduzido em menus degustação contemporâneos que honram a linhagem acima da tendência.",
        },
      },
      {
        name: "Juliana Redoi",
        origin: { en: "Brazil — Florianópolis", pt: "Brasil — Florianópolis" },
        photo: "https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=900&h=1125&fit=crop&crop=faces",
        bio: {
          en: "Established in Florianópolis, Juliana is a specialist in artisanal, authorial gastronomy, devoted to local sourcing and seasonal freshness. Her cuisine pulls directly from the Atlantic, from small producers and from the micro-seasons of the south — translating place into plate with quiet precision.",
          pt: "Radicada em Florianópolis, Juliana é especialista em gastronomia autoral e artesanal, dedicada ao sourcing local e à frescura sazonal. Sua cozinha bebe diretamente do Atlântico, dos pequenos produtores e das micro-estações do Sul — traduzindo o lugar em prato com precisão silenciosa.",
        },
      },
    ],
  },
  caseStudy: {
    eyebrow: { en: "Case Study", pt: "Estudo de Caso" },
    title: { en: "Match Point Mansion\nRio Open", pt: "Match Point Mansion\nRio Open" },
    lede: {
      en: "An exclusive hospitality venue at the heart of the ATP Rio Open. SEIVA composed the entire culinary program — a study in operating at scale without forfeiting refinement.",
      pt: "Um espaço de hospitalidade exclusivo no coração do ATP Rio Open. A SEIVA assinou o programa culinário inteiro — uma demonstração de operar em escala sem abrir mão do requinte.",
    },
    stats: [
      { n: "3,500+", l: { en: "Meals served flawlessly", pt: "Refeições servidas com excelência" } },
      { n: "5", l: { en: "Course wine-paired galas", pt: "Etapas em jantares de gala harmonizados" } },
      { n: "2", l: { en: "Iconic brand activations — BMW & La Roche-Posay", pt: "Ativações de marcas icônicas — BMW & La Roche-Posay" } },
    ],
  },
  experiences: {
    eyebrow: { en: "The Experiences", pt: "As Experiências" },
    title: { en: "Three Pillars,\nOne Standard.", pt: "Três Pilares,\nUm Padrão." },
    items: [
      {
        n: "01",
        t: { en: "Private Dinner Experience", pt: "Jantar Privativo" },
        d: { en: "Bespoke multi-course tasting menus for luxury residences and VIP hosts — an authorial restaurant transposed into the sanctuary of your home.", pt: "Menus degustação sob medida para residências de luxo e anfitriões VIP — um restaurante autoral transposto para o santuário da sua casa." },
      },
      {
        n: "02",
        t: { en: "Luxury Brand Activations", pt: "Ativações de Marcas de Luxo" },
        d: { en: "Conceptual, high-end culinary experiences designed for elite corporate events and product launches — translating brand prestige into a sensory narrative.", pt: "Experiências culinárias conceituais e refinadas para eventos corporativos de elite e lançamentos — traduzindo o prestígio da marca em uma narrativa sensorial." },
      },
      {
        n: "03",
        t: { en: "Exclusive Celebrations", pt: "Celebrações Exclusivas" },
        d: { en: "Unforgettable, refined culinary narratives for boutique weddings and high-society milestones — composed with the intimacy of a private commission.", pt: "Narrativas culinárias refinadas e inesquecíveis para casamentos boutique e marcos da alta sociedade — compostas com a intimidade de uma encomenda privada." },
      },
    ],
  },
  inquire: {
    eyebrow: { en: "Inquiry & Discovery", pt: "Contato & Descoberta" },
    title: { en: "Begin the\nConversation.", pt: "Inicie a\nConversa." },
    sub: {
      en: "Each SEIVA engagement begins with a personal conversation. Share the contours of your vision and we will return within forty-eight hours.",
      pt: "Cada projeto SEIVA começa com uma conversa pessoal. Compartilhe os contornos da sua visão e retornaremos em até quarenta e oito horas.",
    },
    fields: {
      name: { en: "Full name", pt: "Nome completo" },
      company: { en: "Company or host", pt: "Empresa ou anfitrião" },
      email: { en: "Email", pt: "Email" },
      date: { en: "Event date", pt: "Data do evento" },
      location: { en: "Location", pt: "Localização" },
      locationOptions: { en: ["Brazil", "United States", "Other"], pt: ["Brasil", "Estados Unidos", "Outro"] },
      guests: { en: "Guest count", pt: "Número de convidados" },
      vision: { en: "Your vision for the event", pt: "Sua visão para o evento" },
    },
    submit: { en: "Submit the Brief", pt: "Enviar o Briefing" },
    success: { en: "Thank you. A member of our atelier will respond within forty-eight hours.", pt: "Obrigado. Um membro do nosso ateliê responderá em até quarenta e oito horas." },
  },
  footer: {
    tag: { en: "Signature Cuisine, Tailor-Made.", pt: "Alta Gastronomia, Sob Medida." },
    cities: { en: "Florianópolis · Rio de Janeiro · Boston", pt: "Florianópolis · Rio de Janeiro · Boston" },
    rights: { en: "All rights reserved.", pt: "Todos os direitos reservados." },
  },
};
