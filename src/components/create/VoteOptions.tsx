import { useEffect, useRef, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

type Inputs = {
  voteTime: string;
  voteNums: number;
};

const VoteOptions = () => {
  const [showPicker, setShowPicker] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const voteTimeRef = useRef<HTMLInputElement | null>(null);
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const timeOptions = ["quick", "detail"];
  const [timeOption, setTimeOption] = useState("detail");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data);

  console.log(watch("voteTime"));
  console.log("errors =>", errors);
  console.log("timeOption =>", timeOption);

  const handleClickPicker = (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
    const rect = (e.target as HTMLInputElement).getBoundingClientRect();
    setShowPicker((prev) => !prev);
    setPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    });
  };

  const handleClosePicker = (e: MouseEvent) => {
    if (
      voteTimeRef.current &&
      e.target instanceof Node &&
      !voteTimeRef.current.contains(e.target) &&
      pickerRef.current &&
      !pickerRef.current.contains(e.target)
    ) {
      setShowPicker((prev) => !prev);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClosePicker);

    return () => {
      document.removeEventListener("click", handleClosePicker);
    };
  }, []);

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          placeholder="투표시간"
          defaultValue=""
          {...register("voteTime", { required: true })}
          onClick={handleClickPicker}
          ref={voteTimeRef}
        />
        {showPicker && (
          <div
            ref={pickerRef}
            style={{
              display: "flex",
              flexDirection: "column",
              position: "absolute",
              top: `${position.top}px`,
              left: `${position.left}px`,
              background: "white",
              border: "1px solid #ccc",
              padding: "10px",
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              zIndex: 1000,
            }}
          >
            <div style={{}}>
              {timeOptions.map((option, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setTimeOption(option);
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
            <div>{timeOption === "detail" && <input type="date" />}</div>
          </div>
        )}

        <input placeholder="투표가능 횟수" defaultValue="" {...register("voteNums", { required: true })} />
        <input type="submit" value="생성하기" />
      </form>
    </div>
  );
};

export default VoteOptions;
