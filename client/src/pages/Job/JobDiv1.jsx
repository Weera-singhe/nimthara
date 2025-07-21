import React from "react";
import Num from "../../elements/NumInput";

export default function JobDiv1({
  id,
  jobDetails,
  allCustomers,
  handleChangeStr,
  handleChangeNum,
  handleSubmit,
  submit_disabled,
  max_eachJobs,
}) {
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>Customer: </label>
        <select
          name="customer"
          value={jobDetails.customer}
          onChange={handleChangeNum}
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
          onChange={handleChangeStr}
        />

        <label>Deadline: </label>
        <input
          type="datetime-local"
          name="deadline"
          value={jobDetails.deadline || ""}
          onChange={handleChangeStr}
        />

        <label>Total Jobs: </label>
        <Num
          name={"total_jobs"}
          min={1}
          max={max_eachJobs}
          setTo={jobDetails.total_jobs}
          changed={handleChangeNum}
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
