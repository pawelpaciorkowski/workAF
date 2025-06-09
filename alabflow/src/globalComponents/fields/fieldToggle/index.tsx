import React from "react";

interface ToggleSwitchProps {
  label?: string;
  isChecked: boolean;
  id: any;
  onToggle: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  label,
  id,
  isChecked,
  onToggle,
}) => (
  <div className="flex items-center space-x-2 mt-2">
    <label htmlFor={`toggle-${id}`} className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          id={`toggle-${id}`}
          className="sr-only"
          checked={isChecked}
          onChange={onToggle}
        />
        <div
          className={`block ${
            isChecked ? "bg-green-500" : "bg-gray-500"
          } w-12 h-6 rounded-full transition-colors duration-300`}
        ></div>
        <div
          className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
            isChecked ? "translate-x-6" : ""
          }`}
        ></div>
      </div>
    </label>
    {label && <span className="text-sm font-medium">{label}</span>}
  </div>
);

export default ToggleSwitch;
export type { ToggleSwitchProps };
