export default function Footer() {
    return (
        <footer className=" bottom-0 left-0 w-full bg-white border-t shadow-inner">
            <div className="max-w-7xl mx-auto px-5 py-6 text-gray-600 text-sm">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Left: copyright */}
                    <div className="text-center md:text-left">
                        <p>© {new Date().getFullYear()} Hoan Phuoc. All rights reserved.</p>
                    </div>

                    {/* Center: links */}
                    <nav className="flex flex-wrap justify-center gap-4">
                        <a href="#" className="text-gray-700 hover:underline">Privacy Policy</a>
                        <a href="#" className="text-gray-700 hover:underline">Terms of Service</a>
                        <a href="#" className="text-gray-700 hover:underline">Contact</a>
                        <span className="hidden md:inline">|</span>
                        <span className="sr-only">Built with</span>
                        <span className="text-gray-500">Built with Next.js & Tailwind CSS</span>
                    </nav>

                    {/* Right: social */}
                    <div className="flex items-center gap-3">
                        <span className="sr-only">Follow me:</span>
                        <a href="#" aria-label="GitHub" className="text-gray-700 hover:text-gray-900">
                            {/* simple GitHub icon */}
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path d="M12 .5a12 12 0 00-3.8 23.4c.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.6-4-1.6-.5-1.2-1.2-1.5-1.2-1.5-.9-.6.1-.6.1-.6 1 .1 1.6 1 1.6 1 .9 1.6 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.4-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.4 11.4 0 016 0C17 5 18 5.3 18 5.3c.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.5-2.7 5.5-5.3 5.8.3.3.6.8.6 1.7v2.5c0 .3.2.7.8.6A12 12 0 0012 .5z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}  
