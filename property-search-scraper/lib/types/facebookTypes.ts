export type PostScrapeType = {
  postId: string;
  groupName?: string;
  groupId: string;
  authorDetails: {
    authorName: string;
    authorId: string;
    authorProfileUrl: string;
  };
  permalink: string;
  datePosted: string;
  scrapedAt: string;
  postTextContent: string;
  reactionCount?: number;
  commentCount?: number;
  permaLinkConstructed?: string;
  mediaUrls: {
    type: "image" | "video";
    url: string;
    order: number;
  }[];
};

export type PostDetailsWithoutMedia = Omit<PostScrapeType, "mediaUrls">;
