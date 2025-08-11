import React, { useEffect, useState } from "react";
import Num from "../../elements/NumInput";

export default function JobDiv1({
  id,
  mainJDB,
  allCustomers,
  handleSubmit,
  user,
  currentTime,
}) {
  const [mainJTemp, setMainJTemp] = useState(mainJDB);

  useEffect(() => {
    setMainJTemp(mainJDB);
  }, [mainJDB]);

  function strChanged(e) {
    const { name, value } = e.target;
    setMainJTemp((p) => ({ ...p, [name]: value }));
  }
  function NumChanged(e) {
    const { name, value } = e.target;
    setMainJTemp((p) => ({ ...p, [name]: Number(value) }));
  }

  function onSubmit(e) {
    e.preventDefault();
    handleSubmit?.(mainJTemp);
  }
  const submit_disabled =
    JSON.stringify(mainJTemp) === JSON.stringify(mainJDB) ||
    (id ? user.level_jobs < 3 : user.level_jobs < 2) ||
    !user.loggedIn ||
    !mainJTemp.customer ||
    !mainJTemp.deadline_i;

  return (
    <div>
      <form onSubmit={onSubmit}>
        <label>Customer: </label>
        <select
          name="customer"
          value={mainJTemp.customer}
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
          value={mainJTemp.reference || ""}
          onChange={strChanged}
        />

        <label>Deadline: </label>
        <input
          type="datetime-local"
          name="deadline_i"
          value={mainJTemp.deadline_i || ""}
          onChange={strChanged}
        />

        <label>Total Jobs: </label>
        <Num
          name={"total_jobs"}
          min={1}
          max={500}
          setTo={mainJTemp.total_jobs}
          changed={NumChanged}
          width={100}
          deci={0}
        />

        {!submit_disabled && (
          <>
            <br />
            <br />
            <button type="submit">{id ? "Update" : "Submit"}</button>
            <span style={{ marginLeft: "2%" }}>
              submitted by <b>{user.display_name}</b>on<b> {currentTime}</b>
            </span>
          </>
        )}
      </form>
    </div>
  );
}
