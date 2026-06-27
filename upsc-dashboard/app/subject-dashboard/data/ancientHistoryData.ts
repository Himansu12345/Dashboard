import type { RawSubjectNode } from "../types";

export const RAW_D = [
  {
    "id": "I",
    "p": "pm",
    "label": "Pre-Historic India & Indus Valley Civilization",
    "children": [
      {
        "p": "pm2",
        "label": "Stone Age & Chalcolithic (Specifics)",
        "children": [
          {
            "label": "Paleolithic (Old Stone Age) – 2.5 mya to 10,000 BC",
            "children": [
              { "label": "Lower Paleolithic: Hand axes, cleavers, choppers (Biface tools).\nSites: Bori (Maharashtra) – earliest in India; Belan Valley (UP); Didwana (Rajasthan); Attirampakkam (TN)." },
              { "label": "Middle Paleolithic: Flake tools, scrapers, points.\nSites: Nevasa (Maharashtra), Bhimbetka (MP), Hunasagi (Karnataka)." },
              { "label": "Upper Paleolithic: Blades, burins, bone tools.\nEvidence of fire and group hunting.\nBhimbetka cave paintings (green/dark red) belong to this phase." },
              { "label": "TRAP: Bhimbetka has paintings from all phases, but the earliest are Upper Paleolithic." },
              { "label": "MAINS: Paleolithic sites show adaptation to diverse environments and early cognitive development." }
            ]
          },
          {
            "label": "Mesolithic (Middle Stone Age) – 10,000 to 4,000 BC",
            "children": [
              { "label": "Tools: Microliths (tiny stone tools hafted on bone/wood) – geometric and non-geometric shapes." },
              { "label": "Beginning of domestication of animals.\nBagor (Rajasthan) & Adamgarh (MP) – earliest evidence of animal husbandry (sheep, goat)." },
              { "label": "Bhimbetka & other rock shelters show paintings of hunting, dancing, and gathering." },
              { "label": "TRAP: Chopani Mando (Belan Valley, UP) provides earliest evidence of pottery in the world (Mesolithic pottery)." },
              { "label": "Mesolithic burials suggest belief in life after death (e.g., grave goods)." },
              { "label": "Mahadaha & Sarai Nahar Rai (UP): Skeletons with evidence of surgery and burial practices." },
              { "label": "Damdama (UP): Numerous microliths and faunal remains." }
            ]
          },
          {
            "label": "Neolithic (New Stone Age) – 7,000 to 1,000 BC (Regional)",
            "children": [
              { "label": "Tools: Polished stone tools, axes, sickles.\nCeramic pottery (wheel-made).\nGround and polished axes." },
              { "label": "Agriculture & settled life: cultivated wheat, barley, rice, millets.\nDomesticated cattle, sheep, goat." },
              { "label": "Mehrgarh (Balochistan, Pakistan): Earliest Neolithic site (7000 BC).\nEarliest evidence of wheat, barley, cotton, and dentistry." },
              { "label": "Burzahom (Kashmir): Pit dwellings, dogs buried with masters, polished tools of bone." },
              { "label": "Gufkral (Kashmir): Evidence of pit-dwellings and domesticated animals." },
              { "label": "Koldihwa (Belan Valley, UP): Earliest evidence of rice cultivation in the world (c.\n6,500 BC)." },
              { "label": "Chirand (Bihar): bone tools, terracotta figurines." },
              { "label": "Hallur (Karnataka): Neolithic ash-mound site.\nPiklihal & Tekkalkota (Karnataka) – important Neolithic settlements." },
              { "label": "Uttar Pradesh sites: Jhusi, Koldihwa, Lahuradewa (rice)." },
              { "label": "MAINS: Neolithic revolution marks a fundamental change in human social and economic organization." }
            ]
          },
          {
            "label": "Chalcolithic (Copper-Stone Age) – 2,500 to 700 BC (Regional)",
            "children": [
              { "label": "Tools: Copper + stone; limited use of bronze.\nPainted pottery (black on red)." },
              { "label": "Ahar-Banas culture (Rajasthan): Extensive copper working.\nAhar, Gilund, Balathal – significant sites." },
              { "label": "Kayatha (MP): Earliest Chalcolithic site in central India." },
              { "label": "Malwa culture (MP): Typical black on red pottery with geometric patterns; Navdatoli, Eran, Nagda." },
              { "label": "Jorwe culture (Maharashtra): Daimabad (largest Chalcolithic site, bronze rhino, elephant, etc.), Inamgaon (child burial with ritual)." },
              { "label": "TRAP: Chalcolithic people did NOT know writing, did not use burnt bricks extensively, and iron was unknown." },
              { "label": "They buried their dead in urns and buried goods, showing belief in afterlife." },
              { "label": "TRAP: Chalcolithic cultures were contemporary with the Harappan civilization." },
              { "label": "MAINS: Chalcolithic cultures represent the first urbanisation in western India and gave rise to the later Iron Age cultures." }
            ]
          }
        ]
      },
      {
        "p": "pm3",
        "label": "Indus Valley Civilization (Mature Harappan) – C.2600–1900 BC",
        "children": [
          {
            "label": "Urban Planning & Society",
            "children": [
              { "label": "Cities built on grid pattern.\nBurnt bricks in standard ratio (4:2:1).\nEnglish bond masonry." },
              { "label": "Advanced drainage system: covered drains, manholes, bathrooms." },
              { "label": "Citadel (west) and Lower Town (east) distinction.\nException: Dholavira (3 parts), Chanhudaro (no citadel)." },
              { "label": "Society: cotton clothes, ornaments of gold, silver, copper, shells, faience.\nWomen wore bangles, necklaces, nose studs." },
              { "label": "Toys: terracotta carts, whistles, birds, monkeys, dice." },
              { "label": "TRAP: No temples, no palaces, no swords, no heavy weapons – suggests peaceful society." },
              { "label": "MAINS: Town planning reflects advanced municipal governance and concern for public health; absence of royal iconography hints at a possible oligarchy or priestly rule." }
            ]
          },
          {
            "label": "Economy & Trade",
            "children": [
              { "label": "Agriculture: wheat, barley, peas, sesame, mustard.\nFirst to grow cotton (Sindon).\nPloughed fields at Kalibangan (pre-Harappan)." },
              { "label": "Metals: Copper, bronze, silver, gold.\nTRAP: Iron was absolutely unknown." },
              { "label": "Seals: Steatite.\nPashupati seal (Mohenjodaro).\nUnicorn seal common.\nSeals used for trade and administration." },
              { "label": "Weights: cubical, standardized (binary system: 1,2,4,8...)." },
              { "label": "Trade: with Mesopotamia (Meluhha).\nLothal dockyard.\nShortughai (Afghanistan) for lapis lazuli." },
              { "label": "Script: Pictographic, right-to-left to boustrophedon.\nNot deciphered." },
              { "label": "MAINS: Extensive trade network indicates a highly organized commercial class; standardization of weights and measures points to state control or strong guild regulation." }
            ]
          },
          {
            "label": "Crucial Sites & Unique Findings (Matching Traps)",
            "children": [
              { "label": "Harappa (Punjab, Pakistan): 6 granaries in two rows, workmen's quarters, cemetery H, coffin burial, clay models of bullock cart." },
              { "label": "Mohenjodaro (Sindh): Great Bath, Great Granary, bronze Dancing Girl, steatite Bearded Priest, fragment of woven cotton, seal of Pashupati." },
              { "label": "Chanhudaro (Sindh): Only city without a citadel; bead-making factory, ink pot, lipstick-like object." },
              { "label": "Lothal (Gujarat): Artificial dockyard, fire altars, rice husks, double burial, terracotta ship model, Persian Gulf seal, ivory scale." },
              { "label": "Dholavira (Gujarat, Kutch): City divided into 3 parts (Citadel, Middle, Lower), giant water reservoirs, signboard with 10 large Harappan signs." },
              { "label": "Kalibangan (Rajasthan): Ploughed field (pre-Harappan), fire altars (citadel & lower town), camel bones, wooden drainage." },
              { "label": "Banawali (Haryana): Terracotta model of plough, high quality barley, oval-shaped settlement." },
              { "label": "Surkotada (Gujarat): Horse bones (controversial but accepted by some), oval grave, fortification with massive walls." },
              { "label": "Rakhigarhi (Haryana): One of the largest IVC sites; 2 well-preserved pre-Harappan graves." },
              { "label": "Daimabad (Maharashtra): Bronze figurines (rhino, elephant, buffalo, chariot), southernmost mature Harappan site." },
              { "label": "Sutkagan Dor (Balochistan): Important western site near Iran." },
              { "label": "Manda (Jammu): Northernmost Harappan site (on the Chenab)." }
            ]
          },
          {
            "label": "Religion & Art",
            "children": [
              { "label": "Pashupati Mahadeva: Seal shows a horned figure in yogic posture surrounded by animals (elephant, tiger, rhino, buffalo, deer)." },
              { "label": "Mother Goddess worship: terracotta figurines." },
              { "label": "Phallus (linga) and yoni symbols; tree worship (Pipal)." },
              { "label": "TRAP: Cow, camel, horse, lion are NOT depicted on Harappan seals (except Surkotada horse bones)." },
              { "label": "Amulets and talismans suggest belief in magic and evil spirits." },
              { "label": "MAINS: Religious motifs show continuity with later Hinduism (Pashupati, mother goddess, tree worship)." }
            ]
          },
          {
            "label": "Decline Theories",
            "children": [
              { "label": "Mortimer Wheeler: Aryan invasion and massacre (disputed)." },
              { "label": "John Marshall: environmental degradation and decline of trade." },
              { "label": "Gordon Childe: climatic changes and shifting river courses (Ghaggar-Hakra drying)." },
              { "label": "Consensus: gradual decline due to multiple factors (ecological, economic, political); not a sudden collapse." },
              { "label": "MAINS: Decline illustrates vulnerability of early urban societies to environmental stress and external pressures; legacy continued in rural cultures." }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "II",
    "p": "pm3",
    "label": "Vedic Age, Mahajanapadas & Heterodox Sects",
    "children": [
      {
        "p": "pm3",
        "label": "Early Vedic / Rig Vedic Period (1500–1000 BC)",
        "children": [
          {
            "label": "Society & Economy",
            "children": [
              { "label": "Economy: primarily pastoral.\nCow (Aghanya = not to be killed) as measure of wealth.\nGavishti = search for cows / war." },
              { "label": "Family: patriarchal, joint.\nWomen had respectable position (Apala, Ghosha, Lopamudra composed hymns)." },
              { "label": "Varna: not rigid, based on occupation.\nInter-marriage and inter-dining allowed." },
              { "label": "Assemblies: Vidatha (oldest, most general), Sabha (council of elders/nobles), Samiti (general assembly).\nWomen attended Sabha and Vidatha." },
              { "label": "TRAP: No regular tax system; Bali was voluntary offering.\nNo officers for tax collection." }
            ]
          },
          {
            "label": "Polity & Administration",
            "children": [
              { "label": "Rajan (tribal chief) – not hereditary, elected by assembly.\nOffice held during pleasure." },
              { "label": "Officials: Purohita (chief priest), Senani (army commander).\nNo standing army, only tribal militia." },
              { "label": "Gana (republic) system existed alongside monarchies." }
            ]
          },
          {
            "label": "Rivers & Geography",
            "children": [
              { "label": "Most mentioned river: Sindhu (Indus).\nHoliest river: Saraswati (Naditarna)." },
              { "label": "Purushni (Ravi): site of Battle of Ten Kings (Dasarajna) – Sudas (Bharata) vs.\nten tribes (including Anu, Druhyu, etc.)." },
              { "label": "Other rivers: Vitasta (Jhelum), Asikni (Chenab), Parushni (Ravi), Vipas (Beas), Sutudri (Sutlej)." },
              { "label": "Area: Sapta Sindhu (land of seven rivers) – mainly Punjab & eastern Afghanistan." }
            ]
          },
          {
            "label": "Religion & Gods",
            "children": [
              { "label": "Indra: 250 hymns, war god, Purandara (destroyer of forts)." },
              { "label": "Agni: 200 hymns, intermediary between gods and men." },
              { "label": "Varuna: guardian of Rita (cosmic order), god of waters." },
              { "label": "Soma: plant-god, associated with exhilarant drink." },
              { "label": "Other gods: Surya (sun), Vayu (wind), Ushas (dawn), Ashvins (twin gods of healing)." },
              { "label": "Rig Veda: 10 Mandalas.\nMandala 3 – Gayatri Mantra by Vishvamitra.\nMandala 10 – Purusha Sukta (origin of four Varnas from cosmic sacrifice), Nasadiya Sukta (creation hymn)." },
              { "label": "MAINS: The hymns reflect a naturalistic religion closely tied to the forces of nature; later Vedic period shows a shift towards ritualism." }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Later Vedic Period (1000–600 BC)",
        "children": [
          {
            "label": "Society & Economy",
            "children": [
              { "label": "Shift to agrarian economy in Gangetic plains; iron technology (Krishna Ayas) widespread." },
              { "label": "Varna became rigid, hereditary, birth-based.\nGotra system institutionalised." },
              { "label": "Women lost political rights, no access to assemblies, denied Upanayana.\nMarriage at later age but polygyny common." },
              { "label": "Ashrama system beginning: Brahmacharya, Grihastha, Vanaprastha, Sannyasa (first mentioned in Chhandogya Upanishad)." }
            ]
          },
          {
            "label": "Polity & Taxation",
            "children": [
              { "label": "Rajan became more powerful, hereditary kingship.\nLarge kingdoms replaced tribal territories." },
              { "label": "Officials: Sangrahitri (treasurer), Bhagadugha (collector of taxes), Suta (charioteer-bard)." },
              { "label": "Taxes: Bali (mandatory), Bhaga (share of produce 1/6), Shulka (custom duties)." },
              { "label": "Assemblies: Sabha and Samiti lost significance to royal authority." }
            ]
          },
          {
            "label": "Religion & Literature",
            "children": [
              { "label": "Gods: Prajapati (creator), Vishnu (preserver), Rudra (destroyer) rose.\nIndra and Agni declined." },
              { "label": "Rituals and sacrifices became elaborate, costly; Brahmans dominant." },
              { "label": "Vedas: Sama Veda (hymns for rituals, origins of music), Yajur Veda (prose mantras for sacrifices), Atharva Veda (magic, spells, medicine, popular religion)." },
              { "label": "Brahmanas: prose commentaries on Vedas.\nSatapatha Brahmana (longest, mentions ploughing rituals, agriculture)." },
              { "label": "Aranyakas: 'forest texts', link between ritualistic Brahmanas and philosophical Upanishads." },
              { "label": "Upanishads: anti-ritualistic, philosophical.\nMundaka Upanishad: 'Satyameva Jayate'.\nChandogya Upanishad: first reference to Ashramas.\nBrihadaranyaka Upanishad: doctrine of transmigration of soul.\nKatha Upanishad: Nachiketa-Yama dialogue." }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Mahajanapadas & Pre-Mauryan Dynasties",
        "children": [
          {
            "label": "16 Mahajanapadas (c.\n600 BC)",
            "children": [
              { "label": "Source: Anguttara Nikaya (Buddhist) and Bhagavati Sutra (Jain)." },
              { "label": "Monarchies: Magadha (Patna/Gaya), Kosala (Shravasti), Vatsa (Kaushambi), Avanti (Ujjain), Gandhara (Taxila), etc." },
              { "label": "Republics (Ganasanghas): Vajji (capital Vaishali) – most powerful republic; Malla (Kushinagar); Kamboja (NW)." },
              { "label": "TRAP: Vajji was a confederation of 8 clans (including Lichchhavis).\nMagadha annexed most Mahajanapadas." }
            ]
          },
          {
            "label": "Rise of Magadha",
            "children": [
              { "label": "Factors: Strategic location (Rajagriha/Pataliputra), rich iron deposits (weapons & tools), fertile Gangetic plains, control of river trade, ambitious rulers." },
              { "label": "Haryanka Dynasty: Bimbisara (Seniya – standing army, matrimonial alliances, conquered Anga).\nAjatashatru (Kunika – defeated Kosala and Vaishali, used catapults/maces, convened 1st Buddhist council).\nUdayin (founded Pataliputra at confluence of Ganga & Son)." },
              { "label": "Shishunaga Dynasty: Destroyed Avanti (Pradyota), ending 100-year rivalry.\nKalashoka (convened 2nd Buddhist council at Vaishali)." },
              { "label": "Nanda Dynasty: Mahapadma Nanda (Ugrasena/Ekarat – destroyed all Kshatriya rulers, first non‑Kshatriya dynasty).\nDhana Nanda (ruled when Alexander invaded India)." },
              { "label": "TRAP: Alexander’s invasion (326 BC) was limited to NW; he did not proceed beyond Beas due to mutiny." },
              { "label": "MAINS: Magadha's rise demonstrates the interplay of geography, economy, and military innovation in state formation." }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "III",
    "p": "pm3",
    "label": "Buddhism, Jainism & Darshanas",
    "children": [
      {
        "p": "pm3",
        "label": "Buddhism: Detailed Doctrines & History",
        "children": [
          {
            "label": "Core Tenets",
            "children": [
              { "label": "Four Noble Truths: Suffering (Dukkha), Cause (Samudaya – desire/trishna), Cessation (Nirodha – Nirvana), Path (Magga – Eightfold Path)." },
              { "label": "Eightfold Path: Right view, resolve, speech, conduct, livelihood, effort, mindfulness, concentration." },
              { "label": "Pratityasamutpada (Dependent Origination): everything has a cause; nothing exists independently." },
              { "label": "Anatta (no-soul), Anicca (impermanence), Dukkha (suffering)." },
              { "label": "Madhyama Marga (Middle Path): avoid extremes of indulgence and asceticism." },
              { "label": "Nirvana (Nibbana): extinction of desire and suffering." }
            ]
          },
          {
            "label": "Buddhist Councils",
            "children": [
              { "label": "1st Council (483 BC, Rajagriha): Presided by Mahakassapa; Vinaya Pitaka compiled by Upali, Sutta Pitaka by Ananda." },
              { "label": "2nd Council (383 BC, Vaishali): Dispute over monastic rules; formal split into Sthaviravadins (elders) and Mahasanghikas." },
              { "label": "3rd Council (250 BC, Pataliputra): Under Ashoka, presided by Moggaliputta Tissa.\nCompilation of Abhidhamma Pitaka; sent missionaries (Mahendra to Sri Lanka)." },
              { "label": "4th Council (1st century AD, Kashmir/Kundalvana): Under Kanishka, presided by Vasumitra; Sanskrit commentaries (Mahavibhasha).\nFormal split into Hinayana and Mahayana." },
              { "label": "TRAP: The 4th council is also known as the Sarvastivada council." }
            ]
          },
          {
            "label": "Sects & Schools",
            "children": [
              { "label": "Hinayana (Theravada): Orthodox, individual salvation (Arhat), aniconic (symbols used, no Buddha idols), Pali canon.\nPrevalent in Sri Lanka, Myanmar." },
              { "label": "Mahayana: Liberal, universal salvation (Bodhisattvas), Buddha worshipped as god, idols, Sanskrit.\nNorthern India, China, Japan." },
              { "label": "Vajrayana: Tantric/magical practices; prominent in eastern India (Vikramashila, Nalanda); became popular in Tibet." },
              { "label": "Bodhisattvas (Mahayana): Avalokiteshvara (Padmapani, compassion), Maitreya (future Buddha), Manjushri (wisdom, sword & book), Vajrapani (power, thunderbolt), Kshitigarbha (guardian of children/earth)." },
              { "label": "TRAP: The Buddha himself is NOT a Bodhisattva in Theravada; in Mahayana, he is a supreme being." }
            ]
          },
          {
            "label": "Key Texts & Literature",
            "children": [
              { "label": "Tripitaka (Three Baskets) in Pali: Sutta Pitaka (discourses), Vinaya Pitaka (monastic rules), Abhidhamma Pitaka (philosophy)." },
              { "label": "Jatakas: stories of Buddha’s previous births." },
              { "label": "Milindapanho: dialogue between Indo-Greek Menander (Milinda) and monk Nagasena." },
              { "label": "Buddhacharita: life of Buddha by Ashvaghosha (Sanskrit)." },
              { "label": "Madhyamika Sutra: by Nagarjuna (doctrine of relativity/emptiness)." }
            ]
          }
        ]
      },
      {
        "p": "pm3",
        "label": "Jainism: Detailed Doctrines & History",
        "children": [
          {
            "label": "Core Tenets & Tirthankaras",
            "children": [
              { "label": "Triratna: Right Faith (Samyak Darshana), Right Knowledge (Samyak Jnana), Right Conduct (Samyak Charitra)." },
              { "label": "Anekantavada: doctrine of manifold aspects; reality is complex and multi-faceted." },
              { "label": "Syadvada: doctrine of conditioned predication; every judgment is conditional, leading to 'Maybe' (Syat)." },
              { "label": "Soul (Jiva) present in all living and even some non-living things.\nExtreme Ahimsa: agriculture discouraged because it kills insects; strainers for water, masks for breath." },
              { "label": "24 Tirthankaras.\n1st: Rishabhanatha (Adinath); 23rd: Parshvanath (4 vows); 24th: Mahavira (5 vows, added celibacy)." },
              { "label": "Mahavira born at Kundagrama (Vaishali); attained Kaivalya at Jrimbhikagrama; died at Pavapuri (Bihar)." },
              { "label": "TRAP: Jainism recognized gods but placed them lower than Jinas; did not condemn Varna initially; accepted in Hinduism later." }
            ]
          },
          {
            "label": "Sects, Councils & Texts",
            "children": [
              { "label": "Digambara: Sky-clad (naked); Bhadrabahu led them south during famine.\nBelieve women cannot attain salvation without male rebirth." },
              { "label": "Svetambara: White-clad; Sthulabhadra remained in Magadha.\nBelieve women can attain salvation; more liberal." },
              { "label": "First Jain Council (Pataliputra, 3rd BC): compilation of 12 Angas under Sthulabhadra." },
              { "label": "Second Jain Council (Valabhi, 5th AD): Final compilation of canon (12 Angas, 12 Upangas) under Devardhi Kshamasramana." },
              { "label": "Language: Ardhamagadhi/Prakrit.\nKalpasutra (biographies of Tirthankaras) by Bhadrabahu." },
              { "label": "TRAP: Jainism remained confined to India, whereas Buddhism spread widely." }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Other Heterodox Sects & 6 Orthodox Darshanas (Philosophy)",
        "children": [
          {
            "label": "Ajivikas & Charvakas",
            "children": [
              { "label": "Ajivikas: Founded by Makkhali Gosala.\nNiyati (Fatalism) – everything is pre-determined, no free will.\nPatronized by Bindusara; Barabar caves gifted by Ashoka to Ajivikas." },
              { "label": "Charvakas (Lokayata): Materialistic.\nBrihaspati considered founder.\nRejected Vedas, God, soul, afterlife.\n'Eat, drink, make merry'." }
            ]
          },
          {
            "label": "The 6 Orthodox Schools (Astika – believe in Vedas)",
            "children": [
              { "label": "Samkhya (Kapila): Dualism of Purusha (consciousness) and Prakriti (matter).\nOldest school; atheistic." },
              { "label": "Yoga (Patanjali): Practical application of Samkhya.\nPhysical and mental control; Ashtanga Yoga." },
              { "label": "Nyaya (Gautama): Logic, epistemology; accepts four sources of knowledge: perception, inference, comparison, testimony." },
              { "label": "Vaisheshika (Kanada): Atomism (paramanu), physics, reality composed of atoms." },
              { "label": "Mimamsa (Jaimini): Analysis of Vedas, focus on rituals/sacrifices; emphasizes Dharma." },
              { "label": "Vedanta (Badarayana/Brahma Sutra): End of Vedas (Upanishads).\nShankara (Advaita – non-dualism, 8th-9th AD), Ramanuja (Vishishtadvaita – qualified non-dualism, 11th-12th AD), Madhva (Dvaita – dualism, 13th AD)." }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Religious Movements in Early Medieval India (Bhakti)",
        "children": [
          {
            "label": "Tamil Bhakti (Alvars & Nayanars)",
            "children": [
              { "label": "Alvars (Vaishnava saints): 12 saints; compositions compiled in Nalayira Divya Prabandham.\nAndal (only female Alvar)." },
              { "label": "Nayanars (Shaiva saints): 63 saints; compositions compiled in Tevaram, Tiruvachakam.\nAppar, Sundarar, Manikkavachakar." },
              { "label": "Preached love and devotion (bhakti) to a personal god; rejected caste barriers and ritualism." },
              { "label": "TRAP: This early Bhakti movement (6th-9th AD) predates the later medieval Bhakti of North India (Kabir, Nanak, etc.)." }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "IV",
    "p": "pm3",
    "label": "The Mauryan Empire & Administration",
    "children": [
      {
        "p": "pm3",
        "label": "Chandragupta, Bindusara & Arthashastra",
        "children": [
          { "label": "Chandragupta Maurya (322–297 BC): Founded empire with help of Chanakya (Kautilya).\nOverthrew Dhanananda.\nSeleucus I ceded territories; Megasthenes ambassador." },
          { "label": "Bindusara (Amitrochates): Extended empire to south except Kalinga, Cholas, Pandyas.\nPatronized Ajivikas." },
          { "label": "Arthashastra: 15 books.\nComprehensive treatise on statecraft, economics, espionage.\nCompiled by Kautilya." },
          { "label": "MAINS: Arthashastra provides a window into the highly centralized and bureaucratic nature of the Mauryan state, emphasizing the 'Saptanga' theory of the state." }
        ]
      },
      {
        "p": "pm3",
        "label": "Ashokan Edicts (Locations & Meaning – High Yield)",
        "children": [
          {
            "label": "Major Rock Edicts (MRE)",
            "children": [
              { "label": "MRE 1: Prohibition of animal sacrifices." },
              { "label": "MRE 2: Medical treatment for humans and animals.\nMentions Cholas, Pandyas, Keralaputras, Satiyaputras." },
              { "label": "MRE 3: Generosity to Brahmans and Sramanas; Yuktas and Pradeshikas to tour every 5 years for Dhamma." },
              { "label": "MRE 4: Reflects Ashoka's Dhamma policy." },
              { "label": "MRE 5: Appointment of Dhamma Mahamatras." },
              { "label": "MRE 6: Instruction to officials." },
              { "label": "MRE 7: Tolerances towards all sects." },
              { "label": "MRE 8: Ashoka's first pilgrimage to Bodh Gaya." },
              { "label": "MRE 9: Social duties and ceremonies." },
              { "label": "MRE 10: Condemns fame and glory." },
              { "label": "MRE 11: Explains Dhamma." },
              { "label": "MRE 12: Toleration of all sects." },
              { "label": "MRE 13: Kalinga war, victory by Dhamma (Dhammavijaya), mentions Greek kings (Antiochus II, Ptolemy II, Antigonus, Magas, Alexander)." },
              { "label": "MRE 14: Ashoka's order for inscriptions." },
              { "label": "TRAP: Shahbazgarhi & Mansehra (Pakistan) are in Kharoshthi script.\nAll other MREs are in Brahmi (except Kandahar – Greek & Aramaic)." }
            ]
          },
          {
            "label": "Pillar & Minor Edicts",
            "children": [
              { "label": "Delhi-Topra Pillar: Most pillars.\nRummindei Pillar (Lumbini): exemption of Bali and reduction of Bhaga to 1/8th." },
              { "label": "Bhabru-Bairat Edict: Ashoka's personal confession of faith in Buddha, Dhamma, Sangha." },
              { "label": "Maski (Karnataka) & Gujjara (MP) Edicts: Use Ashoka's real name (Devanampiya Piyadasi Ashoka)." },
              { "label": "Kandahar Edict: Bilingual (Greek & Aramaic)." },
              { "label": "Minor Rock Edicts at Brahmagiri, Siddhapur, Jatinga-Rameshwara." }
            ]
          }
        ]
      },
      {
        "p": "pm3",
        "label": "Mauryan Administration & Economy (Key Terms)",
        "children": [
          {
            "label": "Central & Provincial Officers",
            "children": [
              { "label": "Samaharta: Collector-General of Revenue." },
              { "label": "Sannidhata: Treasurer." },
              { "label": "Rajukas: District judges/administrators (Ashoka's officials)." },
              { "label": "Pradeshikas: Provincial governors.\nYuktas: subordinate revenue officers." },
              { "label": "Dhamma Mahamatras: officers for propagation of Dhamma (MRE 5)." },
              { "label": "Gudhapurushas: secret spies (Sanstha – stationary, Sanchara – wandering)." },
              { "label": "Provincial Administration: Four provinces – Uttarapatha (Taxila), Dakshinapatha (Suvarnagiri), Paschimpatha (Ujjain), Prachyapatha (Tosali)." }
            ]
          },
          {
            "label": "Land & Revenue",
            "children": [
              { "label": "Sita: crown lands managed by Sitadhyaksha." },
              { "label": "Bhaga: land tax (1/6 to 1/4 of produce)." },
              { "label": "Hiranya: tax paid in cash, not kind." },
              { "label": "Vishti: forced labor (unpaid), considered a legal tax." },
              { "label": "Pindikara: lump sum tax on village." },
              { "label": "Taxes included: land, irrigation, customs, tolls, mines, forests, ferry charges." }
            ]
          },
          {
            "label": "Megasthenes' Indica: Errors & Facts",
            "children": [
              { "label": "Claimed society divided into 7 castes (philosophers, farmers, soldiers, herdsmen, artisans, magistrates, councillors)." },
              { "label": "Claimed no slavery in India (partially true – slaves existed but treated less harshly)." },
              { "label": "Described Pataliputra in detail; municipal administration by committees." },
              { "label": "TRAP: Megasthenes' description of India is largely accurate but sometimes exaggerated." }
            ]
          }
        ]
      },
      {
        "label": "Mauryan Art & Architecture",
        "children": [
          { "label": "Pillars: monolithic, polished, with animal capitals (Lion at Sarnath, Bull at Rampurva)." },
          { "label": "Stupas: Sanchi Stupa (built by Ashoka, enlarged later)." },
          { "label": "Barabar Caves (Bihar): earliest rock-cut caves, donated to Ajivikas." },
          { "label": "Terracotta figurines, punch-marked coins (mostly silver)." },
          { "label": "Lomas Rishi cave: earliest example of rock-cut architecture." }
        ]
      },
      {
        "label": "Decline of Mauryas",
        "children": [
          { "label": "Weak later rulers (Dasharatha, Samprati, Shalishuka), financial crisis, provincial revolts, Ashoka's pacifist policies weakened the army, Brahmanical reaction against Dhamma." },
          { "label": "MAINS: The Mauryan collapse illustrates the limits of over-centralization and the difficulty of maintaining a vast empire without effective communication and loyal bureaucracy." }
        ]
      }
    ]
  },
  {
    "id": "V",
    "p": "pm2",
    "label": "Post-Mauryan: Foreigners, Satavahanas & Art",
    "children": [
      {
        "p": "pm2",
        "label": "Foreign Invaders (Chronology: I-S-P-K)",
        "children": [
          {
            "label": "Indo-Greeks (Bactrian Greeks)",
            "children": [
              { "label": "First to issue gold coins in India.\nFirst to put ruler portraits and dates on coins." },
              { "label": "Menander (Milinda): converted to Buddhism by Nagasena (Milindapanho)." },
              { "label": "Cultural synthesis: Hellenistic influence on Gandhara art." },
              { "label": "Demetrius I: first Indo-Greek king to conquer parts of India." }
            ]
          },
          {
            "label": "Shakas (Scythians)",
            "children": [
              { "label": "5 branches.\nRudradaman I (Junagadh rock inscription in pure Sanskrit – repaired Sudarshana lake)." },
              { "label": "Vikrama Era (58 BC) started by a Ujjain king to commemorate victory over Shakas." },
              { "label": "TRAP: Rudradaman's inscription is in Sanskrit, but it also contains his name and titles." }
            ]
          },
          {
            "label": "Parthians (Pahlavas)",
            "children": [
              { "label": "Gondophernes: St.\nThomas (Christian missionary) arrived during his reign." }
            ]
          },
          {
            "label": "Kushanas (Yueh-Chi)",
            "children": [
              { "label": "Kanishka: started Shaka Era (78 AD).\nConvened 4th Buddhist council.\nPatronized Ashvaghosha (Buddhacharita) and Nagarjuna (Madhyamika)." },
              { "label": "Capital: Purushapura (Peshawar) and Mathura." },
              { "label": "Issued purest gold coins; controlled Silk Route." },
              { "label": "TRAP: Kanishka is known as 'Second Ashoka' for his patronage of Buddhism." }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Indigenous Powers: Satavahanas (Deccan)",
        "children": [
          {
            "label": "Rulers & Administration",
            "children": [
              { "label": "Gautamiputra Satakarni: Destroyed Shakas.\nCalled himself 'only Brahmana'.\nNasik inscription (mother Gautami Balasri)." },
              { "label": "Started practice of tax-free land grants to Brahmans and Buddhist monks (origin of feudal tendencies)." },
              { "label": "Coins: mostly lead, potin, copper; no gold coins." },
              { "label": "Matronymics: kings named after mother (Gautami-putra, Vasishti-putra)." },
              { "label": "MAINS: Satavahana land grants signify the beginning of Indian feudalism and the emergence of a landed aristocracy." }
            ]
          }
        ]
      },
      {
        "p": "pm3",
        "label": "Art & Architecture (Post-Mauryan Schools – High Yield)",
        "children": [
          {
            "label": "Gandhara School (Indo-Greek/Greco-Roman)",
            "children": [
              { "label": "Region: NW Frontier (Taxila, Peshawar)." },
              { "label": "Material: Bluish-grey schist, stucco." },
              { "label": "Features: Hellenistic realism, muscular Buddha with wavy hair, heavy robes, halo, mustache.\nPrototype of Apollo-like figure." },
              { "label": "Patron: Kushanas.\nBuddha images first developed here." }
            ]
          },
          {
            "label": "Mathura School (Indigenous)",
            "children": [
              { "label": "Region: Mathura, UP.\nMaterial: Spotted red sandstone." },
              { "label": "Features: Indigenous style, smiling, fleshy Buddha, right hand in Abhaya Mudra; also produced Hindu and Jain images." },
              { "label": "Patron: Kushanas.\nBuddha in human form, seated, heavily adorned." }
            ]
          },
          {
            "label": "Amravati School (South India)",
            "children": [
              { "label": "Region: Amravati, Nagarjunakonda (Andhra).\nMaterial: White marble." },
              { "label": "Features: Narrative art, scenes from Jataka tales, slender figures, dynamic postures.\nStupas were central." },
              { "label": "Patron: Satavahanas and Ikshvakus." }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "VI",
    "p": "pm3",
    "label": "The Gupta Empire & Classicism (Golden Age)",
    "children": [
      {
        "p": "pm2",
        "label": "Rulers & Inscriptions",
        "children": [
          {
            "label": "Chandragupta I, Samudragupta",
            "children": [
              { "label": "Chandragupta I: founder (319/320 AD), married Lichchhavi princess Kumaradevi; started Gupta Era (320 AD)." },
              { "label": "Samudragupta: Allahabad Prashasti (composed by Harisena in Sanskrit).\nConquest of North (Aryavarta), South (Dakshinapatha – Grahana-Mokshanugraha = capture and release).\nDigvijay (reconquest)." }
            ]
          },
          {
            "label": "Chandragupta II (Vikramaditya)",
            "children": [
              { "label": "Defeated Shakas (Saka–Ksatrapas) and annexed Malwa and Gujarat; issued silver coins." },
              { "label": "Mehrauli Iron Pillar (Delhi) – eulogy of king Chandra (often identified with Chandragupta II)." },
              { "label": "Fa-Hien (Chinese traveler) visited; described peaceful society, no capital punishment, untouchability, hospitals." }
            ]
          },
          {
            "label": "Kumaragupta I & Skandagupta",
            "children": [
              { "label": "Kumaragupta I: Founded Nalanda Mahavihara; worshipped Kartikeya.\nPeaceful reign, but later Huna threat began." },
              { "label": "Skandagupta: Repulsed Hunas (Bhitari pillar inscription).\nRepaired Sudarshana lake (again).\nLast great Gupta ruler." }
            ]
          }
        ]
      },
      {
        "p": "pm3",
        "label": "Administration & Terminology (Trap Zone)",
        "children": [
          {
            "label": "Officers & Units",
            "children": [
              { "label": "Kumaramatyas: highest class of provincial officers (like IAS)." },
              { "label": "Sandhivigrahika: Minister of Peace and War." },
              { "label": "Maha-dandanayaka: Chief Justice." },
              { "label": "Uparika: Governor of a Bhukti (Province).\nVishayapati: Head of Vishaya (District)." },
              { "label": "Gramika/Village Headman: at village level.\nGram Sabha active." }
            ]
          },
          {
            "label": "Land & Revenue",
            "children": [
              { "label": "Udranga: main land tax (1/6th).\nUparikara: extra tax on temporary tenants." },
              { "label": "Land types: Kshetra (cultivable), Khila (waste), Aprahata (forest), Vasti (habitable)." },
              { "label": "Agrahara: tax-free land grants to Brahmans (religious).\nDevadana: grants to temples.\nBrahmadeya: similar." },
              { "label": "Guilds (Srenis) became powerful, had their own laws, militias, and banking functions." }
            ]
          }
        ]
      },
      {
        "p": "pm3",
        "label": "Literature, Science & Temple Architecture",
        "children": [
          {
            "label": "Sanskrit Literature",
            "children": [
              { "label": "Kalidasa: Abhijnanashakuntalam, Meghaduta, Kumarasambhava, Raghuvamsa." },
              { "label": "Vishakhadatta: Mudrarakshasa (Mauryan spy story)." },
              { "label": "Shudraka: Mrichchhakatika (The Little Clay Cart – social drama)." },
              { "label": "Bharavi: Kiratarjuniya.\nDandin: Dasakumaracharita.\nSubandhu: Vasavadatta." },
              { "label": "Panchatantra: Vishnu Sharma; Hitopadesha: Narayana." }
            ]
          },
          {
            "label": "Science & Mathematics",
            "children": [
              { "label": "Aryabhata: Aryabhatiya (rotation of earth, eclipses, zero, pi)." },
              { "label": "Varahamihira: Brihat Samhita (encyclopedic), Panchasiddhantika." },
              { "label": "Brahmagupta: Brahmasphutasiddhanta (use of zero, negative numbers)." },
              { "label": "Sushruta Samhita: surgery; Charaka Samhita: medicine (though earlier)." },
              { "label": "Nagarjuna (alchemist): advanced chemistry." }
            ]
          },
          {
            "label": "Temple Architecture (Nagara – Origin & Panchayatana)",
            "children": [
              { "label": "Transition from flat-roofed to Shikhara (spire) temples.\nPanchayatana style (central shrine with four subsidiary shrines)." },
              { "label": "Dashavatara Temple (Deogarh, UP): Early Panchayatana, stone, ornate doorways." },
              { "label": "Bhitargaon Temple (UP): Made of bricks, terracotta panels." },
              { "label": "Ajanta Caves (Maharashtra): Gupta period – fresco murals depicting Jataka tales, pure Buddhist.\n(Ellora is later, multi-religious)." },
              { "label": "Sarnath School of Sculpture: famous for polished, graceful Buddha images (e.g., Sarnath Buddha)." }
            ]
          }
        ]
      },
      {
        "label": "Gupta Society & Religion",
        "children": [
          { "label": "Society: Increased rigidity of caste; untouchability intensified.\nPosition of women declined – early marriage, no education, Sati (Eran inscription of Bhanugupta, 510 AD)." },
          { "label": "Religion: Brahmanism revived; worship of Vishnu, Shiva, and Goddesses (Durga, Lakshmi).\nTemple-building and image worship became central." },
          { "label": "MAINS: The Gupta period is termed 'Golden Age' for its artistic and literary achievements, but also witnessed the solidification of rigid social hierarchies." }
        ]
      }
    ]
  },
  {
    "id": "VII",
    "p": "pm2",
    "label": "Sangam Age & Deep South (300 BC – 300 AD)",
    "children": [
      {
        "p": "pm3",
        "label": "Sangam Literature & Epics",
        "children": [
          {
            "label": "The Three Sangams",
            "children": [
              { "label": "First Sangam (Madurai): Gods attended, no texts survived." },
              { "label": "Second Sangam (Kapatapuram): Only Tolkappiyam (grammar & poetics by Tolkappiyar) survived." },
              { "label": "Third Sangam (Madurai): Most extant works – Ettutogai (Eight Anthologies), Pattuppattu (Ten Idylls), etc." },
              { "label": "Sangam corpus: 2381 poems by 473 poets; covers Akam (love) and Puram (war/ethics)." }
            ]
          },
          {
            "label": "The Great Epics (Silappadikaram, Manimekalai, Jivaka Chintamani)",
            "children": [
              { "label": "Silappadikaram (Ilango Adigal): Tragic story of Kovalan, Kannagi, Madhavi; ends with Kannagi burning Madurai." },
              { "label": "Manimekalai (Sattanar): Buddhist sequel, story of Kovalan and Madhavi's daughter; philosophical." },
              { "label": "Jivaka Chintamani (Tiruttakkatēvar): Jain epic about prince Jivaka." },
              { "label": "Tirukkural (Thiruvalluvar): 1330 couplets on ethics, polity, love; non‑sectarian." }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Muvendar (Cheras, Cholas, Pandyas) & Society",
        "children": [
          {
            "label": "Kingdoms & Ports",
            "children": [
              { "label": "Cheras (Kerala): Bow & Arrow emblem; Muziris (Muchiri) major Roman trade hub.\nSenguttuvan (Pattini cult)." },
              { "label": "Cholas (Coromandel): Tiger emblem; Puhar/Kaveripattinam port; Karikala (built Kallanai dam across Kaveri)." },
              { "label": "Pandyas (Madurai): Fish emblem; Korkai port (pearls); patronised Sangams.\nNedunjeliyan known for justice." }
            ]
          },
          {
            "label": "Tinais (Eco-Zones) & Society",
            "children": [
              { "label": "Five landscapes: Kurinji (hills/hunting, god Murugan), Mullai (forest/pastoral, god Mayon/Vishnu), Marudam (plains/agriculture, god Indra), Neydal (coast/fishing, god Varuna), Palai (dry/robbery, goddess Korravai)." },
              { "label": "Society: Varna not rigid; occupation-based kudi/kulas; women had relative freedom; Sati (Tippai) existed but not common." },
              { "label": "Maritime trade with Rome: major export – pepper, pearls, ivory, textiles; import – gold coins (hoards found)." }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "VIII",
    "p": "pm2",
    "label": "Post-Gupta: Harsha, Chalukyas & Pallavas",
    "children": [
      {
        "p": "pm2",
        "label": "Harshavardhana (Pushyabhuti, 606–647 AD)",
        "children": [
          {
            "label": "Reign & Administration",
            "children": [
              { "label": "Capital: Thanesar then Kannauj.\nLast great Hindu emperor of North India." },
              { "label": "Hiuen Tsang (Xuanzang) visited; wrote Si-Yu-Ki.\nNotes severe punishments but safe roads.\nPraised Harsha's administration." },
              { "label": "Assemblies: Kannauj Assembly (religious debate – Harsha patronized Mahayana), Prayag Assembly (Maha Moksha Parishad – gave all wealth every five years)." },
              { "label": "Authored three Sanskrit plays: Ratnavali, Nagananda, Priyadarshika.\nBanabhatta wrote Harshacharita and Kadambari." },
              { "label": "Defeated by Pulakeshin II (Chalukya) on Narmada river." }
            ]
          }
        ]
      },
      {
        "p": "pm3",
        "label": "Chalukyas of Badami & Pallavas of Kanchi (Architecture Peak)",
        "children": [
          {
            "label": "Chalukyas of Badami (Vatapi)",
            "children": [
              { "label": "Pulakeshin II: defeated Harsha; sent embassy to Persian king Khusrau II.\nAihole inscription (Ravikirti) – eulogy." },
              { "label": "Temple Architecture (Vesara Style – hybrid of Nagara & Dravida).\nAihole: 70+ temples, cradle of Indian architecture; Lad Khan temple, Durga Temple.\nPattadakal: Virupaksha Temple (built by Queen Lokamahadevi to commemorate Vikramaditya II's victory over Pallavas).\nBadami caves: beautiful rock-cut." }
            ]
          },
          {
            "label": "Pallavas of Kanchi",
            "children": [
              { "label": "Narasimhavarman I (Mahamalla): Defeated Pulakeshin II; occupied Badami.\nBuilt monolithic Rathas (Pancha Rathas) at Mahabalipuram." },
              { "label": "Narasimhavarman II (Rajasimha): Transition from rock-cut to structural temples.\nShore Temple (Mahabalipuram), Kailasanatha Temple (Kanchi)." },
              { "label": "Originators of Dravida style (Vimana, Mandapa, Gopuram).\nMahabalipuram: Arjuna's Penance (Descent of Ganga) – huge rock relief." },
              { "label": "Pallava-Chola transition: Pallavas laid foundation for later Chola grandeur." }
            ]
          }
        ]
      },
      {
        "p": "pm2",
        "label": "Tripartite Struggle & Early Medieval Dynasties (750–1000 AD)",
        "children": [
          {
            "label": "The Tripartite Struggle for Kannauj",
            "children": [
              { "label": "Between Palas (Bengal, ruled by Dharmapala, Devapala), Pratiharas (Gurjara-Pratiharas, ruled by Nagabhata II, Mihira Bhoja), and Rashtrakutas (Deccan, ruled by Dhruva, Govinda III)." },
              { "label": "Pratiharas emerged victors under Mihira Bhoja; controlled Kannauj and acted as bulwark against Arab invasions." },
              { "label": "Al Masudi (Arab traveller) praised Pratihara king Mahipala I." }
            ]
          },
          {
            "label": "Rashtrakutas of Manyakheta",
            "children": [
              { "label": "Founded by Dantidurga.\nKrishna I built the magnificent Kailasanatha Temple (Ellora, rock-cut)." },
              { "label": "Amoghavarsha I (greatest ruler): patronized Jainism; wrote Kavirajamarga (Kannada) and Prashnottara Ratnamalika." },
              { "label": "Arab travellers: Sulaiman and Al Masudi visited; noted equality among Rashtrakutas and Pratiharas." },
              { "label": "Later defeated by Chola king Rajaraja I." }
            ]
          },
          {
            "label": "Palas of Bengal",
            "children": [
              { "label": "Dharmapala: founded Vikramashila University.\nDevapala: most powerful; extended empire to Assam." },
              { "label": "Patrons of Buddhism; maintained diplomatic relations with Srivijaya (Java)." },
              { "label": "Gopala: elected by people as king (first elected king in India?)." }
            ]
          }
        ]
      },
      {
        "p": "pm3",
        "label": "The Imperial Cholas (850–1279 AD) – Administration & Art",
        "children": [
          {
            "label": "Rulers",
            "children": [
              { "label": "Vijayalaya: founder, captured Thanjavur." },
              { "label": "Rajaraja I (985–1014): conquered entire south, Sri Lanka, Maldives.\nBuilt Brihadeshwara Temple (Rajarajeswara) at Thanjavur – Dravida masterpiece." },
              { "label": "Rajendra I: Gangaikonda Cholapuram (new capital), built another Brihadeshwara.\nNaval expedition to Kadaram (Srivijaya)." }
            ]
          },
          {
            "label": "Chola Administration (Often Asked)",
            "children": [
              { "label": "Central: King assisted by Udankuttam (inner cabinet)." },
              { "label": "Province: Mandalam (governor).\nDistrict: Valanadu (Nadu).\nVillage: most important unit." },
              { "label": "Village autonomy: Ur (general assembly of ordinary villages), Sabha (Brahman villages – Agraharas), Nagaram (merchant guilds in towns)." },
              { "label": "Uttaramerur inscription (Parantaka I) details committee system of Sabha (variyams) – election by lot (kudavolai)." }
            ]
          },
          {
            "label": "Chola Art & Architecture",
            "children": [
              { "label": "Dravida style reaches apex: huge Vimanas, large Gopurams, intricate sculptures.\nNataraja bronze (Chola bronze) – lost wax technique, world famous." },
              { "label": "Temples: Brihadeshwara (Thanjavur, Gangaikondacholapuram), Airavateshwar (Darasuram)." },
              { "label": "Paintings: Chola wall paintings (Thanjavur) – elegant and distinct from Ajanta." }
            ]
          }
        ]
      },
      {
        "p": "pm3",
        "label": "Evolution of Temple Architecture Styles (Comprehensive)",
        "children": [
          {
            "label": "Nagara (North Indian)",
            "children": [
              { "label": "Basic: Shikhara (curvilinear spire) over garbhagriha; multiple mandapas; no tank or elaborate gopuram." },
              { "label": "Sub-styles: Odisha (Kalinga) – e.g., Lingaraja Temple (Bhubaneswar), Sun Temple (Konark).\nKhajuraho (Chandela) – Kandariya Mahadeva, Lakshmana temple.\nSolanki (Maru-Gurjara) – Dilwara Jain temples, Modhera Sun temple." },
              { "label": "TRAP: In Nagara, the sanctum is square and the shikhara is curvilinear; there is no tank usually." }
            ]
          },
          {
            "label": "Dravida (South Indian)",
            "children": [
              { "label": "Basic: Vimana (pyramidal tower) over sanctum; Gopurams (gateways) become larger; tank (water body) integral." },
              { "label": "Evolution: Pallava (rock-cut to structural), Chola (grand vimanas), Vijayanagara (high gopurams, kalyanamandapa), Nayaka (enclosure walls)." },
              { "label": "TRAP: In Dravida, the vimana is over the main shrine, gopurams are later additions; the temple complex is enclosed." }
            ]
          },
          {
            "label": "Vesara (Hybrid – Deccan)",
            "children": [
              { "label": "Blend of Nagara & Dravida.\nSeen in Chalukyas of Badami (Aihole, Pattadakal) and later Hoysalas (Belur, Halebid – star-shaped platform, soapstone)." }
            ]
          }
        ]
      },
      {
        "p": "pm3",
        "label": "Important Inscriptions & Edicts (Revision List)",
        "children": [
          { "label": "Junagadh Rock Inscription: Rudradaman I (Shaka) – earliest pure Sanskrit inscription." },
          { "label": "Allahabad Prashasti: Samudragupta (Harisena)." },
          { "label": "Aihole Inscription: Pulakeshin II (Ravikirti) – eulogy." },
          { "label": "Nasik Inscription: Gautamiputra Satakarni (by mother Gautami Balasri)." },
          { "label": "Maski Edict: confirms Ashoka's name." },
          { "label": "Bhitari Pillar: Skandagupta's victory over Hunas." },
          { "label": "Uttaramerur Inscription: Chola village administration (Parantaka I)." },
          { "label": "Eran Inscription: Bhanugupta (mention of Sati)." }
        ]
      },
      {
        "p": "pm2",
        "label": "TRAP: Chronology & Dating Quick Ref",
        "children": [
          { "label": "Harappan: 2600–1900 BC.\nRig Veda: 1500–1000 BC.\nLater Vedic: 1000–600 BC." },
          { "label": "Mahavira: 599 BC (or 540 BC).\nBuddha: 563 BC (or 480 BC)." },
          { "label": "Mauryas: 322–185 BC.\nAshoka: 268–232 BC." },
          { "label": "Satavahanas: 1st BC–3rd AD.\nKushanas: 1st–3rd AD (Kanishka 78 AD)." },
          { "label": "Guptas: 320–550 AD (Chandragupta I 320 AD, Samudragupta 335–375 AD, Chandragupta II 375–415 AD)." },
          { "label": "Harsha: 606–647 AD.\nPallavas: 6th–9th AD.\nCholas: 9th–13th AD." },
          { "label": "TRAP: Gupta Era starts 320 AD, Vikrama Era 58 BC, Shaka Era 78 AD." }
        ]
      },
      {
        "p": "pm2",
        "label": "Sources of Ancient Indian History (Mains Focus)",
        "children": [
          { "label": "Archaeological: inscriptions, coins, monuments, pottery, seals." },
          { "label": "Literary: Indigenous (Vedas, Epics, Puranas, Sangam texts, Buddhist/Jain texts), Foreign (Megasthenes, Fa-Hien, Hiuen Tsang, Al-Biruni)." },
          { "label": "Problems: lack of historical sense, chronological gaps, religious bias, over-reliance on literary sources." },
          { "label": "MAINS: A critical use of both archaeological and literary sources is essential to reconstruct ancient Indian history." }
        ]
      }
    ]
  }
] satisfies RawSubjectNode[];