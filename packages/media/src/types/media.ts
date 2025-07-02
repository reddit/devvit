export type MediaAsset = {
  /** The unique identifier for the media asset. */
  mediaId: string;
  /** The Reddit URL where the media asset can be accessed. */
  mediaUrl: string;
};

export type UploadMediaOptions = {
  /** The URL of the file to upload. Must be fetch-able. */
  url: string;
  /** The type of media being uploaded. (Note that GIFs are their own type.) */
  type: 'image' | 'gif' | 'video';
};
