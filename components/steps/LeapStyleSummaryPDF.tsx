import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Papa from "papaparse";
import Image from "next/image";

interface College {
  name: string;
  flag: string;
  country: string;
  acceptance?: string;
  affordability?: string;
  fitTag?: string;
  roi?: string;
  avgSalary?: string;
  tuitionFee?: string;
  avgPackage?: string;
  ranking?: string;
  tags?: string[];
  usps?: string[];
  rankingData?: {
    rank_value: string;
    rank_provider_name: string;
  };
}

interface LeapStyleSummaryPDFProps {
  meetingDate: string;
  counselor: { name: string; title: string; phone?: string };
  student: { name: string; status: string; courseName: string };
  purpose: string;
  shortlistedColleges: College[];
  fitSummary: { roi: string; acceptance: string; peer: string; fitTag: string };
  challenges: string[];
  conclusion: string;
  timeline: { urgency: string; strategy: string };
  insights: { label: string; value: string }[];
  financial: {
    tuition: string;
    living: string;
    total: string;
    funding: string;
  };
  roiData: { name: string; roi: number }[];
  usps: string[];
  relationshipManager?: { name: string; phone: string };
  employmentData: { university: string; rate: number; salary: number }[];
}

// Sample data for demonstration
const sampleColleges: College[] = [
  {
    name: "Stanford University",
    flag: "🇺🇸",
    country: "USA",
    tuitionFee: "55000",
    avgPackage: "₹85.0L",
    roi: "3.2",
    rankingData: { rank_value: "2", rank_provider_name: "QS World" },
    usps: ["Top-tier research opportunities", "Silicon Valley connections", "World-class faculty"]
  },
  {
    name: "MIT",
    flag: "🇺🇸",
    country: "USA",
    tuitionFee: "58000",
    avgPackage: "₹90.0L",
    roi: "2.8",
    rankingData: { rank_value: "1", rank_provider_name: "QS World" },
    usps: ["Leading technology programs", "Innovation hub", "Strong alumni network"]
  },
  {
    name: "University of Cambridge",
    flag: "🇬🇧",
    country: "UK",
    tuitionFee: "35000",
    avgPackage: "₹65.0L",
    roi: "4.1",
    rankingData: { rank_value: "3", rank_provider_name: "QS World" },
    usps: ["Historic excellence", "Research-focused", "Global recognition"]
  }
];

const sampleROIData = [
  { name: "Stanford", roi: 3.2 },
  { name: "MIT", roi: 2.8 },
  { name: "Cambridge", roi: 4.1 }
];

const sampleEmploymentData = [
  { university: "Stanford", rate: 95, salary: 120000 },
  { university: "MIT", rate: 97, salary: 125000 },
  { university: "Cambridge", rate: 88, salary: 85000 }
];

