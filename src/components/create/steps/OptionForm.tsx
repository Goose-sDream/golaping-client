import React, { useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import styled from "styled-components";
import { Input, Select } from "@/components/common";
import { Vote } from "@/types/voteTypes";

type CheckedProps = {
  checked: boolean;
};

const OptionForm = () => {
  const { control, setValue } = useFormContext<Vote>();
  const [isHour, setIsHour] = useState(false);
  const voteNums = [1, 2, 3, 4, 5];

  const handleToggle = () => {
    setIsHour((prev) => !prev);
  };
  useEffect(() => {
    setValue("time", isHour ? 1 : 5);
  }, [isHour, setValue]);

  return (
    <div>
      <VoteTimeDiv>
        <Switch checked={isHour}>
          <ToggleInput type="checkbox" checked={isHour} onChange={handleToggle} />
          <SliderSpan />
          <Text checked={isHour}>{isHour ? "시간" : "분"}</Text>
        </Switch>
        <Controller
          name="time"
          control={control}
          defaultValue={5}
          rules={{
            required: "투표시간은 필수 입력 값입니다.",
            max: {
              value: isHour ? 24 : 59,
              message: `최대 ${isHour ? 24 : 59}${isHour ? "시간" : "분"}까지 가능합니다.`,
            },
          }}
          render={({ field, fieldState: { error } }) => (
            <Input label="투표시간" placeholder="투표시간" {...field} error={error?.message} />
          )}
        />
        <Controller
          name="voteNums"
          control={control}
          defaultValue={1}
          rules={{ required: false, min: 1, max: 5 }}
          render={({ field, fieldState: { error } }) => (
            <Select
              label="투표가능 횟수"
              id="voteNums"
              options={voteNums.map((num) => ({ value: num, label: `${num}` }))}
              {...field}
              error={error?.message}
            />
          )}
        />
      </VoteTimeDiv>
    </div>
  );
};

export default OptionForm;

const VoteTimeDiv = styled.div`
  width: 100%;
  position: relative;
`;

const Switch = styled.label<CheckedProps>`
  position: absolute;
  right: 0;
  width: 60px;
  height: 25px;
  display: flex;
  justify-content: ${(Checkedprops) => (Checkedprops.checked ? "flex-start" : "flex-end")};
  align-items: center;
  padding: 0 5px 0 0;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: #2196f3;
  }

  &:checked + span:before {
    transform: translate(180%, -50%);
  }
`;

const SliderSpan = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #2196f3;
  transition: 0.4s;
  border-radius: 30px;

  &:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    left: 5px;
    top: 50%;
    transform: translate(0, -50%);
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
`;

const Text = styled.span<CheckedProps>`
  position: relative;
  font-size: 14px;
  color: white;
`;
