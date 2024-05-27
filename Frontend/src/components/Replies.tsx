import React from 'react'
import '.././styles/components/replies.css'
function Replies({
  allReplies,
  reply,
  level,
  replyClicked,
  setReplyClicked,
  replyText,
  setReplyText,
  submitReply,
}) {
  console.log('allReplies:', allReplies) // Add this line
  const childReplies = allReplies.filter((r) => r.parent_id === reply.id)
  console.log('childReplies for reply ' + reply.id + ':', childReplies) // Add this line
  console.log('level for reply ' + reply.id + ':', level) // Add this line
  return (
    <div key={reply.id} style={{ marginLeft: `${level * 20}px` }}>
      <div className='replies'>
        <p className='font-extralight'>{reply.username}</p>
        <p style={{ fontSize: 'small' }}>{reply.content}</p>
      </div>
      <button
        className='replyButton'
        onClick={() =>
          replyClicked === reply.id
            ? setReplyClicked('')
            : setReplyClicked(reply.id)
        }
      >
        reply
      </button>
      {replyClicked === reply.id && (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            submitReply(reply.comment_id, replyText, reply.id)
            setReplyText('')
          }}
        >
          <input
            type='text'
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <button className='ReplySubmit' type='submit'>
            Send reply
          </button>
        </form>
      )}
      {childReplies.map((childReply) => (
        <Replies
          allReplies={allReplies}
          key={childReply.id}
          reply={childReply}
          level={+1} // Increment level for child replies
          replyClicked={replyClicked}
          setReplyClicked={setReplyClicked}
          replyText={replyText}
          setReplyText={setReplyText}
          submitReply={submitReply}
        />
      ))}
    </div>
  )
}

export default Replies
