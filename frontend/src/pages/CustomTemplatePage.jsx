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
  Divider,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  AddRounded,
  DeleteOutlineRounded,
  SaveRounded,
  UploadFileRounded,
} from "@mui/icons-material";

import Layout from "../Layout";
import { PageHeader } from "../ui";

import {
  api,
  errorMessage,
  uploadImage,
} from "../api";

import TemplateRenderer from "../TemplateRenderer";

import {
  MarathiTextField,
  TypingLanguageBar,
  useTypingLanguage,
} from "../MarathiTyping";

const fieldOptions = [
  ["schoolLogo", "School Logo"],
  ["schoolName", "School Name / शाळेचे नाव"],
  ["schoolTagline", "School Tagline"],
  [
    "schoolRegistrationNo",
    "UDISE / Registration No.",
  ],
  [
    "principalName",
    "Principal Name / मुख्याध्यापक",
  ],
  ["studentPhoto", "Student Photo"],
  [
    "studentName",
    "Student Name / विद्यार्थ्याचे नाव",
  ],
  ["admissionNo", "Admission No."],
  ["rollNo", "Roll / Register No."],
  ["classDivision", "Class + Division"],
  ["dob", "Date of Birth"],
  ["bloodGroup", "Blood Group"],
  ["academicYear", "Academic Year"],
  ["parentName", "Parent Name"],
  ["parentMobile", "Parent Mobile"],
  ["qrCode", "QR Code"],
  [
    "principalSignature",
    "Principal Signature",
  ],
  ["customText", "Custom Text / मराठी मजकूर"],
];

const sampleStudent = {
  name: "अनुश्री आकाश पाटील",
  admissionNo: "GVPS001",
  rollNo: "12",
  className: "6",
  division: "A",
  dob: "2014-08-12",
  bloodGroup: "O+",
  academicYear: "2026-2027",
  parentName: "राजेश पाटील",
  parentMobile: "9876543210",
};

const sampleSchool = {
  name: "ग्रीन व्हॅली पब्लिक स्कूल",
  schoolCode: "GVPS",
  registrationNo: "27310304501",
  tagline: "Learn • Grow • Achieve",
  academicYear: "2026-2027",
  principalName: "मुख्याध्यापक",
};

function blankTemplate() {
  return {
    name: "My Custom Template",
    orientation: "portrait",
    width: 330,
    height: 520,
    backgroundColor: "#ffffff",
    backgroundFileId: null,
    decorations: [],
    elements:
      coreElements(
        "portrait"
      ),
  };
}

function makeElement(type) {
  const isImage = [
    "studentPhoto",
    "schoolLogo",
    "principalSignature",
  ].includes(type);

  const isQr =
    type === "qrCode";

  const isLongText = [
    "schoolName",
    "studentName",
    "customText",
  ].includes(type);

  return {
    id:
      `${type}-${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}`,
    type,
    x: 20,
    y: 20,
    width:
      isQr
        ? 70
        : type === "principalSignature"
        ? 200
        : type === "studentPhoto"
        ? 106
        : type === "schoolLogo"
        ? 52
        : 180,
    height:
      isQr
        ? 70
        : type === "principalSignature"
        ? 100
        : type === "studentPhoto"
        ? 126
        : type === "schoolLogo"
        ? 52
        : isLongText
        ? 44
        : 28,
    fontSize: 14,
    minFontSize: 7,
    fontWeight: 600,
    color: "#0f172a",
    backgroundColor:
      "transparent",
    textAlign: "left",
    borderWidth: 0,
    borderColor: "#0f172a",
    borderRadius: 0,
    objectFit:
      type === "schoolLogo" ||
      type ===
        "principalSignature"
        ? "contain"
        : "cover",
    prefix: "",
    customText:
      type ===
      "customText"
        ? "मराठी / Custom text"
        : "",
    multiline:
      isLongText,
    lineHeight: 1.12,
    letterSpacing: 0,
  };
}


function coreElements(
  orientation = "portrait"
) {
  const portrait = orientation === "portrait";

  return [
    {
      ...makeElement("schoolLogo"),
      id: "schoolLogo-core",
      x: 18,
      y: 18,
      width: 52,
      height: 52,
      objectFit: "contain",
    },
    {
      ...makeElement("studentPhoto"),
      id: "studentPhoto-core",
      x: portrait ? 112 : 24,
      y: portrait ? 118 : 88,
      width: portrait ? 106 : 112,
      height: portrait ? 126 : 118,
      objectFit: "cover",
    },
    {
      ...makeElement("principalSignature"),
      id: "principalSignature-core",
      x: portrait ? 120 : 310,
      y: portrait ? 394 : 218,
      width: 200,
      height: 100,
      objectFit: "contain",
    },
  ];
}

