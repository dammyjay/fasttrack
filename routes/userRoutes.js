const express = require("express");
const pool = require("../models/db");
const router = express.Router();
const userController = require("../controllers/userController");
const upload = require("../middlewares/upload");

router.post("/signup", upload.single("profile_picture"), userController.signup);
router.get("/signup", userController.showSignup);
router.post("/verify-otp", userController.verifyOtp);

router.get("/profile", userController.getUserProfile);
router.post(
  "/profile",
  upload.single("profile_picture"),
  userController.updateUserProfile
);

router.get("/vapid-public-key", (req, res) => {
  res.send(process.env.VAPID_PUBLIC_KEY);
});

router.post("/subscribe", async (req, res) => {
  const subscription = req.body;
  await pool.query(
    "INSERT INTO push_subscriptions (endpoint, keys) VALUES ($1, $2)",
    [subscription.endpoint, JSON.stringify(subscription.keys)]
  );
  res.sendStatus(201);
});

router.get("/register/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("SELECT * FROM events WHERE id = $1", [id]);
    const event = result.rows[0];

    // Add this line to pass login status to EJS
    const isLoggedIn = !!req.session.user; // or whatever property you use for login
    const profilePic = req.session.user
      ? req.session.user.profile_picture
      : null;
    
    let walletBalance = 0;
    if (req.session.user) {
      const walletResult = await pool.query(
        "SELECT wallet_balance2 FROM users2 WHERE email = $1",
        [req.session.user.email]
      );
      walletBalance = walletResult.rows[0]?.wallet_balance2 || 0;
    }

    const infoResult = await pool.query(
      "SELECT * FROM company_info ORDER BY id DESC LIMIT 1"
    );
    const info = infoResult.rows[0] || {};

    if (!event) return res.status(404).send("Event not found");

    res.render("registerEvent", {
      event,
      info,
      isLoggedIn,
      users: req.session.user,
      subscribed: req.query.subscribed,
      walletBalance
    });
  } catch (err) {
    console.error("Error loading event registration form:", err.message);
    res.status(500).send("Server error");
  }
});

router.post("/register/:id", async (req, res) => {
  const { id } = req.params;
  const {
    registrant_name,
    registrant_email,
    registrant_phone,
    is_parent,
    child_name,
  } = req.body;

  try {
    // Get event details
    const eventRes = await pool.query("SELECT * FROM events WHERE id = $1", [
      id,
    ]);
    const event = eventRes.rows[0];
    if (!event) return res.status(404).send("Event not found");

    // Create registration
    const regRes = await pool.query(
      `INSERT INTO event_registrations 
       (event_id, registrant_name, registrant_email, registrant_phone, is_parent, child_name, amount_paid)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        id,
        registrant_name,
        registrant_email,
        registrant_phone || null,
        is_parent === "on",
        child_name || null,
        event.amount || 0,
      ]
    );

    const registrationId = regRes.rows[0].id;

    if (event.is_paid) {
      // Redirect to event payment page
      return res.redirect(`/pay-event/${registrationId}`);
    } else {
      // Free event
      await pool.query(
        `UPDATE event_registrations SET payment_status = 'completed' WHERE id = $1`,
        [registrationId]
      );
      return res.redirect(`/events/${id}?registered=success`);
    }
  } catch (err) {
    console.error("Error registering for event:", err.message);
    res.status(500).send("Registration failed");
  }
});


module.exports = router;
