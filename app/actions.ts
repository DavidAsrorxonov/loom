"use server";

import Mux from "@mux/mux-node";

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_SECRET_KEY,
});

export async function createUploadURL() {
  const upload = await mux.video.uploads.create({
    new_asset_settings: {
      playback_policies: ["public"],
      video_quality: "plus",
      mp4_support: "standard",
      input: [
        {
          generated_subtitles: [
            { language_code: "en", name: "English (Auto)" },
          ],
        },
      ],
    },
    cors_origin: "*",
  });

  return upload;
}

export async function getAssetIdFromUpload(uploadId: string) {
  const upload = await mux.video.uploads.retrieve(uploadId);

  if (upload.asset_id) {
    const asset = await mux.video.assets.retrieve(upload.asset_id);
    return {
      playbackId: asset.playback_ids?.[0]?.id,
      status: asset.status,
    };
  }

  return { status: "waiting" };
}

export async function listAllTheVideos() {
  try {
    const assets = await mux.video.assets.list({
      limit: 25,
    });

    return assets.data;
  } catch (error) {
    console.error("Error listing videos", error);
    return [];
  }
}
