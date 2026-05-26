import { Roboto, Roboto_Flex } from "next/font/google";
import "./globals.css";
import NavigationLayout from "./_components/NavigationLayout";

const roboto = Roboto({
    variable: "--font-roboto",
    subsets: ["latin"],
});

const robotoFlex = Roboto_Flex({
    variable: "--font-roboto-flex",
    subsets: ["latin"],
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${roboto.variable} ${robotoFlex.variable} h-full antialiased`}>
            <body className="h-full bg-off-white">
                <NavigationLayout>{children}</NavigationLayout>
            </body>
        </html>
    );
}
