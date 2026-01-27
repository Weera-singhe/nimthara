import React from "react";
import { Box, Typography } from "@mui/material";

export default function JobTicket({ j }) {
  const jobfileTag = (i) => String(i || 0).padStart(5, "0");
  const inf = j?.job_info;

  const bd = { border: "1px solid black" };
  const bdt = { borderTop: "1px solid black" };
  const mid = { alignContent: "center" };

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
          <Typography variant="h6">
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
          <Typography sx={{ wordBreak: "break-all", overflowWrap: "anywhere" }}>
            {!!j?.file_id &&
              `#${jobfileTag(j?.file_id)}_${j?.job_code || j?.job_index}`}
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
              gridTemplateRows: "5% 5% 5% 5% 80%",
            }}
          >
            <Box sx={{ ...bd, display: "flex" }}>
              <Box sx={{ px: 1, ...mid, flexShrink: 0 }}>
                <Typography variant="h6">Customer : </Typography>
              </Box>
              <Box sx={{ ...mid }}>
                <Typography>
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
                <Typography>{j?.po?.code}</Typography>
              </Box>
              <Box sx={{ px: 1, ...mid, flexShrink: 0 }}>
                <Typography variant="h6">PO Date : </Typography>
              </Box>
              <Box sx={{ ...mid, pr: 1 }}>
                <Typography>{j?.po?.when}</Typography>
              </Box>
            </Box>
            <Box sx={{ ...bd, display: "flex" }}>
              <Box sx={{ px: 1, ...mid, flexShrink: 0 }}>
                <Typography variant="h6">Size : </Typography>
              </Box>
              <Box sx={{ ...mid }}>
                <Typography>Finished : 9" x 4.5" Unfolded :9" x 9"</Typography>
              </Box>
            </Box>
            {/* rest of lef*/}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                minHeight: 0,
              }}
            >
              <Box sx={{ display: "flex" }}>
                <Box sx={{ ...mid, px: 1 }}>
                  <Typography variant="h6">Materials : </Typography>
                </Box>
                <Box sx={{ ...mid }}>
                  <Typography></Typography>
                </Box>
              </Box>

              <Box sx={{ ...bdt, display: "flex" }}>
                <Box sx={{ ...mid, px: 1 }}>
                  <Typography variant="h6">Print : </Typography>
                </Box>
                <Box sx={{ ...mid }}>
                  <Typography></Typography>
                </Box>
              </Box>
              <Box sx={{ ...bdt, display: "flex" }}>
                <Box sx={{ ...mid, px: 1 }}>
                  <Typography variant="h6">Finishing : </Typography>
                </Box>
                <Box
                  id="kkk"
                  sx={{
                    ...mid,
                    bgcolor: "red",
                    flex: "0 0 40%",
                    overflow: "hidden",
                    flex: 1,
                    minHeight: 0,
                  }}
                >
                  <Typography></Typography>
                </Box>
              </Box>
              <Box sx={{ ...bdt, display: "flex", px: 1 }}>
                <Typography variant="h6">Others : </Typography>
              </Box>
              <Box sx={{ display: "flex", p: 1 }}>
                <Typography></Typography>
              </Box>
              <Box sx={{ display: "flex", px: 1, ...bdt }}>
                <Typography variant="h6">Stock Log : </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  p: 1,
                }}
              ></Box>
            </Box>
          </Box>
        </Box>

        {/* Right 40% */}
        <Box sx={{ ...bd, flex: "0 0 40%" }} />
      </Box>

      {/* Bottom */}
      <Box sx={{ ...bd, flex: 1, mx: 3, mb: 3 }} />
    </Box>
  );
}
