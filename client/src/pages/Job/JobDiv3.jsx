import React, { useState, useEffect } from "react";
import Num from "../../elements/NumInput";
import { toLKR } from "../../elements/cal";

export default function JobDiv3({
  allUsernames,
  mainJDB,
  eachJDB,
  eachJXDB,
  allTotalPrices,
  displayID,
  handleSubmit,
  user,
}) {
  const [tempEstSub, setTempEstSub] = useState([]);
  //const [eachJTemp, setEachJTemp] = useState([]);
  const [tempBB, setTempBB] = useState([]);
  const [indexBidRes, setIBidRes] = useState(0);

  useEffect(() => {
    console.log("mainjtmp set to db");
    setTempEstSub(mainJDB);
  }, [mainJDB]);

  // useEffect(() => {
  //   console.log("eachjtmp set to db");
  //   setEachJTemp(eachJDB);
  // }, [eachJDB]);

  useEffect(() => {
    console.log("eachjxtratmp set to db");
    !tempBB.length && setTempBB(eachJXDB);
  }, [eachJXDB, tempBB.length]);

  function strChanged_M(e) {
    const { name, value } = e.target;
    setTempEstSub((p) => ({ ...p, [name]: value }));
  }
  function NumChanged_M(e) {
    const { name, value } = e.target;
    setTempEstSub((p) => ({ ...p, [name]: Number(value) }));
  }
  function NumChanged_xtra(e, id_each) {
    const { name, value } = e.target;
    (name === "bb" || name === "bb_amount") &&
      setTempBB((prev) =>
        prev.map((slot) =>
          slot.id_each === id_each ? { ...slot, [name]: Number(value) } : slot
        )
      );
  }

  function onSubmit(e) {
    const name = e.target.name;
    const exprt = name === "estSub" ? tempEstSub : tempBB;
    handleSubmit(exprt, name);
  }
  const estiSubDis =
    (tempEstSub.submit_method === mainJDB.submit_method &&
      tempEstSub.submit_note1 === mainJDB.submit_note1 &&
      tempEstSub.submit_note2 === mainJDB.submit_note2) ||
    user.level_jobs < 2 ||
    !user.loggedIn;

  const bbDisabled =
    JSON.stringify(tempBB) === JSON.stringify(eachJXDB) ||
    user.level_jobs < 2 ||
    !user.loggedIn;

  const depCount = eachJDB.filter((j) => j.deployed).length;

  useEffect(() => {
    console.log("x changed : ", tempBB);
  }, [tempBB]);

  return (
    <ul className="jb">
      {/*1_SubDiv_________________________________________*/}
      <li>
        Job ID :<b> {displayID}</b>
        <ul>
          <li>
            <small>{`Created by : ${
              allUsernames[mainJDB?.created_by] || "?"
            } on ${mainJDB?.created_at_t || "?"}`}</small>
          </li>
        </ul>
      </li>

      {/*2_SubDiv_________________________________________*/}
      <li>
        Estimation - {depCount} / {mainJDB?.total_jobs}
        <ul>
          {eachJDB.map((j, i) => (
            <li
              key={j.id_each}
              style={{ backgroundColor: !j.deployed && "mistyrose" }}
            >
              {`# ${displayID}_${j.cus_id_each || j.id_each} : `}
              {j.deployed ? (
                <>
                  <span>
                    <small>
                      <b style={{ color: "green" }}>Deployed. </b>
                      {` ( last edit by : ${
                        allUsernames[j.last_qt_edit_by] || "loading..."
                      } on ${j.last_qt_edit_at_t || "loading..."} )`}
                    </small>
                  </span>
                  <ul>
                    {" "}
                    <li>
                      <small>
                        <label>Total : </label>
                      </small>
                      {toLKR(allTotalPrices[i]?.total_price)}
                      <small style={{ marginLeft: "2%" }}>
                        <label>Total +VAT : </label>
                      </small>
                      {toLKR(allTotalPrices[i]?.total_vat)}
                    </li>
                    <li>
                      <small style={{ color: "darkblue" }}>
                        <label>Units :</label>
                      </small>
                      <b style={{ color: "darkblue" }}>
                        {eachJDB[i].unit_count.toLocaleString()}
                      </b>
                      <small style={{ marginLeft: "2%" }}>
                        <label>Unit : </label>
                      </small>
                      {toLKR(allTotalPrices[i]?.unit_price)}
                      <small style={{ marginLeft: "2%" }}>
                        <label>Unit +VAT : </label>
                      </small>
                      {toLKR(allTotalPrices[i]?.unit_vat)}
                    </li>
                  </ul>
                </>
              ) : (
                <>
                  <small>
                    <b style={{ color: "firebrick" }}>pending.....</b>
                  </small>
                  <ul>
                    <li></li>
                    <li></li>
                  </ul>
                </>
              )}
            </li>
          ))}
        </ul>
      </li>
      {/*3_SubDiv_________________________________________*/}
      <li>
        {`Bid Bond : `}{" "}
        <button disabled={bbDisabled} name="bb" onClick={onSubmit}>
          Save
        </button>
        <ul>
          {eachJDB.map((j, i) => (
            <li key={j.id_each}>
              {`# ${displayID}_${j.cus_id_each || j.id_each} : `}
              <small style={{ marginLeft: "2%" }}>
                <label>Not Needed : </label>
                <input
                  name="bb"
                  type="checkbox"
                  checked={tempBB[i]?.bb === 2}
                  value={2}
                  onChange={(e) => NumChanged_xtra(e, j.id_each)}
                />
                <label>Processing : </label>
                <input
                  name="bb"
                  type="checkbox"
                  checked={!tempBB[i]?.bb}
                  value={0}
                  onChange={(e) => NumChanged_xtra(e, j.id_each)}
                />
                <label>Approved : </label>
                <input
                  name="bb"
                  type="checkbox"
                  checked={tempBB[i]?.bb === 1}
                  value={1}
                  onChange={(e) => NumChanged_xtra(e, j.id_each)}
                />
                {tempBB[i]?.bb !== 2 && (
                  <>
                    <label>Amount : </label>
                    <Num
                      name="bb_amount"
                      min={0}
                      setTo={tempBB[i]?.bb_amount || 0}
                      changed={(e) => NumChanged_xtra(e, j.id_each)}
                      width={100}
                      deci={2}
                    />
                  </>
                )}
              </small>
            </li>
          ))}
        </ul>
      </li>

      {/*3_SubDiv_________________________________________*/}
      <li>
        {`Sample Submission  `}
        <ul>
          {eachJDB.map((j, i) => (
            <li key={j.id_each}>
              {`# ${displayID}_${j.cus_id_each || j.id_each} : `}
              <small style={{ marginLeft: "2%" }}>
                <label>Processing : </label>
                <input
                  name="samp_pp"
                  type="checkbox"
                  checked={!tempBB[i]?.samp_pp}
                  value={0}
                  onChange={(e) => NumChanged_xtra(e, j.id_each)}
                />{" "}
                <label>Submitted : </label>
                <input
                  name="samp_pp"
                  type="checkbox"
                  checked={tempBB[i]?.samp_pp === 1}
                  value={1}
                  onChange={(e) => NumChanged_xtra(e, j.id_each)}
                />
                <label>Approved : </label>
                <input
                  name="samp_pp"
                  type="checkbox"
                  checked={tempBB[i]?.samp_pp === 2}
                  value={2}
                  onChange={(e) => NumChanged_xtra(e, j.id_each)}
                />
                <label>Not Needed : </label>
                <input
                  name="samp_pp"
                  type="checkbox"
                  checked={tempBB[i]?.samp_pp === 3}
                  value={3}
                  onChange={(e) => NumChanged_xtra(e, j.id_each)}
                />
              </small>
            </li>
          ))}
        </ul>
      </li>
      <li>
        {`Estimation Submission `}{" "}
        <small>
          {mainJDB?.last_sub_edit_by &&
            ` ( last edit by ${allUsernames[mainJDB?.last_sub_edit_by]} at ${
              mainJDB?.last_sub_edit_at_t
            } ) `}
        </small>
        <ul>
          <li>
            <span># {displayID} : </span>
            <select
              name="submit_method"
              onChange={NumChanged_M}
              value={tempEstSub.submit_method || 0}
            >
              <option value={0}></option>
              <option value={1}>email</option>
              <option value={2}>deliver</option>
              <option value={3}>post</option>
            </select>
            {tempEstSub.submit_method > 0 && (
              <>
                <span>to : </span>
                <input
                  type="text"
                  name="submit_note1"
                  onChange={strChanged_M}
                  value={tempEstSub.submit_note1 || ""}
                  style={{ width: "30%" }}
                ></input>
                <span>by : </span>
                <input
                  type="text"
                  name="submit_note2"
                  onChange={strChanged_M}
                  value={tempEstSub.submit_note2 || ""}
                ></input>
              </>
            )}

            {!estiSubDis && (
              <button name="estSub" onClick={onSubmit}>
                save
              </button>
            )}
          </li>
        </ul>
      </li>

      {/*4_SubDiv_________________________________________*/}
      <li>
        {`Results : `}

        <ul>
          <small>Pending : </small>
          <input type="checkbox" />
          <small>Not Public : </small>
          <input type="checkbox" />
          <li>
            <select
              value={indexBidRes}
              onChange={(e) => setIBidRes(Number(e.target.value))}
            >
              <option value={0}></option>
              {eachJDB
                .filter((j) => j.deployed)
                .map((j) => (
                  <option key={j.id_each} value={j.id_each}>
                    {`# ${displayID}_${j.cus_id_each || j.id_each} `}
                  </option>
                ))}
            </select>
            <br />
            <br />
            {indexBidRes > 0 && (
              <>
                <input type="text" readOnly={true} value="Nimthara Printers" />
                <input
                  type="text"
                  // readOnly={true}value={allTotalPrices.find((p) => p.id_each === selctedforResult)?.total_price}
                  style={{ width: "100px" }}
                />
                <br />
                <input type="text" />
                <Num />
                <br /> <input type="text" />
                <Num />
                <br /> <input type="text" />
                <Num />
                <br />
                <input type="text" />
                <Num />
              </>
            )}
          </li>
        </ul>
      </li>
      <li>PO Recieved</li>
      <li>Artwork</li>
      <li>Artwork Approved</li>
      <li>Samples Approved</li>
      <li>Proccesing</li>
      <li>Job Completed</li>
      <li>Delivered</li>
      <li>Payment Recieved</li>
    </ul>
  );
}
