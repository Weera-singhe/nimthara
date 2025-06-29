import React, { useEffect, useState } from "react";

function NumBox(props) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayVal, setDisplay] = useState(props.defVal || 0);

  function handleBlurOrEnter(e) {
    if (e.type === "blur" || e.key === "Enter") {
      setIsEditing(false);
    }
  }

  function handleChange(e) {
    setDisplay(e.target.value);
    props.changed(e);
  }
  useEffect(() => {
    if (props.setTo !== undefined) {
      setDisplay(props.setTo);
    }
  }, [props.setTo]);

  return (
    <div className="num-box">
      <div
        onClick={() => setIsEditing(true)}
        style={{ width: `${props.width}px`, color: `${props.color}` }}
      >
        {Number(displayVal).toLocaleString()}
      </div>
      {isEditing && (
        <input
          name={props.name}
          type="number"
          autoFocus
          value={displayVal}
          onChange={(e) => handleChange(e)}
          onBlur={handleBlurOrEnter}
          onKeyDown={handleBlurOrEnter}
          style={{ position: "absolute", width: `${props.width + 15}px` }}
        />
      )}
    </div>
  );
}

export default NumBox;
