import "./globals.css";
export const metadata = {
  title: "Telangana Box Office",
  description: "Telangana movie box-office intelligence"
};
export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}