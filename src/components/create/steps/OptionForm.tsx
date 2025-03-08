import { useEffect, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useRecoilState } from "recoil";
import styled from "styled-components";
import Description from "./Description";
import TimePicker from "./TimePicker";
import { limitState } from "@/atoms/createAtom";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import { YELLOW } from "@/styles/color";
import { Vote } from "@/types/voteTypes";

const OptionForm = () => {
  const { control, setValue, watch } = useFormContext<Vote>();
  const [timeOpen, setTimeOpen] = useState(Array(2).fill(false));
  const [{ limitList, limited }, setLimited] = useRecoilState(limitState);
  const timeRef = useRef<(HTMLDivElement | null)[]>([]);
  const userVoteLimit = Array.from({ length: 5 }, (_, i) => i + 1);
  const [hasError, setHasError] = useState<string>("");

  useEffect(() => {
    if (timeRef && timeRef.current) {
      const handleClickOutside = (e: MouseEvent) => {
        if (timeRef.current.every((ref) => ref && !ref.contains(e.target as Node))) {
          setTimeOpen(Array(2).fill(false));
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, []);

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLimited((prev) => ({ ...prev, limited: e.target.value }));
  };

  const timerInputStyleProps = {
    width: "70px",
    textAlign: "right",
    pointerEvents: "none",
    labelDisplay: "none",
    position: "relative",
  };

  const radioInputStyleProps = {
    flexDirection: "row",
    fontSize: "18px",
    fontWeight: "normal",
    width: "20px",
    minHeight: "20px",
    labelMarginBottom: "0px",
    labelDisplay: "flex",
    labelAlignItems: "center",
  };

  return (
    <VoteDiv>
      <div style={{ display: "flex", flexDirection: "column", marginBottom: 30 }}>
        <Label>타이머</Label>
        <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
          {timeOpen.map((_, idx) => (
            <Controller
              key={idx}
              name={idx > 0 ? "minute" : "hour"}
              defaultValue={0}
              control={control}
              rules={{
                required: "투표시간은 필수 입력 값입니다.",
                max: {
                  value: idx > 0 ? 59 : 23,
                  message: `${idx > 0 ? "최대 59분까지" : "최대 24시간까지"}`,
                },
                validate: () => {
                  const hour = watch("hour");
                  const minute = watch("minute");

                  if (hour === 0 && minute === 0) {
                    setHasError("최소 1분 이상 설정해주세요.");
                    return " ";
                  }

                  return true;
                },
              }}
              render={({ field, fieldState: { error } }) => (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-around",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: "5px", position: "relative" }}
                    onClick={() => setTimeOpen((prev) => prev.map((p, i) => (i === idx ? true : p)))}
                    ref={(el) => {
                      timeRef.current[idx] = el;
                    }}
                  >
                    <Input
                      placeholder="00"
                      {...field}
                      error={error?.message}
                      value={field.value || 0}
                      autoComplete="off"
                      $styleProps={timerInputStyleProps}
                    />
                    <h3 style={{ fontSize: "20px", minWidth: "40px" }}>{idx > 0 ? "분" : "시간"}</h3>
                    {timeOpen[idx] && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-75%, -50%)",
                        }}
                      >
                        <TimePicker
                          type={idx > 0 ? "minute" : "hour"}
                          name={field.name}
                          value={field.value}
                          setValue={setValue}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            />
          ))}
        </div>
        <ErrorMessage>{hasError}</ErrorMessage>
      </div>

      <LimitWrapper>
        <Label>인당 투표 횟수</Label>
        <div
          style={{
            display: "flex",
            width: "90%",
            height: "40px",
          }}
        >
          {limitList.map((limit, idx) => (
            <Input<"radio">
              key={idx}
              label={limit}
              value={limit}
              type="radio"
              $styleProps={radioInputStyleProps}
              checked={idx > 0 ? limited !== "제한" : limited === "제한"}
              onChange={handleRadioChange}
            />
          ))}
        </div>
        <Controller
          name="userVoteLimit"
          control={control}
          defaultValue={0}
          rules={{ required: false, min: 0, max: 5 }}
          render={({ field, fieldState: { error } }) => (
            <Select
              id="userVoteLimit"
              options={
                limited === "제한"
                  ? userVoteLimit.map((num) => ({ value: num, label: `${num}` }))
                  : [{ value: 0, label: "-" }]
              }
              {...field}
              error={error?.message}
              disabled={limited !== "제한"}
            />
          )}
        />
        <div
          style={{
            display: "flex",
            gap: "15px",
            alignItems: "center",
            height: "100px",
            width: "100%",
            padding: "10px",
          }}
        >
          <div
            style={{
              width: "25px",
              height: "25px",
              borderRadius: "100%",
              backgroundColor: `${YELLOW}`,
            }}
          ></div>
          {limited == "무제한" ? (
            <Description limit="무제한" des1="원하는 만큼 투표할 수 있어요." des2=" 중복가능, 다중가능" />
          ) : (
            <Description limit="제한" des1="정한 횟수만큼만 투표할 수 있어요." des2=" 중복불가, 다중가능" />
          )}
        </div>
      </LimitWrapper>
    </VoteDiv>
  );
};

export default OptionForm;

const VoteDiv = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: calc(100vh - 80px);
  gap: 30px;
`;

const LimitWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 10px;
`;

const Label = styled.label`
  font-size: 20px;
  font-weight: bold;
  color: black;
`;

const ErrorMessage = styled.p`
  font-size: 16px;
  color: red;
  text-align: center;
  height: 20px;
`;
