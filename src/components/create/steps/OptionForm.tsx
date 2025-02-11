import { useEffect, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import styled from "styled-components";
import TimePicker from "./TimePicker";
import Input from "@/components/common/Input";
import Radio from "@/components/common/Radio";
import Select from "@/components/common/Select";
import { YELLOW } from "@/styles/color";
import { Vote } from "@/types/voteTypes";

const OptionForm = () => {
  const { control, setValue, watch } = useFormContext<Vote>();
  const [timeOpen, setTimeOpen] = useState(Array(2).fill(false));
  const limitList = ["무제한", "제한"];
  const [limited, setLimited] = useState(limitList[1]);
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
    setLimited(e.target.value);
  };

  const inputStyleProps = {
    width: "70px",
    textAlign: "right",
    pointerEvents: "none",
    labelDisplay: "none",
    position: "relative",
    wrapperMarginBottom: 0,
    minHeight: "80px",
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
                    style={{ display: "flex", alignItems: "center", gap: "10px", position: "relative", marginTop: 30 }}
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
                      styleProps={inputStyleProps}
                      name="타이머"
                    />
                    <h3 style={{ fontSize: "20px" }}>{idx > 0 ? "분" : "시간"}</h3>
                    {timeOpen[idx] && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
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
            justifyContent: "space-between",
            width: "70%",
            alignItems: "center",
            padding: "5px 10px 15px 10px",
          }}
        >
          {limitList.map((limit, idx) => (
            <Radio
              key={idx}
              label={limit}
              value={limit}
              checked={idx > 0 ? limited === "제한" : limited !== "제한"}
              onChange={handleRadioChange}
            />
          ))}
        </div>
        <Controller
          name="userVoteLimit"
          control={control}
          defaultValue={1}
          rules={{ required: false, min: 1, max: 5 }}
          render={({ field, fieldState: { error } }) => (
            <Select
              id="userVoteLimit"
              options={userVoteLimit.map((num) => ({ value: num, label: `${num}` }))}
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
            maxWidth: "300px",
            marginTop: "10px",
            padding: "10px",
          }}
        >
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "100%",
              backgroundColor: `${YELLOW}`,
            }}
          ></div>
          {limited == "무제한" ? (
            <p style={{ fontSize: "15px", width: "85%" }}>
              무제한을 고르면,
              <br /> 원하는 만큼 투표할 수 있어요. <br />
              중복가능, 다중가능
            </p>
          ) : (
            <p style={{ fontSize: "15px", width: "85%" }}>
              제한을 고르면,
              <br />
              정한 횟수만큼만 투표할 수 있어요.
              <br />
              중복불가, 다중가능
            </p>
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
`;

const Label = styled.label`
  margin-bottom: 8px;
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
