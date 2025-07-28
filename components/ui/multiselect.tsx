import React from "react";

interface MultiSelectOption {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  maxSelect?: number;
  placeholder?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({ options, selected, onChange, maxSelect = 3, placeholder }) => {
  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else if (selected.length < maxSelect) {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 mb-2">
        {selected.length === 0 && (
          <span className="text-gray-400 text-sm">{placeholder || "Select..."}</span>
        )}
        {selected.map((val) => {
          const opt = options.find((o) => o.value === val);
          return (
            <span key={val} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
              {opt ? opt.label : val}
            </span>
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={selected.includes(opt.value)}
              onChange={() => handleToggle(opt.value)}
              disabled={!selected.includes(opt.value) && selected.length >= maxSelect}
              className="accent-blue-600 w-4 h-4 rounded"
            />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  );
};

export default MultiSelect;
