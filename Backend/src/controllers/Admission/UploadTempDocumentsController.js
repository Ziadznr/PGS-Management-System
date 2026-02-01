const TempUploadModel =
  require("../../models/Admission/TempUploadModel");
const path = require("path");
const crypto = require("crypto");

/* ======================================================
   TEMP DOCUMENT UPLOAD CONTROLLER
====================================================== */
const UploadTempDocumentsController = async (req, res) => {
  try {
    /* ================= TEMP ID ================= */
    const tempId = req.body.tempId || crypto.randomUUID();

    /* ================= VALIDATE FILES ================= */
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: "fail",
        data: "No files received"
      });
    }

    /* ================= DOCUMENT TITLE =================
       Sent from frontend select dropdown
    ==================================================== */
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        status: "fail",
        data: "Document title is required"
      });
    }

    /* ================= FIND / CREATE TEMP ================= */
    let temp = await TempUploadModel.findOne({ tempId });

    if (!temp) {
      temp = await TempUploadModel.create({
        tempId,
        documents: [],
        totalSizeKB: 0
      });
    }

    let totalSizeKB = temp.totalSizeKB;

    /* ================= ALLOWED TYPES ================= */
    const allowedTypes = ["pdf", "jpg", "jpeg", "png"];

    const newDocs = req.files.map(file => {
      const ext = path.extname(file.originalname)
        .replace(".", "")
        .toLowerCase();

      if (!allowedTypes.includes(ext)) {
        throw new Error(`Invalid file type: ${ext}`);
      }

      const sizeKB = Math.ceil(file.size / 1024);
      totalSizeKB += sizeKB;

      return {
        title, // ✅ semantic title from frontend
        fileUrl: `/uploads/admission-documents/${file.filename}`,
        fileType: ext,
        fileSizeKB: sizeKB
      };
    });

    /* ================= SIZE LIMIT (100 MB) ================= */
    if (totalSizeKB > 102400) {
      return res.status(400).json({
        status: "fail",
        data: "Total document size exceeds 100 MB"
      });
    }

    /* ================= SAVE ================= */
    temp.documents.push(...newDocs);
    temp.totalSizeKB = totalSizeKB;

    await temp.save();

    /* ================= RESPONSE ================= */
    return res.status(200).json({
      status: "success",
      data: {
        tempId,                 // 🔑 required for next uploads
        documents: temp.documents,
        totalSizeKB: temp.totalSizeKB
      }
    });

  } catch (error) {
    console.error("UploadTempDocumentsController Error:", error);

    return res.status(500).json({
      status: "fail",
      data: error.message
    });
  }
};

module.exports = UploadTempDocumentsController;
