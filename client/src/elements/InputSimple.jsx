import React from "react";

function InputSimple(props) {
  return (
    <div className="simple-input">
      <label htmlFor={props.name}>{props.name}</label>
      <input type={props.type} name={props.name} onChange={props.onChange} />
    </div>
  );
}

export default InputSimple;
