import type { RawSubjectNode } from "../types";

export const RAW_D = [
  {
    "id": "I",
    "p": "pm",
    "label": "Disaster – Concepts, Classification & Cycle",
    "children": [
      {
        "p": "pm2",
        "label": "Basic Concepts & Definitions",
        "children": [
          {
            "label": "Key Definitions (Disaster Management Act 2005)",
            "children": [
              { "label": "Disaster: a catastrophe, mishap, calamity or grave occurrence in any area, arising from natural or man‑made causes, or by accident or negligence which results in substantial loss of life or human suffering or damage to, and destruction of, property, or damage to, or degradation of, environment, and is of such a nature or magnitude as to be beyond the coping capacity of the community of the affected area." },
              { "label": "Disaster Management: a continuous and integrated process of planning, organising, coordinating and implementing measures which are necessary or expedient for: prevention of danger or threat of any disaster; mitigation or reduction of risk of any disaster or its severity or consequences; capacity‑building; preparedness to deal with any disaster; prompt response to any threatening disaster situation or disaster; assessing the severity or magnitude of effects of any disaster; evacuation, rescue and relief; rehabilitation and reconstruction." }
            ]
          },
          {
            "label": "Hazard, Vulnerability, Risk & Capacity",
            "children": [
              { "label": "Hazard: a dangerous phenomenon, substance, human activity or condition that may cause loss of life, injury or other health impacts, property damage, loss of livelihoods and services, social and economic disruption, or environmental damage." },
              { "label": "Vulnerability: the characteristics and circumstances of a community, system or asset that make it susceptible to the damaging effects of a hazard." },
              { "label": "Risk = Hazard × Vulnerability / Capacity.\n(Risk is a function of hazard, exposure, vulnerability and capacity)." },
              { "label": "Capacity: the combination of all the strengths, attributes and resources available within a community, society or organisation to manage and reduce disaster risks and strengthen resilience." },
              { "label": "TRAP: Risk is not the same as hazard; a hazard does not necessarily become a disaster unless it affects a vulnerable population." }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Classification of Disasters",
        "children": [
          {
            "label": "Natural Disasters",
            "children": [
              { "label": "Geophysical: Earthquakes, Tsunamis, Volcanic eruptions, Landslides." },
              { "label": "Hydrological: Floods (riverine, flash, coastal), Droughts, Glacial Lake Outburst Floods (GLOF)." },
              { "label": "Meteorological: Cyclones (Tropical, Extra‑tropical), Heat Waves, Cold Waves, Thunderstorms/Hailstorms, Cloudbursts." },
              { "label": "Biological: Epidemics, Pandemics, Pest attacks, Locust swarms." }
            ]
          },
          {
            "label": "Man‑made / Anthropogenic Disasters",
            "children": [
              { "label": "Industrial: Chemical spills, gas leaks (Bhopal Gas Tragedy 1984), fires, explosions, nuclear/radiological emergencies." },
              { "label": "Transport: Road, rail, air, marine accidents; oil spills." },
              { "label": "Structural: Building/bridge/dam collapses, urban flooding (due to poor drainage), fires in slums." },
              { "label": "Environmental: Deforestation, desertification, land degradation, biodiversity loss." },
              { "label": "Social: Stampedes, riots, terrorism, war." }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Disaster Management Cycle",
        "children": [
          {
            "label": "Phases",
            "children": [
              { "label": "Mitigation: long‑term measures to reduce or eliminate risk (structural: dams, embankments, cyclone shelters; non‑structural: land‑use zoning, building codes, risk mapping)." },
              { "label": "Preparedness: planning, early warning systems, training, mock drills, stockpiling, public awareness, emergency communication." },
              { "label": "Response: immediate actions during/after disaster – search & rescue, evacuation, relief (food, water, medical), temporary shelters, needs assessment." },
              { "label": "Recovery: restoration of essential services, rehabilitation, reconstruction (build back better), psycho‑social support, livelihood restoration." }
            ]
          },
          {
            "label": "Shift from Relief‑centric to Holistic Approach",
            "children": [
              { "label": "Pre‑2005: primarily relief and rescue, reactive.\nPost‑DM Act 2005: proactive, prevention‑mitigation, and mainstreaming DRR in development." },
              { "label": "Sendai Framework (2015‑30): emphasizes understanding disaster risk, strengthening disaster risk governance, investing in DRR, and enhancing disaster preparedness for effective response and 'Build Back Better'." }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "II",
    "p": "pm3",
    "label": "India's Vulnerability Profile (Static Facts)",
    "children": [
      {
        "p": "pm2",
        "label": "Geophysical & Climatic Vulnerability",
        "children": [
          {
            "label": "Seismic Zones",
            "children": [
              { "label": "India divided into 4 seismic zones (II, III, IV, V) as per IS 1893.\nZone V: highest risk (entire NE, parts of J&K, Himachal, Uttarakhand, Rann of Kutch, Andaman & Nicobar).\nZone II: lowest." },
              { "label": "~59% of India's land area prone to moderate to major earthquakes." }
            ]
          },
          {
            "label": "Floods",
            "children": [
              { "label": "40 million hectares (12% of land area) prone to floods.\nGanga‑Brahmaputra basin most affected.\nAssam, Bihar, UP, West Bengal most flood‑prone." },
              { "label": "Average annual flood damage ~₹5,000+ crore.\nUrban flooding a growing concern (Mumbai 2005, Chennai 2015)." }
            ]
          },
          {
            "label": "Cyclones",
            "children": [
              { "label": "Entire 7,516 km coastline vulnerable.\nEast coast more prone (Bay of Bengal – 4:1 ratio with Arabian Sea).\n13 coastal states/UTs." },
              { "label": "Average 4‑5 cyclones form in BoB annually; severe cyclones have increased in Arabian Sea recently." }
            ]
          },
          {
            "label": "Droughts",
            "children": [
              { "label": "68% of net sown area vulnerable to drought.\n35% area receives rainfall between 750‑1,125 mm, classified as drought‑prone.\nRegions: Rajasthan, Gujarat, Maharashtra, Karnataka, Telangana, Bundelkhand." }
            ]
          },
          {
            "label": "Landslides & Avalanches",
            "children": [
              { "label": "About 15% of India's landmass prone to landslides (Himalayan region, Western Ghats, Nilgiris, North‑East)." }
            ]
          },
          {
            "label": "Other Hazards",
            "children": [
              { "label": "Tsunami: 2004 Indian Ocean Tsunami (Sumatra earthquake) devastated Andaman & Nicobar and parts of Tamil Nadu, Kerala, Andhra Pradesh, Puducherry." },
              { "label": "GLOF: increasing risk due to climate change; Uttarakhand (Kedarnath 2013, Chamoli 2021)." },
              { "label": "Heat/Cold Waves, Thunderstorms, Lightning, Forest Fires (particularly in Uttarakhand, HP, NE)." }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Man‑made & Industrial Vulnerability",
        "children": [
          {
            "label": "Industrial & Chemical",
            "children": [
              { "label": "Over 1,861 Major Accident Hazard (MAH) units across India.\nChemical clusters in Gujarat, Maharashtra, Tamil Nadu.\nBhopal (1984) worst industrial disaster." },
              { "label": "Nuclear: 22 reactors at 7 sites; emergency planning zones." }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "III",
    "p": "pm3",
    "label": "Legal & Institutional Framework (India)",
    "children": [
      {
        "p": "pm3",
        "label": "Disaster Management Act 2005 (DM Act)",
        "children": [
          {
            "label": "Key Features",
            "children": [
              { "label": "Enacted 23 Dec 2005; came into force Jan 2006.\nFirst comprehensive legal framework for DM in India." },
              { "label": "Established NDMA (National Disaster Management Authority) as apex body with PM as Chairperson; maximum 9 members (including Vice‑Chairperson)." },
              { "label": "State Disaster Management Authorities (SDMAs) under CMs; District Disaster Management Authorities (DDMAs) under District Collectors/DCs." }
            ]
          },
          {
            "label": "National & State Executive Committees",
            "children": [
              { "label": "National Executive Committee (NEC): chaired by Home Secretary, assists NDMA." },
              { "label": "State Executive Committees (SECs): at state level." }
            ]
          },
          {
            "label": "National & State Disaster Response Forces",
            "children": [
              { "label": "National Disaster Response Force (NDRF) constituted 2006; 15+ battalions, specialized for search, rescue, relief.\nState Disaster Response Forces (SDRFs) in states." }
            ]
          },
          {
            "label": "Plans",
            "children": [
              { "label": "National Plan, State Plans, District Plans for disaster management; reviewed annually." }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "NDMA – Key Functions & Guidelines",
        "children": [
          {
            "label": "NDMA",
            "children": [
              { "label": "Lay down policies, plans and guidelines for DM.\nApprove National Plan.\nCoordinate enforcement and implementation." },
              { "label": "Has issued 37+ guidelines on various disasters (earthquake, flood, cyclone, chemical, nuclear, etc.)." }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "National Policy on Disaster Management (NPDM) 2009",
        "children": [
          {
            "label": "Objectives",
            "children": [
              { "label": "Promote a culture of prevention, preparedness and resilience at all levels.\nMainstreaming DM into development planning." }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "IV",
    "p": "pm3",
    "label": "International Frameworks (Sendai, UNISDR/UNDRR)",
    "children": [
      {
        "p": "pm2",
        "label": "Pre‑Sendai: Hyogo Framework for Action (HFA) 2005‑2015",
        "children": [
          {
            "label": "Key Priorities",
            "children": [
              { "label": "Make DRR a priority; know the risks; build understanding & awareness; reduce risk; be prepared and ready to act.\nCriticized for lack of measurable targets." }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Sendai Framework for Disaster Risk Reduction 2015‑2030",
        "children": [
          {
            "label": "Goal & Priorities",
            "children": [
              { "label": "Goal: Prevent new and reduce existing disaster risk." },
              { "label": "4 Priorities: 1) Understanding disaster risk; 2) Strengthening disaster risk governance; 3) Investing in DRR for resilience; 4) Enhancing disaster preparedness for effective response, and to 'Build Back Better' in recovery, rehabilitation and reconstruction." }
            ]
          },
          {
            "label": "7 Global Targets (to be achieved by 2030)",
            "children": [
              { "label": "Reduce global disaster mortality per 100,000 (Target A).\nReduce number of affected people (B).\nReduce direct economic loss in relation to GDP (C).\nReduce damage to critical infrastructure and disruption of basic services (D).\nIncrease number of countries with national and local DRR strategies (E).\nEnhance international cooperation (F).\nIncrease availability and access to multi‑hazard early warning systems (G)." }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Other Relevant International Initiatives",
        "children": [
          { "label": "UNDRR (formerly UNISDR) – coordinates DRR globally.\nGlobal Platform for DRR." },
          { "label": "Coalition for Disaster Resilient Infrastructure (CDRI) – launched by India at UN Climate Action Summit 2019; global partnership for resilient infrastructure." },
          { "label": "International Search and Rescue Advisory Group (INSARAG) – under UN." }
        ]
      }
    ]
  },
  {
    "id": "V",
    "p": "pm3",
    "label": "Specific Hazards, Impacts & Mitigation (India)",
    "children": [
      {
        "p": "pm2",
        "label": "Earthquake",
        "children": [
          {
            "label": "Mitigation",
            "children": [
              { "label": "Seismic micro‑zonation, building codes (BIS), retrofitting, public awareness, land‑use planning, early warning (not prediction).\nIndia's Earthquake Early Warning (EEW) system in pilot phase." }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Floods",
        "children": [
          {
            "label": "Causes & Types",
            "children": [
              { "label": "Riverine, flash floods, urban flooding, coastal flooding.\nExacerbated by encroachment on flood plains, siltation, climate change." }
            ]
          },
          {
            "label": "Mitigation",
            "children": [
              { "label": "Flood plain zoning, embankments/dams (structural), reservoirs, drainage improvement, afforestation, early warning (CWC/IMD), flood forecasting (FFMP).\nRashtriya Barh Aayog (1976, 1980)." }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Cyclones",
        "children": [
          {
            "label": "Impact & Mitigation",
            "children": [
              { "label": "High winds, storm surge, heavy rainfall.\nMost deaths due to storm surge historically (e.g., 1999 Odisha super cyclone – ~10,000 deaths)." },
              { "label": "Mitigation: cyclone shelters, embankments, mangrove plantation (bio‑shield), early warning (IMD's Cyclone Warning Division), National Cyclone Risk Mitigation Project (NCRMP)." }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Droughts",
        "children": [
          {
            "label": "Types",
            "children": [
              { "label": "Meteorological (deficit rainfall), Hydrological (low water in reservoirs/rivers), Agricultural (soil moisture insufficient for crops), Socio‑economic (affects supply‑demand)." }
            ]
          },
          {
            "label": "Mitigation",
            "children": [
              { "label": "Drought‑proofing: watershed development, rainwater harvesting, drought‑resistant crops, crop insurance (PMFBY), fodder banks, employment programmes (MGNREGA).\nNational Rainfed Area Authority (NRAA)." }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Landslides",
        "children": [
          {
            "label": "Causes & Mitigation",
            "children": [
              { "label": "Heavy rain, earthquakes, deforestation, road construction on slopes.\nMitigation: hazard mapping (NDMA guidelines), slope stabilisation, retaining walls, drainage, early warning." }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Man‑made: Industrial, Chemical, Nuclear",
        "children": [
          {
            "label": "Key Legislation & Guidelines",
            "children": [
              { "label": "Manufacture, Storage and Import of Hazardous Chemicals Rules 1989 (MSIHC).\nNDMA guidelines on Chemical (Industrial) Disasters, Nuclear and Radiological Emergencies." },
              { "label": "NDRF trained for CBRN (Chemical, Biological, Radiological, Nuclear) emergencies." }
            ]
          },
          {
            "label": "Bhopal Gas Tragedy (1984)",
            "children": [
              { "label": "Methyl Isocyanate (MIC) leak at Union Carbide pesticide plant; world's worst industrial disaster.\nLed to Environment Protection Act 1986, MSIHC Rules, and eventually DM Act 2005." }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Biological Disasters (Epidemics/Pandemics)",
        "children": [
          {
            "label": "Management Framework",
            "children": [
              { "label": "NDMA guidelines on Biological Disasters 2008.\nIntegrated Disease Surveillance Programme (IDSP).\nEpidemic Diseases Act 1897 (amended 2020).\nNational Health Mission, Ayushman Bharat for response capacity." }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "VI",
    "p": "pm",
    "label": "Community‑Based Disaster Management (CBDM) & Role of Technology",
    "children": [
      {
        "p": "pm2",
        "label": "CBDM",
        "children": [
          {
            "label": "Importance",
            "children": [
              { "label": "First responders are local community.\nBuilding local capacity, training, task forces.\nNDMA's Aapda Mitra scheme (volunteers)." }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Role of Technology & Information Systems",
        "children": [
          {
            "label": "Tools",
            "children": [
              { "label": "Satellite remote sensing (NRSC/ISRO) for risk mapping, damage assessment.\nGIS.\nEarly warning systems (INCOIS for tsunami, IMD for cyclone/weather)." },
              { "label": "Social media for communication, National Database for Emergency Management (NDEM), Integrated Coastal Zone Management (ICZM)." }
            ]
          }
        ]
      }
    ]
  }
]