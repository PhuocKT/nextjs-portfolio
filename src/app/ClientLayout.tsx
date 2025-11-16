"use client";

// 1. Bỏ 'useState'
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // 2. Bỏ state 'isCollapsed' và hàm 'toggleSidebar'
    // const [isCollapsed, setIsCollapsed] = useState(false);
    // const toggleSidebar = () => setIsCollapsed((prev) => !prev);

    return (
        // 3. Bỏ 'flex' ở đây, chuyển sang 'flex-col' để sắp xếp Header, Main, Footer
        <div className="flex flex-col min-h-screen">

            {/* 4. Render Navbar trực tiếp, không cần div bọc và không truyền props */}
            <Navbar />

            {/* 5. Chỉnh sửa Main:
                - Bỏ 'flex-1' (đã có trên div cha)
                - Bỏ các class 'transition-all'
                - THÊM 'pt-16' (padding-top: 4rem) để đẩy nội dung xuống dưới Header (vì Header cao h-16)
            */}
            <main
                className={`flex-1 pt-16 bg-gradient-to-br from-sky-100 to-indigo-100`}
            >
                {children}
                <Footer />
            </main>
        </div>
    );
}