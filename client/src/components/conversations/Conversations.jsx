import React, { useEffect, useState } from "react";
import "./conversations.css";
import axios from "axios";
export default function Conversations({ conversation, currentUser }) {
  const [user, setUser] = useState([]);
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  useEffect(() => {
    const friendId = conversation.members.find((m) => m !== currentUser._id);
    const getUser = async () => {
      try {
        const res = await axios("/users?userId=" + friendId);
        console.log(res);
        setUser(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getUser();
  }, [conversation, currentUser]);
  return (
    <div className="conversation">
      <img
        className="conversationImg"
        src={
          user?.profilePicture
            ? PF + user.profilePicture
            : PF + "/person/noavatar.png"
        }
        alt=""
      />
      <span className="conversationName">{user?.username}</span>
    </div>
  );
}
