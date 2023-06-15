const express = require("express");
const { availableRooms } = require("../utils/user");
const router = express.Router();

router.get("/interests", (req, res) => {
  try {
    const interests = availableRooms();
    res.status(200).send(interests);
  } catch (err) {
    res.status(404).send("somthing went wrong");
  }
});
router.post("/createInterest", (req, res) => {
  try {
    const interests = availableRooms();
    const existingInterest = interests.findIndex(
      (value) => value === req.body?.roomName || req.body?.interest
    );
    if (!req.body?.roomName && existingInterest === -1) {
      throw { message: "You need to select a room", status: 403 };
    }
    if (!req.body?.interest && existingInterest !== -1) {
      throw { message: "This room is already in use", status: 403 };
    }
    res.status(200).send(interests);
  } catch (err) {
    res.status(err.status || 404).send(err);
  }
});
module.exports = router;
