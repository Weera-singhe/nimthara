import React, { useEffect, useState } from "react";
import OpLines from "./OpLines";
import options from "../../scripts/OptionsList";
import NumBox from "../../elements/NumBox";
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
  const [profit, setProfit] = useState(0);
  const [allPapers, setAllPapers] = useState([]);

  useEffect(() => {
    axios
      .get(QTS_API_URL)
      .then((res) => {
        setAllPapers(res.data.names);
      })
      .catch((err) => console.error("Error fetching papers:", err));
  }, []);

  const updateSum = (i, v) =>
    setSums((prev) => {
      const updated = [...prev];
      updated[i] = v;
      return updated;
    });

  function profitChanged(e) {
    const val = Number(e.target.value) || 0;
    e.target.name === "p" ? setProfit((total * val) / 100) : setProfit(val);
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
            allPapers={allPapers}
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
      <div className="new-division">{lines}</div>
      <div>
        <div className="boxy" style={{ width: "10%", marginLeft: "69.75%" }}>
          total
        </div>
        <div className="boxy" style={{ width: "10%" }}>
          {NumStr(total)}
        </div>
      </div>{" "}
      <div>
        <div className="boxy" style={{ width: "17%", marginLeft: "62.75%" }}>
          <NumBox width={100} changed={profitChanged} setTo={profit} />{" "}
          <b> ||</b>{" "}
          <input
            type="number"
            className="wid60"
            name="p"
            onChange={profitChanged}
            value={total === 0 ? "" : (profit / total) * 100}
          ></input>
          <b>%</b>
        </div>
        <div className="boxy" style={{ width: "10%" }}>
          {NumStr(total + profit)}
        </div>
      </div>
    </>
  );
}

export default DivLines;
