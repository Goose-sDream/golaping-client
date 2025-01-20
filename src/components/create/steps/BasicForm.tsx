import { useFormContext, Controller } from "react-hook-form";
import { Vote } from "../../../types/voteTypes";
import { Dropdown } from "../../common/Dropdown";
import { Input } from "../../common/Input";

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
          <Dropdown
            label="투표 유형"
            options={[
              { value: "majority", label: "다수결" },
              { value: "random", label: "랜덤" },
            ]}
            value={field.value}
            onChange={field.onChange}
            error={error?.message}
          />
        )}
      />
    </div>
  );
};
