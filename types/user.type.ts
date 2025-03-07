import type { Video, Like, Comment, Profile, Message, Chat, Follows, Status } from "@prisma/client";

export interface IVideo extends Video {
  profile?: Profile;
  likes?: ILike[];
  comments?: IComment[];
  status?: Status;
  liked?: boolean;
}

export interface ILike extends Like {
  profile?: Profile;
}

export interface IComment extends Comment {
  profile?: Profile;
}

export interface IRoom extends Chat {
  messages?: Message[];
}

export interface IMessage extends Message {
  sender?: Profile;
  action?: string;
}

export interface IChat extends Chat {
  user1?: Profile;
  user2?: Profile;
  messages?: IMessage[];
}

export interface IProfile extends Profile {
  followers?: Follows[];
  following?: Follows[];
}
