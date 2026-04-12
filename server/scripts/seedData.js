// Run: node scripts/seedData.js
// Reset: node scripts/seedData.js --clear

require('dotenv').config();
const { db } = require('../services/firebase');
const { v4: uuidv4 } = require('uuid');

const args = process.argv.slice(2);
const CLEAR_MODE = args.includes('--clear');

// ── Helpers ───────────────────────────────────────────────────────────────────
function randFloat(min, max) { return Math.random() * (max - min) + min; }
function randInt(min, max)   { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randItem(arr)       { return arr[Math.floor(Math.random() * arr.length)]; }
function daysAgo(n)          { return new Date(Date.now() - n * 24 * 60 * 60 * 1000); }

// Mumbai bounding box: lat 18.87–19.27, lng 72.77–72.99
function mumbaiLatLng() { return { lat: randFloat(18.87, 19.27), lng: randFloat(72.77, 72.99) }; }
// Pune bounding box: lat 18.43–18.63, lng 73.74–74.02
function puneLatLng()   { return { lat: randFloat(18.43, 18.63), lng: randFloat(73.74, 74.02) }; }

// ── Seed data definitions ─────────────────────────────────────────────────────
const ORGS = [
    { name: 'Helping Hands India', email: 'help@helpinghands.in', zones: ['Dharavi', 'Kurla', 'Sion'],         contactPerson: 'Priya Sharma',    city: 'Mumbai' },
    { name: 'FloodAid Foundation', email: 'info@floodaid.org',   zones: ['Andheri', 'Borivali', 'Malad'],     contactPerson: 'Arjun Mehta',     city: 'Mumbai' },
    { name: 'EduCare NGO',         email: 'care@educare.org',    zones: ['Hadapsar', 'Kothrud', 'Wakad'],      contactPerson: 'Sunita Desai',    city: 'Pune'   },
];

const VOLUNTEER_TEMPLATES = [
    // Medical (5)
    { skills: ['medical', 'firstaid'],        verifiedSkills: ['medical'],    name: 'Dr. Anjali Kulkarni', city: 'Mumbai' },
    { skills: ['nursing', 'firstaid'],        verifiedSkills: ['nursing'],    name: 'Ramesh Patil',        city: 'Mumbai' },
    { skills: ['medical', 'paramedic'],       verifiedSkills: ['paramedic'],  name: 'Sneha Joshi',         city: 'Mumbai' },
    { skills: ['firstaid'],                   verifiedSkills: ['firstaid'],   name: 'Vikram Nair',         city: 'Mumbai' },
    { skills: ['medical', 'nursing'],         verifiedSkills: ['medical'],    name: 'Pooja Iyer',          city: 'Pune'   },
    // Logistics (4)
    { skills: ['cooking', 'logistics'],       verifiedSkills: ['logistics'],  name: 'Suresh Kumar',        city: 'Mumbai' },
    { skills: ['logistics', 'distribution'], verifiedSkills: [],             name: 'Kavitha Reddy',       city: 'Mumbai' },
    { skills: ['catering', 'cooking'],        verifiedSkills: ['catering'],   name: 'Mohammed Shaikh',     city: 'Pune'   },
    { skills: ['logistics'],                  verifiedSkills: [],             name: 'Anita Pillai',        city: 'Pune'   },
    // Teaching (3)
    { skills: ['teaching', 'tutoring'],       verifiedSkills: ['teaching'],   name: 'Neha Gupta',          city: 'Pune'   },
    { skills: ['teaching', 'counselling'],    verifiedSkills: ['teaching'],   name: 'Ravi Shankar',        city: 'Pune'   },
    { skills: ['tutoring', 'training'],       verifiedSkills: [],             name: 'Divya Menon',         city: 'Mumbai' },
    // Construction (3)
    { skills: ['construction', 'carpentry'],  verifiedSkills: ['construction'], name: 'Ganesh Chavan',     city: 'Mumbai' },
    { skills: ['carpentry', 'engineering'],   verifiedSkills: ['carpentry'],  name: 'Sanjay Thorat',       city: 'Mumbai' },
    { skills: ['construction'],               verifiedSkills: [],             name: 'Rohit Bhosale',       city: 'Pune'   },
];

const NEED_TEMPLATES = [
    // Food/Water (15)
    { title: 'Food shortage in Dharavi slum',          description: 'Over 50 families have not had a proper meal in 2 days due to flooding in the area. Children and elderly are particularly affected.', category: 'food',       urgencyScore: 4 },
    { title: 'Drinking water contamination in Kurla',  description: 'Pipeline burst has contaminated the local water supply. Residents are falling sick. Need water purification tablets and clean water supply urgently.', category: 'water',      urgencyScore: 4 },
    { title: 'Daily nutrition for orphanage children', description: 'Local orphanage running out of food supplies. 35 children aged 5-12 need daily meals for the next month.', category: 'food',       urgencyScore: 3 },
    { title: 'Water scarcity in Borivali East',        description: 'Municipal water supply has been cut for 3 days in Ward 8. Families collecting water from distant sources.', category: 'water',      urgencyScore: 3 },
    { title: 'Food for flood victims',                 description: 'Andheri flooding has left 200+ residents without access to food. Emergency ration distribution needed.', category: 'food',       urgencyScore: 5 },
    { title: 'School meal program disruption',         description: 'Mid-day meal program suspended due to kitchen damage. 120 students going without lunch.', category: 'food',       urgencyScore: 3 },
    { title: 'Water for construction workers camp',    description: '80 migrant construction workers living in camp with no clean water access. Risk of waterborne diseases.', category: 'water',      urgencyScore: 3 },
    { title: 'Emergency food for stranded families',   description: '12 families stranded on rooftops due to floods. Need food and water supply by boat immediately.', category: 'food',       urgencyScore: 5 },
    { title: 'Malnutrition in tribal area',            description: 'NGO survey found severe malnutrition among children under 5 in the tribal belt. Nutrition packets needed.', category: 'food',       urgencyScore: 4 },
    { title: 'Water pipeline damage - Sion',           description: 'Main pipeline serving 3 buildings damaged. 150 families without water for 48 hours.', category: 'water',      urgencyScore: 4 },
    { title: 'Food ration for elderly home',           description: 'Old age home has 40 residents. Food supply finished 2 days ago. No funds to restock immediately.', category: 'food',       urgencyScore: 4 },
    { title: 'Community kitchen needed in Malad',      description: 'Daily wage workers in Malad West have no money for food after factory closure. 300+ families affected.', category: 'food',       urgencyScore: 3 },
    { title: 'Water for hospital ward patients',       description: 'Water supply to secondary ward of district hospital disrupted. 60 patients affected.', category: 'water',      urgencyScore: 5 },
    { title: 'Drought-affected village - Hadapsar',    description: 'Village panchayat reports severe water shortage. Wells have dried up. 500 residents affected.', category: 'water',      urgencyScore: 4 },
    { title: 'Ration cards not processed - Wakad',     description: 'Families without ration cards unable to access PDS food. 25 families identified without food support.', category: 'food',       urgencyScore: 2 },
    // Medical (10)
    { title: 'Diabetic elderly woman needs insulin',   description: 'Elderly woman (72) stranded in flood, missed insulin dose for 2 days. Immediate medical attention needed.', category: 'medical',    urgencyScore: 5 },
    { title: 'Dengue outbreak - 5 cases in building',  description: 'Cluster of 5 dengue cases in Kurla building. Fumigation and medical check of all 80 residents needed.', category: 'medical',    urgencyScore: 4 },
    { title: 'Pregnant woman - no transport to hospital', description: 'Pregnant woman (9 months) in Dharavi with labour pain. Roads flooded, needs emergency evacuation.', category: 'medical',    urgencyScore: 5 },
    { title: 'Post-surgery patient needs home care',   description: 'Patient discharged after knee surgery, living alone. Needs daily nursing visit for wound dressing for 2 weeks.', category: 'medical',    urgencyScore: 3 },
    { title: 'TB medication supply disrupted',         description: 'DOTS center closed. 12 TB patients unable to collect medication. Need courier to deliver directly.', category: 'medical',    urgencyScore: 5 },
    { title: 'Child with high fever - no doctor nearby', description: '3-year-old with 104°F fever in slum area. Parents cannot afford private doctor. Need pediatrician visit.', category: 'medical',    urgencyScore: 5 },
    { title: 'First aid camp needed post-flood',       description: 'Multiple minor injuries from flood debris in Andheri. Request first aid camp setup for 2 days.', category: 'medical',    urgencyScore: 4 },
    { title: 'Mental health support for survivors',    description: 'Flood survivors in temporary shelter showing trauma symptoms. Counsellors needed urgently.', category: 'medical',    urgencyScore: 3 },
    { title: 'Dialysis patient transport needed',      description: 'Patient requires dialysis 3x weekly. Transport not available due to roads condition.', category: 'medical',    urgencyScore: 4 },
    { title: 'Vaccination drive - 200 children',       description: 'Missed vaccination drive in tribal area. 200 children under 2 need immunization. Camp setup needed.', category: 'medical',    urgencyScore: 4 },
    // Shelter (8)
    { title: '8 families displaced by building collapse', description: 'Old building in Sion partially collapsed after rains. 8 families (35 people) need immediate shelter.', category: 'shelter',    urgencyScore: 5 },
    { title: 'Temporary shelter for flood evacuees',   description: '50 families evacuated from low-lying area. Currently in school hall. Need proper temporary shelters.', category: 'shelter',    urgencyScore: 4 },
    { title: 'Roof repair for widow\'s home',          description: 'Elderly widow\'s house roof damaged in storm. Water entering home. No resources to repair.', category: 'shelter',    urgencyScore: 3 },
    { title: 'Tarpaulins needed for 20 families',      description: 'Families in informal settlement lost roofing in cyclone. Need tarpaulins as immediate cover.', category: 'shelter',    urgencyScore: 4 },
    { title: 'Construction workers without shelter',   description: '30 migrant workers sleeping in open after construction site shut. Need temporary housing.', category: 'shelter',    urgencyScore: 3 },
    { title: 'Crack in building - structural risk',    description: 'Residents of 4-storey building noticed deep cracks after rains. Need structural assessment urgently.', category: 'shelter',    urgencyScore: 4 },
    { title: 'Flood damage repair - 3 homes',          description: '3 houses in Hadapsar severely damaged by floods. Families sleeping in damaged structure.', category: 'shelter',    urgencyScore: 3 },
    { title: 'Disabled person home modification',      description: 'Wheelchair user\'s home needs ramp and bathroom modification for safety and dignity.', category: 'shelter',    urgencyScore: 2 },
    // Education (7)
    { title: 'Tutors needed for board exam students',  description: '40 Class 10 students from low-income families need free tutoring. Exams in 2 months.', category: 'education',  urgencyScore: 3 },
    { title: 'Flood disrupted school - catch-up classes', description: 'School closed for 3 weeks due to flooding. Students need intensive catch-up sessions.', category: 'education',  urgencyScore: 3 },
    { title: 'Adult literacy program volunteers',       description: 'Self-help group of 25 women wants to learn to read. Need 2 literacy volunteers, 3x per week.', category: 'education',  urgencyScore: 2 },
    { title: 'Scholarship form assistance',            description: 'Students unable to fill government scholarship forms. Need guidance counsellors to assist.', category: 'education',  urgencyScore: 2 },
    { title: 'Textbooks for government school',        description: 'Government school received no textbooks this year. 200 students sharing 30 books. Urgent supply needed.', category: 'education',  urgencyScore: 3 },
    { title: 'Digital literacy for elderly',           description: 'Welfare center wants to teach 30 elderly residents to use smartphones for government services.', category: 'education',  urgencyScore: 2 },
    { title: 'Dropout students re-enrollment',         description: '15 students dropped out after floods. Need counsellors to re-enroll and support their return.', category: 'education',  urgencyScore: 3 },
    // Livelihood (6)
    { title: 'Sewing machine repair for SHG women',   description: 'Self-help group of 12 women lost livelihoods when sewing machines damaged in flood. Need repair/replacement.', category: 'livelihood', urgencyScore: 3 },
    { title: 'Loan for flood-hit small vendor',        description: 'Street vendor lost all inventory in flood. Needs Rs. 15,000 micro-loan to restart business.', category: 'livelihood', urgencyScore: 3 },
    { title: 'Job placement for retrenched workers',   description: 'Factory closed, 40 workers unemployed. Need job placement assistance and skill training.', category: 'livelihood', urgencyScore: 2 },
    { title: 'Fishing boat repair - 5 fishermen',      description: '5 fishermen\'s boats damaged in storm. Unable to fish and earn. Need repair funding and materials.', category: 'livelihood', urgencyScore: 3 },
    { title: 'Business training for women',            description: 'Group of 20 women want to start small business. Need entrepreneurship training and market linkage.', category: 'livelihood', urgencyScore: 2 },
    { title: 'Farm equipment replacement - Hadapsar',  description: 'Small farmer lost tractor to flooding. Cannot harvest crop. Equipment loan or rental needed urgently.', category: 'livelihood', urgencyScore: 3 },
    // Sanitation (4)
    { title: 'Sewage overflow in slum lane',           description: 'Sewage pipe burst flooding entire lane. 200 residents at risk of cholera. Urgent repair and fumigation needed.', category: 'sanitation', urgencyScore: 4 },
    { title: 'Toilet construction for 10 families',    description: 'Families using open defecation due to no toilet. Located near school. Health and safety risk.', category: 'sanitation', urgencyScore: 3 },
    { title: 'Garbage collection stopped - 2 weeks',   description: 'Municipal garbage collection absent for 2 weeks in ward. 5 tonnes of waste piled up. Disease risk.', category: 'sanitation', urgencyScore: 4 },
    { title: 'Drainage cleaning before monsoon',       description: 'Community requesting drainage cleaning before rains start. Last year caused severe flooding.', category: 'sanitation', urgencyScore: 3 },
];

const TASK_OUTCOMES = [
    'Distributed 50kg rice and 20L cooking oil to 35 families.',
    'Provided medical care to 15 patients. 3 referred to hospital.',
    'Erected 12 tarpaulin shelters for 48 displaced residents.',
    'Conducted 5-day tutoring camp. All 30 students attended.',
    'Cleaned and repaired drainage in 3 lanes. Fumigation completed.',
    'Delivered water purification tablets to 200 households.',
    'First aid camp served 85 people. 8 serious cases referred.',
    'Sewing machines repaired for 12 women. Business resumed.',
    'Literacy classes started for 25 women. First session completed.',
    'Structural assessment done. Building certified safe to occupy.',
];

// ── Clear function ────────────────────────────────────────────────────────────
async function clearData() {
    console.log('🗑️  Clearing seeded data...');
    const collections = ['organizations', 'users', 'volunteers', 'needs', 'tasks', 'resources'];
    for (const col of collections) {
        const snap = await db.collection(col).where('_seeded', '==', true).get();
        const batch = db.batch();
        snap.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
        console.log(`  Deleted ${snap.size} from ${col}`);
    }
    console.log('✅ Clear complete');
}

// ── Main seed function ────────────────────────────────────────────────────────
async function seed() {
    console.log('\n🌱 CivicPulse Seed Script Starting...\n');

    // 1. Orgs
    console.log('📦 Creating organizations...');
    const orgIds = [];
    for (const org of ORGS) {
        const id = uuidv4();
        orgIds.push(id);
        await db.collection('organizations').doc(id).set({
            id, ...org, createdAt: daysAgo(90), subscriptionTier: 'pro', _seeded: true,
        });
        console.log(`  ✅ Org: ${org.name}`);
    }

    // 2. Volunteers
    console.log('\n👤 Creating volunteers...');
    const volunteerIds = [];
    for (let i = 0; i < VOLUNTEER_TEMPLATES.length; i++) {
        const tmpl = VOLUNTEER_TEMPLATES[i];
        const uid = uuidv4();
        const orgId = orgIds[i % orgIds.length];
        const loc = tmpl.city === 'Pune' ? puneLatLng() : mumbaiLatLng();

        await db.collection('users').doc(uid).set({
            id: uid, email: `volunteer${i + 1}@civicpulse.demo`,
            role: 'volunteer', orgId, displayName: tmpl.name, photoURL: null,
            createdAt: daysAgo(60), _seeded: true,
        });

        const availGrid = {};
        ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'].forEach(day => {
            ['morning', 'afternoon', 'evening'].forEach(slot => {
                availGrid[`${day}-${slot}`] = Math.random() > 0.4;
            });
        });

        const volId = uuidv4();
        volunteerIds.push({ volId, uid, orgId });
        await db.collection('volunteers').doc(volId).set({
            id: volId, userId: uid,
            skills: tmpl.skills, verifiedSkills: tmpl.verifiedSkills,
            availabilityGrid: availGrid, zoneRadius: randInt(5, 20),
            reliabilityScore: randFloat(0.7, 1.0),
            totalHours: randInt(10, 200),
            currentTasks: randInt(0, 2),
            burnoutFlag: false, location: loc,
            orgId, _seeded: true,
        });
        console.log(`  ✅ Volunteer: ${tmpl.name}`);
    }

    // 3. Needs
    console.log('\n📋 Creating needs...');
    const needIds = [];
    const statusPool = [
        ...Array(20).fill('resolved'),
        ...Array(8).fill('assigned'),
        ...Array(7).fill('active'),
        ...Array(15).fill('pending_ai'),
    ];

    for (let i = 0; i < NEED_TEMPLATES.length; i++) {
        const tmpl = NEED_TEMPLATES[i];
        const needId = uuidv4();
        const orgId = orgIds[i % orgIds.length];
        const status = statusPool[i] || 'pending_ai';
        const loc = orgId === orgIds[2] ? puneLatLng() : mumbaiLatLng();

        const addresses = ['Dharavi', 'Kurla', 'Sion', 'Andheri', 'Borivali', 'Malad', 'Hadapsar', 'Kothrud', 'Wakad'];
        const address = randItem(addresses) + ', ' + (orgId === orgIds[2] ? 'Pune' : 'Mumbai');

        await db.collection('needs').doc(needId).set({
            id: needId, ...tmpl,
            status,
            location: { ...loc, address },
            affectedCount: randInt(5, 200),
            vulnerabilityFlag: tmpl.urgencyScore >= 4,
            reportedBy: 'community_member',
            orgId,
            isDuplicate: false, mergedFrom: [],
            photoURL: null, voiceTranscript: null,
            createdAt: daysAgo(randInt(1, 90)),
            processedAt: status === 'resolved' ? daysAgo(randInt(1, 80)) : null,
            aiSummary: `AI assessed this as a ${tmpl.urgencyScore >= 4 ? 'high' : 'medium'} urgency need in the ${tmpl.category} category.`,
            _seeded: true,
        });

        needIds.push({ needId, orgId, status, category: tmpl.category });
        process.stdout.write(`  ✅ Need ${i + 1}/${NEED_TEMPLATES.length}: ${tmpl.title.substring(0, 40)}...\r`);
    }
    console.log(`\n  Created ${NEED_TEMPLATES.length} needs`);

    // 4. Tasks
    console.log('\n✅ Creating tasks...');
    const assignedNeeds = needIds.filter(n => ['resolved', 'assigned', 'active'].includes(n.status));
    let taskCount = 0;

    for (let i = 0; i < Math.min(30, assignedNeeds.length); i++) {
        const { needId, orgId, status, category } = assignedNeeds[i];
        const taskId = uuidv4();
        const volEntry = randItem(volunteerIds.filter(v => v.orgId === orgId) || volunteerIds);
        const completedAt = status === 'resolved' ? daysAgo(randInt(1, 70)) : null;
        const taskStatus = status === 'resolved' ? 'verified' : status === 'assigned' ? 'assigned' : 'inProgress';

        await db.collection('tasks').doc(taskId).set({
            id: taskId, needId,
            needCategory: category,
            assignedVolunteer: volEntry.volId,
            status: taskStatus,
            scheduledTime: daysAgo(randInt(1, 80)),
            completedAt,
            outcome: completedAt ? randItem(TASK_OUTCOMES) : null,
            peopleHelped: completedAt ? randInt(5, 200) : null,
            durationHours: completedAt ? randInt(2, 8) : null,
            orgId,
            createdAt: daysAgo(randInt(5, 85)),
            _seeded: true,
        });

        taskCount++;
    }
    console.log(`  Created ${taskCount} tasks`);

    // 5. Resources
    console.log('\n📦 Creating resources...');
    const RESOURCES = [
        { name: 'Medical First Aid Kits',  category: 'medical',    quantity: 24,  location: { address: 'Dharavi Warehouse, Mumbai',  lat: 19.0390, lng: 72.8619 } },
        { name: 'Rice Bags 25kg',          category: 'food',       quantity: 80,  location: { address: 'Kurla Depot, Mumbai',        lat: 19.0728, lng: 72.8826 } },
        { name: 'Tarpaulins',              category: 'shelter',    quantity: 35,  location: { address: 'Andheri Storage, Mumbai',    lat: 19.1136, lng: 72.8697 } },
        { name: 'Water Purifier Tablets',  category: 'water',      quantity: 500, location: { address: 'Central Warehouse, Mumbai',  lat: 18.9750, lng: 72.8258 } },
        { name: 'Textbooks Grade 5-8',     category: 'education',  quantity: 200, location: { address: 'Pune Depot, Hadapsar',       lat: 18.5018, lng: 73.9252 } },
    ];

    for (const res of RESOURCES) {
        const id = uuidv4();
        await db.collection('resources').doc(id).set({
            id, ...res, orgId: orgIds[0], deployedTo: [], createdAt: new Date(), _seeded: true,
        });
        console.log(`  ✅ Resource: ${res.name} (${res.quantity} units)`);
    }

    // ── Summary ───────────────────────────────────────────────────────────────
    console.log('\n🎉 Seed Complete!');
    console.log('─────────────────────────────────────');
    console.log(`  Organizations : ${ORGS.length}`);
    console.log(`  Volunteers    : ${VOLUNTEER_TEMPLATES.length}`);
    console.log(`  Needs         : ${NEED_TEMPLATES.length}`);
    console.log(`  Tasks         : ${taskCount}`);
    console.log(`  Resources     : ${RESOURCES.length}`);
    console.log('─────────────────────────────────────');
    console.log('\nYou can now test the app with realistic data.');
    console.log('To reset: node scripts/seedData.js --clear\n');
    process.exit(0);
}

// ── Entry point ───────────────────────────────────────────────────────────────
if (CLEAR_MODE) {
    clearData().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
} else {
    seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
}