const express = require("express");
const multer = require("multer");
const path = require("path");
const pool = require("./database/db");
const router = express.Router();
const fssync = require("fs");
const fs = require("fs/promises");

router.get("/temp3", (req, res) => {
  res.json({ message: "temp3" });
});

router.post("/save-site-details", async (req, res) => {
  const {
    hotelId,
    templateId,
    title,
    address,
    phoneNumber,
    email,
    headerTitle,
    homeHeaderImage,
    heroImage,
    heroDescription,
    menuHearderDescription,
    menuTitle1,
    menuDescription1,
    menuImage1,
    menuTitle2,
    menuDescription2,
    menuImage2,
    menuTitle3,
    menuDescription3,
    menuImage3,
    reservationDescription,
    footerDescription,
    galleryFirstFiveImages,
    gallerySecondFiveImages,
    galleryThirdFiveImages,
    galleryFourthFiveImages,
    galleryHeaderImage,
    galleryHeaderTitle,
    galleryDescription,
    reservationHeaderTitle,
    reservationHeaderImage,
    bookATableDescription,
    bookTableImage,
    contactUsHeaderImage,
    contactUsHeaderTitle,
    contactUsTitle,
    contactUsDescription,
    aboutHeaderTitle,
    aboutHeaderImage,
  } = req.body;

  try {
    const existingResult = await pool.query(
      "SELECT * FROM webtemplatedata WHERE hotelId = $1 AND templateId = $2",
      [hotelId, templateId]
    );

    if (existingResult.rows.length > 0) {
      const updateResult = await pool.query(
        "UPDATE webtemplatedata SET details = $1 WHERE hotelId = $2 AND templateId = $3 RETURNING *",
        [
          JSON.stringify({
            hotelId,
            templateId,
            title,
            address,
            phoneNumber,
            email,
            headerTitle,
            homeHeaderImage,
            heroImage,
            heroDescription,
            menuHearderDescription,
            menuTitle1,
            menuDescription1,
            menuImage1,
            menuTitle2,
            menuDescription2,
            menuImage2,
            menuTitle3,
            menuDescription3,
            menuImage3,
            reservationDescription,
            footerDescription,
            galleryFirstFiveImages,
            gallerySecondFiveImages,
            galleryThirdFiveImages,
            galleryFourthFiveImages,
            galleryHeaderImage,
            galleryHeaderTitle,
            galleryDescription,
            reservationHeaderTitle,
            reservationHeaderImage,
            bookATableDescription,
            bookTableImage,
            contactUsHeaderImage,
            contactUsHeaderTitle,
            contactUsTitle,
            contactUsDescription,
            aboutHeaderTitle,
            aboutHeaderImage,
          }),
          hotelId,
          templateId,
        ]
      );
      res.status(200).json(updateResult.rows[0]);
    } else {
      const insertResult = await pool.query(
        "INSERT INTO webtemplatedata (hotelId, templateId, details) VALUES ($1, $2, $3) RETURNING *",
        [
          hotelId,
          templateId,
          JSON.stringify({
            hotelId,
            templateId,
            title,
            address,
            phoneNumber,
            email,
            headerTitle,
            homeHeaderImage,
            heroImage,
            heroDescription,
            menuHearderDescription,
            menuTitle1,
            menuDescription1,
            menuImage1,
            menuTitle2,
            menuDescription2,
            menuImage2,
            menuTitle3,
            menuDescription3,
            menuImage3,
            reservationDescription,
            footerDescription,
            galleryFirstFiveImages,
            gallerySecondFiveImages,
            galleryThirdFiveImages,
            galleryFourthFiveImages,
            galleryHeaderImage,
            galleryHeaderTitle,
            galleryDescription,
            reservationHeaderTitle,
            reservationHeaderImage,
            bookATableDescription,
            bookTableImage,
            contactUsHeaderImage,
            contactUsHeaderTitle,
            contactUsTitle,
            contactUsDescription,
            aboutHeaderTitle,
            aboutHeaderImage,
          }),
        ]
      );
      res.status(201).json(insertResult.rows[0]);
    }
  } catch (err) {
    console.error("Error saving site details:", err);
    res.status(500).send("Error saving site details");
  }
});

const ensureDirectoryExistence = (dir) => {
  if (!fssync.existsSync(dir)) {
    fssync.mkdirSync(dir, { recursive: true });
  }
};
const ensureDirectoryExistence2 = async (dir, templateId, hotelId) => {
  if (!fssync.existsSync(dir)) {
    try {
      const targetDir = `/var/www/template${templateId}/user${hotelId}`;
      const sourceDir = path.resolve(
        __dirname,
        `build/template/temp${templateId}`
      );

      await fs.mkdir(targetDir, { recursive: true });
      await fs.cp(sourceDir, targetDir, { recursive: true });

      console.log(`Template copied from ${sourceDir} to ${targetDir}`);
    } catch (error) {
      console.error(
        "Error during directory creation or copy operation:",
        error
      );
    }
  }
};


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const { hotelId, templateId } = req.query;

    const uploadDir = path.join(
      `/var/www/template${templateId}/user${hotelId}/img`
    );
    const imageForTemplateDir = path.join(`/var/www/vue-temp${templateId}/img`);

    ensureDirectoryExistence2(uploadDir, templateId, hotelId);
    ensureDirectoryExistence(imageForTemplateDir);

    cb(null, uploadDir);
    file.imageForTemplateDir = imageForTemplateDir;
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = `${file.fieldname}-${uniqueSuffix}${path.extname(
      file.originalname
    )}`;
    file.filename = filename;
    cb(null, filename);
  },
});

