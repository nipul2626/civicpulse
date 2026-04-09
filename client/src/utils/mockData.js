export const MOCK_NEEDS = [
    { id: 1,  lat: 19.076, lng: 72.877, title: "Food shortage",        category: "food",     urgency: 5, people: 120, zone: "Dharavi",        status: "unassigned", reporter: "Field Officer A", time: "2h ago"  },
    { id: 2,  lat: 19.082, lng: 72.865, title: "Medical supplies low", category: "medical",  urgency: 4, people: 45,  zone: "Kurla West",     status: "assigned",   reporter: "Field Officer B", time: "3h ago"  },
    { id: 3,  lat: 19.069, lng: 72.891, title: "Shelter needed",       category: "shelter",  urgency: 5, people: 200, zone: "Chembur",        status: "unassigned", reporter: "Field Officer C", time: "1h ago"  },
    { id: 4,  lat: 19.091, lng: 72.855, title: "Clean water access",   category: "water",    urgency: 3, people: 80,  zone: "Ghatkopar",      status: "inprogress", reporter: "Field Officer D", time: "5h ago"  },
    { id: 5,  lat: 19.060, lng: 72.900, title: "Child education gap",  category: "education",urgency: 2, people: 60,  zone: "Mankhurd",       status: "assigned",   reporter: "Field Officer E", time: "1d ago"  },
    { id: 6,  lat: 19.085, lng: 72.840, title: "Flood relief needed",  category: "shelter",  urgency: 5, people: 350, zone: "Vikhroli",       status: "unassigned", reporter: "Field Officer F", time: "30m ago" },
    { id: 7,  lat: 19.073, lng: 72.883, title: "Medicine for elderly", category: "medical",  urgency: 4, people: 30,  zone: "Sion",           status: "assigned",   reporter: "Field Officer G", time: "4h ago"  },
    { id: 8,  lat: 19.055, lng: 72.870, title: "Food packets needed",  category: "food",     urgency: 3, people: 90,  zone: "Govandi",        status: "completed",  reporter: "Field Officer H", time: "6h ago"  },
    { id: 9,  lat: 19.095, lng: 72.870, title: "Sanitation issue",     category: "water",    urgency: 4, people: 110, zone: "Bhandup",        status: "unassigned", reporter: "Field Officer I", time: "2h ago"  },
    { id: 10, lat: 19.078, lng: 72.910, title: "Trauma counseling",    category: "medical",  urgency: 3, people: 25,  zone: "Trombay",        status: "inprogress", reporter: "Field Officer J", time: "8h ago"  },
    { id: 11, lat: 19.065, lng: 72.855, title: "Blankets & clothes",   category: "shelter",  urgency: 2, people: 70,  zone: "Tilak Nagar",    status: "assigned",   reporter: "Field Officer K", time: "1d ago"  },
    { id: 12, lat: 19.088, lng: 72.895, title: "Emergency food camp",  category: "food",     urgency: 5, people: 280, zone: "Powai",          status: "unassigned", reporter: "Field Officer L", time: "45m ago" },
]

export const MOCK_VOLUNTEERS = [
    { id: 1, name: "Priya Sharma",   skills: ["Medical","Counseling"], zone: "Dharavi",   available: true,  tasks: 2, reliability: 96 },
    { id: 2, name: "Rahul Mehta",    skills: ["Logistics","Driving"],  zone: "Kurla",     available: true,  tasks: 1, reliability: 88 },
    { id: 3, name: "Anita Desai",    skills: ["Teaching","Cooking"],   zone: "Chembur",   available: false, tasks: 3, reliability: 92 },
    { id: 4, name: "Vikram Singh",   skills: ["Construction","IT"],    zone: "Ghatkopar", available: true,  tasks: 0, reliability: 78 },
    { id: 5, name: "Sunita Patil",   skills: ["Medical","Driving"],    zone: "Powai",     available: true,  tasks: 1, reliability: 95 },
]

