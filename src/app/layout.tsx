import { UserProvider } from "@/context/UserContext";
import "./globals.css";
import ClientLayout from "@/app/ClientLayout";

export const metadata = {
    title: "Tracking app",
    description: "My personal portfolio built with Next.js",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        // Thêm 'h-full' để html chiếm toàn bộ chiều cao
        <html lang="en" suppressHydrationWarning={true} className="h-full">
            {/* Thêm 'h-full' để body cũng chiếm toàn bộ chiều cao */}
            <body className="h-full">
                <UserProvider>
                    <ClientLayout>{children}</ClientLayout>
                </UserProvider>
            </body>
        </html>
    );
}