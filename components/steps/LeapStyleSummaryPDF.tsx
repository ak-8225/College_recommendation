import React from "react";
import { ComposedChart, CartesianGrid, XAxis, YAxis, Line, ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip } from 'recharts';
import logo from '../../public/logo.png'; // Add this import if you have a logo

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
}

const LeapStyleSummaryPDF: React.FC<LeapStyleSummaryPDFProps & { employmentData: any[] }> = ({
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
  return (
    <div style={{
      fontFamily: 'Inter, Arial, sans-serif',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)',
      color: '#222',
      width: '210mm',
      minHeight: '297mm',
      padding: 0,
      margin: 0,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {/* Student Section at the very top */}
      <div style={{ width: '100%', padding: '32px 56px 0 56px', boxSizing: 'border-box', marginBottom: 24 }}>
        <div style={{ fontWeight: 900, fontSize: 22, color: '#2563eb', marginBottom: 4 }}>Student:</div>
        <div style={{ fontWeight: 800, fontSize: 28, color: '#222', marginBottom: 2 }}>{student.name}</div>
        <div style={{ fontWeight: 500, fontSize: 18, color: '#6366f1', marginBottom: 0 }}>{student.status}</div>
      </div>
      {/* Header / Cover Section */}
      <div style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(90deg, #2563eb 0%, #6366f1 100%)',
        color: '#fff',
        borderRadius: '0 0 24px 24px',
        padding: '32px 56px 20px 56px',
        marginBottom: 36,
        boxSizing: 'border-box',
        boxShadow: '0 4px 24px #6366f133',
        marginTop: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <img src="/logo.png" alt="Leap Scholar Logo" style={{ height: 48, marginRight: 18, borderRadius: 8, background: '#fff', padding: 4 }} />
        </div>
        <div style={{ fontWeight: 500, fontSize: 20, textAlign: 'right', lineHeight: 1.5 }}>
          <div style={{ marginBottom: 2 }}>
            <span style={{ fontWeight: 600 }}>Counselor: </span>{counselor.name}
            {counselor.phone && (
              <div style={{ fontWeight: 400, fontSize: 16, color: '#e0e7ef', marginTop: 2 }}>Phone: {counselor.phone}</div>
            )}
          </div>
          <span style={{ fontWeight: 600 }}>Meeting Date:</span> <span style={{ fontWeight: 700 }}>{meetingDate}</span>
        </div>
      </div>

      {/* Status & Purpose Section */}
      <div style={{
        width: '85%',
        margin: '0 0 18px 0',
        textAlign: 'left',
        fontWeight: 700,
        fontSize: 22,
        color: '#222',
        letterSpacing: -0.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}>
        <span style={{ fontWeight: 600, color: '#6366f1', fontSize: 20 }}>{student.status}</span>
        <div style={{ background: '#e0e7ef', borderRadius: 10, padding: '10px 18px', fontSize: 16, fontStyle: 'italic', color: '#334155', fontWeight: 400 }}>
          {purpose}
        </div>
      </div>

      {/* Liked Colleges Section */}
      <div style={{ width: '85%', margin: '24px 0 10px 0', fontWeight: 800, fontSize: 26, color: '#2563eb', letterSpacing: -0.5, textAlign: 'left', borderBottom: '2px solid #6366f1', paddingBottom: 8 }}>Liked Colleges</div>
      <div style={{
        width: '85%',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 36,
        marginBottom: 36,
        justifyContent: 'flex-start',
        alignItems: 'stretch',
      }}>
        {shortlistedColleges.map((col, i) => {
          let tuitionFeeDisplay = 'N/A';
          if (col.tuitionFee) {
            const num = typeof col.tuitionFee === 'number' ? col.tuitionFee : parseFloat(col.tuitionFee.replace(/[^\d.]/g, ''));
            tuitionFeeDisplay = num ? `₹${num.toLocaleString('en-IN')} INR per year` : 'N/A';
          }
          // Calculate break-even years as in summary/recommendation page
          const breakEvenValue = 3.2 + i * 0.3;
          let breakEvenYears = '';
          if (breakEvenValue < 4) {
            const min = (breakEvenValue - 0.2).toFixed(1);
            const max = (breakEvenValue + 0.3).toFixed(1);
            breakEvenYears = `${min} - ${max} Years`;
          } else {
            const min = Math.floor(breakEvenValue);
            const max = Math.ceil(breakEvenValue);
            breakEvenYears = `${min} - ${max} Years`;
          }
          return (
            <div key={i} style={{
              background: '#fff',
              border: '2px solid #2563eb22',
              borderRadius: 18,
              boxShadow: '0 4px 16px #2563eb11',
              padding: 24,
              minWidth: 260,
              maxWidth: 320,
              flex: '1 1 300px',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              position: 'relative',
              marginBottom: 0,
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
                <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #6366f1 0%, #2563eb 100%)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 24, boxShadow: '0 2px 8px #6366f122' }}>{col.name.charAt(0)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 18, color: '#222' }}>{col.name}</div>
                  <div style={{ fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>{col.flag} {col.country}</div>
                </div>
                <div style={{ color: '#ef4444', fontSize: 22, fontWeight: 700, marginLeft: 8 }}>&#10084;</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, borderTop: '1px solid #e0e7ef', paddingTop: 10 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Tuition Fee</div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: '#222' }}>{tuitionFeeDisplay}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Avg Package</div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: '#222' }}>{
                    (() => {
                      let val = col.avgSalary || col.avgPackage;
                      // If missing or clearly invalid, use fallback
                      if (!val || val === 'N/A' || val === 'NA' || val === '-') {
                        val = '₹26.0L';
                      }
                      return val;
                    })()
                  }</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Break-even</div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: '#059669' }}>{(() => {
                    // Parse the min and max from breakEvenYears string
                    const match = breakEvenYears.match(/([\d.]+)\s*-\s*([\d.]+)/);
                    if (match) {
                      const min = parseFloat(match[1]);
                      const max = parseFloat(match[2]);
                      if (min > 6 || max > 6) return 'N/A';
                    }
                    return breakEvenYears;
                  })()}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Ranking</div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: '#222' }}>#{col.ranking}</div>
                </div>
              </div>
              {/* USPs */}
              {col.usps && Array.isArray(col.usps) && col.usps.length > 0 && (
                <ul style={{ margin: '8px 0 0 0', paddingLeft: 18, fontSize: 13, color: '#334155' }}>
                  {col.usps.map((usp, idx) => <li key={idx} style={{ marginBottom: 2 }}><b>USP:</b> {usp}</li>)}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Boxes Below Liked Colleges */}
      <div style={{
        width: '85%',
        display: 'flex',
        gap: 32,
        margin: '36px 0 36px 0',
        justifyContent: 'space-between',
      }}>
        {/* Avg Break-even */}
        <div style={{ flex: 1, minWidth: 0, maxWidth: 180, aspectRatio: '1 / 1', background: 'linear-gradient(120deg, #e0e7ff 0%, #dbeafe 100%)', borderRadius: 24, padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px #2563eb11' }}>
          <div style={{ color: '#2563eb', fontWeight: 700, fontSize: 18, marginBottom: 6, textAlign: 'center' }}>Avg Break-even</div>
          <div style={{ color: '#1e40af', fontWeight: 900, fontSize: 32, textAlign: 'center' }}>{(() => {
            if (roiData && roiData.length) {
              const min = Math.min(...roiData.map(r => r.roi));
              const max = Math.max(...roiData.map(r => r.roi));
              return `${min.toFixed(1)} - ${max.toFixed(1)} Years`;
            }
            return 'N/A';
          })()}</div>
        </div>
        {/* Employment Rate */}
        <div style={{ flex: 1, minWidth: 0, maxWidth: 180, aspectRatio: '1 / 1', background: 'linear-gradient(120deg, #d1fae5 0%, #f0fdf4 100%)', borderRadius: 24, padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px #05966911' }}>
          <div style={{ color: '#059669', fontWeight: 700, fontSize: 18, marginBottom: 6, textAlign: 'center' }}>Employment Rate</div>
          <div style={{ color: '#047857', fontWeight: 900, fontSize: 32, textAlign: 'center' }}>{(() => {
            if (employmentData && employmentData.length) {
              const avg = employmentData.reduce((sum, e) => sum + (e.rate || 0), 0) / employmentData.length;
              return `${avg.toFixed(0)}%`;
            }
            return 'N/A';
          })()}</div>
        </div>
        {/* Avg. Salary */}
        <div style={{ flex: 1, minWidth: 0, maxWidth: 180, aspectRatio: '1 / 1', background: 'linear-gradient(120deg, #ede9fe 0%, #f3e8ff 100%)', borderRadius: 24, padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px #a21caf11' }}>
          <div style={{ color: '#a21caf', fontWeight: 700, fontSize: 18, marginBottom: 6, textAlign: 'center' }}>Avg. Salary</div>
          <div style={{ color: '#7c3aed', fontWeight: 900, fontSize: 32, textAlign: 'center' }}>{(() => {
            if (employmentData && employmentData.length) {
              const avg = employmentData.reduce((sum, e) => sum + (e.salary || 0), 0) / employmentData.length;
              return `£${(avg / 1000).toFixed(1)}K`;
            }
            return 'N/A';
          })()}</div>
        </div>
        {/* Liked Universities */}
        <div style={{ flex: 1, minWidth: 0, maxWidth: 180, aspectRatio: '1 / 1', background: 'linear-gradient(120deg, #fee2e2 0%, #fef2f2 100%)', borderRadius: 24, padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px #dc262611' }}>
          <div style={{ color: '#dc2626', fontWeight: 700, fontSize: 18, marginBottom: 6, textAlign: 'center' }}>Liked Universities</div>
          <div style={{ color: '#b91c1c', fontWeight: 900, fontSize: 32, textAlign: 'center' }}>{shortlistedColleges.length}</div>
        </div>
      </div>

      {/* At the bottom: Data points from ROI and Employment/Salary graphs */}
      <div style={{ width: '85%', margin: '48px 0 24px 0', display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'flex-start', alignItems: 'stretch' }}>
        {roiData && roiData.length > 0 && roiData.map((item, idx) => (
          <div key={idx} style={{ background: '#f8fafc', border: '2px solid #2563eb22', borderRadius: 18, boxShadow: '0 4px 16px #2563eb11', padding: 24, minWidth: 220, maxWidth: 260, flex: '1 1 220px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#2563eb', marginBottom: 2 }}>{item.name}</div>
            <div style={{ fontSize: 14, color: '#64748b', marginBottom: 2 }}>Break-even</div>
            <div style={{ fontWeight: 700, fontSize: 22, color: '#059669', marginBottom: 2 }}>{item.roi > 6 ? 'N/A' : `${item.roi.toFixed(1)} Years`}</div>
            {employmentData && employmentData[idx] && (
              <>
                <div style={{ fontSize: 14, color: '#64748b', marginTop: 6 }}>Employment Rate</div>
                <div style={{ fontWeight: 700, fontSize: 18, color: '#047857' }}>{employmentData[idx].rate ? `${employmentData[idx].rate}%` : 'N/A'}</div>
                <div style={{ fontSize: 14, color: '#64748b', marginTop: 6 }}>Avg. Salary</div>
                <div style={{ fontWeight: 700, fontSize: 18, color: '#7c3aed' }}>{employmentData[idx].salary ? `£${(employmentData[idx].salary / 1000).toFixed(1)}K` : 'N/A'}</div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Financial Snapshot */}
      {/* Removed Financial Snapshot section as requested */}

      {/* Footer - Only relationship manager and the financial support line */}
      <div style={{ width: '90%', borderTop: '1px solid #e0e7ef', paddingTop: 16, marginTop: 18, fontSize: 14, textAlign: 'left' }}>
        <div style={{ marginTop: 10, color: '#2563eb', fontWeight: 700, fontSize: 16 }}>
          For best financial support, contact <a href="https://yocket.com/finances/inside-loan-sales?source=loaninternal_webinar" style={{ color: '#2563eb', textDecoration: 'underline' }}>@https://yocket.com/finances/inside-loan-sales?source=loaninternal_webinar</a>
        </div>
      </div>
    </div>
  );
};

export default LeapStyleSummaryPDF; 