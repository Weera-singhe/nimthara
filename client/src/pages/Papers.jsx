import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
const PAPERS_API_URL = `${API_BASE_URL}/papers`;
const ADD_PAPER_API_URL = `${API_BASE_URL}/add_new_paper`;

export default function Papers() {
  const [papers, setPapers] = useState([]);
  const [newPaper, setNewPaper] = useState({
    type: "",
    gsm: "",
    color: "",
    brand: "",
    sizeH: "",
    sizeW: "",
    unitVal: "",
    unit: "",
    id: "",
  });

  useEffect(() => {
    axios
      .get(PAPERS_API_URL)
      .then((res) => setPapers(res.data))
      .catch((err) => console.error("Error fetching papers:", err));
  }, []);

  const handleChange = (e) => {
    setNewPaper({ ...newPaper, [e.target.name]: e.target.value });
  };

  const handleAddPaper = (e) => {
    e.preventDefault();

    axios
      .post(ADD_PAPER_API_URL, newPaper)
      .then(() => {
        setPapers((prev) => [...prev, newPaper]);
        setNewPaper({
          type: "",
          gsm: "",
          color: "",
          brand: "",
          sizeH: "",
          sizeW: "",
          unitVal: "",
          unit: "",
          id: "",
        });
      })
      .catch((err) => console.error("Error adding paper:", err));
  };

  return (
    <>
      <Header />
      <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
        <h2>Papers</h2>
        <form onSubmit={handleAddPaper} style={{ marginBottom: "1rem" }}>
          {[
            "id",
            "type",
            "gsm",
            "color",
            "brand",
            "sizeH",
            "sizeW",
            "unitVal",
            "unit",
          ].map((field) => (
            <input
              key={field}
              name={field}
              placeholder={field}
              value={newPaper[field]}
              onChange={handleChange}
              style={{ margin: "0.3rem", padding: "0.5rem" }}
            />
          ))}
          <button type="submit" style={{ padding: "0.5rem 1rem" }}>
            Add Paper
          </button>
        </form>

        <ul>
          {papers.map((paper, i) => (
            <li key={i}>{JSON.stringify(paper)}</li>
          ))}
        </ul>
      </div>
    </>
  );
}
