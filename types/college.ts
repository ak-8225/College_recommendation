export interface UserProfile {
  phoneNumber: string
  name: string
  email: string
  collegeName: string
  courseName: string
  country: string
  ieltsBand: string
  budget: string
  courseDuration: string
  workExperience: string
  gapYears: string
  preparationStage: string
  passportStatus: string
  currentResidenceState: string
  currentResidenceCity: string
  studentFinance: string
  mostImportantCriteria: string
  secondImportantCriteria: string
  familyIncome: string
  financeMode: string
  campus: string
  category: string
  preferredIntake: string
  currency: string
  applicationFee: string
  tuitionFee: string
  counselingStage: string
  assignedCounsellor: string
  welcomeCallDone: string
}

export interface College {
  id: string
  name: string
  country: string
  flag: string
  ranking: number
  tuitionFee: string
  avgPackage: string
  roi: string
  tags: string[]
  admissionsOpen: boolean
  liked: boolean
  color: string
  courseName: string
  campus: string
  category: string
  livingCosts?: {
    accommodation: string
    transportation: string
    living_expense: string
  }
  rankingData?: {
    rank_value: string
    rank_provider_name: string
  }
  state?: string
  city?: string
}

export type Step = "welcome" | "initial-form" | "profile-form" | "results" | "analysis" | "summary" | "comparison" | "loading"
