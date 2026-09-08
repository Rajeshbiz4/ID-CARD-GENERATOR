const P = {
  navy: ["#0f2747", "#1f6fb2", "#0b1729"],
  emerald: ["#0b5d4b", "#2ba574", "#073a30"],
  royal: ["#243b8f", "#6d7df3", "#111b4b"],
  burgundy: ["#7b1734", "#c94d6d", "#3c0b1b"],
  charcoal: ["#1f2937", "#64748b", "#0f172a"],
  amber: ["#8a4b08", "#d99a22", "#3a2107"],
  teal: ["#0f5f68", "#2aaab8", "#08363b"],
  indigo: ["#323a84", "#7c83fd", "#181c4a"],
  forest: ["#245c36", "#76a83e", "#14351f"],
  plum: ["#60346e", "#ae6cb8", "#351a3d"],
};

const txt = (id, type, x, y, width, fontSize = 12, extra = {}) => ({
  id,
  type,
  x,
  y,
  width,
  height: extra.height || 24,
  fontSize,
  fontWeight: extra.fontWeight || 600,
  color: extra.color || "#0f172a",
  backgroundColor: extra.backgroundColor || "transparent",
  textAlign: extra.textAlign || "left",
  borderWidth: extra.borderWidth || 0,
  borderColor: extra.borderColor || "transparent",
  borderRadius: extra.borderRadius || 0,
  objectFit: extra.objectFit || "cover",
  prefix: extra.prefix || "",
  customText: extra.customText || "",
  multiline: extra.multiline || false,
  lineHeight: extra.lineHeight || 1.15,
  letterSpacing: extra.letterSpacing || 0,
});

const img = (id, type, x, y, width, height, extra = {}) => ({
  id,
  type,
  x,
  y,
  width,
  height,
  fontSize: 12,
  fontWeight: 500,
  color: "#0f172a",
  backgroundColor: extra.backgroundColor || "transparent",
  textAlign: "left",
  borderWidth: extra.borderWidth || 0,
  borderColor: extra.borderColor || "transparent",
  borderRadius: extra.borderRadius || 0,
  objectFit: extra.objectFit || "cover",
  prefix: "",
  customText: "",
});

const qr = (x, y, size) => img("qrCode", "qrCode", x, y, size, size);

const rect = (x, y, width, height, color, opacity = 1, rotate = 0) => ({
  type: "rect",
  x,
  y,
  width,
  height,
  color,
  opacity,
  rotate,
});

const circle = (x, y, width, height, color, opacity = 1) => ({
  type: "circle",
  x,
  y,
  width,
  height,
  color,
  opacity,
  rotate: 0,
});

function portraitShell({
  palette,
  photo,
  titleY,
  detailY,
  footerColor,
  accentMode = "top",
  circularPhoto = false,
}) {
  const [primary, accent, dark] = palette;

  const decorations =
    accentMode === "top"
      ? [
          rect(0, 0, 330, 108, primary),
          rect(0, 108, 330, 6, accent),
          rect(0, 488, 330, 32, footerColor || dark),
        ]
      : accentMode === "side"
      ? [
          rect(0, 0, 72, 520, primary),
          rect(72, 0, 258, 70, dark),
          rect(72, 482, 258, 38, accent),
        ]
      : [
          rect(0, 0, 330, 70, dark),
          rect(0, 70, 330, 8, accent),
          rect(0, 430, 330, 90, primary),
        ];

  const logo =
    accentMode === "side"
      ? img("schoolLogo", "schoolLogo", 14, 16, 44, 44, { objectFit: "contain" })
      : img("schoolLogo", "schoolLogo", 16, 14, 46, 46, { objectFit: "contain" });

  const schoolName =
    accentMode === "side"
      ? txt("schoolName", "schoolName", 86, 18, 226, 16, {
          color: "#ffffff",
          fontWeight: 800,
        })
      : txt("schoolName", "schoolName", 74, 18, 238, 16, {
          color: "#ffffff",
          fontWeight: 800,
        });

  const elements = [
    logo,
    schoolName,
    txt("schoolTagline", "schoolTagline", accentMode === "side" ? 86 : 74, 43, 220, 8.5, {
      color: "#ffffff",
      fontWeight: 500,
    }),
    img("studentPhoto", "studentPhoto", photo.x, photo.y, photo.w, photo.h, {
      borderWidth: 4,
      borderColor: "#ffffff",
      borderRadius: circularPhoto ? Math.min(photo.w, photo.h) / 2 : 0,
      objectFit: "cover",
    }),
    txt("studentName", "studentName", 26, titleY, 278, 20, {
      color: dark,
      fontWeight: 900,
      textAlign: "center",
      height: 28,
    }),
    txt("admissionNo", "admissionNo", 40, detailY, 250, 11, {
      prefix: "Admission No.  ",
    }),
    txt("classDivision", "classDivision", 40, detailY + 29, 250, 11, {
      prefix: "Class / Section  ",
    }),
    txt("rollNo", "rollNo", 40, detailY + 58, 250, 11, {
      prefix: "Roll No.  ",
    }),
    txt("dob", "dob", 40, detailY + 87, 250, 11, {
      prefix: "Date of Birth  ",
    }),
    txt("bloodGroup", "bloodGroup", 40, detailY + 116, 250, 11, {
      prefix: "Blood Group  ",
    }),
    qr(128, 399, 74),
    txt("academicYear", "academicYear", 0, 492, 330, 10, {
      color: "#ffffff",
      fontWeight: 800,
      textAlign: "center",
    }),
  ];

  return {
    orientation: "portrait",
    width: 330,
    height: 520,
    backgroundColor: "#ffffff",
    decorations,
    elements,
  };
}

function template01() {
  const d = portraitShell({
    palette: P.navy,
    photo: { x: 112, y: 83, w: 106, h: 122 },
    titleY: 220,
    detailY: 258,
    circularPhoto: false,
  });

  d.layoutFamily = "Executive Portrait";
  d.decorations.push(circle(250, 18, 92, 92, "#ffffff", .08));
  return d;
}

function template02() {
  const d = portraitShell({
    palette: P.emerald,
    photo: { x: 112, y: 86, w: 106, h: 106 },
    titleY: 210,
    detailY: 250,
    circularPhoto: true,
  });

  d.layoutFamily = "Classic Crest";
  d.decorations.push(circle(-30, 60, 120, 120, P.emerald[1], .15));
  return d;
}

function template03() {
  const [primary, accent, dark] = P.royal;

  return {
    layoutFamily: "Left Identity Rail",
    orientation: "portrait",
    width: 330,
    height: 520,
    backgroundColor: "#ffffff",
    decorations: [
      rect(0, 0, 94, 520, primary),
      rect(94, 0, 236, 78, dark),
      rect(94, 78, 236, 5, accent),
      rect(94, 480, 236, 40, primary),
    ],
    elements: [
      img("schoolLogo", "schoolLogo", 19, 18, 56, 56, { objectFit: "contain" }),
      img("studentPhoto", "studentPhoto", 14, 132, 66, 92, {
        borderWidth: 3,
        borderColor: "#ffffff",
      }),
      qr(20, 340, 54),
      txt("schoolName", "schoolName", 112, 20, 200, 16, {
        color: "#ffffff",
        fontWeight: 900,
      }),
      txt("schoolTagline", "schoolTagline", 112, 45, 200, 8.5, {
        color: "#dbeafe",
      }),
      txt("studentName", "studentName", 112, 112, 198, 21, {
        color: dark,
        fontWeight: 900,
        height: 28,
      }),
      txt("admissionNo", "admissionNo", 112, 160, 190, 11, { prefix: "Admission  " }),
      txt("classDivision", "classDivision", 112, 194, 190, 11, { prefix: "Class  " }),
      txt("rollNo", "rollNo", 112, 228, 190, 11, { prefix: "Roll  " }),
      txt("dob", "dob", 112, 262, 190, 11, { prefix: "DOB  " }),
      txt("bloodGroup", "bloodGroup", 112, 296, 190, 11, { prefix: "Blood  " }),
      txt("parentMobile", "parentMobile", 112, 356, 190, 10.5, { prefix: "Emergency  " }),
      txt("academicYear", "academicYear", 108, 490, 206, 10, {
        color: "#ffffff",
        fontWeight: 800,
        textAlign: "right",
      }),
    ],
  };
}

function template04() {
  const [primary, accent, dark] = P.burgundy;

  return {
    layoutFamily: "Right Portrait Panel",
    orientation: "portrait",
    width: 330,
    height: 520,
    backgroundColor: "#f8fafc",
    decorations: [
      rect(0, 0, 330, 84, primary),
      rect(212, 84, 118, 436, "#f1f5f9"),
      rect(0, 458, 330, 62, dark),
      circle(252, 18, 110, 110, accent, .12),
    ],
    elements: [
      img("schoolLogo", "schoolLogo", 18, 16, 46, 46, { objectFit: "contain" }),
      txt("schoolName", "schoolName", 76, 18, 224, 16, {
        color: "#ffffff",
        fontWeight: 900,
      }),
      txt("schoolTagline", "schoolTagline", 76, 44, 224, 8.5, {
        color: "#ffe4e6",
      }),
      img("studentPhoto", "studentPhoto", 224, 124, 88, 116, {
        borderWidth: 4,
        borderColor: "#ffffff",
      }),
      txt("studentName", "studentName", 20, 126, 180, 20, {
        color: dark,
        fontWeight: 900,
        height: 28,
      }),
      txt("admissionNo", "admissionNo", 20, 178, 180, 11, { prefix: "ID  " }),
      txt("classDivision", "classDivision", 20, 212, 180, 11, { prefix: "Class  " }),
      txt("rollNo", "rollNo", 20, 246, 180, 11, { prefix: "Roll  " }),
      txt("dob", "dob", 20, 280, 180, 11, { prefix: "DOB  " }),
      txt("bloodGroup", "bloodGroup", 20, 314, 180, 11, { prefix: "Blood  " }),
      qr(232, 315, 66),
      txt("academicYear", "academicYear", 20, 478, 290, 10, {
        color: "#ffffff",
        fontWeight: 800,
        textAlign: "center",
      }),
    ],
  };
}

