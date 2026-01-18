import React from "react";
import { Box, Button, FormLabel, Stack, Typography } from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";

export default function MyFormBox({
  label,
  children,
  clickable = false,
  onPress,
  buttonType = "Save",
  sx = {},
  user,
  noBttn = false,
}) {
  return (
    <Box
      component="form"
      sx={{
        position: "relative",
        "& > :not(style)": { mx: 1, mt: 1.5, mb: 0.5 },
        my: 4,
        px: 1,
        pt: 3,
        display: "flex",
        flexWrap: "wrap",
        border: "1px solid grey",
        borderRadius: 2,
        ...sx,
      }}
    >
      {/* Floating Label */}
      <FormLabel
        sx={{
          position: "absolute",
          top: -23,
          left: 12,
          backgroundColor: "white",
          px: 1,
        }}
      >
        {label}
      </FormLabel>

      {/* User content goes here */}
      {children}

      {/* Save button */}
      {!noBttn ? (
        <Stack
          direction="row"
          flexWrap="wrap"
          gap={1}
          alignItems="center"
          sx={{ flexBasis: "100%" }}
        >
          <Button
            disabled={!clickable}
            startIcon={
              buttonType === "Save" ? (
                <SaveOutlinedIcon />
              ) : buttonType === "Upload" ? (
                <CloudUploadOutlinedIcon />
              ) : (
                <AddBoxOutlinedIcon />
              )
            }
            onClick={onPress}
          >
            {buttonType}
          </Button>
          {!!clickable && (
            <Typography variant="caption" color="primary">
              {`admin: ${user?.display_name}`}
            </Typography>
          )}
        </Stack>
      ) : (
        <Box sx={{ width: "100%" }} />
      )}
    </Box>
  );
}
