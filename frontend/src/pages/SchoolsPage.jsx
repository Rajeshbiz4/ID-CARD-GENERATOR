import { useEffect, useState } from "react";
import {
  Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  Grid, IconButton, Stack, TextField, Tooltip, Typography,
} from "@mui/material";
import { AddRounded, EditRounded, PowerSettingsNewRounded } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import Layout from "../Layout";
import { PageHeader } from "../ui";
import { api, errorMessage } from "../api";
import {
  MarathiTextField,
  TypingLanguageBar,
  useTypingLanguage,
} from "../MarathiTyping";

const DEFAULT_ID_CARD_LIMIT = 20;
const blank = {
  name: "", schoolCode: "", contactPersonName: "", email: "", mobile: "",
  address: "", city: "", state: "", pinCode: "", password: "School@123",
};

function quotaFor(row) {
  const limit = Number(row?.idCardQuota?.limit ?? row?.idCardLimit ?? DEFAULT_ID_CARD_LIMIT);
  const used = Number(row?.idCardQuota?.used ?? row?.idCardsUsed ?? 0);
  return { limit, used, remaining: Math.max(0, limit - used) };
}

export default function SchoolsPage({ user, onLogout }) {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);
  const [error, setError] = useState("");
  const [typingLanguage, setTypingLanguage] = useTypingLanguage();

  const [limitOpen, setLimitOpen] = useState(false);
  const [limitSchool, setLimitSchool] = useState(null);
  const [limitValue, setLimitValue] = useState(DEFAULT_ID_CARD_LIMIT);
  const [limitError, setLimitError] = useState("");

  const load = () =>
    api.get("/admin/schools")
      .then((response) => setRows(response.data.data || []))
      .catch((e) => setError(errorMessage(e)));

  useEffect(() => { load(); }, []);

  const create = async () => {
    setError("");
    try {
      await api.post("/admin/schools", form);
      setForm(blank);
      setOpen(false);
      await load();
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  const toggle = async (row) => {
    try {
      await api.patch(`/admin/schools/${row._id}/status`, {
        status: row.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
      });
      await load();
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  const openLimitDialog = (row) => {
    const quota = quotaFor(row);
    setLimitSchool(row);
    setLimitValue(quota.limit);
    setLimitError("");
    setLimitOpen(true);
  };

  const updateLimit = async () => {
    if (!limitSchool) return;
    const value = Number(limitValue);

    if (!Number.isInteger(value) || value < 0) {
      setLimitError("Enter a valid whole-number limit.");
      return;
    }

    const quota = quotaFor(limitSchool);
    if (value < quota.used) {
      setLimitError(`Limit cannot be below used cards (${quota.used}).`);
      return;
    }

    try {
      await api.patch(`/admin/schools/${limitSchool._id}/id-card-limit`, { limit: value });
      setLimitOpen(false);
      setLimitSchool(null);
      setLimitError("");
      await load();
    } catch (e) {
      setLimitError(errorMessage(e));
    }
  };

  const columns = [
    { field: "schoolCode", headerName: "School Code", width: 130 },
    { field: "name", headerName: "School Name", minWidth: 210, flex: 1 },
    { field: "email", headerName: "Login Email", minWidth: 210, flex: 1 },
    {
      field: "idCardLimit", headerName: "ID Limit", width: 95, sortable: false,
      valueGetter: (_value, row) => quotaFor(row).limit,
    },
    {
      field: "idCardsUsed", headerName: "Used", width: 82, sortable: false,
      valueGetter: (_value, row) => quotaFor(row).used,
    },
    {
      field: "idCardRemaining", headerName: "Remaining", width: 110, sortable: false,
      valueGetter: (_value, row) => quotaFor(row).remaining,
      renderCell: ({ row }) => {
        const remaining = quotaFor(row).remaining;
        return (
          <Chip
            size="small"
            label={remaining}
            color={remaining === 0 ? "error" : remaining <= 5 ? "warning" : "success"}
            variant="outlined"
          />
        );
      },
    },
    {
      field: "status", headerName: "Status", width: 110,
      renderCell: ({ value }) => (
        <Chip label={value} size="small" color={value === "ACTIVE" ? "success" : "default"} variant="outlined" />
      ),
    },
    {
      field: "actions", headerName: "Actions", width: 115, sortable: false, filterable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.25}>
          <Tooltip title="Update ID card limit">
            <IconButton onClick={() => openLimitDialog(row)}><EditRounded /></IconButton>
          </Tooltip>
          <Tooltip title={row.status === "ACTIVE" ? "Deactivate school" : "Activate school"}>
            <IconButton onClick={() => toggle(row)}><PowerSettingsNewRounded /></IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  const selectedQuota = quotaFor(limitSchool);

  return (
    <Layout user={user} onLogout={onLogout}>
      <PageHeader
        eyebrow="Admin"
        title="Schools"
        description="Register schools, manage login access and control each school's ID-card limit."
        action={
          <Button variant="contained" startIcon={<AddRounded />} onClick={() => { setError(""); setOpen(true); }}>
            Register school
          </Button>
        }
      />

      {error && !open && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ height: 620, bgcolor: "#fff", border: "1px solid #e2e8f0" }}>
        <DataGrid rows={rows} getRowId={(row) => row._id} columns={columns} disableRowSelectionOnClick />
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Register school</DialogTitle>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Alert severity="info" sx={{ mb: 2 }}>
            New schools automatically receive 20 ID-card download credits. You can increase the limit later from the Schools list.
          </Alert>
          <TypingLanguageBar value={typingLanguage} onChange={setTypingLanguage} />
          <Grid container spacing={2}>
            {[
              ["name", "School name", 8], ["schoolCode", "School code", 4],
              ["contactPersonName", "Contact person", 6], ["email", "Login email", 6],
              ["mobile", "Mobile", 6], ["password", "Temporary password", 6],
              ["address", "Address", 12], ["city", "City", 4], ["state", "State", 4], ["pinCode", "PIN", 4],
            ].map(([key, label, cols]) => (
              <Grid item xs={12} md={cols} key={key}>
                {["name", "contactPersonName", "address", "city", "state"].includes(key) ? (
                  <MarathiTextField
                    typingLanguage={typingLanguage}
                    label={label}
                    value={form[key]}
                    onValueChange={(value) => setForm({ ...form, [key]: value })}
                  />
                ) : (
                  <TextField fullWidth label={label} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
                )}
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={create}>Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={limitOpen} onClose={() => setLimitOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Update ID card limit</DialogTitle>
        <DialogContent dividers>
          {limitError && <Alert severity="error" sx={{ mb: 2 }}>{limitError}</Alert>}
          <Typography fontWeight={900}>{limitSchool?.name}</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1.5, mb: 2, flexWrap: "wrap", gap: 1 }}>
            <Chip label={`Current limit: ${selectedQuota.limit}`} variant="outlined" />
            <Chip label={`Used: ${selectedQuota.used}`} variant="outlined" />
            <Chip label={`Remaining: ${selectedQuota.remaining}`} color={selectedQuota.remaining === 0 ? "error" : "success"} variant="outlined" />
          </Stack>
          <TextField
            fullWidth
            type="number"
            label="New total limit"
            value={limitValue}
            onChange={(e) => setLimitValue(e.target.value)}
            inputProps={{ min: selectedQuota.used, step: 1 }}
            helperText="Set the total allowed ID-card downloads. It cannot be lower than the number already used."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLimitOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={updateLimit}>Update limit</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
