import type { RawSubjectNode } from "../types";

export const RAW_D: RawSubjectNode[] = [
  // =========================== CHAPTER I ===========================
  {
    "id": "I",
    "p": "p3",
    "label": "Physical Geography: Geomorphology & Earth’s Structure",
    "children": [
      {
        "p": "p3",
        "label": "Universe & Solar System",
        "children": [
          {
            "label": "Origin & Galaxies",
            "children": [
              { "label": "Big Bang Theory: Proposed by Georges Lemaître; universe origin ~13.8 billion years ago." },
              { "label": "Galaxy: Milky Way (spiral). Nearest major: Andromeda." },
              { "label": "Goldilocks Zone: Habitable zone where liquid water can exist." },
              { "label": "Heliopause: Solar wind boundary. Oort Cloud: theoretical icy shell." }
            ]
          },
          {
            "label": "Solar System Fundamentals",
            "children": [
              { "label": "Inner (Terrestrial): Mercury, Venus, Earth, Mars – solid, dense, silicates/metals." },
              { "label": "Outer (Gas/Ice Giants): Jupiter, Saturn, Uranus, Neptune – low density, H/He." },
              { "label": "TRAP: Venus hottest (runaway greenhouse), not Mercury. Mercury fastest revolution." },
              { "label": "Retrograde rotation: Venus & Uranus (East to West)." },
              { "label": "Dwarf planets: Pluto, Ceres, Eris, Haumea, Makemake. Asteroid belt (Mars-Jupiter). Kuiper Belt (short-period comets)." },
              { "label": "Comets: Short period (<200 yr) from Kuiper Belt; long period from Oort Cloud. Ion tail always away from Sun." },
              { "label": "Meteoroid: small rock in space; Meteor: burning in atmosphere (shooting star); Meteorite: reaches Earth’s surface." }
            ]
          },
          {
            "label": "Earth’s Motions",
            "children": [
              { "label": "Rotation (W→E): day/night, tides, Coriolis. Max velocity at equator." },
              { "label": "Revolution: seasons due to axial tilt 23.5°. Perihelion (Jan 3), Aphelion (July 4)." },
              { "label": "Solstices: Summer (June 21, longest day NH), Winter (Dec 22). Equinoxes: March 21 & Sept 23 (equal day/night)." },
              { "label": "Precession of Equinoxes: wobble cycle ~26,000 years." }
            ]
          }
        ]
      },
      {
        "p": "p3",
        "label": "Earth’s Interior & Materials",
        "children": [
          {
            "label": "Structure of the Earth",
            "children": [
              { "label": "Crust: Continental (SIAL, thick up to 70km, granitic) vs Oceanic (SIMA, thin ~5km, basaltic)." },
              { "label": "Mantle: Upper (Asthenosphere – plastic, magma source). Lower solid. Lithosphere = Crust + uppermost solid mantle." },
              { "label": "Core: Outer (liquid, magnetic field by dynamo effect). Inner (solid NiFe)." }
            ]
          },
          {
            "label": "Seismic Discontinuities (CMRGL)",
            "children": [
              { "label": "Conrad: Upper/Lower Crust (discontinuous)." },
              { "label": "Mohorovičić (Moho): Lower Crust/Upper Mantle." },
              { "label": "Repetti: Upper/Lower Mantle." },
              { "label": "Gutenberg: Lower Mantle/Outer Core." },
              { "label": "Lehmann: Outer/Inner Core." }
            ]
          },
          {
            "label": "Rocks & Rock Cycle",
            "children": [
              { "label": "Igneous: Primary, from magma/lava. Intrusive (granite, large crystals) vs Extrusive (basalt, fine). No fossils." },
              { "label": "Sedimentary: Secondary, lithification, stratified, porous, fossils. E.g., sandstone, limestone, shale, coal." },
              { "label": "Metamorphic: Heat/pressure. Limestone→Marble; Sandstone→Quartzite; Shale→Slate/Schist; Granite→Gneiss; Coal→Graphite/Diamond." },
              { "label": "Rock Cycle: Igneous → weathering → sedimentary → burial → metamorphic → melting → magma → igneous." }
            ]
          }
        ]
      },
      {
        "p": "p3",
        "label": "Plate Tectonics & Isostasy",
        "children": [
          {
            "label": "Continental Drift & Sea-floor Spreading",
            "children": [
              { "label": "Wegener: Jigsaw fit, fossils (Glossopteris, Mesosaurus), paleoclimate. Mechanism missing." },
              { "label": "Sea-floor Spreading (Hess & Dietz): New crust at mid-ocean ridges, destroyed at trenches. Evidence: magnetic striping, age of sea floor." }
            ]
          },
          {
            "label": "Plate Tectonics",
            "children": [
              { "label": "7 major plates: Pacific, N American, S American, Eurasian, African, Indo-Australian, Antarctic, Nazca." },
              { "label": "Driving forces: mantle convection, slab pull, ridge push." }
            ]
          },
          {
            "label": "Isostasy",
            "children": [
              { "label": "Airy: mountains have deep roots (uniform density). Pratt: uniform depth, lateral density variation." },
              { "label": "Isostatic rebound: post-glacial uplift of Scandinavia, Canada." }
            ]
          }
        ]
      },
      {
        "p": "p3",
        "label": "Plate Boundaries & Features",
        "children": [
          {
            "label": "Divergent (Constructive)",
            "children": [
              { "label": "Mid-ocean ridges, rift valleys, new crust. Mid-Atlantic Ridge, Great East African Rift. Basaltic volcanism." }
            ]
          },
          {
            "label": "Convergent (Destructive)",
            "children": [
              { "label": "Ocean-Continent: subduction → deep trenches, volcanic fold mountains (Andes, Rockies). Wadati-Benioff zone." },
              { "label": "Ocean-Ocean: trenches, volcanic island arcs (Japan, Philippines, Aleutians)." },
              { "label": "Continent-Continent: fold mountains (Himalayas, Alps). No active volcanoes, major earthquakes." }
            ]
          },
          {
            "label": "Transform (Conservative)",
            "children": [
              { "label": "Strike-slip faults (San Andreas). No creation/destruction. Often connect ridge segments." }
            ]
          }
        ]
      },
      {
        "p": "p3",
        "label": "Earthquakes & Volcanoes",
        "children": [
          {
            "label": "Earthquake Measurement",
            "children": [
              { "label": "Focus (Hypocenter) vs Epicenter." },
              { "label": "P-waves (fastest, solid/liquid/gas), S-waves (only solids), L-waves (surface, most destructive)." },
              { "label": "Shadow zones: S-wave beyond 105° (liquid outer core). P-wave 105°–145°." },
              { "label": "Richter: magnitude, logarithmic (10x amplitude, ~32x energy). Mercalli: intensity I-XII." }
            ]
          },
          {
            "label": "Volcano Types & Landforms",
            "children": [
              { "label": "Shield: gentle, basaltic (Mauna Loa). Stratovolcano: steep, explosive, andesitic (Mt. Fuji). Caldera: collapse after eruption (Yellowstone)." },
              { "label": "Hotspot: mantle plume, chain of islands (Hawaii). Deccan Traps linked to Réunion hotspot." },
              { "label": "Pacific Ring of Fire: 75% active volcanoes, intense seismicity." }
            ]
          },
          {
            "label": "Intrusive Igneous Landforms",
            "children": [
              { "label": "Batholith (large discordant), Laccolith (dome concordant), Sill (horizontal), Dyke (vertical cutting across)." }
            ]
          }
        ]
      },
      {
        "p": "p3",
        "label": "Endogenic & Exogenic Forces",
        "children": [
          {
            "label": "Endogenic (Internal)",
            "children": [
              { "label": "Diastrophism: Orogenic (horizontal, folding/faulting) & Epeirogenic (vertical uplift/subsidence)." },
              { "label": "Sudden: earthquakes, volcanic eruptions." }
            ]
          },
          {
            "label": "Exogenic (External)",
            "children": [
              { "label": "Weathering: physical (frost, exfoliation), chemical (oxidation, carbonation, hydration), biological (roots, lichens)." },
              { "label": "Mass wasting: gravity-driven (creep, flow, slide, fall)." },
              { "label": "Erosion & Deposition by water, wind, ice, waves." }
            ]
          }
        ]
      },
      {
        "p": "p3",
        "label": "Fluvial Landforms & Drainage Patterns",
        "children": [
          {
            "label": "Erosional (Youth/Mature)",
            "children": [
              { "label": "V-shaped valleys, gorges (narrow), canyons (step-like). Potholes, incised meanders, river terraces." },
              { "label": "Waterfalls: hard rock over soft; plunge pool. Jog Falls (Sharavati), Angel Falls (Venezuela)." }
            ]
          },
          {
            "label": "Depositional (Old Stage)",
            "children": [
              { "label": "Alluvial fans, floodplains, natural levees. Meanders, ox-bow lakes. Braided channels." },
              { "label": "Deltas: Arcuate (Nile, Ganga), Bird-foot (Mississippi), Cuspate (Tiber). Estuarine (Narmada, Tapti)." }
            ]
          },
          {
            "label": "Drainage Patterns & Special Rivers",
            "children": [
              { "label": "Patterns: Dendritic (tree-like), Trellis (folded), Radial (volcanic), Centripetal (inland basin), Rectangular (jointed)." },
              { "label": "Antecedent drainage: existed before uplift, cuts through rising mountains (Indus, Sutlej, Brahmaputra, Kosi)." }
            ]
          }
        ]
      },
      {
        "p": "p3",
        "label": "Karst, Aeolian, Glacial & Coastal Landforms",
        "children": [
          {
            "label": "Karst (Limestone)",
            "children": [
              { "label": "Erosional: sinkholes, dolines, uvalas, poljes, lapies, blind valleys, caves." },
              { "label": "Depositional: stalactites (ceiling), stalagmites (floor), pillars." }
            ]
          },
          {
            "label": "Aeolian (Wind)",
            "children": [
              { "label": "Erosional: mushroom rocks, yardangs, zeugen, inselbergs." },
              { "label": "Depositional: Barchan (crescent, horns downwind), Seif (longitudinal), Transverse dunes, Loess. Playas, bajadas." }
            ]
          },
          {
            "label": "Glacial",
            "children": [
              { "label": "Erosional: cirque, horn (Matterhorn), arête, U-shaped valley, hanging valley, fjords." },
              { "label": "Depositional: moraines (terminal, lateral, medial, ground), eskers, drumlins ('basket of eggs'), outwash plains." }
            ]
          },
          {
            "label": "Coastal",
            "children": [
              { "label": "Erosional: cliffs, wave-cut platforms, caves, arches, stacks, stumps." },
              { "label": "Depositional: beaches, sandbars, barrier islands, spits, tombolos, lagoons." },
              { "label": "Submergent coast: ria, fjord, Dalmatian. Emergent: raised beaches, marine terraces." }
            ]
          }
        ]
      }
    ]
  },
  // =========================== CHAPTER II ===========================
  {
    "id": "II",
    "p": "p3",
    "label": "Physical Geography: Climatology & Climate Regions",
    "children": [
      {
        "p": "p3",
        "label": "Atmosphere: Composition & Structure",
        "children": [
          {
            "label": "Composition",
            "children": [
              { "label": "Permanent: N₂ 78%, O₂ 21%, Ar 0.93%. Variable: H₂O vapour, CO₂, ozone, dust (hygroscopic nuclei)." }
            ]
          },
          {
            "label": "Layers (Bottom to Top)",
            "children": [
              { "label": "Troposphere: weather, lapse rate 6.5°C/km, thickest at equator." },
              { "label": "Stratosphere: ozone layer, temperature inversion, jets fly here." },
              { "label": "Mesosphere: coldest (-100°C), meteors burn." },
              { "label": "Thermosphere (Ionosphere): temperature rises, radio wave reflection, auroras, ISS." },
              { "label": "Exosphere: merges into space." }
            ]
          }
        ]
      },
      {
        "p": "p3",
        "label": "Insolation, Heat Budget & Temperature",
        "children": [
          {
            "label": "Insolation & Heat Budget",
            "children": [
              { "label": "Solar constant: ~1361 W/m². Factors: latitude, season, cloud, albedo." },
              { "label": "Albedo: reflectivity; fresh snow highest (~80-90%), ocean lowest (~6%). Earth’s average ~30%." },
              { "label": "Heat budget: incoming shortwave = outgoing longwave at top of atmosphere. Natural greenhouse effect keeps Earth ~33°C warmer." }
            ]
          },
          {
            "label": "Temperature Distribution",
            "children": [
              { "label": "Horizontal: isotherms parallel to latitude, irregular in NH (land-water contrast)." },
              { "label": "Vertical: normal lapse rate 6.5°C/km. Inversion: temp increases with height (valley, subsidence)." },
              { "label": "Factors: latitude, altitude, land-water, ocean currents, winds, cloud." }
            ]
          }
        ]
      },
      {
        "p": "p3",
        "label": "Global Pressure Belts & Winds",
        "children": [
          {
            "label": "Pressure Belts",
            "children": [
              { "label": "Equatorial Low (Doldrums): thermal, calm. Sub-Tropical High (Horse Latitudes): dynamic, deserts. Sub-Polar Low (60°): dynamic. Polar High: thermal." }
            ]
          },
          {
            "label": "Planetary Winds",
            "children": [
              { "label": "Trade Winds: NE in NH, SE in SH (0-30°). Westerlies: SW in NH, NW in SH (30-60°); Roaring Forties, Furious Fifties. Polar Easterlies (60-90°)." }
            ]
          },
          {
            "label": "Coriolis & Jet Streams",
            "children": [
              { "label": "Coriolis: deflects right in NH, left in SH; zero at equator, max at poles." },
              { "label": "Jet Streams: upper troposphere westerlies. Sub-Tropical Jet (STJ) ~30°, Polar Front Jet (PFJ) ~60°. TEJ (Tropical Easterly Jet) influences Indian monsoon." }
            ]
          }
        ]
      },
      {
        "p": "p3",
        "label": "Atmospheric Moisture & Precipitation",
        "children": [
          {
            "label": "Humidity & Clouds",
            "children": [
              { "label": "Absolute humidity (g/m³), Relative humidity (%), Dew point temp." },
              { "label": "Cloud types: High – Cirrus; Middle – Altostratus; Low – Stratus; Vertical – Cumulus, Cumulonimbus." }
            ]
          },
          {
            "label": "Precipitation",
            "children": [
              { "label": "Convectional: surface heating, thunderstorms (equatorial)." },
              { "label": "Orographic: windward rain, leeward rain shadow." },
              { "label": "Cyclonic/Frontal: along fronts, temperate regions." },
              { "label": "Forms: rain, drizzle, snow, sleet, hail." }
            ]
          }
        ]
      },
      {
        "p": "p3",
        "label": "Cyclones: Temperate & Tropical",
        "children": [
          {
            "label": "Air Masses & Fronts",
            "children": [
              { "label": "Air mass: large uniform body of air (Maritime/Continental, Tropical/Polar/Arctic)." },
              { "label": "Cold front (steep, cumulonimbus, heavy rain). Warm front (gentle, stratus, steady rain). Occluded front." }
            ]
          },
          {
            "label": "Temperate (Extra-Tropical) Cyclone",
            "children": [
              { "label": "Form along polar front (35°-65° lat). Move W→E. Stages: cyclogenesis, mature (warm & cold fronts), occlusion. Inverted 'V' shape." }
            ]
          },
          {
            "label": "Tropical Cyclone",
            "children": [
              { "label": "Conditions: SST >27°C, Coriolis (absent 5°N-5°S), low wind shear, pre-existing low." },
              { "label": "Structure: Eye (calm), Eyewall (strongest winds, rain). Energy from latent heat." },
              { "label": "Names: Hurricane (Atlantic/E Pacific), Typhoon (NW Pacific), Cyclone (Indian Ocean), Willy-Willy (Australia)." },
              { "label": "Naming: WMO/ESCAP panel." }
            ]
          }
        ]
      },
      {
        "p": "p3",
        "label": "World Climatic Regions (Köppen)",
        "children": [
          {
            "label": "Group A: Tropical Humid",
            "children": [
              { "label": "Af (Tropical Wet): 10°N-10°S, rain all year, Amazon, Congo, Indonesia." },
              { "label": "Am (Tropical Monsoon): seasonal reversal, India, SE Asia." },
              { "label": "Aw (Savanna): wet summer, dry winter, Llanos, Campos, Sahel." }
            ]
          },
          {
            "label": "Group B: Dry",
            "children": [
              { "label": "BW (Desert): Sahara, Thar, Atacama (driest). BS (Steppe): Prairies, Pampas, Veldt, Downs." }
            ]
          },
          {
            "label": "Group C: Warm Temperate",
            "children": [
              { "label": "Cs (Mediterranean): summer dry, winter rain, orchards, viticulture." },
              { "label": "Cfa (Humid Subtropical): east coasts, rain year round, rice, tea." },
              { "label": "Cfb (Marine West Coast): mild, cool, deciduous forests." }
            ]
          },
          {
            "label": "Group D & E: Cold & Polar",
            "children": [
              { "label": "Df (Humid Continental): NH, warm summer, severe winter. Dw (Taiga): coniferous forests, lumbering." },
              { "label": "ET (Tundra): permafrost, mosses. EF (Ice Cap): permanent ice." }
            ]
          }
        ]
      }
    ]
  },
  // =========================== CHAPTER III ===========================
  {
    "id": "III",
    "p": "p3",
    "label": "Physical Geography: Oceanography",
    "children": [
      {
        "p": "p3",
        "label": "Ocean Floor Relief",
        "children": [
          {
            "label": "Continental Margin",
            "children": [
              { "label": "Shelf: shallow, photic, fisheries, petroleum (avg 80 km wide, widest off Siberia)." },
              { "label": "Slope: steep, submarine canyons, turbidity currents." },
              { "label": "Rise: gentle, accumulated sediments, merges into abyssal plain." }
            ]
          },
          {
            "label": "Deep Ocean Basin",
            "children": [
              { "label": "Abyssal Plains: flattest, pelagic oozes, polymetallic nodules (Mn, Ni, Co, Cu)." },
              { "label": "Trenches: deepest parts (Mariana ~11km, Puerto Rico, Sunda/Java)." },
              { "label": "Mid-Oceanic Ridges: divergent, longest mountain chain (Mid-Atlantic Ridge)." },
              { "label": "Seamounts & Guyots: volcanic; guyots flat-topped (wave erosion before subsidence)." }
            ]
          }
        ]
      },
      {
        "p": "p3",
        "label": "Salinity & Temperature",
        "children": [
          {
            "label": "Salinity",
            "children": [
              { "label": "Average: 35 ppt. Dominant salts: NaCl 77%, MgCl₂ 10.9%, MgSO₄ 4.7%." },
              { "label": "Highest at subtropics (high evap, low rain). Lower at equator & poles." },
              { "label": "Extremes: Lake Van (330‰), Dead Sea (238‰), Great Salt Lake (220‰)." },
              { "label": "Halocline: rapid salinity change with depth. Isohalines: equal salinity lines." }
            ]
          },
          {
            "label": "Temperature & Density",
            "children": [
              { "label": "Surface temp decreases poleward. NH oceans warmer (more land)." },
              { "label": "Thermocline: ~300-1000m rapid drop; absent at poles." },
              { "label": "Density: cold salty water densest → thermohaline circulation (Global Conveyor Belt)." }
            ]
          }
        ]
      },
      {
        "p": "p3",
        "label": "Ocean Currents",
        "children": [
          {
            "label": "Atlantic",
            "children": [
              { "label": "Warm: N Equatorial, Gulf Stream, N Atlantic Drift (ice-free ports), Brazilian." },
              { "label": "Cold: Labrador, Canary, Benguela (Namib Desert), Falkland." },
              { "label": "Grand Banks: Gulf Stream meets Labrador, rich fishery. Sargasso Sea: N Atlantic gyre, Sargassum seaweed." }
            ]
          },
          {
            "label": "Pacific",
            "children": [
              { "label": "Warm: Kuroshio, E Australian, Alaskan, N & S Equatorial." },
              { "label": "Cold: Oyashio, California, Peru (Humboldt – upwelling, El Niño link)." }
            ]
          },
          {
            "label": "Indian Ocean",
            "children": [
              { "label": "Warm: S Equatorial, Agulhas, Mozambique." },
              { "label": "Cold: W Australian." },
              { "label": "Seasonal reversal: SW monsoon → Somali current (cold upwelling); NE monsoon → warm southward flow." }
            ]
          }
        ]
      },
      {
        "p": "p3",
        "label": "Tides & Waves",
        "children": [
          {
            "label": "Tides",
            "children": [
              { "label": "Causes: Moon (main) & Sun’s gravity, centrifugal force." },
              { "label": "Spring tide: Full & New Moon (Syzygy), max range." },
              { "label": "Neap tide: First & Third Quarter (Quadrature), min range." },
              { "label": "Perigean (Moon at Perigee) higher; Apogean lower." },
              { "label": "Tidal bore: steep wave upstream (Hooghly, Bay of Fundy)." }
            ]
          },
          {
            "label": "Waves & Tsunamis",
            "children": [
              { "label": "Wave: orbital motion; height, length, period. Tsunami: seismic sea wave, long wavelength, high speed in deep water." }
            ]
          }
        ]
      },
      {
        "p": "p3",
        "label": "Coral Reefs & Marine Resources",
        "children": [
          {
            "label": "Coral Reefs",
            "children": [
              { "label": "Symbiosis: polyps (animal) + Zooxanthellae (algae, 90% food/color)." },
              { "label": "Conditions: warm 20-21°C, shallow <50m, clean saline 27-30 ppt, no sediment." },
              { "label": "Types: Fringing (attached), Barrier (lagoon), Atoll (circular lagoon)." },
              { "label": "Bleaching: expulsion of zooxanthellae under stress (warming, acidification)." }
            ]
          },
          {
            "label": "Indian Reefs & Ocean Acidification",
            "children": [
              { "label": "Major reefs: Gulf of Mannar, Gulf of Kutch, A&N (fringing), Lakshadweep (atolls). Sundarbans no coral (freshwater)." },
              { "label": "Ocean acidification: CO₂ → carbonic acid, lowers pH, reduces carbonate for shells." }
            ]
          }
        ]
      }
    ]
  },
  // =========================== CHAPTER IV ===========================
  {
    "id": "IV",
    "p": "p3",
    "label": "Indian Geography: Physiography & Drainage",
    "children": [
      {
        "p": "p3",
        "label": "The Himalayas & Mountain Passes",
        "children": [
          {
            "label": "Himalayan Divisions",
            "children": [
              { "label": "Longitudinal: Trans-Himalaya (Karakoram, Ladakh, Zaskar – cold desert). Greater/Himadri (highest, granitic core). Lesser/Himachal (Pir Panjal, Dhauladhar, hill stations). Shiwaliks (foothills, duns)." },
              { "label": "Regional (W to E): Punjab/Kashmir, Kumaon, Nepal, Assam Himalayas." },
              { "label": "Karewas: glacio-fluvial deposits in Kashmir, ideal for saffron (Zafran)." }
            ]
          },
          {
            "label": "Crucial Passes (TRAP)",
            "children": [
              { "label": "J&K/Ladakh: Zoji La (Srinagar-Leh), Banihal (Jawahar Tunnel), Khardung La (highest motorable), Aghil Pass (Ladakh-China)." },
              { "label": "Himachal: Shipki La (Sutlej entry), Bara Lacha La, Rohtang Pass." },
              { "label": "Uttarakhand: Niti, Mana, Lipu Lekh (Kailash Mansarovar)." },
              { "label": "Sikkim/Arunachal: Nathu La, Jelep La; Bomdi La, Diphu Pass (Arunachal-Myanmar)." }
            ]
          },
          {
            "label": "Major Peaks",
            "children": [
              { "label": "K2 (Godwin-Austen): Karakoram, PoK, 2nd globally. Kanchenjunga: Sikkim, highest in India, 3rd globally." },
              { "label": "Nanda Devi: highest entirely within India (Uttarakhand). Namcha Barwa: eastern anchor (Tibet)." }
            ]
          }
        ]
      },
      {
        "p": "p3",
        "label": "Northern Plains & Peninsular Plateau",
        "children": [
          {
            "label": "Indo-Gangetic Plains",
            "children": [
              { "label": "Bhabar: porous, streams disappear. Terai: marshy, thick forests." },
              { "label": "Bhangar: older alluvium, high terraces, Kankar nodules. Khadar: newer alluvium, fertile floodplains." },
              { "label": "Delta Plain: Sundarbans, largest mangrove delta." }
            ]
          },
          {
            "label": "Peninsular Plateau",
            "children": [
              { "label": "Central Highlands: N of Narmada; Malwa, Bundelkhand, Chota Nagpur (Ruhr of India)." },
              { "label": "Deccan Plateau: S of Narmada, bounded by W & E Ghats; Deccan Trap (volcanic basalt)." },
              { "label": "Western Ghats: continuous, block mountains, orographic rain. Passes: Thal, Bhor, Pal Ghat, Shencottah. Highest: Anamudi." },
              { "label": "Eastern Ghats: discontinuous, relict. Highest: Jindhagada/Arma Konda." },
              { "label": "Convergence: Nilgiri Hills (Doddabetta). Cardamom Hills southernmost." }
            ]
          },
          {
            "label": "Coastal Plains & Islands",
            "children": [
              { "label": "West coast: narrow, submerged, natural ports. Kayals (backwaters). East coast: broad, emergent, deltas, lagoons (Chilika, Pulicat)." },
              { "label": "A&N: submerged Arakan Yoma; Barren Island (only active volcano). Ten Degree Channel separates groups." },
              { "label": "Lakshadweep: coral atolls. Nine Degree Channel separates Minicoy." },
              { "label": "TRAP: Indira Point (Great Nicobar) southernmost point, not Kanyakumari." }
            ]
          }
        ]
      },
      {
        "p": "p3",
        "label": "Drainage Systems (Rivers)",
        "children": [
          {
            "label": "Himalayan Rivers (Antecedent, Perennial)",
            "children": [
              { "label": "Indus: Left bank – Jhelum, Chenab, Ravi, Beas, Sutlej (Panjnad). Right bank – Shyok, Gilgit, Kabul. Indus Water Treaty 1960: India has Eastern rivers." },
              { "label": "Ganga: Devprayag (Bhagirathi+Alaknanda). Left bank: Ramganga, Gomti, Ghaghara, Gandak, Kosi (Sorrow of Bihar). Right: Yamuna, Son, Damodar (Sorrow of Bengal)." },
              { "label": "Brahmaputra: Yarlung Tsangpo in Tibet, U-turn at Namcha Barwa. Tribs: Dibang, Lohit, Subansiri, Teesta. Majuli – largest riverine island." }
            ]
          },
          {
            "label": "Peninsular Rivers (Concordant, Seasonal)",
            "children": [
              { "label": "East flowing (Deltas): Subarnarekha, Mahanadi, Godavari (Dakshin Ganga, longest peninsular), Krishna, Kaveri, Vaigai." },
              { "label": "West flowing (Estuaries): Narmada, Tapti (rift valleys), Mahi (crosses Tropic of Cancer twice), Sabarmati, Periyar." },
              { "label": "Inland drainage: Luni (Aravallis, endorheic, disappears in Rann of Kutch)." }
            ]
          },
          {
            "label": "Major Dams",
            "children": [
              { "label": "Bhakra-Nangal (Sutlej), Tehri (Bhagirathi, highest), Hirakud (Mahanadi, longest earthen), Sardar Sarovar (Narmada), Nagarjuna Sagar (Krishna), Mettur (Kaveri)." }
            ]
          }
        ]
      }
    ]
  },
  // =========================== CHAPTER V ===========================
  {
    "id": "V",
    "p": "p3",
    "label": "Indian Geography: Climate, Soils & Vegetation",
    "children": [
      {
        "p": "p3",
        "label": "Indian Monsoon & Rainfall",
        "children": [
          {
            "label": "Monsoon Mechanism",
            "children": [
              { "label": "Factors: differential heating, ITCZ shift, Tibetan Plateau heat, Mascarene High, Somali Jet." },
              { "label": "Jet streams: STWJ brings Western Disturbances (winter rain). TEJ strengthens SW monsoon." },
              { "label": "Teleconnections: El Niño weakens monsoon; La Niña strengthens; positive IOD aids monsoon." }
            ]
          },
          {
            "label": "Seasons & Rainfall Distribution",
            "children": [
              { "label": "SW Monsoon (June-Sept): Arabian Sea branch (W Ghats rain) & BoB branch (NE India, plains)." },
              { "label": "NE Monsoon (Oct-Dec): retreating, rain on Coromandel coast." },
              { "label": "Highest >200 cm: Mawsynram, Cherrapunji, windward W Ghats. Lowest <50 cm: W Rajasthan, N Ladakh." },
              { "label": "100 cm isohyet divides wetter east/coastal and drier west/interior." }
            ]
          }
        ]
      },
      {
        "p": "p3",
        "label": "Soils of India (ICAR)",
        "children": [
          {
            "label": "Major Soils",
            "children": [
              { "label": "Alluvial (43%): Northern plains, fertile, potash-rich, poor N, P. Wheat, rice, sugarcane." },
              { "label": "Black/Regur (15%): Deccan basalt, clayey, self-ploughing, Ca-Mg rich, poor N, P. Cotton best." },
              { "label": "Red & Yellow (18%): old crystalline, porous, low rainfall. Millets, pulses, groundnut." },
              { "label": "Laterite: high temp, wet-dry, intense leaching (desilication). Tea, coffee, cashew, brick." }
            ]
          },
          {
            "label": "Minor Soils & Problems",
            "children": [
              { "label": "Arid/Desert: NW, sandy, high salts. Saline/Alkaline (Usar): over-irrigation, gypsum reclamation." },
              { "label": "Peaty/Marshy: high rainfall, organic matter. Kerala (Kari), Sundarbans." },
              { "label": "Degradation: sheet & gully erosion (Chambal ravines), salinization." },
              { "label": "Conservation: contour ploughing, terracing, shelterbelts, afforestation." }
            ]
          }
        ]
      },
      {
        "p": "p3",
        "label": "Natural Vegetation & Wildlife",
        "children": [
          {
            "label": "Forest Types (Champion & Seth)",
            "children": [
              { "label": "Tropical Wet Evergreen: >200 cm, W Ghats, NE. Mahogany, ebony, rosewood." },
              { "label": "Tropical Moist Deciduous: 100-200 cm, most widespread. Teak, sal, sandalwood, bamboo." },
              { "label": "Tropical Dry Deciduous: 70-100 cm, tendu, amaltas." },
              { "label": "Tropical Thorn: <70 cm, kikar, babool, xerophytic." },
              { "label": "Montane: altitudinal zones; Sholas in Nilgiris (stunted forest + grassland)." },
              { "label": "Mangroves: tidal, salt-tolerant, pneumatophores, vivipary. Sundarbans, Bhitarkanika." }
            ]
          },
          {
            "label": "Protected Areas",
            "children": [
              { "label": "Tiger Reserves: 54+ (Project Tiger 1973). Jim Corbett (1st). Nagarjunsagar Srisailam (largest). Highest tigers: MP, Karnataka, Uttarakhand." },
              { "label": "Elephant Reserves: 33 (Project Elephant 1992). Highest numbers: Karnataka." },
              { "label": "Biosphere Reserves: 18; Nilgiri (1st). 12 UNESCO MAB." },
              { "label": "Ramsar Sites: 80+ (2024), max in TN, then UP. Chilika, Keoladeo (1st)." }
            ]
          }
        ]
      }
    ]
  },
  // =========================== CHAPTER VI ===========================
  {
    "id": "VI",
    "p": "p3",
    "label": "World Mapping & Geopolitical Regions",
    "children": [
      {
        "p": "p3",
        "label": "Important Seas & Bordering Countries",
        "children": [
          {
            "label": "Mediterranean Sea",
            "children": [
              { "label": "Europe: Spain, France, Monaco, Italy, Slovenia, Croatia, Bosnia, Montenegro, Albania, Greece, Malta." },
              { "label": "Africa: Morocco, Algeria, Tunisia, Libya, Egypt." },
              { "label": "Asia: Turkey, Syria, Lebanon, Israel, Palestine." },
              { "label": "TRAP: Jordan, Iraq, Portugal do NOT touch Mediterranean." }
            ]
          },
          {
            "label": "Other Seas",
            "children": [
              { "label": "Black Sea: Turkey, Bulgaria, Romania, Ukraine, Russia, Georgia (T-BURG)." },
              { "label": "Caspian Sea: Russia, Iran, Kazakhstan, Turkmenistan, Azerbaijan (TARIK). Uzbekistan does NOT touch." },
              { "label": "Red Sea: Egypt, Sudan, Eritrea (W); Saudi Arabia, Yemen (E). Bab-el-Mandeb." },
              { "label": "Aral Sea: Kazakhstan & Uzbekistan only." },
              { "label": "Baltic Sea: Denmark, Estonia, Latvia, Lithuania, Finland, Germany, Poland, Russia, Sweden." }
            ]
          }
        ]
      },
      {
        "p": "p3",
        "label": "Major Straits & Chokepoints",
        "children": [
          {
            "label": "Asian & Middle Eastern",
            "children": [
              { "label": "Strait of Malacca: Andaman–S China Sea (Malaysia/Indonesia). Busiest shipping lane." },
              { "label": "Strait of Hormuz: Persian Gulf–Gulf of Oman (Iran/UAE). Oil transit." },
              { "label": "Bab-el-Mandeb: Red Sea–Gulf of Aden (Djibouti–Yemen). 'Gate of Tears'." },
              { "label": "Sunda Strait: Java Sea–Indian Ocean (Sumatra–Java)." },
              { "label": "Palk Strait: Bay of Bengal–Gulf of Mannar (India–Sri Lanka)." },
              { "label": "Isthmus of Kra: Thailand, proposed canal." }
            ]
          },
          {
            "label": "Global Straits & Canals",
            "children": [
              { "label": "Strait of Gibraltar: Atlantic–Mediterranean (Spain–Morocco/UK)." },
              { "label": "Bosphorus & Dardanelles: Black Sea–Marmara–Aegean (Turkey)." },
              { "label": "Bering Strait: Chukchi–Bering Sea (Russia–USA), Date Line." },
              { "label": "Strait of Magellan: S America–Tierra del Fuego. Drake Passage south." },
              { "label": "Canals: Panama (Pacific–Atlantic, locks). Suez (Med–Red Sea, sea-level)." }
            ]
          }
        ]
      },
      {
        "p": "p3",
        "label": "Global Mountains & Rivers",
        "children": [
          {
            "label": "Mountain Ranges",
            "children": [
              { "label": "Andes: S America, longest continental range. Rockies & Appalachians: N America." },
              { "label": "Alps (Europe), Himalayas (Asia) – young fold. Ural: Europe-Asia boundary." },
              { "label": "Atlas: N Africa. Great Dividing Range: E Australia." }
            ]
          },
          {
            "label": "Major Rivers",
            "children": [
              { "label": "Nile: longest, north to Med. Amazon: largest discharge, east to Atlantic." },
              { "label": "Mississippi-Missouri: longest N America, Gulf of Mexico (bird-foot delta)." },
              { "label": "Mekong: 6 countries (NOT India/Bangladesh). Danube: 10 countries, Black Sea." },
              { "label": "Volga: longest Europe, into Caspian. Congo: deepest, crosses equator twice, into Atlantic." }
            ]
          }
        ]
      },
      {
        "p": "p3",
        "label": "Climate Extremes & Biodiversity",
        "children": [
          {
            "label": "Deserts",
            "children": [
              { "label": "Hot: Sahara (largest hot), Atacama (driest non-polar), Kalahari, Great Australian." },
              { "label": "Cold: Antarctica (largest overall), Gobi, Patagonia." }
            ]
          },
          {
            "label": "Forests & Hotspots",
            "children": [
              { "label": "Tropical Rainforests: Amazon, Congo, SE Asia." },
              { "label": "Biodiversity Hotspots: 36 globally. India's 4: W Ghats & Sri Lanka, Himalayas, Indo-Burma, Sundaland." }
            ]
          }
        ]
      }
    ]
  },
  // =========================== CHAPTER VII ===========================
  {
    "id": "VII",
    "p": "p3",
    "label": "Economic Geography & Agriculture",
    "children": [
      {
        "p": "p3",
        "label": "World Agriculture & Major Crops",
        "children": [
          {
            "label": "Global Crop Belts",
            "children": [
              { "label": "Wheat (Extensive): Prairies, Pampas, Steppes, Downs, Veldt. Rice (Intensive): Monsoon Asia." },
              { "label": "Maize: Corn Belt (USA). Cotton: China, India, USA, Pakistan, Brazil." },
              { "label": "Plantation crops: Coffee (Brazil largest, India shade-grown Arabica/Robusta in W Ghats), Tea (China, India – Assam/Darjeeling, Sri Lanka, Kenya), Rubber (Thailand, Indonesia, Malaysia, India – Kerala)." }
            ]
          },
          {
            "label": "Shifting Cultivation (Slash & Burn)",
            "children": [
              { "label": "India: Jhumming (NE), Podu (AP/Odisha), Bewar/Dahiya (MP), Kumari (W Ghats)." },
              { "label": "World: Milpa (Mexico), Roca (Brazil), Ladang (Indonesia/Malaysia), Ray (Vietnam), Chena (Sri Lanka)." }
            ]
          }
        ]
      },
      {
        "p": "p3",
        "label": "Indian Agriculture",
        "children": [
          {
            "label": "Cropping Seasons & Crop Requirements",
            "children": [
              { "label": "Kharif (Jun-Sep): rice, maize, jowar, bajra, tur, cotton, jute, groundnut, soybean." },
              { "label": "Rabi (Oct-Mar): wheat, barley, gram, mustard, linseed." },
              { "label": "Zaid (Mar-Jun): irrigated, watermelon, cucumber, vegetables." },
              { "label": "Rice: >25°C, >100 cm rain, clayey loam. Wheat: 10-15°C growing, 50-75 cm rain, loam. Sugarcane: frost lethal. Cotton: 210 frost-free days, black Regur soil." },
              { "label": "MSP: CACP recommends for 22 mandated crops + FRP for sugarcane; 14 Kharif, 6 Rabi, 2 commercial." }
            ]
          },
          {
            "label": "Agricultural Revolutions",
            "children": [
              { "label": "Green Revolution (1960s): HYV seeds, fertilisers, irrigation (Punjab, Haryana, W UP)." },
              { "label": "White Revolution (Operation Flood 1970): NDDB, Verghese Kurien (AMUL). India largest milk producer." },
              { "label": "Blue (fisheries), Yellow (oilseeds), Golden (horticulture/honey), Silver (eggs/poultry)." }
            ]
          },
          {
            "label": "Key Schemes & Reforms",
            "children": [
              { "label": "e-NAM (unified agri market), PM-KISAN (income support), PMFBY (crop insurance), Soil Health Card, PKVY (organic farming)." },
              { "label": "Farm Acts 2020 (repealed 2021). Debate on MSP vs market freedom." }
            ]
          }
        ]
      },
      {
        "p": "p3",
        "label": "Mineral Resources & Industries",
        "children": [
          {
            "label": "India's Mineral Belts & Mines",
            "children": [
              { "label": "NE Peninsula (Chota Nagpur): richest belt. Jharkhand, Odisha, WB, Chhattisgarh. Coal (Damodar), iron, manganese, bauxite, mica (Koderma)." },
              { "label": "Central/Southern (Dharwar, Karnataka): high-grade iron (Kudremukh), gold (Kolar/Hutti)." },
              { "label": "Specific: Bailadila (CG, hematite, export to Japan via Vizag); Khetri (Rajasthan copper); Jaduguda (Jharkhand uranium); Tummalapalle (AP uranium)." },
              { "label": "Coal: Gondwana (98%, bituminous, 250 my old) in Damodar, Mahanadi, Godavari, Wardha valleys. Tertiary (lignite/peat) in TN Neyveli, Assam, Meghalaya." }
            ]
          },
          {
            "label": "Key Industries",
            "children": [
              { "label": "Iron & Steel: weight-losing, near coal/iron. Jamshedpur (Tata), Bokaro, Durgapur, Rourkela, Visakhapatnam (port-based)." },
              { "label": "Aluminium: power-intensive, cheap electricity primary. Korba (CG), Renukoot (UP), NALCO (Odisha)." },
              { "label": "Textiles: proximity to cotton, humid climate. Mumbai, Ahmedabad (Manchester of India), Coimbatore. Jute: Hooghly basin (retting water)." }
            ]
          },
          {
            "label": "Critical Global Minerals",
            "children": [
              { "label": "Lithium: 'Triangle' – Argentina, Bolivia, Chile. Australia largest hard-rock producer." },
              { "label": "Cobalt: DRC dominates (>70%). Rare Earths (REEs): China dominates mining & refinement." },
              { "label": "Uranium: Kazakhstan (in-situ), Canada, Australia (largest reserves)." }
            ]
          }
        ]
      },
      {
        "p": "p3",
        "label": "Transport & Communication",
        "children": [
          {
            "label": "Railways & Roadways",
            "children": [
              { "label": "Railways: 18+ zones. Dedicated Freight Corridors: Eastern (Ludhiana-Dankuni), Western (Dadri-JNPT)." },
              { "label": "Roadways: NH 44 (Srinagar-Kanyakumari, longest). Golden Quadrilateral, N-S & E-W Corridors (intersect at Jhansi)." }
            ]
          },
          {
            "label": "Ports & Waterways",
            "children": [
              { "label": "Major Ports (12): West – Mumbai (largest), JNPT (most container), Kandla (tidal). East – Chennai (oldest artificial), Visakhapatnam (deepest landlocked), Kolkata/Haldia (riverine)." },
              { "label": "National Waterways: NW-1 (Ganga, Haldia-Allahabad), NW-2 (Brahmaputra, Dhubri-Sadiya), NW-3 (West Coast Canal, Kerala)." }
            ]
          }
        ]
      }
    ]
  },
  // =========================== CHAPTER VIII ===========================
  {
    "id": "VIII",
    "p": "p3",
    "label": "Social Geography & Demography",
    "children": [
      {
        "p": "p3",
        "label": "Population Dynamics",
        "children": [
          {
            "label": "Census 2011 Highlights",
            "children": [
              { "label": "Total: 1.21 billion (17.5% world pop on 2.4% land). Most populous: UP > Maharashtra > Bihar > WB." },
              { "label": "Density: 382/km². Highest: Bihar (1106); lowest: Arunachal (17)." },
              { "label": "Sex Ratio: 940; best Kerala (1084); worst Haryana (879). Child sex ratio (0-6): 919." },
              { "label": "Literacy: 74.04% (M 82.14%, F 65.46%). Highest Kerala (93.91%); lowest Bihar (61.80%)." }
            ]
          },
          {
            "label": "Demographic Trends",
            "children": [
              { "label": "Demographic Dividend: working-age (15-59) >62%, dependency ratio declining." },
              { "label": "Decadal growth: 17.7% (slowing). TFR ~2.0 (NFHS-5), many states below replacement (2.1)." }
            ]
          }
        ]
      },
      {
        "p": "p3",
        "label": "Migration & Urbanization",
        "children": [
          {
            "label": "Migration Patterns",
            "children": [
              { "label": "Push: rural poverty, unemployment. Pull: urban jobs, amenities." },
              { "label": "Inter-state: Rural-to-Rural (female marriage migration) dominant; Rural-to-Urban (male economic)." }
            ]
          },
          {
            "label": "Urbanization",
            "children": [
              { "label": "Urban population: 31.16% (2011). Highest %: TN; highest absolute: Maharashtra." },
              { "label": "Mega cities (>10m): Mumbai, Delhi, Kolkata, Bengaluru, Chennai, Hyderabad, Ahmedabad." },
              { "label": "Smart Cities Mission (100 cities). AMRUT (basic services). PMAY-Urban (Housing for All)." }
            ]
          }
        ]
      },
      {
        "p": "p3",
        "label": "Scheduled Tribes & Indigenous People",
        "children": [
          {
            "label": "Tribal Demographics",
            "children": [
              { "label": "Largest ST pop: MP > Maharashtra > Odisha." },
              { "label": "Highest % ST: Lakshadweep (94.8%), Mizoram (94.4%), Nagaland, Meghalaya." },
              { "label": "TRAP: Punjab, Haryana, Chandigarh, Delhi, Puducherry have no notified STs." }
            ]
          },
          {
            "label": "PVTGs & Tribal Movements",
            "children": [
              { "label": "PVTGs: 75 groups (Dhebar Commission). Sentinelese, Jarawa, Onge, Shompen (A&N); Bonda (Odisha); Cholanaikkans (Kerala); Sahariya (MP/Rajasthan)." },
              { "label": "Movements: Birsa Munda Ulgulan, Santhal Hul. PESA Act 1996 (Gram Sabha empowerment in Schedule V areas)." }
            ]
          }
        ]
      }
    ]
  },
  // =========================== CHAPTER IX ===========================
  {
    "id": "IX",
    "p": "p3",
    "label": "Geography-Environment Overlap & Current Affairs Static",
    "children": [
      {
        "p": "p3",
        "label": "Protected Areas & Rivers Flowing Through",
        "children": [
          {
            "label": "National Parks & Rivers",
            "children": [
              { "label": "Jim Corbett NP (Uttarakhand): Ramganga. Kaziranga NP (Assam): Brahmaputra, Diphlu, Mora Dhansiri." },
              { "label": "Silent Valley NP (Kerala): Kunthi river. Manas NP (Assam): Manas river (right-bank Brahmaputra)." },
              { "label": "Namdapha NP (Arunachal): Noa-Dihing river, biodiversity hotspot." }
            ]
          },
          {
            "label": "Tiger Reserves & Rivers",
            "children": [
              { "label": "Panna TR (MP): Ken river (Ken-Betwa link). Sathyamangalam TR (TN): Moyar river. Sundarbans NP (WB): tidal estuaries." }
            ]
          }
        ]
      },
      {
        "p": "p3",
        "label": "Biosphere Reserves & Ramsar Sites",
        "children": [
          {
            "label": "Biosphere Reserves",
            "children": [
              { "label": "18 BRs. Nilgiri (1st, 1986). Newest: Panna (2011), Seshachalam Hills (2011). 12 UNESCO MAB." }
            ]
          },
          {
            "label": "Ramsar Sites",
            "children": [
              { "label": "80+ sites (2024), highest in South Asia. Maximum in Tamil Nadu, then UP." },
              { "label": "Recent additions (2024): Ankasamudra, Aghanashini (Karnataka); Karaivetti, Longwood Shola (TN)." },
              { "label": "Montreux Record: Keoladeo NP, Loktak Lake. Chilika removed (2002)." }
            ]
          }
        ]
      },
      {
        "p": "p3",
        "label": "Climate Change & Disasters",
        "children": [
          {
            "label": "Global Agreements",
            "children": [
              { "label": "Kyoto Protocol (1997): binding cuts for Annex-I. Paris Agreement (2015): limit warming <2°C, 1.5°C. NDCs." },
              { "label": "India's Panchamrit (COP26): 500 GW non-fossil by 2030, net-zero 2070. ISA & CDRI initiated by India." }
            ]
          },
          {
            "label": "Vulnerability Zones & Movements",
            "children": [
              { "label": "Earthquake/landslide: Himalayas (Zone IV/V). Cyclone: East Coast. Floods: Indo-Gangetic plain, Assam. Drought: Marathwada, Vidarbha, Bundelkhand." },
              { "label": "Movements: Chipko (Garhwal), Appiko (Karnataka), Silent Valley (Kerala), Narmada Bachao Andolan (Medha Patkar)." }
            ]
          }
        ]
      },
      {
        "p": "p3",
        "label": "Important Maps & Location-based Facts",
        "children": [
          {
            "label": "Borders & Neighbours",
            "children": [
              { "label": "Land borders (longest to shortest): Bangladesh (4096 km) > China > Pakistan > Nepal > Myanmar > Bhutan > Afghanistan (106 km via PoK)." },
              { "label": "Neighbor capitals: Dhaka, Kathmandu, Colombo/Sri Jayawardenepura Kotte, Islamabad, Thimphu, Naypyidaw." },
              { "label": "States bordering Myanmar: Arunachal, Nagaland, Manipur, Mizoram (ARUNa-MAMi)." }
            ]
          },
          {
            "label": "Important Latitudes & Longitudes",
            "children": [
              { "label": "Tropic of Cancer (23.5°N): passes through 8 states – Gujarat, Rajasthan, MP, Chhattisgarh, Jharkhand, WB, Tripura, Mizoram." },
              { "label": "Indian Standard Meridian (82.5°E): Mirzapur (UP). Intersects Tropic of Cancer in Chhattisgarh. 5 states: UP, MP, Chhattisgarh, Odisha, AP." },
              { "label": "Latitudinal & Longitudinal extent: 8°4'N – 37°6'N, 68°7'E – 97°25'E. ~30° span causes 2-hour time difference." }
            ]
          }
        ]
      }
    ]
  },
  // =========================== CHAPTER X ===========================
  {
    "id": "X",
    "p": "p3",
    "label": "Geoinformatics & Techniques (Prelims Relevant)",
    "children": [
      {
        "p": "p3",
        "label": "Remote Sensing & GIS",
        "children": [
          {
            "label": "Remote Sensing",
            "children": [
              { "label": "Passive sensors: optical, thermal. Active sensors: Radar, Lidar (emit own energy)." },
              { "label": "Platforms: Ground, airborne, spaceborne." },
              { "label": "Indian satellites: IRS series, Cartosat, Resourcesat, RISAT." },
              { "label": "Stages: energy source, interaction with atmosphere & target, sensor recording, processing, interpretation." }
            ]
          },
          {
            "label": "GIS & GNSS",
            "children": [
              { "label": "GIS: Hardware, software, data, people, methods. Spatial data: raster (grid) vs vector (points, lines, polygons)." },
              { "label": "Applications: urban planning, disaster management, resource mapping, site suitability." },
              { "label": "GNSS: GPS (USA), GLONASS (Russia), Galileo (EU), BeiDou (China), NavIC (India's regional satellite navigation)." }
            ]
          }
        ]
      }
    ]
  }
] satisfies RawSubjectNode[];

export const RAW_PRELIMS = RAW_D;
