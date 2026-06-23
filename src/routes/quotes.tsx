import { createFileRoute } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  FileText,
  Loader2,
  LogOut,
  Plus,
  Printer,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast, Toaster } from "sonner";

import { Logo, TriadIcon } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/quotes")({
  component: ProposalsPage,
  head: () => ({
    meta: [
      { title: "Criar Orçamento | SEIVA Admin" },
      { name: "description", content: "SEIVA proposal builder with live preview" },
    ],
  }),
});

type Lang = "ENG" | "POR" | "ITA";

type SubItem = {
  id: string;
  name: string;
  desc: string;
  hasPrice: boolean;
  qty: number;
  rate: number;
};

type LineItem = {
  id: string;
  name: string;
  desc: string;
  hasPrice: boolean;
  qty: number;
  rate: number;
  subItems: SubItem[];
};

type ProposalDraft = {
  language: Lang;
  proposalReference: string;
  issueDate: string;
  validUntil: string;
  clientName: string;
  clientOrganization: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  guestAttendance: string;
  menuFormat: string;
  conceptStatement: string;
  presenterName: string;
  presenterTitle: string;
  items: LineItem[];
};

type ProposalRow = {
  id: string;
  created_at: string;
  updated_at: string;
  proposal_number?: number;
  proposal_reference: string;
  issue_date: string;
  language: Lang;
  valid_until: string | null;
  client_name: string | null;
  client_organization: string | null;
  event_name: string | null;
  event_date: string | null;
  event_location: string | null;
  guest_attendance: string | null;
  menu_format: string | null;
  concept_statement: string | null;
  presenter_name: string | null;
  presenter_title: string | null;
  items: unknown;
};

const db = supabase as any;

const INPUT_CLASS =
  "w-full border border-background/15 bg-background/10 px-3 py-2 text-sm text-background outline-none transition placeholder:text-background/40 focus:border-[#C5A880] disabled:cursor-not-allowed disabled:opacity-70";

const MONTHS: Record<Lang, string[]> = {
  ENG: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  POR: [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ],
  ITA: [
    "Gennaio",
    "Febbraio",
    "Marzo",
    "Aprile",
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Ottobre",
    "Novembre",
    "Dicembre",
  ],
};

const LABELS: Record<
  Lang,
  {
    sidebarTitle: string;
    docInfo: string;
    clientInfo: string;
    eventParams: string;
    concept: string;
    lineItems: string;
    signature: string;
    addItem: string;
    titleMain: string;
    preparedFor: string;
    issueDate: string;
    validUntil: string;
    event: string;
    eventDate: string;
    location: string;
    guests: string;
    format: string;
    conceptLabel: string;
    investment: string;
    desc: string;
    qty: string;
    rate: string;
    total: string;
    subtotal: string;
    taxes: string;
    totalPerGuest: string;
    totalInvestment: string;
    nextSteps: string;
    nextStepsText: string;
    approve: string;
    paymentMsg: string;
    collective: string;
    footerTagline: string;
    footerLocations: string;
    placeholderName: string;
    placeholderDesc: string;
  }
> = {
  ENG: {
    sidebarTitle: "Configure Details",
    docInfo: "Document Info",
    clientInfo: "Client Information",
    eventParams: "Event Parameters",
    concept: "Creative Concept Narrative",
    lineItems: "Line Items & Menu",
    signature: "Signature",
    addItem: "+ Add Item",
    titleMain: "Proposal",
    preparedFor: "Prepared For",
    issueDate: "Date of Issue",
    validUntil: "Valid Until",
    event: "The Event",
    eventDate: "Event Date",
    location: "Location",
    guests: "Guests",
    format: "Format",
    conceptLabel: "The Concept",
    investment: "Investment Breakdown",
    desc: "Description",
    qty: "Qty",
    rate: "Rate",
    total: "Total",
    subtotal: "Subtotal",
    taxes: "Taxes & Fees (7%)",
    totalPerGuest: "Total per Guest",
    totalInvestment: "Total Investment",
    nextSteps: "Next Steps",
    nextStepsText:
      "To secure this date and commission the collective, a 50% retainer is required. The remaining balance is due 7 days prior to execution. Upon approval, we will arrange a final tasting and site walkthrough.",
    approve: "Approve & Secure Date",
    paymentMsg:
      "In a live production environment, this triggers secure payment checkout flows (Stripe / Bank Wire) to collect the 50% retainer fee.",
    collective: "SEIVA Collective",
    footerTagline: "SEIVA - Signature Cuisine, Tailor-Made.",
    footerLocations: "Florida · Rio de Janeiro · Santa Catarina",
    placeholderName: "New Premium Culinary Package",
    placeholderDesc: "Enter package scope or structural details here.",
  },
  POR: {
    sidebarTitle: "Configurar Detalhes",
    docInfo: "Informações do Documento",
    clientInfo: "Informações do Cliente",
    eventParams: "Parâmetros do Evento",
    concept: "Narrativa Conceitual",
    lineItems: "Itens de Orçamento",
    signature: "Assinatura Executiva",
    addItem: "+ Adicionar Item",
    titleMain: "Proposta",
    preparedFor: "Preparado Para",
    issueDate: "Data de Emissão",
    validUntil: "Válido Até",
    event: "O Evento",
    eventDate: "Data do Evento",
    location: "Localização",
    guests: "Convidados",
    format: "Formato",
    conceptLabel: "O Conceito",
    investment: "Detalhamento de Investimento",
    desc: "Descrição",
    qty: "Qtd",
    rate: "Tarifa",
    total: "Total",
    subtotal: "Subtotal",
    taxes: "Impostos & Taxas (7%)",
    totalPerGuest: "Total por Convidado",
    totalInvestment: "Investimento Total",
    nextSteps: "Próximos Passos",
    nextStepsText:
      "Para reservar esta data e comissionar o coletivo, é necessário um sinal de 50%. O saldo remanescente deve ser pago até 7 dias antes do evento. Após confirmação, iniciaremos visitas técnicas de arquitetura de mesa.",
    approve: "Aprovar & Confirmar Data",
    paymentMsg:
      "Em ambiente de produção, este botão iniciaria o checkout seguro via Stripe ou transferência bancária internacional para coletar o sinal de 50%.",
    collective: "Coletivo SEIVA",
    footerTagline: "SEIVA - Alta Gastronomia Sob Medida.",
    footerLocations: "Flórida · Rio de Janeiro · Santa Catarina",
    placeholderName: "Nova Experiência Culinária",
    placeholderDesc: "Descreva os pratos ou arranjos logísticos adicionais aqui.",
  },
  ITA: {
    sidebarTitle: "Configura Dettagli",
    docInfo: "Informazioni Documento",
    clientInfo: "Informazioni Cliente",
    eventParams: "Parametri Evento",
    concept: "Visione Concettuale",
    lineItems: "Voci di Spesa",
    signature: "Firma Autorizzata",
    addItem: "+ Aggiungi Voce",
    titleMain: "Proposta",
    preparedFor: "Preparato Per",
    issueDate: "Data di Emissione",
    validUntil: "Valido Fino Al",
    event: "L'Evento",
    eventDate: "Data Evento",
    location: "Luogo dell'Evento",
    guests: "Ospiti",
    format: "Formato",
    conceptLabel: "Il Concetto",
    investment: "Dettaglio dell'Investimento",
    desc: "Descrizione",
    qty: "Qtà",
    rate: "Tariffa",
    total: "Totale",
    subtotal: "Totale Parziale",
    taxes: "Tasse & Commissioni (7%)",
    totalPerGuest: "Totale per Ospite",
    totalInvestment: "Investimento Total",
    nextSteps: "Prossimi Passi",
    nextStepsText:
      "Per confermare la data e prenotare il collettivo, è richiesto un acconto del 50%. Il saldo rimanente deve essere versato entro 7 giorni dall'evento. Dopo l'approvazione, programmeremo un sopralluogo tecnico della location.",
    approve: "Approva & Blocca la Data",
    paymentMsg:
      "In un ambiente reale, questo attiverebbe il gateway di pagamento (Stripe) per raccogliere l'acconto del 50%.",
    collective: "Collettivo SEIVA",
    footerTagline: "SEIVA - Cucina d'Autore, Su Misura.",
    footerLocations: "Florida · Rio de Janeiro · Santa Catarina",
    placeholderName: "Nuovo Pacchetto Culinario",
    placeholderDesc: "Inserisci dettagli per questo servizio.",
  },
};

