// Firestore collection name constants — always import from here, never hardcode strings
const COLLECTIONS = {
    ORGANIZATIONS: 'organizations',
    USERS: 'users',
    VOLUNTEERS: 'volunteers',
    NEEDS: 'needs',
    TASKS: 'tasks',
    RESOURCES: 'resources',
    AI_QUEUE: 'aiQueue',
};

// Shape reference only — not actual DB calls
const SCHEMAS = {
    organization: {
        id: 'string',
        name: 'string',
        email: 'string',
        zones: 'array',
        contactPerson: 'string',
        createdAt: 'timestamp',
        subscriptionTier: 'string', // free | pro | enterprise
    },
    user: {
        id: 'string',
        email: 'string',
        role: 'string', // coordinator | volunteer | community
        orgId: 'string',
        displayName: 'string',
        photoURL: 'string',
        createdAt: 'timestamp',
    },
    volunteer: {
        id: 'string',
        userId: 'string',
        skills: 'array',
        verifiedSkills: 'array',
        availabilityGrid: 'object', // { "mon_9am": true, ... }
        zoneRadius: 'number',
        reliabilityScore: 'number',
        totalHours: 'number',
        currentTasks: 'number',
        burnoutFlag: 'boolean',
        location: { lat: 'number', lng: 'number' },
    },
    need: {
        id: 'string',
        title: 'string',
        description: 'string',
        category: 'string', // food | water | medical | shelter | education | livelihood | sanitation | other
        urgencyScore: 'number', // 1-5
        status: 'string', // pending_ai | active | assigned | resolved
        location: { lat: 'number', lng: 'number', address: 'string' },
        affectedCount: 'number',
        vulnerabilityFlag: 'boolean',
        reportedBy: 'string',
        orgId: 'string',
        isDuplicate: 'boolean',
        mergedFrom: 'array',
        photoURL: 'string',
        voiceTranscript: 'string',
        createdAt: 'timestamp',
        processedAt: 'timestamp',
        originalText: 'string',
        translatedText: 'string',
        detectedLanguage: 'string',
        titleTranslated: 'string',
        descriptionTranslated: 'string',
        submitterPhone:   'string',
        submitterChannel: 'string',
        submittedVia:     'string'
    },
    task: {
        id: 'string',
        needId: 'string',
        assignedVolunteer: 'string',
        status: 'string', // unassigned | assigned | inProgress | completed | verified
        scheduledTime: 'timestamp',
        completedAt: 'timestamp',
        outcome: 'string',
        orgId: 'string',
        createdAt: 'timestamp',
    },
    resource: {
        id: 'string',
        name: 'string',
        category: 'string',
        quantity: 'number',
        location: 'string',
        orgId: 'string',
        deployedTo: 'array',
    },
    aiQueueJob: {
        id: 'string',
        type: 'string',
        payload: 'object',
        status: 'string', // pending | processing | done | failed
        priority: 'number', // 1-5
        retries: 'number',
        createdAt: 'timestamp',
        processedAt: 'timestamp',
        result: 'object',
        orgId: 'string',
    },
};

const VALID_CATEGORIES = ['food', 'water', 'medical', 'shelter', 'education', 'livelihood', 'sanitation', 'other'];

const CATEGORY_PRIORITY = {
    medical: 5,
    flood: 5,
    emergency: 5,
    water: 4,
    food: 4,
    shelter: 3,
    education: 2,
    livelihood: 2,
    sanitation: 2,
    other: 2,
};

module.exports = { COLLECTIONS, SCHEMAS, VALID_CATEGORIES, CATEGORY_PRIORITY };