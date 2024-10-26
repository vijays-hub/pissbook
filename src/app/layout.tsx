import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import ReactQueryClientProvider from "./ReactQueryClientProvider";
import { Toaster } from "@/components/ui/toaster";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    // %s acts as a placeholder for the page title we set in each page
    template: "%s | Pissbook",
    default: "Pissbook",
  },
  description: "Piss all you can; wherever you can.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.className} ${geistMono.className}`}>
        <ReactQueryClientProvider>
          {/* 
        
        The common pattern for dark theme implementation is setting a class on the html/body element.
        This class is then used to apply different styles based on the theme. The ThemeProvider
        component from next-themes library does this for us. It will add a dark or light class 
        to the body or HTML element, and we can style your components based on those classes.
        Hence, we have specified the attribute prop as class in the ThemeProvider component.

        ACTIVITY:
        In the Navbar, we have a UserButton component that allows users to switch 
        between light and dark themes. See what happens when you click on the theme switcher.
        For ex: If you switch to light: You should be seeing a class="light" on the html element 
        and style="color-scheme: light;"...
        These classes are determined by the setTheme method in the UserButton component.

        BONUS:
        The color palette for dark and light theme is defined in the globals.css file. Since we
        are using Shadcn's UI framework, we can easily switch between dark and light themes.

        Exercise:
        Manually create dark and light theme switching ability in a React project.
        https://dev.to/alexeagleson/how-to-create-a-dark-mode-component-in-react-3ibg

        The above link will also help you get a gist on how shadcn is achieving the dark mode
        using it's palette.

        ! Know more on NextJs Dark theme - https://ui.shadcn.com/docs/dark-mode/next
        */}
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </ReactQueryClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
