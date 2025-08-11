import React, { useEffect, useState, useCallback, useMemo } from "react";
import { JOBS_API_URL } from "../api/urls";
import Docs from "../elements/Docs";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import JobDiv1 from "./Job/JobDiv1";
import JobDiv2 from "./Job/JobDiv2";
import JobDiv3 from "./Job/JobDiv3";
//import JobDiv3Xtra from "./Job/JobDiv3Xtra";
import useCurrentTime from "../elements/useCurrentTime";
import { SumsEachQuot } from "../elements/cal.js";

export default function Job({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentTime = useCurrentTime([]);

  const [mainJDB, setMainJ] = useState([]);
  const [eachJDB, setEachJ] = useState([]);
  const [eachJXDB, setEachJX] = useState([]);

  const [loadingMainJ, isLoadingMainJ] = useState(true);
  const [loadingEachJ, isLoadingEachJ] = useState(true);

  const [allCustomers, loadAllCustomers] = useState([]);
  const [qtsComponants, setQtsComponants] = useState([]);
  const [allPapers, setAllPapers] = useState([]);
  const [allUsernames, setAllUsernames] = useState([]);

  const [showQTS, setShowQTS] = useState(false);

  const fetchDB = useCallback(async () => {
    try {
      const { data } = await axios.get(`${JOBS_API_URL}/${id || "add"}`, {
        withCredentials: true,
      });
      if (id) {
        //console.log("fetch with id");
        loadAllCustomers(data.cus);
        setQtsComponants(data.qtsComps);
        setAllPapers(data.allPapers);
        setAllUsernames(["", ...data.usernames]);

        const { savedEachJob, savedEachXJ, qtsDefJsons, mainJobData } = data;
        setMainJ(mainJobData);

        const totalJobs = mainJobData.total_jobs || 0;

        //set saved and empty eachjobs
        const otherElements = {
          unit_count: 1,
          item_count: 1,
          profit: 0,
          id_main: Number(id),
        };

        const savedEachMap = Object.fromEntries(
          savedEachJob.map((job) => [job.id_each, job])
        );

        const filled = Array.from({ length: totalJobs }, (_, i) => ({
          id_each: i + 1,
          ...otherElements,
          ...qtsDefJsons, //{ loop_count, v, notes_other }
          ...savedEachMap[i + 1],
        }));
        setEachJ(filled);
        //end

        //set saved and empty eachjobsx
        const savedEachXMap = Object.fromEntries(
          savedEachXJ.map((j) => [j.id_each, j])
        );
        const filledX = Array.from({ length: totalJobs }, (_, i) => ({
          id_each: i + 1,
          bb: 0, //
          bb_amount: 0, //avoid srver error when post
          ...savedEachXMap[i + 1],
        }));
        setEachJX(filledX);
        //end
      } else {
        //console.log("fetch NO id");
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
    fetchDB();
  }, [fetchDB]);

  // useEffect(() => {
  //   console.log("data from db : ", eachJDB);
  // }, [eachJDB]);

  function SubmitDiv1(exprt) {
    isLoadingMainJ(true);
    isLoadingEachJ(true);

    const updatedExprt = { ...exprt, user_id: user.id, ...(id && { id }) };

    axios
      .post(`${JOBS_API_URL}/div1`, updatedExprt)
      .then((res) => !id && navigate(`/jobs/${res.data.load_this_id}`)) //navigate triggers fetchDB
      .catch((err) => alert("Error: " + err))
      .finally(() => id && fetchDB()); //if already id dont navigate. so manuelly triggers fetchDB
  }

  function SubmitDiv2(submitter, exprt) {
    isLoadingEachJ(true);

    const isDeploy = submitter === "dep";

    const updatedExprt = {
      ...exprt,
      ...(isDeploy && { deployed: true }),
      user_id: user.id,
    };

    axios
      .post(`${JOBS_API_URL}/div2`, updatedExprt)
      .then((res) =>
        setEachJ((p) =>
          p.map((slot) => (slot.id_each === res.data.id_each ? res.data : slot))
        )
      )
      .catch((err) => alert("Error: " + err))
      .finally(() => isLoadingEachJ(false));
  }

  function SubmitDiv3(exprt, form) {
    isLoadingMainJ(true);
    isLoadingEachJ(true);

    const safeExport = { ...exprt, user_id: user.id, id: +id, form };
    console.log("safeExport : ", safeExport);

    axios
      .post(`${JOBS_API_URL}/div3`, safeExport)
      .then((res) => {
        form === "estSub" && setMainJ(res.data);
      })
      .catch((err) => alert("Error: " + err))
      .finally(() => {
        isLoadingMainJ(false);
        isLoadingEachJ(false);
      });
  }
  const allTotalPrices = useMemo(() => {
    return eachJDB.map((d2) => SumsEachQuot(qtsComponants, d2));
  }, [eachJDB, qtsComponants]);

  //displayID
  const displayID =
    mainJDB.created_at_x && id
      ? `${mainJDB.created_at_x}_${id.toString().padStart(4, "0")}`
      : "loading...";

  return (
    <>
      <div className="new-division">
        <button onClick={() => navigate("/jobs")}>Back</button>

        <h2>{id ? `Job # ${displayID}` : "Submit a New Job"}</h2>
      </div>
      {/*DIV_1_/////////////////////////*/}
      <div className="framed">
        {loadingMainJ ? (
          "loading..."
        ) : (
          <JobDiv1
            id={id}
            mainJDB={mainJDB}
            allCustomers={allCustomers}
            handleSubmit={SubmitDiv1}
            user={user}
            currentTime={currentTime}
          />
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
      {/*DIV_3_/////////////////////////*/}
      {id && (
        <div className="framed">
          {loadingEachJ && loadingMainJ && "loading..."}
          <div
            style={{ display: loadingEachJ && loadingMainJ ? "none" : "block" }}
          >
            <JobDiv3
              allUsernames={allUsernames}
              mainJDB={mainJDB}
              eachJDB={eachJDB}
              eachJXDB={eachJXDB}
              allTotalPrices={allTotalPrices}
              displayID={displayID}
              handleSubmit={SubmitDiv3}
              user={user}
            />
          </div>
        </div>
      )}
      {/*DIV_2_show_hide/////////////////////////*/}
      {id && (
        <div className="framed">
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
        Array.from({ length: mainJDB.total_jobs }, (_, loopIndex) => (
          <div key={loopIndex} className="framed">
            <>
              {loadingEachJ && "loading..."}
              <div style={{ display: loadingEachJ ? "none" : "block" }}>
                <JobDiv2
                  qts_componants={qtsComponants || []}
                  eachJDB={eachJDB[loopIndex] || []}
                  allPapers={allPapers || []}
                  handleSubmit={SubmitDiv2}
                  displayID={displayID}
                  loopIndex={loopIndex}
                  loading={loadingEachJ}
                />
              </div>
            </>
          </div>
        ))}
    </>
  );
}
