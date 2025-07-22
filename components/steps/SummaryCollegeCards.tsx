import React from "react";
import { Card } from "@/components/ui/card";
// Add a simple tooltip component
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

interface College {
  id: string;
  name: string;
  city?: string;
  country?: string;
  tuitionFee?: string;
  avgPackage?: string;
  breakEven?: string;
  rankingData?: { rank_value: string; rank_provider_name: string };
  // Add other fields as needed
}

interface SummaryCollegeCardsProps {
  colleges: College[];
}

export default function SummaryCollegeCards({ colleges }: SummaryCollegeCardsProps) {
  if (!colleges || colleges.length === 0) {
    return <div className="text-center text-gray-500">No colleges to display.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {colleges.map((college) => (
        <Card key={college.id} className="p-6">
          <div className="text-xl font-bold mb-2">{college.name}</div>
          <div className="text-sm text-gray-600 mb-2">
            {college.city && college.country ? `${college.city} - ${college.country}` : college.country}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Tuition Fee: </span>
            {formatLakhs(college.tuitionFee)}
          </div>
          <div className="mb-2 flex items-center">
            <span className="font-semibold">Avg Package: </span>
            <span className="ml-1">{college.avgPackage || "N/A"}</span>
            <InfoTooltip label="Source: Glassdoor (estimate)" />
          </div>
          <div className="mb-2 flex items-center">
            <span className="font-semibold">Break-even: </span>
            <span className="ml-1">{college.breakEven || "N/A"}</span>
            <InfoTooltip label="Source: Glassdoor (estimate)" />
          </div>
          <div className="flex items-center">
            <span className="font-semibold">Ranking: </span>
            <span className="ml-1">
              {college.rankingData && college.rankingData.rank_value !== "N/A"
                ? `Rank #${college.rankingData.rank_value} (${college.rankingData.rank_provider_name})`
                : "N/A"}
            </span>
            <InfoTooltip label="Source: QS World University Rankings 2024" />
          </div>
        </Card>
      ))}
    </div>
  );
} 