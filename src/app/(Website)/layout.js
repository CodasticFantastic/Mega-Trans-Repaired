import NextAuthProvider from "@/helpers/providers/NextAuthProvider";
import Footer from "./components/Footer";
import Header from "./components/Header";
import "@/scss/main.scss";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "MegaTrans - Transport gabarytów",
  description: "Zamów usługę transportu gabarytów w firmie MegaTrans",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body className={poppins.className}>
        <NextAuthProvider>
          <Header />
          {children}
          <Footer />
        </NextAuthProvider>
      </body>
    </html>
  );
}
