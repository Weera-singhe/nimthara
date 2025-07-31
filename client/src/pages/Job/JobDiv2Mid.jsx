import React from "react";
import Num from "../../elements/NumInput";
import { toLKR } from "../../elements/cal";

export default function JobDiv2Mid({ name, changed, v, compID, allPapers }) {
  return (
    <>
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
            <option value={2530}>SORSZ special</option>
            <option value={2400}>Plate 24x36</option>
            <option value={2200}>Plate 20x30</option>
          </select>
          <b>{toLKR(v?.[name + "_0"])}</b>
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
      {compID === "Paper" &&
        (() => {
          const selectedPaper = allPapers.find(
            (p) => p.id === v?.[name + "_0"]
          );
          const latest_price = selectedPaper?.latest_price || 0;
          const input_price = v?.[name + "_1"] || 0;
          const the_unit_val = selectedPaper?.unit_val || 0;
          const input_unit_val = v?.[name + "_2"] || 1;

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
                changed={changed}
                name={name + "_1"}
                color={latest_price !== input_price ? "red" : "black"}
                setTo={input_price}
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
              />
              <b> * </b>
              <Num
                width={40}
                name={name + "_7"}
                changed={changed}
                setTo={v?.[name + "_7"] || 0}
                deci={0}
              />
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
          );
        })()}
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
            <small>
              <b> impressions : </b>
            </small>
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
            deci={2}
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
            <option value={3}>3</option>
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
          />{" "}
          <b> * </b>
          <Num
            width={80}
            name={name + "_2"}
            changed={changed}
            setTo={v?.[name + "_2"] || 0}
            deci={2}
            min={-Infinity}
          />
          <b> * </b>{" "}
          <Num
            width={60}
            name={name + "_4"}
            changed={changed}
            setTo={v?.[name + "_4"] || 0}
            min={0.01}
            deci={2}
          />{" "}
          <b> * </b>{" "}
          <Num
            width={60}
            name={name + "_5"}
            changed={changed}
            setTo={v?.[name + "_5"] || 0}
            min={0.01}
            deci={2}
          />
          <b> / </b>
          <Num
            width={60}
            name={name + "_1"}
            changed={changed}
            setTo={v?.[name + "_1"] || 0}
            min={0.01}
            deci={2}
          />
          <b> / </b>
          <Num
            width={60}
            name={name + "_3"}
            changed={changed}
            setTo={v?.[name + "_3"] || 0}
            min={0.01}
            deci={2}
          />
        </>
      )}
    </>
  );
}
