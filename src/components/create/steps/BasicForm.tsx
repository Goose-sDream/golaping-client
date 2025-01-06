import { useFormContext, Controller } from "react-hook-form";

export const BasicForm = () => {
  const { control } = useFormContext();

  return (
    <div>
      <Controller
        name="title"
        control={control}
        defaultValue=""
        rules={{ required: "투표 제목 입력이 필요합니다" }}
        render={({ field }) => (
          <div>
            <label htmlFor="title">제목</label>
            <input id="title" placeholder="제목" {...field} onChange={(e) => field.onChange(e.target.value)} />
          </div>
        )}
      />
      <Controller
        name="nickname"
        control={control}
        defaultValue=""
        rules={{ required: "방장 닉네임 입력이 필요합니다" }}
        render={({ field }) => (
          <div>
            <label htmlFor="nickname">닉네임</label>
            <input id="nickname" placeholder="닉네임" {...field} onChange={(e) => field.onChange(e.target.value)} />
          </div>
        )}
      />
      <Controller
        name="options"
        control={control}
        defaultValue="다수결"
        rules={{ required: "투표 옵션 선택이 필요합니다" }}
        render={({ field }) => (
          <div>
            <label htmlFor="option">투표 옵션</label>
            <input id="option" placeholder="다수결" {...field} onChange={(e) => field.onChange(e.target.value)} />
          </div>
        )}
      />
    </div>
  );
};
