const express = require("express");
const multer = require("multer");
const fs = require("fs/promises");
const path = require("path");
const fssync = require("fs");
const temp1 = express.Router();
const { exec } = require("child_process");

const dotenv = require("dotenv");
dotenv.config();

const webBookingURL = process.env.WEB_BOOKING_URL;

temp1.get("/site-details", async (req, res) => {
  const pool = req.tenantPool;
  const propertyId = req.property_id;

  const { templateId } = req.query;

  if (!propertyId || !templateId) {
    return res.status(400).json({
      message: "hotelId and templateId are required",
    });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM webtemplatedata WHERE hotelId = $1 AND templateId = $2",
      [propertyId, templateId]
    );
    if (result.rows.length === 0) {
      console.log("No site details found");
      return res.status(404).json({
        message: "No site details found please save site details",
      });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error loading site details:", err);
  }
});

temp1.get("/real-images", async (req, res) => {
  const pool = req.tenantPool;
  const propertyId = req.property_id;
  const organization_id = req.organization_id;

  const templateId = req.query?.templateId || "1";
  console.log(templateId, propertyId, organization_id);
  if (!propertyId || !templateId) {
    return res.status(400).json({
      message: "hotelId and templateId are required",
    });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM webtemplatedata WHERE hotelId = $1 AND templateId = $2",
      [propertyId, templateId]
    );
    if (result.rows.length === 0) {
      console.log("No site details found");
      return res.status(404).json({
        message: "No site details found please save site details",
      });
    }

    const realImages = result.rows[0].details?.realImages || {};
    const filePaths = realImages.filePaths || [];

    // Convert image paths to base64 strings
    const imagesWithBase64 = await Promise.all(
      filePaths.map(async (imagePath) => {
        try {
          const fullPath = path.join(
            `/var/www/template${templateId}/organization${organization_id}/property${propertyId}`,
            imagePath
          );

          const imageBuffer = await fs.readFile(fullPath);
          const base64String = imageBuffer.toString("base64");
          const ext = path.extname(imagePath).toLowerCase();
          const mimeType =
            ext === ".png"
              ? "image/png"
              : ext === ".jpg" || ext === ".jpeg"
              ? "image/jpeg"
              : "image/jpg";

          return {
            path: imagePath,
            base64: `data:${mimeType};base64,${base64String}`,
          };
        } catch (error) {
          console.error(`Error reading image ${imagePath}:`, error);
          return {
            path: imagePath,
            base64: null,
            error: "Failed to read image",
          };
        }
      })
    );

    console.log("Images converted to base64");

    res.status(200).json({
      success: true,
      data: {
        filePaths: filePaths,
        images: imagesWithBase64,
      },
      message: "Real images loaded successfully",
    });
  } catch (err) {
    console.error("Error loading site details:", err);
    res.status(500).json({
      success: false,
      message: "Error loading real images",
    });
  }
});

temp1.get("/hotel-info", async (req, res) => {
  try {
    const pool = req.tenantPool;
    const propertyId = req.property_id;

    const result = await pool.query(
      `SELECT 
        op.*,
        cc.name AS city,
        cp.name AS province,
        cco.name AS country
      FROM operation_property op
      LEFT JOIN core_data.core_city cc ON op.city_id = cc.id
      LEFT JOIN core_data.core_province cp ON op."Province_id" = cp.id
      LEFT JOIN core_data.core_country cco ON op.country_id = cco.id
      WHERE op.id = $1`,
      [propertyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "No hotel information found please add hotel information",
      });
    }
    const selectTags = `
      SELECT 
        core_data.core_tags.id AS tag_id,
        core_data.core_tags.name AS tag_name
      FROM operation_propertytag 
      INNER JOIN core_data.core_tags 
      ON operation_propertytag.tag_id = core_data.core_tags.id 
      WHERE property_id = $1
    `;
    const resultTags = await pool.query(selectTags, [propertyId]);

    const data = {
      ...result.rows[0],
      orgId: req.organization_id,
      tags: resultTags.rows.map((row) => ({
        tag_id: row.tag_id,
        tag_name: row.tag_name,
      })),
    };

    res.send({
      data: data,
      message: "Hotel information loaded successfully",
    });
  } catch (error) {
    console.log(error);
  }
});

temp1.post("/save-site-details", async (req, res) => {
  const pool = req.tenantPool;
  const propertyId = req.property_id;
  const {
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
    subContainerTitle,
    subContainerDescription,
    subContainerImage,
    footerDescription,
    facebookLink,
    bookingcomLink,
    tripadvisorLink,
    youtubeLink,
    privacyPolicy,
    termsCondition,
    logo,
    tags,
    locationdescription,
    city,
    otherServices,
  } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM operation_property WHERE id = $1",
      [propertyId]
    );
    console.log(result.rows);
    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "No hotel information found please add hotel information",
      });
    }

    const existingResult = await pool.query(
      "SELECT * FROM webtemplatedata WHERE hotelId = $1 AND templateId = $2",
      [propertyId, templateId]
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
            subContainerTitle,
            subContainerDescription,
            subContainerImage,
            footerDescription,
            facebookLink,
            bookingcomLink,
            tripadvisorLink,
            youtubeLink,
            privacyPolicy,
            termsCondition,
            logo,
            locationdescription,
            city,
            tags,
            otherServices,
          }),
          propertyId,
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
          propertyId,
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
            subContainerTitle,
            subContainerDescription,
            subContainerImage,
            footerDescription,
            facebookLink,
            bookingcomLink,
            tripadvisorLink,
            youtubeLink,
            privacyPolicy,
            termsCondition,
            logo,
            locationdescription,
            city,
            tags,
            otherServices,
          }),
        ]
      );

      if (insertResult.rows.length === 0) {
        return res.status(404).json({
          message: "No site details found",
        });
      }

      res.status(201).json({
        message: "Site details saved successfully",
        data: insertResult.rows[0],
      });
    }
  } catch (err) {
    console.error("Error saving site details:", err);
    res.status(500).json({
      message: "Error saving site details",
    });
  }
});

