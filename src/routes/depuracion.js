const express = require('express');
const router = express.Router();
const { eliminarRegistros } = require('../controllers/ctrl_depuracion');
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");

router.get('/depuracion', authenticate, authorize(["admin"]), (req, res) => {
    const success = req.query.success === 'true';
    const error = req.query.error === 'true';
    res.render('depuracion', { success, error });
});

router.post('/depuracion', authenticate, authorize(["admin"]), async (req, res) => {
    const { periodo } = req.body;
    try {
        await eliminarRegistros(periodo);
        res.redirect('/depuracion?success=true');
    } catch (err) {
        console.error(err);
        res.redirect('/depuracion?error=true');
    }
});

module.exports = router;
