import React from "react";
import InputSimple from "../../elements/InputSimple";

function DivBook() {
  return (
    <div className="new-division">
      <div className="boxy book" style={{ width: "100%" }}>
        <InputSimple name="Customer" type="text" />
        <InputSimple name="Entered" type="datetime-local" />
        <InputSimple name="Submitted" type="datetime-local" />
        <InputSimple name="Deadline" type="datetime-local" />
      </div>
    </div>
  );
}

export default DivBook;