export const MOCK_STATS = {
    totalNeeds:       12,
    criticalNeeds:    4,
    volunteersActive: 18,
    resolvedToday:    7,
    peopleHelped:     1240,
    avgResponseTime:  "38 min",
}

export const MOCK_TASKS = [
    { id:1,  title:"Distribute food packets",   category:"food",     urgency:5, zone:"Dharavi",    volunteer:"Priya Sharma",  status:"unassigned", time:"2h ago"  },
    { id:2,  title:"Medical camp setup",        category:"medical",  urgency:4, zone:"Kurla West",  volunteer:"Rahul Mehta",   status:"assigned",   time:"3h ago"  },
    { id:3,  title:"Emergency shelter repair",  category:"shelter",  urgency:5, zone:"Chembur",     volunteer:"Vikram Singh",  status:"inprogress", time:"1h ago"  },
    { id:4,  title:"Water purification drive",  category:"water",    urgency:3, zone:"Ghatkopar",   volunteer:"Sunita Patil",  status:"completed",  time:"5h ago"  },
    { id:5,  title:"Child tutoring session",    category:"education",urgency:2, zone:"Mankhurd",    volunteer:"Anita Desai",   status:"assigned",   time:"1d ago"  },
    { id:6,  title:"Flood relief coordination", category:"shelter",  urgency:5, zone:"Vikhroli",    volunteer:"Priya Sharma",  status:"inprogress", time:"30m ago" },
    { id:7,  title:"Medicine delivery",         category:"medical",  urgency:4, zone:"Sion",        volunteer:"Rahul Mehta",   status:"unassigned", time:"4h ago"  },
    { id:8,  title:"Community kitchen",         category:"food",     urgency:3, zone:"Govandi",     volunteer:"Anita Desai",   status:"completed",  time:"6h ago"  },
    { id:9,  title:"Sanitation inspection",     category:"water",    urgency:4, zone:"Bhandup",     volunteer:"Vikram Singh",  status:"assigned",   time:"2h ago"  },
    { id:10, title:"Trauma support session",    category:"medical",  urgency:3, zone:"Trombay",     volunteer:"Sunita Patil",  status:"inprogress", time:"8h ago"  },
]

export const MOCK_ACTIVITY = [
    { id:1, type:"ai",        msg:"AI scored 3 new needs in Dharavi — 2 critical",      time:"2m ago",  color:"#dc2626" },
    { id:2, type:"assign",    msg:"Priya Sharma assigned to flood relief in Vikhroli",   time:"8m ago",  color:"#2563eb" },
    { id:3, type:"complete",  msg:"Water purification task completed in Ghatkopar",      time:"22m ago", color:"#16a34a" },
    { id:4, type:"submit",    msg:"Field Officer C submitted 12 new needs via bulk CSV", time:"35m ago", color:"#d97706" },
    { id:5, type:"ai",        msg:"Deduplication merged 5 overlapping food needs",       time:"1h ago",  color:"#7c3aed" },
    { id:6, type:"assign",    msg:"Rahul Mehta assigned to medical camp in Kurla",       time:"2h ago",  color:"#2563eb" },
    { id:7, type:"complete",  msg:"Community kitchen task verified in Govandi",          time:"3h ago",  color:"#16a34a" },
    { id:8, type:"submit",    msg:"Emergency flood report submitted — Zone 4 critical",  time:"4h ago",  color:"#dc2626" },
]

export const MOCK_CHART_DATA = [
    { day:"Mon", needs:8,  resolved:5  },
    { day:"Tue", needs:14, resolved:9  },
    { day:"Wed", needs:11, resolved:8  },
    { day:"Thu", needs:19, resolved:13 },
    { day:"Fri", needs:16, resolved:11 },
    { day:"Sat", needs:23, resolved:17 },
    { day:"Sun", needs:18, resolved:14 },
]