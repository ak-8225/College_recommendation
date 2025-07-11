"use client"

import { motion } from "framer-motion"
import {
  ArrowLeft,
  Heart,
  MapPin,
  Star,
  TrendingUp,
  DollarSign,
  Award,
  Users,
  Info,
  Eye,
  CheckSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState, useRef, useEffect } from "react"
import type { Step, College } from "@/types/college"
import Papa from 'papaparse'
import type { ParseResult } from 'papaparse'

interface ResultsStepProps {
  pageVariants: any
  pageTransition: any
  colleges: College[]
  selectedForComparison: string[]
  setSelectedForComparison: (colleges: string[]) => void
  onCollegeToggle: (collegeId: string) => void
  userProfile: {
    name: string
    intendedMajor: string
    country: string
  }
  onNext: (step: Step) => void
  onBack: () => void
}

const countryUSPs: Record<string, string[]> = {
  UK: [
    "Globally ranked universities like Oxford and Cambridge",
    "1-year master's programs save time and cost",
    "Post-study work visa up to 2 years (Graduate Route)",
    "Strong industry-academic partnerships",
    "High-quality research and innovation output",
    "Cultural diversity in cities like London and Manchester",
    "Affordable healthcare via NHS for international students",
    "Access to Europe for travel and internships",
    "English-speaking academic and social environment",
    "Wide range of scholarships for Indian students"
  ],
  Ireland: [
    "Home to tech giants like Google, Facebook, Apple",
    "2-year post-study work visa after graduation",
    "English-speaking, friendly and safe environment",
    "Fast-growing economy with demand for skilled grads",
    "Compact 1-year master's programs",
    "Tax-free stipend options through internships and placements",
    "Highly ranked for computer science and pharma",
    "EU access with job mobility opportunities",
    "Close-knit university campuses and vibrant student life",
    "Free healthcare access for students in some cases"
  ],
  USA: [
    "Top-ranked universities like MIT, Stanford, and Harvard",
    "Flexible curriculum with major/minor combinations",
    "Access to OPT (up to 3 years for STEM fields)",
    "Diverse campus communities across all 50 states",
    "Strong alumni networks and job placement outcomes",
    "High research funding and assistantship opportunities",
    "Hub for tech, business, and creative industries",
    "Large Indian student community and support groups",
    "World leader in innovation and entrepreneurship",
    "Scholarships and assistantships available for merit students"
  ],
  Canada: [
    "High post-study work permit up to 3 years",
    "Pathway to PR through study+work",
    "Affordable tuition compared to USA/UK",
    "Top institutions like UBC, Toronto, McGill",
    "Safe, inclusive, and multicultural society",
    "STEM and business job market in high demand",
    "Co-op programs offer paid work experience",
    "Universal healthcare access (in most provinces)",
    "Indian diaspora support in major cities",
    "High quality of life and work-life balance"
  ],
  Germany: [
    "Free or low-cost education even for international students",
    "World-renowned for engineering and tech programs",
    "Strong ties to automotive and manufacturing industries",
    "Courses in English increasingly available",
    "18-month post-study job search visa",
    "Located in heart of Europe with easy travel",
    "High research output and innovation funding",
    "Low living costs in smaller cities",
    "Public transport and infrastructure excellence",
    "Globally recognized public universities like TU Munich"
  ],
  NewZealand: [
    "2-3 year post-study work visa based on course level",
    "Safe, peaceful, and environmentally rich country",
    "Globally ranked universities like University of Auckland",
    "Supportive immigration policies for skilled grads",
    "Affordable compared to Australia and UK",
    "High employability in agriculture, health, IT, and hospitality",
    "Excellent student-teacher ratios and learning support",
    "Opportunities for part-time work while studying",
    "Unique Maori cultural exposure and global outlook",
    "Adventure and travel opportunities alongside studies"
  ]
}

function getCollegeUSPsByCountry(country: string): string[] {
  // Normalize country name for matching
  const countryKey = country.replace(/\s+/g, "").replace(/[^a-zA-Z]/g, "");
  const uspList = countryUSPs[countryKey] || [];
  // Shuffle and pick 4 random USPs
  return uspList.sort(() => 0.5 - Math.random()).slice(0, 4);
}

// Add a helper to validate tuition fee
function isTuitionFeeInvalid(fee: any) {
  if (!fee) return true;
  const num = parseFloat(String(fee).replace(/[^\d.]/g, ""));
  // Consider invalid if missing, zero, or less than ₹50,000/year
  return isNaN(num) || num < 50000;
}

