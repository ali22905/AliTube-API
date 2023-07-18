import mongoose from "mongoose";
import User from "../models/user.js";
import bcrypt from "bcryptjs";
import { createError } from "../error.js";
import jwt from "jsonwebtoken";


export const signup = async (req, res, next) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);
    const newUser = new User({ ...req.body, password: hash });

    await newUser.save();
    res.status(200).send("User has been created!");
  } catch (err) {
    next(err);
  }
};



export const signin = async (req, res, next) => {
  try {
    const user = await User.findOne({email: req.body.email});

    !user && next(createError(404, "user not found"))

    const isCorrect = await bcrypt.compare(req.body.password, user.password)

    !isCorrect && next(createError(400, "wrong credentials"))

    // auth with JWT
    const token = jwt.sign({id: user.id}, process.env.JWT)
    // remove the password from the user object before sending the cookie
    // the ._doc is to return just the user (try printing the user)
    const { password, ...others } = user._doc;
    // send the token to user
    res
    // make cookie
    .cookie("access_token", token, { httpOnly: true })
    // this is the rest of response not related to the cookie
    .status(200)
    .json(others);
  } catch (error) {
    console.log(error)
  }
}





export const googleAuth = async (req, res, next) => {
  try {
    // if there is a user with this google account
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT);
      res
        .cookie("access_token", token, {
          httpOnly: true,
        })
        .status(200)
        .json(user._doc);
    } else {
      const newUser = new User({
        ...req.body,
        fromGoogle: true,
      });
      const savedUser = await newUser.save();
      const token = jwt.sign({ id: savedUser._id }, process.env.JWT);
      res
        .cookie("access_token", token, {
          httpOnly: true,
        })
        .status(200)
        .json(savedUser._doc);
    }
  } catch (err) {
    next(err);
  }
};



export const logout = (res, req, next) => {
  res.cookie('access_token', 'none', {
    expires: new Date(Date.now() + 1 * 100),
    httpOnly: true,
  })
  res
  .status(200)
  .json({ success: true, message: 'User logged out successfully' })
}