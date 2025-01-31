import { InputHTMLAttributes } from "react";
import styled from "styled-components";
import { LIGHTGRAY } from "@/styles/color";
import { InputStyleProps } from "@/types/voteTypes";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  name?: string;
  styleProps?: InputStyleProps;
}

const Input = ({ label, error, name, ...props }: InputProps) => (
  <InputWrapper name={name}>
    <Label {...props}>{label}</Label>
    <StyledInput {...props} error={error} />
    {error && <ErrorMessage>{error}</ErrorMessage>}
  </InputWrapper>
);

const InputWrapper = styled.div<{ name: string | undefined }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-bottom: ${({ name }) => (name === "타이머" ? 0 : "20px")};
  min-height: 140px;
`;

const Label = styled.label<InputProps>`
  margin-bottom: 8px;
  font-size: 20px;
  font-weight: bold;
  color: black;
  display: ${({ styleProps }) => styleProps?.labelDisplay || "auto"};
`;

const StyledInput = styled.input<InputProps>`
  padding: ${({ styleProps }) => styleProps?.padding || "18px"};
  font-size: 20px;
  border: ${({ error }) => (error ? "1px solid red" : `1px solid ${LIGHTGRAY}`)};
  border-radius: 12px;
  transition: border-color 0.2s;
  background-color: ${LIGHTGRAY};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  text-align: ${({ styleProps }) => styleProps?.textAlign || "center"};
  width: ${({ styleProps }) => styleProps?.width || "300px"};
  pointer-events: ${({ styleProps }) => styleProps?.pointerEvents || "auto"};

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
