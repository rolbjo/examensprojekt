import React, { useState } from 'react'
import { BlogDialog, ShareButton } from './popup'

function BlogPostForm() {
  const [title, setTitle] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [description, setDescription] = useState('')

  const handleBlogSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    if (image) {
      submitBlogPost(title, description, image)
    }
  }

  async function submitBlogPost(
    title: string,
    description: string,
    image: File
  ) {
    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('image', image)

      console.log('Form Data:', formData)

      const response = await fetch('/api/saveBlogPost', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
        body: formData,
      })

      console.log(response)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const post = await response.json()

      console.log(post)
    } catch (error) {
      console.error('An error occurred while submitting the blog post:', error)
    }
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0]
    if (file) {
      setImage(file)
    }
  }

  // ...existing code...

  return (
    <>
      <ShareButton />
      <BlogDialog
        handleBlogSubmit={handleBlogSubmit}
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        handleImageChange={handleImageChange}
      />
    </>
  )
}

export default BlogPostForm
