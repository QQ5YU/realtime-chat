import { useState, useContext } from "react";
import axiosInstance from "../axiosInstance";
import { UserContext } from "../contexts/UserContext";

export default function RegisterAndLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginOrRegister, setLoginOrRegister] = useState("Register");
  const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);

  const registerData = {
    username: username,
    password: password,
  };

  const handleSetUsername = (e) => {
    setUsername(e.target.value);
  };

  const handleSetPassword = (e) => {
    setPassword(e.target.value);
  };

  const handleSetLoginOrRegister = (param) => {
    setLoginOrRegister(param);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const url = isLoginOrRegister === "Register" ? "/register" : "/login";
    const { data } = await axiosInstance.post(url, registerData);
    setLoggedInUsername(username);
    setId(data.id);
  };

  return (
    <div className="bg-blue-50 h-screen flex items-center">
      <form className="w-64 mx-auto" onSubmit={handleRegister}>
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
          {isLoginOrRegister === "Login" ? "Login" : "Register"}
        </button>

        {isLoginOrRegister === "Register" ? (
          <div className="text-center text-xs text-gray-500 mt-2 ">
            Already register?
            <button
              className="text-blue-500 font-bold"
              onClick={() => handleSetLoginOrRegister("Login")}
            >
              {" "}
              Login here
            </button>
          </div>
        ) : (
          <div className="text-center text-xs text-gray-500 mt-2 ">
            Dont have an account?
            <button
              className="text-blue-500 font-bold"
              onClick={() => handleSetLoginOrRegister("Register")}
            >
              {" "}
              Register here
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
