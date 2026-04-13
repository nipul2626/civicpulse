/**
 * Layer 0: Rule-based preprocessing
 * Handles simple, obvious cases without any API call.
 * Returns null if the need is too complex for rules — escalate to AI.
 * Target: handle ~30% of needs with 0 API cost.
 */

// ── Keyword maps with weights ─────────────────────────────────────────────────
const URGENCY_KEYWORDS = {
    5: [
        'death', 'dying', 'dead', 'critical', 'emergency', 'life threatening',
        'unconscious', 'not breathing', 'heart attack', 'stroke', 'severe bleeding',
        'drowning', 'trapped', 'collapsed', 'building collapse', 'fire', 'explosion',
        'stranded', 'flood', 'newborn', 'premature', 'labour', 'labor', 'childbirth',
        // Hindi/Marathi transliterations
        'maut', 'mar raha', 'aag', 'doob', 'bhadhak',
    ],
    4: [
        'urgent', 'immediately', 'no food', 'no water', 'no medicine', 'insulin',
        'dialysis', 'oxygen', 'wheelchair', 'elderly alone', 'child alone',
        'pregnant', 'disabled', 'paralyzed', 'cancer', 'tb', 'tuberculosis',
        'contaminated water', 'sewage', 'cholera', 'dengue', 'malaria',
        '3 days', '48 hours', '72 hours', 'days without',
        // Hindi/Marathi transliterations
        'bahut zaruri', 'abhi chahiye', 'paani nahi', 'khana nahi',
    ],
    3: [
        'food shortage', 'water shortage', 'shelter needed', 'roof damaged',
        'school closed', 'no teacher', 'medicines needed', 'job lost',
        'family displaced', 'evicted', 'no electricity', 'ration finished',
        '24 hours', 'yesterday', 'since morning',
    ],
    2: [
        'need help', 'requesting', 'require', 'looking for', 'want',
        'training', 'education', 'skill', 'repair', 'maintenance',
        'application', 'form', 'document', 'certificate',
    ],
};

const CATEGORY_KEYWORDS = {
    medical:    ['hospital', 'doctor', 'medicine', 'medical', 'nurse', 'health', 'sick', 'ill', 'injury', 'wound', 'fever', 'pain', 'insulin', 'dialysis', 'oxygen', 'blood', 'surgery', 'clinic', 'ambulance', 'patient', 'disabled', 'wheelchair', 'pregnancy', 'pregnant', 'labour', 'childbirth', 'tb', 'cancer', 'dengue', 'malaria', 'cholera'],
    food:       ['food', 'hungry', 'hunger', 'meal', 'eat', 'rice', 'ration', 'grain', 'nutrition', 'malnutrition', 'starving', 'starvation', 'cook', 'kitchen', 'distribute', 'supply', 'khana', 'chawal', 'dal', 'roti'],
    water:      ['water', 'drinking', 'contaminated', 'pipeline', 'well', 'drought', 'thirsty', 'purify', 'paani', 'pani', 'borewell', 'tanker'],
    shelter:    ['shelter', 'house', 'home', 'roof', 'building', 'homeless', 'displaced', 'tent', 'tarpaulin', 'flood damage', 'collapsed', 'repair', 'construction', 'room', 'accommodation', 'evicted', 'ghar'],
    education:  ['school', 'student', 'teacher', 'class', 'study', 'books', 'textbook', 'tutor', 'exam', 'dropout', 'learn', 'literacy', 'college', 'scholarship', 'padhai', 'vidyalaya'],
    livelihood: ['job', 'work', 'income', 'livelihood', 'business', 'loan', 'skill', 'training', 'unemployed', 'vendor', 'farmer', 'crop', 'equipment', 'sewing', 'machine', 'kaam', 'rozgar'],
    sanitation: ['toilet', 'sewage', 'garbage', 'waste', 'drain', 'clean', 'sanitation', 'hygiene', 'open defecation', 'bathroom', 'latrine', 'safai'],
};

