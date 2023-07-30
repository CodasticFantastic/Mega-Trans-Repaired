import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      async authorize(credentials, req) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
          }),
        });

        const { user, error } = await res.json();

        if (!error) {
          // Any object returned will be saved in `user` property of the JWT
          console.info("NextAuth - USER LOGGED:", user.email);
          return user;
        } else {
          // Authentiaction Failed - Return Error From Server
          console.info("NextAuth - Error: ", user);
          throw new Error(error);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      return { ...token, ...user };
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user = token;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };
