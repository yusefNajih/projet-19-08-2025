const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Route pour créer un compte admin
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // Découper le nom en firstName/lastName si possible
    let firstName = name;
    let lastName = "";
    if (name.includes(" ")) {
      [firstName, ...rest] = name.split(" ");
      lastName = rest.join(" ");
    }
    const user = new User({
      username: email,
      email,
      password,
      firstName,
      lastName,
      role: "admin",
    });
    await user.save();
    res.status(201).json({ message: "Admin créé avec succès" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

module.exports = router;
