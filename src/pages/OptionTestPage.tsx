import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import OptionForm from "../components/create/steps/OptionForm";

const OptionTestPage = () => {
  const methods = useForm();
  return (
    <div>
      <FormProvider {...methods}>
        <OptionForm />
      </FormProvider>
    </div>
  );
};

export default OptionTestPage;
