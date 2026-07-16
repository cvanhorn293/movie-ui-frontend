import { Roboto, Roboto_Flex } from "next/font/google";
import "./globals.css";
import NavigationLayout from "./_components/NavigationLayout";
import Providers from "./_components/providers";

const roboto = Roboto({
    variable: "--font-roboto",
    subsets: ["latin"],
});

const robotoFlex = Roboto_Flex({
    variable: "--font-roboto-flex",
    subsets: ["latin"],
});

// Apply saved theme before paint to avoid a flash of the wrong mode.
const themeInitScript = `(function(){try{var t=localStorage.getItem("metro-theme");document.documentElement.setAttribute("data-theme",t==="light"?"light":"dark");document.documentElement.style.colorScheme=t==="light"?"light":"dark";}catch(e){document.documentElement.setAttribute("data-theme","dark");document.documentElement.style.colorScheme="dark";}})();`;

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${roboto.variable} ${robotoFlex.variable} h-full antialiased`} suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
            </head>
            <body className="h-full overflow-hidden bg-primary text-primary">
                <Providers>
                    <NavigationLayout>{children}</NavigationLayout>
                </Providers>
            </body>
        </html>
    );
}
