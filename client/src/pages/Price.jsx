import React, { useEffect, useState } from "react";
import Header from "../partials/Header";
import InputSimple from "../elements/InputSimple";
import Num from "../elements/NumInput";
import axios from "axios";
import { Price_API_URL } from "../api/urls";
import { ADD_Price_API_URL } from "../api/urls";
export default function Price() {
  const [newRecordDetails, setnewRecordDetails] = useState({
    id: "",
    from: 0,
    price: 0,
  });
  const [allPapers, setAllPapers] = useState([]);
  const [allIds, setAllIds] = useState([]);
  const [selectedRecs, setSelectedRecs] = useState([]);
  const [isDisabled, changeDisabbled] = useState(true);

  function changed(e) {
    const { name, value, type } = e.target;
    const finalVal =
      value < 0 && name === "price"
        ? 0
        : name === "price"
        ? parseFloat(value).toFixed(2)
        : value;
    setnewRecordDetails((p) => {
      return {
        ...p,
        [name]: finalVal,
      };
    });
    type === "select-one" && changeSelectedPaper(value);
  }
  useEffect(() => {
    axios
      .get(Price_API_URL)
      .then((res) => {
        setAllPapers(res.data.names);
        setAllIds(res.data.ids);
      })
      .catch((err) => console.error("Error fetching papers:", err));
  }, []);

  const newPriceRecord = (e) => {
    e.preventDefault();
    changeDisabbled(true);
    axios
      .post(ADD_Price_API_URL, newRecordDetails)
      .then((res) => {
        setSelectedRecs(res.data.selectedRecs);
        setnewRecordDetails((p) => ({
          ...p,
          price: 0,
        }));
      })
      .catch((err) => {
        console.error("Error adding paper:", err);
      })
      .finally(() => {
        changeDisabbled(false);
      });
  };

  const changeSelectedPaper = (id) => {
    changeDisabbled(true);
    axios
      .get(`${Price_API_URL}?id=${id}`)
      .then((res) => {
        setSelectedRecs(res.data.recs);
      })
      .catch((err) => {
        console.error("Error fetching selected paper recs:", err);
      })
      .finally(() => {
        if (id !== "") changeDisabbled(false);
      });
  };

  return (
    <>
      <Header />
      <div className="new-division">
        <div className="boxy book">
          <form onSubmit={newPriceRecord}>
            <select onChange={changed} name="id">
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
              defVal="0"
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
            {i.date} = LKR{" "}
            {Number(i.price).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </li>
        ))}
      </ul>
    </>
  );
}
