import type { RawSubjectNode } from "../types";

export const RAW_D =
[
  {
    "id": "I",
    "p": "pm",
    "label": "Physics – Fundamental Concepts & Everyday Applications",
    "children": [
      {
        "p": "pm2",
        "label": "Mechanics & Properties of Matter",
        "children": [
          {
            "label": "Newton's Laws & Related Concepts",
            "children": [
              { "label": "First Law (Inertia), Second (F=ma), Third (Action-Reaction).\nMomentum conservation, impulse." },
              { "label": "Friction: static > kinetic > rolling; useful and harmful; lubricants reduce friction." },
              { "label": "MAINS: Application in vehicle safety (seat belts, airbags – increase time of impact to reduce force)." }
            ]
          },
          {
            "label": "Gravitation",
            "children": [
              { "label": "Universal law, acceleration due to gravity (g) varies with latitude, altitude, depth." },
              { "label": "Weightlessness in free fall; satellites orbit due to centripetal force provided by gravity." },
              { "label": "Escape velocity (11.2 km/s for Earth), geostationary satellites (36,000 km altitude)." }
            ]
          },
          {
            "label": "Fluid Mechanics",
            "children": [
              { "label": "Pascal's law (hydraulic press), Archimedes principle (buoyancy, submarines, ships)." },
              { "label": "Bernoulli's theorem: faster fluid → lower pressure (airplane lift, atomizer, venturi meter)." },
              { "label": "Surface tension & capillarity (meniscus, capillary rise in plants, detergents reduce tension)." }
            ]
          },
          {
            "label": "Elasticity",
            "children": [
              { "label": "Stress, strain, Hooke's law, Young's modulus.\nElastic vs plastic deformation." }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Heat & Thermodynamics",
        "children": [
          {
            "label": "Temperature & Heat Transfer",
            "children": [
              { "label": "Scales: Celsius, Fahrenheit, Kelvin (absolute zero = -273.15°C)." },
              { "label": "Conduction, convection, radiation.\nBlack body radiation; Stefan-Boltzmann law (E ∝ T⁴)." },
              { "label": "Specific heat capacity (water has high specific heat → climate moderation).\nLatent heat (phase change without temperature change)." }
            ]
          },
          {
            "label": "Laws of Thermodynamics",
            "children": [
              { "label": "Zeroth: thermal equilibrium.\nFirst: energy conservation (ΔU = Q - W).\nSecond: entropy always increases; heat flows hot to cold; no perfect engine." },
              { "label": "Third: absolute zero unreachable.\nApplication: refrigerators, heat engines, AC.\nCarnot cycle: ideal efficiency, no real engine reaches it." }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Waves & Sound",
        "children": [
          {
            "label": "Wave Characteristics",
            "children": [
              { "label": "Transverse (light, water ripples) vs longitudinal (sound, seismic P).\nFrequency, wavelength, amplitude, velocity." },
              { "label": "Doppler effect: shift in frequency due to relative motion (siren, radar, redshift/blueshift)." }
            ]
          },
          {
            "label": "Sound",
            "children": [
              { "label": "Speed: solid > liquid > gas.\nSupersonic (Mach number >1).\nSonic boom." },
              { "label": "Ultrasound (>20 kHz): medical imaging, sonar, cleaning.\nInfrasound (<20 Hz): elephant communication, earthquake monitoring." },
              { "label": "Resonance: sympathetic vibration (bridge collapse).\nMusical instruments: standing waves, harmonics." }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Optics & Light",
        "children": [
          {
            "label": "Geometrical Optics",
            "children": [
              { "label": "Reflection: law, plane & spherical mirrors, real/virtual images." },
              { "label": "Refraction: Snell's law, refractive index, total internal reflection (optical fibres, mirage, diamond sparkle)." },
              { "label": "Lenses: convex (converging), concave (diverging).\nPower of lens (dioptre).\nHuman eye defects: myopia (concave), hypermetropia (convex), presbyopia, astigmatism." }
            ]
          },
          {
            "label": "Physical Optics",
            "children": [
              { "label": "Interference (thin film colours), diffraction (CD/DVD patterns), polarization (sunglasses, LCD)." },
              { "label": "Scattering: Rayleigh (blue sky, red sunset – shorter λ scattered more), Tyndall effect (colloids)." }
            ]
          },
          {
            "label": "Electromagnetic Spectrum",
            "children": [
              { "label": "In order of increasing λ: Gamma, X‑ray, UV, Visible (VIBGYOR), IR, Microwave, Radio." },
              { "label": "Applications: Gamma (cancer therapy, sterilisation), X‑ray (medical imaging, security), UV (water purification, vitamin D), IR (night vision, remote sensing), Microwave (radar, cooking), Radio (broadcasting)." },
              { "label": "TRAP: IR is used for night vision, not UV.\nUV is used for purification; X‑ray for bone scans." }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Electricity & Magnetism",
        "children": [
          {
            "label": "Electric Circuits",
            "children": [
              { "label": "Ohm's law (V=IR), resistance, series/parallel, heating effect (electric iron, fuse)." },
              { "label": "AC vs DC: DC constant direction, AC alternates (50 Hz in India).\nTransformers work on AC." }
            ]
          },
          {
            "label": "Magnetism",
            "children": [
              { "label": "Magnetic field lines, Earth's magnetism (dynamo effect).\nElectromagnets (temporary, iron core)." },
              { "label": "Permanent magnets: ferromagnetic materials.\nApplications: MRI, maglev trains, electric motors/generators." }
            ]
          },
          {
            "label": "Electromagnetic Induction",
            "children": [
              { "label": "Faraday's law: changing magnetic field induces current.\nGenerator (mechanical → electrical), motor (electrical → mechanical)." },
              { "label": "Induction cooktop, wireless charging, metal detectors." }
            ]
          },
          {
            "label": "Semiconductors & Electronics",
            "children": [
              { "label": "Semiconductors: intrinsic vs extrinsic, doping (n‑type: excess electrons, p‑type: holes).\np‑n junction diode (rectifier)." },
              { "label": "Light Emitting Diode (LED): efficient light source.\nPhotodiode: light sensor.\nSolar cell: photovoltaic effect." },
              { "label": "Transistor: switch/amplifier; IC (Integrated Circuit) – miniaturised electronic circuit.\nSuperconductivity: zero resistance below critical temp, Meissner effect; MRI, maglev, particle accelerators." }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Modern Physics",
        "children": [
          {
            "label": "Atomic & Nuclear Physics",
            "children": [
              { "label": "Atomic structure: nucleus (proton, neutron), electron shells.\nIsotopes, isobars, isotones." },
              { "label": "Radioactivity: alpha (paper stop), beta (thin metal), gamma (thick lead/concrete).\nHalf-life." },
              { "label": "Nuclear fission: heavy nucleus splits (U-235), chain reaction, nuclear reactor, atomic bomb.\nNuclear fusion: light nuclei combine (hydrogen to helium), Sun's energy, H‑bomb, ITER project." },
              { "label": "Applications: nuclear power (Kudankulam, Tarapur), radiotherapy (Co-60), carbon dating (C-14), nuclear medicine (I-131 for thyroid)." }
            ]
          },
          {
            "label": "Quantum Mechanics & Relativity",
            "children": [
              { "label": "Wave-particle duality (light & electrons).\nPhotoelectric effect (Einstein, solar panels)." },
              { "label": "Special relativity: E=mc², time dilation, length contraction.\nGeneral relativity: gravity as curvature of spacetime (GPS correction)." },
              { "label": "Gravitational waves: ripples in spacetime, detected by LIGO; LIGO‑India project.\nHiggs boson: 'God particle', gives mass, discovered at CERN's Large Hadron Collider (2012)." }
            ]
          },
          {
            "label": "Lasers",
            "children": [
              { "label": "LASER: Light Amplification by Stimulated Emission of Radiation.\nProperties: monochromatic, coherent, directional." },
              { "label": "Applications: fiber optics communication, surgery (LASIK), cutting/welding, printers, barcode scanners, LIDAR." }
            ]
          },
          {
            "label": "Communication Technologies",
            "children": [
              { "label": "Modulation: AM (amplitude), FM (frequency) – needed for long‑distance transmission.\nRadar: Radio Detection and Ranging (air traffic, weather).\nLiDAR: Light Detection and Ranging (3D mapping, autonomous vehicles).\nSonar: Sound Navigation and Ranging (underwater)." }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "II",
    "p": "pm",
    "label": "Chemistry – Fundamentals & Everyday Applications",
    "children": [
      {
        "p": "pm2",
        "label": "Basic Concepts & Atomic Structure",
        "children": [
          {
            "label": "Atoms & Molecules",
            "children": [
              { "label": "Atomic number (Z), mass number (A).\nMole concept, Avogadro's number (6.022×10²³)." },
              { "label": "Chemical bonding: ionic (transfer), covalent (sharing), metallic (sea of electrons).\nHydrogen bonding (water, DNA)." }
            ]
          },
          {
            "label": "Periodic Table",
            "children": [
              { "label": "Groups (vertical) and periods (horizontal).\nTrends: electronegativity, ionization energy, atomic size." },
              { "label": "Key groups: alkali metals (Group 1), alkaline earth (2), halogens (17), noble gases (18)." }
            ]
          },
          {
            "label": "Acids, Bases & Salts",
            "children": [
              { "label": "pH scale (0-14).\nAcid + base → salt + water.\nImportant: stomach acid (HCl), antacids (Mg(OH)₂)." },
              { "label": "Buffer solutions maintain pH (blood buffering).\nSoaps: sodium/potassium salts of fatty acids; micelle formation; do not work in hard water (Ca²⁺/Mg²⁺ precipitate).\nDetergents: synthetic, work in hard water." }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Important Chemicals & Their Uses",
        "children": [
          {
            "label": "Industrial & Household Chemicals",
            "children": [
              { "label": "Baking soda (NaHCO₃) – antacid, fire extinguisher.\nWashing soda (Na₂CO₃) – water softener.\nBleaching powder (CaOCl₂) – disinfectant." },
              { "label": "Plaster of Paris (CaSO₄·½H₂O) – setting involves hydration.\nGypsum (CaSO₄·2H₂O) – cement, soil conditioner." },
              { "label": "Common salt (NaCl) – preservation.\nSodium hydroxide (NaOH, caustic soda) – soap, paper.\nHydrochloric acid (HCl) – cleaning." }
            ]
          },
          {
            "label": "Industrial Processes & Materials",
            "children": [
              { "label": "Haber process: N₂ + H₂ → NH₃ (ammonia for fertilizers).\nOstwald process: NH₃ → HNO₃ (nitric acid).\nContact process: SO₂ → SO₃ → H₂SO₄ (sulphuric acid)." },
              { "label": "Glass: soda‑lime glass (ordinary), borosilicate glass (Pyrex, heat‑resistant).\nCement: limestone (CaCO₃), clay, gypsum; sets via hydration." },
              { "label": "Water hardness: temporary (Ca(HCO₃)₂, removed by boiling) and permanent (CaSO₄, MgCl₂, removed by washing soda or ion exchange)." }
            ]
          },
          {
            "label": "Polymers & Plastics",
            "children": [
              { "label": "Natural polymers: cellulose, starch, proteins, DNA, rubber.\nSynthetic: polyethylene (PE), PVC, nylon, Teflon (PTFE, non-stick), Bakelite (thermosetting)." },
              { "label": "Biodegradable vs non-biodegradable.\nMicroplastics as pollutant." },
              { "label": "MAINS: Plastic waste management, ban on single-use plastics, alternatives (bioplastics)." }
            ]
          },
          {
            "label": "Fertilizers & Pesticides",
            "children": [
              { "label": "NPK fertilizers (Nitrogen, Phosphorus, Potassium).\nUrea (highest N content).\nOveruse leads to eutrophication." },
              { "label": "Pesticides: insecticides (DDT – persistent organic pollutant), herbicides, fungicides.\nBio-pesticides as eco-friendly alternative." }
            ]
          },
          {
            "label": "Metals & Alloys",
            "children": [
              { "label": "Important alloys: Stainless steel (Fe+Cr+Ni), Brass (Cu+Zn), Bronze (Cu+Sn), Solder (Pb+Sn), Amalgam (Hg+metal)." },
              { "label": "Corrosion: rusting of iron (requires O₂ + H₂O).\nPrevention: galvanization (Zn coating), painting, alloying." }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Fuels & Combustion",
        "children": [
          {
            "label": "Types of Fuels",
            "children": [
              { "label": "Solid (coal, wood), liquid (petroleum, diesel, kerosene), gas (CNG, LPG, hydrogen).\nCalorific value." },
              { "label": "CNG (methane) – clean burning, used in vehicles.\nLPG (propane+butane) – cooking.\nHydrogen – highest calorific value, clean fuel (water product)." }
            ]
          },
          {
            "label": "Combustion & Fire Safety",
            "children": [
              { "label": "Fire triangle: fuel, oxygen, heat.\nTypes of fire extinguishers: water (Class A), CO₂ (Class B/C), foam, dry powder." }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Environmental Chemistry",
        "children": [
          {
            "label": "Pollutants",
            "children": [
              { "label": "Air: SOx, NOx (acid rain), CO (toxic, binds hemoglobin), particulate matter (PM2.5, PM10), ozone (good up, bad down)." },
              { "label": "Water: heavy metals (Pb, Hg, Cd), nitrates, phosphates (eutrophication).\nBOD (Biochemical Oxygen Demand) measures pollution." },
              { "label": "Ozone depletion: CFCs (chlorofluorocarbons) breakdown O₃ in stratosphere.\nMontreal Protocol (1987) phased out CFCs." },
              { "label": "MAINS: Climate change mitigation, green chemistry principles." }
            ]
          },
          {
            "label": "MAINS: Green Chemistry & Sustainability",
            "children": [
              { "label": "Principles of Green Chemistry – atom economy, designing safer chemicals, and reducing hazardous by-products to achieve sustainable industrial processes." },
              { "label": "The life-cycle analysis of plastics – the persistence of non-biodegradable synthetic polymers and the cascading ecological impacts of microplastics entering the food web." }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "III",
    "p": "pm",
    "label": "Biology – Fundamental Concepts & Applications",
    "children": [
      {
        "p": "pm2",
        "label": "Cell Biology & Genetics",
        "children": [
          {
            "label": "Cell – The Basic Unit",
            "children": [
              { "label": "Prokaryotic (no nucleus, e.g., bacteria) vs Eukaryotic (nucleus, e.g., plants, animals).\nOrganelles: mitochondria (powerhouse), chloroplast (photosynthesis), ribosomes (protein synthesis)." }
            ]
          },
          {
            "label": "DNA & RNA",
            "children": [
              { "label": "DNA: double helix, bases A-T, G-C.\nRNA: single-stranded, A-U, G-C.\nmRNA, tRNA, rRNA." },
              { "label": "Central dogma: DNA → RNA → Protein.\nCRISPR-Cas9: gene editing tool derived from bacteria." }
            ]
          },
          {
            "label": "Cell Division & Cancer",
            "children": [
              { "label": "Mitosis (identical daughter cells, growth/repair), Meiosis (gametes, halving chromosomes, variation)." },
              { "label": "Cancer: uncontrolled cell division.\nCarcinogens, chemotherapy, radiation therapy, immunotherapy." }
            ]
          },
          {
            "label": "Classical Genetics",
            "children": [
              { "label": "Mendel’s laws: Law of Dominance, Law of Segregation, Law of Independent Assortment." },
              { "label": "Sex determination: XY system; sex-linked disorders: haemophilia, colour blindness." },
              { "label": "Blood groups: ABO system, Rh factor; universal donor (O−), universal recipient (AB+)." },
              { "label": "Genetic disorders: Down syndrome (trisomy 21), Thalassemia, Sickle cell anaemia." }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Human Physiology & Health",
        "children": [
          {
            "label": "Organ Systems Overview",
            "children": [
              { "label": "Digestive: enzymes, absorption in small intestine.\nRespiratory: O₂/CO₂ exchange in alveoli; hemoglobin carries oxygen.\nCellular respiration: aerobic (glucose + O₂ → CO₂ + H₂O + ATP) in mitochondria; anaerobic (fermentation) in muscles (lactic acid) and yeast (ethanol).\nATP as energy currency." },
              { "label": "Circulatory: heart (4 chambers), arteries (away), veins (to heart).\nBlood: RBC (oxygen), WBC (immunity), platelets (clotting)." },
              { "label": "Nervous: brain (cerebrum, cerebellum, medulla), spinal cord, neurons, synapse, reflex arc." },
              { "label": "Endocrine: hormones – insulin (pancreas, lowers glucose), thyroxine (metabolism), adrenaline (stress)." }
            ]
          },
          {
            "label": "Vitamins & Minerals",
            "children": [
              { "label": "Water‑soluble vitamins: B‑complex (B₁‑thiamine, B₂‑riboflavin, B₃‑niacin, B₆, B₁₂, folic acid), C (ascorbic acid).\nFat‑soluble: A, D, E, K." },
              { "label": "Deficiency: night blindness (A), beriberi (B₁), pellagra (B₃), scurvy (C), rickets (D), etc." },
              { "label": "Minerals: iron (anaemia), iodine (goitre), calcium (osteoporosis)." }
            ]
          },
          {
            "label": "Immunity & Vaccines",
            "children": [
              { "label": "Innate vs adaptive.\nAntibodies, antigens.\nVaccination: introduces weakened/killed pathogen to stimulate memory cells." },
              { "label": "Types: live-attenuated (MMR), inactivated (polio - Salk), mRNA vaccines (COVID-19), viral vector." },
              { "label": "MAINS: Vaccine development, herd immunity, public health importance." }
            ]
          },
          {
            "label": "Major Diseases & Pathogens",
            "children": [
              { "label": "Viral: COVID-19 (SARS-CoV-2), HIV/AIDS (retrovirus), Hepatitis B/C, Dengue (Aedes mosquito), Chikungunya, Zika." },
              { "label": "Bacterial: Tuberculosis (Mycobacterium), Typhoid (Salmonella), Cholera (Vibrio), Leprosy.\nAntibiotics work on bacteria, not viruses." },
              { "label": "Protozoan: Malaria (Plasmodium, Anopheles mosquito), Kala-azar (Leishmania), Amoebiasis." },
              { "label": "Fungal: ringworm, candidiasis.\nPrion: mad cow disease (CJD)." }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Plant Biology",
        "children": [
          {
            "label": "Photosynthesis & Transport",
            "children": [
              { "label": "Photosynthesis: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂ (chlorophyll, chloroplast; light & dark reactions)." },
              { "label": "Transpiration pull, cohesion‑tension theory, xylem (water) and phloem (food)." }
            ]
          },
          {
            "label": "Plant Hormones & Tropisms",
            "children": [
              { "label": "Auxins: apical dominance, phototropism.\nGibberellins: stem elongation.\nCytokinins: cell division.\nEthylene: fruit ripening.\nAbscisic acid: stress hormone." },
              { "label": "Tropisms: phototropism (light), geotropism (gravity), hydrotropism (water)." }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Biotechnology & its Applications",
        "children": [
          {
            "label": "Basic Techniques",
            "children": [
              { "label": "Genetic Engineering: recombinant DNA technology, restriction enzymes, plasmids." },
              { "label": "PCR (Polymerase Chain Reaction): amplify DNA.\nGel Electrophoresis: separate DNA fragments.\nDNA fingerprinting: forensic, paternity." },
              { "label": "Bt Crops (Bacillus thuringiensis gene for pest resistance), Golden Rice (beta-carotene/Vitamin A)." }
            ]
          },
          {
            "label": "Stem Cells & Cloning",
            "children": [
              { "label": "Embryonic (pluripotent) vs adult stem cells (multipotent).\nInduced pluripotent stem cells (iPSCs)." },
              { "label": "Therapeutic cloning vs reproductive cloning (Dolly the sheep, 1996).\nEthical concerns." },
              { "label": "MAINS: Potential in regenerative medicine, organ transplant, ethical frameworks." }
            ]
          },
          {
            "label": "Transgenic Organisms & GM Crops",
            "children": [
              { "label": "Plants: Bt Cotton, Bt Brinjal, herbicide-tolerant (HT) crops.\nAnimals: transgenic mice for research." },
              { "label": "Regulation: GEAC (Genetic Engineering Appraisal Committee) under MoEFCC.\nConcerns: biosafety, impact on biodiversity, farmer rights." }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Microorganisms & Food",
        "children": [
          {
            "label": "Useful Microbes",
            "children": [
              { "label": "Fermentation: Yeast (Saccharomyces) – bread, alcohol.\nBacteria: Lactobacillus – curd, yogurt, probiotics." },
              { "label": "Antibiotics: Penicillium notatum (Fleming, 1928).\nSoil bacteria: Streptomyces (streptomycin)." }
            ]
          },
          {
            "label": "Harmful Microbes",
            "children": [
              { "label": "Food spoilage, food poisoning (Salmonella, Clostridium).\nPreservation methods: refrigeration, pasteurization (milk), canning, salting." }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "IV",
    "p": "pm",
    "label": "Information Technology, Computers & Communication",
    "children": [
      {
        "p": "pm2",
        "label": "Computer Fundamentals",
        "children": [
          {
            "label": "Hardware & Software",
            "children": [
              { "label": "CPU (ALU, Control Unit), RAM (volatile), ROM (non-volatile, BIOS), Storage (HDD, SSD)." },
              { "label": "Input/Output devices.\nOperating System (Windows, Linux, Android).\nApplication software vs system software.\nOpen source software (e.g., Linux) vs proprietary software." },
              { "label": "Number systems: binary, octal, hexadecimal.\nSupercomputers: India's PARAM series, Pratyush (weather), Mihir (weather)." }
            ]
          },
          {
            "label": "Networking & Internet",
            "children": [
              { "label": "IP address (IPv4 vs IPv6), DNS, URL, HTTP/HTTPS (SSL/TLS encryption)." },
              { "label": "Cloud computing: SaaS, PaaS, IaaS.\nEdge computing.\nIoT (Internet of Things): smart devices, sensors, actuators.\nDark web / Deep web: deep web is part of internet not indexed by search engines; dark web requires special software (Tor) for anonymity." }
            ]
          },
          {
            "label": "Artificial Intelligence & Emerging Tech",
            "children": [
              { "label": "AI/ML: supervised, unsupervised, reinforcement learning.\nDeep learning, neural networks, NLP (ChatGPT)." },
              { "label": "Blockchain: distributed ledger, immutable, consensus mechanisms (PoW, PoS).\nApplications: cryptocurrency, supply chain, land records." },
              { "label": "Big Data (3Vs: volume, velocity, variety), Data analytics, 3D printing (additive manufacturing)." }
            ]
          },
          {
            "label": "AI Governance & Deepfakes",
            "children": [
              { "label": "Contrast discriminative AI with Generative AI (LLMs like ChatGPT).\nDeepfakes pose severe risks to electoral integrity, privacy, and social cohesion.\nCountermeasures include digital watermarking and algorithmic detection." },
              { "label": "IndiaAI Mission (2024): ₹10,372 crore outlay via PPP. Key components: 10,000+ GPUs for compute capacity, development of indigenous Large Multimodal Models (LMMs), and IndiaAI Datasets Platform to democratize AI tech." },
              { "label": "Governance: NITI Aayog’s 'Responsible AI for All' principles – balancing innovation with safety, inclusivity, and privacy. Need to evaluate balance between algorithmic innovation and data privacy." }
            ]
          },
          {
            "label": "Quantum Technology",
            "children": [
              { "label": "Quantum computing: qubits, superposition, entanglement.\nNational Quantum Mission (NQM, 2023‑2031): targets 50‑1000 physical qubits; inter‑city QKD over 2000 km; 4 Thematic Hubs (T‑Hubs) for sensing, materials, cryptography." },
              { "label": "Applications: Quantum Key Distribution (QKD) for unhackable communications, relying on quantum mechanics rather than mathematical complexity." }
            ]
          },
          {
            "label": "Data Privacy & Regulatory Framework",
            "children": [
              { "label": "Digital Personal Data Protection (DPDP) Act, 2023: establishes Data Principals, Data Fiduciaries, and a Data Protection Board; penalty-based compliance model. Governs data flow from frontend frameworks and GET requests – mandates localization, explicit consent." },
              { "label": "Critical Information Infrastructure (CII): protected under IT Act; NCIIPC oversees protection of power grids, banking, etc." },
              { "label": "Malware, phishing, DDoS attacks.\nFirewall, encryption, digital signature.\nCERT-In, National Cyber Security Policy." }
            ]
          },
          {
            "label": "Critical Infrastructure & Telecom",
            "children": [
              { "label": "Open RAN (O-RAN): breaks proprietary hardware lock-in in telecom; aids Bharat 6G Vision.\nIndigenous 5G/6G development." },
              { "label": "DigiLocker, Aadhaar (UIDAI), UPI as digital public infrastructure." }
            ]
          },
          {
            "label": "MAINS: IT, Ethics & Society",
            "children": [
              { "label": "Ethical dimensions of Artificial Intelligence – algorithmic bias, the 'black box' problem in decision-making, and long-term socio-economic impacts like structural unemployment." },
              { "label": "The conceptual divide between classical computing (binary states) and quantum computing (superposition and entanglement), and its theoretical implications for breaking modern cryptography." },
              { "label": "The socio-economic reality of the 'Digital Divide' – how lack of access to foundational IT infrastructure and digital literacy exacerbates existing inequalities in education and healthcare." }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Communication Technology",
        "children": [
          {
            "label": "Wireless & Mobile",
            "children": [
              { "label": "Generations: 1G (analog), 2G (GSM, CDMA), 3G, 4G/LTE, 5G (high speed, low latency, IoT)." },
              { "label": "Bluetooth, Wi-Fi (IEEE 802.11), Li-Fi (visible light communication).\nNFC (contactless payment)." }
            ]
          },
          {
            "label": "Satellite Communication & GPS",
            "children": [
              { "label": "Geostationary (GEO), Medium Earth Orbit (MEO – GPS, NavIC), Low Earth Orbit (LEO – Starlink)." },
              { "label": "GPS (USA), GLONASS (Russia), Galileo (EU), BeiDou (China), NavIC (India – 7 satellites)." }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "V",
    "p": "pm",
    "label": "Space Technology & Astronomy",
    "children": [
      {
        "p": "pm2",
        "label": "Indian Space Programme – ISRO",
        "children": [
          {
            "label": "Launch Vehicles (GSLV, PSLV, SSLV)",
            "children": [
              { "label": "PSLV (Polar Satellite Launch Vehicle) – workhorse, used for Chandrayaan-1, Mangalyaan.\nGSLV (Geosynchronous) – heavy lift, cryogenic upper stage." },
              { "label": "SSLV – Small Satellite Launch Vehicle.\nReusable launch vehicle (RLV-TD) tested." },
              { "label": "TRAP: PSLV puts satellites in LEO/SSO; GSLV in GTO." }
            ]
          },
          {
            "label": "Satellite Types & Series",
            "children": [
              { "label": "Communication: INSAT/GSAT series (geostationary, weather, telecom).\nEarth Observation: IRS, Cartosat, RISAT, Oceansat.\nNavigation: NavIC (IRNSS – 7 satellites).\nScience: Astrosat (multi-wavelength), Chandrayaan, Mangalyaan." }
            ]
          },
          {
            "label": "Major Missions",
            "children": [
              { "label": "Chandrayaan-1 (2008): discovered water molecules on Moon.\nChandrayaan-2 (2019): orbiter successful, lander (Vikram) failed.\nChandrayaan-3 (2023): soft landing near south pole (Shiv Shakti point); demonstrated autonomous landing and lunar seismology." },
              { "label": "Mangalyaan (MOM, 2013): Mars orbiter, first attempt success.\nGaganyaan: proposed crewed mission.\nAditya-L1: solar observatory at Lagrange L1; Halo orbit for uninterrupted solar corona observation to mitigate space weather impacts." },
              { "label": "Astrosat: multi-wavelength space observatory.\nNavIC: Indian regional navigation system." }
            ]
          },
          {
            "label": "Space Sector Reforms & Policy",
            "children": [
              { "label": "Indian Space Policy 2023: ISRO focuses on deep space R&D; IN-SPACe acts as single‑window independent regulator for Non‑Governmental Entities (NGEs); NSIL handles commercialization of space technologies. 100% FDI allowed in specific space domains." },
              { "label": "SpaDeX (Space Docking Experiment): necessary for future Bharatiya Antariksha Station (BAS)." }
            ]
          },
          {
            "label": "Space Debris & Sustainability",
            "children": [
              { "label": "Project NETRA (Network for space object Tracking and Analysis): early warning system to prevent satellite collisions, mitigating Kessler Syndrome." },
              { "label": "Space sustainability: debris mitigation guidelines, active removal.\nKessler Syndrome: cascading collision effect emphasizing need for global space commons governance." }
            ]
          },
          {
            "label": "MAINS: Space Technology & Society",
            "children": [
              { "label": "Socio-economic utility of space technology in developing nations – application of earth observation and communication satellites in tele-medicine, tele-education, crop forecasting, and disaster management." },
              { "label": "The strategic and functional differences between Low Earth Orbit (LEO) for low-latency communication/imaging and Geostationary Orbit (GEO) for continuous regional coverage." }
            ]
          },
          {
            "label": "Key ISRO Centres",
            "children": [
              { "label": "VSSC (Thiruvananthapuram) – rockets.\nUR Rao Satellite Centre (Bengaluru) – satellites.\nLPSC (Valiamala) – propulsion.\nSDSC (Sriharikota) – launch.\nISTRAC (Bengaluru) – tracking." }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Global Space Missions & Organisations",
        "children": [
          {
            "label": "Major Space Agencies",
            "children": [
              { "label": "NASA (USA), ESA (Europe), Roscosmos (Russia), CNSA (China), JAXA (Japan), ISRO (India)." }
            ]
          },
          {
            "label": "Important Missions & Telescopes",
            "children": [
              { "label": "International Space Station (ISS).\nJames Webb Space Telescope (JWST) – infrared, L2 point.\nHubble – optical.\nChandra – X‑ray.\nArtemis – NASA's Moon programme." }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Orbits & Space Concepts",
        "children": [
          {
            "label": "Orbital Mechanics",
            "children": [
              { "label": "Escape velocity, orbital velocity.\nLagrange points (L1-L5): stable points in Sun-Earth system; JWST at L2, Aditya-L1 at L1." },
              { "label": "Types of orbits: LEO, MEO, GEO, SSO (sun-synchronous, used for earth observation)." }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "VI",
    "p": "pm",
    "label": "Defence Technology & Security",
    "children": [
      {
        "p": "pm2",
        "label": "Missiles & Weapon Systems",
        "children": [
          {
            "label": "India's Missile Programme",
            "children": [
              { "label": "Integrated Guided Missile Development Programme (IGMDP) by DRDO: Prithvi (surface-to-surface), Agni (ballistic, intercontinental), Akash (surface-to-air), Trishul, Nag (anti-tank)." },
              { "label": "BrahMos: supersonic cruise missile (India-Russia JV).\nAstra: beyond visual range air-to-air missile." },
              { "label": "Ballistic vs Cruise: Ballistic follows sub-orbital trajectory (exo-atmospheric), Cruise flies within atmosphere (stealthy, terrain hugging)." }
            ]
          },
          {
            "label": "Missile Dynamics & Hypersonics",
            "children": [
              { "label": "Ballistic missiles: exo-atmospheric Keplerian arc; e.g., Agni-V with MIRV (Multiple Independently Targetable Reentry Vehicles)." },
              { "label": "Cruise missiles: intra-atmospheric, stealthy; e.g., BrahMos." },
              { "label": "Hypersonic missiles: speed > Mach 5; Hypersonic Glide Vehicles (HGVs) offer unpredictable maneuverability; Scramjet propulsion." }
            ]
          },
          {
            "label": "Nuclear Triad & Submarines",
            "children": [
              { "label": "Nuclear triad: land (Agni), air (fighter jets), sea (Arihant class SSBN)." },
              { "label": "INS Arihant: first indigenous nuclear submarine.\nINS Vikrant: indigenous aircraft carrier." }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Aircraft & UAVs",
        "children": [
          { "label": "Tejas: Light Combat Aircraft (LCA).\nRafale, Sukhoi Su-30 MKI.\nApache, Chinook helicopters." },
          { "label": "UAVs/Drones: categories (nano, micro, small, medium, large).\nApplications: surveillance, agriculture, delivery.\nDRDO Rustom, Heron, Predator." },
          { "label": "MAINS: Drone Rules 2021, use in agriculture, security concerns." }
        ]
      },
      {
        "p": "pm2",
        "label": "Advanced Technologies",
        "children": [
          { "label": "Stealth technology: radar‑absorbent materials and shapes to reduce radar cross‑section (e.g., B‑2 Spirit, F‑35)." },
          { "label": "Hypersonic missiles: speed > Mach 5, manoeuvrable, scramjet propulsion (e.g., Avangard, Zircon)." }
        ]
      },
      {
        "p": "pm2",
        "label": "Naval Tech & Sub-surface",
        "children": [
          { "label": "Air-Independent Propulsion (AIP): allows conventional diesel-electric submarines (Project 75 Kalvari-class) to remain submerged significantly longer without snorkeling, enhancing stealth." }
        ]
      },
      {
        "p": "pm2",
        "label": "Modern Warfare & Innovation",
        "children": [
          { "label": "Directed Energy Weapons (DEWs): High-Power Microwaves critical for anti-drone solutions (e.g., DRDO's D4 system)." },
          { "label": "iDEX (Innovations for Defence Excellence): framework leveraging MSMEs and startups to achieve Atmanirbhar Bharat in defence manufacturing." }
        ]
      },
      {
        "p": "pm2",
        "label": "MAINS: Defence Strategy & Deterrence",
        "children": [
          { "label": "The strategic doctrine of the Nuclear Triad – establishing survivability and a credible 'second-strike' capability to ensure effective nuclear deterrence." },
          { "label": "The concept of 'Dual-Use Technologies' (e.g., space launch vehicles and nuclear enrichment) and the challenges of global non-proliferation regimes." },
          { "label": "Asymmetric warfare and cyber security – how malware and DDoS attacks target Critical Information Infrastructure (CII) like power grids and financial systems, bypassing traditional military defenses." }
        ]
      },
      {
        "p": "pm2",
        "label": "Defence Organisations & Programmes",
        "children": [
          { "label": "DRDO, HAL, BEL, OFB.\nDAP 2020 (Defence Acquisition Procedure) – emphasis on indigenous procurement." },
          { "label": "Make in India in Defence: positive indigenisation lists.\nDefence corridors (UP, TN)." }
        ]
      }
    ]
  },
  {
    "id": "VII",
    "p": "pm",
    "label": "Energy – Conventional & Renewable",
    "children": [
      {
        "p": "pm2",
        "label": "Conventional Energy Sources",
        "children": [
          {
            "label": "Coal, Oil & Natural Gas",
            "children": [
              { "label": "Coal: thermal power, largest source of India's energy.\nTypes: peat, lignite, bituminous, anthracite." },
              { "label": "Petroleum & Natural Gas: refining, petrochemicals.\nStrategic Petroleum Reserves (India)." }
            ]
          },
          {
            "label": "Nuclear Energy",
            "children": [
              { "label": "Fission reactors: PHWR (heavy water), LWR (light water), FBR (fast breeder).\nIndia's three-stage nuclear programme (Homi Bhabha): PHWR → FBR → Thorium." },
              { "label": "NPCIL operates plants.\nMajor: Kudankulam (TN, VVER), Tarapur (Mah), Kalpakkam (TN)." }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Green Hydrogen Transition",
        "children": [
          { "label": "National Green Hydrogen Mission targets 5 MMT production by 2030.\nSIGHT (Strategic Interventions for Green Hydrogen Transition) programme subsidizes domestic electrolyzer manufacturing to overcome high capital costs and storage/transport bottlenecks." },
          { "label": "Green hydrogen: produced via electrolysis using renewable energy; fuel cells convert H₂ + O₂ → electricity." },
          { "label": "MAINS: Role in hard-to-abate sectors (steel, cement, heavy transport), export potential, energy security." }
        ]
      },
      {
        "p": "pm2",
        "label": "Nuclear Innovations",
        "children": [
          { "label": "Small Modular Reactors (SMRs): factory-fabricated, scalable (up to 300 MW), safer passive-cooling; alternative to large reactors. Decentralized power generation with lower upfront capital cost." },
          { "label": "India's 3-stage thorium program and global fusion research via ITER (International Thermonuclear Experimental Reactor)." }
        ]
      },
      {
        "p": "pm2",
        "label": "Energy Storage Challenges",
        "children": [
          { "label": "Intermittency of solar & wind requires robust Battery Energy Storage Systems (BESS) and Pumped Hydro storage." },
          { "label": "Critical Minerals (Lithium, Cobalt) supply chain concentrated in few nations; India's Lithium reserves (J&K, Rajasthan)." }
        ]
      },
      {
        "p": "pm2",
        "label": "Renewable Energy",
        "children": [
          {
            "label": "Solar Energy",
            "children": [
              { "label": "Photovoltaic cells (silicon) convert sunlight to electricity.\nSolar thermal (concentrated solar power)." },
              { "label": "India: National Solar Mission, target 100 GW (achieved).\nInternational Solar Alliance (ISA), One Sun One World One Grid." }
            ]
          },
          {
            "label": "Wind, Biomass & Hydro",
            "children": [
              { "label": "Wind: onshore & offshore.\nIndia 4th largest installed wind capacity.\nBiomass: bagasse, agri-residue; biogas (methane)." },
              { "label": "Hydropower: large dams (Tehri, Bhakra) and small/mini/micro hydro (run-of-river)." }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "MAINS: Energy Transition & Nuclear Physics",
        "children": [
          { "label": "The fundamental scientific and economic challenges of transitioning to renewable energy – the intermittency of solar/wind power, grid integration issues, and the need for high-density energy storage." },
          { "label": "The rationale behind India's Three-Stage Nuclear Programme – bypassing the limited domestic uranium reserves to eventually utilize the abundant domestic thorium reserves." },
          { "label": "The comparative physics and environmental impacts of nuclear fission (radioactive waste management) versus nuclear fusion (theoretical clean, limitless energy)." }
        ]
      }
    ]
  },
  {
    "id": "VIII",
    "p": "pm",
    "label": "Health, Biotechnology & Nanotechnology",
    "children": [
      {
        "p": "pm2",
        "label": "Medical Technologies",
        "children": [
          {
            "label": "Imaging & Diagnostics",
            "children": [
              { "label": "X-ray, CT scan (3D X-ray), MRI (magnetic resonance, uses strong magnets and radio waves, no radiation), Ultrasound (sonography)." },
              { "label": "PET scan (positron emission, metabolic activity).\nRT-PCR, Rapid Antigen Test (COVID).\nCRISPR diagnostics." }
            ]
          },
          {
            "label": "Therapeutic Advances",
            "children": [
              { "label": "Gene therapy: replacing faulty gene (e.g., for ADA deficiency).\nCAR-T cell therapy (cancer immunotherapy) – e.g., NexCAR19, indigenous breakthrough." },
              { "label": "3D bioprinting (tissues, organs).\nTelemedicine, AI in diagnosis.\nRobotic surgery (da Vinci)." }
            ]
          },
          {
            "label": "Advanced Therapeutics & Genome Editing",
            "children": [
              { "label": "Precision genome editing now includes Base Editing (beyond traditional CRISPR-Cas9), allowing single-letter changes without double-strand breaks. Ethical dilemma: off‑target mutations, designer babies." },
              { "label": "Indigenous CAR-T therapy (NexCAR19) marks a breakthrough in treating blood cancers using re-engineered immune cells." }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Biotech & Genomic Policy",
        "children": [
          { "label": "BioE3 Policy (2024): stands for 'Biotechnology for Economy, Environment, and Employment'. Fosters high‑performance biomanufacturing and a circular bioeconomy via Bio-AI Hubs and Biofoundries." },
          { "label": "Genome India Project: mapped 10,000 genomes to build reference database for precision medicine and targeted therapies." },
          { "label": "MAINS: Ethical concerns of genetic data privacy, benefit sharing, diagnostic sovereignty, and regulatory challenges faced by GEAC." }
        ]
      },
      {
        "p": "pm2",
        "label": "Public Health Challenges",
        "children": [
          { "label": "Antimicrobial Resistance (AMR): 'Silent Pandemic'; driven by antibiotic misuse.\nNational Action Plan on AMR (NAP-AMR 2.0), Red Line Campaign." },
          { "label": "National Sickle Cell Anemia Elimination Mission: targets eradication by 2047.\nOne Health Concept: interconnection of human, animal, and environmental health (zoonotic diseases)." },
          { "label": "MAINS: Public health infrastructure, disease surveillance, preventive healthcare." }
        ]
      },
      {
        "p": "pm2",
        "label": "Nanotechnology",
        "children": [
          {
            "label": "Basics & Properties",
            "children": [
              { "label": "Nano = 10⁻⁹ m.\nMaterials at nano-scale show unique optical, electrical, chemical properties due to high surface area to volume ratio and quantum effects." },
              { "label": "Examples: carbon nanotubes (CNT), graphene, quantum dots, nano-silver (antimicrobial)." }
            ]
          },
          {
            "label": "Applications",
            "children": [
              { "label": "Medicine: targeted drug delivery, nano-robots.\nElectronics: smaller, faster chips.\nEnergy: efficient solar cells, batteries." },
              { "label": "Environment: water purification, pollution sensors.\nAgriculture: nano-fertilizers (Nano Urea/DAP), smart delivery." }
            ]
          },
          {
            "label": "Nanotechnology Critique (Nano-fertilizers & Risks)",
            "children": [
              { "label": "Nano Urea/DAP promise higher surface area, targeted delivery, and lower subsidy burdens." },
              { "label": "Scientific debate persists on long-term soil microbial impact and actual nitrogen uptake efficiency compared to granular urea." },
              { "label": "MAINS: The theoretical risks of nanotechnology – 'nano-toxicity' and the ability of engineered nanoparticles to cross biological membranes and the blood-brain barrier." }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "IX",
    "p": "pm",
    "label": "Science Policy, IPR & R&D Ecosystem",
    "children": [
      {
        "p": "pm2",
        "label": "Intellectual Property Rights (IPR) in S&T",
        "children": [
          {
            "label": "Patents Act, 1970 & TRIPS Compliance",
            "children": [
              { "label": "Section 3(d): prevents 'evergreening' of patents (landmark Novartis case), protecting generic medicine access. Ensures only genuine innovations receive protection." },
              { "label": "Compulsory Licensing (Section 84): allows government to permit generic production of patented product during national health emergency without patent owner's consent." }
            ]
          },
          {
            "label": "Geographical Indications (GI)",
            "children": [
              { "label": "Protects traditional knowledge and region‑specific goods. E.g., Darjeeling Tea, Basmati rice, Kancheepuram Silk. Prevents biopiracy of indigenous knowledge." }
            ]
          },
          {
            "label": "MAINS IPR Angle",
            "children": [
              { "label": "Debate: Strict IPR vs. affordable access to medicines, agricultural seeds, and green technologies. TRIPS flexibilities crucial for developing countries." }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Research & Development Ecosystem",
        "children": [
          {
            "label": "Anusandhan National Research Foundation (ANRF) Act, 2023",
            "children": [
              { "label": "Subsumes SERB. Apex body providing strategic direction for scientific research; forges collaborations between academia, government, and private industry. Aim to increase private R&D contribution." },
              { "label": "Mission for Advancement in High-impact Areas (MAHA): launched under ANRF to promote priority-driven, solution-oriented research in EV tech, MedTech, and AI." }
            ]
          },
          {
            "label": "Other Key Programmes",
            "children": [
              { "label": "National Mission on Interdisciplinary Cyber-Physical Systems (NM-ICPS): funds Technology Innovation Hubs (TIHs) in AI, IoT, robotics." },
              { "label": "Atal Innovation Mission (AIM): promotes innovation culture via Atal Tinkering Labs, Atal Incubation Centres." }
            ]
          }
        ]
      }
    ]
  }
] satisfies RawSubjectNode[];