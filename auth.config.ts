import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const mustChangePassword = auth?.user?.mustChangePassword ?? false;
      const isLogin = pathname.startsWith("/login");
      const isPasswordChange = pathname.startsWith("/passwort-aendern");
      const isAuthApi = pathname.startsWith("/api/auth");

      if (isAuthApi) {
        return true;
      }

      if (!isLoggedIn) {
        return isLogin;
      }

      if (isLogin) {
        return Response.redirect(
          new URL(auth?.user?.rolle === "ADMIN" ? "/admin" : "/", request.nextUrl),
        );
      }

      if (mustChangePassword && !isPasswordChange) {
        return Response.redirect(new URL("/passwort-aendern", request.nextUrl));
      }

      // Nach erfolgreichem Wechsel nicht auf der Zwangsseite bleiben
      if (!mustChangePassword && isPasswordChange) {
        return Response.redirect(
          new URL(auth?.user?.rolle === "ADMIN" ? "/admin" : "/", request.nextUrl),
        );
      }

      if (pathname.startsWith("/admin") && auth?.user?.rolle !== "ADMIN") {
        return Response.redirect(new URL("/", request.nextUrl));
      }

      return true;
    },
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id!;
        token.rolle = user.rolle;
        token.mustChangePassword = user.mustChangePassword;
      }

      if (trigger === "update") {
        const nextFlag =
          typeof session?.mustChangePassword === "boolean"
            ? session.mustChangePassword
            : session?.user?.mustChangePassword;
        if (typeof nextFlag === "boolean") {
          token.mustChangePassword = nextFlag;
        }
      }

      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.rolle = token.rolle;
      session.user.mustChangePassword = token.mustChangePassword;
      return session;
    },
  },
} satisfies NextAuthConfig;
