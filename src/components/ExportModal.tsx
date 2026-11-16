import React, { useState } from "react";
import {
  X,
  Printer,
  Download,
  Copy,
  Check,
  FileText,
  BookOpen,
} from "lucide-react";
import { Book } from "../types";

interface ExportModalProps {
  currentBook: Book;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  currentBook,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const getFullManuscriptText = () => {
    let full = `# ${currentBook.title}\n`;
    if (currentBook.subtitle) full += `## ${currentBook.subtitle}\n`;
    full += `Por: ${currentBook.author}\n\n`;
    full += `Género: ${currentBook.genre}\n`;
    full += `Sinopsis: ${currentBook.synopsis}\n\n`;
    full += `---\n\n`;

    currentBook.chapters.forEach((ch, idx) => {
      full += `### ${ch.title || `Capítulo ${idx + 1}`}\n\n`;
      full += `${ch.content}\n\n`;
      full += `* * *\n\n`;
    });

    return full;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getFullManuscriptText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const text = getFullManuscriptText();
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentBook.title.replace(/\s+/g, "_")}_Manuscrito.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadHtmlEpub = () => {
    let html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>${currentBook.title}</title>
  <style>
    body { font-family: 'Georgia', serif; line-height: 1.8; max-width: 750px; margin: 40px auto; padding: 20px; color: #222; }
    h1 { text-align: center; font-size: 2.4em; margin-bottom: 0.2em; }
    .author { text-align: center; font-style: italic; margin-bottom: 2em; }
    .chapter { page-break-before: always; margin-top: 4em; }
    h2 { font-size: 1.6em; border-bottom: 1px solid #ccc; padding-bottom: 0.3em; }
    p { text-indent: 2em; margin-bottom: 1em; text-align: justify; }
    .dropcap::first-letter { font-size: 3em; float: left; line-height: 0.8; padding-right: 8px; }
  </style>
</head>
<body>
  <h1>${currentBook.title}</h1>
  ${currentBook.subtitle ? `<h3 style="text-align:center; color:#666;">${currentBook.subtitle}</h3>` : ""}
  <p class="author">Por: ${currentBook.author}</p>
  <hr/>
`;

    currentBook.chapters.forEach((ch, idx) => {
      html += `<div class="chapter">
        <h2>${ch.title || `Capítulo ${idx + 1}`}</h2>
        ${ch.content
          .split("\n\n")
          .map((p, pIdx) => `<p class="${pIdx === 0 ? "dropcap" : ""}">${p}</p>`)
          .join("")}
      </div>`;
    });

    html += `</body></html>`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentBook.title.replace(/\s+/g, "_")}_eBook.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative text-stone-200">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold font-display-book text-stone-100">
              Exportar Manuscrito — {currentBook.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={handlePrint}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-stone-950/60 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/50 transition group text-center space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition">
              <Printer className="w-5 h-5" />
            </div>
            <span className="font-semibold text-xs text-stone-200">
              Imprimir / Guardar PDF
            </span>
            <span className="text-[11px] text-stone-400">
              Formato editorial de libro listo para impresora
            </span>
          </button>

          <button
            onClick={handleDownloadHtmlEpub}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-stone-950/60 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/50 transition group text-center space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition">
              <Download className="w-5 h-5" />
            </div>
            <span className="font-semibold text-xs text-stone-200">
              Descargar eBook (HTML)
            </span>
            <span className="text-[11px] text-stone-400">
              Compatible con lectores electrónicos y Kindle
            </span>
          </button>

          <button
            onClick={handleDownloadTxt}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-stone-950/60 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/50 transition group text-center space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition">
              <FileText className="w-5 h-5" />
            </div>
            <span className="font-semibold text-xs text-stone-200">
              Descargar Texto (.txt)
            </span>
            <span className="text-[11px] text-stone-400">
              Formato universal con capítulos ordenados
            </span>
          </button>
        </div>

        {/* Copy to clipboard bar */}
        <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-between">
          <div className="text-xs">
            <span className="font-semibold text-stone-200 block">
              Copiar todo el manuscrito al portapapeles
            </span>
            <span className="text-stone-400">
              {currentBook.chapters.length} capítulos •{" "}
              {currentBook.chapters
                .reduce(
                  (sum, c) =>
                    sum + c.content.split(/\s+/).filter(Boolean).length,
                  0
                )
                .toLocaleString()}{" "}
              palabras
            </span>
          </div>

          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs flex items-center gap-1.5 transition border border-stone-700"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-amber-400" />
                <span>Copiar texto</span>
              </>
            )}
          </button>
        </div>

        {/* Print Preview Hidden Container rendered during print */}
        <div className="hidden print:block font-book text-black">
          <h1 className="text-3xl font-bold text-center mb-2">
            {currentBook.title}
          </h1>
          {currentBook.subtitle && (
            <h2 className="text-xl text-center text-gray-700 mb-4">
              {currentBook.subtitle}
            </h2>
          )}
          <p className="text-center italic mb-12">Por: {currentBook.author}</p>

          {currentBook.chapters.map((ch, idx) => (
            <div key={ch.id} className="print-page mt-8">
              <h3 className="text-2xl font-bold mb-4 border-b pb-2">
                {ch.title || `Capítulo ${idx + 1}`}
              </h3>
              {ch.content.split("\n\n").map((p, pIdx) => (
                <p key={pIdx} className="mb-4 text-justify indent-8 text-base">
                  {p}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
