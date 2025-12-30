// import React, { useEffect, useState } from "react";
// import Num from "../elements/NumInput";
// import axios from "axios";
// import { Stock_API_URL, ADD_Stock_API_URL } from "../api/urls";
// import { data, useLocation } from "react-router-dom";
// import useCurrentTime from "../elements/useCurrentTime";

// export default function Price({ user }) {
//   const [newRec, setNewRec] = useState({
//     date: "", //
//     direction: -1, //
//     record_VAT: true, //
//   });
//   const [loadedPapers, loadPapers] = useState([]);
//   const [loadedClients, loadClients] = useState([]);
//   const [loadedBooks, loadBooks] = useState([]);
//   const [selectedUnits, setSelectedUnits] = useState([]);
//   const [selectedRecs, setSelectedRecs] = useState([]);
//   const [serverLoading, isSeverLoading] = useState(false);
//   const [priceForDate, setPriceForDate] = useState(0);

//   const location = useLocation();
//   const currentTime = useCurrentTime();

//   const vatRate = 18;
//   let runningStock = 0;

//   const changedNum = ({ target: { name, value } }) =>
//     setNewRec((p) => ({ ...p, [name]: Number(value) }));
//   const changedStr = ({ target: { name, value } }) =>
//     setNewRec((p) => ({ ...p, [name]: value.trim() }));
//   const changedCheck = ({ target: { name, checked } }) =>
//     setNewRec((p) => ({ ...p, [name]: checked }));

//   const changeRecId = ({ target: { name, value } }) => {
//     const shortDate = new Date().toISOString().slice(2, 10).replace(/-/g, "");
//     setNewRec((p) => ({
//       ...p,
//       invoice_id: shortDate + String(value).padStart(6, "0"),
//       [name]: Number(value),
//     }));
//   };

//   const changeSelected = (id) => {
//     isSeverLoading(true);
//     const paper = loadedPapers.find((p) => p.id === id);
//     const date = newRec.date;
//     axios
//       .get(`${Stock_API_URL}?id=${id}&date=${date}`)
//       .then((res) => {
//         setSelectedRecs(res.data.recs);
//         setPriceForDate(res.data.priceForDate);
//         setSelectedUnits({
//           unit: paper?.unit || "",
//           unit_val: paper?.unit_val || 1,
//         });
//       })
//       .finally(() => isSeverLoading(false));
//   };

//   const newStockRecord = (e) => {
//     e.preventDefault();
//     isSeverLoading(true);

//     if (!user.loggedIn) return (window.location.href = "/login");
//     console.log(newRec);

//     axios
//       .post(ADD_Stock_API_URL, newRec)
//       .then((res) => {
//         setSelectedRecs(res.data.recs);
//         setNewRec((p) => ({
//           ...p,
//           invoice_id: "", //
//           invoice_suffix: 0, //
//           date: "", //
//           des: "", //
//           stock_change: 0, //
//         }));
//       })
//       .finally(() => isSeverLoading(false));
//   };

//   useEffect(() => {
//     axios.get(Stock_API_URL).then((res) => {
//       loadPapers(res.data.papers);
//       loadClients(res.data.c);
//       loadBooks(res.data.books);

//       const id = new URLSearchParams(location.search).get("id");
//       if (id) {
//         setNewRec((p) => ({ ...p, id }));
//         changeSelected(id);
//       } else {
//         isSeverLoading(false);
//       }
//     });
//   }, [location.search]);

//   useEffect(() => {
//     if (newRec.date && newRec.rec_id) {
//       changeSelected(newRec.rec_id);
//     }
//   }, [newRec.date]);

//   const recDate = new Date(newRec.date);
//   const net_val =
//     (priceForDate / selectedUnits.unit_val) * newRec.stock_change || 0;
//   const vat_amount = (net_val * vatRate) / 100;

//   const disableBtn =
//     serverLoading ||
//     !newRec.invoice_suffix ||
//     !newRec.date ||
//     recDate.getFullYear() < 2020 ||
//     !newRec.rec_id ||
//     !net_val;
//   return (
//     <div>
//       {user?.loggedIn && (
//         <>
//           <div className="new-division">
//             <div className="boxyy book">
//               <h3>Create a New Record</h3>