const LeapStyleSummaryPDF: React.FC<LeapStyleSummaryPDFProps> = (props) => {
  // Destructure props for easier use
  const {
    meetingDate: initialMeetingDate,
    counselor: initialCounselor,
    student: initialStudent,
    ...restProps
  } = props;

  // State for dynamic student name and counselor info
  const [studentName, setStudentName] = useState(initialStudent.name);
  const [counselor, setCounselor] = useState(initialCounselor);

  // Helper to get the correct phone number for the three counselors
  function getCounselorPhoneByName(name: string, fallback: string) {
    if (name === "Prakhar Pragy Dixit") return "8951269334";
    if (name === "Ayush Mohapatra") return "9008011498";
    if (name === "Lokesh Karivepakula") return "9008009156";
    return fallback;
  }

  useEffect(() => {
    const phone = (initialStudent as any)?.phone || "";
    if (!phone) {
      setCounselor((prev) => ({
        ...prev,
        phone: getCounselorPhoneByName(prev.name, prev.phone || ""),
      }));
      return;
    }
    fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vRQtjtY6NkC6LSKa_vEVbwjfoMVUnkGpZp0Q1mpmtJEDx-KXgBLGlmTTOin-VB6ycISSIaISUVOcKin/pub?output=csv')
      .then((res) => res.text())
      .then((csv) => {
        Papa.parse(csv, {
          header: true,
          skipEmptyLines: true,
          complete: (results: { data: any[] }) => {
            const normalize = (str: string) => String(str || '').replace(/\D/g, '').trim();
            const userPhoneNorm = normalize(phone);
            let row = results.data.find((r: any) => normalize(r["Pre Login Leap User - Pre User → Phone"]) === userPhoneNorm);
            if (!row && userPhoneNorm) {
              const withCountryCode = '91' + userPhoneNorm;
              row = results.data.find((r: any) => normalize(r["Pre Login Leap User - Pre User → Phone"]) === withCountryCode);
            }
            if (!row && userPhoneNorm && userPhoneNorm.startsWith('91')) {
              const withoutCountryCode = userPhoneNorm.substring(2);
              row = results.data.find((r: any) => normalize(r["Pre Login Leap User - Pre User → Phone"]) === withoutCountryCode);
            }
            if (row) {
              let counselorName = row["Pre User Counseling - Pre User → Assigned Counsellor"] || initialCounselor.name;
              let counselorPhone = getCounselorPhoneByName(counselorName, initialCounselor.phone || "");
              setCounselor({
                name: counselorName,
                title: initialCounselor.title,
                phone: counselorPhone,
              });
              setStudentName(row["Pre Login Leap User - Pre User → Name"] || initialStudent.name);
            } else {
              setCounselor((prev) => ({
                ...prev,
                phone: getCounselorPhoneByName(prev.name, prev.phone || ""),
              }));
            }
          },
        });
      });
  }, [initialStudent, initialCounselor]);

  // Format helpers
  const formatTuitionFee = (fee?: string) => {
    if (!fee) return "N/A";
    const num = typeof fee === "number" ? fee : parseFloat(fee.replace(/[^.0-9]/g, ""));
    return num ? `$${num.toLocaleString("en-US")}` : "N/A";
  };

  const getAvgPackage = (college: College) => {
    const val = college.avgSalary || college.avgPackage;
    if (!val || val === "N/A" || val === "NA" || val === "-") {
      return "₹26.0L";
    }
    return val;
  };

  const calculateBreakEven = (roi?: string, index = 0) => {
    const roiValue = roi && !isNaN(parseFloat(roi)) && parseFloat(roi) <= 6
      ? parseFloat(roi)
      : 3.2 + index * 0.3;
    if (roiValue > 6) return "N/A";
    if (roiValue < 4) {
      const min = (roiValue - 0.2).toFixed(1);
      const max = (roiValue + 0.3).toFixed(1);
      return `${min} - ${max} Years`;
    }
    const min = Math.floor(roiValue);
    const max = Math.ceil(roiValue);
    return `${min} - ${max} Years`;
  };

  // Metrics
  const getAverageBreakEven = () => {
    if (!restProps.roiData || !restProps.roiData.length) return "N/A";
    const validRois = restProps.roiData.filter((r: any) => !isNaN(r.roi) && r.roi <= 6);
    if (!validRois.length) return "N/A";
    const min = Math.min(...validRois.map((r: any) => r.roi));
    const max = Math.max(...validRois.map((r: any) => r.roi));
    return `${min.toFixed(1)} - ${max.toFixed(1)} Years`;
  };

  const getEmploymentRate = () => {
    if (!restProps.employmentData || !restProps.employmentData.length) return "N/A";
    const avg = restProps.employmentData.reduce((sum: number, e: any) => sum + (e.rate || 0), 0) / restProps.employmentData.length;
    return `${avg.toFixed(0)}%`;
  };

  const getAverageSalary = () => {
    if (!restProps.employmentData || !restProps.employmentData.length) return "N/A";
    const avg = restProps.employmentData.reduce((sum: number, e: any) => sum + (e.salary || 0), 0) / restProps.employmentData.length;
    return `$${(avg / 1000).toFixed(1)}K`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 font-sans antialiased">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-20 right-20 w-32 h-32 bg-indigo-400/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 left-1/3 w-24 h-24 bg-blue-400/20 rounded-full blur-xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-8 py-16 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
            <div className="flex items-center gap-10">
              <div className="w-28 h-20 bg-white/95 rounded-3xl shadow-2xl p-4 flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
                <Image src="/logo.png" alt="Leap Logo" width={90} height={40} className="object-contain" />
              </div>
              <div>
                <h1 className="text-6xl font-bold tracking-tight mb-4 bg-gradient-to-r from-white via-blue-100 to-indigo-100 bg-clip-text text-transparent">
                  Leap Scholar
                </h1>
                <p className="text-blue-100 text-2xl font-medium">Study Abroad Counseling Excellence</p>
                <div className="w-20 h-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full mt-4"></div>
              </div>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-3xl p-10 border border-white/30 min-w-[320px] shadow-2xl">
              <div className="text-2xl font-bold text-white mb-4">{counselor.name}</div>
              <div className="text-lg text-blue-100 mb-4">{counselor.title || "Senior Counselor"}</div>
              {counselor.phone && (
                <div className="text-blue-100 text-lg mb-5 flex items-center gap-3">
                  <span className="text-xl">📞</span> {counselor.phone}
                </div>
              )}
              <div className="text-lg text-blue-100 flex items-center gap-3">
                <span className="text-xl">📅</span> {initialMeetingDate}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8">
        {/* Student Information */}
        <div className="py-16">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full -translate-y-20 translate-x-20 opacity-60"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-50 to-pink-100 rounded-full translate-y-16 -translate-x-16 opacity-60"></div>
            
            <div className="flex items-center gap-12 mb-12 relative z-10">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-4xl shadow-2xl transform hover:scale-105 transition-transform duration-300">
                {studentName.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-bold text-blue-600 mb-4 tracking-widest uppercase">Student Profile</div>
                <div className="text-6xl font-bold text-gray-900 mb-4 tracking-tight">{studentName}</div>
                <div className="text-3xl text-gray-600 font-medium">{initialStudent.courseName}</div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-12 border-l-8 border-blue-500 shadow-lg relative z-10">
              <div className="text-sm font-bold text-blue-700 mb-6 tracking-widest uppercase">Session Purpose</div>
              <p className="text-gray-700 text-2xl leading-relaxed italic font-medium">"{restProps.purpose}"</p>
            </div>
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="mb-24">
          <div className="flex items-center gap-6 mb-16">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-white font-bold text-2xl">📊</span>
            </div>
            <h2 className="text-5xl font-bold text-gray-900 tracking-tight">Key Metrics</h2>
            <div className="flex-1 h-1 bg-gradient-to-r from-purple-400 via-purple-300 to-transparent rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="group bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-12 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex items-center justify-between mb-8">
                <div className="text-blue-100 font-bold text-lg tracking-wide">AVG BREAK-EVEN</div>
                <div className="text-5xl group-hover:scale-110 transition-transform duration-300">⏱️</div>
              </div>
              <div className="text-6xl font-bold mb-2">{getAverageBreakEven()}</div>
              <div className="w-full h-1 bg-blue-400 rounded-full opacity-50"></div>
            </div>
            <div className="group bg-gradient-to-br from-green-500 to-green-600 rounded-3xl p-12 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex items-center justify-between mb-8">
                <div className="text-green-100 font-bold text-lg tracking-wide">EMPLOYMENT RATE</div>
                <div className="text-5xl group-hover:scale-110 transition-transform duration-300">💼</div>
              </div>
              <div className="text-6xl font-bold mb-2">{getEmploymentRate()}</div>
              <div className="w-full h-1 bg-green-400 rounded-full opacity-50"></div>
            </div>
            <div className="group bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl p-12 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex items-center justify-between mb-8">
                <div className="text-purple-100 font-bold text-lg tracking-wide">AVG SALARY</div>
                <div className="text-5xl group-hover:scale-110 transition-transform duration-300">💰</div>
              </div>
              <div className="text-6xl font-bold mb-2">{getAverageSalary()}</div>
              <div className="w-full h-1 bg-purple-400 rounded-full opacity-50"></div>
            </div>
            <div className="group bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-12 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex items-center justify-between mb-8">
                <div className="text-orange-100 font-bold text-lg tracking-wide">UNIVERSITIES</div>
                <div className="text-5xl group-hover:scale-110 transition-transform duration-300">🎓</div>
              </div>
              <div className="text-6xl font-bold mb-2">{restProps.shortlistedColleges.length}</div>
              <div className="w-full h-1 bg-orange-400 rounded-full opacity-50"></div>
            </div>
          </div>
        </div>

        {/* Liked Universities */}
        <div className="mb-24">
          <div className="flex items-center gap-6 mb-16">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-white font-bold text-3xl">🎓</span>
            </div>
            <h2 className="text-5xl font-bold text-gray-900 tracking-tight">Liked Universities</h2>
            <div className="flex-1 h-1 bg-gradient-to-r from-blue-400 via-blue-300 to-transparent rounded-full"></div>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-full text-xl font-bold shadow-lg">
              {restProps.shortlistedColleges.length} Selected
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-12">
            {restProps.shortlistedColleges.map((college, index) => (
              <div
                key={index}
                className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-blue-200 overflow-hidden transform hover:-translate-y-3 hover:scale-105"
              >
                <div className="p-12 pb-10 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/30 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="flex items-start gap-8 relative z-10">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-3xl flex items-center justify-center text-white font-bold text-3xl shadow-xl group-hover:scale-110 transition-transform duration-300">
                      {college.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-2xl leading-tight mb-4">{college.name}</h3>
                      <div className="flex items-center gap-4 text-gray-600 text-xl">
                        <span className="text-3xl">{college.flag}</span>
                        <span className="font-semibold">{college.country}</span>
                      </div>
                    </div>
                    <div className="text-red-500 text-4xl group-hover:scale-125 transition-transform duration-300">♥</div>
                  </div>
                </div>
                <div className="p-12">
                  <div className="mb-6">
                    <div className="text-sm font-bold text-gray-500 mb-2 tracking-widest uppercase">Key Highlights</div>
                    <ul className="space-y-3 list-disc list-inside">
                      {(college.usps || []).map((usp, idx) => (
                        <li key={idx} className="text-lg text-gray-700 leading-relaxed font-medium">
                          {String(usp).replace(/[\s\u00A0]*[-–—][\s\u00A0]*/g, ', ')}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Insights & Recommendations */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">💡</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900">Key Insights & Recommendations</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-indigo-300 to-transparent"></div>
          </div>
          
          <div className="grid grid-cols-1 gap-10">
            {/* Fit Summary */}
            <div className="bg-white rounded-3xl shadow-lg p-10 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Profile Fit Summary</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-center justify-between p-6 bg-green-50 rounded-2xl">
                  <span className="font-bold text-gray-700 text-lg">ROI Rating</span>
                  <span className="font-bold text-green-700 text-xl">{restProps.fitSummary.roi}</span>
                </div>
                <div className="flex items-center justify-between p-6 bg-blue-50 rounded-2xl">
                  <span className="font-bold text-gray-700 text-lg">Acceptance Probability</span>
                  <span className="font-bold text-blue-700 text-xl">{restProps.fitSummary.acceptance}</span>
                </div>
                <div className="flex items-center justify-between p-6 bg-purple-50 rounded-2xl">
                  <span className="font-bold text-gray-700 text-lg">Peer Match</span>
                  <span className="font-bold text-purple-700 text-xl">{restProps.fitSummary.peer}</span>
                </div>
                <div className="flex items-center justify-between p-6 bg-orange-50 rounded-2xl">
                  <span className="font-bold text-gray-700 text-lg">Overall Fit</span>
                  <span className="font-bold text-orange-700 text-xl">{restProps.fitSummary.fitTag}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pb-12">
          <div className="bg-gray-900 text-white rounded-3xl p-12 text-center">
            <div className="text-3xl font-bold mb-6">Continue Your Journey with Leap Scholar</div>
            <div className="text-gray-300 text-xl mb-8">
              Your path to studying abroad starts with the right guidance and support.
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-gray-400 text-lg">
              <div className="flex items-center gap-2">
                <span>🌐</span> www.leapscholar.com
              </div>
              <div className="flex items-center gap-2">
                <span>📧</span> support@leapscholar.com
              </div>
              <div className="flex items-center gap-2">
                <span>📞</span> 1-800-LEAP-NOW
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeapStyleSummaryPDF;