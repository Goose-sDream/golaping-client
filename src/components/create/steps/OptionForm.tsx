import React, { useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import styled from "styled-components";
import TimePicker from "./TimePicker";
import { Vote } from "../../../types/voteTypes";
import { Input } from "../../common/Input";
import { Select } from "../../common/Select";

type CheckedProps = {
  checked: boolean;
};

// const TimePicker = ({ totalItems }: { totalItems: number }) => {
//   const [rotateX, setRotateX] = useState(0);
//   const itemsArr = Array.from({ length: totalItems }, (_, i) => i);

//   const handleScroll = (e: React.WheelEvent<HTMLDivElement>) => {
//     e.preventDefault();
//     const delta = e.deltaY > 0 ? 1 : -1;
//     const scrollSpeed = 0.1;
//     setRotateX((prev) => prev + delta * (360 / totalItems) * scrollSpeed);
//   };

//   return (
//     <PickerWarpper onWheel={handleScroll} id="picker">
//       <CenterLine />
//       <PickerInner $rotateX={rotateX}>
//         {itemsArr.map((item, idx) => (
//           <TimeItem key={idx} style={{ transform: `rotateX(${(360 / totalItems) * idx}deg) translateZ(150px)` }}>
//             {item < 10 ? `0${item}` : item}
//           </TimeItem>
//         ))}
//       </PickerInner>
//     </PickerWarpper>
//   );
// };

// const PickerWarpper = styled.div`
//   width: 120px;
//   height: 300px;
//   position: relative;
//   overflow: hidden;
//   perspective: 1200px;
//   border-radius: 20px;
//   background-color: #f5f5f5;
//   box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
//   margin: auto auto;
// `;

// const CenterLine = styled.div`
//   position: absolute;
//   top: 50%;
//   left: 0;
//   width: 100%;
//   height: 40px;
//   margin-top: -20px; /* 높이의 절반만큼 이동 */
//   border-top: 2px solid #ff6347; /* 중앙 가이드 라인 */
//   border-bottom: 2px solid #ff6347;
//   pointer-events: none;
//   z-index: 10;
// `;

// const PickerInner = styled.div<{ $rotateX: number }>`
//   width: 100%;
//   height: 100%;
//   position: absolute;
//   top: 50%;
//   left: 50%;
//   transform-style: preserve-3d;
//   transform-origin: center center;
//   transform: translate(-50%, -50%) rotateX(${(props) => props.$rotateX}deg);
//   transition: transform 0.5s;
// `;

// const TimeItem = styled.div`
//   position: absolute;
//   width: 100%;
//   height: 50px;
//   line-height: 50px;
//   text-align: center;
//   font-size: 24px;
//   font-weight: 600;
//   color: #333;
//   background-color: #fff;
//   border-radius: 10px;
//   box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
// `;

const OptionForm = () => {
  const { control, setValue } = useFormContext<Vote>();
  const [isHour, setIsHour] = useState(false);
  const voteNums = [1, 2, 3, 4, 5];
  const [timeSetOpen, setTimeSetOpen] = useState(true);
  // console.log("timeSetOpen", timeSetOpen);

  const handleToggle = () => {
    setIsHour((prev) => !prev);
  };
  useEffect(() => {
    setValue("time", isHour ? 1 : 5);
  }, [isHour, setValue]);

  return (
    <div style={{ height: "100%", marginTop: "200px" }}>
      <VoteDiv>
        <div>
          {/* <TimePicker totalItems={24} /> */}
          <h2>타이머</h2>
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
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  justifyContent: "space-around",
                  padding: "0 10px 0 10px",
                  position: "relative",
                }}
                onClick={() => setTimeSetOpen((prev) => !prev)}
              >
                {timeSetOpen && (
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
                      <Input placeholder="00" {...field} error={error?.message} />
                      <TimePicker />
                      <h3>시간</h3>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <Input placeholder="00" {...field} error={error?.message} />
                      <h3>분</h3>
                    </div>
                  </div>
                )}
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
