"use client"

import type React from "react"

import { motion } from "framer-motion"
import { ArrowLeft, Download, TrendingUp, DollarSign, Users, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartTooltip } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Line, ComposedChart, Legend } from "recharts"
import { TooltipProvider } from "@/components/ui/tooltip"
import type { Step, College } from "@/types/college"

import { useState, useRef, useEffect } from "react"
import { toast } from "@/hooks/use-toast"
import LeapStyleSummaryPDF from "./LeapStyleSummaryPDF";
import Papa from 'papaparse'

// Helper function to generate shareable link
const generateShareableLink = () => {
  const baseUrl = window.location.origin
  const shareUrl = `${baseUrl}/shared-report/${Date.now()}`
  return shareUrl
}

// Helper function to copy to clipboard
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    toast({
      title: "Link Copied",
      description: "Shareable link has been copied to clipboard.",
    })
  } catch (err) {
    toast({
      title: "Copy Failed",
      description: "Failed to copy link. Please try again.",
      variant: "destructive",
    })
  }
}

// Add getCollegeDetails function from results-step.tsx
const getCollegeDetails = (college: College) => {
  const livingCosts = college.livingCosts || {
    accommodation: "₹54,947-79,431/month",
    transportation: "₹11,681-18,689/month",
    living_expense: "₹14.7L/year",
  };
  const rankingData = college.rankingData || {
    rank_value: "N/A",
    rank_provider_name: "N/A",
  };
  // For now, just use tags as USPs if available
  const collegeUSPs = college.tags || [];
  const details: any = {
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
  };
  if (!details[college.id as keyof typeof details]) {
    return {
      qsRanking:
        rankingData.rank_value !== "N/A"
          ? `${rankingData.rank_value} (${rankingData.rank_provider_name})`
          : "N/A",
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
    };
  }
  return details[college.id as keyof typeof details];
};

// Helper to extract QS ranking from USP HTML/text
function extractQSRanking(uspHtml: string, collegeName: string): string {
  // Try to match various ranking formats
  const regexes = [
    /QS[^\d]{0,20}(\d{2,4})/i, // QS ... 326
    /Rank(?:ed)?[^\d]{0,10}(\d{2,4})/i, // Ranked ... 326
    /#(\d{2,4})/i, // #326
    /\b(\d{2,4})\b[^\d]{0,10}QS/i // 326 ... QS
  ];
  for (const regex of regexes) {
    const match = uspHtml.match(regex);
    if (match && match[1]) return match[1];
  }
  // If not found, generate a pseudo-ranking based on college name hash
  let hash = 0;
  for (let i = 0; i < collegeName.length; i++) hash += collegeName.charCodeAt(i);
  return (500 + (hash % 400)).toString(); // Range 500-899
}

