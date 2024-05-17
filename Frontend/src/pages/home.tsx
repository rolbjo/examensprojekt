import React, { useEffect, useState } from 'react'

import '../styles/pages/home.css'
import Recommended from '../components/Recommended'
import Comment from '../components/Comments'
import Replies from '../components/Replies'
import { Post, Reply } from '../types/types'
import BlogPostForm from '../components/blogPost'
import Login from '../components/Login'

function Home() {
  const [loginPop, setLoginPop] = useState(false)

  const [blogPosts, setBlogPosts] = useState<Post[]>([])

  const [replyClicked, setReplyClicked] = useState('')

  const [commentText, setCommentText] = useState('')
  const [replyText, setReplyText] = useState('')

  const [openComments, setOpenComments] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetch('/api/blogPosts')
      .then((response) => response.json())
      .then((blogPosts) => {
        setBlogPosts(blogPosts) // Update the state with the fetched data
      })
  }, [])

  const fetchUpdatedPosts = async () => {
    const response = await fetch('/api/blogPosts', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch posts')
    }

    const posts = await response.json()
    return posts
  }

  const submitComment = async (postId: string, commentText: string) => {
    const response = await fetch('/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
      body: JSON.stringify({ content: commentText, post_id: postId }),
    })

    if (response.status === 403) {
      // Show the login popup
      setLoginPop(true)
      return
    }
    // Fetch the updated data from the server
    const updatedPosts = await fetchUpdatedPosts()

    // Update the local state with the updated data
    setBlogPosts(updatedPosts)
    console.log('Updated posts:', updatedPosts)

    setCommentText('')
  }
  // FORTSÄTT HÄR

  const submitReply = async (
    commentId: string,
    replyText: string,
    parentId: string | null
  ) => {
    console.log('Submitting reply for commentId:', commentId)
    const response = await fetch('/api/replies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
      body: JSON.stringify({
        content: replyText,
        comment_id: commentId,
        parent_id: parentId,
      }),
    })

    const reply: Reply = await response.json()
    console.log('Replyeeeee:', reply)

    setBlogPosts((prevPosts) =>
      prevPosts.map((post) => ({
        ...post,
        comments: post.comments.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              replies: [...comment.replies, reply],
            }
          } else {
            return comment
          }
        }),
      }))
    )
    setReplyText('')
  }
  return (
    <>
      <Login
        loginPop={loginPop}
        setLoginPop={setLoginPop}
        message='Please log in to do this'
      />
      <div style={{ display: 'flex' }}>
        <div style={{ width: '80%' }}>
          <h1 className='HomeHeader'>What is your next travel goal?</h1>
          <BlogPostForm />
          <div className='postsWrapper'>
            {blogPosts.map((post) => (
              <div key={post.id} className='postDiv'>
                <h2 className='postTitle'>{post.title}</h2>
                <img src={post.image} alt={post.title} className='postImage' />
                <p style={{ textAlign: 'center' }}>{post.description}</p>
                <form
                  onSubmit={(event) => {
                    event.preventDefault()
                    submitComment(post.id, commentText)
                  }}
                >
                  <input
                    type='text'
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <button type='submit'>Submit Comment</button>
                </form>
                {post.comments &&
                  post.comments.map((comment) => (
                    <div style={{ marginLeft: '20px' }} key={comment.id}>
                      <Comment
                        comment={comment}
                        replyClicked={replyClicked}
                        setReplyClicked={setReplyClicked}
                        replyText={replyText}
                        setReplyText={setReplyText}
                        submitReply={submitReply}
                      />
                      {/* Display the original comment with the same style */}
                      <button
                        style={{ border: 'none' }}
                        onClick={() =>
                          setOpenComments((prev) => ({
                            ...prev,
                            [comment.id]: !prev[comment.id],
                          }))
                        }
                      >
                        {openComments[comment.id]
                          ? 'Close Replies'
                          : `Open Replies (${
                              comment.replies ? comment.replies.length : 0
                            })`}
                      </button>
                      {openComments[comment.id] && (
                        <>
                          {comment.replies &&
                            comment.replies.length > 0 &&
                            comment.replies
                              .filter((reply) => reply.parent_id === null) // Only render top-level replies
                              .map((reply, index) => {
                                console.log('frontendreplies', comment.replies)
                                return (
                                  <Replies
                                    allReplies={comment.replies} // Pass comment.replies as allReplies
                                    key={reply.id}
                                    reply={reply}
                                    level={1} // Make sure this is 0 for the first level of replies
                                    replyClicked={replyClicked}
                                    setReplyClicked={setReplyClicked}
                                    replyText={replyText}
                                    setReplyText={setReplyText}
                                    submitReply={submitReply}
                                  />
                                )
                              })}
                        </>
                      )}
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>
        <Recommended />
      </div>
    </>
  )
}

export default Home
