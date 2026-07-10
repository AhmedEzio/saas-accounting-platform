"use client";

import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { ThemeProvider } from "@/context/ThemeContext";

export default function Providers({ children }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>{children}</AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}