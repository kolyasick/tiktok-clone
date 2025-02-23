import type { User, Video, Like, Comment, Profile } from "@prisma/client"

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