temp1.get("/build-template", async (req, res) => {
  const pool = req.tenantPool;
  const hotelId = req.property_id;
  const organization_id = req.organization_id;
  console.log(pool, hotelId, organization_id, "pool hotelid");
  const { templateId } = req.query;
  if (!hotelId || !templateId) {
    return res.status(404).json({
      message: "hotelId and templateId are required",
    });
  }

  try {
    const targetDir = `/var/www/template${templateId}/organization${organization_id}/property${hotelId}`;

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

    const tempIds = [2, 3];
    for (const tempId of tempIds) {
      try {
        console.log("Checking if template is already published");
        const alreadyPublish = await pool.query(
          "SELECT * FROM webtemplates WHERE hotelid = $1 AND templateid = $2",
          [hotelId, tempId]
        );

        if (alreadyPublish.rows.length > 0) {
          return res.status(400).json({
            message: `Template ${tempId} is already linked to the domain ${alreadyPublish.rows[0].website}.`,
          });
        }
        console.log("No template linked");
      } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
      }
    }

    const hotelURL = `${webBookingURL}?org_id=${organization_id}&p_id=${hotelId}`;

    let offerHtml = [];

    const resultOffer = await pool.query(
      "SELECT * FROM operation_hoteloffers WHERE property_id = $1 AND CURRENT_DATE BETWEEN startdate AND enddate",
      [hotelId]
    );
    if (resultOffer.rows?.length === 0) {
      offerHtml = [`<div class="text-center">No special offers found</div>`];
    } else {
      offerHtml = resultOffer.rows.map(
        (offer) => `
        <div class="d-flex justify-content-center align-items-center flex-wrap" style="margin-top: 30px;">
          <img src="${offer.offerimage}" alt="Offer Image" class="img-fluid" style="max-width: 700px; min-width: 700px; height: auto; object-fit: cover;">
          </div>
        `
      );
    }

    const privacyPolicyModel = `
<div class="modal fade" id="privacyPolicyModalOpen" tabindex="-1" aria-labelledby="privacyPolicyModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="privacyPolicyModalLabel">Privacy Policy</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <textarea readonly style="width: 100%; height: 300px; resize: none; border: none;">${
                  result.rows[0].details?.privacyPolicy ||
                  "No privacy policy available"
                }</textarea>
            </div>
        </div>
    </div>
</div>
`;

    const termsConditionModel = `
<div class="modal fade" id="termsConditionModalOpen" tabindex="-1" aria-labelledby="termsConditionModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="termsConditionModalLabel">Terms & Condition</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <textarea readonly style="width: 100%; height: 300px; resize: none; border: none;">${
                  result.rows[0].details?.termsCondition ||
                  "No terms and conditions available"
                }</textarea>
            </div>
        </div>
    </div>
</div>
`;

    const siteTags = result.rows[0].details?.tags
      ?.map((tagObj) => {
        return `<span class="px-4 py-2" style="border: 1px solid #333; font-size: 14px; color: #333;">${tagObj.tag_name}</span>`;
      })
      .join("\n");
    //  <table class="table table-bordered table-hover align-middle">
    //                       <tbody>
    //                           <tr v-for="(service, index) in otherServices" :key="index">
    //                               <template v-if="!service.isEditing">
    //                                   <td class="fw-bold fs-6 text-center">{{ service.serviceType }}</td>
    //                                   <td class="fs-6 text-center">{{ service.serviceDescription }}</td>
    //                               </template>
    //                           </tr>
    //                       </tbody>
    //                   </table>

    const otherServices = `<div class="table-responsive mt-5">
                        <table class="table table-bordered table-hover align-middle">
                            <tbody>
                                ${result.rows[0].details?.otherServices
                                  ?.map(
                                    (service) => `
                                    <tr>
                                        <td class="fw-bold fs-6 text-center">${service.serviceType}</td>
                                        <td class="fs-6 text-center">${service.serviceDescription}</td>\
                                    </tr>
                                `
                                  )
                                  .join("\n")}
                            </tbody>\
                        </table>\
                    </div>
    `;

    const details = result.rows[0].details;
    if (!details) {
      return res.status(404).json({
        message: "site details are invalid",
      });
    }

    const data = {
      "#hotelURL": hotelURL,
      "#siteTitle": details.title || "",
      "#siteEmail": details.email || "",
      "#sitePhoneNumber": details.phoneNumber || "",
      "#siteAboutUsImages1": details.aboutUsImages?.[0]?.src || "",
      "#siteAboutUsImages2": details.aboutUsImages?.[1]?.src || "",
      "#siteAboutUsImages3": details.aboutUsImages?.[2]?.src || "",
      "#siteAboutUsImages4": details.aboutUsImages?.[3]?.src || "",
      "#siteCarouselImages1": details.carouselImages?.[0]?.src || "",
      "#siteCarouselImages2": details.carouselImages?.[1]?.src || "",
      "#siteCarouselTitle1": details.carouselImages?.[0]?.carouselTitle || "",
      "#siteCarouselTitle2": details.carouselImages?.[1]?.carouselTitle || "",
      "#siteCarouselDescription1":
        details.carouselImages?.[0]?.carouselDescription || "",
      "#siteCarouselDescription2":
        details.carouselImages?.[1]?.carouselDescription || "",
      "#siteDescription": details.description || "",
      "#siteAddress": details.address || "",
      "#mapIframeHtml": details.mapIframeHtml || "",
      "#subContainerTitle": details.subContainerTitle || "",
      "#subContainerDescription": details.subContainerDescription || "",
      "#subContainerImage": details.subContainerImage || "",
      "#footerDescription": details.footerDescription || "",
      "#headerC": "#header-carousel",
      "#navbarCollapse": "#navbarCollapse",
      "#facebookLink": details.facebookLink || "#",
      "#bookingcomLink": details.bookingcomLink || "#",
      "#tripadvisorLink": details.tripadvisorLink || "#",
      "#youtubeLink": details.youtubeLink || "#",
      "#privacyModal": privacyPolicyModel,
      "#termsCondition": termsConditionModel,
      "#privacyPolicyModalOpen": "#privacyPolicyModalOpen",
      "#termsConditionModalOpen": "#termsConditionModalOpen",
      "#siteLogo": details.logo || "",
      "#siteLocationDescription": details.locationdescription || "",
      "#siteCity": details.city || "",
      "#fda01f": "#fda01f",
      "#sitetags": siteTags,
      "#offerHtml": offerHtml.join("\n"),
      "#otherServices": otherServices,
    };

    const getSiteName = await pool.query(
      "SELECT url FROM operation_property WHERE id = $1",
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
    try {
      await buildTemplate(data, hotelId, templateId, pool, organization_id);
      await buildTemplateAboutUs(
        data,
        hotelId,
        templateId,
        pool,
        organization_id
      );
      await buildTemplateGallery(
        result,
        hotelId,
        templateId,
        pool,
        organization_id
      );
      await buildTemplateContactUs(
        data,
        hotelId,
        templateId,
        pool,
        organization_id
      );
      await buildTemplateAttraction(
        result,
        hotelId,
        templateId,
        pool,
        organization_id
      );
      await buildTemplateHotelRooms(
        result,
        hotelId,
        templateId,
        pool,
        organization_id
      );
      await buildTemplateBooking(
        data,
        hotelId,
        templateId,
        pool,
        organization_id
      );
      await buildTemplateSpecialOffers(
        data,
        hotelId,
        templateId,
        pool,
        organization_id
      );
    } catch (buildError) {
      console.error("Error building templates:", buildError);
      return res.status(500).json({
        message: "Error building templates",
      });
    }

    try {
      await generateNginxConfig(hotelId, templateId, pool, organization_id);
    } catch (nginxError) {
      console.error("Error generating nginx config:", nginxError);
      // Note: Continue even if nginx fails, as templates are built
    }
    res.send({
      message: "Template built successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "server error please try again",
    });
  }
});

