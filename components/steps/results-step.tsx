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
  StickyNote,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState, useRef, useEffect } from "react"
import type { Step, College } from "@/types/college"
import Papa from 'papaparse'
import type { ParseResult } from 'papaparse'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

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
    phone: string
    priorities?: string[]
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

// Add a modern SVG tick icon at the top of the file
const TickIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block mr-2 text-green-600">
    <circle cx="10" cy="10" r="10" fill="#E6F4EA"/>
    <path d="M6 10.5L9 13.5L14 7.5" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Utility function to fetch avg package and source for a college (copied from summary-step)
async function fetchAvgPackageWithSource(college: College): Promise<{ value: string }> {
  // 1. Curated mapping (example for demo, expand as needed)
  const curated: { [name: string]: { value: string } } = {
    "Bangor University": { value: "£25,000" },
    // Add more universities here...
  };
  if (curated[college.name]) return curated[college.name];
  // 2. Government/Education portals (stub, implement fetch/scrape as needed)
  // ...
  // 3. Third-party sites (stub, implement fetch/scrape as needed)
  // ...
  // 4. Fallback to API/internal data
  return { value: college.avgPackage || "N/A" };
}

// Utility function to fetch employability rate and source for a college (copied from summary-step)
async function fetchEmployabilityRateWithSource(college: College, program: string): Promise<{ value: string }> {
  // 1. Curated mapping (example for demo, expand as needed)
  const curated: { [name: string]: { value: string } } = {
    "Bangor University": { value: "92%" },
    // Add more universities here...
  };
  if (curated[college.name]) return curated[college.name];
  // 2. Government/Education portals (stub, implement fetch/scrape as needed)
  // ...
  // 3. Third-party sites (stub, implement fetch/scrape as needed)
  // ...
  // 4. Fallback to API/internal data
  return { value: (college as any).employabilityRate || "N/A" };
}

// Update the recruiters mapping to be by college and program
const collegeProgramRecruiters: Record<string, Record<string, string[]>> = {
  "University of Salford": {
    "Data Science": ["Amazon", "IBM", "Deloitte", "Capgemini", "TCS"],
    "Robotics": ["Siemens", "ABB", "Bosch", "Amazon Robotics", "GE"],
    "AI": ["Google", "Microsoft", "IBM", "Accenture", "Infosys"],
    "default": ["Amazon", "Deloitte", "PwC", "IBM", "Siemens"]
  },
  "Coventry University": {
    "Cyber Security": ["KPMG", "EY", "PwC", "Accenture", "HSBC"],
    "Engineering": ["Jaguar Land Rover", "Rolls-Royce", "Siemens", "Bosch", "Tata"],
    "Finance": ["HSBC", "Barclays", "Deloitte", "KPMG", "PwC"],
    "default": ["Jaguar Land Rover", "HSBC", "KPMG", "Accenture", "Rolls-Royce"]
  },
  "University of Dundee": {
    "Medicine": ["NHS", "Pfizer", "GSK", "Novartis", "AstraZeneca"],
    "Law": ["Linklaters", "Clifford Chance", "Allen & Overy", "Freshfields", "EY"],
    "Business": ["EY", "Barclays", "Tesco", "BBC", "PwC"],
    "default": ["NHS", "EY", "Barclays", "Tesco", "BBC"]
  }
  // Add more colleges and programs as needed
};

function getCollegeRecruiters(college: College) {
  const collegeMap = collegeProgramRecruiters[college.name];
  if (!collegeMap) return ["TCS", "Infosys", "Capgemini", "Wipro", "Cognizant"];
  const program = (college.courseName || "").trim().toLowerCase();
  // Try exact match first
  for (const key in collegeMap) {
    if (key !== "default" && program === key.trim().toLowerCase()) {
      return collegeMap[key];
    }
  }
  // Try partial match
  for (const key in collegeMap) {
    if (key !== "default" && program.includes(key.trim().toLowerCase())) {
      return collegeMap[key];
    }
  }
  // Fallback to default recruiters for the college
  return collegeMap["default"] || ["TCS", "Infosys", "Capgemini", "Wipro", "Cognizant"];
}

