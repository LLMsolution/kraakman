import type { HomepageTimeline, LpgFeatures, FooterSettings, EmailTemplateSettings } from "@/services/siteSettingsService";

export const DEFAULT_HOMEPAGE_TIMELINE: HomepageTimeline = {
  section_subtitle: "Ons verhaal, passie en expertise in de automotive branche.",
  cards: [
    {
      title: "Stefan van der Waals",
      subtitle: "Technische Expertise",
      description: "Stefan is vanaf zijn 16e werkzaam in de automotive branche en is in 2007 Autoservice van der Waals gestart uit pure liefhebberij. Diverse opleidingen en meer dan 30 jaar ervaring hebben ervoor gezorgd dat Autoservice van der Waals allround is. De werkplaats in Wieringerwaard is voorzien van alle mogelijke benodigdheden voor onderhoud, modificatie en reparatie aan uw auto.",
      features: [
        { bold: "Meer dan 30 jaar ervaring:", text: "Actief in de automotive branche sinds 16e" },
        { bold: "Allround dienstverlening:", text: "Onderhoud, modificatie en reparatie" },
        { bold: "Werkplaats in Wieringerwaard:", text: "Volledig uitgeruste werkplaats" },
      ],
    },
    {
      title: "Kees Kraakman",
      subtitle: "Commerciële Kracht",
      description: "Waar Kees eerst als tevreden klant over de vloer kwam bij Autoservice van der Waals, is dit vanuit daar uitgegroeid tot een goede vriendschap en uiteindelijk de grondlegging geweest voor WK Auto Selectie. Kees, die zelf ook opgeleid is aan de IVA en een automotive achtergrond heeft, is dus absoluut niet onbekend op dit terrein.",
      features: [
        { bold: "IVA opgeleid:", text: "Professionele automotive achtergrond" },
        { bold: "Commercieel inzicht:", text: "Klantgericht ondernemerschap" },
        { bold: "Goede vriendschap:", text: "Basis voor succesvolle samenwerking" },
      ],
    },
    {
      title: "De Ideale Match",
      subtitle: "Technische en Commerciële Synergie",
      description: "De combinatie van de technische achtergrond van Stefan met de commerciële achtergrond van Kees zijn de ideale match en zo wordt WK Auto Selectie gestart in 2022.\n\nAangezien service en kwaliteit hoog in het vaandel staan, worden de auto's bij WK Auto Selectie, die in het assortiment beschikbaar zijn, door ons zelf opgehaald. Op deze manier worden de auto's persoonlijk gecontroleerd, zodat zij aan de hoge kwaliteitseisen voldoen. Hierbij is een sluitende onderhoudshistorie een absolute must.",
      features: [
        { bold: "Persoonlijke selectie:", text: "Alle auto's worden door ons zelf opgehaald en gecontroleerd" },
        { bold: "Hoge kwaliteitseisen:", text: "Alleen auto's die voldoen aan onze strikte eisen" },
        { bold: "Sluitende historie:", text: "Volledige onderhoudsgeschiedenis is vereist" },
      ],
    },
    {
      title: "Kwaliteit & Service",
      subtitle: "Hoogste Kwaliteitsstandaarden",
      description: "Aangezien service en kwaliteit hoog in het vaandel staan, worden de auto's bij WK Auto Selectie, die in het assortiment beschikbaar zijn, door ons zelf opgehaald. Op deze manier worden de auto's persoonlijk gecontroleerd, zodat zij aan de hoge kwaliteitseisen voldoen. Hierbij is een sluitende onderhoudshistorie een absolute must.",
      features: [
        { bold: "Persoonlijke selectie:", text: "Alle auto's worden door ons zelf opgehaald en gecontroleerd" },
        { bold: "Hoge kwaliteitseisen:", text: "Alleen auto's die voldoen aan onze strikte eisen" },
        { bold: "Sluitende historie:", text: "Volledige onderhoudsgeschiedenis is vereist" },
      ],
    },
    {
      title: "Maatwerk & Service",
      subtitle: "Uw Wens, Onze Service",
      description: "Maatwerk nodig? Bel ons! Met aandacht voor de klant en een luisterend oor betreffende de wensen, gaan wij voor u persoonlijk op zoek naar datgene dat volledig bij uw wensen aansluit. Van brommer tot bedrijfsbus, wij zijn uw adres!",
      features: [
        { bold: "Persoonlijke benadering:", text: "Met aandacht voor de klant en een luisterend oor voor uw wensen" },
        { bold: "Technische expertise:", text: "Deskundig advies en professionele uitvoering" },
        { bold: "Van brommer tot bedrijfsbus:", text: "Alle typen voertuigen welkom" },
        { bold: "Maatwerk oplossingen:", text: "Zoeken naar het perfecte voertuig dat bij uw wensen aansluit" },
      ],
    },
  ],
};

