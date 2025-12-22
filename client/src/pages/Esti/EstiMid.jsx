import React, { useEffect } from "react";
import Num from "../../elements/Num";
import { toLKR } from "../../elements/cal";
import { onNUM_N } from "../../elements/HandleChange";
import { Typography } from "@mui/material";

export default function EstiMid({ name, changed, v, compID, allPapers }) {
  useEffect(() => {
    //console.log("lets load defs");

    if (compID === "Print" && v?.[name + "_4"] == null)
      changed({ target: { name: name + "_4", value: 1 } });

    if (compID === "Paper" && v?.[name + "_2"] == null)
      changed({ target: { name: name + "_2", value: 500 } });
  }, []);
  return (
    <>
      {(compID === "Artwork" || compID === "Delivery") && (
        <Num
          onChange={changed}
          name={name + "_0"}
          value={v?.[name + "_0"]}
          deci={2}
        />
      )}
      {compID === "Plates" && (
        <>
          <Num name={name + "_0"} onChange={changed} value={v?.[name + "_0"]} />
          <b> x </b>
          <Num
            width={60}
            name={name + "_1"}
            onChange={changed}
            value={v?.[name + "_1"]}
            def={1}
            deci={0}
          />
          <b> x </b>
          <Num
            width={60}
            name={name + "_2"}
            onChange={changed}
            value={v?.[name + "_2"]}
            def={1}
            deci={0}
          />
          <b> x </b>
          <Num
            width={60}
            name={name + "_3"}
            onChange={changed}
            value={v?.[name + "_3"]}
            def={1}
            //  min={1}
            deci={0}
          />
        </>
      )}

      {compID === "Print" && (
        <>
          <Num
            name={name + "_0"}
            onChange={changed}
            value={v?.[name + "_0"]}
            deci={0}
          />
          <b> / </b>
          <Num
            width={60}
            name={name + "_1"}
            onChange={changed}
            value={v?.[name + "_1"]}
            deci={0}
            def={1}
          />
          <b> x </b>
          <Num
            width={60}
            name={name + "_2"}
            onChange={changed}
            value={v?.[name + "_2"]}
            max={2}
            deci={0}
            def={1}
          />
          <b>
            <small>=</small>
          </b>
          <small>
            <small>
              <b> impressions : </b>
            </small>
            {Math.round(
              (v?.[name + "_0"] / v?.[name + "_1"]) * v?.[name + "_2"]
            )}
          </small>
          <b> x </b>
          <Num
            width={60}
            name={name + "_3"}
            onChange={changed}
            value={v?.[name + "_3"]}
            def={1}
            deci={2}
          />
          <b> x </b>
          <select
            name={name + "_4"}
            value={v?.[name + "_4"]}
            onChange={changed}
            onLoadedData={changed}
          >
            <option value={1}>1</option>
            <option value={2}>2 </option>
            <option value={1.5}> 1.5</option>
            <option value={0.75}> 0.75</option>
            <option value={0.5}> 0.5</option>
            <option value={0.25}> 0.25</option>
            <option value={0.125}> 0.125</option>
            <option value={3}>3</option>
          </select>
        </>
      )}

      {(compID === "Cutting" || compID === "Padding") && (
        <>
          <Num
            name={name + "_0"}
            onChange={changed}
            value={v?.[name + "_0"]}
            deci={0}
          />
          <b> x </b>
          <Num
            width={60}
            name={name + "_1"}
            onChange={changed}
            value={v?.[name + "_1"]}
            deci={2}
            def={1}
          />
        </>
      )}
      {(compID === "Perforation" || compID === "Numbering") && (
        <>
          <Num
            width={100}
            name={name + "_0"}
            onChange={changed}
            value={v?.[name + "_0"]}
            deci={2}
          />
          <b> + </b>
          <Num
            width={80}
            name={name + "_1"}
            onChange={changed}
            value={v?.[name + "_1"]}
            deci={0}
          />
          <b> x </b>
          <Num
            width={60}
            name={name + "_2"}
            onChange={changed}
            value={v?.[name + "_2"]}
            deci={2}
            def={1}
          />
        </>
      )}

      {compID === "Other" && (
        <>
          <Num
            name={name + "_0"}
            onChange={changed}
            value={v?.[name + "_0"]}
            deci={2}
            min={-Infinity}
            def={1}
          />
          <b> * </b>
          <Num
            name={name + "_2"}
            onChange={changed}
            value={v?.[name + "_2"]}
            deci={2}
            min={-Infinity}
            def={1}
          />
          <b> * </b>
          <Num
            width={60}
            name={name + "_4"}
            onChange={changed}
            value={v?.[name + "_4"]}
            deci={2}
            def={1}
          />
          <b> * </b>
          <Num
            width={60}
            name={name + "_5"}
            onChange={changed}
            value={v?.[name + "_5"]}
            deci={2}
            def={1}
          />
          <b> / </b>
          <Num
            name={name + "_1"}
            onChange={changed}
            value={v?.[name + "_1"]}
            def={1}
            deci={2}
          />
          <b> / </b>
          <Num
            width={60}
            name={name + "_3"}
            onChange={changed}
            value={v?.[name + "_3"]}
            def={1}
            deci={2}
          />
        </>
      )}
      {compID === "Paper" &&
        (() => {
          const selectedPaper = allPapers.find(
            (p) => p.id === v?.[name + "_0"]
          );
          const latest_price = selectedPaper?.latest_price || 0;
          const input_price = v?.[name + "_1"] || 0;
          const the_unit_val = selectedPaper?.unit_val || 0;
          const input_unit_val = v?.[name + "_2"] || 1;
          const ppqty1 =
            (v?.[name + "_3"] * v?.[name + "_7"]) / v?.[name + "_4"];
          const ppqty2 = v?.[name + "_5"] / v?.[name + "_6"];
          const ppqty = Math.ceil(ppqty1 + ppqty2);

          return (
            <>
              <select
                name={name + "_0"}
                value={v?.[name + "_0"]}
                onChange={changed}
                style={{ width: "30%", fontSize: "smaller" }}
              >
                <option value={0}></option>
                {allPapers.map((p, i) => (
                  <option key={i} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <small>
                <b>{toLKR(latest_price)}</b>
              </small>
              <button
                type="button"
                onClick={() => {
                  if (!selectedPaper) return;
                  changed({
                    target: {
                      name: name + "_1",
                      value: latest_price,
                    },
                  });
                  changed({
                    target: {
                      name: name + "_2",
                      value: the_unit_val,
                    },
                  });
                }}
              >
                &#8594;
              </button>
              <Num
                width={80}
                onChange={changed}
                name={name + "_1"}
                color={latest_price !== input_price ? "red" : "black"}
                value={input_price}
                deci={2}
              />
              <b> / </b>
              <select
                name={name + "_2"}
                value={v?.[name + "_2"]}
                onChange={changed}
                style={{
                  color: the_unit_val !== input_unit_val ? "red" : "black",
                }}
              >
                <option value={500}>500</option>
                <option value={100}>100</option>
                <option value={250}>250</option>
                <option value={125}>125</option>
                <option value={1000}>1000</option>
                <option value={1}>1</option>
              </select>
              <b> x (</b>
              <Num
                name={name + "_3"}
                onChange={changed}
                value={v?.[name + "_3"]}
                deci={0}
              />
              <b> * </b>
              <Num
                width={60}
                name={name + "_7"}
                onChange={changed}
                value={v?.[name + "_7"]}
                deci={0}
                def={1}
              />
              <b> / </b>
              <Num
                width={60}
                name={name + "_4"}
                onChange={changed}
                value={v?.[name + "_4"]}
                deci={0}
                def={1}
              />
              <b> + </b>
              <Num
                width={70}
                name={name + "_5"}
                onChange={changed}
                value={v?.[name + "_5"]}
                deci={0}
              />
              <b> / </b>
              <Num
                width={60}
                name={name + "_6"}
                onChange={changed}
                value={v?.[name + "_6"]}
                deci={0}
                def={1}
              />
              <b> ) </b>
              <small>
                <b>{`[ ${ppqty.toLocaleString()} ]`}</b>
              </small>
            </>
          );
        })()}
    </>
  );
}
