import { JOBS_API_URL } from "../../api/urls";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import Button from "@mui/material/Button";
import CreateNewFolderRoundedIcon from "@mui/icons-material/CreateNewFolderRounded";
import List from "@mui/material/List";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import ListItemButton from "@mui/material/ListItemButton";
import Box from "@mui/material/Box";
import ListSubheader from "@mui/material/ListSubheader";
import CircularProgress from "@mui/material/CircularProgress";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

import Typography from "@mui/material/Typography";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import { handleApiError } from "../../helpers/HandleChange";
import { InputAdornment, TextField } from "@mui/material";

export default function JobsHome({ user }) {
  const [dbLoading, setDbloading] = useState(true);
  const [qualiJobs, setQualiJobs] = useState([]);
  const [allJobsSearch, setAllJobsSearch] = useState([]);
  const [allJobFiles, setAllJobFiles] = useState([]);
  const [tabV, setTabV] = useState(2);

  const [searchTxt, setSearchTxt] = useState("");
  const [searchTxtDeb, setSearchTxtDeb] = useState("");
  const LIMIT = 100;

  useEffect(() => {
    setDbloading(true);
    setQualiJobs([]);
    setAllJobFiles([]);
    setAllJobsSearch([]);
    axios
      .get(JOBS_API_URL)
      .then((res) => {
        setAllJobsSearch(tabV === 3 ? res.data.allJobsSearch : []);
        setQualiJobs(tabV === 1 ? res.data.qualiJobs : []);
        setAllJobFiles(tabV === 2 ? res.data.allJobFiles : []);
        console.log(res.data);
      })
      .catch(handleApiError)
      .finally(() => setDbloading(false));
  }, [tabV]);

  const jobfileTag = (i) => String(i || 0).padStart(5, "0");

  useEffect(() => {
    const t = setTimeout(() => setSearchTxtDeb(searchTxt), 200); // 200ms is enough
    return () => clearTimeout(t);
  }, [searchTxt]);

  const CustomerName = (j) =>
    j?.customer_id === 1
      ? j?.unreg_customer || "Unregistered"
      : j?.cus_name_short || j?.customer_name;

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        minHeight: 0,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          flexShrink: 0,
        }}
      >
        <Button
          component={Link}
          to="/jobs/file/new"
          variant="contained"
          color="action"
        >
          <CreateNewFolderRoundedIcon />
        </Button>

        <Tabs
          value={tabV}
          onChange={(_, v) => {
            setTabV(v);
            setSearchTxt("");
          }}
          textColor="secondary"
          indicatorColor="secondary"
          variant="scrollable"
          scrollButtons={false}
        >
          <Tab
            value={1}
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {dbLoading && tabV === 1 ? (
                  <CircularProgress size={24} color="secondary" />
                ) : (
                  <WorkOutlineRoundedIcon />
                )}
                Qualified
              </Box>
            }
          />
          <Tab
            value={2}
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {dbLoading && tabV === 2 ? (
                  <CircularProgress size={24} color="secondary" />
                ) : (
                  <FolderOutlinedIcon />
                )}
                Bidding
              </Box>
            }
          />
          <Tab
            value={3}
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {dbLoading && tabV === 3 ? (
                  <CircularProgress size={24} color="secondary" />
                ) : (
                  <SearchRoundedIcon />
                )}
                Search
              </Box>
            }
          />
        </Tabs>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          mt: 1,
          minHeight: 0,
        }}
      >
        {tabV === 1 && (
          <Box>
            <List
              component="div"
              disablePadding
              sx={{
                "& .MuiListItemButton-root": {
                  border: "1px solid #448e8a",
                  borderLeft: "4px solid #008b84",
                  borderRadius: 1,
                  my: 0.25,
                  "&:hover": {
                    bgcolor: "#f3fffe",
                  },
                },
                "& .MuiListSubheader-root": {
                  border: "1px solid grey",
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #ca001e",
                  borderLeft: "6px solid #ca001e",
                  my: 0.5,
                  py: 0.5,
                  "&:hover": {
                    bgcolor: "#ffebee",
                  },
                },
                "& .cnt": {
                  width: "fit-content",
                  px: 1,
                  m: 1.5,
                  height: 24,
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 1,
                  backgroundColor: "#c54b5d",
                  fontWeight: 450,
                },
              }}
            >
              <ListSubheader>
                Not Started
                <Box className="cnt">
                  {qualiJobs.filter((j) => j?.job_status === 1).length}
                </Box>
              </ListSubheader>
              {qualiJobs
                .filter((j) => j?.job_status === 1)
                .map((j) => (
                  <ListItemButton
                    component={Link}
                    to={`/jobs/job/${j?.file_id}/${j?.job_index}`}
                    key={j.job_id}
                  >
                    <ListItemAvatar>
                      <WorkOutlineRoundedIcon />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <>
                          {"#" +
                            jobfileTag(j?.file_id) +
                            "_" +
                            (j?.job_code || j?.job_index)}
                          <b>{` - ${CustomerName(j)}`}</b>
                        </>
                      }
                      secondary={
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap" }}
                          component="span"
                        >
                          {j?.doc_name && (
                            <Typography component="span" sx={{ mx: 0.25 }}>
                              {j.doc_name}
                            </Typography>
                          )}

                          {j?.file_name && (
                            <Typography component="span" sx={{ mx: 0.25 }}>
                              ({j.file_name})
                            </Typography>
                          )}
                          {j?.job_name && (
                            <Typography component="span" sx={{ mx: 0.25 }}>
                              - {j.job_name}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItemButton>
                ))}
              <ListSubheader>
                Started
                <Box className="cnt">
                  {qualiJobs.filter((j) => j?.job_status === 2).length}
                </Box>
              </ListSubheader>
              {qualiJobs
                .filter((j) => j?.job_status === 2)
                .map((j) => (
                  <ListItemButton
                    component={Link}
                    to={`/jobs/job/${j?.file_id}/${j?.job_index}`}
                    key={j.job_id}
                  >
                    <ListItemAvatar>
                      <WorkOutlineRoundedIcon />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <>
                          {"#" +
                            jobfileTag(j?.file_id) +
                            "_" +
                            (j?.job_code || j?.job_index)}
                          <b>{` - ${CustomerName(j)}`}</b>
                        </>
                      }
                      secondary={
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap" }}
                          component="span"
                        >
                          {j?.doc_name && (
                            <Typography component="span" sx={{ mx: 0.25 }}>
                              {j.doc_name}
                            </Typography>
                          )}

                          {j?.file_name && (
                            <Typography component="span" sx={{ mx: 0.25 }}>
                              ({j.file_name})
                            </Typography>
                          )}
                          {j?.job_name && (
                            <Typography component="span" sx={{ mx: 0.25 }}>
                              - {j.job_name}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItemButton>
                ))}
              <ListSubheader>
                Finished not Delivered
                <Box className="cnt">
                  {qualiJobs.filter((j) => j?.job_status === 3).length}
                </Box>
              </ListSubheader>
              {qualiJobs
                .filter((j) => j?.job_status === 3)
                .map((j) => (
                  <ListItemButton
                    component={Link}
                    to={`/jobs/job/${j?.file_id}/${j?.job_index}`}
                    key={j.job_id}
                  >
                    <ListItemAvatar>
                      <WorkOutlineRoundedIcon />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <>
                          {"#" +
                            jobfileTag(j?.file_id) +
                            "_" +
                            (j?.job_code || j?.job_index)}
                          <b>{` - ${CustomerName(j)}`}</b>
                        </>
                      }
                      secondary={
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap" }}
                          component="span"
                        >
                          {j?.doc_name && (
                            <Typography component="span" sx={{ mx: 0.25 }}>
                              {j.doc_name}
                            </Typography>
                          )}

                          {j?.file_name && (
                            <Typography component="span" sx={{ mx: 0.25 }}>
                              ({j.file_name})
                            </Typography>
                          )}
                          {j?.job_name && (
                            <Typography component="span" sx={{ mx: 0.25 }}>
                              - {j.job_name}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItemButton>
                ))}
              <ListSubheader>
                Payment Pending
                <Box className="cnt">
                  {qualiJobs.filter((j) => j?.job_status === 4).length}
                </Box>
              </ListSubheader>
              {qualiJobs
                .filter((j) => j?.job_status === 4)
                .map((j) => (
                  <ListItemButton
                    component={Link}
                    to={`/jobs/job/${j?.file_id}/${j?.job_index}`}
                    key={j.job_id}
                  >
                    <ListItemAvatar>
                      <WorkOutlineRoundedIcon />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <>
                          {"#" +
                            jobfileTag(j?.file_id) +
                            "_" +
                            (j?.job_code || j?.job_index)}
                          <b>{` - ${CustomerName(j)}`}</b>
                        </>
                      }
                      secondary={
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap" }}
                          component="span"
                        >
                          {j?.doc_name && (
                            <Typography component="span" sx={{ mx: 0.25 }}>
                              {j.doc_name}
                            </Typography>
                          )}

                          {j?.file_name && (
                            <Typography component="span" sx={{ mx: 0.25 }}>
                              ({j.file_name})
                            </Typography>
                          )}
                          {j?.job_name && (
                            <Typography component="span" sx={{ mx: 0.25 }}>
                              - {j.job_name}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItemButton>
                ))}
            </List>
          </Box>
        )}

        {tabV === 2 && (
          <Box>
            <List
              component="div"
              disablePadding
              sx={{
                "& .MuiListItemButton-root": {
                  border: "1px solid #bdad5e",
                  borderLeft: "4px solid #b99a00",
                  borderRadius: 1,
                  my: 0.25,
                  "&:hover": {
                    bgcolor: "#fffbe9",
                  },
                },
                "& .MuiListSubheader-root": {
                  border: "1px solid grey",
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #ca001e",
                  borderLeft: "6px solid #ca001e",
                  my: 0.5,
                  py: 0.5,
                  "&:hover": {
                    bgcolor: "#ffebee",
                  },
                },
                "& .cnt": {
                  width: "fit-content",
                  px: 1,
                  m: 1.5,
                  height: 24,
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 1,
                  backgroundColor: "#c54b5d",
                  fontWeight: 450,
                },
              }}
            >
              <ListSubheader>
                Estimation Pending
                <Box className="cnt">
                  {
                    allJobFiles.filter((j) => !j?.esti_ok_all && !j?.notbidding)
                      .length
                  }
                </Box>
              </ListSubheader>

              {allJobFiles
                .filter((j) => !j?.esti_ok_all && !j?.notbidding)
                .sort(
                  (a, b) =>
                    new Date(a?.bid_deadline) - new Date(b?.bid_deadline),
                )
                .map((jf) => (
                  <ListItemButton
                    component={Link}
                    to={`/jobs/file/${jf?.file_id}`}
                    key={jf.file_id}
                  >
                    <ListItemAvatar>
                      <FolderOutlinedIcon />
                    </ListItemAvatar>

                    <ListItemText
                      primary={
                        <>
                          {"#" + jobfileTag(jf?.file_id)}
                          <b>{`- ${CustomerName(jf)}`}</b>
                        </>
                      }
                      secondary={
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap" }}
                          component="span"
                        >
                          {jf?.doc_name && (
                            <Typography component="span" sx={{ mx: 0.25 }}>
                              {jf?.doc_name}
                            </Typography>
                          )}

                          {jf?.file_name && (
                            <Typography component="span" sx={{ mx: 0.25 }}>
                              ({jf?.file_name})
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItemButton>
                ))}
              <ListSubheader>
                Submit Pending
                <Box className="cnt">
                  {
                    allJobFiles.filter(
                      (j) =>
                        j?.esti_ok_all &&
                        !j?.notbidding &&
                        !j?.bid_submit?.method,
                    ).length
                  }
                </Box>
              </ListSubheader>
              {allJobFiles
                .filter(
                  (j) =>
                    j?.esti_ok_all && !j?.notbidding && !j?.bid_submit?.method,
                )
                .sort(
                  (a, b) =>
                    new Date(a?.bid_deadline) - new Date(b?.bid_deadline),
                )
                .map((jf) => (
                  <ListItemButton
                    component={Link}
                    to={`/jobs/file/${jf?.file_id}`}
                    key={jf.file_id}
                  >
                    <ListItemAvatar>
                      <FolderOutlinedIcon />
                    </ListItemAvatar>

                    <ListItemText
                      primary={
                        <>
                          {"#" + jobfileTag(jf?.file_id)}
                          <b>{`- ${CustomerName(jf)}`}</b>
                        </>
                      }
                      secondary={
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap" }}
                          component="span"
                        >
                          {jf?.doc_name && (
                            <Typography component="span" sx={{ mx: 0.25 }}>
                              {jf?.doc_name}
                            </Typography>
                          )}

                          {jf?.file_name && (
                            <Typography component="span" sx={{ mx: 0.25 }}>
                              ({jf?.file_name})
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItemButton>
                ))}
              <ListSubheader>
                Submitted
                <Box className="cnt">
                  {
                    allJobFiles.filter(
                      (j) =>
                        j?.esti_ok_all &&
                        !j?.notbidding &&
                        j?.bid_submit?.method,
                    ).length
                  }
                </Box>
              </ListSubheader>
              {allJobFiles
                .filter(
                  (j) =>
                    j?.esti_ok_all && !j?.notbidding && j?.bid_submit?.method,
                )
                .sort(
                  (b, a) =>
                    new Date(a?.bid_deadline) - new Date(b?.bid_deadline),
                )
                .map((jf) => (
                  <ListItemButton
                    component={Link}
                    to={`/jobs/file/${jf?.file_id}`}
                    key={jf.file_id}
                  >
                    <ListItemAvatar>
                      <FolderOutlinedIcon />
                    </ListItemAvatar>

                    <ListItemText
                      primary={
                        <>
                          {"#" + jobfileTag(jf?.file_id)}
                          <b>{`- ${CustomerName(jf)}`}</b>
                        </>
                      }
                      secondary={
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap" }}
                          component="span"
                        >
                          {jf?.doc_name && (
                            <Typography component="span" sx={{ mx: 0.25 }}>
                              {jf?.doc_name}
                            </Typography>
                          )}

                          {jf?.file_name && (
                            <Typography component="span" sx={{ mx: 0.25 }}>
                              ({jf?.file_name})
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItemButton>
                ))}
              <ListSubheader>
                Not Bidding
                <Box className="cnt">
                  {allJobFiles.filter((j) => j?.notbidding).length}
                </Box>
              </ListSubheader>
              {allJobFiles
                .filter((j) => j?.notbidding)
                .sort(
                  (b, a) =>
                    new Date(a?.bid_deadline) - new Date(b?.bid_deadline),
                )
                .map((jf) => (
                  <ListItemButton
                    component={Link}
                    to={`/jobs/file/${jf?.file_id}`}
                    key={jf.file_id}
                  >
                    <ListItemAvatar>
                      <FolderOutlinedIcon />
                    </ListItemAvatar>

                    <ListItemText
                      primary={
                        <>
                          {"#" + jobfileTag(jf?.file_id)}
                          <b>{`- ${CustomerName(jf)}`}</b>
                        </>
                      }
                      secondary={
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap" }}
                          component="span"
                        >
                          {jf?.doc_name && (
                            <Typography component="span" sx={{ mx: 0.25 }}>
                              {jf?.doc_name}
                            </Typography>
                          )}

                          {jf?.file_name && (
                            <Typography component="span" sx={{ mx: 0.25 }}>
                              ({jf?.file_name})
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItemButton>
                ))}
            </List>
          </Box>
        )}
        {tabV === 3 && (
          <Box>
            <TextField
              fullWidth
              size="small"
              placeholder="Search..."
              value={searchTxt}
              onChange={(e) => setSearchTxt(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {dbLoading ? (
                      <CircularProgress size={16} />
                    ) : (
                      <SearchRoundedIcon />
                    )}
                  </InputAdornment>
                ),
              }}
              sx={{ my: 2 }}
            />

            <Box>
              <List
                component="div"
                disablePadding
                sx={{
                  "& .MuiListItemButton-root": {
                    border: "1px solid #448e8a",
                    borderLeft: "4px solid #008b84",
                    borderRadius: 1,
                    my: 0.25,
                    "&:hover": { bgcolor: "#f3fffe" },
                  },
                }}
              >
                {allJobsSearch
                  .filter((j) => {
                    const q = searchTxtDeb
                      .toLowerCase()
                      .replace(/[\s\-_()]+/g, " ")
                      .trim();

                    if (!q) return true;

                    const hay = (
                      "#" +
                      jobfileTag(j?.file_id) +
                      " " +
                      j?.job_code +
                      " " +
                      j?.job_index +
                      " " +
                      j?.customer_name +
                      " " +
                      j?.cus_name_short +
                      " " +
                      `(${j.file_name})` +
                      " " +
                      j?.job_name
                    )
                      .toLowerCase()
                      .replace(/[\s\-_()]+/g, " ")
                      .trim();

                    return q.split(" ").every((t) => hay.includes(t));
                  })
                  .slice(0, LIMIT)
                  .map((j) => (
                    <ListItemButton
                      component={Link}
                      to={`/jobs/job/${j?.file_id}/${j?.job_index_base}`}
                      key={`${j?.file_id}-${j?.job_index_base}-${j?.job_id ?? ""}`}
                    >
                      <ListItemAvatar>
                        <WorkOutlineRoundedIcon />
                      </ListItemAvatar>

                      <ListItemText
                        primary={
                          <>
                            {"#" +
                              jobfileTag(j?.file_id) +
                              "_" +
                              (j?.job_code || j?.job_index_base)}
                            <b>{` - ${CustomerName(j)}`}</b>
                          </>
                        }
                        secondary={
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap" }}
                            component="span"
                          >
                            {j?.doc_name && (
                              <Typography component="span" sx={{ mx: 0.25 }}>
                                {j.doc_name}
                              </Typography>
                            )}

                            {j?.file_name && (
                              <Typography component="span" sx={{ mx: 0.25 }}>
                                ({j.file_name})
                              </Typography>
                            )}
                            {j?.job_name && (
                              <Typography component="span" sx={{ mx: 0.25 }}>
                                - {j.job_name}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItemButton>
                  ))}
              </List>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
