import React, { useEffect, useState } from "react";

function NumInput({
  name,
  defVal = "",
  min,
  max,
  setTo,
  changed,
  width,
  color,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [fixedVal, setFixedVal] = useState(defVal || "");

  function handleBlurOrEnter(e) {
    if (e.type === "blur" || e.key === "Enter") setIsEditing(false);
  }

  function handleChange(v) {
    const value = Number(v);
    const maxV = max ?? value;
    const minV = min ?? value;

    const fixed = Math.max(minV, Math.min(maxV, value));
    setFixedVal(fixed);

    if (typeof changed === "function") {
      changed({ target: { name, value: +fixed.toFixed(2) } });
    }
  }

  useEffect(() => {
    if (setTo !== undefined) handleChange(setTo);
  }, [setTo]);

  return (
    <div className="num-box">
      <div
        onClick={() => setIsEditing(true)}
        style={{ width: `${width}px`, color }}
      >
        {fixedVal.toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })}
      </div>

      {isEditing && (
        <input
          type="number"
          autoFocus
          defaultValue={fixedVal}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlurOrEnter}
          onKeyDown={handleBlurOrEnter}
          style={{ position: "absolute", width: `${width + 15}px` }}
        />
      )}
    </div>
  );
}

export default NumInput;
