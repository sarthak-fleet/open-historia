import { createBrowserRouter } from "react-router-dom";

import RootLayout from "./RootLayout";
import AboutPage from "./pages/AboutPage";
import GamePage from "./pages/GamePage";
import NotFoundPage from "./pages/NotFoundPage";
import PrivacyPage from "./pages/PrivacyPage";
import StoryRoomPage from "./pages/StoryRoomPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { path: "play", element: <GamePage /> },
      { path: "play/:id", element: <GamePage /> },
      { path: "about", element: <AboutPage /> },
      { path: "privacy", element: <PrivacyPage /> },
      { path: "story-room", element: <StoryRoomPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);