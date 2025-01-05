import { SubmitHandler, useForm } from "react-hook-form";

type Inputs = {
  voteTime: string;
  voteNums: number;
};

const VoteOptions = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data);

  console.log(watch("voteTime"));
  console.log("errors =>", errors);
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          defaultValue="test"
          {...register("voteTime", { required: true })}
        />
        <input {...register("voteNums", { required: true })} />
        <input type="submit" value="생성하기" />
      </form>
    </div>
  );
};

export default VoteOptions;
