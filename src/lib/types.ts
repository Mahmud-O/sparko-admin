export interface SelectOption {
  value: string;
  label: string;
}

export interface TermSection {
  title: string;
  content: string[];
}

export interface AuthData {
  id: string;
  code?: string;
  message: string;
  isAuthenticated: boolean;
  phoneNumber?: string;
  nationalId?: string;
  userType?: string;
  userName?: string;
  email?: string;
  roles: string[];
  token: string;
  errors: string[];
  refreshToken: string;
  refreshTokenExpiration: string;
}

export interface ReviewLogItem {
  targetId: string;
  requestType: string;
  name: string;
  organizationName: string;
  documentStatus: string;
  requestDate: string;
  status: string;
}

export interface ReviewLogsResponse {
  items: ReviewLogItem[];
  totalCount: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

export interface DocumentDetails {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSizeInMegabytes: number;
  documentStatus: string;
}

export interface OrgRequestDetails {
  userId: string;
  officialName: string;
  organizationType: string;
  sector: string;
  country: string;
  city: string;
  adminName: string;
  email: string;
  phoneNumber: string;
  applicationDate: string;
  documents: DocumentDetails[];
}

export interface TraineeRequestDetails {
  userId: string;
  name: string;
  nationalId: string;
  phoneNumber: string;
  email: string;
  country: string;
  city: string;
  classification: string;
  affiliationEntity: string;
  studySpecialization: string;
  interestedMajor: string;
  applicationDate: string;
}

export interface DecisionPayload {
  targetId: string;
  isApproved: boolean;
  rejectionReason?: string;
}

export interface ProgramRequestDetails {
  programId: string;
  programName: string;
  programType: string;
  targetAudience: string;
  startDate: string;
  endDate: string;
  applicationDate: string;
}

export interface PageData {
  title: string;
  description: string;
  stats: { label: string; value: string | number; icon: string; color: string; bg: string }[];
  columns: string[];
  rows: Record<string, any>[];
}

export interface DashboardCounters {
  pendingActions: {
    organizationApplications: number;
    usersUnderVerification: number;
    programsPendingPublication: number;
    joinRequests: number;
  };
  systemOverview: {
    activeOrganizations: {
      total: number;
      thisMonthIncrement: number;
    };
    activePrograms: {
      total: number;
      newCount: number;
    };
    activeTrainees: {
      total: number;
      thisWeekIncrement: number;
    };
    openTickets: {
      total: number;
      urgentCount: number;
    };
  };
}

export interface RecentEnrollment {
  id: string;
  userCode: string;
  userFullName: string;
  programName: string;
  organizationName: string;
  date: string;
  statusTag: 'NEW' | 'SENT_TO_ORGANIZATION' | 'PENDING_PAYMENT' | 'ACCEPTED';
}

export interface TopOrganization {
  rank: number;
  organizationName: string;
  completionRate: number;
  evaluationScore: number;
  totalPrograms: number;
  totalTrainees: number;
}

export interface TopProgram {
  programName: string;
  organizationName: string;
  usersCount: number;
  completionRate: number;
  evaluationScore: number;
  engagementRate: number;
}

export interface DigitalCardVerificationData {
  spkId: string;
  traineeName: string;
  photoUrl: string;
  status: 'Active' | 'Expired' | string;
  programName: string;
  programType: string;
  organizationName: string;
  universityName: string;
  startDate: string;
  endDate: string;
  duration: string;
  location: string;
  trainingLocationLink: string;
  supervisorName: string;
  evaluatorName: string;
}


