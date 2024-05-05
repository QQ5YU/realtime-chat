/* eslint-disable no-unused-vars */
import Route from "./Route";
import { UserContextProvider } from "./contexts/UserContext";

function App() {
  return (
    <>
      <UserContextProvider>
        <Route />
      </UserContextProvider>
    </>
  );
}

export default App;
