const { query } = require("../database/db.js");
const path = require("path");

// logout utilizando express-session
exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect("/");
//  res.redirect("/login");
};
