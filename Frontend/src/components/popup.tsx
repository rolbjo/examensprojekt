import React from 'react'
import { BlogDialogProps } from '../types/types'

const BlogDialog: React.FC<BlogDialogProps> = ({
  handleBlogSubmit,
  title,
  setTitle,
  description,
  setDescription,
  handleImageChange,
}) => {
  return (
    <dialog id='my_modal_2' className='modal'>
      <div className='modal-box'>
        <form
          style={{
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '50px',
          }}
          onSubmit={handleBlogSubmit}
        >
          <label>
            Title:
            <input
              type='text'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label>
            Image:
            <input
              type='file'
              onChange={handleImageChange}
              style={{ border: 'none' }}
            />
          </label>
          <label>
            Description:
            <textarea
              className='border'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </label>
          <button type='submit'>Submit</button>
        </form>
      </div>
      <form method='dialog' className='modal-backdrop'>
        <button>close</button>
      </form>
    </dialog>
  )
}
interface ShareButtonProps {
  isLoggedIn: boolean
  setLoginPop: (value: boolean) => void
}
const ShareButton: React.FC<ShareButtonProps> = ({
  isLoggedIn,
  setLoginPop,
}) => {
  return (
    <button
      className='btn'
      onClick={() => {
        if (!isLoggedIn) {
          setLoginPop(true)
        } else {
          const modal = document.getElementById('my_modal_2')
          if (modal instanceof HTMLDialogElement) {
            modal.showModal()
          }
        }
      }}
      style={{ margin: 'auto', display: 'block', marginBottom: '20px' }}
    >
      Share a travel ...
    </button>
  )
}

export { BlogDialog, ShareButton }
