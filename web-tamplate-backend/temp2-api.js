const express = require("express");
const router = express.Router();
const pool = require("./database/db");
const fs = require("fs/promises");
const path = require("path");
const fssync = require("fs");
const multer = require("multer");

router.get("/test", (req, res) => {
  res.send("test api temp 2");
});

router.post("/save-site-details", async (req, res) => {
  const {
    hotelId,
    templateId,
    title,
    carouselImages,
    aboutUsTitle,
    aboutUsDescription,
    aboutUsImages,
    hotelFoodTitle,
    hotelFoodDescription,
    hotelFoodImages,
    email,
    phoneNumber,
    address,
    imageRoomBradCam,
    imageAboutBradCam,
    imageContactBradCam,
    mapIframeHtml,
    realImages,
  } = req.body;
  // console.log(imageRoomBradCam, imageAboutBradCam, imageContactBradCam);
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
            carouselImages,
            aboutUsTitle,
            aboutUsDescription,
            aboutUsImages,
            hotelFoodTitle,
            hotelFoodDescription,
            hotelFoodImages,
            email,
            phoneNumber,
            address,
            imageRoomBradCam,
            imageAboutBradCam,
            imageContactBradCam,
            mapIframeHtml,
            realImages,
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
            carouselImages,
            aboutUsTitle,
            aboutUsDescription,
            aboutUsImages,
            hotelFoodTitle,
            hotelFoodDescription,
            hotelFoodImages,
            email,
            phoneNumber,
            address,
            imageRoomBradCam,
            imageAboutBradCam,
            imageContactBradCam,
            mapIframeHtml,
            realImages,
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

    const data = {
      "#siteTitle": result.rows[0].details.title,
      "#siteEmail": result.rows[0].details.email,
      "#sitePhoneNumber": result.rows[0].details.phoneNumber,
      "#siteAboutUsImages1": result.rows[0].details.aboutUsImages[0].src,
      "#siteAboutUsImages2": result.rows[0].details.aboutUsImages[1].src,
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

      "#siteAddress": result.rows[0].details.address,
    };

    buildTemplate(result, hotelId, templateId);
    buildTemplateAboutUs(result, hotelId, templateId);
    // buildTemplateGallery(result, hotelId, templateId);
    buildTemplateContactUs(result, hotelId, templateId);
    // buildTemplateAttraction(result, hotelId, templateId);
    buildTemplateHotelRooms(result, hotelId, templateId);
    // buildTemplateBooking(data, hotelId, templateId);
    // buildTemplateSpecialOffers(data, hotelId, templateId);
    res.send({
      message: "Template built successfully",
    });
  } catch (error) {
    console.log(error);
  }
});

