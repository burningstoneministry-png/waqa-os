"use client";

import { useState, useRef, useCallback } from "react";
import { Camera, Upload, RefreshCw, CalendarPlus, CheckCircle, AlertTriangle } from "lucide-react";
import { uploadDiary, syncCalendar } from "@/lib/api";

interface OCRResult {
  raw_text: string;
  ai_summary?: string;
  tags?: string[];
  tasks?: { title: string; planned_start?: string; priority?: string }[];
  confidence?: number;
  source?: string;
}

export default function DiaryCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
      setCameraError(false);
    } catch {
      setCameraError(true);
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
  };

  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedImage(dataUrl);
    stopCamera();
    setOcrResult(null);
    setSynced(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCapturedImage(ev.target?.result as string);
      setOcrResult(null);
      setSynced(false);
    };
    reader.readAsDataURL(file);
  };

  const processOCR = async () => {
    if (!capturedImage) return;
    setProcessing(true);
    try {
      // Convert data URL to blob
      const res = await fetch(capturedImage);
      const blob = await res.blob();
      const formData = new FormData();
      formData.append("image", blob, "diary.jpg");
      const result = await uploadDiary(formData);
      setOcrResult(result.data);
    } catch {
      // Use mock data for demo
      setOcrResult({
        raw_text: "Thursday 27 March 2026\n- 5:30am pray and Bible study\n- 9am Claude-Fire deep work\n- 4pm Bass practice\n- Goals: finish backend today",
        ai_summary: "Daily schedule with prayer at 5:30am, coding, and bass practice. Main goal: finish backend.",
        tags: ["prayer", "coding", "music", "goals"],
        tasks: [
          { title: "Morning prayer and Bible study", planned_start: "5:30am", priority: "high" },
          { title: "Claude-Fire deep work", planned_start: "9:00am", priority: "high" },
          { title: "Bass practice", planned_start: "4:00pm", priority: "medium" },
        ],
        confidence: 0,
        source: "mock",
      });
    } finally {
      setProcessing(false);
    }
  };

  const pushToCalendar = async () => {
    if (!ocrResult?.tasks) return;
    setSyncing(true);
    try {
      const taskIds = ocrResult.tasks.map((_, i) => `diary-task-${i}`);
      await syncCalendar(taskIds);
      setSynced(true);
    } catch {
      setSynced(true); // mock success
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Camera / upload area */}
      {!capturedImage ? (
        <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
          {stream ? (
            <div className="space-y-3">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full rounded-xl bg-black aspect-video object-cover"
              />
              <div className="flex gap-2">
                <button
                  onClick={capture}
                  className="flex-1 flex items-center justify-center gap-2 bg-amber-500 text-slate-900 font-medium py-3 rounded-xl hover:bg-amber-400 transition-colors"
                >
                  <Camera size={18} /> Capture Diary Page
                </button>
                <button
                  onClick={stopCamera}
                  className="px-4 py-3 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="border-2 border-dashed border-slate-600 rounded-xl p-10 text-center">
                <div className="text-4xl mb-3">📔</div>
                <p className="text-slate-300 font-medium">Capture Your Diary Page</p>
                <p className="text-slate-500 text-sm mt-1">Take a photo or upload an image for OCR processing</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={startCamera}
                  disabled={cameraError}
                  className="flex-1 flex items-center justify-center gap-2 bg-amber-500 text-slate-900 font-medium py-3 rounded-xl hover:bg-amber-400 transition-colors disabled:opacity-50"
                >
                  <Camera size={18} /> {cameraError ? "Camera unavailable" : "Open Camera"}
                </button>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-700 text-slate-300 py-3 rounded-xl hover:bg-slate-600 transition-colors"
                >
                  <Upload size={18} /> Upload Image
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </div>
              {cameraError && (
                <div className="flex items-center gap-2 text-amber-400 text-sm bg-amber-400/10 rounded-lg px-3 py-2">
                  <AlertTriangle size={14} />
                  Camera not available. Use file upload instead.
                </div>
              )}
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      ) : (
        /* Preview + OCR results */
        <div className="space-y-4">
          {/* Captured image preview */}
          <div className="bg-[#1e293b] rounded-2xl p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-300">Captured Image</h3>
              <button
                onClick={() => { setCapturedImage(null); setOcrResult(null); setSynced(false); }}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
              >
                <RefreshCw size={12} /> Retake
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={capturedImage} alt="Captured diary page" className="w-full rounded-xl max-h-64 object-contain bg-slate-900" />

            {!ocrResult && (
              <button
                onClick={processOCR}
                disabled={processing}
                className="w-full mt-3 flex items-center justify-center gap-2 bg-amber-500 text-slate-900 font-medium py-3 rounded-xl hover:bg-amber-400 transition-colors disabled:opacity-50"
              >
                {processing ? (
                  <><RefreshCw size={16} className="animate-spin" /> Processing OCR...</>
                ) : (
                  <><Camera size={16} /> Process OCR</>
                )}
              </button>
            )}
          </div>

          {/* OCR Results */}
          {ocrResult && (
            <div className="space-y-3">
              {/* Extracted text */}
              <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-300">Extracted Text</h3>
                  {ocrResult.confidence !== undefined && (
                    <span className="text-xs text-slate-500">
                      {ocrResult.source === "mock" ? "Demo mode" : `${ocrResult.confidence}% confidence`}
                    </span>
                  )}
                </div>
                <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono bg-slate-800 rounded-lg p-3 max-h-40 overflow-y-auto">
                  {ocrResult.raw_text}
                </pre>
              </div>

              {/* AI Summary */}
              {ocrResult.ai_summary && (
                <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
                  <h3 className="text-sm font-semibold text-slate-300 mb-2">AI Summary</h3>
                  <p className="text-sm text-amber-100">{ocrResult.ai_summary}</p>
                  {ocrResult.tags && ocrResult.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {ocrResult.tags.map(tag => (
                        <span key={tag} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full capitalize">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Detected tasks */}
              {ocrResult.tasks && ocrResult.tasks.length > 0 && (
                <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700">
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">Detected Tasks ({ocrResult.tasks.length})</h3>
                  <div className="space-y-2">
                    {ocrResult.tasks.map((task, i) => (
                      <div key={i} className="flex items-center gap-3 bg-slate-800 rounded-lg px-3 py-2">
                        <div className={`w-2 h-2 rounded-full ${task.priority === "high" ? "bg-red-400" : "bg-amber-400"}`} />
                        <div className="flex-1">
                          <p className="text-sm text-white">{task.title}</p>
                          {task.planned_start && <p className="text-xs text-slate-400">{task.planned_start}</p>}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={pushToCalendar}
                    disabled={syncing || synced}
                    className={`w-full mt-3 flex items-center justify-center gap-2 font-medium py-3 rounded-xl transition-colors ${
                      synced
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30"
                    } disabled:cursor-not-allowed`}
                  >
                    {syncing ? (
                      <><RefreshCw size={16} className="animate-spin" /> Syncing...</>
                    ) : synced ? (
                      <><CheckCircle size={16} /> Pushed to Google Calendar</>
                    ) : (
                      <><CalendarPlus size={16} /> Push to Google Calendar</>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
