🇬🇧 [English](README.md) | 🇻🇳 **Tiếng Việt** | 🇯🇵 [日本語](README.ja.md)

# GitHub Flex

[![Version](https://img.shields.io/github/v/release/lamngockhuong/github-flex)](https://github.com/lamngockhuong/github-flex/releases)
[![CI](https://github.com/lamngockhuong/github-flex/actions/workflows/ci.yml/badge.svg)](https://github.com/lamngockhuong/github-flex/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Chrome Web Store](https://img.shields.io/badge/Chrome_Web_Store-Cài_đặt-4285F4?logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/github-flex/iechckkdnjmdnpbdohhnmojofcbfnemc)
[![Firefox Add-ons](https://img.shields.io/badge/Firefox_Add--ons-Cài_đặt-FF7139?logo=firefox&logoColor=white)](https://addons.mozilla.org/en-US/firefox/addon/github-flex/)
[![Website](https://img.shields.io/badge/Website-github--flex.khuong.dev-8957e5?logo=astro&logoColor=white)](https://github-flex.khuong.dev)

<a href="https://unikorn.vn/p/github-flex?ref=embed-github-flex" target="_blank"><img src="https://unikorn.vn/api/widgets/badge/github-flex?theme=light" alt="GitHub Flex trên Unikorn.vn" style="width: 180px; height: 45px;" width="180" height="45" /></a>
<a href="https://launch.j2team.dev/products/github-flex-enhance-your-github-experience?utm_source=badge-launched&utm_medium=badge&utm_campaign=badge-github-flex-enhance-your-github-experience" target="_blank"><img src="https://launch.j2team.dev/badge/github-flex-enhance-your-github-experience/light" alt="GitHub Flex - Launched on J2TEAM Launch" style="width: 180px; height: 45px;" width="180" height="45" /></a>

Tiện ích mở rộng đa trình duyệt (Chrome & Firefox) giúp nâng cấp giao diện GitHub với các tính năng tăng năng suất.

<p align="center">
  <img src="assets/promo-banner-1280x800.svg" alt="GitHub Flex" width="640" />
</p>

## Tính năng

- **Bố cục rộng** - Mở rộng GitHub ra toàn bộ chiều rộng màn hình
- **Phóng to bảng** - Bảng có thể mở rộng với trạng thái lưu trữ
- **Phóng to hình ảnh** - Nhấp vào hình ảnh để xem toàn màn hình với zoom
- **Chọn GIF** - Chèn GIF vào bình luận và issues
- **Ẩn/hiện thanh bên** - Ẩn/hiện thanh bên bằng nút hoặc phím tắt `Alt+M`
- **Lịch sử chỉnh sửa** - Xem diff chỉnh sửa bình luận với chế độ split/unified/preview

<p align="center">
  <img src="assets/promo-02-wide-layout-1280x800.svg" alt="Bố cục rộng" width="400" />
  <img src="assets/promo-03-lightbox-1280x800.svg" alt="Phóng to hình ảnh" width="400" />
</p>
<p align="center">
  <img src="assets/promo-04-gif-picker-1280x800.svg" alt="Chọn GIF" width="400" />
  <img src="assets/promo-05-sidebar-toggle-1280x800.svg" alt="Ẩn/hiện thanh bên" width="400" />
</p>

## Cài đặt

### Chrome Web Store

Cài đặt trực tiếp từ [Chrome Web Store](https://chromewebstore.google.com/detail/github-flex/iechckkdnjmdnpbdohhnmojofcbfnemc).

### Firefox Add-ons

Cài đặt trực tiếp từ [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/github-flex/).

### Từ mã nguồn

```bash
git clone https://github.com/lamngockhuong/github-flex.git
cd github-flex
pnpm install
pnpm build
```

Sau đó tải vào trình duyệt:

**Chrome:**

1. Mở `chrome://extensions/`
2. Bật **Chế độ nhà phát triển** (góc trên bên phải)
3. Nhấp **Tải tiện ích đã giải nén**
4. Chọn thư mục `dist/chrome/`

**Firefox:**

1. Mở `about:debugging#/runtime/this-firefox`
2. Nhấp **Tải Add-on tạm thời**
3. Chọn bất kỳ tệp nào trong thư mục `dist/firefox/`

## Phát triển

```bash
pnpm dev              # Build cả hai trình duyệt với chế độ watch
pnpm build            # Build production cho cả hai trình duyệt
pnpm build:chrome     # Build chỉ Chrome
pnpm build:firefox    # Build chỉ Firefox
pnpm lint             # Kiểm tra code style
pnpm lint:fix         # Tự động sửa lỗi
pnpm lint:firefox     # Lint Firefox build với web-ext
pnpm test             # Chạy tests
```

### Phát hành lên Firefox Add-ons

Khi gửi phiên bản mới lên [Firefox Add-ons](https://addons.mozilla.org/), Mozilla yêu cầu tải mã nguồn vì chúng tôi sử dụng esbuild để bundle. Tạo file zip mã nguồn với:

```bash
zip -r github-flex-source.zip src/ scripts/ package.json pnpm-lock.yaml biome.json README.md LICENSE manifest.json
```

## Ngôn ngữ

- English (mặc định)
- Tiếng Việt
- 日本語 (Tiếng Nhật)

Tiện ích tự động hiển thị theo ngôn ngữ trình duyệt nếu được hỗ trợ.

## Công nghệ

- Manifest V3 (Chrome 88+, Firefox 112+)
- webextension-polyfill (tương thích API đa trình duyệt)
- Vanilla JavaScript (ES Modules)
- esbuild (bundler)
- Biome (linter/formatter)
- Vitest (testing)

## Tài trợ

Nếu bạn thấy tiện ích này hữu ích, hãy cân nhắc hỗ trợ phát triển:

[![GitHub Sponsors](https://img.shields.io/badge/GitHub_Sponsors-Hỗ_trợ-ea4aaa?logo=githubsponsors&logoColor=white)](https://github.com/sponsors/lamngockhuong)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy_Me_A_Coffee-Hỗ_trợ-FFDD00?logo=buymeacoffee&logoColor=black)](https://buymeacoffee.com/lamngockhuong)
[![MoMo](https://img.shields.io/badge/MoMo-Hỗ_trợ-ae2070)](https://me.momo.vn/khuong)

## Dự án khác

- [Termote](https://github.com/lamngockhuong/termote) - Điều khiển CLI từ xa (Claude Code, GitHub Copilot, bất kỳ terminal nào) từ di động/máy tính qua PWA

## Giấy phép

[MIT](LICENSE)
