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
    const safeVal = value.trimStart();
    setMainJTemp((p) => ({ ...p, [name]: safeVal }));
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
    !mainJTemp.deadline_i ||
    (!mainJTemp.reference && !mainJTemp.contact_p && !mainJTemp.contact_d);

  return (
    <div>
      <form onSubmit={onSubmit}>
        <label> Customer : </label>
        <select
          name="customer"
          value={mainJTemp.customer}
          onChange={NumChanged}
        >
          <option value={0}></option>
          {allCustomers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.cus_name_short || c.customer_name}
            </option>
          ))}
        </select>

        <label>Reference : </label>
        <input
          name="reference"
          value={mainJTemp.reference || ""}
          onChange={strChanged}
        />

        <label>Deadline : </label>
        <input
          type="datetime-local"
          name="deadline_i"
          value={mainJTemp.deadline_i || ""}
          onChange={strChanged}
        />

        <label>Total Jobs : </label>
        <Num
          name={"total_jobs"}
          min={1}
          max={500}
          setTo={mainJTemp.total_jobs}
          changed={NumChanged}
          width={100}
          deci={0}
        />
        <br />
        <br />

        <label>Contact Person : </label>
        <input
          name="contact_p"
          value={mainJTemp.contact_p || ""}
          onChange={strChanged}
        />

        <label>Contact : </label>
        <input
          name="contact_d"
          value={mainJTemp.contact_d || ""}
          onChange={strChanged}
          style={{ width: "20%" }}
        />

        {!submit_disabled && (
          <>
            <br />
            <br />
            <button type="submit">{id ? "Update" : "Submit"}</button>
            <span style={{ marginLeft: "2%" }}>
              by <b>{user.display_name}</b>on
              <b> {currentTime}</b>
            </span>
          </>
        )}
        <br />
        <br />
      </form>
    </div>
  );
}
