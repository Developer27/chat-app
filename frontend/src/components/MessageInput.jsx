import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, Smile, X } from "lucide-react";
import toast from "react-hot-toast";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

function MessageInput({ editingMessage, text, setText, setEditingMessage }) {
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage, editMessage, messages } = useChatStore();
  const [showEojiMenu, setShowEmojiMenu] = useState(false);
  const emojiMenuRef = useRef(null);

  useEffect(() => {
    let handler = (e) => {
      if (!emojiMenuRef.current?.contains(e.target)) {
        setShowEmojiMenu(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, [showEojiMenu]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
        isEdited: false,
        isMessageSeen: false,
      });

      setText("");
      setImagePreview(null);
      setShowEmojiMenu(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.log("Failed to send message", error);
    }
  };

  const handleEditMessage = async (e) => {
    e.preventDefault();

    try {
      const requestedMessage = messages.filter(
        (mess) => mess._id === editingMessage._id
      );

      editMessage(requestedMessage[0]._id, {
        editedText: text,
        senderId: requestedMessage[0].senderId,
        receiverId: requestedMessage[0].receiverId,
      });

      setText("");
      setEditingMessage(null);
      setShowEmojiMenu(false);
    } catch (error) {
      console.log("Failed to edit message", error);
    }
  };

  const addEmoji = (e) => {
    setText(text + e.native);
  };

  return (
    <div className="p-4 w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Image preview"
              className="size-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-base-300 flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}
      <form
        onSubmit={editingMessage ? handleEditMessage : handleSendMessage}
        className="flex items-center gap-2"
      >
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text ? text : ""}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageChange}
            />
            <span
              onClick={() => setShowEmojiMenu(true)}
              className="absolute bottom-2 right-3 hover:text-slate-500"
            >
              <Smile size={20} className="hover:grey-300 cursor-pointer" />
            </span>
            {showEojiMenu && (
              <div
                ref={emojiMenuRef}
                className="absolute bottom-[100%] right-20 z-40"
              >
                <Picker
                  data={data}
                  theme={"auto"}
                  emojiSize={20}
                  maxFrequentRows={0}
                  onEmojiSelect={addEmoji}
                />
              </div>
            )}
          </div>

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle ${
              imagePreview ? "text-ererald-500" : "text-zinc-400"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={!text?.trim() && !imagePreview}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
}

export default MessageInput;