function template05() {
  const [primary, accent, dark] = P.charcoal;

  return {
    layoutFamily: "Clean Split",
    orientation: "portrait",
    width: 330,
    height: 520,
    backgroundColor: "#ffffff",
    decorations: [
      rect(0, 0, 148, 520, primary),
      rect(148, 0, 7, 520, accent),
      rect(155, 0, 175, 520, "#ffffff"),
    ],
    elements: [
      img("schoolLogo", "schoolLogo", 46, 24, 56, 56, { objectFit: "contain" }),
      txt("schoolName", "schoolName", 18, 98, 112, 14, {
        color: "#ffffff",
        fontWeight: 900,
        textAlign: "center",
        height: 42,
      }),
      img("studentPhoto", "studentPhoto", 30, 174, 88, 118, {
        borderWidth: 4,
        borderColor: "#ffffff",
      }),
      qr(43, 345, 62),
      txt("studentName", "studentName", 175, 42, 137, 19, {
        color: dark,
        fontWeight: 900,
        height: 54,
      }),
      txt("admissionNo", "admissionNo", 175, 122, 137, 11, { prefix: "ID  " }),
      txt("classDivision", "classDivision", 175, 162, 137, 11, { prefix: "CLASS  " }),
      txt("rollNo", "rollNo", 175, 202, 137, 11, { prefix: "ROLL  " }),
      txt("dob", "dob", 175, 242, 137, 11, { prefix: "DOB  " }),
      txt("bloodGroup", "bloodGroup", 175, 282, 137, 11, { prefix: "BLOOD  " }),
      txt("parentMobile", "parentMobile", 175, 350, 137, 10.5, { prefix: "CONTACT  " }),
      txt("academicYear", "academicYear", 175, 470, 137, 10, {
        color: primary,
        fontWeight: 900,
      }),
    ],
  };
}

function template06() {
  const [primary, accent, dark] = P.amber;

  return {
    layoutFamily: "Diagonal Premium",
    orientation: "portrait",
    width: 330,
    height: 520,
    backgroundColor: "#fffdfa",
    decorations: [
      rect(-50, -30, 430, 138, primary, 1, -10),
      rect(-40, 66, 430, 24, accent, 1, -10),
      rect(0, 478, 330, 42, dark),
      circle(240, 325, 150, 150, accent, .08),
    ],
    elements: [
      img("schoolLogo", "schoolLogo", 18, 12, 48, 48, { objectFit: "contain" }),
      txt("schoolName", "schoolName", 76, 18, 226, 16, {
        color: "#ffffff",
        fontWeight: 900,
      }),
      img("studentPhoto", "studentPhoto", 112, 118, 106, 106, {
        borderRadius: 53,
        borderWidth: 5,
        borderColor: "#ffffff",
      }),
      txt("studentName", "studentName", 28, 248, 274, 21, {
        color: dark,
        fontWeight: 900,
        textAlign: "center",
      }),
      txt("admissionNo", "admissionNo", 36, 300, 126, 10.8, { prefix: "ADM  " }),
      txt("classDivision", "classDivision", 174, 300, 122, 10.8, { prefix: "CLASS  " }),
      txt("rollNo", "rollNo", 36, 334, 126, 10.8, { prefix: "ROLL  " }),
      txt("bloodGroup", "bloodGroup", 174, 334, 122, 10.8, { prefix: "BLOOD  " }),
      txt("dob", "dob", 36, 368, 150, 10.8, { prefix: "DOB  " }),
      qr(222, 365, 68),
      txt("academicYear", "academicYear", 0, 489, 330, 10, {
        color: "#ffffff",
        textAlign: "center",
        fontWeight: 800,
      }),
    ],
  };
}

