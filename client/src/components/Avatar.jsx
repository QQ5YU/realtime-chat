import React from "react";

export default function Avatar({ username, userId, online }) {
  const colors = [
    "bg-red-200",
    "bg-green-200",
    "bg-purple-200",
    "bg-blue-200",
    "bg-yellow-200",
    "bg-teal-200",
  ];
  const userIdBase10 = parseInt(userId, 10);
  const colorIndex = userIdBase10 % colors.length;
  const color = colors[colorIndex];

  return (
    <div className={`w-8 h-8 ${color} rounded-full relative flex items-center`}>
      <div className="text-center w-full opacity-70">{username[0]}</div>
      {online ? (
        <div className="h-2 w-2 absolute bg-green-500 rounded-full top-0 left-0" />
      ) : (
        <div className="h-2 w-2 absolute bg-gray-400 rounded-full top-0 left-0" />
      )}
    </div>
  );
}
