import RegisterAndLogin from "./components/RegisterAndLogin";
import Chat from "./components/Chat";
import { useContext } from "react";
import { UserContext } from "./contexts/UserContext";

export default function Routes() {
  const { id } = useContext(UserContext);

  if (id) {
    return <Chat />;
  } else return <RegisterAndLogin />;
}
