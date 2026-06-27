import type { RawSubjectNode } from "../types";

export const RAW_D = [
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
              { "label": "Third: absolute zero unreachable.\nApplication: refrigerators, heat engines, AC." }
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
              { "label": "Special relativity: E=mc², time dilation, length contraction.\nGeneral relativity: gravity as curvature of spacetime (GPS correction)." }
            ]
          },
          {
            "label": "Lasers",
            "children": [
              { "label": "LASER: Light Amplification by Stimulated Emission of Radiation.\nProperties: monochromatic, coherent, directional." },
              { "label": "Applications: fiber optics communication, surgery (LASIK), cutting/welding, printers, barcode scanners, LIDAR." }
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
              { "label": "Buffer solutions maintain pH (blood buffering)." }
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
              { "label": "Digestive: enzymes, absorption in small intestine.\nRespiratory: O₂/CO₂ exchange in alveoli; hemoglobin carries oxygen." },
              { "label": "Circulatory: heart (4 chambers), arteries (away), veins (to heart).\nBlood: RBC (oxygen), WBC (immunity), platelets (clotting)." },
              { "label": "Nervous: brain (cerebrum, cerebellum, medulla), spinal cord, neurons, synapse, reflex arc." },
              { "label": "Endocrine: hormones – insulin (pancreas, lowers glucose), thyroxine (metabolism), adrenaline (stress)." }
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
              { "label": "Input/Output devices.\nOperating System (Windows, Linux, Android).\nApplication software vs system software." },
              { "label": "Number systems: binary, octal, hexadecimal.\nQuantum computing: qubits, superposition, entanglement." }
            ]
          },
          {
            "label": "Networking & Internet",
            "children": [
              { "label": "IP address (IPv4 vs IPv6), DNS, URL, HTTP/HTTPS (SSL/TLS encryption)." },
              { "label": "Cloud computing: SaaS, PaaS, IaaS.\nEdge computing.\nIoT (Internet of Things): smart devices, sensors, actuators." }
            ]
          },
          {
            "label": "Artificial Intelligence & Emerging Tech",
            "children": [
              { "label": "AI/ML: supervised, unsupervised, reinforcement learning.\nDeep learning, neural networks, NLP (ChatGPT)." },
              { "label": "Blockchain: distributed ledger, immutable, consensus mechanisms (PoW, PoS).\nApplications: cryptocurrency, supply chain, land records." },
              { "label": "Big Data (3Vs: volume, velocity, variety), Data analytics, 3D printing (additive manufacturing)." },
              { "label": "MAINS: AI ethics, data privacy (PDP Bill), digital divide, cyber security threats." }
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
      },
      {
        "p": "pm2",
        "label": "Cyber Security & Digital India",
        "children": [
          { "label": "Malware: virus, worm, trojan, ransomware.\nPhishing, DDoS attacks.\nFirewall, encryption, digital signature." },
          { "label": "Initiatives: DigiLocker, Aadhaar (UIDAI), UPI, CERT-In, National Cyber Security Policy." }
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
            "label": "Major Missions",
            "children": [
              { "label": "Chandrayaan-1 (2008): discovered water molecules on Moon.\nChandrayaan-2 (2019): orbiter successful, lander (Vikram) failed.\nChandrayaan-3 (2023): soft landing near south pole (Shiv Shakti point)." },
              { "label": "Mangalyaan (MOM, 2013): Mars orbiter, first attempt success.\nGaganyaan: proposed crewed mission." },
              { "label": "Astrosat: multi-wavelength space observatory.\nNavIC: Indian regional navigation system." }
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
              { "label": "International Space Station (ISS).\nJames Webb Space Telescope (JWST) – infrared, L2 point.\nHubble – optical.\nArtemis – NASA's Moon programme." }
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
          },
          {
            "label": "Green Hydrogen & New Energy Sources",
            "children": [
              { "label": "Green hydrogen: electrolysis using renewable energy.\nNational Green Hydrogen Mission (2023)." },
              { "label": "Fuel cells: convert H₂ + O₂ → electricity (water byproduct).\nWave, tidal, geothermal energy (Puga Valley, Ladakh)." },
              { "label": "MAINS: Energy transition, net-zero goals, challenges of intermittency, energy storage (battery, pumped hydro)." }
            ]
          }
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
              { "label": "Gene therapy: replacing faulty gene (e.g., for ADA deficiency).\nCAR-T cell therapy (cancer immunotherapy)." },
              { "label": "3D bioprinting (tissues, organs).\nTelemedicine, AI in diagnosis.\nRobotic surgery (da Vinci)." }
            ]
          }
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
              { "label": "Environment: water purification, pollution sensors.\nAgriculture: nano-fertilizers, smart delivery." }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Emerging Diseases & Public Health",
        "children": [
          {
            "label": "AMR & Superbugs",
            "children": [
              { "label": "Antimicrobial Resistance (AMR): bacteria, viruses, fungi develop resistance due to overuse/misuse of antibiotics." },
              { "label": "India's Red Line Campaign (prescription antibiotics), National Action Plan on AMR." }
            ]
          },
          {
            "label": "One Health Concept",
            "children": [
              { "label": "Interconnection of human, animal, and environmental health.\nZoonotic diseases (COVID, Ebola, Nipah, Bird flu)." }
            ]
          }
        ]
      }
    ]
  }
] satisfies RawSubjectNode[];