interface ResourceQuery {
  grade: string;
  board: string;
  subject: string;
  chapters: string[];
}

interface StudyResource {
  title: string;
  type: "pdf" | "notes" | "video" | "article";
  url: string;
  source: string;
  relevance: number;
}

interface ChapterResources {
  chapter: string;
  resources: StudyResource[];
  studyTips: string[];
  importantQuestions: string[];
}

// Comprehensive resource database with real study materials for Indian boards
const BOARD_TOPIC_DATABASE: Record<string, Record<string, any>> = {
  cbse: {
    "10th": {
      "light reflection and refraction": {
        topics: ["Laws of Reflection", "Plane Mirror", "Spherical Mirrors", "Refraction", "Lens"],
        keywords: ["reflection", "refraction", "mirror", "lens"],
        studyMaterials: [
          "NCERT Class 10 Science Chapter 10 Complete Notes",
          "Physics Wallah Light Reflection and Refraction Full Series",
          "Vedantu: Ray Diagrams and Mirror Formulas Video",
          "BYJU'S: Lens Formula Practice Problems with Solutions",
          "Aakash: Previous Year Board Questions on Optics",
          "Toppers' Handwritten Notes on Mirror Formula Derivations",
          "YouTube: Physics Galaxy - Light and Optics Complete Playlist",
        ],
        topicsCovered: "Mirror formula (f = R/2), Lens formula (1/f = 1/v + 1/u), Refractive index, Critical angle",
        estimatedHours: 15,
      },
      "electricity": {
        topics: ["Current", "Resistance", "Ohm's Law", "Series/Parallel Circuits", "Power"],
        keywords: ["current", "resistance", "ohm", "circuit"],
        studyMaterials: [
          "NCERT Science Ch 12: Electricity - Complete Textbook with Examples",
          "Khan Academy: Electric Current and Circuits",
          "Physics Wallah: Ohm's Law and Circuit Problems",
          "Vedantu Numericals: Electricity (30+ solved examples)",
          "Shoonya: Circuit Diagrams and Practical Applications",
          "Topper Notes: Electricity Quick Revision Sheet",
          "YouTube: Techinstitute - Electricity in 2 hours",
        ],
        topicsCovered: "V=IR, P=VI, Resistivity, Combinations of resistances, Heating effect",
        estimatedHours: 12,
      },
      "chemical reactions": {
        topics: ["Types of Reactions", "Balancing Equations", "Ionic Equations", "Redox Reactions"],
        keywords: ["reaction", "chemical", "balance", "equation"],
        studyMaterials: [
          "NCERT Chemistry Class 10 Chapter 1: Chemical Reactions",
          "Chemistry Wallah: Balancing Chemical Equations Complete Tutorial",
          "Vedantu: Types of Chemical Reactions with Examples",
          "BYJU'S: Ionic Equations and Redox Reactions Video",
          "Saransh Academy: Board Exam Level Chemistry Questions",
          "Chemistry Topper Handwritten Notes with Mnemonics",
          "Practice Problem Bank: 100+ Balancing Equations from Board Papers",
        ],
        topicsCovered: "Combination, decomposition, displacement reactions, Oxidation-reduction, Ionic equations",
        estimatedHours: 14,
      },
      "photosynthesis": {
        topics: ["Light Reactions", "Dark Reactions", "Chloroplast Structure", "Factors Affecting"],
        keywords: ["photosynthesis", "chlorophyll", "atp", "glucose"],
        studyMaterials: [
          "NCERT Biology: Photosynthesis Complete Chapter",
          "Amoeba Sisters: Photosynthesis Explained Simply",
          "Vedantu: Light and Dark Reactions Detailed Video",
          "Biology Wallah: Chloroplast Structure and Functions",
          "Genius Biology: Photosynthesis Equation and Mechanisms",
          "Topper's Diagram Bank: Photosynthesis Flowcharts",
          "Question Bank: 50+ Important Questions from Board Exams",
        ],
        topicsCovered: "Light reactions, Calvin cycle, Chlorophyll, ATP and NADPH production, Factors affecting",
        estimatedHours: 10,
      },
    },
    "11th": {
      "calculus": {
        topics: ["Limits", "Derivatives", "Integration", "Applications"],
        keywords: ["calculus", "derivative", "integral", "limit"],
        studyMaterials: [
          "NCERT Maths Class 11 Chapters 12-14: Limits, Derivatives, Integrals",
          "Khan Academy: Calculus Fundamentals Complete",
          "Physics Wallah: Derivatives and Integration from Basics",
          "Vedantu: Calculus Problem Solving Workshop",
          "BYJU'S: Differentiation Rules and Applications",
          "Toppers' Formula Sheet: All Calculus Formulas on One Page",
          "Practice: 200+ Solved Problems from Previous Year Papers",
        ],
        topicsCovered: "Limit definition, Derivative rules, Chain rule, Integration by parts, Applications to motion",
        estimatedHours: 20,
      },
      "thermodynamics": {
        topics: ["Laws of Thermodynamics", "Entropy", "Free Energy", "Spontaneity"],
        keywords: ["thermodynamics", "entropy", "enthalpy", "gibbs"],
        studyMaterials: [
          "NCERT Chemistry Class 11: Thermodynamics Complete",
          "Chemistry Wallah: First and Second Laws of Thermodynamics",
          "Vedantu: Entropy and Enthalpy Explained",
          "BYJU'S: Gibbs Free Energy and Spontaneity",
          "Aakash Study Material: Thermodynamics Summary Notes",
          "Topper Explanations: Thermodynamic Equations Derivation",
          "Numericals: 80+ Solved Problems on Heat, Work, and Energy",
        ],
        topicsCovered: "ΔU = q + w, ΔH = ΔU + Δ(PV), ΔG = ΔH - TΔS, Hess's Law applications",
        estimatedHours: 18,
      },
    },
  },
  icse: {
    "10th": {
      "concise physics": {
        topics: ["Force", "Motion", "Work Energy Power", "Machines"],
        keywords: ["physics", "force", "motion", "work"],
        studyMaterials: [
          "Concise Physics Part 1: Chapters 1-5 Complete",
          "Selina Solutions: Step-by-step Answers to All Problems",
          "Physics Wallah ICSE: Force and Motion Series",
          "Khan Academy: Classical Mechanics Foundations",
          "Vedantu ICSE: Work, Energy, Power Detailed Videos",
          "Frank ICSE: Alternative Solutions and Explanations",
          "Board Question Papers: Previous 10 years Physics problems",
        ],
        topicsCovered: "Newton's laws, Kinematics, Work-energy theorem, Simple machines, Efficiency",
        estimatedHours: 16,
      },
    },
  },
};

export function useResourceFetcher() {
  const searchResources = async (query: ResourceQuery): Promise<ChapterResources[]> => {
    // Simulate searching for resources with subject awareness
    const results: ChapterResources[] = [];

    for (const chapter of query.chapters) {
      const chapterLower = chapter.toLowerCase();

      // Find matching topics from database
      const boardData = BOARD_TOPIC_DATABASE[query.board.toLowerCase()] || {};
      const gradeData = boardData[query.grade] || {};

      let matchedTopic: any = null;
      let matchedChapter = chapter;

      // Try to find matching chapter in database
      for (const [dbChapter, dbData] of Object.entries(gradeData)) {
        if (chapterLower.includes(dbChapter.toLowerCase()) ||
            dbChapter.toLowerCase().includes(chapterLower)) {
          matchedTopic = dbData;
          matchedChapter = dbChapter;
          break;
        }
      }

      // Generate mock resources with subject context
      const resources = generateMockResources(chapter, query.board, query.grade, query.subject);
      const studyTips = generateStudyTips(chapter, matchedTopic);
      const importantQuestions = generateImportantQuestions(chapter, matchedTopic);

      results.push({
        chapter: matchedChapter,
        resources,
        studyTips,
        importantQuestions,
      });
    }

    return results;
  };

  const generateMockResources = (chapter: string, board: string, grade: string, subject: string): StudyResource[] => {
    const resources: StudyResource[] = [];

    // Try to find specific study materials from database
    const boardKey = board.toLowerCase();
    const boardData = BOARD_TOPIC_DATABASE[boardKey] || {};
    const gradeData = boardData[grade] || {};

    let specificMaterials: string[] = [];
    let topicsCovered = "";

    for (const [dbChapter, dbData] of Object.entries(gradeData)) {
      if (chapter.toLowerCase().includes(dbChapter.toLowerCase()) ||
          dbChapter.toLowerCase().includes(chapter.toLowerCase())) {
        specificMaterials = dbData.studyMaterials || [];
        topicsCovered = dbData.topicsCovered || "";
        break;
      }
    }

    // If we found specific materials, use them
    if (specificMaterials.length > 0) {
      specificMaterials.forEach((material, idx) => {
        // Categorize by material type
        let type: "pdf" | "notes" | "video" | "article" = "pdf";
        if (material.toLowerCase().includes("video") || material.toLowerCase().includes("youtube") || material.toLowerCase().includes("wallah")) {
          type = "video";
        } else if (material.toLowerCase().includes("notes") || material.toLowerCase().includes("handwritten")) {
          type = "notes";
        } else if (material.toLowerCase().includes("question") || material.toLowerCase().includes("paper") || material.toLowerCase().includes("explained")) {
          type = "article";
        }

        resources.push({
          title: material,
          type,
          url: `#resource-${idx}`,
          source: extractSource(material),
          relevance: Math.max(60, 100 - (idx * 5)),
        });
      });
    } else {
      // Fallback to generic suggestions if not found in database
      const genericSources = [
        {
          name: `NCERT ${subject} - ${chapter} Complete Notes & Solutions`,
          type: "pdf" as const,
          source: "NCERT Official",
        },
        {
          name: `${chapter} - Video Lectures & Problem Solving`,
          type: "video" as const,
          source: "Physics Wallah / Khan Academy",
        },
        {
          name: `${chapter} - Solved Numericals & Practice Problems`,
          type: "pdf" as const,
          source: "BYJU'S / Vedantu / Toppr",
        },
        {
          name: `${chapter} - Previous Year Board Questions & Solutions`,
          type: "article" as const,
          source: "Board Exam Question Banks",
        },
        {
          name: `${chapter} - Topper's Handwritten Notes & Shortcuts`,
          type: "notes" as const,
          source: "StudyMaterial / Aakash / Toppers",
        },
      ];

      genericSources.forEach((source, idx) => {
        resources.push({
          title: source.name,
          type: source.type,
          url: `#resource-${idx}`,
          source: source.source,
          relevance: Math.round((5 - (idx * 0.5)) * 20),
        });
      });
    }

    return resources;
  };

  const extractSource = (material: string): string => {
    if (material.includes("NCERT")) return "NCERT Official";
    if (material.includes("Wallah") || material.includes("Khan")) return "Video Lectures (YouTube)";
    if (material.includes("Vedantu") || material.includes("BYJU'S") || material.includes("Toppr")) return "Online Study Platforms";
    if (material.includes("Board") || material.includes("Paper")) return "Board Exam Archives";
    if (material.includes("Topper") || material.includes("Handwritten")) return "Student Notes & Toppers";
    if (material.includes("Aakash") || material.includes("Selina") || material.includes("Frank")) return "Coaching & Textbooks";
    return "Study Materials";
  };

  const generateStudyTips = (chapter: string, topicData: any): string[] => {
    const tips: string[] = [];

    if (topicData) {
      tips.push(`📌 Focus on: ${topicData.topics.join(", ")}`);
      tips.push(`⏱️ Estimated study time: ${topicData.estimatedHours} hours`);
      tips.push(`💡 Study tip: ${topicData.studyPattern}`);
    } else {
      tips.push("📌 Break the chapter into smaller topics");
      tips.push("⏱️ Spend 2-3 hours understanding core concepts");
      tips.push("💡 Practice with previous year questions");
    }

    tips.push("✍️ Make summary notes while studying");
    tips.push("🔄 Revise every 3 days for better retention");

    return tips;
  };

  const generateImportantQuestions = (chapter: string, topicData: any): string[] => {
    const questions: string[] = [];

    if (topicData) {
      topicData.topics.forEach((topic: string) => {
        questions.push(`What is ${topic} and explain with examples?`);
      });
    }

    questions.push(`Define key terms in ${chapter}`);
    questions.push(`What are the applications of ${chapter} in real life?`);
    questions.push(`Compare and contrast the concepts in ${chapter}`);
    questions.push(`Solve 5 numerical problems on ${chapter}`);

    return questions;
  };

  return {
    searchResources,
  };
}
