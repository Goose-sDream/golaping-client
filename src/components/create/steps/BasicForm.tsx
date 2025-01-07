import { useFormContext, Controller } from "react-hook-form";

import { Input } from "../../common/Input";

export const BasicForm = () => {
  const { control } = useFormContext();

  return (
    <div>
      <Controller
        name="title"
        control={control}
        defaultValue=""
        rules={{ required: "투표 제목 입력이 필요합니다" }}
        render={({ field, fieldState: { error } }) => (
          <Input label="제목" placeholder="제목" {...field} error={error?.message} />
        )}
      />
      <Controller
        name="nickname"
        control={control}
        defaultValue=""
        rules={{ required: "방장 닉네임 입력이 필요합니다" }}
        render={({ field, fieldState: { error } }) => (
          <Input label="닉네임" placeholder="닉네임" {...field} error={error?.message} />
        )}
      />
      <Controller
        name="options"
        control={control}
        defaultValue="다수결"
        rules={{ required: "투표 옵션 선택이 필요합니다" }}
        render={({ field, fieldState: { error } }) => (
          <Input label="옵션" placeholder="옵션" {...field} error={error?.message} />
        )}
      />
    </div>
  );
};
