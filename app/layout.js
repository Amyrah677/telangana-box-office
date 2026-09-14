import "./globals.css";

export const metadata = {
  title: "Telangana Box Office",
  description: "Telangana Box Office Collections & Data",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
