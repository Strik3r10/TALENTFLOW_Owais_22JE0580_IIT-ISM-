import Dexie, { Table } from 'dexie';

export interface Job {
  id: string;
  title: string;
  slug: string;
  status: 'active' | 'archived';
  tags: string[];
  order: number;
  description?: string;
  requirements?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  stage: 'applied' | 'screen' | 'tech' | 'offer' | 'hired' | 'rejected';
  jobId: string;
  appliedAt: Date;
  updatedAt: Date;
  notes?: string;
  // Profile fields
  resume?: string; // URL or file reference
  linkedin?: string;
  portfolio?: string;
  experience?: string; // Years of experience or description
  skills?: string[]; // Array of skills
  education?: string;
  location?: string;
}

export interface CandidateTimeline {
  id: string;
  candidateId: string;
  stage: string;
  timestamp: Date;
  note?: string;
}

export interface Assessment {
  id: string;
  jobId: string;
  title: string;
  sections: AssessmentSection[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AssessmentSection {
  id: string;
  title: string;
  questions: AssessmentQuestion[];
}

export interface AssessmentQuestion {
  id: string;
  type: 'single-choice' | 'multi-choice' | 'short-text' | 'long-text' | 'numeric' | 'file-upload';
  question: string;
  required: boolean;
  options?: string[];
  min?: number;
  max?: number;
  maxLength?: number;
  conditionalLogic?: {
    dependsOn: string;
    condition: string;
    value: any;
  };
}

export interface AssessmentResponse {
  id: string;
  assessmentId: string;
  candidateId: string;
  responses: Record<string, any>;
  submittedAt: Date;
}

export class TalentFlowDB extends Dexie {
  jobs!: Table<Job>;
  candidates!: Table<Candidate>;
  candidateTimeline!: Table<CandidateTimeline>;
  assessments!: Table<Assessment>;
  assessmentResponses!: Table<AssessmentResponse>;

  constructor() {
    super('TalentFlowDB');
    this.version(1).stores({
      jobs: 'id, title, slug, status, order, createdAt',
      candidates: 'id, name, email, stage, jobId, appliedAt',
      candidateTimeline: 'id, candidateId, stage, timestamp',
      assessments: 'id, jobId, title, createdAt',
      assessmentResponses: 'id, assessmentId, candidateId, submittedAt'
    });
  }
}

export const db = new TalentFlowDB();
