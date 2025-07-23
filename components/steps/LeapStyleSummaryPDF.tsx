import React from "react";
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

const COUNSELOR_PHONE_MAP: Record<string, string> = {
  "Prakhar Pragy Dixit": "8951269334",
  "Lokesh Karivepakula": "9008009156",
  "Ayush Mohapatra": "9008011498",
};

export default function LeapStyleSummaryPDF({
  studentName,
  courseName,
  country,
  counselorName,
  meetingDate,
  shortlistedColleges,
  ...props
}: any) {
  const phone = COUNSELOR_PHONE_MAP[counselorName?.trim()] || "";
  return (
    <div style={{ fontFamily: 'Inter, Arial, sans-serif', background: '#f6f9ff', minHeight: '100vh', padding: 0, margin: 0 }}>
      {/* Blue Header */}
      <div style={{ background: 'linear-gradient(90deg, #2563eb 0%, #1e40af 100%)', color: '#fff', padding: '32px 0 24px 0', borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 12, marginRight: 24 }}>
              <img src="/logo.png" alt="Leap Logo" style={{ height: 40, width: 90, objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -1 }}>Leap Scholar</div>
              <div style={{ fontSize: 16, color: '#dbeafe', fontWeight: 500 }}>Study Abroad Counseling</div>
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 16, color: '#dbeafe', fontWeight: 500, marginTop: 8 }}>
            Counselor: <span style={{ color: '#fff', fontWeight: 700 }}>{counselorName}</span><br />
            {phone && <>Phone: {phone}<br /></>}
            Meeting Date: {meetingDate}
          </div>
        </div>
      </div>
      {/* Student Info */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 40px 0 40px' }}>
        <div style={{ fontSize: 18, color: '#2563eb', fontWeight: 600, marginBottom: 8 }}>Student</div>
        <div style={{ fontSize: 32, fontWeight: 700, color: '#111827', marginBottom: 12 }}>{studentName}</div>
        <div style={{ background: '#e0edff', borderRadius: 12, padding: 18, fontSize: 18, color: '#1e293b', marginBottom: 32 }}>
          Discussed profile, goals, recommended college fit, and action plan for {courseName} in {country}.
        </div>
        {/* Shortlisted Colleges Heading */}
        <div style={{ fontSize: 22, fontWeight: 700, color: '#2563eb', marginBottom: 18 }}>Shortlisted Colleges</div>
        {/* Colleges Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
          {shortlistedColleges.map((college: any, idx: number) => (
            <div key={idx} style={{ background: '#fff', borderRadius: 18, boxShadow: '0 2px 8px #e0e7ef', padding: 24, minWidth: 320, maxWidth: 420, margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{college.name.charAt(0)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 20, color: '#1e293b', marginBottom: 2 }}>{college.name}</div>
                  <div style={{ fontSize: 15, color: '#64748b', fontStyle: 'italic' }}>{college.courseName || courseName}</div>
                  <div style={{ fontSize: 15, color: '#64748b', marginTop: 2 }}>{college.flag} {college.country}</div>
                </div>
                <div style={{ color: '#ef4444', fontSize: 22, fontWeight: 700 }}>&#10084;</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, borderTop: '1px solid #e5e7eb', paddingTop: 12 }}>
                <div>
                  <div style={{ fontSize: 13, color: '#64748b', marginBottom: 2 }}>Tuition Fee</div>
                  <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 16 }}>{college.tuitionFee}</div>
                </div>
                <div>
                  <div style={{ fontSize: 13, color: '#64748b', marginBottom: 2 }}>Avg Package</div>
                  <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 16 }}>{college.avgPackage}</div>
                </div>
                <div>
                  <div style={{ fontSize: 13, color: '#64748b', marginBottom: 2 }}>Break-even</div>
                  <div style={{ fontWeight: 600, color: '#22c55e', fontSize: 16 }}>{college.breakEven}</div>
                </div>
                <div>
                  <div style={{ fontSize: 13, color: '#64748b', marginBottom: 2 }}>Ranking</div>
                  <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 16 }}>{college.ranking}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}