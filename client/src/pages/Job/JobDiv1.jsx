import React from "react";
import Num from "../../elements/NumInput";

export default function JobDiv1({
  id,
  jobDetails,
  setDetails,
  allCustomers,
  handleSubmit,
  submit_disabled,
}) {
  function strChanged(e) {
    const { name, value } = e.target;
    setDetails((p) => ({ ...p, [name]: value }));
  }
  function NumChanged(e) {
    const { name, value } = e.target;
    setDetails((p) => ({ ...p, [name]: Number(value) }));
  }
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>Customer: </label>
        <select
          name="customer"
          value={jobDetails.customer}
          onChange={NumChanged}
        >
          <option value={0}></option>
          {allCustomers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.customer_name}
            </option>
          ))}
        </select>

        <label>Reference : </label>
        <input
          name="reference"
          value={jobDetails.reference || ""}
          onChange={strChanged}
        />

        <label>Deadline: </label>
        <input
          type="datetime-local"
          name="deadline"
          value={jobDetails.deadline || ""}
          onChange={strChanged}
        />

        <label>Total Jobs: </label>
        <Num
          name={"total_jobs"}
          min={1}
          max={500}
          setTo={jobDetails.total_jobs}
          changed={NumChanged}
          width={100}
          deci={0}
        />

        {!submit_disabled && (
          <>
            <br />
            <br />
            <button type="submit">{id ? "Update" : "Submit"}</button>
          </>
        )}
      </form>
    </div>
  );
}
