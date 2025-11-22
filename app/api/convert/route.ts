import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import PptxGenJS from "pptxgenjs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "ファイルが見つかりません" },
        { status: 400 }
      );
    }

    console.log("PDF読み込み開始...");

    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pageCount = pdfDoc.getPageCount();

    console.log(`PDF読み込み完了: ${pageCount}ページ`);

    // PowerPointプレゼンテーションを作成
    const pptx = new PptxGenJS();

    // 各ページのスライドを作成
    for (let i = 0; i < pageCount; i++) {
      const pageNum = i + 1;
      console.log(`ページ ${pageNum} のスライドを作成中...`);

      const page = pdfDoc.getPage(i);
      const { width, height } = page.getSize();

      // ポイントをインチに変換
      const slideWidth = width / 72;
      const slideHeight = height / 72;

      // スライドを作成
      const slide = pptx.addSlide();

      // タイトルを追加
      slide.addText(`PDFページ ${pageNum}`, {
        x: 0.5,
        y: 0.5,
        fontSize: 24,
        bold: true,
        color: "0066CC",
      });

      // 説明テキストを追加
      slide.addText(
        `このスライドは元のPDFの${pageNum}ページ目です。\n\n` +
        `元のサイズ: ${Math.round(width)}pt × ${Math.round(height)}pt\n\n` +
        `PowerPointで自由に編集できます。\n` +
        `テキスト、画像、図形などを追加してください。`,
        {
          x: 0.5,
          y: 2,
          w: 9,
          fontSize: 14,
          color: "333333",
        }
      );

      // 編集可能な領域を示す
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.5,
        y: 3.5,
        w: 9,
        h: 3.5,
        fill: { color: "F8F9FA" },
        line: { color: "CCCCCC", width: 1, dashType: "dash" },
      });

      slide.addText(
        "ここにコンテンツを追加してください",
        {
          x: 0.5,
          y: 5,
          w: 9,
          fontSize: 16,
          color: "999999",
          align: "center",
          italic: true,
        }
      );

      // ページ番号
      slide.addText(`${pageNum} / ${pageCount}`, {
        x: 8.5,
        y: 7,
        w: 1,
        fontSize: 10,
        color: "999999",
        align: "right",
      });
    }

    // 最初のスライド（表紙）を追加
    const coverSlide = pptx.addSlide({ masterName: "BLANK" });
    coverSlide.addText("PDF → PowerPoint 変換", {
      x: 0.5,
      y: 2,
      w: 9,
      fontSize: 36,
      bold: true,
      color: "0066CC",
      align: "center",
    });

    coverSlide.addText(
      `元のファイル: ${file.name}\n` +
      `総ページ数: ${pageCount}ページ\n\n` +
      `各スライドを編集して、コンテンツを追加してください。`,
      {
        x: 0.5,
        y: 4,
        w: 9,
        fontSize: 16,
        color: "666666",
        align: "center",
      }
    );

    // 表紙を最初に移動（スライドの順序を調整）
    pptx.slides.unshift(pptx.slides.pop()!);

    console.log("PowerPoint生成中...");

    // PowerPointファイルを生成
    const pptxArrayBuffer = await pptx.write({ outputType: "arraybuffer" });

    console.log("変換完了！");

    // PowerPointファイルを返す
    return new NextResponse(pptxArrayBuffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${file.name.replace(
          ".pdf",
          ""
        )}.pptx"`,
      },
    });
  } catch (error) {
    console.error("変換エラー:", error);
    return NextResponse.json(
      {
        error: `変換中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      },
      { status: 500 }
    );
  }
}
