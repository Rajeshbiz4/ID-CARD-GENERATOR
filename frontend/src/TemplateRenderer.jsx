import {
  useLayoutEffect,
  useRef,
} from "react";

import { Box } from "@mui/material";
import { QRCodeSVG } from "qrcode.react";

import StoredImage, {
  useStoredImage,
} from "./StoredImage";

const SAMPLE_LOGO =
  "/sample-school-logo.png";

const SAMPLE_STUDENT =
  "/sample-student-profile.png";

const EMPTY_LOGO =
  "/default-school-logo.svg";

const EMPTY_STUDENT =
  "/default-student-photo.svg";

const DEFAULT_SIGNATURE =
  "/default-principal-signature.svg";

const DEVANAGARI_FONT =
  '"Nirmala UI","Noto Sans Devanagari","Mangal","Segoe UI",Arial,sans-serif';

function getValue(
  element,
  student,
  school
) {
  const classDivision = [
    student?.className,
    student?.division,
  ]
    .filter(Boolean)
    .join("-");

  const values = {
    schoolName:
      school?.name || "",

    schoolTagline:
      school?.tagline || "",

    schoolRegistrationNo:
      school?.registrationNo ||
      school?.schoolCode ||
      "",

    governmentSchemeName:
      school?.governmentSchemeName ||
      "",

    projectName:
      school?.projectName ||
      "",

    anganwadiCenterNumber:
      school?.anganwadiCenterNumber ||
      "",

    villageName:
      school?.villageName ||
      "",

    principalName:
      school?.principalName ||
      "",

    studentName:
      student?.name || "",

    admissionNo:
      student?.admissionNo ||
      "",

    rollNo:
      student?.rollNo || "",

    classDivision,

    dob:
      student?.dob
        ? new Date(
            student.dob
          ).toLocaleDateString(
            "en-IN"
          )
        : "",

    bloodGroup:
      student?.bloodGroup ||
      "",

    academicYear:
      student?.academicYear ||
      school?.academicYear ||
      "",

    parentName:
      student?.parentName ||
      "",

    parentMobile:
      student?.parentMobile ||
      "",

    customText:
      element.customText ||
      "",
  };

  const value =
    values[element.type] ?? "";

  if (!value) {
    return "";
  }

  const rawValue =
    String(value).trim();

  const prefix =
    String(
      element.prefix || ""
    );

  const trimmedPrefix =
    prefix.trim();

  // Avoid duplicate labels if the saved profile value already contains
  // the same prefix.
  if (
    trimmedPrefix &&
    rawValue.startsWith(
      trimmedPrefix
    )
  ) {
    return rawValue;
  }

  return `${prefix}${rawValue}`;
}

function Decoration({
  item,
  scale,
}) {
  const common = {
    position: "absolute",
    left: item.x * scale,
    top: item.y * scale,
    width: item.width * scale,
    height: item.height * scale,
    bgcolor: item.color,
    opacity: item.opacity ?? 1,
    transform:
      `rotate(${item.rotate || 0}deg)`,
    transformOrigin: "center",
    pointerEvents: "none",
  };

  if (item.type === "circle") {
    return (
      <Box
        sx={{
          ...common,
          borderRadius: "50%",
        }}
      />
    );
  }

  return <Box sx={common} />;
}

function elementStyle(
  element,
  scale
) {
  const multiline =
    element.multiline === true ||
    element.type === "schoolName" ||
    element.type === "studentName";

  return {
    position: "absolute",
    left: element.x * scale,
    top: element.y * scale,
    width: element.width * scale,
    height: element.height * scale,
    px: 0.35 * scale,
    overflow: "hidden",
    maxWidth: "100%",
    maxHeight: "100%",
    boxSizing: "border-box",
    color: element.color,
    bgcolor:
      element.backgroundColor ||
      "transparent",
    fontFamily: DEVANAGARI_FONT,
    fontSize:
      element.fontSize * scale,
    lineHeight:
      element.lineHeight || 1.12,
    letterSpacing:
      `${(element.letterSpacing || 0) * scale}px`,
    fontWeight:
      element.fontWeight,
    textAlign:
      element.textAlign,
    border:
      element.borderWidth > 0
        ? `${Math.max(
            1,
            element.borderWidth *
              scale
          )}px solid ${
            element.borderColor
          }`
        : undefined,
    borderRadius:
      `${(element.borderRadius || 0) * scale}px`,
    display: "flex",
    alignItems: "center",
    justifyContent:
      element.textAlign ===
      "center"
        ? "center"
        : element.textAlign ===
          "right"
        ? "flex-end"
        : "flex-start",
    whiteSpace:
      multiline
        ? "normal"
        : "nowrap",
    overflowWrap:
      multiline
        ? "anywhere"
        : "normal",
    wordBreak:
      multiline
        ? "break-word"
        : "normal",
  };
}

