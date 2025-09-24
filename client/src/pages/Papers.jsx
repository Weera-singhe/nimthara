import React, { useEffect, useState } from "react";
import axios from "axios";
import Num from "../elements/NumInput";
import { toLKR } from "../elements/cal";
import { PAPERS_API_URL, ADD_PAPER_API_URL } from "../api/urls";
import { Link } from "react-router-dom";

export default function Papers({ user }) {
  const [loadedPapers, loadPapers] = useState([]);

  const [specs, setSpecs] = useState({
    types: [],
    colors: [],
    brands: [],
    units: [],
    den_unit: [],
  });
  const [loading, isLoading] = useState(true);

  const [addingForm, setAddingForm] = useState({
    type_: 0,
    den_: 0,
    color_: 0,
    brand_: 0,
    size_h: 0,
    size_w: 0,
    unit_val: 500,
    unit_: 0,
    den_unit: 1,
  });

  useEffect(() => {
    axios
      .get(PAPERS_API_URL)
      .then((res) => {
        loadPapers(res.data.papers);
        setSpecs(res.data.specs);
      })
      .catch((err) => console.error("Error fetching papers:", err))
      .finally(isLoading(false));
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
    isLoading(true);
    if (!user.loggedIn) return (window.location.href = "/login");
    if (user.level_paper < 2) return (window.location.href = "/");
    setAddingForm((p) => {
      return {
        ...p,
        den_: 0,
        size_h: 0,
        size_w: 0,
      };
    });
    axios
      .post(ADD_PAPER_API_URL, addingForm)
      .then((res) => loadPapers(res.data.papers))
      .catch((err) => console.error("Error adding paper:", err))
      .finally(() => setTimeout(() => isLoading(false), 400));
  };

  return (
    <div>
      {user?.loggedIn && (
        <>
          <div className="new-division">
            {user.loggedIn && user.level_paper >= 2 && (
              <div className="formbox">
                {loading ? (
                  "loading..."
                ) : (
                  <form onSubmit={handleAddPaper}>
                    <select
                      name="type_"
                      value={addingForm.type_}
                      onChange={change}
                    >
                      <option value={0}> -type-</option>
                      {specs.types.map((i) => (
                        <option value={i.id} key={i.id}>
                          {i.name}
                        </option>
                      ))}
                    </select>
                    <span className="gap3"></span>
                    <select
                      name="color_"
                      value={addingForm.color_}
                      onChange={change}
                    >
                      <option value={0}> -color-</option>
                      {specs.colors.map((i) => (
                        <option value={i.id} key={i.id}>
                          {i.name}
                        </option>
                      ))}
                    </select>
                    <span className="gap3" />
                    <Num
                      deci={1}
                      width={80}
                      min={0}
                      max={999.9}
                      name="den_"
                      setTo={addingForm.den_}
                      changed={change}
                      label={"density"}
                    />{" "}
                    <select
                      name="den_unit"
                      value={addingForm.den_unit}
                      onChange={change}
                      style={{ marginLeft: 0 }}
                    >
                      {specs.den_unit.map((i) => (
                        <option value={i.id} key={i.id}>
                          {i.name}
                        </option>
                      ))}
                    </select>
                    <span className="gap3" />
                    <Num
                      deci={1}
                      width={60}
                      min={0}
                      max={99.9}
                      name="size_h"
                      setTo={addingForm.size_h}
                      changed={change}
                      label="height"
                    />
                    <span className="gap3" />
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
                    <span className="gap3" />
                    <select
                      name="brand_"
                      value={addingForm.brand_}
                      onChange={change}
                    >
                      <option value={0}> -brand-</option>
                      {specs.brands.map((i) => (
                        <option value={i.id} key={i.id}>
                          {i.name}
                        </option>
                      ))}
                    </select>
                    <span className="gap3" />
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
                    <span className="gap3"></span>
                    <select
                      name="unit_"
                      value={addingForm.unit_}
                      onChange={change}
                    >
                      <option value={0}> -unit-</option>
                      {specs.units.map((i) => (
                        <option value={i.id} key={i.id}>
                          {i.name}
                        </option>
                      ))}
                    </select>
                    <span className="gap3"></span>
                    <button
                      type="submit"
                      disabled={
                        Object.values(addingForm).includes(0) || loading
                      }
                    >
                      Add Paper
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
          <div className="new-division">
            {loading
              ? "loading"
              : loadedPapers.map((paper) => (
                  <div key={paper.id}>
                    <>
                      <div className="boxyy" style={{ width: "40%" }}>
                        {paper.name}
                      </div>
                      <div
                        className="boxyy"
                        style={{ width: "10%", textAlign: "right" }}
                      >
                        <Link to={`/price?id=${paper.id}`}>
                          {toLKR(paper.latest_price)}
                        </Link>
                      </div>
                    </>
                  </div>
                ))}
          </div>
        </>
      )}
    </div>
  );
}
