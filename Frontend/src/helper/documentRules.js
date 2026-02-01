/* =====================================================
   DOCUMENT RULES HELPER
===================================================== */

/* ================= OPTIONAL GROUPS (ANY ONE REQUIRED) ================= */
const OPTIONAL_GROUPS = {
  SSC: ["SSC Certificate", "SSC Mark Sheet"],
  HSC: ["HSC Certificate", "HSC Mark Sheet"]
};

/* ================= REQUIRED DOCUMENTS ================= */
export const DOCUMENT_RULES = {
  COMMON_REQUIRED: [
    "Bachelor Certificate",
    "Bachelor Transcript",
    "Nationality Certificate",
    "Testimonial",
    "Passport Photo"
  ],

  PHD_EXTRA: [
    "MS Certificate",
    "MS Transcript",
    "Research Proposal"
  ],

  IN_SERVICE_EXTRA: [
    "Service Clearance Certificate"
  ]
};

/* =====================================================
   GET REQUIRED DOCUMENT STRUCTURE
===================================================== */
export const getRequiredDocuments = ({
  program,
  isInService
}) => {
  return {
    optionalGroups: [
      OPTIONAL_GROUPS.SSC,
      OPTIONAL_GROUPS.HSC
    ],

    required: [
      ...DOCUMENT_RULES.COMMON_REQUIRED,
      ...(program === "PhD" ? DOCUMENT_RULES.PHD_EXTRA : []),
      ...(isInService ? DOCUMENT_RULES.IN_SERVICE_EXTRA : [])
    ]
  };
};

/* =====================================================
   VALIDATE DOCUMENTS
===================================================== */
export const validateDocuments = ({
  program,
  isInService,
  documents
}) => {
  const uploadedTitles = documents.map(d => d.title);

  const { optionalGroups, required } =
    getRequiredDocuments({ program, isInService });

  const missing = [];

  /* ===== SSC / HSC (ANY ONE REQUIRED) ===== */
  optionalGroups.forEach(group => {
    const hasAny = group.some(doc =>
      uploadedTitles.includes(doc)
    );

    if (!hasAny) {
      missing.push(`Any one of: ${group.join(" / ")}`);
    }
  });

  /* ===== STRICT REQUIRED DOCUMENTS ===== */
  required.forEach(doc => {
    if (!uploadedTitles.includes(doc)) {
      missing.push(doc);
    }
  });

  return {
    isValid: missing.length === 0,
    missing
  };
};
