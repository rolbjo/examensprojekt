import { ChangeEvent } from 'react'

type Post = {
  id: string
  title: string
  image: string
  description: string
  comments: CommentType[]
}

interface Reply {
  id: string
  content: string
  comment_id: string
  user_id: string
  parent_id: string | null
  username: string
  replies: Reply[]
}

// Define your comment type
type CommentType = {
  id: string
  content: string
  username: string
  replies: Reply[]
}

interface BlogDialogProps {
  handleBlogSubmit: (event: React.FormEvent) => void
  title: string
  setTitle: (value: string) => void
  description: string
  setDescription: (value: string) => void
  handleImageChange: (event: ChangeEvent<HTMLInputElement>) => void
}

export { Post, Reply, CommentType, BlogDialogProps }
