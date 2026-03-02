"use client";

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
    } catch (error) {}
  };

  return <div>ScreenRecorder</div>;
};

export default ScreenRecorder;
