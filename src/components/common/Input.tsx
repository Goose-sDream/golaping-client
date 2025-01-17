import { InputHTMLAttributes } from "react";
import styled from "styled-components";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = ({ label, error, ...props }: InputProps) => (
  <InputWrapper>
    <Label>{label}</Label>
    <StyledInput {...props} />
    {error && <ErrorMessage>{error}</ErrorMessage>}
  </InputWrapper>
);

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 30px;
`;

const Label = styled.label`
  margin-bottom: 8px;
  font-size: 20px;
  font-weight: bold;
  color: black;
`;

const StyledInput = styled.input<{ disabled?: boolean }>`
  padding: 18px;
  font-size: 20px;
  border: none;
  border-radius: 12px;
  transition: border-color 0.2s;
  background-color: #efefef;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  min-width: 300px;
`;

const ErrorMessage = styled.p`
  margin-top: 4px;
  font-size: 12px;
  color: red;
`;