const MOCKS: Record<
  Lang,
  Omit<ProposalDraft, "language" | "proposalReference" | "issueDate" | "validUntil">
> = {
  ENG: {
    clientName: "Mr. Alexander Sterling",
    clientOrganization: "Sterling Global Holdings",
    eventName: "Private Executive Gala",
    eventDate: "August 14, 2026",
    eventLocation: "Miami Beach Estate",
    guestAttendance: "45 guests",
    menuFormat: "Bespoke Multi-Course Experience",
    conceptStatement:
      "A seamless, high-ticket culinary narrative engineered exclusively for your top-tier executives. Drawing from local micro-farms, pristine coasts, and Piedmontese heritage, our collective will execute a hyper-seasonal narrative scale without compromise.",
    presenterName: "Bernardo Simões",
    presenterTitle: "Executive Chef / Partner",
    items: [
      {
        id: "eng-main-1",
        name: "Custom Gala Dinner Sequence",
        desc: "Signature culinary flow executed on-site for high-tier executives.",
        hasPrice: true,
        qty: 45,
        rate: 350,
        subItems: [
          { id: "eng-sub-1", name: "Starters & Canapés", desc: "", hasPrice: false, qty: 1, rate: 0 },
          {
            id: "eng-sub-2",
            name: "Feta-stuffed crisp dates with wild-flower honey drizzle",
            desc: "",
            hasPrice: false,
            qty: 1,
            rate: 0,
          },
          {
            id: "eng-sub-3",
            name: "Charred sourdough flatbread with whipped ricotta, black salt, and local figs",
            desc: "",
            hasPrice: false,
            qty: 1,
            rate: 0,
          },
          { id: "eng-sub-4", name: "Main Courses Selection", desc: "", hasPrice: false, qty: 1, rate: 0 },
          {
            id: "eng-sub-5",
            name: "Piedmontese handcrafted Agnolotti in sage brown butter",
            desc: "",
            hasPrice: false,
            qty: 1,
            rate: 0,
          },
          {
            id: "eng-sub-6",
            name: "Atlantic Seabass in a delicate citrus-scallion herb reduction",
            desc: "",
            hasPrice: false,
            qty: 1,
            rate: 0,
          },
        ],
      },
      {
        id: "eng-main-2",
        name: "Surgical Logistics & Elite Sommelier Team",
        desc: "Full brigade setup including glass architecture, serving crew, and sommelier curation.",
        hasPrice: true,
        qty: 1,
        rate: 4200,
        subItems: [
          {
            id: "eng-sub-7",
            name: "Old-World Wine Pairings",
            desc: "Italian & French classic reserve vintages",
            hasPrice: true,
            qty: 45,
            rate: 120,
          },
        ],
      },
    ],
  },
  POR: {
    clientName: "Sr. Alexander Sterling",
    clientOrganization: "Sterling Global Holdings",
    eventName: "Gala Executiva Privada",
    eventDate: "14 de Agosto, 2026",
    eventLocation: "Mansão de Miami Beach",
    guestAttendance: "50 convidados",
    menuFormat: "Menu de Etapas Exclusivo",
    conceptStatement:
      "Uma narrativa gastronômica sob medida desenhada para seus convidados mais seletos. Do frescor de microprodutores ao rigor técnico contemporâneo, nosso coletivo cria uma experiência autoral sem paralelos.",
    presenterName: "Bernardo Simões",
    presenterTitle: "Chef Executivo / Sócio",
    items: [
      {
        id: "por-main-1",
        name: "Jantar 11 de Julho",
        desc: "Experiência gastronômica completa para executivos com serviço privativo e menu assinado.",
        hasPrice: true,
        qty: 50,
        rate: 390,
        subItems: [
          { id: "por-sub-1", name: "Starters", desc: "", hasPrice: false, qty: 1, rate: 0 },
          {
            id: "por-sub-2",
            name: "Mini batatas recheadas com iogurte grego e farelo de bacon crocante",
            desc: "",
            hasPrice: false,
            qty: 1,
            rate: 0,
          },
          {
            id: "por-sub-3",
            name: "Mini Bruschettas com ricota temperada e tomates cereja marinados em limão cravo e melaço de cana",
            desc: "",
            hasPrice: false,
            qty: 1,
            rate: 0,
          },
          {
            id: "por-sub-4",
            name: "Bastões de tapioca com geléia de pimenta",
            desc: "",
            hasPrice: false,
            qty: 1,
            rate: 0,
          },
          {
            id: "por-sub-5",
            name: "Arepas de milho com queijo coalho e melaço de cana",
            desc: "",
            hasPrice: false,
            qty: 1,
            rate: 0,
          },
          { id: "por-sub-6", name: "Main courses", desc: "", hasPrice: false, qty: 1, rate: 0 },
          {
            id: "por-sub-7",
            name: "Gnocchi de batata ao pesto com tomates cereja assados com ervas",
            desc: "",
            hasPrice: false,
            qty: 1,
            rate: 0,
          },
          {
            id: "por-sub-8",
            name: "Rigatoni bolonhesa com ragu de carne magra",
            desc: "",
            hasPrice: false,
            qty: 1,
            rate: 0,
          },
          {
            id: "por-sub-9",
            name: "Spaghetti ao molho tres tomates (seco, cereja e molho) com pescada em crosta de ervas",
            desc: "",
            hasPrice: false,
            qty: 1,
            rate: 0,
          },
        ],
      },
      {
        id: "por-main-2",
        name: "Serviço Adicional & Harmonização Opcional",
        desc: "Sommeliers licenciados e harmonização premium de vinhos finos.",
        hasPrice: false,
        qty: 1,
        rate: 0,
        subItems: [
          {
            id: "por-sub-10",
            name: "Harmonização de Vinhos Importados (Opcional)",
            desc: "Rótulos selecionados do Velho Mundo.",
            hasPrice: true,
            qty: 50,
            rate: 110,
          },
        ],
      },
    ],
  },
  ITA: {
    clientName: "Sig. Alexander Sterling",
    clientOrganization: "Sterling Global Holdings",
    eventName: "Gala Esecutivo Privato",
    eventDate: "14 Agosto, 2026",
    eventLocation: "Tenuta di Miami Beach",
    guestAttendance: "45 ospiti",
    menuFormat: "Menu Degustazione Alta Cucina",
    conceptStatement:
      "Un'esperienza gastronomica d'élite sviluppata su misura per i vostri partner executive. Dai canapè più raffinati al servizio di sala sincronizzato, curato nei minimi dettagli.",
    presenterName: "Bernardo Simões",
    presenterTitle: "Executive Chef / Partner",
    items: [
      {
        id: "ita-main-1",
        name: "Sequenza Degustazione Gala Dinanzi",
        desc: "Esperienza culinaria di 5 portate preparata in loco per i vostri ospiti d'onore.",
        hasPrice: true,
        qty: 45,
        rate: 350,
        subItems: [
          { id: "ita-sub-1", name: "Antipasti della Casa", desc: "", hasPrice: false, qty: 1, rate: 0 },
          {
            id: "ita-sub-2",
            name: "Datteri croccanti ripieni di feta con miele selvatico biologico",
            desc: "",
            hasPrice: false,
            qty: 1,
            rate: 0,
          },
          {
            id: "ita-sub-3",
            name: "Bruschetta premium con ricotta montata, fichi neri locali e sale di Cipro",
            desc: "",
            hasPrice: false,
            qty: 1,
            rate: 0,
          },
          { id: "ita-sub-4", name: "Portate Principali", desc: "", hasPrice: false, qty: 1, rate: 0 },
          {
            id: "ita-sub-5",
            name: "Agnolotti piemontesi fatti a mano in burro chiarificato e salvia",
            desc: "",
            hasPrice: false,
            qty: 1,
            rate: 0,
          },
          {
            id: "ita-sub-6",
            name: "Spigola dell'Atlantico in riduzione aromatica di agrumi freschi",
            desc: "",
            hasPrice: false,
            qty: 1,
            rate: 0,
          },
        ],
      },
    ],
  },
};

function ProposalsPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <TriadIcon size={32} className="animate-pulse" />
          <span className="eyebrow text-xs text-muted-foreground">Loading Proposal Studio</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" richColors />
      {!session ? <LoginRequired /> : <ProposalBuilder session={session} />}
    </>
  );
}

function LoginRequired() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 select-none font-serif text-[32rem] leading-none text-secondary/30 md:text-[40rem]"
      >
        S
      </div>
      <div className="relative w-full max-w-md border border-border bg-background/50 p-8 text-center shadow-2xl backdrop-blur-md">
        <Logo subtext="SEIVA • PROPOSALS" size="md" align="center" />
        <p className="mt-8 text-sm font-light leading-relaxed text-muted-foreground">
          Entre pelo painel admin para criar e editar orçamentos.
        </p>
        <a
          href="/admin"
          className="eyebrow mt-8 inline-flex items-center gap-2 border border-foreground bg-foreground px-5 py-3 text-background transition-all hover:bg-background hover:text-foreground"
        >
          Abrir Admin <ArrowLeft size={12} className="rotate-180" />
        </a>
      </div>
    </div>
  );
}

function ProposalBuilder({ session }: { session: Session }) {
  const [draft, setDraft] = useState(() =>
    createDraftFromPreset("POR", {
      proposalReference: "SV-2026-000",
      issueDate: todayISO(),
    }),
  );
  const [proposalId, setProposalId] = useState<string | null>(null);
  const [booting, setBooting] = useState(true);
  const [saveStatus, setSaveStatus] = useState("Preparando draft...");
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [library, setLibrary] = useState<ProposalRow[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [paymentVisible, setPaymentVisible] = useState(false);
  const [mockMode, setMockMode] = useState(true);
  const skipNextSave = useRef(true);
  const saveTimer = useRef<number | null>(null);

  const labels = LABELS[draft.language];
  const totals = useMemo(() => calculateTotals(draft), [draft]);

  useEffect(() => {
    void createNewProposal({ initial: true });
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!proposalId || booting) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }

    setSaveStatus("Salvando...");
    if (saveTimer.current) window.clearTimeout(saveTimer.current);

    saveTimer.current = window.setTimeout(() => {
      void persistDraft(draft);
    }, 850);
  }, [draft, proposalId, booting]);

  async function createNewProposal(options?: { initial?: boolean }) {
    const nextDraft = createDraftFromPreset(draft.language, {
      proposalReference: "SV-2026-000",
      issueDate: todayISO(),
    });

    if (options?.initial) setBooting(true);
    setSaveStatus("Criando referência...");

    try {
      const { data, error } = await db
        .from("proposals")
        .insert(toDbPayload(nextDraft))
        .select("*")
        .single();

      if (error) throw error;

      const rowDraft = rowToDraft(data as ProposalRow);
      skipNextSave.current = true;
      setProposalId(data.id);
      setDraft(rowDraft);
      setMockMode(true);
      setPaymentVisible(false);
      setSaveStatus("Draft criado");
    } catch (err: any) {
      console.error(err);
      const fallback = createDraftFromPreset("POR", {
        proposalReference: `SV-${new Date().getFullYear()}-LOCAL`,
        issueDate: todayISO(),
      });
      skipNextSave.current = true;
      setProposalId(null);
      setDraft(fallback);
      setMockMode(true);
      setSaveStatus("Modo local");
      toast.error("Não consegui criar o draft no Supabase. A tela continua funcionando em modo local.");
    } finally {
      setBooting(false);
    }
  }

  async function persistDraft(nextDraft: ProposalDraft = draft) {
    if (!proposalId) {
      setSaveStatus("Modo local");
      return;
    }

    try {
      const { error } = await db.from("proposals").update(toDbPayload(nextDraft)).eq("id", proposalId);
      if (error) throw error;

      const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setSaveStatus(`Salvo às ${time}`);
    } catch (err) {
      console.error(err);
      setSaveStatus("Erro ao salvar");
      toast.error("Não foi possível salvar este orçamento.");
    }
  }

  async function openLibrary() {
    setLibraryOpen(true);
    setLibraryLoading(true);
    try {
      const { data, error } = await db
        .from("proposals")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(40);

      if (error) throw error;
      setLibrary((data || []) as ProposalRow[]);
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível carregar a biblioteca de orçamentos.");
    } finally {
      setLibraryLoading(false);
    }
  }

  function loadProposal(row: ProposalRow) {
    skipNextSave.current = true;
    setProposalId(row.id);
    setDraft(rowToDraft(row));
    setMockMode(false);
    setPaymentVisible(false);
    setSaveStatus("Orçamento carregado");
    setLibraryOpen(false);
  }

  async function deleteProposal(row: ProposalRow) {
    if (!window.confirm(`Excluir ${formatReference(row.proposal_reference, row.language || "POR")}?`)) return;

    try {
      const { error } = await db.from("proposals").delete().eq("id", row.id);
      if (error) throw error;
      setLibrary((current) => current.filter((item) => item.id !== row.id));
      toast.success("Orçamento excluído.");
      if (row.id === proposalId) {
        await createNewProposal();
      }
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível excluir este orçamento.");
    }
  }

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) toast.error("Erro ao sair.");
  }

  function updateField<K extends keyof ProposalDraft>(field: K, value: ProposalDraft[K]) {
    setMockMode(false);
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function changeLanguage(language: Lang) {
    setDraft((current) => {
      if (!mockMode) return { ...current, language };

      return createDraftFromPreset(language, {
        proposalReference: current.proposalReference,
        issueDate: current.issueDate,
      });
    });
  }

  function updateItem(index: number, patch: Partial<LineItem>) {
    setMockMode(false);
    setDraft((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    }));
  }

  function updateSubItem(itemIndex: number, subIndex: number, patch: Partial<SubItem>) {
    setMockMode(false);
    setDraft((current) => ({
      ...current,
      items: current.items.map((item, index) =>
        index === itemIndex
          ? {
              ...item,
              subItems: item.subItems.map((sub, nestedIndex) =>
                nestedIndex === subIndex ? { ...sub, ...patch } : sub,
              ),
            }
          : item,
      ),
    }));
  }

  function addItem() {
    setMockMode(false);
    setDraft((current) => ({
      ...current,
      items: [
        ...current.items,
        {
          id: makeId(),
          name: LABELS[current.language].placeholderName,
          desc: LABELS[current.language].placeholderDesc,
          hasPrice: true,
          qty: 1,
          rate: 100,
          subItems: [],
        },
      ],
    }));
  }

  function addSubItem(itemIndex: number) {
    setMockMode(false);
    setDraft((current) => ({
      ...current,
      items: current.items.map((item, index) =>
        index === itemIndex
          ? {
              ...item,
              subItems: [
                ...item.subItems,
                {
                  id: makeId(),
                  name: "New Sub Item / Course Description",
                  desc: "",
                  hasPrice: false,
                  qty: 1,
                  rate: 0,
                },
              ],
            }
          : item,
      ),
    }));
  }

  function deleteItem(itemIndex: number) {
    setMockMode(false);
    setDraft((current) => ({
      ...current,
      items: current.items.filter((_, index) => index !== itemIndex),
    }));
  }

  function deleteSubItem(itemIndex: number, subIndex: number) {
    setMockMode(false);
    setDraft((current) => ({
      ...current,
      items: current.items.map((item, index) =>
        index === itemIndex
          ? { ...item, subItems: item.subItems.filter((_, nestedIndex) => nestedIndex !== subIndex) }
          : item,
      ),
    }));
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <header
        data-print-hidden="true"
        className="z-40 shrink-0 border-b border-border/60 bg-background/90 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-6 py-4 md:px-12">
          <div className="flex items-center gap-5">
            <a
              href="/admin"
              className="flex h-10 w-10 items-center justify-center border border-border transition-colors hover:border-foreground hover:bg-secondary/30"
              title="Voltar ao admin"
            >
              <ArrowLeft size={15} />
            </a>
            <Logo subtext="PROPOSAL STUDIO" size="sm" align="start" />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="hidden text-xs text-muted-foreground lg:inline-block">
              Authenticated as: <strong className="text-foreground">{session.user?.email}</strong>
            </span>
            <button
              type="button"
              onClick={() => void persistDraft()}
              className="eyebrow flex items-center gap-2 border border-foreground/30 px-4 py-2 text-[0.65rem] transition-all hover:bg-foreground hover:text-background"
            >
              <Save size={12} /> Salvar
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="eyebrow flex items-center gap-2 border border-foreground bg-foreground px-4 py-2 text-[0.65rem] text-background transition-all hover:bg-background hover:text-foreground"
            >
              <Printer size={12} /> Export PDF / Print
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="eyebrow flex items-center gap-2 border border-foreground/30 px-4 py-2 text-[0.65rem] transition-all hover:bg-foreground hover:text-background"
            >
              <LogOut size={12} /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="proposal-workspace flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <aside
          data-print-hidden="true"
          className="flex max-h-[45vh] min-h-0 w-full shrink-0 flex-col overflow-y-auto border-r border-foreground/10 bg-[#1C2B22] text-background lg:h-full lg:max-h-none lg:w-[440px]"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-background/10 bg-[#1C2B22] px-6 py-5">
            <div>
              <p className="eyebrow text-[0.62rem] text-[#C5A880]">{labels.sidebarTitle}</p>
              <p className="mt-2 text-xs font-light text-background/55">{saveStatus}</p>
            </div>
            {booting && <Loader2 size={16} className="animate-spin text-[#C5A880]" />}
          </div>

          <div className="space-y-8 p-6">
            <div className="border border-background/10 bg-background/[0.06] p-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={openLibrary}
                  className="eyebrow flex items-center justify-center gap-2 border border-background/15 px-3 py-3 text-[0.58rem] text-[#C5A880] transition-all hover:bg-background hover:text-[#1C2B22]"
                >
                  <BookOpen size={13} /> Biblioteca
                </button>
                <button
                  type="button"
                  onClick={() => void createNewProposal()}
                  className="eyebrow flex items-center justify-center gap-2 border border-[#C5A880] bg-[#C5A880] px-3 py-3 text-[0.58rem] text-[#0F0F0F] transition-all hover:bg-background"
                >
                  <Plus size={13} /> Novo
                </button>
              </div>

              <div className="mt-5">
                <span className="eyebrow mb-2 block text-[0.55rem] text-background/45">
                  Document Language / Idioma
                </span>
                <div className="grid grid-cols-3 border border-background/15 bg-[#0F0F0F]/30 p-1">
                  {(["ENG", "POR", "ITA"] as Lang[]).map((language) => (
                    <button
                      key={language}
                      type="button"
                      onClick={() => changeLanguage(language)}
                      className={`py-2 text-[0.65rem] font-semibold tracking-widest transition-all ${
                        draft.language === language
                          ? "bg-[#C5A880] text-[#0F0F0F]"
                          : "text-background/60 hover:bg-background/10 hover:text-background"
                      }`}
                    >
                      {language}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <SidebarSection title={labels.docInfo}>
              <ReadOnlyField
                label="Proposal Reference"
                value={formatReference(draft.proposalReference, draft.language)}
                helper="Gerado automaticamente em sequência."
              />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <ReadOnlyField
                  label="Date of Issue"
                  value={formatLongDate(draft.issueDate, draft.language)}
                  helper="Criado automaticamente."
                />
                <EditorField label="Valid Until">
                  <input
                    value={draft.validUntil}
                    onChange={(event) => updateField("validUntil", event.target.value)}
                    className={INPUT_CLASS}
                  />
                </EditorField>
              </div>
            </SidebarSection>

            <SidebarSection title={labels.clientInfo}>
              <EditorField label="Client Name">
                <input
                  value={draft.clientName}
                  onChange={(event) => updateField("clientName", event.target.value)}
                  className={INPUT_CLASS}
                />
              </EditorField>
              <EditorField label="Client Organization">
                <input
                  value={draft.clientOrganization}
                  onChange={(event) => updateField("clientOrganization", event.target.value)}
                  className={INPUT_CLASS}
                />
              </EditorField>
            </SidebarSection>

            <SidebarSection title={labels.eventParams}>
              <EditorField label="Event Name">
                <input
                  value={draft.eventName}
                  onChange={(event) => updateField("eventName", event.target.value)}
                  className={INPUT_CLASS}
                />
              </EditorField>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <EditorField label="Event Date">
                  <input
                    value={draft.eventDate}
                    onChange={(event) => updateField("eventDate", event.target.value)}
                    className={INPUT_CLASS}
                  />
                </EditorField>
                <EditorField label="Location">
                  <input
                    value={draft.eventLocation}
                    onChange={(event) => updateField("eventLocation", event.target.value)}
                    className={INPUT_CLASS}
                  />
                </EditorField>
                <EditorField label="Guest Attendance">
                  <input
                    value={draft.guestAttendance}
                    onChange={(event) => updateField("guestAttendance", event.target.value)}
                    className={INPUT_CLASS}
                  />
                </EditorField>
                <EditorField label="Menu Format">
                  <input
                    value={draft.menuFormat}
                    onChange={(event) => updateField("menuFormat", event.target.value)}
                    className={INPUT_CLASS}
                  />
                </EditorField>
              </div>
            </SidebarSection>

            <SidebarSection title={labels.concept}>
              <EditorField label="Concept Statement">
                <textarea
                  value={draft.conceptStatement}
                  onChange={(event) => updateField("conceptStatement", event.target.value)}
                  rows={5}
                  className={`${INPUT_CLASS} resize-none leading-relaxed`}
                />
              </EditorField>
            </SidebarSection>

            <SidebarSection
              title={labels.lineItems}
              action={
                <button
                  type="button"
                  onClick={addItem}
                  className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#C5A880] transition-colors hover:text-background"
                >
                  {labels.addItem}
                </button>
              }
            >
              <div className="space-y-5">
                {draft.items.map((item, index) => (
                  <LineItemEditor
                    key={item.id}
                    item={item}
                    index={index}
                    onChange={(patch) => updateItem(index, patch)}
                    onDelete={() => deleteItem(index)}
                    onAddSubItem={() => addSubItem(index)}
                    onSubChange={(subIndex, patch) => updateSubItem(index, subIndex, patch)}
                    onSubDelete={(subIndex) => deleteSubItem(index, subIndex)}
                  />
                ))}
              </div>
            </SidebarSection>

            <SidebarSection title={labels.signature}>
              <EditorField label="Presenter Name">
                <input
                  value={draft.presenterName}
                  onChange={(event) => updateField("presenterName", event.target.value)}
                  className={INPUT_CLASS}
                />
              </EditorField>
              <EditorField label="Title">
                <input
                  value={draft.presenterTitle}
                  onChange={(event) => updateField("presenterTitle", event.target.value)}
                  className={INPUT_CLASS}
                />
              </EditorField>
            </SidebarSection>
          </div>
        </aside>

        <main className="proposal-preview-shell min-h-0 flex-1 overflow-y-auto bg-[#E2E0D9] px-4 py-8 md:px-12 md:py-12">
          <ProposalDocument
            draft={draft}
            labels={labels}
            totals={totals}
            paymentVisible={paymentVisible}
            onTogglePayment={() => setPaymentVisible((visible) => !visible)}
          />
        </main>
      </div>

      {libraryOpen && (
        <ProposalLibrary
          rows={library}
          loading={libraryLoading}
          onClose={() => setLibraryOpen(false)}
          onLoad={loadProposal}
          onDelete={(row) => void deleteProposal(row)}
          onNew={() => {
            setLibraryOpen(false);
            void createNewProposal();
          }}
        />
      )}
    </div>
  );
}

function SidebarSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-background/10 pt-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="eyebrow text-[0.62rem] text-[#C5A880]">{title}</h3>
        {action}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function EditorField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-background/45">
        {label}
      </span>
      {children}
    </label>
  );
}

function ReadOnlyField({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div>
      <span className="mb-1.5 block text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-background/45">
        {label}
      </span>
      <div className="border border-[#C5A880]/30 bg-background/[0.08] px-3 py-2 text-sm font-medium text-background">
        {value}
      </div>
      <p className="mt-1 text-[0.68rem] font-light text-background/45">{helper}</p>
    </div>
  );
}

function LineItemEditor({
  item,
  index,
  onChange,
  onDelete,
  onAddSubItem,
  onSubChange,
  onSubDelete,
}: {
  item: LineItem;
  index: number;
  onChange: (patch: Partial<LineItem>) => void;
  onDelete: () => void;
  onAddSubItem: () => void;
  onSubChange: (subIndex: number, patch: Partial<SubItem>) => void;
  onSubDelete: (subIndex: number) => void;
}) {
  return (
    <div className="relative border border-background/15 bg-background/[0.06] p-4">
      <button
        type="button"
        onClick={onDelete}
        className="absolute right-3 top-3 text-background/35 transition-colors hover:text-red-300"
        title="Delete item"
      >
        <Trash2 size={15} />
      </button>

      <div className="space-y-3 pr-7">
        <span className="block text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[#C5A880]">
          Primary Item #{index + 1}
        </span>
        <EditorField label="Title / Package">
          <input value={item.name} onChange={(event) => onChange({ name: event.target.value })} className={INPUT_CLASS} />
        </EditorField>
        <EditorField label="Short Description">
          <input value={item.desc} onChange={(event) => onChange({ desc: event.target.value })} className={INPUT_CLASS} />
        </EditorField>

        <label className="flex items-center gap-2 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-background/60">
          <input
            type="checkbox"
            checked={item.hasPrice}
            onChange={(event) => onChange({ hasPrice: event.target.checked })}
            className="h-3.5 w-3.5 accent-[#C5A880]"
          />
          Include Parent Price
        </label>

        {item.hasPrice && (
          <div className="grid grid-cols-2 gap-2">
            <EditorField label="Qty">
              <input
                type="number"
                value={item.qty}
                onChange={(event) => onChange({ qty: toNumber(event.target.value) })}
                className={INPUT_CLASS}
              />
            </EditorField>
            <EditorField label="Rate">
              <input
                type="number"
                value={item.rate}
                onChange={(event) => onChange({ rate: toNumber(event.target.value) })}
                className={INPUT_CLASS}
              />
            </EditorField>
          </div>
        )}
      </div>

      <div className="mt-5 border-t border-background/15 pt-4">
        <div className="mb-3 flex items-center justify-between gap-4">
          <span className="text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-background/50">
            Sub-items / Menu Breakdown
          </span>
          <button
            type="button"
            onClick={onAddSubItem}
            className="text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-[#C5A880] hover:text-background"
          >
            + Add Sub-item
          </button>
        </div>

        <div className="space-y-3">
          {item.subItems.map((sub, subIndex) => (
            <div key={sub.id} className="relative border border-[#C5A880]/25 bg-[#0F0F0F]/20 p-3 pl-4">
              <button
                type="button"
                onClick={() => onSubDelete(subIndex)}
                className="absolute right-2 top-2 text-background/35 transition-colors hover:text-red-300"
                title="Delete sub-item"
              >
                <X size={13} />
              </button>
              <div className="space-y-3 pr-5">
                <EditorField label="Sub-item Name">
                  <input
                    value={sub.name}
                    onChange={(event) => onSubChange(subIndex, { name: event.target.value })}
                    className={INPUT_CLASS}
                  />
                </EditorField>
                <EditorField label="Description">
                  <input
                    value={sub.desc}
                    onChange={(event) => onSubChange(subIndex, { desc: event.target.value })}
                    className={INPUT_CLASS}
                  />
                </EditorField>
                <label className="flex items-center gap-2 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-background/60">
                  <input
                    type="checkbox"
                    checked={sub.hasPrice}
                    onChange={(event) => onSubChange(subIndex, { hasPrice: event.target.checked })}
                    className="h-3.5 w-3.5 accent-[#C5A880]"
                  />
                  Has Custom Price
                </label>
                {sub.hasPrice && (
                  <div className="grid grid-cols-2 gap-2">
                    <EditorField label="Qty">
                      <input
                        type="number"
                        value={sub.qty}
                        onChange={(event) => onSubChange(subIndex, { qty: toNumber(event.target.value) })}
                        className={INPUT_CLASS}
                      />
                    </EditorField>
                    <EditorField label="Rate">
                      <input
                        type="number"
                        value={sub.rate}
                        onChange={(event) => onSubChange(subIndex, { rate: toNumber(event.target.value) })}
                        className={INPUT_CLASS}
                      />
                    </EditorField>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProposalDocument({
  draft,
  labels,
  totals,
  paymentVisible,
  onTogglePayment,
}: {
  draft: ProposalDraft;
  labels: (typeof LABELS)[Lang];
  totals: ReturnType<typeof calculateTotals>;
  paymentVisible: boolean;
  onTogglePayment: () => void;
}) {
  return (
    <div
      id="proposal-print-area"
      className="proposal-print-container relative mx-auto flex min-h-[1100px] w-full max-w-4xl flex-col justify-between overflow-hidden bg-[#F7F5F0] p-8 shadow-2xl shadow-[#0F0F0F]/10 md:p-16"
    >
      <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E2E0D9]/50 blur-3xl" />

      <div>
        <header className="mb-16 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <ProposalLogo />
          <div className="text-left sm:text-right">
            <h1 className="font-serif text-4xl font-light uppercase tracking-widest text-[#0F0F0F] sm:text-5xl">
              {labels.titleMain}
            </h1>
            <p className="mt-1 text-xs font-medium uppercase tracking-widest text-[#0F0F0F]/50">
              {formatReference(draft.proposalReference, draft.language)}
            </p>
          </div>
        </header>

        <section className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-2">
          <div className="space-y-6">
            <div>
              <h3 className="mb-1 text-[9px] font-bold uppercase tracking-[0.3em] text-[#0F0F0F]/40">
                {labels.preparedFor}
              </h3>
              <p className="font-serif text-2xl font-light tracking-[0.05em] text-[#0F0F0F]">
                {draft.clientName}
              </p>
              <p className="mt-1 text-xs font-light tracking-wide text-[#0F0F0F]/60">
                {draft.clientOrganization}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <MetaValue label={labels.issueDate} value={formatLongDate(draft.issueDate, draft.language)} />
              <MetaValue label={labels.validUntil} value={draft.validUntil} />
            </div>
          </div>

          <div className="space-y-6 border-[#0F0F0F]/10 pl-0 md:border-l md:pl-12">
            <div>
              <h3 className="mb-1 text-[9px] font-bold uppercase tracking-[0.3em] text-[#0F0F0F]/40">
                {labels.event}
              </h3>
              <p className="font-serif text-2xl font-light tracking-[0.05em] text-[#0F0F0F]">
                {draft.eventName}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <MetaValue label={labels.eventDate} value={draft.eventDate} />
              <MetaValue label={labels.location} value={draft.eventLocation} />
              <MetaValue label={labels.guests} value={draft.guestAttendance} />
              <MetaValue label={labels.format} value={draft.menuFormat} />
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h3 className="mb-4 border-b border-[#0F0F0F]/10 pb-2 text-[9px] font-bold uppercase tracking-[0.3em] text-[#0F0F0F]/40">
            {labels.conceptLabel}
          </h3>
          <p className="font-serif text-xl font-light italic leading-relaxed tracking-[0.05em] text-[#0F0F0F]/90 md:text-2xl">
            {draft.conceptStatement}
          </p>
        </section>

        <section className="mb-12">
          <h3 className="mb-6 border-b border-[#0F0F0F]/10 pb-2 text-[9px] font-bold uppercase tracking-[0.3em] text-[#0F0F0F]/40">
            {labels.investment}
          </h3>
          <div className="w-full text-left">
            <div className="grid grid-cols-12 gap-4 border-b border-[#0F0F0F] pb-4 text-[9px] font-bold uppercase tracking-[0.2em] text-[#0F0F0F]/40">
              <div className="col-span-6 md:col-span-7">{labels.desc}</div>
              <div className="col-span-2 text-center md:col-span-1">{labels.qty}</div>
              <div className="col-span-2 text-right">{labels.rate}</div>
              <div className="col-span-2 text-right">{labels.total}</div>
            </div>
            <div className="divide-y divide-[#0F0F0F]/5">
              {draft.items.map((item) => (
                <ProposalLineItem key={item.id} item={item} lang={draft.language} />
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="break-inside-avoid">
        <section className="mb-16 flex justify-end">
          <div className="w-full space-y-3 sm:w-1/2">
            <TotalRow label={labels.subtotal} value={formatCurrency(totals.subtotal, draft.language)} />
            <TotalRow label={labels.taxes} value={formatCurrency(totals.taxes, draft.language)} />
            <div className="border-t border-[#0F0F0F]/5 pt-2" />
            <TotalRow
              label={labels.totalPerGuest}
              value={formatCurrency(totals.totalPerGuest, draft.language)}
              strong
            />
            <div className="mt-2 flex items-center justify-between border-t border-[#0F0F0F] pt-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0F0F0F]">
                {labels.totalInvestment}
              </span>
              <span className="font-serif text-3xl font-light tracking-[0.05em] text-[#0F0F0F] md:text-4xl">
                {formatCurrency(totals.total, draft.language)}
              </span>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-12 border-t border-[#0F0F0F]/10 pt-8 md:grid-cols-2">
          <div>
            <h3 className="mb-3 text-[9px] font-bold uppercase tracking-[0.3em] text-[#0F0F0F]">
              {labels.nextSteps}
            </h3>
            <p className="mb-4 text-[11px] font-light leading-relaxed tracking-wide text-[#0F0F0F]/50">
              {labels.nextStepsText}
            </p>
            <div className="proposal-no-print">
              <button
                type="button"
                onClick={onTogglePayment}
                className="border border-[#0F0F0F] px-6 py-3 text-[9px] font-bold uppercase tracking-[0.2em] text-[#0F0F0F] transition-colors duration-300 hover:bg-[#0F0F0F] hover:text-[#F7F5F0]"
              >
                {labels.approve}
              </button>
              {paymentVisible && (
                <div className="mt-4 border border-emerald-200 bg-emerald-50/80 p-3 text-xs font-medium text-emerald-800">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{labels.paymentMsg}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-end text-left md:items-end md:text-right">
            <div className="mb-4 h-px w-32 self-start bg-[#0F0F0F]/20 md:self-end" />
            <p className="font-serif text-xl font-light tracking-[0.05em] text-[#0F0F0F]">
              {draft.presenterName}
            </p>
            <p className="mt-1 text-[9px] uppercase tracking-widest text-[#0F0F0F]/40">
              {draft.presenterTitle}
            </p>
            <p className="mt-1 text-[9px] uppercase tracking-widest text-[#0F0F0F]/40">
              {labels.collective}
            </p>
          </div>
        </section>

        <footer className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-[#0F0F0F]/10 pt-6 sm:flex-row">
          <p className="text-center text-[8px] font-bold uppercase tracking-[0.3em] text-[#0F0F0F]/30 sm:text-left">
            {labels.footerTagline}
          </p>
          <p className="text-center text-[8px] font-bold uppercase tracking-[0.3em] text-[#0F0F0F]/30">
            {labels.footerLocations}
          </p>
          <p className="text-center text-[8px] font-bold uppercase tracking-[0.3em] text-[#0F0F0F]/30 sm:text-right">
            seivaculinary.com
          </p>
        </footer>
      </div>
    </div>
  );
}

function ProposalLogo() {
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex h-12 w-12 items-center justify-center">
        <svg
          className="absolute h-10 w-10 text-[#0F0F0F]"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M50 15C50 15 20 50 20 70C20 86.5 33.5 100 50 100C66.5 100 80 86.5 80 70C80 50 50 15 50 15Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-[0.2rem]">
          <div className="h-[1.5px] w-7 bg-[#0F0F0F]" />
          <div className="h-[1.5px] w-7 bg-[#0F0F0F]" />
          <div className="h-[1.5px] w-7 bg-[#0F0F0F]" />
        </div>
      </div>
      <span className="font-serif text-3xl font-medium uppercase leading-none tracking-[0.25em] text-[#0F0F0F]">
        SEIVA
      </span>
    </div>
  );
}

function MetaValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <h3 className="mb-1 text-[9px] font-bold uppercase tracking-[0.3em] text-[#0F0F0F]/40">
        {label}
      </h3>
      <p className="font-sans text-xs font-medium tracking-wide text-[#0F0F0F]">{value}</p>
    </div>
  );
}

function ProposalLineItem({ item, lang }: { item: LineItem; lang: Lang }) {
  const parentTotal = item.qty * item.rate;

  return (
    <div className="break-inside-avoid border-b border-[#0F0F0F]/5 py-6 last:border-0 md:py-8">
      <div className="grid grid-cols-12 items-start gap-4">
        <div className="col-span-6 md:col-span-7">
          <p className="font-sans text-[13px] font-light leading-relaxed tracking-wide text-zinc-700">
            {item.name}
          </p>
          {item.desc && (
            <p className="mt-1 font-sans text-[11px] font-light leading-relaxed tracking-wide text-zinc-500">
              {item.desc}
            </p>
          )}
        </div>
        <div className="col-span-2 mt-0.5 text-center font-sans text-[12px] font-light tracking-wider text-zinc-500 md:col-span-1">
          {item.hasPrice ? item.qty : "—"}
        </div>
        <div className="col-span-2 mt-0.5 text-right font-sans text-[12px] font-light tracking-wider text-zinc-500">
          {item.hasPrice ? formatCurrency(item.rate, lang) : "—"}
        </div>
        <div className="col-span-2 mt-0.5 text-right font-sans text-[12px] font-light tracking-wider text-zinc-700">
          {item.hasPrice ? formatCurrency(parentTotal, lang) : "—"}
        </div>
      </div>

      <div className="mt-4 space-y-4 border-l border-zinc-200 pl-4 md:pl-6">
        {item.subItems.map((sub) => {
          const subTotal = sub.qty * sub.rate;

          return (
            <div key={sub.id} className="grid grid-cols-12 items-start gap-4">
              <div className="col-span-6 md:col-span-7">
                <p className="font-sans text-[13px] font-light leading-relaxed tracking-wide text-zinc-700">
                  {sub.name}
                </p>
                {sub.desc && (
                  <p className="mt-1 font-sans text-[11px] font-light leading-normal tracking-wide text-zinc-500">
                    {sub.desc}
                  </p>
                )}
              </div>
              <div className="col-span-2 mt-0.5 text-center font-sans text-[12px] font-light tracking-wider text-zinc-500 md:col-span-1">
                {sub.hasPrice ? sub.qty : ""}
              </div>
              <div className="col-span-2 mt-0.5 text-right font-sans text-[12px] font-light tracking-wider text-zinc-500">
                {sub.hasPrice ? formatCurrency(sub.rate, lang) : ""}
              </div>
              <div className="col-span-2 mt-0.5 text-right font-sans text-[12px] font-light tracking-wider text-zinc-700">
                {sub.hasPrice ? formatCurrency(subTotal, lang) : ""}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TotalRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between text-xs tracking-wide ${
        strong ? "font-semibold text-[#0F0F0F]/70" : "font-light text-[#0F0F0F]/50"
      }`}
    >
      <span>{label}</span>
      <span className="font-sans">{value}</span>
    </div>
  );
}

function ProposalLibrary({
  rows,
  loading,
  onClose,
  onLoad,
  onDelete,
  onNew,
}: {
  rows: ProposalRow[];
  loading: boolean;
  onClose: () => void;
  onLoad: (row: ProposalRow) => void;
  onDelete: (row: ProposalRow) => void;
  onNew: () => void;
}) {
  return (
    <div
      data-print-hidden="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F0F0F]/95 p-4 backdrop-blur-md md:p-6"
    >
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col border border-zinc-700 bg-zinc-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 p-6">
          <div>
            <h2 className="font-serif text-2xl uppercase tracking-widest text-[#F7F5F0]">Proposal Library</h2>
            <p className="mt-2 text-xs font-light text-zinc-500">Orçamentos salvos no Supabase</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 transition-colors hover:text-[#F7F5F0]"
            title="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-xs uppercase tracking-widest text-zinc-500">
              <Loader2 size={16} className="mr-2 animate-spin" /> Carregando...
            </div>
          ) : rows.length === 0 ? (
            <div className="border border-dashed border-zinc-700 py-16 text-center">
              <p className="font-serif text-xl italic text-zinc-400">Nenhum orçamento salvo ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rows.map((row) => (
                <div
                  key={row.id}
                  className="group flex items-center justify-between gap-4 border border-zinc-700/70 bg-zinc-800/50 p-4 transition-all hover:border-[#C5A880]/60"
                >
                  <button type="button" onClick={() => onLoad(row)} className="min-w-0 flex-1 text-left">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-[#F7F5F0]">
                      {row.client_name || "Draft Proposal"}
                      <span className="border border-[#C5A880]/20 bg-[#C5A880]/10 px-1.5 py-0.5 text-[10px] text-[#C5A880]">
                        {formatReference(row.proposal_reference, row.language || "POR")}
                      </span>
                    </p>
                    <p className="mt-1 truncate text-xs font-light tracking-wide text-zinc-400">
                      {row.event_name || "Sem nome de evento"} · {formatLibraryDate(row.updated_at)}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(row)}
                    className="p-2 text-zinc-500 transition-colors hover:text-red-300"
                    title="Excluir"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between border-t border-zinc-800 p-6">
          <button
            type="button"
            onClick={onClose}
            className="eyebrow text-[0.62rem] text-zinc-500 transition-colors hover:text-[#F7F5F0]"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={onNew}
            className="eyebrow flex items-center gap-2 bg-[#C5A880] px-4 py-2 text-[0.62rem] text-[#0F0F0F]"
          >
            <FileText size={12} /> Novo Orçamento
          </button>
        </div>
      </div>
    </div>
  );
}

function createDraftFromPreset(
  language: Lang,
  options: { proposalReference: string; issueDate: string },
): ProposalDraft {
  const mock = MOCKS[language];

  return {
    language,
    proposalReference: options.proposalReference,
    issueDate: options.issueDate,
    validUntil: formatLongDate(addDaysISO(options.issueDate, 7), language),
    clientName: mock.clientName,
    clientOrganization: mock.clientOrganization,
    eventName: mock.eventName,
    eventDate: mock.eventDate,
    eventLocation: mock.eventLocation,
    guestAttendance: mock.guestAttendance,
    menuFormat: mock.menuFormat,
    conceptStatement: mock.conceptStatement,
    presenterName: mock.presenterName,
    presenterTitle: mock.presenterTitle,
    items: cloneItems(mock.items),
  };
}

function rowToDraft(row: ProposalRow): ProposalDraft {
  const language = isLang(row.language) ? row.language : "POR";
  const fallback = createDraftFromPreset(language, {
    proposalReference: row.proposal_reference || `SV-${new Date().getFullYear()}-000`,
    issueDate: row.issue_date || todayISO(),
  });

  return {
    language,
    proposalReference: row.proposal_reference || fallback.proposalReference,
    issueDate: row.issue_date || fallback.issueDate,
    validUntil: row.valid_until || fallback.validUntil,
    clientName: row.client_name || fallback.clientName,
    clientOrganization: row.client_organization || fallback.clientOrganization,
    eventName: row.event_name || fallback.eventName,
    eventDate: row.event_date || fallback.eventDate,
    eventLocation: row.event_location || fallback.eventLocation,
    guestAttendance: row.guest_attendance || fallback.guestAttendance,
    menuFormat: row.menu_format || fallback.menuFormat,
    conceptStatement: row.concept_statement || fallback.conceptStatement,
    presenterName: row.presenter_name || fallback.presenterName,
    presenterTitle: row.presenter_title || fallback.presenterTitle,
    items: normalizeItems(row.items, fallback.items),
  };
}

function toDbPayload(draft: ProposalDraft) {
  return {
    issue_date: draft.issueDate,
    language: draft.language,
    valid_until: draft.validUntil,
    client_name: draft.clientName,
    client_organization: draft.clientOrganization,
    event_name: draft.eventName,
    event_date: draft.eventDate,
    event_location: draft.eventLocation,
    guest_attendance: draft.guestAttendance,
    menu_format: draft.menuFormat,
    concept_statement: draft.conceptStatement,
    presenter_name: draft.presenterName,
    presenter_title: draft.presenterTitle,
    items: draft.items,
  };
}

function normalizeItems(value: unknown, fallback: LineItem[]): LineItem[] {
  if (!Array.isArray(value)) return cloneItems(fallback);

  return value.map((item: any) => ({
    id: typeof item?.id === "string" ? item.id : makeId(),
    name: typeof item?.name === "string" ? item.name : "",
    desc: typeof item?.desc === "string" ? item.desc : "",
    hasPrice: Boolean(item?.hasPrice),
    qty: Number.isFinite(Number(item?.qty)) ? Number(item.qty) : 0,
    rate: Number.isFinite(Number(item?.rate)) ? Number(item.rate) : 0,
    subItems: Array.isArray(item?.subItems)
      ? item.subItems.map((sub: any) => ({
          id: typeof sub?.id === "string" ? sub.id : makeId(),
          name: typeof sub?.name === "string" ? sub.name : "",
          desc: typeof sub?.desc === "string" ? sub.desc : "",
          hasPrice: Boolean(sub?.hasPrice),
          qty: Number.isFinite(Number(sub?.qty)) ? Number(sub.qty) : 0,
          rate: Number.isFinite(Number(sub?.rate)) ? Number(sub.rate) : 0,
        }))
      : [],
  }));
}

function cloneItems(items: LineItem[]) {
  return items.map((item) => ({
    ...item,
    subItems: item.subItems.map((sub) => ({ ...sub })),
  }));
}

function calculateTotals(draft: ProposalDraft) {
  const subtotal = draft.items.reduce((sum, item) => {
    const itemTotal = item.hasPrice ? item.qty * item.rate : 0;
    const subTotal = item.subItems.reduce(
      (nestedSum, sub) => nestedSum + (sub.hasPrice ? sub.qty * sub.rate : 0),
      0,
    );

    return sum + itemTotal + subTotal;
  }, 0);
  const taxes = subtotal * 0.07;
  const total = subtotal + taxes;
  const guestMatch = draft.guestAttendance.match(/\d+/);
  const guestCount = guestMatch ? Number.parseInt(guestMatch[0], 10) : 1;
  const totalPerGuest = total / (guestCount > 0 ? guestCount : 1);

  return { subtotal, taxes, total, totalPerGuest };
}

function formatCurrency(value: number, lang: Lang) {
  const locale = lang === "POR" ? "pt-BR" : lang === "ITA" ? "it-IT" : "en-US";
  const currency = lang === "POR" ? "BRL" : lang === "ITA" ? "EUR" : "USD";

  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
}

function formatReference(reference: string, lang: Lang) {
  const prefix = lang === "POR" ? "Nº" : lang === "ITA" ? "N." : "No.";
  if (/^(No\.|Nº|N\.)\s/i.test(reference)) return reference;
  return `${prefix} ${reference}`;
}

function todayISO() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDaysISO(iso: string, days: number) {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  const nextYear = date.getFullYear();
  const nextMonth = String(date.getMonth() + 1).padStart(2, "0");
  const nextDay = String(date.getDate()).padStart(2, "0");
  return `${nextYear}-${nextMonth}-${nextDay}`;
}

function formatLongDate(iso: string, lang: Lang) {
  const [year, month, day] = iso.split("-").map(Number);
  const monthName = MONTHS[lang][Math.max(0, Math.min(11, month - 1))];

  if (lang === "ENG") return `${monthName} ${day}, ${year}`;
  if (lang === "ITA") return `${day} ${monthName}, ${year}`;
  return `${day} de ${monthName}, ${year}`;
}

function formatLibraryDate(value: string) {
  try {
    return new Date(value).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

function toNumber(value: string) {
  return Number.parseFloat(value) || 0;
}

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

function isLang(value: unknown): value is Lang {
  return value === "ENG" || value === "POR" || value === "ITA";
}
