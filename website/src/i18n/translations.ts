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
      description: 'Browser extension with wide layout, expandable tables/images, GIF picker, sidebar toggle, and edit history for GitHub.',
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
      description: 'Wide layout, expandable tables, image lightbox, GIF picker, sidebar toggle, and edit history - all in one extension.',
      ctaChrome: 'Add to Chrome',
      ctaFirefox: 'Add to Firefox',
      subtext: 'Chrome • Edge • Brave • Opera • Vivaldi • Arc • Firefox',
      badgeUnikornAlt: 'GitHub Flex on Unikorn.vn',
      badgeJ2TeamAlt: 'GitHub Flex on J2TEAM Launch',
    },
    features: {
      title: 'Features',
      subtitle: 'Everything you need for a better GitHub experience',
      items: [
        { icon: '📐', title: 'Wide Layout', description: 'Expand GitHub to full viewport width for better code reading' },
        { icon: '📊', title: 'Table Expand', description: 'Expandable tables with fullscreen, column resize, column hide/show, tall-cell clamping, and persistent state' },
        { icon: '🖼️', title: 'Image Lightbox', description: 'Click images to view in fullscreen overlay with zoom' },
        { icon: '🎬', title: 'GIF Picker', description: 'Insert GIFs in comments and issues with GIPHY integration' },
        { icon: '📑', title: 'Sidebar Toggle', description: 'Hide/show sidebar with button or Alt+M shortcut' },
        { icon: '📝', title: 'Edit History', description: 'View comment edit history with side-by-side diff comparison' },
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
        otherProjects: 'Other Projects',
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
      otherProjects: {
        termote: 'Remote control CLI tools from mobile/desktop via PWA',
        tabrest: 'Automatically unloads inactive tabs to free memory',
        specpin: 'Pin living business specs onto your running web UI',
      },
      copyright: '© 2026 GitHub Flex. Open source under MIT License.',
      builtBy: 'Built by',
    },
  },
  vi: {
    meta: {
      title: 'GitHub Flex - Nâng tầm trải nghiệm GitHub',
      description: 'Tiện ích giúp GitHub có bố cục rộng, bảng và ảnh toàn màn hình, chèn GIF, ẩn/hiện thanh bên và xem lịch sử chỉnh sửa.',
    },
    header: {
      features: 'Tính năng',
      screenshots: 'Ảnh chụp màn hình',
      howItWorks: 'Cài đặt',
      faq: 'Hỏi đáp',
      github: 'GitHub',
    },
    hero: {
      tagline: 'Nâng tầm trải nghiệm GitHub',
      description: 'Bố cục rộng, bảng và ảnh toàn màn hình, chèn GIF, ẩn/hiện thanh bên, xem lịch sử chỉnh sửa - tất cả trong một tiện ích.',
      ctaChrome: 'Thêm vào Chrome',
      ctaFirefox: 'Thêm vào Firefox',
      subtext: 'Chrome • Edge • Brave • Opera • Vivaldi • Arc • Firefox',
      badgeUnikornAlt: 'GitHub Flex trên Unikorn.vn',
      badgeJ2TeamAlt: 'GitHub Flex trên J2TEAM Launch',
    },
    features: {
      title: 'Tính năng',
      subtitle: 'Đủ mọi tính năng để bạn dùng GitHub thuận tiện hơn',
      items: [
        { icon: '📐', title: 'Bố cục rộng', description: 'Mở rộng GitHub ra toàn bộ chiều ngang màn hình để đọc mã nguồn dễ hơn' },
        { icon: '📊', title: 'Mở rộng bảng', description: 'Xem bảng toàn màn hình, kéo để đổi độ rộng cột, ẩn/hiện cột, thu gọn ô quá cao và ghi nhớ trạng thái' },
        { icon: '🖼️', title: 'Xem ảnh toàn màn hình', description: 'Nhấp vào ảnh để xem toàn màn hình và phóng to khi cần' },
        { icon: '🎬', title: 'Chèn GIF', description: 'Chèn GIF vào bình luận và issue trên GitHub nhờ tích hợp GIPHY' },
        { icon: '📑', title: 'Ẩn/hiện thanh bên', description: 'Ẩn hoặc hiện thanh bên bằng nút bấm hay phím tắt Alt+M' },
        { icon: '📝', title: 'Lịch sử chỉnh sửa', description: 'So sánh song song nội dung trước và sau mỗi lần sửa bình luận' },
      ],
    },
    screenshots: {
      title: 'Tính năng trong thực tế',
      subtitle: 'Xem trực quan các tính năng của GitHub Flex',
    },
    howItWorks: {
      title: 'Cài đặt trong 3 bước',
      subtitle: 'Bắt đầu chưa tới 60 giây',
      steps: [
        { title: 'Cài tiện ích', description: 'Cài từ Chrome Web Store hoặc Firefox Add-ons chỉ với một cú nhấp. Không cần đăng ký.' },
        { title: 'Chọn tính năng', description: 'Bật hoặc tắt tính năng ngay trong cửa sổ tiện ích. Tùy chọn của bạn sẽ đồng bộ giữa các thiết bị.' },
        { title: 'Dùng GitHub', description: 'Tận hưởng giao diện GitHub rộng rãi hơn cùng trình xem ảnh toàn màn hình và nhiều tiện ích khác.' },
      ],
      cta: 'Bắt đầu ngay',
    },
    faq: {
      title: 'Câu hỏi thường gặp',
      subtitle: 'Mọi điều bạn cần biết về GitHub Flex',
      items: [
        { question: 'GitHub Flex có hoạt động trên mọi trang GitHub không?', answer: 'Có. GitHub Flex hoạt động trên mọi trang GitHub, gồm repository, issue, pull request và trang cá nhân.' },
        { question: 'Tôi có thể tắt riêng từng tính năng không?', answer: 'Được. Nhấp vào biểu tượng tiện ích để mở cửa sổ điều khiển, rồi bật hoặc tắt từng tính năng.' },
        { question: 'Dữ liệu của tôi có an toàn không?', answer: 'Có. GitHub Flex chỉ lưu cài đặt trên thiết bị của bạn, không thu thập hay gửi dữ liệu cá nhân đi nơi khác.' },
        { question: 'GitHub Flex hỗ trợ những trình duyệt nào?', answer: 'GitHub Flex hỗ trợ mọi trình duyệt dựa trên Chromium như Chrome, Edge, Brave, Opera, Vivaldi, Arc và cả Firefox.' },
        { question: 'GitHub Flex có phải dự án mã nguồn mở không?', answer: 'Có. GitHub Flex là dự án mã nguồn mở theo giấy phép MIT. Bạn có thể xem mã nguồn trên GitHub.' },
      ],
    },
    footer: {
      cta: {
        title: 'Sẵn sàng nâng tầm GitHub?',
        subtitle: 'Cài GitHub Flex để làm việc thuận tiện hơn',
        buttonChrome: 'Thêm vào Chrome',
        buttonFirefox: 'Thêm vào Firefox',
      },
      sections: {
        product: 'Sản phẩm',
        resources: 'Tài nguyên',
        otherProjects: 'Dự án khác',
      },
      links: {
        features: 'Tính năng',
        howItWorks: 'Cài đặt',
        faq: 'Hỏi đáp',
        github: 'GitHub',
        reportIssue: 'Báo lỗi',
        chromeStore: 'Chrome Web Store',
        firefoxAddons: 'Firefox Add-ons',
      },
      otherProjects: {
        termote: 'Điều khiển CLI từ xa bằng điện thoại hoặc máy tính qua PWA',
        tabrest: 'Tự động gỡ các tab không hoạt động khỏi bộ nhớ để giải phóng RAM',
        specpin: 'Ghim các đặc tả nghiệp vụ luôn được cập nhật vào giao diện web đang chạy',
      },
      copyright: '© 2026 GitHub Flex. Mã nguồn mở theo giấy phép MIT.',
      builtBy: 'Phát triển bởi',
    },
  },
  ja: {
    meta: {
      title: 'GitHub Flex - GitHubの体験を向上',
      description: 'ワイドレイアウト、テーブル/画像の拡大、GIFピッカー、サイドバー切替、編集履歴を備えたGitHub向けブラウザ拡張機能。',
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
      description: 'ワイドレイアウト、テーブル拡大、画像ライトボックス、GIFピッカー、サイドバー切替、編集履歴 - すべてが一つの拡張機能に。',
      ctaChrome: 'Chromeに追加',
      ctaFirefox: 'Firefoxに追加',
      subtext: 'Chrome • Edge • Brave • Opera • Vivaldi • Arc • Firefox',
      badgeUnikornAlt: 'Unikorn.vnのGitHub Flex',
      badgeJ2TeamAlt: 'J2TEAM LaunchのGitHub Flex',
    },
    features: {
      title: '機能',
      subtitle: 'より良いGitHub体験に必要なすべて',
      items: [
        { icon: '📐', title: 'ワイドレイアウト', description: 'GitHubを全幅に拡大してコードを読みやすく' },
        { icon: '📊', title: 'テーブル拡大', description: '全画面、列リサイズ、列の表示/非表示、高いセルの折りたたみ、状態保持機能付きの拡大可能なテーブル' },
        { icon: '🖼️', title: '画像ライトボックス', description: '画像をクリックしてズーム付きの全画面表示' },
        { icon: '🎬', title: 'GIFピッカー', description: 'GIPHY統合でコメントやissueにGIFを挿入' },
        { icon: '📑', title: 'サイドバー切替', description: 'ボタンまたはAlt+Mショートカットでサイドバーを表示/非表示' },
        { icon: '📝', title: '編集履歴', description: 'コメントの編集履歴をサイドバイサイドの差分比較で表示' },
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
        otherProjects: '他のプロジェクト',
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
      otherProjects: {
        termote: 'モバイル/デスクトップからPWAでCLIツールをリモート操作',
        tabrest: '非アクティブなタブを自動でアンロードしてメモリを解放',
        specpin: '稼働中のWeb UIに生きたビジネス仕様をピン留め',
      },
      copyright: '© 2026 GitHub Flex. MITライセンスのオープンソース。',
      builtBy: '開発：',
    },
  },
} as const;

export type TranslationKey = keyof (typeof translations)['en'];
