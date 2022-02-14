import React, { useContext, useEffect, useRef, useState } from "react";
import "./messenger.css";
import Topbar from "../topbar/Topbar";
import Conversations from "../conversations/Conversations";
import Message from "../message/Message";
import ChatOnline from "../chatOnline/ChatOnline";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { io } from "socket.io-client";

export default function Messenger() {
  const [conversation, setConversation] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [message, setMessage] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const socket = useRef();
  const { user } = useContext(AuthContext);
  const scrollRef = useRef();

  useEffect(() => {
    socket.current = io("ws://localhost:8900");
    socket.current.on("getMessage", (data) => {
      setArrivalMessage({
        sender: data.senderId,
        text: data.text,
        createdAt: Date.now(),
      });
    });
  }, []);
  useEffect(() => {
    socket.current.emit("addUser", user._id);
    socket.current.on("getUsers", (users) => {
      setOnlineUsers(
        user.followings.filter((f) => users.some((u) => u.userId === f))
      );
    });
  }, [user]);

  useEffect(() => {
    const getConversation = async () => {
      try {
        const res = await axios.get("/conversations/" + user._id);
        console.log(res);
        setConversation(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getConversation();
  }, [user._id]);

  useEffect(() => {
    const getMessage = async () => {
      try {
        const res = await axios.get("/messages/" + currentChat?._id);
        setMessage(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getMessage();
  }, [currentChat]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newmessage = {
      sender: user._id,
      text: newMessage,
      conversationId: currentChat._id,
    };
    const receiverId = currentChat.members.find(
      (member) => member !== user._id
    );
    socket.current.emit("sendMessage", {
      senderId: user._id,
      receiverId,
      text: newMessage,
    });
    try {
      const res = await axios.post("/messages", newmessage);
      setMessage([...message, res.data]);
      setNewMessage("");
    } catch (err) {}
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behaviour: "smooth" });
  }, [message]);

  useEffect(() => {
    console.log(currentChat);
    console.log(arrivalMessage);
    arrivalMessage &&
      currentChat?.members.includes(arrivalMessage.sender) &&
      setMessage((prev) => [...prev, arrivalMessage]);
    console.log(message);
  }, [arrivalMessage, currentChat]);

  return (
    <>
      <Topbar />
      <div className="messenger">
        <div className="chatMenu">
          <div className="chatMenuWrapper">
            <input
              placeholder="search for friends"
              className="chatMenuInput"
            ></input>
            {conversation.map((c) => {
              return (
                <div onClick={() => setCurrentChat(c)}>
                  <Conversations
                    conversation={c}
                    currentUser={user}
                    key={c._id}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <div className="chatBox">
          <div className="chatBoxWrapper">
            {currentChat ? (
              <>
                <div className="chatBoxTop">
                  {message.map((m) => {
                    return (
                      <div ref={scrollRef}>
                        <Message
                          message={m}
                          key={m._id}
                          own={m.sender === user._id}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="chatBoxBottom">
                  <textarea
                    onChange={(e) => setNewMessage(e.target.value)}
                    value={newMessage}
                    placeholder="write somethong..."
                    className="chatMessageInput"
                  />
                  <button className="chatSubmitButton" onClick={handleSubmit}>
                    send
                  </button>
                </div>
              </>
            ) : (
              <span className="noConversationText">
                {" "}
                open a conversation to start a chat
              </span>
            )}
          </div>
        </div>

        <div className="chatOnline">
          <div className="chatOnlineWrapper">
            <ChatOnline
              onlineUsers={onlineUsers}
              currentId={user._id}
              setCurrentChat={setCurrentChat}
            />
          </div>
        </div>
      </div>
    </>
  );
}
