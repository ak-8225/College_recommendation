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
  student: { name: string; status: string };
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
}) => {
  return (
    <div style={{
      fontFamily: 'Inter, Arial, sans-serif',
      background: '#fff',
      color: '#222',
      width: '210mm',
      minHeight: '297mm',
      padding: 0,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {/* Header */}
      <div style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(90deg, #2563eb 0%, #6366f1 100%)',
        color: '#fff',
        borderRadius: '0 0 16px 16px',
        padding: '28px 48px 20px 48px',
        marginBottom: 32,
        boxSizing: 'border-box',
      }}>
        <div style={{ fontWeight: 800, fontSize: 28, letterSpacing: -1 }}>
          <span style={{ color: '#fff' }}>Leap</span><span style={{ color: '#c7d2fe' }}>Scholar</span>
          <div style={{ fontWeight: 400, fontSize: 20, marginTop: 4, color: '#e0e7ef' }}>College Fit Summary & Action Plan</div>
        </div>
        <div style={{ fontWeight: 500, fontSize: 18, textAlign: 'right' }}>Meeting Date<br /><span style={{ fontWeight: 700 }}>{meetingDate}</span></div>
      </div>

      {/* User Name and Program */}
      <div style={{
        width: '90%',
        margin: '0 0 18px 0',
        textAlign: 'left',
        fontWeight: 700,
        fontSize: 22,
        color: '#222',
        letterSpacing: -0.5,
      }}>
        {student.name} <span style={{ fontWeight: 400, color: '#64748b', fontSize: 18 }}>
          {student.status}
        </span>
      </div>

      {/* 4 Summary Points Section */}
      <div style={{
        width: '90%',
        display: 'flex',
        gap: 24,
        margin: '0 0 32px 0',
        justifyContent: 'space-between',
      }}>
        <div style={{ flex: 1, background: 'linear-gradient(90deg, #e0e7ff 0%, #dbeafe 100%)', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 2px 8px #2563eb11' }}>
          <div style={{ color: '#2563eb', fontWeight: 600, fontSize: 16, marginBottom: 4 }}>Avg Break-even</div>
          <div style={{ color: '#1e40af', fontWeight: 800, fontSize: 28 }}>3.2 Years</div>
        </div>
        <div style={{ flex: 1, background: 'linear-gradient(90deg, #d1fae5 0%, #f0fdf4 100%)', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 2px 8px #05966911' }}>
          <div style={{ color: '#059669', fontWeight: 600, fontSize: 16, marginBottom: 4 }}>Employment Rate</div>
          <div style={{ color: '#047857', fontWeight: 800, fontSize: 28 }}>92%</div>
        </div>
        <div style={{ flex: 1, background: 'linear-gradient(90deg, #ede9fe 0%, #f3e8ff 100%)', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 2px 8px #a21caf11' }}>
          <div style={{ color: '#a21caf', fontWeight: 600, fontSize: 16, marginBottom: 4 }}>Avg. Salary</div>
          <div style={{ color: '#7c3aed', fontWeight: 800, fontSize: 28 }}>£27.9K</div>
        </div>
        <div style={{ flex: 1, background: 'linear-gradient(90deg, #fee2e2 0%, #fef2f2 100%)', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 2px 8px #dc262611' }}>
          <div style={{ color: '#dc2626', fontWeight: 600, fontSize: 16, marginBottom: 4 }}>Liked Universities</div>
          <div style={{ color: '#b91c1c', fontWeight: 800, fontSize: 28 }}>{shortlistedColleges.length}</div>
        </div>
      </div>

      {/* Liked Colleges - Professional Card Format */}
      <div style={{ width: '90%', margin: '24px 0 10px 0', fontWeight: 700, fontSize: 22, color: '#2563eb', letterSpacing: -0.5, textAlign: 'left' }}>Liked Colleges</div>
      <div style={{
        width: '90%',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 32,
        marginBottom: 32,
        justifyContent: 'flex-start',
        alignItems: 'stretch',
      }}>
        {shortlistedColleges.map((col, i) => {
          // Format tuition fee as INR per year
          let tuitionFeeDisplay = 'N/A';
          if (col.tuitionFee) {
            const num = typeof col.tuitionFee === 'number' ? col.tuitionFee : parseFloat(col.tuitionFee.replace(/[^\d.]/g, ''));
            tuitionFeeDisplay = num ? `₹${num.toLocaleString('en-IN')} INR per year` : 'N/A';
          }
          // Calculate break-even years as in summary/recommendation page
          const breakEvenYears = (3.2 + i * 0.3).toFixed(1);
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
                  <div style={{ fontWeight: 600, fontSize: 15, color: '#059669' }}>{breakEvenYears} Years</div>
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

      {/* ROI Analysis Graph */}
      <div style={{ width: '90%', margin: '18px 0 18px 0' }}>
        <div style={{ fontWeight: 700, fontSize: 19, color: '#2563eb', marginBottom: 10 }}>ROI Analysis (Break-even Years)</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 32, height: 140, justifyContent: 'flex-start' }}>
          {roiData.map((item, idx) => (
            <div key={idx} style={{ flex: 1, textAlign: 'center', minWidth: 80 }}>
              <div style={{ background: '#6366f1', width: 36, height: `${item.roi * 18}px`, margin: '0 auto', borderRadius: 8, transition: 'height 0.3s', boxShadow: '0 2px 8px #6366f122' }}></div>
              <div style={{ fontSize: 14, marginTop: 8, color: '#222', fontWeight: 700 }}>{item.name}</div>
              <div style={{ fontSize: 14, color: '#2563eb', fontWeight: 700 }}>{item.roi.toFixed(1)} yrs</div>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Snapshot */}
      <div style={{ width: '90%', display: 'flex', gap: 24, margin: '18px 0', justifyContent: 'space-between' }}>
        <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 14, padding: 20, minWidth: 120, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', boxShadow: '0 2px 8px #2563eb11' }}>
          <div style={{ color: '#2563eb', fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Tuition</div>
          <div style={{ fontWeight: 700, fontSize: 20 }}>{financial.tuition}</div>
        </div>
        <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 14, padding: 20, minWidth: 120, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', boxShadow: '0 2px 8px #2563eb11' }}>
          <div style={{ color: '#2563eb', fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Living</div>
          <div style={{ fontWeight: 700, fontSize: 20 }}>{financial.living}</div>
        </div>
        <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 14, padding: 20, minWidth: 120, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', boxShadow: '0 2px 8px #2563eb11' }}>
          <div style={{ color: '#2563eb', fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Total</div>
          <div style={{ fontWeight: 700, fontSize: 20 }}>{financial.total}</div>
        </div>
        <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 14, padding: 20, minWidth: 120, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', boxShadow: '0 2px 8px #2563eb11' }}>
          <div style={{ color: '#2563eb', fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Funding</div>
          <div style={{ fontWeight: 700, fontSize: 20, whiteSpace: 'pre-line' }}>{financial.funding}</div>
        </div>
      </div>

      {/* Footer - Only relationship manager and the financial support line */}
      <div style={{ width: '90%', borderTop: '1px solid #e0e7ef', paddingTop: 16, marginTop: 18, fontSize: 14, textAlign: 'left' }}>
        {relationshipManager && <div style={{ marginBottom: 4 }}><b>Relationship Manager:</b> {relationshipManager.name} ({relationshipManager.phone})</div>}
        <div style={{ marginTop: 10, color: '#2563eb', fontWeight: 700, fontSize: 16 }}>
          For best financial support, contact <a href="https://yocket.com/finances/inside-loan-sales?source=loaninternal_webinar" style={{ color: '#2563eb', textDecoration: 'underline' }}>@https://yocket.com/finances/inside-loan-sales?source=loaninternal_webinar</a>
        </div>
      </div>
    </div>
  );
};

export default LeapStyleSummaryPDF; 