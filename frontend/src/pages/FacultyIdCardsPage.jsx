import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  DownloadRounded,
  PictureAsPdfRounded,
} from "@mui/icons-material";

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

import Layout from "../Layout";
import { PageHeader } from "../ui";
import {
  api,
  errorMessage,
} from "../api";
import TemplateRenderer from "../TemplateRenderer";

function fileBase(faculty) {
  const source =
    faculty?.employeeCode ||
    faculty?.name ||
    "faculty";

  return String(source)
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-");
}

function facultyLabel(faculty) {
  return [
    faculty.name,
    faculty.employeeCode,
    faculty.designation,
  ]
    .filter(Boolean)
    .join(" · ");
}

export default function FacultyIdCardsPage({
  user,
  onLogout,
}) {
  const cardRef = useRef(null);

  const [facultyList, setFacultyList] =
    useState([]);
  const [facultyId, setFacultyId] =
    useState("");
  const [school, setSchool] =
    useState({});
  const [templates, setTemplates] =
    useState([]);
  const [settings, setSettings] =
    useState({});
  const [quota, setQuota] =
    useState({
      limit: 20,
      used: 0,
      remaining: 0,
    });
  const [error, setError] =
    useState("");

  useEffect(() => {
    Promise.all([
      api.get("/faculty"),
      api.get("/school/profile"),
      api.get("/faculty-templates"),
      api.get(
        "/school/faculty-template-settings"
      ),
      api.get(
        "/school/id-card-quota"
      ),
    ])
      .then(([
        facultyResponse,
        schoolResponse,
        templatesResponse,
        settingsResponse,
        quotaResponse,
      ]) => {
        const list =
          facultyResponse.data.data || [];

        setFacultyList(list);
        setSchool(
          schoolResponse.data.data || {}
        );
        setTemplates(
          templatesResponse.data.data || []
        );
        setSettings(
          settingsResponse.data.data || {}
        );
        setQuota(
          quotaResponse.data.data || {
            limit: 20,
            used: 0,
            remaining: 0,
          }
        );

        if (list[0]) {
          setFacultyId(list[0]._id);
        }
      })
      .catch((e) =>
        setError(errorMessage(e))
      );
  }, []);

  const faculty = useMemo(
    () =>
      facultyList.find(
        (item) =>
          item._id === facultyId
      ),
    [facultyList, facultyId]
  );

  const template = useMemo(() => {
    const selectedId =
      settings.facultyTemplateId?._id ||
      settings.facultyTemplateId;

    return (
      templates.find(
        (item) =>
          item._id === selectedId
      ) || templates[0]
    );
  }, [templates, settings]);

  const selectTemplate =
    async (templateId) => {
      try {
        const response =
          await api.put(
            "/school/faculty-template-settings",
            { templateId }
          );

        setSettings(
          response.data.data
        );
      } catch (e) {
        setError(errorMessage(e));
      }
    };

  const consumeCredit = async () => {
    const response =
      await api.post(
        "/school/id-card-quota/consume",
        { count: 1 }
      );

    setQuota(
      response.data.data
    );
  };

  const capture = async () => {
    await new Promise((resolve) =>
      setTimeout(resolve, 350)
    );

    return html2canvas(
      cardRef.current,
      {
        scale: 3,
        backgroundColor: "#fff",
        useCORS: true,
      }
    );
  };

  const markGenerated = async () => {
    await api.patch(
      `/faculty/${faculty._id}/card-generated`
    );
  };

  const downloadPng = async () => {
    try {
      const canvas = await capture();
      await consumeCredit();

      const link =
        document.createElement("a");
      link.download =
        `${fileBase(faculty)}-faculty-id.png`;
      link.href =
        canvas.toDataURL("image/png");
      link.click();

      await markGenerated();
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  const downloadPdf = async () => {
    try {
      const canvas = await capture();
      await consumeCredit();

      const portrait =
        template.orientation !==
        "landscape";
      const width =
        portrait ? 53.98 : 85.6;
      const height =
        portrait ? 85.6 : 53.98;

      const pdf = new jsPDF({
        orientation:
          portrait
            ? "portrait"
            : "landscape",
        unit: "mm",
        format: [width, height],
      });

      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        0,
        0,
        width,
        height
      );

      pdf.save(
        `${fileBase(faculty)}-faculty-id.pdf`
      );

      await markGenerated();
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  return (
    <Layout
      user={user}
      onLogout={onLogout}
    >
      <PageHeader
        eyebrow="Faculty ID Studio"
        title="Generate faculty / staff ID card"
        description="20 dedicated faculty templates: 10 English and 10 Marathi. PNG/PDF downloads use the same school ID-card balance."
      />

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      <Alert
        severity={
          quota.remaining === 0
            ? "error"
            : quota.remaining <= 5
            ? "warning"
            : "info"
        }
        sx={{ mb: 2 }}
      >
        ID card balance: <strong>{quota.remaining}</strong> remaining out of {quota.limit}. Faculty PNG/PDF downloads use 1 credit each.
      </Alert>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <TextField
                  select
                  label="Faculty / Staff"
                  value={facultyId}
                  onChange={(event) =>
                    setFacultyId(
                      event.target.value
                    )
                  }
                >
                  {facultyList.map(
                    (item) => (
                      <MenuItem
                        key={item._id}
                        value={item._id}
                      >
                        {facultyLabel(item)}
                      </MenuItem>
                    )
                  )}
                </TextField>

                <TextField
                  select
                  label="Faculty template"
                  value={template?._id || ""}
                  onChange={(event) =>
                    selectTemplate(
                      event.target.value
                    )
                  }
                >
                  {templates.map(
                    (item) => (
                      <MenuItem
                        key={item._id}
                        value={item._id}
                      >
                        {item.name} · {item.language === "MR" ? "मराठी" : "English"} · {item.orientation}
                      </MenuItem>
                    )
                  )}
                </TextField>

                {faculty && (
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ flexWrap: "wrap", gap: 1 }}
                  >
                    <Chip
                      label={faculty.staffType}
                      variant="outlined"
                    />
                    {faculty.designation && (
                      <Chip
                        label={faculty.designation}
                        variant="outlined"
                      />
                    )}
                  </Stack>
                )}

                <Button
                  variant="outlined"
                  startIcon={<DownloadRounded />}
                  disabled={
                    !faculty ||
                    !template ||
                    quota.remaining <= 0
                  }
                  onClick={downloadPng}
                >
                  Download PNG
                </Button>

                <Button
                  variant="contained"
                  startIcon={<PictureAsPdfRounded />}
                  disabled={
                    !faculty ||
                    !template ||
                    quota.remaining <= 0
                  }
                  onClick={downloadPdf}
                >
                  Download PDF
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6">
                Live preview
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                {template?.name}
              </Typography>

              <Box
                sx={{
                  minHeight: 650,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "#eef3f8",
                  overflow: "auto",
                  p: 3,
                }}
              >
                {faculty && template ? (
                  <Box ref={cardRef}>
                    <TemplateRenderer
                      template={template}
                      faculty={faculty}
                      school={school}
                      targetWidth={
                        template.orientation ===
                        "landscape"
                          ? 520
                          : 330
                      }
                    />
                  </Box>
                ) : (
                  <Typography color="text.secondary">
                    Add a faculty / staff record first.
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
}
