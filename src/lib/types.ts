export type DSP = {
  id: string
  name: string
  enabled: boolean
  icon?: string
  description: string
  apiEndpoint?: string
}

export type Account = {
  id: string
  name: string
}

export type FieldType = 
  | "text" 
  | "number" 
  | "select" 
  | "multi-select" 
  | "date" 
  | "datetime" 
  | "textarea" 
  | "url" 
  | "json"
  | "object"
  | "array"

export type Field = {
  id: string
  label: string
  type: FieldType
  required: boolean
  editable: boolean
  isActive: boolean
  options?: {label : string, value : string | number}[]
  uiHint?: "accordion" | "table" | string
  dataSource?: {
    type: "backend" | "api" | string
    endpoint: string
    valueKey: string
    labelKey: string
  }
  schema?: Field[]
}

export type LevelType = "campaign" | "adset" | "ad"

export type Campaign = {
  id: string
  name: string
  objective: string
  status: string
  budget_optimization?: string
  buying_type: string
  spend_cap?: number
  start_date?: string
  end_date?: string
  _draft?: boolean
  _edited?: boolean
  _error?: string
  _groupColor?: string
}

export type Adset = {
  id: string
  name: string
  campaign_id: string
  status: string
  optimization_goal: string
  billing_event: string
  bid_amount?: number
  daily_budget?: number
  lifetime_budget?: number
  targeting: string
  start_time?: string
  end_time?: string
  _draft?: boolean
  _edited?: boolean
  _error?: string
  _groupColor?: string
}

export type Ad = {
  id: string
  name: string
  adset_id: string
  status: string
  creative_type: string
  primary_text: string
  headline: string
  description?: string
  call_to_action: string
  destination_url: string
  media_url?: string
  _draft?: boolean
  _edited?: boolean
  _error?: string
  _groupColor?: string
}

export type BatchOperation = {
  operation_id: string
  operation_type: "create" | "edit"
  entity_type: LevelType
  client_id?: string
  platform_id?: string
  parent_ref?: {
    type: "client_id" | "platform_id"
    value: string
  }
  data: any
  // UI Meta
  id: string // keep internal ID for storage/deletion
  validationStatus: "pending" | "success" | "error"
  validationMessage?: string
  _groupColor?: string
}

export type Batch = {
  platform: string
  advertiser_id: string
  operations: BatchOperation[]
  options: {
    validate_only: boolean
  }
  // Internal UI meta
  id: string
  createdAt: Date
  status: "draft" | "submitted"
}
