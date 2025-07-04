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

  useEffect(() => {
    axios
      .get(CUS_API_URL)
      .then((res) => setCustomers(res.data))
      .catch((err) => console.error("Failed:", err));
  }, []);

  const formChanged = (e) => {
    const { name, value, checked } = e.target;
    const valuee = name === "reg_must" ? checked : value.toUpperCase();

    setFormData((p) => {
      return {
        ...p,
        [name]: valuee,
        ...(name === "reg_must" && !checked ? { reg_till_: null } : {}),
      };
    });
  };
  const editFormChanged = (e) => {
    const { name, value, checked } = e.target;
    const valuee = name === "reg_must" ? checked : value.toUpperCase();

    setEditFormData((p) => {
      return {
        ...p,
        [name]: valuee,
        ...(name === "reg_must" && !checked ? { reg_till_: null } : {}),
      };
    });
  };

  const changeCustomersDB = (e, d) => {
    e.preventDefault();
    const lvl = d.id ? 3 : 2;
    if (!user.loggedIn || user.level < lvl) {
      window.location.href = "/login";
      return;
    }
    axios
      .post(ADD_CUS_API_URL, d)
      .then((res) => {
        setCustomers(res.data.cus);
        setEditFormData(null);
      })
      .catch((err) => alert("Error:", err));
  };

  return (
    <>
      <div className="new-division boxyy">
        <form
          onSubmit={(e) => changeCustomersDB(e, formData)}
          className="left-mar"
        >
          <label>customer name : </label>
          <input
            type="text"
            style={{ width: "200px" }}
            onChange={formChanged}
            name="customer_name"
            value={formData.customer_name || ""}
          />{" "}
          <label>short name : </label>
          <input
            type="text"
            style={{ width: "100px" }}
            onChange={formChanged}
            name="cus_name_short"
            value={formData.cus_name_short || ""}
          />{" "}
          <label>extra name : </label>
          <input
            type="text"
            style={{ width: "150px" }}
            onChange={formChanged}
            name="cus_name_other"
            value={formData.cus_name_other || ""}
          />
          <label>registration required : </label>
          <input
            type="checkbox"
            onChange={formChanged}
            name="reg_must"
            checked={formData.reg_must || false}
          />
          {formData.reg_must && (
            <>
              <label>registered until : </label>
              <input
                type="date"
                onChange={formChanged}
                name="reg_till_"
                value={formData.reg_till_ || ""}
              />
            </>
          )}
          <button type="submit">add customer</button>
        </form>
      </div>
      <div className="new-division">
        {customers.map((c, i) => (
          <div key={c.id}>
            <div>
              <div className="boxyy" style={{ width: "40%" }}>
                {c.customer_name} {c.cus_name_short && ` / ${c.cus_name_short}`}{" "}
                {c.cus_name_other && `( ${c.cus_name_other} )`}
              </div>{" "}
              <div className="boxyy" style={{ width: "15%" }}>
                {!c.reg_must ? "done" : c.reg_till_ ? c.reg_till_ : "."}
              </div>{" "}
              {user.loggedIn && user.level >= 3 && (
                <div className="boxyy" style={{ width: "5%" }}>
                  <button onClick={() => setEditFormData(c)}>edit</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {editedFormData && (
        <div className="backdrop" onClick={() => setEditFormData(null)}>
          <div className="boxyy" onClick={(e) => e.stopPropagation()}>
            <form
              className="left-mar"
              onSubmit={(e) => changeCustomersDB(e, editedFormData)}
            >
              <label>customer name: </label>
              <input
                value={editedFormData.customer_name || ""}
                name="customer_name"
                onChange={editFormChanged}
              />
              <label>short name: </label>
              <input
                value={editedFormData.cus_name_short || ""}
                name="cus_name_short"
                onChange={editFormChanged}
              />
              <label>extra name: </label>
              <input
                value={editedFormData.cus_name_other || ""}
                name="cus_name_other"
                onChange={editFormChanged}
              />
              <label>registration required :</label>
              <input
                type="checkbox"
                checked={editedFormData.reg_must || false}
                name="reg_must"
                onChange={editFormChanged}
              />
              {editedFormData.reg_must && (
                <>
                  <label>registered until:</label>
                  <input
                    type="date"
                    value={editedFormData.reg_till_ || ""}
                    name="reg_till_"
                    onChange={editFormChanged}
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
