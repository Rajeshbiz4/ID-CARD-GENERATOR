import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { connectDatabase } from "./config/database.js";
import { ensureSystemTemplates } from "./systemTemplateBootstrap.js";
import { ensureStudentIndexes } from "./studentIndexes.js";
import {
  imageUpload,
  getOwnedImage,
  openImage,
  deleteOwnedImage,
  storeImage,
} from "./imageStorage.js";
import {
  School,
  Student,
  Template,
  TemplateSettings,
  User,
} from "./models.js";

dotenv.config();

const app = express();
const JWT_SECRET =
  process.env.JWT_SECRET ||
  "development-secret-change-before-production";

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

const corsOptions = {
  origin: true,
  credentials: true,
  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],
  exposedHeaders: [
    "Content-Type",
    "Content-Length",
  ],
  maxAge: 86400,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(
  express.json({
    limit: "2mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(
  morgan(
    process.env.VERCEL
      ? "tiny"
      : "dev"
  )
);

app.use(async (req, res, next) => {
  try {
    await connectDatabase();
    await ensureSystemTemplates();
    await ensureStudentIndexes();
    next();
  } catch (error) {
    console.error(
      "Database connection failed:",
      error
    );

    return res.status(503).json({
      success: false,
      message:
        "Database connection failed",
      errors: [],
    });
  }
});

function ok(
  res,
  data = null,
  message = "Success",
  status = 200
) {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
}

function fail(
  res,
  message,
  status = 400,
  errors = []
) {
  return res.status(status).json({
    success: false,
    message,
    errors,
  });
}

function auth(req, res, next) {
  const header =
    req.headers.authorization || "";

  if (!header.startsWith("Bearer ")) {
    return fail(
      res,
      "Authentication required",
      401
    );
  }

  try {
    const payload = jwt.verify(
      header.slice(7),
      JWT_SECRET
    );

    req.auth = {
      userId: payload.sub,
      role: payload.role,
      schoolId:
        payload.schoolId || null,
    };

    next();
  } catch {
    return fail(
      res,
      "Invalid or expired token",
      401
    );
  }
}

function role(...allowedRoles) {
  return (req, res, next) => {
    if (
      !allowedRoles.includes(
        req.auth?.role
      )
    ) {
      return fail(
        res,
        "Forbidden",
        403
      );
    }

    next();
  };
}

function customSlug(
  name,
  schoolId
) {
  const normalizedName =
    String(name || "template")
      .trim()
      .toLowerCase()
      .normalize("NFKC")
      .replace(/\s+/g, "-")
      .replace(/[^\p{L}\p{N}-]+/gu, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") ||
    "template";

  return `custom-${normalizedName}-${String(
    schoolId
  ).slice(-6)}-${Date.now()}`;
}

const DEFAULT_ID_CARD_LIMIT = 20;

function quotaData(school) {
  const limit =
    Number.isFinite(Number(school?.idCardLimit))
      ? Math.max(0, Number(school.idCardLimit))
      : DEFAULT_ID_CARD_LIMIT;

  const used =
    Number.isFinite(Number(school?.idCardsUsed))
      ? Math.max(0, Number(school.idCardsUsed))
      : 0;

  return {
    limit,
    used,
    remaining: Math.max(0, limit - used),
  };
}

async function ensureSchoolQuota(schoolId) {
  if (!schoolId) return null;

  await School.updateOne(
    { _id: schoolId, idCardLimit: { $exists: false } },
    { $set: { idCardLimit: DEFAULT_ID_CARD_LIMIT } }
  );

  await School.updateOne(
    { _id: schoolId, idCardsUsed: { $exists: false } },
    { $set: { idCardsUsed: 0 } }
  );

  return School.findById(schoolId).lean();
}

async function ensureAllSchoolQuotas() {
  await School.updateMany(
    { idCardLimit: { $exists: false } },
    { $set: { idCardLimit: DEFAULT_ID_CARD_LIMIT } }
  );

  await School.updateMany(
    { idCardsUsed: { $exists: false } },
    { $set: { idCardsUsed: 0 } }
  );
}

/* -------------------------------------------------------------------------- */
/* Public                                                                     */
/* -------------------------------------------------------------------------- */

app.get("/", (req, res) => {
  return ok(res, {
    application:
      "School ID Card Generator",
    version: "2.5.0",
  });
});

app.get(
  "/api/health",
  (req, res) => {
    return ok(
      res,
      {
        status: "ok",
      },
      "API healthy"
    );
  }
);

app.post(
  "/api/auth/login",
  async (req, res) => {
    const {
      email,
      password,
    } = req.body;

    if (
      !email ||
      !password
    ) {
      return fail(
        res,
        "Email and password are required"
      );
    }

    const user =
      await User.findOne({
        email: String(email)
          .trim()
          .toLowerCase(),
      });

    if (
      !user ||
      !(
        await bcrypt.compare(
          password,
          user.passwordHash
        )
      )
    ) {
      return fail(
        res,
        "Invalid email or password",
        401
      );
    }

    if (
      user.status !== "ACTIVE"
    ) {
      return fail(
        res,
        "Account inactive",
        403
      );
    }

    if (
      user.role === "SCHOOL"
    ) {
      const school =
        await School.findById(
          user.schoolId
        );

      if (
        !school ||
        school.status !== "ACTIVE"
      ) {
        return fail(
          res,
          "School inactive",
          403
        );
      }
    }

    const token = jwt.sign(
      {
        sub: user._id.toString(),
        role: user.role,
        schoolId:
          user.schoolId?.toString() ||
          null,
      },
      JWT_SECRET,
      {
        expiresIn: "8h",
      }
    );

    return ok(
      res,
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          schoolId:
            user.schoolId,
        },
      },
      "Login successful"
    );
  }
);

app.use("/api", auth);

/* -------------------------------------------------------------------------- */
/* Image storage: MongoDB GridFS                                              */
/* -------------------------------------------------------------------------- */

app.post(
  "/api/uploads/image",
  role("SCHOOL"),
  imageUpload.single("image"),
  async (req, res) => {
    try {
      const fileId =
        await storeImage({
          file: req.file,
          schoolId:
            req.auth.schoolId,
          category:
            req.body.category ||
            "image",
        });

      return ok(
        res,
        {
          fileId:
            String(fileId),
        },
        "Image uploaded",
        201
      );
    } catch (error) {
      return fail(
        res,
        error.message ||
          "Image upload failed"
      );
    }
  }
);

app.get(
  "/api/files/:id",
  async (req, res) => {
    const file =
      await getOwnedImage(
        req.params.id,
        req.auth.schoolId,
        req.auth.role === "ADMIN"
      );

    if (!file) {
      return fail(
        res,
        "Image not found",
        404
      );
    }

    res.setHeader(
      "Content-Type",
      file.contentType ||
        "application/octet-stream"
    );

    res.setHeader(
      "Cache-Control",
      "private, max-age=3600"
    );

    const stream =
      openImage(req.params.id);

    stream.on(
      "error",
      () => {
        if (
          !res.headersSent
        ) {
          fail(
            res,
            "Image not found",
            404
          );
        }
      }
    );

    stream.pipe(res);
  }
);

app.delete(
  "/api/files/:id",
  async (req, res) => {
    const removed =
      await deleteOwnedImage(
        req.params.id,
        req.auth.schoolId,
        req.auth.role === "ADMIN"
      );

    if (!removed) {
      return fail(
        res,
        "Image not found",
        404
      );
    }

    return ok(
      res,
      null,
      "Image deleted"
    );
  }
);

/* -------------------------------------------------------------------------- */
/* Admin                                                                      */
/* -------------------------------------------------------------------------- */

app.get(
  "/api/admin/dashboard",
  role("ADMIN"),
  async (req, res) => {
    const [
      totalSchools,
      activeSchools,
      totalStudents,
    ] = await Promise.all([
      School.countDocuments(),
      School.countDocuments({
        status: "ACTIVE",
      }),
      Student.countDocuments({
        isDeleted: false,
      }),
    ]);

    return ok(res, {
      totalSchools,
      activeSchools,
      inactiveSchools:
        totalSchools -
        activeSchools,
      totalStudents,
    });
  }
);

app.get(
  "/api/admin/schools",
  role("ADMIN"),
  async (req, res) => {
    await ensureAllSchoolQuotas();

    const schools =
      await School.find()
        .sort({
          createdAt: -1,
        })
        .lean();

    return ok(
      res,
      schools.map((school) => ({
        ...school,
        idCardQuota: quotaData(school),
      }))
    );
  }
);

app.post(
  "/api/admin/schools",
  role("ADMIN"),
  async (req, res) => {
    const {
      name,
      schoolCode,
      contactPersonName,
      email,
      mobile,
      address,
      city,
      state,
      pinCode,
      password,
    } = req.body;

    if (
      !name ||
      !email ||
      !password
    ) {
      return fail(
        res,
        "School name, email and password are required"
      );
    }

    const normalizedEmail =
      String(email)
        .trim()
        .toLowerCase();

    if (
      await User.exists({
        email:
          normalizedEmail,
      })
    ) {
      return fail(
        res,
        "Email already exists",
        409
      );
    }

    const englishPrefix =
      String(name)
        .normalize("NFKD")
        .replace(/[^a-z]/gi, "")
        .slice(0, 4)
        .toUpperCase();

    const generatedCode =
      `${englishPrefix || "SCH"}${String(
        Date.now()
      ).slice(-6)}`;

    const code =
      String(
        schoolCode ||
          generatedCode
      ).toUpperCase();

    if (
      await School.exists({
        schoolCode: code,
      })
    ) {
      return fail(
        res,
        "School code already exists",
        409
      );
    }

    const school =
      await School.create({
        name,
        schoolCode: code,
        contactPersonName,
        email:
          normalizedEmail,
        mobile,
        address,
        city,
        state,
        pinCode,
        idCardLimit: DEFAULT_ID_CARD_LIMIT,
        idCardsUsed: 0,
      });

    try {
      await User.create({
        name:
          contactPersonName ||
          name,
        email:
          normalizedEmail,
        passwordHash:
          await bcrypt.hash(
            password,
            12
          ),
        role: "SCHOOL",
        schoolId:
          school._id,
        status: "ACTIVE",
      });
    } catch (error) {
      await School.deleteOne({
        _id: school._id,
      });

      throw error;
    }

    return ok(
      res,
      school,
      "School created",
      201
    );
  }
);

app.patch(
  "/api/admin/schools/:id/status",
  role("ADMIN"),
  async (req, res) => {
    const status =
      req.body.status ===
      "ACTIVE"
        ? "ACTIVE"
        : "INACTIVE";

    const school =
      await School.findByIdAndUpdate(
        req.params.id,
        {
          status,
        },
        {
          new: true,
        }
      );

    if (!school) {
      return fail(
        res,
        "School not found",
        404
      );
    }

    await User.updateMany(
      {
        schoolId:
          school._id,
        role: "SCHOOL",
      },
      {
        status,
      }
    );

    return ok(
      res,
      school,
      "Status updated"
    );
  }
);

app.patch(
  "/api/admin/schools/:id/id-card-limit",
  role("ADMIN"),
  async (req, res) => {
    const requestedLimit = Number(req.body.limit);

    if (!Number.isInteger(requestedLimit) || requestedLimit < 0) {
      return fail(res, "ID card limit must be a whole number of 0 or more");
    }

    const current = await ensureSchoolQuota(req.params.id);

    if (!current) {
      return fail(res, "School not found", 404);
    }

    const currentQuota = quotaData(current);

    if (requestedLimit < currentQuota.used) {
      return fail(
        res,
        `Limit cannot be lower than used cards (${currentQuota.used})`
      );
    }

    const school = await School.findByIdAndUpdate(
      req.params.id,
      { idCardLimit: requestedLimit },
      { new: true }
    ).lean();

    return ok(
      res,
      { ...school, idCardQuota: quotaData(school) },
      "ID card limit updated"
    );
  }
);

/* -------------------------------------------------------------------------- */
/* School dashboard/profile                                                   */
/* -------------------------------------------------------------------------- */

app.get(
  "/api/school/dashboard",
  role("SCHOOL"),
  async (req, res) => {
    const schoolId = req.auth.schoolId;

    await ensureSchoolQuota(schoolId);

    const [
      school,
      totalStudents,
      generatedCards,
      pendingCards,
      customTemplates,
    ] = await Promise.all([
      School.findById(schoolId).lean(),
      Student.countDocuments({ schoolId, isDeleted: false }),
      Student.countDocuments({
        schoolId,
        isDeleted: false,
        cardStatus: "GENERATED",
      }),
      Student.countDocuments({
        schoolId,
        isDeleted: false,
        cardStatus: "PENDING",
      }),
      Template.countDocuments({
        schoolId,
        type: "CUSTOM",
        isDeleted: false,
      }),
    ]);

    const quota = quotaData(school);

    return ok(res, {
      schoolName: school?.name,
      schoolCode: school?.schoolCode,
      academicYear: school?.academicYear,
      totalStudents,
      activeStudents: totalStudents,
      generatedCards,
      pendingCards,
      customTemplates,
      idCardLimit: quota.limit,
      idCardsUsed: quota.used,
      idCardRemaining: quota.remaining,
    });
  }
);

app.get(
  "/api/school/id-card-quota",
  role("SCHOOL"),
  async (req, res) => {
    const school = await ensureSchoolQuota(req.auth.schoolId);

    if (!school) {
      return fail(res, "School not found", 404);
    }

    return ok(res, quotaData(school));
  }
);

app.post(
  "/api/school/id-card-quota/consume",
  role("SCHOOL"),
  async (req, res) => {
    const count = Number(req.body.count ?? 1);

    if (!Number.isInteger(count) || count < 1 || count > 500) {
      return fail(res, "Invalid ID card count");
    }

    await ensureSchoolQuota(req.auth.schoolId);

    // Atomic update: only consume if enough balance remains at that moment.
    const school = await School.findOneAndUpdate(
      {
        _id: req.auth.schoolId,
        $expr: {
          $gte: [
            { $subtract: ["$idCardLimit", "$idCardsUsed"] },
            count,
          ],
        },
      },
      { $inc: { idCardsUsed: count } },
      { new: true }
    ).lean();

    if (!school) {
      const current = await School.findById(req.auth.schoolId).lean();

      if (!current) {
        return fail(res, "School not found", 404);
      }

      const quota = quotaData(current);

      return res.status(403).json({
        success: false,
        message:
          "ID card balance is exhausted. Please contact the administrator to increase the limit.",
        errors: [],
        data: quota,
      });
    }

    return ok(res, quotaData(school), "ID card balance updated");
  }
);

app.get(
  "/api/school/profile",
  role("SCHOOL"),
  async (req, res) => {
    const school =
      await School.findById(
        req.auth.schoolId
      ).lean();

    if (!school) {
      return fail(
        res,
        "School not found",
        404
      );
    }

    return ok(
      res,
      school
    );
  }
);

app.put(
  "/api/school/profile",
  role("SCHOOL"),
  async (req, res) => {
    const allowed = [
      "name",
      "registrationNo",
      "mobile",
      "email",
      "website",
      "tagline",
      "logoFileId",
      "principalName",
      "principalSignatureFileId",
      "academicYear",
      "address",
      "city",
      "state",
      "pinCode",
    ];

    const updates =
      Object.fromEntries(
        Object.entries(
          req.body
        ).filter(
          ([key]) =>
            allowed.includes(
              key
            )
        )
      );

    const school =
      await School.findByIdAndUpdate(
        req.auth.schoolId,
        updates,
        {
          new: true,
          runValidators: true,
        }
      );

    return ok(
      res,
      school,
      "Profile saved"
    );
  }
);

function normalizeOptionalString(
  value
) {
  if (
    value === undefined ||
    value === null
  ) {
    return null;
  }

  const normalized =
    String(value).trim();

  return normalized || null;
}

function normalizeStudentPayload(
  body = {}
) {
  const data = {
    ...body,
  };

  [
    "admissionNo",
    "rollNo",
    "className",
    "division",
    "bloodGroup",
    "academicYear",
    "parentName",
    "parentMobile",
    "emergencyContact",
    "address",
    "house",
    "busRoute",
  ].forEach((field) => {
    data[field] =
      normalizeOptionalString(
        data[field]
      );
  });

  data.name =
    String(
      data.name || ""
    ).trim();

  data.gender =
    String(
      data.gender || ""
    ).trim();

  if (!data.dob) {
    data.dob = null;
  }

  return data;
}

/* -------------------------------------------------------------------------- */
/* Students                                                                   */
/* -------------------------------------------------------------------------- */

app.get(
  "/api/students",
  role("SCHOOL"),
  async (req, res) => {
    const query = {
      schoolId:
        req.auth.schoolId,
      isDeleted: false,
    };

    const search =
      String(
        req.query.search ||
          ""
      ).trim();

    if (search) {
      query.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          admissionNo: {
            $regex: search,
            $options: "i",
          },
        },
        {
          rollNo: {
            $regex: search,
            $options: "i",
          },
        },
        {
          parentMobile: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const students =
      await Student.find(
        query
      )
        .sort({
          className: 1,
          division: 1,
          rollNo: 1,
        })
        .lean();

    return ok(
      res,
      students
    );
  }
);

app.post(
  "/api/students",
  role("SCHOOL"),
  async (req, res) => {
    const data = {
      ...normalizeStudentPayload(
        req.body
      ),
      schoolId:
        req.auth.schoolId,
    };

    if (!data.name) {
      return fail(
        res,
        "Student name is required"
      );
    }

    if (
      data.admissionNo &&
      await Student.exists({
        schoolId:
          req.auth.schoolId,
        admissionNo:
          data.admissionNo,
        isDeleted: false,
      })
    ) {
      return fail(
        res,
        "Admission number already exists",
        409
      );
    }

    const student =
      await Student.create(
        data
      );

    return ok(
      res,
      student,
      "Student created",
      201
    );
  }
);

app.get(
  "/api/students/:id",
  role("SCHOOL"),
  async (req, res) => {
    const student =
      await Student.findOne({
        _id: req.params.id,
        schoolId:
          req.auth.schoolId,
        isDeleted: false,
      }).lean();

    if (!student) {
      return fail(
        res,
        "Student not found",
        404
      );
    }

    return ok(
      res,
      student
    );
  }
);

app.put(
  "/api/students/:id",
  role("SCHOOL"),
  async (req, res) => {
    const {
      schoolId:
        ignoredSchoolId,
      _id: ignoredId,
      ...rawUpdates
    } = req.body;

    const updates =
      normalizeStudentPayload(
        rawUpdates
      );

    if (!updates.name) {
      return fail(
        res,
        "Student name is required"
      );
    }

    if (
      updates.admissionNo
    ) {
      const duplicate =
        await Student.exists({
          _id: {
            $ne: req.params.id,
          },
          schoolId:
            req.auth.schoolId,
          admissionNo:
            updates.admissionNo,
          isDeleted: false,
        });

      if (duplicate) {
        return fail(
          res,
          "Admission number already exists",
          409
        );
      }
    }

    const student =
      await Student.findOneAndUpdate(
        {
          _id: req.params.id,
          schoolId:
            req.auth.schoolId,
          isDeleted: false,
        },
        updates,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!student) {
      return fail(
        res,
        "Student not found",
        404
      );
    }

    return ok(
      res,
      student,
      "Student updated"
    );
  }
);

app.delete(
  "/api/students/:id",
  role("SCHOOL"),
  async (req, res) => {
    const student =
      await Student.findOneAndUpdate(
        {
          _id: req.params.id,
          schoolId:
            req.auth.schoolId,
          isDeleted: false,
        },
        {
          isDeleted: true,
        },
        {
          new: true,
        }
      );

    if (!student) {
      return fail(
        res,
        "Student not found",
        404
      );
    }

    return ok(
      res,
      null,
      "Student removed"
    );
  }
);

app.patch(
  "/api/students/:id/card-generated",
  role("SCHOOL"),
  async (req, res) => {
    const student =
      await Student.findOneAndUpdate(
        {
          _id: req.params.id,
          schoolId:
            req.auth.schoolId,
          isDeleted: false,
        },
        {
          cardStatus:
            "GENERATED",
        },
        {
          new: true,
        }
      );

    if (!student) {
      return fail(
        res,
        "Student not found",
        404
      );
    }

    return ok(
      res,
      student,
      "Card generated"
    );
  }
);

/* -------------------------------------------------------------------------- */
/* Templates                                                                  */
/* -------------------------------------------------------------------------- */

app.get(
  "/api/templates",
  role("SCHOOL"),
  async (req, res) => {
    const templates =
      await Template.find({
        active: true,
        isDeleted: false,
        $or: [
          {
            type: "SYSTEM",
          },
          {
            type: "CUSTOM",
            schoolId:
              req.auth.schoolId,
          },
        ],
      })
        .sort({
          type: 1,
          name: 1,
        })
        .lean();

    return ok(
      res,
      templates
    );
  }
);

app.get(
  "/api/custom-templates",
  role("SCHOOL"),
  async (req, res) => {
    const templates =
      await Template.find({
        type: "CUSTOM",
        schoolId:
          req.auth.schoolId,
        isDeleted: false,
      })
        .sort({
          createdAt: -1,
        })
        .lean();

    return ok(
      res,
      templates
    );
  }
);

app.post(
  "/api/custom-templates",
  role("SCHOOL"),
  async (req, res) => {
    const {
      name,
      orientation = "portrait",
      width,
      height,
      backgroundColor =
        "#ffffff",
      backgroundFileId =
        null,
      decorations = [],
      elements = [],
    } = req.body;

    if (!name) {
      return fail(
        res,
        "Template name is required"
      );
    }

    const template =
      await Template.create({
        name,
        slug: customSlug(
          name,
          req.auth.schoolId
        ),
        type: "CUSTOM",
        schoolId:
          req.auth.schoolId,
        category: "Custom",
        layoutFamily:
          "Custom",
        orientation,
        width:
          width ||
          (orientation ===
          "portrait"
            ? 330
            : 520),
        height:
          height ||
          (orientation ===
          "portrait"
            ? 520
            : 330),
        backgroundColor,
        backgroundFileId,
        decorations,
        elements,
      });

    return ok(
      res,
      template,
      "Custom template created",
      201
    );
  }
);

app.put(
  "/api/custom-templates/:id",
  role("SCHOOL"),
  async (req, res) => {
    const allowed = [
      "name",
      "orientation",
      "width",
      "height",
      "backgroundColor",
      "backgroundFileId",
      "decorations",
      "elements",
      "active",
    ];

    const updates =
      Object.fromEntries(
        Object.entries(
          req.body
        ).filter(
          ([key]) =>
            allowed.includes(
              key
            )
        )
      );

    const template =
      await Template.findOneAndUpdate(
        {
          _id: req.params.id,
          type: "CUSTOM",
          schoolId:
            req.auth.schoolId,
          isDeleted: false,
        },
        updates,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!template) {
      return fail(
        res,
        "Custom template not found",
        404
      );
    }

    return ok(
      res,
      template,
      "Custom template saved"
    );
  }
);

app.delete(
  "/api/custom-templates/:id",
  role("SCHOOL"),
  async (req, res) => {
    const template =
      await Template.findOneAndUpdate(
        {
          _id: req.params.id,
          type: "CUSTOM",
          schoolId:
            req.auth.schoolId,
          isDeleted: false,
        },
        {
          isDeleted: true,
          active: false,
        },
        {
          new: true,
        }
      );

    if (!template) {
      return fail(
        res,
        "Custom template not found",
        404
      );
    }

    return ok(
      res,
      null,
      "Custom template deleted"
    );
  }
);

app.get(
  "/api/school/template-settings",
  role("SCHOOL"),
  async (req, res) => {
    let settings =
      await TemplateSettings.findOne({
        schoolId: req.auth.schoolId,
      })
        .populate("templateId")
        .lean();

    const selectedTemplate =
      settings?.templateId || null;

    const selectedIsValid =
      selectedTemplate &&
      selectedTemplate.active === true &&
      selectedTemplate.isDeleted !== true &&
      (
        selectedTemplate.type === "SYSTEM" ||
        (
          selectedTemplate.type === "CUSTOM" &&
          String(selectedTemplate.schoolId) === String(req.auth.schoolId)
        )
      );

    if (!selectedIsValid) {
      const firstSystemTemplate =
        await Template.findOne({
          type: "SYSTEM",
          active: true,
          isDeleted: false,
        }).sort({
          name: 1,
        });

      settings =
        await TemplateSettings.findOneAndUpdate(
          {
            schoolId: req.auth.schoolId,
          },
          {
            $set: {
              templateId: firstSystemTemplate?._id || null,
            },
            $setOnInsert: {
              schoolId: req.auth.schoolId,
            },
          },
          {
            new: true,
            upsert: true,
          }
        )
          .populate("templateId")
          .lean();
    }

    return ok(res, settings);
  }
);

app.put(
  "/api/school/template-settings",
  role("SCHOOL"),
  async (req, res) => {
    const {
      templateId,
    } = req.body;

    const exists =
      await Template.exists({
        _id: templateId,
        active: true,
        isDeleted: false,
        $or: [
          {
            type: "SYSTEM",
          },
          {
            type: "CUSTOM",
            schoolId:
              req.auth.schoolId,
          },
        ],
      });

    if (!exists) {
      return fail(
        res,
        "Template not available",
        404
      );
    }

    const settings =
      await TemplateSettings.findOneAndUpdate(
        {
          schoolId:
            req.auth.schoolId,
        },
        {
          $set: {
            templateId,
          },
          $setOnInsert: {
            schoolId:
              req.auth.schoolId,
          },
        },
        {
          new: true,
          upsert: true,
        }
      ).populate(
        "templateId"
      );

    return ok(
      res,
      settings,
      "Template selected"
    );
  }
);

app.use((req, res) => {
  return fail(
    res,
    "Route not found",
    404
  );
});

app.use(
  (
    error,
    req,
    res,
    next
  ) => {
    console.error(error);

    if (
      error?.code === 11000
    ) {
      return fail(
        res,
        "Duplicate unique value",
        409
      );
    }

    if (
      error?.code ===
      "LIMIT_FILE_SIZE"
    ) {
      return fail(
        res,
        "Image must be smaller than 5 MB"
      );
    }

    return fail(
      res,
      error?.message ||
        "Server error",
      500
    );
  }
);

export default app;

if (!process.env.VERCEL) {
  const port =
    Number(
      process.env.PORT ||
        5000
    );

  connectDatabase()
    .then(async () => {
      await ensureSystemTemplates();
      await ensureStudentIndexes();

      app.listen(
        port,
        () => {
          console.log(
            `API running on http://localhost:${port}`
          );
        }
      );
    })
    .catch((error) => {
      console.error(
        "Startup failed:",
        error
      );

      process.exit(1);
    });
}
