import React, { Dispatch, SetStateAction } from 'react'

interface CommentProps {
  comment: {
    id: string
    username: string
    content: string
  }
  replyClicked: string
  setReplyClicked: Dispatch<SetStateAction<string>>
  replyText: string
  setReplyText: Dispatch<SetStateAction<string>>
  submitReply: (id: string, replyText: string, parentId: string | null) => void
  level?: number
}

function Comment({
  comment,
  replyClicked,
  setReplyClicked,
  replyText,
  setReplyText,
  submitReply,
  level = 0,
}: CommentProps) {
  return (
    <div key={comment.id} style={{ marginLeft: `${level * 20}px` }}>
      <div
        style={{
          backgroundColor: '#f2f2f2',
          maxWidth: '100%',
          display: 'inline-block',
          padding: '5px',
          borderRadius: '10px',
          marginTop: '10px',
        }}
      >
        <p className='font-extralight'>{comment.username}</p>
        <p style={{ fontSize: 'small' }}>{comment.content}</p>
      </div>
      <button
        onClick={() =>
          replyClicked === comment.id
            ? setReplyClicked('')
            : setReplyClicked(comment.id)
        }
        style={{
          fontSize: '13px',
          marginLeft: '5px',
          color: '#8d7070',
          border: 'none',
        }}
      >
        reply
      </button>
      {replyClicked === comment.id && (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            submitReply(comment.id, replyText, null)
            setReplyText('')
          }}
        >
          <input
            type='text'
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <button style={{ backgroundColor: '#f2f2f2' }} type='submit'>
            Send reply
          </button>
        </form>
      )}
    </div>
  )
}
export default Comment
