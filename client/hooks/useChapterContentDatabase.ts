export interface ChapterContent {
  name: string;
  difficulty: number;
  expectedHours: number;
  marksWeightage: number;
  conceptDensity: number;
  memorizationLoad: number;
  problemSolvingLoad: number;
  majorTopics: {
    name: string;
    subtopics: string[];
    timeMinutes: number;
    importance: number;
    difficulty: number;
    formulasCount: number;
    diagramsCount: number;
  }[];
  formulas: Array<{
    name: string;
    formula: string;
    whenToUse: string;
    commonMistakes: string[];
  }>;
  commonMistakes: string[];
  previousYearTrends: {
    topic: string;
    frequency: "high" | "medium" | "low";
    marksRange: string;
  }[];
  flashcardQuestions: string[];
  selfTestQuestions: string[];
  mustKnowTopics: string[];
  shouldKnowTopics: string[];
  niceToKnowTopics: string[];
  revisionPoints: string[];
}

const CHAPTER_DATABASE: Record<string, Record<string, Record<string, ChapterContent>>> = {
  cbse: {
    "10th": {
      "light-reflection-refraction": {
        name: "Light: Reflection and Refraction",
        difficulty: 6,
        expectedHours: 15,
        marksWeightage: 8,
        conceptDensity: 7,
        memorizationLoad: 4,
        problemSolvingLoad: 8,
        majorTopics: [
          {
            name: "Laws of Reflection",
            subtopics: [
              "Definition of reflection",
              "Law 1: Angle of Incidence = Angle of Reflection",
              "Law 2: Incident ray, reflected ray, and normal are in the same plane",
              "Lateral inversion",
              "Ray diagrams",
            ],
            timeMinutes: 45,
            importance: 9,
            difficulty: 2,
            formulasCount: 0,
            diagramsCount: 5,
          },
          {
            name: "Plane Mirrors",
            subtopics: [
              "Image formation in plane mirrors",
              "Properties of plane mirror images",
              "Real vs virtual images",
              "Magnification in plane mirrors",
              "Multiple images in plane mirrors",
            ],
            timeMinutes: 60,
            importance: 9,
            difficulty: 3,
            formulasCount: 2,
            diagramsCount: 8,
          },
          {
            name: "Spherical Mirrors",
            subtopics: [
              "Concave mirrors",
              "Convex mirrors",
              "Pole, center of curvature, principal axis",
              "Principal focus and focal length",
              "Relationship: f = R/2",
              "Sign convention",
            ],
            timeMinutes: 90,
            importance: 10,
            difficulty: 5,
            formulasCount: 3,
            diagramsCount: 12,
          },
          {
            name: "Mirror Formula and Magnification",
            subtopics: [
              "Mirror formula derivation: 1/f = 1/v + 1/u",
              "Image formation by concave mirrors (6 cases)",
              "Image formation by convex mirrors",
              "Linear magnification: m = -v/u",
              "Problems with different object positions",
            ],
            timeMinutes: 120,
            importance: 10,
            difficulty: 7,
            formulasCount: 2,
            diagramsCount: 15,
          },
          {
            name: "Refraction of Light",
            subtopics: [
              "Definition of refraction",
              "Laws of refraction",
              "Refractive index definition",
              "Snell's law: n1 sin θ1 = n2 sin θ2",
              "Relative refractive index",
              "Light bending toward/away from normal",
            ],
            timeMinutes: 75,
            importance: 9,
            difficulty: 4,
            formulasCount: 2,
            diagramsCount: 6,
          },
          {
            name: "Lenses",
            subtopics: [
              "Convex lens (converging)",
              "Concave lens (diverging)",
              "Focal length and power",
              "Lens formula: 1/f = 1/v + 1/u",
              "Image formation by convex lens (5 cases)",
              "Image formation by concave lens",
              "Magnification by lenses",
              "Power of lens: P = 1/f (in meters)",
            ],
            timeMinutes: 150,
            importance: 10,
            difficulty: 7,
            formulasCount: 4,
            diagramsCount: 20,
          },
        ],
        formulas: [
          {
            name: "Mirror Formula",
            formula: "1/f = 1/v + 1/u",
            whenToUse: "Finding focal length, object distance, or image distance for any spherical mirror",
            commonMistakes: [
              "Forgetting sign convention - u, v, f all have signs",
              "Using positive values for all distances",
              "Not distinguishing between real and virtual distances",
            ],
          },
          {
            name: "Lens Formula",
            formula: "1/f = 1/v + 1/u",
            whenToUse: "Finding focal length, object distance, or image distance for any lens",
            commonMistakes: [
              "Confusing lens formula with mirror formula (they're the same but sign convention differs)",
              "Not applying sign convention correctly for lenses",
              "Forgetting that object is always on left side for lenses",
            ],
          },
          {
            name: "Magnification (Mirror/Lens)",
            formula: "m = -v/u or m = h'/h",
            whenToUse: "Finding image height, magnification, or comparing object and image sizes",
            commonMistakes: [
              "Ignoring the negative sign which indicates image inversion",
              "Mixing up linear magnification with area magnification",
              "Not understanding that m < 1 means diminished image",
            ],
          },
          {
            name: "Power of Lens",
            formula: "P = 1/f (focal length in meters)",
            whenToUse: "Expressing lens strength in diopters, comparing lens powers",
            commonMistakes: [
              "Forgetting to convert focal length to meters",
              "Not understanding that higher power = stronger lens = shorter focal length",
            ],
          },
        ],
        commonMistakes: [
          "Confusing concave and convex mirrors - concave converges light, convex diverges",
          "Wrong sign convention - real objects have u > 0, real images have v > 0",
          "Focal length sign: concave/converging lens f > 0, convex/diverging f < 0",
          "Forgetting that plane mirrors always form virtual, erect, same-size images",
          "Making arithmetic errors with signs in mirror/lens formula",
          "Not drawing ray diagrams to verify answers",
          "Confusing focal length f with radius of curvature R (R = 2f)",
          "Mixing up lateral inversion (plane mirror) with image inversion (curved mirrors)",
          "Assuming all mirror formulas work the same way (they do, but signs differ)",
          "Not understanding that convex lenses can form both real and virtual images",
        ],
        previousYearTrends: [
          { topic: "Mirror formula numerical problems", frequency: "high", marksRange: "3-5" },
          { topic: "Lens formula problems", frequency: "high", marksRange: "3-5" },
          { topic: "Ray diagrams for mirrors and lenses", frequency: "high", marksRange: "2-3" },
          { topic: "Laws of reflection and refraction", frequency: "medium", marksRange: "2" },
          { topic: "Magnification calculations", frequency: "medium", marksRange: "2" },
          { topic: "Image formation cases", frequency: "high", marksRange: "1-2 per case" },
          { topic: "Refractive index calculations", frequency: "medium", marksRange: "2-3" },
          { topic: "Power of lens", frequency: "medium", marksRange: "1-2" },
        ],
        flashcardQuestions: [
          "State the two laws of reflection",
          "What is the sign convention for spherical mirrors?",
          "Derive the mirror formula starting from geometry",
          "What is the focal length of a mirror with radius of curvature 40 cm?",
          "A concave mirror has f = 15 cm. Where should an object be placed to get a magnified real image?",
          "Define refractive index and give its formula",
          "What is Snell's law and when does total internal reflection occur?",
          "Distinguish between concave and convex lenses",
          "What is power of a lens? Calculate power of a lens with f = 0.5 m",
          "Can a concave lens form a real image? Explain",
        ],
        selfTestQuestions: [
          "An object 5 cm tall is placed 30 cm from a concave mirror of focal length 10 cm. Find image distance, magnification, and nature of image",
          "A light ray hits a plane mirror. Angle of incidence is 35°. What is angle of reflection?",
          "A convex lens has focal length 25 cm. An object is placed 50 cm away. Find image position and magnification",
          "Refractive index of glass is 1.5. Light travels from glass to air. Calculate critical angle",
          "Two mirrors are placed at 60° angle. How many images of an object will be formed?",
          "A concave mirror forms an image 3 times larger than object. If object is 10 cm away, find focal length",
          "Light enters water (n=1.33) from air at 45° angle. Calculate refraction angle",
          "A lens has power -2D. Find focal length and type of lens",
          "An object placed at center of curvature of concave mirror. Describe the image",
          "A converging lens and diverging lens of powers +5D and -3D are in contact. Find combined power",
        ],
        mustKnowTopics: [
          "Mirror formula: 1/f = 1/v + 1/u",
          "Sign convention for mirrors",
          "Lens formula and power of lens",
          "Image formation by concave mirrors (all 6 cases)",
          "Image formation by convex lens (all 5 cases)",
          "Ray diagrams for mirrors and lenses",
          "Magnification formula: m = -v/u",
          "Snell's law: n1 sin θ1 = n2 sin θ2",
          "Relationship: f = R/2",
          "Total internal reflection concept",
        ],
        shouldKnowTopics: [
          "Lateral inversion in plane mirrors",
          "Multiple images in plane mirrors",
          "Convex mirror image formation (fewer cases)",
          "Concave lens image formation",
          "Refractive index definition",
          "Laws of reflection derivation",
          "Critical angle calculation",
        ],
        niceToKnowTopics: [
          "Derivation of mirror formula from geometry",
          "Dispersion of light",
          "Lens maker's formula",
          "Combinations of lenses",
          "Optical instruments design principles",
        ],
        revisionPoints: [
          "Mirror formula works for all spherical mirrors (concave/convex)",
          "Concave mirrors: f > 0, Convex mirrors: f < 0",
          "For real images: v > 0, For virtual images: v < 0",
          "Magnification: positive = erect, negative = inverted",
          "Plane mirror always: virtual, erect, same size (m = 1)",
          "Convex lens: f > 0 (always converging)",
          "Concave lens: f < 0 (always diverging)",
          "Power P = 1/f in meters gives diopters",
          "Refraction law: sin θ1 / sin θ2 = n2 / n1",
          "Critical angle: sin θc = n2/n1 (for light going from denser to rarer medium)",
        ],
      },
      "chemical-reactions-equations": {
        name: "Chemical Reactions and Equations",
        difficulty: 4,
        expectedHours: 8,
        marksWeightage: 6,
        conceptDensity: 5,
        memorizationLoad: 4,
        problemSolvingLoad: 7,
        majorTopics: [
          {
            name: "Writing and Balancing Equations",
            subtopics: [
              "Understand reactants and products",
              "Write unbalanced equation (skeleton)",
              "Count atoms on both sides",
              "Add coefficients to balance (hit and trial)",
              "Check: equal atoms on both sides",
              "Add states of matter (s, l, g, aq)",
            ],
            timeMinutes: 75,
            importance: 10,
            difficulty: 3,
            formulasCount: 0,
            diagramsCount: 0,
          },
          {
            name: "Types of Chemical Reactions (5 Types)",
            subtopics: [
              "Type 1: Combination (A + B → AB) - Example: 2H2 + O2 → 2H2O",
              "Type 2: Decomposition (AB → A + B) - Example: 2H2O → 2H2 + O2",
              "Type 3: Displacement - Single: A + BC → AC + B, Double: AB + CD → AD + CB",
              "Type 4: Combustion (burn in O2) - Example: C + O2 → CO2",
              "Type 5: Redox reactions - Oxidation and reduction happen together",
            ],
            timeMinutes: 90,
            importance: 10,
            difficulty: 3,
            formulasCount: 0,
            diagramsCount: 0,
          },
          {
            name: "Physical vs Chemical Changes",
            subtopics: [
              "Physical: No new substance, reversible (melting, freezing, boiling)",
              "Chemical: New substance formed, usually irreversible",
              "Signs of chemical change: color, gas, heat, light, precipitate",
              "Example: Burning paper = chemical (forms ash, CO2)",
              "Example: Melting ice = physical (still water)",
            ],
            timeMinutes: 45,
            importance: 7,
            difficulty: 2,
            formulasCount: 0,
            diagramsCount: 3,
          },
          {
            name: "Balancing Practice & Common Reactions",
            subtopics: [
              "Combustion reactions: CxHy + O2 → CO2 + H2O (always unbalanced)",
              "Acid-base: HCl + NaOH → NaCl + H2O",
              "Metal + acid: Zn + HCl → ZnCl2 + H2",
              "Metal + oxygen: 2Mg + O2 → 2MgO",
              "Practice NCERT problems: Chapter 1 questions 1-10",
            ],
            timeMinutes: 60,
            importance: 9,
            difficulty: 4,
            formulasCount: 0,
            diagramsCount: 0,
          },
        ],
        formulas: [],
        commonMistakes: [
          "Writing unbalanced equations (CHECK ATOM COUNT!)",
          "Forgetting states: H2O(g) ≠ H2O(l) - use (s)olid, (l)iquid, (g)as, (aq)ueous",
          "Balancing by changing formulas (WRONG): CaCO3 ≠ CaCO6",
          "Not understanding reaction type - read the reaction, identify which type",
          "Combustion equations: ALWAYS balance H first, then C, then O",
          "Writing products that don't exist - Na + H2O gives NaOH + H2, NOT Na2O + H2",
        ],
        previousYearTrends: [
          { topic: "Balance 3-5 equations on paper", frequency: "high", marksRange: "3-4" },
          { topic: "Identify reaction type", frequency: "high", marksRange: "1-2" },
          { topic: "Complete the reaction", frequency: "high", marksRange: "1-2" },
          { topic: "Signs of chemical change", frequency: "medium", marksRange: "1" },
          { topic: "Name reaction type", frequency: "medium", marksRange: "1" },
        ],
        flashcardQuestions: [
          "Balance: C + O2 → CO2",
          "Balance: Fe + O2 → Fe2O3",
          "Write & balance: Combustion of methane (CH4)",
          "Balance: Mg + HCl → MgCl2 + H2",
          "What are the 5 types of chemical reactions? Give 1 example each.",
          "What's the difference between physical and chemical change?",
          "Balance: H2SO4 + NaOH → Na2SO4 + H2O",
          "Write products: Na + H2O → ?",
          "Write products: CaCO3 + heat → ?",
          "Identify the type: 2H2O → 2H2 + O2",
        ],
        selfTestQuestions: [
          "Balance these 10 equations: Fe + Cl2, CaCO3→CaO+CO2, Zn+HCl, Cu+O2, NaOH+H2SO4",
          "Identify reaction type for each equation above",
          "Write products then balance: Al + O2 → ?, C + O2 → ?, Fe + S → ?, Pb(NO3)2 + KI → ?",
          "Complete: Combustion of C2H6. Balance. Name the type.",
          "Solve NCERT Exercise 1.1 (Q1-10)",
          "For reaction Na + H2O → NaOH + H2: balance it, name type, identify physical/chemical change",
          "Take online quiz on balancing (Khan Academy or Vedantu)",
          "Solve previous year board questions (2018-2023) on this chapter",
          "Explain why C + O2 can form both CO and CO2. Balance both.",
          "Create flashcards for all 5 reaction types with 2 real examples each",
        ],
        mustKnowTopics: [
          "How to balance equations (count atoms step-by-step)",
          "5 reaction types + 1 real example for each",
          "Physical vs chemical change (definitions and examples)",
          "Common combustion equation pattern (CxHy + O2 → CO2 + H2O)",
          "Balance at least 20 practice equations from NCERT",
        ],
        shouldKnowTopics: [
          "Reasons WHY equations must be balanced (conservation of mass)",
          "Displacement reactions (single and double)",
          "Redox concept introduction",
          "States of matter notation in equations",
        ],
        niceToKnowTopics: [
          "Ionic equations (net ionic equations)",
          "Thermochemical equations (ΔH values)",
          "Balancing complex equations with fractions",
        ],
        revisionPoints: [
          "BALANCE = same number of atoms on both sides",
          "Physical change = no new substance (ice → water is still H2O)",
          "Chemical change = new substance (paper → ash + CO2)",
          "In combustion: balance H first, then C, then O always",
          "Check your answer: recount atoms on both sides",
        ],
      },
      "electricity": {
        name: "Electricity",
        difficulty: 6,
        expectedHours: 12,
        marksWeightage: 7,
        conceptDensity: 7,
        memorizationLoad: 3,
        problemSolvingLoad: 9,
        majorTopics: [
          {
            name: "Electric Current & Ohm's Law",
            subtopics: [
              "Define current: I = Q/t (charge per unit time in amperes)",
              "Potential difference: V = W/Q (joules per coulomb)",
              "Resistance: R = V/I (ohms)",
              "Ohm's Law: V = IR (voltage = current × resistance)",
              "Practice: Calculate I, V, or R when two are given",
            ],
            timeMinutes: 90,
            importance: 10,
            difficulty: 4,
            formulasCount: 4,
            diagramsCount: 4,
          },
          {
            name: "Resistivity & Resistance Factors",
            subtopics: [
              "Resistivity (ρ) vs Resistance (R): R = ρL/A",
              "Factors: material type, length, cross-section, temperature",
              "Conductors (ρ small), insulators (ρ large), semiconductors",
              "Temperature effect: higher temp = higher resistance",
              "Solve problems: find resistance given ρ, L, A",
            ],
            timeMinutes: 75,
            importance: 8,
            difficulty: 4,
            formulasCount: 2,
            diagramsCount: 3,
          },
          {
            name: "Series & Parallel Circuits",
            subtopics: [
              "Series: I same everywhere, V divides, Rtotal = R1 + R2 + R3",
              "Parallel: V same, I divides, 1/Rtotal = 1/R1 + 1/R2 + 1/R3",
              "Draw and identify circuits (which are series, which parallel?)",
              "Calculate total resistance, current, voltage drop in each",
              "Real circuits mix series and parallel combinations",
            ],
            timeMinutes: 120,
            importance: 10,
            difficulty: 6,
            formulasCount: 3,
            diagramsCount: 8,
          },
          {
            name: "Power & Energy in Circuits",
            subtopics: [
              "Power: P = VI = I²R = V²/R (watts = joules/second)",
              "Energy: E = Pt = VIt (joules)",
              "Electricity bill: kWh = (power in kW) × (time in h)",
              "Heating effect: Heat = I²Rt (Joule's law)",
              "Calculate power consumption, bills, heat generated",
            ],
            timeMinutes: 75,
            importance: 9,
            difficulty: 3,
            formulasCount: 4,
            diagramsCount: 2,
          },
        ],
        formulas: [
          {
            name: "Ohm's Law",
            formula: "V = IR",
            whenToUse: "Find voltage, current, or resistance in any circuit",
            commonMistakes: ["Confusing direction of current", "Wrong units (mA vs A)"],
          },
          {
            name: "Resistivity Formula",
            formula: "R = ρL/A",
            whenToUse: "Calculate resistance from material properties",
            commonMistakes: ["Forgetting to convert units", "Confusing ρ (rho) with R"],
          },
          {
            name: "Power",
            formula: "P = VI or P = I²R or P = V²/R",
            whenToUse: "Calculate electrical power consumption",
            commonMistakes: ["Using wrong formula for the given data", "Unit errors (W vs mW)"],
          },
        ],
        commonMistakes: [
          "Confusing current direction (conventional vs electron flow)",
          "Wrong sign in Ohm's law manipulation: V = IR, NOT I = VR",
          "Series vs parallel rules mixed up (Rtotal addition vs 1/R addition)",
          "Power formula: P = VI NOT P = I+R",
          "Not converting units: A vs mA, Ω vs kΩ",
          "Wrong formula for heat/energy in circuits",
        ],
        previousYearTrends: [
          { topic: "Ohm's law problems", frequency: "high", marksRange: "3-4" },
          { topic: "Series/parallel circuits", frequency: "high", marksRange: "2-3" },
          { topic: "Power calculations", frequency: "high", marksRange: "2-3" },
          { topic: "Resistivity problems", frequency: "medium", marksRange: "2" },
          { topic: "Circuit analysis", frequency: "medium", marksRange: "1-2" },
        ],
        flashcardQuestions: [
          "State Ohm's Law and write the formula V = IR",
          "What's the difference between resistance R and resistivity ρ?",
          "In a series circuit, how do voltages add? How do currents add?",
          "In a parallel circuit, how do voltages add? How do currents add?",
          "Write the 3 forms of power formula",
          "Calculate I: V = 12V, R = 4Ω",
          "Calculate V: I = 2A, R = 5Ω",
          "Two 10Ω resistors in series: total R?",
          "Two 10Ω resistors in parallel: total R?",
          "A 60W bulb on 220V supply: what is the current and resistance?",
        ],
        selfTestQuestions: [
          "Solve 10 Ohm's law problems (find I, V, or R)",
          "Solve 5 resistivity problems using R = ρL/A",
          "Analyze 3 mixed series-parallel circuits (calculate Rtotal, I, V)",
          "Solve 5 power calculation problems (P, I, V, R all variables)",
          "NCERT Exercise 12.1 all questions",
          "Draw a circuit and calculate everything (I, V, R, P)",
          "Monthly electricity bill calculation (power × time × rate)",
          "Solve previous year board questions (2018-2023)",
          "Compare: same power, different V and I combinations",
          "Design a circuit that uses resistors correctly for safe operation",
        ],
        mustKnowTopics: [
          "Ohm's Law: V = IR (solve for any variable)",
          "Series circuit rules: Rtotal, I same everywhere, V divides",
          "Parallel circuit rules: 1/Rtotal, V same everywhere, I divides",
          "Power formulas: P = VI = I²R = V²/R",
          "Energy: E = Pt (or Joule's law for heat)",
        ],
        shouldKnowTopics: [
          "Resistivity and resistance relationship",
          "Temperature effect on resistance",
          "Circuit analysis (mixed series-parallel)",
          "Real-world power consumption",
        ],
        niceToKnowTopics: [
          "EMF vs terminal voltage",
          "Internal resistance of cells",
          "Maximum power transfer theorem",
        ],
        revisionPoints: [
          "Series: I constant, V divides, R adds (Rtotal = R1 + R2)",
          "Parallel: V constant, I divides, R adds as fractions (1/Rtotal = 1/R1 + 1/R2)",
          "P = VI = I²R = V²/R (choose formula based on what you know)",
          "Energy bill: Power (in kW) × Time (in h) = Units (kWh)",
          "Always check units: A, V, Ω, W, kWh",
        ],
      },
      "acids-bases-salts": {
        name: "Acids, Bases and Salts",
        difficulty: 5,
        expectedHours: 10,
        marksWeightage: 7,
        conceptDensity: 6,
        memorizationLoad: 5,
        problemSolvingLoad: 6,
        majorTopics: [
          {
            name: "Understanding Acids, Bases, and Salts",
            subtopics: [
              "Acid definition: sour taste, turns blue litmus red, H+ ions in solution",
              "Base definition: bitter taste, turns red litmus blue, OH- ions, slippery",
              "Salt definition: compound from acid + base neutralization, neutral/acidic/basic",
              "Examples: HCl (acid), NaOH (base), NaCl (salt), CH3COOH (weak acid)",
              "pH scale: 0-14, pH < 7 is acidic, pH = 7 is neutral, pH > 7 is basic",
            ],
            timeMinutes: 60,
            importance: 9,
            difficulty: 2,
            formulasCount: 0,
            diagramsCount: 3,
          },
          {
            name: "Strong and Weak Acids & Bases",
            subtopics: [
              "Strong acids: HCl, HNO3, H2SO4 (fully dissociate, ionize 100%)",
              "Weak acids: CH3COOH, HF (partially dissociate, ionize < 100%)",
              "Strong bases: NaOH, KOH, Ca(OH)2 (fully dissociate)",
              "Weak bases: NH3 solution, Mg(OH)2 (partially dissociate)",
              "Concentration vs strength: strong/weak = degree of dissociation, concentrated/dilute = amount dissolved",
            ],
            timeMinutes: 75,
            importance: 9,
            difficulty: 3,
            formulasCount: 0,
            diagramsCount: 2,
          },
          {
            name: "Neutralization & Salt Formation",
            subtopics: [
              "Neutralization: acid + base → salt + water (exothermic)",
              "HCl + NaOH → NaCl + H2O (stoichiometry: mole ratios)",
              "Not all salts are neutral: NaCl is neutral, CH3COONa is basic, NH4Cl is acidic",
              "Titration: process to find concentration of unknown acid/base",
              "Indicator: phenolphthalein changes color at specific pH",
            ],
            timeMinutes: 90,
            importance: 10,
            difficulty: 4,
            formulasCount: 1,
            diagramsCount: 4,
          },
          {
            name: "Properties of Acids & Bases",
            subtopics: [
              "Acids: conduct electricity (ionic), react with metals (M + H+ → salt + H2)",
              "Bases: conduct electricity, feel slippery, react with CO2 and oils",
              "Metals + dilute acid: reaction produces H2 gas (Zn + HCl, Fe + HCl, Mg + HCl)",
              "Non-metals usually don't react with acids or bases (except F, Cl in special cases)",
              "Indicators test pH: litmus, methyl orange, phenolphthalein",
            ],
            timeMinutes: 80,
            importance: 8,
            difficulty: 3,
            formulasCount: 2,
            diagramsCount: 3,
          },
          {
            name: "Salts & pH (Hydrolysis)",
            subtopics: [
              "Salt of strong acid + strong base = neutral (NaCl, KNO3)",
              "Salt of weak acid + strong base = basic (CH3COONa, K2CO3)",
              "Salt of strong acid + weak base = acidic (NH4Cl, Al(NO3)3)",
              "Hydrolysis: salt reacts with water to produce H+ or OH-",
              "Common salts: NaCl (table salt), CuSO4 (blue color), FeSO4 (green), K2Cr2O7 (orange)",
            ],
            timeMinutes: 75,
            importance: 7,
            difficulty: 4,
            formulasCount: 1,
            diagramsCount: 2,
          },
        ],
        formulas: [
          {
            name: "Neutralization Equation",
            formula: "Acid + Base → Salt + Water (general form)",
            whenToUse: "Any acid-base reaction, e.g., HCl + NaOH → NaCl + H2O",
            commonMistakes: ["Writing products wrong", "Forgetting water", "Wrong coefficients"],
          },
          {
            name: "pH Formula",
            formula: "pH = -log[H+] or [H+] = 10^-pH",
            whenToUse: "Converting between H+ concentration and pH value",
            commonMistakes: ["Wrong sign in calculation", "Confusing H+ with OH-"],
          },
        ],
        commonMistakes: [
          "Mixing up acid and base properties (acids sour vs bases bitter)",
          "Thinking all salts are neutral (many are acidic or basic due to hydrolysis)",
          "Wrong products in neutralization (forgetting water, wrong salt)",
          "Confusing strong/weak with concentrated/dilute (different concepts)",
          "Wrong number of H+ or OH- ions from acids/bases (HCl gives 1 H+, H2SO4 gives 2 H+)",
          "pH scale error: pH 3 is 10x more acidic than pH 4, not just 1x more",
        ],
        previousYearTrends: [
          { topic: "Acid-base definitions and properties", frequency: "high", marksRange: "2-3" },
          { topic: "Neutralization reactions and writing products", frequency: "high", marksRange: "2-3" },
          { topic: "pH scale and H+ concentration", frequency: "high", marksRange: "1-2" },
          { topic: "Metal + acid reactions", frequency: "medium", marksRange: "1-2" },
          { topic: "Salt hydrolysis and pH prediction", frequency: "medium", marksRange: "1-2" },
          { topic: "Titration calculations", frequency: "medium", marksRange: "2-3" },
        ],
        flashcardQuestions: [
          "Define acid, base, and salt with examples.",
          "What's the difference between strong and weak acids? Give examples of each.",
          "Write & balance: HCl + NaOH → ?",
          "Write & balance: H2SO4 + Ca(OH)2 → ?",
          "Complete: Zn + HCl → ? Balance it. What gas is produced?",
          "Is NaCl neutral, acidic, or basic? Why?",
          "Is NH4Cl neutral, acidic, or basic? Why (hydrolysis)?",
          "If pH = 3, what is [H+]? Is it acidic or basic?",
          "Name 3 strong acids and 3 weak acids with formulas.",
          "Metal + dilute acid reaction: what are the general products?",
        ],
        selfTestQuestions: [
          "Classify 15 compounds as acid, base, salt, or other",
          "Balance 8 neutralization reactions (strong + strong, strong + weak, weak + strong)",
          "Solve 5 pH/H+ concentration problems",
          "Predict whether 10 salts are acidic, basic, or neutral (with hydrolysis reasoning)",
          "Complete & balance: Mg + H2SO4, Fe + HCl, Cu + HCl (predict whether each reacts)",
          "NCERT Exercise 2.1 and 2.2 all questions",
          "Solve previous year titration problems (mole calculations)",
          "Explain why CH3COONa is basic but NaCl is neutral (write hydrolysis equations)",
          "Lab simulation: predict color change when phenolphthalein added to different solutions",
          "Create a pH scale chart with 10 common household substances",
        ],
        mustKnowTopics: [
          "Acid, base, salt definitions and key properties (sour, bitter, neutral)",
          "Strong vs weak acids/bases with examples (HCl, CH3COOH, NaOH, NH3)",
          "Neutralization: acid + base → salt + water (write balanced equations)",
          "Metal + dilute acid reactions (Zn, Fe, Mg with HCl, H2SO4)",
          "pH scale: 0-14, <7 acidic, =7 neutral, >7 basic",
        ],
        shouldKnowTopics: [
          "Salt hydrolysis concepts (why some salts are acidic/basic)",
          "Conductivity differences (strong vs weak)",
          "pH calculations from [H+] concentration",
          "Indicators and color changes (litmus, phenolphthalein)",
          "Titration method and calculations",
        ],
        niceToKnowTopics: [
          "Buffer solutions",
          "Amphoteric substances",
          "Complex salts",
          "Industrial acid/base reactions",
        ],
        revisionPoints: [
          "Acid = H+ donor, Base = OH- provider or H+ acceptor",
          "Neutralization is exothermic: acid + base releases heat",
          "pH + pOH = 14 (pH 3 → pOH 11)",
          "Salt type depends on acid + base strength: strong+strong=neutral",
          "Always balance: check atom count before and after",
        ],
      },
    },
  },
};

export function useChapterContentDatabase() {
  const getChapterContent = (board: string, classGrade: string, chapter: string): ChapterContent | null => {
    const boardKey = board.toLowerCase();
    const boardData = CHAPTER_DATABASE[boardKey];
    if (!boardData) return null;

    const gradeData = boardData[classGrade];
    if (!gradeData) return null;

    // Try exact match first
    const chapterKey = chapter.toLowerCase().replace(/\s+/g, "-");
    
    for (const [dbKey, content] of Object.entries(gradeData)) {
      if (
        chapterKey.includes(dbKey.replace(/-/g, "")) ||
        dbKey.includes(chapterKey.replace(/-/g, ""))
      ) {
        return content;
      }
    }

    return null;
  };

  return {
    getChapterContent,
  };
}
