import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "email", type: "email", placeholder: "Twój email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        // Add logic here to look up the user from the credentials supplied
        const res = await fetch("http://localhost:3000/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
          }),
        });

        const user = await res.json();

        if (!user.error) {
          // Any object returned will be saved in `user` property of the JWT
          console.info("NextAuth - USER LOGGED:", user.user.email);
          return user.user;
        } else {
          // Authentiaction Failed - Return Error From Server
          console.info("NextAuth - Error: ", user);
          throw new Error(user.error);
        }
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };
