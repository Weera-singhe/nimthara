import React, { useEffect, useState } from "react";
import Num from "../../elements/NumInput";
import axios from "axios";
import { LEDG_Audit_API_URL } from "../../api/urls";
import { toLKR } from "../../elements/cal";
import { Link } from "react-router-dom";

export default function BidBond({ user }) {
  const [recsAll, setAllRecs] = useState([]);
  const [catAll, setAllCat] = useState([]);
  const [allAccounts, setAllAcc] = useState([]);
  const [accForm, setAccForm] = useState([]);
  const [showAddAcc, setShowAddAcc] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    axios
      .get(LEDG_Audit_API_URL)
      .then((res) => {
        setAllRecs(res.data.recsAll);
        setAllCat(res.data.catAll);
        setAllAcc(res.data.accAll);
        console.log(res.data);
      })
      .catch((err) => console.error("Error fetching papers:", err))
      .finally(() => setLoading(false));
  }, []);

  function ChangeAddAcc(e) {
    const { name, value } = e.target;
    const safeVal = value.trimStart();
    setAccForm((p) => ({ ...p, [name]: safeVal }));
  }
  function AddAcc() {
    setLoading(true);
    axios
      .post(`${LEDG_Audit_API_URL}/add_acc`, accForm)
      .then((res) => setAllAcc(res.data.accAll)) //navigate triggers fetchDB
      .catch((err) => alert("Error: " + err))
      .finally(() => {
        setLoading(false);
        setAccForm([]);
        setShowAddAcc(false);
      });
  }

  return (
    <>
      <h2>LEDGER</h2>
      <div className="framed jb">
        <Link
          onClick={() => {
            setShowAddAcc((p) => !p);
            setAccForm([]);
          }}
        >
          {showAddAcc ? "Cancle" : "Add New Account"}
        </Link>
        {showAddAcc && (
          <>
            <br />
            <br />
            <label>Name : </label>
            <input
              type="text"
              name="name"
              value={accForm.name || ""}
              onChange={ChangeAddAcc}
            />
            <label>Holder : </label>
            <input
              type="text"
              name="holder"
              value={accForm.holder || ""}
              onChange={ChangeAddAcc}
            />

            <label>Institute : </label>
            <select
              name="institute"
              value={accForm.institute || ""}
              onChange={ChangeAddAcc}
            >
              {[
                "",
                "Nimthara Printers",
                "Sampath Bank",
                "Peoples Bank",
                "Commercial Bank",
              ].map((opt, i) => (
                <option key={i} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            <label>Type : </label>
            <select
              name="type"
              value={accForm.type || ""}
              onChange={ChangeAddAcc}
            >
              {["", "Asset", "Liability", "Equity", "Income", "Expense"].map(
                (opt, i) => (
                  <option key={i} value={opt}>
                    {opt}
                  </option>
                )
              )}
            </select>
            {accForm.type &&
              accForm.name &&
              user.loggedIn &&
              user.level_audit > 2 &&
              !loading && (
                <>
                  <br />
                  <br />
                  <button onClick={AddAcc}>add</button>
                </>
              )}
            <br />
            <br />
          </>
        )}
      </div>
      <div className="framed jb">
        <label>Account : </label>
        <select>
          <option></option>
          {allAccounts.map((a) => (
            <option key={a.id} value={a.id}>{`${a?.institute || ""} ${
              a?.name || ""
            } ( ${a?.holder || ""} ) `}</option>
          ))}
        </select>
      </div>
      <div className="framed jb">
        <h4>Ledger</h4>
        {loading ? (
          "loading"
        ) : (
          <ul>
            <li>hi</li>
          </ul>
        )}
      </div>
    </>
  );
}
