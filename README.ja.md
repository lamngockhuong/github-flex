🇬🇧 [English](README.md) | 🇻🇳 [Tiếng Việt](README.vi.md) | 🇯🇵 **日本語**

# GitHub Flex

[![Version](https://img.shields.io/github/v/release/lamngockhuong/github-flex)](https://github.com/lamngockhuong/github-flex/releases)
[![CI](https://github.com/lamngockhuong/github-flex/actions/workflows/ci.yml/badge.svg)](https://github.com/lamngockhuong/github-flex/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Chrome Web Store](https://img.shields.io/badge/Chrome_Web_Store-インストール-4285F4?logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/github-flex/iechckkdnjmdnpbdohhnmojofcbfnemc)
[![Firefox Add-ons](https://img.shields.io/badge/Firefox_Add--ons-インストール-FF7139?logo=firefox&logoColor=white)](https://addons.mozilla.org/en-US/firefox/addon/github-flex/)
[![Website](https://img.shields.io/badge/Website-github--flex.ohnice.app-8957e5?logo=astro&logoColor=white)](https://github-flex.ohnice.app)

<a href="https://unikorn.vn/p/github-flex?ref=embed-github-flex" target="_blank"><img src="https://unikorn.vn/api/widgets/badge/github-flex?theme=light" alt="GitHub Flex on Unikorn.vn" style="width: 180px; height: 45px;" width="180" height="45" /></a>
<a href="https://launch.j2team.dev/products/github-flex-enhance-your-github-experience?utm_source=badge-launched&utm_medium=badge&utm_campaign=badge-github-flex-enhance-your-github-experience" target="_blank"><img src="https://launch.j2team.dev/badge/github-flex-enhance-your-github-experience/light" alt="GitHub Flex - Launched on J2TEAM Launch" style="width: 180px; height: 45px;" width="180" height="45" /></a>

GitHubのインターフェースを生産性向上機能で強化するクロスブラウザ拡張機能（Chrome & Firefox）。

<p align="center">
  <img src="assets/promo-banner-1280x800.svg" alt="GitHub Flex" width="640" />
</p>

## 機能

- **ワイドレイアウト** - GitHubを全幅に拡大してコードを読みやすく
- **テーブル拡大** - 状態保持機能付きの拡大可能なテーブル
- **画像ライトボックス** - 画像をクリックしてズーム付きの全画面表示
- **GIFピッカー** - コメントやissueにGIFを挿入
- **サイドバー切替** - ボタンまたは `Alt+M` ショートカットでサイドバーを表示/非表示
- **編集履歴** - split/unified/previewモードでコメント編集の差分を表示

<p align="center">
  <img src="assets/promo-02-wide-layout-1280x800.svg" alt="ワイドレイアウト" width="400" />
  <img src="assets/promo-03-lightbox-1280x800.svg" alt="画像ライトボックス" width="400" />
</p>
<p align="center">
  <img src="assets/promo-04-gif-picker-1280x800.svg" alt="GIFピッカー" width="400" />
  <img src="assets/promo-05-sidebar-toggle-1280x800.svg" alt="サイドバー切替" width="400" />
</p>

## インストール

### Chrome Web Store

[Chrome Web Store](https://chromewebstore.google.com/detail/github-flex/iechckkdnjmdnpbdohhnmojofcbfnemc)から直接インストール。

### Firefox Add-ons

[Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/github-flex/)から直接インストール。

### ソースから

```bash
git clone https://github.com/lamngockhuong/github-flex.git
cd github-flex
pnpm install
pnpm build
```

ブラウザに読み込み：

**Chrome:**

1. `chrome://extensions/` を開く
2. **デベロッパーモード**を有効にする（右上）
3. **パッケージ化されていない拡張機能を読み込む**をクリック
4. `dist/chrome/` フォルダを選択

**Firefox:**

1. `about:debugging#/runtime/this-firefox` を開く
2. **一時的なアドオンを読み込む**をクリック
3. `dist/firefox/` フォルダ内の任意のファイルを選択

## 開発

```bash
pnpm dev              # 両ブラウザをwatchモードでビルド
pnpm build            # 両ブラウザのプロダクションビルド
pnpm build:chrome     # Chromeのみビルド
pnpm build:firefox    # Firefoxのみビルド
pnpm lint             # コードスタイルをチェック
pnpm lint:fix         # 問題を自動修正
pnpm lint:firefox     # web-extでFirefoxビルドをlint
pnpm test             # テストを実行
```

### Firefox Add-onsへの公開

[Firefox Add-ons](https://addons.mozilla.org/)に新しいバージョンを提出する際、esbuildでバンドルしているためMozillaはソースコードのアップロードを要求します。以下のコマンドでソースzipを作成：

```bash
zip -r github-flex-source.zip src/ scripts/ package.json pnpm-lock.yaml biome.json README.md LICENSE manifest.json
```

## 言語

- English（デフォルト）
- Tiếng Việt（ベトナム語）
- 日本語

拡張機能はサポートされている場合、ブラウザの言語に合わせて自動的に表示されます。

## 技術スタック

- Manifest V3 (Chrome 88+, Firefox 112+)
- webextension-polyfill（クロスブラウザAPI互換性）
- Vanilla JavaScript (ES Modules)
- esbuild（バンドラー）
- Biome（リンター/フォーマッター）
- Vitest（テスト）

## スポンサー

この拡張機能が役立つと感じたら、開発の支援をご検討ください：

[![GitHub Sponsors](https://img.shields.io/badge/GitHub_Sponsors-サポート-ea4aaa?logo=githubsponsors&logoColor=white)](https://github.com/sponsors/lamngockhuong)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy_Me_A_Coffee-サポート-FFDD00?logo=buymeacoffee&logoColor=black)](https://buymeacoffee.com/lamngockhuong)
[![MoMo](https://img.shields.io/badge/MoMo-サポート-ae2070)](https://me.momo.vn/khuong)

## 他のプロジェクト

- [Termote](https://github.com/lamngockhuong/termote) - モバイル/デスクトップからPWAでCLIツール（Claude Code、GitHub Copilot、任意のターミナル）をリモート操作

## ライセンス

[MIT](LICENSE)
