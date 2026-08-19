export type KycStatus =
  | "PENDING"
  | "APPROVED"
  | "CHANGES_REQUESTED"
  | "REJECTED"
  | "SUSPENDED";

export interface KycDocument {
  doc_id: string;
  status: string;
  doc_type: string;
  file_name: string;
  file_path: string;
}

export interface KycRecord {
  id: string;
  user_id: string;
  company_name: string;
  business_type: string;
  location: string;
  phone: string;
  currency: string;
  business_reg: string;
  tax_id: string;
  status: KycStatus;
  documents: KycDocument[];
  audit_reasons: string[];
  created_at: string;
  updated_at: string;
}
