import React from "react";

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
  financial: { tuition: string; living: string; total: string; funding: string };
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
    if (!fee) return 'N/A';
    const num = typeof fee === 'number' ? fee : parseFloat(fee.replace(/[^.0-9]/g, ''));
    return num ? `₹${num.toLocaleString('en-IN')} per year` : 'N/A';
  };

  // Helper function to calculate break-even years
  const calculateBreakEven = (roi?: string, index = 0) => {
    const roiValue = (roi && !isNaN(parseFloat(roi)) && parseFloat(roi) <= 6) 
      ? parseFloat(roi) 
      : (3.2 + index * 0.3);
    
    if (roiValue > 6) return 'N/A';
    
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
    if (!roiData || !roiData.length) return 'N/A';
    
    const validRois = roiData.filter(r => !isNaN(r.roi) && r.roi <= 6);
    if (!validRois.length) return 'N/A';
    
    const min = Math.min(...validRois.map(r => r.roi));
    const max = Math.max(...validRois.map(r => r.roi));
    return `${min.toFixed(1)} - ${max.toFixed(1)} Years`;
  };

  // Helper function to calculate employment rate
  const getEmploymentRate = () => {
    if (!employmentData || !employmentData.length) return 'N/A';
    const avg = employmentData.reduce((sum, e) => sum + (e.rate || 0), 0) / employmentData.length;
    return `${avg.toFixed(0)}%`;
  };

  // Helper function to calculate average salary
  const getAverageSalary = () => {
    if (!employmentData || !employmentData.length) return 'N/A';
    const avg = employmentData.reduce((sum, e) => sum + (e.salary || 0), 0) / employmentData.length;
    return `£${(avg / 1000).toFixed(1)}K`;
  };

  // Helper function to get average package display
  const getAvgPackage = (college: College) => {
    const val = college.avgSalary || college.avgPackage;
    if (!val || val === 'N/A' || val === 'NA' || val === '-') {
      return '₹26.0L';
    }
    return val;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 font-sans">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-b-3xl shadow-lg mb-8">
        <div className="flex justify-between items-center px-8 py-6">
          <div className="flex items-center">
            <div className="bg-white rounded-2xl p-2 shadow-md">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                L
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
            <div className="text-base">
              Meeting Date: {meetingDate}
            </div>
          </div>
        </div>
      </div>

      {/* Student Information */}
      <div className="px-8 mb-8">
        <div className="text-blue-600 font-semibold text-lg mb-2">Student</div>
        <div className="text-3xl font-bold text-gray-800 mb-2">{student.name}</div>
        <div className="text-xl text-indigo-600 font-semibold">{student.status}</div>
      </div>

      {/* Purpose Section */}
      <div className="px-8 mb-8">
        <div className="bg-blue-50 rounded-xl p-6 border-l-4 border-blue-500">
          <p className="text-gray-700 italic text-lg leading-relaxed">{purpose}</p>
        </div>
      </div>

      {/* Shortlisted Colleges */}
      <div className="px-8 mb-12">
        <h2 className="text-2xl font-bold text-blue-600 mb-6 pb-2 border-b-2 border-blue-200">
          Shortlisted Colleges
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {shortlistedColleges.map((college, index) => (
            <div key={index} className="bg-white rounded-2xl border-2 border-blue-100 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              {/* College Header */}
              <div className="p-6 pb-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {college.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg leading-tight">{college.name}</h3>
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
                    <div className="text-xs text-gray-500 mb-1">Tuition Fee</div>
                    <div className="font-semibold text-gray-800 text-sm">
                      {formatTuitionFee(college.tuitionFee)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Avg Package</div>
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
                      #{college.ranking || 'N/A'}
                    </div>
                  </div>
                </div>

                {/* USPs */}
                {college.usps && college.usps.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="text-xs text-gray-500 mb-2">Key Highlights</div>
                    <ul className="space-y-1">
                      {college.usps.slice(0, 2).map((usp, idx) => (
                        <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
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

      {/* Summary Metrics */}
      <div className="px-8 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center shadow-md">
            <div className="text-blue-600 font-semibold text-sm mb-2">Avg Break-even</div>
            <div className="text-blue-800 font-bold text-2xl">{getAverageBreakEven()}</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 text-center shadow-md">
            <div className="text-green-600 font-semibold text-sm mb-2">Employment Rate</div>
            <div className="text-green-800 font-bold text-2xl">{getEmploymentRate()}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 text-center shadow-md">
            <div className="text-purple-600 font-semibold text-sm mb-2">Avg. Salary</div>
            <div className="text-purple-800 font-bold text-2xl">{getAverageSalary()}</div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 text-center shadow-md">
            <div className="text-red-600 font-semibold text-sm mb-2">Total Universities</div>
            <div className="text-red-800 font-bold text-2xl">{shortlistedColleges.length}</div>
          </div>
        </div>
      </div>

      {/* ROI Data Points */}
      {roiData && roiData.length > 0 && (
        <div className="px-8 mb-12">
          <h2 className="text-2xl font-bold text-blue-600 mb-6">University Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roiData.map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 text-center">
                <h3 className="font-bold text-blue-600 text-lg mb-4">{item.name}</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-gray-500 text-sm mb-1">Break-even</div>
                    <div className="font-bold text-green-600 text-xl">
                      {isNaN(item.roi) || item.roi > 6 ? 'N/A' : `${item.roi.toFixed(1)} Years`}
                    </div>
                  </div>
                  
                  {employmentData && employmentData[idx] && (
                    <>
                      <div>
                        <div className="text-gray-500 text-sm mb-1">Employment Rate</div>
                        <div className="font-bold text-green-700 text-lg">
                          {employmentData[idx].rate ? `${employmentData[idx].rate}%` : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-sm mb-1">Avg. Salary</div>
                        <div className="font-bold text-purple-600 text-lg">
                          {employmentData[idx].salary ? `£${(employmentData[idx].salary / 1000).toFixed(1)}K` : 'N/A'}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-200 bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-6">
        <div className="text-blue-600 font-semibold text-base">
          For best financial support, contact:{' '}
          <a 
            href="https://yocket.com/finances/inside-loan-sales?source=loaninternal_webinar" 
            className="text-blue-600 underline hover:text-blue-800 transition-colors break-all"
          >
            @https://yocket.com/finances/inside-loan-sales?source=loaninternal_webinar
          </a>
        </div>
        {relationshipManager && (
          <div className="mt-4 text-blue-600 font-semibold">
            Relationship Manager: {relationshipManager.name} - {relationshipManager.phone}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeapStyleSummaryPDF;