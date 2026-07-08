export interface Subject {
  name: string;
  chapters: string[];
}

export interface Board {
  [key: string]: Subject[]; // grade -> subjects
}

// Comprehensive syllabus database for CBSE, ICSE, and State boards
export const SYLLABUS_DATABASE: Record<string, Board> = {
  cbse: {
    "6th": [
      {
        name: "Mathematics",
        chapters: [
          "Knowing Our Numbers",
          "Whole Numbers",
          "Playing with Numbers",
          "Basic Geometrical Ideas",
          "Understanding Elementary Shapes",
          "Integers",
          "Fractions",
          "Decimals",
          "Data Handling",
          "Mensuration",
          "Algebra",
          "Ratio and Proportion",
          "Symmetry",
          "Practical Geometry",
        ],
      },
      {
        name: "Science",
        chapters: [
          "Food: Where Does It Come From?",
          "Components of Food",
          "Fibre to Fabric",
          "Sorting Materials into Groups",
          "Separation of Substances",
          "Changes Around Us",
          "Getting to Know Plants",
          "Body Movements",
          "The Living Organisms and Their Surroundings",
          "Motion and Measurement of Distances",
          "Lights, Shadows and Reflections",
          "Electricity and Circuits",
          "Fun with Magnets",
          "Water",
          "Air Around Us",
        ],
      },
      {
        name: "English",
        chapters: [
          "A Tale of Two Birds",
          "The Friendly Mongoose",
          "The Shepherd's Treasure",
          "The Old-Clock Shop",
          "Tansen",
          "The Monkey and the Crocodile",
          "The Wonderful Stone",
          "A Pact with the Sun",
        ],
      },
      {
        name: "Social Studies",
        chapters: [
          "The Earth in the Solar System",
          "Globe: Latitudes and Longitudes",
          "Motions of the Earth",
          "Maps",
          "Major Domains of the Earth",
          "Major Landforms of the Earth",
          "Our Country: India",
          "India: Climate, Vegetation and Wildlife",
          "Life in the Deserts",
          "Life in the Forests",
          "Life in the Grasslands",
          "Earliest Societies",
          "Early Humans and the Stone Age",
          "The Vedic Period",
          "Janapadas, Mahajanapadas, and Empire",
        ],
      },
    ],
    "7th": [
      {
        name: "Mathematics",
        chapters: [
          "Integers",
          "Fractions and Decimals",
          "Data Handling",
          "Simple Equations",
          "Lines and Angles",
          "The Triangle and its Properties",
          "Comparing Quantities",
          "Rational Numbers",
          "Practical Geometry",
          "Perimeter and Area",
          "Algebraic Expressions",
          "Exponents and Powers",
          "Symmetry",
          "Visualising Solid Shapes",
        ],
      },
      {
        name: "Science",
        chapters: [
          "Nutrition in Plants",
          "Nutrition in Animals",
          "Fibre to Fabric",
          "Heat",
          "Acids, Bases and Salts",
          "Physical and Chemical Changes",
          "Weather, Climate and Adaptation of Animals to Climate",
          "Wind, Storms and Cyclones",
          "Soil",
          "Respiration in Organisms",
          "Transportation in Animals and Plants",
          "Reproduction in Plants",
          "Motion and Time",
          "Electric Current and its Effects",
          "Light",
          "Water: A Precious Resource",
          "Forests: Our Lifeline",
          "Wastewater Story",
        ],
      },
    ],
    "8th": [
      {
        name: "Mathematics",
        chapters: [
          "Rational Numbers",
          "Linear Equations in One Variable",
          "Understanding Quadrilaterals",
          "Practical Geometry",
          "Data Handling",
          "Squares and Square Roots",
          "Cubes and Cube Roots",
          "Comparing Quantities",
          "Algebraic Expressions and Identities",
          "Visualising Solid Shapes",
          "Mensuration",
          "Exponents and Powers",
          "Direct and Inverse Proportions",
          "Factorisation",
          "Introduction to Graphs",
          "Playing with Numbers",
        ],
      },
      {
        name: "Science",
        chapters: [
          "Crop Production and Management",
          "Microorganisms: Friend and Foe",
          "Synthetic Fibres and Plastics",
          "Metals and Non-metals",
          "Coal and Petroleum",
          "Combustion and Flame",
          "Conservation of Plants and Animals",
          "Cell: Structure and Functions",
          "Reproduction in Animals",
          "Reaching the Age of Adolescence",
          "Force and Pressure",
          "Friction",
          "Sound",
          "Chemical Effects of Electric Current",
          "Some Natural Phenomena",
          "Light",
          "Stars and the Solar System",
          "Pollution of Air and Water",
        ],
      },
    ],
    "9th": [
      {
        name: "Mathematics",
        chapters: [
          "Number Systems",
          "Polynomials",
          "Coordinate Geometry",
          "Linear Equations in Two Variables",
          "Introduction to Euclid's Geometry",
          "Lines and Angles",
          "Triangles",
          "Quadrilaterals",
          "Areas of Parallelograms and Triangles",
          "Circles",
          "Constructions",
          "Heron's Formula",
          "Surface Areas and Volumes",
          "Statistics",
          "Probability",
        ],
      },
      {
        name: "Science",
        chapters: [
          "Matter in Our Surroundings",
          "Is Matter Around Us Pure?",
          "Atoms and Molecules",
          "Structure of the Atom",
          "The Fundamental Unit of Life",
          "Tissues",
          "Diversity in Living Organisms",
          "Motion",
          "Force and Laws of Motion",
          "Gravitation",
          "Work and Energy",
          "Sound",
          "Why Do We Fall Ill?",
          "Natural Resources",
          "Improvement in Food Resources",
        ],
      },
    ],
    "10th": [
      {
        name: "Mathematics",
        chapters: [
          "Real Numbers",
          "Polynomials",
          "Pair of Linear Equations in Two Variables",
          "Quadratic Equations",
          "Arithmetic Progressions",
          "Triangles",
          "Coordinate Geometry",
          "Introduction to Trigonometry",
          "Some Applications of Trigonometry",
          "Circles",
          "Constructions",
          "Areas Related to Circles",
          "Surface Areas and Volumes",
          "Statistics",
          "Probability",
        ],
      },
      {
        name: "Science",
        chapters: [
          "Chemical Reactions and Equations",
          "Acids, Bases and Salts",
          "Metals and Non-metals",
          "Carbon and Its Compounds",
          "Periodic Classification of Elements",
          "Life Processes",
          "Control and Coordination",
          "How Do Organisms Reproduce?",
          "Heredity and Evolution",
          "Light Reflection and Refraction",
          "The Human Eye and the Colourful World",
          "Electricity",
          "Magnetic Effects of Electric Current",
          "Our Environment",
          "Management of Natural Resources",
        ],
      },
      {
        name: "English",
        chapters: [
          "First Flight - Prose",
          "First Flight - Poetry",
          "Footprints Without Feet",
        ],
      },
      {
        name: "Social Studies",
        chapters: [
          "The Rise of Nationalism in Europe",
          "Nationalism in India",
          "The Making of a Global World",
          "The Age of Industrialisation",
          "Print Culture and the Modern World",
          "Resources and Development",
          "Forest and Wildlife Resources",
          "Water Resources",
          "Agriculture",
          "Minerals and Energy Resources",
          "Manufacturing Industries",
          "Lifelines of National Economy",
          "Democratic Politics",
          "Powers of the Indian Parliament",
          "Executive",
          "Judiciary",
          "Social Justice and the Marginalised",
          "Political Parties",
          "Outcomes of Democracy",
          "Challenges to Democracy",
        ],
      },
    ],
    "11th": [
      {
        name: "Mathematics",
        chapters: [
          "Sets",
          "Relations and Functions",
          "Trigonometric Functions",
          "Principle of Mathematical Induction",
          "Complex Numbers and Quadratic Equations",
          "Linear Inequalities",
          "Permutations and Combinations",
          "Binomial Theorem",
          "Sequences and Series",
          "Straight Lines",
          "Conic Sections",
          "Introduction to Three-Dimensional Geometry",
          "Limits and Derivatives",
          "Mathematical Reasoning",
          "Statistics",
          "Probability",
        ],
      },
      {
        name: "Physics",
        chapters: [
          "Physical World",
          "Units and Measurements",
          "Motion in a Straight Line",
          "Motion in a Plane",
          "Laws of Motion",
          "Work, Energy and Power",
          "System of Particles and Rotational Motion",
          "Gravitation",
          "Mechanical Properties of Solids",
          "Mechanical Properties of Fluids",
          "Thermal Properties of Matter",
          "Thermodynamics",
          "Kinetic Theory",
          "Oscillations",
          "Waves",
        ],
      },
      {
        name: "Chemistry",
        chapters: [
          "Some Basic Concepts of Chemistry",
          "Structure of Atom",
          "Classification of Elements and Periodicity in Properties",
          "Chemical Bonding and Molecular Structure",
          "Thermodynamics",
          "Equilibrium",
          "Redox Reactions",
          "Hydrogen",
          "The s-Block Elements",
          "The p-Block Elements",
          "Organic Chemistry - Some Basic Principles and Techniques",
          "Hydrocarbons",
        ],
      },
      {
        name: "Biology",
        chapters: [
          "The Living World",
          "Biological Classification",
          "Plant Kingdom",
          "Animal Kingdom",
          "Morphology of Flowering Plants",
          "Anatomy of Flowering Plants",
          "Structural Organisation in Animals",
          "Cell: The Unit of Life",
          "Biomolecules",
          "Cell Division",
          "Plant Growth and Development",
          "Mineral Nutrition",
          "Photosynthesis in Higher Plants",
          "Respiration in Plants",
          "Plant Water Relations",
          "Transport in Plants",
          "Digestion and Absorption",
          "Breathing and Gas Exchange",
          "Body Fluids and Circulation",
          "Excretory Products and their Elimination",
          "Locomotion and Movement",
          "Neural Control and Coordination",
          "Chemical Coordination and Integration",
        ],
      },
    ],
    "12th": [
      {
        name: "Mathematics",
        chapters: [
          "Relations and Functions",
          "Inverse Trigonometric Functions",
          "Matrices",
          "Determinants",
          "Continuity and Differentiability",
          "Application of Derivatives",
          "Integrals",
          "Application of Integrals",
          "Differential Equations",
          "Vector Algebra",
          "Three Dimensional Geometry",
          "Linear Programming",
          "Probability",
        ],
      },
      {
        name: "Physics",
        chapters: [
          "Electric Charges and Fields",
          "Electrostatic Potential and Capacitance",
          "Current Electricity",
          "Moving Charges and Magnetism",
          "Magnetism and Matter",
          "Electromagnetic Induction",
          "Alternating Current",
          "Electromagnetic Waves",
          "Ray Optics and Optical Instruments",
          "Wave Optics",
          "Dual Nature of Radiation and Matter",
          "Atoms",
          "Nuclei",
          "Semiconductor Electronics: Materials, Devices and Simple Circuits",
          "Communication Systems",
        ],
      },
      {
        name: "Chemistry",
        chapters: [
          "Solid State",
          "Solutions",
          "Electrochemistry",
          "Chemical Kinetics",
          "Surface Chemistry",
          "General Principles and Processes of Isolation of Elements",
          "The p-Block Elements",
          "The d- and f-Block Elements",
          "Coordination Compounds",
          "Haloalkanes and Haloarenes",
          "Alcohols, Phenols and Ethers",
          "Aldehydes, Ketones and Carboxylic Acids",
          "Amines",
          "Biomolecules",
          "Polymers",
          "Chemistry in Everyday Life",
        ],
      },
      {
        name: "Biology",
        chapters: [
          "Reproduction in Organisms",
          "Sexual Reproduction in Flowering Plants",
          "Human Reproduction",
          "Reproductive Health",
          "Principles of Inheritance and Variation",
          "Molecular Basis of Inheritance",
          "Evolution",
          "Human Health and Disease",
          "Strategies for Enhancement in Food Production",
          "Microbes in Human Welfare",
          "Biotechnology: Principles and Processes",
          "Biotechnology and Its Applications",
          "Organisms and Populations",
          "Ecosystem",
          "Biodiversity and Conservation",
          "Environmental Issues",
        ],
      },
    ],
  },
  icse: {
    "10th": [
      {
        name: "Mathematics",
        chapters: [
          "Goods and Services Tax",
          "Banking",
          "Shares and Dividends",
          "Linear Inequations",
          "Quadratic Equations",
          "Arithmetic and Geometric Progressions",
          "Coordinate Geometry",
          "Trigonometric Ratios",
          "Trigonometric Identities",
          "Heights and Distances",
          "Circles",
          "Tangent and Secant",
          "Chords and Arcs",
          "Angle in a Semi-circle",
          "Cyclic Quadrilaterals",
          "Construction of Tangents to a Circle",
          "Mensuration",
          "Trigonometric Tables",
          "Probability",
          "Statistics",
        ],
      },
      {
        name: "Physics",
        chapters: [
          "Force, Work, Power and Energy",
          "Machines and Mechanical Advantage",
          "Pressure in Fluids and Atmospheric Pressure",
          "Refraction of Light",
          "Spectrum",
          "Sound",
          "Electricity and Magnetism",
          "Calorimetry",
          "Heat Transfer",
          "Modern Physics",
        ],
      },
      {
        name: "Chemistry",
        chapters: [
          "The Periodic Table",
          "Chemical Bonding and Molecular Structure",
          "Study of Acids, Bases and Salts",
          "Analytical Chemistry",
          "Mole Concept and Stoichiometry",
          "Electrolysis",
          "Metallurgy",
          "Study of Compounds - Hydrogen",
          "Study of Compounds - Oxygen",
          "Study of Compounds - Non-metals",
          "Study of Compounds - Metals",
          "Organic Chemistry",
        ],
      },
      {
        name: "Biology",
        chapters: [
          "Basic Biology",
          "Cell Biology",
          "Genetics",
          "Photosynthesis",
          "Respiration and Excretion",
          "Nervous System and Sense Organs",
          "Endocrine System",
          "Reproduction in Animals",
          "Structure and Function of Plants",
          "Vitamins",
          "Human Nutrition",
          "Digestion and Absorption",
          "The Circulatory System",
          "Immunity",
          "Disease and its Control",
          "Waste Management",
        ],
      },
    ],
  },
};

