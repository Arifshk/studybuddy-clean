export interface Session {
  id: string;
  courseCode: string;
  building: string;
  floor: string;
  capacity: number;
  attendeeCount: number;
  public: boolean;
  endsAt: string;
  host: {
    name: string;
    initials: string;
  };
  notes?: string;
  area?: string;
  duration: number;
  locationImages?: string[]; // Array of image URLs showing the study location
  scheduledDate?: Date; // Date when the session is scheduled to start
  startTime?: string; // Time in HH:MM format when session starts
  isScheduled?: boolean; // Whether this is a scheduled session (true) or immediate session (false)
}

export interface Course {
  code: string;
  name: string;
}

export interface Building {
  name: string;
}

export interface ReportData {
  sessionId: string;
  reason: string;
  details?: string;
}

export interface CreateSessionData {
  courseCode: string;
  building: string;
  floor: string;
  area?: string;
  capacity: number;
  duration: number;
  notes?: string;
  public: boolean;
  locationImages?: string[]; // Array of image URLs showing the study location
  scheduledDate?: Date; // Date when the session is scheduled to start
  startTime?: string; // Time in HH:MM format when session starts
  isScheduled?: boolean; // Whether this is a scheduled session (true) or immediate session (false)
}