const buildTemplate = async (result, hotelId, templateId) => {
  const templatePath = `./template/temp${templateId}/index.html`;
  const template = await fs.readFile(templatePath, "utf8");

  const rooms = await pool.query(
    `
      SELECT 
        htrm.hotelid,
        htrm.roomviewid,
        htrm.roomtypeid,
        htrm.roomno,
        htrm.noofbed, 
        hrv.roomview,
        hrt.roomtype,
        hrp.fbprice,
        ARRAY_AGG(amn.name) AS roomamenities
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
        hrv.roomview, 
        hrt.roomtype, 
        hrp.fbprice
      `,
    [hotelId]
  );
  {
    /* <div class="single_rooms" v-for="(room, index) in roomsDetails" :key="index">
                <div class="room_thumb">
                    <img src="img/rooms/1.png" alt="">
                    <div class="room_heading d-flex justify-content-between align-items-center">
                        <div class="room_heading_inner">
                            <span>From Rs {{ room.fbprice }}</span>
                            <h3>{{ room.roomtype }}</h3>
                            <p style="color: white; font-weight: 600;">{{ room.roomview }} View, {{ room.noofbed }} Beds
                            </p>
                            <p style="color: white;font-weight: 600;"
                                v-if="room.roomamenities && room.roomamenities[0]">
                                Amenities: {{ room.roomamenities.join(', ') }}
                            </p>
                        </div>
                        <a href="#" class="line-button">book now</a>
                    </div>
                </div>
            </div> */
  }
  const roomsHtml = rooms.rows
    .map((room) => {
      return `<div class="single_rooms">
                <div class="room_thumb  ">
                  <img src="img/rooms/1.png" alt="">
                    <div class="room_heading d-flex justify-content-between align-items-center">
                         <div class="room_heading_inner">
                        <span>From Rs ${room.fbprice}</span>
                        <h3>${room.roomtype}</h3>
                        <p style="color: white; font-weight: 600;">${
                          room.roomview
                        } View, ${room.noofbed} Beds
                        </p>
                        <p style="color: white;font-weight: 600;">
                            Amenities: ${room.roomamenities.join(", ")}
                        </p>
                       </div>
                       <a href="#" class="line-button">book now</a>
                       </div>
                </div>
            </div>`;
    })
    .join("");

  const slider = result.rows[0].details.carouselImages
    .map((image) => {
      return `<div 
                style="background-image: url('${image.src}');"
                class="single_slider d-flex align-items-center justify-content-center">
                <div class="container">
                    <div class="row">
                        <div class="col-xl-12">
                            <div class="slider_text text-center">
                                <h3>
                                    ${image.carouselTitle}
                                </h3>
                                <p>${image.carouselDescription}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
    })
    .join("");

  //  <div v-if="userUseRealImages" class="single_instagram" v-for="(item, index) in realImages.filePaths"
  //         :key="index">
  //         <img :src="item" alt="">
  //         <div class="ovrelay">
  //             <a href="#">
  //                 <i class="fa fa-instagram"></i>
  //             </a>
  //         </div>
  //     </div>

  const imagesSection = result.rows[0].details?.realImages?.filePaths
    .map((image) => {
      return `<div class="single_instagram">
                <img src="${image}" alt="">
                <div class="ovrelay">
                    <a href="#">
                        <i class="fa fa-instagram"></i>
                    </a>
                </div>
            </div>`;
    })
    .join("");

  const data = {
    "#siteTitle": result.rows[0].details.title,
    "#siteEmail": result.rows[0].details.email,
    "#sitePhoneNumber": result.rows[0].details.phoneNumber,
    "#slider": slider,
    "#rooms": roomsHtml,
    "#siteAddress": result.rows[0].details.address,
    "#siteHotelFoodTitle": result.rows[0].details.hotelFoodTitle,
    "#siteHotelFoodDescription": result.rows[0].details.hotelFoodDescription,
    "#siteHotelFoodImages1": result.rows[0].details.hotelFoodImages[0].src,
    "#siteHotelFoodImages2": result.rows[0].details.hotelFoodImages[1].src,
    "#siteHotelFoodImages1Alt": result.rows[0].details.hotelFoodImages[0].alt,
    "#siteHotelFoodImages2Alt": result.rows[0].details.hotelFoodImages[1].alt,
    "#siteAboutUsTitle": result.rows[0].details.aboutUsTitle,
    "#siteAboutUsDescription": result.rows[0].details.aboutUsDescription,
    "#siteAboutUsImages1": result.rows[0].details.aboutUsImages[0].src,
    "#siteAboutUsImages2": result.rows[0].details.aboutUsImages[1].src,
    "#siteAboutUsImages1Alt": result.rows[0].details.aboutUsImages[0].alt,
    "#siteAboutUsImages2Alt": result.rows[0].details.aboutUsImages[1].alt,
    "#imagesSection": imagesSection,
  };

  const result2 = template.replace(
    /#\w+/g,
    (placeholder) => data[placeholder] || ""
  );

  const outputPath = `/var/www/template${templateId}/user${hotelId}/index.html`;
  await fs.writeFile(outputPath, result2, "utf8");

  console.log("Template built successfully");
};

const buildTemplateHotelRooms = async (result, hotelId, templateId) => {
  const templatePath = `./template/temp${templateId}/rooms.html`;
  const template = await fs.readFile(templatePath, "utf8");

  const rooms = await pool.query(
    `
      SELECT 
        htrm.hotelid,
        htrm.roomviewid,
        htrm.roomtypeid,
        htrm.roomno,
        htrm.noofbed, 
        hrv.roomview,
        hrt.roomtype,
        hrp.fbprice,
        ARRAY_AGG(amn.name) AS roomamenities
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
        hrv.roomview, 
        hrt.roomtype, 
        hrp.fbprice
      `,
    [hotelId]
  );
  {
    /* <div class="single_rooms" v-for="(room, index) in roomsDetails" :key="index">
                <div class="room_thumb">
                    <img src="img/rooms/1.png" alt="">
                    <div class="room_heading d-flex justify-content-between align-items-center">
                        <div class="room_heading_inner">
                            <span>From Rs {{ room.fbprice }}</span>
                            <h3>{{ room.roomtype }}</h3>
                            <p style="color: white; font-weight: 600;">{{ room.roomview }} View, {{ room.noofbed }} Beds
                            </p>
                            <p style="color: white;font-weight: 600;"
                                v-if="room.roomamenities && room.roomamenities[0]">
                                Amenities: {{ room.roomamenities.join(', ') }}
                            </p>
                        </div>
                        <a href="#" class="line-button">book now</a>
                    </div>
                </div>
            </div> */
  }
  const roomsHtml = rooms.rows
    .map((room) => {
      return `<div class="single_rooms">
                <div class="room_thumb  ">
                  <img src="img/rooms/1.png" alt="">
                    <div class="room_heading d-flex justify-content-between align-items-center">
                         <div class="room_heading_inner">
                        <span>From Rs ${room.fbprice}</span>
                        <h3>${room.roomtype}</h3>
                        <p style="color: white; font-weight: 600;">${
                          room.roomview
                        } View, ${room.noofbed} Beds
                        </p>
                        <p style="color: white;font-weight: 600;">
                            Amenities: ${room.roomamenities.join(", ")}
                        </p>
                       </div>
                       <a href="#" class="line-button">book now</a>
                       </div>
                </div>
            </div>`;
    })
    .join("");

  const data = {
    "#siteTitle": result.rows[0].details.title,
    "#siteEmail": result.rows[0].details.email,
    "#sitePhoneNumber": result.rows[0].details.phoneNumber,
    "#rooms": roomsHtml,
    "#siteAddress": result.rows[0].details.address,
    "#siteAboutUsBeadCrumb": result.rows[0].details.imageRoomBradCam,
  };

  const result2 = template.replace(
    /#\w+/g,
    (placeholder) => data[placeholder] || ""
  );

  const outputPath = `/var/www/template${templateId}/user${hotelId}/rooms.html`;

  await fs.writeFile(outputPath, result2, "utf8");

  console.log("Template built successfully");
};

const buildTemplateAboutUs = async (result, hotelId, templateId) => {
  const templatePath = `./template/temp${templateId}/about.html`;
  const template = await fs.readFile(templatePath, "utf8");

  const data = {
    "#siteTitle": result.rows[0].details.title,
    "#siteEmail": result.rows[0].details.email,
    "#sitePhoneNumber": result.rows[0].details.phoneNumber,
    "#siteAboutUsTitle": result.rows[0].details.aboutUsTitle,
    "#siteAboutUsDescription": result.rows[0].details.aboutUsDescription,
    "#siteAboutUsImages1": result.rows[0].details.aboutUsImages[0].src,
    "#siteAboutUsImages2": result.rows[0].details.aboutUsImages[1].src,
    "#siteAboutUsImages1Alt": result.rows[0].details.aboutUsImages[0].alt,
    "#siteAboutUsImages2Alt": result.rows[0].details.aboutUsImages[1].alt,
    "#siteAddress": result.rows[0].details.address,
    "#siteAboutUsBeadCrumb": result.rows[0].details.imageAboutBradCam,
  };

  const result2 = template.replace(
    /#\w+/g,
    (placeholder) => data[placeholder] || ""
  );

  const outputPath = `/var/www/template${templateId}/user${hotelId}/about.html`;

  await fs.writeFile(outputPath, result2, "utf8");

  console.log("Template built successfully");
};

const buildTemplateContactUs = async (result, hotelId, templateId) => {
  const templatePath = `./template/temp${templateId}/contact.html`;
  const template = await fs.readFile(templatePath, "utf8");

  const data = {
    "#siteTitle": result.rows[0].details.title,
    "#siteEmail": result.rows[0].details.email,
    "#sitePhoneNumber": result.rows[0].details.phoneNumber,
    "#siteAddress": result.rows[0].details.address,
    "#siteMapIframe": result.rows[0].details.mapIframeHtml,
    "#siteAboutUsBeadCrumb": result.rows[0].details.imageContactBradCam,
  };

  const result2 = template.replace(
    /#\w+/g,
    (placeholder) => data[placeholder] || ""
  );

  const outputPath = `/var/www/template${templateId}/user${hotelId}/contact.html`;

  await fs.writeFile(outputPath, result2, "utf8");

  console.log("Template built successfully");
};

module.exports = router;
