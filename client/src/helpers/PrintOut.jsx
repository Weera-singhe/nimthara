import React, { Children, useRef, useState } from "react";
import { Box, Button, Fab, Popover } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PrintIcon from "@mui/icons-material/Print";
import { useReactToPrint } from "react-to-print";

export default function PrintOut({ children, paperSize = "A5" }) {
  const [printOpened, setPrintOpened] = useState(false);
  const printRef = useRef(null);
  const PAPER = {
    A5: ["148mm", "210mm"],
    A4: ["210mm", "297mm"],
    A3: ["297mm", "420mm"],
    Letter: ["216mm", "279mm"],
  };
  const [width, height] = PAPER[paperSize];

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Paper Price List",
    pageStyle: `
      @page { size: ${paperSize}; margin: 0; }
      html, body { margin: 0; padding: 0; }
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    `,
  });
  return (
    <>
      <Button
        type="button"
        onClick={() => setPrintOpened(true)}
        variant="outlined"
        size="small"
      >
        <PrintIcon />
      </Button>

      <Popover
        transitionDuration={0}
        open={printOpened}
        anchorReference="none"
        onClose={() => setPrintOpened(false)}
        PaperProps={{
          sx: {
            position: "fixed",
            inset: "100px 15px 15px 15px",
            overflow: "auto",
            display: "flex",
            justifyContent: "center",
            backgroundColor: "grey",
          },
        }}
      >
        <Box
          ref={printRef}
          sx={{
            width,
            height,
            flexShrink: 0,
            boxSizing: "border-box",
            p: 1,
            backgroundColor: "white",
          }}
        >
          {children}
        </Box>
        <Fab
          color="error"
          onClick={() => setPrintOpened(false)}
          size="small"
          sx={{
            position: "fixed",
            top: 95,
            left: 10,
            zIndex: 1301,
          }}
        >
          <CloseRoundedIcon fontSize="small" />
        </Fab>
        <Fab
          color="primary"
          onClick={handlePrint}
          sx={{
            position: "fixed",
            bottom: 30,
            left: 30,
            zIndex: 1301,
          }}
        >
          <PrintIcon />
        </Fab>
      </Popover>
    </>
  );
}
