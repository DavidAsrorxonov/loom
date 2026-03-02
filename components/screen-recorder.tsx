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

  return <div>ScreenRecorder</div>;
};

export default ScreenRecorder;
