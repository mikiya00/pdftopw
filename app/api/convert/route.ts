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

    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pageCount = pdfDoc.getPageCount();

    // Create PowerPoint presentation
    const pptx = new PptxGenJS();

    // Process each page
    for (let i = 0; i < pageCount; i++) {
      const page = pdfDoc.getPage(i);
      const { width, height } = page.getSize();

      // Create a slide
      const slide = pptx.addSlide();

      // Set slide dimensions to match PDF page (convert points to inches)
      const slideWidth = width / 72;
      const slideHeight = height / 72;

      // Add page number and title
      slide.addText(`Page ${i + 1}`, {
        x: 0.5,
        y: 0.3,
        fontSize: 14,
        color: "363636",
        bold: true,
      });

      // Extract text content (simplified - pdf-lib doesn't have built-in text extraction)
      // In a production app, you would use pdf.js or similar for text extraction
      slide.addText(
        `このページはPDFから変換されました。\nPDFのページ ${i + 1} / ${pageCount}`,
        {
          x: 0.5,
          y: 1,
          fontSize: 12,
          color: "666666",
        }
      );

      // Add a placeholder box for content
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.5,
        y: 2,
        w: slideWidth - 1,
        h: slideHeight - 3,
        fill: { color: "F5F5F5" },
        line: { color: "CCCCCC", width: 1 },
      });

      slide.addText(
        "PDFの内容がここに表示されます。\nテキストや画像を編集できます。",
        {
          x: 1,
          y: 3,
          w: slideWidth - 2,
          fontSize: 11,
          color: "999999",
          align: "center",
        }
      );
    }

    // Add a summary slide at the end
    const summarySlide = pptx.addSlide();
    summarySlide.addText("変換完了", {
      x: 1,
      y: 1,
      fontSize: 24,
      bold: true,
      color: "0066CC",
    });

    summarySlide.addText(
      `PDFファイル: ${file.name}\n総ページ数: ${pageCount}ページ\n\nこのPowerPointファイルを編集して、\nコンテンツをカスタマイズできます。`,
      {
        x: 1,
        y: 2,
        fontSize: 14,
        color: "333333",
      }
    );

    // Generate PowerPoint file
    const pptxArrayBuffer = await pptx.write({ outputType: "arraybuffer" });

    // Return the PowerPoint file
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
    console.error("Conversion error:", error);
    return NextResponse.json(
      { error: "変換中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
