const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const requireAuth = (req, res, next) => {
  const token = req.cookies.authToken;
  console.log(token, "token");
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err) {
        return res.redirect(
          process.env.NODE_ENV === "development"
            ? "http://localhost:5173/login"
            : "https://auth.ceyinfo.cloud/login"
        );
      } else {
        console.log(decodedToken);
        req.tenant = decodedToken.organization;
        req.user = decodedToken.userId;
        req.propertyId = decodedToken.property_id;
        req.organization_id = decodedToken.organization_id;
        req.eid = decodedToken.employee_id;
        next();
      }
    });
  } else {
    res.redirect(
      process.env.NODE_ENV === "development"
        ? "http://localhost:5173/login"
        : "https://auth.ceyinfo.cloud/login"
    );
  }
};

module.exports = requireAuth;
