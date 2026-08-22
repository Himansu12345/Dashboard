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
              {
                "label": "🔴| First Law (Inertia), Second (F=ma), Third (Action-Reaction).\nMomentum conservation, impulse.\nTRAP: Impulse = Force × Time. Airbags increase time → reduce force → save lives."
              },
              {
                "label": "🟠| Friction: static > kinetic > rolling; useful (walking) and harmful (wear). Lubricants reduce friction.\nTRAP: Rolling friction is less than sliding friction; that's why wheels are used."
              },
              {
                "label": "🟡| MAINS: Application in vehicle safety (seat belts, airbags – increase time of impact to reduce force).\nTRAP: Seat belts restrain motion over a longer time to reduce force on the body."
              }
            ]
          },
          {
            "label": "Gravitation",
            "children": [
              {
                "label": "🔴| Universal law: F = G(m₁m₂)/r².\nAcceleration due to gravity (g) varies with latitude (max at poles, min at equator), altitude (decreases), depth (decreases)."
              },
              {
                "label": "🟠| Weightlessness in free fall; satellites orbit due to centripetal force provided by gravity.\nTRAP: Astronauts in ISS are NOT 'zero gravity' – they are in free fall, experiencing microgravity."
              },
              {
                "label": "🔴| Escape velocity (11.2 km/s for Earth).\nGeostationary orbit: ~35,786 km above the equator; orbital period ≈ 24 h; zero inclination relative to Earth’s equator.\nTRAP: GEO requires geosynchronous period + equatorial circular orbit; altitude alone does not define GEO."
              }
            ]
          },
          {
            "label": "Fluid Mechanics",
            "children": [
              {
                "label": "🔴| Pascal's law – pressure applied to confined fluid transmits equally (hydraulic press, brakes).\nArchimedes principle – buoyant force = weight of displaced fluid (ships, submarines)."
              },
              {
                "label": "🔴| Bernoulli principle: in steady flow, higher fluid speed is associated with lower static pressure; applications include Venturi meters and atomizers.\nTRAP: Airfoil lift is not explained safely by the oversimplified “curved top = faster air” story alone; pressure distribution, circulation and angle of attack matter."
              },
              {
                "label": "🟡| Surface tension & capillarity (meniscus, capillary rise in plants, detergents reduce tension)."
              }
            ]
          },
          {
            "label": "Elasticity",
            "children": [
              {
                "label": "⚪| Stress, strain, Hooke's law, Young's modulus.\nElastic (spring) vs plastic (permanent) deformation.\nTRAP: Elastic limit – beyond it, Hooke's law fails and material undergoes plastic deformation."
              }
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
              {
                "label": "🔴| Scales: Celsius, Fahrenheit, Kelvin (absolute zero = -273.15°C).\nTRAP: Kelvin has no degree symbol (°K is incorrect; K is correct)."
              },
              {
                "label": "🟠| Conduction (solids), convection (fluids), radiation (vacuum).\nBlack body radiation; Stefan-Boltzmann law (E ∝ T⁴)."
              },
              {
                "label": "🔴| Specific heat capacity: water has high specific heat → climate moderation (coastal areas have moderate temperature).\nLatent heat: phase change without temperature change (ice at 0°C → water at 0°C)."
              }
            ]
          },
          {
            "label": "Laws of Thermodynamics",
            "children": [
              {
                "label": "🟠| Zeroth: thermal equilibrium.\nFirst: energy conservation (ΔU = Q - W).\nSecond: entropy always increases; heat flows hot to cold; no perfect engine.\nTRAP: Perpetual motion machine is impossible (violates second law)."
              },
              {
                "label": "🟡| Third: absolute zero unreachable.\nApplications: refrigerators, heat engines, AC.\nCarnot cycle: ideal efficiency, no real engine reaches it."
              }
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
              {
                "label": "🟠| Transverse (light, water ripples) vs longitudinal (sound, seismic P-waves).\nFrequency (Hz), wavelength (λ), amplitude, velocity (v = fλ)."
              },
              {
                "label": "🟠| Doppler effect: shift in frequency due to relative motion (siren approaching = higher pitch, receding = lower pitch).\nApplications: radar, redshift (universe expanding), blueshift."
              }
            ]
          },
          {
            "label": "Sound",
            "children": [
              {
                "label": "🔴| Speed: solid > liquid > gas.\nSupersonic (Mach number >1) → sonic boom.\nTRAP: Light travels faster than sound; that's why we see lightning before hearing thunder."
              },
              {
                "label": "🟠| Ultrasound (>20 kHz): medical imaging (sonography), sonar, cleaning.\nInfrasound (<20 Hz): elephant communication, earthquake monitoring."
              },
              {
                "label": "🟡| Resonance: sympathetic vibration (bridge collapse; opera singer breaking glass).\nMusical instruments: standing waves, harmonics (overtones)."
              }
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
              {
                "label": "🔴| Reflection: law (angle of incidence = angle of reflection), plane & spherical mirrors, real/virtual images.\nTRAP: Convex mirror = diverging, forms virtual, diminished images (used in rear-view mirrors)."
              },
              {
                "label": "🔴| Refraction: Snell’s law (n₁ sin θ₁ = n₂ sin θ₂); refractive index; total internal reflection (optical fibres, prism systems, diamond sparkle).\nTRAP: Mirage arises from refraction through a temperature-dependent refractive-index gradient and may involve total internal reflection in some cases."
              },
              {
                "label": "🟠| Lenses: convex (converging – magnifying glass), concave (diverging).\nPower of lens (Dioptre = 1/f in metres).\nHuman eye defects: myopia (short-sighted – concave lens), hypermetropia (long-sighted – convex lens), presbyopia (bifocal), astigmatism (cylindrical)."
              }
            ]
          },
          {
            "label": "Physical Optics",
            "children": [
              {
                "label": "🟡| Interference (thin film colours – soap bubbles, oil on water), diffraction (CD/DVD patterns), polarization (sunglasses reduce glare, LCD screens)."
              },
              {
                "label": "🔴| Scattering: Rayleigh (blue sky – shorter wavelengths scattered more; red sunset – longer wavelengths scatter least), Tyndall effect (colloids scatter light – e.g., milk)."
              }
            ]
          },
          {
            "label": "Electromagnetic Spectrum",
            "children": [
              {
                "label": "🔴| In order of increasing λ: Gamma, X‑ray, UV, Visible (VIBGYOR), IR, Microwave, Radio.\nTRAP: Increasing frequency = decreasing wavelength. Gamma has highest frequency, Radio has lowest."
              },
              {
                "label": "🟠| Applications: Gamma (cancer therapy, sterilisation), X‑ray (medical imaging, security), UV (water purification, vitamin D production), IR (night vision, remote sensing), Microwave (radar, cooking), Radio (broadcasting)."
              },
              {
                "label": "🔴| TRAP: IR is used for night vision, NOT UV.\nUV is used for purification; X‑ray for bone scans."
              }
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
              {
                "label": "🔴| Ohm's law (V=IR), resistance.\nSeries (same current, voltage divides) vs parallel (same voltage, current divides).\nHeating effect (electric iron, fuse).\nTRAP: Fuse wire is low melting point and high resistance – melts during overcurrent to protect circuit."
              },
              {
                "label": "🟠| AC (alternating current) vs DC (direct current): DC constant direction, AC alternates (50 Hz in India).\nTransformers work on AC (mutual induction), not DC.\nTRAP: Transformers do NOT work on DC because they require changing magnetic flux."
              }
            ]
          },
          {
            "label": "Magnetism",
            "children": [
              {
                "label": "🟡| Magnetic field lines, Earth's magnetism (dynamo effect – moving liquid iron core).\nElectromagnets (temporary, iron core).\nPermanent magnets: ferromagnetic materials (iron, cobalt, nickel).\nTRAP: Soft iron is used in electromagnets because it magnetises quickly and demagnetises quickly (temporary)."
              },
              {
                "label": "🟠| Applications: MRI (medical imaging), maglev trains, electric motors (electrical → mechanical), generators (mechanical → electrical)."
              }
            ]
          },
          {
            "label": "Electromagnetic Induction",
            "children": [
              {
                "label": "🔴| Faraday's law: changing magnetic field induces current.\nGenerator (mechanical → electrical), motor (electrical → mechanical)."
              },
              {
                "label": "🟡| Induction cooktop (eddy currents heat the pan), wireless charging (inductive coupling), metal detectors."
              }
            ]
          },
          {
            "label": "Semiconductors & Electronics",
            "children": [
              {
                "label": "🟠| Semiconductors: intrinsic vs extrinsic; doping (n‑type: excess electrons from pentavalent impurities; p‑type: holes from trivalent impurities).\np‑n junction diode (rectifier – converts AC to DC)."
              },
              {
                "label": "🟡| Light Emitting Diode (LED): efficient light source (semiconductor emits light when forward biased).\nPhotodiode: light sensor (reverse bias).\nSolar cell: photovoltaic effect (converts light to electricity)."
              },
              {
                "label": "🔴| Transistor: switch/amplifier; IC (Integrated Circuit) – miniaturised electronic circuit.\nSuperconductivity: zero electrical resistance and Meissner effect below the critical temperature; applications include MRI, maglev and specialised power systems.\nTRAP: Widespread grid-scale power transmission remains constrained by cooling, cost, materials and infrastructure challenges; do not treat superconductors as absent from all power applications."
              }
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
              {
                "label": "🔴| Atomic structure: nucleus contains protons and neutrons; electrons occupy quantised energy states/orbitals."
              },
              {
                "label": "🔴| Isotopes: same atomic number Z, different mass number A."
              },
              {
                "label": "🟠| Isobars: same mass number A, different atomic number Z."
              },
              {
                "label": "🟠| Isotones: same neutron number N, different atomic number Z."
              },
              {
                "label": "🟠| Radioactivity: alpha (helium nucleus, paper stop), beta (electron, thin metal stop), gamma (high energy EM, thick lead/concrete).\nHalf-life: time for 50% of radioactive nuclei to decay."
              },
              {
                "label": "🔴| Nuclear fission: heavy nucleus splits (U-235 + n → Ba + Kr + 3n + E).\nChain reaction, nuclear reactor, atomic bomb.\nNuclear fusion: light nuclei combine (H-2 + H-3 → He-4 + n + E).\nSun's energy, H‑bomb, ITER project (fusion research)."
              },
              {
                "label": "🟡| Applications: nuclear power generation uses reactors such as PHWRs, PWRs and BWRs."
              },
              {
                "label": "🟡| Radiotherapy: Co-60 is a gamma source; nuclear medicine uses radioisotopes such as I-131."
              },
              {
                "label": "🟠| Radiocarbon dating: C-14 half-life ≈ 5730 years; useful mainly for relatively recent organic material."
              },
              {
                "label": "🟠| TRAP: isotope choice depends on the application; radioisotopes differ in emission type, half-life and biological behaviour."
              }
            ]
          },
          {
            "label": "Quantum Mechanics & Relativity",
            "children": [
              {
                "label": "🟠| Wave-particle duality (light & electrons behave as both wave and particle).\nPhotoelectric effect (Einstein: light as photons; basis for solar panels)."
              },
              {
                "label": "🔴| Special relativity: E=mc² (mass-energy equivalence), time dilation (moving clocks run slow), length contraction.\nGeneral relativity: gravity as curvature of spacetime (GPS correction – time runs slower near Earth's surface)."
              },
              {
                "label": "🟡| Gravitational waves: ripples in spacetime, detected by LIGO; LIGO‑India project (planned in Maharashtra).\nHiggs boson: observed at CERN’s Large Hadron Collider in 2012; its associated field explains why many elementary particles acquire mass. Photons and gluons remain massless."
              }
            ]
          },
          {
            "label": "Lasers",
            "children": [
              {
                "label": "🔴| LASER: Light Amplification by Stimulated Emission of Radiation.\nProperties: monochromatic (single wavelength), coherent (same phase), directional (highly focused)."
              },
              {
                "label": "🟡| Applications: fiber optics communication, surgery (LASIK – eye), cutting/welding, printers, barcode scanners, LIDAR (Light Detection and Ranging – 3D mapping, autonomous vehicles)."
              }
            ]
          },
          {
            "label": "Communication Technologies",
            "children": [
              {
                "label": "🟠| Modulation: AM (amplitude – long-range, but susceptible to noise), FM (frequency – high quality, shorter range).\nNeeded for long‑distance transmission."
              },
              {
                "label": "🔴| Radar: Radio Detection and Ranging (air traffic, weather).\nLiDAR: Light Detection and Ranging (3D mapping, autonomous vehicles).\nSonar: Sound Navigation and Ranging (underwater – ships, submarines)."
              }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Seismology & Earthquake Physics",
        "children": [
          {
            "label": "Earthquake Waves & Measurement",
            "children": [
              {
                "label": "🔴| P-waves are fastest and can travel through solids, liquids and gases; S-waves are slower and do not propagate through liquids."
              },
              {
                "label": "🔴| S-wave shadow zone is evidence that the outer core is liquid; P-wave shadow-zone patterns helped infer Earth’s internal structure."
              },
              {
                "label": "🔴| Richter magnitude scale measures earthquake size using wave amplitudes in a logarithmic framework; modern seismology commonly uses moment magnitude (Mw) for large earthquakes."
              },
              {
                "label": "🟠| Magnitude is a property of the earthquake source, while intensity describes observed effects/damage at a location; the two should not be conflated."
              }
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
              {
                "label": "🔴| Atomic number (Z) = number of protons.\nMass number (A) = protons + neutrons.\nMole concept: 1 mole = 6.022 × 10²³ particles (Avogadro's number)."
              },
              {
                "label": "🟠| Chemical bonding: ionic (transfer, e.g., NaCl), covalent (sharing, e.g., H₂O), metallic (sea of electrons, e.g., Cu).\nHydrogen bonding (weak, but crucial for water and DNA structure)."
              }
            ]
          },
          {
            "label": "Periodic Table",
            "children": [
              {
                "label": "🟡| Groups (vertical) and periods (horizontal).\nTrends: electronegativity (decreases down group, increases across period), ionization energy (same), atomic size (increases down group, decreases across period)."
              },
              {
                "label": "🔴| Key groups: alkali metals (Group 1 – reactive, e.g., Na, K), alkaline earth (Group 2 – Ca, Mg), halogens (Group 17 – F, Cl, Br, I – reactive non-metals), noble gases (Group 18 – He, Ne, Ar – inert)."
              }
            ]
          },
          {
            "label": "Acids, Bases & Salts",
            "children": [
              {
                "label": "🔴| pH scale (0-14): 0-6 acid, 7 neutral (pure water), 8-14 base.\nAcid + base → salt + water (neutralisation).\nImportant: stomach acid (HCl), antacids (Mg(OH)₂, Al(OH)₃)."
              },
              {
                "label": "🟠| Buffer solutions maintain pH (blood buffering – bicarbonate system).\nSoaps: sodium/potassium salts of fatty acids; micelle formation (dirt removal).\nTRAP: Soaps do NOT work in hard water (Ca²⁺/Mg²⁺ precipitate as scum).\nDetergents: synthetic, work in hard water (do not form scum)."
              }
            ]
          },
          {
            "label": "Electrochemistry & Batteries",
            "children": [
              {
                "label": "🟠| Electrochemical cell: chemical energy ↔ electrical energy; anode is oxidation, cathode is reduction."
              },
              {
                "label": "🔴| Battery basics: primary cells are generally non-rechargeable; secondary cells are rechargeable. Lithium-ion cells use intercalation/de-intercalation of Li-ions."
              },
              {
                "label": "🟠| Battery technologies: Li-ion, sodium-ion, solid-state and flow batteries differ in energy density, safety, cycle life, cost and materials."
              }
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
              {
                "label": "🔴| Baking soda (NaHCO₃) – antacid, fire extinguisher (CO₂ release), cooking (leavening agent).\nWashing soda (Na₂CO₃) – water softener (removes Ca²⁺/Mg²⁺).\nBleaching powder (CaOCl₂) – disinfectant, bleaching agent."
              },
              {
                "label": "🔴| Plaster of Paris (CaSO₄·½H₂O) – setting involves hydration (CaSO₄·2H₂O).\nGypsum (CaSO₄·2H₂O) – cement, soil conditioner, POP production."
              },
              {
                "label": "🟡| Common salt (NaCl) – food preservation.\nSodium hydroxide (NaOH, caustic soda) – soap, paper.\nHydrochloric acid (HCl) – cleaning, pickling of metals."
              }
            ]
          },
          {
            "label": "Industrial Processes & Materials",
            "children": [
              {
                "label": "🟠| Haber process: N₂ + 3H₂ ⇌ 2NH₃ (ammonia for fertilizers).\nOstwald process: 4NH₃ + 5O₂ → 4NO + 6H₂O → HNO₃ (nitric acid).\nContact process: 2SO₂ + O₂ → 2SO₃ → H₂SO₄ (sulphuric acid)."
              },
              {
                "label": "🟡| Glass: soda‑lime glass (ordinary – Na₂O·CaO·SiO₂), borosilicate glass (Pyrex – heat‑resistant, B₂O₃).\nCement: limestone (CaCO₃), clay (silica/alumina), gypsum; sets via hydration (reaction with water)."
              },
              {
                "label": "🟠| Water hardness: temporary (Ca(HCO₃)₂, removed by boiling – decomposes to CaCO₃) and permanent (CaSO₄, MgCl₂, removed by washing soda or ion exchange)."
              }
            ]
          },
          {
            "label": "Polymers & Plastics",
            "children": [
              {
                "label": "🟡| Natural polymers: cellulose (plants), starch, proteins, DNA, natural rubber (polyisoprene).\nSynthetic: polyethylene (PE – bags), PVC (pipes), nylon (fibres), Teflon (PTFE – non-stick), Bakelite (thermosetting – electrical switches)."
              },
              {
                "label": "🔴| Biodegradable vs non-biodegradable.\nMicroplastics as major pollutant (enter food chain, toxic effects).\nTRAP: Biodegradable plastics still require specific conditions (industrial composting) to degrade."
              },
              {
                "label": "🟠| MAINS: Plastic waste management, ban on single-use plastics, alternatives (bioplastics from starch/cellulose)."
              }
            ]
          },
          {
            "label": "Fertilizers & Pesticides",
            "children": [
              {
                "label": "🟠| NPK fertilizers (Nitrogen, Phosphorus, Potassium).\nUrea (highest N content ~46%).\nTRAP: Overuse of fertilizers leads to eutrophication (excess nutrients → algal blooms → oxygen depletion in water bodies)."
              },
              {
                "label": "🟡| Pesticides: insecticides (DDT – persistent organic pollutant, banned in many countries), herbicides, fungicides.\nBio-pesticides (neem, BT) as eco-friendly alternative."
              }
            ]
          },
          {
            "label": "Metals & Alloys",
            "children": [
              {
                "label": "🔴| Important alloys: Stainless steel (Fe + Cr + Ni) – corrosion resistant, Brass (Cu + Zn) – decorative, Bronze (Cu + Sn) – ancient, Solder (Pb + Sn) – low melting, Amalgam (Hg + metal) – dental fillings."
              },
              {
                "label": "🟠| Corrosion: rusting of iron (requires O₂ + H₂O).\nPrevention: galvanization (Zn coating – sacrificial protection), painting, alloying (stainless steel)."
              }
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
              {
                "label": "🟡| Solid (coal, wood), liquid (petroleum, diesel, kerosene), gas (CNG, LPG, hydrogen).\nCalorific value = energy released per unit mass."
              },
              {
                "label": "🔴| CNG (Compressed Natural Gas – methane) – clean burning, used in vehicles.\nLPG (Liquefied Petroleum Gas – propane+butane) – cooking.\nHydrogen – highest calorific value, clean fuel (product is water).\nTRAP: Hydrogen is not a primary energy source; it's an energy carrier (must be produced from water/electricity)."
              }
            ]
          },
          {
            "label": "Combustion & Fire Safety",
            "children": [
              {
                "label": "🔴| Fire triangle: fuel, oxygen, heat.\nTypes of fire extinguishers: water (Class A – solids), CO₂ (Class B/C – liquids/electrical), foam, dry powder (Class D – metals).\nTRAP: Water should NOT be used on electrical or oil fires (conductor, oil floats on water)."
              }
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
              {
                "label": "🟠| Air: SOx, NOx (acid rain – damages monuments, aquatic life), CO (toxic, binds hemoglobin – reduces O₂ carrying capacity), particulate matter (PM2.5, PM10 – respiratory issues), ozone (good up in stratosphere, bad down at ground level – smog)."
              },
              {
                "label": "🟡| Water: heavy metals (Pb, Hg, Cd – neurotoxins), nitrates, phosphates (eutrophication).\nBOD (Biochemical Oxygen Demand) measures organic pollution – higher BOD = more polluted."
              },
              {
                "label": "🔴| Ozone depletion: CFCs (chlorofluorocarbons) breakdown O₃ in stratosphere.\nMontreal Protocol (1987) phased out CFCs – one of the most successful international treaties.\nTRAP: Global warming and ozone depletion are DIFFERENT problems (though some gases contribute to both)."
              },
              {
                "label": "🟠| MAINS: Climate change mitigation (reducing GHG emissions), green chemistry principles (design safer chemicals, reduce hazardous by-products)."
              }
            ]
          },
          {
            "label": "MAINS: Green Chemistry & Sustainability",
            "children": [
              {
                "label": "🟠| Principles of Green Chemistry – atom economy, designing safer chemicals, and reducing hazardous by-products to achieve sustainable industrial processes."
              },
              {
                "label": "🟡| Life-cycle analysis of plastics – the persistence of non-biodegradable synthetic polymers and the cascading ecological impacts of microplastics entering the food web."
              }
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
              {
                "label": "🟠| Prokaryotic (no true nucleus, no membrane-bound organelles, e.g., bacteria) vs Eukaryotic (true nucleus, organelles, e.g., plants, animals).\nOrganelles: mitochondria (powerhouse – ATP production), chloroplast (photosynthesis), ribosomes (protein synthesis – present in both)."
              }
            ]
          },
          {
            "label": "DNA & RNA",
            "children": [
              {
                "label": "🔴| DNA: double helix; bases: Adenine (A) pairs with Thymine (T) – 2 H-bonds; Guanine (G) pairs with Cytosine (C) – 3 H-bonds.\nRNA: single-stranded; A pairs with Uracil (U); G pairs with C.\nmRNA (messenger – carries code to ribosome), tRNA (transfer – brings amino acids), rRNA (ribosomal – forms ribosomes)."
              },
              {
                "label": "🔴| Central dogma: DNA → RNA → Protein.\nCRISPR-Cas9: genome-editing system derived from a bacterial adaptive immune mechanism; guide RNA directs Cas9 to a target DNA sequence.\nTRAP: CRISPR can edit, remove, insert or otherwise modify DNA; it is not limited to “editing existing genes.”"
              },
              {
                "label": "🟠| Reverse transcription: in retroviruses (HIV), RNA → DNA via enzyme reverse transcriptase."
              }
            ]
          },
          {
            "label": "Cell Division & Cancer",
            "children": [
              {
                "label": "🟠| Mitosis (identical daughter cells, for growth/repair).\nMeiosis (gametes – sperm/egg, halving chromosomes, generates genetic variation)."
              },
              {
                "label": "🔴| Cancer: uncontrolled abnormal cell growth driven by accumulated genetic/epigenetic changes. Carcinogens include tobacco smoke, UV and ionising radiation; treatments include chemotherapy, radiotherapy and immunotherapy.\nTRAP: Cancer itself is not a communicable disease, although some infectious agents can cause cancers."
              }
            ]
          },
          {
            "label": "Classical Genetics",
            "children": [
              {
                "label": "🟠| Mendel’s laws: Law of Dominance, Law of Segregation, Law of Independent Assortment (except linked genes)."
              },
              {
                "label": "🔴| Sex determination: XY system (XX = female, XY = male; sperm determines sex).\nSex-linked disorders: haemophilia (blood clotting), colour blindness – carried on X chromosome.\nTRAP: Males (XY) are more likely to express X-linked recessive disorders (single X)."
              },
              {
                "label": "🔴| Blood groups: ABO system (A, B, AB, O); Rh factor (+/−).\nFor red-cell transfusion: O− is the usual “universal donor” and AB+ the usual “universal recipient”; plasma compatibility is different.\nTRAP: Rh negative mother with Rh positive baby can lead to erythroblastosis fetalis (haemolytic disease)."
              },
              {
                "label": "🟡| Genetic disorders: Down syndrome (trisomy 21 – extra chromosome 21), Thalassemia (blood disorder – reduced haemoglobin production), Sickle cell anaemia (misshapen RBCs – genetic mutation)."
              }
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
              {
                "label": "🟠| Digestive: enzymes break down food; absorption in small intestine (villi increase surface area).\nRespiratory: O₂/CO₂ exchange in alveoli (thin walls, large surface area); hemoglobin carries oxygen.\nCellular respiration: aerobic (glucose + O₂ → CO₂ + H₂O + ATP) in mitochondria; anaerobic (fermentation) in muscles (lactic acid) and yeast (ethanol).\nATP as energy currency."
              },
              {
                "label": "🔴| Circulatory: heart (4 chambers – right atrium/ventricle pumps to lungs, left to body).\nArteries (away from heart, high pressure), veins (to heart, low pressure, valves).\nBlood: RBC (oxygen transport – hemoglobin), WBC (immunity – phagocytes, lymphocytes), platelets (clotting – thrombocytes)."
              },
              {
                "label": "🟠| Nervous: brain (cerebrum – cognition, cerebellum – coordination, medulla – involuntary functions), spinal cord, neurons (conduct signals), synapse (junction), reflex arc (rapid automatic response)."
              },
              {
                "label": "🟡| Endocrine: hormones – insulin (pancreas, lowers glucose – diabetes if deficient), thyroxine (thyroid, metabolism – goitre if deficient), adrenaline (adrenal, stress response)."
              }
            ]
          },
          {
            "label": "Vitamins & Minerals",
            "children": [
              {
                "label": "🔴| Water‑soluble vitamins: B‑complex (B₁‑thiamine – beriberi; B₂‑riboflavin; B₃‑niacin – pellagra; B₆; B₁₂ – pernicious anaemia; folic acid), C (ascorbic acid – scurvy).\nFat‑soluble: A (night blindness), D (rickets), E (antioxidant), K (blood clotting – haemorrhagic disease).\nTRAP: Excess fat-soluble vitamins (A, D, E, K) are stored in the body and can be toxic; water-soluble excess is excreted."
              },
              {
                "label": "🔴| Minerals: iron (anaemia – haemoglobin), iodine (goitre – thyroxine), calcium (osteoporosis – bones/teeth)."
              }
            ]
          },
          {
            "label": "Immunity & Vaccines",
            "children": [
              {
                "label": "🟠| Innate (non-specific – skin, mucus, WBC) vs adaptive (specific – antibodies, memory cells).\nAntibodies (proteins – produced by B-cells), antigens (foreign substances)."
              },
              {
                "label": "🔴| Vaccines train adaptive immunity using different platforms: live-attenuated, inactivated, subunit/conjugate, viral-vector, mRNA and others; they generate immune memory without requiring disease-causing infection.\nTypes: live-attenuated (MMR – measles, mumps, rubella), inactivated (polio – Salk), mRNA vaccines (COVID-19 – Pfizer, Moderna), viral vector (Covishield – AstraZeneca).\nTRAP: mRNA vaccines do NOT contain the virus; they contain genetic instructions to produce the spike protein."
              },
              {
                "label": "🟠| MAINS: Vaccine development, herd immunity (when majority are immune, spread is limited), public health importance."
              }
            ]
          },
          {
            "label": "Major Diseases & Pathogens",
            "children": [
              {
                "label": "🟡| Viral: COVID-19 (SARS-CoV-2), HIV/AIDS (retrovirus – targets CD4+ T-cells), Hepatitis B/C, Dengue (Aedes mosquito), Chikungunya, Zika."
              },
              {
                "label": "🟠| Bacterial: Tuberculosis (Mycobacterium – lungs), Typhoid (Salmonella – food/water), Cholera (Vibrio – severe diarrhoea), Leprosy.\nTRAP: Antibiotics work on bacteria, NOT on viruses (viral infections require antiviral drugs)."
              },
              {
                "label": "🟡| Protozoan: Malaria (Plasmodium – Anopheles mosquito; affects RBCs/liver), Kala‑azar (Leishmania – sandfly), Amoebiasis (Entamoeba – contaminated food/water)."
              },
              {
                "label": "⚪| Fungal: ringworm, candidiasis.\nPrion: mad cow disease (CJD – misfolded proteins)."
              }
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
              {
                "label": "🔴| Photosynthesis: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂.\nOccurs in chloroplasts (chlorophyll pigment). Light reactions (thylakoids) and dark reactions (Calvin cycle – stroma)."
              },
              {
                "label": "🟠| Transpiration pull (water loss from leaves creates tension), cohesion‑tension theory (water column pulled up).\nXylem (water and minerals – upward), Phloem (food – bidirectional)."
              }
            ]
          },
          {
            "label": "Plant Hormones & Tropisms",
            "children": [
              {
                "label": "🟡| Auxins: apical dominance (top inhibits side shoots), phototropism (growth towards light).\nGibberellins: stem elongation, seed germination.\nCytokinins: cell division, delay senescence.\nEthylene: fruit ripening (climacteric fruits).\nAbscisic acid: stress hormone (closing stomata during drought)."
              },
              {
                "label": "🟠| Tropisms: phototropism (light – auxin accumulates on shaded side, causing growth towards light), geotropism (gravity – roots grow downwards, shoots upwards), hydrotropism (water – roots grow towards water)."
              }
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
              {
                "label": "🟠| Genetic Engineering: recombinant DNA technology – restriction enzymes (molecular scissors), plasmids (vectors), ligase (molecular glue)."
              },
              {
                "label": "🔴| PCR (Polymerase Chain Reaction): amplify DNA (thermal cycler, Taq polymerase).\nGel Electrophoresis: separate DNA fragments by size.\nDNA fingerprinting: forensic, paternity – uses VNTR/STR (Variable Number of Tandem Repeats / Short Tandem Repeats).\nTRAP: PCR amplifies DNA, but does NOT sequence it (sequencing identifies the order of bases)."
              },
              {
                "label": "🔴| Bt Crops (Bacillus thuringiensis – Cry gene produces protein toxic to insect pests), Golden Rice (beta-carotene gene from daffodil → Vitamin A production)."
              }
            ]
          },
          {
            "label": "Stem Cells & Cloning",
            "children": [
              {
                "label": "🟠| Embryonic (pluripotent – can become any cell type) vs adult stem cells (multipotent – limited).\nInduced pluripotent stem cells (iPSCs): adult cells reprogrammed to pluripotent state (Shinya Yamanaka – Nobel 2012)."
              },
              {
                "label": "🔴| Therapeutic cloning (stem cell therapy) vs reproductive cloning (Dolly the sheep, 1996 – SCNT technique).\nSCNT: somatic nucleus + enucleated egg → reconstructed embryo → surrogate.\nIndia: NDRI Karnal – clones (Garima – buffalo, Noorie – pashmina goat)."
              },
              {
                "label": "🟠| MAINS: Potential in regenerative medicine, organ transplant, ethical frameworks (banned in India for human reproduction)."
              }
            ]
          },
          {
            "label": "Transgenic Organisms & GM Crops",
            "children": [
              {
                "label": "🟠| Plants: Bt Cotton, Bt Brinjal, herbicide-tolerant (HT) crops (DMH-11 – mustard).\nAnimals: transgenic mice for research (e.g., onco-mice)."
              },
              {
                "label": "🟠| Regulation: GEAC (Genetic Engineering Appraisal Committee) under MoEFCC.\nConcerns: biosafety, impact on biodiversity, farmer rights (seed dependency).\nTRAP: GM crops are NOT inherently unsafe; they undergo rigorous field trials before approval."
              }
            ]
          },
          {
            "label": "Modern Biotech Platforms",
            "children": [
              {
                "label": "🔴| mRNA technology: delivers messenger RNA so host cells make a target protein; the mRNA itself does not integrate into nuclear DNA."
              },
              {
                "label": "🟠| Gene therapy: replaces, repairs, silences or otherwise modifies gene function; viral vectors and non-viral delivery systems are important platforms."
              },
              {
                "label": "🟡| Synthetic biology: designs or rewires biological systems for defined functions; applications include biofuels, therapeutics and biomanufacturing."
              }
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
              {
                "label": "🟠| Fermentation: Yeast (Saccharomyces) – bread (CO₂), alcohol (ethanol).\nBacteria: Lactobacillus – curd, yogurt (lactic acid fermentation)."
              },
              {
                "label": "🔴| Antibiotics: Penicillium notatum (Fleming, 1928) → Penicillin.\nSoil bacteria: Streptomyces → streptomycin (tuberculosis)."
              }
            ]
          },
          {
            "label": "Harmful Microbes",
            "children": [
              {
                "label": "🟡| Food spoilage (bacteria/fungi); food poisoning (Salmonella, Clostridium botulinum – botulism).\nPreservation methods: refrigeration, pasteurization (milk – 72°C for 15s), canning, salting."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "IV",
    "p": "pm",
    "label": "Nanotechnology & Robotics (Emerging Technologies)",
    "children": [
      {
        "p": "pm2",
        "label": "Nanotechnology",
        "children": [
          {
            "label": "Basics & Principles",
            "children": [
              {
                "label": "🔴| Nano = 10⁻⁹ m (1 billionth of a metre).\nRichard Feynman (1959) – 'There is Plenty of Room at the Bottom' – Father of Nanotechnology."
              },
              {
                "label": "🟠| Properties change at nanoscale due to:\n  1. Quantum effects (discrete energy levels, altered optical/electrical properties).\n  2. High surface‑to‑volume ratio (increased reactivity, strength, thermal properties)."
              },
              {
                "label": "🔴| Silver example:\n  Macro: metal (utensils/jewellery).\n  Micro: conductor (electronics).\n  Nano: antibacterial (nanocrystals) – used in wound dressings.\nTRAP: Nanomaterials can show size-dependent changes in optical, catalytic and electronic properties; avoid absolute “solid becomes liquid” claims without specifying conditions."
              }
            ]
          },
          {
            "label": "Top-Down vs Bottom-Up",
            "children": [
              {
                "label": "🟠| Top‑Down: breaking bulk material into nano‑sized particles (physical/mechanical).\nAdv: precise patterns/control.\nDisadv: time‑consuming, expensive, limited scalability."
              },
              {
                "label": "🟡| Bottom‑Up: building atom‑by‑atom (chemical/biological).\nAdv: cost‑effective, scalable, more control over composition.\nDisadv: requires precise environmental control, risk of impurities."
              }
            ]
          },
          {
            "label": "Carbon Nanomaterials",
            "children": [
              {
                "label": "🟠| Graphene: single layer of carbon atoms in hexagonal lattice; 1 atom thick, Graphene: exceptionally strong (for defect-free single-layer material) and highly electrically/thermally conductive; avoid absolute strength/conductivity multipliers that depend on the comparison and test conditions.\nApplications: flexible displays (Samsung prototype), transistors (IBM – 4x faster than silicon), solar cells."
              },
              {
                "label": "🔴| Carbon Nanotubes (CNT): rolled graphene sheet; CNTs: very high strength-to-weight ratio and excellent electrical/thermal properties; exact strength factors depend on structure, defects and comparison.\nThermal: withstands 780°C (air), 2800°C (vacuum).\nTRAP: CNT can be metallic OR semiconducting depending on roll orientation."
              },
              {
                "label": "🟠| Fullerene (C₆₀): spherical (soccer ball shape); applications in drug delivery, superconductors, nanotechnology."
              },
              {
                "label": "🟡| Dendrimers: branched tree‑like carbon structures; used in medical applications (drug delivery)."
              }
            ]
          },
          {
            "label": "Applications of Nanotechnology",
            "children": [
              {
                "label": "🟠| Health: Targeted drug delivery (fullerene carriers), nano‑biosensors (disease detection – cancer, Alzheimer's), tissue engineering (nano‑gels), antimicrobial dressings (silver nanocrystals)."
              },
              {
                "label": "🟡| Environment: Nano solar cells (Graphene+CNT – double efficiency), fuel cells (platinum nanoparticles), nano‑zeolites (petrol refining), nano‑sensors (pollutant detection – mercury, water contamination), water filtration (silver + magnetic nanomaterials)."
              },
              {
                "label": "🟡| Defence: Nano‑bio detection scheme, soldier equipment (ISN – MIT, ARCI – India), technical fabrics."
              },
              {
                "label": "🟡| Agriculture: Nano‑fertilizers (Nano Urea – higher efficiency), nano‑pesticides (targeted delivery), seed modification (Chiang Mai University – colour change)."
              },
              {
                "label": "🟡| Electronics: Graphene transistors (4x faster), flexible displays, energy‑efficient circuits."
              },
              {
                "label": "🟡| Textiles: Antimicrobial (silver), self‑cleaning (titanium dioxide – Sunwash), virus‑resistant (copper oxide)."
              }
            ]
          },
          {
            "label": "Issues & Concerns",
            "children": [
              {
                "label": "🟠| Health: Nanoparticles can cross blood‑brain barrier, cause toxicity (nano‑toxicity).\nSocial: cost → accessibility → social disparity."
              },
              {
                "label": "🟡| Environmental: Nano‑pollution, Green Goo (toxins), Grey Goo (nanocatalysts destroying structures).\nCould enter food chain – most nanomaterials under safety assessment."
              },
              {
                "label": "🟡| Economic: High energy cost, reliance on rare/precious elements."
              }
            ]
          },
          {
            "label": "Nanotechnology in India",
            "children": [
              {
                "label": "🟡| NSTI (Nano Science and Tech Initiative – 2001): 19 Centres of Excellence.\nNano Mission (2007): promote research, infrastructure, human capital; Nano Mission Council under Prof. CNR Rao."
              },
              {
                "label": "🟡| INST Mohali (Institute of Nano Science and Technology).\nNanoelectronics centres: IIT Delhi, IIT Bombay, IISc Bengaluru.\nNano Park – Bengaluru (first in India)."
              },
              {
                "label": "🟡| Achievements: 3rd in scientific publications (2013); 5000 research papers, 500 PhDs (by 2014).\nChallenge: lab‑to‑market gap; lack of private sector interest."
              },
              {
                "label": "🟡| ICONSAT (International Conference on Nanotech) – promotes bilateral collaboration."
              }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Robotics",
        "children": [
          {
            "label": "Basics & Parts",
            "children": [
              {
                "label": "🔴| Robot: automatic self‑control multi‑purpose reprogrammable machine.\nRobotics: multi‑disciplinary (mechanics, computers, electronics, AI)."
              },
              {
                "label": "🟠| Parts: End effector (terminal device – welding gun, screwdriver).\nManipulator (arm – motors/joints).\nLocomotion device (wheels/pedals).\nSensor (receives information).\nController (computer – gives commands)."
              }
            ]
          },
          {
            "label": "Types of Robots",
            "children": [
              {
                "label": "🟠| Based on Locomotion: Fixed (industrial arms), Mobile (wheeled – even surfaces; legged – uneven).\nBased on Working Ability: Type I (better than humans – non‑skill tasks); Type II (worse than humans – dangerous environments)."
              },
              {
                "label": "🟡| Based on Shape: Mechanical (industrial), Humanoid (female – Gynoid e.g., Sofia; male – Android; animal – Robo Dog Aibo, Robo Cat TAMA)."
              }
            ]
          },
          {
            "label": "Asimov's Laws of Robotics",
            "children": [
              {
                "label": "🔴| Law 1: Robot shall not harm a human (actively or passively).\nLaw 2: Robot shall obey humans unless violates Law 1.\nLaw 3: Robot shall protect its existence unless violates Law 1 & 2.\nZeroth Law: Robot shall not harm humanity (supercedes individual)."
              }
            ]
          },
          {
            "label": "Applications",
            "children": [
              {
                "label": "🟠| Industry: 3Ds (Dull, Dirty, Dangerous).\nRobotics industry is expanding rapidly; China has been the largest industrial-robot market, while India’s installations have grown strongly. Treat exact unit counts/rankings as current-affairs data, not permanent static facts."
              },
              {
                "label": "🟡| Health: Robotic surgery (Da Vinci, MANTRA 3 – India's indigenous).\nRobotic prosthetics/orthotics (exoskeleton).\nMedical service robots (Robo‑Mitra, Robo‑Doc, C‑Astra – Invento Robotics)."
              },
              {
                "label": "🟡| Home: Service robots (cleaning – iRobot), cooking (NOSH), companion (Aibo, TAMA).\nConcerns: emotional bonding, human‑robot intimacy, misuse."
              },
              {
                "label": "🟡| Defence: Killing machines (REX Mark II – Israel, CHEETAH – USA).\nHelpers: MULE (India – high altitude), Daksh (DRDO – mine detection), Hexapod (CAIR).\nEthical concerns: violates Asimov's laws, lack of empathy, increased wars, hacking risk."
              },
              {
                "label": "🟡| Agriculture: GreenSeeker (fertilizer/irrigation optimization), See‑and‑Spray (weed control – Blue River Technology), Agribot (India)."
              },
              {
                "label": "🟡| Disaster Management: Bandicoot (sewer cleaning – Gen Robotics, India), Swarm robots, Soft robots (octopus‑inspired)."
              }
            ]
          },
          {
            "label": "Robotics in India",
            "children": [
              {
                "label": "🟡| CAIR (Centre for Artificial Intelligence and Robotics) – DRDO.\nAICRA (All India Council for Robotics and Automation) – non‑profit for standards/ecosystem."
              },
              {
                "label": "🟡| India’s robotics-policy discussions emphasise manufacturing, healthcare, agriculture and national security; treat specific strategy targets/wording as policy/current-affairs material and verify the latest government document before the exam."
              },
              {
                "label": "🟡| Indian robots: Laxmi (City Union Bank – first banking robot), ERA (HDFC – humanoid), BRABO (TAL – India's first industrial robot, 40% lower cost)."
              }
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
        "label": "Orbits & Space Concepts",
        "children": [
          {
            "label": "Types of Orbits",
            "children": [
              {
                "label": "🔴| LEO (Low Earth Orbit): 200‑2000 km. Remote sensing satellites.\nMEO (Medium Earth Orbit): 2000‑20000 km. Navigation satellites (GPS, NavIC).\nGEO (Geostationary Orbit): 36,000 km, orbital period 24h, zero inclination, appears fixed. Communication/weather satellites.\nTRAP: GEO is a subset of GSO (Geosynchronous) – GSO has inclination; GEO has zero inclination. All GEO are GSO, not vice versa."
              },
              {
                "label": "🟠| Polar Orbit: inclination ~90°, altitude ~600 km, orbital period ~100 min. Remote sensing, passes over poles.\nSSPO (Sun‑Synchronous Polar Orbit): satellite stays on circle of illumination; orbital plane shifts ~1° per day. All SSPO are Polar, not vice versa."
              },
              {
                "label": "🟡| Transfer Orbit: below designated orbit; satellite raises height using own fuel."
              }
            ]
          },
          {
            "label": "Escape & Orbital Velocity",
            "children": [
              {
                "label": "🟡| Escape velocity (Earth) = 11.2 km/s (minimum to escape gravity).\nOrbital velocity (LEO) ~7.8 km/s.\nLagrange points (L1‑L5): stable points in Sun‑Earth system; zero net gravity. Aditya‑L1 at L1 (1.5 million km from Earth)."
              }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Indian Space Programme – ISRO",
        "children": [
          {
            "label": "Launch Vehicles",
            "children": [
              {
                "label": "🔴| SLV (Satellite Launch Vehicle): 1980, 40 kg to LEO, 4‑stage solid (India's first).\nASLV: 1987, 150 kg to LEO, 5‑stage solid."
              },
              {
                "label": "🟡| PSLV (Polar Satellite Launch Vehicle): 1994, 1750 kg to Polar, 1425 kg to GTO.\nWorkhorse of ISRO; 4‑stage (alternate solid/liquid).\nVariants: PSLV‑G (6 SOM), PSLV‑CA (Core Alone – no SOM), PSLV‑XL (6 SOM – most powerful), PSLV‑QL (4 SOM), PSLV‑DL (2 SOM).\nTRAP: PSLV is for polar/LEO; GSLV is for GTO."
              },
              {
                "label": "🟡| GSLV (Geosynchronous Satellite Launch Vehicle): 3‑stage (solid + liquid + cryogenic).\nGSLV Mk II: 2.5 tonnes to GTO; first indigenous cryogenic engine (2014).\nLVM3 (GSLV Mk III): 4 tonnes to GTO; used for Chandrayaan‑3, Gaganyaan."
              },
              {
                "label": "🟡| SSLV (Small Satellite Launch Vehicle): 500 kg to LEO, 300 kg to SSPO; all‑solid 3‑stage; assembly in 72 hours; allows weekly launches."
              },
              {
                "label": "🟠| RLV (Reusable Launch Vehicle): RLV‑TD (Technology Demonstrator) testing: HEX (2016), LEX/PUSHPAK (2023‑24), REX, SPEX (Scramjet).\nBenefits: cost reduction, global market, space tourism."
              },
              {
                "label": "🟠| NGLV (Next Generation Launch Vehicle – Project Soorya): 10‑30 tonnes to LEO; semi‑cryogenic (Kerosene + LOX); green fuel; reusable first stage."
              }
            ]
          },
          {
            "label": "Satellite Types & Series",
            "children": [
              {
                "label": "🟡| Communication: INSAT/GSAT (GEO – telecom, weather).\nEarth Observation: IRS, Cartosat (high resolution), RISAT (radar imaging – all‑weather), Oceansat.\nNavigation: NavIC (IRNSS – 7 satellites).\nScience: Astrosat, Chandrayaan, Mangalyaan, Aditya‑L1."
              }
            ]
          },
          {
            "label": "ISRO Propulsion",
            "children": [
              {
                "label": "🔴| Solid fuel: HTPB (Hydroxyl Terminated Polybutadiene) – no engine, less controlled.\nLiquid fuel: UDMH (Unsymmetrical Dimethylhydrazine) + N₂O₄ oxidizer – VIKAS engine.\nCryogenic fuel: LH₂ (-253°C) + LOX (-183°C) – max efficiency, India 6th country to develop cryo (2014).\nSemi‑cryogenic: Kerosene + LOX – for NGLV."
              }
            ]
          },
          {
            "label": "Major Missions",
            "children": [
              {
                "label": "🟡| Chandrayaan‑1 (2008): India's first lunar orbiter; discovered water molecules on Moon; Moon Impact Probe dropped near South Pole – Jawahar Point.\nChandrayaan‑2 (2019): Lander (Vikram) crash‑landed – Tiranga Point.\nChandrayaan‑3 (2023): Soft landing near South Pole (Shiv Shakti Point); first to land on South Pole; confirmed sulphur presence on lunar surface (LIBS); ChaSTE measured 70°C surface temperature (vs earlier estimates 20‑30°C)."
              },
              {
                "label": "🟡| Mangalyaan (MOM, 2013): India's first interplanetary mission; PSLV‑XL; first country to reach Mars orbit in first attempt; 4th globally, 1st in Asia.\nMangalyaan‑2: planned (LVM3)."
              },
              {
                "label": "🟡| Gaganyaan: India’s human-spaceflight programme using LVM3; crewed mission to low Earth orbit after uncrewed tests. Vyommitra is a humanoid test platform for precursor missions.\nCA-sensitive: Shubhanshu Shukla has already flown to the ISS on Axiom-4 (2025); do not memorize the old astronaut-designate list as a current status."
              },
              {
                "label": "🟡| Aditya‑L1 (2023): India's first solar observatory; placed at L1 (Halo orbit); 7 payloads; studies Sun's corona, solar wind, magnetic field.\nTRAP: Aditya‑L1 is at L1, not L2 (JWST is at L2)."
              },
              {
                "label": "🟡| XPoSAT (2024): India's first polarimetry mission; studies X‑rays from stars (life cycle, neutron stars, black holes); POLIX + XSPECT payloads; world's second X‑ray polarimetry mission (after NASA)."
              },
              {
                "label": "🟡| Astrosat (2015): India's first multi‑wavelength space observatory; LEO 650 km; studies celestial objects in visible, UV, X‑rays."
              },
              {
                "label": "🟠| NISAR (NASA‑ISRO SAR): first spaceborne Earth-observation mission using both L-band and S-band SAR; launched by GSLV-F16 on 30 July 2025 and entered science operations.\nUPSC core: dual-frequency SAR + Earth observation + NASA–ISRO collaboration."
              },
              {
                "label": "🟡| EMISAT (2019): electronic surveillance satellite (ISRO + DRDO); detects radar signals for intelligence."
              }
            ]
          },
          {
            "label": "Satellite Navigation (NavIC & GAGAN)",
            "children": [
              {
                "label": "🟡| NavIC (Navigation with Indian Constellation): India’s regional satellite-navigation system; provides Standard Position Service for civilian use and Restricted Service for authorised users. Uses GEO/GSO satellites and signals in L5 and S-band.\nCA-sensitive: constellation size, satellite health, accuracy and NVS-series status can change; verify current ISRO configuration before the exam."
              },
              {
                "label": "🔴| GAGAN (GPS Aided Geo‑Augmented Navigation): Satellite Based Augmentation System (SBAS) by ISRO + AAI; improves GPS accuracy in Indian airspace for aviation."
              }
            ]
          },
          {
            "label": "International Space Law & Diplomacy",
            "children": [
              {
                "label": "🔴| Outer Space Treaty (1967): prohibits national appropriation of celestial bodies; bans placing nuclear weapons/WMD in orbit or on celestial bodies; requires peaceful use of the Moon and other celestial bodies.\nTRAP: “Peaceful purposes” does not mean every military use of outer space is prohibited; military support/satellites exist, while certain activities are prohibited."
              },
              {
                "label": "🟠| Artemis Accords: non-binding principles for civil exploration of the Moon and beyond, including transparency, interoperability, resource extraction under the Outer Space Treaty framework, debris mitigation and preservation of heritage sites.\nCA-sensitive: membership count changes; verify India’s latest participation status before the exam."
              },
              {
                "label": "🟡| India's Space Diplomacy: South Asian Communication Satellite; NavIC services to SAARC nations; remote sensing/weather data sharing; countering China's APsCO (Asia‑Pacific Space Cooperation Organisation)."
              }
            ]
          },
          {
            "label": "Space Debris & Sustainability",
            "children": [
              {
                "label": "🟠| Kessler Syndrome (1978): collision chain reaction → debris belt.\nProject NETRA (Network for space object Tracking and Analysis): early warning system for satellite collision avoidance."
              },
              {
                "label": "🟡| Space-debris mitigation: passivation, controlled re-entry, graveyard orbits for some GEO satellites, collision avoidance and active debris-removal technologies.\nCA-sensitive: individual demonstrator mission dates/status change over time."
              }
            ]
          },
          {
            "label": "Impact of ISRO",
            "children": [
              {
                "label": "🟠| Social: Tele‑education, Tele‑medicine, DTH, communication.\nEconomic: Technical consultancy to 650+ industries; launching services, remote sensing data.\nDefence: GSAT‑7/7A (defence communication), NavIC, HySIS, EMISAT."
              }
            ]
          },
          {
            "label": "Key ISRO Centres",
            "children": [
              {
                "label": "⚪| VSSC (Thiruvananthapuram) – rockets.\nUR Rao Satellite Centre (Bengaluru) – satellites.\nLPSC (Valiamala) – propulsion.\nSDSC (Sriharikota) – launch.\nISTRAC (Bengaluru) – tracking.\nTERLS (Thumba – 1963) – first India rocket station."
              }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Global Space Missions",
        "children": [
          {
            "label": "🟡| NASA (USA): Artemis (Moon), Mars rovers (Curiosity, Perseverance).\nJWST (infrared, L2 – deep space).\nESA: Rosetta (asteroid landing).\nCNSA: Chang'e (Moon), Tiangong (space station)."
          }
        ]
      },
      {
        "label": "Space Science Essentials",
        "children": [
          {
            "label": "🔴| Space weather: solar flares, coronal mass ejections and high-energy particles can disrupt satellites, GNSS, radio communication and power grids."
          },
          {
            "label": "🟠| Lagrange points are locations where gravitational and orbital dynamics allow useful relative positioning; “zero net gravity” is an oversimplification."
          },
          {
            "label": "🟡| SAR (Synthetic Aperture Radar) is an active microwave remote-sensing technique and can image day/night and through clouds."
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Space Sector Reforms, Institutions & Private Space",
        "children": [
          {
            "label": "Institutional Architecture",
            "children": [
              {
                "label": "🟠| Indian Space Policy 2023: defines roles of Department of Space, ISRO, IN-SPACe, NSIL and Non-Government Entities (NGEs); mature operational systems are to increasingly transition to industry while ISRO focuses more on advanced R&D and new technology."
              },
              {
                "label": "🔴| IN-SPACe: autonomous, single-window nodal agency under the Department of Space for promoting, enabling, authorising and supervising space activities of non-government entities."
              },
              {
                "label": "🔴| NSIL: wholly owned Government of India company under Department of Space; commercial arm of ISRO for commercialisation of space technologies/services and industry participation."
              },
              {
                "label": "🟡| Private space ecosystem examples: Skyroot Aerospace (Vikram-S), Agnikul Cosmos (Agnibaan), Dhruva Space and other Indian start-ups; focus on learning the role/technology, not memorising changing company valuations or launch counts."
              }
            ]
          },
          {
            "label": "Exam Associations",
            "children": [
              {
                "label": "🔴| IN-SPACe = authorise/promote/supervise private space activities; NSIL = commercialise space technologies/services; ISRO = R&D, missions and advanced technology; DoS = overarching policy/coordination role."
              },
              {
                "label": "🟡| Indian Space Policy 2023 is a policy framework rather than a statutory regulator; avoid treating IN-SPACe as an independent ministry."
              }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Remote Sensing, GIS & GNSS Applications",
        "children": [
          {
            "label": "Core Concepts",
            "children": [
              {
                "label": "🔴| Remote sensing: obtaining information about Earth objects/phenomena without direct physical contact, commonly using satellite or airborne sensors."
              },
              {
                "label": "🔴| GIS: system for storing, managing, analysing and visualising geographically referenced data using spatial layers."
              },
              {
                "label": "🔴| GNSS: umbrella term for satellite navigation constellations such as GPS, GLONASS, Galileo, BeiDou and NavIC."
              },
              {
                "label": "🟠| Remote sensing + GIS applications: agriculture/crop monitoring, drought and flood assessment, forest mapping, groundwater/watershed planning, urban planning, disaster management, coastal monitoring and weather/ocean studies."
              }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Upcoming / Proposed Planetary Missions",
        "children": [
          {
            "label": "India-Japan & Venus Exploration",
            "children": [
              {
                "label": "🟡| LUPEX: India-Japan lunar polar exploration concept, focused on lunar south-polar exploration and resource/volatile studies; proposed mission status can change."
              },
              {
                "label": "🟡| Shukrayaan-1: proposed Indian Venus mission concept for studying Venusian atmosphere and surface; treat launch date/status as Current Affairs-sensitive rather than a fixed fact."
              }
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
        "label": "Weapon Systems",
        "children": [
          {
            "label": "Conventional vs Nuclear",
            "children": [
              {
                "label": "🟡| Conventional: Kinetic (rubber bullets, pellets), Chemical (bullets, RDX, TNT).\nNuclear: Atom bomb (fission), H‑bomb (fusion).\nChemical Weapons: banned under Chemical Weapons Convention (1993).\nBiological Weapons: banned under Biological Weapons Convention (1972)."
              }
            ]
          },
          {
            "label": "India's Nuclear Triad",
            "children": [
              {
                "label": "🟡| Land: Agni series, Prithvi.\nAir: Mirage‑2000, Sukhoi Su‑30MKI, Jaguar, Rafale.\nSea: INS Arihant (SSBN) – K‑15 (750 km), K‑4 (3500 km), K‑5 (5000‑6000 km – under development).\nTRAP: Nuclear triad ensures credible second‑strike capability → deterrence."
              }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Missile Systems",
        "children": [
          {
            "label": "Ballistic vs Cruise",
            "children": [
              {
                "label": "🔴| Ballistic: parabolic trajectory (exo‑atmospheric); e.g., Agni, Prithvi, Dhanush, K‑series.\nCruise: low altitude, continuous powered flight; e.g., BrahMos, Nirbhay.\nTRAP: Ballistic missiles are rocket‑powered only in initial phase; cruise are powered throughout."
              }
            ]
          },
          {
            "label": "IGMDP (Integrated Guided Missile Development Programme – 1983)",
            "children": [
              {
                "label": "🟡| Agni: long‑range ballistic (surface‑to‑surface).\nPrithvi: short‑range tactical (surface‑to‑surface).\nAkash: surface‑to‑air (30‑80 km).\nTrishul: short‑range surface‑to‑air (decommissioned 2008).\nNag: anti‑tank guided missile (Fire & Forget; infrared guidance)."
              }
            ]
          },
          {
            "label": "Major Indian Missiles",
            "children": [
              {
                "label": "🟡| Agni Series: Agni‑I (700‑900 km), Agni‑II (2000 km), Agni‑III (3000 km), Agni‑IV (4000 km), Agni‑V (5000+ km – ICBM with MIRV capability). Agni‑Prime (1000‑2000 km – lighter, maneuverable).\nTRAP: Agni‑V is India's first ICBM (range > 5000 km)."
              },
              {
                "label": "🔴| Prithvi Series: Prithvi‑I (150 km), Prithvi‑II (250‑350 km), Prithvi‑III (350 km).\nPrahar (150 km – replacing Prithvi‑I; solid fuel).\nPragati – export version.\nPranash (200 km – extended)."
              },
              {
                "label": "🟡| BrahMos: supersonic cruise (2.8 Mach). Range: 290 km (pre‑MTCR), 400 km (post‑MTCR). Joint venture India‑Russia. BrahMos‑II (hypersonic – 7 Mach, 800 km, Scramjet).\nBrahMos‑NG: 50% lighter, 3m shorter, for airborne platforms."
              },
              {
                "label": "🟡| Nirbhay: Indian subsonic cruise-missile programme; exact range, configuration and service status should be treated as current-affairs-sensitive."
              },
              {
                "label": "🟡| K‑Series (SLBM): K‑15 (750 km – deployed), K‑4 (3500 km – under testing), K‑5 (5000‑6000 km – under development).\nShaurya – land version of K‑15."
              },
              {
                "label": "🟡| Akash: surface‑to‑air; Akash‑1 (30 km), Akash‑2 (40 km), Akash‑NG (80 km), Akash‑Prime (90% more accurate).\nRajendra radar – DRDO."
              },
              {
                "label": "🟡| Nag: anti‑tank; Nag (infrared), Helina (helicopter), Dhruvastra (Air Force), Namica (carrier with 12 missiles)."
              },
              {
                "label": "🟡| Pralay: tactical quasi‑ballistic (150‑500 km, 350‑700 kg payload); can change trajectory mid‑flight (defeat interceptor)."
              },
              {
                "label": "🟡| Astra: BVR air‑to‑air; Astra‑1 (110 km), Astra‑2 (160 km – under development)."
              }
            ]
          },
          {
            "label": "Air Defence System",
            "children": [
              {
                "label": "🔴| Long‑range (2500‑5000 km): BMD (Ballistic Missile Defence – PAD 80km, AAD 30km; >99% accuracy).\nIntermediate (400 km): S‑400 (Russian) – 600 km radar, 14 Mach interceptor; truck‑mounted; 20‑year service.\nShort‑range (100 km): Akash, Barak‑8 (90 km – India‑Israel), SPYDER.\nVery short (10 km): Bofors, MANPADS."
              }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Aircraft & UAVs",
        "children": [
          {
            "label": "🟡| Tejas (LCA – indigenous), Rafale (France), Sukhoi Su‑30MKI (Russia), Mirage‑2000 (France), Jaguar (UK/France)."
          },
          {
            "label": "🟠| UAVs: Nishant (140 km – surveillance), Lakshya (100 km, 500 km/h – target drone), Tapas/Rustom‑2 (25,000 ft, 24 hrs – ISR), Ghatak/Aura (stealth UCAV – under development), Nagastra (loitering munition – suicide drone, 75% indigenous)."
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Submarines & Aircraft Carriers",
        "children": [
          {
            "label": "🔴| Nuclear‑powered: INS Arihant (SSBN – K‑4/K‑15).\nDiesel‑electric: Shishumar Class (Germany), Sindhughosh Class (Russia – Kilo), Kalvari Class (France – Scorpene) – INS Kalvari, Khanderi, Karang, Vela, Vagir, Vagsheer (AIP‑enabled for extended submerged endurance)."
          },
          {
            "label": "🟡| Aircraft Carriers: INS Vikrant (2022 – indigenous), INS Vikramaditya (Russia), INS Vishal (planned – 65,000 tonnes)."
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Jet Engines & Propulsion",
        "children": [
          {
            "label": "🔴| Turbofan: air sucked by fans (e.g., Nirbhay).\nRamjet: passive air intake (e.g., Akash, BrahMos‑I).\nScramjet: supersonic combustion (e.g., BrahMos‑II, RLV).\nTRAP: Ramjet/Scramjet require initial velocity (provided by solid booster); cannot launch from stationary position."
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Defence Organisations & Programmes",
        "children": [
          {
            "label": "🟡| DRDO, HAL, BEL, OFB.\nDefence Acquisition Procedure (DAP 2020) – emphasis on indigenous procurement.\nMake in India: positive indigenisation lists; defence corridors in UP and Tamil Nadu.\niDEX (Innovations for Defence Excellence) – MSMEs & startups."
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Emerging Defence Technologies",
        "children": [
          {
            "label": "Air & Missile Technologies",
            "children": [
              {
                "label": "🟡| AMCA (Advanced Medium Combat Aircraft): India’s indigenous fifth-generation fighter aircraft programme under development."
              },
              {
                "label": "🟠| Hypersonic weapons operate above Mach 5; major technology challenges include thermal management, propulsion, guidance and materials at extreme speeds."
              },
              {
                "label": "🟠| Directed Energy Weapons (DEWs) use concentrated electromagnetic energy such as high-energy lasers or microwaves for target effects; major advantages can include speed-of-light engagement and potentially low marginal shot cost."
              },
              {
                "label": "🟠| Counter-UAS systems detect, track, identify and neutralise hostile drones using combinations of radar, electro-optical systems, RF jamming and kinetic or directed-energy means."
              }
            ]
          },
          {
            "label": "Underwater & Naval Programmes",
            "children": [
              {
                "label": "🟡| Project-75(I): Indian submarine programme for construction of six conventional diesel-electric attack submarines with air-independent propulsion capability requirements; programme status is Current Affairs-sensitive."
              },
              {
                "label": "🟡| INS Vikrant: India’s first indigenously designed and built aircraft carrier, commissioned in 2022."
              }
            ]
          }
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
              {
                "label": "🟡| Coal: thermal power (largest source in India). Types: peat, lignite, bituminous (most common), anthracite (highest quality).\nPetroleum & Natural Gas: refining, petrochemicals; Strategic Petroleum Reserves (India)."
              }
            ]
          },
          {
            "label": "Nuclear Energy (Fission Reactors)",
            "children": [
              {
                "label": "🔴| Fission: U‑235 + n → Ba + Kr + 3n + Energy.\nReactor parts: Fuel (fissile), Moderator (slows neutrons – H₂O, D₂O, Graphite), Control Rods (absorb neutrons – Cd, B), Coolant (transfers heat – H₂O, D₂O, liquid Na), Shield (radiation protection)."
              },
              {
                "label": "🔴| Fissile vs Fertile: Fissile = directly undergoes fission (U‑235, Pu‑239, U‑233).\nFertile = can be transmuted to fissile (U‑238 → Pu‑239; Th‑232 → U‑233)."
              },
              {
                "label": "🔴| India's 3‑Stage Nuclear Programme (Homi Bhabha):\nStage 1: PHWR (Pressurized Heavy Water Reactor) – U‑235 fuel, D₂O moderator; produces Pu‑239.\nStage 2: FBR (Fast Breeder Reactor) – Pu‑239 + U‑238 fuel; liquid Na coolant; produces Pu‑239 & U‑233 from Th‑232.\nStage 3: AHWR (Advanced Heavy Water Reactor) – Th‑232 + U‑233 fuel; self‑sustaining."
              },
              {
                "label": "🔴| PFBR (Prototype Fast Breeder Reactor) at Kalpakkam, TN (BHAVINI – 500 MW).\nOther reactors: PHWR (18 units), BWR (Boiling Water – Tarapur), PWR (Pressurized Water – Kudankulam, VVER‑1000 Russian tech).\nTRAP: PHWR uses D₂O (heavy water); BWR/PWR use H₂O (light water)."
              },
              {
                "label": "🟠| Thorium (Th‑232): India has 25% world's thorium reserves (Monazite sands), but only 2% uranium.\nThorium-232 is fertile, not fissile; it can breed U-233 in a reactor. Thorium cycles may offer fuel-resource and waste-management advantages but are not automatically “safe,” and weaponisation/dual-use questions require careful context.\nTRAP: avoid fixed waste-life numbers or “cannot be weaponised” absolutes."
              },
              {
                "label": "🟡| Nuclear waste management: long‑term storage (geological disposal).\nIAEA safeguards: imported uranium must be safeguarded; indigenous supply (domestic) is not."
              }
            ]
          },
          {
            "label": "Nuclear Fusion (ITER)",
            "children": [
              {
                "label": "🟠| Fusion: H‑2 + H‑3 → He‑4 + n + Energy (requires 10⁶°C plasma).\nITER (International Thermonuclear Experimental Reactor) – France; India is a participant (IPR Gandhinagar – Aditya TOKAMAK).\nIndia contributes: Cryostat, Water Cooling, In‑Wall Shielding, Cryo Distribution System."
              }
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
              {
                "label": "🟠| Photovoltaic (PV) – silicon cells convert sunlight to electricity.\nSolar thermal – concentrated solar power (CSP).\nNational Solar Mission: major policy framework for scaling solar power; historic targets have evolved with later national renewable-energy goals. Do not memorize “100 GW achieved” as a timeless status claim.\nInternational Solar Alliance (ISA) – headquartered in India; One Sun One World One Grid."
              }
            ]
          },
          {
            "label": "Wind, Biomass & Hydro",
            "children": [
              {
                "label": "🟡| Wind: onshore & offshore; India is among the world’s leading countries in installed wind capacity; exact rank changes with annual additions—treat the ranking as current-affairs data.\nBiomass: bagasse, agri‑residue; biogas (methane).\nHydropower: large dams (Tehri, Bhakra) & small/micro hydro (run‑of‑river)."
              }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Green Hydrogen",
        "children": [
          {
            "label": "🟡| Green Hydrogen: produced via electrolysis using renewable energy (H₂O → H₂ + ½ O₂).\nNational Green Hydrogen Mission: target of at least 5 MMT annual green-hydrogen production capacity by 2030, with renewable-power addition and SIGHT incentives for electrolyser manufacturing/green-hydrogen production. CA-sensitive: implementation progress changes.\nApplications: fuel cells (H₂ + O₂ → electricity + H₂O); hard‑to‑abate sectors (steel, cement, heavy transport).\nTRAP: Hydrogen is an energy carrier, NOT a primary energy source."
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Energy Storage & Critical Minerals",
        "children": [
          {
            "label": "🟡| Battery Energy Storage Systems (BESS), Pumped Hydro.\nCritical minerals: Lithium (J&K, Rajasthan), Cobalt – supply chain concentration."
          },
          {
            "label": "🟠| Small Modular Reactors (SMRs): factory‑fabricated, scalable (up to 300 MW), passive cooling; alternative to large reactors; lower capital cost."
          },
          {
            "label": "Critical Minerals & Rare Earths",
            "children": [
              {
                "label": "🔴| Rare Earth Elements (REEs) = 17 elements: 15 lanthanides plus scandium and yttrium; important in permanent magnets, electronics, batteries/energy technologies and defence applications."
              },
              {
                "label": "🔴| India identified 30 minerals as critical minerals in 2023; criticality relates to economic importance and supply risk."
              },
              {
                "label": "🔴| KABIL (Khanij Bidesh India Limited) works to explore/acquire/develop/procure strategic and critical minerals from overseas for the Indian market."
              },
              {
                "label": "🟠| India’s critical-mineral challenge links energy transition, batteries, permanent magnets, electronics, defence, recycling, substitution and concentrated global supply chains."
              },
              {
                "label": "🟡| Exact reserve figures, individual mineral project status and overseas acquisitions are Current Affairs-sensitive; do not memorise changing quantities."
              }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "MAINS: Energy Transition",
        "children": [
          {
            "label": "🟠| Challenges: intermittency of solar/wind, grid integration, energy density (storage).\nNuclear fission: waste management; fusion: theoretical clean energy (ITER)."
          },
          {
            "label": "Carbon Capture, Storage & Removal",
            "children": [
              {
                "label": "🟠| CCUS: capture CO₂ from industrial/energy sources, transport it and store or use it; relevant for hard-to-abate sectors but involves energy, cost, leakage and permanence concerns."
              },
              {
                "label": "🟡| Nature-based carbon removal and engineered removal (e.g., direct air capture) are distinct from simply reducing new emissions."
              }
            ]
          }
        ]
      },
      {
        "label": "Electric Vehicles, Batteries & Storage",
        "children": [
          {
            "label": "🔴| EV powertrain: battery → inverter/controller → electric motor; regenerative braking converts part of kinetic energy back to electrical energy."
          },
          {
            "label": "🟠| Lithium-ion batteries: cathode/anode/electrolyte architecture; major concerns include thermal runaway, recycling, mineral supply chains and charging infrastructure."
          },
          {
            "label": "🟡| Sodium-ion, solid-state and flow batteries are emerging alternatives; compare them by energy density, cost, safety, cycle life and resource availability."
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Nuclear Policy, Safeguards & Liability",
        "children": [
          {
            "label": "Indian Framework",
            "children": [
              {
                "label": "🟠| Civil Liability for Nuclear Damage Act, 2010: provides the legal framework for civil liability/compensation for nuclear damage and contains a statutory right of recourse under specified conditions; important for Mains."
              },
              {
                "label": "🔴| IAEA safeguards: verification measures used to ensure nuclear material/facilities placed under safeguards are not diverted from peaceful uses; India has a separation plan and India-specific safeguards arrangements."
              },
              {
                "label": "🟠| Nuclear Suppliers Group (NSG): export-control grouping for nuclear-related materials/technology; India is not a member but seeks membership and a role in global non-proliferation governance."
              },
              {
                "label": "🟡| Kudankulam and other nuclear power projects should be studied for reactor technology and current project status rather than memorising changing construction/commissioning timelines."
              }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Nuclear Fusion: India’s Tokamak Programme",
        "children": [
          {
            "label": "Indian Fusion Facilities",
            "children": [
              {
                "label": "🔴| Institute for Plasma Research (IPR) is India’s major plasma/fusion R&D institution and participates in international fusion programmes including ITER."
              },
              {
                "label": "🔴| SST-1 = Steady State Superconducting Tokamak, an indigenous experimental tokamak at IPR."
              },
              {
                "label": "🟠| ADITYA-U = upgraded tokamak used for plasma/fusion research at IPR; study its role rather than memorising experimental pulse figures."
              },
              {
                "label": "🟠| SST-Bharat is an indigenous steady-state tokamak being designed as part of the longer-term Indian fusion roadmap, building on SST-1/ADITYA-U and ITER experience."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "VIII",
    "p": "pm",
    "label": "Health, Biotechnology & Nanomedicine",
    "children": [
      {
        "p": "pm2",
        "label": "Medical Technologies",
        "children": [
          {
            "label": "Imaging & Diagnostics",
            "children": [
              {
                "label": "🟡| X‑ray (bone), CT (3D X‑ray), MRI (magnetic resonance – no radiation), Ultrasound (sonography).\nPET scan (metabolic activity).\nRT‑PCR (COVID), Rapid Antigen Test, CRISPR diagnostics."
              }
            ]
          },
          {
            "label": "Therapeutic Advances",
            "children": [
              {
                "label": "🔴| Gene therapy: somatic (adult, treatment limited to patient) vs germline (reproductive cells – banned).\nKnock‑down (silencing RNA) vs Knock‑out (removing gene)."
              },
              {
                "label": "🔴| CRISPR Cas‑9: guide RNA + Cas9 enzyme (molecular scissors). Cuts target gene at specific sequence; allows gene editing. Derived from bacterial immune system."
              },
              {
                "label": "🔴| CAR‑T Cell Therapy: T‑cells harvested, genetically modified (CRISPR) to produce Chimeric Antigen Receptor (CAR) – targets cancer cells.\nNexCAR‑19 – India's first indigenous CAR‑T therapy (ImmunoAct + IIT Bombay + Tata Memorial).\nTRAP: CAR‑T is cell‑based gene therapy; expensive due to custom manufacturing."
              },
              {
                "label": "🟡| RNAi (RNA interference): gene silencing therapy (treats viral infections, cancer).\nAntisense technology: old, less accurate."
              },
              {
                "label": "🟡| 3D bioprinting (tissues/organs), Telemedicine, AI in diagnosis, Robotic surgery (Da Vinci, MANTRA 3)."
              }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Stem Cells & Cloning",
        "children": [
          {
            "label": "Stem Cells",
            "children": [
              {
                "label": "🔴| Totipotent (early embryo – banned), Pluripotent (later embryo – research, cord blood – cryopreservation).\nMultipotent/Oligopotent/Unipotent (adult – limited).\nInduced Pluripotent Stem Cells (iPSCs) – Yamanaka (Nobel 2012)."
              },
              {
                "label": "🟠| Stem cell banking: Private (100% ownership), Public (donated), Community (hybrid).\nRegulation: ICMR + DBT guidelines; Institutional Committee for Stem Cell Research (IC‑SCR); National Apex Committee for Stem Cell Research and Therapy (NAC‑SCRT)."
              }
            ]
          },
          {
            "label": "Cloning",
            "children": [
              {
                "label": "🔴| Reproductive cloning (SCNT – Dolly the sheep, 1996).\nSCNT: somatic nucleus + enucleated egg → reconstructed embryo → surrogate.\nIndia: NDRI Karnal – Garima (buffalo, 2009), Noorie (pashmina goat, 2012), Dipasha (wild buffalo, 2014), Swaroopa (buffalo, 2015), Ganga (Gir cow, 2023).\nPurpose: increase milk production, preserve endangered species, produce commercially valuable products (pashmina)."
              }
            ]
          },
          {
            "label": "Surrogacy",
            "children": [
              {
                "label": "🔴| Gestational surrogacy: embryo via IVF (no genetic relation to surrogate).\nSurrogacy Regulation Act (2021): commercial surrogacy banned; only altruistic surrogacy allowed (close relatives, no financial transaction).\nEligibility: surrogate (25‑35, married, mother of one), couple (Indian, married 5+ years, 26‑55 male, 23‑50 female).\nSingle males, live‑in couples, LGBTQ+, foreigners not allowed.\nPenalty: 10 years imprisonment + ₹10 lakh fine."
              }
            ]
          },
          {
            "label": "Three Parent Baby (Mitochondrial Replacement Therapy)",
            "children": [
              {
                "label": "🔴| Mitochondrial DNA (37 genes) – maternal inheritance only.\nMitochondrial defects cause Leigh syndrome, CHARGE syndrome.\nMitochondrial replacement therapy (MRT): nuclear genetic material from intended mother is transferred to an enucleated donor oocyte carrying healthy mitochondria, then fertilised; it is used to prevent transmission of pathogenic mitochondrial DNA variants.\nMethods: Spindle Transfer (before fertilisation – popular), Pro‑Nuclear Transfer (after – low success).\n2016: world's first 3‑parent baby born in Mexico.\nUK first to legalise (2015).\nTRAP: India does not currently have an established clinical legal framework permitting routine mitochondrial replacement therapy; treat this as policy/current-law material and verify before the exam."
              }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Genomics & Policy",
        "children": [
          {
            "label": "Genome Projects",
            "children": [
              {
                "label": "🟠| Human Genome Project (HGP, 1990‑2003): mapped human genome; applications: gene therapy, personalised medicine, risk assessment.\nIssues: discrimination (insurance/employment), privacy, ethical concerns.\nHGP‑Write (2016‑2026): synthetic human genome.\nEarth BioGenome Project (2018‑2028): 1.5 million eukaryotic genomes."
              },
              {
                "label": "🟠| Genome India Project (2020): mapping 10,000 Indian genomes; data released Jan 2025 (Indian Biological Data Centre, Faridabad).\nINSACOG (Indian SARS‑CoV‑2 Genomics Consortium) – genome surveillance for COVID variants (55 labs)."
              }
            ]
          },
          {
            "label": "Biotech Regulation & Policy",
            "children": [
              {
                "label": "🟠| GEAC (Genetic Engineering Appraisal Committee) – under MoEFCC; approves GM crop field trials.\nBioE3 Policy (2024): Biotechnology for Economy, Environment, Employment – high‑performance biomanufacturing, circular bioeconomy, Bio‑AI Hubs.\nNational Action Plan on AMR (NAP‑AMR 2.0).\nOne Health – human‑animal‑environment health interface."
              }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Public Health Challenges",
        "children": [
          {
            "label": "🟠| Antimicrobial Resistance (AMR) – 'Silent Pandemic'.\nNational Sickle Cell Anaemia Elimination Mission (target 2047)."
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Monoclonal Antibodies, Biosimilars & Immunotherapy",
        "children": [
          {
            "label": "Biologics",
            "children": [
              {
                "label": "🔴| Monoclonal antibodies (mAbs): laboratory-produced antibodies designed to bind a specific antigen/target; used in cancer, autoimmune diseases and selected infections."
              },
              {
                "label": "🔴| Biosimilars: biological products highly similar to an approved reference biologic with no clinically meaningful differences in safety, purity and potency within the approved indication framework."
              },
              {
                "label": "🟠| CAR-T therapy modifies a patient’s T cells to express chimeric antigen receptors that recognise target cells; it is a form of cellular immunotherapy."
              }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Biotechnology Regulation & Biosafety",
        "children": [
          {
            "label": "International and Indian Frameworks",
            "children": [
              {
                "label": "🔴| Cartagena Protocol on Biosafety: international protocol under the Convention on Biological Diversity dealing with safe transfer, handling and use of living modified organisms."
              },
              {
                "label": "🔴| Nagoya Protocol: access to genetic resources and fair/equitable benefit sharing arising from their utilisation."
              },
              {
                "label": "🔴| GEAC: Indian regulatory body under MoEFCC associated with environmental release/field-trial decisions for genetically engineered organisms and crops as per applicable rules."
              },
              {
                "label": "🔴| Gene editing is not automatically equivalent to transgenic GMO production; regulatory treatment can differ depending on the technique and whether foreign genetic material is introduced."
              },
              {
                "label": "🟠| Site-directed nuclease (SDN) gene-editing approaches can create targeted changes such as small deletions or substitutions; regulatory classification depends on the product and applicable Indian guidelines."
              }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Public Health Surveillance, Immunisation & One Health",
        "children": [
          {
            "label": "Indian Programmes",
            "children": [
              {
                "label": "🔴| Integrated Disease Surveillance Programme (IDSP): surveillance and early warning for communicable disease outbreaks through an integrated reporting system."
              },
              {
                "label": "🔴| Universal Immunisation Programme (UIP): major national immunisation programme providing vaccines against priority vaccine-preventable diseases."
              },
              {
                "label": "🔴| Mission Indradhanush: intensified immunisation drive aimed at increasing full immunisation coverage among children and pregnant women in underserved areas."
              },
              {
                "label": "🟠| One Health: integrated approach recognising links among human, animal and environmental health; important for zoonoses, antimicrobial resistance and emerging infections."
              },
              {
                "label": "🟠| Antimicrobial resistance (AMR): microbes evolve resistance to antimicrobial medicines; major drivers include misuse/overuse in humans and animals and environmental spread."
              }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Digital Health Infrastructure",
        "children": [
          {
            "label": "ABDM & Telemedicine",
            "children": [
              {
                "label": "🔴| Ayushman Bharat Digital Mission (ABDM): aims to build an interoperable national digital health ecosystem; National Health Authority is the implementing agency."
              },
              {
                "label": "🔴| ABHA: Ayushman Bharat Health Account identifier used to link and access digital health records/services within the ABDM ecosystem."
              },
              {
                "label": "🟠| Health Facility Registry (HFR) and Healthcare Professionals Registry (HPR) are core ABDM registries for verified health facilities and professionals."
              },
              {
                "label": "🟠| Unified Health Interface (UHI): open-network approach intended to enable interoperable digital health service delivery."
              },
              {
                "label": "🟠| e-Sanjeevani: Government telemedicine platform enabling remote doctor consultations, including hub-and-spoke models."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "IX",
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
              {
                "label": "🟡| CPU (ALU, Control Unit), RAM (volatile), ROM (non‑volatile – BIOS), Storage (HDD, SSD).\nOS: Windows, Linux, Android.\nApplication vs system software; open source vs proprietary."
              },
              {
                "label": "🟡| Supercomputers: FLOPS (Floating Point Operations Per Second).\n1 TeraFLOPS = 10¹², 1 PetaFLOPS = 10¹⁵, 1 ExaFLOPS = 10¹⁸.\nIndia: PARAM series (C‑DAC); Pratyush & Mihir (weather – IITM, NCMRWF).\nTop 500 (Nov 2024): USA (El Capitan – 17 EFLOPS), China; India has 6 systems (AIRAWAT – 8.5 PFLOPS, rank 136).\nNational Supercomputing Mission (NSM, 2015): 73 indigenous supercomputers; C‑DAC + IISc; Atos (France) technical support; PARAM Rudra recently inaugurated."
              }
            ]
          },
          {
            "label": "Networking & Internet",
            "children": [
              {
                "label": "🟡| IP address (IPv4 vs IPv6), DNS, URL, HTTP/HTTPS (SSL/TLS).\nCloud computing: SaaS, PaaS, IaaS; Edge computing.\nIoT (Internet of Things) – smart devices, sensors.\nDeep web vs Dark web (Tor – anonymity)."
              }
            ]
          },
          {
            "label": "Artificial Intelligence & Emerging Tech",
            "children": [
              {
                "label": "🟠| AI/ML: supervised, unsupervised, reinforcement learning; deep learning, neural networks, NLP (ChatGPT).\nGenerative AI (LLMs) vs Discriminative AI.\nDeepfakes: risks to electoral integrity, privacy; countermeasures: digital watermarking, algorithmic detection."
              },
              {
                "label": "🔴| IndiaAI Mission (2024): ₹10,372 crore; 10,000+ GPUs; indigenous Large Multimodal Models (LMMs); IndiaAI Datasets Platform."
              },
              {
                "label": "🟠| AI Applications: Healthcare (diagnosis), Education (personalised learning – IIT Kharagpur + AWS), Judiciary (SUPACE, SUVA), Cybersecurity, Manufacturing, Agriculture (See & Spray – Blue River Technology)."
              },
              {
                "label": "🟠| AI Issues: Algorithmic bias, black box problem, job displacement, ethical concerns, security risks.\nNITI Aayog: 'Responsible AI for All' – balancing innovation with safety, inclusivity, privacy.\nV. Kamakoti Committee (2021): National AI Mission (NAIM) recommended; RAISE 2020 summit; FutureSkills Prime (MeitY + NASSCOM)."
              },
              {
                "label": "🟠| Blockchain: distributed ledger, immutable, consensus mechanisms (PoW, PoS). Applications: cryptocurrency, supply chain, land records."
              },
              {
                "label": "🟡| Quantum Computing: qubits (superposition + entanglement).\nQuantum vs Digital: digital = bits (0/1); quantum = qubits (0, 1, or both).\nNational Quantum Mission (approved 2023; eight-year mission): four Thematic Hubs—Quantum Computing, Quantum Communication, Quantum Sensing & Metrology, Quantum Materials & Devices.\nCore applications: quantum computing, QKD/secure communication, precision sensing and quantum materials; exact technical targets are project-dependent and should be treated as CA-sensitive.\nApplications: Quantum Key Distribution (QKD – unhackable communication)."
              },
              {
                "label": "AI Governance & Data",
                "children": [
                  {
                    "label": "🟠| AI risks: bias, hallucination, opacity, privacy, cyber misuse, labour displacement, deepfakes and concentration of compute/data."
                  },
                  {
                    "label": "🟠| AI governance should balance innovation with safety, transparency, accountability, privacy, human oversight and inclusion."
                  },
                  {
                    "label": "🟡| AI policy names, model counts, GPU numbers and mission targets are current-affairs-sensitive; verify the latest official figures before Prelims."
                  }
                ]
              }
            ]
          },
          {
            "label": "Data Privacy & Cyber Security",
            "children": [
              {
                "label": "🟡| DPDP Act, 2023: regulates processing of digital personal data; key concepts include Data Principal, Data Fiduciary and consent/legitimate-use grounds, with institutional oversight under the Act.\nCA-sensitive: DPDP Rules 2025 were notified in November 2025 and the Act entered operationalisation through the notified framework; verify the latest enforcement timeline before the exam. CII/NCIIPC is a related but separate cybersecurity framework under the IT Act."
              },
              {
                "label": "🟡| Cyber threats: Malware, phishing, DDoS.\nCERT‑In, National Cyber Security Policy."
              }
            ]
          },
          {
            "label": "Semiconductors & Digital Infrastructure",
            "children": [
              {
                "label": "🔴| Semiconductor basics: silicon, doping, p-n junctions, diodes, transistors and integrated circuits form the foundation of modern electronics."
              },
              {
                "label": "🟠| Semiconductor fabrication involves wafer preparation, lithography, deposition, etching, doping, packaging and testing."
              },
              {
                "label": "🟡| India’s semiconductor ecosystem: fabs, display fabrication, compound semiconductors, packaging/ATMP and design ecosystems are policy/current-affairs-sensitive."
              }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Communication Technology",
        "children": [
          {
            "label": "Wireless & Mobile Generations",
            "children": [
              {
                "label": "🟡| 1G (1981): analog, voice only, poor security.\n2G (1992): digital (GSM/CDMA), SMS, 96‑384 kbps. 2.5G (GPRS – 114 kbps), 2.75G (EDGE – 384 kbps).\n3G (2000s): HSPA, mobile broadband, 2‑3 Mbps.\n4G (2010): LTE, 100 Mbps, video calls.\n5G (present): 1‑20 Gbps, 1 ms latency, 100x bandwidth, 1000x connectivity, 90% lower energy; low‑band (200‑500 Mbps), mid‑band (4 Gbps), high‑band (20 Gbps).\nApplications: Extended Reality (VR/AR/MR), IoT, World Wide Wireless Web (WWWWW)."
              },
              {
                "label": "🟡| 6G (by 2030): Terahertz frequencies, AI integration, Massive MIMO, Network Slicing, URLLC (ultra‑reliable low‑latency), Intelligent Reflecting Surfaces.\nIndia: 125+ patents; India‑US pact on 6G (G20 2023).\nBharat 6G Vision: Technology Innovation Group on 6G; 2 phases (2023‑25 exploratory, 2025‑30 commercialisation)."
              },
              {
                "label": "🔴| Other: Bluetooth (PAN), Wi‑Fi (IEEE 802.11), NFC (contactless – 10 cm, no battery).\nLi‑Fi: Visible Light Communication (Harald Haas) – 100x faster than Wi‑Fi, secure, energy efficient.\nWhite‑Fi: Microsoft – uses TV white space (450‑580 MHz) for rural broadband."
              }
            ]
          },
          {
            "label": "Satellite Internet",
            "children": [
              {
                "label": "🟡| LEO (low latency, many satellites – Starlink ~10,000, OneWeb 650) vs GSO (V‑SAT, fewer satellites, higher latency).\nIndia: Hughes Communications (ISRO‑powered – GSO), Reliance Jio + SES, Tata + Telesat.\nStarlink – SpaceX; OneWeb – UK + Bharti Global (launched by LVM3)."
              }
            ]
          },
          {
            "label": "Web Evolution",
            "children": [
              {
                "label": "🟠| Web 1.0 (1989‑1993): Static, read‑only.\nWeb 2.0 (1990‑2004): Read‑Write, interactive, social media, e‑commerce; challenges: digital divide, misinformation, big tech monopoly, privacy.\nWeb 3.0 (2014‑): Blockchain‑based, decentralised, user data ownership (Gavin Wood coined).\nWeb 4.0: Mobile Web, self‑learning (AI/ML).\nWeb 5.0: Convergent (Web 2.0 interactivity + Web 3.0 decentralisation) – user data ownership."
              }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Semiconductor Mission & Fab Ecosystem",
        "children": [
          {
            "label": "India Semiconductor Mission",
            "children": [
              {
                "label": "🔴| India Semiconductor Mission (ISM): nodal implementation agency for India’s semiconductor and display ecosystem schemes, including fabs, display fabs, compound semiconductors, silicon photonics/MEMS, ATMP/OSAT and design support."
              },
              {
                "label": "🔴| ATMP = Assembly, Testing, Marking and Packaging; OSAT = Outsourced Semiconductor Assembly and Test."
              },
              {
                "label": "🔴| Semiconductor fab = fabrication/manufacturing of chips on wafers; ATMP/OSAT are later-stage assembly, testing and packaging activities."
              },
              {
                "label": "🟠| Design Linked Incentive (DLI) supports semiconductor design infrastructure and development of ICs, chipsets, SoCs and related IP/designs."
              },
              {
                "label": "🟡| Semiconductor project approvals and facility status are Current Affairs-sensitive; memorise the ecosystem and role of institutions rather than rapidly changing project numbers."
              }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Digital Technologies & Industry 4.0",
        "children": [
          {
            "label": "Emerging Concepts",
            "children": [
              {
                "label": "🔴| Digital Twin: dynamic digital representation of a physical object/system/process linked to real-world data for monitoring, simulation and optimisation."
              },
              {
                "label": "🟠| Metaverse: persistent or shared digital environments combining technologies such as VR/AR, spatial computing, avatars and digital assets; concept remains evolving rather than one fixed platform."
              },
              {
                "label": "🟠| Industry 4.0: integration of cyber-physical systems, IoT, automation, AI, cloud/edge computing and data analytics into manufacturing."
              },
              {
                "label": "🔴| Digital Public Infrastructure (DPI): interoperable digital rails that enable large-scale public/private services; examples include Aadhaar, UPI and ONDC."
              }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Cybersecurity, Cyber Warfare & Digital Sovereignty",
        "children": [
          {
            "label": "Core Institutions & Programmes",
            "children": [
              {
                "label": "🔴| CERT-In = Indian Computer Emergency Response Team; national agency responsible for coordinating response to computer-security incidents and issuing cyber-security advisories/directions."
              },
              {
                "label": "🔴| NCIIPC = National Critical Information Infrastructure Protection Centre; designated organisation for protection of critical information infrastructure."
              },
              {
                "label": "🟠| Cyber Swachhta Kendra supports botnet/malware analysis and cleaning/remediation for users and organisations."
              },
              {
                "label": "🟠| Cyber Surakshit Bharat is a capacity-building and awareness initiative aimed at strengthening cybersecurity practices in government organisations."
              },
              {
                "label": "🟡| National Cyber Security Strategy has been discussed as a comprehensive strategic framework; do not treat a proposed/strategic framework as equivalent to a notified law or a functional regulator."
              }
            ]
          },
          {
            "label": "Mains Framework",
            "children": [
              {
                "label": "🟠| Cyber warfare can target confidentiality, integrity and availability; major challenges include critical-infrastructure attacks, ransomware, espionage, attribution, supply-chain vulnerabilities, AI-enabled threats and cross-border jurisdiction."
              },
              {
                "label": "🟠| Mains linkage: cybersecurity + data protection + critical infrastructure + digital sovereignty + international cooperation + indigenous capability."
              }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "AI Governance: International Initiatives",
        "children": [
          {
            "label": "International Frameworks",
            "children": [
              {
                "label": "🟠| Global Partnership on Artificial Intelligence (GPAI): international multi-stakeholder initiative promoting responsible, human-centric and trustworthy AI; India was a founding member. Use as a Mains governance association, not a heavy memorisation item."
              },
              {
                "label": "🟠| OECD AI Principles emphasise trustworthy/robust AI, human rights, transparency, accountability and inclusive growth."
              },
              {
                "label": "🟠| UNESCO Recommendation on the Ethics of Artificial Intelligence provides a global ethical framework centred on human rights, fairness, transparency, accountability and societal/environmental impact."
              },
              {
                "label": "🟠| Mains linkage: AI governance + innovation + jobs/skills + bias/discrimination + privacy + safety + compute/data concentration + international standard-setting."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "X",
    "p": "pm",
    "label": "Science Policy, IPR & R&D Ecosystem",
    "children": [
      {
        "p": "pm2",
        "label": "Intellectual Property Rights (IPR)",
        "children": [
          {
            "label": "Patents Act, 1970 & TRIPS",
            "children": [
              {
                "label": "🔴| Section 3(d): prevents 'evergreening' of patents (landmark Novartis case).\nCompulsory Licensing (Section 84): allows generic production during national health emergency without consent.\nTRIPS agreement (WTO) – India complies; flexibilities allow compulsory licensing."
              }
            ]
          },
          {
            "label": "Geographical Indications (GI)",
            "children": [
              {
                "label": "🟡| Protects traditional knowledge and region‑specific goods (Darjeeling Tea, Basmati, Kancheepuram Silk).\nPrevents biopiracy."
              }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Research & Development",
        "children": [
          {
            "label": "Anusandhan National Research Foundation (ANRF) Act, 2023",
            "children": [
              {
                "label": "🟡| ANRF Act 2023 establishes ANRF as an apex research-funding/coordination institution; it builds links among academia, industry and government and supports frontier and national-priority research.\nCA-sensitive: schemes/funding structures evolve; verify the latest ANRF programmes.\nMAHA (Mission for Advancement in High‑impact Areas) launched under ANRF – EV tech, MedTech, AI."
              }
            ]
          },
          {
            "label": "Other Key Programmes",
            "children": [
              {
                "label": "🟡| NM‑ICPS (National Mission on Interdisciplinary Cyber‑Physical Systems): Technology Innovation Hubs (TIHs) in AI, IoT, robotics.\nAtal Innovation Mission (AIM): Atal Tinkering Labs, Incubation Centres – promoting innovation culture."
              }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Indian Scientists & Landmark Discoveries",
        "children": [
          {
            "label": "Scientist → Contribution",
            "children": [
              {
                "label": "🔴| C.V. Raman → Raman Effect; Nobel Prize in Physics (1930)."
              },
              {
                "label": "🔴| S. Chandrasekhar → Chandrasekhar limit; Nobel Prize in Physics (1983)."
              },
              {
                "label": "🔴| S.N. Bose → Bose–Einstein statistics; boson terminology derives from his name."
              },
              {
                "label": "🔴| Meghnad Saha → Saha ionisation equation, important in stellar astrophysics and spectroscopy."
              },
              {
                "label": "🔴| Jagadish Chandra Bose → pioneering work on radio/microwave science and plant physiology/response; avoid simplistic claims of being the sole “inventor” of radio."
              },
              {
                "label": "🟠| Homi J. Bhabha → foundational role in India’s nuclear science and institution-building; associated with TIFR and the three-stage nuclear programme vision."
              }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Indian S&T Institutions & Laboratory Mapping",
        "children": [
          {
            "label": "Institution → Role",
            "children": [
              {
                "label": "🔴| CSIR → Council of Scientific & Industrial Research; national network of multidisciplinary R&D laboratories."
              },
              {
                "label": "🔴| NPL → National Physical Laboratory; standards/metrology and physical measurements."
              },
              {
                "label": "🔴| CDRI → Central Drug Research Institute; drug discovery and biomedical research."
              },
              {
                "label": "🔴| IICT → Indian Institute of Chemical Technology; chemical technology and related research."
              },
              {
                "label": "🔴| NCL → National Chemical Laboratory; chemistry/chemical science and technology research."
              },
              {
                "label": "🔴| CCMB → Centre for Cellular and Molecular Biology; molecular/cellular biology and genomics research."
              },
              {
                "label": "🔴| CFTRI → Central Food Technological Research Institute; food science, processing and nutrition technology."
              },
              {
                "label": "🔴| DBT → Department of Biotechnology; policy/funding and promotion of biotechnology research and applications."
              },
              {
                "label": "🔴| DST → Department of Science & Technology; national S&T policy, research support and science ecosystem programmes."
              },
              {
                "label": "🔴| ICMR → Indian Council of Medical Research; apex body for biomedical research in India."
              }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Neutrino Science & Big Science Collaborations",
        "children": [
          {
            "label": "India-Based Neutrino Observatory (INO)",
            "children": [
              {
                "label": "🟡| India-based Neutrino Observatory (INO): proposed underground neutrino research facility in the Theni/Bodi West Hills area of Tamil Nadu; ICAL is designed to study atmospheric neutrinos. Project/status details are current-affairs-sensitive."
              },
              {
                "label": "🔴| Underground location reduces cosmic-ray background; surrounding rock provides natural shielding, improving detection of rare neutrino interactions."
              },
              {
                "label": "🟠| Neutrinos are electrically neutral, weakly interacting particles; their weak interaction and oscillation properties make low-background, large detectors important."
              }
            ]
          },
          {
            "label": "International Mega-Science Projects",
            "children": [
              {
                "label": "🔴| CERN/LHC: India participates in international high-energy physics research; core association = particle physics and the Large Hadron Collider."
              },
              {
                "label": "🔴| Thirty Metre Telescope (TMT): international optical/infrared astronomy project with Indian scientific/institutional participation."
              },
              {
                "label": "🔴| Square Kilometre Array (SKA): major international radio-astronomy facility; India participates through scientific and technology collaborations."
              },
              {
                "label": "🟠| India’s mega-science participation demonstrates scientific diplomacy, shared research infrastructure, advanced instrumentation and human-capacity building."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "XI",
    "p": "pm",
    "label": "Ocean Science, Deep Ocean Mission & Polar Research",
    "children": [
      {
        "p": "pm2",
        "label": "Deep Ocean Mission & Samudrayaan",
        "children": [
          {
            "label": "Mission Core",
            "children": [
              {
                "label": "🔴| Deep Ocean Mission (DOM): mission-mode programme of the Ministry of Earth Sciences supporting India’s Blue Economy and deep-ocean technology capabilities."
              },
              {
                "label": "🟡| Samudrayaan: project under Deep Ocean Mission for human exploration of the deep ocean using the MATSYA-6000 manned submersible."
              },
              {
                "label": "🟡| MATSYA-6000: Indian human-occupied deep-sea submersible designed for about 6000 m depth and up to three aquanauts."
              },
              {
                "label": "🔴| Polymetallic nodules contain multiple metals/minerals of economic interest and are a focus of deep-sea mineral exploration in the Central Indian Ocean Basin."
              }
            ]
          },
          {
            "label": "Major Components & Blue Economy",
            "children": [
              {
                "label": "🟠| Deep Ocean Mission components include deep-sea mining/human submersible technology, ocean climate advisory services, deep-sea biodiversity, deep-ocean survey/exploration, ocean energy/freshwater, and an advanced marine station for ocean biology."
              },
              {
                "label": "🟠| Ocean Thermal Energy Conversion (OTEC) uses the temperature difference between warm surface water and cold deep water to produce energy; the same process can support desalination."
              },
              {
                "label": "🟡| Commercial deep-sea mining remains subject to technological, environmental and international-regulatory considerations, including the International Seabed Authority framework."
              }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Indian Polar Research",
        "children": [
          {
            "label": "Stations & Institutions",
            "children": [
              {
                "label": "🔴| NCPOR: National Centre for Polar and Ocean Research under the Ministry of Earth Sciences; nodal institution for India’s polar and Southern Ocean research."
              },
              {
                "label": "🔴| Maitri: Indian research station in Antarctica at Schirmacher Oasis."
              },
              {
                "label": "🔴| Bharati: Indian year-round research station in Antarctica, commissioned in 2012 near Larsemann Hills region."
              },
              {
                "label": "🔴| Himadri: India’s first Arctic research station at Ny-Ålesund, Svalbard, Norway."
              },
              {
                "label": "🟠| Indian polar research supports studies of cryosphere, climate change, atmospheric/ocean processes and links between polar change and Indian monsoon/climate."
              }
            ]
          },
          {
            "label": "Policy / Governance",
            "children": [
              {
                "label": "🟡| India is a consultative party to the Antarctic Treaty System and an observer in the Arctic Council; polar governance is distinct from ownership of territory or resources."
              },
              {
                "label": "🟡| Treat “National Polar Science Programme” as a research/policy framework context; do not describe it as a standalone law unless the question specifically establishes a statutory instrument."
              }
            ]
          }
        ]
      }
    ]
  }
] satisfies RawSubjectNode[];