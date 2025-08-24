import React, { useState, useEffect } from "react";
import Num from "../../elements/NumInput";
//import { toLKR } from "../../elements/cal";

export default function JobDiv3({
  mainJDB,
  eachJDB,
  eachJXDB,
  allTotalPrices,
  displayID,
  handleSubmit,
  user,
}) {
  const [tempJStatus, setTempJStatus] = useState([]);
  const [tempPB, setTempPB] = useState([]);
  const [tempPO, setTempPO] = useState([]);

  useEffect(() => {
    !tempJStatus.length && setTempJStatus(eachJDB);
  }, [eachJDB, tempJStatus.length]);

  useEffect(() => {
    !tempPB.length && setTempPB(eachJXDB);
  }, [eachJXDB, tempPB.length]);

  useEffect(() => {
    !tempPO.length && setTempPO(eachJXDB);
  }, [eachJXDB, tempPO.length]);

  function NumChanged(e, id_each) {
    const { name, value } = e.target;

    if (name === "j_status") {
      setTempJStatus((prev) =>
        prev.map((slot) =>
          slot.id_each === id_each ? { ...slot, [name]: Number(value) } : slot
        )
      );
    }
    if (name === "pb" || name === "pb_amount") {
      setTempPB((prev) =>
        prev.map((slot) =>
          slot.id_each === id_each ? { ...slot, [name]: Number(value) } : slot
        )
      );
    }
    if (name === "po" || name === "po_amount") {
      setTempPO((prev) =>
        prev.map((slot) =>
          slot.id_each === id_each ? { ...slot, [name]: Number(value) } : slot
        )
      );
    }
  }

  function onSubmit(e, i) {
    const name = e.target.name;
    const exprt =
      name === "job_status"
        ? tempJStatus[i]
        : name === "pb"
        ? tempPB[i]
        : name === "po"
        ? tempPO[i]
        : tempJStatus[i];

    handleSubmit(exprt, name);
  }

  const userJobsL2 = user.level_jobs > 1 && user.loggedIn;
  //  const userJobsL3 = user.level_jobs > 2 && user.loggedIn;
  const userAuditL2 = user.level_audit > 1 && user.loggedIn;

  const totalJobs = mainJDB?.total_jobs;
  const pendingConf = totalJobs - tempJStatus.filter((j) => j.j_status).length;

  const pendingPB = totalJobs - tempPB.filter((j) => j.pb).length;
  const pendingPO = totalJobs - tempPO.filter((j) => j.po).length;

  useEffect(() => {
    console.log("eachJXDB : ", eachJXDB);
  }, [eachJXDB]);

  return (
    <ul className="jb">
      <li>
        Customer Decision :
        <small style={{ color: "firebrick" }}>
          {pendingConf ? ` ${pendingConf} pending...` : "✅"}
        </small>
        <ul>
          {eachJDB.map((j, i) => {
            //loop with eachJDB becasue it guaranted every element
            const temp = tempJStatus[i];

            const jstChanged = temp?.j_status !== j.j_status;

            // const lastEditText = j.last_jst_edit_by
            //   ? `( last edit at ${j.last_jst_edit_at_t} by ${
            //       allUsernames[j.last_jst_edit_by]
            //     } ) `
            //   : "";

            return (
              <li
                key={i}
                style={{
                  backgroundColor: !temp?.j_status && "mistyrose",
                }}
              >
                {`# ${displayID}_${j.cus_id_each || j.id_each}`}
                <small>
                  <label>Waiting :</label>
                  <input
                    name="j_status"
                    type="checkbox"
                    checked={!temp?.j_status}
                    value={0}
                    onChange={(e) => NumChanged(e, j.id_each)}
                  />
                  {/* <label style={{ color: "red" }}>Disqualified :</label>
                  <input
                    name="j_status"
                    type="checkbox"
                    checked={temp?.j_status === 2}
                    value={2}
                    onChange={(e) => NumChanged(e, j.id_each)}
                  /> */}
                  <label style={{ color: "green" }}>Qualified : </label>
                  <input
                    name="j_status"
                    type="checkbox"
                    checked={temp?.j_status === 1}
                    value={1}
                    onChange={(e) => NumChanged(e, j.id_each)}
                  />
                </small>
                <small>
                  {userJobsL2 && jstChanged && (
                    <button name="j_status" onClick={(e) => onSubmit(e, i)}>
                      Save
                    </button>
                  )}
                </small>
              </li>
            );
          })}
        </ul>
      </li>
      <li>
        {`Performance Bond : `}
        <small style={{ color: "firebrick" }}>
          {pendingPB ? ` ${pendingPB} pending...` : "✅"}
        </small>

        <ul>
          {eachJXDB.map((j, i) => {
            //loop with eachJDB becasue it guaranted every element
            const pbChanged =
              tempPB[i]?.pb !== j.pb || tempPB[i]?.pb_amount !== j.pb_amount;

            // const lastEditText = j.last_pb_edit_by
            //   ? `( last edit at ${j.last_pb_edit_at_t} by ${
            //       allUsernames[j.last_pb_edit_by]
            //     } ) `
            //   : "";

            const showAmount = tempPB[i]?.pb !== 1;

            return (
              <li
                key={j.id_each}
                style={{
                  backgroundColor: !tempPB[i]?.pb && "mistyrose",
                }}
              >
                {`# ${displayID}_${eachJDB[i]?.cus_id_each || j.id_each} : `}
                <small>
                  <label>Not Needed :</label>
                  <input
                    name="pb"
                    type="checkbox"
                    checked={tempPB[i]?.pb === 1}
                    value={1}
                    onChange={(e) => NumChanged(e, j.id_each)}
                  />
                  <label>Waiting :</label>
                  <input
                    name="pb"
                    type="checkbox"
                    checked={!tempPB[i]?.pb}
                    value={0}
                    onChange={(e) => NumChanged(e, j.id_each)}
                  />
                  <label>Approved : </label>
                  <input
                    name="pb"
                    type="checkbox"
                    checked={tempPB[i]?.pb === 2}
                    value={2}
                    onChange={(e) => NumChanged(e, j.id_each)}
                  />
                  <label>Amount : </label>
                  {showAmount ? (
                    <Num
                      name="pb_amount"
                      min={0}
                      setTo={tempPB[i]?.pb_amount || 0}
                      changed={(e) => NumChanged(e, j.id_each)}
                      width={100}
                      deci={2}
                    />
                  ) : (
                    <input
                      style={{ width: "100px", marginRight: "0" }}
                      readOnly
                      value="✅"
                    />
                  )}{" "}
                  {j?.pb === 2 &&
                    (tempPB[i]?.pb !== 2 ||
                      tempPB[i]?.pb_amount !== j?.pb_amount) && (
                      <small style={{ color: "red" }}>
                        cannot change once approved
                      </small>
                    )}
                  <small>
                    {/*once approved cannot change*/}
                    {(userAuditL2 || userJobsL2) &&
                      pbChanged &&
                      j?.pb !== 2 && (
                        <button name="pb" onClick={(e) => onSubmit(e, i)}>
                          Save
                        </button>
                      )}
                  </small>
                </small>
              </li>
            );
          })}
        </ul>
      </li>
      <li>
        {`PO : `}
        <small style={{ color: "firebrick" }}>
          {pendingPO ? ` ${pendingPO} pending...` : "✅"}
        </small>

        <ul>
          {eachJXDB.map((j, i) => {
            //loop with eachJDB becasue it guaranted every element
            const poChanged =
              tempPO[i]?.po !== j?.po || tempPO[i]?.po_amount !== j?.po_amount;

            // const lastEditText = j.last_po_edit_by
            //   ? `( last edit at ${j.last_po_edit_at_t} by ${
            //       allUsernames[j.last_po_edit_by]
            //     } ) `
            //   : "";

            return (
              <li
                key={j.id_each}
                style={{
                  backgroundColor: !tempPO[i]?.po && "mistyrose",
                }}
              >
                {`# ${displayID}_${eachJDB[i]?.cus_id_each || j.id_each} : `}
                <small>
                  <label>Not Providing :</label>
                  <input
                    name="po"
                    type="checkbox"
                    checked={tempPO[i]?.po === 1}
                    value={1}
                    onChange={(e) => NumChanged(e, j.id_each)}
                  />
                  <label>Waiting :</label>
                  <input
                    name="po"
                    type="checkbox"
                    checked={!tempPO[i]?.po}
                    value={0}
                    onChange={(e) => NumChanged(e, j.id_each)}
                  />
                  <label>Recieved : </label>
                  <input
                    name="po"
                    type="checkbox"
                    checked={tempPO[i]?.po === 2}
                    value={2}
                    onChange={(e) => NumChanged(e, j.id_each)}
                  />
                  <label>Agreed Payment : </label>
                  <Num
                    name="po_amount"
                    min={0}
                    setTo={tempPO[i]?.po_amount || 0}
                    changed={(e) => NumChanged(e, j.id_each)}
                    width={100}
                    deci={2}
                  />{" "}
                  {j?.po === 2 &&
                    (tempPO[i]?.po !== 2 ||
                      tempPO[i]?.po_amount !== j?.po_amount) && (
                      <small style={{ color: "red" }}>
                        cannot change once recieved
                      </small>
                    )}
                  <small>
                    {/*once approved cannot change*/}
                    {(userAuditL2 || userJobsL2) &&
                      poChanged &&
                      j?.po !== 2 && (
                        <button name="po" onClick={(e) => onSubmit(e, i)}>
                          Save
                        </button>
                      )}
                  </small>
                </small>
              </li>
            );
          })}
        </ul>
      </li>

      <li>Artwork</li>
      <li>Printed Samples</li>
      <li>Proccesing</li>
      <li>Job Completed</li>
      <li>Delivered</li>
      <li>Payment Recieved</li>
    </ul>
  );
}
