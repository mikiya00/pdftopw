"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [pptxUrl, setPptxUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
        setError(null);
        setPptxUrl(null);
      } else {
        setError("PDFファイルを選択してください");
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
  });

  const handleConvert = async () => {
    if (!file) return;

    setConverting(true);
    setError(null);
    setPptxUrl(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("変換に失敗しました");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPptxUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "変換中にエラーが発生しました");
    } finally {
      setConverting(false);
    }
  };

  const handleDownload = () => {
    if (!pptxUrl) return;

    const a = document.createElement("a");
    a.href = pptxUrl;
    a.download = file?.name.replace(".pdf", ".pptx") || "converted.pptx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-4 text-gray-800 dark:text-white">
            PDF to PowerPoint 変換
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-12">
            PDFファイルをアップロードして、編集可能なPowerPointファイルに変換します
          </p>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-blue-400"
              }`}
            >
              <input {...getInputProps()} />
              <div className="space-y-4">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {isDragActive ? (
                  <p className="text-lg text-blue-600 dark:text-blue-400">
                    ファイルをドロップしてください
                  </p>
                ) : (
                  <div>
                    <p className="text-lg text-gray-700 dark:text-gray-300">
                      PDFファイルをドラッグ&ドロップ
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      またはクリックしてファイルを選択
                    </p>
                  </div>
                )}
              </div>
            </div>

            {file && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <svg
                      className="h-8 w-8 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {file.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setFile(null);
                      setPptxUrl(null);
                      setError(null);
                    }}
                    className="text-red-600 hover:text-red-800 dark:text-red-400"
                  >
                    削除
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            {file && !pptxUrl && (
              <button
                onClick={handleConvert}
                disabled={converting}
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                {converting ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    変換中...
                  </span>
                ) : (
                  "PowerPointに変換"
                )}
              </button>
            )}

            {pptxUrl && (
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-green-700 dark:text-green-400 text-center font-medium">
                    ✓ 変換が完了しました！
                  </p>
                </div>
                <button
                  onClick={handleDownload}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  PowerPointをダウンロード
                </button>
              </div>
            )}
          </div>

          <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
              使い方
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300">
              <li>PDFファイルをドラッグ&ドロップするか、クリックして選択</li>
              <li>「PowerPointに変換」ボタンをクリック</li>
              <li>変換が完了したら、PowerPointファイルをダウンロード</li>
              <li>ダウンロードしたファイルをPowerPointで開いて編集</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
