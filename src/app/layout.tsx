import "./globals.css";
import ClientLayout from "@/app/ClientLayout";

export const metadata = {
    title: "Phước Portfolio",
    description: "My personal portfolio built with Next.js",
    };

    export default function RootLayout({
    children,
    }: {
    children: React.ReactNode;
    }) {
    return (
        <html lang="en">
        <body>
            <ClientLayout>{children}</ClientLayout>
        </body>
        </html>
    );
}
