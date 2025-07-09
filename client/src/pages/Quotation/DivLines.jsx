import React, { useEffect, useState } from "react";
import OpLines from "./OpLines";
import options from "../../scripts/OptionsList";
import Num from "../../elements/NumInput";
import axios from "axios";
import { QTS_API_URL } from "../../api/urls";

function NumStr(i) {
  return Number(i).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function DivLines({ selected = [] }) {
  const [sums, setSums] = useState([]);
  const [paperData, setPaperData] = useState([]);

  useEffect(() => {
    axios
      .get(QTS_API_URL)
      .then((res) => {
        setPaperData(res.data.papers);
        console.log(res.data.papers);
      })
      .catch((err) => console.error("Error fetching papers:", err));
  }, []);

  const updateSum = (i, v) =>
    setSums((prev) => {
      const updated = [...prev];
      updated[i] = v;
      return updated;
    });

  const [profit, setProfit] = useState(0);
  function profitValChanged(e) {
    const val = Number(e.target.value) || 0;
    setProfit(val);
  }
  function profitPercChanged(e) {
    const perc = Number(e.target.value) || 0;
    setProfit((total * perc) / 100);
  }
  const [units, setUnits] = useState(1);
  function unitsChanged(e) {
    const val = Number(e.target.value) || 1;
    setUnits(val);
  }
  const [tax, setTax] = useState(18);
  function taxChanged(e) {
    const val = Number(e.target.value) || 0;
    setTax(val);
  }

  let index = 0;
  const lines = options.flatMap((opt) => {
    const loops = selected.find((s) => s.name === opt.name)?.loops || 0;
    return Array.from({ length: opt.max }, (_, ii) => {
      const hidden = ii >= loops;
      const currentIndex = index++;
      return (
        <div key={currentIndex} className={hidden ? "hidden" : ""}>
          <OpLines
            name={opt.name}
            iii={ii}
            calTotal={(v) => updateSum(currentIndex, v)}
            allPapers={paperData}
          />
        </div>
      );
    });
  });
  const total = lines.reduce((acc, line, i) => {
    return line.props.className !== "hidden" ? acc + (sums[i] || 0) : acc;
  }, 0);

  return (
    <>
      <div className="new-division">
        {lines}
        <div className="ali-right">
          <div className="boxy" style={{ width: "10%", marginLeft: "70.25%" }}>
            Sum :{" "}
          </div>
          <div className="boxy" style={{ width: "10%" }}>
            {NumStr(total)}
          </div>
        </div>
      </div>
      <div className="new-division">
        <div className="ali-right">
          <div className="boxy" style={{ width: "30%" }}>
            Total +{" "}
            <Num width={120} changed={profitValChanged} setTo={profit} />
            <b> ||</b>{" "}
            <Num
              width={60}
              changed={profitPercChanged}
              setTo={(profit / total) * 100}
            />
            <b>%</b>
          </div>
          <div className="boxy" style={{ width: "15%" }}>
            unit : <Num defVal={1} changed={unitsChanged} />
          </div>

          <div className="boxy" style={{ width: "10%" }}>
            <b>{NumStr(total + profit)}</b>
          </div>
          <div className="boxy" style={{ width: "7%" }}>
            <b>{NumStr((total + profit) / units)}</b>
          </div>
        </div>{" "}
        <div className="ali-right">
          <div className="boxy" style={{ width: "13%", marginLeft: "32.25%" }}>
            +tax :{" "}
            <Num
              defVal={18}
              max={100}
              width={40}
              changed={taxChanged}
              setTo={tax}
            />{" "}
            <b>%</b>
          </div>
          <div className="boxy" style={{ width: "10%" }}>
            <b>{NumStr((total + profit) * (1 + tax / 100))}</b>
          </div>

          <div className="boxy" style={{ width: "7%" }}>
            <b>{NumStr(((total + profit) / units) * (1 + tax / 100))}</b>
          </div>
        </div>
      </div>
    </>
  );
}

export default DivLines;
