import { createRoot } from "react-dom/client";
// import { ConvexAuthProvider } from "@convex-dev/auth/react";
// import { ConvexReactClient } from "convex/react";
import "./index.css";
import App from "./App";
import { Toaster } from "sonner";
// const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

createRoot(document.getElementById("root")!).render(
  // <ConvexAuthProvider client={convex}>
  <>
    <App />
    <Toaster
      position="top-right"
      richColors
      expand={true}
      closeButton
      duration={2000}
    />
  </>
  // </ConvexAuthProvider>,
);