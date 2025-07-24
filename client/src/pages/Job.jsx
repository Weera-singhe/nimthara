import React, { useEffect, useState } from "react";
import { JOBS_API_URL, JOB_ADD_API_URL } from "../api/urls";
import Docs from "../elements/Docs";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import JobDiv1 from "./Job/JobDiv1";
import JobDiv3 from "./Job/JobDiv3";
import JobDiv4 from "./Job/JobDiv4";
import useCurrentTime from "../elements/useCurrentTime";

const defDiv1 = {
  customer: 0,
  deadline: "",
  reference: "",
  created_at: "000000",
  total_jobs: 1,
};

export default function Job({ user }) {
  const max_eachJobs = 400;
  const [detailsDiv1, setDetailsDiv1] = useState(defDiv1);
  const [initialDetailsDiv1, setInitialDetailsDiv1] = useState(defDiv1);

  const [detailsDiv3, setDetailsDiv3] = useState([]);
  const [initialDetailsDiv3, setInitialDetailsDiv3] = useState([]);

  const [allCustomers, loadAllCustomers] = useState([]);
  const [div1Loading, isDiv1Loading] = useState(true);
  const [div3Loading, isDiv3Loading] = useState(true);
  const [qtsComponants, setQtsComponants] = useState(true);

  const [allPapers, setAllPapers] = useState([]);
  const [allUsernames, setAllUsernames] = useState([]);
  const [showQTS, setShowQTS] = useState(true);
  const [showQTSList, setShowQTSList] = useState(
    Array(detailsDiv1.total_jobs).fill(true)
  );
  const [allTotalPrices, setAllTotalPrices] = useState([]); ///////////////////

  const { id } = useParams();
  const navigate = useNavigate();

  const currentTime = useCurrentTime();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (id) {
          const { data } = await axios.get(`${JOBS_API_URL}/${id}`, {
            withCredentials: true,
          });
          setAllPapers(data.allPapers);
          console.log(data.allPapers);
          setQtsComponants(data.qts_componants);
          loadAllCustomers(data.cus);
          setAllUsernames(data.usernames);

          /////////////////////////////////

          const savedJobsMap = Object.fromEntries(
            data.saved_jobs.map((job) => [job.id_each, job])
          );

          const jobDetails = data.job_details;
          setDetailsDiv1(jobDetails);
          setInitialDetailsDiv1(jobDetails);

          ///////////////////////////////

          const def_jobs_each = data.def_jobs_each;
          const comp_defs = data.comp_defs;

          const filled = Array.from({ length: max_eachJobs }, (_, idx) => {
            const savedJob = savedJobsMap[idx + 1] || {};
            return {
              ...def_jobs_each,
              ...comp_defs,
              ...savedJob,
              id_main: Number(id),
              id_each: idx + 1,
            };
          });

          setDetailsDiv3(filled);
          setInitialDetailsDiv3(filled);
        } else {
          const { data } = await axios.get(JOB_ADD_API_URL, {
            withCredentials: true,
          });
          loadAllCustomers(data.cus);
          setQtsComponants(data.qts_componants);
        }
      } catch (err) {
        console.error("Failed to load job or customer data:", err);
      } finally {
        isDiv1Loading(false);
        isDiv3Loading(false);
      }
    };
    fetchData();
  }, []);
  useEffect(() => {
    setShowQTSList(Array(detailsDiv1.total_jobs).fill(true));
  }, [detailsDiv1.total_jobs]);

  useEffect(() => {
    console.log(detailsDiv3);
  }, [detailsDiv3]);

  function handleChangeStr(e, i, ii, arrayy) {
    const { name, value } = e.target;
    i === 1
      ? setDetailsDiv1((prev) => ({ ...prev, [name]: value }))
      : i === 3 && !arrayy
      ? setDetailsDiv3((prev) =>
          prev.map((slot, i) => (i === ii ? { ...slot, [name]: value } : slot))
        )
      : i === 3 &&
        arrayy &&
        setDetailsDiv3((prev) =>
          prev.map((slot, i) =>
            i === ii
              ? {
                  ...slot,
                  [arrayy]: {
                    ...(slot[arrayy] || {}),
                    [name]: value,
                  },
                }
              : slot
          )
        );
  }
  function handleChangeNum(e, i, ii, arrayy) {
    const { name, value } = e.target;
    i === 1
      ? setDetailsDiv1((prev) => ({ ...prev, [name]: Number(value) }))
      : i === 3 && !arrayy
      ? setDetailsDiv3((prev) =>
          prev.map((slot, i) =>
            i === ii ? { ...slot, [name]: Number(value) } : slot
          )
        )
      : i === 3 &&
        arrayy &&
        setDetailsDiv3((prev) =>
          prev.map((slot, i) =>
            i === ii
              ? {
                  ...slot,
                  [arrayy]: {
                    ...(slot[arrayy] || {}),
                    [name]: Number(value),
                  },
                }
              : slot
          )
        );
  }

  const handleChangeCheck = (e, i, ii, arrayy) => {
    const { name, checked } = e.target;

    i === 1
      ? setDetailsDiv1((p) => ({ ...p, [name]: checked }))
      : i === 3 && !arrayy
      ? setDetailsDiv3((prev) =>
          prev.map((slot, i) =>
            i === ii ? { ...slot, [name]: checked } : slot
          )
        )
      : i === 3 &&
        arrayy &&
        setDetailsDiv3((prev) =>
          prev.map((slot, i) =>
            i === ii
              ? {
                  ...slot,
                  [arrayy]: {
                    ...(slot[arrayy] || {}),
                    [name]: checked,
                  },
                }
              : slot
          )
        );
  };

  function handleSubmitDiv1(e) {
    e.preventDefault();
    isDiv1Loading(true);
    isDiv3Loading(true);

    const exprt = {
      ...detailsDiv1,
      user_id: user.id,
      ...(id && { id }),
    };
    setInitialDetailsDiv1(detailsDiv1);

    axios
      .post(`${JOBS_API_URL}/div1`, exprt)
      .then((res) => navigate(`/jobs/${res.data.load_this_id}`))
      .catch((err) => alert("Error: " + err))
      .finally(() => {
        isDiv1Loading(false);
        isDiv3Loading(false);
      });
  }

  function handleSubmitDiv3(e, indexOfDiv3) {
    e.preventDefault();
    isDiv1Loading(true);
    isDiv3Loading(true);

    const exprt = { ...detailsDiv3[indexOfDiv3], user_id: user.id };
    console.log(exprt);

    setInitialDetailsDiv3((p) =>
      p.map((slot, index) =>
        index === indexOfDiv3 ? { ...detailsDiv3[indexOfDiv3] } : slot
      )
    );

    axios
      .post(`${JOBS_API_URL}/div3`, exprt)
      .then((res) => console.log(res.data))
      .catch((err) => alert("Error: " + err))
      .finally(() => {
        isDiv1Loading(false);
        isDiv3Loading(false);
      });
  }
  /////////////////////////////

  function updateTotalPrice(index, price) {
    setAllTotalPrices((prev) => {
      const updated = [...prev];
      updated[index] = price;
      return updated;
    });
  }

  ////////////////////////////

  //displayID
  const displayID =
    detailsDiv1.created_at && id
      ? `${detailsDiv1.created_at}_${id.toString().padStart(4, "0")}`
      : "loading...";

  const submit1Disabled =
    JSON.stringify(detailsDiv1) === JSON.stringify(initialDetailsDiv1) ||
    (id ? user.level_jobs < 3 : user.level_jobs < 2) ||
    div1Loading ||
    div3Loading ||
    detailsDiv1.customer === 0;

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
              jobDetails={detailsDiv1}
              allCustomers={allCustomers}
              handleChangeStr={(e) => handleChangeStr(e, 1, 0)}
              handleChangeNum={(e) => handleChangeNum(e, 1, 0)}
              handleSubmit={handleSubmitDiv1}
              submit_disabled={submit1Disabled}
              max_eachJobs={max_eachJobs}
            />
            {!id && user.level_jobs >= 2 && (
              <>
                <br />
                <span>
                  {" "}
                  submitted by
                  <b>{user.display_name}</b>on
                  <b> {currentTime}</b>
                </span>
              </>
            )}
          </>
        )}
      </div>

      {/*DIV_2_/////////////////////////*/}

      {id && (
        <div className="framed">
          <h3>Related Documents</h3>
          <Docs
            id={id}
            upload_locked={user.level_jobs < 2}
            view_locked={user.level_jobs < 2}
            delete_locked={user.level_jobs < 3}
            folder_name={"jobs"}
            prefix={displayID}
          />
        </div>
      )}

      {/*DIV_3_/////////////////////////*/}
      {id && (
        <div className="framed" style={{ width: "fitContent" }}>
          <Link
            onClick={() => {
              if (user.level_jobs >= 3) {
                setShowQTS((p) => !p);
              }
            }}
            style={{
              cursor: user.level_jobs > 2 ? "pointer" : "not-allowed",
              color: user.level_jobs > 2 ? "blue" : "gray",
              textDecoration: "underline",
            }}
          >
            {showQTS ? "Hide All Quotations" : "Show All Quotations"}
          </Link>
        </div>
      )}
      {id &&
        showQTS &&
        Array.from({ length: detailsDiv1.total_jobs }, (_, indexOfDiv3) => (
          <div key={indexOfDiv3} className="framed">
            {div3Loading ? (
              "loading..."
            ) : (
              <>
                {`Quotation ${displayID}_${indexOfDiv3 + 1}`}
                <br />
                <br />
                <JobDiv3
                  qts_componants={qtsComponants || []}
                  jobDetails={detailsDiv3[indexOfDiv3] || []}
                  handleChangeStr={(e, arrayy) =>
                    handleChangeStr(e, 3, indexOfDiv3, arrayy)
                  }
                  handleChangeNum={(e, arrayy) =>
                    handleChangeNum(e, 3, indexOfDiv3, arrayy)
                  }
                  handleChangeCheck={(e, arrayy) =>
                    handleChangeCheck(e, 3, indexOfDiv3, arrayy)
                  }
                  handleSubmit={(e) => handleSubmitDiv3(e, indexOfDiv3)}
                  hasChanged={
                    JSON.stringify(detailsDiv3[indexOfDiv3]) !==
                    JSON.stringify(initialDetailsDiv3[[indexOfDiv3]])
                  }
                  allPapers={allPapers || []}
                  showQTS_={showQTSList[indexOfDiv3]}
                  setShowQTS_={(newVal) =>
                    setShowQTSList((prev) =>
                      prev.map((val, i) => (i === indexOfDiv3 ? newVal : val))
                    )
                  }
                  reportTotalPrice={(price) =>
                    updateTotalPrice(indexOfDiv3, price)
                  }
                />
              </>
            )}
          </div>
        ))}

      {/*DIV_4_/////////////////////////*/}
      {id && (
        <div className="framed">
          <h3>Job Status ...</h3>
          {div1Loading || div3Loading ? (
            "loading...."
          ) : (
            <JobDiv4
              allUsernames={allUsernames || []}
              detailsDiv1={detailsDiv1 || []}
              detailsDiv3={detailsDiv3 || []}
              allTotalPrices={allTotalPrices || []}
            />
          )}
        </div>
      )}
    </>
  );
}
