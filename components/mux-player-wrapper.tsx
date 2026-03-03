"use client";

import MuxPlayer from "@mux/mux-player-react";

interface MuxPlayerProps {
  playbackId: string;
  title?: string;
}

const MuxPlayerWrapper = ({ playbackId, title }: MuxPlayerProps) => {
  return (
    <MuxPlayer
      playbackId={playbackId}
      metadata={{ video_title: title || "Screen Recording" }}
      streamType="on-demand"
      autoPlay={false}
      accentColor="#3b82f6"
    />
  );
};

export default MuxPlayerWrapper;