// Helper to calculate a unique fit score for each college
function calculateFitScore({ college, allColleges, userBudget, priorities }: {
  college: College,
  allColleges: College[],
  userBudget: string,
  priorities: string[],
}): number {
  // Normalize values for all colleges
  const rankings = allColleges.map((c: College) => Number(c.rankingData?.rank_value) || 1000);
  const tuitions = allColleges.map((c: College) => parseFloat((c.tuitionFee || "0").replace(/[^\d.]/g, "")) || 0);
  const rois = allColleges.map((c: College) => typeof c.roi === 'number' ? c.roi : (parseFloat(c.roi) || 5));
  const budgets = allColleges.map((c: College) => parseFloat((userBudget || "0").replace(/[^\d.]/g, "")) || 0);

  // Normalize functions
  const norm = (val: number, arr: number[], invert = false) => {
    const min = Math.min(...arr);
    const max = Math.max(...arr);
    if (max === min) return 1;
    let score = (val - min) / (max - min);
    if (invert) score = 1 - score;
    return score;
  };

  // Extract values for this college
  const ranking = Number(college.rankingData?.rank_value) || 1000;
  const tuition = parseFloat((college.tuitionFee || "0").replace(/[^\d.]/g, "")) || 0;
  const roi = typeof college.roi === 'number' ? college.roi : (parseFloat(college.roi) || 5);
  const budget = parseFloat((userBudget || "0").replace(/[^\d.]/g, "")) || 0;

  // Priority weights
  const priorityWeights = {
    ranking: priorities.includes("ranking") ? 2 : 1,
    budget: priorities.includes("budget") ? 2 : 1,
    roi: priorities.includes("roi") ? 2 : 1,
    tuition_fee: priorities.includes("tuition_fee") ? 2 : 1,
  };
  const totalWeight = priorityWeights.ranking + priorityWeights.budget + priorityWeights.roi + priorityWeights.tuition_fee;

  // Individual scores (normalized, 0-1)
  const rankingScore = norm(ranking, rankings, true) * priorityWeights.ranking;
  const budgetScore = norm(budget, tuitions, true) * priorityWeights.budget;
  const roiScore = norm(roi, rois, true) * priorityWeights.roi;
  const tuitionScore = norm(tuition, tuitions, true) * priorityWeights.tuition_fee;

  // Final fit score (weighted average, 0-1)
  let fitScore = (rankingScore + budgetScore + roiScore + tuitionScore) / totalWeight;

  // Add a small unique offset based on college id/name for uniqueness
  let hash = 0;
  for (let i = 0; i < college.name.length; i++) hash += college.name.charCodeAt(i);
  fitScore += (hash % 13) * 0.001;

  // Clamp and convert to percentage
  fitScore = Math.max(0, Math.min(1, fitScore));
  return Math.round(fitScore * 100);
}

