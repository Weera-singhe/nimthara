import React, { useEffect, useState, useCallback, useMemo } from "react";
import { JOBS_API_URL } from "../api/urls";
import Docs from "../elements/Docs";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import JobDiv1 from "./Job/JobDiv1";
import JobDiv2 from "./Job/JobDiv2";
import JobDiv3 from "./Job/JobDiv3";
import JobDiv4 from "./Job/JobDiv4";
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

        const { savedEachJob, savedEachXJ, qtsDefJsons, mainJobData, getAct } =
          data;
        setMainJ(mainJobData);
        console.log("latest Activity : ", getAct);

        const totalJobs = mainJobData.total_jobs || 0;

        //set saved and empty eachjobs
        const defsE = {
          unit_count: 1,
          item_count: 1,
          profit: 0,
          j_status: 0,
          aw: 0,
          samp_pr: 0,
          deployed: false,
          id_main: Number(id),
        };

        const savedEachMap = Object.fromEntries(
          savedEachJob.map((job) => [job.id_each, job])
        );

        const filled = Array.from({ length: totalJobs }, (_, i) => ({
          id_each: i + 1,
          ...defsE,
          ...qtsDefJsons, //{ loop_count, v, notes_other }
          ...savedEachMap[i + 1],
        }));
        setEachJ(filled);
        //end

        //set saved and empty eachjobsx
        const savedEachXMap = Object.fromEntries(
          savedEachXJ.map((j) => [j.id_each, j])
        );
        const defsX = {
          //avoid srver errors and save bttn error
          bb: 0,
          bb_amount: 0,
          samp_pp: 0,
          res_status: 0,
          pb: 0,
          pb_amount: 0,
          po: 0,
          po_date_: "",
        };
        const filledX = Array.from({ length: totalJobs }, (_, i) => ({
          id_each: i + 1,
          ...defsX,
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

  useEffect(() => {
    console.log("MAIN J DB : ", mainJDB);
  }, [mainJDB]);

  function SubmitDiv1(exprt) {
    isLoadingMainJ(true);
    isLoadingEachJ(true);

    const updatedExprt = { ...exprt, user_id: user.id, ...(id && { id }) };

    axios
      .post(`${JOBS_API_URL}/div1`, updatedExprt)
      .then((res) => !id && navigate(`/jobs/${res.data.load_this_id}`)) //navigate triggers fetchDB
      .catch((err) => alert("Error: " + err))
      .finally(() => id && navigate(0)); //if already id dont navigate. so manuelly triggers fetchDB
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

    const safeExport = { ...exprt, user_id: user.id, id_main: +id, form };
    console.log("safeExport : ", safeExport);

    axios
      .post(`${JOBS_API_URL}/div3`, safeExport)
      .then((res) => {
        if (form === "est_sub") {
          setMainJ(res.data);
        } else if (form === "bb" || form === "samp_pp" || form === "result") {
          setEachJX((p) =>
            p.map((slot) =>
              slot.id_each === res.data.id_each ? res.data : slot
            )
          );
        }
      })
      .catch((err) => alert("Error: " + err))
      .finally(() => {
        isLoadingMainJ(false);
        isLoadingEachJ(false);
      });
  }

  function SubmitDiv4(exprt, form) {
    isLoadingMainJ(true);
    isLoadingEachJ(true);

    const safeExport = { ...exprt, id_main: +id, form };
    console.log("safeExport : ", safeExport);

    axios
      .post(`${JOBS_API_URL}/div4`, safeExport)
      .then((res) => {
        console.log(res.data);
        if (form === "j_status" || form === "samp_pr" || form === "aw") {
          setEachJ((p) =>
            p.map((slot) =>
              slot.id_each === res.data.id_each ? res.data : slot
            )
          );
        } else if (form === "pb" || form === "po") {
          setEachJX((p) =>
            p.map((slot) =>
              slot.id_each === res.data.id_each ? res.data : slot
            )
          );
        }
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
      {/*DIV_4_/////////////////////////*/}
      {id && (
        <div className="framed">
          {loadingEachJ && loadingMainJ && "loading..."}
          <div
            style={{ display: loadingEachJ && loadingMainJ ? "none" : "block" }}
          >
            <JobDiv4
              mainJDB={mainJDB}
              eachJDB={eachJDB}
              eachJXDB={eachJXDB}
              allTotalPrices={allTotalPrices}
              displayID={displayID}
              handleSubmit={SubmitDiv4}
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
