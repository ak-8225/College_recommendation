import React, { useState } from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const NEXT_STEPS = [
  'Book a free counseling call',
  'Ask for university-specific scholarships',
  'Get a full ROI & break-even report',
  'Apply for visa help',
  'Shortlist 3 best colleges',
  'Connect with students studying abroad',
];

const NextSteps: React.FC = () => {
  const [selected, setSelected] = useState<string | undefined>(undefined);

  return (
    <div className="w-full flex flex-col items-center justify-center py-8">
      <Select value={selected} onValueChange={setSelected}>
        <SelectTrigger className="w-full max-w-xs text-lg font-semibold bg-white/80 border-gray-200 shadow-md hover:bg-gray-50 transition rounded-xl h-14">
          <SelectValue placeholder="Next Steps" />
        </SelectTrigger>
        <SelectContent className="w-full max-w-xs rounded-xl shadow-xl border border-gray-100 bg-white/95 p-0 overflow-hidden">
          {NEXT_STEPS.map((step) => (
            <SelectItem
              key={step}
              value={step}
              className="px-4 py-3 text-base cursor-pointer hover:bg-blue-50 focus:bg-blue-50"
            >
              {step}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selected && (
        <div className="mt-4 text-base text-gray-700 font-medium bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 w-full max-w-xs shadow-sm text-center">
          <span className="text-blue-700">Selected:</span> {selected}
        </div>
      )}
    </div>
  );
};

export default NextSteps; 