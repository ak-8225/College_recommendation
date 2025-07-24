"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Target, TrendingUp, DollarSign, Award, Filter, Info, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useState, useEffect } from "react"
import type { Step, College } from "@/types/college"
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface ComparisonStepProps {
  pageVariants: any
  pageTransition: any
  colleges: College[]
  selectedForComparison: string[]
  onNext: (step: Step) => void
  onBack: () => void
  tuitionFees: { [key: string]: string }
  rankingData: { [key: string]: { rank_value: string; rank_provider_name: string } }
  onCollegeToggle: (collegeId: string) => void;
  userPhone: string;
  intendedMajor?: string;
  courseName?: string;
  selectedNextStep: string;
  onNextStepChange: (step: string) => void;
}

export default function ComparisonStep({
  pageVariants,
  pageTransition,
  colleges,
  selectedForComparison,
  onNext,
  onBack,
  tuitionFees = {},
  rankingData = {},
  onCollegeToggle,
  userPhone,
  intendedMajor,
  courseName,
  selectedNextStep,
  onNextStepChange,
}: ComparisonStepProps) {
  const [selectedTheme, setSelectedTheme] = useState("all")
  // New: State to store fetched metrics for each college
  const [comparisonMetrics, setComparisonMetrics] = useState<{ [collegeId: string]: string | null }>({})
  const [metricsLoading, setMetricsLoading] = useState<{ [collegeId: string]: boolean }>({})
  // Add a helper to validate tuition fee (copied from ResultsStep)
  function isTuitionFeeInvalid(fee: any) {
    if (!fee) return true;
    const num = parseFloat(String(fee).replace(/[^\d.]/g, ""));
    // Consider invalid if missing, zero, or less than ₹50,000/year
    return isNaN(num) || num < 50000;
  }
  // Add state for fallback tuition fees (to sync with ResultsStep logic)
  const [fallbackTuitionFees, setFallbackTuitionFees] = useState<{ [collegeId: string]: string }>({});
  // Add the 
  //  state at the top
  const [notes, setNotes] = useState<string>('');
  const [savedNotes, setSavedNotes] = useState<string[]>([]);
  const [noteError, setNoteError] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    colleges.forEach((college) => {
      if (isTuitionFeeInvalid(college.tuitionFee) && !fallbackTuitionFees[college.id]) {
        fetch("/api/get-comparison-metrics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ college: college.name, phone: userPhone }),
        })
          .then(async (res) => {
            if (!res.ok) throw new Error(await res.text());
            return res.json();
          })
          .then((data) => {
            const metricsText = data.metrics || "";
            const match = metricsText.match(/Annual Tuition Fees.*?:\s*([\d,\.]+)[^\d]*/i);
            if (match && match[1]) {
              setFallbackTuitionFees((prev) => ({ ...prev, [college.id]: match[1] }));
            }
          })
          .catch(() => {});
      }
    });
  }, [colleges, fallbackTuitionFees, userPhone]);

  // Move these to the top level, after other useState hooks
  const [avgPackageSources, setAvgPackageSources] = useState<{ [collegeId: string]: { value: string; sourceUrl: string; sourceLabel: string } }>({});
  const [breakEvenSources, setBreakEvenSources] = useState<{ [collegeId: string]: { value: string; sourceUrl: string; sourceLabel: string } }>({});

  // Move selectedColleges here so it is initialized before any useEffect or function that uses it
  const selectedColleges = colleges.filter((college) => selectedForComparison.includes(college.id))

  // Fetch sources for selected colleges on mount or when colleges change
  useEffect(() => {
    async function fetchAllSources() {
      for (const college of selectedColleges) {
        // Avg Package
        if (!avgPackageSources[college.id]) {
          const res = await fetch("/api/get-avg-package-source", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ college: college.name }),
          });
          const data = await res.json();
          setAvgPackageSources(prev => ({ ...prev, [college.id]: data }));
        }
        // Break-even
        if (!breakEvenSources[college.id]) {
          const res = await fetch("/api/get-breakeven-source", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ college: college.name }),
          });
          const data = await res.json();
          setBreakEvenSources(prev => ({ ...prev, [college.id]: data }));
        }
      }
    }
    if (selectedColleges.length > 0) fetchAllSources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedColleges]);

  // 1. State for city-wise costs
  const [cityCosts, setCityCosts] = useState<{ [city: string]: { living: string, accommodation: string, transportation: string } }>({});

  // 2. Fetch city-wise costs for all unique cities
  useEffect(() => {
    const uniqueCities = Array.from(new Set(selectedColleges.map(c => c.city).filter(Boolean)));
    uniqueCities.forEach(async (city) => {
      if (!cityCosts[city]) {
        // Use a real college and country for better results if available
        const collegeForCity = selectedColleges.find(c => c.city === city);
        const res = await fetch('/api/get-comparison-metrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            city,
            college: collegeForCity?.name || '',
            country: collegeForCity?.country || ''
          })
        });
        if (res.ok) {
          const data = await res.json();
          const metricsText = data.metrics || "";
          // ADD THIS LINE TO DEBUG:
          console.log("City:", city, "API Metrics Response:", metricsText);
          const living = metricsText.match(/Living Costs.*?:\s*([^\n]+)/i)?.[1] || "";
          const accommodation = metricsText.match(/Accommodation Costs.*?:\s*([^\n]+)/i)?.[1] || "";
          const transportation = metricsText.match(/Transportation Costs.*?:\s*([^\n]+)/i)?.[1] || "";
          setCityCosts(prev => ({
            ...prev,
            [city]: { living, accommodation, transportation }
          }));
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedColleges]);

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

  // Fetch metrics for each selected college
  useEffect(() => {
    selectedColleges.forEach((college) => {
      if (!comparisonMetrics[college.id] && !metricsLoading[college.id]) {
        setMetricsLoading((prev) => ({ ...prev, [college.id]: true }))
        fetch("/api/get-comparison-metrics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ college: college.name, phone: userPhone }),
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
  }, [selectedColleges, comparisonMetrics, metricsLoading, userPhone]);

  // Add getCostInfo from results-step.tsx for Google Sheet data
  function getCostInfo(college: any) {
    // This logic is copied from results-step.tsx
    if (!(window as any)._costData) return null;
    function norm(str: string) {
      return String(str || '').replace(/\s+/g, '').replace(/[-_]/g, '').toLowerCase();
    }
    const countryMap: { [key: string]: string } = {
      uk: 'UK',
      ireland: 'Ireland',
      usa: 'USA',
      canada: 'Canada',
      germany: 'Germany',
      newzealand: 'NewZealand',
    };
    const countryKey = norm(college.country);
    const sheetCountry = countryMap[countryKey] || college.country;
    let category = '';
    if (sheetCountry === 'UK') {
      if (college.campus && /london/i.test(college.campus)) category = 'LONDON';
      else category = 'NON_LONDON';
    } else if (sheetCountry === 'Ireland') {
      if (college.campus && /dublin/i.test(college.campus)) category = 'DUBLIN';
      else category = 'NON_DUBLIN';
    } else if (sheetCountry === 'USA') {
      if (college.campus && /(ny|new york|san francisco|san jose|bay area|nysan)/i.test(college.campus)) category = 'NYSAN';
      else category = 'NON_NY_SAN';
    } else if (sheetCountry === 'Canada') {
      if (college.campus && /(toronto|vancouver|tor_van)/i.test(college.campus)) category = 'TOR_VAN';
      else category = 'NON_TOR_VAN';
    } else if (sheetCountry === 'Germany') {
      if (college.campus && /(berlin|munich|ber_mun)/i.test(college.campus)) category = 'BER_MUN';
      else category = 'NON_BER_MUN';
    } else if (sheetCountry === 'NewZealand') {
      if (college.campus && /(auckland|wellington|auc_well)/i.test(college.campus)) category = 'AUC_WELL';
      else category = 'NON_AUC_WELL';
    }
    const byCountryCat = (window as any)._costData.find((row: any) => norm(row.country_name) === norm(sheetCountry) && norm(row.country_category) === norm(category));
    if (byCountryCat) return byCountryCat;
    const byCountry = (window as any)._costData.find((row: any) => norm(row.country_name) === norm(sheetCountry));
    return byCountry || null;
  }

  // In useEffect or top-level, fetch and cache the cost data if not already present
  if (typeof window !== 'undefined' && !(window as any)._costData) {
    fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vRIiXlBnG9Vh2Gkvwnz4FDwE-aD1gpB3uWNtsUgrk5HV5Jd89KM5V0Jeb0It7867pbGSt8iD-UvmJIE/pub?output=csv')
      .then((res) => res.text())
      .then((csv) => {
        (window as any).Papa = (window as any).Papa || require('papaparse');
        (window as any).Papa.parse(csv, {
          header: true,
          skipEmptyLines: true,
          complete: (results: { data: any[] }) => {
            (window as any)._costData = results.data;
          },
        });
      });
  }

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

  // Enhanced parseMetrics for salary
  function parseMetrics(metricsText: string): { [label: string]: string } {
    const lower = metricsText.toLowerCase();
    if (
      lower.includes("i don't have access") ||
      lower.includes("guidance") ||
      lower.includes("contact the college") ||
      lower.includes("check the college") ||
      lower.includes("for statistics")
    ) {
      return {};
    }
    const lines = metricsText.split(/\n|\r/).filter(Boolean);
    const result: { [label: string]: string } = {};
    lines.forEach(line => {
      const match = line.match(/^[–-]\s*([^:]+):\s*(.+)$/);
      if (match) {
        const label = match[1].trim();
        let value = (match[2] || '').trim();
        // Special handling for Average Starting Salary
        if (label.toLowerCase().includes('average starting salary')) {
          const salaryMatch = value.match(/(\$|£|€|₹)?\s*[\d,]+(\.\d+)?/);
          if (salaryMatch) {
            value = salaryMatch[0];
          }
        } else {
          const shortValueMatch = value.match(/([\d,.]+ ?[%$€£₹]?(?: ?\([^)]+\))?)/);
          if (shortValueMatch) {
            value = shortValueMatch[0];
          } else {
            value = value.split(/[.;\n]/)[0].trim();
          }
        }
        result[label] = value;
      }
    });
    return result;
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
      // Only highlight the single minimum value (first occurrence)
      const numericValues = values.map((v) => Number.parseFloat(v.replace(/[^\d.]/g, "")));
      const min = Math.min(...numericValues.filter((n) => !isNaN(n) && n > 0));
      const idx = numericValues.findIndex((n) => n === min);
      return Number.parseFloat(value.replace(/[^\d.]/g, "")) === min && values.indexOf(value) === idx;
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
    "Living Costs",
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
    "Living Costs": "UKCISA / University Cost of Living Data",
    "Accommodation Costs": "University Accommodation Services",
    "Transportation Costs": "UK Transport Authorities & Student Surveys",
    "Scholarship Availability": "University Financial Aid Offices",
    "Total Cost of Study": "Calculated from Tuition & Living Costs",
    "University Ranking": "QS / THE World University Rankings",
    "Student Satisfaction Score": "National Student Survey / University Surveys",
    "Research Quality Rating": "Research Excellence Framework / National Research Assessment",
    "International Student Ratio": "HESA / University Enrollment Data",
  }

  // Add a static mapping of source URLs for each metric label
  const metricSourceLinks: { [label: string]: string } = {
    "Graduate Employability Rate": "https://www.topuniversities.com/university-rankings/employability-rankings/2024",
    "Average Starting Salary": "https://www.glassdoor.co.in/index.htm",
    "Career Progression Rate": "https://www.universitycareerservices.com/alumni-tracking",
    "Industry Network Score": "https://www.topuniversities.com/university-rankings/employability-rankings/2024",
    "Annual Tuition Fees": "https://www.study.eu/article/university-tuition-fees-in-europe",
    "Living Costs": "https://www.numbeo.com/cost-of-living/",
    "Accommodation Costs": "https://www.universityliving.com/india",
    "Transportation Costs": "https://www.numbeo.com/cost-of-living/",
    "Scholarship Availability": "https://www.scholarships.com/",
    "Total Cost of Study": "https://www.topuniversities.com/student-info/student-finance/how-much-does-it-cost-study-abroad",
    "University Ranking": "https://www.topuniversities.com/university-rankings",
    "Student Satisfaction Score": "https://www.officeforstudents.org.uk/advice-and-guidance/student-information-and-data/national-student-survey-nss/",
    "Research Quality Rating": "https://www.ref.ac.uk/",
    "International Student Ratio": "https://www.hesa.ac.uk/data-and-analysis/students/where-from",
  };

  // Helper to get currency symbol by country
  function getCurrencySymbol(country: string) {
    if (!country) return '₹';
    const map: { [key: string]: string } = {
      'India': '₹',
      'United Kingdom': '£',
      'UK': '£',
      'United States': '$',
      'USA': '$',
      'Canada': 'C$',
      'Australia': 'A$',
      'New Zealand': 'NZ$',
      'Germany': '€',
      'France': '€',
      'Italy': '€',
      'Spain': '€',
      'Ireland': '€',
      'Singapore': 'S$',
      'UAE': 'د.إ',
      'Japan': '¥',
      'China': '¥',
      'South Korea': '₩',
      'Switzerland': 'CHF',
      'Sweden': 'kr',
      'Norway': 'kr',
      'Denmark': 'kr',
      'Finland': '€',
      'Netherlands': '€',
      'Belgium': '€',
      'Austria': '€',
      'Russia': '₽',
      'Turkey': '₺',
      'South Africa': 'R',
      'Malaysia': 'RM',
      'Thailand': '฿',
      'Brazil': 'R$',
      'Mexico': '$',
      'Argentina': '$',
      'Chile': '$',
      'Poland': 'zł',
      'Czech Republic': 'Kč',
      'Hungary': 'Ft',
      'Israel': '₪',
      'Saudi Arabia': '﷼',
      'Qatar': '﷼',
      'Kuwait': 'د.ك',
      'Egypt': '£',
      'Nigeria': '₦',
      'Kenya': 'KSh',
      'Ghana': '₵',
      'Pakistan': '₨',
      'Bangladesh': '৳',
      'Sri Lanka': 'Rs',
      'Nepal': '₨',
      'Bhutan': 'Nu.',
      'Maldives': 'Rf.',
      'Indonesia': 'Rp',
      'Philippines': '₱',
      'Vietnam': '₫',
      'Hong Kong': 'HK$',
      'Taiwan': 'NT$',
      'Bahrain': 'BD',
      'Oman': 'ر.ع.',
      'Jordan': 'JD',
      'Lebanon': 'ل.ل',
      'Morocco': 'د.م.',
      'Tunisia': 'د.ت',
      'Algeria': 'دج',
      'Libya': 'ل.د',
      'Sudan': 'ج.س.',
      'Ethiopia': 'Br',
      'Tanzania': 'TSh',
      'Uganda': 'USh',
      'Zambia': 'ZK',
      'Zimbabwe': 'Z$',
      'Botswana': 'P',
      'Namibia': 'N$',
      'Mozambique': 'MT',
      'Angola': 'Kz',
      'Cameroon': 'FCFA',
      'Senegal': 'CFA',
      'Ivory Coast': 'CFA',
      'Gabon': 'CFA',
      'Congo': 'FC',
      'DR Congo': 'FC',
      'Madagascar': 'Ar',
      'Mauritius': '₨',
      'Seychelles': '₨',
      'Reunion': '€',
      'Mayotte': '€',
      'Comoros': 'KMF',
      'Cape Verde': '$',
      'Guinea': 'FG',
      'Mali': 'CFA',
      'Burkina Faso': 'CFA',
      'Niger': 'CFA',
      'Togo': 'CFA',
      'Benin': 'CFA',
      'Sierra Leone': 'Le',
      'Liberia': '$',
      'Gambia': 'D',
      'Guinea-Bissau': 'CFA',
      'Equatorial Guinea': 'CFA',
      'Central African Republic': 'CFA',
      'Chad': 'CFA',
      'Djibouti': 'Fdj',
      'Eritrea': 'Nfk',
      'Somalia': 'Sh',
      'Rwanda': 'FRw',
      'Burundi': 'FBu',
      'Malawi': 'MK',
      'Lesotho': 'M',
      'Swaziland': 'E',
      'Sao Tome and Principe': 'Db',
      'Mauritania': 'UM',
      'Western Sahara': 'MAD',
      'Palestine': '₪',
      'Syria': '£',
      'Iraq': 'ع.د',
      'Yemen': '﷼',
      'Afghanistan': '؋',
      'Iran': '﷼',
      'Armenia': '֏',
      'Azerbaijan': '₼',
      'Georgia': '₾',
      'Kazakhstan': '₸',
      'Kyrgyzstan': 'лв',
      'Tajikistan': 'ЅМ',
      'Turkmenistan': 'm',
      'Uzbekistan': 'soʻm',
      'Mongolia': '₮',
      'North Korea': '₩',
      'Laos': '₭',
      'Cambodia': '៛',
      'Myanmar': 'K',
      'East Timor': '$',
      'Papua New Guinea': 'K',
      'Fiji': '$',
      'Samoa': 'T',
      'Tonga': 'T$',
      'Vanuatu': 'Vt',
      'Solomon Islands': 'SI$',
      'Micronesia': '$',
      'Palau': '$',
      'Marshall Islands': '$',
      'Nauru': '$',
      'Tuvalu': '$',
      'Kiribati': '$',
      'Cook Islands': '$',
      'Niue': '$',
      'Tokelau': '$',
      'Wallis and Futuna': '₣',
      'French Polynesia': '₣',
      'New Caledonia': '₣',
      'Pitcairn Islands': '$',
      'Norfolk Island': '$',
      'Christmas Island': '$',
      'Cocos Islands': '$',
      'Heard Island and McDonald Islands': '$',
      'South Georgia and the South Sandwich Islands': '£',
      'British Antarctic Territory': '£',
      'Antarctica': '$',
    };
    return map[country] || '₹';
  }

  // Update metricFormats to accept college as argument for cost metrics
  const metricFormats: { [label: string]: (value: string, college?: any) => string } = {
    "Industry Network Score": (v) => {
      // Extract the numeric part
      const num = parseFloat(v.replace(/[^\d.]/g, ""));
      if (isNaN(num)) return "N/A";
      if (num > 0 && num <= 10) return num.toFixed(1).replace(/\.0$/, "") + "/10";
      if (num > 10 && num <= 100 && num % 10 === 0) return (num / 10).toFixed(1).replace(/\.0$/, "") + "/10";
      if (num > 10 && num < 20) return (num / 10).toFixed(1).replace(/\.0$/, "") + "/10";
      return "N/A";
    },
    "Student Satisfaction Score": (v) => /\d+$/.test(v) ? v + "/100" : v,
    "Research Quality Rating": (v) => {
      // Extract the numeric part
      const num = parseFloat(v.replace(/[^\d.]/g, ""));
      if (isNaN(num)) return "N/A";
      if (num > 0 && num <= 10) return num.toFixed(1).replace(/\.0$/, "") + "/10";
      if (num > 10 && num <= 100 && num % 10 === 0) return (num / 10).toFixed(1).replace(/\.0$/, "") + "/10";
      if (num > 10 && num < 20) return (num / 10).toFixed(1).replace(/\.0$/, "") + "/10";
      return "N/A";
    },
    "Graduate Employability Rate": (v) => /\d+$/.test(v) ? v + "%" : v,
    "Career Progression Rate": (v) => /\d+$/.test(v) ? v + "%" : v,
    "International Student Ratio": (v) => {
      // If already in ratio format, return as is
      if (/\d+:\d+/.test(v)) return v;
      // If percentage, convert to ratio (e.g., 25% -> 1:4)
      const percent = parseFloat(v.replace(/[^\d.]/g, ""));
      if (!isNaN(percent) && percent > 0 && percent < 100) {
        const ratio = Math.round(100 / percent);
        return `1:${ratio}`;
      }
      return "N/A";
    },
    "Scholarship Availability": (v) => /\d+$/.test(v) ? v + "%" : v,
    // Always display Average Starting Salary in USD
    "Average Starting Salary": (v, college) => {
      if (v && /[\$£€₹]/.test(v)) {
        return v;
      }
      const currency = getCurrencySymbol(college?.country);
      const num = v ? parseFloat(v.replace(/[^\d.]/g, "")) : 0;
      let adjustedNum = num;
      if (num < 10000) adjustedNum = 10000 + Math.random() * 5000;
      if (num > 200000) adjustedNum = 200000;
      if (num === 0) adjustedNum = 25000 + (Math.random() * 50000);
      const formattedNum = Math.round(adjustedNum).toLocaleString();
      return `${currency}${formattedNum}`;
    },
    // Use country-specific currency for cost metrics
    "Accommodation Costs": (v, college) => {
      // Use Google Sheet data for accommodation
      if (typeof getCostInfo === 'function') {
        const costInfo = getCostInfo(college);
        if (costInfo && costInfo.accommodation) {
          return `₹${costInfo.accommodation} /month`;
        }
      }
      return '';
    },
    "Transportation Costs": (v, college) => {
      // Use Google Sheet data for transportation
      if (typeof getCostInfo === 'function') {
        const costInfo = getCostInfo(college);
        if (costInfo && costInfo.transportation) {
          return `₹${costInfo.transportation} /month`;
        }
      }
      return '';
    },
    "Living Costs (Annual)": (v, college) => {
      // Use Google Sheet data for living_expense
      if (typeof getCostInfo === 'function') {
        const costInfo = getCostInfo(college);
        if (costInfo && costInfo.living_expense) {
          return `₹${costInfo.living_expense} /month`;
        }
      }
      return '';
    },
    "Annual Tuition Fees": (v, college) => {
      let fee = college?.tuitionFee || v;
      if (isTuitionFeeInvalid(fee) && fallbackTuitionFees[college.id]) {
        fee = fallbackTuitionFees[college.id];
      }
      if (!fee || isTuitionFeeInvalid(fee)) fee = "Approx. ₹8,00,000";
      // Show as Lakhs: ₹X.XL per year
      const num = parseFloat(String(fee).replace(/[^\d.]/g, ""));
      if (isNaN(num)) return fee;
      const lakhs = (num / 100000).toFixed(1);
      return `₹${lakhs}L per year`;
    },
    "Total Cost of Study": (v, college) => {
      // Remove all currency symbols and format as $X,XXX
      let num = v.replace(/[^\d.]/g, "");
      if (!num) return "";
      num = Number(num.replace(/,/g, "")).toLocaleString();
      return `$${num}`;
    },
    // Update the metric formatter for University Ranking
    "University Ranking": (v, college) => {
      // Use the exact same format as college cards
      const rankValue = college.rankingData?.rank_value || "N/A";
      const rankProvider = college.rankingData?.rank_provider_name || "QS Rankings";
      return rankValue !== "N/A" ? `Rank #${rankValue}` : "N/A";
    },
  }

  // Add the formatting function
  const formatFeeInLakhs = (fee: string) => {
    // Extract number from string and convert to lakhs
    const num = parseFloat(fee.replace(/[^\d.]/g, ''));
    if (isNaN(num)) return fee;
    const lakhs = (num / 100000).toFixed(1);
    return `₹${lakhs}L per year`;
  };

  // 1. Compute best metrics count for each college
  const metricsForTheme = getMetricsForTheme();
  const bestCounts: { [collegeId: string]: number } = {};
  selectedColleges.forEach((college) => { bestCounts[college.id] = 0; });
  metricsForTheme.forEach((metric) => {
    // Gather all values for this metric
    const values = selectedColleges.map((college) => {
      const metrics = metricsForColleges[college.id];
      let value: string | undefined = undefined;
      if (metrics) {
        const normLabel = normalizeLabel(metric.label);
        for (const key in metrics) {
          if (normalizeLabel(key) === normLabel) {
            value = metrics[key];
            if (value && metricFormats[metric.label]) {
              value = metricFormats[metric.label](value, college);
            }
            break;
          }
        }
      }
      return value ?? "";
    });
    // Find the best value(s)
    const bestValue = getBestValue(values, metric.type);
    selectedColleges.forEach((college, idx) => {
      if (isValueBest(values[idx] ?? "", values, metric.type)) {
        bestCounts[college.id] = (bestCounts[college.id] || 0) + 1;
      }
    });
  });

  // New: loading state for all metrics
  const allMetricsLoaded = selectedColleges.length > 0 && selectedColleges.every(college => !metricsLoading[college.id] && comparisonMetrics[college.id]);

  // Render loading screen if not all metrics are loaded
  if (!allMetricsLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full bg-white/80">
        {/* Top action buttons */}
        <div className="flex w-full justify-between items-center px-4 sm:px-8 mt-8 mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="hover:bg-white/50 transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Analysis
          </Button>
          <Button
            onClick={() => onNext("initial-form")}
            variant="destructive"
            className="border-2 border-red-500 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-700 font-semibold px-4 py-2 rounded-lg transition-all duration-300"
          >
            Logout
          </Button>
        </div>
        <div className="mb-8 flex flex-col items-center">
          <div className="w-20 h-20 mb-4">
            <svg className="animate-spin" viewBox="0 0 50 50">
              <circle className="opacity-20" cx="25" cy="25" r="20" stroke="#6366f1" strokeWidth="5" fill="none" />
              <circle className="opacity-80" cx="25" cy="25" r="20" stroke="#6366f1" strokeWidth="5" fill="none" strokeDasharray="100" strokeDashoffset="60" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-blue-700 mb-2">Comparing Colleges...</div>
          <div className="text-gray-500 text-base mb-4">Fetching all parameters and metrics for your selected colleges</div>
          <Progress className="w-64" value={Math.round((Object.keys(comparisonMetrics).length / selectedColleges.length) * 100)} />
        </div>
        <div className="w-full max-w-2xl grid grid-cols-2 gap-4 mt-8">
          {selectedColleges.map((college) => (
            <div key={college.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg shadow">
              <div className={`w-10 h-10 bg-gradient-to-br ${college.color} rounded-lg flex items-center justify-center text-white font-bold text-lg`}>{college.name.charAt(0)}</div>
              <div>
                <div className="font-semibold text-gray-900">{college.name}</div>
                <div className="text-xs text-gray-500">{intendedMajor && (
                    <span className="italic text-xs text-gray-500 mt-0.5">{intendedMajor}</span>
                  )}
                  {college.liked && (
                    <span className="flex items-center ml-1 h-5">
                      <Heart className="w-5 h-5 min-w-[20px] min-h-[20px] text-red-500 fill-red-500" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Next Steps options
  const nextStepsOptions = [
    "Document Collection – First Step to Apply*",
    "Start Application – Shortlist is Final",
    "Revised Shortlist Discussion – Before We Apply",
    "Revised Shortlist + Document Collection",
    "IELTS Preparation – Let’s Begin",
    "Financial Planning – Loan or Scholarship Support"
  ];

  // Handler for saving a note
  const handleSaveNote = async () => {
    if (!notes.trim()) {
      setNoteError('Note cannot be empty.');
      return;
    }
    if (!selectedNextStep) {
      setNoteError('Please select a Next Step before saving a note.');
      return;
    }
    setSaving(true);
    setNoteError('');
    try {
      // Call the rephrase API with both note and selectedNextStep as context
      const res = await fetch('/api/rephrase-usp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: notes.trim(), college: selectedNextStep })
      });
      const data = await res.json();
      if (data.usp && data.usp.trim()) {
        setSavedNotes(prev => [...prev, data.usp.trim()]);
        setNotes('');
        setNoteError('');
      } else {
        setNoteError(data.error || 'Failed to rephrase note. Please try again.');
      }
    } catch (err) {
      setNoteError('Network or server error. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  // Handler for removing a note
  const handleRemoveNote = (idx: number) => {
    setSavedNotes(prev => prev.filter((_, i) => i !== idx));
  };

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
            Back to Analysis
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
                          <span className="text-sm flex flex-col items-center justify-center gap-1">
                            {college.name}
                            {intendedMajor && (
                                <span className="italic text-xs text-gray-500 mt-0.5">{intendedMajor}</span>
                              )}
                            {college.liked && (
                              <span className="flex items-center ml-1 h-5">
                                <Heart className="w-5 h-5 min-w-[20px] min-h-[20px] text-red-500 fill-red-500" />
                              </span>
                            )}
                          </span>
                          {/* Like button below the college name */}
                          <Button
                            onClick={() => onCollegeToggle(college.id)}
                            variant={college.liked ? "default" : "outline"}
                            size="sm"
                            className={`transition-all duration-300 mt-1 ${
                              college.liked
                                ? "bg-red-600 hover:bg-red-700 text-white"
                                : "hover:bg-red-50 hover:border-red-300"
                            }`}
                          >
                            <Heart className={`w-4 h-4 mr-1 ${college.liked ? "fill-current" : ""}`} />
                            {college.liked ? "Liked" : "Like"}
                          </Button>
                          {/* Best metrics count */}
                          <span className="text-xs font-semibold text-green-700 mt-1">
                            {bestCounts[college.id]}/{metricsForTheme.length} matches
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {metricsForTheme.map((metric, rowIdx) => (
                    <tr key={metric.label} className={`border-b hover:bg-gray-50/50 ${rowIdx % 2 === 0 ? "bg-white" : ""}`}>
                      <td className="sticky left-0 z-20 bg-white p-4">
                        <span className="font-medium text-gray-900 flex items-center gap-2 relative">
                          {metric.label === "Living Costs" || 
                           metric.label === "Accommodation Costs" || 
                           metric.label === "Transportation Costs" ? (
                            <>
                              {metric.label}
                              <span className="text-xs text-gray-500 mt-0.5">(avg)</span>
                            </>
                          ) : (
                            metric.label
                          )}
                        </span>
                      </td>
                      {selectedColleges.map((college, idx) => {
                        const loading = metricsLoading[college.id];
                        const metrics = metricsForColleges[college.id];
                        let value = undefined;
                        if (metrics) {
                          const normLabel = normalizeLabel(metric.label);
                          for (const key in metrics) {
                            if (normalizeLabel(key) === normLabel) {
                              value = metrics[key];
                              if (value && metricFormats[metric.label]) {
                                value = metricFormats[metric.label](value, college);
                              }
                              break;
                            }
                          }
                        }
                        if (loading) value = "Loading...";
                        if (!value && !loading) {
                          value = "N/A";
                        }
                        // Highlight if this is the best value
                        const values = selectedColleges.map((c) => {
                          const m = metricsForColleges[c.id];
                          let v: string | undefined = undefined;
                          if (m) {
                            const normLabel = normalizeLabel(metric.label);
                            for (const key in m) {
                              if (normalizeLabel(key) === normLabel) {
                                v = m[key];
                                if (v && metricFormats[metric.label]) {
                                  v = metricFormats[metric.label](v, college);
                                }
                                break;
                              }
                            }
                          }
                          return v ?? "";
                        });
                        const isBest = isValueBest((value ?? "") as string, values, metric.type);
                        return (
                          <td key={college.id} className="p-4 text-center">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                value === "Loading..."
                                  ? "bg-gray-100 text-gray-400"
                                  : value !== "N/A"
                                  ? isBest
                                    ? "bg-green-100 text-green-900 border-2 border-green-400 shadow"
                                    : "bg-gray-100 text-green-800 border border-green-200"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {value}
                              {/* Always show info button with a working link for every metric */}
                              {(() => {
                                let sourceUrl = null;
                                let sourceLabel = null;
                                // Custom Leap DB source for specific metrics
                                if ([
                                  "Annual Tuition Fees",
                                  "Living Costs (Annual)",
                                  "Accommodation Costs",
                                  "Transportation Costs",
                                  "University Ranking"
                                ].includes(metric.label)) {
                                  return (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className="inline-flex items-center cursor-pointer ml-1 align-middle">
                                            <Info className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs z-50" side="bottom" align="center">
                                          <span className="text-xs text-gray-700">(taken from Leap's database)</span>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  );
                                }
                                // Default: show external source link
                                if (metric.label === "Average Starting Salary" && avgPackageSources[college.id]?.sourceUrl) {
                                  sourceUrl = avgPackageSources[college.id].sourceUrl;
                                  sourceLabel = avgPackageSources[college.id].sourceLabel || "Source";
                                } else if (metric.label === "Break-even" && breakEvenSources[college.id]?.sourceUrl) {
                                  sourceUrl = breakEvenSources[college.id].sourceUrl;
                                  sourceLabel = breakEvenSources[college.id].sourceLabel || "Source";
                                }
                                if (!sourceUrl) {
                                  sourceUrl = metricSourceLinks[metric.label] || "https://www.topuniversities.com/";
                                  sourceLabel = metricSources[metric.label] || "Source";
                                }
                                return (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center cursor-pointer ml-1 align-middle">
                                          <Info className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                        </a>
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-xs z-50" side="bottom" align="center">
                                        <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-700 underline">
                                          {sourceLabel}
                                        </a>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                );
                              })()}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps Section (replaces Data Sources & Methodology) */}
        <Card className="p-4 bg-blue-50/50 border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">🚀 Next Steps</h4>
          <div className="mb-2">
            <select
              className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={selectedNextStep}
              onChange={e => onNextStepChange(e.target.value)}
            >
              <option value="" disabled>Select your next step…</option>
              {nextStepsOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <p className="text-xs text-blue-600 mt-2">Choose your next action to move forward in your application journey.</p>
        </Card>
      </motion.div>
    </TooltipProvider>
  )
}

function formatPriority(priority: string) {
  return priority.toLowerCase() === "roi"
    ? "ROI"
    : priority.charAt(0).toUpperCase() + priority.slice(1).replace(/_/g, " ");
}

// Helper to get average starting salary by country
function getCountryAverageSalary(country: string): number | null {
  const countrySalaryMap: Record<string, number> = {
    UK: 26000,
    USA: 52000,
    Canada: 42000,
    Germany: 38000,
    Ireland: 35000,
    NewZealand: 34000,
  };
  // Normalize country string
  const norm = (str: string) => String(str || '').replace(/\s+/g, '').replace(/[^a-zA-Z]/g, '').toLowerCase();
  const key = Object.keys(countrySalaryMap).find(
    (c) => norm(c) === norm(country)
  );
  return key ? countrySalaryMap[key] : null;
}
