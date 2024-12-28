import "./global.css";

export const metadata = {
  title: "F1 GPT",
  description: "My first LLM web app",
};

const RootLayout = ({ children }) => {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
