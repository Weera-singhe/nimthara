import React, { useEffect, useState } from "react";
import axios from "axios";
import { CUS_API_URL, ADD_CUS_API_URL } from "../api/urls";

export default function Customers({ user }) {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    reg_must: true,
    reg_till_: "2025-12-31",
  });
  const [editedFormData, setEditFormData] = useState(null);
  const [serverLoading, isSeverLoading] = useState(true);

  useEffect(() => {
    axios
      .get(CUS_API_URL)
      .then((res) => setCustomers(res.data))
      .catch((err) => console.error("Failed:", err))
      .finally(isSeverLoading(false));
  }, []);

  const handleChange =
    (setFunc) =>
    ({ target: { name, value } }) =>
      setFunc((prev) => ({ ...prev, [name]: value.trimStart().toUpperCase() }));

  const handleCheckbox =
    (setFunc) =>
    ({ target: { name, checked } }) =>
      setFunc((prev) => ({
        ...prev,
        [name]: checked,
        ...(checked ? {} : { reg_till_: null }),
      }));

  const changedStr = handleChange(setFormData);
  const changedCheck = handleCheckbox(setFormData);
  const changedStrEdit = handleChange(setEditFormData);
  const changedCheckEdit = handleCheckbox(setEditFormData);

  const changeCustomersDB = (e, data) => {
    e.preventDefault();
    isSeverLoading(true);

    const requiredLevel = data.id ? 3 : 2;
    if (!user.loggedIn || user.level < requiredLevel) {
      window.location.href = "/login";
      return;
    }

    axios
      .post(ADD_CUS_API_URL, data)
      .then((res) => {
        setCustomers(res.data.cus);
        setEditFormData(null);
        setFormData((p) => ({
          ...p,
          customer_name: "",
          cus_name_short: "",
          cus_name_other: "",
        }));
      })
      .catch((err) => alert("Error:", err))
      .finally(isSeverLoading(false));
  };

  const renderInput = (label, name, value, onChange, width) => (
    <>
      <label>{label}</label>
      <input
        type="text"
        name={name}
        value={value || ""}
        onChange={onChange}
        style={{ width }}
      />
    </>
  );
  const disableBtn = serverLoading || !formData.customer_name;

  return (
    <>
      <div className="new-division boxyy">
        <form
          onSubmit={(e) => changeCustomersDB(e, formData)}
          className="left-mar"
        >
          {renderInput(
            "customer name:",
            "customer_name",
            formData.customer_name,
            changedStr,
            "200px"
          )}
          {renderInput(
            "short name:",
            "cus_name_short",
            formData.cus_name_short,
            changedStr,
            "100px"
          )}
          {renderInput(
            "extra name:",
            "cus_name_other",
            formData.cus_name_other,
            changedStr,
            "150px"
          )}

          <label>registration required:</label>
          <input
            type="checkbox"
            name="reg_must"
            checked={formData.reg_must || false}
            onChange={changedCheck}
          />

          {formData.reg_must && (
            <>
              <label>registered until:</label>
              <input
                type="date"
                name="reg_till_"
                value={formData.reg_till_ || ""}
                onChange={changedStr}
              />
            </>
          )}
          <button type="submit" disabled={disableBtn}>
            add customer
          </button>
        </form>
      </div>

      {/* Customer List */}
      <div className="new-division">
        {customers.map((c) => (
          <div key={c.id}>
            <div className="flex-row">
              <div className="boxyy" style={{ width: "40%" }}>
                {c.customer_name} {c.cus_name_short && ` / ${c.cus_name_short}`}{" "}
                {c.cus_name_other && `( ${c.cus_name_other} )`}
              </div>
              <div className="boxyy" style={{ width: "15%" }}>
                {!c.reg_must ? "done" : c.reg_till_ || "pending..."}
              </div>
              {user.loggedIn && user.level >= 3 && (
                <div className="boxyy" style={{ width: "5%" }}>
                  <button onClick={() => setEditFormData(c)}>edit</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Popup */}
      {editedFormData && (
        <div className="backdrop" onClick={() => setEditFormData(null)}>
          <div className="boxyy" onClick={(e) => e.stopPropagation()}>
            <form
              className="left-mar"
              onSubmit={(e) => changeCustomersDB(e, editedFormData)}
            >
              {renderInput(
                "customer name:",
                "customer_name",
                editedFormData.customer_name,
                changedStrEdit
              )}
              {renderInput(
                "short name:",
                "cus_name_short",
                editedFormData.cus_name_short,
                changedStrEdit
              )}
              {renderInput(
                "extra name:",
                "cus_name_other",
                editedFormData.cus_name_other,
                changedStrEdit
              )}

              <label>registration required:</label>
              <input
                type="checkbox"
                name="reg_must"
                checked={editedFormData.reg_must || false}
                onChange={changedCheckEdit}
              />

              {editedFormData.reg_must && (
                <>
                  <label>registered until:</label>
                  <input
                    type="date"
                    name="reg_till_"
                    value={editedFormData.reg_till_ || ""}
                    onChange={changedStrEdit}
                  />
                </>
              )}
              <button type="submit">Save</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
