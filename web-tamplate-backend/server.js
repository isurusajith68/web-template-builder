const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const pool = require("./database/db");
const fs = require("fs/promises");
const path = require("path");
const fssync = require("fs");
const multer = require("multer");
const temp2 = require("./temp2-api");
const temp3 = require("./temp3-api");
const app = express();

app.use(
  cors({
    origin: "*",
  })
);

app.use(
  bodyParser.json({
    limit: "50mb",
  })
);

app.use("/temp2", temp2);
app.use("/temp3", temp3);

app.post("/save-site-details", async (req, res) => {
  const {
    hotelId,
    templateId,
    title,
    email,
    phoneNumber,
    aboutUsImages,
    carouselImages,
    description,
    realImages,
    address,
    mapIframeHtml,
    attraction,
    attractionList,
  } = req.body;

  try {
    const result = await pool.query("SELECT * FROM hotelinfo WHERE id = $1", [
      hotelId,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "No hotel information found please add hotel information",
      });
    }

    const existingResult = await pool.query(
      "SELECT * FROM webtemplatedata WHERE hotelId = $1 AND templateId = $2",
      [hotelId, templateId]
    );

    if (existingResult.rows.length > 0) {
      const updateResult = await pool.query(
        "UPDATE webtemplatedata SET details = $1 WHERE hotelId = $2 AND templateId = $3 RETURNING *",
        [
          JSON.stringify({
            title,
            email,
            phoneNumber,
            aboutUsImages,
            carouselImages,
            description,
            realImages,
            address,
            mapIframeHtml,
            attraction,
            attractionList,
          }),
          hotelId,
          templateId,
        ]
      );

      if (updateResult.rows.length === 0) {
        return res.status(404).json({
          message: "No site details found",
        });
      }

      res.status(200).json(updateResult.rows[0]);
    } else {
      const insertResult = await pool.query(
        "INSERT INTO webtemplatedata (hotelId, templateId, details) VALUES ($1, $2, $3) RETURNING *",
        [
          hotelId,
          templateId,
          JSON.stringify({
            title,
            email,
            phoneNumber,
            aboutUsImages,
            carouselImages,
            description,
            realImages,
            address,
            mapIframeHtml,
            attraction,
            attractionList,
          }),
        ]
      );

      if (insertResult.rows.length === 0) {
        return res.status(404).json({
          message: "No site details found",
        });
      }

      res.status(201).json(insertResult.rows[0]);
    }
  } catch (err) {
    console.error("Error saving site details:", err);
    res.status(500).json({
      message: "Error saving site details",
    });
  }
});

app.get("/site-details", async (req, res) => {
  const { hotelId, templateId } = req.query;
  if (!hotelId || !templateId) {
    return res.status(400).json({
      message: "hotelId and templateId are required",
    });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM webtemplatedata WHERE hotelId = $1 AND templateId = $2",
      [hotelId, templateId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "site details not found",
      });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error loading site details:", err);
    res.status(500).json({
      message: "Error loading site details",
    });
  }
});

