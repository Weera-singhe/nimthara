import React, { useEffect, useState } from "react";
import Num from "../elements/NumInput";
import axios from "axios";
import { Price_API_URL, ADD_Price_API_URL } from "../api/urls";
import { useLocation } from "react-router-dom";

export default function Price({ user }) {
  const [newRec, setNewRec] = useState({ id: "", from: "", price: 0 });
  const [loadedPapers, loadPapers] = useState([]);
  const [selectedRecs, setSelectedRecs] = useState([]);
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [serverLoading, isSeverLoading] = useState(false);

  const location = useLocation();

  const changedNum = ({ target: { name, value } }) =>
    setNewRec((p) => ({ ...p, [name]: Number(value) }));
  const changedStr = ({ target: { name, value } }) =>
    setNewRec((p) => ({ ...p, [name]: value.trim() }));
  //const changedCheck = ({ target: { name, checked } }) =>
  // setNewRec((p) => ({ ...p, [name]: checked }));

  const changeSelected = (id) => {
    isSeverLoading(true);
    const paper = loadedPapers.find((p) => p.id === id);

    axios
      .get(`${Price_API_URL}?id=${id}`)
      .then((res) => {
        setSelectedRecs(res.data.recs);
        setSelectedUnits(paper ? paper.unit_val + " " + paper.unit : "");
      })
      .finally(() => isSeverLoading(false));
  };

  const newPriceRecord = (e) => {
    e.preventDefault();
    isSeverLoading(true);

    if (!user.loggedIn) return (window.location.href = "/login");

    axios
      .post(ADD_Price_API_URL, newRec)
      .then((res) => {
        setSelectedRecs(res.data.recs);
        setNewRec((p) => ({ ...p, price: 0 }));
      })
      .finally(() => isSeverLoading(false));
  };

  useEffect(() => {
    axios.get(Price_API_URL).then((res) => {
      loadPapers(res.data.eachpaper);
      const id = new URLSearchParams(location.search).get("id");
      if (id) {
        setNewRec((p) => ({ ...p, id }));
        changeSelected(id);
      } else {
        isSeverLoading(false);
      }
    });
  }, [location.search]);

  const fromDate = new Date(newRec.from);
  const disableBtn =
    serverLoading ||
    !newRec.id ||
    !newRec.price ||
    isNaN(fromDate) ||
    fromDate.getFullYear() < 2020;

  return (
    <>
      <div className="new-division">
        <div className="boxyy book">
          <form onSubmit={newPriceRecord}>
            <select
              name="id"
              value={newRec.id}
              onChange={(e) => {
                changedStr(e);
                changeSelected(e.target.value);
              }}
            >
              <option></option>
              {loadedPapers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <label>effects from : </label>
            <input name="from" type="datetime-local" onChange={changedStr} />
            LKR{" "}
            <Num
              width={100}
              name="price"
              changed={changedNum}
              min={0}
              max={500000}
              deci={2}
              setTo={newRec.price}
            />
            <button
              disabled={disableBtn}
              type="submit"
              style={{ marginLeft: "1em" }}
            >
              Add New Price Record
            </button>
            <b> {selectedUnits}</b>
          </form>
        </div>
      </div>
      <ul>
        {selectedRecs.map((r, i) => (
          <li key={i}>
            {r.date_} ={" "}
            {r.price.toLocaleString("en-LK", {
              style: "currency",
              currency: "LKR",
            })}
          </li>
        ))}
      </ul>
    </>
  );
}
