import { Box } from "@mui/material";
import { QRCodeSVG } from "qrcode.react";
import StoredImage, { useStoredImage } from "./StoredImage";

const DEFAULT_LOGO = "/default-school-logo.svg";
const DEFAULT_STUDENT = "/default-student-photo.svg";

function valueFor(element, student, school) {
  const values = {
    schoolName: school?.name || "Green Valley Public School",
    schoolTagline: school?.tagline || "Learn • Grow • Achieve",
    schoolRegistrationNo:
      school?.registrationNo || school?.schoolCode || "27310304501",
    principalName: school?.principalName || "Principal",
    studentName: student?.name || "Aarav Sharma",
    admissionNo: student?.admissionNo || "GVPS001",
    rollNo: student?.rollNo || "12",
    classDivision: `${student?.className || "6"}-${student?.division || "A"}`,
    dob: student?.dob
      ? new Date(student.dob).toLocaleDateString("en-GB")
      : "12/08/2014",
    bloodGroup: student?.bloodGroup || "O+",
    academicYear:
      student?.academicYear ||
      school?.academicYear ||
      "2026-2027",
    parentName: student?.parentName || "Rajesh Sharma",
    parentMobile: student?.parentMobile || "9876543210",
    customText: element.customText || "",
  };

  return `${element.prefix || ""}${values[element.type] ?? ""}`;
}

function Decoration({ item, scale }) {
  const common = {
    position: "absolute",
    left: item.x * scale,
    top: item.y * scale,
    width: item.width * scale,
    height: item.height * scale,
    bgcolor: item.color,
    opacity: item.opacity ?? 1,
    transform: `rotate(${item.rotate || 0}deg)`,
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

function textStyle(element, scale) {
  return {
    position: "absolute",
    left: element.x * scale,
    top: element.y * scale,
    width: element.width * scale,
    height: element.height * scale,
    px: 0.35 * scale,
    overflow: "hidden",
    whiteSpace: element.multiline ? "normal" : "nowrap",
    textOverflow: element.multiline ? "clip" : "ellipsis",
    wordBreak: element.multiline ? "break-word" : "normal",
    color: element.color,
    bgcolor: element.backgroundColor || "transparent",
    fontSize: element.fontSize * scale,
    lineHeight: element.lineHeight || 1.15,
    letterSpacing: `${(element.letterSpacing || 0) * scale}px`,
    fontWeight: element.fontWeight,
    textAlign: element.textAlign,
    border:
      element.borderWidth > 0
        ? `${Math.max(1, element.borderWidth * scale)}px solid ${element.borderColor}`
        : undefined,
    borderRadius: `${(element.borderRadius || 0) * scale}px`,
    display: "flex",
    alignItems: element.multiline ? "flex-start" : "center",
    paddingTop: element.multiline ? 0.25 * scale : 0,
    justifyContent:
      element.textAlign === "center"
        ? "center"
        : element.textAlign === "right"
        ? "flex-end"
        : "flex-start",
  };
}

function Element({ element, student, school, scale }) {
  const style = textStyle(element, scale);

  if (element.type === "studentPhoto") {
    const fallback = (
      <Box
        component="img"
        src={DEFAULT_STUDENT}
        alt="Default student"
        sx={{
          ...style,
          objectFit: "cover",
        }}
      />
    );

    return (
      <StoredImage
        fileId={student?.photoFileId}
        alt="Student"
        sx={{
          ...style,
          objectFit: element.objectFit || "cover",
        }}
        fallback={fallback}
      />
    );
  }

  if (element.type === "schoolLogo") {
    const fallback = (
      <Box
        component="img"
        src={DEFAULT_LOGO}
        alt="Default school logo"
        sx={{
          ...style,
          objectFit: "contain",
          p: 0.3 * scale,
        }}
      />
    );

    return (
      <StoredImage
        fileId={school?.logoFileId}
        alt="School logo"
        sx={{
          ...style,
          objectFit: "contain",
          p: 0.3 * scale,
        }}
        fallback={fallback}
      />
    );
  }

  if (element.type === "principalSignature") {
    return (
      <StoredImage
        fileId={school?.principalSignatureFileId}
        alt="Principal signature"
        sx={{
          ...style,
          objectFit: "contain",
        }}
      />
    );
  }

  if (element.type === "qrCode") {
    const value = JSON.stringify({
      schoolCode: school?.schoolCode || "",
      admissionNo: student?.admissionNo || "",
      name: student?.name || "",
      class: student?.className || "",
      division: student?.division || "",
    });

    const size = Math.min(
      element.width * scale,
      element.height * scale
    );

    return (
      <Box
        sx={{
          ...style,
          display: "grid",
          placeItems: "center",
          overflow: "hidden",
          bgcolor: "#ffffff",
          p: 0.5 * scale,
        }}
      >
        <QRCodeSVG value={value} size={Math.max(20, size - 6 * scale)} />
      </Box>
    );
  }

  return <Box sx={style}>{valueFor(element, student, school)}</Box>;
}

export default function TemplateRenderer({
  template,
  student,
  school,
  targetWidth,
  interactive = false,
  selectedId,
  onElementPointerDown,
}) {
  const backgroundSrc = useStoredImage(template?.backgroundFileId);

  if (!template) return null;

  const baseWidth = template.width || 330;
  const baseHeight = template.height || 520;
  const width = targetWidth || baseWidth;
  const scale = width / baseWidth;
  const height = baseHeight * scale;

  return (
    <Box
      sx={{
        width,
        height,
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
        bgcolor: template.backgroundColor || "#ffffff",
        backgroundImage: backgroundSrc ? `url(${backgroundSrc})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        border: "1px solid #cbd5e1",
        boxShadow: "0 16px 36px rgba(15,23,42,.12)",
      }}
    >
      {(template.decorations || []).map((item, index) => (
        <Decoration
          key={`${item.type}-${index}`}
          item={item}
          scale={scale}
        />
      ))}

      {(template.elements || []).map((element) => (
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
            left: element.x * scale,
            top: element.y * scale,
            width: element.width * scale,
            height: element.height * scale,
            cursor: interactive ? "move" : "default",
            outline:
              interactive && selectedId === element.id
                ? "2px solid #4f46e5"
                : "none",
            zIndex: 5,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              left: -element.x * scale,
              top: -element.y * scale,
              width,
              height,
              pointerEvents: "none",
            }}
          >
            <Element
              element={element}
              student={student}
              school={school}
              scale={scale}
            />
          </Box>
        </Box>
      ))}
    </Box>
  );
}
