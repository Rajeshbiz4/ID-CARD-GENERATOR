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
import { api } from "../api";
import StoredImage from "../StoredImage";

export default function StudentsPage({
  user,
  onLogout,
}) {
  const navigate =
    useNavigate();

  const [
    rows,
    setRows,
  ] = useState([]);

  const [
    search,
    setSearch,
  ] = useState("");

  const load = () =>
    api
      .get(
        "/students",
        {
          params: {
            search,
          },
        }
      )
      .then((response) =>
        setRows(
          response.data.data
        )
      );

  useEffect(() => {
    const timer =
      setTimeout(
        load,
        250
      );

    return () =>
      clearTimeout(timer);
  }, [search]);

  const remove =
    async (row) => {
      if (
        !window.confirm(
          `Remove ${row.name}?`
        )
      ) {
        return;
      }

      await api.delete(
        `/students/${row._id}`
      );

      load();
    };

  const columns = [
    {
      field: "photo",
      headerName: "",
      width: 64,
      sortable: false,
      renderCell: ({
        row,
      }) => (
        <StoredImage
          fileId={
            row.photoFileId
          }
          sx={{
            width: 40,
            height: 40,
            objectFit: "cover",
          }}
          fallback={
            <Avatar>
              {
                row.name?.[0]
              }
            </Avatar>
          }
        />
      ),
    },
    {
      field: "admissionNo",
      headerName:
        "Admission No.",
      width: 150,
      valueGetter: (
        value
      ) => value || "—",
    },
    {
      field: "name",
      headerName:
        "Student",
      minWidth: 220,
      flex: 1,
    },
    {
      field: "className",
      headerName: "Class",
      width: 90,
      valueGetter: (
        value
      ) => value || "—",
    },
    {
      field: "division",
      headerName:
        "Division",
      width: 90,
      valueGetter: (
        value
      ) => value || "—",
    },
    {
      field: "rollNo",
      headerName: "Roll",
      width: 80,
      valueGetter: (
        value
      ) => value || "—",
    },
    {
      field: "cardStatus",
      headerName:
        "ID Card",
      width: 120,
      renderCell: ({
        value,
      }) => (
        <Chip
          label={value}
          size="small"
          variant="outlined"
          color={
            value ===
            "PENDING"
              ? "warning"
              : "success"
          }
        />
      ),
    },
    {
      field: "actions",
      headerName: "",
      width: 110,
      sortable: false,
      renderCell: ({
        row,
      }) => (
        <>
          <IconButton
            onClick={() =>
              navigate(
                `/school/students/${row._id}/edit`
              )
            }
          >
            <EditRounded />
          </IconButton>

          <IconButton
            color="error"
            onClick={() =>
              remove(row)
            }
          >
            <DeleteOutlineRounded />
          </IconButton>
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
        eyebrow="Students"
        title="Student directory"
        description="Search English or Marathi names. Only the student name is mandatory when creating a record."
        action={
          <Button
            variant="contained"
            startIcon={
              <AddRounded />
            }
            onClick={() =>
              navigate(
                "/school/students/new"
              )
            }
          >
            Add student
          </Button>
        }
      />

      <TextField
        sx={{
          mb: 2,
          width: 430,
          maxWidth: "100%",
        }}
        placeholder="Search student / विद्यार्थी शोधा"
        value={search}
        onChange={(
          event
        ) =>
          setSearch(
            event.target
              .value
          )
        }
        inputProps={{
          lang: "mr",
        }}
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
          getRowId={(
            row
          ) => row._id}
          columns={
            columns
          }
          disableRowSelectionOnClick
        />
      </Box>
    </Layout>
  );
}
