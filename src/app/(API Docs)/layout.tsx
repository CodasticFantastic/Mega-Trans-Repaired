import NextAuthProvider from "@/helpers/providers/NextAuthProvider";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "API Dokumentacja - MegaTrans",
  description: "Dokumentacja API MegaTrans",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body className={`${poppins.className}`}>
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}
