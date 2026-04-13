// UI translations for EN, VI, and JA locales

export const languages = {
  en: 'English',
  vi: 'Tiếng Việt',
  ja: '日本語',
} as const;

export type Locale = keyof typeof languages;

export const translations = {
  en: {
    meta: {
      title: 'GitHub Flex - Enhance Your GitHub Experience',
      description: 'Browser extension with wide layout, expandable tables/images, GIF picker, and sidebar toggle for GitHub.',
    },
    header: {
      features: 'Features',
      screenshots: 'Screenshots',
      howItWorks: 'Install',
      faq: 'FAQ',
      github: 'GitHub',
    },
    hero: {
      tagline: 'Enhance Your GitHub Experience',
      description: 'Wide layout, expandable tables, image lightbox, GIF picker, and sidebar toggle - all in one extension.',
      ctaChrome: 'Add to Chrome',
      ctaFirefox: 'Add to Firefox',
      subtext: 'Chrome • Edge • Brave • Opera • Vivaldi • Arc • Firefox',
    },
    features: {
      title: 'Features',
      subtitle: 'Everything you need for a better GitHub experience',
      items: [
        { icon: '📐', title: 'Wide Layout', description: 'Expand GitHub to full viewport width for better code reading' },
        { icon: '📊', title: 'Table Expand', description: 'Expandable tables with fullscreen mode and persistent state' },
        { icon: '🖼️', title: 'Image Lightbox', description: 'Click images to view in fullscreen overlay with zoom' },
        { icon: '🎬', title: 'GIF Picker', description: 'Insert GIFs in comments and issues with GIPHY integration' },
        { icon: '📑', title: 'Sidebar Toggle', description: 'Hide/show sidebar with button or Alt+M shortcut' },
      ],
    },
    screenshots: {
      title: 'See It In Action',
      subtitle: 'Visual examples of GitHub Flex features',
    },
    howItWorks: {
      title: 'How It Works',
      subtitle: 'Get started in under 60 seconds',
      steps: [
        { title: 'Install Extension', description: 'Add from Chrome Web Store or Firefox Add-ons with one click. No signup required.' },
        { title: 'Configure Features', description: 'Enable or disable features via the popup. Your preferences sync across devices.' },
        { title: 'Browse GitHub', description: 'Enjoy an enhanced GitHub experience with wide layout, lightbox, and more.' },
      ],
      cta: 'Get Started Now',
    },
    faq: {
      title: 'Frequently Asked Questions',
      subtitle: 'Everything you need to know about GitHub Flex',
      items: [
        { question: 'Does it work on all GitHub pages?', answer: 'Yes! GitHub Flex works on all GitHub pages including repositories, issues, pull requests, and profiles.' },
        { question: 'Can I disable specific features?', answer: 'Absolutely. Click the extension icon to open the popup and toggle any feature on or off.' },
        { question: 'Is my data safe?', answer: 'Yes. GitHub Flex stores settings locally and never collects or transmits any personal data.' },
        { question: 'Which browsers are supported?', answer: 'All Chromium-based browsers (Chrome, Edge, Brave, Opera, Vivaldi, Arc) and Firefox are supported.' },
        { question: 'Is it open source?', answer: 'Yes! GitHub Flex is fully open source under the MIT License. View the code on GitHub.' },
      ],
    },
    footer: {
      cta: {
        title: 'Ready to enhance GitHub?',
        subtitle: 'Install GitHub Flex and experience a better workflow',
        buttonChrome: 'Add to Chrome',
        buttonFirefox: 'Add to Firefox',
      },
      sections: {
        product: 'Product',
        resources: 'Resources',
      },
      links: {
        features: 'Features',
        howItWorks: 'Install',
        faq: 'FAQ',
        github: 'GitHub',
        reportIssue: 'Report Issue',
        chromeStore: 'Chrome Web Store',
        firefoxAddons: 'Firefox Add-ons',
      },
      copyright: '© 2026 GitHub Flex. Open source under MIT License.',
    },
  },
  vi: {
    meta: {
      title: 'GitHub Flex - Nâng cấp trải nghiệm GitHub',
      description: 'Tiện ích trình duyệt với bố cục rộng, phóng to bảng/ảnh, chọn GIF và ẩn/hiện thanh bên cho GitHub.',
    },
    header: {
      features: 'Tính năng',
      screenshots: 'Hình ảnh',
      howItWorks: 'Cài đặt',
      faq: 'Câu hỏi',
      github: 'GitHub',
    },
    hero: {
      tagline: 'Nâng cấp trải nghiệm GitHub',
      description: 'Bố cục rộng, phóng to bảng, lightbox hình ảnh, chọn GIF và ẩn/hiện thanh bên - tất cả trong một tiện ích.',
      ctaChrome: 'Thêm vào Chrome',
      ctaFirefox: 'Thêm vào Firefox',
      subtext: 'Chrome • Edge • Brave • Opera • Vivaldi • Arc • Firefox',
    },
    features: {
      title: 'Tính năng',
      subtitle: 'Mọi thứ bạn cần để có trải nghiệm GitHub tốt hơn',
      items: [
        { icon: '📐', title: 'Bố cục rộng', description: 'Mở rộng GitHub ra toàn bộ chiều rộng để đọc code tốt hơn' },
        { icon: '📊', title: 'Phóng to bảng', description: 'Bảng có thể mở rộng với chế độ toàn màn hình và lưu trạng thái' },
        { icon: '🖼️', title: 'Phóng to hình ảnh', description: 'Nhấp vào hình ảnh để xem toàn màn hình với zoom' },
        { icon: '🎬', title: 'Chọn GIF', description: 'Chèn GIF vào bình luận và issues với tích hợp GIPHY' },
        { icon: '📑', title: 'Ẩn/hiện thanh bên', description: 'Ẩn/hiện thanh bên bằng nút hoặc phím tắt Alt+M' },
      ],
    },
    screenshots: {
      title: 'Xem thực tế',
      subtitle: 'Ví dụ trực quan về các tính năng GitHub Flex',
    },
    howItWorks: {
      title: 'Cách hoạt động',
      subtitle: 'Bắt đầu trong vòng 60 giây',
      steps: [
        { title: 'Cài đặt tiện ích', description: 'Thêm từ Chrome Web Store hoặc Firefox Add-ons chỉ với một click. Không cần đăng ký.' },
        { title: 'Cấu hình tính năng', description: 'Bật hoặc tắt tính năng qua popup. Tùy chọn đồng bộ giữa các thiết bị.' },
        { title: 'Duyệt GitHub', description: 'Tận hưởng trải nghiệm GitHub nâng cao với bố cục rộng, lightbox và hơn thế nữa.' },
      ],
      cta: 'Bắt đầu ngay',
    },
    faq: {
      title: 'Câu hỏi thường gặp',
      subtitle: 'Mọi thứ bạn cần biết về GitHub Flex',
      items: [
        { question: 'Nó có hoạt động trên tất cả trang GitHub không?', answer: 'Có! GitHub Flex hoạt động trên tất cả trang GitHub bao gồm repositories, issues, pull requests và profiles.' },
        { question: 'Tôi có thể tắt tính năng cụ thể không?', answer: 'Hoàn toàn được. Nhấp vào icon tiện ích để mở popup và bật/tắt bất kỳ tính năng nào.' },
        { question: 'Dữ liệu của tôi có an toàn không?', answer: 'Có. GitHub Flex lưu cài đặt cục bộ và không bao giờ thu thập hay truyền dữ liệu cá nhân.' },
        { question: 'Những trình duyệt nào được hỗ trợ?', answer: 'Tất cả trình duyệt nhân Chromium (Chrome, Edge, Brave, Opera, Vivaldi, Arc) và Firefox đều được hỗ trợ.' },
        { question: 'Nó có phải mã nguồn mở không?', answer: 'Có! GitHub Flex hoàn toàn mã nguồn mở theo giấy phép MIT. Xem code trên GitHub.' },
      ],
    },
    footer: {
      cta: {
        title: 'Sẵn sàng nâng cấp GitHub?',
        subtitle: 'Cài đặt GitHub Flex và trải nghiệm workflow tốt hơn',
        buttonChrome: 'Thêm vào Chrome',
        buttonFirefox: 'Thêm vào Firefox',
      },
      sections: {
        product: 'Sản phẩm',
        resources: 'Tài nguyên',
      },
      links: {
        features: 'Tính năng',
        howItWorks: 'Cài đặt',
        faq: 'Câu hỏi',
        github: 'GitHub',
        reportIssue: 'Báo lỗi',
        chromeStore: 'Chrome Web Store',
        firefoxAddons: 'Firefox Add-ons',
      },
      copyright: '© 2026 GitHub Flex. Mã nguồn mở theo giấy phép MIT.',
    },
  },
  ja: {
    meta: {
      title: 'GitHub Flex - GitHubの体験を向上',
      description: 'ワイドレイアウト、テーブル/画像の拡大、GIFピッカー、サイドバー切替を備えたブラウザ拡張機能。',
    },
    header: {
      features: '機能',
      screenshots: 'スクリーンショット',
      howItWorks: 'インストール',
      faq: 'FAQ',
      github: 'GitHub',
    },
    hero: {
      tagline: 'GitHubの体験を向上',
      description: 'ワイドレイアウト、テーブル拡大、画像ライトボックス、GIFピッカー、サイドバー切替 - すべてが一つの拡張機能に。',
      ctaChrome: 'Chromeに追加',
      ctaFirefox: 'Firefoxに追加',
      subtext: 'Chrome • Edge • Brave • Opera • Vivaldi • Arc • Firefox',
    },
    features: {
      title: '機能',
      subtitle: 'より良いGitHub体験に必要なすべて',
      items: [
        { icon: '📐', title: 'ワイドレイアウト', description: 'GitHubを全幅に拡大してコードを読みやすく' },
        { icon: '📊', title: 'テーブル拡大', description: '全画面モードと状態保持機能付きの拡大可能なテーブル' },
        { icon: '🖼️', title: '画像ライトボックス', description: '画像をクリックしてズーム付きの全画面表示' },
        { icon: '🎬', title: 'GIFピッカー', description: 'GIPHY統合でコメントやissueにGIFを挿入' },
        { icon: '📑', title: 'サイドバー切替', description: 'ボタンまたはAlt+Mショートカットでサイドバーを表示/非表示' },
      ],
    },
    screenshots: {
      title: '実際の動作',
      subtitle: 'GitHub Flex機能のビジュアル例',
    },
    howItWorks: {
      title: '使い方',
      subtitle: '60秒以内で開始',
      steps: [
        { title: '拡張機能をインストール', description: 'Chrome Web StoreまたはFirefox Add-onsからワンクリックで追加。登録不要。' },
        { title: '機能を設定', description: 'ポップアップで機能のオン/オフを切り替え。設定はデバイス間で同期。' },
        { title: 'GitHubを閲覧', description: 'ワイドレイアウト、ライトボックスなどの強化されたGitHub体験をお楽しみください。' },
      ],
      cta: '今すぐ始める',
    },
    faq: {
      title: 'よくある質問',
      subtitle: 'GitHub Flexについて知っておくべきこと',
      items: [
        { question: 'すべてのGitHubページで動作しますか？', answer: 'はい！GitHub Flexはリポジトリ、issues、プルリクエスト、プロフィールを含むすべてのGitHubページで動作します。' },
        { question: '特定の機能を無効にできますか？', answer: 'もちろんです。拡張機能アイコンをクリックしてポップアップを開き、任意の機能をオン/オフできます。' },
        { question: 'データは安全ですか？', answer: 'はい。GitHub Flexは設定をローカルに保存し、個人データを収集・送信することはありません。' },
        { question: 'どのブラウザがサポートされていますか？', answer: 'すべてのChromiumベースのブラウザ（Chrome、Edge、Brave、Opera、Vivaldi、Arc）とFirefoxがサポートされています。' },
        { question: 'オープンソースですか？', answer: 'はい！GitHub FlexはMITライセンスの完全なオープンソースです。GitHubでコードをご覧ください。' },
      ],
    },
    footer: {
      cta: {
        title: 'GitHubを強化する準備はできましたか？',
        subtitle: 'GitHub Flexをインストールして、より良いワークフローを体験',
        buttonChrome: 'Chromeに追加',
        buttonFirefox: 'Firefoxに追加',
      },
      sections: {
        product: '製品',
        resources: 'リソース',
      },
      links: {
        features: '機能',
        howItWorks: 'インストール',
        faq: 'FAQ',
        github: 'GitHub',
        reportIssue: '問題を報告',
        chromeStore: 'Chrome Web Store',
        firefoxAddons: 'Firefox Add-ons',
      },
      copyright: '© 2026 GitHub Flex. MITライセンスのオープンソース。',
    },
  },
} as const;

export type TranslationKey = keyof (typeof translations)['en'];
