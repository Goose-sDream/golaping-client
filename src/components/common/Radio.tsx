import React from "react";

type RadioProps = {
  label: string;
  value: string;
  checked: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const Radio = ({ label, value, checked, onChange }: RadioProps) => {
  return (
    <div style={{ display: "flex", gap: "10px" }}>
      <input type="radio" value={value} checked={checked} onChange={onChange} />
      {label}
    </div>
  );
};

export default Radio;
