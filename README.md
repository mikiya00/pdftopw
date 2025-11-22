# PDF to PowerPoint Converter

PDFファイルをパワーポイント（PowerPoint）形式に変換して、編集可能にするWebアプリケーションです。

## 機能

- 📄 PDFファイルのアップロード（ドラッグ&ドロップ対応）
- 🔄 PDF → PowerPoint 変換
- 💾 PowerPointファイルのダウンロード
- ✏️ 変換後のPowerPointファイルを編集可能
- 🎨 モダンで使いやすいUI

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router), React, TypeScript
- **スタイリング**: Tailwind CSS
- **PDF処理**: pdf-lib
- **PowerPoint生成**: pptxgenjs
- **ファイルアップロード**: react-dropzone

## セットアップ

### 必要な環境

- Node.js 18.0以上
- npm または yarn

### インストール

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

開発サーバーが起動したら、ブラウザで `http://localhost:3000` にアクセスしてください。

### ビルド

```bash
# プロダクションビルド
npm run build

# プロダクションサーバーの起動
npm start
```

## 使い方

1. Webアプリケーションにアクセス
2. PDFファイルをドラッグ&ドロップ、またはクリックして選択
3. 「PowerPointに変換」ボタンをクリック
4. 変換完了後、「PowerPointをダウンロード」ボタンをクリック
5. ダウンロードしたPowerPointファイルをMicrosoft PowerPointやGoogle Slidesで開いて編集

## プロジェクト構成

```
pdftopw/
├── app/
│   ├── api/
│   │   └── convert/
│   │       └── route.ts      # PDF→PowerPoint変換API
│   ├── globals.css           # グローバルスタイル
│   ├── layout.tsx            # レイアウトコンポーネント
│   └── page.tsx              # メインページ
├── public/                   # 静的ファイル
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

## 機能詳細

### PDF変換

PDFファイルの各ページをPowerPointのスライドに変換します。変換後のPowerPointファイルは：

- 各PDFページが個別のスライドになります
- ページ番号が表示されます
- 編集可能なテキストボックスとして配置されます
- PowerPointで自由に編集できます

### 今後の改善予定

- [ ] PDFからのテキスト抽出精度向上
- [ ] 画像の抽出と配置
- [ ] フォントスタイルの保持
- [ ] レイアウトの改善
- [ ] バッチ変換機能
- [ ] クラウドストレージ連携

## ライセンス

MIT

## 貢献

プルリクエストやイシューの報告を歓迎します。

## サポート

問題が発生した場合は、GitHubのIssuesでお知らせください。
