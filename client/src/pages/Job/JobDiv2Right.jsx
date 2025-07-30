import React from "react";

import { SumEachRow, toLKR } from "../../elements/cal";

function JobDiv2Right({ name, v, compID, min_cal_res }) {
  const { calResult, isBelowMin } = SumEachRow(name, v, compID, min_cal_res);

  return (
    <span style={{ color: isBelowMin ? "red" : "black" }}>
      {toLKR(calResult)}
    </span>
  );
}

export default React.memo(JobDiv2Right);
