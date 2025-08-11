import ReactQueryProvider from "@/helpers/providers/ReactQueryProvider";
import NextAuthProvider from "@/helpers/providers/NextAuthProvider";
import { Poppins } from "next/font/google";
import { Toaster } from "sonner";
import dayjs from "dayjs";
import "dayjs/locale/pl";
import "@/css/tailwind.css";
import { ThemeProvider } from "./components/theme.provider";

dayjs.locale("pl");

const poppins = Poppins({
  subsets: ["latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "MegaTrans CRM",
  description: "Zamów usługę transportu gabarytów w firmie MegaTrans",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" className="dark" suppressHydrationWarning>
      <body className={`${poppins.className} crm`}>
        <NextAuthProvider>
          <ReactQueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </ReactQueryProvider>
          <Toaster />
        </NextAuthProvider>
      </body>
    </html>
  );
}
