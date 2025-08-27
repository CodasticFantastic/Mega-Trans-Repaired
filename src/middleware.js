export { default } from "next-auth/middleware";
export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/newOrder",
    "/updateOrder/:path*",
    "/apiDocs",
    "/apiDocs/:path*",
    "/labels/bulk",
    "/labels/bulk/:path*",
    "/waybills/bulk",
    "/waybills/bulk/:path*",
  ],
};
