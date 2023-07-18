import User from "../models/User.js";
import Video from "../models/Video.js";
import { createError } from "../error.js";



export const addVideo = async (req, res, next) => {
  // add to the object the userId of the user who uploaded the video (we got him from the verify jwt middlware)
  const newVideo = new Video({ userId: req.user.id, ...req.body });
  try {
    const savedVideo = await newVideo.save();
    res.status(200).json(savedVideo);
  } catch (err) {
    next(err);
  }
};


export const updateVideo = async (req, res, next) => {
  try {
    // check if the video exists
    const video = await Video.findById(req.params.id);
    if (!video) return next(createError(404, "Video not found!"));
    // check if the current user is the video's owner
    if (req.user.id === video.userId) {
      const updatedVideo = await Video.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      res.status(200).json(updatedVideo);
    } else {
      return next(createError(403, "You can update only your video!"));
    }
  } catch (err) {
    next(err);
  }
};


export const deleteVideo = async (req, res, next) => {
  try {
    // check if video exists
    const video = await Video.findById(req.params.id);
    if (!video) return next(createError(404, "Video not found!"));
    // check if the current user is the video's owner
    if (req.user.id === video.userId) {
      await Video.findByIdAndDelete(req.params.id);
      res.status(200).json("The video has been deleted.");
    } else {
      return next(createError(403, "You can delete only your video!"));
    }
  } catch (err) {
    next(err);
  }
};


export const getVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    res.status(200).json(video);
  } catch (err) {
    next(err);
  }
};


export const addView = async (req, res, next) => {
  try {
    await Video.findByIdAndUpdate(req.params.id, {
      $inc: { views: 1 },
    });
    res.status(200).json("The view has been increased.");
  } catch (err) {
    next(err);
  }
};


export const random = async (req, res, next) => {
  try {
    // this will return a 40 random videos
    const videos = await Video.aggregate([{ $sample: { size: 40 } }]);
    res.status(200).json(videos);
  } catch (err) {
    next(err);
  }
};


export const trend = async (req, res, next) => {
  try {
    // return the highest views count videos
    const videos = await Video.find().sort({ views: -1 });
    res.status(200).json(videos);
  } catch (err) {
    next(err);
  }
};


export const sub = async (req, res, next) => {
  try {
    // get the current user's subscribed channels
    const user = await User.findById(req.user.id);
    const subscribedChannels = user.subscribedUsers;

    // make a promise to find all the channels in the subscribed channels list
    // if you did it without promise it will give you array like this [request, request, ect...]
    const list = await Promise.all(
      // go to each channel (user) and get all its videos
      subscribedChannels.map(async (channelId) => {
        return await Video.find({ userId: channelId });
      })
    );

    // return the videos sorted by the latest first
    // we used the flat method because list is a nested array and we don't want this
    res.status(200).json(list.flat().sort((a, b) => b.createdAt - a.createdAt));
  } catch (err) {
    next(err);
  }
};


export const getByTag = async (req, res, next) => {
  const tags = req.query.tags.split(",");
  try {
    // get the videos that their tags includes the tags in the query
    const videos = await Video.find({ tags: { $in: tags } }).sort({ views: -1 }).limit(20);
    res.status(200).json(videos);
  } catch (err) {
    next(err);
  }
};


export const search = async (req, res, next) => {
  const query = req.query.q;
  try {
    // find videos that their title includes the query and the case (lowercase or upper) doesn't matter
    const videos = await Video.find({ 
      title: { 
        $regex: query, // find the title that has the query words not the exact word
        $options: "i"  // uppercase and lowercase don't matter  
      } 
    }).sort({ views: -1 }).limit(40);
    res.status(200).json(videos);
  } catch (err) {
    next(err);
  }
};


