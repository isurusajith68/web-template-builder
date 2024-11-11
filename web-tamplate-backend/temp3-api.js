const express = require("express");
const multer = require("multer");
const path = require("path");
const pool = require("./database/db");
const router = express.Router();

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

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../template3/img");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post("/upload-single", upload.single("image"), async (req, res) => {
  try {
    const filePath = `img/${req.file.filename}`;
    const imageType = req.body.imageType;
    const hotelId = req.body.hotelId;
    const templateId = req.body.templateId;

    const response = { [imageType]: filePath };

    const result = await updateDatabase(hotelId, templateId, response);

    res.json(result);
  } catch (error) {
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
  
    const galleryFirstFiveImages = files.map((file) => `img/${file.filename}`);

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
