"use client";

import { createUploadURL, getAssetIdFromUpload } from "@/app/actions";
import { Monitor, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const ScreenRecorder = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const liveVideoRef = useRef<HTMLVideoElement>(null);

  const router = useRouter();

  const startRecording = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
        video: false,
      });

      screenStreamRef.current = screenStream;
      micStreamRef.current = micStream;

      const combinedStream = new MediaStream([
        ...screenStream.getVideoTracks(),
        ...micStream.getAudioTracks(),
      ]);

      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = combinedStream;
      }

      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: "video/webm; codecs=vp9",
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });

        setMediaBlob(blob);

        if (liveVideoRef.current) {
          liveVideoRef.current.srcObject = null;
        }

        screenStreamRef.current?.getTracks().forEach((t) => t.stop());
        micStreamRef.current?.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      screenStream.getVideoTracks()[0].onended = stopRecording;
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleUpload = async () => {
    if (!mediaBlob) return;

    setIsUploading(true);

    try {
      const uploadConfig = await createUploadURL();

      await fetch(uploadConfig.url, {
        method: "PUT",
        body: mediaBlob,
      });

      while (true) {
        const result = await getAssetIdFromUpload(uploadConfig.id);
        if (result.playbackId) {
          router.push(`/video/${result.playbackId}`);
          break;
        }
        await new Promise((r) => setTimeout(r, 1000));
      }
    } catch (error) {
      console.error("Upload failed", error);
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-slate-900 rounded-xl border border-slate-700 w-full max-w-md shadow-2xl">
      <h2 className="text-2xl font-bold text-white">
        {isRecording ? "Recording..." : "New Recording"}
      </h2>

      <div className="w-full aspect-video bg-black rounded-lg border border-slate-800 flex items-center justify-center relative overflow-hidden">
        <video
          ref={liveVideoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${isRecording ? "block" : "hidden"}`}
        />

        {!isRecording && mediaBlob && (
          <div className="text-emerald-400 flex flex-col items-center">
            <Video className="w-12 h-12 mb-2" />
            <span>Recording Ready</span>
          </div>
        )}

        {!isRecording && !mediaBlob && (
          <div className="text-slate-600 flex flex-col items-center">
            <Monitor className="w-12 h-12 mb-2 opacity-50" />
            <span>Preview Area</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScreenRecorder;
