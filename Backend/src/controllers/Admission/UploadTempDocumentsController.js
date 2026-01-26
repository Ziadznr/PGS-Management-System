const TempUploadModel =
  require("../../models/Admission/TempUploadModel");
const path = require("path");
const crypto = require("crypto");

const UploadTempDocumentsController = async (req, res) => {
  try {
    const tempId =
      req.body.tempId || crypto.randomUUID(); // ✅ FIX

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: "fail",
        data: "No files received"
      });
    }

    let temp = await TempUploadModel.findOne({ tempId });

    if (!temp) {
      temp = await TempUploadModel.create({
        tempId,
        documents: [],
        totalSizeKB: 0
      });
    }

    let totalSize = temp.totalSizeKB;

    const newDocs = req.files.map(file => {
      const sizeKB = Math.ceil(file.size / 1024);
      totalSize += sizeKB;

      return {
        title: file.originalname,
        fileUrl: `/uploads/admission-documents/${file.filename}`,
        fileType: path.extname(file.originalname).replace(".", ""),
        fileSizeKB: sizeKB
      };
    });

    if (totalSize > 30720) {
      return res.status(400).json({
        status: "fail",
        data: "Total document size exceeds 30 MB"
      });
    }

    temp.documents.push(...newDocs);
    temp.totalSizeKB = totalSize;

    await temp.save();

    return res.status(200).json({
      status: "success",
      data: {
        tempId,                 // ✅ MUST RETURN THIS
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
