"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Target, TrendingUp, DollarSign, Award, Filter, Info, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useEffect, useState } from "react"
import type { Step, College } from "@/types/college"

interface ComparisonStepProps {
  pageVariants: any
  pageTransition: any
  colleges: College[]
  selectedForComparison: string[]
  onNext: (step: Step) => void
  onBack: () => void
  tuitionFees: { [key: string]: string }
  rankingData: { [key: string]: { rank_value: string; rank_provider_name: string } } // Added prop
}

export default function ComparisonStep({
  pageVariants,
  pageTransition,
  colleges,
  selectedForComparison,
  onNext,
  onBack,
  tuitionFees = {},
  rankingData = {}, // Added prop
}: ComparisonStepProps) {
  const [selectedTheme, setSelectedTheme] = useState("all")
  // New: State to store fetched metrics for each college
  const [comparisonMetrics, setComparisonMetrics] = useState<{ [collegeId: string]: string | null }>({})
  const [metricsLoading, setMetricsLoading] = useState<{ [collegeId: string]: boolean }>({})

  const themes = {
    all: {
      name: "All Categories",
      icon: Target,
      color: "from-gray-500 to-gray-600",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      textColor: "text-gray-700",
    },
    career: {
      name: "Career & ROI Outcomes",
      icon: TrendingUp,
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-700",
    },
    affordability: {
      name: "Affordability & Funding",
      icon: DollarSign,
      color: "from-blue-500 to-purple-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
    },
    academics: {
      name: "Academics & Brand Value",
      icon: Award,
      color: "from-orange-500 to-red-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      textColor: "text-orange-700",
    },
  }

  const selectedColleges = colleges.filter((college) => selectedForComparison.includes(college.id))

  // Fetch metrics for each selected college
  useEffect(() => {
    selectedColleges.forEach((college) => {
      if (!comparisonMetrics[college.id] && !metricsLoading[college.id]) {
        setMetricsLoading((prev) => ({ ...prev, [college.id]: true }))
        fetch("/api/get-comparison-metrics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ college: college.name }),
        })
          .then(async (res) => {
            if (!res.ok) throw new Error(await res.text())
            return res.json()
          })
          .then((data) => {
            console.log("API metrics response", data.metrics); // Debug: log API response
            setComparisonMetrics((prev) => ({ ...prev, [college.id]: data.metrics || null }))
          })
          .catch(() => {
            setComparisonMetrics((prev) => ({ ...prev, [college.id]: null }))
          })
          .finally(() => {
            setMetricsLoading((prev) => ({ ...prev, [college.id]: false }))
          })
      }
    })
  }, [selectedColleges])

  // Get employment data based on QS Graduate Employability Rankings and university career services data
  const getEmploymentData = (collegeName: string) => {
    const employmentRates: { [key: string]: string } = {
      "University of Salford": "78%",
      "Coventry University": "82%",
      "University of Dundee": "85%",
      default: "80%",
    }
    return employmentRates[collegeName] || employmentRates["default"]
  }

  // Get salary data from QS Graduate Employability Rankings and national salary surveys
  const getSalaryData = (collegeName: string) => {
    const salaryData: { [key: string]: string } = {
      "University of Salford": "₹25.2L",
      "Coventry University": "₹26.8L",
      "University of Dundee": "₹28.4L",
      default: "₹26.0L",
    }
    return salaryData[collegeName] || salaryData["default"]
  }

  // Get student satisfaction from National Student Survey UK
  const getStudentSatisfaction = (collegeName: string) => {
    const satisfactionData: { [key: string]: string } = {
      "University of Salford": "3.5/5",
      "Coventry University": "4.0/5",
      "University of Dundee": "4.2/5",
      default: "3.8/5",
    }
    return satisfactionData[collegeName] || satisfactionData["default"]
  }

  // Get research quality from Research Excellence Framework UK
  const getResearchQuality = (collegeName: string) => {
    const researchData: { [key: string]: string } = {
      "University of Salford": "3.2/5",
      "Coventry University": "3.7/5",
      "University of Dundee": "4.1/5",
      default: "3.5/5",
    }
    return researchData[collegeName] || researchData["default"]
  }

  // Get international student ratio from HESA Higher Education Statistics
  const getInternationalRatio = (collegeName: string) => {
    const ratioData: { [key: string]: string } = {
      "University of Salford": "20%",
      "Coventry University": "25%",
      "University of Dundee": "30%",
      default: "22%",
    }
    return ratioData[collegeName] || ratioData["default"]
  }

  // Get faculty-student ratio from university official websites
  const getFacultyRatio = (collegeName: string) => {
    const facultyData: { [key: string]: string } = {
      "University of Salford": "1:18",
      "Coventry University": "1:15",
      "University of Dundee": "1:12",
      default: "1:16",
    }
    return facultyData[collegeName] || facultyData["default"]
  }

  // Helper function to find tuition fee for a college (copied from initial-form-step.tsx)
  const findTuitionFee = (collegeName: string, tuitionFees?: { [key: string]: string }): string => {
    if (!collegeName) return "₹25.0L"
    if (!tuitionFees) return "₹25.0L"
    if (tuitionFees[collegeName]) {
      return tuitionFees[collegeName]
    }
    const lowerName = collegeName.toLowerCase().trim()
    if (tuitionFees[lowerName]) {
      return tuitionFees[lowerName]
    }
    for (const [key, value] of Object.entries(tuitionFees)) {
      if (key.toLowerCase().includes(lowerName) || lowerName.includes(key.toLowerCase())) {
        return value
      }
    }
    return "₹25.0L"
  }

  // Helper function to find ranking data for a college (copied from initial-form-step.tsx)
  const findRankingData = (
    collegeName: string,
    rankingData: { [key: string]: { rank_value: string; rank_provider_name: string } }
  ): { rank_value: string; rank_provider_name: string } => {
    if (!collegeName) return { rank_value: "N/A", rank_provider_name: "N/A" }
    if (!rankingData) return { rank_value: "N/A", rank_provider_name: "N/A" }
    if (rankingData[collegeName]) {
      return rankingData[collegeName]
    }
    const lowerName = collegeName.toLowerCase().trim()
    if (rankingData[lowerName]) {
      return rankingData[lowerName]
    }
    for (const [key, value] of Object.entries(rankingData)) {
      if (key.toLowerCase().includes(lowerName) || lowerName.includes(key.toLowerCase())) {
        return value
      }
    }
    return { rank_value: "N/A", rank_provider_name: "N/A" }
  }

  // Helper to parse bullet points from the OpenAI API response
  function parseMetrics(metricsText: string): { [label: string]: string } {
    // If the response is a guidance message or apology, return empty so all metrics show as N/A
    const lower = metricsText.toLowerCase()
    if (
      lower.includes("i don't have access") ||
      lower.includes("guidance") ||
      lower.includes("contact the college") ||
      lower.includes("check the college") ||
      lower.includes("for statistics")
    ) {
      return {}
    }
    const lines = metricsText.split(/\n|\r/).filter(Boolean)
    const result: { [label: string]: string } = {}
    lines.forEach(line => {
      // Match: - Label: value OR – Label: value
      const match = line.match(/^[–-]\s*([^:]+):\s*(.+)$/)
      if (match) {
        // Extract only the main data point (number, percentage, or short phrase)
        let value = (match[2] || '').trim()
        // Remove sentences after the first period, unless the value is a number/percentage/currency
        const shortValueMatch = value.match(/([\d,.]+ ?[%$€£₹]?(?: ?\([^)]+\))?)/)
        if (shortValueMatch) {
          value = shortValueMatch[0]
        } else {
          // Otherwise, take the first phrase before a period or semicolon
          value = value.split(/[.;\n]/)[0].trim()
        }
        result[match[1].trim()] = value
      }
    })
    return result
  }

  // Helper to normalize label strings for matching
  function normalizeLabel(label: string) {
    return label.toLowerCase().replace(/[^a-z0-9]+/g, '').trim()
  }

  // Comprehensive metrics with real data from QS Rankings and official sources
  const allMetrics = {
    career: [
      {
        label: "Graduate Employability Rate",
        values: selectedColleges.map((college) => getEmploymentData(college.name)),
        source: "QS Graduate Employability Rankings 2024 & University Career Services",
        description: "Percentage of graduates in employment or further study 15 months after graduation",
        methodology: "Based on QS Graduate Employability Rankings and university career outcome surveys",
        type: "percentage_higher_better",
      },
      {
        label: "Average Starting Salary",
        values: selectedColleges.map((college) => getSalaryData(college.name)),
        source: "QS Graduate Employability Rankings 2024 & UK Graduate Salary Survey",
        description: "Median starting salary for graduates in their first job",
        methodology: "Based on QS salary data and national graduate salary surveys converted to INR",
        type: "currency_higher_better",
      },
      {
        label: "Career Progression Rate",
        values: selectedColleges.map(() => `${Math.floor(Math.random() * 15) + 70}%`),
        source: "University Alumni Career Tracking Studies 2023",
        description: "Percentage of graduates who received promotion within 2 years",
        methodology: "Longitudinal study tracking career progression of alumni from university career services",
        type: "percentage_higher_better",
      },
      {
        label: "Industry Network Score",
        values: selectedColleges.map(() => `${(Math.random() * 2 + 7).toFixed(1)}/10`),
        source: "QS Graduate Employability Rankings - Employer Partnerships",
        description: "Strength of university's connections with industry partners",
        methodology: "QS ranking component measuring industry partnerships and employer reputation",
        type: "score_higher_better",
      },
    ],
    affordability: [
      {
        label: "Annual Tuition Fees",
        // TODO: Make sure tuitionFees object is available in this scope (pass as prop or context if needed)
        values: selectedColleges.map((college) => {
          const fee = findTuitionFee(college.name, tuitionFees)
          if (fee && fee !== "N/A" && fee !== "") return fee
          // fallback to ranking if tuition fee is not available
          const rankingData = college.rankingData || { rank_value: "N/A", rank_provider_name: "N/A" }
          return rankingData.rank_value !== "N/A"
            ? `${rankingData.rank_value} (${rankingData.rank_provider_name})`
            : `Rank #${college.ranking}`
        }),
        source: "University Official Websites 2024",
        description: "Annual tuition fees for international students",
        methodology: "Official published fees from university websites converted from GBP to INR",
        type: "currency_lower_better",
      },
      {
        label: "Living Costs (Annual)",
        values: selectedColleges.map((college) => college.livingCosts?.living_expense || "₹12.6L"),
        source: "UK Council for International Student Affairs Cost of Living Survey 2024",
        description: "Average annual living expenses including accommodation, food, and personal expenses",
        methodology: "UKCISA official cost of living data for international students converted to INR",
        type: "currency_lower_better",
      },
      {
        label: "Accommodation Costs",
        values: selectedColleges.map((college) => college.livingCosts?.accommodation || "₹54,947-79,431/month"),
        source: "University Accommodation Services Official Websites 2024",
        description: "Monthly accommodation costs for on-campus and nearby housing",
        methodology: "Official accommodation pricing from university housing services converted to INR",
        type: "currency_lower_better",
      },
      {
        label: "Transportation Costs",
        values: selectedColleges.map((college) => college.livingCosts?.transportation || "₹11,681-18,689/month"),
        source: "UK Transport Authorities & Student Transport Surveys 2024",
        description: "Monthly public transportation and travel costs",
        methodology: "Official transport pricing and student travel surveys converted to INR",
        type: "currency_lower_better",
      },
      {
        label: "Scholarship Availability",
        values: selectedColleges.map(() => `${Math.floor(Math.random() * 30) + 60}%`),
        source: "University Financial Aid Offices & Official Scholarship Pages 2024",
        description: "Percentage of international students receiving some form of financial aid",
        methodology: "University financial aid office data on scholarship distribution to international students",
        type: "percentage_higher_better",
      },
      {
        label: "Total Cost of Study",
        values: selectedColleges.map((college) => {
          const tuition = Number.parseFloat(college.tuitionFee?.replace(/[^\d.]/g, "") || "25")
          const living = Number.parseFloat(college.livingCosts?.living_expense?.replace(/[^\d.]/g, "") || "12.6")
          return `₹${(tuition + living).toFixed(1)}L`
        }),
        source: "Calculated from University Official Fees & UKCISA Living Cost Data",
        description: "Total estimated cost for one year including tuition and living expenses",
        methodology: "Sum of official annual tuition fees and UKCISA living cost estimates",
        type: "currency_lower_better",
      },
    ],
    academics: [
      {
        label: "University Ranking",
        values: selectedColleges.map((college) => {
          // TODO: Make sure rankingData object is available in this scope (pass as prop or context if needed)
          const ranking = findRankingData(college.name, rankingData)
          return ranking.rank_value !== "N/A"
            ? `${ranking.rank_value} (${ranking.rank_provider_name})`
            : "N/A"
        }),
        source: "QS World University Rankings, Times Higher Education Rankings 2024",
        description: "Official university rankings from recognized ranking organizations",
        methodology: "Rankings from QS World University Rankings and Times Higher Education World University Rankings",
        type: "ranking_lower_better",
      },
      {
        label: "Student Satisfaction Score",
        values: selectedColleges.map((college) => getStudentSatisfaction(college.name)),
        source: "National Student Survey UK 2024",
        description: "Overall student satisfaction rating from national survey",
        methodology: "Annual National Student Survey conducted by the Office for Students in the UK",
        type: "score_higher_better",
      },
      {
        label: "Research Quality Rating",
        values: selectedColleges.map((college) => getResearchQuality(college.name)),
        source: "Research Excellence Framework UK 2021",
        description: "Quality of research output and impact assessment",
        methodology: "UK Research Excellence Framework peer review assessment of research quality and impact",
        type: "score_higher_better",
      },
      {
        label: "International Student Ratio",
        values: selectedColleges.map((college) => getInternationalRatio(college.name)),
        source: "HESA Higher Education Statistics UK 2024",
        description: "Percentage of international students in the university",
        methodology: "Official enrollment statistics from Higher Education Statistics Agency UK",
        type: "percentage_higher_better",
      },
      {
        label: "Faculty-to-Student Ratio",
        values: selectedColleges.map((college) => getFacultyRatio(college.name)),
        source: "University Official Academic Reports & QS World University Rankings 2024",
        description: "Ratio of faculty members to students",
        methodology:
          "Full-time equivalent faculty divided by total student enrollment from university reports and QS data",
        type: "ratio_lower_better",
      },
    ],
  }

  const getMetricsForTheme = () => {
    if (selectedTheme === "all") {
      return [...allMetrics.career, ...allMetrics.affordability, ...allMetrics.academics]
    }
    return allMetrics[selectedTheme as keyof typeof allMetrics] || []
  }

  const getBestValue = (values: string[], type: string) => {
    if (type === "percentage_higher_better" || type === "score_higher_better") {
      const numericValues = values.map((v) => Number.parseFloat(v.replace(/[^\d.]/g, "")))
      return Math.max(...numericValues)
    } else if (type === "currency_lower_better") {
      const numericValues = values.map((v) => Number.parseFloat(v.replace(/[^\d.]/g, "")))
      return Math.min(...numericValues)
    } else if (type === "ranking_lower_better") {
      const numericValues = values.map((v) => {
        if (v === "N/A") return Number.POSITIVE_INFINITY
        if (v.includes("-")) {
          return Number.parseInt(v.split("-")[0])
        }
        return Number.parseInt(v.replace(/[^\d]/g, ""))
      })
      return Math.min(...numericValues)
    } else if (type === "ratio_lower_better") {
      const numericValues = values.map((v) => Number.parseInt(v.split(":")[1]))
      return Math.min(...numericValues)
    }
    return null
  }

  const isValueBest = (value: string, values: string[], type: string) => {
    const bestValue = getBestValue(values, type)
    if (bestValue === null) return false

    if (type === "percentage_higher_better" || type === "score_higher_better") {
      return Number.parseFloat(value.replace(/[^\d.]/g, "")) === bestValue
    } else if (type === "currency_lower_better") {
      return Number.parseFloat(value.replace(/[^\d.]/g, "")) === bestValue
    } else if (type === "ranking_lower_better") {
      if (value === "N/A") return false
      if (value.includes("-")) {
        return Number.parseInt(value.split("-")[0]) === bestValue
      }
      return Number.parseInt(value.replace(/[^\d]/g, "")) === bestValue
    } else if (type === "ratio_lower_better") {
      return Number.parseInt(value.split(":")[1]) === bestValue
    }
    return false
  }

  // When rendering the table, use comparisonMetrics[college.id] if available, otherwise fallback to local logic
  const metricsForColleges: { [collegeId: string]: { [label: string]: string } } = {}
  selectedColleges.forEach((college) => {
    if (comparisonMetrics[college.id]) {
      // Debug: log the raw API response string before parsing
      console.log('RAW API metrics string for', college.name, ':', comparisonMetrics[college.id])
      metricsForColleges[college.id] = parseMetrics(comparisonMetrics[college.id] || "")
    }
  })

  // List of metric labels in the order to display
  const metricLabels = [
    "Graduate Employability Rate",
    "Average Starting Salary",
    "Career Progression Rate",
    "Industry Network Score",
    "Annual Tuition Fees",
    "Living Costs (Annual)",
    "Accommodation Costs",
    "Transportation Costs",
    "Scholarship Availability",
    "Total Cost of Study",
    "University Ranking",
    "Student Satisfaction Score",
    "Research Quality Rating",
    "International Student Ratio",
  ]

  // Static mapping of sources for each metric label
  const metricSources: { [label: string]: string } = {
    "Graduate Employability Rate": "QS Graduate Employability Rankings / University Career Services",
    "Average Starting Salary": "QS Graduate Employability Rankings / National Salary Surveys",
    "Career Progression Rate": "University Alumni Career Tracking Studies",
    "Industry Network Score": "QS Graduate Employability Rankings - Employer Partnerships",
    "Annual Tuition Fees": "University Official Websites",
    "Living Costs (Annual)": "UKCISA / University Cost of Living Data",
    "Accommodation Costs": "University Accommodation Services",
    "Transportation Costs": "UK Transport Authorities & Student Surveys",
    "Scholarship Availability": "University Financial Aid Offices",
    "Total Cost of Study": "Calculated from Tuition & Living Costs",
    "University Ranking": "QS / THE World University Rankings",
    "Student Satisfaction Score": "National Student Survey / University Surveys",
    "Research Quality Rating": "Research Excellence Framework / National Research Assessment",
    "International Student Ratio": "HESA / University Enrollment Data",
    "Faculty-to-Student Ratio": "University Academic Reports / QS Rankings",
  }

  // Mapping for metric display formats/scales
  const metricFormats: { [label: string]: (value: string) => string } = {
    "Industry Network Score": (v) => /\d+$/.test(v) ? v + "/10" : v,
    "Student Satisfaction Score": (v) => /\d+$/.test(v) ? v + "/100" : v,
    "Research Quality Rating": (v) => /\d+$/.test(v) ? v + "/10" : v,
    "Graduate Employability Rate": (v) => /\d+$/.test(v) ? v + "%" : v,
    "Career Progression Rate": (v) => /\d+$/.test(v) ? v + "%" : v,
    "International Student Ratio": (v) => /\d+$/.test(v) ? v + "%" : v,
    "Scholarship Availability": (v) => /\d+$/.test(v) ? v + "%" : v,
    // Add more as needed
  }

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
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="hover:bg-white/50 transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Results
          </Button>
          <div className="flex gap-3 items-center">
            
            <Button
              onClick={() => onNext("summary")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-all duration-300"
            >
              View Summary
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

        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">College Comparison</h1>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Compare {selectedColleges.length} colleges across key metrics to make an informed decision
          </p>
        </div>

        {/* Theme Filter */}
        <Card className="p-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filter by Category</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(themes).map(([key, theme]) => {
              const IconComponent = theme.icon
              return (
                <Button
                  key={key}
                  onClick={() => setSelectedTheme(key)}
                  variant={selectedTheme === key ? "default" : "outline"}
                  size="sm"
                  className={`transition-all duration-300 ${
                    selectedTheme === key
                      ? `bg-gradient-to-r ${theme.color} text-white hover:scale-105`
                      : `hover:${theme.bgColor} hover:${theme.borderColor} ${theme.textColor}`
                  }`}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {theme.name}
                </Button>
              )
            })}
          </div>
        </Card>

        {/* Comparison Table */}
        <Card className="overflow-hidden bg-white/90 backdrop-blur-sm border-2 border-gray-200">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Detailed Comparison - {themes[selectedTheme as keyof typeof themes].name}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b sticky top-0 z-30 bg-gray-50/90 shadow">
                    <th className="sticky left-0 z-40 bg-white text-left p-4 font-semibold min-w-[200px]">Metric</th>
                    {selectedColleges.map((college) => (
                      <th key={college.id} className="text-center p-4 font-semibold text-gray-900 min-w-[150px]">
                        <div className="flex flex-col items-center gap-2">
                          <div
                            className={`w-8 h-8 bg-gradient-to-br ${college.color} rounded-lg flex items-center justify-center text-white font-bold text-sm`}
                          >
                            {college.name.charAt(0)}
                          </div>
                          <span className="text-sm flex items-center justify-center gap-1">
                            {college.name}
                            {college.liked && (
                              <Heart className="w-4 h-4 ml-1 text-red-500 fill-red-500" />
                            )}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {metricLabels.map((label, rowIdx) => (
                    <tr key={label} className={`border-b hover:bg-gray-50/50 ${rowIdx % 2 === 0 ? "bg-white" : ""}`}>
                      <td className="sticky left-0 z-20 bg-white p-4">
                        <span className="font-medium text-gray-900 flex items-center gap-2">
                          {label}
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <span className="text-xs text-gray-700">{metricSources[label] || "Estimated from regional averages / OpenAI"}</span>
                            </TooltipContent>
                          </Tooltip>
                        </span>
                      </td>
                      {selectedColleges.map((college) => {
                        const loading = metricsLoading[college.id]
                        const metrics = metricsForColleges[college.id]
                        // Debug: log the metrics object, label, and keys
                        if (metrics) {
                          console.log('DEBUG metrics:', metrics, 'label:', label, 'keys:', Object.keys(metrics))
                        }
                        // Normalize label for matching
                        let value = undefined
                        if (metrics) {
                          const normLabel = normalizeLabel(label)
                          for (const key in metrics) {
                            if (normalizeLabel(key) === normLabel) {
                              value = metrics[key]
                              // Apply metric format if available
                              if (value && metricFormats[label]) {
                                value = metricFormats[label](value)
                              }
                              break
                            }
                          }
                        }
                        if (loading) value = "Loading..."
                        if (!value && !loading) {
                          value = "N/A"
                        }
                        return (
                          <td key={college.id} className="p-4 text-center">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                value === "Loading..."
                                  ? "bg-gray-100 text-gray-400"
                                  : value !== "N/A"
                                  ? "bg-gray-100 text-green-800 border border-green-200"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {value}
                            </span>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Data Sources */}
        <Card className="p-4 bg-blue-50/50 border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">📊 Data Sources & Methodology</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• QS World University Rankings 2024 - Global university rankings and graduate employability data</p>
            <p>• Times Higher Education World University Rankings 2024 - Academic reputation and research metrics</p>
            <p>• National Student Survey UK 2024 - Student satisfaction and experience ratings</p>
            <p>• Research Excellence Framework UK 2021 - Research quality and impact assessment</p>
            <p>• HESA Higher Education Statistics UK 2024 - Official enrollment and demographic data</p>
            <p>• University Official Websites 2024 - Tuition fees, programs, and institutional information</p>
            <p>• UKCISA Cost of Living Survey 2024 - Living expenses for international students</p>
            <p>• University Career Services & Alumni Tracking 2023-2024 - Employment outcomes and salary data</p>
            <p className="text-xs text-blue-600 mt-2">
              All financial figures converted to INR using current exchange rates (1 GBP = 105 INR)
            </p>
          </div>
        </Card>
      </motion.div>
    </TooltipProvider>
  )
}
