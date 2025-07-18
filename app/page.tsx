"use client"

import { useState } from "react"
import { AnimatePresence } from "framer-motion"
import InitialFormStep from "@/components/steps/initial-form-step"
import ProfileFormStep from "@/components/steps/profile-form-step"
import ResultsStep from "@/components/steps/results-step"
import ComparisonStep from "@/components/steps/comparison-step"
import SummaryStep from "@/components/steps/summary-step"
import type { College, UserProfile, Step } from "@/types/college"

const mockColleges: College[] = [
  {
    id: "1",
    name: "University of Salford",
    country: "United Kingdom",
    flag: "🇬🇧",
    ranking: 95,
    tuitionFee: "₹36.8L", // This will be replaced by data from sheet
    avgPackage: "₹30.0 LPA",
    roi: "118%",
    tags: ["Scholarship Available", "Top Faculty"],
    admissionsOpen: true,
    liked: false, // was true
    color: "from-blue-500 to-purple-600",
    courseName: "",
    campus: "",
    category: "",
  },
  {
    id: "2",
    name: "Coventry University",
    country: "United Kingdom",
    flag: "🇬🇧",
    ranking: 197,
    tuitionFee: "₹24.0L", // This will be replaced by data from sheet
    avgPackage: "₹30.0 LPA",
    roi: "125%",
    tags: ["Global Recognition", "Diverse Community"],
    admissionsOpen: true,
    liked: false, // was true
    color: "from-emerald-500 to-teal-600",
    courseName: "",
    campus: "",
    category: "",
  },
  {
    id: "3",
    name: "University of Dundee",
    country: "United Kingdom",
    flag: "🇬🇧",
    ranking: 90,
    tuitionFee: "₹25.8L", // This will be replaced by data from sheet
    avgPackage: "₹30.0 LPA",
    roi: "116%",
    tags: ["Strong Alumni Network", "Research Excellence"],
    admissionsOpen: true,
    liked: false,
    color: "from-orange-500 to-red-600",
    courseName: "",
    campus: "",
    category: "",
  },
]

