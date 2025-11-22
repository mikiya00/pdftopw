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
- **PDF処理**: pdf2json（テキスト・位置情報抽出）、pdf-parse
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

- ✅ 各PDFページが個別のスライドになります
- ✅ PDFからテキストを自動抽出して配置
- ✅ 元のレイアウトに近い位置にテキストを配置
- ✅ フォントサイズも可能な限り保持
- ✅ ページ番号が表示されます
- ✅ PowerPointで自由に編集できます

### 変換の仕組み

1. **pdf2json**を使用してPDFからテキストコンテンツと位置情報を抽出
2. 各テキスト要素の位置（X, Y座標）、サイズ、内容を解析
3. テキストを行ごとにグループ化して整理
4. PowerPointスライドに元の位置とサイズで配置
5. 編集可能なテキストボックスとして出力

### 対応しているPDF

- ✅ テキストベースのPDF（通常のPDF作成ソフトで作成されたもの）
- ⚠️ スキャンされたPDF（画像として保存されているもの）は、テキスト抽出ができません
  - OCR処理が必要な場合は、今後の改善で対応予定

### 今後の改善予定

- [ ] 画像の抽出と配置
- [ ] フォントスタイル（太字、斜体など）の保持
- [ ] 色情報の保持
- [ ] テキストアライメントの改善
- [ ] バッチ変換機能
- [ ] OCR対応（スキャンPDF対応）
- [ ] クラウドストレージ連携

## ライセンス

MIT

## 貢献

プルリクエストやイシューの報告を歓迎します。

## サポート

問題が発生した場合は、GitHubのIssuesでお知らせください。
