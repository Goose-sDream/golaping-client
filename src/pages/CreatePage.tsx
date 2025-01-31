import { CreateForm } from "@/components/create/CreateForm";

const CreatePage = () => {
  return (
    <div
      style={{
        height: "100vh",
        overflow: "hidden",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <CreateForm />
    </div>
  );
};

export default CreatePage;
