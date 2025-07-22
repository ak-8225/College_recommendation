import React from "react";
import { Card } from "@/components/ui/card";

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
            {college.tuitionFee || "N/A"}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Avg Package: </span>
            {college.avgPackage || "N/A"}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Break-even: </span>
            {college.breakEven || "N/A"}
          </div>
          <div>
            <span className="font-semibold">Ranking: </span>
            {college.rankingData && college.rankingData.rank_value !== "N/A"
              ? `Rank #${college.rankingData.rank_value} (${college.rankingData.rank_provider_name})`
              : "N/A"}
          </div>
        </Card>
      ))}
    </div>
  );
} 