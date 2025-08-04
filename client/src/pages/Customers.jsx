import React, { useEffect, useState } from "react";
import axios from "axios";
import { CUS_API_URL, ADD_CUS_API_URL } from "../api/urls";

export default function Customers({ user }) {
  const [savedCustomers, setSavedCustomers] = useState([]);
  const [form_Add, setForm_Add] = useState({ reg_must: true });
  const [form_Edit, setForm_Edit] = useState(null);
  const [serverLoading, isSeverLoading] = useState(true);
  const [opertation, setOpertation] = useState(0);

  useEffect(() => {
    axios
      .get(CUS_API_URL)
      .then((res) => {
        setSavedCustomers(res.data);
        console.log(res.data);
      })
      .catch((err) => console.error("Failed:", err))
      .finally(() => isSeverLoading(false));
  }, []);

  function strChanged(e) {
    const { name, value } = e.target;
    opertation === 0
      ? setForm_Add((p) => ({
          ...p,
          [name]: value.trimStart().toUpperCase(),
        }))
      : setForm_Edit((p) => ({
          ...p,
          [name]: value.trimStart().toUpperCase(),
        }));
  }
  function checkChanged(e) {
    const { name, checked } = e.target;
    opertation === 0
      ? setForm_Add((p) => ({
          ...p,
          [name]: checked,
          ...(checked ? {} : { reg_till_: null }),
        }))
      : setForm_Edit((p) => ({
          ...p,
          [name]: checked,
          ...(checked ? {} : { reg_till_: null }),
        }));
  }

  const handleSubmit = (e, data) => {
    e.preventDefault();
    isSeverLoading(true);

    const reqLevel = data.id ? 3 : 2;
    if (!user.loggedIn || user.level_jobs < reqLevel) {
      window.location.href = "/login";
      return;
    }

    axios
      .post(ADD_CUS_API_URL, data)
      .then((res) => {
        setSavedCustomers(res.data.cus);
        setOpertation(0);
        setForm_Edit(null);
        setForm_Add((p) => ({
          ...p,
          customer_name: "",
          cus_name_short: "",
          cus_name_other: "",
        }));
      })
      .catch((err) => alert("Error:", err))
      .finally(isSeverLoading(false));
  };
  const form_Uni = opertation ? form_Edit : form_Add;
  const requiredLevel = opertation ? 3 : 2;
  const noID = opertation ? !form_Uni?.id : false;

  const disableSubmit =
    serverLoading ||
    noID ||
    !form_Uni?.customer_name ||
    user.level_jobs < requiredLevel ||
    !user.loggedIn;

  useEffect(() => {
    console.log("add form : ", form_Add);
  }, [form_Add]);
  useEffect(() => {
    console.log("edit form : ", form_Edit);
  }, [form_Edit]);
  useEffect(() => {
    console.log("universal form : ", form_Uni);
  }, [form_Uni]);

  return (
    <>
      <div className="new-division">
        <div className="formbox">
          <span
            onClick={() => setOpertation(0)}
            style={{
              cursor: "pointer",
              fontWeight: opertation ? "lighter" : "normal",
              textDecoration: "underline",
            }}
          >
            ADD
          </span>
          <span className="gap3"></span>
          <span
            onClick={() => setOpertation(1)}
            style={{
              cursor: "pointer",
              fontWeight: opertation ? "normal" : "lighter",
              textDecoration: "underline",
            }}
          >
            EDIT
          </span>
          {serverLoading ? (
            <>
              <br />
              <br />
              loading...
            </>
          ) : (
            <>
              <br />
              <br />
              <div style={{ display: opertation ? "block" : "none" }}>
                <select
                  value={form_Edit?.id || 0}
                  onChange={(e) =>
                    setForm_Edit(
                      savedCustomers.find(
                        (c) => c.id === Number(e.target.value)
                      )
                    )
                  }
                >
                  <option value={0}></option>
                  {savedCustomers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.customer_name}
                    </option>
                  ))}
                </select>
                <br />
                <br />
              </div>
              <form onSubmit={(e) => handleSubmit(e, form_Uni)}>
                <label>customer name : </label>
                <input
                  type="text"
                  name="customer_name"
                  value={form_Uni?.customer_name || ""}
                  onChange={strChanged}
                  style={{ width: "20%" }}
                />

                <span className="gap3"></span>
                <label>short name : </label>
                <input
                  type="text"
                  name="cus_name_short"
                  value={form_Uni?.cus_name_short || ""}
                  onChange={strChanged}
                  style={{ width: "10%" }}
                />

                <span className="gap3"></span>
                <label>extra name : </label>
                <input
                  type="text"
                  name="cus_name_other"
                  value={form_Uni?.cus_name_other || ""}
                  onChange={strChanged}
                  style={{ width: "20%" }}
                />
                <br />
                <br />
                <label>registration required:</label>
                <input
                  type="checkbox"
                  name="reg_must"
                  checked={form_Uni?.reg_must || false}
                  onChange={checkChanged}
                />

                <span className="gap3"></span>
                {form_Uni?.reg_must && (
                  <>
                    <label>registered until:</label>
                    <input
                      type="date"
                      name="reg_till_"
                      value={form_Uni?.reg_till_ || ""}
                      onChange={strChanged}
                    />
                  </>
                )}

                <br />
                <br />
                <button type="submit" disabled={disableSubmit}>
                  {opertation ? "EDIT" : "ADD"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Customer List */}
      <div className="new-division">
        {savedCustomers.map((c) => (
          <div key={c.id}>
            <div>
              <div className="boxyy" style={{ width: "40%" }}>
                {c.customer_name}{" "}
                {c.cus_name_short && ` / ${c.cus_name_short} `}
                {c.cus_name_other && ` ( ${c.cus_name_other} ) `}
              </div>
              <div className="boxyy" style={{ width: "15%" }}>
                {!c.reg_must ? "done" : c.reg_till_ || "pending..."}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Popup
      {formData_Edit && (
        <div className="backdrop" onClick={() => setFormData_Edit(null)}>
          <div className="boxyy" onClick={(e) => e.stopPropagation()}>
            <form
              className="left-mar"
              onSubmit={(e) => handleAdd(e, formData_Edit)}
            >
              {renderInput(
                "customer name:",
                "customer_name",
                formData_Edit.customer_name,
                changedStrEdit
              )}
              {renderInput(
                "short name:",
                "cus_name_short",
                formData_Edit.cus_name_short,
                changedStrEdit
              )}
              {renderInput(
                "extra name:",
                "cus_name_other",
                formData_Edit.cus_name_other,
                changedStrEdit
              )}

              <label>registration required:</label>
              <input
                type="checkbox"
                name="reg_must"
                checked={formData_Edit.reg_must || false}
                onChange={changedCheckEdit}
              />

              {formData_Edit.reg_must && (
                <>
                  <label>registered until:</label>
                  <input
                    type="date"
                    name="reg_till_"
                    value={formData_Edit.reg_till_ || ""}
                    onChange={changedStrEdit}
                  />
                </>
              )}
              <button type="submit">Save</button>
            </form>
          </div>
        </div>
      )} */}
    </>
  );
}
