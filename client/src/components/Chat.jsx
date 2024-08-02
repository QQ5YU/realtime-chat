import { useContext, useEffect, useState, useRef } from "react";
import { UserContext } from "../contexts/UserContext";
import { uniqBy } from "lodash";
import axiosInstance from "../axiosInstance";
import { Contact } from "./Contact";
import Logo from "./Logo";

export default function Chat() {
  const [ws, setWs] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [offlineUsers, setOfflineUsers] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newMessageText, setNewMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const { username, id, setId, setUsername } = useContext(UserContext);
  const divUnderMessage = useRef();

  const connectToWs = () => {
    const ws = new WebSocket("ws://localhost:4000");
    setWs(ws);
    ws.addEventListener("message", handleMessage);
    ws.addEventListener("close", () => {
      setTimeout(() => {
        console.log("disconnecting..try connect to ws");
        connectToWs();
      }, 1000);
    });
  };

  const handleMessage = (e) => {
    const messageData = JSON.parse(e.data);
    if ("online" in messageData) {
      showOnlineUsers(messageData.online);
    } else if ("text" in messageData) {
      if (messageData.sender === selectedUserId) {
        setMessages((prev) => [...prev, { ...messageData }]);
      }
    }
  };

  const messageWithoutDupes = uniqBy(messages, "_id");

  const showOnlineUsers = (usersArr) => {
    const users = {};
    usersArr.forEach(({ userId, username }) => {
      users[userId] = username;
    });
    setOnlineUsers(users);
  };

  const sendMessage = (e, file = null) => {
    if (e) e.preventDefault();
    console.log(file);
    ws.send(
      JSON.stringify({
        recipient: selectedUserId,
        text: newMessageText,
        file,
      })
    );
    if (file) {
      axiosInstance.get(`/messages/${selectedUserId}`).then((res) => {
        setMessages(res.data);
      });
    } else {
      setNewMessageText("");
      setMessages((prev) => [
        ...prev,
        {
          text: newMessageText,
          sender: id,
          recipient: selectedUserId,
          incomingMsg: false,
          _id: Date.now(),
        },
      ]);
    }
  };

  const logout = () => {
    axiosInstance.post("/logout").then(() => {
      setWs(null);
      setId(null);
      setUsername(null);
    });
  };

  const uploadFile = (e) => {
    const reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = () => {
      sendMessage(null, {
        name: e.target.files[0].name,
        data: reader.result,
      });
    };
  };

  useEffect(() => {
    connectToWs();
  }, []);

  useEffect(() => {
    const div = divUnderMessage.current;
    if (div) div.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => {
    if (selectedUserId)
      axiosInstance.get(`/messages/${selectedUserId}`).then((res) => {
        setMessages(res.data);
      });
  }, [selectedUserId]);

  useEffect(() => {
    axiosInstance.get("/users").then((res) => {
      const offlineUsersArr = res.data
        .filter((user) => user._id !== id)
        .filter((user) => !Object.keys(onlineUsers).includes(user._id));
      const offlineUsers = {};
      offlineUsersArr.forEach((user) => {
        offlineUsers[user._id] = user;
      });
      setOfflineUsers(offlineUsers);
    });
  }, [onlineUsers]);

  const onlineUsersExcludeOurUser = { ...onlineUsers };
  delete onlineUsersExcludeOurUser[id];

  return (
    <div className="flex h-screen">
      <div className="bg-white w-1/3 flex flex-col">
        <div className="flex-grow">
          <Logo />
          {Object.keys(onlineUsersExcludeOurUser).map((userId) => (
            <Contact
              key={userId}
              id={userId}
              online={true}
              username={onlineUsersExcludeOurUser[userId]}
              onClick={() => setSelectedUserId(userId)}
              selected={userId === selectedUserId}
            />
          ))}
          {Object.keys(offlineUsers).map((userId) => (
            <Contact
              key={userId}
              id={userId}
              online={false}
              username={offlineUsers[userId].username}
              onClick={() => setSelectedUserId(userId)}
              selected={userId === selectedUserId}
            />
          ))}
        </div>
        <div className="p-2 text-center flex items-center justify-center">
          <span className="mr-4 text-gray-600 text-md flex items-center">
            <div className=" mr-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6"
              >
                <path
                  fillRule="evenodd"
                  d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            {username}
          </span>
          <button
            className="text-gray-600 text-md py-2 px-4 bg-blue-100 rounded-md"
            onClick={logout}
          >
            Log out
          </button>
        </div>
      </div>
      <div className="flex flex-col bg-blue-50 w-2/3 p-2">
        <div className="flex-grow">
          {!selectedUserId && (
            <div className="h-full flex justify-center items-center">
              <div className="text-gray-400">no selected person</div>
            </div>
          )}
          {selectedUserId && (
            <div className="relative h-full">
              <div className="overflow-y-auto absolute inset-0">
                {messageWithoutDupes.map((msg) => (
                  <div
                    key={msg._id}
                    className={msg.sender === id ? "text-right" : "text-left"}
                  >
                    <div
                      className={
                        "inline-block text-left p-2 my-2 rounded-md text-sm " +
                        (msg.sender === id
                          ? "bg-blue-500 text-white"
                          : "bg-white text-gray-600")
                      }
                    >
                      {msg.text}
                      {msg.file && (
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="size-4"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18.97 3.659a2.25 2.25 0 0 0-3.182 0l-10.94 10.94a3.75 3.75 0 1 0 5.304 5.303l7.693-7.693a.75.75 0 0 1 1.06 1.06l-7.693 7.693a5.25 5.25 0 1 1-7.424-7.424l10.939-10.94a3.75 3.75 0 1 1 5.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 0 1 5.91 15.66l7.81-7.81a.75.75 0 0 1 1.061 1.06l-7.81 7.81a.75.75 0 0 0 1.054 1.068L18.97 6.84a2.25 2.25 0 0 0 0-3.182Z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <a
                            className="underline"
                            href={`${axiosInstance.defaults.baseURL}/uploads/${msg.file}`}
                          >
                            {msg.file}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={divUnderMessage}></div>
              </div>
            </div>
          )}
        </div>
        {selectedUserId && (
          <form className="flex mx-2 gap-2" onSubmit={sendMessage}>
            <input
              type="text"
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              placeholder="type your message here.."
              className="bg-white border flex-grow p-2 rounded"
            />
            <label className="bg-gray-400 p-2 text-white rounded cursor-pointer">
              <input type="file" className="hidden" onChange={uploadFile} />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6"
              >
                <path
                  fillRule="evenodd"
                  d="M18.97 3.659a2.25 2.25 0 0 0-3.182 0l-10.94 10.94a3.75 3.75 0 1 0 5.304 5.303l7.693-7.693a.75.75 0 0 1 1.06 1.06l-7.693 7.693a5.25 5.25 0 1 1-7.424-7.424l10.939-10.94a3.75 3.75 0 1 1 5.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 0 1 5.91 15.66l7.81-7.81a.75.75 0 0 1 1.061 1.06l-7.81 7.81a.75.75 0 0 0 1.054 1.068L18.97 6.84a2.25 2.25 0 0 0 0-3.182Z"
                  clipRule="evenodd"
                />
              </svg>
            </label>
            <button
              type="submit"
              className="bg-blue-500 p-2 text-white rounded"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
