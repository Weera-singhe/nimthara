// ✅ Beginner-friendly Materials Form (MUI)
// - Unlimited materials stored in: form.material
// - Add one at a time (type + details)
// - Edit / Delete anytime

import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect } from "react";

export default function MaterialsForm() {
  // ✅ CHANGE MADE: form state contains `material` array
  const [form, setForm] = useState({
    material: [], // [{ id, type, details }]
  });

  // ✅ CHANGE MADE: input state for adding new material
  const [newMat, setNewMat] = useState({
    type: "",
    details: "",
  });

  // ✅ CHANGE MADE: edit state (which item is being edited)
  const [editId, setEditId] = useState(null);

  // ✅ CHANGE MADE: edit draft inputs
  const [editDraft, setEditDraft] = useState({
    type: "",
    details: "",
  });

  // ✅ helper: simple unique id
  const makeId = () => `${Date.now()}_${Math.random().toString(16).slice(2)}`;

  const canAdd = useMemo(() => {
    return newMat.type.trim() !== "" && newMat.details.trim() !== "";
  }, [newMat]);

  // ✅ CHANGE MADE: add one material to form.material
  const handleAddMaterial = () => {
    if (!canAdd) return;

    const item = {
      id: makeId(),
      type: newMat.type.trim(),
      details: newMat.details.trim(),
    };

    setForm((prev) => ({
      ...prev,
      material: [...(prev.material || []), item],
    }));

    // clear inputs after add
    setNewMat({ type: "", details: "" });
  };

  // ✅ CHANGE MADE: delete any material by id
  const handleDelete = (id) => {
    // if deleting the one currently being edited, cancel edit
    if (editId === id) {
      setEditId(null);
      setEditDraft({ type: "", details: "" });
    }

    setForm((prev) => ({
      ...prev,
      material: (prev.material || []).filter((m) => m.id !== id),
    }));
  };

  // ✅ CHANGE MADE: start editing
  const handleStartEdit = (item) => {
    setEditId(item.id);
    setEditDraft({ type: item.type, details: item.details });
  };

  // ✅ CHANGE MADE: cancel editing
  const handleCancelEdit = () => {
    setEditId(null);
    setEditDraft({ type: "", details: "" });
  };

  const canSaveEdit = useMemo(() => {
    if (editId === null) return false;
    return editDraft.type.trim() !== "" && editDraft.details.trim() !== "";
  }, [editId, editDraft]);

  // ✅ CHANGE MADE: save edited values
  const handleSaveEdit = () => {
    if (!canSaveEdit) return;

    setForm((prev) => ({
      ...prev,
      material: (prev.material || []).map((m) =>
        m.id === editId
          ? {
              ...m,
              type: editDraft.type.trim(),
              details: editDraft.details.trim(),
            }
          : m,
      ),
    }));

    handleCancelEdit();
  };
  useEffect(() => {
    console.log("temp", form);
  }, [form]);

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 2 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Materials
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
            Add materials one by one. Each material needs a <b>Type</b> and{" "}
            <b>Details</b>. You can edit or delete anytime.
          </Typography>

          {/* ADD NEW MATERIAL */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Material Type"
              value={newMat.type}
              onChange={(e) =>
                setNewMat((p) => ({ ...p, type: e.target.value }))
              }
              fullWidth
              size="small"
            />
            <TextField
              label="Details"
              value={newMat.details}
              onChange={(e) =>
                setNewMat((p) => ({ ...p, details: e.target.value }))
              }
              fullWidth
              size="small"
            />
            <Button
              variant="contained"
              onClick={handleAddMaterial}
              disabled={!canAdd}
              sx={{ minWidth: 140 }}
            >
              Add
            </Button>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* MATERIAL LIST */}
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Added Materials ({form.material?.length || 0})
          </Typography>

          {(form.material?.length || 0) === 0 ? (
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              No materials added yet.
            </Typography>
          ) : (
            <List>
              {form.material.map((m, index) => {
                const isEditing = editId === m.id;

                return (
                  <React.Fragment key={m.id}>
                    <ListItem alignItems="flex-start">
                      {/* VIEW MODE */}
                      {!isEditing ? (
                        <>
                          <ListItemText
                            primary={`${index + 1}. ${m.type}`}
                            secondary={m.details}
                          />

                          <ListItemSecondaryAction>
                            <Tooltip title="Edit">
                              <IconButton onClick={() => handleStartEdit(m)}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton onClick={() => handleDelete(m.id)}>
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </ListItemSecondaryAction>
                        </>
                      ) : (
                        /* EDIT MODE */
                        <Box sx={{ width: "100%" }}>
                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={2}
                            sx={{ mb: 1 }}
                          >
                            <TextField
                              label="Material Type"
                              value={editDraft.type}
                              onChange={(e) =>
                                setEditDraft((p) => ({
                                  ...p,
                                  type: e.target.value,
                                }))
                              }
                              fullWidth
                              size="small"
                            />
                            <TextField
                              label="Details"
                              value={editDraft.details}
                              onChange={(e) =>
                                setEditDraft((p) => ({
                                  ...p,
                                  details: e.target.value,
                                }))
                              }
                              fullWidth
                              size="small"
                            />
                          </Stack>

                          <Stack direction="row" spacing={1}>
                            <Button
                              variant="contained"
                              startIcon={<SaveIcon />}
                              onClick={handleSaveEdit}
                              disabled={!canSaveEdit}
                            >
                              Save
                            </Button>
                            <Button
                              variant="outlined"
                              startIcon={<CloseIcon />}
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="text"
                              color="error"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleDelete(m.id)}
                            >
                              Delete
                            </Button>
                          </Stack>
                        </Box>
                      )}
                    </ListItem>

                    {index !== form.material.length - 1 && <Divider />}
                  </React.Fragment>
                );
              })}
            </List>
          )}

          <Divider sx={{ my: 2 }} />

          {/* DEBUG VIEW (optional) */}
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Current form state (for testing)
          </Typography>
          <Box
            component="pre"
            sx={{
              p: 2,
              bgcolor: "rgba(0,0,0,0.04)",
              borderRadius: 2,
              overflow: "auto",
              fontSize: 12,
              m: 0,
            }}
          >
            {JSON.stringify(form, null, 2)}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