function ensureCoreElements(
  elements = [],
  orientation = "portrait"
) {
  const result = [
    ...elements,
  ];

  const existingTypes =
    new Set(
      result.map(
        (element) =>
          element.type
      )
    );

  coreElements(
    orientation
  ).forEach(
    (element) => {
      if (
        !existingTypes.has(
          element.type
        )
      ) {
        result.push(
          element
        );
      }
    }
  );

  return result;
}


export default function CustomTemplatePage({
  user,
  onLogout,
}) {
  const [
    templates,
    setTemplates,
  ] = useState([]);

  const [
    currentId,
    setCurrentId,
  ] = useState("");

  const [
    draft,
    setDraft,
  ] = useState(
    blankTemplate
  );

  const [
    fieldType,
    setFieldType,
  ] = useState(
    "studentName"
  );

  const [
    selectedId,
    setSelectedId,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const dragRef =
    useRef(null);

  const [
    typingLanguage,
    setTypingLanguage,
  ] = useTypingLanguage();

  const load = () =>
    api
      .get(
        "/custom-templates"
      )
      .then((response) =>
        setTemplates(
          response.data.data
        )
      )
      .catch((e) =>
        setError(
          errorMessage(e)
        )
      );

  useEffect(() => {
    load();
  }, []);

  const selected =
    useMemo(
      () =>
        draft.elements.find(
          (element) =>
            element.id ===
            selectedId
        ),
      [
        draft.elements,
        selectedId,
      ]
    );

  const patchElement =
    (patch) =>
      setDraft(
        (current) => ({
          ...current,
          elements:
            current.elements.map(
              (element) =>
                element.id ===
                selectedId
                  ? {
                      ...element,
                      ...patch,
                    }
                  : element
            ),
        })
      );

  const newTemplate = () => {
    setCurrentId("");
    setSelectedId("");
    setDraft(
      blankTemplate()
    );
  };

  const openTemplate =
    (template) => {
      setCurrentId(
        template._id
      );

      setSelectedId("");

      setDraft({
        name: template.name,
        orientation:
          template.orientation,
        width: template.width,
        height: template.height,
        backgroundColor:
          template.backgroundColor ||
          "#ffffff",
        backgroundFileId:
          template.backgroundFileId ||
          null,
        decorations:
          template.decorations ||
          [],
        elements:
          ensureCoreElements(
            template.elements ||
              [],
            template.orientation
          ),
      });
    };

  const addField = () => {
    const element =
      makeElement(
        fieldType
      );

    setDraft(
      (current) => ({
        ...current,
        elements: [
          ...current.elements,
          element,
        ],
      })
    );

    setSelectedId(
      element.id
    );
  };

  const removeField = () => {
    if (!selectedId) {
      return;
    }

    setDraft(
      (current) => ({
        ...current,
        elements:
          current.elements.filter(
            (element) =>
              element.id !==
              selectedId
          ),
      })
    );

    setSelectedId("");
  };

  const changeOrientation =
    (orientation) =>
      setDraft(
        (current) => {
          const portrait =
            orientation ===
            "portrait";

          return {
            ...current,
            orientation,
            width:
              portrait
                ? 330
                : 520,
            height:
              portrait
                ? 520
                : 330,
            elements:
              current.elements.map(
                (element) => {
                  if (
                    element.type ===
                    "principalSignature"
                  ) {
                    return {
                      ...element,
                      x:
                        portrait
                          ? 120
                          : 310,
                      y:
                        portrait
                          ? 394
                          : 218,
                      width: 200,
                      height: 100,
                    };
                  }

                  if (
                    element.id ===
                    "studentPhoto-core"
                  ) {
                    return {
                      ...element,
                      x:
                        portrait
                          ? 112
                          : 24,
                      y:
                        portrait
                          ? 118
                          : 88,
                      width:
                        portrait
                          ? 106
                          : 112,
                      height:
                        portrait
                          ? 126
                          : 118,
                    };
                  }

                  return element;
                }
              ),
          };
        }
      );

  const uploadBackground =
    async (event) => {
      const file =
        event.target
          .files?.[0];

      if (!file) {
        return;
      }

      setError("");

      try {
        const preset =
          draft.orientation ===
          "portrait"
            ? "templateBackgroundPortrait"
            : "templateBackgroundLandscape";

        const fileId =
          await uploadImage(
            file,
            "template-background",
            preset
          );

        setDraft(
          (current) => ({
            ...current,
            backgroundFileId:
              fileId,
          })
        );
      } catch (e) {
        setError(
          errorMessage(e)
        );
      }
    };

  const save = async () => {
    setError("");
    setMessage("");

    try {
      const response =
        currentId
          ? await api.put(
              `/custom-templates/${currentId}`,
              draft
            )
          : await api.post(
              "/custom-templates",
              draft
            );

      setCurrentId(
        response.data.data._id
      );

      setMessage(
        "Custom template saved."
      );

      load();
    } catch (e) {
      setError(
        errorMessage(e)
      );
    }
  };

  const pointerDown = (
    event,
    element,
    scale
  ) => {
    event.preventDefault();

    setSelectedId(
      element.id
    );

    dragRef.current = {
      startX:
        event.clientX,
      startY:
        event.clientY,
      elementX:
        element.x,
      elementY:
        element.y,
      scale,
    };

    const move =
      (moveEvent) => {
        const drag =
          dragRef.current;

        if (!drag) {
          return;
        }

        const x =
          drag.elementX +
          (
            moveEvent.clientX -
            drag.startX
          ) /
            drag.scale;

        const y =
          drag.elementY +
          (
            moveEvent.clientY -
            drag.startY
          ) /
            drag.scale;

        setDraft(
          (current) => ({
            ...current,
            elements:
              current.elements.map(
                (item) =>
                  item.id ===
                  element.id
                    ? {
                        ...item,
                        x: Math.max(
                          0,
                          Math.min(
                            current.width -
                              item.width,
                            Math.round(
                              x
                            )
                          )
                        ),
                        y: Math.max(
                          0,
                          Math.min(
                            current.height -
                              item.height,
                            Math.round(
                              y
                            )
                          )
                        ),
                      }
                    : item
              ),
          })
        );
      };

    const up = () => {
      dragRef.current =
        null;

      window.removeEventListener(
        "pointermove",
        move
      );

      window.removeEventListener(
        "pointerup",
        up
      );
    };

    window.addEventListener(
      "pointermove",
      move
    );

    window.addEventListener(
      "pointerup",
      up
    );
  };

  return (
    <Layout
      user={user}
      onLogout={onLogout}
    >
      <PageHeader
        eyebrow="ID Studio"
        title="Custom Template Designer"
        description="Upload a background, add dynamic English or Marathi fields and drag them into position."
        action={
          <Button
            variant="outlined"
            onClick={
              newTemplate
            }
          >
            New template
          </Button>
        }
      />

      <TypingLanguageBar
        value={typingLanguage}
        onChange={
          setTypingLanguage
        }
      />

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      {message && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
        >
          {message}
        </Alert>
      )}

      <Grid
        container
        spacing={2}
      >
        <Grid
          item
          xs={12}
          lg={3}
        >
          <Card>
            <CardContent>
              <Typography
                variant="h6"
              >
                Template setup
              </Typography>

              <Stack
                spacing={1.5}
                sx={{ mt: 2 }}
              >
                <MarathiTextField
                  typingLanguage={
                    typingLanguage
                  }
                  label="Template name"
                  value={
                    draft.name
                  }
                  onValueChange={(
                    value
                  ) =>
                    setDraft({
                      ...draft,
                      name: value,
                    })
                  }
                />

                <TextField
                  select
                  label="Orientation"
                  value={
                    draft.orientation
                  }
                  onChange={(
                    event
                  ) =>
                    changeOrientation(
                      event.target
                        .value
                    )
                  }
                >
                  <MenuItem value="portrait">
                    Portrait
                  </MenuItem>

                  <MenuItem value="landscape">
                    Landscape
                  </MenuItem>
                </TextField>

                <TextField
                  type="color"
                  label="Background color"
                  value={
                    draft.backgroundColor
                  }
                  onChange={(
                    event
                  ) =>
                    setDraft({
                      ...draft,
                      backgroundColor:
                        event
                          .target
                          .value,
                    })
                  }
                  InputLabelProps={{
                    shrink: true,
                  }}
                />

                <Button
                  component="label"
                  variant="outlined"
                  startIcon={
                    <UploadFileRounded />
                  }
                >
                  Upload background

                  <input
                    hidden
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={
                      uploadBackground
                    }
                  />
                </Button>

                {draft.backgroundFileId && (
                  <Button
                    color="error"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        backgroundFileId:
                          null,
                      })
                    }
                  >
                    Remove background
                  </Button>
                )}

                <Divider />

                <TextField
                  select
                  label="Field"
                  value={
                    fieldType
                  }
                  onChange={(
                    event
                  ) =>
                    setFieldType(
                      event.target
                        .value
                    )
                  }
                >
                  {fieldOptions.map(
                    ([
                      value,
                      label,
                    ]) => (
                      <MenuItem
                        key={
                          value
                        }
                        value={
                          value
                        }
                      >
                        {label}
                      </MenuItem>
                    )
                  )}
                </TextField>

                <Button
                  variant="contained"
                  startIcon={
                    <AddRounded />
                  }
                  onClick={
                    addField
                  }
                >
                  Add field
                </Button>

                <Button
                  color="error"
                  disabled={
                    !selectedId
                  }
                  startIcon={
                    <DeleteOutlineRounded />
                  }
                  onClick={
                    removeField
                  }
                >
                  Remove selected
                </Button>

                <Divider />

                <Button
                  variant="contained"
                  startIcon={
                    <SaveRounded />
                  }
                  onClick={save}
                >
                  Save template
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography
                variant="h6"
              >
                My templates
              </Typography>

              <Stack
                spacing={1}
                sx={{ mt: 1.5 }}
              >
                {templates.length ===
                  0 && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    No custom templates yet.
                  </Typography>
                )}

                {templates.map(
                  (template) => (
                    <Button
                      key={
                        template._id
                      }
                      variant={
                        currentId ===
                        template._id
                          ? "contained"
                          : "outlined"
                      }
                      onClick={() =>
                        openTemplate(
                          template
                        )
                      }
                    >
                      {
                        template.name
                      }
                    </Button>
                  )
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          item
          xs={12}
          lg={6}
        >
          <Card>
            <CardContent>
              <Typography
                variant="h6"
              >
                Design canvas
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                Click a field, then drag it. Long English and Marathi text automatically fits within its field area.
              </Typography>

              <Box
                sx={{
                  minHeight: 650,
                  bgcolor:
                    "#e9eef5",
                  display: "grid",
                  placeItems:
                    "center",
                  overflow: "auto",
                  p: 3,
                }}
              >
                <TemplateRenderer
                  template={
                    draft
                  }
                  student={
                    sampleStudent
                  }
                  school={
                    sampleSchool
                  }
                  targetWidth={
                    draft.orientation ===
                    "portrait"
                      ? 330
                      : 520
                  }
                  previewMode
                  interactive
                  selectedId={
                    selectedId
                  }
                  onElementPointerDown={
                    pointerDown
                  }
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          item
          xs={12}
          lg={3}
        >
          <Card>
            <CardContent>
              <Typography
                variant="h6"
              >
                Field properties
              </Typography>

              {!selected ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2 }}
                >
                  Select a field on the canvas.
                </Typography>
              ) : (
                <Stack
                  spacing={1.4}
                  sx={{ mt: 2 }}
                >
                  {[
                    ["x", "X"],
                    ["y", "Y"],
                    [
                      "width",
                      "Width",
                    ],
                    [
                      "height",
                      "Height",
                    ],
                    [
                      "fontSize",
                      "Font size",
                    ],
                    [
                      "minFontSize",
                      "Minimum font size",
                    ],
                    [
                      "borderRadius",
                      "ID element radius",
                    ],
                  ].map(
                    ([
                      key,
                      label,
                    ]) => (
                      <TextField
                        key={key}
                        type="number"
                        label={
                          label
                        }
                        value={
                          selected[
                            key
                          ] ?? 0
                        }
                        onChange={(
                          event
                        ) =>
                          patchElement(
                            {
                              [key]:
                                Number(
                                  event
                                    .target
                                    .value
                                ),
                            }
                          )
                        }
                      />
                    )
                  )}

                  {![
                    "studentPhoto",
                    "schoolLogo",
                    "principalSignature",
                    "qrCode",
                  ].includes(
                    selected.type
                  ) && (
                    <>
                      <TextField
                        type="color"
                        label="Text color"
                        value={
                          selected.color ||
                          "#0f172a"
                        }
                        onChange={(
                          event
                        ) =>
                          patchElement(
                            {
                              color:
                                event
                                  .target
                                  .value,
                            }
                          )
                        }
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />

                      <TextField
                        select
                        label="Alignment"
                        value={
                          selected.textAlign ||
                          "left"
                        }
                        onChange={(
                          event
                        ) =>
                          patchElement(
                            {
                              textAlign:
                                event
                                  .target
                                  .value,
                            }
                          )
                        }
                      >
                        <MenuItem value="left">
                          Left
                        </MenuItem>
                        <MenuItem value="center">
                          Center
                        </MenuItem>
                        <MenuItem value="right">
                          Right
                        </MenuItem>
                      </TextField>

                      <MarathiTextField
                        typingLanguage={
                          typingLanguage
                        }
                        label="Prefix"
                        value={
                          selected.prefix ||
                          ""
                        }
                        onValueChange={(
                          value
                        ) =>
                          patchElement(
                            {
                              prefix:
                                value,
                            }
                          )
                        }
                      />

                      {selected.type ===
                        "customText" && (
                        <MarathiTextField
                          typingLanguage={
                            typingLanguage
                          }
                          multiline
                          minRows={2}
                          label="Custom text"
                          value={
                            selected.customText ||
                            ""
                          }
                          onValueChange={(
                            value
                          ) =>
                            patchElement(
                              {
                                customText:
                                  value,
                              }
                            )
                          }
                        />
                      )}
                    </>
                  )}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
}
