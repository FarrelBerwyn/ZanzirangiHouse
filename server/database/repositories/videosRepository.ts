import { getDatabaseAdapter } from '../index.ts';
import { VideoData } from '../../../src/services/contentApi.ts';

export class VideosRepository {
  async get(): Promise<VideoData> {
    return getDatabaseAdapter().getVideos();
  }

  async update(data: Partial<VideoData>, userEmail: string): Promise<VideoData> {
    return getDatabaseAdapter().updateVideos(data, userEmail);
  }
}

export const videosRepository = new VideosRepository();
