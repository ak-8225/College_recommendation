
"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Phone, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Step, UserProfile, College } from "@/types/college"
import Papa from "papaparse"
import { useRef, useState, useEffect } from "react"

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
  const fetchStartTimeRef = useRef<number | null>(null)

  // Career aspirations options
  const CAREER_OPTIONS = [
    { value: 'get_job', label: 'Get a job' },
    { value: 'get_pr', label: 'Get PR/settle in abroad' },
    { value: 'return_india', label: 'Return to India' },
    { value: 'research_phd', label: 'Research/PhD etc.' },
  ];
  // College parameters options
  const PARAM_OPTIONS = [
    { value: 'cost_budget', label: 'Cost/Budget' },
    { value: 'research_opportunities', label: 'Research opportunities' },
    { value: 'job_opportunities', label: 'Job opportunities / Recruits' },
    { value: 'alum_network', label: 'Alum network' },
    { value: 'locations', label: 'Locations' },
    { value: 'quality_education', label: 'Quality of Education' },
  ];
  // Dropdown state for new questions
  const [careerOpen, setCareerOpen] = useState(false);
  const [paramOpen, setParamOpen] = useState(false);

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

  // Helper function to parse CSV line handling quoted values
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

      const response = await fetch(tuitionCsvUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/csv',
          'Content-Type': 'text/csv',
        },
        mode: 'cors',
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch tuition fee data: ${response.status}`)
      }

      const csvText = await response.text()
      console.log("Tuition CSV raw data:", csvText.substring(0, 500))

      const lines = csvText.trim().split("\n")
      const headers = parseCSVLine(lines[0])
      console.log("Tuition CSV headers:", headers)

      const tuitionFees: { [key: string]: string } = {}

      lines.slice(1).forEach((line, index) => {
        const values = parseCSVLine(line)
        const collegeNameIndex = headers.findIndex((h) => h.toLowerCase().includes("college name"))
        const tuitionFeeIndex = headers.findIndex((h) => h.toLowerCase().includes("tuition fee per year inr"))

        if (collegeNameIndex >= 0 && tuitionFeeIndex >= 0) {
          const collegeName = values[collegeNameIndex]?.trim() || ""
          const tuitionFee = values[tuitionFeeIndex]?.trim() || ""

          if (collegeName && tuitionFee) {
            const cleanCollegeName = collegeName.toLowerCase().trim()
            tuitionFees[cleanCollegeName] = tuitionFee
            tuitionFees[collegeName] = tuitionFee
          }
        }
      })

      console.log("Final tuition fees mapping:", tuitionFees)
      return tuitionFees
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching tuition fees:", error.message)
      } else {
        console.error("Error fetching tuition fees:", error)
      }
      return {}
    }
  }

  // Fetch living costs data from the new sheet
  const fetchLivingCosts = async (): Promise<{
    [key: string]: { accommodation: string; transportation: string; living_expense: string }
  }> => {
    try {
      const livingCostsUrl =
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vRIiXlBnG9Vh2Gkvwnz4FDwE-aD1gpB3uWNtsUgrk5HV5Jd89KM5V0Jeb0It7867pbGSt8iD-UvmJIE/pub?output=csv"

      const response = await fetch(livingCostsUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/csv',
          'Content-Type': 'text/csv',
        },
        mode: 'cors',
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch living costs data: ${response.status}`)
      }

      const csvText = await response.text()
      console.log("Living costs CSV raw data:", csvText.substring(0, 500))

      const lines = csvText.trim().split("\n")
      const headers = parseCSVLine(lines[0])
      console.log("Living costs CSV headers:", headers)

      const livingCosts: { [key: string]: { accommodation: string; transportation: string; living_expense: string } } = {}

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
            const accommodationINR = accommodation ? convertGBPToINR(accommodation) : "₹47K-68K/month"
            const transportationINR = transportation ? convertGBPToINR(transportation) : "₹10K-16K/month"
            const livingExpenseINR = living_expense ? convertGBPToINR(living_expense) : "₹12.6L/year"

            livingCosts[country.toLowerCase()] = {
              accommodation: accommodationINR,
              transportation: transportationINR,
              living_expense: livingExpenseINR,
            }
            livingCosts[country] = {
              accommodation: accommodationINR,
              transportation: transportationINR,
              living_expense: livingExpenseINR,
            }
          }
        }
      })

      console.log("Final living costs mapping:", livingCosts)
      return livingCosts
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching living costs:", error.message)
      } else {
        console.error("Error fetching living costs:", error)
      }
      return {}
    }
  }

  // Update the fetchRankingData function with better error handling and fallbacks
  const fetchRankingData = async (): Promise<{
    [key: string]: { rank_value: string; rank_provider_name: string; ranking_type_name: string }[]
  }> => {
    try {
      const rankingUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRkmC4IzWoxar8tQ0yoL1aXkwWzuvgEZJX6AZIQ3Ph0f7cQdADVKOsI84seuQPXcxko4TNTtJ-0UJVr/pub?output=csv"

      const response = await fetch(rankingUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/csv, application/json',
          'Content-Type': 'text/csv',
        },
        mode: 'cors',
        cache: 'no-cache' // Prevent caching issues
      })

      if (!response.ok) {
        console.warn(`Ranking data fetch failed with status ${response.status}. Using fallback data.`);
        // Return fallback data instead of throwing
        return {
          "universityofoxford": [{
            rank_value: "5",
            rank_provider_name: "QS Rankings",
            ranking_type_name: "World University Rankings"
          }],
          "universityofcambridge": [{
            rank_value: "3",
            rank_provider_name: "QS Rankings",
            ranking_type_name: "World University Rankings"
          }],
          "imperialcollegelondon": [{
            rank_value: "8",
            rank_provider_name: "QS Rankings",
            ranking_type_name: "World University Rankings"
          }],
          "universitycollegelondon": [{
            rank_value: "9",
            rank_provider_name: "QS Rankings",
            ranking_type_name: "World University Rankings"
          }]
        };
      }

      const csvText = await response.text()
      console.log("Ranking CSV raw data:", csvText.substring(0, 500))

      const lines = csvText.trim().split("\n")
      const headers = parseCSVLine(lines[0])
      console.log("Ranking CSV headers:", headers)

      function normalizeCollegeName(name: string) {
        return String(name)
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '');
      }

      const rankingData: { [key: string]: { rank_value: string; rank_provider_name: string; ranking_type_name: string }[] } = {}

      lines.slice(1).forEach((line, index) => {
        const values = parseCSVLine(line)
        const collegeNameIndex = headers.findIndex(
          (h) => h.toLowerCase().includes("university_name")
        )
        const rankValueIndex = headers.findIndex((h) => h.toLowerCase().includes("rank_value"))
        const rankProviderIndex = headers.findIndex((h) => h.toLowerCase().includes("rank_provider_name"))
        const rankingTypeIndex = headers.findIndex((h) => h.toLowerCase().includes("ranking_type_name"))

        if (collegeNameIndex >= 0 && rankValueIndex >= 0 && rankProviderIndex >= 0 && rankingTypeIndex >= 0) {
          const collegeName = values[collegeNameIndex]?.trim() || ""
          const rankValue = values[rankValueIndex]?.trim() || ""
          const rankProvider = values[rankProviderIndex]?.trim() || ""
          const rankingType = values[rankingTypeIndex]?.trim() || ""

          if (collegeName && rankValue && rankProvider) {
            const normalizedCollegeName = normalizeCollegeName(collegeName)
            if (!rankingData[normalizedCollegeName]) {
              rankingData[normalizedCollegeName] = []
            }
            rankingData[normalizedCollegeName].push({
              rank_value: rankValue,
              rank_provider_name: rankProvider,
              ranking_type_name: rankingType,
            })
          }
        }
      })

      console.log("Final ranking data mapping:", rankingData)
      return rankingData
    } catch (error) {
      console.warn("Error fetching ranking data, using fallback:", error);
      // Return fallback data instead of empty object
      return {
        "universityofoxford": [{
          rank_value: "5",
          rank_provider_name: "QS Rankings",
          ranking_type_name: "World University Rankings"
        }],
        "universityofcambridge": [{
          rank_value: "3",
          rank_provider_name: "QS Rankings",
          ranking_type_name: "World University Rankings"
        }],
        "imperialcollegelondon": [{
          rank_value: "8",
          rank_provider_name: "QS Rankings",
          ranking_type_name: "World University Rankings"
        }],
        "universitycollegelondon": [{
          rank_value: "9",
          rank_provider_name: "QS Rankings",
          ranking_type_name: "World University Rankings"
        }]
      };
    }
  };

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
        console.log(`Found partial match: "${collegeName}" matched with "${key}"`)
        return value
      }
    }

    console.log(`No tuition fee found for college: "${collegeName}"`)
    return "₹25.0L" // Default fallback
  }

  // Helper function to find ranking data for a college
  const findRankingData = (
    collegeName: string,
    rankingData: { [key: string]: { rank_value: string; rank_provider_name: string; ranking_type_name?: string }[] },
  ): { rank_value: string; rank_provider_name: string; ranking_type_name?: string } => {
    if (!collegeName) return { rank_value: "N/A", rank_provider_name: "N/A", ranking_type_name: "N/A" };

    function normalizeCollegeName(name: string) {
      return String(name)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, ''); // remove all non-alphanumeric
    }

    const normalizedInput = normalizeCollegeName(collegeName);

    // Find all matches for this college
    const matches = Object.entries(rankingData)
      .filter(([key]) => key.includes(normalizedInput))
      .flatMap(([, values]) => values);

    // Prefer QS Rankings (World Ranking)
    const qsMatch = matches.find(row =>
      row.rank_provider_name?.toLowerCase().includes('qs') &&
      row.ranking_type_name?.toLowerCase().includes('world')
    );
    if (qsMatch && qsMatch.rank_value && qsMatch.rank_value !== 'N/A') {
      return qsMatch;
    }

    // Otherwise, return any available ranking
    const anyMatch = matches.find(row => row.rank_value && row.rank_value !== 'N/A');
    if (anyMatch) {
      return anyMatch;
    }

    // Fallback
    return { rank_value: "N/A", rank_provider_name: "N/A", ranking_type_name: "N/A" };
  }

  // Helper function to normalize phone numbers
  const normalizePhone = (num: string | number | undefined): string => {
    return String(num || "").replace(/\D/g, "").trim()
  }

  // Parse CSV data using Papa Parse for better reliability
  const parseCSVWithPapaParse = (csvText: string): UserProfile[] => {
    const parseResult = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
      transform: (value: string) => value.trim(),
    })

    if (parseResult.errors.length > 0) {
      console.warn("CSV parsing errors:", parseResult.errors)
    }

    return (parseResult.data as any[])
      .map((row: any) => {
        const profile: UserProfile = {
          phoneNumber: row["Pre Login Leap User - Pre User → Phone"] || "",
          name: row["name"] || "",
          email: row["email"] || "",
          collegeName: row["Counsellor Recommendation - Pre User → College Name"] || "",
          courseName: row["Counsellor Recommendation - Pre User → Course Name"] || "",
          country: row["Counsellor Recommendation - Pre User → Country"] || "",
          ieltsBand: row["Counsellor Recommendation - Pre User → Ielts Band"] || "",
          budget: row["Pre User Counseling - Pre User → Budget"] || "",
          courseDuration: row["Counsellor Recommendation - Pre User → Duration Of Course"] || "",
          workExperience: row["Total Work Experience"] || "",
          gapYears: row["Gap Years"] || "",
          preparationStage: row["Preparation Stage"] || "",
          passportStatus: row["Passport Status"] || "",
          currentResidenceState: row["Current Residence State"] || "",
          currentResidenceCity: row["Current Residence City"] || "",
          studentFinance: row["Student Finance"] || "",
          mostImportantCriteria: row["Most Important Criteria"] || "",
          secondImportantCriteria: row["Second Important Criteria"] || "",
          familyIncome: row["Family Income (Rs)"] || "",
          financeMode: row["Finance Mode"] || "",
          campus: row["Counsellor Recommendation - Pre User → Campus"] || "",
          category: row["Counsellor Recommendation - Pre User → Category"] || "",
          preferredIntake: row["Counsellor Recommendation - Pre User → Preferred Intake"] || "",
          currency: row["Counsellor Recommendation - Pre User → Currency"] || "",
          applicationFee: row["Counsellor Recommendation - Pre User → Application Fee"] || "",
          tuitionFee: row["Counsellor Recommendation - Pre User → Tuition Fee"] || "",
          counselingStage: row["Pre User Counseling - Pre User → Counseling Stage"] || "",
          assignedCounsellor: row["Pre User Counseling - Pre User → Assigned Counsellor"] || "",
          welcomeCallDone: row["Pre User Counseling - Pre User → Welcome Call Done"] || "",
        }
        return profile
      })
      .filter((profile) => profile.phoneNumber !== "")
  }

  // Fetch city and state mapping from the provided sheet
  const fetchCityStateMapping = async (): Promise<{
    [key: string]: { state: string; city: string }
  }> => {
    try {
      const cityStateCsvUrl =
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vQV3e5aZmJ1GS7VHudpP-Kkqbbx7383DY5ykMqmY1YXrd2HAWxUKWIxaF29GZyyx1fwE3eAHmsUUN4S/pub?output=csv"

      const response = await fetch(cityStateCsvUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/csv',
          'Content-Type': 'text/csv',
        },
        mode: 'cors',
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch city/state data: ${response.status}`)
      }

      const csvText = await response.text()
      console.log("City/State CSV raw data:", csvText.substring(0, 500))

      const lines = csvText.trim().split("\n")
      const headers = parseCSVLine(lines[0])
      console.log("City/State CSV headers:", headers)

      const universityNameIndex = headers.findIndex((h) => h.toLowerCase().includes("university_name"))
      const stateNameIndex = headers.findIndex((h) => h.toLowerCase().includes("state_name"))
      const cityNameIndex = headers.findIndex((h) => h.toLowerCase().includes("city_name"))

      const cityStateMap: { [key: string]: { state: string; city: string } } = {}

      lines.slice(1).forEach((line) => {
        const values = parseCSVLine(line)
        const universityName = values[universityNameIndex]?.trim() || ""
        const state = values[stateNameIndex]?.trim() || ""
        const city = values[cityNameIndex]?.trim() || ""
        if (universityName) {
          cityStateMap[universityName.toLowerCase()] = { state, city }
        }
      })

      console.log("Final city/state mapping:", cityStateMap)
      return cityStateMap
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching city/state mapping:", error.message)
      } else {
        console.error("Error fetching city/state mapping:", error)
      }
      return {}
    }
  }

  // Main function to fetch user data from Google Sheets CSV
  const fetchUserData = async () => {
    fetchStartTimeRef.current = Date.now()
    setIsLoading(true)
    setFetchError("")

    try {
      // Updated CSV URL as provided
      const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRQtjtY6NkC6LSKa_vEVbwjfoMVUnkGpZp0Q1mpmtJEDx-KXgBLGlmTTOin-VB6ycISSIaISUVOcKin/pub?output=csv"

      console.log("Fetching from URL:", csvUrl)

      // Fetch all five datasets in parallel (add city/state mapping)
      const [profileResponse, tuitionFees, livingCosts, rankingData, cityStateMap] = await Promise.all([
        fetch(csvUrl, {
          method: 'GET',
          headers: {
            'Accept': 'text/csv',
            'Content-Type': 'text/csv',
          },
          mode: 'cors',
        }),
        fetchTuitionFees(),
        fetchLivingCosts(),
        fetchRankingData(),
        fetchCityStateMapping(), // new
      ])

      console.log("Profile response status:", profileResponse.status)
      console.log("Profile response headers:", profileResponse.headers)

      if (!profileResponse.ok) {
        throw new Error(`HTTP error! status: ${profileResponse.status}`)
      }

      const csvText = await profileResponse.text()
      console.log("CSV text length:", csvText.length)
      console.log("First 200 characters:", csvText.substring(0, 200))

      // Check if we actually got CSV data
      if (!csvText || csvText.trim().length === 0) {
        throw new Error("Empty response from Google Sheets")
      }

      // Check if response looks like HTML (error page)
      if (csvText.trim().startsWith('<!DOCTYPE') || csvText.trim().startsWith('<html')) {
        throw new Error("Received HTML instead of CSV - check if sheet is public")
      }

      // Parse CSV using Papa Parse
      const profiles = parseCSVWithPapaParse(csvText)
      console.log("Parsed profiles count:", profiles.length)
      console.log("First few profiles:", profiles.slice(0, 3))

      setUserProfiles(profiles)

      // Debug logs
      console.log("Normalized input phone:", normalizePhone(formData.phoneNumber))
      console.log("Available profile phones:", profiles.map((p) => normalizePhone(p.phoneNumber)))

      // Find all entries with matching phone number
      const userEntries = profiles.filter(
        (profile) => normalizePhone(profile.phoneNumber) === normalizePhone(formData.phoneNumber)
      )

      console.log("Found user entries:", userEntries.length)

      if (userEntries.length > 0) {
        // If multiple entries exist, store them for selection
        if (userEntries.length > 1) {
          setMultipleEntries(userEntries)
        }

        // Use the first entry
        const selectedProfile = userEntries[0]
        console.log("Selected profile:", selectedProfile)

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

        // Find the row where the phone matches (normalized)
        let row = profiles.find((r: any) => {
          const sheetPhoneNorm = normalizePhone(r["Pre Login Leap User - Pre User → Phone"])
          return sheetPhoneNorm === normalizePhone(formData.phoneNumber)
        })
        if (row) {
          const sheetName = (row as any)["Pre Login Leap User - Pre User → Name"];
          setFormData((prev: any) => ({
            ...prev,
            sheetName,
            name: sheetName, // Always set name to sheet value too
            sheetCourseName: (row as any)["Counsellor Recommendation - Pre User → Course Name"],
          }));
          console.log('DEBUG: Set sheetName and name in formData:', sheetName);
        }

        // Generate colleges based on user's data with tuition fees, living costs, and ranking data
        let generatedColleges = userEntries
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

            // Lookup city/state from mapping
            const cityState = cityStateMap[collegeName.toLowerCase()] || { state: "", city: "" }

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
              liked: false,
              color: getCollegeColor(index),
              courseName: entry.courseName || "",
              campus: entry.campus || "",
              category: entry.category || "",
              livingCosts: countryLivingCosts, // always defined
              rankingData: collegeRankingData,
              state: cityState.state,
              city: cityState.city,
            }
          })
          .filter((college) => college.name && college.name !== "University 1")

        // Fallback: For any college with missing city or state, call OpenAI API
        const fillMissingCityState = async (college: College) => {
          const defaultRankingData = { rank_value: "N/A", rank_provider_name: "N/A", ranking_type_name: "N/A" };
          if (college.city && college.state) {
            return {
              ...college,
              livingCosts: college.livingCosts || {
                accommodation: "₹47K-68K/month",
                transportation: "₹10K-16K/month",
                living_expense: "₹12.6L/year",
              },
              rankingData: college.rankingData || defaultRankingData,
              state: college.state || "",
              city: college.city || "",
            };
          }
          try {
            const res = await fetch("/api/openai-citystate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ college: college.name, country: college.country }),
            });
            if (!res.ok) return {
              ...college,
              livingCosts: college.livingCosts || {
                accommodation: "₹47K-68K/month",
                transportation: "₹10K-16K/month",
                living_expense: "₹12.6L/year",
              },
              rankingData: college.rankingData || defaultRankingData,
              state: college.state || "",
              city: college.city || "",
            };
            const data = await res.json();
            return {
              ...college,
              city: college.city || data.city || "",
              state: college.state || data.state || "",
              livingCosts: college.livingCosts || {
                accommodation: "₹47K-68K/month",
                transportation: "₹10K-16K/month",
                living_expense: "₹12.6L/year",
              },
              rankingData: college.rankingData || defaultRankingData,
            };
          } catch {
            return {
              ...college,
              livingCosts: college.livingCosts || {
                accommodation: "₹47K-68K/month",
                transportation: "₹10K-16K/month",
                living_expense: "₹12.6L/year",
              },
              rankingData: college.rankingData || defaultRankingData,
              state: college.state || "",
              city: college.city || "",
            };
          }
        };
        generatedColleges = await Promise.all(generatedColleges.map(fillMissingCityState));
        // Ensure all colleges have required fields and correct types
        generatedColleges = generatedColleges.map(college => ({
          ...college,
          livingCosts: (college as any).livingCosts || {
            accommodation: "₹47K-68K/month",
            transportation: "₹10K-16K/month",
            living_expense: "₹12.6L/year",
          },
          rankingData: (college as any).rankingData || { rank_value: "N/A", rank_provider_name: "N/A", ranking_type_name: "N/A" },
          city: (college as any).city || "",
          state: (college as any).state || "",
        })).filter(college => !!college.livingCosts);

        console.log("Generated colleges:", generatedColleges)

        if (generatedColleges.length > 0) {
          setColleges(generatedColleges)
        }

        setProfileFetched(true)
        // Automatically proceed to results step
        onNext("results")
      } else {
        // If fetch was very recent, show 'Loading' instead of not found
        const now = Date.now()
        if (fetchStartTimeRef.current && now - fetchStartTimeRef.current < 30000) {
          setFetchError("")
        } else {
          setFetchError("No profile found for this phone number. Please check and try again.")
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Unable to fetch profile data:", error.message)
      } else {
        console.error("Unable to fetch profile data:", error)
      }
      setFetchError("Unable to fetch profile data. Please check if the sheet is publicly accessible.")
    } finally {
      setIsLoading(false)
    }
  }

  // Priority options for multi-select
  const PRIORITY_OPTIONS = [
    { value: "ranking", label: "Ranking" },
    { value: "budget", label: "Budget" },
    { value: "roi", label: "ROI" },
    { value: "tuition_fee", label: "Tuition Fee" },
    { value: "living_cost", label: "Living Cost" },
    { value: "scholarships", label: "Scholarships" },
    { value: "location", label: "Location" },
    { value: "employability", label: "Employability Rate" },
    { value: "part_time", label: "Part-time Work" },
    { value: "campus_life", label: "Campus Life" },
  ];

  // Multi-select dropdown state
  const [priorityOpen, setPriorityOpen] = useState(false);
  const priorityRef = useRef<HTMLDivElement>(null);
  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (priorityRef.current && !priorityRef.current.contains(e.target as Node)) {
        setPriorityOpen(false);
      }
    }
    if (priorityOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [priorityOpen]);

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="max-w-full sm:max-w-4xl mx-auto px-2 sm:px-0"
    >
      {/* Removed 'Your College Navigator' button from top left */}

      {!profileFetched ? (
        <Card className="p-4 sm:p-6 md:p-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl w-full">
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

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">Q1) What are your career aspirations after completing your masters in abroad?</label>
              <div className="relative mb-4">
                <button
                  type="button"
                  className="w-full h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-all duration-300 hover:border-gray-300 bg-white/50 text-base px-3 flex items-center justify-between"
                  onClick={() => setCareerOpen((open) => !open)}
                >
                  <span className="truncate text-left flex-1">
                    {(formData.careerAspirations && formData.careerAspirations.length > 0)
                      ? CAREER_OPTIONS.filter(opt => formData.careerAspirations.includes(opt.value)).map(opt => opt.label).join(", ")
                      : "Select your aspirations"}
                  </span>
                  <svg className={`w-4 h-4 ml-2 transition-transform ${careerOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                {careerOpen && (
                  <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto p-2 animate-fade-in">
                    {CAREER_OPTIONS.map(opt => (
                      <label key={opt.value} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-blue-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.careerAspirations?.includes(opt.value) || false}
                          onChange={e => {
                            const selected = new Set(formData.careerAspirations || []);
                            if (e.target.checked) selected.add(opt.value);
                            else selected.delete(opt.value);
                            setFormData((prev: any) => ({ ...prev, careerAspirations: Array.from(selected) }));
                          }}
                          className="accent-blue-600 w-4 h-4 rounded"
                        />
                        <span className="text-sm">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 mt-4">Q2) Based on what parameters will you choose your College's course (any 2/3)</label>
              <div className="relative">
                <button
                  type="button"
                  className="w-full h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-all duration-300 hover:border-gray-300 bg-white/50 text-base px-3 flex items-center justify-between"
                  onClick={() => setParamOpen((open) => !open)}
                >
                  <span className="truncate text-left flex-1">
                    {(formData.collegeParameters && formData.collegeParameters.length > 0)
                      ? PARAM_OPTIONS.filter(opt => formData.collegeParameters.includes(opt.value)).map(opt => opt.label).join(", ")
                      : "Select parameters"}
                  </span>
                  <svg className={`w-4 h-4 ml-2 transition-transform ${paramOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                {paramOpen && (
                  <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto p-2 animate-fade-in">
                    {PARAM_OPTIONS.map(opt => (
                      <label key={opt.value} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-blue-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.collegeParameters?.includes(opt.value) || false}
                          onChange={e => {
                            const selected = new Set(formData.collegeParameters || []);
                            if (e.target.checked) selected.add(opt.value);
                            else selected.delete(opt.value);
                            setFormData((prev: any) => ({ ...prev, collegeParameters: Array.from(selected) }));
                          }}
                          className="accent-blue-600 w-4 h-4 rounded"
                        />
                        <span className="text-sm">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">Choose the options that matter most to you.</div>
            </motion.div>


            {isLoading && !fetchError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert className="border-blue-200 bg-blue-50">
                  <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                  <AlertDescription className="text-blue-700">Loading...</AlertDescription>
                </Alert>
              </motion.div>
            )}
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
            {/* Removed Data Source section here */}
          </div>
        </Card>
      ) : null}
    </motion.div>
  )
}