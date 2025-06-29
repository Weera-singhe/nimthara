import React, { useState } from "react";

function OpChecks(prop) {
  const [stateVal, stateUpdate] = useState("boxy");

  function mouseOver() {
    stateUpdate("boxy hover");
  }
  function mouseOut() {
    stateUpdate("boxy");
  }

  return (
    <>
      <div className={stateVal} onMouseOver={mouseOver} onMouseOut={mouseOut}>
        <label htmlFor={prop.name}>{prop.name}</label>
        <input
          type="checkBox"
          defaultChecked={true}
          name={prop.name}
          className="op-check"
          checked={prop.checked}
          onChange={prop.onChange}
          value={true}
        />
        <input
          type="number"
          name={prop.name + "loops"}
          defaultValue={prop.def}
          className="op-loop"
          max={5}
          onChange={prop.onChange}
        />
      </div>
      <div className="gap"></div>
    </>
  );
}

export default OpChecks;
