export type DSP = {
  id: string
  name: string
  enabled: boolean
  icon: string
  description: string
  apiEndpoint: string
}

export type Account = {
  id: string
  name: string
  industry: string
}

export type FieldType = "text" | "number" | "select" | "date" | "datetime" | "textarea" | "url" | "json"

export type Field = {
  id: string
  label: string
  type: FieldType
  required: boolean
  editable: boolean
  visible: boolean
  options?: string[]
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

export type BatchItem = {
  id: string
  type: LevelType
  action: "create" | "update"
  data: Campaign | Adset | Ad
  validationStatus: "pending" | "success" | "error"
  validationMessage?: string
}

export type Batch = {
  id: string
  items: BatchItem[]
  createdAt: Date
  status: "draft" | "submitted"
}