function template07() {
  const [primary, accent, dark] = P.teal;

  return {
    layoutFamily: "Photo Header",
    orientation: "portrait",
    width: 330,
    height: 520,
    backgroundColor: "#ffffff",
    decorations: [
      rect(0, 0, 330, 250, "#dceff2"),
      rect(0, 194, 330, 75, primary, .94),
      rect(0, 458, 330, 62, dark),
      rect(250, 14, 110, 18, accent, .8, 42),
    ],
    elements: [
      img("studentPhoto", "studentPhoto", 0, 0, 330, 250, { objectFit: "cover" }),
      img("schoolLogo", "schoolLogo", 18, 16, 50, 50, {
        objectFit: "contain",
        backgroundColor: "#ffffff",
      }),
      txt("schoolName", "schoolName", 80, 18, 220, 16, {
        color: "#ffffff",
        fontWeight: 900,
      }),
      txt("studentName", "studentName", 22, 211, 285, 21, {
        color: "#ffffff",
        fontWeight: 900,
      }),
      txt("admissionNo", "admissionNo", 22, 292, 135, 11, { prefix: "ADM  " }),
      txt("classDivision", "classDivision", 172, 292, 136, 11, { prefix: "CLASS  " }),
      txt("rollNo", "rollNo", 22, 327, 135, 11, { prefix: "ROLL  " }),
      txt("bloodGroup", "bloodGroup", 172, 327, 136, 11, { prefix: "BLOOD  " }),
      txt("dob", "dob", 22, 362, 150, 11, { prefix: "DOB  " }),
      qr(218, 365, 72),
      txt("academicYear", "academicYear", 0, 478, 330, 10, {
        color: "#ffffff",
        textAlign: "center",
        fontWeight: 800,
      }),
    ],
  };
}

function template08() {
  const [primary, accent, dark] = P.indigo;

  return {
    layoutFamily: "Minimal Editorial",
    orientation: "portrait",
    width: 330,
    height: 520,
    backgroundColor: "#ffffff",
    decorations: [
      rect(24, 18, 282, 3, primary),
      rect(24, 100, 282, 1, "#cbd5e1"),
      rect(24, 352, 282, 1, "#cbd5e1"),
      rect(24, 498, 282, 3, accent),
    ],
    elements: [
      img("schoolLogo", "schoolLogo", 24, 35, 42, 42, { objectFit: "contain" }),
      txt("schoolName", "schoolName", 78, 38, 222, 15.5, {
        color: dark,
        fontWeight: 900,
      }),
      img("studentPhoto", "studentPhoto", 24, 125, 94, 118, {
        borderWidth: 1,
        borderColor: "#cbd5e1",
      }),
      txt("studentName", "studentName", 138, 125, 166, 20, {
        color: dark,
        fontWeight: 900,
        height: 50,
      }),
      txt("admissionNo", "admissionNo", 138, 180, 166, 10.8, { prefix: "ID / " }),
      txt("classDivision", "classDivision", 138, 210, 166, 10.8, { prefix: "CLASS / " }),
      txt("rollNo", "rollNo", 138, 240, 166, 10.8, { prefix: "ROLL / " }),
      txt("dob", "dob", 24, 286, 128, 10.8, { prefix: "DOB / " }),
      txt("bloodGroup", "bloodGroup", 174, 286, 130, 10.8, { prefix: "BLOOD / " }),
      qr(125, 382, 80),
      txt("academicYear", "academicYear", 24, 470, 282, 10, {
        color: primary,
        textAlign: "center",
        fontWeight: 800,
      }),
    ],
  };
}

function template09() {
  const [primary, accent, dark] = P.forest;

  return {
    layoutFamily: "Bottom Portrait",
    orientation: "portrait",
    width: 330,
    height: 520,
    backgroundColor: "#ffffff",
    decorations: [
      rect(0, 0, 330, 100, dark),
      rect(0, 100, 330, 7, accent),
      rect(0, 346, 330, 174, primary),
      circle(225, 392, 150, 150, accent, .18),
    ],
    elements: [
      img("schoolLogo", "schoolLogo", 18, 18, 50, 50, { objectFit: "contain" }),
      txt("schoolName", "schoolName", 82, 20, 220, 17, {
        color: "#ffffff",
        fontWeight: 900,
      }),
      txt("studentName", "studentName", 24, 132, 282, 22, {
        color: dark,
        fontWeight: 900,
      }),
      txt("admissionNo", "admissionNo", 24, 186, 132, 10.8, { prefix: "Admission  " }),
      txt("classDivision", "classDivision", 174, 186, 132, 10.8, { prefix: "Class  " }),
      txt("rollNo", "rollNo", 24, 220, 132, 10.8, { prefix: "Roll  " }),
      txt("bloodGroup", "bloodGroup", 174, 220, 132, 10.8, { prefix: "Blood  " }),
      txt("dob", "dob", 24, 254, 150, 10.8, { prefix: "DOB  " }),
      img("studentPhoto", "studentPhoto", 26, 324, 116, 156, {
        borderWidth: 5,
        borderColor: "#ffffff",
      }),
      qr(205, 382, 74),
      txt("academicYear", "academicYear", 168, 482, 138, 10, {
        color: "#ffffff",
        textAlign: "right",
        fontWeight: 800,
      }),
    ],
  };
}

