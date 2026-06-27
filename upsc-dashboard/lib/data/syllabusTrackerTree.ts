export interface SyllabusTrackerNodeItem {
  id: string;
  title: string;
  progressKey?: string;
  children?: SyllabusTrackerNodeItem[];
}

export interface SyllabusTrackerSubjectItem {
  id: string;
  title: string;
  progressKey?: string;
  chapters: SyllabusTrackerNodeItem[];
}

function matchesNodeTitle(node: { title: string; progressKey?: string }, value: string): boolean {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return false;
  return (
    node.title.trim().toLowerCase() === normalized ||
    String(node.progressKey || "").trim().toLowerCase() === normalized
  );
}

function toId(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function node(
  title: string,
  children?: Array<string | SyllabusTrackerNodeItem>,
  progressKey?: string,
): SyllabusTrackerNodeItem {
  return {
    id: toId(progressKey || title),
    title,
    progressKey,
    children: children?.map((item) =>
      typeof item === "string" ? node(item) : item,
    ),
  };
}

function subject(
  title: string,
  chapters: SyllabusTrackerNodeItem[],
  progressKey?: string,
): SyllabusTrackerSubjectItem {
  return {
    id: toId(progressKey || title),
    title,
    progressKey,
    chapters,
  };
}

export const syllabusTrackerTree: SyllabusTrackerSubjectItem[] = [
  subject(
    "Polity",
    [
      node("Historical Background of Indian Constitution", [
        "Regulating Act 1773",
        "Pitt's India Act 1784",
        "Charter Acts",
        "Indian Councils Acts",
        "Government of India Acts",
        "Indian Independence Act 1947",
        "Constituent Assembly",
        "Making of Constitution",
        "Committees of Constituent Assembly",
        "Sources of Indian Constitution",
      ], "Historical Background"),
      node("Salient Features of Constitution", [
        "Federal features",
        "Unitary features",
        "Parliamentary system",
        "Blend of rigidity & flexibility",
        "Secularism",
        "Socialist state",
        "Welfare state",
        "Rule of law",
      ], "Salient Features"),
      node("Preamble", [
        "Keywords",
        "Amendability",
        "Objectives Resolution",
        "Important cases",
      ], "Preamble"),
      node("Union & Territory", [
        "Citizenship",
        "Acquisition & termination",
        "Citizenship Amendment provisions",
        "Formation of states",
        "Union territories",
        "Special provisions for states",
      ], "Citizenship"),
      node("Fundamental Rights", [
        "Articles 12-35",
        "Right to Equality",
        "Right to Freedom",
        "Right against Exploitation",
        "Freedom of Religion",
        "Cultural & Educational Rights",
        "Constitutional Remedies",
        "Writs",
        "Armed forces restrictions",
        "Martial law",
        "Suspension of FR",
      ], "Fundamental Rights"),
      node("Directive Principles of State Policy", [
        "Socialist principles",
        "Gandhian principles",
        "Liberal principles",
        "DPSP vs FR",
        "Important amendments & cases",
      ], "DPSP"),
      node("Fundamental Duties", [
        "Features",
        "Criticism",
        "Important cases",
      ], "Fundamental Duties"),
      node("Amendment of Constitution", [
        "Types of amendments",
        "Article 368",
        "Basic Structure Doctrine",
        "Important amendments",
      ], "Amendment of Constitution"),
      node("Basic Structure Doctrine", [
        "Kesavananda Bharati case",
        "Evolution of doctrine",
        "Elements of basic structure",
      ]),
      node("Union Executive", [
        node("President", [
          "Election",
          "Qualifications",
          "Powers",
          "Veto powers",
          "Ordinance power",
          "Pardoning power",
          "Impeachment",
        ], "President"),
        node("Vice-President", [
          "Election",
          "Functions",
          "Removal",
        ], "Vice President"),
        node("Prime Minister", [
          "Appointment",
          "Powers & functions",
          "Cabinet committees",
        ], "Prime Minister"),
        node("Council of Ministers", [
          "Collective responsibility",
          "Cabinet system",
          "Attorney General",
        ], "Council of Ministers"),
      ]),
      node("Parliament", [
        node("Lok Sabha", [
          "Composition",
          "Speaker",
          "Sessions",
          "Motions",
        ]),
        node("Rajya Sabha", [
          "Composition",
          "Special powers",
        ]),
        node("Parliamentary Procedures", [
          "Bills",
          "Money bill",
          "Finance bill",
          "Constitutional amendment bill",
          "Budget",
          "Parliamentary devices",
          "Question Hour",
          "Zero Hour",
          "Joint sitting",
          "Privileges",
          "Committees",
        ]),
      ], "Parliament"),
      node("Supreme Court", [
        "Composition",
        "Appointment of judges",
        "Jurisdiction",
        "Judicial review",
        "Judicial activism",
        "PIL",
        "Important doctrines",
      ], "Supreme Court"),
      node("High Courts", [
        "Jurisdiction",
        "Writ powers",
        "Appointment & removal",
      ], "High Courts"),
      node("Subordinate Judiciary", [
        "District courts",
        "Tribunals",
        "Gram Nyayalayas",
      ]),
      node("Federal System", [
        "Centre-State relations",
        "Legislative relations",
        "Administrative relations",
        "Financial relations",
        "Inter-state councils",
        "River water disputes",
      ], "Centre-State Relations"),
      node("Emergency Provisions", [
        "National Emergency",
        "President's Rule",
        "Financial Emergency",
        "Effects of emergency",
      ], "Emergency Provisions"),
      node("State Government", [
        node("Governor", [
          "Powers",
          "Discretionary powers",
        ], "Governor"),
        node("Chief Minister & Council"),
        node("State Legislature", [
          "Legislative Assembly",
          "Legislative Council",
        ], "State Legislature"),
      ]),
      node("Local Government", [
        node("Panchayati Raj", [
          "73rd Amendment",
          "Gram Sabha",
          "State Election Commission",
          "State Finance Commission",
        ], "Panchayati Raj"),
        node("Municipalities", [
          "74th Amendment",
          "Types of urban local bodies",
        ], "Municipalities"),
      ]),
      node("Constitutional Bodies", [
        "Election Commission",
        "UPSC",
        "Finance Commission",
        "CAG",
        "Attorney General",
        "Advocate General",
      ], "Constitutional Bodies"),
      node("Non-Constitutional Bodies", [
        "NITI Aayog",
        "NHRC",
        "CIC",
        "CBI",
        "Lokpal",
        "Lokayukta",
        "SHRC",
      ], "Non-Constitutional Bodies"),
      node("Elections", [
        "Electoral process",
        "Anti-defection law",
        "Representation of People Act",
        "Delimitation",
        "EVM/VVPAT",
      ], "Elections"),
      node("Political Dynamics", [
        "Pressure groups",
        "Regional parties",
        "Coalition politics",
      ]),
      node("Important Constitutional & Legal Terms", [
        "Habeas Corpus",
        "Rule of Law",
        "Judicial Review",
        "Due Process",
        "Natural Justice",
        "Doctrine concepts",
      ]),
    ],
    "Polity",
  ),
  subject(
    "Modern History",
    [
      node("Decline of Mughal Empire", [
        "Later Mughals",
        "Rise of regional states",
      ]),
      node("Advent of Europeans", [
        "Portuguese",
        "Dutch",
        "English",
        "French",
        "Danish",
        "European factories",
        "Carnatic Wars",
      ], "European Arrival"),
      node("Expansion of British Power", [
        "Battle of Plassey",
        "Battle of Buxar",
        "Subsidiary Alliance",
        "Doctrine of Lapse",
        "Anglo-Mysore Wars",
        "Anglo-Maratha Wars",
        "Anglo-Sikh Wars",
      ], "British Expansion"),
      node("Economic Policies of British", [
        "Land revenue systems",
        "Drain of wealth",
        "Commercialization of agriculture",
        "Deindustrialization",
        "Railways",
        "Plantation economy",
      ]),
      node("Tribal & Peasant Revolts", [
        "Sanyasi revolt",
        "Santhal revolt",
        "Kol revolt",
        "Munda revolt",
        "Indigo revolt",
        "Deccan riots",
        "Moplah revolt",
      ]),
      node("Revolt of 1857", [
        "Causes",
        "Centres",
        "Leaders",
        "Nature debate",
        "Consequences",
      ], "Revolt of 1857"),
      node("Social & Religious Reform Movements", [
        "Brahmo Samaj",
        "Arya Samaj",
        "Ramakrishna Mission",
        "Aligarh Movement",
        "Young Bengal",
        "Prarthana Samaj",
        "Theosophical Society",
        "Reformers",
      ], "Socio-Religious Reform"),
      node("Growth of Nationalism", [
        "Early nationalism",
        "Economic critique",
        "INC formation",
        "Moderate phase",
        "Extremist phase",
        "Swadeshi movement",
        "Surat split",
      ], "INC Formation"),
      node("Revolutionary Movements", [
        "Bengal revolutionaries",
        "Punjab revolutionaries",
        "Ghadar movement",
        "HSRA",
        "Revolutionary organizations abroad",
      ], "Revolutionary Movement"),
      node("Gandhian Era", [
        "Champaran",
        "Ahmedabad",
        "Kheda",
        "Non-Cooperation Movement",
        "Civil Disobedience Movement",
        "Dandi March",
        "Round Table Conferences",
        "Quit India Movement",
      ], "Gandhian Era"),
      node("Constitutional Developments", [
        "Acts & reforms",
        "Simon Commission",
        "Communal Award",
        "Poona Pact",
        "Government of India Act 1935",
        "Cripps Mission",
        "Cabinet Mission",
        "Mountbatten Plan",
      ], "Constitutional Developments"),
      node("Left & Communist Movements", [
        "Trade unions",
        "Socialist organizations",
        "Communist Party",
      ]),
      node("INA & Subhas Chandra Bose", [
        "Forward Bloc",
        "Azad Hind Government",
        "INA trials",
      ]),
      node("Partition & Independence", [
        "Causes of partition",
        "Indian Independence Act",
        "Integration issues",
      ], "Partition & Independence"),
      node("Governor Generals & Viceroys", [
        "Major reforms",
        "Important events during tenure",
      ]),
      node("Important Sessions of INC", [
        "Resolutions",
        "Presidents",
        "Key decisions",
      ]),
      node("Newspapers, Journals & Literature", [
        "Nationalist press",
        "Vernacular Press Act",
        "Important books & authors",
      ]),
    ],
    "Modern",
  ),
  subject(
    "Ancient History",
    [
      node("Sources of Ancient India", [
        "Literary sources",
        "Foreign accounts",
        "Archaeological sources",
        "Inscriptions",
        "Coins",
      ]),
      node("Prehistoric Period", [
        "Paleolithic",
        "Mesolithic",
        "Neolithic",
        "Chalcolithic cultures",
      ], "Prehistoric Period"),
      node("Indus Valley Civilization", [
        "Sites",
        "Town planning",
        "Economy",
        "Religion",
        "Seals",
        "Script",
        "Decline theories",
      ], "Indus Valley Civilization"),
      node("Vedic Age", [
        node("Early Vedic", [
          "Society",
          "Polity",
          "Economy",
          "Religion",
        ]),
        node("Later Vedic", [
          "Changes in society",
          "Varna system",
          "Assemblies",
        ]),
      ], "Vedic Age"),
      node("Mahajanapadas", [
        "16 Mahajanapadas",
        "Rise of Magadha",
      ], "Mahajanapadas"),
      node("Jainism", [
        "Tirthankaras",
        "Mahavira",
        "Doctrines",
        "Councils",
        "Sects",
      ], "Religious Movements"),
      node("Buddhism", [
        "Buddha's life",
        "Four Noble Truths",
        "Eightfold Path",
        "Councils",
        "Hinayana & Mahayana",
      ], "Religious Movements"),
      node("Mauryan Empire", [
        "Chandragupta",
        "Bindusara",
        "Ashoka",
        "Administration",
        "Edicts",
        "Arthashastra",
      ], "Mauryan Empire"),
      node("Post-Mauryan Period", [
        "Indo-Greeks",
        "Shakas",
        "Kushanas",
        "Satavahanas",
      ], "Post-Mauryan Period"),
      node("Sangam Age", [
        "Sangam literature",
        "Society",
        "Trade",
        "Cholas, Cheras, Pandyas",
      ], "Sangam Age"),
      node("Gupta Age", [
        "Administration",
        "Economy",
        "Science",
        "Art & culture",
        "Literature",
      ], "Gupta Empire"),
      node("Post-Gupta Period", [
        "Harsha",
        "Regional kingdoms",
      ]),
      node("South Indian Dynasties", [
        "Pallavas",
        "Chalukyas",
        "Rashtrakutas",
        "Cholas",
      ]),
      node("Ancient Science & Technology", [
        "Mathematics",
        "Astronomy",
        "Medicine",
        "Metallurgy",
      ]),
      node("Ancient Architecture & Culture", [
        "Stupas",
        "Caves",
        "Temples",
        "Sculpture",
        "Paintings",
      ]),
    ],
    "Ancient",
  ),
  subject(
    "Medieval History",
    [
      node("Early Medieval India", [
        "Rajput states",
        "Feudalism debate",
      ], "Early Medieval India"),
      node("Delhi Sultanate", [
        "Slave dynasty",
        "Khaljis",
        "Tughlaqs",
        "Sayyids",
        "Lodis",
        "Administration",
        "Economy",
        "Architecture",
      ], "Delhi Sultanate"),
      node("Vijayanagara & Bahmani Kingdoms", [
        "Administration",
        "Economy",
        "Culture",
      ], "Vijayanagara Empire"),
      node("Bhakti Movement", [
        "Alvars & Nayanars",
        "Kabir",
        "Guru Nanak",
        "Chaitanya",
        "Mirabai",
        "Tulsidas",
      ], "Bhakti Movement"),
      node("Sufi Movement", [
        "Silsilahs",
        "Chishti order",
        "Suhrawardi order",
      ], "Sufi Movement"),
      node("Mughal Empire", [
        "Babur to Aurangzeb",
        "Mansabdari",
        "Jagirdari",
        "Administration",
        "Revenue system",
        "Mughal art & architecture",
      ], "Mughal Empire"),
      node("Marathas", [
        "Shivaji",
        "Administration",
        "Confederacy",
      ], "Maratha Power"),
      node("Medieval Architecture", [
        "Indo-Islamic architecture",
        "Monuments",
        "Paintings",
      ]),
      node("Literature & Culture", [
        "Persian literature",
        "Regional literature",
        "Music traditions",
      ]),
    ],
    "Medieval",
  ),
  subject(
    "Geography",
    [
      node("Physical Geography", [
        node("Geomorphology", [
          "Interior of Earth",
          "Rocks",
          "Earthquakes",
          "Volcanoes",
          "Plate tectonics",
          "Mountain building",
          "Weathering",
          "Erosion",
          "Landforms",
        ], "Interior of Earth"),
        node("Climatology", [
          "Atmosphere",
          "Heat budget",
          "Pressure belts",
          "Winds",
          "Cyclones",
          "Monsoon",
          "Jet streams",
          "Climate types",
          "El Nino/La Nina",
        ]),
        node("Oceanography", [
          "Ocean relief",
          "Temperature",
          "Salinity",
          "Ocean currents",
          "Tides",
          "Coral reefs",
        ]),
      ]),
      node("Indian Physical Geography", [
        "Himalayas",
        "Peninsular plateau",
        "Plains",
        "Desert",
        "Coastal plains",
        "Islands",
        "Rivers",
        "Drainage system",
        "Soil types",
      ], "Indian Physiography"),
      node("Indian Climate", [
        "Monsoon mechanism",
        "Rainfall distribution",
        "Western disturbances",
        "Cyclones",
      ], "Indian Climate"),
      node("Resources", [
        "Minerals",
        "Energy resources",
        "Water resources",
        "Agriculture",
        "Irrigation",
      ]),
      node("Agriculture", [
        "Cropping patterns",
        "Green Revolution",
        "Agricultural regions",
        "MSP basics",
        "Major crops",
      ], "Agriculture Geography"),
      node("Human Geography", [
        "Population",
        "Migration",
        "Urbanization",
        "Settlements",
      ], "Human Geography"),
      node("Economic Geography", [
        "Industries",
        "Transport",
        "Trade",
        "Industrial regions",
      ]),
      node("Mapping", [
        "World map",
        "Indian map",
        "Important straits",
        "Passes",
        "Seas",
        "Lakes",
        "Rivers",
        "Mountains",
        "National parks",
      ], "World Mapping"),
      node("Environmental Geography", [
        "Biomes",
        "Biodiversity hotspots",
        "Desertification",
      ]),
    ],
    "Geography",
  ),
  subject(
    "Economics",
    [
      node("Basic Concepts", [
        "GDP/GNP",
        "Inflation",
        "Deflation",
        "Stagflation",
        "Fiscal deficit",
        "Revenue deficit",
        "Repo rate",
        "CRR/SLR",
        "Monetary policy",
        "Fiscal policy",
      ]),
      node("National Income", [
        "Methods of calculation",
        "Real vs nominal GDP",
        "Base year",
      ], "National Income"),
      node("Banking System", [
        "RBI",
        "Commercial banks",
        "NBFCs",
        "Payment banks",
        "Digital payments",
        "NPA",
      ], "Banking System"),
      node("Inflation", [
        "CPI",
        "WPI",
        "Causes & control",
      ], "Inflation"),
      node("Government Budget", [
        "Budget components",
        "Taxation",
        "Subsidies",
        "FRBM",
      ], "Budget"),
      node("Money Market & Capital Market", [
        "SEBI",
        "Stock exchanges",
        "Bonds",
        "G-Secs",
      ], "Financial Markets"),
      node("External Sector", [
        "Balance of Payments",
        "Exchange rate",
        "Forex reserves",
        "IMF",
        "WTO",
        "World Bank",
      ], "External Sector"),
      node("Economic Reforms", [
        "LPG reforms",
        "Disinvestment",
        "Privatization",
      ]),
      node("Agriculture Economics", [
        "MSP",
        "PDS",
        "Food security",
        "Crop insurance",
        "NABARD",
      ], "Agriculture"),
      node("Infrastructure", [
        "Power",
        "Roads",
        "Ports",
        "Telecom",
      ], "Infrastructure"),
      node("Inclusive Growth", [
        "Poverty",
        "Unemployment",
        "Human development",
        "Financial inclusion",
      ], "Poverty & Unemployment"),
      node("Government Schemes", [
        "DBT",
        "Jan Dhan",
        "MGNREGA",
        "PM-KISAN",
      ], "Government Schemes"),
      node("Current Economic Developments", [
        "Economic Survey",
        "Budget highlights",
        "Indices & reports",
      ]),
    ],
    "Economics",
  ),
  subject(
    "Environment & Ecology",
    [
      node("Ecology Basics", [
        "Ecosystem",
        "Food chain",
        "Food web",
        "Ecological pyramid",
        "Succession",
      ], "Ecology"),
      node("Biodiversity", [
        "Levels of biodiversity",
        "Endemic species",
        "Keystone species",
        "IUCN categories",
        "Red Data Book",
      ], "Biodiversity"),
      node("Protected Areas", [
        "National parks",
        "Wildlife sanctuaries",
        "Biosphere reserves",
        "Conservation reserves",
        "Community reserves",
        "Ramsar sites",
      ], "Protected Areas"),
      node("Environmental Issues", [
        "Climate change",
        "Global warming",
        "Ozone depletion",
        "Acid rain",
        "Desertification",
        "Eutrophication",
      ], "Climate Change"),
      node("Pollution", [
        "Air pollution",
        "Water pollution",
        "Soil pollution",
        "Noise pollution",
        "Solid waste",
      ], "Pollution"),
      node("Climate Change Institutions", [
        "UNFCCC",
        "Kyoto Protocol",
        "Paris Agreement",
        "COP meetings",
        "IPCC",
      ], "International Conventions"),
      node("International Environmental Organizations", [
        "UNEP",
        "IUCN",
        "WWF",
        "FAO",
      ]),
      node("Indian Environmental Laws", [
        "EPA 1986",
        "Wildlife Protection Act",
        "Forest Conservation Act",
        "Biodiversity Act",
      ], "Environmental Laws"),
      node("Species in News", [
        "Flora & fauna",
        "Conservation status",
        "Habitat",
      ]),
      node("Environmental Impact Assessment", [
        "EIA process",
        "Clearances",
      ], "Environmental Impact Assessment"),
      node("Sustainable Development", [
        "SDGs",
        "Carbon credits",
        "ESG basics",
      ]),
    ],
    "Environment",
  ),
  subject(
    "Science & Technology",
    [
      node("Basic Science", [
        node("Physics", [
          "Motion",
          "Electricity",
          "Magnetism",
          "Nuclear basics",
        ], "Physics Basics"),
        node("Chemistry", [
          "Acids & bases",
          "Polymers",
          "Radioactivity",
          "Everyday chemistry",
        ], "Chemistry Basics"),
        node("Biology", [
          "Cell",
          "Human body systems",
          "Diseases",
          "Nutrition",
          "Genetics",
        ], "Biology Basics"),
      ]),
      node("Biotechnology", [
        "DNA/RNA",
        "GM crops",
        "CRISPR",
        "Stem cells",
        "Cloning",
        "Vaccines",
      ], "Biotechnology"),
      node("Space Technology", [
        "ISRO missions",
        "Satellites",
        "Rockets",
        "Space stations",
        "Navigation systems",
      ], "Space Technology"),
      node("Defence Technology", [
        "Missiles",
        "Radar",
        "Drones",
        "Cyber warfare basics",
      ], "Defence Technology"),
      node("Computer & IT", [
        "AI",
        "Machine Learning",
        "Blockchain",
        "Quantum computing",
        "Cybersecurity",
        "Semiconductors",
      ], "Information Technology"),
      node("Nanotechnology", [
        "Applications",
        "Risks",
      ]),
      node("Health & Diseases", [
        "Viruses",
        "Vaccination",
        "Emerging diseases",
        "Public health organizations",
      ]),
      node("Nobel Prizes & Scientific Discoveries"),
      node("Current Science Developments", [
        "New missions",
        "Innovations",
        "Technologies in news",
      ], "Emerging Technologies"),
    ],
    "Science & Tech",
  ),
  subject(
    "Art & Culture",
    [
      node("Indian Architecture", [
        node("Buddhist Architecture", [
          "Stupas",
          "Chaityas",
          "Viharas",
        ]),
        node("Temple Architecture", [
          "Nagara",
          "Dravida",
          "Vesara",
        ]),
        node("Indo-Islamic Architecture", [
          "Arches",
          "Domes",
          "Minars",
        ]),
      ], "Architecture"),
      node("Sculpture", [
        "Gandhara",
        "Mathura",
        "Amaravati",
        "Chola bronzes",
      ], "Sculpture"),
      node("Paintings", [
        "Ajanta",
        "Mughal paintings",
        "Rajput paintings",
        "Pahari paintings",
      ], "Paintings"),
      node("Music", [
        node("Classical Music", [
          "Hindustani",
          "Carnatic",
          "Gharanas",
        ]),
        node("Instruments", [
          "String",
          "Percussion",
          "Wind instruments",
        ]),
      ], "Music"),
      node("Dance Forms", [
        node("Classical Dances", [
          "Bharatanatyam",
          "Kathak",
          "Kathakali",
          "Kuchipudi",
          "Odissi",
          "Manipuri",
          "Mohiniyattam",
          "Sattriya",
        ]),
        node("Folk Dances", [
          "State-wise folk dances",
        ]),
      ], "Dance"),
      node("Puppetry", [
        "Types of puppetry",
      ]),
      node("Martial Arts", [
        "Kalaripayattu",
        "Silambam",
        "Thang-Ta",
      ]),
      node("Religion & Philosophy", [
        "Hindu philosophies",
        "Buddhism",
        "Jainism",
        "Sikhism",
        "Sufism",
        "Bhakti traditions",
      ], "Religion & Philosophy"),
      node("Fairs & Festivals", [
        "State festivals",
        "Religious festivals",
        "Tribal festivals",
      ]),
      node("UNESCO Heritage", [
        "World Heritage Sites",
        "Intangible heritage",
      ], "UNESCO Heritage"),
      node("Literature", [
        "Vedas",
        "Epics",
        "Sangam literature",
        "Medieval literature",
      ], "Literature"),
      node("Handicrafts & Textiles", [
        "GI tags",
        "Regional crafts",
        "Handloom traditions",
      ]),
      node("Buddhism & Jainism Art", [
        "Symbols",
        "Councils",
        "Architecture",
      ]),
    ],
    "Art & Culture",
  ),
  subject(
    "Current Affairs",
    [
      node("Polity Current Affairs", [
        "Bills",
        "Acts",
        "Judgments",
        "Constitutional issues",
      ]),
      node("Economy Current Affairs", [
        "RBI updates",
        "Budget",
        "Economic Survey",
        "Reports & indices",
      ]),
      node("Environment Current Affairs", [
        "Species in news",
        "Climate summits",
        "Protected areas",
      ]),
      node("International Relations", [
        "Organizations",
        "Groupings",
        "Summits",
        "Agreements",
      ]),
      node("Science & Tech Current Affairs", [
        "Space missions",
        "AI developments",
        "Health discoveries",
      ]),
      node("Government Schemes", [
        "Ministries",
        "Objectives",
        "Beneficiaries",
      ]),
      node("Awards & Reports", [
        "Nobel Prize",
        "Global indices",
        "Important reports",
      ]),
      node("Places in News", [
        "Countries",
        "Seas",
        "Straits",
        "Conflict regions",
      ]),
    ],
  ),
  subject(
    "Important Prelims Micro-Topics",
    [
      node("Acts & Years"),
      node("Committees & Commissions"),
      node("Constitutional Articles"),
      node("National Parks & Species"),
      node("GI Tags"),
      node("Important Maps"),
      node("Tribes"),
      node("Classical Dances"),
      node("Crops & Conditions"),
      node("Ramsar Sites"),
      node("Biosphere Reserves"),
      node("Scientific Terms"),
      node("Economic Indicators"),
      node("Government Schemes & Ministries"),
      node("International Organizations Headquarters"),
      node("Important Passes & Straits"),
      node("Historical Sessions & Movements"),
    ],
  ),
];

export function getSubtopicOptionsForTopic(
  subjectValue: string,
  topicValue: string,
): SyllabusTrackerNodeItem[] {
  const matchedSubject = syllabusTrackerTree.find((item) =>
    matchesNodeTitle(item, subjectValue),
  );
  if (!matchedSubject) return [];

  const matchedTopic = matchedSubject.chapters.find((item) =>
    matchesNodeTitle(item, topicValue),
  );

  return matchedTopic?.children || [];
}
