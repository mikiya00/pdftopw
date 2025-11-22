import { NextRequest, NextResponse } from "next/server";
import PDFParser from "pdf2json";
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

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // PDFパーサーを作成
    const pdfParser = new PDFParser();

    // PDFを解析（Promiseでラップ）
    const pdfData = await new Promise<any>((resolve, reject) => {
      pdfParser.on("pdfParser_dataError", (errData: any) => {
        reject(new Error(errData.parserError));
      });

      pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
        resolve(pdfData);
      });

      pdfParser.parseBuffer(buffer);
    });

    console.log(`PDF読み込み完了: ${pdfData.Pages?.length || 0}ページ`);

    if (!pdfData.Pages || pdfData.Pages.length === 0) {
      throw new Error("PDFページが見つかりません");
    }

    // PowerPointプレゼンテーションを作成
    const pptx = new PptxGenJS();

    // 各ページを処理
    for (let pageIndex = 0; pageIndex < pdfData.Pages.length; pageIndex++) {
      const page = pdfData.Pages[pageIndex];
      const pageNum = pageIndex + 1;

      console.log(`ページ ${pageNum} を処理中...`);

      // スライドを作成
      const slide = pptx.addSlide();

      // PDFページのサイズを取得（pdf2jsonの単位をインチに変換）
      const pageWidth = (page.Width || 8.5);
      const pageHeight = (page.Height || 11);

      // テキスト要素を抽出
      const texts = page.Texts || [];
      console.log(`ページ ${pageNum}: ${texts.length}個のテキスト要素を検出`);

      // ページ番号を追加
      slide.addText(`ページ ${pageNum} / ${pdfData.Pages.length}`, {
        x: pageWidth - 2,
        y: 0.2,
        w: 1.8,
        fontSize: 10,
        color: "999999",
        align: "right",
      });

      if (texts.length > 0) {
        // テキスト要素をグループ化（行ごとに）
        interface TextLine {
          text: string;
          x: number;
          y: number;
          fontSize: number;
        }

        const lines: TextLine[] = [];
        const lineThreshold = 0.15; // Y座標の差がこの値以下なら同じ行と判断

        for (const textItem of texts) {
          const x = textItem.x || 0;
          const y = textItem.y || 0;

          // デコードされたテキストを取得
          let decodedText = "";
          if (textItem.R && textItem.R.length > 0) {
            for (const run of textItem.R) {
              if (run.T) {
                decodedText += decodeURIComponent(run.T);
              }
            }
          }

          if (!decodedText.trim()) continue;

          // フォントサイズを取得（pdf2jsonの単位）
          const fontSize = textItem.R?.[0]?.TS?.[1] || 12;

          // 既存の行に追加するか、新しい行を作成
          const existingLine = lines.find(line => Math.abs(line.y - y) < lineThreshold);

          if (existingLine && Math.abs(existingLine.x - x) < 0.5) {
            existingLine.text += " " + decodedText;
          } else {
            lines.push({
              text: decodedText,
              x: x,
              y: y,
              fontSize: fontSize,
            });
          }
        }

        // テキストをY座標でソート（上から下へ）
        lines.sort((a, b) => a.y - b.y);

        console.log(`ページ ${pageNum}: ${lines.length}行のテキストを抽出`);

        // 抽出したテキストをスライドに追加
        for (const line of lines) {
          // スライドの範囲内に収まるように調整
          const adjustedY = Math.min(Math.max(line.y, 0.5), pageHeight - 0.5);
          const adjustedX = Math.min(Math.max(line.x, 0.3), pageWidth - 0.3);
          const adjustedFontSize = Math.min(Math.max(line.fontSize, 8), 32);

          slide.addText(line.text, {
            x: adjustedX,
            y: adjustedY,
            fontSize: adjustedFontSize,
            color: "000000",
            breakLine: false,
            fit: "shrink",
            w: Math.min(pageWidth - adjustedX - 0.3, 8),
          });
        }
      } else {
        // テキストが抽出できなかった場合
        slide.addText(
          "このページにはテキストコンテンツが検出されませんでした。\n画像またはスキャンされたPDFの可能性があります。",
          {
            x: 1,
            y: pageHeight / 2 - 0.5,
            w: pageWidth - 2,
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
      {
        error: `変換中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