temp1.get("/hotel-offers", async (req, res) => {
  try {
    const pool = req.tenantPool;
    const hotelId = req.property_id;

    const result = await pool.query(
      "SELECT * FROM operation_hoteloffers WHERE property_id = $1 AND CURRENT_DATE BETWEEN startdate AND enddate",
      [hotelId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "No hotel offers found",
      });
    }

    res.send({
      data: result.rows,
      message: "successfully loaded hotel offers",
    });
  } catch (error) {
    console.log(error);
  }
});

const ensureDirectoryExistence = (dir) => {
  if (!fssync.existsSync(dir)) {
    fssync.mkdirSync(dir, { recursive: true });
  }
};

const ensureDirectoryExistence2 = async (
  dir,
  templateId,
  hotelId,
  organization_id
) => {
  if (!fssync.existsSync(dir)) {
    fssync.mkdirSync(dir, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const hotelId = req.property_id;
    const { templateId } = req.query;
    const organization_id = req.organization_id;

    const uploadDir = path.join(
      `/var/www/template${templateId}/organization${organization_id}/property${hotelId}/img`
    );
    ensureDirectoryExistence2(uploadDir, templateId, hotelId, organization_id);

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

temp1.post("/upload-images", upload.array("images", 10), async (req, res) => {
  try {
    const pool = req.tenantPool;
    const hotelId = req.property_id;
    const { templateId } = req.query;

    const dbGetResult = await pool.query(
      "SELECT details FROM webtemplatedata WHERE hotelId = $1 AND templateId = $2",
      [hotelId, templateId]
    );

    let previousFiles = [];

    if (dbGetResult.rows.length > 0) {
      previousFiles = dbGetResult.rows[0].details?.realImages?.filePaths || [];
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

    const combinedFilePaths = [...previousFiles, ...filePaths.map(getRealPath)];

    res.json({
      success: true,
      message: "Images uploaded successfully",
      images: {
        filePaths: combinedFilePaths,
      },
    });

    updateDataBase(hotelId, templateId, combinedFilePaths, pool);
  } catch (error) {
    console.error("Error uploading images:", error);
    res.status(500).json({ success: false, message: "Image upload failed" });
  }
});

temp1.delete("/remove-image", async (req, res) => {
  const pool = req.tenantPool;
  const hotelId = req.property_id;
  const organization_id = req.organization_id;
  try {
    const { templateId, imageName } = req.body;
    console.log(
      "hotelId",
      hotelId,
      "templateId",
      templateId,
      "imageName",
      imageName
    );
    const filePathTemp = path.join(
      `/var/www/vue-temp${templateId}/${imageName}`
    );
    const filePath = path.join(
      `/var/www/template${templateId}/organization${organization_id}/property${hotelId}/${imageName}`
    );
    console.log(filePath, filePathTemp);
    if (fssync.existsSync(filePath) && fssync.existsSync(filePathTemp)) {
      fssync.unlinkSync(filePath);
      fssync.unlinkSync(filePathTemp);
      console.log("Files deleted successfully:", filePath, filePathTemp);

      const dbGetResult = await pool.query(
        "SELECT details FROM webtemplatedata WHERE hotelId = $1 AND templateId = $2",
        [hotelId, templateId]
      );

      let previousFiles = [];

      if (dbGetResult.rows.length > 0) {
        previousFiles =
          dbGetResult.rows[0].details?.realImages?.filePaths || [];
      }

      previousFiles = previousFiles.filter((file) => file !== imageName);

      await updateDataBase(hotelId, templateId, previousFiles, pool);

      return res.json({
        success: true,
        message: "Images removed successfully",
      });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Image not found" });
    }
  } catch (error) {
    console.error("Error removing image:", error);
    return res
      .status(500)
      .json({ success: false, message: "Image removal failed" });
  }
});

temp1.get("/rooms-info", async (req, res) => {
  const pool = req.tenantPool;
  const hotelId = req.property_id;
  console.log("hotelId", hotelId);
  try {
    const result = await pool.query(
      `SELECT 
    op.view_id, 
    op.roomclass_id, 
    cv.roomview, 
    orc.custom_name, 
    orc.maxadultcount,
    orc.maxchildcount,
    MIN(orp.roprice) as roprice,
    ARRAY_AGG(DISTINCT op.roomno_text) AS room_numbers,
    ARRAY_AGG(DISTINCT orca.amenity_label) AS amenities,
    ARRAY_AGG(DISTINCT orci.imagename) AS images
FROM operation_rooms op
JOIN core_data.core_view cv ON op.view_id = cv.id
JOIN operation_roomreclass orc ON op.roomclass_id = orc.id
JOIN operation_roomprices orp ON orp.roomclass_id = op.roomclass_id
JOIN operation_hotelroompriceshedules ohps ON orp.shedule_id = ohps.id
LEFT JOIN operation_roomclass_amenities orca ON orca.room_class_id = op.roomclass_id
LEFT JOIN operation_roomclass_images orci ON orci.room_class_id = orc.id
LEFT JOIN operation_room_prices_web orpw ON orpw.schedule_id = ohps.id
WHERE 
    op.property_id = $1
    AND CURRENT_DATE BETWEEN orpw.from_date AND orpw.to_date
GROUP BY 
    op.view_id, 
    op.roomclass_id, 
    cv.roomview, 
    orc.custom_name, 
    orc.maxadultcount,
    orc.maxchildcount
ORDER BY op.view_id, op.roomclass_id;
`,
      [hotelId]
    );

    console.log("result", result.rows);

    if (result.rows.length === 0) {
      return res.status(404).send({
        message: "No rooms add to this hotel please add rooms",
      });
    }

    res.status(200).json({
      data: result.rows,
      message: "Rooms loaded successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error loading room details",
    });
  }
});

const buildTemplate = async (
  data,
  hotelId,
  templateId,
  pool,
  organization_id
) => {
  try {
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
    MIN(orp.roprice) as roprice,
    ARRAY_AGG(DISTINCT op.roomno_text) AS room_numbers,
    ARRAY_AGG(DISTINCT orca.amenity_label) AS amenities,
    ARRAY_AGG(DISTINCT orci.imagename) AS images
FROM operation_rooms op
JOIN core_data.core_view cv ON op.view_id = cv.id
JOIN operation_roomreclass orc ON op.roomclass_id = orc.id
JOIN operation_roomprices orp ON orp.roomclass_id = op.roomclass_id
JOIN operation_hotelroompriceshedules ohps ON orp.shedule_id = ohps.id
LEFT JOIN operation_roomclass_amenities orca ON orca.room_class_id = op.roomclass_id
LEFT JOIN operation_roomclass_images orci ON orci.room_class_id = orc.id
LEFT JOIN operation_room_prices_web orpw ON orpw.schedule_id = ohps.id
WHERE 
    op.property_id = $1
    AND CURRENT_DATE BETWEEN ohps.startdate AND ohps.enddate
GROUP BY 
    op.view_id, 
    op.roomclass_id, 
    cv.roomview, 
    orc.custom_name, 
    orc.maxadultcount,
    orc.maxchildcount
ORDER BY op.view_id, op.roomclass_id;
`,
      [hotelId]
    );

    const limitedRooms = rooms.rows.slice(0, 3);
    console.log("Roomsddd :", limitedRooms);

    const roomsHtml = limitedRooms
      .map((room, index) => {
        const validImages =
          room.images && Array.isArray(room.images)
            ? room.images.filter((img) => img !== null)
            : [];

        const hasMultipleImages = validImages.length > 1;
        const carouselId = `roomCarousel${index}`;

        //  <div class="d-flex mb-3">
        //    <small class="border-end me-3 pe-3">
        //      <i class="fa fa-h-square text-primary me-2"></i>Room No: $
        //      {room.room_numbers ? room.room_numbers.join(", ") : ""}
        //    </small>
        //  </div>;

        let imageHtml = "";
        if (validImages.length > 0) {
          imageHtml = `
            <div id="${carouselId}" class="carousel slide" data-bs-ride="carousel">
              <div class="carousel-inner">
                ${validImages
                  .map(
                    (img, imgIndex) => `
                  <div class="carousel-item ${imgIndex === 0 ? "active" : ""}">
                    <img class="img-fluid w-100" style="height: 250px; object-fit: cover;" 
                         src="${img}" 
                         alt="Room image ${imgIndex + 1}"
                         onerror="this.src='./img/room-1.jpg'">
                  </div>
                `
                  )
                  .join("")}
              </div>
              ${
                hasMultipleImages
                  ? `
                <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
                  <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                  <span class="visually-hidden">Previous</span>
                </button>
                <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
                  <span class="carousel-control-next-icon" aria-hidden="true"></span>
                  <span class="visually-hidden">Next</span>
                </button>
                <div class="carousel-indicators">
                  ${validImages
                    .map(
                      (img, imgIndex) => `
                    <button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="${imgIndex}" 
                            ${
                              imgIndex === 0
                                ? 'class="active" aria-current="true"'
                                : ""
                            } 
                            aria-label="Slide ${imgIndex + 1}"></button>
                  `
                    )
                    .join("")}
                </div>
              `
                  : ""
              }
            </div>
          `;
        } else {
          imageHtml = `<img class="img-fluid w-100" style="height: 250px; object-fit: cover;" src="./img/room-1.jpg" alt="Room image">`;
        }

        return `
      <div class="col-lg-4 col-md-6 wow fadeInUp">
        <div class="room-item shadow rounded overflow-hidden">
          <div class="position-relative">
            ${imageHtml}
            <small class="position-absolute start-0 top-100 translate-middle-y bg-primary text-white rounded py-1 px-3 ms-4">
                 Rs ${room.roprice.toLocaleString('en-US')} / lowest price
            </small>
          </div>
          <div class="p-4 mt-2">
            <div class="d-flex justify-content-between mb-3">
              <h6 class="mb-0"><b>${room.custom_name} / ${
          room.roomview
        }</b></h6>
              <div class="ps-2">
                ${[...Array(5)]
                  .map(() => `<small class="fa fa-star text-primary"></small>`)
                  .join("")}
              </div>
            </div>
           
<div class="d-flex mb-3">
              <small class="border-end me-3 pe-3">
                <i class="fa fa-h-square text-primary me-2"></i>No of Rooms: ${
                  room.room_numbers ? room.room_numbers.length : 0
                }
              </small>
             
            </div>
             ${
               room.amenities === null || room.amenities.length === 0
                 ? ""
                 : `<div class="d-flex flex-wrap gap-2 mb-3">
                    ${room.amenities
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
                  </div>`
             }
            <p class="text-body mb-3">Recommended for 2 adults</p>
            <div class="d-flex justify-content-center">
              <a class="btn btn-sm btn-dark rounded py-2 px-4" href="${webBookingURL}?org_id=${organization_id}&p_id=${hotelId}">Book Now</a>
            </div>
          </div>
        </div>
      </div>
    `;
      })
      .join("");
    const hotelURL = `${webBookingURL}?org_id=${organization_id}&p_id=${hotelId}`;

    const data2 = {
      ...data,
      "#rooms": roomsHtml,
    };

    const result = template.replace(
      /#\w+/g,
      (placeholder) => data2[placeholder] || ""
    );

    const outputPath = `/var/www/template${templateId}/organization${organization_id}/property${hotelId}/index.html`;
    await fs.writeFile(outputPath, result, "utf8");

    console.log("Template built successfully");
  } catch (error) {
    console.log(error);
  }
};

const buildTemplateAboutUs = async (
  data,
  hotelId,
  templateId,
  pool,
  organization_id
) => {
  const template = await fs.readFile(`./template/temp1/about.html`, "utf8");

  const result = template.replace(
    /#\w+/g,
    (placeholder) => data[placeholder] || ""
  );

  await fs.writeFile(
    `/var/www/template${templateId}/organization${organization_id}/property${hotelId}/about.html`,
    result,
    "utf8"
  );

  console.log("Template built successfully");
};

const buildTemplateGallery = async (
  result,
  hotelId,
  templateId,
  pool,
  organization_id
) => {
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
        return `<div class="image-item">
          <div class="image-wrapper">
            <img src="${image}" alt="Image ${i + idx + 1}" />
          </div>
        </div>`;
      })
      .join("");
    imageRows.push(`<div class="gallery-row">${rowHtml}</div>`);
  }

  const galleryHtml = imageRows.join("");
  const privacyPolicyModel = `
<div class="modal fade" id="privacyPolicyModalOpen" tabindex="-1" aria-labelledby="privacyPolicyModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="privacyPolicyModalLabel">Privacy Policy</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <textarea readonly style="width: 100%; height: 300px; resize: none; border: none;">${
                  result.rows[0].details.privacyPolicy ||
                  "No privacy policy available"
                }</textarea>
            </div>
        </div>
    </div>
</div>
`;

  const termsConditionModel = `
<div class="modal fade" id="termsConditionModalOpen" tabindex="-1" aria-labelledby="termsConditionModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="termsConditionModalLabel">Terms & Condition</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <textarea readonly style="width: 100%; height: 300px; resize: none; border: none;">${
                  result.rows[0].details.termsCondition ||
                  "No terms and conditions available"
                }</textarea>
            </div>
        </div>
    </div>
</div>
`;
  const data = {
    "#siteTitle": result.rows[0].details.title,
    "#siteEmail": result.rows[0].details.email,
    "#sitePhoneNumber": result.rows[0].details.phoneNumber,
    "#siteAddress": result.rows[0].details.address,
    "#galleryImages": galleryHtml,
    "#siteCarouselImages1": result.rows[0].details.carouselImages[0].src,
    "#footerDescription": result.rows[0].details.footerDescription,
    "#navbarCollapse": "#navbarCollapse",
    "#privacyModal": privacyPolicyModel,
    "#termsCondition": termsConditionModel,
    "#privacyPolicyModalOpen": "#privacyPolicyModalOpen",
    "#termsConditionModalOpen": "#termsConditionModalOpen",
    "#siteLogo": result.rows[0].details.logo || "",
  };

  const templatePath = `./template/temp${templateId}/gallery.html`;
  const template = await fs.readFile(templatePath, "utf8");

  const outputHtml = template.replace(
    /#\w+/g,
    (placeholder) => data[placeholder] || ""
  );

  const outputPath = `/var/www/template${templateId}/organization${organization_id}/property${hotelId}/gallery.html`;
  await fs.writeFile(outputPath, outputHtml, "utf8");

  console.log("Template built successfully");
};

const buildTemplateContactUs = async (
  data,
  hotelId,
  templateId,
  pool,
  organization_id
) => {
  const template = await fs.readFile(`./template/temp1/contact.html`, "utf8");

  const result = template.replace(
    /#\w+/g,
    (placeholder) => data[placeholder] || ""
  );

  await fs.writeFile(
    `/var/www/template${templateId}/organization${organization_id}/property${hotelId}/contact.html`,
    result,
    "utf8"
  );

  console.log("Template built successfully");
};

const buildTemplateBooking = async (
  data,
  hotelId,
  templateId,
  pool,
  organization_id
) => {
  const template = await fs.readFile(`./template/temp1/booking.html`, "utf8");

  const jsscript = `
<script>
  function otherParms() {
    let params = "";

    const hotelId = ${hotelId};
    const orgId = ${organization_id};

    const checkin = document.getElementById("checkin")?.value || "";
    const checkout = document.getElementById("checkout")?.value || "";
   

    params += \`&org_id=\${encodeURIComponent(orgId)}&\`;
    params += \`p_id=\${encodeURIComponent(hotelId)}\`;
    
    if (checkin) params += \`&checkin=\${encodeURIComponent(checkin)}\`;
    if (checkout) params += \`&checkout=\${encodeURIComponent(checkout)}\`;

    return params;
  }

  document.getElementById("bookingLink").addEventListener("click", function () {
    const baseUrl = "${webBookingURL}";
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
    `/var/www/template${templateId}/organization${organization_id}/property${hotelId}/booking.html`,
    result,
    "utf8"
  );

  console.log("Template built successfully");
};

const buildTemplateAttraction = async (
  result,
  hotelId,
  templateId,
  pool,
  organization_id
) => {
  try {
    const template = await fs.readFile(
      `./template/temp1/attraction.html`,
      "utf8"
    );

    const attractionList = result.rows[0]?.details?.attractionList || [];

    if (!Array.isArray(attractionList)) {
      throw new Error("attractionList is not an array or is undefined");
    }
    const privacyPolicyModel = `
<div class="modal fade" id="privacyPolicyModalOpen" tabindex="-1" aria-labelledby="privacyPolicyModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="privacyPolicyModalLabel">Privacy Policy</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <textarea readonly style="width: 100%; height: 300px; resize: none; border: none;">${
                  result.rows[0].details.privacyPolicy ||
                  "No privacy policy available"
                }</textarea>
            </div>
        </div>
    </div>
</div>
`;

    const termsConditionModel = `
<div class="modal fade" id="termsConditionModalOpen" tabindex="-1" aria-labelledby="termsConditionModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="termsConditionModalLabel">Terms & Condition</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <textarea readonly style="width: 100%; height: 300px; resize: none; border: none;">${
                  result.rows[0].details.termsCondition ||
                  "No terms and conditions available"
                }</textarea>
            </div>
        </div>
    </div>
</div>
`;
    const attractionListHtml =
      attractionList?.length > 0
        ? attractionList
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
            .join("")
        : "<p>No attractions available</p>";

    const data = {
      "#siteTitle": result.rows[0].details.title,
      "#siteEmail": result.rows[0].details.email,
      "#sitePhoneNumber": result.rows[0].details.phoneNumber,
      "#siteAddress": result.rows[0].details.address,
      "#attractionList": attractionListHtml,
      "#footerDescription": result.rows[0].details.footerDescription,
      "#siteCarouselImages1": result.rows[0].details.carouselImages[0].src,
      "#navbarCollapse": "#navbarCollapse",
      "#privacyModal": privacyPolicyModel,
      "#termsCondition": termsConditionModel,
      "#privacyPolicyModalOpen": "#privacyPolicyModalOpen",
      "#termsConditionModalOpen": "#termsConditionModalOpen",
      "#siteLogo": result.rows[0].details.logo || "",
    };

    const result1 = template.replace(
      /#\w+/g,
      (placeholder) => data[placeholder] || ""
    );

    await fs.writeFile(
      `/var/www/template${templateId}/organization${organization_id}/property${hotelId}/attraction.html`,
      result1,
      "utf8"
    );

    console.log("Template built successfully");
  } catch (error) {
    console.log(error);
  }
};

const updateDataBase = async (hotelId, templateId, filePaths, pool) => {
  try {
    const result = await pool.query(
      "SELECT details FROM webtemplatedata WHERE hotelId = $1 AND templateId = $2",
      [hotelId, templateId]
    );

    const newResult = {
      ...result.rows[0].details,
      realImages: { filePaths },
    };

    await pool.query(
      "UPDATE webtemplatedata SET details = $1 WHERE hotelId = $2 AND templateId = $3",
      [JSON.stringify(newResult), hotelId, templateId]
    );
  } catch (error) {}
};

const buildTemplateHotelRooms = async (
  result,
  hotelId,
  templateId,
  pool,
  organization_id
) => {
  try {
    const rooms = await pool.query(
      `SELECT 
    op.view_id, 
    op.roomclass_id, 
    cv.roomview, 
    orc.custom_name, 
    orc.maxadultcount,
    orc.maxchildcount,
    MIN(orp.roprice) as roprice,
    ARRAY_AGG(DISTINCT op.roomno_text) AS room_numbers,
    ARRAY_AGG(DISTINCT orca.amenity_label) AS amenities,
    ARRAY_AGG(DISTINCT orci.imagename) AS images
FROM operation_rooms op
JOIN core_data.core_view cv ON op.view_id = cv.id
JOIN operation_roomreclass orc ON op.roomclass_id = orc.id
JOIN operation_roomprices orp ON orp.roomclass_id = op.roomclass_id
JOIN operation_hotelroompriceshedules ohps ON orp.shedule_id = ohps.id
LEFT JOIN operation_roomclass_amenities orca ON orca.room_class_id = op.roomclass_id
LEFT JOIN operation_roomclass_images orci ON orci.room_class_id = orc.id
LEFT JOIN operation_room_prices_web orpw ON orpw.schedule_id = ohps.id
WHERE 
    op.property_id = $1
    AND CURRENT_DATE BETWEEN ohps.startdate AND ohps.enddate
GROUP BY 
    op.view_id, 
    op.roomclass_id, 
    cv.roomview, 
    orc.custom_name, 
    orc.maxadultcount,
    orc.maxchildcount
ORDER BY op.view_id, op.roomclass_id;`,
      [hotelId]
    );

    console.log("Rooms ss:", rooms.rows);
    const privacyPolicyModel = `
<div class="modal fade" id="privacyPolicyModalOpen" tabindex="-1" aria-labelledby="privacyPolicyModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="privacyPolicyModalLabel">Privacy Policy</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <textarea readonly style="width: 100%; height: 300px; resize: none; border: none;">${
                  result.rows[0].details.privacyPolicy ||
                  "No privacy policy available"
                }</textarea>
            </div>
        </div>
    </div>
</div>
`;

    const termsConditionModel = `
<div class="modal fade" id="termsConditionModalOpen" tabindex="-1" aria-labelledby="termsConditionModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="termsConditionModalLabel">Terms & Condition</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <textarea readonly style="width: 100%; height: 300px; resize: none; border: none;">${
                  result.rows[0].details.termsCondition ||
                  "No terms and conditions available"
                }</textarea>
            </div>
        </div>
    </div>
</div>
`;
    const roomsHtml = rooms.rows
      .map((room, index) => {
        const validImages =
          room.images && Array.isArray(room.images)
            ? room.images.filter((img) => img !== null)
            : [];

        const hasMultipleImages = validImages.length > 1;
        const carouselId = `roomCarouselPage${index}`;

        let imageHtml = "";
        if (validImages.length > 0) {
          imageHtml = `
            <div id="${carouselId}" class="carousel slide" data-bs-ride="carousel">
              <div class="carousel-inner">
                ${validImages
                  .map(
                    (img, imgIndex) => `
                  <div class="carousel-item ${imgIndex === 0 ? "active" : ""}">
                    <img class="img-fluid w-100" style="height: 250px; object-fit: cover;" 
                         src="${img}" 
                         alt="Room image ${imgIndex + 1}"
                         onerror="this.src='./img/room-1.jpg'">
                  </div>
                `
                  )
                  .join("")}
              </div>
              ${
                hasMultipleImages
                  ? `
                <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
                  <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                  <span class="visually-hidden">Previous</span>
                </button>
                <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
                  <span class="carousel-control-next-icon" aria-hidden="true"></span>
                  <span class="visually-hidden">Next</span>
                </button>
                <div class="carousel-indicators">
                  ${validImages
                    .map(
                      (img, imgIndex) => `
                    <button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="${imgIndex}" 
                            ${
                              imgIndex === 0
                                ? 'class="active" aria-current="true"'
                                : ""
                            } 
                            aria-label="Slide ${imgIndex + 1}"></button>
                  `
                    )
                    .join("")}
                </div>
              `
                  : ""
              }
            </div>
          `;
        } else {
          imageHtml = `<img class="img-fluid w-100" style="height: 250px; object-fit: cover;" src="./img/room-1.jpg" alt="Room image">`;
        }

        return `
      <div class="col-lg-4 col-md-6 wow fadeInUp">
        <div class="room-item shadow rounded overflow-hidden">
          <div class="position-relative">
            ${imageHtml}
            <small class="position-absolute start-0 top-100 translate-middle-y bg-primary text-white rounded py-1 px-3 ms-4">
                Rs ${room.roprice.toLocaleString('en-US')} / lowest price
            </small>
          </div>
          <div class="p-4 mt-2">
            <div class="d-flex justify-content-between mb-3">
              <h6 class="mb-0"><b>${room.custom_name} / ${
          room.roomview
        }</b></h6>
              <div class="ps-2">
                ${[...Array(5)]
                  .map(() => `<small class="fa fa-star text-primary"></small>`)
                  .join("")}
              </div>
            </div>
            <div class="d-flex mb-3">
              <small class="border-end me-3 pe-3">
                <i class="fa fa-h-square text-primary me-2"></i>No of Rooms: ${
                  room.room_numbers ? room.room_numbers.length : 0
                }
              </small>             
            </div>

            ${
              room.amenities === null || room.amenities.length === 0
                ? ""
                : `<div class="d-flex flex-wrap gap-2 mb-3">
                    ${room.amenities
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
                  </div>`
            }
            <p class="text-body mb-3">Recommended for 2 adults</p>
            <div class="d-flex justify-content-center">
              <a class="btn btn-sm btn-dark rounded py-2 px-4" href="${webBookingURL}?org_id=${organization_id}&p_id=${hotelId}">Book Now</a>
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
      "#siteCarouselImages1": result.rows[0].details.carouselImages[0].src,
      "#footerDescription": result.rows[0].details.footerDescription,
      "#navbarCollapse": "#navbarCollapse",
      "#privacyModal": privacyPolicyModel,
      "#termsCondition": termsConditionModel,
      "#privacyPolicyModalOpen": "#privacyPolicyModalOpen",
      "#termsConditionModalOpen": "#termsConditionModalOpen",
      "#siteLogo": result.rows[0].details.logo || "",
    };

    const templatePath = `./template/temp${templateId}/room.html`;

    const template = await fs.readFile(templatePath, "utf8");

    const outputHtml = template.replace(
      /#\w+/g,
      (placeholder) => data[placeholder] || ""
    );

    const outputPath = `/var/www/template${templateId}/organization${organization_id}/property${hotelId}/room.html`;

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

