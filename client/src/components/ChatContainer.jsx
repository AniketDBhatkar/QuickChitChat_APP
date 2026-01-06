import React, { useContext, useEffect, useRef, useState } from 'react'
import assets from '../assets/assets'
import { formatMessagetime } from '../lib/utils'
import { ChatContext } from '../../context/ChatContext'
import { AuthContext } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const ChatContainer = () => {

  const {
    messages = [],
    selectedUser,
    setSelectedUser,
    sendMessages,
    getMessages
  } = useContext(ChatContext)

  const { authUser, onlineUsers = [] } = useContext(AuthContext)

  const scrollEnd = useRef(null)
  const [input, setInput] = useState('')

  // ✅ SAFE preventDefault FIX
  const handleSendMessages = async (e) => {
    e?.preventDefault()
    if (input.trim() === '') return
    await sendMessages({ text: input.trim() })
    setInput('')
  }

  const handleSendingImage = async (e) => {
    const file = e.target.files[0]
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Select an image file')
      return
    }

    const reader = new FileReader()
    reader.onloadend = async () => {
      await sendMessages({ image: reader.result })
      e.target.value = ''
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id)
    }
  }, [selectedUser, getMessages])

  useEffect(() => {
    scrollEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return selectedUser ? (
    <div className="h-full overflow-y-scroll relative backdrop-blur-lg">

      {/* Header */}
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          className="w-8 rounded-full"
          alt=""
        />

        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser.fullName}
          {onlineUsers.includes(selectedUser._id) && (
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
          )}
        </p>

        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          className="md:hidden w-7 cursor-pointer"
          alt=""
        />

        <img src={assets.help_icon} className="max-md:hidden w-5" alt="" />
      </div>

      {/* Messages */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6">
        {messages.map((msg, index) => {
          const isSender = msg.senderId === authUser?._id

          return (
            <div
              key={index}
              className={`flex items-end gap-2 ${
                isSender ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.image ? (
                <img
                  src={msg.image}
                  className="max-w-[230px] border border-gray-700 rounded-lg"
                  alt=""
                />
              ) : (
                <p
                  className={`p-2 max-w-[200px] text-sm rounded-lg break-all bg-violet-500/30 text-white ${
                    isSender ? 'rounded-br-none' : 'rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </p>
              )}

              <div className="text-center text-xs">
                <img
                  src={
                    isSender
                      ? authUser?.profilePic || assets.avatar_icon
                      : selectedUser.profilePic || assets.avatar_icon
                  }
                  className="w-7 rounded-full"
                  alt=""
                />
                <p className="text-gray-500">
                  {formatMessagetime(msg.createdAt)}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={scrollEnd}></div>
      </div>

      {/* Input */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3">
        <div className="flex-1 flex items-center bg-gray-100/10 px-3 rounded-full">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessages(e)}
            type="text"
            placeholder="Send a Message"
            className="flex-1 text-sm p-3 bg-transparent text-white outline-none"
          />

          <input
            type="file"
            id="image"
            hidden
            accept="image/png, image/jpeg"
            onChange={handleSendingImage}
          />

          <label htmlFor="image">
            <img
              src={assets.gallery_icon}
              className="w-5 mr-2 cursor-pointer"
              alt=""
            />
          </label>
        </div>

        <img
          onClick={handleSendMessages}
          src={assets.send_button}
          className="w-9 cursor-pointer"
          alt=""
        />
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
      <img src={assets.logo_icon} className="w-16" alt="" />
      <p className="text-lg font-medium text-white">
        Chat Anytime, Anywhere
      </p>
    </div>
  )
}

export default ChatContainer
