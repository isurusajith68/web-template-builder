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
  const pool = req.tenantPool;
  const propertyId = req.propertyId;
  console.log(req.propertyId);
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
  const hotelId = req.propertyId;
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

  try {
    //copy hotel image folder
    const sourceDir = path.resolve(
      __dirname,
      "/var/images/organization" + organization_id + "/property" + hotelId
    );
    const targetDir = `/var/www/template${templateId}/organization${organization_id}/property${hotelId}/img`;

    await fs.mkdir(targetDir, { recursive: true });
    await fs.cp(sourceDir, targetDir, { recursive: true });
  } catch (error) {
    console.error("Error copying hotel images:", error);
  }

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
    `
     SELECT 
      htrm.property_id,
      htrm.view_id,
      htrm.roomclass_id,
      htrm.roomno_text,
      hrv.roomview AS roomview,
      crt.room_type AS roomtype,
      SUM(orb.count) as noofbed,
      hrp.fbprice,
      COALESCE(ARRAY_AGG(DISTINCT amn.amenity_label) FILTER (WHERE amn.amenity_label IS NOT NULL), '{}') AS roomamenities,
      COALESCE(ARRAY_AGG(DISTINCT ri.imagename) FILTER (WHERE ri.imagename IS NOT NULL), '{}') AS imagenames
  FROM 
      operation_rooms htrm
  JOIN 
      operation_roomreclass hrt ON htrm.roomclass_id = hrt.id
  JOIN
      operation_roombeds orb ON htrm.id = orb.room_id
  JOIN 
      core_roomcomfort cr ON hrt.roomcomfort_id = cr.id
  JOIN
      core_view hrv ON htrm.view_id = hrv.id
  LEFT JOIN
      core_roomtypes crt ON hrt.roomtype_id = crt.id
  JOIN 
      operation_roomprices hrp ON htrm.id = hrp.room_id
  LEFT JOIN
      operation_roomamenities amn ON amn.room_id = htrm.id  -- FIXED JOIN
  LEFT JOIN 
      operation_roomimages ri ON htrm.id = ri.room_id
  WHERE 
      htrm.property_id = $1
  GROUP BY 
      htrm.property_id, 
      htrm.view_id, 
      htrm.roomclass_id, 
      htrm.roomno_text,
      hrv.roomview,
      crt.room_type,
      hrp.fbprice;
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
                   <img src="${
                     room.imagenames
                       ? "img/" + room.imagenames[0]
                       : "img/rooms/1.png"
                   }" alt="" style="min-height: 400px; max-height: 400px; ">
                    <div class="room_heading d-flex justify-content-between align-items-center" style="background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 100%); height: 200px; width: 100%;">
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
                       <a href="https://webbookings.ceyinfo.cloud?hotelId=${hotelId}" class="line-button">book now</a>
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
  const hotelURL = `https://webbookings.ceyinfo.cloud?hotelId=${hotelId}`;

  // <script>
  //     document.addEventListener("DOMContentLoaded", function () {
  //         const checkInDate = document.getElementById("datepicker");
  //         const checkOutDate = document.getElementById("datepicker2");
  //         const hotelId = new URLSearchParams(window.location.search).get("hotelId");

  //         const bookRoomButton = document.getElementById("book-room");

  //         bookRoomButton.addEventListener("click", function (event) {
  //             event.preventDefault();

  //             window.location.href = `https://webbookings.ceyinfo.cloud/?hotelId=${hotelId}&checkin=${checkInDate.value}&checkout=${checkOutDate.value}`;
  //         });
  //     });
  // </script>

  const bookScript = `<script>
    document.addEventListener("DOMContentLoaded", function () {
        const checkInDate = document.getElementById("datepicker");
        const checkOutDate = document.getElementById("datepicker2");
        const hotelId = ${hotelId};

        const bookRoomButton = document.getElementById("book-room");

        bookRoomButton.addEventListener("click", function (event) {
            event.preventDefault();
            window.location.href = \`https://webbookings.ceyinfo.cloud/?hotelId=\${hotelId}&checkin=\${checkInDate.value}&checkout=\${checkOutDate.value}\`;
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
    "SELECT * FROM operation_hoteloffers WHERE hotelid = $1",
    [hotelId]
  );

  const offersHtml = offer.rows;

  const offersHtml2 = offersHtml.map(
    (offer) => `
      <div class="d-flex justify-content-center align-items-center flex-wrap" style="margin-top: 30px;">
        <img src="img/${offer.offerimage}" alt="Offer Image" class="img-fluid" style="max-width: 700px; min-width: 700px; height: auto; object-fit: cover;">
        </div>
      `
  );

  const rooms = await pool.query(
    `
       SELECT 
      htrm.property_id,
      htrm.view_id,
      htrm.roomclass_id,
      htrm.roomno_text,
      hrv.roomview AS roomview,
      crt.room_type AS roomtype,
      SUM(orb.count) as noofbed,
      hrp.fbprice,
      COALESCE(ARRAY_AGG(DISTINCT amn.amenity_label) FILTER (WHERE amn.amenity_label IS NOT NULL), '{}') AS roomamenities,
      COALESCE(ARRAY_AGG(DISTINCT ri.imagename) FILTER (WHERE ri.imagename IS NOT NULL), '{}') AS imagenames
  FROM 
      operation_rooms htrm
  JOIN 
      operation_roomreclass hrt ON htrm.roomclass_id = hrt.id
  JOIN
      operation_roombeds orb ON htrm.id = orb.room_id
  JOIN 
      core_roomcomfort cr ON hrt.roomcomfort_id = cr.id
  JOIN
      core_view hrv ON htrm.view_id = hrv.id
  LEFT JOIN
      core_roomtypes crt ON hrt.roomtype_id = crt.id
  JOIN 
      operation_roomprices hrp ON htrm.id = hrp.room_id
  LEFT JOIN
      operation_roomamenities amn ON amn.room_id = htrm.id  -- FIXED JOIN
  LEFT JOIN 
      operation_roomimages ri ON htrm.id = ri.room_id
  WHERE 
      htrm.property_id = $1
  GROUP BY 
      htrm.property_id, 
      htrm.view_id, 
      htrm.roomclass_id, 
      htrm.roomno_text,
      hrv.roomview,
      crt.room_type,
      hrp.fbprice;
      `,
    [hotelId]
  );
  {
  }

  const roomsHtml = rooms.rows
    .map((room) => {
      return `<div class="single_rooms">
                <div class="room_thumb  ">
                  <img src="${
                    room.imagenames
                      ? "img/" + room.imagenames[0]
                      : "img/rooms/1.png"
                  }" alt="" style="min-height: 400px; max-height: 400px; ">
                    <div class="room_heading d-flex justify-content-between align-items-center" style="background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 100%); height: 200px; width: 100%;">
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
                       <a href="https://webbookings.ceyinfo.cloud?hotelId=${hotelId}" class="line-button">book now</a>
                       </div>
                </div>
            </div>`;
    })
    .join("");
  const hotelURL = `https://webbookings.ceyinfo.cloud?hotelId=${hotelId}`;

  const bookScript = `<script>
    document.addEventListener("DOMContentLoaded", function () {
        const checkInDate = document.getElementById("datepicker");
        const checkOutDate = document.getElementById("datepicker2");
        const hotelId = ${hotelId};

        const bookRoomButton = document.getElementById("book-room");

        bookRoomButton.addEventListener("click", function (event) {
            event.preventDefault();
            window.location.href = \`https://webbookings.ceyinfo.cloud/?hotelId=\${hotelId}&checkin=\${checkInDate.value}&checkout=\${checkOutDate.value}\`;
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

        const bookRoomButton = document.getElementById("book-room");

        bookRoomButton.addEventListener("click", function (event) {
            event.preventDefault();
            window.location.href = \`https://webbookings.ceyinfo.cloud/?hotelId=\${hotelId}&checkin=\${checkInDate.value}&checkout=\${checkOutDate.value}\`;
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

        const bookRoomButton = document.getElementById("book-room");

        bookRoomButton.addEventListener("click", function (event) {
            event.preventDefault();
            window.location.href = \`https://webbookings.ceyinfo.cloud/?hotelId=\${hotelId}&checkin=\${checkInDate.value}&checkout=\${checkOutDate.value}\`;
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

const { exec } = require("child_process");

const generateNginxConfig = async (
  hotelId,
  templateId,
  organization_id,
  pool
) => {
  const getSiteName = await pool.query(
    "SELECT url FROM operation_property WHERE id = $1",
    [hotelId]
  );
  const domain = getSiteName.rows[0].url
    .replace(/https?:\/\//, "")
    .replace(/\/$/, "");

  const nginxFileExist = fssync.existsSync(
    `/etc/nginx/sites-available/template${templateId}-organization${organization_id}-property${hotelId}.conf`
  );

  if (nginxFileExist) {
    return console.log("nginx file exist");
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

  const configPath = `/etc/nginx/sites-available/template${templateId}-organization${organization_id}-property${hotelId}.conf`;

  fssync.writeFileSync(configPath, nginxConfig);

  exec(
    `sudo ln -s ${configPath} /etc/nginx/sites-enabled/`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log("nginx fireeeee");
      exec("sudo systemctl restart nginx", (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        console.log("nginx file successfully created");
        addPublishDetails(hotelId, templateId, domain, pool, organization_id);

        addSslCertificate(hotelId, templateId, domain, pool, organization_id);
      });
    }
  );
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
        "INSERT INTO webtemplates (hotelid, templateid, website, organizationid) VALUES ($1, $2, $3, $4)",
        [hotelId, templateId, domain, organization_id]
      );
      console.log("Publish details added successfully");
    } else {
      console.log("Publish details already added");
    }
  } catch (error) {
    console.log(error);
  }
};

// // add ssl certificate

const addSslCertificate = (
  hotelId,
  templateId,
  domain,
  pool,
  organization_id
) => {
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

module.exports = router;
