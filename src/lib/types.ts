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
