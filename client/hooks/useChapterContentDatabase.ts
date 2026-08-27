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
      "real-numbers": {
        name: "Real Numbers",
        difficulty: 5,
        expectedHours: 6,
        marksWeightage: 6,
        conceptDensity: 6,
        memorizationLoad: 4,
        problemSolvingLoad: 7,
        majorTopics: [
          {
            name: "Fundamental Theorem of Arithmetic",
            subtopics: [
              "Prime factorization of composite numbers (n = p1^a1 · p2^a2...)",
              "HCF and LCM using prime factors",
              "Formula: HCF(a,b) × LCM(a,b) = a × b",
              "Applications in word problems (bells ringing together, circular tracks)",
            ],
            timeMinutes: 45,
            importance: 10,
            difficulty: 4,
            formulasCount: 2,
            diagramsCount: 0,
          },
          {
            name: "Proof of Irrationality",
            subtopics: [
              "Proof by contradiction technique",
              "Proving √2, √3, √5 are irrational line-by-line",
              "Proving composite expressions like 3 + 2√5 or 1/√2 are irrational",
              "Theorem: If p divides a², then p divides a (where p is prime)",
            ],
            timeMinutes: 60,
            importance: 10,
            difficulty: 6,
            formulasCount: 0,
            diagramsCount: 0,
          },
          {
            name: "Decimal Expansions of Rational Numbers",
            subtopics: [
              "Terminating vs Non-terminating repeating decimals",
              "Condition for terminating decimal: denominator q = 2^m · 5^n",
              "Converting recurring decimals to p/q form",
            ],
            timeMinutes: 30,
            importance: 8,
            difficulty: 3,
            formulasCount: 1,
            diagramsCount: 0,
          },
        ],
        formulas: [
          {
            name: "HCF-LCM Relationship",
            formula: "HCF(a, b) × LCM(a, b) = a × b",
            whenToUse: "Finding LCM or HCF when two numbers and one value are given",
            commonMistakes: [
              "Applying this formula for 3 numbers (valid ONLY for 2 numbers)",
              "Arithmetic error while calculating prime powers",
            ],
          },
          {
            name: "Prime Factorization Form",
            formula: "N = p1^a1 × p2^a2 × ... × pk^ak",
            whenToUse: "Determining HCF (lowest power of common prime) and LCM (highest power of all prime factors)",
            commonMistakes: ["Missing a prime factor or taking incorrect powers"],
          },
        ],
        commonMistakes: [
          "Assuming HCF × LCM = a × b × c for three numbers (it only works for two numbers)",
          "Forgetting to state that p and q are co-prime (HCF = 1) in irrationality proofs",
          "Confusing terminating denominator condition q = 2^m · 5^n with numerator factors",
        ],
        previousYearTrends: [
          { topic: "Prove √3 or 5 - √2 is irrational (3 marks)", frequency: "high", marksRange: "3" },
          { topic: "Find HCF and LCM using prime factorization & verify HCF × LCM = a × b", frequency: "high", marksRange: "2-3" },
          { topic: "Word problem on HCF/LCM (4 marks)", frequency: "medium", marksRange: "4" },
        ],
        flashcardQuestions: [
          "State the Fundamental Theorem of Arithmetic",
          "Write the formula connecting HCF, LCM, and two numbers a and b",
          "What is the condition on the denominator of a rational number p/q for its decimal expansion to terminate?",
          "If HCF(306, 657) = 9, find LCM(306, 657)",
        ],
        selfTestQuestions: [
          "Prove that √5 is irrational using contradiction method",
          "Find the HCF and LCM of 96 and 404 by prime factorisation method and verify HCF × LCM = Product of numbers",
          "Check whether 6^n can end with the digit 0 for any natural number n",
        ],
        mustKnowTopics: [
          "HCF(a,b) × LCM(a,b) = a × b",
          "Line-by-line proof that √2, √3, or √5 is irrational",
          "Prime factorisation method for HCF and LCM",
        ],
        shouldKnowTopics: [
          "Proving 3 + 2√5 is irrational",
          "q = 2^m · 5^n terminating decimal test",
        ],
        niceToKnowTopics: ["Euclid's Division Lemma (historical context)"],
        revisionPoints: [
          "HCF = product of smallest power of each common prime factor",
          "LCM = product of greatest power of each prime factor involved",
          "In irrationality proof, always write: 'Let √p = a/b where a,b are co-prime integers, b ≠ 0'",
        ],
      },
      "arithmetic-progressions": {
        name: "Arithmetic Progressions",
        difficulty: 6,
        expectedHours: 8,
        marksWeightage: 7,
        conceptDensity: 7,
        memorizationLoad: 5,
        problemSolvingLoad: 8,
        majorTopics: [
          {
            name: "nth Term of an AP",
            subtopics: [
              "Definition of AP: sequence where difference d between consecutive terms is constant",
              "Formula: a_n = a + (n-1)d",
              "Finding nth term from the end: a_n(end) = l - (n-1)d",
              "Checking whether a given sequence or number is in the AP",
            ],
            timeMinutes: 60,
            importance: 10,
            difficulty: 5,
            formulasCount: 2,
            diagramsCount: 0,
          },
          {
            name: "Sum of First n Terms of an AP",
            subtopics: [
              "Formula 1: S_n = (n/2) · [2a + (n-1)d]",
              "Formula 2: S_n = (n/2) · [a + l] (when last term l is known)",
              "Relation between S_n and a_n: a_n = S_n - S_{n-1}",
              "Sum of first n positive integers: S_n = n(n+1)/2",
            ],
            timeMinutes: 90,
            importance: 10,
            difficulty: 6,
            formulasCount: 3,
            diagramsCount: 0,
          },
          {
            name: "Real-Life AP Word Problems",
            subtopics: [
              "Savings/installment schemes",
              "Seating arrangements & ladder rung spacing",
              "Sum of series in practical contexts",
            ],
            timeMinutes: 60,
            importance: 8,
            difficulty: 6,
            formulasCount: 1,
            diagramsCount: 0,
          },
        ],
        formulas: [
          {
            name: "nth Term Formula",
            formula: "a_n = a + (n - 1)d",
            whenToUse: "Finding any term value, term index n, first term a, or common difference d",
            commonMistakes: [
              "Confusing term index n with term value a_n",
              "Taking common difference d as positive when terms are decreasing",
            ],
          },
          {
            name: "Sum of n Terms Formula",
            formula: "S_n = (n/2) × [2a + (n - 1)d]  OR  S_n = (n/2) × (a + l)",
            whenToUse: "Calculating sum of AP series or solving total sum word problems",
            commonMistakes: [
              "Forgetting the factor 1/2 in n/2",
              "Misidentifying last term l vs common difference d",
            ],
          },
          {
            name: "Term from Sum Relation",
            formula: "a_n = S_n - S_{n-1}",
            whenToUse: "Finding individual terms when S_n expression in terms of n is given",
            commonMistakes: ["Algebraic simplification error while evaluating S_{n-1}"],
          },
        ],
        commonMistakes: [
          "Writing common difference d with wrong sign when sequence is decreasing (d < 0)",
          "Confusing n (position of term, must be a positive integer) with a_n (value of term)",
          "Errors when calculating a_n = S_n - S_{n-1} due to unexpanded brackets",
        ],
        previousYearTrends: [
          { topic: "Find term index or common difference d given two terms (3 marks)", frequency: "high", marksRange: "3" },
          { topic: "Sum of AP word problems (4-5 marks)", frequency: "high", marksRange: "4-5" },
          { topic: "If S_n is given, find a_n and 20th term (3 marks)", frequency: "medium", marksRange: "3" },
        ],
        flashcardQuestions: [
          "What is the general term a_n of an AP with first term a and common difference d?",
          "Write the two formulas for the sum of first n terms of an AP",
          "How do you find the nth term a_n if the sum formula S_n is given?",
          "What is the sum of first n natural numbers?",
        ],
        selfTestQuestions: [
          "Find the 20th term from the end of the AP: 3, 8, 13, ..., 253",
          "The sum of the 4th and 8th terms of an AP is 24 and the sum of the 6th and 10th terms is 44. Find the first three terms of the AP",
          "If S_n = 3n² + 5n, find the 16th term of this AP",
        ],
        mustKnowTopics: [
          "a_n = a + (n-1)d formula and applications",
          "S_n = (n/2)[2a + (n-1)d] and S_n = (n/2)(a + l)",
          "a_n = S_n - S_{n-1} relationship",
        ],
        shouldKnowTopics: [
          "nth term from the end: l - (n-1)d",
          "Word problems on AP sums",
        ],
        niceToKnowTopics: ["Selection of 3 terms in AP (a-d, a, a+d)"],
        revisionPoints: [
          "Common difference d = a2 - a1 = a3 - a2",
          "Number of terms n must ALWAYS be a positive integer (1, 2, 3...)",
          "If 3 numbers a, b, c are in AP, then 2b = a + c",
        ],
      },
      "quadratic-equations": {
        name: "Quadratic Equations",
        difficulty: 7,
        expectedHours: 8,
        marksWeightage: 8,
        conceptDensity: 8,
        memorizationLoad: 5,
        problemSolvingLoad: 9,
        majorTopics: [
          {
            name: "Standard Form & Factorization",
            subtopics: [
              "Standard form: ax² + bx + c = 0 (a ≠ 0)",
              "Solving by splitting the middle term",
              "Verifying roots by substitution",
            ],
            timeMinutes: 45,
            importance: 9,
            difficulty: 5,
            formulasCount: 1,
            diagramsCount: 0,
          },
          {
            name: "Quadratic Formula & Discriminant",
            subtopics: [
              "Discriminant formula: D = b² - 4ac",
              "Quadratic formula: x = (-b ± √D) / (2a)",
              "Nature of roots: D > 0 (2 distinct real roots), D = 0 (2 equal real roots), D < 0 (no real roots)",
            ],
            timeMinutes: 75,
            importance: 10,
            difficulty: 6,
            formulasCount: 3,
            diagramsCount: 0,
          },
          {
            name: "Exam Word Problems",
            subtopics: [
              "Speed, distance & time (train/boat upstream & downstream)",
              "Work & time (water taps filling tank)",
              "Age & geometric area problems",
            ],
            timeMinutes: 90,
            importance: 10,
            difficulty: 8,
            formulasCount: 1,
            diagramsCount: 0,
          },
        ],
        formulas: [
          {
            name: "Discriminant Formula",
            formula: "D = b² - 4ac",
            whenToUse: "Determining nature of roots or finding unknown constant k when roots are equal (D=0)",
            commonMistakes: ["Errors in signs when b or c is negative (e.g. (-4)² vs -4²)"],
          },
          {
            name: "Quadratic Formula",
            formula: "x = (-b ± √(b² - 4ac)) / (2a)",
            whenToUse: "Finding roots directly for any quadratic equation ax² + bx + c = 0",
            commonMistakes: ["Dividing only √D by 2a instead of (-b ± √D)", "Forgetting negative sign of -b"],
          },
        ],
        commonMistakes: [
          "Writing b² - 4ac incorrectly when b is negative e.g. -3² instead of (-3)² = +9",
          "Forgetting to reject negative values of speed, age, or distance in word problems",
          "Dividing by 2a incompletely in x = (-b ± √D)/(2a)",
        ],
        previousYearTrends: [
          { topic: "Find value of k for which equation has equal roots (D=0) (2-3 marks)", frequency: "high", marksRange: "2-3" },
          { topic: "Upstream/Downstream boat or Train speed word problem (4-5 marks)", frequency: "high", marksRange: "4-5" },
          { topic: "Solve quadratic equation using quadratic formula (3 marks)", frequency: "high", marksRange: "3" },
        ],
        flashcardQuestions: [
          "What is the standard form of a quadratic equation?",
          "Write the quadratic formula for finding roots of ax² + bx + c = 0",
          "What are the three conditions for nature of roots based on discriminant D?",
        ],
        selfTestQuestions: [
          "Find the value of k for which equation 2x² + kx + 3 = 0 has two equal real roots",
          "A motor boat whose speed is 18 km/h in still water takes 1 hour more to go 24 km upstream than to return downstream. Find speed of stream",
          "Solve for x: 1/(x-1) - 1/(x+5) = 1/6",
        ],
        mustKnowTopics: [
          "Discriminant D = b² - 4ac and nature of roots rules",
          "Quadratic formula x = (-b ± √D)/2a",
          "Equal roots condition D = 0",
        ],
        shouldKnowTopics: ["Upstream & Downstream speed equations", "Splitting middle term"],
        niceToKnowTopics: ["Completing the square derivation history"],
        revisionPoints: [
          "D > 0 → 2 distinct real roots; D = 0 → 2 equal real roots x = -b/2a; D < 0 → no real roots",
          "In speed-time word problems: Upstream speed = (x - y), Downstream speed = (x + y)",
        ],
      },
      "introduction-to-trigonometry": {
        name: "Introduction to Trigonometry",
        difficulty: 8,
        expectedHours: 10,
        marksWeightage: 8,
        conceptDensity: 9,
        memorizationLoad: 7,
        problemSolvingLoad: 9,
        majorTopics: [
          {
            name: "Trigonometric Ratios & Table Values",
            subtopics: [
              "Ratios: sinθ = P/H, cosθ = B/H, tanθ = P/B, cosecθ = H/P, secθ = H/B, cotθ = B/P",
              "Standard angle table: 0°, 30°, 45°, 60°, 90°",
              "Reciprocal relations: tanθ = sinθ/cosθ, cotθ = cosθ/sinθ",
            ],
            timeMinutes: 60,
            importance: 10,
            difficulty: 5,
            formulasCount: 6,
            diagramsCount: 2,
          },
          {
            name: "Trigonometric Identities",
            subtopics: [
              "Identity 1: sin²θ + cos²θ = 1",
              "Identity 2: 1 + tan²θ = sec²θ",
              "Identity 3: 1 + cot²θ = cosec²θ",
              "Proving trigonometric identities step-by-step",
            ],
            timeMinutes: 120,
            importance: 10,
            difficulty: 8,
            formulasCount: 3,
            diagramsCount: 0,
          },
        ],
        formulas: [
          {
            name: "Fundamental Identity 1",
            formula: "sin²θ + cos²θ = 1",
            whenToUse: "Converting between sinθ and cosθ or simplifying expressions",
            commonMistakes: ["Writing sin²θ + cos²θ = 2 or confusing with sinθ + cosθ"],
          },
          {
            name: "Fundamental Identity 2",
            formula: "1 + tan²θ = sec²θ  (or sec²θ - tan²θ = 1)",
            whenToUse: "Simplifying secθ and tanθ expressions and proving identities",
            commonMistakes: ["Mixing up sec²θ - tan²θ = 1 with tan²θ - sec²θ = 1"],
          },
          {
            name: "Fundamental Identity 3",
            formula: "1 + cot²θ = cosec²θ  (or cosec²θ - cot²θ = 1)",
            whenToUse: "Simplifying cosecθ and cotθ terms",
            commonMistakes: ["Sign errors when transposing cot²θ"],
          },
        ],
        commonMistakes: [
          "Confusing Perpendicular and Base depending on which acute angle θ is chosen",
          "Writing sin(A+B) = sinA + sinB (trigonometric functions do NOT distribute)",
          "Errors in substituting exact values from the 0°-90° table e.g. sin 60° = √3/2 vs tan 30° = 1/√3",
        ],
        previousYearTrends: [
          { topic: "Prove trigonometric identity (4-5 marks)", frequency: "high", marksRange: "4-5" },
          { topic: "Evaluate expression using standard angle table values (2-3 marks)", frequency: "high", marksRange: "2-3" },
          { topic: "Given one ratio e.g. sin A = 3/4, find other ratios (2 marks)", frequency: "medium", marksRange: "2" },
        ],
        flashcardQuestions: [
          "State the three primary trigonometric identities",
          "What are the values of sin 30°, cos 30°, sin 45°, and tan 60°?",
          "What is the reciprocal of tan θ?",
        ],
        selfTestQuestions: [
          "Prove that (sin A + cosec A)² + (cos A + sec A)² = 7 + tan² A + cot² A",
          "Prove that (1 + tan θ + sec θ)(1 + cot θ - cosec θ) = 2",
          "If 15 cot A = 8, find sin A and sec A",
        ],
        mustKnowTopics: [
          "sin²θ + cos²θ = 1, 1 + tan²θ = sec²θ, 1 + cot²θ = cosec²θ",
          "Standard angle values (0°, 30°, 45°, 60°, 90°)",
          "Step-by-step proofs of identities converting LHS to sin and cos",
        ],
        shouldKnowTopics: ["Right triangle ratio definitions P/H, B/H, P/B"],
        niceToKnowTopics: ["Historical origins of sine and cosine"],
        revisionPoints: [
          "When stuck in identity proofs: convert everything to sin θ and cos θ",
          "Table trick: sin values are √(0/4), √(1/4), √(2/4), √(3/4), √(4/4) → 0, 1/2, 1/√2, √3/2, 1",
        ],
      },
      "light-reflection-refraction": {
        name: "Light: Reflection and Refraction",
        difficulty: 6,
        expectedHours: 10,
        marksWeightage: 8,
        conceptDensity: 7,
        memorizationLoad: 4,
        problemSolvingLoad: 8,
        majorTopics: [
          {
            name: "Spherical Mirrors & Mirror Formula",
            subtopics: [
              "Concave vs Convex mirrors & 6 image formation cases",
              "Cartesian sign convention (u is always negative)",
              "Mirror formula: 1/f = 1/v + 1/u",
              "Magnification: m = -v/u = h'/h",
            ],
            timeMinutes: 90,
            importance: 10,
            difficulty: 6,
            formulasCount: 2,
            diagramsCount: 12,
          },
          {
            name: "Refraction & Lens Formula",
            subtopics: [
              "Laws of refraction & Snell's law: n1 sin θ1 = n2 sin θ2",
              "Refractive index: n = c / v",
              "Lens formula: 1/f = 1/v - 1/u",
              "Magnification: m = +v/u = h'/h",
              "Power of lens: P = 1/f (in meters, dioptres D)",
            ],
            timeMinutes: 120,
            importance: 10,
            difficulty: 7,
            formulasCount: 4,
            diagramsCount: 15,
          },
        ],
        formulas: [
          {
            name: "Mirror Formula",
            formula: "1/f = 1/v + 1/u",
            whenToUse: "Calculating focal length f, image distance v, or object distance u for spherical mirrors",
            commonMistakes: [
              "Forgetting sign convention (u is always negative; f is negative for concave, positive for convex)",
            ],
          },
          {
            name: "Lens Formula",
            formula: "1/f = 1/v - 1/u",
            whenToUse: "Calculating v, u, or f for convex/concave lenses",
            commonMistakes: [
              "Confusing minus sign in lens formula (1/v - 1/u) with plus sign in mirror formula (1/v + 1/u)",
            ],
          },
          {
            name: "Power of Lens Formula",
            formula: "P = 1 / f (f in meters)",
            whenToUse: "Finding power in Dioptres (D) or focal length from power",
            commonMistakes: ["Substituting focal length f in cm instead of meters"],
          },
        ],
        commonMistakes: [
          "Substituting f in cm directly into P = 1/f without converting to meters",
          "Mixing up magnification signs: negative m = real & inverted, positive m = virtual & erect",
          "Confusing lens formula (1/f = 1/v - 1/u) with mirror formula (1/f = 1/v + 1/u)",
        ],
        previousYearTrends: [
          { topic: "Lens / Mirror numerical with ray diagram (5 marks)", frequency: "high", marksRange: "5" },
          { topic: "Power of combination of lenses (2-3 marks)", frequency: "high", marksRange: "2-3" },
          { topic: "Refractive index & Snell's law numericals (3 marks)", frequency: "medium", marksRange: "3" },
        ],
        flashcardQuestions: [
          "Write the Mirror Formula and Lens Formula side by side",
          "What is the sign of focal length f for a concave mirror and a convex lens?",
          "Define 1 Dioptre of power of a lens",
        ],
        selfTestQuestions: [
          "A concave mirror produces three times magnified real image of an object placed at 10 cm in front of it. Where is the image located?",
          "A convex lens forms a real and inverted image of a needle at a distance of 50 cm from it. Where is the needle placed if image size equals object size? Find power of lens",
          "Find the focal length of a lens of power -2.0 D. What type of lens is this?",
        ],
        mustKnowTopics: [
          "Mirror Formula: 1/f = 1/v + 1/u",
          "Lens Formula: 1/f = 1/v - 1/u",
          "Power P = 1/f(m) and dioptre unit",
          "Ray diagrams for concave mirror & convex lens",
        ],
        shouldKnowTopics: ["Snell's Law n1 sin θ1 = n2 sin θ2", "Refractive Index n = c/v"],
        niceToKnowTopics: ["Atmospheric refraction effects"],
        revisionPoints: [
          "Object distance u is ALWAYS negative (-u)",
          "Real image → v is positive for lens, v is negative for mirror",
          "P = P1 + P2 + P3 for lenses in contact",
        ],
      },
      "chemical-reactions-and-equations": {
        name: "Chemical Reactions and Equations",
        difficulty: 5,
        expectedHours: 6,
        marksWeightage: 6,
        conceptDensity: 6,
        memorizationLoad: 6,
        problemSolvingLoad: 5,
        majorTopics: [
          {
            name: "Types of Chemical Reactions",
            subtopics: [
              "Combination: A + B → AB (e.g. CaO + H2O → Ca(OH)2 + heat)",
              "Decomposition: AB → A + B (Thermal, Electrolytic, Photolytic: 2AgCl → 2Ag + Cl2)",
              "Displacement: A + BC → AC + B (Fe + CuSO4 → FeSO4 + Cu)",
              "Double Displacement & Precipitation: AB + CD → AD + CB",
              "Redox Reactions: Oxidation (gain of O / loss of H) & Reduction (loss of O / gain of H)",
            ],
            timeMinutes: 90,
            importance: 10,
            difficulty: 5,
            formulasCount: 0,
            diagramsCount: 3,
          },
          {
            name: "Balancing & Effects of Oxidation",
            subtopics: [
              "Law of Conservation of Mass in balancing equations",
              "Corrosion of metals (rusting of iron: Fe2O3·xH2O)",
              "Rancidity of fats/oils & prevention methods (nitrogen gas flushing)",
            ],
            timeMinutes: 45,
            importance: 8,
            difficulty: 4,
            formulasCount: 0,
            diagramsCount: 0,
          },
        ],
        formulas: [],
        commonMistakes: [
          "Forgetting state symbols (s, l, g, aq) in balanced chemical equations",
          "Confusing oxidizing agent (substance that gets reduced) with reducing agent",
          "Misidentifying color changes in displacement reactions (blue CuSO4 turns pale green FeSO4)",
        ],
        previousYearTrends: [
          { topic: "Balance chemical equation & identify type of reaction (3 marks)", frequency: "high", marksRange: "3" },
          { topic: "Identify oxidized/reduced substance & oxidizing/reducing agent in redox reaction (3 marks)", frequency: "high", marksRange: "3" },
          { topic: "Decomposition reaction activities e.g. Pb(NO3)2 heating or electrolysis of water (3-4 marks)", frequency: "high", marksRange: "3-4" },
        ],
        flashcardQuestions: [
          "What is a redox reaction? Give one example",
          "Why is respiration considered an exothermic reaction?",
          "What happens when lead nitrate Pb(NO3)2 is heated? Write balanced equation",
        ],
        selfTestQuestions: [
          "Write balanced chemical equations with state symbols: (a) Thermite reaction, (b) Heating ferrous sulphate crystals",
          "Identify oxidizing and reducing agents in: CuO + H2 → Cu + H2O",
          "Explain rancidity and list 2 ways to prevent it in food items",
        ],
        mustKnowTopics: [
          "Decomposition of Pb(NO3)2 (brown fumes of NO2)",
          "Redox identification: substance oxidized, reduced, oxidizing agent",
          "Electrolysis of water (H2 at cathode : O2 at anode in 2:1 volume ratio)",
        ],
        shouldKnowTopics: ["Exothermic vs Endothermic reactions", "Displacement reactivity series"],
        niceToKnowTopics: ["Corrosion prevention plating"],
        revisionPoints: [
          "Oxidation = Gain of O2 / Loss of H2",
          "Oxidizing Agent = Substance that supplies O2 or removes H2 (itself gets reduced)",
          "Brown fumes in heating lead nitrate = Nitrogen dioxide (NO2)",
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
    if (!chapter) return null;

    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, "");
    const targetKey = normalize(chapter);

    // 1. Try exact board & grade
    const boardKey = board.toLowerCase();
    const boardData = CHAPTER_DATABASE[boardKey] || CHAPTER_DATABASE["cbse"];
    if (boardData) {
      const gradeData = boardData[classGrade] || boardData["10th"];
      if (gradeData) {
        for (const [dbKey, content] of Object.entries(gradeData)) {
          const normDbKey = normalize(dbKey);
          const normContentName = normalize(content.name);
          if (
            normDbKey.includes(targetKey) ||
            targetKey.includes(normDbKey) ||
            normContentName.includes(targetKey) ||
            targetKey.includes(normContentName)
          ) {
            return content;
          }
        }
      }
    }

    // 2. Global search across all database entries if grade match fails
    for (const bKey of Object.keys(CHAPTER_DATABASE)) {
      const bObj = CHAPTER_DATABASE[bKey];
      for (const gKey of Object.keys(bObj)) {
        const gObj = bObj[gKey];
        for (const [dbKey, content] of Object.entries(gObj)) {
          const normDbKey = normalize(dbKey);
          const normContentName = normalize(content.name);
          if (
            normDbKey.includes(targetKey) ||
            targetKey.includes(normDbKey) ||
            normContentName.includes(targetKey) ||
            targetKey.includes(normContentName)
          ) {
            return content;
          }
        }
      }
    }

    return null;
  };

  return {
    getChapterContent,
  };
}