export function useSyllabusDatabase() {
  // Get all available boards
  const getBoards = (): string[] => {
    return Object.keys(SYLLABUS_DATABASE).map((board) => board.toUpperCase());
  };

  // Get all available classes for a given board
  const getClasses = (board: string): string[] => {
    const boardKey = board.toLowerCase();
    if (!SYLLABUS_DATABASE[boardKey]) return [];
    return Object.keys(SYLLABUS_DATABASE[boardKey]).sort((a, b) => {
      const aNum = parseInt(a);
      const bNum = parseInt(b);
      return aNum - bNum;
    });
  };

  // Get all subjects for a given board and class
  const getSubjects = (board: string, classGrade: string): string[] => {
    const boardKey = board.toLowerCase();
    const boardData = SYLLABUS_DATABASE[boardKey];
    if (!boardData) return [];

    const subjects = boardData[classGrade];
    if (!subjects) return [];

    return subjects.map((s) => s.name);
  };

  // Get chapters for a given board, class, and subject
  const getChapters = (board: string, classGrade: string, subject: string): string[] => {
    const boardKey = board.toLowerCase();
    const boardData = SYLLABUS_DATABASE[boardKey];
    if (!boardData) return [];

    const subjects = boardData[classGrade];
    if (!subjects) return [];

    const selectedSubject = subjects.find((s) => s.name === subject);
    return selectedSubject?.chapters || [];
  };

  // Search chapters by keyword
  const searchChapters = (
    board: string,
    classGrade: string,
    subject: string,
    keyword: string
  ): string[] => {
    const chapters = getChapters(board, classGrade, subject);
    const lowerKeyword = keyword.toLowerCase();
    return chapters.filter((ch) => ch.toLowerCase().includes(lowerKeyword));
  };

  return {
    getBoards,
    getClasses,
    getSubjects,
    getChapters,
    searchChapters,
  };
}