app.get("/build-template", async (req, res) => {
  const { hotelId, templateId } = req.query;
  if (!hotelId || !templateId) {
    return res.status(404).json({
      message: "hotelId and templateId are required",
    });
  }

  try {
    const targetDir = `/var/www/template${templateId}/user${hotelId}`;

    await fs.mkdir(targetDir, { recursive: true });

    const sourceDir = path.resolve(__dirname, "build/template/temp1");

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
      return res.status(404).json({
        message: "site details not found please save your changes",
      });
    }
    // {
    //   "email": "katupitiya@gmail.com",
    //   "title": "Isuru",
    //   "address": "Gammana 05, kuda kathnoruwa",
    //   "attraction": "WITHIN KANDY CITY",
    //   "realImages": [],
    //   "description": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    //   "phoneNumber": "0761455221",
    //   "aboutUsImages": [
    //     {
    //       "alt": "About Us Image 1",
    //       "src": "img/about-1.jpg"
    //     },
    //     {
    //       "alt": "About Us Image 2",
    //       "src": "img/about-2.jpg"
    //     },
    //   ],

    const hotelURL = `https://webbookings.ceyinfo.cloud?hotelId=${hotelId}`;

    const data = {
      "#hotelURL": hotelURL,
      "#siteTitle": result.rows[0].details.title,
      "#siteEmail": result.rows[0].details.email,
      "#sitePhoneNumber": result.rows[0].details.phoneNumber,
      "#siteAboutUsImages1": result.rows[0].details.aboutUsImages[0].src,
      "#siteAboutUsImages2": result.rows[0].details.aboutUsImages[1].src,
      "#siteAboutUsImages3": result.rows[0].details.aboutUsImages[2].src,
      "#siteAboutUsImages4": result.rows[0].details.aboutUsImages[3].src,
      "#siteCarouselImages1": result.rows[0].details.carouselImages[0].src,
      "#siteCarouselImages2": result.rows[0].details.carouselImages[1].src,
      "#siteCarouselTitle1":
        result.rows[0].details.carouselImages[0].carouselTitle,
      "#siteCarouselTitle2":
        result.rows[0].details.carouselImages[1].carouselTitle,
      "#siteCarouselDescription1":
        result.rows[0].details.carouselImages[0].carouselDescription,
      "#siteCarouselDescription2":
        result.rows[0].details.carouselImages[1].carouselDescription,
      "#siteDescription": result.rows[0].details.description,
      "#siteAddress": result.rows[0].details.address,
      "#mapIframeHtml": result.rows[0].details.mapIframeHtml,
    };

    const getSiteName = await pool.query(
      "SELECT url FROM hotelinfo WHERE id = $1",
      [hotelId]
    );
    console.log(getSiteName);

    if (getSiteName.rows.length === 0) {
      return res.status(404).json({
        message: "please update site information",
      });
    }

    if (getSiteName.rows[0].url === null) {
      return res.status(404).json({
        message: "website domain not found",
      });
    }

    buildTemplate(data, hotelId, templateId);
    buildTemplateAboutUs(data, hotelId, templateId);
    buildTemplateGallery(result, hotelId, templateId);
    buildTemplateContactUs(data, hotelId, templateId);
    buildTemplateAttraction(result, hotelId, templateId);
    buildTemplateHotelRooms(result, hotelId, templateId);
    buildTemplateBooking(data, hotelId, templateId);
    buildTemplateSpecialOffers(data, hotelId, templateId);
    generateNginxConfig(hotelId, templateId);
    res.send({
      message: "Template built successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "server error plz try again",
    });
  }
});

app.get("/", async (req, res) => {
  try {
    res.send("isuru sajith");
  } catch (error) {
    console.log(error);
  }
});

