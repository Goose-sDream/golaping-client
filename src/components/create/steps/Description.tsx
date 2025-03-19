const Description = ({ limit, des1, des2 }: { limit: string; des1: string; des2: string }) => {
  return (
    <p style={{ fontSize: "15px", width: "85%" }}>
      <span
        style={{
          fontWeight: "bold",
        }}
      >
        {limit}
      </span>
      을 고르면,
      <br />
      {des1}
      <br />
      {des2}
    </p>
  );
};

export default Description;