//               <form onSubmit={newStockRecord}>
//                 <label>invoice id : </label>
//                 {newRec.invoice_id}
//                 <Num
//                   width={80}
//                   name="invoice_suffix"
//                   deci={0}
//                   min={0}
//                   max={999999}
//                   plain={true}
//                   changed={changeRecId}
//                   setTo={newRec.invoice_suffix}
//                 />
//                 <label>date : </label>
//                 <input
//                   name="date"
//                   type="date"
//                   onChange={changedStr}
//                   value={newRec.date}
//                 />
//                 <div></div>
//                 <label>note : </label>
//                 <input
//                   type="text"
//                   onChange={changedStr}
//                   name="des"
//                   style={{ width: "400px" }}
//                   value={newRec.des || ""}
//                 />
//                 <select
//                   name="direction"
//                   onChange={(e) => {
//                     changedNum(e);
//                   }}
//                 >
//                   <option value={-1}>SELL</option>
//                   <option value={1}>PURCHASED</option>
//                 </select>
//                 <div></div>
//                 <label>quantity : </label>
//                 <Num
//                   width={100}
//                   name="stock_change"
//                   changed={changedNum}
//                   setTo={newRec.stock_change}
//                   min={0}
//                   deci={0}
//                 />
//                 <b>
//                   {Math.trunc(newRec.stock_change / selectedUnits.unit_val) ||
//                     0}
//                   /{newRec.stock_change % selectedUnits.unit_val || 0}
//                 </b>
//                 <select
//                   name="rec_id"
//                   value={newRec.rec_id}
//                   onChange={(e) => {
//                     changedStr(e);
//                     changeSelected(e.target.value);
//                   }}
//                 >
//                   <option></option>
//                   {loadedPapers.map((p) => (
//                     <option key={p.id} value={p.id}>
//                       {p.name}
//                     </option>
//                   ))}
//                 </select>
//                 <div></div>
//                 <b>
//                   {net_val.toLocaleString("en-LK", {
//                     style: "currency",
//                     currency: "LKR",
//                   })}
//                 </b>
//                 <select
//                   style={{ margin: "0" }}
//                   name="change_val_dir"
//                   onChange={changedNum}
//                 >
//                   <option value=""></option>
//                   <option value={-1}>-</option>
//                   <option value={+1}>+</option>
//                 </select>
//                 {newRec.change_val_dir ? <Num /> : ""}
//                 <small>
//                   <b>
//                     +
//                     {vat_amount.toLocaleString(undefined, {
//                       minimumFractionDigits: 2,
//                       maximumFractionDigits: 2,
//                     })}{" "}
//                     VAT
//                   </b>
//                 </small>
//                 <b>
//                   {" "}
//                   ={" "}
//                   {(vat_amount + net_val).toLocaleString("en-LK", {
//                     style: "currency",
//                     currency: "LKR",
//                   })}
//                 </b>
//                 <select>
//                   {loadedBooks.map((p) => (
//                     <option key={p.id} value={p.id}>
//                       {p.book_name}
//                     </option>
//                   ))}
//                 </select>
//                 <div></div>
//                 <label>record vat : </label>
//                 <input
//                   type="checkbox"
//                   name="record_VAT"
//                   onChange={changedCheck}
//                   checked={newRec.record_VAT || false}
//                 />
//                 {newRec.record_VAT && (
//                   <>
//                     <label>
//                       {newRec.direction === -1 ? "buyer" : "supplier"} :{" "}
//                     </label>
//                     <select onChange={changedNum} name="client_id">
//                       <option value={0}></option>
//                       {loadedClients
//                         .filter((c) =>
//                           newRec.direction === -1
//                             ? c.is_buyer === true
//                             : c.is_supplier === true
//                         )
//                         .map((c) => (
//                           <option key={c.id} value={c.id}>
//                             {c.client_name} - {c.vat_id}
//                           </option>
//                         ))}
//                     </select>
//                   </>
//                 )}
//                 <div></div>
//                 <br />
//                 by
//                 <b>{user.display_name}</b>on
//                 <b> {currentTime}</b>
//                 <button
//                   type="submit"
//                   style={{ marginLeft: "1em" }}
//                   disabled={disableBtn}
//                 >
//                   Add New Record
//                 </button>{" "}
//               </form>
//             </div>
//           </div>
//           <div className="new-division">
//             <select
//               name="rec_id"
//               value={newRec.rec_id}
//               onChange={(e) => {
//                 changedStr(e);
//                 changeSelected(e.target.value);
//               }}
//             >
//               <option></option>
//               {loadedPapers.map((p) => (
//                 <option key={p.id} value={p.id}>
//                   {p.name}
//                 </option>
//               ))}
//             </select>

//             <div className="new-division">
//               {selectedRecs.map((r, i) => {
//                 runningStock += Number(r.change);
//                 return (
//                   <div key={i}>
//                     <div className="boxyy" style={{ width: "7%" }}>
//                       {r.date_}
//                     </div>
//                     <div
//                       className="boxyy"
//                       style={{ width: "6%", textAlign: "right" }}
//                     >
//                       {r.change < 0 ? "-" : "+"}
//                       {Math.abs(r.change).toLocaleString()}
//                     </div>
//                     <div className="boxyy" style={{ width: "10%" }}>
//                       {r.change < 0 ? "-" : "+"}
//                       <b>
//                         {Math.trunc(
//                           Math.abs(r.change) / selectedUnits.unit_val
//                         )}{" "}
//                         / {Math.abs(r.change) % selectedUnits.unit_val}
//                       </b>
//                     </div>
//                     <div className="boxyy" style={{ width: "30%" }}>
//                       {r.des}
//                     </div>
//                     <div
//                       className="boxyy"
//                       style={{ width: "7%", textAlign: "right" }}
//                     >
//                       {runningStock < 0 ? "-" : "+"}
//                       {Math.abs(runningStock).toLocaleString()}
//                     </div>
//                     <div className="boxyy" style={{ width: "10%" }}>
//                       {runningStock < 0 ? "-" : "+"}
//                       <b>
//                         {Math.trunc(
//                           Math.abs(runningStock) / selectedUnits.unit_val
//                         )}{" "}
//                         / {Math.abs(runningStock) % selectedUnits.unit_val}
//                       </b>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }
