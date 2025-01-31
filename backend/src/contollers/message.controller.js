import cloudinary from "../lib/cloudinary.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getUsersForSideBar:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find({});
    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, isEdited, isMessageSeen } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      isEdited,
      isMessageSeen,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("NewMessage", newMessage);
      io.to(receiverSocketId).emit("LastMessageChanged", "send", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    const messageRequested = await Message.findById(messageId);
    const { authUserId } = req.body;
    let senderId = messageRequested.senderId;
    let receiverId = messageRequested.receiverId;
    if (receiverId.toString() === authUserId) {
      receiverId = messageRequested.senderId;
    }
    if (senderId.toString() !== authUserId) {
      senderId = authUserId;
    }
    // const senderId = messageRequested.senderId;

    if (!messageRequested) {
      return res.status(404).json({ message: "Message not found" });
    }

    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("MessageDeleted", {
        messageId,
        senderId,
      });
      io.to(receiverSocketId).emit("LastMessageChanged", "delete", {
        messageId,
        senderId,
      });
    }

    await Message.findByIdAndDelete(messageId);

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.log("Error in deleteMessage controller", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const editMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    const { editedText, senderId, receiverId } = req.body;
    const messageRequested = await Message.findById(messageId);

    if (!messageRequested) {
      return res.status(404).json({ message: "Message not found" });
    }

    await Message.findByIdAndUpdate(messageId, {
      text: editedText,
      isEdited: true,
    });

    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("MessageEdited", {
        editedText,
        senderId,
        messageId,
      });
    }
    res.status(200).json({ message: "Message edited successfully" });
  } catch (error) {
    console.log("Error in editMessage controller", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateMessageStatus = async (req, res) => {
  console.log(req.body);
  try {
    const { userId, authUserId } = req.body;
    // await Message.updateMany(
    //   {
    //     senderId: authUserId || userId,
    //     receiverId: userId || authUserId,
    //   },
    //   {
    //     isMessageSeen: true,
    //   }
    // );
  } catch (error) {
    console.log("Error in updateMessageStatus controller", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
