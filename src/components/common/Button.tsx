import { ButtonHTMLAttributes } from "react";
import styled, { css } from "styled-components";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  size?: "small" | "medium" | "large";
}

export const Button = ({ children, variant = "primary", size = "medium", ...props }: ButtonProps) => {
  return (
    <StyledButton variant={variant} size={size} {...props}>
      {children}
    </StyledButton>
  );
};

const StyledButton = styled.button<{ variant: string; size: string }>`
  font-size: 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s;
  padding: ${({ size }) => (size === "small" ? "6px 12px" : size === "large" ? "12px 24px" : "8px 16px")};

  ${({ variant }) =>
    variant === "primary"
      ? css`
          background-color: blue;
          color: white;

          &:hover {
            background-color: lightblue;
          }
        `
      : css`
          background-color: gray;
          color: black;

          &:hover {
            background-color: lightgray;
          }
        `}
`;