const buildTemplateSpecialOffers = async (
  data,
  hotelId,
  templateId,
  pool,
  organization_id
) => {
  try {
    const templatePath = `./template/temp${templateId}/specialOffers.html`;
    const template = await fs.readFile(templatePath, "utf8");

    const result = await pool.query(
      "SELECT * FROM operation_hoteloffers WHERE property_id = $1 AND CURRENT_DATE BETWEEN startdate AND enddate",
      [hotelId]
    );

    if (result.rows.length === 0) {
      console.log("No special offers found");
      return;
    }

    const offersHtml = result.rows;

    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };
    //  <div class="d-flex justify-content-center align-items-center flex-wrap" style="margin-top: 30px;"
    //                     v-for="offer in offers" :key="offer.id">
    //                     <img :src="'img/' + offer.offerimage" alt="Offer Image" class="img-fluid"
    //                         style="max-width: 700px; height: auto; object-fit: cover;">
    //                 </div>
    const offersHtml2 = offersHtml.map(
      (offer) => `
      <div class="d-flex justify-content-center align-items-center flex-wrap" style="margin-top: 30px;">
        <img src="${offer.offerimage}" alt="Offer Image" class="img-fluid" style="max-width: 700px; min-width: 700px; height: auto; object-fit: cover;">
        </div>
      `
    );

    const data2 = {
      ...data,
      "#offers": offersHtml2.join(""),
    };

    const outputHtml = template.replace(
      /#\w+/g,
      (placeholder) => data2[placeholder] || ""
    );

    const outputPath = `/var/www/template${templateId}/organization${organization_id}/property${hotelId}/specialOffers.html`;
    await fs.writeFile(outputPath, outputHtml, "utf8");

    console.log("Template built successfully");
  } catch (error) {
    console.error("Error building template:", error);
  }
};
const generateNginxConfig = async (
  hotelId,
  templateId,
  pool,
  organization_id
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

    const domain = rows[0].url.replace(/https?:\/\//, "").replace(/\/$/, "");
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
const util = require("util");
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

temp1.post("/remove-site", async (req, res) => {
  const pool = req.tenantPool;
  const hotelId = req.property_id;
  const organization_id = req.organization_id;
  const { temp } = req.body;
  try {
    // await pool.query(
    //   "DELETE FROM webtemplatedata WHERE hotelId = $1 AND templateId = $2",
    //   [hotelId, temp.templateid]
    // );
    await pool.query(
      "DELETE FROM webtemplates WHERE hotelid = $1 AND templateid = $2",
      [hotelId, temp.templateid]
    );

    const nginxConfigPath = `/etc/nginx/sites-available/${temp.website}.conf`;
    const nginxEnabledPath = `/etc/nginx/sites-enabled/${temp.website}.conf`;

    if (fssync.existsSync(nginxEnabledPath)) {
      fssync.unlinkSync(nginxEnabledPath);
    }

    if (fssync.existsSync(nginxConfigPath)) {
      fssync.unlinkSync(nginxConfigPath);
      await exec("sudo systemctl restart nginx");
    }

    const sourceDir = `/var/www/template${temp.templateid}/organization${organization_id}/property${hotelId}`;

    if (fssync.existsSync(sourceDir)) {
      fssync.rmdirSync(sourceDir, { recursive: true });
    }

    await exec(
      `sudo rm -rf /var/www/template${temp.templateid}/organization${organization_id}/property${hotelId}`
    );

    await exec(`sudo certbot delete --cert-name ${temp.website}`);

    console.log("Site deleted successfully");

    return res.status(200).json({ message: "site deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = temp1;
