import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import OptionForm from "../components/create/steps/OptionForm";

const OptionTestPage = () => {
  const methods = useForm();
  return (
    <div style={{ height: "100vh", overflow: "hidden" }}>
      <FormProvider {...methods}>
        <OptionForm />
      </FormProvider>
    </div>
  );
};

export default OptionTestPage;
