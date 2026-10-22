import { lazy, Suspense } from "react";
import "./App.css";
import SceneBoundary from "./components/SceneBoundary";

const CharacterModel = lazy(() => import("./components/Character"));
const MainContainer = lazy(() => import("./components/MainContainer"));
import { LoadingProvider } from "./context/LoadingProvider";

const App = () => {
  return (
    <>
      <LoadingProvider>
        <Suspense>
          <MainContainer>
            <SceneBoundary>
              <Suspense>
                <CharacterModel />
              </Suspense>
            </SceneBoundary>
          </MainContainer>
        </Suspense>
      </LoadingProvider>
    </>
  );
};

export default App;