const VULNERABILITY_KEYWORDS = [
    'child', 'children', 'infant', 'baby', 'newborn', 'elderly', 'old age', 'senior',
    'widow', 'orphan', 'disabled', 'pregnant', 'single mother', 'alone', 'blind',
    'deaf', 'paralyzed', 'bedridden', 'mentally ill', 'special needs',
    // Hindi/Marathi
    'bacha', 'bachche', 'bujurg', 'vridh', 'vidhwa', 'apahij', 'garbhwati',
];

// ── Scorer ────────────────────────────────────────────────────────────────────
function preprocessNeed(needData) {
    const text = `${needData.title || ''} ${needData.description || ''}`.toLowerCase();
    const words = text.split(/\s+/);

    // ── Score urgency ────────────────────────────────────────────────────────────
    let urgencyScore = 2; // default
    let urgencyConfidence = 0;

    for (const [score, keywords] of Object.entries(URGENCY_KEYWORDS).reverse()) {
        const matches = keywords.filter(kw => text.includes(kw));
        if (matches.length > 0) {
            urgencyScore = parseInt(score);
            // Confidence increases with more keyword matches
            urgencyConfidence = Math.min(1, matches.length * 0.3);
            break;
        }
    }

    // ── Detect category ──────────────────────────────────────────────────────────
    const categoryCounts = {};
    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        categoryCounts[cat] = keywords.filter(kw => text.includes(kw)).length;
    }

    // Use submitted category if it matches well, otherwise detect from text
    const detectedCategory = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])[0];

    const submittedCategoryScore = categoryCounts[needData.category] || 0;
    const detectedCategoryScore  = detectedCategory[1];

    // Trust submitted category if it has any keyword matches
    // Override only if detected category is much stronger
    let finalCategory = needData.category || 'other';
    if (submittedCategoryScore === 0 && detectedCategoryScore > 1) {
        finalCategory = detectedCategory[0];
    }

    // ── Check vulnerability ──────────────────────────────────────────────────────
    const vulnerabilityFlag = VULNERABILITY_KEYWORDS.some(kw => text.includes(kw));

    // ── Estimate affected count ──────────────────────────────────────────────────
    // Try to extract numbers from text: "10 families", "50 people", etc.
    let affectedCount = needData.affectedCount || null;
    if (!affectedCount) {
        const familyMatch = text.match(/(\d+)\s*famil/);
        const peopleMatch = text.match(/(\d+)\s*(people|person|resident|member|child|student)/);
        const generalMatch = text.match(/(\d+)/);

        if (familyMatch) affectedCount = parseInt(familyMatch[1]) * 4; // avg family size
        else if (peopleMatch) affectedCount = parseInt(peopleMatch[1]);
        else if (generalMatch) affectedCount = Math.min(parseInt(generalMatch[1]), 1000);
    }

    // ── Calculate overall confidence ─────────────────────────────────────────────
    // High confidence = strong keyword signals, category is clear
    const categoryConfidence = detectedCategoryScore >= 2 ? 0.4
        : detectedCategoryScore === 1 ? 0.2 : 0;

    const overallConfidence = Math.min(0.95, urgencyConfidence + categoryConfidence +
        (vulnerabilityFlag ? 0.1 : 0) +
        (affectedCount ? 0.1 : 0));

    return {
        urgencyScore,
        category: finalCategory,
        affectedCount,
        vulnerabilityFlag,
        summary: `Rule-based assessment: ${finalCategory} need with urgency ${urgencyScore}/5`,
        duplicateRisk: false,
        provisional: overallConfidence < 0.85, // flag for human review if low confidence
        confidence: overallConfidence,
        provider: 'rule-based-layer0',
    };
}

/**
 * Returns result only if confidence is high enough to skip AI.
 * Returns null if AI scoring is needed.
 */
function tryRuleBasedScoring(needData) {
    const result = preprocessNeed(needData);

    if (result.confidence >= 0.85) {
        console.log(`⚡ Layer 0 handled need (confidence: ${result.confidence.toFixed(2)})`);
        return result;
    }

    // Not confident enough — escalate to AI
    return null;
}

module.exports = { tryRuleBasedScoring, preprocessNeed };