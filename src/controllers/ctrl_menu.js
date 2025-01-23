const { query } = require('../database/db.js');
const path = require('path');
// const bcryptjs = require("bcryptjs");

exports.menu = (req, res) => {
  res.render('menu');
};
