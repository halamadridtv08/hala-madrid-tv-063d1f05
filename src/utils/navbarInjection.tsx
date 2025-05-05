
import { AuthButtons } from "@/components/layout/AuthButtons";
import { createRoot } from "react-dom/client";

// Function to inject the auth buttons into the navbar
export const injectAuthButtons = () => {
  // Wait for the navbar to be rendered
  setTimeout(() => {
    const navbarRightSection = document.querySelector(".navbar-right");
    if (navbarRightSection) {
      // Create a container for the auth buttons
      const authContainer = document.createElement("div");
      authContainer.id = "auth-buttons-container";
      authContainer.className = "mr-2";
      
      // Insert it before the theme toggle
      navbarRightSection.insertBefore(authContainer, navbarRightSection.firstChild);
      
      // Render the auth buttons
      const root = createRoot(authContainer);
      root.render(<AuthButtons />);
    }
  }, 500); // Small delay to ensure navbar is mounted
};