export const DEFAULT_LPG_FEATURES: LpgFeatures = {
  cards: [
    {
      title: "Waarom Auto Service van der Waals?",
      description: "Bij ons staat de klant centraal. We nemen de tijd om uw wensen te begrijpen en adviseren u over de beste LPG-oplossing voor uw specifieke situatie. Geen standaard verhalen, maar maatwerk.\n\nKeurige Installaties: We staan bekend om onze nette en professionele inbouw. Alle leidingen worden vakkundig weggewerkt en de installatie wordt zo onzichtbaar mogelijk gemaakt. Kwaliteit en esthetiek gaan bij ons hand in hand.\n\nErvaring en Expertise: Met meer dan 30 jaar ervaring in de automotive hebben we duizenden LPG-installaties uitgevoerd. Van moderne directe inspuit motoren tot klassieke carburateur systemen - wij kennen ze allemaal.",
      checklistTitle: "Onze Garanties",
      features: ["Meer dan 30 jaar ervaring", "Duizenden tevreden klanten", "Persoonlijke benadering", "Vakkundige en nette afwerking", "Transparante prijzen", "Garantie op onze werkzaamheden"],
    },
    {
      title: "Waarom kiezen voor LPG?",
      description: "LPG (Liquid Petroleum Gas) is een schone en voordelige brandstof voor uw auto. Met onze expertise in zowel moderne G3-systemen als klassieke installaties, zorgen wij voor een professionele inbouw die perfect bij uw voertuig past.",
      checklistTitle: "LPG Voordelen",
      features: ["Schone en voordelige brandstof", "Minder CO2 uitstoot dan benzine", "Bespaar tot 40% op brandstofkosten", "Professionele inbouw gegarandeerd", "Beschikbaar voor moderne en klassieke auto's"],
    },
    {
      title: "Moderne G3 Systemen",
      description: "De nieuwste generatie LPG installaties bieden superieure prestaties en betrouwbaarheid. Volledig geïntegreerd met moderne motorelektronica en behoud van fabrieksgarantie.",
      checklistTitle: "G3 Kenmerken",
      features: ["Nieuwste generatie LPG installaties", "Optimale prestaties en verbruik", "Geschikt voor moderne motoren", "Fabrieksgarantie behouden", "Volledige software integratie", "Langere levensduur en betrouwbaarheid"],
    },
    {
      title: "Klassieke Auto's & Oldtimers",
      description: "Specialist in LPG voor oldtimers en youngtimers. Wij respecteren de originaliteit van uw klassieker en zorgen voor vakkundige inbouw zonder beschadiging van historische onderdelen.",
      checklistTitle: "Specialisatie",
      features: ["Specialist in oldtimers en youngtimers", "Respect voor originaliteit", "Vakkundige inbouw zonder beschadiging", "Kennis van historische systemen", "Onderhoud bestaande installaties", "Advies op maat voor uw klassieker"],
    },
    {
      title: "Tanks & Systemen",
      description: "Groot assortiment vulsystemen en diverse tankformaten beschikbaar. Van cilindrische tot toroïdale tanks met installatie in reservewiel ruimte voor optimale ruimtebenutting.",
      checklistTitle: "Systemen",
      features: ["Groot assortiment vulsystemen", "Diverse tankformaten beschikbaar", "Cilindrische en toroïdale tanks", "Advies over optimale tankkeuze", "Installatie in reservewiel ruimte", "Kofferbak-vriendelijke oplossingen"],
    },
    {
      title: "Service & Onderhoud",
      description: "Periodiek onderhoud van LPG installaties met professionele diagnose en reparatie. Wij zorgen ervoor dat uw LPG-systeem altijd perfect functioneert volgens de laatste normen.",
      checklistTitle: "Diensten",
      features: ["Periodiek onderhoud installaties", "Diagnose en reparatie", "Tuning voor optimale prestaties", "Herkeuring en certificering", "Troubleshooting en probleemoplossing", "Upgrades en verbeteringen"],
    },
  ],
};

export const DEFAULT_FOOTER: FooterSettings = {
  email: "info@autoservicevanderwaals.nl",
  phone: "06-26 344 965",
  phone_name: "",
  phone2: "",
  phone2_name: "",
  address_line1: "Zuid Zijperweg 66",
  address_line2: "1766 HD Wieringerwaard",
  opening_days: "Maandag - Vrijdag",
  opening_hours: "08:00 - 17:00 uur",
  opening_note: "Op afspraak",
  company_name: "Auto Service van der Waals",
  whatsapp_number: "31626344965",
  whatsapp_button_text: "Direct chatten met Kees",
  whatsapp_default_message: "Hi Kees, ik heb een vraag:",
  contact_form_title: "Stuur ons een bericht",
  contact_form_subtitle: "Vul het formulier in en we nemen zo spoedig mogelijk contact met u op.",
  contact_map_title: "Locatie",
  contact_map_subtitle: "Wij zijn gevestigd in Wieringerwaard, makkelijk bereikbaar vanuit de regio.",
};

export const DEFAULT_EMAIL_TEMPLATES: EmailTemplateSettings = {
  contact_confirm_greeting: "Bedankt voor uw bericht, {naam}!",
  contact_confirm_body: "We hebben uw bericht in goede orde ontvangen. We streven ernaar om zo snel mogelijk te reageren, meestal binnen 1 werkdag.",
  contact_confirm_urgent: "Heeft u een dringende vraag? Bel ons gerust op {telefoon}.",
  testdrive_confirm_greeting: "Bedankt voor uw aanvraag, {naam}!",
  testdrive_confirm_body: "We hebben uw proefrit aanvraag ontvangen. We nemen zo snel mogelijk contact met u op om een afspraak in te plannen.",
};
