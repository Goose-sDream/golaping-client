import { useState } from "react";

import { useForm, FormProvider } from "react-hook-form";

import { BasicForm } from "./steps/BasicForm";
import { LandingForm } from "./steps/LandingForm";

export const CreateForm = () => {
  const methods = useForm();
  const [step, setStep] = useState<number>(1);

  return (
    <FormProvider {...methods}>
      <form>
        {step === 1 && <LandingForm />}
        {step === 2 && <BasicForm />}
        <div>
          {step === 1 && (
            <button type="submit" onClick={() => setStep(step + 1)}>
              투표 생성하기
            </button>
          )}
          {step > 1 && step < 4 && (
            <button type="button" onClick={() => setStep(step - 1)}>
              이전
            </button>
          )}
          {step === 3 && <button type="submit">생성하기</button>}
          {step === 2 && (
            <button type="button" onClick={() => setStep(step + 1)}>
              다음
            </button>
          )}
        </div>
      </form>
    </FormProvider>
  );
};
