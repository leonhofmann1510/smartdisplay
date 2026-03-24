import { Request, Response } from "express";
import { sendSuccess, sendError } from "../utils/response";
import { JsonHandler } from "../utils/jsonHandler";
import { ITrack } from "../../../shared/models/ITrack";
import { ITrackState } from "../../../shared/models/ITrackState";
import { IMusicAction } from "../../../shared/models/IMusicAction";
import { readdir } from "fs/promises";
import path from "path";

let store: JsonHandler | null = null;
const getStore = (): Promise<JsonHandler> => {
  if (!store) return JsonHandler.open("musicData").then(s => (store = s));
  return Promise.resolve(store);
};

const PLAYLIST_DIR = path.join(__dirname, "../../public/audio/playlist");
const DEFAULT_COVER = "/img/cover/stadler.jpg";

let parseFile: ((path: string) => Promise<any>) | null = null;
const getParser = async () => {
  if (!parseFile) {
    const mm = await import("music-metadata");
    parseFile = mm.parseFile;
  }
  return parseFile;
};

let cachedPlaylist: ITrack[] | null = null;
let playlistScanTime = 0;
const SCAN_INTERVAL = 30_000;

const scanPlaylist = async (): Promise<ITrack[]> => {
  if (cachedPlaylist && Date.now() - playlistScanTime < SCAN_INTERVAL) {
    return cachedPlaylist;
  }

  try {
    const parse = await getParser();
    const files = await readdir(PLAYLIST_DIR);
    const mp3Files = files.filter(f => f.toLowerCase().endsWith(".mp3"));

    const tracks: ITrack[] = [];
    for (const file of mp3Files) {
      const filePath = path.join(PLAYLIST_DIR, file);
      try {
        const metadata = await parse(filePath);
        tracks.push({
          title: metadata.common.title || file.replace(/\.mp3$/i, ""),
          artist: metadata.common.artist || "Unknown",
          audioUrl: `/audio/playlist/${file}`,
          coverUrl: metadata.common.picture?.length ? `/api/widget/music/cover/${tracks.length}` : DEFAULT_COVER,
          duration: metadata.format.duration || 0
        });
      } catch {
        tracks.push({
          title: file.replace(/\.mp3$/i, ""),
          artist: "Unknown",
          audioUrl: `/audio/playlist/${file}`,
          coverUrl: DEFAULT_COVER,
          duration: 0
        });
      }
    }

    cachedPlaylist = tracks;
    playlistScanTime = Date.now();
    return tracks;
  } catch {
    return [];
  }
};

const buildState = (s: JsonHandler, playlist: ITrack[]): ITrackState => {
  const index = s.get<number>("currentIndex") ?? 0;
  const isPlaying = s.get<boolean>("isPlaying") ?? false;
  const trackTime = s.get<number>("trackTime") ?? 0;

  const current = playlist[index] ?? null;
  const next = playlist[index + 1] ?? null;

  return {
    currentTrack: current,
    nextTrack: next,
    trackTime,
    isPlaying,
    playlist
  };
};

export const getMusicState = async (req: Request, res: Response) => {
  const s = await getStore();
  const playlist = await scanPlaylist();
  const state = buildState(s, playlist);
  sendSuccess(res, state, "Music state retrieved successfully");
};

export const postMusicAction = async (req: Request, res: Response) => {
  const { action, value } = req.body as IMusicAction;
  const s = await getStore();
  const playlist = await scanPlaylist();

  if (playlist.length === 0) {
    sendError(res, "No tracks in playlist");
    return;
  }

  const currentIndex = s.get<number>("currentIndex") ?? 0;

  switch (action) {
    case "play":
      s.set("isPlaying", true);
      break;

    case "pause":
      s.set("isPlaying", false);
      break;

    case "next": {
      const nextIndex = (currentIndex + 1) % playlist.length;
      s.set("currentIndex", nextIndex);
      s.set("trackTime", 0);
      s.set("isPlaying", true);
      break;
    }

    case "prev": {
      const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
      s.set("currentIndex", prevIndex);
      s.set("trackTime", 0);
      s.set("isPlaying", true);
      break;
    }

    case "seek":
      if (typeof value === "number") {
        s.set("trackTime", value);
      }
      break;
  }

  const state = buildState(s, playlist);
  sendSuccess(res, state, "Music action applied");
};

export const getMusicCover = async (req: Request, res: Response) => {
  const index = parseInt(String(req.params.index), 10);
  const playlist = await scanPlaylist();

  if (isNaN(index) || index < 0 || index >= playlist.length) {
    res.status(404).send("Not found");
    return;
  }

  try {
    const parse = await getParser();
    const files = (await readdir(PLAYLIST_DIR)).filter(f => f.toLowerCase().endsWith(".mp3"));
    const filePath = path.join(PLAYLIST_DIR, files[index]);
    const metadata = await parse(filePath);
    const picture = metadata.common.picture?.[0];

    if (picture) {
      res.set("Content-Type", picture.format);
      res.set("Cache-Control", "public, max-age=86400");
      res.send(picture.data);
      return;
    }
  } catch {}

  res.redirect(DEFAULT_COVER);
};

export const syncTrackTime = async (req: Request, res: Response) => {
  const { trackTime } = req.body as { trackTime: number };
  const s = await getStore();
  s.set("trackTime", trackTime);
  sendSuccess(res, null, "Track time synced");
};