export default function ResultsStep({
  pageVariants,
  pageTransition,
  colleges,
  selectedForComparison,
  setSelectedForComparison,
  onCollegeToggle,
  userProfile,
  onNext,
  onBack,
}: ResultsStepProps) {
  const [selectedCollegeForDetails, setSelectedCollegeForDetails] = useState<College | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [hoveredCollege, setHoveredCollege] = useState<string | null>(null)
  const [usps, setUsps] = useState<{ [collegeId: string]: string }>({})
  const [uspsLoading, setUspsLoading] = useState<{ [collegeId: string]: boolean }>({})
  const [roiData, setRoiData] = useState<{ [collegeId: string]: number }>({})
  const [roiLoading, setRoiLoading] = useState<{ [collegeId: string]: boolean }>({})
  const [costData, setCostData] = useState<any[]>([])
  const [costDataLoaded, setCostDataLoaded] = useState(false)
  // In ResultsStep component, add state to store fallback tuition fees
  const [fallbackTuitionFees, setFallbackTuitionFees] = useState<{ [collegeId: string]: string }>({});

  useEffect(() => {
    colleges.forEach((college) => {
      // Fetch USPs
      if (!usps[college.id] && !uspsLoading[college.id]) {
        setUspsLoading((prev) => ({ ...prev, [college.id]: true }))
        fetch(`/api/get-usps-google?college=${encodeURIComponent(college.name)}`)
          .then(async (res) => {
            if (!res.ok) {
              const text = await res.text();
              throw new Error(`cool, coolAPI error: ${res.status} - ${text}`);
            }
            const text = await res.text();
            if (!text) throw new Error("Empty response from USP API");
            try {
              return JSON.parse(text);
            } catch (e) {
              throw new Error("Invalid JSON from USP API: " + text);
            }
          })
          .then((data) => {
            if (data.error) {
              setUsps((prev) => ({
                ...prev,
                [college.id]: `Error: ${data.error}${data.details ? ' - ' + JSON.stringify(data.details) : ''}`,
              }));
            } else {
              setUsps((prev) => ({
                ...prev,
                [college.id]: data.usps || "No USP data available.",
              }));
            }
          })
          .catch((err) => {
            setUsps((prev) => ({
              ...prev,
              [college.id]: `Error: ${String(err)}`,
            }));
          })
          .finally(() => {
            setUspsLoading((prev) => ({ ...prev, [college.id]: false }))
          })
      }

      // Fetch ROI data
      if (!roiData[college.id] && !roiLoading[college.id]) {
        setRoiLoading((prev) => ({ ...prev, [college.id]: true }))
        
        const details = getCollegeDetails(college);
        const requestBody = {
          college: college.name,
          country: college.country,
          city: details.location?.split(',')[0] || "",
          tuitionFee: college.tuitionFee || "₹25.0L",
          livingCosts: details.livingCosts || "₹12.6L/year",
          avgSalary: details.averageSalary || "₹26.0L",
          ranking: details.qsRanking || "N/A",
          employmentRate: details.employmentRate || "80%"
        };

        fetch("/api/get-roi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        })
          .then(async (res) => {
            if (!res.ok) throw new Error(await res.text())
            return res.json()
          })
          .then((data) => {
            if (data.error) {
              console.error("ROI API error:", data.error);
              setRoiData((prev) => ({ ...prev, [college.id]: 3.5 })) // Default fallback
            } else {
              setRoiData((prev) => ({ ...prev, [college.id]: data.roi || 3.5 }))
            }
          })
          .catch((err) => {
            console.error("ROI fetch error:", err);
            setRoiData((prev) => ({ ...prev, [college.id]: 3.5 })) // Default fallback
          })
          .finally(() => {
            setRoiLoading((prev) => ({ ...prev, [college.id]: false }))
          })
      }

      // Tuition fee fallback logic
      if (isTuitionFeeInvalid(college.tuitionFee) && !fallbackTuitionFees[college.id]) {
        fetch("/api/get-comparison-metrics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ college: college.name }),
        })
          .then(async (res) => {
            if (!res.ok) throw new Error(await res.text());
            return res.json();
          })
          .then((data) => {
            // Parse the metrics to extract Annual Tuition Fees
            const metricsText = data.metrics || "";
            const match = metricsText.match(/Annual Tuition Fees.*?:\s*([\d,\.]+)[^\d]*/i);
            if (match && match[1]) {
              setFallbackTuitionFees((prev) => ({ ...prev, [college.id]: match[1] }));
            }
          })
          .catch(() => {
            // If API fails, do nothing (will not show blank)
          });
      }
    })

    if (!costDataLoaded) {
      fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vRIiXlBnG9Vh2Gkvwnz4FDwE-aD1gpB3uWNtsUgrk5HV5Jd89KM5V0Jeb0It7867pbGSt8iD-UvmJIE/pub?output=csv')
        .then((res) => res.text())
        .then((csv) => {
          Papa.parse(csv, {
            header: true,
            skipEmptyLines: true,
            complete: (results: any) => {
              setCostData(results.data)
              setCostDataLoaded(true)
            },
          })
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colleges])

  // Cache for college USPs to keep them constant
  const collegeUSPsCache = useRef<{ [collegeId: string]: string[] }>({})

  // Helper to get or set cached USPs for a college
  function getCachedUSPs(college: College) {
    if (!collegeUSPsCache.current[college.id]) {
      collegeUSPsCache.current[college.id] = getCollegeUSPsByCountry(college.country).slice(0, 4)
    }
    return collegeUSPsCache.current[college.id]
  }

  /* ---------------------------------------------------------------- */
  // Safeguard against missing data
  const { name = "Student", intendedMajor = "your major", country = "your country" } = userProfile || {}
  /* ---------------------------------------------------------------- */

  const getCollegeDetails = (college: College) => {
    // Use living costs from college data if available, otherwise use defaults
    const livingCosts = college.livingCosts || {
      accommodation: "₹54,947-79,431/month",
      transportation: "₹11,681-18,689/month",
      living_expense: "₹14.7L/year",
    }

    // Use ranking data from college if available
    const rankingData = college.rankingData || {
      rank_value: "N/A",
      rank_provider_name: "N/A",
    }

    // Get unique USPs for this college
    const collegeUSPs = getCachedUSPs(college);

    // Detailed information for each college
    const details = {
      "1": {
        qsRanking:
          rankingData.rank_value !== "N/A"
            ? `${rankingData.rank_value} (${rankingData.rank_provider_name})`
            : "801-1000",
        tuitionFees: college.tuitionFee || "₹17.5L/year",
        livingCosts: livingCosts.living_expense,
        accommodation: "₹54,947-79,431/month",
        transportation: "₹11,681-18,689/month",
        scholarships: "Varies",
        employmentRate: "78%",
        averageSalary: "₹25.2L",
        campusSize: "20,000 students",
        internationalStudents: "20%",
        campusRating: "3.5/5",
        facilities: ["Library", "Sports Centre", "Labs"],
        programs: ["MSc Data Science", "MSc Robotics", "MSc AI"],
        accreditation: "N/A",
        location: "Salford, Greater Manchester",
        transport: "Good public transport",
        accommodationInfo: "On-campus options",
        support: "Student support services",
        bulletPoints: collegeUSPs,
        sources: {
          qsRanking: "Source: QS World University Rankings 2024",
          tuitionFees: "Source: University of Salford Website 2024",
          employmentRate: "Source: HESA Graduate Outcomes Survey 2023",
        },
      },
      "2": {
        qsRanking:
          rankingData.rank_value !== "N/A"
            ? `${rankingData.rank_value} (${rankingData.rank_provider_name})`
            : "531-540",
        tuitionFees: college.tuitionFee || "₹18.1L/year",
        livingCosts: livingCosts.living_expense,
        accommodation: "₹54,947-79,431/month",
        transportation: "₹11,681-18,689/month",
        scholarships: "Available",
        employmentRate: "82%",
        averageSalary: "₹26.8L",
        campusSize: "30,000 students",
        internationalStudents: "25%",
        campusRating: "4.0/5",
        facilities: ["Library", "Sports Centre", "Labs"],
        programs: ["MSc Cyber Security", "MSc Engineering", "MSc Finance"],
        accreditation: "N/A",
        location: "Coventry, West Midlands",
        transport: "Excellent transport links",
        accommodationInfo: "Varied options",
        support: "International student support",
        bulletPoints: collegeUSPs,
        sources: {
          qsRanking: "Source: QS World University Rankings 2024",
          tuitionFees: "Source: Coventry University Website 2024",
          employmentRate: "Source: HESA Graduate Outcomes Survey 2023",
        },
      },
      "3": {
        qsRanking:
          rankingData.rank_value !== "N/A" ? `${rankingData.rank_value} (${rankingData.rank_provider_name})` : "326",
        tuitionFees: college.tuitionFee || "₹22.6L/year",
        livingCosts: livingCosts.living_expense,
        accommodation: "₹54,947-79,431/month",
        transportation: "₹11,681-18,689/month",
        scholarships: "Merit-based",
        employmentRate: "85%",
        averageSalary: "₹28.4L",
        campusSize: "15,000 students",
        internationalStudents: "30%",
        campusRating: "4.2/5",
        facilities: ["Library", "Sports Centre", "Labs"],
        programs: ["MSc Medicine", "MSc Law", "MSc Business"],
        accreditation: "N/A",
        location: "Dundee, Scotland",
        transport: "Good public transport",
        accommodationInfo: "Guaranteed for intl.",
        support: "Dedicated support team",
        bulletPoints: collegeUSPs,
        sources: {
          qsRanking: "Source: QS World University Rankings 2024",
          tuitionFees: "Source: University of Dundee Website 2024",
          employmentRate: "Source: HESA Graduate Outcomes Survey 2023",
        },
      },
    }

    // For user-generated colleges, create dynamic details
    if (!details[college.id as keyof typeof details]) {
      return {
        qsRanking:
          rankingData.rank_value !== "N/A" ? `${rankingData.rank_value} (${rankingData.rank_provider_name})` : "N/A",
        tuitionFees: college.tuitionFee || "₹25.0L",
        livingCosts: livingCosts.living_expense,
        accommodation: livingCosts.accommodation,
        transportation: livingCosts.transportation,
        scholarships: "Available",
        employmentRate: "80%",
        averageSalary: "₹26.3L",
        campusSize: "25,000 students",
        internationalStudents: "25%",
        campusRating: "4.0/5",
        facilities: ["Library", "Sports Centre", "Labs"],
        programs: [college.courseName || "Various Programs"],
        accreditation: "N/A",
        location: college.country || "Unknown",
        transport: "Good public transport",
        accommodationInfo: "Available",
        support: "Student support services",
        bulletPoints: collegeUSPs,
        sources: {
          qsRanking: "Source: University Rankings 2024",
          tuitionFees: "Source: University Website 2024",
          employmentRate: "Source: Graduate Outcomes Survey 2023",
        },
      }
    }

    return details[college.id as keyof typeof details]
  }

  function getCostInfo(college: College) {
    if (!costDataLoaded) return null
    // Normalize helper
    function norm(str: string) {
      return String(str || '').replace(/\s+/g, '').replace(/[-_]/g, '').toLowerCase()
    }
    // Map college.country to sheet country_name
    const countryMap: { [key: string]: string } = {
      uk: 'UK',
      ireland: 'Ireland',
      usa: 'USA',
      canada: 'Canada',
      germany: 'Germany',
      newzealand: 'NewZealand',
    }
    const countryKey = norm(college.country)
    const sheetCountry = countryMap[countryKey] || college.country
    // Map campus/category to sheet country_category
    let category = ''
    if (sheetCountry === 'UK') {
      if (college.campus && /london/i.test(college.campus)) category = 'LONDON'
      else category = 'NON_LONDON'
    } else if (sheetCountry === 'Ireland') {
      if (college.campus && /dublin/i.test(college.campus)) category = 'DUBLIN'
      else category = 'NON_DUBLIN'
    } else if (sheetCountry === 'USA') {
      if (college.campus && /(ny|new york|san francisco|san jose|bay area|nysan)/i.test(college.campus)) category = 'NYSAN'
      else category = 'NON_NY_SAN'
    } else if (sheetCountry === 'Canada') {
      if (college.campus && /(toronto|vancouver|tor_van)/i.test(college.campus)) category = 'TOR_VAN'
      else category = 'NON_TOR_VAN'
    } else if (sheetCountry === 'Germany') {
      if (college.campus && /(berlin|munich|ber_mun)/i.test(college.campus)) category = 'BER_MUN'
      else category = 'NON_BER_MUN'
    } else if (sheetCountry === 'NewZealand') {
      if (college.campus && /(auckland|wellington|auc_well)/i.test(college.campus)) category = 'AUC_WELL'
      else category = 'NON_AUC_WELL'
    }
    // Try to match both country and category
    const byCountryCat = costData.find(
      (row) => norm(row.country_name) === norm(sheetCountry) && norm(row.country_category) === norm(category)
    )
    if (byCountryCat) return byCountryCat
    // Fallback: try to match by country only
    const byCountry = costData.find(
      (row) => norm(row.country_name) === norm(sheetCountry)
    )
    return byCountry || null
  }

  const handleViewDetails = (college: College) => {
    setSelectedCollegeForDetails(college)
    setIsDialogOpen(true)
  }

  const handleComparisonToggle = (collegeId: string) => {
    setSelectedForComparison(
      selectedForComparison.includes(collegeId)
        ? selectedForComparison.filter((id) => id !== collegeId)
        : [...selectedForComparison, collegeId],
    )
  }

  const handleSelectAll = () => {
    if (selectedForComparison.length === colleges.length) {
      setSelectedForComparison([])
    } else {
      setSelectedForComparison(colleges.map((college) => college.id))
    }
  }

  const selectedDetails = selectedCollegeForDetails ? getCollegeDetails(selectedCollegeForDetails) : null

  return (
    <TooltipProvider>
      <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4 sm:gap-0">
          <Button
            variant="ghost"
            onClick={onBack}
            className="hover:bg-white/50 transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Analysis
          </Button>
          <div className="flex gap-3 items-center">
            
            <Button
              onClick={handleSelectAll}
              variant="outline"
              className="bg-white/50 hover:bg-white border-2 hover:scale-105 transition-all duration-300"
            >
              <CheckSquare className="w-4 h-4 mr-2" />
              {selectedForComparison.length === colleges.length ? "Deselect All" : "Select All for Comparison"}
            </Button>
            <Button
              onClick={() => onNext("comparison")}
              disabled={selectedForComparison.length < 2}
              variant="outline"
              className="bg-white/50 hover:bg-white border-2 hover:scale-105 transition-all duration-300"
            >
              Compare Selected ({selectedForComparison.length})
            </Button>
            <Button
              onClick={() => onNext("summary")}
              disabled={colleges.filter((c) => c.liked).length === 0}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-all duration-300"
            >
              View Summary ({colleges.filter((c) => c.liked).length} Liked)
            </Button>
            <Button
              onClick={() => onNext("initial-form")}
              variant="destructive"
              className="border-2 border-red-500 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-700 font-semibold px-4 py-2 rounded-lg transition-all duration-300"
            >
              Logout
            </Button>
          </div>
        </div>

        <div className="text-center mb-8 px-2 sm:px-0">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">College Recommendations for {name}</h1>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Based on your counseling profile and {intendedMajor} preferences for {country}
          </p>
        </div>

        <div className="grid gap-6">
          {colleges.map((college, index) => {
            const isSelected = college.liked
            const details = getCollegeDetails(college)
            const isHovered = hoveredCollege === college.id

            return (
              <Card
                key={college.id}
                className={`p-3 transition-all duration-300 hover:shadow-xl border-2 ${
                  isSelected
                    ? "border-blue-500 bg-blue-50/50 shadow-lg"
                    : "border-gray-200 bg-white/80 hover:border-gray-300"
                } backdrop-blur-sm rounded-2xl relative overflow-hidden`}
              >
                <div className="flex flex-col lg:flex-row gap-2 sm:gap-3 w-full">
                  {/* Left Section - College Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-2 mb-1">
                      <div className="flex items-center gap-1">
                        <div
                          className={`w-12 h-12 bg-gradient-to-br ${college.color} rounded-xl flex items-center justify-center text-white font-bold text-base shadow-lg`}
                        >
                          {college.name.charAt(0)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-0.5">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 leading-tight mb-0.5">{college.name}</h3>
                            <p className="text-gray-600 flex items-center gap-1 text-xs mb-0.5">
                              <MapPin className="w-4 h-4" />
                              {college.country}
                            </p>
                            <div className="mt-2" />
                          </div>
                          <div className="flex flex-row gap-2 items-center ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 bg-transparent"
                              onClick={() => handleViewDetails(college)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View Details
                            </Button>
                            <Button
                              onClick={() => onCollegeToggle(college.id)}
                              variant={isSelected ? "default" : "outline"}
                              size="sm"
                              className={`transition-all duration-300 ${
                                isSelected
                                  ? "bg-red-600 hover:bg-red-700 text-white"
                                  : "hover:bg-red-50 hover:border-red-300"
                              }`}
                            >
                              <Heart className={`w-4 h-4 mr-1 ${college.liked ? "fill-current" : ""}`} />
                              {college.liked ? "Liked" : "Like"}
                            </Button>
                            <Button
                              onClick={() => handleComparisonToggle(college.id)}
                              variant={selectedForComparison.includes(college.id) ? "default" : "outline"}
                              size="sm"
                              className={`transition-all duration-300 ${
                                selectedForComparison.includes(college.id)
                                  ? "bg-green-600 hover:bg-green-700 text-white border-2 border-green-600"
                                  : "hover:bg-green-50 hover:border-green-300 border-2 border-gray-300"
                              }`}
                              title="Select for comparison"
                            >
                              Compare
                            </Button>
                          </div>
                        </div>
                        {/* Compact badges and USPs */}
                        <div className="mt-0 flex flex-col gap-0.5">
                          <div className="flex flex-wrap items-center gap-1 mb-0.5">
                            <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
                              <Star className="w-3 h-3 mr-1" />
                              Rank #{college.ranking}
                            </div>
                            <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium">
                              {(() => {
                                let fee = college.tuitionFee;
                                if (isTuitionFeeInvalid(fee) && fallbackTuitionFees[college.id]) {
                                  fee = fallbackTuitionFees[college.id];
                                }
                                // Always show a value, never blank or obviously wrong
                                if (!fee || isTuitionFeeInvalid(fee)) fee = "Approx. ₹8,00,000";
                                return `₹${String(fee).replace(/[^\d.]/g, "")} INR per year`;
                              })()}
                            </div>
                          </div>
                          <div className="mt-0 mb-0.5">
                            {uspsLoading[college.id] ? (
                              <div className="text-gray-400 text-xs italic">Loading USPs...</div>
                            ) : (
                              <ul className="list-disc pl-5 text-gray-700 text-xs space-y-0.5">
                                {(() => {
                                  // Extract only the 4 required USPs from the HTML/text
                                  const html = usps[college.id] || "<ul><li>No USP data available.</li></ul>";
                                  // Match all <li>...</li> points
                                  const matches = html.match(/<li>(.*?)<\/li>/g) || [];
                                  // Keywords to look for
                                  const keywords = [
                                    /placement rate|placement/i,
                                    /average package|avg package|average salary|avg salary/i,
                                    /popularity|indian students|popularity/i,
                                    /affordability|affordable|cost|expense/i,
                                  ];
                                  // For each keyword, find the first matching USP
                                  const filteredUSPs = keywords.map((regex) =>
                                    matches.find((li) => regex.test(li))
                                  ).filter(Boolean);
                                  // If less than 4, fill with the first available USPs
                                  while (filteredUSPs.length < 4 && matches.length > 0) {
                                    const next = matches.find(
                                      (li) => !filteredUSPs.includes(li)
                                    );
                                    if (next) filteredUSPs.push(next);
                                    else break;
                                  }
                                  // Render only up to 4 points, filter out undefined and ensure li is a string and not generic/missing data
                                  return filteredUSPs.slice(0, 4)
                                    .filter((li): li is string => typeof li === 'string')
                                    .filter((li) => {
                                      const text = li.toLowerCase();
                                      return !(
                                        text.includes('not been publicly disclosed') ||
                                        text.includes('not available') ||
                                        text.includes('n/a') ||
                                        text.includes('unknown') ||
                                        text.includes('no data') ||
                                        text.includes('no information')
                                      );
                                    })
                                    .map((li, i) => (
                                      <li key={i} dangerouslySetInnerHTML={{ __html: li.replace(/<\/?li>/g, "") }} />
                                    ));
                                })()}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Key Metrics (REPLACED) */}
                  <div className="lg:w-80">
                    <div className="bg-gradient-to-br from-gray-50 to-white p-3 rounded-xl border">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        Key Metrics
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="ml-1 p-0.5 rounded-full hover:bg-gray-100 focus:outline-none">
                                <Info className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <span className="text-xs">This data is aggregate and shown in INR per month.</span>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </h4>
                      {costDataLoaded ? (
                        (() => {
                          const costInfo = getCostInfo(college)
                          if (!costInfo) return <div className="text-xs text-gray-500">No data available for this country/city.</div>
                          return (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Accommodation</span>
                                <span className="font-medium">₹{costInfo.accommodation} /month</span>
                              </div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Transportation</span>
                                <span className="font-medium">₹{costInfo.transportation} /month</span>
                              </div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Living Expense</span>
                                <span className="font-medium">₹{costInfo.living_expense} /month</span>
                              </div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Part-time Work</span>
                                <span className="font-medium">₹{costInfo.part_time_work} /month</span>
                              </div>
                            </div>
                          )
                        })()
                      ) : (
                        <div className="text-xs text-gray-400">Loading cost data...</div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedCollegeForDetails && (
                  <>
                    <div
                      className={`w-10 h-10 bg-gradient-to-br ${selectedCollegeForDetails.color} rounded-lg flex items-center justify-center text-white font-bold`}
                    >
                      {selectedCollegeForDetails.name.charAt(0)}
                    </div>
                    {selectedCollegeForDetails.name} - Detailed Information
                  </>
                )}
              </DialogTitle>
            </DialogHeader>

            {selectedCollegeForDetails && selectedDetails && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <Card className="p-4">
                  <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Financial Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Annual Tuition:</span>
                      <span className="font-medium">₹{String(selectedCollegeForDetails.tuitionFee).replace(/[^\d.]/g, "")} INR per year</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Living Costs:</span>
                      <span className="font-medium">₹{String(selectedDetails.livingCosts).replace(/[^\d.]/g, "")}L per year</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Accommodation:</span>
                      <span className="font-medium">₹{String(selectedDetails.accommodation).replace(/[^\d.]/g, "")}L per year</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transportation:</span>
                      <span className="font-medium">₹{String(selectedDetails.transportation).replace(/[^\d.]/g, "")}L per year</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Scholarships:</span>
                      <span className="font-medium text-green-600">{selectedDetails.scholarships}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{selectedDetails.sources.tuitionFees}</p>
                </Card>

                <Card className="p-4">
                  <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Career Outcomes
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Employment Rate:</span>
                      <span className="font-medium text-green-600">{selectedDetails.employmentRate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Salary:</span>
                      <span className="font-medium">{selectedDetails.averageSalary}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{selectedDetails.sources.employmentRate}</p>
                </Card>

                <Card className="p-4">
                  <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    Campus Life
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Ranking:</span>
                      <span className="font-medium">{selectedDetails.qsRanking}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Students:</span>
                      <span className="font-medium">{selectedDetails.campusSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>International:</span>
                      <span className="font-medium">{selectedDetails.internationalStudents}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{selectedDetails.sources.qsRanking}</p>
                </Card>

                <Card className="p-4">
                  <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-orange-600" />
                    Programs & Facilities
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium">Available Programs:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedDetails.programs.map((program, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {program}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Key Facilities:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedDetails.facilities.map((facility, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {facility}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {selectedCollegeForDetails && selectedDetails && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-bold text-lg mb-2">Additional Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Location:</span> {selectedDetails.location}
                  </div>
                  <div>
                    <span className="font-medium">Transport:</span> {selectedDetails.transport}
                  </div>
                  <div>
                    <span className="font-medium">Accommodation:</span> {selectedDetails.accommodationInfo}
                  </div>
                  <div>
                    <span className="font-medium">Support:</span> {selectedDetails.support}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Action buttons at the bottom */}
        {(selectedForComparison.length > 0 || colleges.filter((c) => c.liked).length > 0) && (
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex gap-4">
                  {selectedForComparison.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {selectedForComparison.length}
                      </div>
                      <span className="font-medium text-gray-900">
                        {selectedForComparison.length} college{selectedForComparison.length !== 1 ? "s" : ""} selected
                        for comparison
                      </span>
                    </div>
                  )}
                  {colleges.filter((c) => c.liked).length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {colleges.filter((c) => c.liked).length}
                      </div>
                      <span className="font-medium text-gray-900">
                        {colleges.filter((c) => c.liked).length} college
                        {colleges.filter((c) => c.liked).length !== 1 ? "s" : ""} liked
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => onNext("comparison")}
                  disabled={selectedForComparison.length < 2}
                  variant="outline"
                  size="sm"
                  className="bg-white hover:bg-green-50"
                >
                  Compare Selected ({selectedForComparison.length})
                </Button>
                <Button
                  onClick={() => onNext("summary")}
                  disabled={colleges.filter((c) => c.liked).length === 0}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  View Summary ({colleges.filter((c) => c.liked).length} Liked)
                </Button>
              </div>
            </div>
          </Card>
        )}
      </motion.div>
    </TooltipProvider>
  )
}
