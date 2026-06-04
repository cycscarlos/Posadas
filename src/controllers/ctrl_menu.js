const { query } = require('../database/db.js');

exports.menu = (req, res) => {
  res.render('menu');
};
