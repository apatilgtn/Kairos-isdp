// KAIROS - Intelligent Strategic Document Platform Types

export interface User {
  uid: string;
  email: string;
  name: string;
  createdTime: number;
  lastLoginTime: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface MVPProject {
  _id: string;
  _uid: string;
  _tid: string;
  name: string;
  industry: string;
  problem_statement: string;
  status: 'draft' | 'active' | 'completed' | 'paused';
  created_at: number;
  updated_at: number;
}

export interface RoadmapDocument {
  _id: string;
  _uid: string;
  _tid: string;
  project_id: string;
  document_type: 'roadmap' | 'elevator_pitch' | 'model_advice' | 'diagram' | 'business_case' | 'feasibility_study' | 'project_charter' | 'scope_statement' | 'rfp';
  title: string;
  content: string;
  generated_at: number;
  status: 'generated' | 'exported' | 'shared';
  phase?: 'justification' | 'definition' | 'procurement' | 'planning' | 'execution';
}

export interface UserDiagram {
  _id: string;
  _uid: string;
  _tid: string;
  project_id: string;
  diagram_type: 'flowchart' | 'sequence' | 'gantt' | 'user_journey' | 'class' | 'state';
  title: string;
  mermaid_code: string;
  created_at: number;
}

export interface AIGenerationRequest {
  type: 'roadmap' | 'elevator_pitch' | 'model_advice' | 'business_case' | 'feasibility_study' | 'project_charter' | 'scope_statement' | 'rfp';
  project: MVPProject;
  context?: string;
}

export interface AIGenerationResponse {
  success: boolean;
  content: string;
  error?: string;
  model_used?: string;
  generation_time?: number;
  token_count?: number;
  persona_used?: string;
  quality_score?: number;
  suggestions?: string[];
  improvements?: string[];
}

export interface ExportOptions {
  format: 'markdown' | 'docx' | 'pdf';
  includeTitle: boolean;
  includeMetadata: boolean;
}

export interface DiagramTemplate {
  id: string;
  name: string;
  type: UserDiagram['diagram_type'];
  description: string;
  template: string;
}

export interface NotificationMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  duration?: number;
}

export interface AppStore {
  // Auth
  auth: AuthState;
  setAuth: (auth: Partial<AuthState>) => void;
  login: (email: string, verificationCode: string) => Promise<User>;
  logout: () => Promise<void>;
  
  // Projects
  projects: MVPProject[];
  selectedProject: MVPProject | null;
  isLoading: boolean;
  error: string | null;
  
