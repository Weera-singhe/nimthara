import React, { useEffect, useState } from "react";
import axios from "axios";
import { GTSCL_API_URL, ADD_GTSCL_API_URL } from "../../api/urls";

export default function ClientsGTS({ user }) {
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    has_vat: true,
  });
  const [editedFormData, setEditFormData] = useState(null);

  useEffect(() => {
    axios
      .get(GTSCL_API_URL)
      .then((res) => setClients(res.data))
      .catch((err) => console.error("Failed:", err));
  }, []);

  const changedStr = ({ target: { name, value } }) =>
    setFormData((p) => ({ ...p, [name]: value.trim().toUpperCase() }));
  const changedCheck = ({ target: { name, checked } }) =>
    setFormData((p) => ({
      ...p,
      [name]: checked,
      ...(!checked && name === "has_vat" ? { vat_id: "" } : {}),
    }));

  const changedStrEdit = ({ target: { name, value } }) =>
    setEditFormData((p) => ({ ...p, [name]: value.trim().toUpperCase() }));
  const changedCheckEdit = ({ target: { name, checked } }) =>
    setEditFormData((p) => ({
      ...p,
      [name]: checked,
      ...(!checked && name === "has_vat" ? { vat_id: "" } : {}),
    }));

  const editClientDB = (e, data) => {
    e.preventDefault();
    const lvl = data.id ? 3 : 2;
    if (!user.loggedIn || user.level < lvl) {
      window.location.href = "/login";
      return;
    }

    axios
      .post(ADD_GTSCL_API_URL, data)
      .then((res) => {
        setClients(res.data.c);
        setEditFormData(null);
        setFormData({ client_name: "", vat_id: "" });
      })
      .catch((err) => alert("Error:", err));
  };

  return (
    <>
      <div className="new-division boxyy">
        <form onSubmit={(e) => editClientDB(e, formData)} className="left-mar">
          <label>Client : </label>
          <input
            type="text"
            name="client_name"
            onChange={changedStr}
            value={formData.client_name || ""}
          ></input>

          <label>Buyer : </label>
          <input
            type="checkbox"
            name="is_buyer"
            onChange={changedCheck}
            checked={formData.is_buyer || false}
          />

          <label>Supplier : </label>
          <input
            type="checkbox"
            name="is_supplier"
            onChange={changedCheck}
            checked={formData.is_supplier || false}
          />

          <label>VAT Registered: </label>
          <input
            type="checkbox"
            name="has_vat"
            checked={formData.has_vat || false}
            onChange={changedCheck}
          />

          {formData.has_vat && (
            <>
              <label>VAT ID:</label>
              <input
                type="text"
                name="vat_id"
                onChange={changedStr}
                value={formData.vat_id || ""}
              />
            </>
          )}
          <button type="submit">add Client</button>
        </form>
      </div>

      <div className="new-division">
        {clients.map((c) => (
          <div key={c.id}>
            <div className="boxyy" style={{ width: "40%" }}>
              {c.client_name}
            </div>
            <div className="boxyy" style={{ width: "10%" }}>
              {c.vat_id || "-"}
            </div>
            {user.loggedIn && user.level >= 3 && (
              <div className="boxyy" style={{ width: "5%" }}>
                <button onClick={() => setEditFormData(c)}>edit</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {editedFormData && (
        <div className="backdrop" onClick={() => setEditFormData(null)}>
          <div className="boxyy" onClick={(e) => e.stopPropagation()}>
            <form
              className="left-mar"
              onSubmit={(e) => editClientDB(e, editedFormData)}
            >
              <label>Client : </label>
              <input
                type="text"
                name="client_name"
                onChange={changedStrEdit}
                value={editedFormData.client_name || ""}
              ></input>

              <label>Buyer : </label>
              <input
                type="checkbox"
                name="is_buyer"
                onChange={changedCheckEdit}
                checked={editedFormData.is_buyer || false}
              />

              <label>Supplier : </label>
              <input
                type="checkbox"
                name="is_supplier"
                onChange={changedCheckEdit}
                checked={editedFormData.is_supplier || false}
              />

              <label>VAT Registered: </label>
              <input
                type="checkbox"
                name="has_vat"
                checked={editedFormData.has_vat || false}
                onChange={changedCheckEdit}
              />

              {editedFormData.has_vat && (
                <>
                  <label>VAT ID:</label>
                  <input
                    type="text"
                    name="vat_id"
                    onChange={changedStrEdit}
                    value={editedFormData.vat_id || ""}
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
