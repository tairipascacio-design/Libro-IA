import { Request, Response } from "express";
import {
  organizeDictationWithGemini,
  refineChapterWithGemini,
  generateContinuationPrompts,
} from "./geminiService";

export async function handleOrganizeDictation(req: Request, res: Response) {
  try {
    const { dictation, book, mode, currentChapterId } = req.body;
    if (!dictation || typeof dictation !== "string") {
      res.status(400).json({ error: "Se requiere el texto del dictado." });
      return;
    }
    if (!book) {
      res.status(400).json({ error: "Se requiere el contexto del libro." });
      return;
    }

    const result = await organizeDictationWithGemini(
      dictation,
      book,
      mode || "auto_chronology",
      currentChapterId
    );
    res.json(result);
  } catch (error: any) {
    console.error("Error in handleOrganizeDictation:", error);
    res.status(500).json({
      error: error?.message || "Error procesando el dictado con Gemini.",
    });
  }
}

export async function handleRefineChapter(req: Request, res: Response) {
  try {
    const { content, bookGenre, instruction } = req.body;
    if (!content) {
      res.status(400).json({ error: "Contenido del capítulo requerido." });
      return;
    }
    const refined = await refineChapterWithGemini(
      content,
      bookGenre || "Novela",
      instruction || "Mejorar estilo literario y riqueza descriptiva"
    );
    res.json({ refinedText: refined });
  } catch (error: any) {
    console.error("Error in handleRefineChapter:", error);
    res.status(500).json({
      error: error?.message || "Error al refinar capítulo.",
    });
  }
}

export async function handleContinuationPrompts(req: Request, res: Response) {
  try {
    const { book, currentChapterId } = req.body;
    if (!book) {
      res.status(400).json({ error: "Contexto del libro requerido." });
      return;
    }
    const prompts = await generateContinuationPrompts(book, currentChapterId);
    res.json({ prompts });
  } catch (error: any) {
    console.error("Error in handleContinuationPrompts:", error);
    res.status(500).json({
      error: error?.message || "Error al generar sugerencias.",
    });
  }
}

export function handleDownloadAndroidScript(_req: Request, res: Response) {
  const scriptContent = `#!/bin/bash
# Script oficial para compilar el APK nativo de Voz a Libro con Capacitor + Android Studio
# Requisitos: Node.js 18+, Java JDK 17+ y Android Studio / Android SDK instalado

echo "1. Instalando Capacitor para Android..."
npm install @capacitor/core @capacitor/cli @capacitor/android

echo "2. Inicializando proyecto Android..."
npx cap init "Voz a Libro" "com.vozalibro.app" --web-dir=dist

echo "3. Compilando web app..."
npm run build

echo "4. Agregando plataforma Android..."
npx cap add android
npx cap sync android

echo "5. Abriendo Android Studio para generar el APK (Build > Build Bundle(s) / APK(s) > Build APK)..."
npx cap open android
`;

  res.setHeader("Content-Type", "text/x-shellscript; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="compilar-apk-android.sh"'
  );
  res.end(scriptContent);
}

