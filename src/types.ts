export type StakeholderRole = 'fan' | 'volunteer' | 'staff' | 'organizer';

export type SectorStatus = 'normal' | 'crowded' | 'congested' | 'critical';

export interface StadiumSector {
  id: string;
  name: string; // e.g. "Sector A - North Gate"
  crowdLevel: number; // 0 to 100
  status: SectorStatus;
  description: string;
  gates: string[];
  amenities: {
    food: number; // count of open vendors
    restrooms: number; // count of open blocks
    accessibility: boolean; // supports wheelchair access
  };
}

export interface QueueItem {
  id: string;
  name: string;
  type: 'food' | 'restroom' | 'gate';
  waitMinutes: number;
  status: 'low' | 'medium' | 'high';
  sectorId: string;
}

export interface IncidentReport {
  id: string;
  type: 'medical' | 'crowd' | 'security' | 'facility' | 'other';
  sector: string;
  description: string;
  status: 'reported' | 'investigating' | 'dispatched' | 'resolved';
  timestamp: string;
  aiPriority: 'low' | 'medium' | 'high' | 'critical';
  aiRecommendation: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  location: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'assigned' | 'completed';
  assignedTo?: string;
  timestamp: string;
}

export interface LostItem {
  id: string;
  itemName: string;
  description: string;
  sectorFound: string;
  status: 'reported' | 'matched' | 'claimed';
  timestamp: string;
}

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface SustainabilityMetrics {
  wasteRecycledKg: number;
  energySavedKwh: number;
  waterConservedLiters: number;
  publicTransportRatio: number; // e.g. 0.85
}