  setProjects: (projects: MVPProject[]) => void;
  setSelectedProject: (project: MVPProject | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Documents & Diagrams
  documents: RoadmapDocument[];
  diagrams: UserDiagram[];
  setDocuments: (documents: RoadmapDocument[]) => void;
  setDiagrams: (diagrams: UserDiagram[]) => void;
  
  // Notifications
  notifications: NotificationMessage[];
  addNotification: (notification: Omit<NotificationMessage, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // UI State
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

// API Response types
export interface GetItemsResponse<T> {
  items: T[];
  nextCursor?: string;
  indexName?: string;
}

export interface ProjectWithDocuments extends MVPProject {
  documents: RoadmapDocument[];
  diagrams: UserDiagram[];
}

// Team collaboration types
export interface Team {
  _id: string;
  _uid: string;
  _tid: string;
  name: string;
  description: string;
  owner_id: string;
  created_at: number;
  settings: TeamSettings;
  status: 'active' | 'inactive' | 'suspended';
}

export interface TeamSettings {
  allow_member_invites: boolean;
  require_approval_for_projects: boolean;
  default_project_visibility: 'team' | 'members' | 'private';
  notification_preferences: NotificationSettings;
}

export interface NotificationSettings {
  project_updates: boolean;
  new_members: boolean;
  document_generation: boolean;
  mentions: boolean;
  email_notifications: boolean;
}

export interface TeamMember {
  _id: string;
  _uid: string;
  _tid: string;
  team_id: string;
  user_id: string;
  role: TeamRole;
  joined_at: number;
  invited_by: string;
  status: 'active' | 'invited' | 'suspended';
  permissions: TeamPermissions;
}

export type TeamRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface TeamPermissions {
  can_create_projects: boolean;
  can_edit_projects: boolean;
  can_delete_projects: boolean;
  can_invite_members: boolean;
  can_manage_members: boolean;
  can_manage_team_settings: boolean;
  can_export_documents: boolean;
  can_generate_documents: boolean;
}

export interface TeamInvitation {
  _id: string;
  _uid: string;
  _tid: string;
  team_id: string;
  email: string;
  role: Exclude<TeamRole, 'owner'>;
  invited_by: string;
  invited_at: number;
  expires_at: number;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  token: string;
}

export interface TeamActivity {
  _id: string;
  _uid: string;
  _tid: string;
  team_id: string;
  user_id: string;
  action_type: ActivityType;
  resource_type: 'project' | 'document' | 'member' | 'team';
  resource_id: string;
  details: ActivityDetails;
  timestamp: number;
}

export type ActivityType = 
  | 'project_created'
  | 'project_updated'
  | 'project_deleted'
  | 'document_generated'
  | 'document_updated'
  | 'member_invited'
  | 'member_joined'
  | 'member_left'
  | 'member_role_changed'
  | 'team_settings_updated'
  | 'team_created';

export interface ActivityDetails {
  [key: string]: any;
  user_name?: string;
  project_name?: string;
  document_type?: string;
  old_role?: TeamRole;
  new_role?: TeamRole;
}

// Real-time collaboration types
export interface DocumentEdit {
  id: string;
  document_id: string;
  user_id: string;
  user_name: string;
  type: EditType;
  position: number;
  length: number;
  content: string;
  timestamp: number;
  version: number;
}

export type EditType = 'insert' | 'delete' | 'replace';

export interface DocumentVersion {
  _id: string;
  _uid: string;
  _tid: string;
  document_id: string;
  version: number;
  content: string;
  author_id: string;
  author_name: string;
  changes_summary: string;
  created_at: number;
  is_major: boolean;
}

export interface DocumentLock {
  _id: string;
  _uid: string;
  _tid: string;
  document_id: string;
  locked_by: string;
  locked_by_name: string;
  locked_at: number;
  expires_at: number;
  section?: string; // Optional section-based locking
}

export interface UserPresence {
  user_id: string;
  user_name: string;
  user_avatar?: string;
  document_id: string;
  cursor_position: number;
  selection_start?: number;
  selection_end?: number;
  last_active: number;
  is_editing: boolean;
  current_section?: string;
}

export interface CollaborativeSession {
  id: string;
  document_id: string;
  participants: UserPresence[];
  active_edits: DocumentEdit[];
  current_version: number;
  last_sync: number;
  conflict_resolution: 'manual' | 'auto_merge' | 'last_write_wins';
}

export interface DocumentComment {
  _id: string;
  _uid: string;
  _tid: string;
  document_id: string;
  author_id: string;
  author_name: string;
  content: string;
  position: number;
  selection_text: string;
  created_at: number;
  updated_at?: number;
  resolved: boolean;
  resolved_by?: string;
  thread_id?: string;
  parent_comment_id?: string;
}

export interface CollaborationState {
  activeSessions: Map<string, CollaborativeSession>;
  documentVersions: Map<string, DocumentVersion[]>;
  documentLocks: Map<string, DocumentLock>;
  userPresence: Map<string, UserPresence>;
  comments: Map<string, DocumentComment[]>;
  pendingEdits: Map<string, DocumentEdit[]>;
  conflictResolution: 'manual' | 'auto_merge' | 'last_write_wins';
}

// Business Document Types
export interface BusinessCase {
  executive_summary: string;
  problem_statement: string;
  proposed_solution: string;
  financial_analysis: FinancialAnalysis;
  risk_assessment: string;
  success_criteria: string[];
  stakeholder_impact: string;
  timeline: string;
  recommendation: string;
}

export interface FinancialAnalysis {
  initial_investment: number;
  operational_costs: number;
  projected_revenue: number;
  roi_percentage: number;
  payback_period: string;
  net_present_value: number;
}

export interface FeasibilityStudy {
  technical_feasibility: FeasibilitySection;
  financial_feasibility: FeasibilitySection;
  operational_feasibility: FeasibilitySection;
  legal_feasibility: FeasibilitySection;
  market_feasibility: FeasibilitySection;
  overall_assessment: string;
  recommendations: string[];
  next_steps: string[];
}

export interface FeasibilitySection {
  assessment: 'high' | 'medium' | 'low';
  description: string;
  risks: string[];
  mitigation_strategies: string[];
}

export interface ProjectCharter {
  project_name: string;
  project_manager: string;
  project_sponsor: string;
  business_case_summary: string;
  project_objectives: string[];
  success_criteria: string[];
  high_level_scope: string;
  exclusions: string[];
  assumptions: string[];
  constraints: string[];
  stakeholders: Stakeholder[];
  authority_level: string;
  budget_estimate: string;
  timeline: string;
  approval_requirements: string[];
}

export interface Stakeholder {
  name: string;
  role: string;
  influence: 'high' | 'medium' | 'low';
  interest: 'high' | 'medium' | 'low';
  communication_needs: string;
}

export interface ScopeStatement {
  project_description: string;
  deliverables: Deliverable[];
  acceptance_criteria: string[];
  exclusions: string[];
  assumptions: string[];
  constraints: string[];
  work_breakdown_structure: WBSItem[];
}

export interface Deliverable {
  name: string;
  description: string;
  acceptance_criteria: string[];
  due_date: string;
  responsible_party: string;
}

export interface WBSItem {
  id: string;
  name: string;
  description: string;
  level: number;
  parent_id?: string;
  deliverable: string;
  effort_estimate: string;
}

export interface RFPDocument {
  title: string;
  background: string;
  project_overview: string;
  scope_of_work: string;
  requirements: Requirement[];
  evaluation_criteria: EvaluationCriteria[];
  proposal_format: string[];
  timeline: RFPTimeline;
  budget_information: string;
  vendor_qualifications: string[];
  submission_requirements: string[];
  contact_information: string;
}

export interface Requirement {
  id: string;
  category: 'functional' | 'technical' | 'performance' | 'security' | 'compliance';
  priority: 'must-have' | 'should-have' | 'nice-to-have';
  description: string;
  acceptance_criteria: string[];
}

export interface EvaluationCriteria {
  criterion: string;
  weight: number;
  description: string;
  scoring_method: string;
}

export interface RFPTimeline {
  rfp_issue_date: string;
  vendor_questions_due: string;
  answers_published: string;
  proposals_due: string;
  evaluation_period: string;
  vendor_selection: string;
  contract_award: string;
}

// RFP vs RFQ Comparison Types
export interface ProcurementComparison {
  rfp: ProcurementOption;
  rfq: ProcurementOption;
  recommendation: ProcurementRecommendation;
}

export interface ProcurementOption {
  name: string;
  primary_focus: string;
  when_to_use: string;
  vendor_role: string;
  decision_based_on: string;
  complexity: string;
  typical_timeline: string;
  example_scenarios: string[];
}

export interface ProcurementRecommendation {
  recommended_approach: 'RFP' | 'RFQ' | 'Both' | 'Neither';
  reasoning: string;
  key_considerations: string[];
  next_steps: string[];
}

// Document Phase Organization
export interface DocumentPhase {
  name: string;
  description: string;
  document_types: RoadmapDocument['document_type'][];
  typical_sequence: number;
  prerequisites?: string[];
  outcomes: string[];
}

export const DOCUMENT_PHASES: DocumentPhase[] = [
  {
    name: 'Justification',
    description: 'Establish business need and project viability',
    document_types: ['business_case', 'feasibility_study'],
    typical_sequence: 1,
    outcomes: ['Approved business case', 'Confirmed project viability']
  },
  {
    name: 'Definition & Authority',
    description: 'Define project scope and establish governance',
    document_types: ['project_charter', 'scope_statement'],
    typical_sequence: 2,
    prerequisites: ['Approved business case'],
    outcomes: ['Authorized project manager', 'Clear project boundaries']
  },
  {
    name: 'Procurement & Planning',
    description: 'Acquire resources and plan execution approach',
    document_types: ['rfp', 'roadmap'],
    typical_sequence: 3,
    prerequisites: ['Project charter', 'Scope statement'],
    outcomes: ['Selected vendors', 'Detailed project plan']
  },
  {
    name: 'Planning & Strategy',
    description: 'Develop detailed execution strategy and market positioning',
    document_types: ['roadmap', 'elevator_pitch', 'model_advice'],
    typical_sequence: 4,
    prerequisites: ['Project scope defined'],
    outcomes: ['Comprehensive roadmap', 'Market strategy', 'Technical architecture']
  }
];

// Enterprise Integration Types
export interface EnterpriseIntegration {
  id: string;
  name: string;
  type: IntegrationType;
  status: IntegrationStatus;
  configuration: IntegrationConfig;
  last_sync?: number;
  created_at: number;
  updated_at: number;
}

export type IntegrationType = 'sharepoint' | 'confluence' | 'teams' | 'slack' | 'notion';

export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'syncing';

export interface IntegrationConfig {
  site_url?: string;
  space_key?: string;
  folder_path?: string;
  auth_token?: string;
  refresh_token?: string;
  expires_at?: number;
  default_permissions?: string[];
  auto_sync?: boolean;
  sync_frequency?: 'real_time' | 'hourly' | 'daily' | 'manual';
}

export interface SharePointConfig extends IntegrationConfig {
  site_url: string;
  document_library: string;
  folder_path: string;
  content_type?: string;
}

export interface ConfluenceConfig extends IntegrationConfig {
  base_url: string;
  space_key: string;
  parent_page_id?: string;
  template_id?: string;
}

export interface ExportJob {
  _id: string;
  _uid: string;
  _tid: string;
  project_id: string;
  document_ids: string[];
  integration_id: string;
  integration_type: IntegrationType;
  export_format: ExportFormat;
  status: ExportStatus;
  progress: number;
  total_documents: number;
  processed_documents: number;
  export_results: ExportResult[];
  error_message?: string;
  started_at: number;
  completed_at?: number;
  exported_urls?: string[];
  settings?: Record<string, any>;
  summary?: string;
}

export type ExportFormat = 'native' | 'word' | 'pdf' | 'markdown' | 'html';

export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface ExportResult {
  document_id: string;
  document_type: string;
  status: 'success' | 'failed';
  exported_url?: string;
  error_message?: string;
  file_size?: number;
  export_time: number;
}

export interface BatchExportOptions {
  integration_id: string;
  document_ids: string[];
  export_format: ExportFormat;
  destination_folder?: string;
  include_attachments?: boolean;
  preserve_formatting?: boolean;
  add_metadata?: boolean;
  notification_preferences?: NotificationPreference[];
}

export interface NotificationPreference {
  type: 'email' | 'in_app' | 'webhook';
  enabled: boolean;
  settings?: Record<string, any>;
}

export interface EnterpriseSettings {
  _id: string;
  _uid: string;
  _tid: string;
  default_integration?: string;
  auto_export_enabled: boolean;
  export_retention_days: number;
  allowed_integrations: IntegrationType[];
  security_settings: SecuritySettings;
  compliance_settings: ComplianceSettings;
}

export interface SecuritySettings {
  require_approval: boolean;
  approved_domains: string[];
  encryption_required: boolean;
  audit_logging: boolean;
  access_control_enabled: boolean;
}

export interface ComplianceSettings {
  data_residency: string[];
  retention_policy: string;
  privacy_level: 'public' | 'internal' | 'confidential' | 'restricted';
  compliance_standards: string[];
}