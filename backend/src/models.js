import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["ADMIN", "SCHOOL"],
      required: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: "School",
      default: null,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

const schoolSchema = new Schema(
  {
    schoolCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    contactPersonName: String,
    email: String,
    mobile: String,
    registrationNo: String,
    address: String,
    city: String,
    state: String,
    pinCode: String,
    website: String,
    tagline: String,
    logoFileId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    principalName: String,
    principalSignatureFileId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    academicYear: {
      type: String,
      default: "2026-2027",
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

const studentSchema = new Schema(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: "School",
      required: true,
      index: true,
    },

    // Only student name is mandatory.
    name: {
      type: String,
      required: true,
      trim: true,
    },

    admissionNo: {
      type: String,
      default: null,
      trim: true,
    },
    rollNo: {
      type: String,
      default: null,
      trim: true,
    },
    className: {
      type: String,
      default: null,
      trim: true,
    },
    division: {
      type: String,
      default: null,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", ""],
      default: "",
    },
    dob: {
      type: Date,
      default: null,
    },
    bloodGroup: {
      type: String,
      default: null,
    },
    academicYear: {
      type: String,
      default: null,
    },
    parentName: {
      type: String,
      default: null,
    },
    parentMobile: {
      type: String,
      default: null,
    },
    emergencyContact: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      default: null,
    },
    house: {
      type: String,
      default: null,
    },
    busRoute: {
      type: String,
      default: null,
    },
    photoFileId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    cardStatus: {
      type: String,
      enum: ["PENDING", "GENERATED"],
      default: "PENDING",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const decorationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["rect", "circle", "line"],
      required: true,
    },
    x: Number,
    y: Number,
    width: Number,
    height: Number,
    color: String,
    opacity: {
      type: Number,
      default: 1,
    },
    rotate: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const elementSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "schoolLogo",
        "schoolName",
        "schoolTagline",
        "schoolRegistrationNo",
        "principalName",
        "studentPhoto",
        "studentName",
        "admissionNo",
        "rollNo",
        "classDivision",
        "dob",
        "bloodGroup",
        "academicYear",
        "parentName",
        "parentMobile",
        "qrCode",
        "principalSignature",
        "customText",
      ],
      required: true,
    },
    x: {
      type: Number,
      default: 10,
    },
    y: {
      type: Number,
      default: 10,
    },
    width: {
      type: Number,
      default: 120,
    },
    height: {
      type: Number,
      default: 26,
    },
    fontSize: {
      type: Number,
      default: 13,
    },
    minFontSize: {
      type: Number,
      default: 7,
    },
    fontWeight: {
      type: Number,
      default: 500,
    },
    color: {
      type: String,
      default: "#0f172a",
    },
    backgroundColor: {
      type: String,
      default: "transparent",
    },
    textAlign: {
      type: String,
      enum: ["left", "center", "right"],
      default: "left",
    },
    borderWidth: {
      type: Number,
      default: 0,
    },
    borderColor: {
      type: String,
      default: "transparent",
    },
    borderRadius: {
      type: Number,
      default: 0,
    },
    objectFit: {
      type: String,
      enum: ["cover", "contain"],
      default: "cover",
    },
    prefix: {
      type: String,
      default: "",
    },
    customText: {
      type: String,
      default: "",
    },
    multiline: {
      type: Boolean,
      default: false,
    },
    lineHeight: {
      type: Number,
      default: 1.12,
    },
    letterSpacing: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const templateSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ["SYSTEM", "CUSTOM"],
      default: "SYSTEM",
      index: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: "School",
      default: null,
      index: true,
    },
    language: {
      type: String,
      enum: ["EN", "MR", "CUSTOM"],
      default: "CUSTOM",
      index: true,
    },
    category: {
      type: String,
      default: "Modern",
    },
    layoutFamily: {
      type: String,
      default: "Centered",
    },
    orientation: {
      type: String,
      enum: ["portrait", "landscape"],
      default: "portrait",
    },
    width: {
      type: Number,
      default: 330,
    },
    height: {
      type: Number,
      default: 520,
    },
    backgroundColor: {
      type: String,
      default: "#ffffff",
    },
    backgroundFileId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    decorations: {
      type: [decorationSchema],
      default: [],
    },
    elements: {
      type: [elementSchema],
      default: [],
    },
    active: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const templateSettingsSchema = new Schema(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: "School",
      required: true,
      unique: true,
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: "Template",
      default: null,
    },
  },
  { timestamps: true }
);

export const User = model("User", userSchema);
export const School = model("School", schoolSchema);
export const Student = model("Student", studentSchema);
export const Template = model("Template", templateSchema);
export const TemplateSettings = model(
  "TemplateSettings",
  templateSettingsSchema
);
