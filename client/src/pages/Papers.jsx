import React, { useEffect, useState } from "react";
import axios from "axios";
import Num from "../elements/NumInput";
import { PAPERS_API_URL, ADD_PAPER_API_URL } from "../api/urls";
import { Link } from "react-router-dom";

export default function Papers({ user }) {
  const [loadedPapers, loadPapers] = useState([]);

  const [datas, setDatas] = useState({
    types: [],
    colors: [],
    brands: [],
    units: [],
  });

  const [addingForm, setAddingForm] = useState({
    type_: 0,
    gsm: 0,
    color_: 0,
    brand_: 0,
    size_h: 0,
    size_w: 0,
    unit_val: 500,
    unit_: 0,
  });

  useEffect(() => {
    axios
      .get(PAPERS_API_URL)
      .then((res) => {
        loadPapers(res.data.papers);
        setDatas(res.data.data);
        console.log(res.data.papers);
      })
      .catch((err) => console.error("Error fetching papers:", err));
  }, []);

  const change = (e) => {
    const { name, value } = e.target;
    setAddingForm((p) => {
      return {
        ...p,
        [name]: Number(value),
      };
    });
  };

  const handleAddPaper = (e) => {
    e.preventDefault();
    if (!user.loggedIn) return (window.location.href = "/login");
    if (user.level < 2) return (window.location.href = "/");
    setAddingForm((p) => {
      return {
        ...p,
        gsm: 0,
        size_h: 0,
        size_w: 0,
      };
    });
    axios
      .post(ADD_PAPER_API_URL, {
        ...addingForm,
        ...createID(addingForm),
      })
      .then((res) => {
        loadPapers(res.data.papers);
      })
      .catch((err) => console.error("Error adding paper:", err));
  };
  function createID(np) {
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

  return (
    <>
      <div className="new-division">
        {" "}
        {user.loggedIn && user.level > 1 && (
          <div className="boxy book">
            <form onSubmit={handleAddPaper}>
              <select name="type_" value={addingForm.type_} onChange={change}>
                <option value={0}> -type-</option>
                {datas.types.map((i, ii) => (
                  <option value={ii + 1} key={ii}>
                    {i}
                  </option>
                ))}
              </select>
              <select name="color_" value={addingForm.color_} onChange={change}>
                <option value={0}> -color-</option>
                {datas.colors.map((i, ii) => (
                  <option value={ii + 1} key={ii}>
                    {i}
                  </option>
                ))}
              </select>
              <Num
                deci={1}
                width={80}
                min={0}
                max={999.9}
                name="gsm"
                setTo={addingForm.gsm}
                changed={change}
                label="gsm"
              />
              <Num
                deci={1}
                width={60}
                min={0}
                max={99.9}
                name="size_h"
                setTo={addingForm.size_h}
                changed={change}
                label="height"
              />{" "}
              <Num
                deci={1}
                width={60}
                min={0}
                max={99.9}
                name="size_w"
                setTo={addingForm.size_w}
                changed={change}
                label="width"
              />
              <select name="brand_" value={addingForm.brand_} onChange={change}>
                <option value={0}> -brand-</option>
                {datas.brands.map((brand, i) => (
                  <option value={datas.brand_ids[i]} key={datas.brand_ids[i]}>
                    {brand}
                  </option>
                ))}
              </select>
              <select
                name="unit_val"
                value={addingForm.unit_val}
                onChange={change}
              >
                <option value="500">500</option>
                <option value="250">250</option>
                <option value="125">125</option>
                <option value="100">100</option>
                <option value="1000">1000</option>
                <option value="1">1</option>
              </select>
              <select name="unit_" value={addingForm.unit_} onChange={change}>
                <option value={0}> -unit-</option>
                {datas.units.map((i, ii) => (
                  <option value={ii + 1} key={ii}>
                    {i}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={Object.values(addingForm).includes(0)}
              >
                Add Paper
              </button>
            </form>
          </div>
        )}
      </div>
      <div className="new-division">
        {loadedPapers.map((paper) => (
          <div key={paper.id}>
            <div className="boxyy" style={{ width: "40%" }}>
              {paper.name}
            </div>
            <div className="boxyy" style={{ width: "10%", textAlign: "right" }}>
              <Link to={`/price?id=${paper.id}`}>
                {typeof paper.latest_price === "number"
                  ? paper.latest_price.toLocaleString("en-LK", {
                      style: "currency",
                      currency: "LKR",
                    })
                  : "-"}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
