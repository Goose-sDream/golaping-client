import { InputHTMLAttributes } from "react";
import styled from "styled-components";
import { LIGHTGRAY } from "@/styles/color";
import { InputStyleProps } from "@/types/voteTypes";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  styleProps?: InputStyleProps;
}

const Input = ({ label, error, ...props }: InputProps) => (
  <InputWrapper>
    <Label>{label}</Label>
    <StyledInput {...props} error={error} />
    {error && <ErrorMessage>{error}</ErrorMessage>}
  </InputWrapper>
);

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-bottom: 20px;
  min-height: 140px;
`;

const Label = styled.label`
  margin-bottom: 8px;
  font-size: 20px;
  font-weight: bold;
  color: black;
`;

const StyledInput = styled.input<InputProps>`
  padding: 18px;
  font-size: 20px;
  border: ${({ error }) => (error ? "1px solid red" : `1px solid ${LIGHTGRAY}`)};
  border-radius: 12px;
  transition: border-color 0.2s;
  background-color: ${LIGHTGRAY};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  text-align: ${({ styleProps }) => styleProps?.textAlign || "center"};
  width: ${({ styleProps }) => styleProps?.width || "300px"};

  &:focus {
    outline: none;
  }
`;

const ErrorMessage = styled.p`
  margin-top: 10px;
  font-size: 16px;
  color: red;
  visibility: visible;
`;

export default Input;
