const express = require("express");

const temp1 = express.Router();

temp1.get("/site-details", async (req, res) => {
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
      console.log("No site details found");
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error loading site details:", err);
  }
});

temp1.get("/hotel-info", async (req, res) => {
  try {
    const pool = req.tenantPool;
    const propertyId = req.propertyId;

    const result = await pool.query(
      "SELECT * FROM opreation_property WHERE id = $1",
      [propertyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "No hotel information found please add hotel information",
      });
    }

    res.send({
      data: result.rows[0],
      message: "Hotel information loaded successfully",
    });
  } catch (error) {
    console.log(error);
  }
});

temp1.post("/save-site-details", async (req, res) => {
  const pool = req.tenantPool;
  const propertyId = req.propertyId;
  console.log(propertyId);

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
  } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM opreation_property WHERE id = $1",
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

module.exports = temp1;
