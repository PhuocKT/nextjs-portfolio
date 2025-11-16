"use strict";

// next.config.js (MỚI - Khuyến nghị)

/** @type {import('next').NextConfig} */
var nextConfig = {
  // ... các cấu hình khác
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: 'images.unsplash.com',
      port: '',
      pathname: '/**' // Cho phép tất cả các đường dẫn dưới domain này

    }, {
      protocol: 'http',
      // Lưu ý: Nên dùng HTTPS nếu có thể
      hostname: 'via.placeholder.com',
      port: '',
      pathname: '/**'
    } // Thêm các pattern khác nếu cần
    ]
  }
};
module.exports = nextConfig;
//# sourceMappingURL=next.config.dev.js.map
