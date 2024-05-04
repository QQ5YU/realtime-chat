import { useState } from "react";
import axios from "axios";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSetUsername = (e) => {
    setUsername(e.target.value);
    console.log(`username: ${username}`);
  };

  const handleSetPassword = (e) => {
    setPassword(e.target.value);
  };

  const register = async () => {
    const response = await axios.post(`/register`, { username, password });
    console.log(response);
  };

  return (
    <div className="bg-blue-50 h-screen flex items-center">
      <form className="w-64 mx-auto" onSubmit={register}>
        <input
          type="text"
          placeholder="username"
          className="block w-full rounded-sm p-2 mb-2 border"
          onChange={handleSetUsername}
        />
        <input
          type="password"
          placeholder="password"
          className="block w-full rounded-sm p-2 mb-2 border"
          onChange={handleSetPassword}
        />
        <button className="bg-blue-500 text-white block w-full rounded-sm p-2">
          Register
        </button>
      </form>
    </div>
  );
}
