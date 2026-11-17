import React, { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  X,
  Smartphone,
  Download,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  FileCode2,
  Share,
  CheckCircle2,
  AlertTriangle,
  QrCode,
} from "lucide-react";
import { usePWAInstall } from "../hooks/usePWAInstall";

interface AndroidApkModalProps {
  onClose: () => void;
}

const CAPACITOR_SCRIPT = `#!/bin/bash
# Script oficial para compilar el APK nativo de Voz a Libro con Capacitor + Android Studio
# Requisitos: Node.js 18+, Java JDK 17+ y Android Studio / Android SDK instalado

npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Voz a Libro" "com.vozalibro.app" --web-dir=dist
npm run build
npx cap add android
npx cap sync android
npx cap open android`;

export const AndroidApkModal: React.FC<AndroidApkModalProps> = ({ onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } =
    usePWAInstall();
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [showScriptCode, setShowScriptCode] = useState(false);
  const [useSharedUrl, setUseSharedUrl] = useState(true);
  const urlInputRef = useRef<HTMLInputElement>(null);

  const sharedAppUrl =
    "https://ais-pre-saeixb2esdxng552naqiv6-509571624736.us-west2.run.app";

  const currentOrigin =
    typeof window !== "undefined" ? window.location.origin : sharedAppUrl;

  const activeUrl = useSharedUrl ? sharedAppUrl : currentOrigin;

  const pwaBuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(
    sharedAppUrl
  )}`;

  const handleDirectInstall = async () => {
    const ok = await install();
    if (ok) {
      setInstallSuccess(true);
    }
  };

  const handleCopyUrl = async () => {
    setCopyError(false);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(activeUrl);
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2500);
        return;
      }
    } catch {
      // Fallback below if iframe sandbox blocks navigator.clipboard
    }

    try {
      if (urlInputRef.current) {
        urlInputRef.current.select();
        urlInputRef.current.setSelectionRange(0, 99999);
        const ok = document.execCommand("copy");
        if (ok) {
          setCopiedUrl(true);
          setTimeout(() => setCopiedUrl(false), 2500);
          return;
        }
      }
      setCopyError(true);
    } catch {
      setCopyError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-stone-900 border border-white/15 rounded-3xl max-w-2xl w-full p-6 sm:p-7 space-y-5 shadow-2xl relative text-stone-100 my-8">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-400 via-cyan-500 to-blue-500 flex items-center justify-center text-stone-950 shadow-lg">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                Android &amp; APK
              </span>
              <h2 className="text-xl font-extrabold text-white">
                Instalar en Android / Obtener APK
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Section — Works 100% inside the preview iframe */}
        <div className="bg-gradient-to-br from-emerald-500/15 via-cyan-500/10 to-transparent border border-emerald-400/40 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-5">
          <div className="bg-white p-3 rounded-2xl shadow-lg shrink-0">
            <QRCodeSVG
              value={activeUrl}
              size={136}
              level="M"
              includeMargin={false}
            />
          </div>

          <div className="space-y-2.5 text-xs flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-400 text-stone-950">
                <QrCode className="w-3.5 h-3.5" />
                Escanea con tu Android
              </span>
              {isAndroid && (
                <span className="text-[11px] text-emerald-300 font-semibold">
                  Android detectado
                </span>
              )}
            </div>

            <p className="text-stone-200 leading-relaxed">
              Apunta la cámara de tu celular Android a este código QR para abrir{" "}
              <strong>Voz a Libro</strong> directo en{" "}
              <strong>Google Chrome</strong>. Luego toca el menú{" "}
              <strong>(⋮) → &quot;Instalar aplicación&quot;</strong> para que
              quede instalada en tu celular como app normal.
            </p>

            {/* Toggle Shared vs Current URL */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setUseSharedUrl(true)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                  useSharedUrl
                    ? "bg-emerald-400 text-stone-950 border-emerald-300"
                    : "bg-stone-800 text-stone-300 border-white/10 hover:bg-stone-700"
                }`}
              >
                Enlace compartido
              </button>
              <button
                type="button"
                onClick={() => setUseSharedUrl(false)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                  !useSharedUrl
                    ? "bg-emerald-400 text-stone-950 border-emerald-300"
                    : "bg-stone-800 text-stone-300 border-white/10 hover:bg-stone-700"
                }`}
              >
                Enlace actual
              </button>
            </div>
          </div>
        </div>

        {/* Direct Install Button if running outside sandboxed iframe */}
        {(installSuccess || isInstalled || isInstallable || isIOS) && (
          <div className="bg-stone-950/70 border border-white/10 rounded-2xl p-4">
            {installSuccess || isInstalled ? (
              <div className="text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>¡La aplicación ya está instalada en modo App Nativa!</span>
              </div>
            ) : isInstallable ? (
              <button
                type="button"
                onClick={handleDirectInstall}
                className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-stone-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg transition"
              >
                <Download className="w-5 h-5" />
                <span>Instalar App en Android Ahora</span>
              </button>
            ) : isIOS ? (
              <div className="text-xs text-stone-200">
                <p className="font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                  <Share className="w-4 h-4" />
                  En iPhone / iPad (Safari):
                </p>
                Toca <strong>Compartir</strong> y luego{" "}
                <strong>&quot;Agregar a inicio&quot;</strong>.
              </div>
            ) : null}
          </div>
        )}

        {/* Copyable URL Box */}
        <div className="bg-stone-950/90 border border-white/10 rounded-2xl p-4 space-y-2">
          <label className="text-xs font-bold text-stone-300 block">
            O copia el enlace manualmente:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              ref={urlInputRef}
              type="text"
              readOnly
              value={activeUrl}
              onClick={(e) => e.currentTarget.select()}
              className="flex-1 bg-stone-900 border border-white/15 rounded-xl px-3 py-2 text-xs font-mono text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <button
              type="button"
              onClick={handleCopyUrl}
              className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition shrink-0"
            >
              {copiedUrl ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar enlace</span>
                </>
              )}
            </button>
          </div>
          {copyError && (
            <p className="text-[11px] text-amber-300">
              Selecciona el texto del recuadro de arriba y cópialo manualmente.
            </p>
          )}
        </div>

        {/* Honest explanation about APK & Preview Sandbox */}
        <div className="bg-stone-950/70 border border-white/10 rounded-2xl p-4 space-y-3">
          <div className="flex items-start gap-2.5 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-amber-300">
                ¿Por qué no baja un archivo .APK directo desde esta vista previa?
              </p>
              <p className="text-stone-300 leading-relaxed">
                1) Este servidor es solo Web (Node.js) y no incluye Java/Android
                SDK para compilar archivos <strong>.apk</strong> binarios.
                <br />
                2) El marco de vista previa de AI Studio bloquea descargas y
                ventanas externas por seguridad. Para abrir enlaces externos o
                descargas, usa el botón{" "}
                <strong>&quot;Abrir en pestaña nueva&quot;</strong> arriba de
                la vista previa de AI Studio o escanea el QR.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <a
              href={pwaBuilderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-rose-500 to-violet-500 hover:from-amber-300 hover:via-rose-400 hover:to-violet-400 text-stone-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Abrir PWABuilder (Generar .APK)</span>
            </a>

            <a
              href="/api/download-android-script"
              download="compilar-apk-android.sh"
              className="py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 font-bold text-xs border border-white/10 flex items-center justify-center gap-2 transition"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Script .SH</span>
            </a>

            <button
              type="button"
              onClick={() => setShowScriptCode(!showScriptCode)}
              className="py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs border border-white/10 flex items-center justify-center gap-1.5 transition"
            >
              <FileCode2 className="w-4 h-4 text-amber-400" />
              <span>{showScriptCode ? "Ocultar" : "Ver comandos"}</span>
            </button>
          </div>

          {showScriptCode && (
            <pre className="p-3 rounded-xl bg-black/70 border border-white/10 text-[11px] font-mono text-emerald-300 overflow-x-auto select-all">
              {CAPACITOR_SCRIPT}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};
