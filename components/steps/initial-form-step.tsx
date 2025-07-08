"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Phone, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Step, UserProfile, College } from "@/types/college"
import Papa from "papaparse"

interface InitialFormStepProps {
  pageVariants: any
  pageTransition: any
  formData: any
  setFormData: (data: any) => void
  onNext: (step: Step) => void
  onBack: () => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  fetchError: string
  setFetchError: (error: string) => void
  profileFetched: boolean
  setProfileFetched: (fetched: boolean) => void
  multipleEntries: UserProfile[]
  setMultipleEntries: (entries: UserProfile[]) => void
  setUserProfiles: (profiles: UserProfile[]) => void
  setColleges: (colleges: College[]) => void
}

export default function InitialFormStep({
  pageVariants,
  pageTransition,
  formData,
  setFormData,
  onNext,
  onBack,
  isLoading,
  setIsLoading,
  fetchError,
  setFetchError,
  profileFetched,
  setProfileFetched,
  multipleEntries,
  setMultipleEntries,
  setUserProfiles,
  setColleges,
}: InitialFormStepProps) {
  // Helper function to convert GBP to INR
  const convertGBPToINR = (gbpAmount: string): string => {
    const exchangeRate = 116.81 // 1 GBP = 116.81 INR (approximate)

    // Extract numeric value from string like "£12,000" or "£450-650"
    if (gbpAmount.includes("-")) {
      // Handle range like "£450-650"
      const range = gbpAmount.replace("£", "").split("-")
      const min = Number.parseInt(range[0].replace(",", "")) * exchangeRate
      const max = Number.parseInt(range[1].replace(",", "")) * exchangeRate
      return `₹${(min / 1000).toFixed(0)}K-${(max / 1000).toFixed(0)}K`
    } else {
      // Handle single value like "£12,000"
      const numericValue = Number.parseInt(gbpAmount.replace(/[£,]/g, ""))
      const inrValue = numericValue * exchangeRate
      if (inrValue >= 100000) {
        return `₹${(inrValue / 100000).toFixed(1)}L`
      } else {
        return `₹${(inrValue / 1000).toFixed(0)}K`
      }
    }
  }

  // Parse CSV data with proper column mapping
  const parseCSV = (csvText: string): UserProfile[] => {
    const lines = csvText.trim().split("\n")
    const headers = lines[0].split(",").map((h) => h.trim())
  
    // Optional: log headers to debug mismatches
    console.log("CSV Headers:", headers)
  
    return lines
      .slice(1)
      .map((line) => {
        const values = line.split(",").map((v) => v.trim())
  
        const getValue = (columnName: string) => {
          const index = headers.indexOf(columnName)
          if (index === -1) {
            console.warn(`Missing column: ${columnName}`)
            return ""
          }
          return values[index] || ""
        }
  
        const profile: UserProfile = {
          phoneNumber: getValue("phoneNumber"),
          name: getValue("name"),
          email: getValue("email"),
          collegeName: getValue("Counsellor Recommendation - Pre User → College Name"),
          courseName: getValue("Counsellor Recommendation - Pre User → Course Name"),
          country: getValue("Counsellor Recommendation - Pre User → Country"),
          ieltsBand: getValue("Counsellor Recommendation - Pre User → Ielts Band"),
          budget: getValue("Pre User Counseling - Pre User → Budget"),
          courseDuration: getValue("Counsellor Recommendation - Pre User → Duration Of Course"),
          workExperience: getValue("Total Work Experience"),
          gapYears: getValue("Gap Years"),
          preparationStage: getValue("Preparation Stage"),
          passportStatus: getValue("Passport Status"),
          currentResidenceState: getValue("Current Residence State"),
          currentResidenceCity: getValue("Current Residence City"),
          studentFinance: getValue("Student Finance"),
          mostImportantCriteria: getValue("Most Important Criteria"),
          secondImportantCriteria: getValue("Second Important Criteria"),
          familyIncome: getValue("Family Income (Rs)"),
          financeMode: getValue("Finance Mode"),
          campus: getValue("Counsellor Recommendation - Pre User → Campus"),
          category: getValue("Counsellor Recommendation - Pre User → Category"),
          preferredIntake: getValue("Counsellor Recommendation - Pre User → Preferred Intake"),
          currency: getValue("Counsellor Recommendation - Pre User → Currency"),
          applicationFee: getValue("Counsellor Recommendation - Pre User → Application Fee"),
          tuitionFee: getValue("Counsellor Recommendation - Pre User → Tuition Fee"),
          counselingStage: getValue("Pre User Counseling - Pre User → Counseling Stage"),
          assignedCounsellor: getValue("Pre User Counseling - Pre User → Assigned Counsellor"),
          welcomeCallDone: getValue("Pre User Counseling - Pre User → Welcome Call Done"),
        }
  
        return profile
      })
      .filter((profile) => profile.phoneNumber !== "")
  }
  

  // Helper function to parse CSV with proper handling of quoted values
  const parseCSVLine = (line: string): string[] => {
    const result = []
    let current = ""
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === "," && !inQuotes) {
        result.push(current.trim())
        current = ""
      } else {
        current += char
      }
    }

    result.push(current.trim())
    return result
  }

  // Helper function to get country flag
  const getCountryFlag = (country: string): string => {
    const flags: { [key: string]: string } = {
      UK: "🇬🇧",
      "United Kingdom": "🇬🇧",
      USA: "🇺🇸",
      "United States": "🇺🇸",
      Canada: "🇨🇦",
      Australia: "🇦🇺",
      Germany: "🇩🇪",
      France: "🇫🇷",
      Netherlands: "🇳🇱",
      Ireland: "🇮🇪",
    }
    return flags[country] || "🌍"
  }

  // Helper function to get college color
  const getCollegeColor = (index: number): string => {
    const colors = [
      "from-blue-500 to-purple-600",
      "from-emerald-500 to-teal-600",
      "from-orange-500 to-red-600",
      "from-purple-500 to-pink-600",
      "from-green-500 to-blue-600",
      "from-yellow-500 to-orange-600",
    ]
    return colors[index % colors.length]
  }

  // Fetch tuition fees from the new sheet
  const fetchTuitionFees = async (): Promise<{ [key: string]: string }> => {
    try {
      const tuitionCsvUrl =
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJN8ViTO5QapqKK8cEXk6fxxIyLAFeZDvwchJRv5mkXxG_1xHIkPq_Fo5je-Nrt4iJYoMV0dYovpjm/pub?output=csv"

      const response = await fetch(tuitionCsvUrl)
      if (!response.ok) {
        throw new Error("Failed to fetch tuition fee data")
      }
      const csvText = await response.text()
      // console.log("Tuition CSV raw data:", csvText.substring(0, 500))

      const lines = csvText.trim().split("\n")
      const headers = parseCSVLine(lines[0])
      // console.log("Tuition CSV headers:", headers)

      const tuitionFees: { [key: string]: string } = {}

      lines.slice(1).forEach((line, index) => {
        const values = parseCSVLine(line)
        const collegeNameIndex = headers.findIndex((h) => h.toLowerCase().includes("college name"))
        const tuitionFeeIndex = headers.findIndex((h) => h.toLowerCase().includes("tuition fee per year inr"))

        // console.log(`Row ${index + 1}:`, values)
        // console.log(`College name index: ${collegeNameIndex}, Tuition fee index: ${tuitionFeeIndex}`)

        if (collegeNameIndex >= 0 && tuitionFeeIndex >= 0) {
          const collegeName = values[collegeNameIndex]?.trim() || ""
          const tuitionFee = values[tuitionFeeIndex]?.trim() || ""

          // console.log(`College: "${collegeName}", Tuition: "${tuitionFee}"`)

          if (collegeName && tuitionFee) {
            // Clean up the college name for better matching
            const cleanCollegeName = collegeName.toLowerCase().trim()
            tuitionFees[cleanCollegeName] = tuitionFee
            // Also store with original case
            tuitionFees[collegeName] = tuitionFee
          }
        }
      })

      // console.log("Final tuition fees mapping:", tuitionFees)
      return tuitionFees
    } catch (error) {
      console.error("Error fetching tuition fees:", error)
      return {}
    }
  }

  // Fetch living costs data from the new sheet
  const fetchLivingCosts = async (): Promise<{
    [key: string]: { accommodation: string; transportation: string; living_expense: string }
  }> => {
    try {
      // Using a corrected URL - you may need to update this with the correct sheet URL
      const livingCostsUrl =
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vRIiXlBnG9Vh2Gkvwnz4FDwE-aD1gpB3uWNtsUgrk5HV5Jd89KM5V0Jeb0It7867pbGSt8iD-UvmJIE/pub?output=csv"

      const response = await fetch(livingCostsUrl)
      if (!response.ok) {
        throw new Error("Failed to fetch living costs data")
      }
      const csvText = await response.text()
      // console.log("Living costs CSV raw data:", csvText.substring(0, 500))

      const lines = csvText.trim().split("\n")
      const headers = parseCSVLine(lines[0])
      // console.log("Living costs CSV headers:", headers)

      const livingCosts: { [key: string]: { accommodation: string; transportation: string; living_expense: string } } =
        {}

      lines.slice(1).forEach((line, index) => {
        const values = parseCSVLine(line)
        const countryIndex = headers.findIndex((h) => h.toLowerCase().includes("country"))
        const accommodationIndex = headers.findIndex((h) => h.toLowerCase().includes("accommodation"))
        const transportationIndex = headers.findIndex((h) => h.toLowerCase().includes("transportation"))
        const livingExpenseIndex = headers.findIndex((h) => h.toLowerCase().includes("living_expense"))

        if (countryIndex >= 0 && accommodationIndex >= 0 && transportationIndex >= 0 && livingExpenseIndex >= 0) {
          const country = values[countryIndex]?.trim() || ""
          const accommodation = values[accommodationIndex]?.trim() || ""
          const transportation = values[transportationIndex]?.trim() || ""
          const living_expense = values[livingExpenseIndex]?.trim() || ""

          if (country) {
            // Convert GBP to INR
            const accommodationINR = accommodation ? convertGBPToINR(accommodation) : "₹47K-68K/month"
            const transportationINR = transportation ? convertGBPToINR(transportation) : "₹10K-16K/month"
            const livingExpenseINR = living_expense ? convertGBPToINR(living_expense) : "₹12.6L/year"

            livingCosts[country.toLowerCase()] = {
              accommodation: accommodationINR,
              transportation: transportationINR,
              living_expense: livingExpenseINR,
            }
            // Also store with original case
            livingCosts[country] = {
              accommodation: accommodationINR,
              transportation: transportationINR,
              living_expense: livingExpenseINR,
            }
          }
        }
      })

      // console.log("Final living costs mapping:", livingCosts)
      return livingCosts
    } catch (error) {
      console.error("Error fetching living costs:", error)
      return {}
    }
  }

  // Fetch ranking data from the new sheet
  const fetchRankingData = async (): Promise<{
    [key: string]: { rank_value: string; rank_provider_name: string }
  }> => {
    try {
      const rankingUrl =
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vRIiXlBnG9Vh2Gkvwnz4FDwE-aD1gpB3uWNtsUgrk5HV5Jd89KM5V0Jeb0It7867pbGSt8iD-UvmJIE/pub?output=csv"

      const response = await fetch(rankingUrl)
      if (!response.ok) {
        throw new Error("Failed to fetch ranking data")
      }
      const csvText = await response.text()
      // console.log("Ranking CSV raw data:", csvText.substring(0, 500))

      const lines = csvText.trim().split("\n")
      const headers = parseCSVLine(lines[0])
      // console.log("Ranking CSV headers:", headers)

      const rankingData: { [key: string]: { rank_value: string; rank_provider_name: string } } = {}

      lines.slice(1).forEach((line, index) => {
        const values = parseCSVLine(line)
        const collegeNameIndex = headers.findIndex(
          (h) => h.toLowerCase().includes("college") || h.toLowerCase().includes("university"),
        )
        const rankValueIndex = headers.findIndex((h) => h.toLowerCase().includes("rank_value"))
        const rankProviderIndex = headers.findIndex((h) => h.toLowerCase().includes("rank_provider_name"))

        if (collegeNameIndex >= 0 && rankValueIndex >= 0 && rankProviderIndex >= 0) {
          const collegeName = values[collegeNameIndex]?.trim() || ""
          const rankValue = values[rankValueIndex]?.trim() || ""
          const rankProvider = values[rankProviderIndex]?.trim() || ""

          if (collegeName && rankValue && rankProvider) {
            const cleanCollegeName = collegeName.toLowerCase().trim()
            rankingData[cleanCollegeName] = {
              rank_value: rankValue,
              rank_provider_name: rankProvider,
            }
            // Also store with original case
            rankingData[collegeName] = {
              rank_value: rankValue,
              rank_provider_name: rankProvider,
            }
          }
        }
      })

      // console.log("Final ranking data mapping:", rankingData)
      return rankingData
    } catch (error) {
      console.error("Error fetching ranking data:", error)
      return {}
    }
  }

  // Helper function to find tuition fee for a college
  const findTuitionFee = (collegeName: string, tuitionFees: { [key: string]: string }): string => {
    if (!collegeName) return "₹25.0L"

    // Try exact match first
    if (tuitionFees[collegeName]) {
      return tuitionFees[collegeName]
    }

    // Try lowercase match
    const lowerName = collegeName.toLowerCase().trim()
    if (tuitionFees[lowerName]) {
      return tuitionFees[lowerName]
    }

    // Try partial matching
    for (const [key, value] of Object.entries(tuitionFees)) {
      if (key.toLowerCase().includes(lowerName) || lowerName.includes(key.toLowerCase())) {
        // console.log(`Found partial match: "${collegeName}" matched with "${key}"`)
        return value
      }
    }

    // console.log(`No tuition fee found for college: "${collegeName}"`)
    return "₹25.0L" // Default fallback
  }

  // Helper function to find ranking data for a college
  const findRankingData = (
    collegeName: string,
    rankingData: { [key: string]: { rank_value: string; rank_provider_name: string } },
  ): { rank_value: string; rank_provider_name: string } => {
    if (!collegeName) return { rank_value: "N/A", rank_provider_name: "N/A" }

    // Try exact match first
    if (rankingData[collegeName]) {
      return rankingData[collegeName]
    }

    // Try lowercase match
    const lowerName = collegeName.toLowerCase().trim()
    if (rankingData[lowerName]) {
      return rankingData[lowerName]
    }

    // Try partial matching
    for (const [key, value] of Object.entries(rankingData)) {
      if (key.toLowerCase().includes(lowerName) || lowerName.includes(key.toLowerCase())) {
        // console.log(`Found ranking match: "${collegeName}" matched with "${key}"`)
        return value
      }
    }

    // console.log(`No ranking data found for college: "${collegeName}"`)
    return { rank_value: "N/A", rank_provider_name: "N/A" }
  }

  // Fetch user data from Google Sheets CSV
  

  const fetchUserData = async () => {
    setIsLoading(true)
    setFetchError("")

    try {
      const csvUrl =
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vTRHmfpuqbSNh5d_U9_CvB7v0QDDYJ6fcT9f5Rjm15UY53AxJNkXM6Xl_oqk9n8jb2vEpb697O7aLYM/pub?output=csv"

      // Fetch all four datasets
      const [profileResponse, tuitionFees, livingCosts, rankingData] = await Promise.all([
        fetch(csvUrl),
        fetchTuitionFees(),
        fetchLivingCosts(),
        fetchRankingData(),
      ])

      if (!profileResponse.ok) {
        throw new Error("Failed to fetch data from Google Sheets")
      }
      const csvText = await profileResponse.text()

      const profiles = parseCSV(csvText)
      // console.log("Parsed profiles:", profiles)
      // console.log("CSV Headers:", csvText.split("\n")[0])
      // console.log("Tuition Fees:", tuitionFees)
      // console.log("Living Costs:", livingCosts)
      // console.log("Ranking Data:", rankingData)
      setUserProfiles(profiles)

      // Find all entries for this phone number
      // Helper function to clean phone numbers
      const normalizePhone = (num) => String(num || "").replace(/\D/g, "").trim()

      // Debug logs
      console.log("Normalized input phone:", normalizePhone(formData.phoneNumber))
      console.log("Available profile phones:", profiles.map((p) => normalizePhone(p.phoneNumber)))

      // Find all entries with matching phone number
      const userEntries = profiles.filter(
        (profile) => normalizePhone(profile.phoneNumber) === normalizePhone(formData.phoneNumber)
      )


      if (userEntries.length > 0) {
        // If multiple entries exist, store them for selection
        if (userEntries.length > 1) {
          setMultipleEntries(userEntries)
        }

        // Use the first entry
        const selectedProfile = userEntries[0]

        // Map the profile data to form data
        setFormData((prev: any) => ({
          ...prev,
          name: selectedProfile.name,
          email: selectedProfile.email,
          collegeName: selectedProfile.collegeName,
          courseName: selectedProfile.courseName,
          country: selectedProfile.country,
          ieltsBand: selectedProfile.ieltsBand,
          budget: selectedProfile.budget,
          courseDuration: selectedProfile.courseDuration,
          workExperience: selectedProfile.workExperience,
          gapYears: selectedProfile.gapYears,
          preparationStage: selectedProfile.preparationStage,
          passportStatus: selectedProfile.passportStatus,
          currentResidenceState: selectedProfile.currentResidenceState,
          currentResidenceCity: selectedProfile.currentResidenceCity,
          studentFinance: selectedProfile.studentFinance,
          mostImportantCriteria: selectedProfile.mostImportantCriteria,
          secondImportantCriteria: selectedProfile.secondImportantCriteria,
          familyIncome: selectedProfile.familyIncome,
          financeMode: selectedProfile.financeMode,
          campus: selectedProfile.campus,
          category: selectedProfile.category,
          preferredIntake: selectedProfile.preferredIntake,
          currency: selectedProfile.currency,
          applicationFee: selectedProfile.applicationFee,
          tuitionFee: selectedProfile.tuitionFee,
          counselingStage: selectedProfile.counselingStage,
          assignedCounsellor: selectedProfile.assignedCounsellor,
          welcomeCallDone: selectedProfile.welcomeCallDone,
        }))

        // Generate colleges based on user's data with tuition fees, living costs, and ranking data
        const generatedColleges = userEntries
          .map((entry, index) => {
            const collegeName = entry.collegeName || `University ${index + 1}`
            const tuitionFeeFromSheet = findTuitionFee(collegeName, tuitionFees)
            const countryLivingCosts = livingCosts[entry.country?.toLowerCase()] ||
              livingCosts[entry.country] || {
              accommodation: "₹47K-68K/month",
              transportation: "₹10K-16K/month",
              living_expense: "₹12.6L/year",
            }
            const collegeRankingData = findRankingData(collegeName, rankingData)

            // console.log(
            //   `Generating college: "${collegeName}" with tuition fee: "${tuitionFeeFromSheet}", living costs:`,
            //   countryLivingCosts,
            //   "and ranking data:",
            //   collegeRankingData,
            // )

            return {
              id: `user-${index}`,
              name: collegeName,
              country: entry.country || "Unknown",
              flag: getCountryFlag(entry.country),
              ranking: Math.floor(Math.random() * 200) + 50,
              tuitionFee: tuitionFeeFromSheet,
              avgPackage: "₹30.0 LPA",
              roi: "120%",
              tags: [entry.category || "Recommended", entry.campus || "Main Campus"],
              admissionsOpen: true,
              liked: false, // Always false, do not pre-like any
              color: getCollegeColor(index),
              courseName: entry.courseName,
              campus: entry.campus,
              category: entry.category,
              livingCosts: countryLivingCosts,
              rankingData: collegeRankingData,
            }
          })
          .filter((college) => college.name && college.name !== "University 1") // Filter out empty names

        // console.log("Generated colleges:", generatedColleges)

        if (generatedColleges.length > 0) {
          setColleges(generatedColleges)
        }

        // Automatically proceed to results step
        onNext("results")
      } else {
        setFetchError("No profile found for this phone number. Please check and try again.")
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      setFetchError("Unable to fetch profile data. Please check if the sheet is publicly accessible.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="max-w-4xl mx-auto"
    >
      <div className="mb-12">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-8 hover:bg-white/50 transition-all duration-300 hover:scale-105"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent mb-3">
              College Fit Analysis
            </h1>
            <p className="text-base md:text-lg text-gray-600 max-w-xl mx-auto">
              Let us find the perfect colleges tailored to your profile and aspirations
            </p>
          </motion.div>
        </div>
      </div>

      {!profileFetched ? (
        <Card className="p-6 md:p-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-900 to-pink-600 bg-clip-text text-transparent mb-2">
              {"Let's Get Started"}
            </h2>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-md mx-auto">
              Enter your details to fetch your profile and receive AI-powered personalized recommendations
            </p>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
              <Input
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phoneNumber}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, phoneNumber: e.target.value }))}
                className="w-full h-12 text-base rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-all duration-300 hover:border-gray-300 bg-white/50"
              />
            </motion.div>

            {fetchError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">{fetchError}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Button
                onClick={fetchUserData}
                className="w-full h-14 bg-[#443eff] hover:bg-[#3730d9] text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!formData.phoneNumber || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Fetching Profile Data...
                  </>
                ) : (
                  <>
                    <Phone className="w-5 h-5 mr-3" />
                    Fetch Profile Data
                  </>
                )}
              </Button>
            </motion.div>

            {/* Info about data source */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="bg-blue-50 border border-blue-200 rounded-xl p-4"
            >
              <h4 className="font-semibold text-blue-800 mb-2">📊 Data Source:</h4>
              <p className="text-sm text-blue-700">
                We'll fetch your counseling data including college recommendations, course preferences, budget, and more
                from our comprehensive database.
              </p>
            </motion.div>
          </div>
        </Card>
      ) : null}
    </motion.div>
  )
}
