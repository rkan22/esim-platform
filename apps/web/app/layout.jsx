import "./globals.css";

export const metadata = {
  title: "eSIM Platform",
  description: "Login + Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
