import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import Layout from "../Layout";
import { PageHeader } from "../ui";
import {
  api,
  errorMessage,
} from "../api";
import TemplateRenderer from "../TemplateRenderer";

const sampleStudent = {
  name: "Aarav Sharma",
  admissionNo: "GVPS001",
  rollNo: "12",
  className: "6",
  division: "A",
  dob: "2014-08-12",
  bloodGroup: "O+",
  academicYear: "2026-2027",
  parentName: "Rajesh Sharma",
  parentMobile: "9876543210",
  photoFileId: null,
};

const sampleSchool = {
  name: "Green Valley Public School",
  schoolCode: "GVPS",
  tagline: "Learn • Grow • Achieve",
  academicYear: "2026-2027",
  logoFileId: null,
};

export default function TemplatesPage({
  user,
  onLogout,
}) {
  const [
    templates,
    setTemplates,
  ] = useState([]);

  const [
    settings,
    setSettings,
  ] = useState({});

  const [
    school,
    setSchool,
  ] = useState(
    sampleSchool
  );

  const [
    previewStudent,
    setPreviewStudent,
  ] = useState(
    sampleStudent
  );

  const [
    category,
    setCategory,
  ] = useState("ALL");

  const [
    error,
    setError,
  ] = useState("");

  const load = async () => {
    setError("");

    try {
      const [
        templatesResponse,
        settingsResponse,
        profileResponse,
        studentsResponse,
      ] = await Promise.all([
        api.get("/templates"),
        api.get(
          "/school/template-settings"
        ),
        api.get(
          "/school/profile"
        ),
        api.get("/students"),
      ]);

      setTemplates(
        templatesResponse
          .data.data ||
          []
      );

      setSettings(
        settingsResponse
          .data.data ||
          {}
      );

      setSchool({
        ...sampleSchool,
        ...(profileResponse
          .data.data ||
          {}),
      });

      const firstStudent =
        studentsResponse
          .data.data?.[0];

      setPreviewStudent(
        firstStudent
          ? {
              ...sampleStudent,
              ...firstStudent,
            }
          : sampleStudent
      );
    } catch (e) {
      setError(
        errorMessage(e)
      );
    }
  };

  useEffect(() => {
    load();
  }, []);

  const categories =
    useMemo(
      () => [
        "ALL",
        ...Array.from(
          new Set(
            templates.map(
              (template) =>
                template.type ===
                "CUSTOM"
                  ? "Custom"
                  : template.category ||
                    "Other"
            )
          )
        ),
      ],
      [templates]
    );

  const filtered =
    category === "ALL"
      ? templates
      : templates.filter(
          (template) =>
            (template.type ===
            "CUSTOM"
              ? "Custom"
              : template.category) ===
            category
        );

  const selectedId =
    settings.templateId
      ?._id ||
    settings.templateId;

  const systemCount =
    templates.filter(
      (template) =>
        template.type ===
        "SYSTEM"
    ).length;

  const customCount =
    templates.filter(
      (template) =>
        template.type ===
        "CUSTOM"
    ).length;

  const choose =
    async (template) => {
      try {
        const response =
          await api.put(
            "/school/template-settings",
            {
              templateId:
                template._id,
            }
          );

        setSettings(
          response.data.data
        );
      } catch (e) {
        setError(
          errorMessage(e)
        );
      }
    };

  return (
    <Layout
      user={user}
      onLogout={onLogout}
    >
      <PageHeader
        eyebrow="ID Studio"
        title={`${systemCount} predefined templates${
          customCount
            ? ` + ${customCount} custom`
            : ""
        }`}
        description="Preview templates using your school profile and first student. If no student photo or school logo exists, a sample profile photo and sample logo are shown automatically."
      />

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      <Stack
        direction="row"
        spacing={1}
        sx={{
          mb: 2,
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        {categories.map(
          (item) => (
            <Button
              key={item}
              variant={
                category === item
                  ? "contained"
                  : "outlined"
              }
              onClick={() =>
                setCategory(item)
              }
            >
              {item}
            </Button>
          )
        )}
      </Stack>

      <Grid
        container
        spacing={2}
      >
        {filtered.map(
          (template) => {
            const selected =
              selectedId ===
              template._id;

            const previewWidth =
              template.orientation ===
              "landscape"
                ? 330
                : 215;

            return (
              <Grid
                item
                xs={12}
                md={6}
                xl={4}
                key={template._id}
              >
                <Card
                  sx={{
                    borderColor:
                      selected
                        ? "primary.main"
                        : "#e2e8f0",
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        minHeight: 370,
                        display: "grid",
                        placeItems:
                          "center",
                        bgcolor:
                          "#eef3f8",
                        overflow:
                          "hidden",
                        p: 2,
                      }}
                    >
                      <TemplateRenderer
                        template={
                          template
                        }
                        student={
                          previewStudent
                        }
                        school={
                          school
                        }
                        targetWidth={
                          previewWidth
                        }
                      />
                    </Box>

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mt: 2 }}
                    >
                      <Box>
                        <Typography
                          fontWeight={
                            900
                          }
                        >
                          {
                            template.name
                          }
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {
                            template.type
                          }{" "}
                          ·{" "}
                          {
                            template.layoutFamily
                          }{" "}
                          ·{" "}
                          {
                            template.orientation
                          }
                        </Typography>
                      </Box>

                      <Button
                        variant={
                          selected
                            ? "contained"
                            : "outlined"
                        }
                        onClick={() =>
                          choose(
                            template
                          )
                        }
                      >
                        {selected
                          ? "Selected"
                          : "Select"}
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          }
        )}
      </Grid>
    </Layout>
  );
}