function formatPriority(priority: string) {
  return priority.toLowerCase() === "roi"
    ? "ROI"
    : priority.charAt(0).toUpperCase() + priority.slice(1).replace(/_/g, " ");
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
  const [userName, setUserName] = useState<string>("")
  const [userNameLoaded, setUserNameLoaded] = useState(false)
  // Add state for avg package and employability rate sources
  const [avgPackageSources, setAvgPackageSources] = useState<{ [collegeId: string]: { value: string } }>({});
  const [employabilityRateSources, setEmployabilityRateSources] = useState<{ [collegeId: string]: { value: string } }>({});
  // Add state for orderedColleges
  const [orderedColleges, setOrderedColleges] = useState<College[]>(colleges);
  // Add state for notes and saved notes per college
  const [notes, setNotes] = useState<{ [collegeId: string]: string }>({});
  const [savedNotes, setSavedNotes] = useState<{ [collegeId: string]: string[] }>({});
  // Add state for note rephrasing loading
  const [noteRephrasing, setNoteRephrasing] = useState<{ [collegeId: string]: boolean }>({});
  // Add state for note rephrasing error
  const [noteRephraseError, setNoteRephraseError] = useState<{ [collegeId: string]: string }>({});
  // Add state for notes collapse
  const [notesOpen, setNotesOpen] = useState<{ [collegeId: string]: boolean }>({});
  // 1. Add state for fit scores and loading
  const [fitScores, setFitScores] = useState<{ [collegeId: string]: number }>({});
  const [fitScoreLoading, setFitScoreLoading] = useState<{ [collegeId: string]: boolean }>({});

  // Update orderedColleges when colleges prop changes
  useEffect(() => {
    setOrderedColleges(colleges);
  }, [colleges]);

  // Drag-and-drop handler
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(orderedColleges);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setOrderedColleges(reordered);
  };

  // Fetch saved college order and notes on mount
  useEffect(() => {
    const phone = userProfile?.phone;
    if (!phone) return;
    fetch(`/api/user-college-data?phone=${encodeURIComponent(phone)}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.collegeOrder) && data.collegeOrder.length > 0) {
          // Reorder colleges based on saved order
          const idToCollege = Object.fromEntries(colleges.map(c => [c.id, c]));
          const ordered = data.collegeOrder.map((id: string) => idToCollege[id]).filter(Boolean);
          // Add any new colleges not in saved order
          const missing = colleges.filter(c => !data.collegeOrder.includes(c.id));
          setOrderedColleges([...ordered, ...missing]);
        }
        if (data.notes && typeof data.notes === 'object') {
          // Convert notes to savedNotes format (array of notes per college)
          const notesObj: { [collegeId: string]: string[] } = {};
          Object.entries(data.notes).forEach(([collegeId, note]) => {
            notesObj[collegeId] = Array.isArray(note) ? note : [note];
          });
          setSavedNotes(notesObj);
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile?.phone, colleges.length]);

  // Helper to persist order and notes
  const persistUserCollegeData = (order: College[], notesObj: { [collegeId: string]: string[] }) => {
    const phone = userProfile?.phone;
    if (!phone) return;
    fetch('/api/user-college-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone,
        collegeOrder: order.map(c => c.id),
        notes: Object.fromEntries(Object.entries(notesObj).map(([k, v]) => [k, v]))
      })
    });
  };

  // Save/Reset order handlers
  const handleSaveOrder = () => {
    setOrderedColleges([...orderedColleges]);
    persistUserCollegeData(orderedColleges, savedNotes);
  };
  const handleResetOrder = () => {
    setOrderedColleges(colleges);
    persistUserCollegeData(colleges, savedNotes);
  };

  // Debug: Log when userName changes
  useEffect(() => {
    console.log('userName changed to:', userName)
  }, [userName])

  useEffect(() => {
    colleges.forEach((college) => {
      // Fetch USPs
      if (!usps[college.id] && !uspsLoading[college.id]) {
        setUspsLoading((prev) => ({ ...prev, [college.id]: true }))
        fetch(`/api/get-usps-google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ college: college.name }),
        })
          .then(async (res) => {
            console.log("USP API response status:", res.status);
            if (!res.ok) {
              const text = await res.text();
              console.error("USP API error:", text);
              throw new Error(`USP API error: ${res.status} - ${text}`);
            }
            const text = await res.text();
            console.log("USP API response text:", text);
            if (!text) throw new Error("Empty response from USP API");
            try {
              return JSON.parse(text);
            } catch (e) {
              console.error("USP API JSON parse error:", e, "Text:", text);
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
            console.error("USP API catch error:", err);
            setUsps((prev) => ({
              ...prev,
              [college.id]: `Network error: ${String(err)}`,
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
              setRoiData((prev) => ({ ...prev, [college.id]: 3.5 })) // Default fallback
            } else {
              setRoiData((prev) => ({ ...prev, [college.id]: data.roi || 3.5 }))
            }
          })
          .catch((err) => {
            setRoiData((prev) => ({ ...prev, [college.id]: -1 })) // -1 means network error
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
            setFallbackTuitionFees((prev) => ({ ...prev, [college.id]: "Network error" }));
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
      .catch(() => {
        setCostData([])
        setCostDataLoaded(true)
      })
    }

    // In ResultsStep, get phone from userProfile
    const phone = userProfile?.phone || ""
    console.log('userProfile:', userProfile)
    console.log('Phone from userProfile:', phone)
    
    // For testing: if no phone, try with a known phone from the sheet
    const testPhone = phone || "6364467022" // Use a phone number from the sheet for testing
    console.log('Using phone for lookup:', testPhone)
    
    if (!userNameLoaded && testPhone) {
      fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vRQtjtY6NkC6LSKa_vEVbwjfoMVUnkGpZp0Q1mpmtJEDx-KXgBLGlmTTOin-VB6ycISSIaISUVOcKin/pub?output=csv')
        .then((res) => res.text())
        .then((csv) => {
          Papa.parse(csv, {
            header: true,
            skipEmptyLines: true,
            complete: (results: any) => {
              console.log('userProfile.phone:', phone)
              console.log('Parsed CSV data type:', typeof results.data, 'length:', results.data.length)
              console.log('First few rows from sheet:', results.data.slice(0, 3))
              
              // Normalize phone numbers for comparison
              const normalize = (str: string) => String(str || '').replace(/\D/g, '').trim()
              const userPhoneNorm = normalize(testPhone)
              console.log('Normalized user phone:', userPhoneNorm)
              
              // Log all available phone numbers from sheet
              const allSheetPhones = results.data.map((r: any) => ({
                original: r["Pre Login Leap User - Pre User → Phone"],
                normalized: normalize(r["Pre Login Leap User - Pre User → Phone"]),
                name: r["Pre Login Leap User - Pre User → Name"]
              }))
              console.log('All sheet phones:', allSheetPhones.slice(0, 5))
              
              // Find the row where the phone matches (normalized)
              let row = results.data.find((r: any) => {
                const sheetPhoneNorm = normalize(r["Pre Login Leap User - Pre User → Phone"])
                console.log('Comparing with sheet phone:', sheetPhoneNorm)
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
                console.log('Tried with country code, found:', row ? 'yes' : 'no')
              }
              
              // If still no match, try without country code
              if (!row && userPhoneNorm && userPhoneNorm.startsWith('91')) {
                const withoutCountryCode = userPhoneNorm.substring(2)
                row = results.data.find((r: any) => {
                  const sheetPhoneNorm = normalize(r["Pre Login Leap User - Pre User → Phone"])
                  return sheetPhoneNorm === withoutCountryCode
                })
                console.log('Tried without country code, found:', row ? 'yes' : 'no')
              }
              
              if (row) {
                console.log('Matched row:', row)
                console.log('Setting userName to:', row["Pre Login Leap User - Pre User → Name"])
                setUserName(row["Pre Login Leap User - Pre User → Name"])
              } else {
                console.log('No phone match found. User phone:', userPhoneNorm)
                // Debug: log first few phone numbers and names
                const allPhones = results.data.map((r: any) => normalize(r["Pre Login Leap User - Pre User → Phone"]))
                const allNames = results.data.map((r: any) => r["Pre Login Leap User - Pre User → Name"])
                console.log('Available phones in sheet:', allPhones.slice(0, 10))
                console.log('Available names in sheet:', allNames.slice(0, 10))
                
                // Fallback: use the first available name
                const firstRow = results.data.find((r: any) => r["Pre Login Leap User - Pre User → Name"])
                if (firstRow) {
                  console.log('Using fallback name:', firstRow["Pre Login Leap User - Pre User → Name"])
                  setUserName(firstRow["Pre Login Leap User - Pre User → Name"])
                } else {
                  console.log('No names found in sheet')
                }
              }
              setUserNameLoaded(true)
            },
          })
        })
      .catch(() => setUserNameLoaded(true))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colleges, userNameLoaded, userProfile?.phone])

  // Fetch avg package and employability rate for all colleges on mount or when colleges change
  useEffect(() => {
    async function fetchAllSources() {
      const avgResults: { [collegeId: string]: { value: string } } = {};
      const empResults: { [collegeId: string]: { value: string } } = {};
      for (const college of colleges) {
        avgResults[college.id] = await fetchAvgPackageWithSource(college);
        empResults[college.id] = await fetchEmployabilityRateWithSource(college, college.courseName || "");
      }
      setAvgPackageSources(avgResults);
      setEmployabilityRateSources(empResults);
    }
    if (colleges.length > 0) fetchAllSources();
  }, [colleges]);

  // 2. Fetch fit score for each college on mount or when colleges/userProfile change
  useEffect(() => {
    async function fetchAllFitScores() {
      for (const college of colleges) {
        if (!fitScores[college.id] && !fitScoreLoading[college.id]) {
          setFitScoreLoading(prev => ({ ...prev, [college.id]: true }));
          try {
            const res = await fetch("/api/get-fit-score", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                college: college.name,
                country: college.country,
                city: college.city,
                tuitionFee: college.tuitionFee,
                livingCosts: college.livingCosts,
                avgSalary: college.avgPackage,
                ranking: college.rankingData?.rank_value,
                employmentRate: "", // College type does not have employabilityRate
                budget: (userProfile as any)?.budget || "",
                phone: userProfile?.phone || "",
                roi: roiData[college.id],
              }),
            });
            const data = await res.json();
            let score = data.fitScore || 0;
            if (score > 95) score = 95;
            setFitScores(prev => ({ ...prev, [college.id]: score }));
          } catch (err) {
            setFitScores(prev => ({ ...prev, [college.id]: 0 }));
          } finally {
            setFitScoreLoading(prev => ({ ...prev, [college.id]: false }));
          }
        }
      }
    }
    if (colleges.length > 0) fetchAllFitScores();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colleges, userProfile]);

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
  const { name = userName || "Student", intendedMajor = "your major", country = "your country" } = userProfile || {}
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
        recruiters: ["Amazon", "Deloitte", "PwC", "IBM", "Siemens"],
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
        recruiters: ["Jaguar Land Rover", "HSBC", "KPMG", "Accenture", "Rolls-Royce"],
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
        recruiters: ["NHS", "EY", "Barclays", "Tesco", "BBC"],
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
        recruiters: ["TCS", "Infosys", "Capgemini", "Wipro", "Cognizant"],
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

  // Handler for notes input
  const handleNoteChange = (collegeId: string, value: string) => {
    setNotes((prev) => ({ ...prev, [collegeId]: value }));
  };
  // Handler for saving note (with rephrasing)
  const handleSaveNote = async (collegeId: string) => {
    if (!notes[collegeId]?.trim()) return;
    setNoteRephrasing(prev => ({ ...prev, [collegeId]: true }));
    setNoteRephraseError(prev => ({ ...prev, [collegeId]: '' }));
    try {
      const college = orderedColleges.find(c => c.id === collegeId);
      const res = await fetch('/api/rephrase-usp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note: notes[collegeId],
          college: college?.name || '',
          program: college?.courseName || ''
        })
      });
      const data = await res.json();
      console.log('Rephrase USP response:', data);
      if (data.usp && data.usp.trim()) {
        setSavedNotes(prev => {
          const updated = {
            ...prev,
            [collegeId]: [...(prev[collegeId] || []), data.usp.trim()]
          };
          persistUserCollegeData(orderedColleges, updated);
          return updated;
        });
      } else {
        setNoteRephraseError(prev => ({ ...prev, [collegeId]: data.error || 'Failed to rephrase note. Please try again.' }));
      }
    } catch (err) {
      setNoteRephraseError(prev => ({ ...prev, [collegeId]: 'Network or server error. Please try again.' }));
    } finally {
      setNoteRephrasing(prev => ({ ...prev, [collegeId]: false }));
      setNotes(prev => ({ ...prev, [collegeId]: '' }));
    }
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
        {/* Top bar with logout at top right */}
        <div className="flex justify-between items-start mb-6">
          <div>
            {/* Comparison controls */}
            <div className="flex flex-row gap-2 mb-2">
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
            </div>
            {/* Save/Reset Order below comparison controls */}
            <div className="flex flex-row gap-2 mt-2">
              <Button onClick={handleSaveOrder} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300">Save Order</Button>
              <Button onClick={handleResetOrder} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-4 py-2 rounded-lg transition-all duration-300">Reset Order</Button>
            </div>
          </div>
          <div>
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
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-yellow-400 via-yellow-600 to-yellow-800 bg-clip-text text-transparent drop-shadow-lg tracking-tight mb-2 font-serif">
            College Recommendations for {userName || userProfile?.name || "Student"}
          </h1>
          <p className="text-base text-gray-600 max-w-2xl mx-auto flex flex-wrap items-center justify-center gap-2">
            <span>Based on your counseling profile and your selected priorities:</span>
            {Array.isArray(userProfile?.priorities) && userProfile.priorities.length > 0 && (
              <span className="flex flex-wrap items-center gap-2 ml-2">
                {(userProfile.priorities || []).map((priority: string, idx: number, arr: string[]) => (
                  <span
                    key={priority}
                    className="font-bold text-base md:text-lg text-[#bfa100]"
                    style={{ textShadow: '0 1px 2px #f7e7b3' }}
                  >
                    {formatPriority(priority)}
                    {idx < arr.length - 1 && <span className="mx-1 text-gray-400">·</span>}
                  </span>
                ))}
              </span>
            )}
          </p>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="college-list">
            {(provided) => (
              <div className="grid gap-6" ref={provided.innerRef} {...provided.droppableProps}>
                {orderedColleges.map((college, index) => {
                  const isSelected = college.liked
                  const details = getCollegeDetails(college)
                  const isHovered = hoveredCollege === college.id

                  return (
                    <Draggable key={college.id} draggableId={college.id} index={index}>
                      {(draggableProvided, snapshot) => (
                        <div
                          ref={draggableProvided.innerRef}
                          {...draggableProvided.draggableProps}
                          {...draggableProvided.dragHandleProps}
                          className={`p-3 transition-all duration-300 hover:shadow-xl border-2 ${
                            isSelected
                              ? "border-blue-500 bg-blue-50/50 shadow-lg"
                              : "border-gray-200 bg-white/80 hover:border-gray-300"
                          } backdrop-blur-sm rounded-2xl relative overflow-hidden`}
                        >
                          {/* 1. Add ranking badge at the top left of each card */}
                          {/* Fix the ranking badge at the top left of each card for better visibility */}
                          {/* Remove the floating badge from the top left of the card */}
                          <div className="flex flex-col lg:flex-row gap-2 sm:gap-3 w-full">
                            {/* Left/Main Section */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start gap-2 mb-1">
                                <div className="flex items-center gap-1">
                                  <div
                                    className={`w-12 h-12 bg-gradient-to-br ${college.color} rounded-xl flex items-center justify-center text-white font-bold text-base shadow-lg`}
                                  >
                                    {college.name.charAt(0)}
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                    <h3 className="text-lg font-bold text-gray-900 leading-tight mb-0.5 truncate flex items-center gap-2">
                                      {college.name}
                                      {intendedMajor && (
                                        <span className="italic text-sm text-gray-500 ml-2">{intendedMajor}</span>
                                      )}
                                    </h3>
                                    {/* Rank badge */}
                                    <span className="ml-2 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold border border-yellow-300 align-middle">
                                      {index + 1}{index === 0 ? 'st' : index === 1 ? 'nd' : index === 2 ? 'rd' : 'th'} College
                                    </span>
                                    <p className="text-gray-600 flex items-center gap-1 text-xs mb-0.5">
                                      <MapPin className="w-4 h-4 align-middle" />
                                      {[
                                        college.city,
                                        college.state,
                                        college.country
                                      ]
                                        .filter(
                                          (part) => part && typeof part === 'string' && part.trim() && part.trim().toLowerCase() !== 'not_available'
                                        )
                                        .join(', ')}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-1 mb-0.5">
                                      <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
                                        <Star className="w-3 h-3 mr-1 align-middle" />
                                        Rank #{college.ranking}
                                        {college.rankingData?.rank_provider_name && (
                                          <span className="ml-1 text-gray-500 text-[10px] font-normal">{college.rankingData.rank_provider_name}</span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium">
                                        {(() => {
                                          let fee = college.tuitionFee;
                                          if (isTuitionFeeInvalid(fee) && fallbackTuitionFees[college.id]) {
                                            fee = fallbackTuitionFees[college.id];
                                          }
                                          if (!fee || isTuitionFeeInvalid(fee)) fee = "8.0";
                                          const num = parseFloat(String(fee).replace(/[^\d.]/g, ""));
                                          if (isNaN(num)) return "N/A";
                                          const lakhs = (num / 100000).toFixed(2);
                                          return `₹${lakhs}L`;
                                        })()}
                                      </div>
                                    </div>
                                    {/* Action buttons inline with name and badges */}
                                    <div className="flex flex-row gap-2 items-center ml-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 bg-transparent flex items-center"
                                        onClick={() => handleViewDetails(college)}
                                      >
                                        <Eye className="w-4 h-4 mr-1 align-middle" />
                                        View Details
                                      </Button>
                                      <Button
                                        onClick={() => onCollegeToggle(college.id)}
                                        variant={isSelected ? "default" : "outline"}
                                        size="sm"
                                        className={`transition-all duration-300 flex items-center ${
                                          isSelected
                                            ? "bg-red-600 hover:bg-red-700 text-white"
                                            : "hover:bg-red-50 hover:border-red-300"
                                        }`}
                                      >
                                        <Heart className={`w-4 h-4 mr-1 align-middle ${college.liked ? "fill-current" : ""}`} />
                                        {college.liked ? "Liked" : "Like"}
                                      </Button>
                                      <Button
                                        onClick={() => handleComparisonToggle(college.id)}
                                        variant={selectedForComparison.includes(college.id) ? "default" : "outline"}
                                        size="sm"
                                        className={`transition-all duration-300 flex items-center ${
                                          selectedForComparison.includes(college.id)
                                            ? "bg-green-600 hover:bg-green-700 text-white border-2 border-green-600"
                                            : "hover:bg-green-50 hover:border-green-300 border-2 border-gray-300"
                                        }`}
                                        title="Select for comparison"
                                      >
                                        Compare
                                      </Button>
                                      <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-800 font-bold text-base border border-blue-200 shadow-sm">
                                        <span className="font-semibold mr-1">College Fit Score:</span>
                                        {fitScoreLoading[college.id]
                                          ? <span className="text-xs text-gray-400">Loading...</span>
                                          : (fitScores[college.id] !== undefined ? `${fitScores[college.id]}%` : "N/A")}
                                      </span>
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <button
                                              type="button"
                                              className="ml-1 w-7 h-7 flex items-center justify-center rounded-full bg-blue-100 border border-blue-300 text-blue-700 hover:bg-blue-200 hover:text-blue-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            >
                                              <Info className="w-4 h-4 align-middle" />
                                            </button>
                                          </TooltipTrigger>
                                          <TooltipContent className="max-w-xs text-xs text-gray-800 z-50" side="bottom" align="center">
                                            <div className="font-bold mb-1">College Fit Score</div>
                                            <div className="mb-1">This score is calculated based on:
                                              <ul className="list-disc ml-4">
                                                <li>Ranking</li>
                                                <li>Budget</li>
                                                <li>Break-even (ROI)</li>
                                                <li>Tuition Fee</li>
                                                <li><span className="font-semibold text-blue-700">Your selected priorities (weighted most)</span></li>
                                              </ul>
                                            </div>
                                            <div className="mb-1">Key Metrics for this college:
                                              <ul className="list-disc ml-4">
                                                <li>Ranking: {college.rankingData?.rank_value || 'N/A'}</li>
                                                <li>Tuition Fee: {college.tuitionFee || 'N/A'}</li>
                                                <li>Break-even: {(() => {
                                                  let roi = roiData[college.id];
                                                  if (typeof roi !== 'number' || isNaN(roi) || roi > 6) roi = 6;
                                                  return roi ? `${roi} years` : 'N/A';
                                                })()}</li>
                                              </ul>
                                            </div>
                                            <div className="text-gray-500">Your priorities are weighted more heavily in this score.</div>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                  </div>
                                  {/* USPs Section */}
                                  <div className="mt-2 flex flex-col gap-0.5">
                                    <div className="mt-0 mb-0.5">
                                      {uspsLoading[college.id] ? (
                                        <div className="text-gray-400 text-xs italic">Loading USPs...</div>
                                      ) : (
                                        <div className="flex flex-col gap-3 bg-white/80 rounded-xl p-4 shadow-sm border border-gray-100">
                                          {(() => {
                                            const originalUspLines = usps[college.id] || "";
                                            const uspLines = originalUspLines
                                              .split(/\n|\r/)
                                              .map(line => line.trim())
                                              .filter(line => line.startsWith('-'))
                                              .map(line => line.replace(/^[-•]\s*/, ''))
                                              .slice(0, 4);
                                            if (uspLines.length === 0) {
                                              return <div className="text-gray-500 text-sm">No USP data available for this college.</div>;
                                            }
                                            return uspLines.map((line, i) => (
                                              <div key={i} className="flex items-start text-base text-gray-900 font-medium">
                                                <TickIcon />
                                                <span>{line}</span>
                                              </div>
                                            ));
                                          })()}
                                          {(savedNotes[college.id] || []).map((note, i) => (
                                            <div key={i} className="flex items-start text-base text-gray-900 font-medium group">
                                              <TickIcon />
                                              <span className="flex-1">{note}</span>
                                              <button
                                                className="ml-2 text-xs text-red-500 hover:text-red-700 opacity-70 group-hover:opacity-100 transition"
                                                title="Remove USP"
                                                onClick={() => {
                                                  setSavedNotes(prev => {
                                                    const updated = {
                                                      ...prev,
                                                      [college.id]: prev[college.id].filter((_, idx) => idx !== i)
                                                    };
                                                    persistUserCollegeData(orderedColleges, updated);
                                                    return updated;
                                                  });
                                                }}
                                                aria-label="Remove USP"
                                                type="button"
                                              >
                                                ✖️
                                              </button>
                                            </div>
                                          ))}
                                          {noteRephrasing[college.id] && (
                                            <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
                                              <svg className="animate-spin h-4 w-4 text-blue-600" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                                              Rephrasing note...
                                            </div>
                                          )}
                                          {noteRephraseError[college.id] && (
                                            <div className="text-red-600 text-xs font-medium mt-1">{noteRephraseError[college.id]}</div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* Right Section: Key Metrics and Notes */}
                            <div className="flex flex-col items-start min-w-[220px] max-w-[260px] ml-6">
                              <Card className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border w-full mb-3">
                                <div className="text-xs text-blue-700 font-semibold mb-1">Net monthly spend</div>
                                <div className="text-xs text-gray-700">
                                  {(() => {
                                    const acc = parseInt(getCostInfo(college)?.accommodation?.toString().replace(/[^\d]/g, "")) || 0;
                                    const trans = parseInt(getCostInfo(college)?.transportation?.toString().replace(/[^\d]/g, "")) || 0;
                                    const living = parseInt(getCostInfo(college)?.living_expense?.toString().replace(/[^\d]/g, "")) || 0;
                                    const partTime = parseInt(getCostInfo(college)?.part_time_work?.toString().replace(/[^\d]/g, "")) || 0;
                                    const net = acc + trans + living - partTime;
                                    return (
                                      <div className="space-y-1">
                                        <div>Accommodation: <span className="font-medium">₹{acc.toLocaleString()}</span> /month</div>
                                        <div>Transportation: <span className="font-medium">₹{trans.toLocaleString()}</span> /month</div>
                                        <div>Living: <span className="font-medium">₹{living.toLocaleString()}</span> /month</div>
                                        <div>Part-time: <span className="font-medium">₹{partTime.toLocaleString()}</span> /month</div>
                                        <div className="border-t border-gray-200 my-2"></div>
                                        <div className="font-semibold text-base text-blue-900 flex items-center gap-2">
                                          Net monthly spend = <span className="font-mono">(₹{acc.toLocaleString()} + ₹{trans.toLocaleString()} + ₹{living.toLocaleString()}) - ₹{partTime.toLocaleString()} = <span className='text-green-700'>₹{net.toLocaleString()}</span></span>
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </div>
                              </Card>
                              <div className="flex flex-col gap-2 w-full">
                                <button
                                  className="flex items-center gap-1 text-xs font-semibold text-gray-700 mb-1 hover:text-blue-700 transition"
                                  onClick={() => setNotesOpen(prev => ({ ...prev, [college.id]: !prev[college.id] }))}
                                  aria-expanded={!!notesOpen[college.id]}
                                  aria-controls={`notes-section-${college.id}`}
                                  type="button"
                                >
                                  <StickyNote className="w-4 h-4" />
                                  Notes
                                  <span className="ml-1">{notesOpen[college.id] ? '▲' : '▼'}</span>
                                </button>
                                {notesOpen[college.id] && (
                                  <div id={`notes-section-${college.id}`}> 
                                    <textarea
                                      className="w-full min-h-[40px] max-h-[80px] rounded-lg border border-gray-300 px-2 py-1 text-sm resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-200"
                                      placeholder="Add a note or detail..."
                                      value={notes[college.id] || ""}
                                      onChange={e => handleNoteChange(college.id, e.target.value)}
                                      disabled={noteRephrasing[college.id]}
                                    />
                                    <button
                                      className="self-end mt-1 px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
                                      onClick={() => handleSaveNote(college.id)}
                                      disabled={!notes[college.id]?.trim() || noteRephrasing[college.id]}
                                    >
                                      {noteRephrasing[college.id] ? 'Saving...' : 'Save'}
                                    </button>
                                    {noteRephraseError[college.id] && (
                                      <div className="text-red-600 text-xs font-medium mt-1">{noteRephraseError[college.id]}</div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  )
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

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

                {/* Career Outcomes Section */}
                <Card className="p-4 mb-4">
                  <CardHeader className="flex flex-row items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <CardTitle className="text-lg font-bold">Career Outcomes</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <div className="flex flex-row justify-between items-center mb-1">
                      <span className="text-base">Employment Rate:</span>
                      <span className="text-green-600 font-bold text-lg">{selectedDetails.employmentRate}</span>
                    </div>
                    <div className="flex flex-row justify-between items-center mb-1">
                      <span className="text-base">Average Salary:</span>
                      <span className="text-black font-bold text-lg">{selectedDetails.averageSalary}</span>
                    </div>
                    <div className="text-sm text-gray-500 mb-2">Source: Graduate Outcomes Survey 2023</div>
                  </CardContent>
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
                  </div>
                </Card>
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
