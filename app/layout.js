import Header from "@/components/header/header";
import "./globals.css";
import { Montserrat } from "next/font/google";
import ThemeProviders from "@/components/themeprovide/provider";
import ReactQueryProvider from "@/providers/reactQuery";
import { NextAuthProvider } from "@/providers/nextAuth";
import { Toaster } from "react-hot-toast";
const rubik = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={rubik.className}>
      <body>
        <NextAuthProvider>
          <ReactQueryProvider>
            <ThemeProviders>
              <Header />
              {children}
              <Toaster />
            </ThemeProviders>
          </ReactQueryProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
