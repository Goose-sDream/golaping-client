import { InputHTMLAttributes } from "react";
import styled from "styled-components";
import { LIGHTGRAY } from "@/styles/color";
import { InputStyleProps } from "@/types/voteTypes";

type BaseInputProps = {
  label?: string;
  error?: string;
  name?: string;
  $styleProps?: InputStyleProps;
};

type InputProps<T extends string> = BaseInputProps &
  InputHTMLAttributes<HTMLInputElement> &
  (T extends "radio"
    ? { type: "radio"; checked: boolean; value: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void }
    : { type?: T });

const Input = <T extends string>({ label, error, name, type, ...props }: InputProps<T>) => {
  console.log("Input $styleProps:", props.$styleProps);
  return (
    <InputWrapper name={name} $styleProps={props.$styleProps}>
      {type === "radio" ? (
        label && (
          <>
            <StyledInput type={type} $styleProps={props.$styleProps} error={error} {...props} />
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <Label $styleProps={props.$styleProps}>{label}</Label>
          </>
        )
      ) : (
        <>
          <Label $styleProps={props.$styleProps}>{label}</Label>
          <StyledInput type={type} $styleProps={props.$styleProps} error={error} {...props} />
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </>
      )}
    </InputWrapper>
  );
};

const InputWrapper = styled.div<{ name: string | undefined; $styleProps?: InputStyleProps }>`
  width: 100%;
  display: flex;
  flex-direction: ${({ $styleProps }) => $styleProps?.flexDirection || "column"};
  justify-content: center;
  min-height: ${({ $styleProps }) => $styleProps?.minHeight || "140px"};
  gap: 8px;
`;

const Label = styled.label<{ $styleProps?: InputStyleProps }>`
  font-size: ${({ $styleProps }) => $styleProps?.fontSize || "20px"};
  font-weight: ${({ $styleProps }) => $styleProps?.fontWeight || "bold"};
  color: black;
  display: ${({ $styleProps }) => $styleProps?.labelDisplay || "auto"};
  align-items: ${({ $styleProps }) => $styleProps?.labelAlignItems || "auto"};
`;

const StyledInput = styled.input<{ error?: string; $styleProps?: InputStyleProps }>`
  padding: ${({ $styleProps }) => $styleProps?.padding || "18px"};
  font-size: 20px;
  border: ${({ error }) => (error ? "1px solid red" : `1px solid ${LIGHTGRAY}`)};
  border-radius: 12px;
  transition: border-color 0.2s;
  background-color: ${LIGHTGRAY};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  text-align: ${({ $styleProps }) => $styleProps?.textAlign || "left"};
  width: ${({ $styleProps }) => $styleProps?.width || "300px"};
  pointer-events: ${({ $styleProps }) => $styleProps?.pointerEvents || "auto"};

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
