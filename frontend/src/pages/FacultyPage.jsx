import {
  useEffect,
  useState,
} from "react";

import {
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
} from "@mui/material";

import {
  AddRounded,
  DeleteOutlineRounded,
  EditRounded,
  SearchRounded,
} from "@mui/icons-material";

import {
  DataGrid,
} from "@mui/x-data-grid";

import {
  useNavigate,
} from "react-router-dom";

import Layout from "../Layout";
import { PageHeader } from "../ui";
import {
  api,
  errorMessage,
} from "../api";
import StoredImage from "../StoredImage";

export default function FacultyPage({
  user,
  onLogout,
}) {
  const navigate =
    useNavigate();

  const [rows, setRows] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [error, setError] =
    useState("");

  const load = () =>
    api
      .get("/faculty", {
        params: { search },
      })
      .then((response) => {
        setRows(
          response.data.data ||
            []
        );
      })
      .catch((e) =>
        setError(
          errorMessage(e)
        )
      );

  useEffect(() => {
    const timer =
      setTimeout(load, 250);

    return () =>
      clearTimeout(timer);
  }, [search]);

  const remove =
    async (row) => {
      if (
        !window.confirm(
          `Delete ${row.name}?`
        )
      ) {
        return;
      }

      try {
        await api.delete(
          `/faculty/${row._id}`
        );
        await load();
      } catch (e) {
        setError(
          errorMessage(e)
        );
      }
    };

  const columns = [
    {
      field: "photo",
      headerName: "",
      width: 64,
      sortable: false,
      renderCell: ({ row }) => (
        <StoredImage
          fileId={row.photoFileId}
          sx={{
            width: 40,
            height: 40,
            objectFit: "cover",
          }}
          fallback={
            <Avatar>
              {row.name?.[0]}
            </Avatar>
          }
        />
      ),
    },
    {
      field: "employeeCode",
      headerName: "Employee ID",
      width: 135,
      valueGetter: (value) =>
        value || "—",
    },
    {
      field: "name",
      headerName: "Faculty / Staff",
      minWidth: 210,
      flex: 1,
    },
    {
      field: "staffType",
      headerName: "Type",
      width: 135,
    },
    {
      field: "designation",
      headerName: "Designation",
      minWidth: 160,
      flex: 1,
      valueGetter: (value) =>
        value || "—",
    },
    {
      field: "mobile",
      headerName: "Mobile",
      width: 125,
      valueGetter: (value) =>
        value || "—",
    },
    {
      field: "status",
      headerName: "Status",
      width: 105,
      renderCell: ({ value }) => (
        <Chip
          size="small"
          label={value}
          color={
            value === "ACTIVE"
              ? "success"
              : "default"
          }
          variant="outlined"
        />
      ),
    },
    {
      field: "cardStatus",
      headerName: "ID Card",
      width: 115,
      renderCell: ({ value }) => (
        <Chip
          size="small"
          label={value}
          color={
            value === "GENERATED"
              ? "success"
              : "warning"
          }
          variant="outlined"
        />
      ),
    },
    {
      field: "actions",
      headerName: "",
      width: 110,
      sortable: false,
      renderCell: ({ row }) => (
        <>
          <Tooltip title="Edit">
            <IconButton
              onClick={() =>
                navigate(
                  `/school/faculty/${row._id}/edit`
                )
              }
            >
              <EditRounded />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete">
            <IconButton
              color="error"
              onClick={() =>
                remove(row)
              }
            >
              <DeleteOutlineRounded />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
  ];

  return (
    <Layout
      user={user}
      onLogout={onLogout}
    >
      <PageHeader
        eyebrow="Faculty & Staff"
        title="Faculty / staff directory"
        description="Manage teachers and school staff. Name and faculty type are mandatory; all other details are optional."
        action={
          <Button
            variant="contained"
            startIcon={<AddRounded />}
            onClick={() =>
              navigate(
                "/school/faculty/new"
              )
            }
          >
            Add faculty
          </Button>
        }
      />

      {error && (
        <Box sx={{ mb: 2, color: "error.main" }}>
          {error}
        </Box>
      )}

      <TextField
        sx={{
          mb: 2,
          width: 430,
          maxWidth: "100%",
        }}
        placeholder="Search faculty / कर्मचारी शोधा"
        value={search}
        onChange={(event) =>
          setSearch(
            event.target.value
          )
        }
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchRounded />
            </InputAdornment>
          ),
        }}
      />

      <Box
        sx={{
          height: 650,
          bgcolor: "#fff",
          border:
            "1px solid #e2e8f0",
        }}
      >
        <DataGrid
          rows={rows}
          getRowId={(row) => row._id}
          columns={columns}
          disableRowSelectionOnClick
        />
      </Box>
    </Layout>
  );
}
