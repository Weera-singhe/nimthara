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
  const [div1DataDB, setDiv1DataDB] = useState(defDiv1);

  const [div2DataDB, setDiv2DataDB] = useState([]);

  const [loadingMainJ, isLoadingMainJ] = useState(true);
  const [loadingEachJ, isLoadingEachJ] = useState(true);

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
      isLoadingMainJ(false);
      isLoadingEachJ(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    console.log("data from db : ", div2DataDB);
  }, [div2DataDB]);

  function handleSubmitDiv1(e) {
    e.preventDefault();
    isLoadingMainJ(true);
    isLoadingEachJ(true);
    //userid always send to backend. only there is no id(add nw job) it uses
    const exprt = { ...div1DataTemp, user_id: user.id, ...(id && { id }) };

    axios
      .post(`${JOBS_API_URL}/div1`, exprt)
      .then((res) => navigate(`/jobs/${res.data.load_this_id}`)) //when add new job
      .catch((err) => alert("Error: " + err))
      .finally(() => fetchData()); //still fetch when update existing job
  }

  function handleSubmitDiv2(e, exprt) {
    e.preventDefault();
    isLoadingEachJ(true);

    const isDeploy = e.submitter?.name === "dep";
    const updatedExprt = {
      ...exprt,
      ...(isDeploy && { deployed: true }),
      user_id: user.id,
    };

    axios
      .post(`${JOBS_API_URL}/div2`, updatedExprt)
      .then((res) =>
        setDiv2DataDB((p) =>
          p.map((slot) => (slot.id_each === res.data.id_each ? res.data : slot))
        )
      )
      .catch((err) => alert("Error: " + err))
      .finally(() => isLoadingEachJ(false));
  }

  function handleSubmitDiv3(exprt, form) {
    isLoadingMainJ(true);
    isLoadingEachJ(true);
    console.log(exprt, form);
    const safeExport = { ...exprt, user_id: user.id, form };

    axios
      .post(`${JOBS_API_URL}/div3`, safeExport)
      .then((res) => {
        setDiv1DataDB(res.data);
        console.log("hey ", res.data);
      })
      .catch((err) => alert("Error: " + err))
      //.finally(() => fetchData()); reloads all
      .finally(() => {
        isLoadingMainJ(false);
        isLoadingEachJ(false);
      });
  }
  const allTotalPrices = useMemo(() => {
    return div2DataDB.map((d2) => SumsEachQuot(qtsComponants, d2));
  }, [div2DataDB, qtsComponants]);

  //displayID
  const displayID =
    div1DataDB.created_at && id
      ? `${div1DataDB.created_at}_${id.toString().padStart(4, "0")}`
      : "loading...";

  const submit1Disabled =
    JSON.stringify(div1DataTemp) === JSON.stringify(div1DataDB) ||
    (id ? user.level_jobs < 3 : user.level_jobs < 2) ||
    !user.loggedIn ||
    loadingMainJ ||
    loadingEachJ ||
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
        {loadingMainJ ? (
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
            {!id && !submit1Disabled && (
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
          {loadingMainJ || loadingEachJ ? (
            "loading..."
          ) : (
            <Docs
              id={id}
              can_upload={user.level_jobs >= 2 && user.loggedIn}
              can_delete={user.level_jobs >= 3 && user.loggedIn}
              can_view={user.level_jobs >= 1 && user.loggedIn}
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
            onClick={() =>
              user.level_jobs >= 1 && user.loggedIn && setShowQTS((p) => !p)
            }
            style={{
              cursor:
                user.level_jobs >= 1 && user.loggedIn
                  ? "pointer"
                  : "not-allowed",
              color: user.level_jobs >= 1 && user.loggedIn ? "blue" : "gray",
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
        Array.from({ length: div1DataDB.total_jobs }, (_, loopIndex) => (
          <div key={loopIndex} className="framed">
            <>
              {loadingEachJ && "loading..."}
              <div style={{ display: loadingEachJ ? "none" : "block" }}>
                <JobDiv2
                  qts_componants={qtsComponants || []}
                  detailsDB={div2DataDB[loopIndex] || []}
                  allPapers={allPapers || []}
                  handleSubmit={handleSubmitDiv2}
                  displayID={displayID}
                  loopIndex={loopIndex}
                  loading={loadingEachJ}
                />
              </div>
            </>
          </div>
        ))}
      {/*DIV_3_/////////////////////////*/}
      {id && (
        <div className="framed">
          <h3>Job Status ...</h3>
          {loadingEachJ && "loading..."}
          <div style={{ display: loadingEachJ ? "none" : "block" }}>
            <JobDiv3
              allUsernames={allUsernames || []}
              div1DataDB={div1DataDB || {}}
              div2DataDB={div2DataDB || {}}
              allTotalPrices={allTotalPrices || {}}
              displayID={displayID}
              handleSubmit={handleSubmitDiv3}
              user={user}
            />
          </div>
        </div>
      )}
    </>
  );
}
