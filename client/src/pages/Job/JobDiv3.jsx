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
  const [tempSampPP, setTempSampPP] = useState([]);
  const [tempRes, setTempRes] = useState([]);
  const [bidRes_i, setIBidRes] = useState(0);

  useEffect(() => {
    !tempEstSub.length && setTempEstSub(mainJDB);
  }, [mainJDB, tempEstSub.length]);

  useEffect(() => {
    !tempBB.length && setTempBB(eachJXDB);
  }, [eachJXDB, tempBB.length]);

  useEffect(() => {
    !tempRes.length && setTempRes(eachJXDB);
  }, [eachJXDB, tempRes.length]);

  useEffect(() => {
    !tempSampPP.length && setTempSampPP(eachJXDB);
  }, [eachJXDB, tempSampPP.length]);

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
    if (name === "bb" || name === "bb_amount") {
      setTempBB((prev) =>
        prev.map((slot) =>
          slot.id_each === id_each ? { ...slot, [name]: Number(value) } : slot
        )
      );
    } else if (name === "samp_pp") {
      setTempSampPP((prev) =>
        prev.map((slot) =>
          slot.id_each === id_each ? { ...slot, [name]: Number(value) } : slot
        )
      );
    }
  }

  function onSubmit(e, i) {
    const name = e.target.name;
    const exprt =
      name === "estSub"
        ? tempEstSub
        : name === "bb"
        ? tempBB[i]
        : tempSampPP[i];
    handleSubmit(exprt, name);
  }
  const userJobsL2 = user.level_jobs > 1 && user.loggedIn;
  const userAuditL2 = user.level_audit > 1 && user.loggedIn;
  const estiSubDis =
    (tempEstSub.submit_method === mainJDB.submit_method &&
      tempEstSub.submit_note1 === mainJDB.submit_note1 &&
      tempEstSub.submit_note2 === mainJDB.submit_note2) ||
    !userJobsL2;
  const totalJobs = mainJDB?.total_jobs;
  const pendingDep = totalJobs - eachJDB.filter((j) => j.deployed).length;
  const pendingBB = totalJobs - tempBB.filter((j) => j.bb > 0).length;
  const pendingSPP = totalJobs - tempSampPP.filter((j) => j.samp_pp > 1).length;

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
        {`Estimation : `}
        <small style={{ color: "firebrick" }}>
          {pendingDep ? ` ${pendingDep} pending...` : "✅"}
        </small>
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
                      <small>
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
                      <small>
                        <label>Unit : </label>
                      </small>
                      {toLKR(allTotalPrices[i]?.unit_price)}
                      <small>
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
        {`Bid Bond : `}
        <small style={{ color: "firebrick" }}>
          {pendingBB ? ` ${pendingBB} pending...` : "✅"}
        </small>

        <ul>
          {eachJXDB.map((j, i) => {
            //loop with eachJDB becasue it guaranted every element
            const bbChanged =
              tempBB[i]?.bb !== j.bb || tempBB[i]?.bb_amount !== j.bb_amount;

            const lastEditText = j.last_bb_edit_by
              ? `last edit at ${j.last_bb_edit_at_t} by ${
                  allUsernames[j.last_bb_edit_by]
                }`
              : "";

            const showAmount = tempBB[i]?.bb !== 2;

            return (
              <li
                key={j.id_each}
                style={{
                  backgroundColor: tempBB[i]?.bb < 1 && "mistyrose",
                }}
              >
                {`# ${displayID}_${eachJDB[i]?.cus_id_each || j.id_each} : `}
                <small>
                  <label>Not Needed :</label>
                  <input
                    name="bb"
                    type="checkbox"
                    checked={tempBB[i]?.bb === 2}
                    value={2}
                    onChange={(e) => NumChanged_xtra(e, j.id_each)}
                  />

                  <label>Processing :</label>
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

                  <label>Amount : </label>
                  {showAmount ? (
                    <Num
                      name="bb_amount"
                      min={0}
                      setTo={tempBB[i]?.bb_amount || 0}
                      changed={(e) => NumChanged_xtra(e, j.id_each)}
                      width={100}
                      deci={2}
                    />
                  ) : (
                    <input
                      style={{ width: "100px", marginRight: "0" }}
                      readOnly
                      value="✅"
                    />
                  )}
                  <span style={{ marginLeft: "2.5%" }}>
                    {(userAuditL2 || userJobsL2) && bbChanged ? (
                      <button name="bb" onClick={(e) => onSubmit(e, i)}>
                        Save
                      </button>
                    ) : (
                      lastEditText
                    )}
                  </span>
                </small>
              </li>
            );
          })}
        </ul>
      </li>

      {/*3_SubDiv_________________________________________*/}
      <li>
        {`Paper Sample : `}
        <small style={{ color: "firebrick" }}>
          {pendingSPP ? ` ${pendingSPP} pending...` : "✅"}
        </small>
        <ul>
          {/* */}
          {eachJXDB.map((j, i) => {
            //loop with eachJDB becasue it guaranted every element
            const sppChanged = tempSampPP[i]?.samp_pp !== j.samp_pp;

            const lastEditText = j.last_samppp_edit_by
              ? `last edit at ${j.last_samppp_edit_at_t} by ${
                  allUsernames[j.last_samppp_edit_by]
                }`
              : "";

            return (
              <li
                key={j.id_each}
                style={{
                  backgroundColor: tempSampPP[i]?.samp_pp < 2 && "mistyrose",
                }}
              >
                {`# ${displayID}_${eachJDB[i]?.cus_id_each || j.id_each} : `}
                <small>
                  <label>Not Needed : </label>
                  <input
                    name="samp_pp"
                    type="checkbox"
                    checked={tempSampPP[i]?.samp_pp === 3}
                    value={3}
                    onChange={(e) => NumChanged_xtra(e, j.id_each)}
                  />
                  <label>Processing : </label>
                  <input
                    name="samp_pp"
                    type="checkbox"
                    checked={!tempSampPP[i]?.samp_pp}
                    value={0}
                    onChange={(e) => NumChanged_xtra(e, j.id_each)}
                  />{" "}
                  <label>Submitted : </label>
                  <input
                    name="samp_pp"
                    type="checkbox"
                    checked={tempSampPP[i]?.samp_pp === 1}
                    value={1}
                    onChange={(e) => NumChanged_xtra(e, j.id_each)}
                  />
                  <label>Approved : </label>
                  <input
                    name="samp_pp"
                    type="checkbox"
                    checked={tempSampPP[i]?.samp_pp === 2}
                    value={2}
                    onChange={(e) => NumChanged_xtra(e, j.id_each)}
                  />
                  <span>
                    {userJobsL2 && sppChanged ? (
                      <button name="samp_pp" onClick={(e) => onSubmit(e, i)}>
                        Save
                      </button>
                    ) : (
                      lastEditText
                    )}
                  </span>
                </small>
              </li>
            );
          })}
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
        <small>
          <label>Waiting : </label>
          <input type="checkbox" />
          <label>Published : </label>
          <input type="checkbox" />
          <label>Never Publish : </label>
          <input type="checkbox" />
        </small>

        <ul>
          <li>
            <select
              value={bidRes_i}
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
            {bidRes_i > 0 &&
              (() => {
                const totRes = allTotalPrices.find(
                  (item) => item.id_each === bidRes_i
                );

                return (
                  <>
                    <input type="text" readOnly value="Nimthara Printers" />
                    <Num />

                    <small>{`total : ${toLKR(totRes?.total_price)}`}</small>
                    <small>{`total+VAT : ${toLKR(totRes?.total_vat)}`}</small>
                    <small>{`unit : ${toLKR(totRes?.unit_price)}`}</small>
                    <small>{`unit+VAT : ${toLKR(totRes?.unit_vat)}`}</small>

                    {[...Array(9)].map((_, idx) => (
                      <React.Fragment key={idx}>
                        <br />
                        <input type="text" />
                        <Num />
                      </React.Fragment>
                    ))}
                  </>
                );
              })()}
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
