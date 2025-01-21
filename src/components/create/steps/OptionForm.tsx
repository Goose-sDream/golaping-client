import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import styled from "styled-components";
import TimePicker from "./TimePicker";
import TimePicker2 from "./TimePicker2";
import { Vote } from "../../../types/voteTypes";
import { Input } from "../../common/Input";
import { Select } from "../../common/Select";

type CheckedProps = {
  checked: boolean;
};

const OptionForm = () => {
  // const { control, setValue } = useFormContext<Vote>();
  const { control } = useFormContext<Vote>();
  const [isHour, setIsHour] = useState(false);
  const voteNums = [1, 2, 3, 4, 5];
  // const [timeSetOpen, setTimeSetOpen] = useState(true);

  const handleToggle = () => {
    setIsHour((prev) => !prev);
  };
  return (
    <div style={{ height: "100%", marginTop: "100px" }}>
      <VoteDiv>
        <div>
          <h2>타이머</h2>
          <Switch checked={isHour}>
            <ToggleInput type="checkbox" checked={isHour} onChange={handleToggle} />
            <SliderSpan />
            <Text checked={isHour}>{isHour ? "시간" : "분"}</Text>
          </Switch>
          <Controller
            name="time"
            control={control}
            rules={{
              required: "투표시간은 필수 입력 값입니다.",
              max: {
                value: isHour ? 24 : 59,
                message: `최대 ${isHour ? 24 : 59}${isHour ? "시간" : "분"}까지 가능합니다.`,
              },
            }}
            render={({ field, fieldState: { error } }) => (
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  justifyContent: "space-around",
                  padding: "0 10px 0 10px",
                  position: "relative",
                }}
                // onClick={() => setTimeSetOpen((prev) => !prev)}
              >
                {/* {timeSetOpen && ( */}
                <div
                  style={{
                    position: "absolute",
                    backgroundColor: "lightGray",
                    opacity: 0.8,
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-around",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      position: "relative",
                    }}
                  >
                    {/* <Input placeholder="00" {...field} error={errors?.message} /> */}
                    <TimePicker field={field} error={error?.message} type="hour" fullAngle={120} />
                    <TimePicker2 field={field} error={error?.message} type="hour" threshold={50} />

                    <h3>시간</h3>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <Input placeholder="00" {...field} error={error?.message} />
                    <h3>분</h3>
                  </div>
                </div>
                {/* )} */}
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <Input placeholder="00" {...field} error={error?.message} />
                  <h3>시간</h3>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <Input placeholder="00" {...field} error={error?.message} />
                  <h3>분</h3>
                </div>
              </div>
            )}
          />
        </div>

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
      </VoteDiv>
    </div>
  );
};

export default OptionForm;

const VoteDiv = styled.div`
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
