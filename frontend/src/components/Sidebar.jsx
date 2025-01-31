import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";

const Sidebar = () => {
  ///Stores
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    isUsersLoading,
    updateSeenStatus,
    messages,
    allMessages,
    getAllMessages,
  } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();

  ///States
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  useEffect(() => {
    getAllMessages();
  }, [getAllMessages]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  function getUsersMessages(user) {
    setSelectedUser(user);
    // messages.map((mess) => {
    //   if (user._id === mess.senderId) {
    //     return;
    //   } else {
    //     mess.isMessageSeen = true;
    //   }
    // });

    // updateSeenStatus({ userId: user._id, authUserId: authUser._id });
  }

  function getLastMessage(id) {
    if (allMessages) {
      let text;
      const messArr = allMessages.filter((mess) => {
        if (
          (mess.senderId === authUser._id || mess.senderId === id) &&
          (mess.receiverId === authUser._id || mess.receiverId === id)
        ) {
          return mess;
        }
      });
      if (messArr.length > 0) {
        text = messArr[messArr.length - 1].text;
      } else {
        text = "";
      }

      return text;
    }
  }

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">
            ({onlineUsers.length - 1} online)
          </span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => getUsersMessages(user)}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${
                selectedUser?._id === user._id
                  ? "bg-base-300 ring-1 ring-base-300"
                  : ""
              }
            `}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePicture || "/avatar.png"}
                alt={user.name}
                className="size-12 object-cover rounded-full max-w-fit"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                />
              )}
            </div>

            {/* User info - only visible on larger screens */}
            <div className="hidden lg:block text-left min-w-0 w-full">
              <div className="flex items-center justify-between w-full">
                <div className="font-medium truncate">{user.fullName}</div>
                <div className="text-sm text-zinc-400">
                  {onlineUsers.includes(user._id) ? (
                    <p className="text-green-400">Online</p>
                  ) : (
                    "Offline"
                  )}
                </div>
              </div>

              <div className="flex">
                <p className="text-s text-cyan-500">
                  Last message: {getLastMessage(user._id)}
                </p>
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No online users</div>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;
