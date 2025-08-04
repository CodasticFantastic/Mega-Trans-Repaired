import ReactQueryProvider from "@/helpers/providers/ReactQueryProvider";
import NextAuthProvider from "@/helpers/providers/NextAuthProvider";
import "@/scss/main.scss";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "MegaTrans CRM",
  description: "Zamów usługę transportu gabarytów w firmie MegaTrans",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body className={`${poppins.className} crm`}>
        <NextAuthProvider>
          <ReactQueryProvider>{children}</ReactQueryProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
