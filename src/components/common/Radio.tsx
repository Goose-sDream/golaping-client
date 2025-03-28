import React from "react";
import styled from "styled-components";

type RadioProps = {
  label: string;
  value: string;
  checked: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const Radio = ({ label, value, checked, onChange }: RadioProps) => {
  return (
    <RadioWrapper>
      <RadioInput type="radio" value={value} checked={checked} onChange={onChange} />
      {label}
    </RadioWrapper>
  );
};

export default Radio;

const RadioWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  height: 40px;
  font-size: 18px;
  padding: 10px;
`;

const RadioInput = styled.input`
  transform: scale(1.2);
`;
