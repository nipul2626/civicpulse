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