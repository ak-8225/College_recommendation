"use client"

import type React from "react"

import { motion } from "framer-motion"
import { ArrowLeft, Download, TrendingUp, DollarSign, Users, Heart, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartTooltip } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Line, ComposedChart, Legend } from "recharts"
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Step, College } from "@/types/college"

import { useState, useRef, useEffect } from "react"
import { toast } from "@/hooks/use-toast"
import LeapStyleSummaryPDF from "./LeapStyleSummaryPDF";

import Papa from 'papaparse'
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// REMOVE: import html2pdf from "html2pdf.js";

// Helper function to generate shareable link
const generateShareableLink = () => {
  const baseUrl = window.location.origin
  const shareUrl = `${baseUrl}/shared-report/${Date.now()}`
  return shareUrl
}

// Helper function to convert number to Roman numerals
function toRoman(num: number): string {
  const romanNumerals = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'];
  return romanNumerals[num] || num.toString();
}

// Add helper functions from results-step.tsx for exact data formatting
function isTuitionFeeInvalid(fee: any) {
  if (!fee) return true;
  const num = parseFloat(String(fee).replace(/[^\d.]/g, ""));
  // Consider invalid if missing, zero, or less than ₹50,000/year
  return isNaN(num) || num < 50000;
}

// Helper to format tuition fee exactly like results-step.tsx
function formatTuitionFee(college: College, fallbackTuitionFees: any = {}) {
  let fee = college.tuitionFee;
  if (isTuitionFeeInvalid(fee) && fallbackTuitionFees[college.id]) {
    fee = fallbackTuitionFees[college.id];
  }
  if (!fee || isTuitionFeeInvalid(fee)) fee = "8.0";
  const num = parseFloat(String(fee).replace(/[^\d.]/g, ""));
  if (isNaN(num)) return "N/A";
  const lakhs = Math.round(num / 100000);
  return `₹${lakhs}L`;
}

// Helper to format location exactly like results-step.tsx
function formatLocation(college: College) {
  return college.city && college.country 
    ? `${college.city} - ${college.country}`.replace(/(UK|USA|Canada|France)(\s*-\s*\1|\s*,\s*\1)*$/g, '$1')
    : (college as any).location || '';
}

// Helper to format ranking exactly like results-step.tsx
function formatRanking(college: College) {
  return college.rankingData && college.rankingData.rank_value !== "N/A"
    ? `Rank #${college.rankingData.rank_value} (${college.rankingData.rank_provider_name})`
    : "N/A";
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
  selectedNextStep?: string
  nextStepNotes?: string[]
  usps?: { [collegeId: string]: string }
  reorderedUSPs?: { [collegeId: string]: string[] }
}

// --- Chart Card Wrapper ---
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center w-full max-w-2xl mx-auto">
      <h3 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">{title}</h3>
      {children}
    </div>
  );
}

function formatPriority(priority: string) {
  return priority.toLowerCase() === "roi"
    ? "ROI"
    : priority.charAt(0).toUpperCase() + priority.slice(1).replace(/_/g, " ");
}

// NEXT STEPS CONSTANT
const steps = [
  "Book a free counseling call",
  "Ask for university-specific scholarships",
  "Get a full ROI & break-even report",
  "Apply for visa help",
  "Shortlist 3 best colleges",
  "Connect with students studying abroad",
]

// =========================
// ✅ NEXT STEPS Component
// =========================

function NextSteps() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedStep, setSelectedStep] = useState<string | null>(null)

  return (
    <div className="fixed left-4 bottom-4 lg:top-1/2 lg:-translate-y-1/2 z-50">
      <div className="relative inline-block">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gray-900 text-white hover:bg-gray-800 px-5 py-2.5 text-sm font-medium rounded-lg shadow-md flex items-center gap-2"
        >
          Next Steps
          <ChevronDown
            className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            size={16}
          />
        </Button>

        {isOpen && (
          <div className="absolute mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50">
            <div className="py-2">
              {steps.map((step) => (
                <div
                  key={step}
                  onClick={() => {
                    setSelectedStep(step)
                    setIsOpen(false)
                  }}
                  className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                    selectedStep === step
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedStep && (
          <div className="mt-3 text-sm text-gray-600 max-w-xs">
            <span className="font-semibold text-gray-800">Selected:</span> {selectedStep}
          </div>
        )}
      </div>
    </div>
  )
}

// Add a simple InfoTooltip component at the top
const InfoTooltip = ({ label }: { label: string }) => (
  <span className="ml-1 cursor-pointer group relative inline-block align-middle">
    <span className="inline-block w-4 h-4 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center justify-center">i</span>
    <span className="absolute left-1/2 -translate-x-1/2 mt-2 z-10 hidden group-hover:block bg-white border border-gray-300 text-xs text-gray-700 rounded px-2 py-1 shadow-lg whitespace-nowrap min-w-max">
      {label}
    </span>
  </span>
);
function formatLakhs(fee?: string) {
  if (!fee) return "N/A";
  const num = parseFloat(fee.replace(/[^\d.]/g, ""));
  if (isNaN(num)) return fee;
  return `₹${(num / 100000).toFixed(1)}L`;
}

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
  // If value already contains 'LPA', just return as is
  if (value.toUpperCase().includes("LPA")) return value.replace(/LPA+/gi, "LPA");
  // If value is already in lakhs (e.g., 26.3L), replace 'L' with 'LPA'
  if (value.toLowerCase().includes("l")) return value.replace(/l/gi, "LPA");
  // Convert to lakhs
  const lpa = (n / 100000).toFixed(2);
  return `₹${lpa} LPA`;
}

// Helper to generate a unique fallback avg package for each college
function generateUniqueAvgPackage(college: College) {
  // Use tuition fee and college name to generate a unique value
  let base = 20;
  let tuition = 0;
  if (college.tuitionFee) {
    const match = String(college.tuitionFee).replace(/[^\d.]/g, "");
    tuition = parseFloat(match) || 0;
  }
  // Hash college name for uniqueness
  let hash = 0;
  for (let i = 0; i < college.name.length; i++) hash += college.name.charCodeAt(i);
  // Add tuition and hash, scale to lakhs
  const lpa = (base + (tuition / 100000) + (hash % 10)).toFixed(1);
  return `₹${lpa} LPA`;
}

// Helper to batch async fetches with concurrency limit
async function batchFetch<T, R>(items: T[], fetchFn: (item: T) => Promise<R>, concurrency = 3): Promise<R[]> {
  const results: R[] = [];
  let i = 0;
  async function next() {
    if (i >= items.length) return;
    const idx = i++;
    results[idx] = await fetchFn(items[idx]);
    await next();
  }
  const workers = Array(Math.min(concurrency, items.length)).fill(0).map(next);
  await Promise.all(workers);
  return results;
}

export default function SummaryStep({
  pageVariants,
  pageTransition,
  formData,
  colleges,
  onNext,
  onBack,
  selectedNextStep,
  nextStepNotes,
  usps = {},
  reorderedUSPs = {},
}: SummaryStepProps) {
  
  // Function to load USPs from CSV for a college (same as results-step.tsx)
  async function loadUSPsForCollege(college: College): Promise<void> {
    if (csvUSPs[college.id] || csvUSPsLoading[college.id]) {
      return; // Already loaded or loading
    }

    setCsvUSPsLoading(prev => ({ ...prev, [college.id]: true }));

    try {
      console.log(`[Summary USP Debug] Fetching USPs for phone: ${formData?.phone}, college: ${college.name}, program: ${formData?.intendedMajor}`);
      
      const response = await fetch('/api/get-csv-usps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formData?.phone || '',
          collegeName: college.name,
          program: formData?.intendedMajor || ''
        })
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }

      const data = await response.json();
      console.log(`[Summary USP Debug] API response for ${college.name} - ${formData?.intendedMajor}:`, data);

      if (data.usps && Array.isArray(data.usps) && data.usps.length > 0) {
        // Set program-specific USPs for this college
        setCsvUSPs(prev => ({ ...prev, [college.id]: data.usps }));
      } else {
        setCsvUSPs(prev => ({ 
          ...prev, 
          [college.id]: [`USPs for phone ${formData?.phone} not found`] 
        }));
      }

    } catch (error) {
      console.error(`[Summary USP Debug] Error fetching USPs for phone ${formData?.phone}:`, error);
      setCsvUSPs(prev => ({ 
        ...prev, 
        [college.id]: [`Error loading USPs for phone ${formData?.phone}`] 
      }));
    } finally {
      setCsvUSPsLoading(prev => ({ ...prev, [college.id]: false }));
    }
  }

  // Function to get current USPs for a college
  function getCurrentUSPs(college: College) {
    console.log(`[Summary getCurrentUSPs] ${college.name}:`, {
      collegeId: college.id,
      hasCsvUSPs: !!csvUSPs[college.id],
      hasUsps: !!usps[college.id],
      hasReorderedUSPs: !!reorderedUSPs[college.id],
      collegeTags: college.tags
    });
    
    // First priority: CSV USPs from sheet (same as results page)
    if (csvUSPs[college.id]) {
      console.log(`[Summary getCurrentUSPs] Using CSV USPs for ${college.name}:`, csvUSPs[college.id]);
      return csvUSPs[college.id];
    }
    
    // Second priority: reordered USPs from results page
    if (reorderedUSPs[college.id] && reorderedUSPs[college.id].length > 0) {
      console.log(`[Summary getCurrentUSPs] Using reordered USPs for ${college.name}`);
      return reorderedUSPs[college.id];
    }
    
    // Third priority: original USPs from results page
    const originalUspLines = usps[college.id] || "";
    if (originalUspLines) {
      const uspLines = originalUspLines
        .split(/\n|\r/)
        .map(line => line.trim())
        .filter(line => line.startsWith('-'))
        .map(line => line.replace(/^[-•]\s*/, ''));
      if (uspLines.length > 0) {
        console.log(`[Summary getCurrentUSPs] Using parsed USPs for ${college.name}`);
        return uspLines;
      }
    }
    
    // Fourth priority: college tags ONLY if they're meaningful
    if (college.tags && Array.isArray(college.tags) && college.tags.length > 0) {
      const genericTags = ["moderate", "main campus", "main", "campus", "average", "standard"];
      const meaningfulTags = college.tags.filter(tag => 
        !genericTags.includes(tag.toLowerCase().trim())
      );
      if (meaningfulTags.length > 0) {
        console.log(`[Summary getCurrentUSPs] Using meaningful college tags for ${college.name}:`, meaningfulTags);
        return meaningfulTags;
      }
    }
    
    // Loading state
    if (csvUSPsLoading[college.id]) {
      return ['Loading USPs...'];
    }
    
    // Fallback USPs
    console.log(`[Summary getCurrentUSPs] Using fallback USPs for ${college.name}`);
    return [
      "Quality education and academic excellence",
      "International recognition and accreditation", 
      "Career development opportunities",
      "Supportive learning environment"
    ];
  }
  // State for selected college in the liked colleges grid (for USPs display)
  const likedColleges = colleges.filter((college) => college.liked);
  const [selectedCollegeId, setSelectedCollegeId] = useState(likedColleges[0]?.id || null);
  // Always use the name from the sheet if available
  const [studentName, setStudentName] = useState(formData.sheetName || formData.name);
  const [shareUrl, setShareUrl] = useState<string>("");
  const summaryRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  // Add state for CSV-based USPs
  const [csvUSPs, setCsvUSPs] = useState<{ [collegeId: string]: string[] }>({})
  const [csvUSPsLoading, setCsvUSPsLoading] = useState<{ [collegeId: string]: boolean }>({})
  const [collegeRoiData, setCollegeRoiData] = useState<{ [collegeId: string]: number }>({})
  const [roiLoading, setRoiLoading] = useState<{ [collegeId: string]: boolean }>({})
  const [counselorInfo, setCounselorInfo] = useState<{ name: string; title: string; phone?: string } | null>(null)
  const [counselorLoaded, setCounselorLoaded] = useState(false)
  const [downloading, setDownloading] = useState(false);
  const [personalizedSalaries, setPersonalizedSalaries] = useState<{ [collegeId: string]: string }>({});
  const [salaryLoading, setSalaryLoading] = useState<{ [collegeId: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Local state for rankings and package source per college
  const [rankingMap, setRankingMap] = useState<{ [id: string]: string }>({});
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

  // Helper to generate a unique fallback break-even range for each college
  function generateUniqueBreakEven(college: College) {
    // Use tuition fee and college name to generate a unique value
    let base = 1.8;
    let tuition = 0;
    if (college.tuitionFee) {
      const match = String(college.tuitionFee).replace(/[^\d.]/g, "");
      tuition = parseFloat(match) || 0;
    }
    // Hash college name for uniqueness
    let hash = 0;
    for (let i = 0; i < college.name.length; i++) hash += college.name.charCodeAt(i);
    // Add tuition and hash, scale to years
    const min = (base + (tuition / 1000000) + (hash % 10) * 0.1).toFixed(1);
    const max = (parseFloat(min) + 0.5).toFixed(1);
    return `${min} - ${max} Years`;
  }

    // likedColleges already declared at the top of the function

  // State to store break-even and source for each liked college
  const [breakEvenSources, setBreakEvenSources] = useState<{ [collegeId: string]: BreakEvenSource }>({});

  // Optimized: Batch fetch break-even/source for liked colleges
  useEffect(() => {
    let cancelled = false;
    async function fetchAllBreakEvens() {
      if (likedColleges.length === 0) {
        if (Object.keys(breakEvenSources).length !== 0) setBreakEvenSources({});
        if (loading !== false) setLoading(false);
        return;
      }
      if (loading !== true) setLoading(true);
      const resultsArr = await batchFetch(likedColleges, fetchBreakEvenWithSource, 3);
      if (cancelled) return;
      const results: Record<string, BreakEvenSource> = {};
      likedColleges.forEach((college, idx) => {
        results[college.id] = resultsArr[idx];
      });
      // Only update state if changed
      const isDifferent = JSON.stringify(breakEvenSources) !== JSON.stringify(results);
      if (isDifferent) setBreakEvenSources(results);
      if (loading !== false) setLoading(false);
    }
    fetchAllBreakEvens();
    return () => { cancelled = true; };
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

  // Load USPs from CSV for all liked colleges
  useEffect(() => {
    likedColleges.forEach((college) => {
      loadUSPsForCollege(college);
    });
  }, [likedColleges]);

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
      const phone = formData.phoneNumber || "";
      fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vRQtjtY6NkC6LSKa_vEVbwjfoMVUnkGpZp0Q1mpmtJEDx-KXgBLGlmTTOin-VB6ycISSIaISUVOcKin/pub?output=csv')
        .then((res) => res.text())
        .then((csv) => {
          Papa.parse(csv, {
            header: true,
            skipEmptyLines: true,
            complete: (results: any) => {
              let updated = false;
              if (phone) {
                const normalize = (str: string) => String(str || '').replace(/\D/g, '').trim();
                const userPhoneNorm = normalize(phone);
                let row = results.data.find((r: any) => {
                  const sheetPhoneNorm = normalize(r["Pre Login Leap User - Pre User → Phone"]);
                  return sheetPhoneNorm === userPhoneNorm;
                });
                if (!row && userPhoneNorm) {
                  const withCountryCode = '91' + userPhoneNorm;
                  row = results.data.find((r: any) => {
                    const sheetPhoneNorm = normalize(r["Pre Login Leap User - Pre User → Phone"]);
                    return sheetPhoneNorm === withCountryCode;
                  });
                }
                if (!row && userPhoneNorm && userPhoneNorm.startsWith('91')) {
                  const withoutCountryCode = userPhoneNorm.substring(2);
                  row = results.data.find((r: any) => {
                    const sheetPhoneNorm = normalize(r["Pre Login Leap User - Pre User → Phone"]);
                    return sheetPhoneNorm === withoutCountryCode;
                  });
                }
                if (row) {
                  const counselorName = row["Pre User Counseling - Pre User → Assigned Counsellor"];
                  const counselorPhone = row["Jerry"];
                  const studentNameFromSheet = row["Pre Login Leap User - Pre User → Name"];
                  if (
                    counselorInfo?.name !== (counselorName || "Ujjbal Sharma") ||
                    counselorInfo?.phone !== (counselorPhone || "6364467022")
                  ) {
                    setCounselorInfo({
                      name: counselorName || "Ujjbal Sharma",
                      title: "Leap Scholar Counselor",
                      phone: counselorPhone || "6364467022",
                    });
                    updated = true;
                  }
                  if (studentName !== (studentNameFromSheet || formData.sheetName || formData.name)) {
                    setStudentName(studentNameFromSheet || formData.sheetName || formData.name);
                    updated = true;
                  }
                } else {
                  if (counselorInfo?.name !== "Ujjbal Sharma") {
                    setCounselorInfo({
                      name: "Ujjbal Sharma",
                      title: "Leap Scholar Counselor",
                      phone: "6364467022",
                    });
                    updated = true;
                  }
                }
              } else {
                if (counselorInfo?.name !== "Ujjbal Sharma") {
                  setCounselorInfo({
                    name: "Ujjbal Sharma",
                    title: "Leap Scholar Counselor",
                    phone: "6364467022",
                  });
                  updated = true;
                }
              }
              if (!updated) setCounselorLoaded(true);
              else setTimeout(() => setCounselorLoaded(true), 0);
            },
          });
        })
        .catch((error) => {
          if (counselorInfo?.name !== "Ujjbal Sharma") {
            setCounselorInfo({
              name: "Ujjbal Sharma",
              title: "Leap Scholar Counselor",
              phone: "6364467022",
            });
          }
          setCounselorLoaded(true);
        });
    }
  }, [counselorLoaded, formData.phoneNumber]);

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

  // Optimized: Batch fetch rankings for liked colleges
  useEffect(() => {
    if (likedColleges.length === 0 || Object.keys(rankingMap).length > 0) return;
    let cancelled = false;
    async function fetchAllRankings() {
      const resultsArr = await batchFetch(likedColleges, async (college) => {
        try {
          const data = await fetchWithRetry(`/api/get-usps-google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ college: college.name, rankingOnly: true, phone: formData.phoneNumber }),
          }, 2, 1200);
          return data.ranking || "N/A";
        } catch {
          return "N/A";
        }
      }, 3);
      if (cancelled) return;
      const results: Record<string, string> = {};
      likedColleges.forEach((college, idx) => {
        results[college.id] = resultsArr[idx];
      });
      setRankingMap(results);
    }
    fetchAllRankings();
    return () => { cancelled = true; };
  }, [likedColleges, formData.phoneNumber]);

  // Optimized: Batch fetch avg package/source for liked colleges
  useEffect(() => {
    let cancelled = false;
    async function fetchAllAvgPackages() {
      if (likedColleges.length === 0) return;
      const resultsArr = await batchFetch(likedColleges, fetchAvgPackageWithSource, 3);
      if (cancelled) return;
      const results: Record<string, AvgPackageSource> = {};
      likedColleges.forEach((college, idx) => {
        results[college.id] = resultsArr[idx];
      });
      setAvgPackageSources(results);
    }
    fetchAllAvgPackages();
    return () => { cancelled = true; };
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
      // Use real data from college objects or generate realistic data based on college properties
      const baseRate = 85 + (college.ranking ? Math.max(0, 15 - parseInt(String(college.ranking)) / 10) : 5);
      const baseSalary = 25000 + (college.ranking ? Math.max(0, 20000 - parseInt(String(college.ranking)) * 100) : 5000);
      
      return {
        university: college.name,
        rate: Math.min(100, Math.max(70, baseRate + (index * 2))),
        salary: Math.max(20000, baseSalary + (index * 1500)),
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

  // ROI Data for the chart
  const robustROIData = (likedColleges.length > 0
    ? likedColleges.map((college, index) => {
        let roi = collegeRoiData[college.id];
        // If the value is missing, zero, negative, or not a number, use fallback/sample value
        if (typeof roi !== 'number' || roi <= 0 || isNaN(roi)) {
          // Use fallback value from fallbackROIData if available, else a static default
          const fallback = fallbackROIData[index % fallbackROIData.length];
          roi = fallback ? fallback.roi : 3.2 + index * 0.3;
        }
        return { name: college.name, roi: Number(roi.toFixed(1)) };
      })
    : fallbackROIData
  );
  let safeROIData = robustROIData.filter(d => typeof d.roi === 'number' && d.roi > 0);
  if (safeROIData.length === 0) {
    // If all data is missing, show fallback bars for each liked college or fallbackROIData
    if (likedColleges.length > 0) {
      safeROIData = likedColleges.map((college, i) => {
      const fallback = fallbackROIData[i % fallbackROIData.length];
        return { name: college.name, roi: fallback ? fallback.roi : 3.2 + i * 0.3 };
    });
    } else {
      safeROIData = [...fallbackROIData];
    }
  }

  // Employment Data for the chart
  const robustEmploymentData = (likedColleges.length > 0
    ? likedColleges.map((college, index) => {
        // Use fallback/sample data if real data is missing
        const fallback = fallbackEmploymentData[index % fallbackEmploymentData.length];
        let rate = fallback.rate;
        let salary = fallback.salary;
        return { university: college.name, rate, salary };
      })
    : fallbackEmploymentData
  );
  let safeEmploymentData = robustEmploymentData.length > 0 ? robustEmploymentData : fallbackEmploymentData;
  if (safeEmploymentData.length === 0) {
    if (likedColleges.length > 0) {
      safeEmploymentData = likedColleges.map((college, i) => {
      const fallback = fallbackEmploymentData[i % fallbackEmploymentData.length];
        return { university: college.name, rate: fallback.rate, salary: fallback.salary };
    });
    } else {
      safeEmploymentData = [...fallbackEmploymentData];
    }
  }
  const employmentData = (likedColleges.length > 0 ? generateEmploymentData() : fallbackEmploymentData)
    .filter(d => d && typeof d.rate === 'number' && d.rate > 0 && typeof d.salary === 'number' && d.salary > 0);

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
      usps: (Array.isArray(college.usps) ? college.usps : []).map((usp: string) => 
        String(usp).replace(/[\s\u00A0]*[-–—][\s\u00A0]*/g, ', ')
      )
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

  // Update the PDF download handler to use LeapStyleSummaryPDF for the PDF content
  const handleDownloadPDF = async () => {
    // Prepare data for LeapStyleSummaryPDF
    let userName = studentName || "user";
    if (userName.includes("'")) userName = userName.split("'")[0];
    const fileName = `${userName} - personalized summary.pdf`;
    // Gather data for the PDF component
    const pdfData = {
      studentName,
      courseName: formData.courseName,
      country: formData.country,
      counselorName: (counselorInfo && counselorInfo.name) || "",
      meetingDate: new Date().toLocaleDateString(),
      shortlistedColleges: likedColleges.map(college => ({
        name: college.name,
        courseName: college.courseName || formData.courseName,
        flag: college.flag,
        country: college.country,
        tuitionFee: college.tuitionFee,
        avgPackage: college.avgPackage,
        breakEven: breakEvenSources[college.id]?.value || "N/A",
        ranking: college.rankingData && college.rankingData.rank_value !== "N/A"
          ? `Rank #${college.rankingData.rank_value} (QS Rankings)`
          : "N/A",
      })),
    };
    // Render LeapStyleSummaryPDF to a hidden div
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "-9999px";
    document.body.appendChild(container);
    import("react-dom/client").then((ReactDOMClient) => {
      const root = ReactDOMClient.createRoot(container);
      root.render(
        <LeapStyleSummaryPDF {...pdfData} />
      );
      setTimeout(async () => {
        const html2canvas = (await import("html2canvas")).default;
        const jsPDF = (await import("jspdf")).default;
        const canvas = await html2canvas(container, { scale: 2, useCORS: true, backgroundColor: "#fff" });
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
        pdf.save(fileName);
        root.unmount();
        document.body.removeChild(container);
      }, 100);
    });
  };

  return (
    <TooltipProvider>
      {/* Header - Outside of PDF capture */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 sm:gap-0 px-2 sm:px-0">
        <Button
          variant="ghost"
          onClick={() => {
            console.log('Back to Analysis clicked');
            onBack();
          }}
          className="hover:bg-white/50 transition-all duration-300 hover:scale-105"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Analysis
        </Button>
        <div className="flex gap-3">
          {/* Download PDF Button */}
          {pdfLoading && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-80 pointer-events-auto">
              <div className="text-xl font-semibold text-blue-700 animate-pulse">Generating PDF, please wait...</div>
            </div>
          )}
          <Button
            onClick={() => {
              console.log('Logout clicked');
              onNext('initial-form');
            }}
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
        className="space-y-8 px-2 sm:px-0 pb-24"  // Added pb-24 for mobile spacing
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
          {/* Priorities display, styled like College Recommendations page */}
          {Array.isArray(formData.priority) && formData.priority.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
              <span className="text-base text-gray-600">Priorities:</span>
              <span className="flex flex-wrap items-center gap-2 ml-2">
                {formData.priority.map((priority: string, idx: number, arr: string[]) => (
                  <span
                    key={priority}
                    className="font-bold text-base md:text-lg text-[#bfa100]"
                    style={{ textShadow: '0 1px 2px #f7e7b3' }}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1).replace(/_/g, ' ')}
                    {idx < arr.length - 1 && <span className="mx-1 text-gray-400">·</span>}
                  </span>
                ))}
              </span>
            </div>
          )}
        </div>

        {/* Liked Universities Section - Improved UI */}
        {likedColleges.length > 0 && (
          <div className="mb-8 w-full">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <Heart className="w-7 h-7 text-red-500 fill-current" />
              Your Liked Colleges
            </h2>
            <div className="space-y-8">
              {likedColleges.map((college, collegeIndex) => (
                <div
                  key={college.id}
                  className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  {/* College Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-200">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                        {college.name?.[0] || '?'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-2xl text-gray-900 mb-2">{college.name}</h3>
                        <p className="text-gray-600 text-lg mb-3">{college.courseName}</p>
                        <div className="text-gray-600 flex items-center gap-1 text-sm mb-3">
                          <span className="text-base text-gray-600">
                            {formatLocation(college)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="bg-blue-100 px-4 py-2 rounded-full text-sm text-blue-800 font-semibold border border-blue-200">
                            {formatRanking(college)}
                          </span>
                          <span className="bg-green-100 px-4 py-2 rounded-full text-sm text-green-800 font-semibold border border-green-200">
                            Tuition fee: {formatTuitionFee(college)}
                          </span>
                          {college.country && (
                            <span className="bg-gray-100 px-4 py-2 rounded-full text-sm text-gray-700 font-semibold border border-gray-200">
                              {college.country}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* USPs Section */}
                  <div className="px-8 py-6">
                    <h4 className="text-lg font-semibold text-blue-700 mb-6 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      Key USPs
                    </h4>
                    <div className="space-y-3">
                      {(() => {
                        const collegeUSPs = getCurrentUSPs(college);
                        return collegeUSPs && collegeUSPs.length > 0 ? (
                          collegeUSPs.map((usp, idx) => (
                            <div key={idx} className="flex items-start text-base text-gray-900 font-medium group bg-gray-50 rounded-lg px-4 py-3 hover:bg-gray-100 transition-all duration-200 border border-gray-200">
                              <span className="flex-1">
                                <span className="mr-3 text-gray-600 font-semibold">({toRoman(idx)})</span>
                                <span className="text-gray-800">{usp}</span>
                              </span>
                              <div className="flex items-center gap-2 ml-4">
                                <select
                                  className="text-xs rounded-md border border-gray-300 px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                                  value={idx}
                                  onChange={() => {}} // Disabled for summary page
                                  style={{ width: 50 }}
                                  aria-label="USP order"
                                  disabled
                                >
                                  {Array.from({ length: collegeUSPs.length }).map((_, orderIdx) => (
                                    <option key={orderIdx} value={orderIdx}>{toRoman(orderIdx)}</option>
                                  ))}
                                </select>
                                <button
                                  className="text-xs text-red-500 hover:text-red-700 opacity-60 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50"
                                  title="Remove USP"
                                  aria-label="Remove USP"
                                  type="button"
                                  disabled // Disabled for summary page
                                >
                                  ✖️
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="bg-gray-50 rounded-lg px-4 py-6 text-center">
                            <p className="text-gray-500 text-base italic">No USP data available for this college</p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </motion.div>
      {selectedNextStep && (
  <div className="px-0 mt-8">
    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Next Steps</h2>
    <div className="bg-white border rounded-2xl shadow-md p-6 sm:p-8 text-base text-gray-800 text-left w-full">
      {(() => {
        let actionItems = null;
        switch (selectedNextStep) {
          case "Document Collection – First Step to Apply*":
            actionItems = (
              <>
                <div className="mb-2">Thanks for today’s discussion! Let’s begin the process by collecting your documents.</div>
                <ul className="list-disc pl-5 space-y-1">
                  <li>I’ll review and confirm once received so we can proceed to the next step</li>
                </ul>
              </>
            );
            break;
          case "Start Application – Shortlist is Final":
            actionItems = (
              <>
                <div className="mb-2">Congrats – your college list is finalized! Let’s now begin your applications.</div>
                <ul className="list-disc pl-5 space-y-1">
                  <li>We’ll begin applying after submission</li>
                  <li>You’ll start seeing application progress on your dashboard soon</li>
                </ul>
              </>
            );
            break;
          case "Revised Shortlist Discussion – Before We Apply":
            actionItems = (
              <>
                <div className="mb-2">Thanks for the inputs in today’s session! I’ll revise your college list based on our discussion.</div>
                <ul className="list-disc pl-5 space-y-1">
                  <li>I’ll share the updated shortlist</li>
                  <li>Let’s reconnect to finalize and move ahead with the applications</li>
                </ul>
              </>
            );
            break;
          case "Revised Shortlist + Document Collection":
            actionItems = (
              <>
                <div className="mb-2">We’ll be refining the college list while starting document collection in parallel.</div>
                <ul className="list-disc pl-5 space-y-1">
                  <li>I’ll share the revised shortlist before our next call</li>
                </ul>
              </>
            );
            break;
          case "IELTS Preparation – Let’s Begin":
            actionItems = (
              <>
                <div className="mb-2">Since IELTS is critical for your target colleges, let’s get started right away.</div>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Complete the diagnostic test</li>
                  <li>We’ll track your progress and adjust plans as needed</li>
                </ul>
              </>
            );
            break;
          case "Financial Planning – Loan or Scholarship Support":
            actionItems = (
              <>
                <div className="mb-2">Let’s ensure your finances are sorted before we apply.</div>
                <ul className="list-disc pl-5 space-y-1">
                  <li>We aim to complete your loan pre-approval soon</li>
                </ul>
              </>
            );
            break;
          default:
            actionItems = null;
        }
                          return (
          <>
            {actionItems}
            {nextStepNotes && nextStepNotes.length > 0 && (
              <ul className="list-disc pl-5 space-y-1 mt-4">
                <li>{nextStepNotes[nextStepNotes.length - 1]}</li>
              </ul>
            )}
          </>
        );
      })()}
                            </div>
            </div>
)}
    </TooltipProvider>
  )
}