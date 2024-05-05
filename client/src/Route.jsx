import Register from "./components/RegisterAndLogin";
import { useContext } from "react";
import { UserContext } from "./contexts/UserContext";

export default function Route() {
  const { id } = useContext(UserContext);
  console.log(id);

  if (id) {
    return id + "login successfully";
  }
  return <Register />;
}
