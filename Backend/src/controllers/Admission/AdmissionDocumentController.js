const UploadAdmissionDocuments = async (req, res) => {
  try {
    if (!req.files || !req.files.length) {
      return res.status(400).json({
        status: "fail",
        data: "No documents uploaded"
      });
    }

    let totalSizeKB = 0;

    const docs = req.files.map(file => {
      totalSizeKB += Math.round(file.size / 1024);

      return {
        title: file.originalname,
        fileUrl: `/uploads/admission-documents/${file.filename}`,
        fileType: file.mimetype.split("/")[1],
        fileSizeKB: Math.round(file.size / 1024)
      };
    });

    if (totalSizeKB > 30720) {
      return res.status(400).json({
        status: "fail",
        data: "Total document size exceeds 30 MB"
      });
    }

    return res.status(200).json({
      status: "success",
      data: {
        documents: docs,
        totalSizeKB
      }
    });

  } catch (err) {
    return res.status(500).json({
      status: "fail",
      data: err.message
    });
  }
};

module.exports = UploadAdmissionDocuments;
