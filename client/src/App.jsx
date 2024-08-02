/* eslint-disable no-unused-vars */
import Routes from "./Routes";
import { UserContextProvider } from "./contexts/UserContext";

function App() {
  return (
    <>
      <UserContextProvider>
        <Routes />
      </UserContextProvider>
    </>
  );
}

export default App;
