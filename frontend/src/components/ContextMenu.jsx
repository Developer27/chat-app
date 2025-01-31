import { Check, Edit, Trash } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

function ContextMenu({ message, menuPosition, setEditingMessage, setText }) {
  const [menuVisible, setMenuVisible] = useState(false);
  // const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);
  const { authUser } = useAuthStore();

  const { deleteMessage, messages } = useChatStore();

  ///Close context menu when clicking outside
  useEffect(() => {
    let handler = (e) => {
      if (!menuRef.current.contains(e.target)) {
        setMenuVisible(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, [menuVisible]);

  const handleRightClick = (e) => {
    e.preventDefault();

    setMenuVisible(true);
  };

  function editMessageHandler() {
    const requestedMessage = messages.filter(
      (mess) => mess._id === message._id
    );

    if (authUser._id !== requestedMessage[0].senderId) {
      return;
    }

    setText(requestedMessage[0].text);
    setEditingMessage(requestedMessage[0]);
  }

  return (
    <div
      onContextMenu={handleRightClick}
      className="overflow-hidden h-full w-full z-10"
      ref={menuRef}
    >
      {menuVisible && (
        <ul
          className="h-[20%]- flex flex-col items-start  absolute list-none p-5 m-0 w-[200px] bg-neutral text-white gap-3 rounded-2xl"
          style={{
            top: `${menuPosition.y}px`,
            left: `${menuPosition.x}px`,
          }}
        >
          <li
            className={`flex items-center justify-center gap-2 cursor-pointer w-full hover:opacity-20`}
            onClick={() => {
              editMessageHandler();
            }}
          >
            <Edit size={20} />
            Edit
          </li>
          <li
            className="flex items-center justify-center gap-2 cursor-pointer w-full hover:opacity-20 "
            onClick={() => {
              deleteMessage({
                messageId: message._id,
                senderId: message.senderId,
                authUserId: authUser._id,
              });
            }}
          >
            <Trash size={20} />
            Delete
          </li>
        </ul>
      )}
      {message.image && (
        <img
          src={message.image}
          alt="Attachment"
          className="sm:max-w-[200px] rounded-md mb-2"
        />
      )}
      {message.text && <p>{message.text}</p>}
      <p className="text-xs w-full text-end">
        {message.isEdited ? "Edited" : ""}
      </p>
      {/* <div className="flex">
        <Check size={10} />
        {message.isMessageSeen && <Check size={10} />}
      </div> */}
    </div>
  );
}

export default ContextMenu;
