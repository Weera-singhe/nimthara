import React from "react";
import { Box, Divider, List, ListItemText, Typography } from "@mui/material";

export default function JobTicket({ j }) {
  const jobfileTag = (i) => String(i || 0).padStart(5, "0");
  const inf = j?.job_info;

  const bd = { border: "1px solid black" };
  const bdt = { borderTop: "1px solid black" };
  const mid = { alignContent: "center" };
  const blnk = {
    color: "darkblue",
    borderBottom: "1px solid black",
    display: "inline-block",
    minWidth: "100%",
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          ...bd,
          mx: 3,
          mt: 3,
          display: "flex",
          height: "5%",
        }}
      >
        <Box
          sx={{
            ...bd,
            flex: "0 0 30%",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Typography variant="h4" sx={{ mx: 2 }}>
            Qty
          </Typography>
          <Typography variant="h6" sx={{ color: "darkblue" }}>
            {inf?.unit_count?.toLocaleString?.() ?? ""}
          </Typography>
        </Box>

        <Box
          sx={{
            ...bd,
            flex: "0 0 40%",
            bgcolor: "black",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="h3" color="white" fontWeight="bold">
            JOB TICKET
          </Typography>
        </Box>

        <Box
          sx={{
            ...bd,
            flex: "0 0 30%",
            display: "flex",
            alignItems: "center",
            px: 5,
          }}
        >
          <Typography
            sx={{
              wordBreak: "break-all",
              overflowWrap: "anywhere",
              color: "darkblue",
            }}
          >
            #
            {!!j?.file_id &&
              jobfileTag(j?.file_id) + "_" + (j?.job_code || j?.job_index)}
          </Typography>
        </Box>
      </Box>

      {/* Middle*/}
      <Box sx={{ ...bd, mx: 3, display: "flex", height: "70%" }}>
        {/* Left 60% */}
        <Box sx={{ ...bd, flex: "0 0 60%" }}>
          <Box
            id="abc"
            sx={{
              height: "100%",
              display: "grid",
              gridTemplateRows: "5% 5% 5% 85%",
            }}
          >
            <Box sx={{ ...bd, display: "flex" }}>
              <Box sx={{ px: 1, ...mid, flexShrink: 0 }}>
                <Typography variant="h6">Customer : </Typography>
              </Box>
              <Box sx={{ ...mid, flex: 1, pr: 1 }}>
                <Typography sx={{ ...blnk }} id="cusomerName">
                  {j?.customer_id === 1
                    ? j?.unreg_customer || "Unregistered"
                    : j?.customer_name || j?.cus_name_short}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ ...bd, display: "flex" }}>
              <Box sx={{ px: 1, ...mid, flexShrink: 0 }}>
                <Typography variant="h6">PO No : </Typography>
              </Box>
              <Box sx={{ ...mid, flex: 1 }}>
                <Typography sx={{ ...blnk }}>{j?.po?.code}</Typography>
              </Box>
              <Box sx={{ px: 1, ...mid, flexShrink: 0 }}>
                <Typography variant="h6">PO Date : </Typography>
              </Box>
              <Box sx={{ ...mid, pr: 1, flex: 0.3 }}>
                <Typography sx={{ ...blnk }}>{j?.po?.when}</Typography>
              </Box>
            </Box>
            <Box sx={{ ...bd, display: "flex" }}>
              <Box sx={{ px: 1, ...mid, flexShrink: 0 }}>
                <Typography variant="h6">Size : </Typography>
              </Box>
              <Box sx={{ ...mid, flex: 1, pr: 1 }}>
                <Typography sx={{ ...blnk }}></Typography>
              </Box>
            </Box>
            {/* rest of lef*/}
            <Box
              sx={{
                height: "100%",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box sx={{ display: "flex", minHeight: "15%" }}>
                <Box sx={{ p: 1 }}>
                  <Typography variant="h6">Materials : </Typography>
                </Box>
                <Box sx={{ flex: 1, pt: 1.5, pr: 1 }}>
                  <List sx={{ p: 0 }}>
                    {/* <ListItemText sx={{ m: 0, ...blnk }}> mate 1</ListItemText>
                    <ListItemText sx={{ m: 0, ...blnk }}>
                      {"\u00A0"}
                    </ListItemText>
                    <ListItemText sx={{ m: 0, ...blnk }}>
                      {"\u00A0"}
                    </ListItemText>
                    <ListItemText sx={{ m: 0, ...blnk }}>
                      {"\u00A0"}
                    </ListItemText>
                    <ListItemText sx={{ m: 0, ...blnk }}>
                      {"\u00A0"}
                    </ListItemText> */}
                  </List>
                </Box>
              </Box>

              <Box sx={{ ...bdt, display: "flex", minHeight: "15%" }}>
                <Box sx={{ p: 1 }}>
                  <Typography variant="h6">Machine : </Typography>
                </Box>
                <Box sx={{ pt: 1.5, flex: 1 }}>
                  <Typography sx={{ color: "darkblue" }}>
                    {inf?.machine?.map((j, i) => (
                      <span key={i}>
                        <b>{j.ty}</b>
                        {j.dt && " - " + j.dt}
                        {i < inf.machine.length - 1 && " | "}
                      </span>
                    ))}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ ...bdt, display: "flex", minHeight: "15%" }}>
                <Box sx={{ p: 1 }}>
                  <Typography variant="h6">Finishing : </Typography>
                </Box>
                <Box sx={{ pt: 1.5, flex: 1 }}>
                  <Typography sx={{ color: "darkblue" }}>
                    {inf?.finishing?.map((j, i) => (
                      <span key={i}>
                        <b>{j.ty}</b>
                        {j.dt && " - " + j.dt}
                        {i < inf.finishing.length - 1 && " | "}
                      </span>
                    ))}
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  ...bdt,
                  display: "flex",
                  flex: 1,
                  minHeight: 0,
                  overflow: "auto",
                }}
              >
                <Box sx={{ p: 1 }}>
                  <Typography variant="h6">Others : </Typography>
                </Box>

                <Box sx={{ pt: 1.5, flex: 1 }}>
                  <Typography sx={{ color: "darkblue" }}>
                    {inf?.others?.map((j, i) => (
                      <span key={i}>
                        <b>{j.ty}</b>
                        {j.dt && " - " + j.dt}
                        {i < inf.others.length - 1 && " | "}
                      </span>
                    ))}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", px: 1, ...bdt, height: "3%" }}>
                <Typography variant="h6">Stock Log : </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  px: 1,
                  minHeight: "30%",
                }}
              >
                <List sx={{ p: 0 }}></List>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Right 40% */}
        <Box sx={{ ...bd, flex: "0 0 40%" }} />
      </Box>

      {/* Bottom */}
      <Box
        sx={{
          ...bd,
          flex: 1,
          mx: 3,
          mb: 3,
          backgroundSize: "4mm 4mm",
          backgroundImage:
            "linear-gradient(to right, #c0d4ff 1px, transparent 1px), linear-gradient(to bottom, #c0d4ff 1px, transparent 1px)",
        }}
      />
    </Box>
  );
}
