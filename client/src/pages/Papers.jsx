import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import { PAPERS_API_URL } from "../api/urls";
import { ADD_PAPER_API_URL } from "../api/urls";

export default function Papers() {
  const [papers, setPapers] = useState([]);

  const [datas, setDatas] = useState({
    types: [],
    colors: [],
    brands: [],
    units: [],
  });

  const [newPaper, setNewPaper] = useState({
    type_: 0,
    gsm: 0,
    color_: 0,
    brand_: 0,
    size_h: 0,
    size_w: 0,
    unit_val: 500,
    unit_: 0,
  });

  function paper_id(np) {
    return {
      id:
        String(np.type_).padStart(3, "0") +
        String(np.color_).padStart(2, "0") +
        String(np.gsm * 10).padStart(4, "0") +
        String(np.size_h * 10).padStart(3, "0") +
        String(np.size_w * 10).padStart(3, "0") +
        String(np.brand_).padStart(3, "0"),
    };
  }

  useEffect(() => {
    axios
      .get(PAPERS_API_URL)
      .then((res) => {
        setPapers(res.data.names);
        setDatas(res.data.data);
      })
      .catch((err) => console.error("Error fetching papers:", err));
  }, []);

  const change = (e) => {
    const { name, value, max } = e.target;
    const maxVal = isNaN(max) ? 100 : Number(max);
    const finalVal = value > maxVal || value < 0 ? newPaper[name] : value;

    setNewPaper((p) => {
      return {
        ...p,
        [name]: Math.round(finalVal * 10) / 10,
      };
    });
  };
  function testz() {
    console.log({ ...newPaper, ...paper_id(newPaper) });
  }

  const handleAddPaper = (e) => {
    e.preventDefault();
    axios
      .post(ADD_PAPER_API_URL, { ...newPaper, ...paper_id(newPaper) })
      .then((res) => {
        setPapers(res.data.names);
        setNewPaper({
          type_: 0,
          gsm: 0,
          color_: 0,
          brand_: 0,
          size_h: 0,
          size_w: 0,
          unit_val: 500,
          unit_: 0,
        });
      })
      .catch((err) => console.error("Error adding paper:", err));
  };

  return (
    <>
      <Header />
      <div>
        <form onSubmit={handleAddPaper}>
          <select name="type_" value={newPaper.type_} onChange={change}>
            <option value={0}> -type-</option>
            {datas.types.map((i, ii) => (
              <option value={ii + 1} key={ii}>
                {i}
              </option>
            ))}
          </select>
          <select name="color_" value={newPaper.color_} onChange={change}>
            <option value={0}> -color-</option>
            {datas.colors.map((i, ii) => (
              <option value={ii + 1} key={ii}>
                {i}
              </option>
            ))}
          </select>
          <input
            type="number"
            name="gsm"
            placeholder="gsm"
            className="wid80"
            value={newPaper.gsm}
            max={999.9}
            onChange={change}
          />{" "}
          <input
            type="number"
            name="size_h"
            placeholder="height"
            className="wid60"
            value={newPaper.size_h}
            max={99.9}
            onChange={change}
          />{" "}
          <input
            type="number"
            name="size_w"
            className="wid60"
            placeholder="width"
            value={newPaper.size_w}
            max={99.9}
            onChange={change}
          />
          <select name="brand_" value={newPaper.brand_} onChange={change}>
            <option value={0}> -brand-</option>
            {datas.brands.map((i, ii) => (
              <option value={ii + 1} key={ii}>
                {i}
              </option>
            ))}
          </select>
          <select name="unit_val" value={newPaper.unit_val} onChange={change}>
            <option value="500">500</option>
            <option value="250">250</option>
            <option value="125">125</option>
            <option value="100">100</option>
            <option value="1000">1000</option>
            <option value="1">1</option>
          </select>
          <select name="unit_" value={newPaper.unit_} onChange={change}>
            <option value={0}> -unit-</option>
            {datas.units.map((i, ii) => (
              <option value={ii + 1} key={ii}>
                {i}
              </option>
            ))}
          </select>
          <button type="submit" disabled={Object.values(newPaper).includes(0)}>
            Add Paper
          </button>
        </form>

        <ul>
          {papers.map((paper, i) => (
            <li key={i}>{paper}</li>
          ))}
        </ul>
      </div>
    </>
  );
}
