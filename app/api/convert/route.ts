import { NextRequest, NextResponse } from "next/server";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import PptxGenJS from "pptxgenjs";

// PDF.jsの設定
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // PDFドキュメントを読み込む
    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    const pdfDocument = await loadingTask.promise;
    const pageCount = pdfDocument.numPages;

    console.log(`PDF読み込み完了: ${pageCount}ページ`);

    // PowerPointプレゼンテーションを作成
    const pptx = new PptxGenJS();

    // 各ページを処理
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.0 });

      // テキストコンテンツを抽出
      const textContent = await page.getTextContent();
      const textItems = textContent.items;

      console.log(`ページ ${pageNum}: ${textItems.length}個のテキスト要素を検出`);

      // スライドを作成
      const slide = pptx.addSlide();

      // PDFページのサイズに基づいてスライドサイズを設定（ポイントをインチに変換）
      const slideWidth = viewport.width / 72;
      const slideHeight = viewport.height / 72;

      // テキストアイテムをグループ化（行ごとに）
      const lines: Array<{ text: string; y: number; x: number; size: number }> = [];
      const lineThreshold = 5; // Y座標の差がこの値以下なら同じ行と判断

      for (const item of textItems) {
        if ("str" in item && item.str.trim()) {
          const transform = item.transform;
          const x = transform[4];
          const y = viewport.height - transform[5]; // Y座標を反転
          const fontSize = Math.sqrt(transform[0] * transform[0] + transform[1] * transform[1]);

          // 既存の行に追加するか、新しい行を作成
          const existingLine = lines.find(line => Math.abs(line.y - y) < lineThreshold);

          if (existingLine && Math.abs(existingLine.x + existingLine.text.length * 5 - x) < 50) {
            existingLine.text += " " + item.str;
          } else {
            lines.push({
              text: item.str,
              x: x / 72, // インチに変換
              y: y / 72, // インチに変換
              size: Math.max(fontSize * 0.75, 10), // フォントサイズを調整
            });
          }
        }
      }

      // テキストをY座標でソート（上から下へ）
      lines.sort((a, b) => a.y - b.y);

      console.log(`ページ ${pageNum}: ${lines.length}行のテキストを抽出`);

      // ページ番号を追加
      slide.addText(`ページ ${pageNum} / ${pageCount}`, {
        x: slideWidth - 2,
        y: 0.2,
        w: 1.8,
        fontSize: 10,
        color: "999999",
        align: "right",
      });

      // 抽出したテキストをスライドに追加
      if (lines.length > 0) {
        for (const line of lines) {
          // スライドの範囲内に収まるように調整
          const adjustedY = Math.min(Math.max(line.y, 0.5), slideHeight - 0.5);
          const adjustedX = Math.min(Math.max(line.x, 0.3), slideWidth - 0.3);

          slide.addText(line.text, {
            x: adjustedX,
            y: adjustedY,
            fontSize: Math.min(line.size, 28),
            color: "000000",
            breakLine: false,
            fit: "shrink",
            w: Math.min(slideWidth - adjustedX - 0.3, 8),
          });
        }
      } else {
        // テキストが抽出できなかった場合
        slide.addText(
          "このページにはテキストコンテンツが検出されませんでした。\n画像またはスキャンされたPDFの可能性があります。",
          {
            x: 1,
            y: slideHeight / 2 - 0.5,
            w: slideWidth - 2,
            fontSize: 14,
            color: "666666",
            align: "center",
          }
        );
      }
    }

    console.log("PowerPoint生成中...");

    // PowerPointファイルを生成
    const pptxArrayBuffer = await pptx.write({ outputType: "arraybuffer" });

    console.log("変換完了");

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
      { error: `変換中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}` },
      { status: 500 }
    );
  }
}
