// import React, { useEffect, useState } from "react";
// import Num from "../elements/NumInput";
// import axios from "axios";
// import { Price_API_URL, ADD_Price_API_URL } from "../api/urls";
// import { useLocation } from "react-router-dom";
// import { toLKR } from "../elements/cal";

// export default function Price({ user }) {
//   const [newRecForm, setNewRecForm] = useState({ id: "", from: "", price: 0 });
//   const [allPapersData, setAllPapersData] = useState([]);
//   const [selectedRecs, setSelectedRecs] = useState([]);
//   const [serverLoading, isSeverLoading] = useState(true);

//   const location = useLocation();

//   const changedNum = ({ target: { name, value } }) =>
//     setNewRecForm((p) => ({ ...p, [name]: Number(value) }));
//   const changedStr = ({ target: { name, value } }) =>
//     setNewRecForm((p) => ({ ...p, [name]: value.trim() }));

//   const changeSelected = (id) => {
//     isSeverLoading(true);
//     axios
//       .get(`${Price_API_URL}?id=${id}`)
//       .then((res) => {
//         setSelectedRecs(res.data.recs);
//       })
//       .finally(() => isSeverLoading(false));
//   };

//   const newPriceRecord = (e) => {
//     e.preventDefault();
//     isSeverLoading(true);

//     if (!user.loggedIn) return (window.location.href = "/login");
//     if (user.level_paper < 2) return (window.location.href = "/");

//     axios
//       .post(ADD_Price_API_URL, newRecForm)
//       .then((res) => {
//         setSelectedRecs(res.data.recs);
//         setNewRecForm((p) => ({ ...p, price: 0 }));
//       })
//       .finally(() => isSeverLoading(false));
//   };

//   useEffect(() => {
//     axios
//       .get(Price_API_URL)
//       .then((res) => {
//         setAllPapersData(res.data.eachpaper);
//       })
//       .finally(() => {
//         const id = new URLSearchParams(location.search).get("id");
//         const safeID = Number(id);
//         if (id) {
//           setNewRecForm((p) => ({ ...p, id: safeID }));
//           changeSelected(safeID);
//         } else {
//           isSeverLoading(false);
//         }
//       });
//   }, [location.search]);

//   const fromDate = new Date(newRecForm.from);
//   const disableBtn =
//     !user.loggedIn ||
//     user.level_paper < 2 ||
//     !newRecForm.id ||
//     !newRecForm.price ||
//     isNaN(fromDate) ||
//     fromDate.getFullYear() < 2020;

//   return (
//     <div>
//       {user?.loggedIn && (
//         <>
//           <div className="new-division">
//             <div className="formbox">
//               {serverLoading ? (
//                 "loading..........."
//               ) : (
//                 <form onSubmit={newPriceRecord}>
//                   <select
//                     name="id"
//                     value={newRecForm.id}
//                     onChange={(e) => {
//                       changedNum(e);
//                       changeSelected(Number(e.target.value));
//                     }}
//                   >
//                     <option></option>
//                     {allPapersData.map((p) => (
//                       <option key={p.id} value={p.id}>
//                         {`  ${p.name} - ${p.unit_val}${
//                           p.unit === "sheets" && p.unit_val === 1
//                             ? "sheet"
//                             : p.unit
//                         }  `}
//                       </option> //if one sheet,many sheets
//                     ))}
//                   </select>
//                   <span className="gap3"></span>
//                   <label>effects from : </label>
//                   <input
//                     name="from"
//                     type="datetime-local"
//                     onChange={changedStr}
//                   />

//                   <span className="gap3">LKR </span>
//                   <Num
//                     width={100}
//                     name="price"
//                     changed={changedNum}
//                     min={0}
//                     max={500000}
//                     deci={2}
//                     setTo={newRecForm.price}
//                   />
//                   <span className="gap3"></span>
//                   <button
//                     disabled={disableBtn}
//                     type="submit"
//                     style={{ marginLeft: "1em" }}
//                   >
//                     Add New Price Record
//                   </button>
//                 </form>
//               )}
//             </div>
//           </div>
//           <ul>
//             {serverLoading
//               ? "loading..."
//               : selectedRecs.map((r, i) => (
//                   <li key={i}>{`${r.date_} = ${toLKR(r.price)}`}</li>
//                 ))}
//           </ul>
//         </>
//       )}
//     </div>
//   );
// }