function template10() {
  const [primary, accent, dark] = P.plum;

  return {
    layoutFamily: "Centered Badge",
    orientation: "portrait",
    width: 330,
    height: 520,
    backgroundColor: "#fbf8fc",
    decorations: [
      rect(0, 0, 330, 90, dark),
      rect(0, 90, 330, 10, accent),
      circle(90, 118, 150, 150, accent, .12),
      rect(0, 482, 330, 38, primary),
    ],
    elements: [
      img("schoolLogo", "schoolLogo", 18, 18, 46, 46, { objectFit: "contain" }),
      txt("schoolName", "schoolName", 76, 20, 224, 16, {
        color: "#ffffff",
        fontWeight: 900,
      }),
      img("studentPhoto", "studentPhoto", 112, 116, 106, 106, {
        borderRadius: 53,
        borderWidth: 5,
        borderColor: "#ffffff",
      }),
      txt("studentName", "studentName", 25, 238, 280, 21, {
        color: dark,
        fontWeight: 900,
        textAlign: "center",
      }),
      txt("admissionNo", "admissionNo", 48, 286, 234, 11, { prefix: "Admission No.  " }),
      txt("classDivision", "classDivision", 48, 316, 234, 11, { prefix: "Class / Section  " }),
      txt("rollNo", "rollNo", 48, 346, 234, 11, { prefix: "Roll No.  " }),
      qr(128, 394, 74),
      txt("academicYear", "academicYear", 0, 493, 330, 10, {
        color: "#ffffff",
        fontWeight: 800,
        textAlign: "center",
      }),
    ],
  };
}

function landscapeBase(palette, photoSide = "left") {
  const [primary, accent, dark] = palette;
  const photoLeft = photoSide === "left";
  const photoX = photoLeft ? 0 : 355;
  const contentX = photoLeft ? 178 : 24;

  return {
    orientation: "landscape",
    width: 520,
    height: 330,
    backgroundColor: "#ffffff",
    decorations: [
      rect(photoLeft ? 170 : 0, 0, 350, 66, primary),
      rect(photoLeft ? 170 : 0, 66, 350, 6, accent),
      rect(photoLeft ? 170 : 0, 292, 350, 38, dark),
    ],
    elements: [
      img("studentPhoto", "studentPhoto", photoX, 0, 165, 330, { objectFit: "cover" }),
      img("schoolLogo", "schoolLogo", contentX, 12, 42, 42, { objectFit: "contain" }),
      txt("schoolName", "schoolName", contentX + 54, 17, 270, 17, {
        color: "#ffffff",
        fontWeight: 900,
      }),
      txt("studentName", "studentName", contentX, 94, 300, 23, {
        color: dark,
        fontWeight: 900,
        height: 30,
      }),
      txt("admissionNo", "admissionNo", contentX, 145, 142, 11, { prefix: "Admission  " }),
      txt("classDivision", "classDivision", contentX + 154, 145, 142, 11, { prefix: "Class  " }),
      txt("rollNo", "rollNo", contentX, 180, 142, 11, { prefix: "Roll  " }),
      txt("bloodGroup", "bloodGroup", contentX + 154, 180, 142, 11, { prefix: "Blood  " }),
      txt("dob", "dob", contentX, 215, 160, 11, { prefix: "DOB  " }),
      qr(contentX + 222, 205, 68),
      txt("academicYear", "academicYear", contentX, 303, 300, 10, {
        color: "#ffffff",
        textAlign: "right",
        fontWeight: 800,
      }),
    ],
  };
}

function template11() {
  const d = landscapeBase(P.navy, "left");
  d.layoutFamily = "Landscape Executive";
  return d;
}

function template12() {
  const d = landscapeBase(P.emerald, "right");
  d.layoutFamily = "Landscape Mirror";
  return d;
}

function template13() {
  const [primary, accent, dark] = P.royal;

  return {
    layoutFamily: "Landscape Bands",
    orientation: "landscape",
    width: 520,
    height: 330,
    backgroundColor: "#f8fafc",
    decorations: [
      rect(0, 0, 520, 58, dark),
      rect(0, 58, 520, 7, accent),
      rect(0, 292, 520, 38, primary),
      circle(395, 75, 150, 150, accent, .10),
    ],
    elements: [
      img("schoolLogo", "schoolLogo", 20, 9, 40, 40, { objectFit: "contain" }),
      txt("schoolName", "schoolName", 72, 14, 340, 17, {
        color: "#ffffff",
        fontWeight: 900,
      }),
      img("studentPhoto", "studentPhoto", 28, 94, 112, 144, {
        borderWidth: 4,
        borderColor: primary,
      }),
      txt("studentName", "studentName", 168, 88, 300, 23, {
        color: dark,
        fontWeight: 900,
      }),
      txt("admissionNo", "admissionNo", 168, 142, 140, 11, { prefix: "Admission  " }),
      txt("classDivision", "classDivision", 326, 142, 140, 11, { prefix: "Class  " }),
      txt("rollNo", "rollNo", 168, 177, 140, 11, { prefix: "Roll  " }),
      txt("dob", "dob", 326, 177, 140, 11, { prefix: "DOB  " }),
      txt("bloodGroup", "bloodGroup", 168, 212, 140, 11, { prefix: "Blood  " }),
      qr(405, 205, 64),
      txt("academicYear", "academicYear", 20, 303, 480, 10, {
        color: "#ffffff",
        textAlign: "center",
        fontWeight: 800,
      }),
    ],
  };
}

function template14() {
  const [primary, accent, dark] = P.burgundy;

  return {
    layoutFamily: "Landscape Minimal",
    orientation: "landscape",
    width: 520,
    height: 330,
    backgroundColor: "#ffffff",
    decorations: [
      rect(24, 22, 472, 3, primary),
      rect(24, 302, 472, 3, accent),
      rect(160, 78, 1, 188, "#cbd5e1"),
    ],
    elements: [
      img("schoolLogo", "schoolLogo", 24, 38, 44, 44, { objectFit: "contain" }),
      txt("schoolName", "schoolName", 82, 43, 320, 17, {
        color: dark,
        fontWeight: 900,
      }),
      img("studentPhoto", "studentPhoto", 28, 102, 104, 138, {
        borderWidth: 1,
        borderColor: "#cbd5e1",
      }),
      txt("studentName", "studentName", 186, 100, 280, 23, {
        color: dark,
        fontWeight: 900,
      }),
      txt("admissionNo", "admissionNo", 186, 150, 140, 11, { prefix: "ID / " }),
      txt("classDivision", "classDivision", 336, 150, 132, 11, { prefix: "CLASS / " }),
      txt("rollNo", "rollNo", 186, 185, 140, 11, { prefix: "ROLL / " }),
      txt("bloodGroup", "bloodGroup", 336, 185, 132, 11, { prefix: "BLOOD / " }),
      txt("dob", "dob", 186, 220, 155, 11, { prefix: "DOB / " }),
      qr(404, 216, 60),
      txt("academicYear", "academicYear", 186, 276, 278, 10, {
        color: primary,
        textAlign: "right",
        fontWeight: 800,
      }),
    ],
  };
}

function template15() {
  const [primary, accent, dark] = P.charcoal;

  return {
    layoutFamily: "Landscape Dark Frame",
    orientation: "landscape",
    width: 520,
    height: 330,
    backgroundColor: "#ffffff",
    decorations: [
      rect(0, 0, 520, 330, dark),
      rect(12, 12, 496, 306, "#ffffff"),
      rect(12, 12, 496, 62, primary),
      rect(12, 298, 496, 20, accent),
    ],
    elements: [
      img("schoolLogo", "schoolLogo", 28, 22, 42, 42, { objectFit: "contain" }),
      txt("schoolName", "schoolName", 82, 25, 330, 17, {
        color: "#ffffff",
        fontWeight: 900,
      }),
      img("studentPhoto", "studentPhoto", 34, 98, 108, 146, {
        borderWidth: 3,
        borderColor: primary,
      }),
      txt("studentName", "studentName", 172, 98, 300, 23, {
        color: dark,
        fontWeight: 900,
      }),
      txt("admissionNo", "admissionNo", 172, 148, 142, 11, { prefix: "Admission  " }),
      txt("classDivision", "classDivision", 326, 148, 142, 11, { prefix: "Class  " }),
      txt("rollNo", "rollNo", 172, 184, 142, 11, { prefix: "Roll  " }),
      txt("bloodGroup", "bloodGroup", 326, 184, 142, 11, { prefix: "Blood  " }),
      txt("dob", "dob", 172, 220, 160, 11, { prefix: "DOB  " }),
      qr(404, 216, 60),
      txt("academicYear", "academicYear", 174, 273, 290, 10, {
        color: primary,
        fontWeight: 800,
        textAlign: "right",
      }),
    ],
  };
}

function template16() {
  const [primary, accent, dark] = P.amber;

  return {
    layoutFamily: "Landscape Photo Focus",
    orientation: "landscape",
    width: 520,
    height: 330,
    backgroundColor: "#ffffff",
    decorations: [
      rect(0, 0, 520, 330, "#ffffff"),
      rect(0, 0, 206, 330, "#efe4d1"),
      rect(206, 0, 314, 64, dark),
      rect(206, 64, 314, 8, accent),
      rect(206, 290, 314, 40, primary),
    ],
    elements: [
      img("studentPhoto", "studentPhoto", 0, 0, 206, 330, { objectFit: "cover" }),
      img("schoolLogo", "schoolLogo", 224, 12, 42, 42, { objectFit: "contain" }),
      txt("schoolName", "schoolName", 278, 17, 220, 16, {
        color: "#ffffff",
        fontWeight: 900,
      }),
      txt("studentName", "studentName", 232, 96, 250, 23, {
        color: dark,
        fontWeight: 900,
      }),
      txt("admissionNo", "admissionNo", 232, 146, 120, 11, { prefix: "ID  " }),
      txt("classDivision", "classDivision", 366, 146, 120, 11, { prefix: "CLASS  " }),
      txt("rollNo", "rollNo", 232, 181, 120, 11, { prefix: "ROLL  " }),
      txt("bloodGroup", "bloodGroup", 366, 181, 120, 11, { prefix: "BLOOD  " }),
      txt("dob", "dob", 232, 216, 150, 11, { prefix: "DOB  " }),
      qr(410, 210, 62),
      txt("academicYear", "academicYear", 232, 301, 260, 10, {
        color: "#ffffff",
        textAlign: "right",
        fontWeight: 800,
      }),
    ],
  };
}

function template17() {
  const d = portraitShell({
    palette: P.teal,
    photo: { x: 36, y: 130, w: 94, h: 126 },
    titleY: 142,
    detailY: 268,
    accentMode: "side",
  });

  d.layoutFamily = "Side Compact";
  d.elements = d.elements.map((e) => {
    if (e.type === "studentName") {
      return { ...e, x: 154, y: 130, width: 152, textAlign: "left" };
    }
    if (["admissionNo","classDivision","rollNo","dob","bloodGroup"].includes(e.type)) {
      return { ...e, x: 154, width: 152 };
    }
    if (e.type === "qrCode") {
      return { ...e, x: 200, y: 388, width: 70, height: 70 };
    }
    return e;
  });
  return d;
}

function template18() {
  const [primary, accent, dark] = P.indigo;

  return {
    layoutFamily: "Academic Formal",
    orientation: "portrait",
    width: 330,
    height: 520,
    backgroundColor: "#ffffff",
    decorations: [
      rect(0, 0, 330, 112, dark),
      rect(0, 112, 330, 4, accent),
      rect(26, 252, 278, 1, "#cbd5e1"),
      rect(0, 486, 330, 34, primary),
    ],
    elements: [
      img("schoolLogo", "schoolLogo", 18, 18, 52, 52, { objectFit: "contain" }),
      txt("schoolName", "schoolName", 82, 20, 220, 17, {
        color: "#ffffff",
        fontWeight: 900,
      }),
      txt("schoolTagline", "schoolTagline", 82, 47, 220, 8.5, {
        color: "#c7d2fe",
      }),
      img("studentPhoto", "studentPhoto", 30, 142, 96, 118, {
        borderWidth: 3,
        borderColor: "#ffffff",
      }),
      txt("studentName", "studentName", 148, 146, 158, 20, {
        color: dark,
        fontWeight: 900,
        height: 48,
      }),
      txt("admissionNo", "admissionNo", 148, 205, 158, 11, { prefix: "Admission  " }),
      txt("classDivision", "classDivision", 36, 286, 258, 11, { prefix: "Class / Section  " }),
      txt("rollNo", "rollNo", 36, 318, 258, 11, { prefix: "Roll No.  " }),
      txt("dob", "dob", 36, 350, 258, 11, { prefix: "DOB  " }),
      txt("bloodGroup", "bloodGroup", 36, 382, 258, 11, { prefix: "Blood Group  " }),
      qr(226, 397, 64),
      txt("academicYear", "academicYear", 0, 496, 330, 10, {
        color: "#ffffff",
        textAlign: "center",
        fontWeight: 800,
      }),
    ],
  };
}

function template19() {
  const [primary, accent, dark] = P.forest;

  return {
    layoutFamily: "Modern Geometry",
    orientation: "portrait",
    width: 330,
    height: 520,
    backgroundColor: "#f8fbf8",
    decorations: [
      rect(0, 0, 330, 90, primary),
      rect(245, 0, 110, 110, accent, .9, 38),
      rect(-42, 390, 180, 70, accent, .13, -25),
      rect(0, 486, 330, 34, dark),
    ],
    elements: [
      img("schoolLogo", "schoolLogo", 18, 18, 46, 46, { objectFit: "contain" }),
      txt("schoolName", "schoolName", 76, 20, 220, 16, {
        color: "#ffffff",
        fontWeight: 900,
      }),
      img("studentPhoto", "studentPhoto", 112, 118, 106, 118, {
        borderWidth: 4,
        borderColor: "#ffffff",
      }),
      txt("studentName", "studentName", 26, 252, 278, 21, {
        color: dark,
        fontWeight: 900,
        textAlign: "center",
      }),
      txt("admissionNo", "admissionNo", 42, 300, 246, 11, { prefix: "Admission  " }),
      txt("classDivision", "classDivision", 42, 330, 246, 11, { prefix: "Class  " }),
      txt("rollNo", "rollNo", 42, 360, 246, 11, { prefix: "Roll  " }),
      txt("bloodGroup", "bloodGroup", 42, 390, 145, 11, { prefix: "Blood  " }),
      qr(218, 384, 70),
      txt("academicYear", "academicYear", 0, 496, 330, 10, {
        color: "#ffffff",
        textAlign: "center",
        fontWeight: 800,
      }),
    ],
  };
}

function template20() {
  const yellow = "#ffd51a";
  const red = "#bd1e2d";
  const navy = "#07377a";
  const ink = "#111111";

  return {
    layoutFamily: "District School Yellow ID",
    orientation: "portrait",
    width: 330,
    height: 520,
    backgroundColor: "#ffffff",
    decorations: [
      // Main yellow identity header.
      rect(0, 0, 330, 176, yellow),

      // White diagonal cuts create the same downward-pointing header style
      // as the supplied physical school ID card.
      rect(-65, 143, 210, 85, "#ffffff", 1, 31),
      rect(186, 143, 210, 85, "#ffffff", 1, -31),

      // Student-name band.
      rect(0, 305, 330, 44, yellow),

      // Bottom yellow accent strip.
      rect(0, 507, 330, 13, yellow),

      // Small accent at bottom center/right.
      rect(185, 503, 150, 22, "#ffffff", 1, -18),
    ],
    elements: [
      // Logo stays in a dedicated contain box, so any uploaded logo fits.
      img("schoolLogo", "schoolLogo", 139, 10, 52, 52, {
        objectFit: "contain",
        backgroundColor: "#ffffff",
      }),

      // School name can wrap to two/three lines instead of overlapping.
      txt("schoolName", "schoolName", 20, 63, 290, 17, {
        color: red,
        fontWeight: 900,
        textAlign: "center",
        height: 54,
        multiline: true,
        lineHeight: 1.05,
      }),

      txt("schoolTagline", "schoolTagline", 30, 113, 270, 10.5, {
        color: ink,
        fontWeight: 800,
        textAlign: "center",
        height: 22,
      }),

      txt("schoolRegistrationNo", "schoolRegistrationNo", 30, 136, 270, 12.5, {
        color: navy,
        fontWeight: 900,
        textAlign: "center",
        prefix: "UDISE NO.  ",
      }),

      txt("identityTitle", "customText", 30, 158, 270, 15, {
        color: ink,
        fontWeight: 900,
        textAlign: "center",
        customText: "ओळखपत्र",
      }),

      // Standard ID-photo area. Uploaded photos use objectFit=cover.
      img("studentPhoto", "studentPhoto", 111, 183, 108, 126, {
        objectFit: "cover",
        borderWidth: 3,
        borderColor: red,
        backgroundColor: "#eef2f7",
      }),

      txt("studentName", "studentName", 18, 312, 294, 20, {
        color: navy,
        fontWeight: 900,
        textAlign: "center",
        height: 30,
      }),

      txt("dob", "dob", 30, 363, 270, 12, {
        color: ink,
        fontWeight: 800,
        prefix: "जन्मतारीख  :  ",
      }),

      txt("rollNo", "rollNo", 30, 397, 270, 12, {
        color: ink,
        fontWeight: 800,
        prefix: "रजिस्टर नंबर  :  ",
      }),

      txt("parentMobile", "parentMobile", 30, 431, 270, 12, {
        color: ink,
        fontWeight: 800,
        prefix: "मोबाईल नंबर  :  ",
      }),

      // Signature occupies its own isolated zone.
      img("principalSignature", "principalSignature", 198, 458, 108, 31, {
        objectFit: "contain",
      }),

      txt("principalName", "principalName", 188, 486, 122, 8.5, {
        color: navy,
        fontWeight: 800,
        textAlign: "center",
        height: 17,
      }),
    ],
  };
}

const templates = [
  template01(),
  template02(),
  template03(),
  template04(),
  template05(),
  template06(),
  template07(),
  template08(),
  template09(),
  template10(),
  template11(),
  template12(),
  template13(),
  template14(),
  template15(),
  template16(),
  template17(),
  template18(),
  template19(),
  template20(),
];

const names = [
  "Executive Portrait",
  "Classic Crest",
  "Left Identity Rail",
  "Right Portrait Panel",
  "Clean Split",
  "Diagonal Premium",
  "Photo Header",
  "Minimal Editorial",
  "Bottom Portrait",
  "Centered Badge",
  "Landscape Executive",
  "Landscape Mirror",
  "Landscape Bands",
  "Landscape Minimal",
  "Landscape Dark Frame",
  "Landscape Photo Focus",
  "Side Compact",
  "Academic Formal",
  "Modern Geometry",
  "District School Yellow ID",
];

export const SYSTEM_TEMPLATES = templates.map((design, index) => {
  const number = String(index + 1).padStart(2, "0");

  return {
    name: `${number} · ${names[index]}`,
    slug: `system-template-${number}`,
    type: "SYSTEM",
    schoolId: null,
    category: design.orientation === "landscape" ? "Landscape" : "Portrait",
    layoutFamily: design.layoutFamily,
    orientation: design.orientation,
    width: design.width,
    height: design.height,
    backgroundColor: design.backgroundColor,
    backgroundFileId: null,
    decorations: design.decorations,
    elements: design.elements,
    active: true,
    isDeleted: false,
  };
});
