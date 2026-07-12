import { StadiumSector, QueueItem, TaskItem, LostItem, IncidentReport } from "../types";

export const STADIUM_SECTORS: StadiumSector[] = [
  {
    id: "sec-a",
    name: "Sector A - North Gate (General Access)",
    crowdLevel: 35,
    status: "normal",
    description: "Primary entrance from northern transit hubs. Flow is stable.",
    gates: ["Gate N1", "Gate N2", "Gate N3"],
    amenities: {
      food: 6,
      restrooms: 8,
      accessibility: true
    }
  },
  {
    id: "sec-b",
    name: "Sector B - East Gate (Family & Hospitality)",
    crowdLevel: 75,
    status: "crowded",
    description: "East plaza connection. Higher flow due to family zone attractions.",
    gates: ["Gate E1", "Gate E2"],
    amenities: {
      food: 8,
      restrooms: 10,
      accessibility: true
    }
  },
  {
    id: "sec-c",
    name: "Sector C - South Gate (Supporters Zone)",
    crowdLevel: 92,
    status: "critical",
    description: "Supporters sector. Heavy congestion reported. Recommend alternate routes.",
    gates: ["Gate S1", "Gate S2", "Gate S3"],
    amenities: {
      food: 5,
      restrooms: 6,
      accessibility: false
    }
  },
  {
    id: "sec-d",
    name: "Sector D - West Gate (VIP & Media Hub)",
    crowdLevel: 45,
    status: "normal",
    description: "West gate terminal. Standard access for media, VIPs, and players.",
    gates: ["Gate W1", "Gate W2"],
    amenities: {
      food: 4,
      restrooms: 5,
      accessibility: true
    }
  }
];

export const INITIAL_QUEUES: QueueItem[] = [
  { id: "q-1", name: "North Plaza Security Checkpoint", type: "gate", waitMinutes: 8, status: "low", sectorId: "sec-a" },
  { id: "q-2", name: "Burger & Dogs - Block 102", type: "food", waitMinutes: 12, status: "medium", sectorId: "sec-a" },
  { id: "q-3", name: "Main Restroom Block - Sector B", type: "restroom", waitMinutes: 15, status: "medium", sectorId: "sec-b" },
  { id: "q-4", name: "East Gate Main Security", type: "gate", waitMinutes: 22, status: "high", sectorId: "sec-b" },
  { id: "q-5", name: "Taco Express - Block 215", type: "food", waitMinutes: 30, status: "high", sectorId: "sec-c" },
  { id: "q-6", name: "Restroom Row - Sector C", type: "restroom", waitMinutes: 35, status: "high", sectorId: "sec-c" },
  { id: "q-7", name: "South Gate Ultra Security", type: "gate", waitMinutes: 45, status: "high", sectorId: "sec-c" },
  { id: "q-8", name: "West Gate Security Terminal", type: "gate", waitMinutes: 5, status: "low", sectorId: "sec-d" },
  { id: "q-9", name: "Premium Lounge Buffet", type: "food", waitMinutes: 10, status: "low", sectorId: "sec-d" }
];

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: "task-1",
    title: "Clear South Gate Crowding Spillover",
    description: "Guide fans in overflow lines of Gate S2 towards Sector B gates where wait time is under 10 minutes.",
    location: "Sector C - Supporters Zone",
    priority: "high",
    status: "pending",
    timestamp: "10 mins ago"
  },
  {
    id: "task-2",
    title: "Sanitation Call: Sector B Block 104 restrooms",
    description: "Cleanliness incident reported by fans. Water spill near the accessible handrail requires prompt mopping.",
    location: "Sector B - East Gate",
    priority: "medium",
    status: "assigned",
    assignedTo: "Volunteer Team 4",
    timestamp: "15 mins ago"
  },
  {
    id: "task-3",
    title: "Emergency Wheelchair Assistance: Gate W1",
    description: "VIP fan requires an accessible lift coordinate from Gate W1 level up to Box Section 10.",
    location: "Sector D - West Gate",
    priority: "critical",
    status: "pending",
    timestamp: "2 mins ago"
  },
  {
    id: "task-4",
    title: "Distribute Multilingual Transit Brochures",
    description: "Hand out metro routing guides to international arriving fans outside North Gate station entrance.",
    location: "Sector A - North Gate",
    priority: "low",
    status: "completed",
    assignedTo: "Volunteer Team 1",
    timestamp: "45 mins ago"
  }
];

export const INITIAL_LOST_ITEMS: LostItem[] = [
  { id: "lost-1", itemName: "Leather Wallet (Black)", description: "Contains a French driver's license under name 'Pierre', blue stripe.", sectorFound: "Sector B", status: "reported", timestamp: "30 mins ago" },
  { id: "lost-2", itemName: "iPhone 15 Pro (Blue Case)", description: "Lock screen has a picture of a golden retriever dog. Vibrate is on.", sectorFound: "Sector A", status: "matched", timestamp: "1 hour ago" },
  { id: "lost-3", itemName: "FIFA Match Tickets (x3)", description: "Found on seat Row 12, seat 14. France vs Brazil match tickets.", sectorFound: "Sector C", status: "reported", timestamp: "5 mins ago" }
];

export const INITIAL_INCIDENTS: IncidentReport[] = [
  {
    id: "inc-1",
    type: "facility",
    sector: "Sector B - East Gate",
    description: "Slippery puddle of soda near restroom 3. Fans are avoiding it but it blocks the primary queue flow.",
    status: "dispatched",
    timestamp: "12 mins ago",
    aiPriority: "medium",
    aiRecommendation: "Sanitation team dispatched. Station safety warden near restrooms to redirect queue lanes."
  },
  {
    id: "inc-2",
    type: "crowd",
    sector: "Sector C - South Gate",
    description: "Large gathering chanting loudly near gate S1 entrance, causing bottlenecks for incoming general ticket holders.",
    status: "investigating",
    timestamp: "6 mins ago",
    aiPriority: "high",
    aiRecommendation: "Direct overflow traffic to S3 entrance lanes. Increase barrier line guidance to streamline flow."
  }
];

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español (Spanish)" },
  { code: "pt", label: "Português (Portuguese)" },
  { code: "fr", label: "Français (French)" },
  { code: "ar", label: "العربية (Arabic)" },
  { code: "de", label: "Deutsch (German)" },
  { code: "ja", label: "日本語 (Japanese)" }
];

export const EMERGENCY_SCENARIOS = [
  {
    id: "scen-1",
    title: "Supporter Congestion Blockage",
    description: "Sector C supporter group blocks Gate S1 main entrance corridor.",
    currentImpact: "Flow speed down to 5 fans/min. Line length back into the transit plaza exceeds 150m."
  },
  {
    id: "scen-2",
    title: "Inclement Weather Alert",
    description: "Severe lightning and high winds forecast within 15 minutes.",
    currentImpact: "Requires massive, orderly movement of 45,000 fans from open plazas into concourse underpasses."
  },
  {
    id: "scen-3",
    title: "Transit Delay Bottleneck",
    description: "Northern metro subway service suspended for 20 minutes post-match.",
    currentImpact: "Over 15,000 fans leaving Sector A simultaneously with zero outbound train capacities."
  }
];
