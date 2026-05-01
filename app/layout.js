import "./globals.css";

export const metadata = {
  title: "TrustLayer — Never Trust AI Blindly Again",
  description: "AI-powered verification for legal content. Get instant trust scores and clause-level risk analysis.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
