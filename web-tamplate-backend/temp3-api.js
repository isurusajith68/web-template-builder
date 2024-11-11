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

router.get("/build-template", async (req, res) => {
  const { hotelId, templateId } = req.query;
  if (!hotelId || !templateId) {
    return res.status(400).send("hotelId and templateId are required");
  }

  try {
    const targetDir = `/var/www/template${templateId}/user${hotelId}`;

    await fs.mkdir(targetDir, { recursive: true });

    const sourceDir = path.resolve(__dirname, "build/template/temp2");

    await fs.cp(sourceDir, targetDir, { recursive: true });
  } catch (error) {
    console.error("Error copying template:", error);
  }

  try {
    const result = await pool.query(
      "SELECT * FROM webtemplatedata WHERE hotelId = $1 AND templateId = $2",
      [hotelId, templateId]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("No site details found");
    }
    // {
    //   "email": "abc@gmail.com",
    //   "title": "isuruy",
    //   "address": "Gammana 05, kuda kathnoruwa",
    //   "hotelId": 24,
    //   "heroImage": "img/image-1731338746864-929412658.jpg",
    //   "menuImage1": "img/image-1731338571963-176109156.jpg",
    //   "menuImage2": "img/gallery_2.jpeg",
    //   "menuImage3": "img/gallery_3.jpeg",
    //   "menuTitle1": "Crab with Curry Sources",
    //   "menuTitle2": "Tuna Roast Beef",
    //   "menuTitle3": "Egg with Mushroom",
    //   "templateId": 3,
    //   "headerTitle": "Click to edit header title",
    //   "phoneNumber": "07755518779",
    //   "bookTableImage": "img/image-1731338498978-565349995.jpg",
    //   "contactUsTitle": "Contat us title",
    //   "heroDescription": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nunc necLorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nunc necLorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nunc necLorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nunc necLorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nunc nec\n",
    //   "homeHeaderImage": "img/image-1731338491233-965155354.jpg",
    //   "aboutHeaderImage": "img/image-1731338782701-10283989.jpg",
    //   "aboutHeaderTitle": "About Us new",
    //   "menuDescription1": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nunc necsshiajo\n",
    //   "menuDescription2": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nunc nec",
    //   "menuDescription3": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nunc nec",
    //   "footerDescription": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nunc nec",
    //   "galleryDescription": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nunc necssss\n",
    //   "galleryHeaderImage": "img/image-1731338608604-703330581.jpg",
    //   "galleryHeaderTitle": "Click to edit",
    //   "contactUsDescription": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nunc nec contact us description\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nunc nec contact us descriptionLorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nunc nec contact us description\n",
    //   "contactUsHeaderImage": "img/image-1731339353585-121740868.jpg",
    //   "contactUsHeaderTitle": "Contact Us ddd",
    //   "bookATableDescription": "This is book a table description\n",
    //   "galleryFirstFiveImages": [
    //     "img/images-1731339122304-467027385.jpg",
    //     "img/images-1731339122307-729696304.jpg",
    //     "img/images-1731339122310-939992218.jpg",
    //     "img/images-1731339122311-492087271.jpg",
    //     "img/images-1731339122315-690968423.jpg"
    //   ],
    //   "galleryThirdFiveImages": [
    //     "img/images-1731339219138-681430910.jpg",
    //     "img/images-1731339219142-371785506.jpg",
    //     "img/images-1731339219146-650417130.jpg",
    //     "img/images-1731339219159-361409026.jpg"
    //   ],
    //   "menuHearderDescription": "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Reiciendis ab debitis sit",
    //   "reservationDescription": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nunc nec this is reservation description\n",
    //   "reservationHeaderImage": "img/image-1731339320897-904938309.jpg",
    //   "reservationHeaderTitle": "Click t",
    //   "galleryFourthFiveImages": [
    //     "img/images-1731339299460-70531072.jpg",
    //     "img/images-1731339299462-271140789.jpg",
    //     "img/images-1731339299463-461957589.jpg",
    //     "img/images-1731339299463-784211038.jpg",
    //     "img/images-1731339299465-573846122.jpg"
    //   ],
    //   "gallerySecondFiveImages": [
    //     "img/images-1731339192574-544789219.jpg",
    //     "img/images-1731339192574-725984036.jpg",
    //     "img/images-1731339192576-126323351.jpg",
    //     "img/images-1731339192578-286807634.jpg",
    //     "img/images-1731339192583-185997996.jpg"
    //   ]
    // }
    const data = {
      "#siteTitle": result.rows[0].details.title,
      "#siteEmail": result.rows[0].details.email,
      "#sitePhoneNumber": result.rows[0].details.phoneNumber,
      "#siteAddress": result.rows[0].details.address,
      "#headerTitle": result.rows[0].details.headerTitle,
      "#homeHeaderImage": result.rows[0].details.homeHeaderImage,
      "#heroImage": result.rows[0].details.heroImage,
      "#heroDescription": result.rows[0].details.heroDescription,
      "#menuHearderDescription": result.rows[0].details.menuHearderDescription,
      "#menuTitle1": result.rows[0].details.menuTitle1,
      "#menuDescription1": result.rows[0].details.menuDescription1,
      "#menuImage1": result.rows[0].details.menuImage1,
      "#menuTitle2": result.rows[0].details.menuTitle2,
      "#menuDescription2": result.rows[0].details.menuDescription2,
      "#menuImage2": result.rows[0].details.menuImage2,
      "#menuTitle3": result.rows[0].details.menuTitle3,
      "#menuDescription3": result.rows[0].details.menuDescription3,
      "#menuImage3": result.rows[0].details.menuImage3,
      "#reservationDescription": result.rows[0].details.reservationDescription,
      "#footerDescription": result.rows[0].details.footerDescription,
      "#galleryHeaderImage": result.rows[0].details.galleryHeaderImage,
      "#galleryHeaderTitle": result.rows[0].details.galleryHeaderTitle,
      "#galleryDescription": result.rows[0].details.galleryDescription,
      "#reservationHeaderTitle": result.rows[0].details.reservationHeaderTitle,
      "#reservationHeaderImage": result.rows[0].details.reservationHeaderImage,
      "#bookATableDescription": result.rows[0].details.bookATableDescription,
      "#bookTableImage": result.rows[0].details.bookTableImage,
      "#contactUsHeaderImage": result.rows[0].details.contactUsHeaderImage,
      "#contactUsHeaderTitle": result.rows[0].details.contactUsHeaderTitle,
      "#contactUsTitle": result.rows[0].details.contactUsTitle,
      "#contactUsDescription": result.rows[0].details.contactUsDescription,
      "#aboutHeaderTitle": result.rows[0].details.aboutHeaderTitle,
      "#aboutHeaderImage": result.rows[0].details.aboutHeaderImage,
    };

    buildTemplate(result, hotelId, templateId);
    // buildTemplateAboutUs(result, hotelId, templateId);
    // buildTemplateContactUs(result, hotelId, templateId);
    // buildTemplateHotelRooms(result, hotelId, templateId);

    res.send({
      message: "Template built successfully",
    });
  } catch (error) {
    console.log(error);
  }
});

const buildTemplate = async () => {
  const targetDir = `/var/www/template${templateId}/user${hotelId}`;
  const sourceDir = path.resolve(__dirname, `build/template/temp${templateId}`);

  await fs.mkdir(targetDir, { recursive: true });
  await fs.cp(sourceDir, targetDir, { recursive: true });
};

module.exports = router;
