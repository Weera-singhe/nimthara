import React, { useState } from "react";
import OpChecks from "../../elements/OpChecks";
import options from "../../scripts/OptionsList";
import DivLines from "./DivLines";

const simplified = options.map(({ name, def }) => ({ name, loops: def }));

function DivChecks() {
  const [stateVal, stateUpdate] = useState(simplified);

  function OnChange(e) {
    const name = e.target.name;
    const isCheckbox = e.target.type === "checkbox";
    const baseName = name.replace("loops", "");

    stateUpdate((st) => {
      const updated = st.map((i) => {
        if (i.name === baseName) {
          let raw = parseInt(
            isCheckbox ? e.target.nextSibling.value : e.target.value
          );
          let chk = isCheckbox
            ? e.target.checked
            : e.target.previousElementSibling.checked;
          const loops = isNaN(raw) ? 0 : Math.max(0, raw);
          return { ...i, loops: chk ? loops : 0 };
        }
        return i;
      });
      return updated;
    });
  }

  return (
    <>
      <div className="new-division">
        {options.map((i) => (
          <OpChecks key={i.key} name={i.name} def={i.def} onChange={OnChange} />
        ))}
      </div>

      <DivLines selected={stateVal} />
    </>
  );
}

export default DivChecks;
