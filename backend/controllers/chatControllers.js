const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

// Create or fetch One-to-One Chat
const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    res.status(400);
    throw new Error("UserId param not sent with request");
  }

  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    return res.status(200).json(isChat[0]);
  }

  const chatData = {
    chatName: "sender",
    isGroupChat: false,
    users: [req.user._id, userId],
  };

  const createdChat = await Chat.create(chatData);
  const FullChat = await Chat.findById(createdChat._id)
    .populate("users", "-password")
    .populate("latestMessage");

  res.status(200).json(FullChat);
});

// Fetch all chats for a user
const fetchChats = asyncHandler(async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      res.status(401);
      throw new Error("Not authorized");
    }

    let results = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    // Populate latestMessage.sender only if exists
    results = await User.populate(results, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    res.status(200).json(results);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// Create new group chat
const createGroupChat = asyncHandler(async (req, res) => {
  const { users, name } = req.body;

  if (!users || !name) {
    res.status(400);
    throw new Error("Please fill all fields");
  }

  const parsedUsers = Array.isArray(users) ? users : JSON.parse(users);

  if (parsedUsers.length < 2) {
    res.status(400);
    throw new Error("More than 2 users are required to form a group chat");
  }

  // Push current user ID for admin
  parsedUsers.push(req.user._id);

  const groupChat = await Chat.create({
    chatName: name,
    users: parsedUsers,
    isGroupChat: true,
    groupAdmin: req.user._id,
  });

  const fullGroupChat = await Chat.findById(groupChat._id)
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  res.status(200).json(fullGroupChat);
});

// Rename group chat
const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { chatName },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat not found");
  }

  res.status(200).json(updatedChat);
});

// Remove user from group
const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat not found");
  }

  res.status(200).json(updatedChat);
});

// Add user to group
const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { $push: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat not found");
  }

  res.status(200).json(updatedChat);
});

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  removeFromGroup,
  addToGroup,
};
