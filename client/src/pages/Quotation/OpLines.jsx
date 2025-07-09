import React, { useEffect, useState } from "react";
import Num from "../../elements/NumInput";

function NumStr(i) {
  return Number(i).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function OpLines({ name, calTotal, allPapers = [] }) {
  const arr =
    name === "Plates"
      ? { v1: 2400, v2: 1, v3: 0, v4: 0, v5: 0, v6: 0, v7: 0 }
      : name === "Papers"
      ? { v1: 0, v2: 0, v3: 500, v4: 0, v5: 1, v6: 0, v7: 1 }
      : name === "Print"
      ? { v1: 2000, v2: 1, v3: 1, v4: 1, v5: 1, v6: 1, v7: 1 }
      : name === "Cutting" || name === "Padding"
      ? { v1: 0, v2: 1, v3: 0, v4: 0, v5: 0, v6: 0, v7: 0 }
      : { v1: 0, v2: 0, v3: 0, v4: 0, v5: 0, v6: 0, v7: 0 };
  const [v, setVal] = useState(arr);

  function changed(e) {
    const { name, value } = e.target;
    setVal((p) => {
      return {
        ...p,
        [name]: Number(value),
      };
    });
  }
  const minSum =
    name === "Print"
      ? 2000 * v.v4
      : name === "Padding" || name === "Delivery" || name === "Cutting"
      ? 1000
      : 0;

  const sum =
    name === "Artwork" || name === "Other" || name === "Delivery"
      ? v.v1
      : name === "Plates" || name === "Padding" || name === "Cutting"
      ? v.v1 * v.v2
      : name === "Papers"
      ? (v.v2 / v.v3) * (v.v4 / v.v5 + v.v6 / v.v7) || 0
      : name === "Print"
      ? (v.v1 / v.v2) * v.v3 * v.v4 * v.v5
      : 0;

  useEffect(() => {
    calTotal(minSum > sum ? minSum : sum);
    //console.log(v);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v]);

  return (
    <>
      {name === "Other" ? (
        <div className="boxy" style={{ width: "10%" }}>
          <input className="wid80" />
        </div>
      ) : (
        <div className="boxy" style={{ width: "10%" }}>
          {name}
        </div>
      )}
      <div className="boxy" style={{ width: "70%" }}>
        {(name === "Artwork" || name === "Other" || name === "Delivery") && (
          <>
            <Num width={80} changed={changed} name={"v1"} />
          </>
        )}
        {name === "Plates" && (
          <>
            <select name="v1" onChange={changed}>
              <option value={2400}>Plate 24x36</option>
              <option value={2200}>Plate 20x30</option>
            </select>
            <small> LKR {Number(v.v1).toLocaleString()} </small>
            <b> x </b>
            <input
              type="number"
              className="wid40"
              name="v2"
              onChange={changed}
              defaultValue={1}
            />
          </>
        )}
        {name === "Papers" && (
          <>
            <select
              name="v1"
              onChange={changed}
              style={{ width: "30%", fontSize: "smaller" }}
            >
              <option value={0}></option>
              {allPapers.map((p, i) => (
                <option key={i} value={p.latest_price}>
                  {p.name}
                </option>
              ))}
            </select>
            <small>
              <small> LKR {Number(v.v1).toLocaleString()} </small>
            </small>
            <button name="v2" value={v.v1} onClick={changed}>
              &#8594;
            </button>
            <Num
              width={80}
              changed={changed}
              name={"v2"}
              color={v.v1 !== v.v2 ? "red" : "black"}
              setTo={v.v2}
            />
            <b> / </b>
            <select name="v3" onChange={changed}>
              <option value={500}>500</option>
              <option value={100}>100</option>
              <option value={250}>250</option>
              <option value={1000}>1000</option>
              <option value={1}>1</option>
            </select>
            <b> x ( </b>
            <Num width={100} changed={changed} name={"v4"} /> <b> / </b>
            <input
              type="number"
              className="wid40"
              name="v5"
              onChange={changed}
              defaultValue={1}
            />
            <b> + </b>
            <Num width={70} changed={changed} name={"v6"} />
            <b> / </b>
            <input
              type="number"
              className="wid40"
              name="v7"
              onChange={changed}
              defaultValue={1}
            />
            <b> ) </b>
          </>
        )}
        {name === "Print" && (
          <>
            <Num width={80} changed={changed} name={"v1"} defVal={2000} />

            <b> / </b>
            <input
              type="number"
              className="wid40"
              name="v2"
              onChange={changed}
              defaultValue={1}
            />
            <b> x </b>
            <input
              type="number"
              className="wid40"
              name="v3"
              onChange={changed}
              defaultValue={1}
            />
            <b>
              <small>=</small>
            </b>
            <small>
              <small> impressions : </small> {(v.v1 / v.v2) * v.v3}
            </small>

            <b> x </b>
            <input
              type="number"
              className="wid40"
              name="v4"
              onChange={changed}
              defaultValue={1}
            />
            <b> x </b>

            <select name="v5" onChange={changed}>
              <option value={1}>1</option>
              <option value={2}>2 </option>
              <option value={1.5}> 1.5</option>
              <option value={0.5}> 0.5</option>
              <option value={0.25}> 0.25</option>
            </select>
          </>
        )}
        {(name === "Padding" || name === "Cutting") && (
          <>
            <Num width={90} changed={changed} name={"v1"} />
            <b>x</b>
            <Num width={60} changed={changed} name={"v2"} defVal={1} />
          </>
        )}
      </div>
      <div
        className="boxy"
        style={{
          width: "10%",
          color: minSum > sum ? "red" : "black",
          textAlign: "right",
        }}
      >
        {NumStr(minSum > sum ? minSum : sum)}
      </div>
      <br />
    </>
  );
}
export default OpLines;
