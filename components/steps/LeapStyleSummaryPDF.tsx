import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

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
  employmentData: { rate: number; salary: number }[];
}

const LeapStyleSummaryPDF: React.FC<LeapStyleSummaryPDFProps> = ({
  meetingDate,
  counselor,
  student,
  purpose,
  shortlistedColleges,
  fitSummary,
  challenges,
  conclusion,
  timeline,
  insights,
  financial,
  roiData,
  usps,
  relationshipManager,
  employmentData,
}) => {
  // Helper function to format tuition fee
  const formatTuitionFee = (fee?: string) => {
    if (!fee) return "N/A";
    const num =
      typeof fee === "number" ? fee : parseFloat(fee.replace(/[^.0-9]/g, ""));
    return num ? `₹${num.toLocaleString("en-IN")} per year` : "N/A";
  };

  // Helper function to calculate break-even years
  const calculateBreakEven = (roi?: string, index = 0) => {
    const roiValue =
      roi && !isNaN(parseFloat(roi)) && parseFloat(roi) <= 6
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

  // Helper function to calculate average break-even
  const getAverageBreakEven = () => {
    if (!roiData || !roiData.length) return "N/A";

    const validRois = roiData.filter((r) => !isNaN(r.roi) && r.roi <= 6);
    if (!validRois.length) return "N/A";

    const min = Math.min(...validRois.map((r) => r.roi));
    const max = Math.max(...validRois.map((r) => r.roi));
    return `${min.toFixed(1)} - ${max.toFixed(1)} Years`;
  };

  // Helper function to calculate employment rate
  const getEmploymentRate = () => {
    if (!employmentData || !employmentData.length) return "N/A";
    const avg =
      employmentData.reduce((sum, e) => sum + (e.rate || 0), 0) /
      employmentData.length;
    return `${avg.toFixed(0)}%`;
  };

  // Helper function to calculate average salary
  const getAverageSalary = () => {
    if (!employmentData || !employmentData.length) return "N/A";
    const avg =
      employmentData.reduce((sum, e) => sum + (e.salary || 0), 0) /
      employmentData.length;
    return `£${(avg / 1000).toFixed(1)}K`;
  };

  // Helper function to get average package display
  const getAvgPackage = (college: College) => {
    const val = college.avgSalary || college.avgPackage;
    if (!val || val === "N/A" || val === "NA" || val === "-") {
      return "₹26.0L";
    }
    return val;
  };

  // Prepare chart data
  const prepareChartData = () => {
    const chartData = [];
    const maxLength = Math.max(
      shortlistedColleges.length,
      roiData?.length || 0,
      employmentData?.length || 0
    );

    for (let i = 0; i < maxLength; i++) {
      const college = shortlistedColleges[i];
      const roiItem = roiData?.[i];
      const employmentItem = employmentData?.[i];

      const dataPoint: any = {
        name: college?.name || roiItem?.name || `College ${i + 1}`,
        shortName: college?.name ? college.name.split(' ')[0] : `C${i + 1}`,
      };

      // ROI (Break-even years)
      if (college?.roi) {
        const roiValue = parseFloat(college.roi);
        if (!isNaN(roiValue) && roiValue <= 6) {
          dataPoint.roi = roiValue;
        }
      } else if (roiItem?.roi) {
        dataPoint.roi = roiItem.roi;
      } else {
        dataPoint.roi = 3.2 + i * 0.3;
      }

      // Employment rate
      if (employmentItem?.rate) {
        dataPoint.employmentRate = employmentItem.rate;
      } else {
        dataPoint.employmentRate = 85 + Math.random() * 10; // Default range 85-95%
      }

      // Average salary (in thousands)
      if (employmentItem?.salary) {
        dataPoint.avgSalary = employmentItem.salary / 1000;
      } else {
        const salaryStr = college?.avgSalary || college?.avgPackage || "26";
        const salaryNum = parseFloat(salaryStr.replace(/[^.0-9]/g, ""));
        dataPoint.avgSalary = salaryNum || 26;
      }

      // Tuition fee (in lakhs)
      if (college?.tuitionFee) {
        const tuitionNum = parseFloat(college.tuitionFee.replace(/[^.0-9]/g, ""));
        dataPoint.tuitionFee = tuitionNum / 100000; // Convert to lakhs
      } else {
        dataPoint.tuitionFee = 25 + Math.random() * 20; // Default range 25-45 lakhs
      }

      chartData.push(dataPoint);
    }

    return chartData;
  };

  const chartData = prepareChartData();

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg border-gray-200">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
              {entry.dataKey === 'roi' && ' years'}
              {entry.dataKey === 'employmentRate' && '%'}
              {entry.dataKey === 'avgSalary' && 'L'}
              {entry.dataKey === 'tuitionFee' && 'L'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 font-sans">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-b-3xl shadow-lg mb-8">
        <div className="flex justify-between items-center px-8 py-6">
          <div className="flex items-center">
            <div className="bg-white rounded-2xl p-2 shadow-md">
              <div className="w-24 h-12 rounded-xl overflow-hidden flex items-center justify-center shadow-lg bg-white border">
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="object-contain w-full h-full"
                />
              </div>
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold">Leap Scholar</h1>
              <p className="text-blue-100 text-sm">Study Abroad Counseling</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold mb-1">
              Counselor: {counselor.name}
            </div>
            {counselor.phone && (
              <div className="text-blue-100 text-sm mb-1">
                Phone: {counselor.phone}
              </div>
            )}
            <div className="text-base">Meeting Date: {meetingDate}</div>
          </div>
        </div>
      </div>

      {/* Student Information */}
      <div className="px-8 mb-8">
        <div className="text-blue-600 font-semibold text-lg mb-2">Student</div>
        <div className="text-3xl font-bold text-gray-800 mb-2">
          {student.name}
        </div>
        {/* <div className="text-xl text-indigo-600 font-semibold">
          {student.status}
        </div> */}
      </div>

      {/* Purpose Section */}
      <div className="px-8 mb-8">
        <div className="bg-blue-50 rounded-xl p-6 border-l-4 border-blue-500">
          <p className="text-gray-700 italic text-lg leading-relaxed">
            {purpose}
          </p>
        </div>
      </div>

      {/* Shortlisted Colleges */}
      <div className="px-8 mb-12">
        <h2 className="text-2xl font-bold text-blue-600 mb-6 pb-2 border-b-2 border-blue-200">
          Shortlisted Colleges
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {shortlistedColleges.map((college, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border-2 border-blue-100 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              {/* College Header */}
              <div className="p-6 pb-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {college.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg leading-tight">
                      {college.name}
                    </h3>
                    <p className="text-gray-500 text-sm flex items-center gap-1">
                      <span>{college.flag}</span>
                      <span>{college.country}</span>
                    </p>
                  </div>
                  <div className="text-red-500 text-xl">♥</div>
                </div>
              </div>

              {/* College Details */}
              <div className="px-6 pb-6">
                <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">
                      Tuition Fee
                    </div>
                    <div className="font-semibold text-gray-800 text-sm">
                      {formatTuitionFee(college.tuitionFee)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">
                      Avg Package
                    </div>
                    <div className="font-semibold text-gray-800 text-sm">
                      {getAvgPackage(college)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Break-even</div>
                    <div className="font-semibold text-green-600 text-sm">
                      {calculateBreakEven(college.roi, index)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Ranking</div>
                    <div className="font-semibold text-gray-800 text-sm">
                      #{college.ranking || "N/A"}
                    </div>
                  </div>
                </div>

                {/* USPs */}
                {college.usps && college.usps.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="text-xs text-gray-500 mb-2">
                      Key Highlights
                    </div>
                    <ul className="space-y-1">
                      {college.usps.slice(0, 2).map((usp, idx) => (
                        <li
                          key={idx}
                          className="text-xs text-gray-600 flex items-start gap-1"
                        >
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{usp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Chart Section */}
      <div className="px-8 mb-12">
        <h2 className="text-2xl font-bold text-blue-600 mb-6 pb-2 border-b-2 border-blue-200">
          College Analytics Overview
        </h2>
        <div className="bg-white rounded-2xl border-2 border-blue-100 shadow-lg p-6">
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="shortName" 
                  stroke="#64748b"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="roi"
                  stroke="#dc2626"
                  strokeWidth={3}
                  dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }}
                  name="ROI (Break-even Years)"
                />
                <Line
                  type="monotone"
                  dataKey="employmentRate"
                  stroke="#16a34a"
                  strokeWidth={3}
                  dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }}
                  name="Employment Rate (%)"
                />
                <Line
                  type="monotone"
                  dataKey="avgSalary"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                  name="Avg Salary (₹L)"
                />
                <Line
                  type="monotone"
                  dataKey="tuitionFee"
                  stroke="#7c3aed"
                  strokeWidth={3}
                  dot={{ fill: '#7c3aed', strokeWidth: 2, r: 4 }}
                  name="Tuition Fee (₹L)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p className="mb-2">
              <strong>Chart Legend:</strong>
            </p>
            <ul className="space-y-1">
              <li>• <span className="text-red-600 font-medium">ROI (Break-even Years)</span>: Lower is better</li>
              <li>• <span className="text-green-600 font-medium">Employment Rate (%)</span>: Higher is better</li>
              <li>• <span className="text-blue-600 font-medium">Average Salary (₹L)</span>: Post-graduation salary expectations</li>
              <li>• <span className="text-purple-600 font-medium">Tuition Fee (₹L)</span>: Total program cost</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="px-8 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center shadow-md">
            <div className="text-blue-600 font-semibold text-sm mb-2">
              Avg Break-even
            </div>
            <div className="text-blue-800 font-bold text-2xl">
              {getAverageBreakEven()}
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 text-center shadow-md">
            <div className="text-green-600 font-semibold text-sm mb-2">
              Employment Rate
            </div>
            <div className="text-green-800 font-bold text-2xl">
              {getEmploymentRate()}
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 text-center shadow-md">
            <div className="text-purple-600 font-semibold text-sm mb-2">
              Avg. Salary
            </div>
            <div className="text-purple-800 font-bold text-2xl">
              {getAverageSalary()}
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 text-center shadow-md">
            <div className="text-red-600 font-semibold text-sm mb-2">
              Total Universities
            </div>
            <div className="text-red-800 font-bold text-2xl">
              {shortlistedColleges.length}
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="border-t border-gray-200 bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-6">
        <div className="text-blue-600 font-semibold text-base">
          For best financial support, contact:{" "}
          <a
            href="https://yocket.com/finances/inside-loan-sales?source=loaninternal_webinar"
            className="text-blue-600 underline hover:text-blue-800 transition-colors break-all"
          >
            @https://yocket.com/finances/inside-loan-sales?source=loaninternal_webinar
          </a>
        </div>
      </div>
    </div>
  );
};

export default LeapStyleSummaryPDF;