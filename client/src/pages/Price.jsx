import React, { useEffect, useState } from "react";
import InputSimple from "../elements/InputSimple";
import Num from "../elements/NumInput";
import axios from "axios";
import { Price_API_URL, ADD_Price_API_URL } from "../api/urls";
import { useLocation } from "react-router-dom";

export default function Price({ user }) {
  const [newRecordDetails, setnewRecordDetails] = useState({
    id: "",
    from: 0,
    price: 0,
  });

  const [allPapers, setAllPapers] = useState([]);
  const [allIds, setAllIds] = useState([]);
  const [selectedRecs, setSelectedRecs] = useState([]);
  const [isDisabled, changeDisabbled] = useState(true);

  const location = useLocation();

  function changed(e) {
    const { name, value } = e.target;
    const finalVal = name === "price" ? Number(value) : value;
    setnewRecordDetails((p) => {
      return {
        ...p,
        [name]: finalVal,
      };
    });
    name === "id" && changeSelectedPaper(value);
  }

  const changeSelectedPaper = (id) => {
    changeDisabbled(true);
    axios
      .get(`${Price_API_URL}?id=${id}`)
      .then((res) => setSelectedRecs(res.data.recs))
      .catch((err) => console.error("Error fetching selected paper recs:", err))
      .finally(() => {
        id !== "" && changeDisabbled(false);
      });
  };
  const newPriceRecord = (e) => {
    e.preventDefault();
    changeDisabbled(true);

    if (!user.loggedIn) {
      window.location.href = "/login";
      return;
    }
    axios
      .post(ADD_Price_API_URL, newRecordDetails)
      .then((res) => {
        setSelectedRecs(res.data.recs);
        setnewRecordDetails((p) => ({ ...p, price: 0 }));
      })
      .catch((err) => console.error("Error adding paper:", err))
      .finally(() => changeDisabbled(false));
  };

  useEffect(() => {
    axios
      .get(Price_API_URL)
      .then((res) => {
        setAllPapers(res.data.names);
        setAllIds(res.data.ids);

        const params = new URLSearchParams(location.search);
        const selectedId = params.get("id");
        if (selectedId) {
          setnewRecordDetails((p) => ({ ...p, id: selectedId }));
          changeSelectedPaper(selectedId);
        }
      })
      .catch((err) => console.error("Error fetching papers:", err));
  }, [location.search]);

  return (
    <>
      <div className="new-division">
        <div className="boxy book">
          <form onSubmit={newPriceRecord}>
            <select onChange={changed} name="id" value={newRecordDetails.id}>
              <option value={""}></option>
              {allPapers.map((pp, i) => (
                <option key={i} value={allIds[i]}>
                  {pp}
                </option>
              ))}
            </select>
            <InputSimple name="from" type="datetime-local" onChange={changed} />
            LKR{" "}
            <Num
              width={100}
              name="price"
              changed={changed}
              min={0}
              max={500000}
              deci={2}
              setTo={newRecordDetails.price}
            />
            <button
              disabled={isDisabled}
              type="submit"
              style={{ marginLeft: "1em" }}
            >
              Add New Price Record
            </button>
          </form>
        </div>
      </div>
      <ul>
        {selectedRecs.map((i, ii) => (
          <li key={ii}>
            {i.date_} ={" "}
            {i.price.toLocaleString("en-LK", {
              style: "currency",
              currency: "LKR",
            })}
          </li>
        ))}
      </ul>
    </>
  );
}