app.get("/hotel-info", async (req, res) => {
  try {
    const hotelId = req.query.hotelId;

    const result = await pool.query("SELECT * FROM hotelinfo WHERE id = $1", [
      hotelId,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "No hotel information found please add hotel information",
      });
    }

    res.send(result.rows[0]);
  } catch (error) {
    console.log(error);
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
  destination: (req, file, cb) => {
    const { hotelId, templateId } = req.query;

    const uploadDir = path.join(
      `/var/www/template${templateId}/user${hotelId}/img`
    );
    ensureDirectoryExistence2(uploadDir, templateId, hotelId);

    const imageForTemplateDir = path.join(`/var/www/vue-temp${templateId}/img`);
    ensureDirectoryExistence(imageForTemplateDir);

    cb(null, uploadDir);

    file.uploadDir = uploadDir;
    file.imageForTemplateDir = imageForTemplateDir;
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

app.post("/upload-images", upload.array("images", 10), async (req, res) => {
  try {
    const { hotelId, templateId } = req.query;

    //remove pre img files
    const dbGetResult = await pool.query(
      "SELECT details FROM webtemplatedata WHERE hotelId = $1 AND templateId = $2",
      [hotelId, templateId]
    );

    if (dbGetResult.rows.length > 0) {
      const previousFiles = dbGetResult.rows[0].details?.realImages?.filePaths;

      if (previousFiles) {
        previousFiles.forEach((file) => {
          const filePath = path.join(
            `/var/www/template${templateId}/user${hotelId}`,
            file
          );
          // console.log(filePath);
          if (fssync.existsSync(filePath)) {
            fssync.unlinkSync(filePath);
            console.log("File deleted successfully:", filePath);
          }
        });
      }

      //remove pre img files for template
      const previousFilesForTemplate =
        dbGetResult.rows[0].details?.realImages?.getImgPathForTemplate;

      if (previousFilesForTemplate) {
        previousFilesForTemplate.forEach((file) => {
          const filePath = path.join(`/var/www/vue-temp${templateId}`, file);
          // console.log(filePath);
          if (fssync.existsSync(filePath)) {
            fssync.unlinkSync(filePath);
            console.log("File deleted successfully:", filePath);
          }
        });
      }
    }

    req.files.forEach((file) => {
      const primaryPath = path.join(file.uploadDir, file.filename);
      const tempPath = path.join(file.imageForTemplateDir, file.filename);

      fssync.copyFileSync(primaryPath, tempPath);
      console.log("File copied successfully to:", tempPath);
    });

    const filePaths = req.files.map(
      (file) => `./build/template/temp${templateId}/img/${file.filename}`
    );

    const getRealPath = (filePath) => {
      const pathString = String(filePath);

      const match = pathString.match(/img\/.+/);

      return match ? match[0] : pathString;
    };

    const getLocalPath = req.files.map(
      (file) =>
        `web-tamplate-backend/build/template/temp${templateId}/img/${file.filename}`
    );

    const getImgPathForTemplate = req.files.map(
      (file) => `/img/${file.filename}`
    );

    res.json({
      success: true,
      message: "Images uploaded successfully",
      images: { filePaths: filePaths.map(getRealPath), getImgPathForTemplate },
      // images: getLocalPath,
    });

    updateDataBase(
      hotelId,
      templateId,
      filePaths.map(getRealPath),
      getImgPathForTemplate
    );
  } catch (error) {
    console.error("Error uploading images:", error);
    res.status(500).json({ success: false, message: "Image upload failed" });
  }
});

app.get("/rooms-info", async (req, res) => {
  try {
    const hotelId = req.query.hotelId;

    // const result = await pool.query(
    // `
    // SELECT
    //   htrm.hotelid,
    //   htrm.roomviewid,
    //   htrm.roomtypeid,
    //   htrm.roomno,
    //   htrm.noofbed,
    //   hrv.roomview,
    //   hrt.roomtype,
    //   hrp.fbprice,
    //   ARRAY_AGG(amn.name) AS roomamenities
    // FROM

    const result = await pool.query(
      `
      SELECT 
        htrm.id,
        htrm.roomviewid,
        htrm.roomtypeid,
        htrm.roomno,
        htrm.noofbed,
        hrv.label as roomview,
        hrt.label as roomtype,
        hrp.fbprice,
        ARRAY_AGG(amn.label) AS roomamenities
      FROM 
        hotelrooms htrm
      JOIN 
        hotelroomview hrv ON htrm.roomviewid = hrv.id
      JOIN 
        hotelroomtypes hrt ON htrm.roomtypeid = hrt.id
      JOIN 
        hotelroomprices hrp ON htrm.roomviewid = hrp.roomviewid 
        AND htrm.roomtypeid = hrp.roomtypeid
      LEFT JOIN 
        roomamenitydetails ram ON htrm.roomno = ram.roomid
      LEFT JOIN 
        roomamenities amn ON ram.amenityid = amn.id
      WHERE 
        htrm.id = $1
      GROUP BY 
        htrm.id, 
        htrm.roomviewid, 
        htrm.roomtypeid, 
        htrm.roomno,
        htrm.noofbed, 
        hrv.label  ,
        hrt.label , 
        hrp.fbprice
      `,
      [hotelId]
    );

    if (result.rows.length === 0) {
      return res.status(404).send({
        message: "No rooms add to this hotel please add rooms",
      });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error loading room details",
    });
  }
});

const buildTemplate = async (data, hotelId, templateId) => {
  const templatePath = `./template/temp${templateId}/index.html`;
  const template = await fs.readFile(templatePath, "utf8");

  const result = template.replace(
    /#\w+/g,
    (placeholder) => data[placeholder] || ""
  );

  const outputPath = `/var/www/template${templateId}/user${hotelId}/index.html`;
  await fs.writeFile(outputPath, result, "utf8");

  console.log("Template built successfully");
};

const buildTemplateAboutUs = async (data, hotelId, templateId) => {
  const template = await fs.readFile(`./template/temp1/about.html`, "utf8");

  const result = template.replace(
    /#\w+/g,
    (placeholder) => data[placeholder] || ""
  );

  await fs.writeFile(
    `/var/www/template${templateId}/user${hotelId}/about.html`,
    result,
    "utf8"
  );

  console.log("Template built successfully");
};

const buildTemplateGallery = async (result, hotelId, templateId) => {
  //  <div v-for="(row, index) in imageRows" :key="index" class="gallery-row">
  //           <div class="image-item" v-for="(image, idx) in row" :key="idx">
  //               <img :src="image" :alt="'Image ' + (index * 2 + idx + 1)" />
  //           </div>
  //       </div>

  //  <div v-for="(row, index) in imageRows" :key="index" class="gallery-row">
  //           <div class="image-item" v-for="(image, idx) in row" :key="idx">
  //               <img :src="image" :alt="'Image ' + (index * 2 + idx + 1)" />
  //           </div>
  //       </div>
  if (
    !result.rows[0].details.realImages.filePaths ||
    !Array.isArray(result.rows[0].details.realImages.filePaths)
  ) {
    console.log("No images found");
    return;
  }

  const images = result.rows[0].details.realImages.filePaths;

  const imageRows = [];
  for (let i = 0; i < images.length; i += 2) {
    const rowImages = images.slice(i, i + 2);
    const rowHtml = rowImages
      .map((image, idx) => {
        return `<div class="image-item"><img src="${image}" alt="Image ${
          i + idx + 1
        }" /></div>`;
      })
      .join("");
    imageRows.push(`<div class="gallery-row">${rowHtml}</div>`);
  }

  const galleryHtml = imageRows.join("");

  // console.log(galleryHtml);

  const data = {
    "#siteTitle": result.rows[0].details.title,
    "#siteEmail": result.rows[0].details.email,
    "#sitePhoneNumber": result.rows[0].details.phoneNumber,
    "#siteAddress": result.rows[0].details.address,
    "#galleryImages": galleryHtml,
  };

  const templatePath = `./template/temp${templateId}/gallery.html`;
  const template = await fs.readFile(templatePath, "utf8");

  const outputHtml = template.replace(
    /#\w+/g,
    (placeholder) => data[placeholder] || ""
  );

  const outputPath = `/var/www/template${templateId}/user${hotelId}/gallery.html`;
  await fs.writeFile(outputPath, outputHtml, "utf8");

  console.log("Template built successfully");
};

const buildTemplateContactUs = async (data, hotelId, templateId) => {
  const template = await fs.readFile(`./template/temp1/contact.html`, "utf8");

  const result = template.replace(
    /#\w+/g,
    (placeholder) => data[placeholder] || ""
  );

  await fs.writeFile(
    `/var/www/template${templateId}/user${hotelId}/contact.html`,
    result,
    "utf8"
  );

  console.log("Template built successfully");
};

const buildTemplateBooking = async (data, hotelId, templateId) => {
  const template = await fs.readFile(`./template/temp1/booking.html`, "utf8");

  const jsscript = `
<script>
  function otherParms() {
    let params = "";

    const hotelId = ${hotelId};
    const name = document.getElementById("name")?.value || "";
    const email = document.getElementById("email")?.value || "";
    const checkin = document.getElementById("checkin")?.value || "";
    const checkout = document.getElementById("checkout")?.value || "";
    const adults = document.getElementById("select1")?.value || "1";
    const children = document.getElementById("select2")?.value || "0";
    const rooms = document.getElementById("select3")?.value || "1";
    const specialRequest = document.getElementById("message")?.value || "";

    params += \`hotelId=\${encodeURIComponent(hotelId)}\`;
    if (name) params += \`&name=\${encodeURIComponent(name)}\`;
    if (email) params += \`&email=\${encodeURIComponent(email)}\`;
    if (checkin) params += \`&checkin=\${encodeURIComponent(checkin)}\`;
    if (checkout) params += \`&checkout=\${encodeURIComponent(checkout)}\`;
    if (adults) params += \`&adults=\${encodeURIComponent(adults)}\`;
    if (children) params += \`&children=\${encodeURIComponent(children)}\`;
    if (rooms) params += \`&rooms=\${encodeURIComponent(rooms)}\`;
    if (specialRequest) params += \`&specialRequest=\${encodeURIComponent(specialRequest)}\`;

    return params;
  }

  document.getElementById("bookingLink").addEventListener("click", function () {
    const baseUrl = "https://webbookings.ceyinfo.cloud";
    const dynamicParams = otherParms();
    const finalUrl = \`\${baseUrl}?\${dynamicParams}\`;
    window.location.href = finalUrl;
  });
</script>
`;

  const data2 = {
    ...data,
    "#jsscript": jsscript,
  };

  const result = template.replace(
    /#\w+/g,
    (placeholder) => data2[placeholder] || ""
  );

  await fs.writeFile(
    `/var/www/template${templateId}/user${hotelId}/booking.html`,
    result,
    "utf8"
  );

  console.log("Template built successfully");
};

buildTemplateAttraction = async (result, hotelId, templateId) => {
  try {
    // console.log("Details:", result.rows[0]?.details);

    const template = await fs.readFile(
      `./template/temp1/attraction.html`,
      "utf8"
    );

    const attractionList = result.rows[0]?.details?.attractionList || [];

    if (!Array.isArray(attractionList)) {
      throw new Error("attractionList is not an array or is undefined");
    }

    const attractionListHtml = attractionList
      .map(
        (attraction, index) => `
      <div class="attraction-card" key="${index}">
        <img src="${
          attraction.image
        }" style="max-width: 35%; min-width: 35%;" alt="Attraction Image">
        <div class="attraction-item" style="display: flex; width: 100%; justify-content: space-between; flex-wrap: wrap;">
          <div class="attraction-info" style="flex-grow: 1; margin-right: 10px;">
            <h4>${attraction.title}</h4>
            <p>${attraction.description}</p>
            <button onclick="window.location.href='https://en.wikipedia.org/wiki/${encodeURIComponent(
              attraction.title
            )}'">More</button>
          </div>
        </div>
      </div>
    `
      )
      .join("");

    const data = {
      "#siteTitle": result.rows[0].details.title,
      "#siteEmail": result.rows[0].details.email,
      "#sitePhoneNumber": result.rows[0].details.phoneNumber,
      "#siteAddress": result.rows[0].details.address,
      "#attractionList": attractionListHtml,
    };
    // console.log(data);
    const result1 = template.replace(
      /#\w+/g,
      (placeholder) => data[placeholder] || ""
    );

    await fs.writeFile(
      `/var/www/template${templateId}/user${hotelId}/attraction.html`,
      result1,
      "utf8"
    );

    console.log("Template built successfully");
  } catch (error) {
    console.log(error);
  }
};

const updateDataBase = async (
  hotelId,
  templateId,
  filePaths,
  getImgPathForTemplate
) => {
  try {
    const result = await pool.query(
      "SELECT details FROM webtemplatedata WHERE hotelId = $1 AND templateId = $2",
      [hotelId, templateId]
    );

    // console.log("result:", result.rows[0].details);

    const newResult = {
      ...result.rows[0].details,
      realImages: { filePaths, getImgPathForTemplate },
    };

    await pool.query(
      "UPDATE webtemplatedata SET details = $1 WHERE hotelId = $2 AND templateId = $3",
      [JSON.stringify(newResult), hotelId, templateId]
    );
  } catch (error) {}
};

const buildTemplateHotelRooms = async (result, hotelId, templateId) => {
  try {
    //get hotel rooms
    const rooms = await pool.query(
      `
      SELECT 
        htrm.hotelid,
        htrm.roomviewid,
        htrm.roomtypeid,
        htrm.roomno,
        htrm.noofbed,
        hrv.label as roomview,
        hrt.label as roomtype,
        hrp.fbprice,
        ARRAY_AGG(amn.label) AS roomamenities
      FROM 
        hotelrooms htrm
      JOIN 
        hotelroomview hrv ON htrm.roomviewid = hrv.id
      JOIN 
        hotelroomtypes hrt ON htrm.roomtypeid = hrt.id
      JOIN 
        hotelroomprices hrp ON htrm.roomviewid = hrp.roomviewid 
        AND htrm.roomtypeid = hrp.roomtypeid
      LEFT JOIN 
        roomamenitydetails ram ON htrm.roomno = ram.roomid
      LEFT JOIN 
        roomamenities amn ON ram.amenityid = amn.id
      WHERE 
        htrm.hotelid = $1
      GROUP BY 
        htrm.hotelid, 
        htrm.roomviewid, 
        htrm.roomtypeid, 
        htrm.roomno,
        htrm.noofbed, 
        hrv.label  ,
        hrt.label , 
        hrp.fbprice`,
      [hotelId]
    );

    // console.log("Rooms:", rooms.rows);

    const roomsHtml = rooms.rows
      .map((room) => {
        return `
      <div class="col-lg-4 col-md-6 wow fadeInUp">
        <div class="room-item shadow rounded overflow-hidden">
          <div class="position-relative">
            <img class="img-fluid" src="img/room4.jpg" alt="">
            <small class="position-absolute start-0 top-100 translate-middle-y bg-primary text-white rounded py-1 px-3 ms-4">
               Rs ${room.fbprice} / Night
            </small>
          </div>
          <div class="p-4 mt-2">
            <div class="d-flex justify-content-between mb-3">
              <h6 class="mb-0"><b>${room.roomtype} / ${room.roomview}</b></h6>
              <div class="ps-2">
                ${[...Array(5)]
                  .map(() => `<small class="fa fa-star text-primary"></small>`)
                  .join("")}
              </div>
            </div>
            <div class="d-flex mb-3">
              <small class="border-end me-3 pe-3">
                <i class="fa fa-h-square text-primary me-2"></i>Room No: ${
                  room.roomno
                }
              </small>
              <small class=" me-3 pe-3">
                <i class="fa fa-bed text-primary me-2"></i>No Of Beds: ${
                  room.noofbed
                }
              </small>
            </div>

            ${
              room.roomamenities === null || room.roomamenities.length === 0
                ? ""
                : `<div class="d-flex mb-3">
                    ${room.roomamenities
                      .map(
                        (amenity) => `
                          <small class="me-3">
                            <i class="fa ${getAmenityIcon(
                              amenity
                            )} text-primary me-2"></i>${
                          amenity === null ? "" : amenity
                        }
                          </small>
                        `
                      )
                      .join("")}
                  </div>`
            }
            <p class="text-body mb-3">Recommended for 2 adults</p>
            <div class="d-flex justify-content-between">
              <a class="btn btn-sm btn-primary rounded py-2 px-4" href="#">View Detail</a>
              <a class="btn btn-sm btn-dark rounded py-2 px-4" href="booking.html">Book Now</a>
            </div>
          </div>
        </div>
      </div>
    `;
      })
      .join("");

    const data = {
      "#siteTitle": result.rows[0].details.title,
      "#siteEmail": result.rows[0].details.email,
      "#sitePhoneNumber": result.rows[0].details.phoneNumber,
      "#siteAddress": result.rows[0].details.address,
      "#rooms": roomsHtml,
    };

    const templatePath = `./template/temp${templateId}/room.html`;

    const template = await fs.readFile(templatePath, "utf8");

    const outputHtml = template.replace(
      /#\w+/g,
      (placeholder) => data[placeholder] || ""
    );

    const outputPath = `/var/www/template${templateId}/user${hotelId}/room.html`;

    await fs.writeFile(outputPath, outputHtml, "utf8");

    console.log("Template built successfully");
    // console.log(roomsHtml);
  } catch (error) {
    console.log(error);
  }
};

const getAmenityIcon = (amenity) => {
  if (!amenity) return "";
  switch (amenity.toLowerCase()) {
    case "wifi":
      return "fa-wifi";
    case "tv":
      return "fa-tv";
    case "ac":
      return "fa-snowflake";
    case "balcony":
      return "fa-building";
    default:
      return "";
  }
};

const buildTemplateSpecialOffers = async (data, hotelId, templateId) => {
  const templatePath = `./template/temp${templateId}/specialOffers.html`;

  const template = await fs.readFile(templatePath, "utf8");

  const outputHtml = template.replace(
    /#\w+/g,
    (placeholder) => data[placeholder] || ""
  );

  const outputPath = `/var/www/template${templateId}/user${hotelId}/specialOffers.html`;
  await fs.writeFile(outputPath, outputHtml, "utf8");

  console.log("Template built successfully");
};

//  // generate nginx config file for the built template
// INSERT INTO hotelinfo (
//     id,
//     name,
//     startdate,
//     type,
//     mobile,
//     telephone,
//     email,
//     url,
//     address1,
//     address2,
//     postalcode,
//     city,
//     province,
//     country,
//     timezone,
//     tag,
//     description,
//     apprequestid,
//   ) VALUES (
//     $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
//   )
const { exec } = require("child_process");

const generateNginxConfig = async (hotelId, templateId) => {
  // console.log(hotelId);
  const getSiteName = await pool.query(
    "SELECT url FROM hotelinfo WHERE id = $1",
    [hotelId]
  );
  // console.log(getSiteName);

  if (getSiteName.rows[0].url === null) {
    return console.log("website name not found");
  }

  const nginxFileExist = fssync.existsSync(
    `/etc/nginx/sites-available/template${templateId}-user${hotelId}`
  );

  if (nginxFileExist) {
    return console.log("nginx file exist");
  }

  if (!getSiteName.rows[0]) {
    return console.log("website name not found");
  }

  // http and https remove

  const domain = getSiteName.rows[0].url
    .replace(/https?:\/\//, "")
    .replace(/\/$/, "");

  const nginxConfig = `
  server {
    listen 80;
    server_name ${domain};
    root /var/www/template${templateId}/user${hotelId};
    index index.html;
    location / {
      try_files $uri $uri/ /index.html;
    }
  }
  `;

  const configPath = `/etc/nginx/sites-available/template${templateId}-user${hotelId}`;

  fssync.writeFileSync(configPath, nginxConfig);

  exec(
    `sudo ln -s ${configPath} /etc/nginx/sites-enabled/`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }

      exec("sudo systemctl restart nginx", (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        console.log("nginx file successfully created");
        addSslCertificate(hotelId, templateId, domain);
      });
    }
  );
};

// // add ssl certificate

const addSslCertificate = (hotelId, templateId, domain) => {
  exec(
    `sudo certbot certificates --domain ${domain}`,
    (checkError, checkStdout, checkStderr) => {
      if (checkError) {
        console.error(`Error checking certificate: ${checkError}`);
        return;
      }

      const certificateExists = checkStdout.includes(
        `Certificate Name: ${domain}`
      );

      const certbotCommand = certificateExists
        ? `sudo certbot --nginx -d ${domain} --reinstall`
        : `sudo certbot --nginx -d ${domain}`;

      console.log(`Running Certbot command: ${certbotCommand}`);

      exec(certbotCommand, (certError, certStdout, certStderr) => {
        if (certError) {
          console.error(`Error handling SSL certificate: ${certError}`);
          return;
        }

        console.log(certStdout);

        exec(
          "sudo systemctl restart nginx",
          (nginxError, nginxStdout, nginxStderr) => {
            if (nginxError) {
              console.error(`Error restarting Nginx: ${nginxError}`);
              return;
            }

            console.log(
              `SSL certificate ${
                certificateExists ? "reinstalled" : "installed"
              } successfully for ${domain}`
            );
          }
        );
      });
    }
  );
};

//       //verify the symbolic link

// const verifySymbolicLink = () => {
//       exec(
//         `ls -l /etc/nginx/sites-enabled/`,
//         (error, stdout, stderr) => {
//           if (error) {
//             console.error(`exec error: ${error}`);
//             return;
//           }
//           console.log(`stdout: ${stdout}`);
//           console.error(`stderr: ${stderr}`);
//         }
//       );
//     }
//   );
// };

// // restart nginx

// const restartNginx = () => {
//   exec(
//     `sudo nginx -t`,
//     (error, stdout, stderr) => {
//       if (error) {
//         console.error(`exec error: ${error}`);
//         return;
//       }
//       console.log(`stdout: ${stdout}`);
//       console.error(`stderr: ${stderr}`);
//     }
//   );

//   exec(
//     `sudo systemctl restart nginx`,
//     (error, stdout, stderr) => {
//       if (error) {
//         console.error(`exec error: ${error}`);
//         return;
//       }
//       console.log(`stdout: ${stdout}`);
//       console.error(`stderr: ${stderr}`);
//     }
//   );
// };

// sudo ln -s /etc/nginx/sites-available/miniatlasbe1.ceyinfo.cloud.conf /etc/nginx/sites-enabled/

// Verify the Symbolic Link:
// Ensure the symbolic link was created correctly:
// ls -l /etc/nginx/sites-enabled/

// You should see something like:
// lrwxrwxrwx 1 root root 53 Jul 30 10:00 miniatlasbe1.ceyinfo.cloud.conf -> /etc/nginx/sites-available/miniatlasbe1.ceyinfo.cloud.conf

// sudo nginx -t

// sudo systemctl restart nginx

const startServer = async () => {
  try {
    await pool.connect();
    console.log("Database connection successful");

    app.listen(4000, () => {
      console.log(`Server is running on port http://localhost:4000`);
    });
  } catch (error) {
    console.error("Failed to connect to the database", error);
    process.exit(1);
  }
};

startServer();
