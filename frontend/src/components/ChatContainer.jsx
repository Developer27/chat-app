import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import ContextMenu from "./ContextMenu";

function ChatContainer() {
  ////Stores
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    // updateSeenStatus,
  } = useChatStore();
  const { authUser } = useAuthStore();

  ///Refs
  let messageEndRef = useRef([]);

  ///States
  const [editingMessage, setEditingMessage] = useState();
  const [text, setText] = useState("");
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const filteredRefs = messageEndRef.current.filter((ref) => ref != null);

    if (filteredRefs[filteredRefs.length - 1] && messages) {
      filteredRefs[filteredRefs.length - 1].scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [messages, menuPosition]);

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    // setTimeout(() => {
    //   updateSeenStatus({
    //     userId: selectedUser._id,
    //     authUserId: authUser._id,
    //   });
    // }, 1000);

    return () => unsubscribeFromMessages();
  }, [
    selectedUser._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
    // updateSeenStatus,
    // authUser._id,
  ]);

  if (isMessagesLoading)
    return (
      <div className="flex-1 flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );

  function watchMousePos(e) {
    e.preventDefault();
    if (!messageEndRef.current[0]) return;
    let bounds = messageEndRef.current[0].getBoundingClientRect();
    let containerWidth = messageEndRef.current[0].getBoundingClientRect().width;
    let x = e.clientX - bounds.left;

    if (x + 200 > containerWidth) {
      setMenuPosition({
        x: -100,
        y: 10,
      });
    } else {
      setMenuPosition({ x: 10, y: 10 });
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={message._id}
            className={`chat ${
              message.senderId === authUser._id ? "chat-end" : "chat-start"
            }`}
            ref={(ref) => {
              messageEndRef.current[index] = ref;
            }}
            onContextMenu={watchMousePos}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePicture || "/avatar.png"
                      : selectedUser.profilePicture || "/avatar.png"
                  }
                  alt="Profile picture"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col box-border">
              <ContextMenu
                message={message}
                bubbleChatRef={messageEndRef}
                menuPosition={menuPosition}
                setEditingMessage={setEditingMessage}
                editingMessage={editingMessage}
                setText={setText}
                text={text}
              />
              {/* {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>} */}
            </div>
          </div>
        ))}
      </div>
      <MessageInput
        text={text}
        setText={setText}
        editingMessage={editingMessage}
        setEditingMessage={setEditingMessage}
      />
    </div>
  );
}

export default ChatContainer;
