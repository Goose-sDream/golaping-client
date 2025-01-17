import { useFormContext, Controller } from "react-hook-form";
import { Vote } from "../../../types/voteTypes";
import { Input } from "../../common/Input";
import { Select } from "../../common/Select";

export const BasicForm = () => {
  const { control } = useFormContext<Vote>();

  return (
    <div>
      <Controller
        name="title"
        control={control}
        defaultValue=""
        rules={{ required: "투표 제목 입력이 필요합니다" }}
        render={({ field, fieldState: { error } }) => <Input label="제목" {...field} error={error?.message} />}
      />
      <Controller
        name="nickname"
        control={control}
        defaultValue=""
        rules={{ required: "방장 닉네임 입력이 필요합니다" }}
        render={({ field, fieldState: { error } }) => <Input label="닉네임" {...field} error={error?.message} />}
      />
      <Controller
        name="options"
        control={control}
        defaultValue="majority"
        rules={{ required: "투표 옵션 선택이 필요합니다" }}
        render={({ field, fieldState: { error } }) => (
          <Select
            label="옵션"
            id="options"
            options={[
              { value: "majority", label: "다수결" },
              { value: "random", label: "랜덤" },
              { value: "lottery", label: "제비뽑기" },
            ]}
            {...field}
            error={error?.message}
          />
        )}
      />
    </div>
  );
};
