export default function ForbiddenPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-100 to-pink-100">
        <h1 className="text-4xl font-bold text-red-600 mb-4">🚫 403 - Forbidden</h1>
        <p className="text-gray-600">Bạn không có quyền truy cập trang này.</p>
        <button
            onClick={() => (window.location.href = "/")}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
            Quay lại Trang chủ
        </button>
        </div>
    );
}
