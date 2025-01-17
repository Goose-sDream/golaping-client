import React from "react";
import { useParams } from "react-router-dom";

const VotePage = () => {
  const { id } = useParams();
  return (
    <div>
      <h2>투표 id: {id}</h2>
    </div>
  );
};

export default VotePage;
