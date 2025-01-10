import type { Users, Videos, Likes, Comments, Messages, ChatRooms } from "@prisma/client"

export interface IUser extends Users {
	videos?: Videos[]
	likes?: ILike[]
	comments?: IComment[]
}

export interface IVideo extends Videos {
	user?: Users
	likes?: ILike[]
	comments?: IComment[]

	liked?: boolean
}

export interface ILike extends Likes {
	user?: Users
}

export interface IComment extends Comments {
	user?: Users
}

export interface IRoom extends ChatRooms {
	messages?: Messages
}

export interface IMessage extends Messages {
	sender?: Users
	action?: string
}

export interface IChat extends ChatRooms {
	user1?: Users
	user2?: Users
	messages?: IMessage[]
}
