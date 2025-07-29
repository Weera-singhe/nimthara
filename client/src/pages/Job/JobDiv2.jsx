import React, { useMemo, useEffect, useState } from "react";
import Num from "../../elements/NumInput";
import JobDiv2Mid from "./JobDiv2Mid";
import JobDiv2Right from "./JobDiv2Right";
import { SumEachRowTotal, toLKR } from "../../elements/cal";

function JobDiv2({ qts_componants, detailsDB, handleSubmit, allPapers }) {
  const [detailsTemp, setDetailsTemp] = useState(detailsDB);
  const [isDirty, setIsDirty] = useState(false);

  function NumChanged(e, arrayy) {
    setIsDirty(true);
    const { name, value } = e.target;
    setDetailsTemp((p) =>
      arrayy
        ? {
            ...p,
            [arrayy]: {
              ...(p[arrayy] || {}),
              [name]: Number(value),
            },
          }
        : { ...p, [name]: Number(value) }
    );
  }

  function strChanged(e, arrayy) {
    setIsDirty(true);
    const { name, value } = e.target;
    setDetailsTemp((p) =>
      arrayy
        ? {
            ...p,
            [arrayy]: {
              ...(p[arrayy] || {}),
              [name]: value,
            },
          }
        : { ...p, [name]: value }
    );
  }
  const totalSum = useMemo(
    () =>
      SumEachRowTotal(qts_componants, detailsTemp.v, detailsTemp.loop_count),
    [qts_componants, detailsTemp.v, detailsTemp.loop_count]
  );

  const { unit_price, total_price, unit_vat, total_vat } = useMemo(() => {
    const unitCount = detailsTemp.unit_count || 1;
    const profit = detailsTemp.profit || 0;
    const base = totalSum + profit;
    const unit = +(base / unitCount).toFixed(2);
    const total = +(unit * unitCount).toFixed(2);
    const vatRate = 1.18;

    return {
      unit_price: unit,
      total_price: total,
      unit_vat: +(unit * vatRate).toFixed(2),
      total_vat: +(total * vatRate).toFixed(2),
    };
  }, [totalSum, detailsTemp.profit, detailsTemp.unit_count]);

  useEffect(() => {
    setDetailsTemp(detailsDB);
  }, [detailsDB]);

  function onSubmit(e) {
    e.preventDefault();
    handleSubmit?.(e.nativeEvent, detailsTemp);
  }

  return (
    <div>
      <br />
      <br />
      <form onSubmit={onSubmit}>
        <label>Total Units: </label>
        <Num
          name={"unit_count"}
          min={1}
          setTo={detailsTemp.unit_count}
          changed={NumChanged}
          width={100}
          deci={0}
        />
        <span className="needgap" />
        <label>Total Items: </label>
        <Num
          name={"item_count"}
          min={1}
          setTo={detailsTemp.item_count}
          changed={NumChanged}
          width={100}
          deci={0}
        />
        <br />
        <br />
        <div></div>
        {/*checkboxex*/}
        {qts_componants.map((comp) => (
          <div key={comp.id} className="boxyy">
            <label>{comp.name} : </label>
            <Num
              name={comp.name}
              setTo={detailsTemp.loop_count?.[comp.name] || 0}
              changed={(e) => NumChanged(e, "loop_count")}
              width={30}
              max={comp.max}
              deci={0}
            />
          </div>
        ))}
        <br />
        <br />
        {qts_componants.map((comp) => (
          <div key={comp.id}>
            {Array.from({
              length: detailsTemp.loop_count?.[comp.name] || 0,
            }).map((_, compRepeated_i) => (
              <div key={compRepeated_i}>
                {/* ///////LEFT//////// */}
                <div className="boxyy" style={{ width: "8%" }}>
                  {comp.name === "Other" ? (
                    <input
                      type="text"
                      name={`Other_${compRepeated_i}`}
                      value={
                        detailsTemp.notes_other?.[`Other_${compRepeated_i}`]
                      }
                      style={{ width: "100%" }}
                      onChange={(e) => strChanged(e, "notes_other")}
                    />
                  ) : (
                    comp.name
                  )}
                </div>

                {/* ///////MIDDLE//////// */}
                <div className="boxyy" style={{ width: "80%" }}>
                  <JobDiv2Mid
                    name={`${comp.name}_${compRepeated_i}`}
                    changed={(e) => NumChanged(e, "v")}
                    changedStr={(e) => strChanged(e, "v")}
                    v={detailsTemp.v}
                    compID={comp.name}
                    allPapers={allPapers}
                  />
                </div>

                {/* ///////RIGHT//////// */}
                <div className="boxyy" style={{ width: "10%" }}>
                  <JobDiv2Right
                    name={`${comp.name}_${compRepeated_i}`}
                    v={detailsTemp.v}
                    compID={comp.name}
                    min_cal_res={comp.min_cal_res}
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
        <br />
        <br />
        <h5 style={{ display: "inline-block", marginRight: "3%" }}>
          Total Cost: {toLKR(totalSum)}
        </h5>{" "}
        <Num
          name={"profit"}
          setTo={detailsTemp.profit || 0}
          changed={NumChanged}
          width={100}
          deci={2}
        />
        <b>||</b>
        <Num
          name={"profit"}
          setTo={(detailsTemp.profit / totalSum) * 100 || 0}
          width={70}
          deci={2}
          changed={(e) => {
            const percent = Number(e.target.value);
            const profit = (totalSum / 100) * percent;
            NumChanged({
              target: {
                name: "profit",
                value: profit,
              },
            });
          }}
        />
        <b>%</b>
        <h3>
          <small>
            <small> Total Price: </small>{" "}
          </small>
          {toLKR(total_price)}
          <small style={{ marginLeft: "2%" }}>
            <small> Unit Price: </small>{" "}
          </small>
          {toLKR(unit_price)}
          <small style={{ marginLeft: "4%" }}>
            <small> Total +VAT: </small>{" "}
          </small>
          {toLKR(total_vat)}
          <small style={{ marginLeft: "2%" }}>
            <small> Unit +VAT: </small>
          </small>
          {toLKR(unit_vat)}
        </h3>
        <button type="submit" disabled={!isDirty}>
          Update
        </button>
        {detailsTemp.deployed ? (
          <small style={{ marginLeft: "1%", color: "green" }}> deployed</small>
        ) : (
          <button
            type="submit"
            disabled={isDirty || !detailsTemp.created_by}
            name="dep"
            style={{ marginLeft: "1%" }}
          >
            Deploy
          </button>
        )}
      </form>
    </div>
  );
}
export default React.memo(JobDiv2);
