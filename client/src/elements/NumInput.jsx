import React, { useEffect, useState } from "react";

function fixValue(val, min, max, deci) {
  const num = Number(val) || 0;
  const limited = Math.min(Math.max(num, min), max);
  const decii = 10 ** deci;
  return Math.round(limited * decii) / decii;
}

function NumInput({
  name,
  defVal = 0,
  min = 0,
  max = Infinity,
  setTo,
  changed,
  width = 100,
  color = "black",
  deci = 2,
  label,
  plain = false,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(() => fixValue(defVal, min, max, deci));

  function handleBlurOrEnter(e) {
    if (e.type === "blur" || e.key === "Enter") {
      setIsEditing(false);
    }
  }

  function handleChange(e) {
    const raw = e.target.value;
    const fixed = fixValue(raw, min, max, deci);
    setValue(fixed);
    changed?.({ target: { name, value: fixed } });
  }

  useEffect(() => {
    if (setTo !== undefined) {
      const fixed = fixValue(setTo, min, max, deci);
      setValue(fixed);
    }
  }, [setTo, min, max, deci]);

  return (
    <div className="num-box" style={{ position: "relative" }}>
      <div
        onClick={() => setIsEditing(true)}
        style={{ width: `${width}px`, color }}
      >
        {value === 0 && label !== undefined ? (
          <small> {label}</small>
        ) : plain ? (
          String(value)
        ) : (
          value.toLocaleString()
        )}
      </div>

      {isEditing && (
        <input
          type="number"
          autoFocus
          onFocus={(e) => e.target.select()}
          defaultValue={value}
          onChange={handleChange}
          onBlur={handleBlurOrEnter}
          onKeyDown={handleBlurOrEnter}
          style={{
            position: "absolute",
            width: `${width + 15}px`,
            left: 0,
            zIndex: 1,
          }}
        />
      )}
    </div>
  );
}

export default React.memo(NumInput);