const upload = multer({ storage });

router.post("/upload-single", upload.single("image"), async (req, res) => {
  try {
    const { file } = req;
    const filePath = `img/${file.filename}`;
    const hotelId = req.body.hotelId;
    const templateId = req.body.templateId;
    const imageType = req.body.imageType;

    console.log("Primary upload path:", filePath);

    const secondaryFilePath = path.join(
      file.imageForTemplateDir,
      file.filename
    );
    await fs.copyFile(
      path.join(file.destination, file.filename),
      secondaryFilePath
    );
    console.log("File copied to:", secondaryFilePath);

    const dbGetResult = await pool.query(
      "SELECT details FROM webtemplatedata WHERE hotelId = $1 AND templateId = $2",
      [hotelId, templateId]
    );

    if (dbGetResult.rows.length > 0) {
      let details = dbGetResult.rows[0].details;
      if (typeof details === "string") {
        details = JSON.parse(details);
      }

      const previousFiles = details?.[imageType];
      if (previousFiles) {
        const oldPaths = [
          path.join(
            `/var/www/template${templateId}/user${hotelId}`,
            previousFiles
          ),
          path.join(`/var/www/vue-temp${templateId}`, previousFiles),
        ];

        oldPaths.forEach((oldPath) => {
          if (fssync.existsSync(oldPath)) {
            fssync.unlinkSync(oldPath);
            console.log("File deleted successfully:", oldPath);
          }
        });
      }
    }

    const response = { [imageType]: filePath };
    const result = await updateDatabase(hotelId, templateId, response);

    res.json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});



const updateDatabase = async (hotelId, templateId, response) => {
  // console.log("updateDatabase", hotelId, templateId, response);
  try {
    const existingResult = await pool.query(
      "SELECT * FROM webtemplatedata WHERE hotelId = $1 AND templateId = $2",
      [hotelId, templateId]
    );

    const newResult = {
      ...existingResult.rows[0].details,
      ...response,
    };

    await pool.query(
      "UPDATE webtemplatedata SET details = $1 WHERE hotelId = $2 AND templateId = $3",
      [JSON.stringify(newResult), hotelId, templateId]
    );

    const updatedResult = await pool.query(
      "SELECT * FROM webtemplatedata WHERE hotelId = $1 AND templateId = $2",
      [hotelId, templateId]
    );

    return updatedResult.rows[0];
  } catch (err) {
    console.error("Error updating database:", err);
  }
};

router.post("/upload-images", upload.array("images", 5), async (req, res) => {
  try {
    const files = req.files;
    const hotelId = req.query.hotelId;
    const templateId = req.query.templateId;
    const imageType = req.query.imageType;

    const uploadDir = path.join(
      `/var/www/template${templateId}/user${hotelId}/img`
    );
    const imageForTemplateDir = path.join(`/var/www/vue-temp${templateId}/img`);

    const dbGetResult = await pool.query(
      "SELECT details FROM webtemplatedata WHERE hotelId = $1 AND templateId = $2",
      [hotelId, templateId]
    );

    if (dbGetResult.rows.length > 0) {
      let details = dbGetResult.rows[0].details;
      if (typeof details === "string") {
        details = JSON.parse(details);
      }

      const previousFiles = details?.[imageType];
      if (Array.isArray(previousFiles)) {
        previousFiles.forEach((file) => {
          const oldPaths = [
            path.join(`/var/www/template${templateId}/user${hotelId}`, file),
            path.join(`/var/www/vue-temp${templateId}`, file),
          ];
          oldPaths.forEach((oldPath) => {
            if (fssync.existsSync(oldPath)) {
              fssync.unlinkSync(oldPath);
              console.log("Deleted previous file:", oldPath);
            }
          });
        });
      }
    }

    const galleryFirstFiveImages = [];
    for (const file of files) {
      const filePath = `img/${file.filename}`;
      galleryFirstFiveImages.push(filePath);

      const secondaryFilePath = path.join(imageForTemplateDir, file.filename);
      await fs.copyFile(path.join(uploadDir, file.filename), secondaryFilePath);
      console.log("File copied to:", secondaryFilePath);
    }

    const result = await updateDatabase(hotelId, templateId, {
      [imageType]: galleryFirstFiveImages,
    });

    res.status(200).json({
      message: "Images uploaded and database updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error uploading images:", error);
    res.status(500).json({ error: "Failed to upload images" });
  }
});

module.exports = router;
