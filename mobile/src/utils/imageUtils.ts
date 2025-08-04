import { BASE_THUMBNAIL_URL } from '@env';

export const resolveThumbnailUrl = (filename: string): string =>
  `${BASE_THUMBNAIL_URL}${filename}`;