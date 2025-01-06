import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import styled from "styled-components";

type Inputs = {
  voteTime: string;
  voteNums: number;
};

type CheckedProps = {
  checked: boolean;
};

const VoteOptions = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();

  const [isHour, setIsHour] = useState(false);

  const handleToggle = () => {
    setIsHour((prev) => !prev);
  };

  const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data);

  console.log(watch("voteTime"));
  console.log("errors =>", errors);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Switch checked={isHour}>
        <ToggleInput type="checkbox" checked={isHour} onChange={handleToggle} />
        <SliderSpan />
        <Text checked={isHour}>{isHour ? "시간" : "분"}</Text>
      </Switch>
      <input placeholder="투표시간" defaultValue="" {...register("voteTime", { required: true })}></input>
      <input
        placeholder="투표가능 횟수"
        defaultValue=""
        {...register("voteNums", { required: true, min: 1, max: 5 })}
      />
      <input type="submit" value="생성하기" />
    </form>
  );
};

export default VoteOptions;

const Switch = styled.label<CheckedProps>`
  position: relative;
  display: inline-block;
  width: 55px;
  height: 25px;
  display: flex;
  justify-content: ${(Checkedprops) => (Checkedprops.checked ? "flex-start" : "flex-end")};
  padding: 0 5px 0 5px;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: #2196f3;
  }

  &:checked + span:before {
    transform: translate(190%, -50%);
  }
`;

const SliderSpan = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 30px;

  &:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    left: 4px;
    top: 50%;
    transform: translate(0, -50%);
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
`;

const Text = styled.span<CheckedProps>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: white;
  transition: opacity 0.4s;
`;
