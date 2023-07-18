import express from "express";
import {
  update,
  deleteUser,
  getUser,
  subscribe,
  unsubscribe,
  like,
  dislike,
} from "../controllers/user.js";
import { verifyToken } from "../verifyToken.js";

const router = express.Router();



//update user
// when you head to this link it will make the verify token function first and if everything is ok it will send you the user as req.body
router.put("/:id", verifyToken, update);

//delete user
router.delete("/:id", verifyToken, deleteUser);

//get a user
router.get("/find/:id", getUser);

//subscribe a user (the id is the id of the channel you want to subscribe)
router.put("/sub/:id", verifyToken, subscribe);

//unsubscribe a user (the id is the id of the channel you want to unsubscribe)
router.put("/unsub/:id", verifyToken, unsubscribe);

//like a video
router.put("/like/:videoId", verifyToken, like);

//dislike a video
router.put("/dislike/:videoId", verifyToken, dislike);








export default router;
