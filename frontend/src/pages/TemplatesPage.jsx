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
  Chip,
  Grid,
  Pagination,
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

const PAGE_SIZE = 12;

const sampleStudents = {
  EN: {
    name:
      "Aarav Rajesh Sharma",
    admissionNo:
      "GVPS001",
    rollNo: "12",
    className: "6",
    division: "A",
    dob: "2014-08-12",
    bloodGroup: "O+",
    academicYear:
      "2026-2027",
    parentName:
      "Rajesh Sharma",
    parentMobile:
      "9876543210",
    photoFileId: null,
  },

  MR: {
    name:
      "अनुश्री आकाश पाटील",
    admissionNo:
      "GVPS001",
    rollNo: "१२",
    className: "६",
    division: "अ",
    dob: "2014-08-12",
    bloodGroup: "O+",
    academicYear:
      "२०२६-२०२७",
    parentName:
      "राजेश पाटील",
    parentMobile:
      "९८७६५४३२१०",
    photoFileId: null,
  },
};

const sampleSchools = {
  EN: {
    name:
      "Green Valley Public School",
    schoolCode: "GVPS",
    registrationNo:
      "27310304501",
    tagline:
      "Learn • Grow • Achieve",
    academicYear:
      "2026-2027",
    logoFileId: null,
    principalName:
      "Principal",
  },

  MR: {
    name:
      "ग्रीन व्हॅली पब्लिक स्कूल",
    schoolCode: "GVPS",
    registrationNo:
      "२७३१०३०४५०१",
    tagline:
      "ज्ञान • संस्कार • प्रगती",
    academicYear:
      "२०२६-२०२७",
    logoFileId: null,
    principalName:
      "मुख्याध्यापक",
  },
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
  ] = useState({});

  const [
    previewStudent,
    setPreviewStudent,
  ] = useState(null);

  const [
    category,
    setCategory,
  ] = useState("ALL");

  const [
    language,
    setLanguage,
  ] = useState("ALL");

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/templates"),
      api.get(
        "/school/template-settings"
      ),
      api.get(
        "/school/profile"
      ),
      api.get("/students"),
    ])
      .then(
        ([
          templateResponse,
          settingsResponse,
          profileResponse,
          studentsResponse,
        ]) => {
          setTemplates(
            templateResponse
              .data.data || []
          );

          setSettings(
            settingsResponse
              .data.data || {}
          );

          setSchool(
            profileResponse
              .data.data || {}
          );

          setPreviewStudent(
            studentsResponse
              .data.data?.[0] ||
              null
          );
        }
      )
      .catch((e) => {
        setError(
          errorMessage(e)
        );
      });
  }, []);

  const systemCount =
    templates.filter(
      (template) =>
        template.type ===
        "SYSTEM"
    ).length;

  const englishCount =
    templates.filter(
      (template) =>
        template.type ===
          "SYSTEM" &&
        template.language ===
          "EN"
    ).length;

  const marathiCount =
    templates.filter(
      (template) =>
        template.type ===
          "SYSTEM" &&
        template.language ===
          "MR"
    ).length;

  const customCount =
    templates.filter(
      (template) =>
        template.type ===
        "CUSTOM"
    ).length;

  const languageFiltered =
    useMemo(() => {
      if (
        language ===
        "CUSTOM"
      ) {
        return templates.filter(
          (template) =>
            template.type ===
            "CUSTOM"
        );
      }

      if (
        language === "EN" ||
        language === "MR"
      ) {
        return templates.filter(
          (template) =>
            template.type ===
              "SYSTEM" &&
            template.language ===
              language
        );
      }

      return templates;
    }, [
      templates,
      language,
    ]);

  const categories =
    useMemo(
      () => [
        "ALL",
        ...Array.from(
          new Set(
            languageFiltered.map(
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
      [languageFiltered]
    );

  const filtered =
    useMemo(() => {
      if (
        category ===
        "ALL"
      ) {
        return languageFiltered;
      }

      return languageFiltered.filter(
        (template) =>
          (
            template.type ===
            "CUSTOM"
              ? "Custom"
              : template.category
          ) === category
      );
    }, [
      languageFiltered,
      category,
    ]);

  const pageCount =
    Math.max(
      1,
      Math.ceil(
        filtered.length /
          PAGE_SIZE
      )
    );

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [
    page,
    pageCount,
  ]);

  const visibleTemplates =
    useMemo(() => {
      const start =
        (page - 1) *
        PAGE_SIZE;

      return filtered.slice(
        start,
        start + PAGE_SIZE
      );
    }, [
      filtered,
      page,
    ]);

  const selectedId =
    settings.templateId
      ?._id ||
    settings.templateId;

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

  const changeLanguage =
    (value) => {
      setLanguage(value);
      setCategory("ALL");
      setPage(1);
    };

  const changeCategory =
    (value) => {
      setCategory(value);
      setPage(1);
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
        description={`${englishCount} English + ${marathiCount} Marathi templates. Every predefined card has dedicated school-logo, student-photo and 200×100 signature zones. Long text auto-fits without overlapping.`}
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
        direction={{
          xs: "column",
          md: "row",
        }}
        spacing={1}
        sx={{
          mb: 2,
          alignItems: {
            xs:
              "stretch",
            md:
              "center",
          },
        }}
      >
        <Typography
          sx={{
            fontWeight: 900,
            mr: 1,
          }}
        >
          Language
        </Typography>

        {[
          [
            "ALL",
            `All (${templates.length})`,
          ],
          [
            "EN",
            `English (${englishCount})`,
          ],
          [
            "MR",
            `मराठी (${marathiCount})`,
          ],
          [
            "CUSTOM",
            `Custom (${customCount})`,
          ],
        ].map(
          ([
            value,
            label,
          ]) => (
            <Button
              key={value}
              variant={
                language ===
                value
                  ? "contained"
                  : "outlined"
              }
              onClick={() =>
                changeLanguage(
                  value
                )
              }
            >
              {label}
            </Button>
          )
        )}
      </Stack>

      <Stack
        direction="row"
        spacing={1}
        sx={{
          mb: 2.5,
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        {categories.map(
          (item) => (
            <Button
              key={item}
              size="small"
              variant={
                category ===
                item
                  ? "contained"
                  : "outlined"
              }
              onClick={() =>
                changeCategory(
                  item
                )
              }
            >
              {item}
            </Button>
          )
        )}
      </Stack>

      {filtered.length ===
      0 ? (
        <Alert severity="info">
          No templates are available for this filter.
        </Alert>
      ) : (
        <>
          <Grid
            container
            spacing={2}
          >
            {visibleTemplates.map(
              (template) => {
                const selected =
                  String(
                    selectedId ||
                      ""
                  ) ===
                  String(
                    template._id
                  );

                const isLandscape =
                  template.orientation ===
                  "landscape";

                const templateLanguage =
                  template.language ===
                  "MR"
                    ? "MR"
                    : "EN";

                const cardStudent =
                  previewStudent ||
                  sampleStudents[
                    templateLanguage
                  ];

                const cardSchool =
                  Object.keys(
                    school || {}
                  ).length
                    ? {
                        ...sampleSchools[
                          templateLanguage
                        ],
                        ...school,
                      }
                    : sampleSchools[
                        templateLanguage
                      ];

                return (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    lg={4}
                    xl={3}
                    key={
                      template._id
                    }
                  >
                    <Card
                      sx={{
                        height:
                          "100%",
                        border:
                          selected
                            ? "2px solid"
                            : "1px solid",
                        borderColor:
                          selected
                            ? "primary.main"
                            : "#dbe3ec",
                      }}
                    >
                      <CardContent>
                        <Box
                          sx={{
                            minHeight:
                              isLandscape
                                ? 230
                                : 360,
                            display:
                              "grid",
                            placeItems:
                              "center",
                            bgcolor:
                              "#eef3f8",
                            overflow:
                              "hidden",
                            p: 1.5,
                          }}
                        >
                          <TemplateRenderer
                            template={
                              template
                            }
                            student={
                              cardStudent
                            }
                            school={
                              cardSchool
                            }
                            targetWidth={
                              isLandscape
                                ? 300
                                : 195
                            }
                            previewMode
                          />
                        </Box>

                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          spacing={1}
                          sx={{
                            mt: 1.5,
                          }}
                        >
                          <Box
                            sx={{
                              minWidth:
                                0,
                            }}
                          >
                            <Typography
                              fontWeight={
                                900
                              }
                              sx={{
                                lineHeight:
                                  1.25,
                              }}
                            >
                              {
                                template.name
                              }
                            </Typography>

                            <Stack
                              direction="row"
                              spacing={0.7}
                              sx={{
                                mt: 0.7,
                                flexWrap:
                                  "wrap",
                                gap: 0.5,
                              }}
                            >
                              <Chip
                                size="small"
                                variant="outlined"
                                label={
                                  template.type ===
                                  "CUSTOM"
                                    ? "Custom"
                                    : template.language ===
                                      "MR"
                                    ? "मराठी"
                                    : "English"
                                }
                              />

                              <Chip
                                size="small"
                                variant="outlined"
                                label={
                                  template.orientation
                                }
                              />
                            </Stack>
                          </Box>

                          <Button
                            size="small"
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

          {pageCount > 1 && (
            <Stack
              alignItems="center"
              sx={{
                mt: 3,
                mb: 1,
              }}
            >
              <Pagination
                count={
                  pageCount
                }
                page={page}
                onChange={(
                  _event,
                  value
                ) =>
                  setPage(
                    value
                  )
                }
                color="primary"
                sx={{
                  "& .MuiPaginationItem-root": {
                    borderRadius: 0,
                  },
                }}
                showFirstButton
                showLastButton
              />

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  mt: 1,
                }}
              >
                Showing{" "}
                {(page - 1) *
                  PAGE_SIZE +
                  1}
                –
                {Math.min(
                  page *
                    PAGE_SIZE,
                  filtered.length
                )}{" "}
                of{" "}
                {
                  filtered.length
                }
              </Typography>
            </Stack>
          )}
        </>
      )}
    </Layout>
  );
}
