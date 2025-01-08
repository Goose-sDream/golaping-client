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
  margin-bottom: 16px;
`;

const Label = styled.label`
  margin-bottom: 8px;
  font-size: 14px;
  color: black;
`;

const StyledInput = styled.input`
  padding: 10px 12px;
  font-size: 16px;
  border: 1px solid black;
  border-radius: 4px;
  transition: border-color 0.2s;

  &:focus {
    border-color: lightgray;
    outline: none;
  }
`;

const ErrorMessage = styled.p`
  margin-top: 4px;
  font-size: 12px;
  color: red;
`;
