import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse";
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

    console.log("PDF解析開始...");

    // pdf-parseでPDFを解析
    const pdfData = await pdfParse(buffer);

    console.log(`PDF読み込み完了: ${pdfData.numpages}ページ`);
    console.log(`抽出テキスト長: ${pdfData.text.length}文字`);

    if (!pdfData.text || pdfData.text.trim().length === 0) {
      throw new Error("PDFからテキストを抽出できませんでした。画像PDFまたはスキャンPDFの可能性があります。");
    }

    // PowerPointプレゼンテーションを作成
    const pptx = new PptxGenJS();

    // テキストを行に分割
    const allLines = pdfData.text.split('\n').filter(line => line.trim());
    console.log(`総行数: ${allLines.length}行`);

    // ページ数を取得
    const totalPages = pdfData.numpages;

    // 各ページに行を分配
    const linesPerPage = Math.ceil(allLines.length / totalPages);
    console.log(`1ページあたり約${linesPerPage}行`);

    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      const pageNum = pageIndex + 1;
      console.log(`ページ ${pageNum} を作成中...`);

      // スライドを作成
      const slide = pptx.addSlide();

      // このページの行を取得
      const startLine = pageIndex * linesPerPage;
      const endLine = Math.min((pageIndex + 1) * linesPerPage, allLines.length);
      const pageLines = allLines.slice(startLine, endLine);

      console.log(`ページ ${pageNum}: ${pageLines.length}行を配置`);

      // ページ番号を追加
      slide.addText(`ページ ${pageNum} / ${totalPages}`, {
        x: 8,
        y: 0.2,
        w: 1.8,
        fontSize: 10,
        color: "999999",
        align: "right",
      });

      // テキストを配置
      let yPosition = 0.8;
      const maxY = 7; // スライドの最大Y位置
      const lineHeight = 0.25;

      for (const line of pageLines) {
        if (line.trim() && yPosition < maxY) {
          slide.addText(line.trim(), {
            x: 0.5,
            y: yPosition,
            w: 9,
            h: lineHeight,
            fontSize: 11,
            color: "000000",
            breakLine: true,
            fit: "shrink",
            valign: "top",
          });
          yPosition += lineHeight;
        }
      }

      // テキストがない場合
      if (pageLines.length === 0) {
        slide.addText(
          "このページにはテキストが配分されませんでした。",
          {
            x: 1,
            y: 3.5,
            w: 8,
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
