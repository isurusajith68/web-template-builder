const express = require("express");
const multer = require("multer");
const path = require("path");
const fssync = require("fs");

const imageUpload = express.Router();

const ensureDirectoryExistence = (dir) => {
  if (!fssync.existsSync(dir)) {
    fssync.mkdirSync(dir, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(`/var/www/image-server/images`);
    ensureDirectoryExistence(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const hotelid = req.propertyId || "unknown";
    const organization_id = req.organization_id || "unknown";
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = `${hotelid}_${organization_id}_${
      file.fieldname
    }-${uniqueSuffix}${path.extname(file.originalname)}`;
    file.filename = filename;
    cb(null, filename);
  },
});

const upload = multer({ storage });

imageUpload.post(
  "/image-uploads",
  upload.array("images", 10),
  async (req, res) => {
    try {
      const files = req.files;
      console.log(req.propertyId, req.organization_id);
      const propertyId = req.propertyId || "unknown";
      const organization_id = req.organization_id || "unknown";

      if (!files || files.length === 0) {
        return res.status(400).send({
          success: false,
          message: "Please upload at least one image",
        });
      }

      const baseUrl = "https://images.ceyinfo.com/images";
      const fileUrls = files.map((file) => ({
        filename: file.filename,
        url: `${baseUrl}/${file.filename}`,
      }));

      res.status(200).send({
        success: true,
        message: "Images uploaded successfully",
        files: fileUrls,
      });
    } catch (error) {
      console.error("Error uploading images:", error);
      res.status(500).send({
        success: false,
        message: "An error occurred while uploading images",
      });
    }
  }
);

//test route
imageUpload.get("/test", (req, res) => {
  res.send("test api");
});

module.exports = imageUpload;
