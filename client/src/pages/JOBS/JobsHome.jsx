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
import Typography from "@mui/material/Typography";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import { handleApiError } from "../../helpers/HandleChange";

export default function JobsHome({ user }) {
  const [dbLoading, setDbloading] = useState(true);

  const [allJobs, setAllJobs] = useState([]);
  const [allJobFiles, setAllJobFiles] = useState([]);

  const [tabV, setTabV] = useState(2);

  useEffect(() => {
    axios
      .get(JOBS_API_URL)
      .then((res) => {
        setAllJobs(res.data.allJobs);
        setAllJobFiles(res.data.allJobFiles);
        ///console.log(res.data);
      })
      .catch(handleApiError)
      .finally(() => setDbloading(false));
  }, []);

  const jobfileTag = (i) => String(i || 0).padStart(5, "0");

  const CustomerName = (j) =>
    j?.customer_id === 1
      ? j?.unreg_customer || "Unregistered"
      : j?.cus_name_short || j?.customer_name;

  return (
    <Box
      sx={{
        height: "81vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
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
          startIcon={<CreateNewFolderRoundedIcon />}
          color="action"
        >
          FILE
        </Button>

        <Tabs
          value={tabV}
          onChange={(_, v) => setTabV(v)}
          textColor="secondary"
          indicatorColor="secondary"
        >
          <Tab
            value={1}
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <WorkOutlineRoundedIcon />
                Jobs
                {dbLoading && <CircularProgress size={16} color="inherit" />}
              </Box>
            }
          />
          <Tab
            value={2}
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <FolderOutlinedIcon />
                Job Files
                {dbLoading && <CircularProgress size={16} color="inherit" />}
              </Box>
            }
          />
        </Tabs>
      </Box>

      <Box
        sx={{
          flex: "1 1 auto",
          overflowY: "auto",
          mt: 1,
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
                  border: "1px solid #ca001e",
                  borderLeft: "6px solid #ca001e",
                  my: 0.5,
                  py: 0.5,
                  "&:hover": {
                    bgcolor: "#ffebee",
                  },
                },
              }}
            >
              <ListSubheader sx={{ border: "1px solid grey", borderRadius: 1 }}>
                Not Started
              </ListSubheader>
              {allJobs
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
              <ListSubheader sx={{ border: "1px solid grey", borderRadius: 1 }}>
                Started
              </ListSubheader>
              {allJobs
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
              <ListSubheader sx={{ border: "1px solid grey", borderRadius: 1 }}>
                Finished not Delivered
              </ListSubheader>
              {allJobs
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
              <ListSubheader sx={{ border: "1px solid grey", borderRadius: 1 }}>
                Delivered
              </ListSubheader>
              {allJobs
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
                  border: "1px solid #ca001e",
                  borderLeft: "6px solid #ca001e",
                  my: 0.5,
                  py: 0.5,
                  "&:hover": {
                    bgcolor: "#ffebee",
                  },
                },
              }}
            >
              <ListSubheader>Estimation Pending</ListSubheader>

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
              <ListSubheader>Submit Pending</ListSubheader>
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
              <ListSubheader>Submitted</ListSubheader>
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
              <ListSubheader>Not Bidding</ListSubheader>
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
      </Box>
    </Box>
  );
}