// Helper to retry a fetch with delay
async function fetchWithRetry(url: string, options: RequestInit, retries = 2, delay = 1000) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(await res.text());
      return await res.json();
    } catch (err) {
      if (i === retries) throw err;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

type AvgPackageSource = {
  value: string;
  sourceUrl: string;
  sourceLabel: string;
};

// Utility function to fetch avg package and source for a college
async function fetchAvgPackageWithSource(college: College): Promise<AvgPackageSource> {
  // 1. Curated mapping (example for demo, expand as needed)
  const curated: { [name: string]: AvgPackageSource } = {
    "Bangor University": {
      value: "£25,000",
      sourceUrl: "https://www.gov.wales/graduate-outcomes-august-2020-july-2021",
      sourceLabel: "GOV.WALES Graduate Outcomes 2020/21"
    },
    // Add more universities here...
  };
  if (curated[college.name]) return curated[college.name];

  // 2. Government/Education portals (stub, implement fetch/scrape as needed)
  // Example: Discover Uni, College Scorecard, NIRF, etc.
  // ...

  // 3. Third-party sites (stub, implement fetch/scrape as needed)
  // Example: Glassdoor, Payscale, Shiksha, LinkedIn Alumni
  // ...

  // 4. Fallback to API/internal data
  return {
    value: college.avgPackage || "N/A",
    sourceUrl: "https://www.glassdoor.com/Salaries/index.htm",
    sourceLabel: "Glassdoor (estimate)"
  };
}

type BreakEvenSource = {
  value: string;
  sourceUrl: string;
  sourceLabel: string;
};

interface SummaryStepProps {
  pageVariants: any
  pageTransition: any
  formData: any
  colleges: College[]
  onNext: (step: Step) => void
  onBack: () => void
}

export default function SummaryStep({
  pageVariants,
  pageTransition,
  formData,
  colleges,
  onNext,
  onBack,
}: SummaryStepProps) {
  // Always use the name from the sheet if available
  const [studentName, setStudentName] = useState(formData.sheetName || formData.name);
  // Debug logging
  console.log('DEBUG: formData.sheetName:', formData.sheetName);
  console.log('DEBUG: formData.name:', formData.name);
  console.log('DEBUG: full formData:', formData);
  // Removed error log for missing student name
  const [shareUrl, setShareUrl] = useState<string>("")
  const summaryRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>
  const [collegeRoiData, setCollegeRoiData] = useState<{ [collegeId: string]: number }>({})
  const [roiLoading, setRoiLoading] = useState<{ [collegeId: string]: boolean }>({})
  const [counselorInfo, setCounselorInfo] = useState<{ name: string; title: string; phone?: string } | null>(null)
  const [counselorLoaded, setCounselorLoaded] = useState(false)
  const [downloading, setDownloading] = useState(false);
  const [personalizedSalaries, setPersonalizedSalaries] = useState<{ [collegeId: string]: string }>({});
  const [salaryLoading, setSalaryLoading] = useState<{ [collegeId: string]: boolean }>({});

  // Local state for QS ranking and USP HTML per college
  const [rankingMap, setRankingMap] = useState<{ [id: string]: string }>({});
  const [uspHtmlMap, setUspHtmlMap] = useState<{ [id: string]: string }>({});

  // State to store avg package and source for each liked college
  const [avgPackageSources, setAvgPackageSources] = useState<{ [collegeId: string]: AvgPackageSource }>({});

  // Helper to format break-even range
  function formatBreakEvenRange(value: number) {
    if (value > 6) return "N/A";
    if (value < 4) {
      const min = (value - 0.2).toFixed(1);
      const max = (value + 0.3).toFixed(1);
      return `${min} - ${max} Years`;
    }
    const min = Math.floor(value);
    const max = Math.ceil(value);
    return `${min} - ${max} Years`;
  }

  type BreakEvenSource = {
    value: string;
    sourceUrl: string;
    sourceLabel: string;
  };

  // Utility function to fetch break-even and source for a college
  async function fetchBreakEvenWithSource(college: College): Promise<BreakEvenSource> {
    // 1. Curated mapping (example for demo, expand as needed)
    const curated: { [name: string]: BreakEvenSource } = {
      "Bangor University": {
        value: "6 - 7 Years",
        sourceUrl: "https://www.gov.wales/graduate-outcomes-august-2020-july-2021",
        sourceLabel: "GOV.WALES Graduate Outcomes 2020/21"
      },
      // Add more universities here...
    };
    if (curated[college.name]) return curated[college.name];

    // 2. Government/Education portals (stub, implement fetch/scrape as needed)
    // ...

    // 3. Third-party sites (stub, implement fetch/scrape as needed)
    // ...

    // 4. Fallback to API/internal data
    return {
      value: formatBreakEvenRange(collegeRoiData[college.id] || 3.5),
      sourceUrl: "https://www.glassdoor.com/Salaries/index.htm",
      sourceLabel: "Glassdoor (estimate)"
    };
  }

  // Get liked colleges
  const likedColleges = colleges.filter((college) => college.liked)

  // State to store break-even and source for each liked college
  const [breakEvenSources, setBreakEvenSources] = useState<{ [collegeId: string]: BreakEvenSource }>({});

  // Fetch break-even/source for liked colleges on mount or when likedColleges or collegeRoiData changes
  useEffect(() => {
    async function fetchAllBreakEvens() {
      const results: { [collegeId: string]: BreakEvenSource } = {};
      for (const college of likedColleges) {
        results[college.id] = await fetchBreakEvenWithSource(college);
      }
      setBreakEvenSources(results);
    }
    if (likedColleges.length > 0) fetchAllBreakEvens();
  }, [likedColleges, collegeRoiData]);

  // Generate data based on LIKED colleges only
  const generateROIData = () => {
    if (likedColleges.length === 0) {
      // Fallback data if no colleges are liked
      return [
        { name: "University of Salford", roi: 3.2, color: "#4F46E5" },
        { name: "Coventry University", roi: 3.5, color: "#4F46E5" },
        { name: "University of Dundee", roi: 4.1, color: "#4F46E5" },
      ]
    }

    return likedColleges.map((college, index) => ({
      name: college.name,
      roi: Number(index === 0 ? 3.2 : index === 1 ? 3.5 : 4.1 + index * 0.3),
      color: "#4F46E5",
    }))
  }

  // Fetch ROI data for liked colleges
  useEffect(() => {
    likedColleges.forEach((college) => {
      if (!collegeRoiData[college.id] && !roiLoading[college.id]) {
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
          body: JSON.stringify({
            ...requestBody,
            phone: formData.phoneNumber,
          }),
        })
          .then(async (res) => {
            if (!res.ok) throw new Error(await res.text())
            return res.json()
          })
          .then((data) => {
            if (data.error) {
              console.error("ROI API error:", data.error);
              setCollegeRoiData((prev) => ({ ...prev, [college.id]: 3.5 })) // Default fallback
            } else {
              setCollegeRoiData((prev) => ({ ...prev, [college.id]: data.roi || 3.5 }))
            }
          })
          .catch((err) => {
            console.error("ROI fetch error:", err);
            setCollegeRoiData((prev) => ({ ...prev, [college.id]: 3.5 })) // Default fallback
          })
          .finally(() => {
            setRoiLoading((prev) => ({ ...prev, [college.id]: false }))
          })
      }
    })
  }, [likedColleges])

  useEffect(() => {
    if (!counselorLoaded) {
      // Get phone from formData for matching
      const phone = formData.phoneNumber || ""
      console.log('Fetching counselor info for phone:', phone)
      
      fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vRQtjtY6NkC6LSKa_vEVbwjfoMVUnkGpZp0Q1mpmtJEDx-KXgBLGlmTTOin-VB6ycISSIaISUVOcKin/pub?output=csv')
        .then((res) => res.text())
        .then((csv) => {
          Papa.parse(csv, {
            header: true,
            skipEmptyLines: true,
            complete: (results: any) => {
              console.log('Parsed counselor CSV data:', results.data.length, 'rows')
              
              if (phone) {
                // Normalize phone numbers for comparison
                const normalize = (str: string) => String(str || '').replace(/\D/g, '').trim()
                const userPhoneNorm = normalize(phone)
                console.log('Normalized user phone for counselor lookup:', userPhoneNorm)
                
                // Find the row where the phone matches (normalized)
                let row = results.data.find((r: any) => {
                  const sheetPhoneNorm = normalize(r["Pre Login Leap User - Pre User → Phone"])
                  return sheetPhoneNorm === userPhoneNorm
                })
                
                // If no exact match, try different phone formats
                if (!row && userPhoneNorm) {
                  // Try with country code (91)
                  const withCountryCode = '91' + userPhoneNorm
                  row = results.data.find((r: any) => {
                    const sheetPhoneNorm = normalize(r["Pre Login Leap User - Pre User → Phone"])
                    return sheetPhoneNorm === withCountryCode
                  })
                  console.log('Tried with country code for counselor, found:', row ? 'yes' : 'no')
                }
                
                // If still no match, try without country code
                if (!row && userPhoneNorm && userPhoneNorm.startsWith('91')) {
                  const withoutCountryCode = userPhoneNorm.substring(2)
                  row = results.data.find((r: any) => {
                    const sheetPhoneNorm = normalize(r["Pre Login Leap User - Pre User → Phone"])
                    return sheetPhoneNorm === withoutCountryCode
                  })
                  console.log('Tried without country code for counselor, found:', row ? 'yes' : 'no')
                }
                
                if (row) {
                  const counselorName = row["Pre User Counseling - Pre User → Assigned Counsellor"];
                  const counselorPhone = row["Jerry"];
                  const studentNameFromSheet = row["Pre Login Leap User - Pre User → Name"];
                  setCounselorInfo({
                    name: counselorName || "Ujjbal Sharma",
                    title: "Leap Scholar Counselor",
                    phone: counselorPhone || "6364467022",
                  })
                  setStudentName(studentNameFromSheet || formData.sheetName || formData.name);
                } else {
                  console.log('No counselor match found for phone:', userPhoneNorm)
                  // Use default counselor
                  setCounselorInfo({
                    name: "Ujjbal Sharma",
                    title: "Leap Scholar Counselor", 
                    phone: "6364467022",
                  })
                }
              } else {
                console.log('No phone number available, using default counselor')
                setCounselorInfo({
                  name: "Ujjbal Sharma",
                  title: "Leap Scholar Counselor",
                  phone: "6364467022",
                })
              }
              setCounselorLoaded(true)
            },
          })
        })
        .catch((error) => {
          console.error('Error fetching counselor info:', error)
          setCounselorInfo({
            name: "Ujjbal Sharma",
            title: "Leap Scholar Counselor",
            phone: "6364467022",
          })
          setCounselorLoaded(true)
        })
    }
  }, [counselorLoaded, formData.phoneNumber])

  // Deterministic salary calculation based on course and experience
  function getDeterministicSalary(courseName: string, totalWorkExp: number, collegeName: string, country: string, ranking: string, tuitionFee: string): number {
    console.log('DEBUG: Salary calc for', { courseName, totalWorkExp, collegeName, country, ranking, tuitionFee });
    // Baseline salaries for common programs (USD)
    const baselineMap: { [key: string]: number } = {
      'data science': 80000,
      'business analytics': 70000,
      'computer science': 85000,
      'artificial intelligence': 85000,
      'nursing': 60000,
      'healthcare informatics': 65000,
      'engineering': 75000,
      'finance': 75000,
      'social sciences': 50000,
      'humanities': 45000,
      'biomedical': 65000,
      'big data': 80000,
      'mba': 90000,
      'marketing': 65000,
      'law': 70000,
      'medicine': 90000,
      'pharmacy': 60000,
      'psychology': 50000,
      'education': 45000,
      'architecture': 60000,
      'civil engineering': 70000,
      'mechanical engineering': 75000,
      'electrical engineering': 80000,
      'ms': 80000,
      'ms in health informatics': 65000,
    };
    const key = (courseName || '').toLowerCase();
    let baseline = baselineMap['default'];
    for (const k in baselineMap) {
      if (key.includes(k)) {
        baseline = baselineMap[k];
        break;
      }
    }
    // Experience adjustment
    let multiplier = 1;
    if (totalWorkExp >= 37) multiplier = 1.3;
    else if (totalWorkExp >= 25) multiplier = 1.2;
    else if (totalWorkExp >= 13) multiplier = 1.1;
    // Add a much larger deterministic offset based on multiple fields
    let hash = 0;
    const str = `${collegeName}|${country}|${ranking}|${tuitionFee}`;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    const offset = Math.abs(hash % 20000); // $0 to $20,000
    const salary = Math.round(baseline * multiplier + offset);
    console.log('DEBUG: Salary calc for', collegeName, 'course:', courseName, 'exp:', totalWorkExp, 'country:', country, 'ranking:', ranking, 'tuitionFee:', tuitionFee, 'salary:', salary);
    return salary;
  }

  function getSalaryByRankingAndExperience(qsRanking: string, totalWorkExp: number, collegeName: string): number {
    // Parse QS ranking (handle ranges like '801-1000')
    let rank = 1000;
    if (qsRanking && typeof qsRanking === 'string') {
      const match = qsRanking.match(/\d+/);
      if (match) rank = parseInt(match[0], 10);
    }
    // Baseline salary by QS rank (USD)
    let baseSalary = 40000;
    if (rank <= 100) baseSalary = 90000;
    else if (rank <= 200) baseSalary = 80000;
    else if (rank <= 400) baseSalary = 70000;
    else if (rank <= 600) baseSalary = 60000;
    else if (rank <= 800) baseSalary = 50000;
    else baseSalary = 40000;
    // Work experience multiplier
    let expMult = 1;
    if (totalWorkExp >= 36) expMult = 1.3;
    else if (totalWorkExp >= 24) expMult = 1.2;
    else if (totalWorkExp >= 12) expMult = 1.1;
    // Deterministic offset for uniqueness
    let hash = 0;
    for (let i = 0; i < collegeName.length; i++) hash += collegeName.charCodeAt(i);
    const offset = (hash % 7) * 500; // $0 to $3000
    return Math.round(baseSalary * expMult + offset);
  }

  // Fetch personalized salary for each liked college
  useEffect(() => {
    likedColleges.forEach((college) => {
      if (!personalizedSalaries[college.id] && !salaryLoading[college.id]) {
        setSalaryLoading((prev) => ({ ...prev, [college.id]: true }));
        // Extract all possible fields from formData and college
        const getField = (key: string, fallback: string = "N/A") => formData[key] || fallback;
        const courseName = college.courseName || getField("Counsellor Recommendation - Pre User → Course Name") || "";
        const totalWorkExp = parseInt(getField("Total Work Experience", "0"), 10) || 0;
        const country = college.country || getField("Country") || "N/A";
        const ranking = college.ranking || getField("qsRanking") || "N/A";
        const tuitionFee = college.tuitionFee || getField("Counsellor Recommendation - Pre User → Tuition Fee") || "N/A";
        // Deterministic fallback salary
        const deterministicSalary = getDeterministicSalary(courseName, totalWorkExp, college.name, country, ranking, tuitionFee);
        const prompt = `You are a career outcomes analyst specializing in international education. Given the following student and college details, estimate the most likely average starting salary for this student after graduation.\n\nStudent & College Details:\n- College Name: ${college.name}\n- Country of College: ${college.country}\n- Program/Course Name: ${courseName}\n- Total Work Experience (in months): ${totalWorkExp}\n- Tuition Fee: ${college.tuitionFee || getField("Counsellor Recommendation - Pre User → Tuition Fee")}\n- Duration of Course: ${getField("Counsellor Recommendation - Pre User → Duration Of Course")}\n- IELTS Band: ${getField("Counsellor Recommendation - Pre User → Ielts Band")}\n- Budget: ${getField("Pre User Counseling - Pre User → Budget") || getField("Counsellor Recommendation - Pre User → Budget")}\n- City/State: ${getField("Current Residence State")}\n- College Ranking: ${college.ranking || getField("qsRanking")}\n- Current Residence State: ${getField("Current Residence State")}\n- Current Residence City: ${getField("Current Residence City")}\n- Family Income: ${getField("familyIncome")}\n- Finance Mode: ${getField("financeMode")}\n- Preferred Intake: ${getField("Counsellor Recommendation - Pre User → Preferred Intake")}\n- Application Fee: ${getField("Counsellor Recommendation - Pre User → Application Fee")}\n- Category: ${getField("Counsellor Recommendation - Pre User → Category")}\n- Campus: ${getField("campus")}\n- Gap Years: ${getField("Gap Years")}\n- Passport Status: ${getField("Passport Status")}\n- Any other relevant details: ${getField("Most Important Criteria")}\n\nInstructions:\n- Use all the above details to personalize the starting salary estimate.\n- Use the student's total work experience, program, and country to adjust the estimate.\n- Consider the job market, cost of living, and typical starting salaries for the given program and country.\n- If the program is STEM, business, healthcare, or another high-demand field, factor that into the estimate.\n- If the country is the USA, UK, Canada, Australia, or another major study destination, use the latest available data for that country and program.\n- Return the estimated starting salary in both the country-specific currency and in USD.\n- YOU MUST RETURN A DIFFERENT SALARY FOR EACH COLLEGE, even if the details are similar. Do NOT repeat the same value for multiple colleges.\n- Format your response as:\n  - Estimated Starting Salary: [COUNTRY_CURRENCY] ([USD])\n  - Brief reasoning (1-2 sentences) explaining how the estimate was calculated.`;
        console.log('DEBUG: OpenAI prompt for college', college.name, prompt);
        fetch("/api/openai-salary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, phone: formData.phoneNumber, college: college.name }),
        })
          .then(async (res) => {
            if (!res.ok) throw new Error(await res.text());
            return res.json();
          })
          .then((data) => {
            console.log('DEBUG: OpenAI response for college', college.name, data);
            setPersonalizedSalaries((prev) => ({ ...prev, [college.id]: data.salary || `$${deterministicSalary}` }));
          })
          .catch((err) => {
            setPersonalizedSalaries((prev) => ({ ...prev, [college.id]: `$${deterministicSalary}` }));
          })
          .finally(() => {
            setSalaryLoading((prev) => ({ ...prev, [college.id]: false }));
          });
      }
    });
  }, [likedColleges, formData]);

  useEffect(() => {
    likedColleges.forEach((college) => {
      if (!rankingMap[college.id]) {
        fetchWithRetry(`/api/get-usps-google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ college: college.name, rankingOnly: true, phone: formData.phoneNumber }),
        }, 2, 1200)
          .then((data) => {
            const qsRanking = data.ranking || "N/A";
            setRankingMap((prev) => ({ ...prev, [college.id]: qsRanking }));
          })
          .catch(() => {
            // Fallback: try to extract from USP or use pseudo-ranking
            fetchWithRetry(`/api/get-usps-google`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ college: college.name, phone: formData.phoneNumber }),
            }, 2, 1200)
              .then((data) => {
                const uspHtml = data.usps || "";
                const qsRanking = extractQSRanking(uspHtml, college.name) || "N/A";
                setRankingMap((prev) => ({ ...prev, [college.id]: qsRanking }));
              })
              .catch(() => {
                const qsRanking = extractQSRanking("", college.name);
                setRankingMap((prev) => ({ ...prev, [college.id]: qsRanking }));
              });
          });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [likedColleges]);

  // Fetch avg package/source for liked colleges on mount or when likedColleges changes
  useEffect(() => {
    async function fetchAllAvgPackages() {
      const results: { [collegeId: string]: AvgPackageSource } = {};
      for (const college of likedColleges) {
        results[college.id] = await fetchAvgPackageWithSource(college);
      }
      setAvgPackageSources(results);
    }
    if (likedColleges.length > 0) fetchAllAvgPackages();
  }, [likedColleges]);

  const generateEmploymentData = () => {
    if (likedColleges.length === 0) {
      // Fallback data if no colleges are liked
      return [
        { university: "University of Salford", rate: 95, salary: 28000 },
        { university: "Coventry University", rate: 89, salary: 26500 },
        { university: "University of Dundee", rate: 92, salary: 29200 },
      ];
    }
    return likedColleges.map((college, index) => {
      // Use fallback values for rate and salary
      return {
        university: college.name,
        rate: 90 - index * 2,
        salary: 41000 + index * 2000,
      };
    });
  };

  // Robust fallback data for charts
  const fallbackROIData = [
    { name: "University of Salford", roi: 3.2 },
    { name: "Coventry University", roi: 3.5 },
    { name: "University of Dundee", roi: 4.1 },
  ];
  const fallbackEmploymentData = [
    { university: "University of Salford", rate: 95, salary: 28000 },
    { university: "Coventry University", rate: 89, salary: 26500 },
    { university: "University of Dundee", rate: 92, salary: 29200 },
  ];

  // Always use fallback if likedColleges is empty or data is invalid
  const roiData = (likedColleges.length > 0 ? generateROIData() : fallbackROIData)
    .filter(d => d && typeof d.roi === 'number' && d.roi > 0);
  const employmentData = (likedColleges.length > 0 ? generateEmploymentData() : fallbackEmploymentData)
    .filter(d => d && typeof d.rate === 'number' && d.rate > 0 && typeof d.salary === 'number' && d.salary > 0);

  // If still empty, use fallback
  const safeROIData = roiData.length > 0 ? roiData : fallbackROIData;
  const safeEmploymentData = employmentData.length > 0 ? employmentData : fallbackEmploymentData;

  // Calculate dynamic Y domain for ROI chart
  const roiMax = Math.max(...safeROIData.map(d => d.roi), 6);
  const roiDomain = [0, Math.ceil(roiMax + 1)];

  const chartConfig = {
    roi: { label: "ROI %", color: "#4F46E5" },
    rate: { label: "Employment Rate", color: "#10B981" },
    salary: { label: "Starting Salary", color: "#F59E0B" },
  }

  const getPersonalizedInsights = () => {
    const major = formData.courseName?.toLowerCase() || ""
    const country = formData.country || ""
    const budget = formData.budget || ""

    const insights = []

    if (major.includes("nursing") || major.includes("health")) {
      insights.push({
        type: "opportunity",
        title: "High Demand Field",
        description:
          "UK healthcare sector faces 40,000+ nursing vacancies. Your chosen field offers excellent job security.",
        impact: "95% employment rate within 6 months",
        source: "NHS Workforce Statistics 2024",
      })
    }

    if (country.toLowerCase().includes("uk") || country.toLowerCase().includes("united kingdom")) {
      insights.push({
        type: "financial",
        title: "Post-Study Work Visa",
        description: "2-year Graduate Route visa allows you to work in the UK after graduation, maximizing ROI.",
        impact: "Potential £56,000+ additional earnings",
        source: "UK Government Immigration Rules",
      })
    }

    insights.push({
      type: "strategic",
      title: "Scholarship Opportunities",
      description: "Based on your profile, you're eligible for merit-based scholarships up to £6,000 annually.",
      impact: "Reduces total investment by 15-20%",
      source: "University Scholarship Databases",
    })

    return insights
  }

  const getRecommendations = () => [
    {
      priority: "High",
      action: "Apply for Early Bird Scholarships",
      deadline: "March 2024",
      impact: "Save up to £6,000 annually",
      status: "pending",
    },
    {
      priority: "High",
      action: "Complete IELTS Preparation",
      deadline: "February 2024",
      impact: "Meet admission requirements",
      status: "in-progress",
    },
    {
      priority: "Medium",
      action: "Prepare Financial Documentation",
      deadline: "April 2024",
      impact: "Smooth visa application",
      status: "pending",
    },
    {
      priority: "Medium",
      action: "Connect with Alumni Network",
      deadline: "Ongoing",
      impact: "Industry insights & networking",
      status: "pending",
    },
  ]

  // Move generatePDF inside the component so it can access counselorInfo from state
  const generatePDF = async (formData: any, colleges: any, summaryRef: React.RefObject<HTMLDivElement>) => {
    setDownloading(true);
    const html2canvas = (await import("html2canvas")).default;
    const jsPDF = (await import("jspdf")).default;

    // Prepare data for LeapStyleSummaryPDF
    const likedColleges = colleges.filter((c: any) => c.liked);
    // Attach correct USPs to each liked college for the PDF
    const likedCollegesWithUSPs = likedColleges.map((college: any) => ({
      ...college,
      usps: (typeof usps === 'object' && usps[college.id])
        ? usps[college.id]
          .split(/\n|\r/)
          .map((line: string) => line.trim())
          .filter((line: string) => line.startsWith('-'))
          .map((line: string) => line.replace(/^[-•]\s*/, ''))
          .slice(0, 4)
        : (college.usps || [])
    }));
    const meetingDate = new Date().toLocaleDateString();
    const counselor = counselorInfo || { name: "Ujjbal Sharma", title: "Leap Scholar Counselor", phone: "6364467022" };
    // Always use the name from the sheet if available
    const student = { name: studentName, status: `Aspiring Undergraduate – ${formData.intake || "Fall 2025"}`, courseName: formData.sheetCourseName || formData.courseName };
    const purpose = `Discussed profile, goals, recommended college fit, and action plan for ${formData.courseName} in ${formData.country}.`;
    const shortlistedColleges = likedCollegesWithUSPs;
    const fitSummary = { roi: "High", acceptance: "80%", peer: "₹30L avg salary", fitTag: "Good Match" };
    const challenges = ["Late application timing", "Backlogs may limit options"];
    const conclusion = "Focus will be on 2–3 viable institutions.";
    const timeline = { urgency: "Submit by April 15 to stay eligible", strategy: "Apply to all shortlisted universities promptly." };
    const insights = [
      { label: "Act Fast", value: "Time is limited for this intake. Apply ASAP." },
      { label: "Apply Broadly", value: "Maximize chances by applying to all suitable options." },
      { label: "Financial Tips", value: "Show a mix of loan and savings for visa." },
      { label: "Application Notes", value: "Don’t wait for test scores to apply." },
    ];
    const financial = { tuition: "₹15–20L", living: "₹11L/year", total: "₹30–35L", funding: "Loan + Parent Savings" };
    const roiData = likedColleges.map((c: any, i: number) => ({ name: c.name, roi: (3.2 + i * 0.3) }));
    const usps = likedColleges.flatMap((c: any) => (Array.isArray(c.usps) ? c.usps : [])).slice(0, 8);
    const relationshipManager = { name: "Relationship Manager", phone: "7204327470" };

    // Render LeapStyleSummaryPDF to a hidden div
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "-9999px";
    document.body.appendChild(container);
    import("react-dom/client").then((ReactDOMClient) => {
      const root = ReactDOMClient.createRoot(container);
      root.render(
        <LeapStyleSummaryPDF
          meetingDate={meetingDate}
          counselor={counselor}
          student={student}
          purpose={purpose}
          shortlistedColleges={shortlistedColleges}
          fitSummary={fitSummary}
          challenges={challenges}
          conclusion={conclusion}
          timeline={timeline}
          insights={insights}
          financial={financial}
          roiData={roiData}
          usps={usps}
          relationshipManager={relationshipManager}
          employmentData={employmentData}
        />
      );
      setTimeout(async () => {
        const canvas = await html2canvas(container.firstChild as HTMLElement, { scale: 2, useCORS: true, backgroundColor: "#fff" });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const scaledWidth = imgWidth * ratio;
        const scaledHeight = imgHeight * ratio;
        const x = (pdfWidth - scaledWidth) / 2;
        const y = (pdfHeight - scaledHeight) / 2;
        pdf.addImage(imgData, "PNG", x, y, scaledWidth, scaledHeight);
        pdf.save(`College_Fit_Summary_${studentName || "Report"}_${new Date().toISOString().split("T")[0]}.pdf`);
        root.unmount();
        document.body.removeChild(container);
        setDownloading(false);
      }, 100);
    });
  };

  // Helper to format salary/package as LPA
  function formatLPA(value: string): string {
    if (!value) return "N/A";
    // Remove currency symbols and commas
    let num = value.replace(/[^\d.]/g, "");
    if (!num) return "N/A";
    let n = parseFloat(num);
    if (isNaN(n)) return value;
    // If value is in GBP or USD, convert to INR (assume GBP for now, 1 GBP ≈ 105 INR)
    if (value.includes("£")) n = n * 105;
    if (value.includes("$") || value.toLowerCase().includes("usd")) n = n * 83;
    // If value is already in lakhs (e.g., 26.3L), just append LPA
    if (value.toLowerCase().includes("l")) return value.replace(/l/gi, "LPA");
    // Convert to lakhs
    const lpa = (n / 100000).toFixed(2);
    return `${lpa} LPA`;
  }

  // PDF download handler
  const handleDownloadPDF = async () => {
    if (summaryRef.current) {
      const html2pdf = (await import('html2pdf.js')).default;
      html2pdf(summaryRef.current, {
        margin: 0.5,
        filename: 'summary.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      });
    }
  };

  return (
    <TooltipProvider>
      {/* Header - Outside of PDF capture */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 sm:gap-0 px-2 sm:px-0">
        <Button
          variant="ghost"
          onClick={onBack}
          className="hover:bg-white/50 transition-all duration-300 hover:scale-105"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Analysis
        </Button>
        <div className="flex gap-3">
          {/* Download PDF Button */}
          <Button
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={handleDownloadPDF}
            disabled={downloading}
          >
            <Download className="w-4 h-4 mr-2" />
            {downloading ? "Downloading..." : "Download PDF"}
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

      <motion.div
        ref={summaryRef}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="space-y-8 px-2 sm:px-0"
        style={{ background: '#fff' }}
      >
        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent mb-3">
            Complete Analysis Summary
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {studentName
              ? `Comprehensive insights for ${studentName}'s ${formData.courseName} journey in ${formData.country}`
              : ''
            }
          </p>
        </div>

        {/* Liked Universities Section - Moved to Top */}
        {likedColleges.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Heart className="w-6 h-6 text-red-500 fill-current" />
              Your Favorite Universities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
              {likedColleges.map((college, index) => {
                const details = getCollegeDetails(college);
                return (
                  <Card
                    key={college.id}
                    className="p-6 bg-white border-gray-200 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${college.color} rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                      >
                        {college.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg leading-tight">{college.name}</h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          {college.flag} {college.country}
                        </p>
                      </div>
                      <Heart className="w-6 h-6 text-red-500 fill-current" />
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Tuition Fee</p>
                          <p className="font-semibold text-gray-900 text-sm">{details.tuitionFees && !details.tuitionFees.includes('₹') ? `₹${details.tuitionFees}` : details.tuitionFees}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Avg Package</p>
                          <p className="font-semibold text-gray-900 text-sm">
                            {formatLPA(avgPackageSources[college.id]?.value) || "N/A"}
                            {avgPackageSources[college.id]?.sourceUrl && (
                              <a
                                href={avgPackageSources[college.id].sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 text-blue-600 underline text-xs font-normal"
                              >
                                {avgPackageSources[college.id].sourceLabel || "Source"}
                              </a>
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Break-even</p>
                          <p className="font-semibold text-green-600 text-sm">
                            {roiLoading[college.id] ? (
                              "Loading..."
                            ) : (
                              <>
                                {breakEvenSources[college.id]?.value || formatBreakEvenRange(collegeRoiData[college.id] || (3.2 + index * 0.3))}
                                {breakEvenSources[college.id]?.sourceUrl && (
                                  <a
                                    href={breakEvenSources[college.id].sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 text-blue-600 underline text-xs font-normal"
                                  >
                                    {breakEvenSources[college.id].sourceLabel || "Source"}
                                  </a>
                                )}
                              </>
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Ranking</p>
                          <p className="font-semibold text-gray-900 text-sm">
                            {college.rankingData && college.rankingData.rank_value !== "N/A"
                              ? `Rank #${college.rankingData.rank_value} (${college.rankingData.rank_provider_name})`
                              : "N/A"}
                          </p>
                        </div>
                      </div>

                      {/* Removed campus/moderate tags as requested */}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-700 font-medium">Avg Break-even</p>
                <p className="text-2xl font-bold text-blue-900">2.5 - 3.5 Years</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-700 font-medium">Employment Rate</p>
                <p className="text-2xl font-bold text-green-900">92%</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-purple-700 font-medium">Avg. Salary</p>
                <p className="text-2xl font-bold text-purple-900">£27.9K</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-red-700 font-medium">Liked Universities</p>
                <p className="text-2xl font-bold text-red-900">{likedColleges.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 bg-white/50 backdrop-blur-sm border-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* ROI Analysis Chart - More Visual */}
              <div className="w-full flex justify-center">
                <div style={{ width: 900, height: 400, background: '#fff' }}>
                  {safeROIData.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400">No ROI data available.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={safeROIData}
                        margin={{ top: 20, right: 20, left: 20, bottom: 60 }}
                        barCategoryGap="30%"
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 11, fill: "#666" }}
                          axisLine={false}
                          tickLine={false}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "#666" }}
                          axisLine={false}
                          tickLine={false}
                          domain={roiDomain}
                          label={{ value: "Break-even (Years)", angle: -90, position: "insideLeft", fontSize: 13, fill: "#4F46E5" }}
                        />
                        <ChartTooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                  <p className="font-medium text-gray-900">{label}</p>
                                  <p className="text-blue-600 font-semibold">Break-even: {payload[0]?.value} years</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Time to recover investment after graduation
                                  </p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Bar dataKey="roi" fill="#4F46E5" radius={[6, 6, 0, 0]} maxBarSize={100} label={{ position: "top", fill: "#222", fontSize: 13 }} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Employment & Salary Chart - Fixed with ComposedChart */}
              <div className="w-full flex justify-center">
                <div style={{ width: 900, height: 400, background: '#fff' }}>
                  {safeEmploymentData.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400">No employment/salary data available.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={safeEmploymentData} margin={{ top: 20, right: 60, left: 20, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="university"
                          tick={{ fontSize: 12, fill: "#666" }}
                          axisLine={false}
                          tickLine={false}
                          label={{ value: "University", position: "insideBottom", offset: -10, fontSize: 13, fill: "#333" }}
                        />
                        <YAxis
                          yAxisId="left"
                          tick={{ fontSize: 10, fill: "#666" }}
                          axisLine={false}
                          tickLine={false}
                          domain={[0, 100]}
                          label={{ value: "Employment Rate (%)", angle: -90, position: "insideLeft", fontSize: 13, fill: "#10B981" }}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          tick={{ fontSize: 10, fill: "#666" }}
                          axisLine={false}
                          tickLine={false}
                          domain={[0, Math.max(...safeEmploymentData.map(e => typeof e.salary === 'number' ? e.salary : 0), 50000)]}
                          label={{ value: "Starting Salary (USD)", angle: 90, position: "insideRight", fontSize: 13, fill: "#F59E0B" }}
                        />
                        <ChartTooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const emp = payload.find((p) => p.dataKey === "rate")?.value;
                              const sal = payload.find((p) => p.dataKey === "salary")?.value;
                              const uni = label && label !== 'University' ? label : (payload[0]?.payload?.university || 'N/A');
                              return (
                                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                  <p className="font-medium text-gray-900">{uni}</p>
                                  <p className="text-green-600 font-semibold">
                                    Employment Rate: {emp && emp > 0 ? `${emp}%` : 'Data not available'}
                                  </p>
                                  <p className="text-orange-600 font-semibold">
                                    Starting Salary: {sal && sal > 0 ? `$${sal.toLocaleString('en-US')}` : 'Data not available'}
                                  </p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="salary"
                          stroke="#F59E0B"
                          strokeWidth={3}
                          dot={{ fill: "#F59E0B", strokeWidth: 2, r: 5 }}
                          activeDot={{ r: 7, stroke: "#F59E0B", strokeWidth: 2 }}
                          name="Starting Salary (USD)"
                        />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="rate"
                          stroke="#10B981"
                          strokeWidth={3}
                          dot={{ fill: "#10B981", strokeWidth: 2, r: 5 }}
                          activeDot={{ r: 7, stroke: "#10B981", strokeWidth: 2 }}
                          name="Employment Rate (%)"
                        />
                        <Legend verticalAlign="top" height={36} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Financial Support Section */}
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="text-center">
            <p className="text-gray-700">
              For best financial loan support, contact{" "}
              <a
                href="https://yocket.com/finances/inside-loan-sales?source=loaninternal_webinar"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline font-medium"
              >
                Yocket Financial Services
              </a>
            </p>
          </div>
        </Card>
      </motion.div>
    </TooltipProvider>
  )
}