function AutoFitText({
  element,
  scale,
  children,
}) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const node = ref.current;

    if (!node) {
      return;
    }

    const maxSize =
      Math.max(
        1,
        element.fontSize * scale
      );

    const minSize =
      Math.max(
        5,
        (element.minFontSize || 7) *
          scale
      );

    let size = maxSize;

    node.style.fontSize =
      `${size}px`;

    while (
      size > minSize &&
      (
        node.scrollWidth >
          node.clientWidth + 1 ||
        node.scrollHeight >
          node.clientHeight + 1
      )
    ) {
      size -= 0.5;
      node.style.fontSize =
        `${size}px`;
    }
  }, [
    children,
    element.fontSize,
    element.minFontSize,
    element.width,
    element.height,
    scale,
  ]);

  return (
    <Box
      ref={ref}
      sx={elementStyle(
        element,
        scale
      )}
    >
      {children}
    </Box>
  );
}

function Element({
  element,
  student,
  school,
  scale,
  previewMode,
}) {
  const style =
    elementStyle(
      element,
      scale
    );

  if (
    element.type ===
    "studentPhoto"
  ) {
    const fallback = (
      <Box
        component="img"
        src={
          previewMode
            ? SAMPLE_STUDENT
            : EMPTY_STUDENT
        }
        alt=""
        sx={{
          ...style,
          objectFit:
            element.objectFit ||
            "cover",
          objectPosition:
            "center top",
        }}
      />
    );

    return (
      <StoredImage
        fileId={
          student?.photoFileId
        }
        alt="Student"
        sx={{
          ...style,
          objectFit:
            element.objectFit ||
            "cover",
          objectPosition:
            "center top",
        }}
        fallback={fallback}
      />
    );
  }

  if (
    element.type ===
    "schoolLogo"
  ) {
    const fallback = (
      <Box
        component="img"
        src={
          previewMode
            ? SAMPLE_LOGO
            : EMPTY_LOGO
        }
        alt=""
        sx={{
          ...style,
          objectFit:
            "contain",
          p:
            0.3 * scale,
        }}
      />
    );

    return (
      <StoredImage
        fileId={
          school?.logoFileId
        }
        alt="School logo"
        sx={{
          ...style,
          objectFit:
            "contain",
          p:
            0.3 * scale,
        }}
        fallback={fallback}
      />
    );
  }

  if (
    element.type ===
    "principalSignature"
  ) {
    const signatureStyle = {
      ...style,
      objectFit: "contain",
      objectPosition:
        "center center",
      width: style.width,
      height: style.height,
      p: 0,
    };

    const fallback = (
      <Box
        component="img"
        src={
          DEFAULT_SIGNATURE
        }
        alt="Principal signature placeholder"
        sx={
          signatureStyle
        }
      />
    );

    return (
      <StoredImage
        fileId={
          school
            ?.principalSignatureFileId
        }
        processor="signature"
        alt="Principal signature"
        sx={
          signatureStyle
        }
        fallback={
          fallback
        }
      />
    );
  }

  if (
    element.type ===
    "qrCode"
  ) {
    const qrValue =
      JSON.stringify({
        schoolCode:
          school?.schoolCode ||
          "",
        admissionNo:
          student?.admissionNo ||
          "",
        name:
          student?.name || "",
        class:
          student?.className ||
          "",
        division:
          student?.division ||
          "",
      });

    const size =
      Math.min(
        element.width * scale,
        element.height * scale
      );

    return (
      <Box
        sx={{
          ...style,
          display: "grid",
          placeItems: "center",
          bgcolor: "#ffffff",
          p: 0.5 * scale,
        }}
      >
        <QRCodeSVG
          value={qrValue}
          size={Math.max(
            20,
            size - 6 * scale
          )}
        />
      </Box>
    );
  }

  return (
    <AutoFitText
      element={element}
      scale={scale}
    >
      {getValue(
        element,
        student,
        school
      )}
    </AutoFitText>
  );
}


function boxesOverlap(a, b, gap = 4) {
  return !(
    a.x + a.width + gap <= b.x ||
    b.x + b.width + gap <= a.x ||
    a.y + a.height + gap <= b.y ||
    b.y + b.height + gap <= a.y
  );
}

