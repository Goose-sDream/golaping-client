import { SelectHTMLAttributes } from "react";
import styled from "styled-components";
import ArrowIcon from "@/assets/Arrow.svg";

import { LIGHTGRAY } from "@/styles/color";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string | number; label: string }[];
  error?: string;
  id?: string;
  disabled?: boolean;
}

const Select = ({ label, options, error, disabled, ...props }: SelectProps) => {
  return (
    <Wrapper>
      {label && <Label htmlFor={props.id}>{label}</Label>}
      <SelectContainer>
        <StyledSelect id={props.id} {...props} disabled={disabled} color={LIGHTGRAY}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </StyledSelect>
        <ArrowIcon
          style={{
            position: "absolute",
            top: "50%",
            right: "15px",
            transform: "translateY(-50%) rotate(-90deg)",
            width: "20px",
            height: "20px",
            pointerEvents: "none",
          }}
        />
      </SelectContainer>

      {error && <ErrorText>{error}</ErrorText>}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;


const Label = styled.label`
  display: block;
  font-size: 14px;
  margin-bottom: 8px;
  font-weight: bold;
`;

const SelectContainer = styled.div`
  position: relative;
  width: 90%;
`;

const StyledSelect = styled.select<{ color: string }>`
  width: 100%;
  padding: 10px 40px 10px 20px;
  border: none;
  border-radius: 4px;
  appearance: none;

  font-size: 20px;
  background-color: ${({ color }) => color || ""};
  height: 60px;

  &:focus {
    border-color: gray;
    outline: none;
  }
`;

const ErrorText = styled.p`
  color: red;
  font-size: 12px;
  margin-top: 5px;
`;

export default Select;