export default function CollegeFitApp() {
  const [currentStep, setCurrentStep] = useState<Step>("initial-form")
  const [formData, setFormData] = useState({
    phoneNumber: "",
    topPriority: "",
    name: "",
    email: "",
    collegeName: "",
    courseName: "",
    country: "",
    ieltsBand: "",
    budget: "",
    courseDuration: "",
    workExperience: "",
    gapYears: "",
    preparationStage: "",
    passportStatus: "",
    currentResidenceState: "",
    currentResidenceCity: "",
    studentFinance: "",
    mostImportantCriteria: "",
    secondImportantCriteria: "",
    familyIncome: "",
    financeMode: "",
    campus: "",
    category: "",
    preferredIntake: "",
    currency: "",
    applicationFee: "",
    tuitionFee: "",
    counselingStage: "",
    assignedCounsellor: "",
    welcomeCallDone: "",
  })
  const [colleges, setColleges] = useState(mockColleges)
  const [profileFetched, setProfileFetched] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [fetchError, setFetchError] = useState("")
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([])
  const [multipleEntries, setMultipleEntries] = useState<UserProfile[]>([])
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([])

  const handleNext = (step: Step) => {
    if (step === 'initial-form') {
      setFormData({
        phoneNumber: "",
        topPriority: "",
        name: "",
        email: "",
        collegeName: "",
        courseName: "",
        country: "",
        ieltsBand: "",
        budget: "",
        courseDuration: "",
        workExperience: "",
        gapYears: "",
        preparationStage: "",
        passportStatus: "",
        currentResidenceState: "",
        currentResidenceCity: "",
        studentFinance: "",
        mostImportantCriteria: "",
        secondImportantCriteria: "",
        familyIncome: "",
        financeMode: "",
        campus: "",
        category: "",
        preferredIntake: "",
        currency: "",
        applicationFee: "",
        tuitionFee: "",
        counselingStage: "",
        assignedCounsellor: "",
        welcomeCallDone: "",
      })
      setProfileFetched(false)
      setMultipleEntries([])
      setUserProfiles([])
      setSelectedForComparison([])
      setColleges(mockColleges)
    }
    setCurrentStep(step)
  }

  const handleBack = () => {
    const stepOrder: Step[] = ["welcome", "initial-form", "results", "comparison", "summary"]
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentStep === "results") {
      setFormData({
        phoneNumber: "",
        topPriority: "",
        name: "",
        email: "",
        collegeName: "",
        courseName: "",
        country: "",
        ieltsBand: "",
        budget: "",
        courseDuration: "",
        workExperience: "",
        gapYears: "",
        preparationStage: "",
        passportStatus: "",
        currentResidenceState: "",
        currentResidenceCity: "",
        studentFinance: "",
        mostImportantCriteria: "",
        secondImportantCriteria: "",
        familyIncome: "",
        financeMode: "",
        campus: "",
        category: "",
        preferredIntake: "",
        currency: "",
        applicationFee: "",
        tuitionFee: "",
        counselingStage: "",
        assignedCounsellor: "",
        welcomeCallDone: "",
      })
      setProfileFetched(false)
      setMultipleEntries([])
      setUserProfiles([])
      setSelectedForComparison([])
      setColleges(mockColleges)
      setCurrentStep("initial-form")
    } else if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1])
    }
  }

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  }

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 max-w-full sm:max-w-6xl w-full">
        <AnimatePresence mode="wait">
          {/* {currentStep === "welcome" && (
            <WelcomeStep
              key="welcome"
              pageVariants={pageVariants}
              pageTransition={pageTransition}
              onNext={handleNext}
            />
          )} */}

          {currentStep === "initial-form" && (
            <InitialFormStep
              key="initial-form"
              pageVariants={pageVariants}
              pageTransition={pageTransition}
              formData={formData}
              setFormData={setFormData}
              onNext={handleNext}
              onBack={handleBack}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              fetchError={fetchError}
              setFetchError={setFetchError}
              profileFetched={profileFetched}
              setProfileFetched={setProfileFetched}
              multipleEntries={multipleEntries}
              setMultipleEntries={setMultipleEntries}
              setUserProfiles={setUserProfiles}
              setColleges={setColleges}
            />
          )}

          {currentStep === "profile-form" && (
            <ProfileFormStep
              key="profile-form"
              pageVariants={pageVariants}
              pageTransition={pageTransition}
              formData={formData}
              multipleEntries={multipleEntries}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === "results" && (
            <ResultsStep
              key="results"
              pageVariants={pageVariants}
              pageTransition={pageTransition}
              colleges={colleges}
              selectedForComparison={selectedForComparison}
              setSelectedForComparison={setSelectedForComparison}
              userProfile={{
                name: formData.name || "Student",
                intendedMajor: formData.courseName || (formData as any).intendedMajor || "your major",
                country: formData.country || "your country",
                phone: formData.phoneNumber || "",
              }}
              onNext={handleNext}
              onBack={handleBack}
              onCollegeToggle={(id) => {
                setColleges((prevColleges) =>
                  prevColleges.map((college) => (college.id === id ? { ...college, liked: !college.liked } : college)),
                )
              }}
            />
          )}

          {currentStep === "comparison" && (
            <ComparisonStep
              key="comparison"
              pageVariants={pageVariants}
              pageTransition={pageTransition}
              colleges={colleges}
              selectedForComparison={selectedForComparison}
              onNext={handleNext}
              onBack={handleBack}
              tuitionFees={{}}
              rankingData={{}}
              userPhone={formData.phoneNumber || ""}
              onCollegeToggle={(id) => {
                setColleges((prevColleges) =>
                  prevColleges.map((college) => (college.id === id ? { ...college, liked: !college.liked } : college)),
                )
              }}
            />
          )}

          {currentStep === "summary" && (
            <SummaryStep
              key="summary"
              pageVariants={pageVariants}
              pageTransition={pageTransition}
              formData={formData}
              colleges={colleges}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
