import type { Users, Videos, Likes, Comments } from "@prisma/client"

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
