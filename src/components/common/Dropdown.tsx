import { useState } from "react";
import styled from "styled-components";
import ArrowIcon from "@/assets/Arrow.svg";

interface DropdownProps {
  label?: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const Dropdown = ({ label, options, value, onChange, error }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  return (
    <Wrapper>
      {label && <Label>{label}</Label>}
      <DropdownButton type="button" onClick={toggleDropdown} $isOpen={isOpen}>
        {options.find((option) => option.value === value)?.label}
        <ArrowIcon style={{ transform: isOpen ? "rotate(90deg)" : "rotate(-90deg)" }} />
        {isOpen && (
          <OptionsList>
            {options.map((option) => (
              <OptionItem
                key={option.value}
                onClick={() => handleSelect(option.value)}
                $isSelected={option.value === value}
              >
                {option.label}
              </OptionItem>
            ))}
          </OptionsList>
        )}
      </DropdownButton>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;

  min-height: 140px;
`;

const Label = styled.label`
  margin-bottom: 8px;
  font-size: 22px;
  font-weight: bold;
  color: black;
`;

const DropdownButton = styled.button<{ $isOpen: boolean }>`
  width: 100%;
  padding: 18px;
  font-size: 20px;
  text-align: left;
  border: None;
  border-radius: ${({ $isOpen }) => ($isOpen ? "12px 12px 0 0" : "12px")};
  background-color: #efefef;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
`;

const OptionsList = styled.ul`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  list-style: none;
  padding: 0;
  margin: 0;
  border: None;
  border-radius: 0 0 12px 12px;
  background-color: #efefef;
`;

const OptionItem = styled.li<{ $isSelected: boolean }>`
  padding: 18px;
  font-size: 16px;
  cursor: pointer;
  color: black;
  font-size: 20px;
  justify-content: space-between;
  align-items: center;

  ${({ $isSelected }) => $isSelected && `font-weight: bold;`}
`;

const ErrorMessage = styled.p`
  margin-top: 10px;
  font-size: 16px;
  color: red;
  visibility: visible;
`;

export default Dropdown;
