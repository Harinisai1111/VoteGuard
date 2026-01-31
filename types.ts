
export enum UserRole {
  ELECTION_OFFICER = 'Election Officer',
  FIELD_OFFICER = 'SIR Field Officer',
  ADMIN = 'Administrator',
  MUNICIPAL_OFFICER = 'Municipal Corporation'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  district: string;
}

export interface AadhaarMetadata {
  initials: string;
  yob: number;
  stateCode: string;
  lastUpdatedYear: number;
  syncRevision: number;
  consistencyStatus: 'CONSISTENT' | 'PARTIAL' | 'INCONSISTENT';
  aadhaarIdHash: string;
}

export interface OtherIDMetadata {
  type: 'Passport' | 'PAN' | 'Driving License' | 'NPR';
  idNumber: string;
  nameOnId: string;
  dobOnId: string;
}

export interface FlagHistory {
  timestamp: string;
  resolvedBy: string;
  resolution: string;
  remarks: string;
  originalFlags: string[];
}

export interface Voter {
  id: string;
  name: string;
  age: number;
  dob: string;
  address: string;
  state: string;
  zone: string;
  district: string;
  pollingStation: string;
  lastVerifiedYear: number;
  riskScore: number;
  status: 'Active' | 'Shifted' | 'Deceased' | 'Not Found' | 'Pending Verification' | 'Duplicate';
  isFlagged: boolean;
  flaggedReasons: string[];
  aadhaarMeta?: AadhaarMetadata;
  otherIdMeta?: OtherIDMetadata; // Optional if Aadhaar is present
  isArchived: boolean;
  duplicateOf?: string;
  flaggedHistory?: FlagHistory[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
}
