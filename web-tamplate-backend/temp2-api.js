const express = require("express");
const router = express.Router();
const pool = require("./database/db");
const fs = require("fs/promises");
const path = require("path");
const fssync = require("fs");
const multer = require("multer");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
router.get("/test", (req, res) => {
  res.send("test api temp 2");
});

router.post("/save-site-details", async (req, res) => {
  const pool = req.tenantPool;
  const propertyId = req.property_id;
  console.log(req.property_id);
  const {
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
      [propertyId, templateId]
    );

    if (existingResult.rows.length > 0) {
      const updateResult = await pool.query(
        "UPDATE webtemplatedata SET details = $1 WHERE hotelId = $2 AND templateId = $3 RETURNING *",
        [
          JSON.stringify({
            propertyId,
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
          propertyId,
          templateId,
        ]
      );
      return res.status(200).json({
        message: "Site details updated successfully",
        data: updateResult.rows[0],
      });
    } else {
      const insertResult = await pool.query(
        "INSERT INTO webtemplatedata (hotelId, templateId, details) VALUES ($1, $2, $3) RETURNING *",
        [
          propertyId,
          templateId,
          JSON.stringify({
            propertyId,
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
      return res.status(201).json({
        message: "Site details saved successfully",
        data: insertResult.rows[0],
      });
    }
  } catch (err) {
    console.error("Error saving site details:", err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

router.get("/build-template", async (req, res) => {
  const pool = req.tenantPool;
  const hotelId = req.property_id;
  const organization_id = req.organization_id;
  const { templateId } = req.query;
  if (!hotelId || !templateId) {
    return res.status(400).json({
      message: "Hotel ID and Template ID are required",
    });
  }

  try {
    const targetDir = `/var/www/template${templateId}/organization${organization_id}/property${hotelId}`;

    await fs.mkdir(targetDir, { recursive: true });

    const sourceDir = path.resolve(__dirname, "build/template/temp2");

    await fs.cp(sourceDir, targetDir, { recursive: true });
  } catch (error) {
    console.error("Error copying template:", error);
  }

  // try {
  //   //copy hotel image folder
  //   const sourceDir = path.resolve(
  //     __dirname,
  //     "/var/images/organization" + organization_id + "/property" + hotelId
  //   );
  //   const targetDir = `/var/www/template${templateId}/organization${organization_id}/property${hotelId}/img`;

  //   await fs.mkdir(targetDir, { recursive: true });
  //   await fs.cp(sourceDir, targetDir, { recursive: true });
  // } catch (error) {
  //   console.error("Error copying hotel images:", error);
  // }

  try {
    const result = await pool.query(
      "SELECT * FROM webtemplatedata WHERE hotelId = $1 AND templateId = $2",
      [hotelId, templateId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Site details not found",
      });
    }

    const tempIds = [1, 3];
    for (const tempId of tempIds) {
      try {
        const alreadyPublish = await pool.query(
          "SELECT * FROM webtemplates WHERE hotelid = $1 AND templateId = $2",
          [hotelId, tempId]
        );

        if (alreadyPublish.rows.length > 0) {
          return res.status(400).json({
            message: `Template ${tempId} is already linked to the domain ${alreadyPublish.rows[0].website}.`,
          });
        }
      } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
      }
    }

    const dataNew = {
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
      "#testF": "#test-form",
    };

    await buildTemplate(result, hotelId, templateId, organization_id, pool);
    await buildTemplateAboutUs(
      result,
      hotelId,
      templateId,
      organization_id,
      pool
    );
    // buildTemplateGallery(result, hotelId, templateId);
    await buildTemplateContactUs(
      result,
      hotelId,
      templateId,
      organization_id,
      pool
    );
    // buildTemplateAttraction(result, hotelId, templateId);
    await buildTemplateHotelRooms(
      result,
      hotelId,
      templateId,
      organization_id,
      pool
    );
    // buildTemplateBooking(data, hotelId, templateId);
    // buildTemplateSpecialOffers(data, hotelId, templateId);
    await generateNginxConfig(hotelId, templateId, organization_id, pool);
    return res.send({
      message: "Template built successfully",
    });
  } catch (error) {
    console.log(error);
  }
});

const buildTemplate = async (
  result,
  hotelId,
  templateId,
  organization_id,
  pool
) => {
  const templatePath = `./template/temp${templateId}/index.html`;
  const template = await fs.readFile(templatePath, "utf8");

  const rooms = await pool.query(
    `SELECT 
    op.view_id, 
    op.roomclass_id, 
    cv.roomview, 
    orc.custom_name, 
    orc.maxadultcount,
    orc.maxchildcount,
    img.imagename,
    orp.fbprice,
    ARRAY_AGG(DISTINCT op.roomno_text) AS room_numbers,
    ARRAY_AGG(DISTINCT orca.amenity_label) AS amenities
FROM operation_rooms op
JOIN core_data.core_view cv ON op.view_id = cv.id
JOIN operation_roomreclass orc ON op.roomclass_id = orc.id
JOIN operation_roomprices orp ON orp.roomclass_id = op.roomclass_id
JOIN operation_hotelroompriceshedules ohps ON orp.shedule_id = ohps.id
LEFT JOIN (
    SELECT room_class_id, MIN(imagename) AS imagename
    FROM operation_roomclass_images
    GROUP BY room_class_id
) img ON img.room_class_id = orc.id
LEFT JOIN operation_roomclass_amenities orca ON orca.room_class_id = op.roomclass_id
WHERE 
    op.property_id = $1
    AND CURRENT_DATE BETWEEN ohps.startdate AND ohps.enddate
GROUP BY 
    op.view_id, 
    op.roomclass_id, 
    cv.roomview, 
    orc.custom_name, 
    orc.maxadultcount,
    orc.maxchildcount,
    img.imagename,
    orp.fbprice
ORDER BY op.view_id, op.roomclass_id;`,
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
  // const hotelURL = `https://web-booking.ceyinfo.com?org_id=${organization_id}&p_id=${hotelId}`;

  const roomsHtml = rooms.rows
    .map((room) => {
      return `<div class="single_rooms">
                <div class="room_thumb  ">
                   <img src="${
                     room.imagename ? room.imagename : "img/rooms/1.png"
                   }" alt="" style="min-height: 400px; max-height: 400px; ">
                    <div class="room_heading d-flex justify-content-between align-items-center" style="background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 100%); height: 200px; width: 100%;">
                         <div class="room_heading_inner" style="margin-bottom: 20px;">
                        <span>From Rs ${room.fbprice}</span>
                        <h3>${room.custom_name}</h3>
                        <p style="color: white; font-weight: 600;">${
                          room.roomview
                        } View, 
                        </p>
                        <div style="display: flex; gap: 10px; margin-top: 10px;">
            
                                <span style="font-weight: 600;">Room Number:</span>
                             
                                <template>
                                    ${room.room_numbers
                                      .map(
                                        (number) => `
                                        <span class="badge bg-dark text-light" style="border-radius: 12px; font-size: 0.8rem; margin: 2px; display: inline-block;">${number}</span>
                                    `
                                      )
                                      .join("")}
                                    
                                </template>
                            </div>
                        <p style="color: white;font-weight: 600;">
                            Amenities:  ${room.amenities
                              .map(
                                (amenity) => `
                          <small>
                          ${
                            amenity === null
                              ? ""
                              : `<span   class="badge bg-dark text-light "  
                                       style="border-radius: 12px; font-size: 0.8rem; margin: 2px; display: inline-block;">
                                  ${amenity}
                                </span>
`
                          }
                          </small>
                        `
                              )
                              .join("")}
                        </p>
                       </div>
                       <a href="https://web-booking.ceyinfo.com?org_id=${organization_id}&p_id=${hotelId}" class="line-button">book now</a>
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
    ? result.rows[0].details.realImages.filePaths
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
        .join("")
    : "";
  const hotelURL = `https://web-booking.ceyinfo.com?org_id=${organization_id}&p_id=${hotelId}`;

  // <script>
  //     document.addEventListener("DOMContentLoaded", function () {
  //         const checkInDate = document.getElementById("datepicker");
  //         const checkOutDate = document.getElementById("datepicker2");
  //         const hotelId = new URLSearchParams(window.location.search).get("hotelId");

  //         const bookRoomButton = document.getElementById("book-room");

  //         bookRoomButton.addEventListener("click", function (event) {
  //             event.preventDefault();

  //             window.location.href = `https://web-booking.ceyinfo.com/?hotelId=${hotelId}&checkin=${checkInDate.value}&checkout=${checkOutDate.value}`;
  //         });
  //     });
  // </script>

  const bookScript = `<script>
    document.addEventListener("DOMContentLoaded", function () {
        const checkInDate = document.getElementById("datepicker");
        const checkOutDate = document.getElementById("datepicker2");
        const hotelId = ${hotelId};
        const orgId = ${organization_id};
        const bookRoomButton = document.getElementById("book-room");

        bookRoomButton.addEventListener("click", function (event) {
            event.preventDefault();
            window.location.href = \`https://web-booking.ceyinfo.com/?org_id=\${orgId}&p_id=\${hotelId}&checkin=\${checkInDate.value}&checkout=\${checkOutDate.value}\`;
        });
    });
</script>`;
  const siteAddress = `<div>
        <span>${result.rows[0].details.address}</span>
        <span>${result.rows[0].details.phoneNumber}</span>
</div>`;

  const data = {
    "#hotelURL": hotelURL,
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
    "#testF": "#test-form",
    "#bookScript": bookScript,
  };

  const result2 = template.replace(
    /#\w+/g,
    (placeholder) => data[placeholder] || ""
  );

  const outputPath = `/var/www/template${templateId}/organization${organization_id}/property${hotelId}/index.html`;
  await fs.writeFile(outputPath, result2, "utf8");

  console.log("Template built successfully");
};

const buildTemplateHotelRooms = async (
  result,
  hotelId,
  templateId,
  organization_id,
  pool
) => {
  const templatePath = `./template/temp${templateId}/rooms.html`;
  const template = await fs.readFile(templatePath, "utf8");

  const offer = await pool.query(
    "SELECT * FROM operation_hoteloffers WHERE property_id = $1",
    [hotelId]
  );

  const offersHtml = offer.rows;

  const offersHtml2 = offersHtml.map(
    (offer) => `
      <div class="d-flex justify-content-center align-items-center flex-wrap" style="margin-top: 30px;">
        <img src="${offer.offerimage}" alt="Offer Image" class="img-fluid" style="max-width: 700px; min-width: 700px; height: auto; object-fit: cover;">
        </div>
      `
  );

  const rooms = await pool.query(
    `SELECT 
    op.view_id, 
    op.roomclass_id, 
    cv.roomview, 
    orc.custom_name, 
    orc.maxadultcount,
    orc.maxchildcount,
    img.imagename,
    orp.fbprice,
    ARRAY_AGG(DISTINCT op.roomno_text) AS room_numbers,
    ARRAY_AGG(DISTINCT orca.amenity_label) AS amenities
FROM operation_rooms op
JOIN core_data.core_view cv ON op.view_id = cv.id
JOIN operation_roomreclass orc ON op.roomclass_id = orc.id
JOIN operation_roomprices orp ON orp.roomclass_id = op.roomclass_id
JOIN operation_hotelroompriceshedules ohps ON orp.shedule_id = ohps.id
LEFT JOIN (
    SELECT room_class_id, MIN(imagename) AS imagename
    FROM operation_roomclass_images
    GROUP BY room_class_id
) img ON img.room_class_id = orc.id
LEFT JOIN operation_roomclass_amenities orca ON orca.room_class_id = op.roomclass_id
WHERE 
    op.property_id = $1
    AND CURRENT_DATE BETWEEN ohps.startdate AND ohps.enddate
GROUP BY 
    op.view_id, 
    op.roomclass_id, 
    cv.roomview, 
    orc.custom_name, 
    orc.maxadultcount,
    orc.maxchildcount,
    img.imagename,
    orp.fbprice
ORDER BY op.view_id, op.roomclass_id;`,
    [hotelId]
  );
  {
  }

  const roomsHtml = rooms.rows
    .map((room) => {
      return `<div class="single_rooms">
                <div class="room_thumb  ">
                   <img src="${
                     room.imagename ? room.imagename : "img/rooms/1.png"
                   }" alt="" style="min-height: 400px; max-height: 400px; ">
                    <div class="room_heading d-flex justify-content-between align-items-center" style="background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 100%); height: 200px; width: 100%;">
                         <div class="room_heading_inner" style="margin-bottom: 20px;">
                        <span>From Rs ${room.fbprice}</span>
                        <h3>${room.custom_name}</h3>
                        <p style="color: white; font-weight: 600;">${
                          room.roomview
                        } View, 
                        </p><div style="display: flex; gap: 10px; margin-top: 10px;">
            
                                <span style="font-weight: 600;">Room Number:</span>
                             
                                <template>
                                    ${room.room_numbers
                                      .map(
                                        (number) => `
                                        <span class="badge bg-dark text-light" style="border-radius: 12px; font-size: 0.8rem; margin: 2px; display: inline-block;">${number}</span>
                                    `
                                      )
                                      .join("")}
                                    
                                </template>
                            </div>
                        <p style="color: white;font-weight: 600;">
                            Amenities:  ${room.amenities
                              .map(
                                (amenity) => `
                          <small>
                          ${
                            amenity === null
                              ? ""
                              : `<span   class="badge bg-dark text-light "  
                                       style="border-radius: 12px; font-size: 0.8rem; margin: 2px; display: inline-block;">
                                  ${amenity}
                                </span>
`
                          }
                          </small>
                        `
                              )
                              .join("")}
                        </p>
                       </div>
                       <a href="https://web-booking.ceyinfo.com?org_id=${organization_id}&p_id=${hotelId}" class="line-button">book now</a>
                       </div>
                </div>
            </div>`;
    })
    .join("");
  const hotelURL = `https://web-booking.ceyinfo.com?org_id=${organization_id}&p_id=${hotelId}`;

  const bookScript = `<script>
    document.addEventListener("DOMContentLoaded", function () {
        const checkInDate = document.getElementById("datepicker");
        const checkOutDate = document.getElementById("datepicker2");
        const hotelId = ${hotelId};
        const orgId = ${organization_id};
        const bookRoomButton = document.getElementById("book-room");

             bookRoomButton.addEventListener("click", function (event) {
            event.preventDefault();
            window.location.href = \`https://web-booking.ceyinfo.com/?org_id=\${orgId}&p_id=\${hotelId}&checkin=\${checkInDate.value}&checkout=\${checkOutDate.value}\`;
        });
    });
</script>`;

  const data = {
    "#hotelURL": hotelURL,
    "#siteTitle": result.rows[0].details.title,
    "#siteEmail": result.rows[0].details.email,
    "#sitePhoneNumber": result.rows[0].details.phoneNumber,
    "#rooms": roomsHtml,
    "#siteAddress": result.rows[0].details.address,
    "#siteAboutUsBeadCrumb": result.rows[0].details.imageRoomBradCam,
    "#testF": "#test-form",
    "#bookScript": bookScript,
    "#offers": offersHtml2,
  };

  const result2 = template.replace(
    /#\w+/g,
    (placeholder) => data[placeholder] || ""
  );

  const outputPath = `/var/www/template${templateId}/organization${organization_id}/property${hotelId}/rooms.html`;

  await fs.writeFile(outputPath, result2, "utf8");

  console.log("Template built successfully");
};

const buildTemplateAboutUs = async (
  result,
  hotelId,
  templateId,
  organization_id,
  pool
) => {
  const templatePath = `./template/temp${templateId}/about.html`;
  const template = await fs.readFile(templatePath, "utf8");

  const bookScript = `<script>
    document.addEventListener("DOMContentLoaded", function () {
        const checkInDate = document.getElementById("datepicker");
        const checkOutDate = document.getElementById("datepicker2");
        const hotelId = ${hotelId};
        const orgId = ${organization_id};
        const bookRoomButton = document.getElementById("book-room");

               bookRoomButton.addEventListener("click", function (event) {
            event.preventDefault();
            window.location.href = \`https://web-booking.ceyinfo.com/?org_id=\${orgId}&p_id=\${hotelId}&checkin=\${checkInDate.value}&checkout=\${checkOutDate.value}\`;
        });
    });
</script>`;

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
    "#testF": "#test-form",
    "#bookScript": bookScript,
  };

  const result2 = template.replace(
    /#\w+/g,
    (placeholder) => data[placeholder] || ""
  );

  const outputPath = `/var/www/template${templateId}/organization${organization_id}/property${hotelId}/about.html`;

  await fs.writeFile(outputPath, result2, "utf8");

  console.log("Template built successfully");
};

const buildTemplateContactUs = async (
  result,
  hotelId,
  templateId,
  organization_id,
  pool
) => {
  const templatePath = `./template/temp${templateId}/contact.html`;
  const template = await fs.readFile(templatePath, "utf8");

  const bookScript = `<script>
    document.addEventListener("DOMContentLoaded", function () {
        const checkInDate = document.getElementById("datepicker");
        const checkOutDate = document.getElementById("datepicker2");
        const hotelId = ${hotelId};
        const orgId = ${organization_id};

        const bookRoomButton = document.getElementById("book-room");

                bookRoomButton.addEventListener("click", function (event) {
            event.preventDefault();
            window.location.href = \`https://web-booking.ceyinfo.com/?org_id=\${orgId}&p_id=\${hotelId}&checkin=\${checkInDate.value}&checkout=\${checkOutDate.value}\`;
        });
    });
</script>`;

  const data = {
    "#siteTitle": result.rows[0].details.title,
    "#siteEmail": result.rows[0].details.email,
    "#sitePhoneNumber": result.rows[0].details.phoneNumber,
    "#siteAddress": result.rows[0].details.address,
    "#siteMapIframe": result.rows[0].details.mapIframeHtml,
    "#siteAboutUsBeadCrumb": result.rows[0].details.imageContactBradCam,
    "#testF": "#test-form",
    "#bookScript": bookScript,
  };

  const result2 = template.replace(
    /#\w+/g,
    (placeholder) => data[placeholder] || ""
  );

  const outputPath = `/var/www/template${templateId}/organization${organization_id}/property${hotelId}/contact.html`;

  await fs.writeFile(outputPath, result2, "utf8");

  console.log("Template built successfully");
};

//  // generate nginx config file for the built template
const generateNginxConfig = async (
  hotelId,
  templateId,
  organization_id,
  pool
) => {
  try {
    const { rows } = await pool.query(
      "SELECT url FROM operation_property WHERE id = $1",
      [hotelId]
    );

    if (!rows.length || !rows[0].url) {
      console.log("Website domain not found.");
      return;
    }

    const domain = rows[0].url?.replace(/https?:\/\//, "").replace(/\/$/, "");
    const configPath = `/etc/nginx/sites-available/${domain}.conf`;

    if (fssync.existsSync(configPath)) {
      console.log("Nginx config already exists. Skipping creation.");
      await addPublishDetails(
        hotelId,
        templateId,
        domain,
        pool,
        organization_id
      );
      await addSslCertificate(hotelId, templateId, domain);
      return;
    }

    const nginxConfig = `
    server {
      listen 80;
      server_name ${domain};
      root /var/www/template${templateId}/organization${organization_id}/property${hotelId};
      index index.html;
      location / {
        try_files $uri $uri/ /index.html;
      }
    }
    `;

    fssync.writeFileSync(configPath, nginxConfig);
    await exec(`sudo ln -sf ${configPath} /etc/nginx/sites-enabled/`);
    await exec("sudo systemctl restart nginx");
    console.log("Nginx restarted successfully.");

    await addPublishDetails(hotelId, templateId, domain, pool, organization_id);
    await addSslCertificate(hotelId, templateId, domain);
  } catch (error) {
    console.error("Error generating Nginx config:", error);
  }
};
const exec2 = util.promisify(require("child_process").exec);
const addSslCertificate = async (hotelId, templateId, domain) => {
  try {
    const { stdout } = await exec2(
      `sudo certbot certificates --domain ${domain}`
    );
    if (stdout.includes(`Certificate Name: ${domain}`)) {
      console.log("SSL certificate already exists.");
      return;
    }

    await exec2(`sudo certbot --nginx -d ${domain}`);
    console.log("SSL certificate installed successfully.");

    await exec2("sudo systemctl restart nginx");
    console.log("Nginx restarted with SSL.");
  } catch (error) {
    console.error("Error handling SSL certificate:", error);
  }
};
const addPublishDetails = async (
  hotelId,
  templateId,
  domain,
  pool,
  organization_id
) => {
  const publishDetails = {
    hotelId,
    templateId,
    domain,
  };
  try {
    const addedAlredy = await pool.query(
      "SELECT * FROM webtemplates WHERE hotelid = $1 AND templateid = $2",
      [hotelId, templateId]
    );

    if (!addedAlredy.rows.length > 0) {
      // console.log("Publish details already added");
      const data = await pool.query(
        "INSERT INTO webtemplates (hotelid, templateid, website) VALUES ($1, $2, $3)",
        [hotelId, templateId, domain]
      );
      console.log("Publish details added successfully");
    } else {
      console.log("Publish details already added");
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = router;