function findSafeSignatureBox(template, elements) {
  const portrait = template.orientation !== "landscape";
  const width = template.width || (portrait ? 330 : 520);
  const height = template.height || (portrait ? 520 : 330);
  const signatureWidth = 200;
  const signatureHeight = 100;
  const footerReserve = portrait ? 22 : 8;

  const bottomY =
    height -
    signatureHeight -
    footerReserve;

  const candidates = portrait
    ? [
        { x: width - signatureWidth - 10, y: bottomY },
        { x: 10, y: bottomY },
        { x: Math.round((width - signatureWidth) / 2), y: bottomY },
        { x: width - signatureWidth - 10, y: Math.max(110, bottomY - 110) },
        { x: 10, y: Math.max(110, bottomY - 110) },
      ]
    : [
        { x: width - signatureWidth - 10, y: bottomY },
        { x: 10, y: bottomY },
        { x: Math.round((width - signatureWidth) / 2), y: bottomY },
        { x: width - signatureWidth - 10, y: Math.max(76, bottomY - 104) },
        { x: 10, y: Math.max(76, bottomY - 104) },
      ];

  const used = elements
    .filter((element) => element.type !== "academicYear")
    .map((element) => ({
      x: Number(element.x || 0),
      y: Number(element.y || 0),
      width: Number(element.width || 0),
      height: Number(element.height || 0),
    }));

  const safe = candidates.find((candidate) =>
    used.every((box) => !boxesOverlap(candidate, box, 3))
  );

  return safe || candidates[0];
}

function renderElementsForTemplate(template) {
  const elements = [...(template.elements || [])];

  if (
    elements.some(
      (element) => element.type === "principalSignature"
    )
  ) {
    return elements;
  }

  if (template.type !== "CUSTOM") {
    return elements;
  }

  const portrait = template.orientation !== "landscape";
  const position = findSafeSignatureBox(template, elements);

  return [
    ...elements,
    {
      id: "__autoPrincipalSignature",
      type: "principalSignature",
      x: position.x,
      y: position.y,
      width: 200,
      height: 100,
      fontSize: 8,
      minFontSize: 6,
      fontWeight: 500,
      color: "#334155",
      backgroundColor: "transparent",
      textAlign: "center",
      borderWidth: 0,
      borderColor: "transparent",
      borderRadius: 0,
      objectFit: "contain",
      prefix: "",
      customText: "",
      multiline: false,
      lineHeight: 1,
      letterSpacing: 0,
    },
  ];
}

export default function TemplateRenderer({
  template,
  student,
  school,
  targetWidth,
  interactive = false,
  selectedId,
  onElementPointerDown,
  previewMode = false,
}) {
  const backgroundState =
    useStoredImage(
      template
        ?.backgroundFileId
    );

  const backgroundSrc =
    typeof backgroundState ===
    "string"
      ? backgroundState
      : backgroundState?.src;

  if (!template) {
    return null;
  }

  const baseWidth =
    template.width || 330;

  const baseHeight =
    template.height || 520;

  const width =
    targetWidth || baseWidth;

  const scale =
    width / baseWidth;

  const height =
    baseHeight * scale;

  const renderedElements =
    renderElementsForTemplate(
      template
    );

  return (
    <Box
      sx={{
        width,
        height,
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
        bgcolor:
          template.backgroundColor ||
          "#ffffff",
        backgroundImage:
          backgroundSrc
            ? `url(${backgroundSrc})`
            : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        border:
          "1px solid #cbd5e1",
        boxShadow:
          "0 16px 36px rgba(15,23,42,.12)",
        fontFamily:
          DEVANAGARI_FONT,
      }}
    >
      {(template.decorations ||
        []).map(
        (item, index) => (
          <Decoration
            key={`${item.type}-${index}`}
            item={item}
            scale={scale}
          />
        )
      )}

      {renderedElements.map(
        (element) => (
          <Box
            key={element.id}
            onPointerDown={
              interactive
                ? (event) =>
                    onElementPointerDown?.(
                      event,
                      element,
                      scale
                    )
                : undefined
            }
            sx={{
              position: "absolute",
              left:
                element.x * scale,
              top:
                element.y * scale,
              width:
                element.width * scale,
              height:
                element.height * scale,
              cursor:
                interactive
                  ? "move"
                  : "default",
              outline:
                interactive &&
                selectedId ===
                  element.id
                  ? "2px solid #4f46e5"
                  : "none",
              zIndex: 5,
            }}
          >
            <Box
              sx={{
                position: "absolute",
                left:
                  -element.x * scale,
                top:
                  -element.y * scale,
                width,
                height,
                pointerEvents:
                  "none",
              }}
            >
              <Element
                element={element}
                student={student}
                school={school}
                scale={scale}
                previewMode={
                  previewMode
                }
              />
            </Box>
          </Box>
        )
      )}
    </Box>
  );
}
