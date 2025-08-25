import React, { useMemo, useEffect, useState } from "react";
import Num from "../../elements/NumInput";
import JobDiv2Mid from "./JobDiv2Mid";
import JobDiv2Right from "./JobDiv2Right";
import { SumsEachQuot, toLKR } from "../../elements/cal";

function JobDiv2({
  qts_componants,
  eachJDB,
  handleSubmit,
  allPapers,
  displayID,
  loopIndex,
  loading,
}) {
  const [detailsTemp, setDetailsTemp] = useState([]);
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
    const safeVal = name === "cus_id_each" ? value.trim() : value;
    setDetailsTemp((p) =>
      arrayy
        ? {
            ...p,
            [arrayy]: {
              ...(p[arrayy] || {}),
              [name]: safeVal,
            },
          }
        : { ...p, [name]: safeVal }
    );
  }
  const { unit_price, the_sum, total_price } = useMemo(
    () => SumsEachQuot(qts_componants, detailsTemp),
    [qts_componants, detailsTemp]
  );

  useEffect(() => {
    setDetailsTemp(eachJDB);
    setIsDirty(false);
  }, [eachJDB]);

  useEffect(() => {
    console.log(detailsTemp);
  }, [detailsTemp]);

  function onSubmit(e) {
    e.preventDefault();
    const submitter = e.nativeEvent.submitter?.name;
    handleSubmit?.(submitter, detailsTemp);
  }

  return (
    <div style={{ backgroundColor: isDirty && "azure" }}>
      {`Quotation ${displayID}_${detailsTemp.cus_id_each || loopIndex + 1}`}
      {!loading && (
        <input
          type="text"
          style={{ width: "2%", marginLeft: "2%" }}
          name="cus_id_each"
          onChange={strChanged}
        />
      )}
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
                <div className="boxyy compact" style={{ width: "80%" }}>
                  <JobDiv2Mid
                    name={`${comp.name}_${compRepeated_i}`}
                    changed={(e) => NumChanged(e, "v")}
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
        <h5 style={{ display: "inline-block", marginRight: "2%" }}>
          Total Cost: {toLKR(the_sum)} <b> + </b>
        </h5>
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
          setTo={(detailsTemp.profit / the_sum) * 100 || 0}
          width={70}
          deci={2}
          changed={(e) => {
            const percent = Number(e.target.value);
            const profit = (the_sum / 100) * percent;
            NumChanged({
              target: {
                name: "profit",
                value: profit,
              },
            });
          }}
        />
        <b>%</b>
        <small style={{ marginLeft: "3%" }}>
          <small> Total Price: </small>{" "}
        </small>
        {toLKR(total_price)}
        <small style={{ marginLeft: "2%" }}>
          <small> Unit Price: </small>{" "}
        </small>
        {toLKR(unit_price)}
        <br />

        <button name="up" type="submit" disabled={!isDirty}>
          Update
        </button>
        {detailsTemp.deployed ? (
          <small style={{ marginLeft: "1%", color: "green" }}> deployed</small>
        ) : (
          <button
            type="submit"
            disabled={isDirty || !detailsTemp.created_at}
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
