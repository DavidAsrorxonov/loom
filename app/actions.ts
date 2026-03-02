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
