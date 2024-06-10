import Register from "./components/RegisterAndLogin";
import Chat from "./components/Chat";
import { useContext } from "react";
import { UserContext } from "./contexts/UserContext";

export default function Route() {
  const { id } = useContext(UserContext);
  console.log(id);

  if (id) {
    return <Chat />;
  } else return <Register />;
}
