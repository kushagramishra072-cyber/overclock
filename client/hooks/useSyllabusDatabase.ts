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
  icse: {}, // ICSE removed for now
};

export function useSyllabusDatabase() {
  // Normalize class grade string (e.g., "9" -> "9th", "Class 10" -> "10th")
  const normalizeGrade = (classGrade: string): string => {
    if (!classGrade) return "10th";
    const cleaned = classGrade.toLowerCase().replace(/[^0-9]/g, "");
    if (cleaned) {
      return `${cleaned}th`;
    }
    return classGrade.toLowerCase();
  };

  // Get all available boards
  const getBoards = (): string[] => {
    return ["CBSE", "STATE BOARD"];
  };

  // Get all available classes for a given board
  const getClasses = (board: string): string[] => {
    const boardKey = board.toLowerCase();
    const boardData = SYLLABUS_DATABASE[boardKey] || SYLLABUS_DATABASE["cbse"];
    const classes = Object.keys(boardData).filter(key => boardData[key] && boardData[key].length > 0);
    
    if (classes.length === 0) {
      return ["6th", "7th", "8th", "9th", "10th", "11th", "12th"];
    }

    return classes.sort((a, b) => {
      const aNum = parseInt(a) || 0;
      const bNum = parseInt(b) || 0;
      return aNum - bNum;
    });
  };

  // Get all subjects for a given board and class
  const getSubjects = (board: string, classGrade: string): string[] => {
    const boardKey = board.toLowerCase();
    const boardData = SYLLABUS_DATABASE[boardKey] || SYLLABUS_DATABASE["cbse"];
    const normGrade = normalizeGrade(classGrade);

    const subjects = boardData[normGrade] || boardData[classGrade];
    if (subjects && subjects.length > 0) {
      return subjects.map((s) => s.name);
    }

    // Default subjects for any class
    const gradeNum = parseInt(classGrade) || 10;
    if (gradeNum >= 11) {
      return ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Computer Science"];
    }
    return ["Mathematics", "Science", "English", "Social Studies", "Computer Science"];
  };

  // Get chapters for a given board, class, and subject
  const getChapters = (board: string, classGrade: string, subject: string): string[] => {
    if (!subject) return [];

    const boardKey = board.toLowerCase();
    const boardData = SYLLABUS_DATABASE[boardKey] || SYLLABUS_DATABASE["cbse"];
    const normGrade = normalizeGrade(classGrade);

    const subjects = boardData[normGrade] || boardData[classGrade] || boardData["10th"];
    if (subjects) {
      const selectedSubject = subjects.find(
        (s) => s.name.toLowerCase() === subject.toLowerCase()
      );
      if (selectedSubject?.chapters && selectedSubject.chapters.length > 0) {
        return selectedSubject.chapters;
      }
    }

    // Generate realistic standard chapters if subject/grade is non-standard
    const subLower = subject.toLowerCase();
    if (subLower.includes("math") || subLower.includes("algeb") || subLower.includes("calcul")) {
      return [
        "Number Systems & Real Numbers",
        "Polynomials & Algebraic Expressions",
        "Linear & Quadratic Equations",
        "Coordinate & Euclid Geometry",
        "Trigonometry & Applications",
        "Mensuration & Solid Shapes",
        "Statistics & Data Handling",
        "Probability & Permutations",
        "Calculus & Limits",
        "Vectors & 3D Geometry",
      ];
    }

    if (subLower.includes("physic") || subLower.includes("motion") || subLower.includes("light")) {
      return [
        "Motion & Kinematics",
        "Force & Laws of Motion",
        "Work, Energy & Power",
        "Gravitation & Satellite Motion",
        "Properties of Matter & Fluids",
        "Heat & Thermodynamics",
        "Sound & Oscillations",
        "Light Reflection & Refraction",
        "Electricity & Current Circuits",
        "Magnetic Effects & Electromagnetic Waves",
        "Ray & Wave Optics",
        "Modern Physics & Atoms",
      ];
    }

    if (subLower.includes("chem") || subLower.includes("acid") || subLower.includes("reaction")) {
      return [
        "Matter in Our Surroundings",
        "Atoms, Molecules & Mole Concept",
        "Chemical Reactions & Equations",
        "Acids, Bases & Salts",
        "Metals & Non-Metals",
        "Carbon & Its Compounds",
        "Periodic Classification of Elements",
        "Chemical Bonding & Structure",
        "Thermodynamics & Equilibrium",
        "Organic Chemistry Basics & Hydrocarbons",
      ];
    }

    if (subLower.includes("bio") || subLower.includes("cell") || subLower.includes("life")) {
      return [
        "Cell: Structure & Functions",
        "Tissues & Organ Systems",
        "Life Processes & Nutrition",
        "Control & Coordination in Organisms",
        "How Do Organisms Reproduce",
        "Heredity & Genetics",
        "Human Health & Diseases",
        "Biotechnology Principles",
        "Ecosystem & Biodiversity",
        "Environmental Issues & Conservation",
      ];
    }

    if (subLower.includes("english") || subLower.includes("lit") || subLower.includes("grammar")) {
      return [
        "Reading Comprehension & Passages",
        "Grammar: Tenses, Voices & Clauses",
        "Creative Writing & Essay Skills",
        "Prose & Short Stories Analysis",
        "Poetry & Literary Devices",
        "Formal Letter & Report Writing",
        "Vocabulary, Synonyms & Idioms",
        "Speech & Article Writing",
      ];
    }

    if (subLower.includes("social") || subLower.includes("hist") || subLower.includes("geog") || subLower.includes("civic") || subLower.includes("econ")) {
      return [
        "The Rise of Nationalism & Revolutions",
        "National Movement & Freedom Struggle",
        "The Making of a Global World",
        "Resources & Sustainable Development",
        "Forests, Water & Agriculture",
        "Political Parties & Democracy",
        "Judiciary & Executive Powers",
        "Economic Development & Financial Systems",
      ];
    }

    if (subLower.includes("comp") || subLower.includes("code") || subLower.includes("python") || subLower.includes("data") || subLower.includes("it")) {
      return [
        "Computer Systems & Architecture",
        "Programming Fundamentals & Logic",
        "Data Types, Variables & Expressions",
        "Control Flow, Loops & Functions",
        "Data Structures: Lists & Dictionaries",
        "Database Management & SQL Queries",
        "Computer Networks & Internet Protocols",
        "Cyber Safety & Ethics",
      ];
    }

    return [
      `Chapter 1: Foundations & Definitions of ${subject}`,
      `Chapter 2: Essential Theories & Core Principles`,
      `Chapter 3: Formulas, Laws & Governing Rules`,
      `Chapter 4: Step-by-Step Problem Solving`,
      `Chapter 5: Advanced Applications & Case Studies`,
      `Chapter 6: High-Yield Exam Practice Questions`,
      `Chapter 7: Summary Review & Self-Test`,
    ];
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
