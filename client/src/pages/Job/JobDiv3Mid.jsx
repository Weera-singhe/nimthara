import React from "react";
import Num from "../../elements/NumInput";

export default function JobDiv3Mid({
  name,
  changed,
  v,
  comp_repeat_index,
  compID,
  qts_componants,
  allPapers,
}) {
  return (
    <>
      {" "}
      {(compID === "Artwork" || compID === "Delivery") && (
        <Num
          width={80}
          changed={changed}
          name={name + "_0"}
          setTo={v?.[name + "_0"] || 0}
          deci={2}
        />
      )}
      {compID === "Plates" && (
        <>
          <select
            name={name + "_0"}
            onChange={changed}
            value={v?.[name + "_0"] || 0}
          >
            <option value={0}></option>
            <option value={1810}>Web</option>
            <option value={2400}>Plate 24x36</option>
            <option value={2200}>Plate 20x30</option>
          </select>
          <b>
            {v?.[name + "_0"].toLocaleString("en-LK", {
              style: "currency",
              currency: "LKR",
            })}
          </b>
          <b> x </b>
          <Num
            width={40}
            name={name + "_1"}
            changed={changed}
            setTo={v?.[name + "_1"] || 0}
            min={1}
            deci={0}
          />{" "}
          <b> x </b>
          <Num
            width={40}
            name={name + "_2"}
            changed={changed}
            setTo={v?.[name + "_2"] || 0}
            min={1}
            deci={0}
          />{" "}
          <b> x </b>
          <Num
            width={40}
            name={name + "_3"}
            changed={changed}
            setTo={v?.[name + "_3"] || 0}
            min={1}
            deci={0}
          />
        </>
      )}
      {compID === "Paper" && (
        <>
          <select
            name={name + "_0"}
            value={v?.[name + "_0"]}
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
          <span>
            {v?.[name + "_0"].toLocaleString("en-LK", {
              style: "currency",
              currency: "LKR",
            })}
          </span>{" "}
          <button
            type="button"
            name={name + "_1"}
            value={v?.[name + "_0"]}
            onClick={changed}
          >
            &#8594;
          </button>
          <Num
            width={80}
            changed={changed}
            name={name + "_1"}
            color={v?.[name + "_0"] !== v?.[name + "_1"] ? "red" : "black"}
            setTo={v?.[name + "_1"] || 0}
            deci={2}
          />
          <b> / </b>
          <select
            name={name + "_2"}
            value={v?.[name + "_2"]}
            onChange={changed}
          >
            <option value={500}>500</option>
            <option value={100}>100</option>
            <option value={250}>250</option>
            <option value={1000}>1000</option>
            <option value={1}>1</option>
          </select>
          <b> x (</b>
          <Num
            width={80}
            name={name + "_3"}
            changed={changed}
            setTo={v?.[name + "_3"] || 0}
            deci={0}
          />{" "}
          <b> * </b>
          <Num
            width={40}
            name={name + "_7"}
            changed={changed}
            setTo={v?.[name + "_7"] || 0}
            deci={0}
          />{" "}
          <b> / </b>
          <Num
            width={40}
            name={name + "_4"}
            changed={changed}
            setTo={v?.[name + "_4"] || 0}
            min={1}
            deci={0}
          />
          <b> + </b>
          <Num
            width={60}
            name={name + "_5"}
            changed={changed}
            setTo={v?.[name + "_5"] || 0}
            deci={0}
          />
          <b> / </b>
          <Num
            width={40}
            name={name + "_6"}
            changed={changed}
            setTo={v?.[name + "_6"] || 0}
            min={1}
            deci={0}
          />
          <b> ) </b>
        </>
      )}
      {compID === "Print" && (
        <>
          <Num
            width={80}
            name={name + "_0"}
            changed={changed}
            setTo={v?.[name + "_0"] || 0}
            deci={0}
          />
          <b> / </b>
          <Num
            width={80}
            name={name + "_1"}
            changed={changed}
            setTo={v?.[name + "_1"] || 0}
            min={1}
            deci={0}
          />
          <b> x </b>
          <Num
            width={40}
            name={name + "_2"}
            changed={changed}
            setTo={v?.[name + "_2"] || 0}
            min={1}
            max={2}
            deci={0}
          />
          <b>
            <small>=</small>
          </b>
          <small>
            <small> impressions : </small>{" "}
            {Math.round(
              (v?.[name + "_0"] / v?.[name + "_1"]) * v?.[name + "_2"]
            )}
          </small>
          <b> x </b>
          <Num
            width={40}
            name={name + "_3"}
            changed={changed}
            setTo={v?.[name + "_3"] || 0}
            min={1}
            deci={0}
          />
          <b> x </b>
          <select
            name={name + "_4"}
            value={v?.[name + "_4"]}
            onChange={changed}
          >
            <option value={1}>1</option>
            <option value={2}>2 </option>
            <option value={1.5}> 1.5</option>
            <option value={0.75}> 0.75</option>
            <option value={0.5}> 0.5</option>
            <option value={0.25}> 0.25</option>
            <option value={0.125}> 0.125</option>
          </select>
        </>
      )}
      {(compID === "Cutting" || compID === "Padding") && (
        <>
          <Num
            width={80}
            name={name + "_0"}
            changed={changed}
            setTo={v?.[name + "_0"] || 0}
            deci={0}
          />
          <b> x </b>
          <Num
            width={40}
            name={name + "_1"}
            changed={changed}
            setTo={v?.[name + "_1"] || 0}
            deci={2}
          />
        </>
      )}{" "}
      {(compID === "Perforation" || compID === "Numbering") && (
        <>
          <Num
            width={100}
            name={name + "_0"}
            changed={changed}
            setTo={v?.[name + "_0"] || 0}
            deci={2}
          />
          <b> + </b>
          <Num
            width={80}
            name={name + "_1"}
            changed={changed}
            setTo={v?.[name + "_1"] || 0}
            deci={0}
          />
          <b> x </b>
          <Num
            width={40}
            name={name + "_2"}
            changed={changed}
            setTo={v?.[name + "_2"] || 0}
            deci={2}
          />
        </>
      )}{" "}
      {compID === "Other" && (
        <>
          <Num
            width={100}
            name={name + "_0"}
            changed={changed}
            setTo={v?.[name + "_0"] || 0}
            deci={2}
            min={-Infinity}
          />
          <b> / </b>
          <Num
            width={60}
            name={name + "_1"}
            changed={changed}
            setTo={v?.[name + "_1"] || 0}
            min={1}
            deci={2}
          />
          <b> * </b>
          <Num
            width={80}
            name={name + "_2"}
            changed={changed}
            setTo={v?.[name + "_2"] || 0}
            deci={2}
            min={-Infinity}
          />
          <b> / </b>
          <Num
            width={60}
            name={name + "_3"}
            changed={changed}
            setTo={v?.[name + "_3"] || 0}
            min={1}
            deci={2}
          />
        </>
      )}
    </>
  );
}
