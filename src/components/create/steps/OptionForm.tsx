import { useEffect, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import styled from "styled-components";
import TimePicker from "./TimePicker";
import Input from "@/components/common/Input";
import Radio from "@/components/common/Radio";
import Select from "@/components/common/Select";
import { Vote } from "@/types/voteTypes";

const OptionForm = () => {
  const { control, setValue } = useFormContext<Vote>();
  const [timeOpen, setTimeOpen] = useState(Array(2).fill(false));
  const limitList = ["무제한", "제한"];
  const [limited, setLimited] = useState(limitList[1]);
  const timeRef = useRef<(HTMLDivElement | null)[]>([]);
  const userVoteLimit = Array.from({ length: 5 }, (_, i) => i + 1);

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

  return (
    <VoteDiv>
      <div style={{ display: "flex", flexDirection: "column", height: "50%" }}>
        <Label>타이머</Label>
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          {timeOpen.map((_, idx) => (
            <Controller
              key={idx}
              name={idx > 0 ? "minute" : "hour"}
              defaultValue={0}
              control={control}
              rules={{
                required: "투표시간은 필수 입력 값입니다.",
                max: {
                  value: 24,
                  message: `${idx > 0 ? "최대 59분 까지 가능!" : "최대 24시간 까지 가능!"}`,
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
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: "5px" }}
                    onClick={() => setTimeOpen((prev) => prev.map((p, i) => (i === idx ? true : p)))}
                    ref={(el) => {
                      timeRef.current[idx] = el;
                    }}
                  >
                    <Input
                      placeholder="00"
                      {...field}
                      error={error?.message}
                      value={field.value || ""}
                      autoComplete="off"
                    />
                    <h3>{idx > 0 ? "분" : "시간"}</h3>
                    {timeOpen[idx] && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          position: "absolute",
                        }}
                      >
                        <TimePicker type={idx > 0 ? "minute" : "hour"} name={field.name} setValue={setValue} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            />
          ))}
        </div>
      </div>

      <LimitWrapper>
        <Label>인당 투표 횟수</Label>
        <div style={{ display: "flex", width: "100%", justifyContent: "space-around" }}>
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
              label=""
              id="userVoteLimit"
              options={userVoteLimit.map((num) => ({ value: num, label: `${num}` }))}
              {...field}
              error={error?.message}
              disabled={limited !== "제한"}
            />
          )}
        />
      </LimitWrapper>
    </VoteDiv>
  );
};

export default OptionForm;

const VoteDiv = styled.div`
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
`;

const LimitWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 8px;
  font-size: 20px;
  font-weight: bold;
  color: black;
`;
