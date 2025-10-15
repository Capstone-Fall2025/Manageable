import "./globals.css";
//import Navbar from "./components/Navbar.js";

export const metadata = {
    title: "Manageable",
    description: " A gamified focus and task web app",
};

export default function RootLayout ({ children}) {
  return(
    <html lang="en">
      <body className="bg-black text-white">
          {children}
      </body>
    </html>
  );
}