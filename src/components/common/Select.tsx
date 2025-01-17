import { SelectHTMLAttributes } from "react";
import styled from "styled-components";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string | number; label: string }[];
  error?: string;
  id?: string;
}

export const Select = ({ label, options, error, ...props }: SelectProps) => {
  return (
    <Wrapper>
      {label && <Label htmlFor={props.id}>{label}</Label>}
      <StyledSelect id={props.id} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </StyledSelect>
      {error && <ErrorText>{error}</ErrorText>}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  margin-bottom: 8px;
  font-weight: bold;
`;

const StyledSelect = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid black;
  border-radius: 4px;
  font-size: 16px;

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
