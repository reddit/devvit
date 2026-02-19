export type MediaAsset = {
  mediaId: string;
  mediaUrl: string;
};

export type UploadMediaOptions = {
  url: string;
  type: 'image' | 'gif' | 'video';
};

export type MediaPlugin = {
  /**
   * Uploads media from external URL to Reddit
   *
   * @param options - URL and media type (image, gif, video)
   * @returns A Promise that resolves to a MediaAsset object.
   * @example
   * ```ts
   *  const response = await context.media.upload({
   *    url: "https://media2.giphy.com/media/xTiN0CNHgoRf1Ha7CM/giphy.gif",
   *    type: "gif"
   *  });
   *  res.json({
   *    imageUrl: response.mediaUrl // This reddit hosted URL can be displayed by your client
   *  });
   * ```
   */
  upload(opts: UploadMediaOptions): Promise<MediaAsset>;
};
