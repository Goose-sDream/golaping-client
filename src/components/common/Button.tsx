import { ButtonHTMLAttributes } from "react";
import styled from "styled-components";
import { LIGHTGRAY } from "@/styles/color";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "small" | "large";
  disabled?: boolean;
}

const Button = ({ children, size = "large", disabled = false, ...props }: ButtonProps) => {
  return (
    <StyledButton size={size} disabled={disabled} {...props}>
      {children}
    </StyledButton>
  );
};

const StyledButton = styled.button<{ size: string }>`
  font-size: ${({ size }) => (size === "small" ? "24px" : "32px")};
  border: none;
  border-radius: ${({ size }) => (size === "small" ? "16px" : "20px")};
  cursor: pointer;
  background-color: black;
  color: white;
  min-width: ${({ size }) => (size === "small" ? "100px" : "300px")};
  transition:
    background-color 0.2s,
    color 0.2s;
  padding: ${({ size }) => (size === "small" ? "6px 12px" : "10px 60px")};
  &:hover {
    background-color: ${LIGHTGRAY};
    color: black;
  }
`;

export default Button;
