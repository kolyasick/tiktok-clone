import type { User, Video, Like, Comment, Profile, Message, Chat } from "@prisma/client"

export interface IUser extends User {
	videos?: Video[]
	likes?: ILike[]
	comments?: IComment[]
}

export interface IVideo extends Video {
	profile?: Profile
	likes?: ILike[]
	comments?: IComment[]

	liked?: boolean
}

export interface ILike extends Like {
	profile?: Profile
}

export interface IComment extends Comment {
	profile?: Profile
}

export interface IRoom extends Chat {
  messages?: Message;
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