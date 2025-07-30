import React, { useEffect, useState, useCallback, useMemo } from "react";
import { JOBS_API_URL, JOB_ADD_API_URL } from "../api/urls";
import Docs from "../elements/Docs";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import JobDiv1 from "./Job/JobDiv1";
import JobDiv2 from "./Job/JobDiv2";
import JobDiv3 from "./Job/JobDiv3";
//import JobDiv3Xtra from "./Job/JobDiv3Xtra";
import useCurrentTime from "../elements/useCurrentTime";
import { SumsEachQuot } from "../elements/cal.js";

const defDiv1 = {
  customer: 0,
  deadline: "",
  reference: "",
  total_jobs: 1,
};

export default function Job({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentTime = useCurrentTime([]);

  const [savedJobsDB, setSavedJobs] = useState();

  const [div1DataTemp, setDiv1DataTemp] = useState(defDiv1);
  const [div1dataDB, setDiv1DataDB] = useState(defDiv1);

  const [div2DataDB, setDiv2DataDB] = useState([]);

  const [div1Loading, isDiv1Loading] = useState(true);
  const [div2Loading, isDiv2Loading] = useState(true);

  const [allCustomers, loadAllCustomers] = useState([]);
  const [qtsComponants, setQtsComponants] = useState([]);
  const [allPapers, setAllPapers] = useState([]);
  const [allUsernames, setAllUsernames] = useState([]);

  const [showQTS, setShowQTS] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      if (id) {
        console.log("fetch with id");
        const { data } = await axios.get(`${JOBS_API_URL}/${id}`, {
          withCredentials: true,
        });
        setAllPapers(data.allPapers);
        setQtsComponants(data.qtsComps);
        loadAllCustomers(data.cus);
        setAllUsernames(["", ...data.usernames]);

        const { savedEachJob, qtsDefsEachJob, mainJobData } = data;
        const totalJobs = mainJobData.total_jobs || 0;
        const otherElements = { unit_count: 1, item_count: 1, profit: 0 };

        const savedJobsMap = Object.fromEntries(
          savedEachJob.map((job) => [job.id_each, job])
        );
        setSavedJobs(savedJobsMap);

        const filled = Array.from({ length: totalJobs }, (_, i) => ({
          id_main: Number(id),
          id_each: i + 1,
          ...otherElements,
          ...qtsDefsEachJob,
          ...savedJobsMap[i + 1],
        }));

        setDiv1DataTemp(mainJobData);
        setDiv1DataDB(mainJobData);
        setDiv2DataDB(filled);
      } else {
        console.log("fetch NO id");
        const { data } = await axios.get(JOB_ADD_API_URL, {
          withCredentials: true,
        });
        loadAllCustomers(data.cus);
      }
    } catch (err) {
      console.error("Failed to load job or customer data:", err);
    } finally {
      isDiv1Loading(false);
      isDiv2Loading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    console.log(div2DataDB);
  }, [div2DataDB]);

  function handleSubmitDiv1(e) {
    e.preventDefault();
    isDiv1Loading(true);
    isDiv2Loading(true);

    const exprt = { ...div1DataTemp, user_id: user.id, ...(id && { id }) };

    axios
      .post(`${JOBS_API_URL}/div1`, exprt)
      .then((res) => navigate(`/jobs/${res.data.load_this_id}`))
      .catch((err) => alert("Error: " + err))
      .finally(() => fetchData());
  }

  function handleSubmitDiv2(e, exprt) {
    e.preventDefault();
    isDiv2Loading(true);

    const isDeploy = e.submitter?.name === "dep";
    const updatedExprt = {
      ...exprt,
      ...(isDeploy && { deployed: true }),
      user_id: user.id,
    };

    axios
      .post(`${JOBS_API_URL}/div2`, updatedExprt)
      .then((res) => {
        console.log(res.data);
        setDiv2DataDB((p) =>
          p.map((slot) => (slot.id_each === res.data.id_each ? res.data : slot))
        );
      })
      .catch((err) => alert("Error: " + err))
      .finally(() => isDiv2Loading(false));
  }

  const allTotalPrices = useMemo(() => {
    return div2DataDB.map((d2) => SumsEachQuot(qtsComponants, d2));
  }, [div2DataDB, qtsComponants]);

  //displayID
  const displayID =
    div1dataDB.created_at && id
      ? `${div1dataDB.created_at}_${id.toString().padStart(4, "0")}`
      : "loading...";

  const submit1Disabled =
    JSON.stringify(div1DataTemp) === JSON.stringify(div1dataDB) ||
    (id ? user.level_jobs < 3 : user.level_jobs < 2) ||
    div1Loading ||
    div2Loading ||
    !div1DataTemp.customer ||
    !div1DataTemp.deadline;

  return (
    <>
      <button onClick={() => navigate("/jobs")}>Back</button>

      <h2 style={{ marginLeft: "2rem" }}>
        {id ? `Update Job ${displayID}` : "Submit a New Job"}
      </h2>

      {/*DIV_1_/////////////////////////*/}
      <div className="framed">
        {div1Loading ? (
          "loading..."
        ) : (
          <>
            <JobDiv1
              id={id}
              jobDetails={div1DataTemp}
              setDetails={setDiv1DataTemp}
              handleSubmit={handleSubmitDiv1}
              submit_disabled={submit1Disabled}
              allCustomers={allCustomers}
              savedJobsDB={savedJobsDB || []}
            />
            {!id && user.level_jobs >= 2 && (
              <>
                <br />
                <span>
                  submitted by <b>{user.display_name}</b>on<b> {currentTime}</b>
                </span>
              </>
            )}
          </>
        )}
      </div>
      {id && (
        <div className="framed">
          <h3>Related Documents</h3>{" "}
          {div1Loading || div2Loading ? (
            "loading..."
          ) : (
            <Docs
              id={id}
              can_upload={user.level_jobs >= 2}
              can_delete={user.level_jobs >= 3}
              can_view={user.level_jobs >= 1}
              folder_name={"jobs"}
              prefix={displayID}
            />
          )}
        </div>
      )}
      {/*DIV_2_show_hide/////////////////////////*/}
      {id && (
        <div className="framed" style={{ width: "fitContent" }}>
          <Link
            onClick={() => user.level_jobs >= 1 && setShowQTS((p) => !p)}
            style={{
              cursor: user.level_jobs >= 1 ? "pointer" : "not-allowed",
              color: user.level_jobs >= 1 ? "blue" : "gray",
              textDecoration: "underline",
            }}
          >
            {showQTS ? "Hide All Quotations" : "Show All Quotations"}
          </Link>
        </div>
      )}
      {/*DIV_2_/////////////////////////*/}
      {id &&
        showQTS &&
        Array.from({ length: div1dataDB.total_jobs }, (_, loopIndex) => (
          <div key={loopIndex} className="framed">
            <>
              {div2Loading && "loading..."}
              <div style={{ display: div2Loading ? "none" : "block" }}>
                <JobDiv2
                  qts_componants={qtsComponants || []}
                  detailsDB={div2DataDB[loopIndex] || []}
                  allPapers={allPapers || []}
                  handleSubmit={handleSubmitDiv2}
                  displayID={displayID}
                  loopIndex={loopIndex}
                  loading={div2Loading}
                />
              </div>
            </>
          </div>
        ))}
      {/*DIV_3_/////////////////////////*/}
      {id && (
        <div className="framed">
          <h3>Job Status ...</h3>
          {div2Loading && "loading..."}
          <div style={{ display: div2Loading ? "none" : "block" }}>
            <JobDiv3
              allUsernames={allUsernames || []}
              detailsDiv1={div1dataDB || {}}
              detailsDiv2={div2DataDB || {}}
              allTotalPrices={allTotalPrices || {}}
              displayID={displayID}
              handleSubmit={handleSubmitDiv2}
            />
          </div>
        </div>
      )}
    </>
  );
}
