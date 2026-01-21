// pages/index.js
import { useState, useRef, useEffect } from 'react'
import Head from 'next/head'

export default function Home() {
  const [files, setFiles] = useState([])
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef(null)
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

 
  useEffect(() => {
   
  }, [])

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    setFiles(selectedFiles)
  }

const handleUpload = async () => {
  if (files.length === 0) return

  setUploading(true)
  setUploadProgress(0)

  const progressInterval = setInterval(() => {
    setUploadProgress(prev => {
      if (prev >= 90) return prev 
      return Math.round(prev + Math.random() * 15,1) 
    })
  }, 1000) 

  try {
    await fetch('http://localhost:8000/health')

    const formData = new FormData()
    files.forEach(f => formData.append('files', f))

    const res = await fetch('http://localhost:8000/upload', {
      method: 'POST',
      body: formData
    })

    const data = await res.json()

    clearInterval(progressInterval) 
    setUploadProgress(100) 

    setMessages(prev => [
      ...prev,
      {
        role: 'system',
        content: `Processed ${data.chunks} chunks from ${data.files} files`
      }
    ])

  } catch {
    clearInterval(progressInterval) 
    setUploadProgress(0)
    setMessages(prev => [
      ...prev,
      {
        role: 'system',
        content: 'Backend is initializing, please wait...'
      }
    ])
  } finally {
    setUploading(false)
    setFiles([])
    setTimeout(() => setUploadProgress(0), 1000)
  }
}

  const handleSubmit = async (e) => {
  e.preventDefault()
  if (!input.trim()) return

  const userMessage = { role: 'user', content: input }
  const newMessages = [...messages, userMessage]
  setMessages(newMessages)
  setInput('')
  setLoading(true)

  // Calculate the index based on the updated messages array
  const assistantMessageIndex = newMessages.length

  // Add empty assistant message
  setMessages(prev => [...prev, {
    role: 'assistant',
    content: ''
  }])

  try {
    const response = await fetch('http://localhost:8000/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: input }),
    })

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
    
      setMessages(prev => {
        const newMessages = [...prev]
        if (newMessages[assistantMessageIndex]) {
          newMessages[assistantMessageIndex] = {
            role: 'assistant',
            content: newMessages[assistantMessageIndex].content + chunk
          }
        }
        return newMessages
      })
    }
    
  } catch (error) {
    console.error('Query failed:', error)
    setMessages(prev => {
      const newMessages = [...prev]
      if (newMessages[assistantMessageIndex]) {
        newMessages[assistantMessageIndex] = {
          role: 'assistant',
          content: 'Error: Could not get answer. Make sure backend is running.'
        }
      }
      return newMessages
    })
  } finally {
    setLoading(false)
  }
}

  const clearChat = () => {
    setMessages([])
  }

  return (
    <>
      <Head>
        <title>DocChat - Ask Anything</title>
        <meta name="description" content="Upload documents and chat with AI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    DocChat
                  </h1>
                 
                </div>
              </div>
              

            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Upload Section */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload Documents
                </h2>
                
                {/* File Input */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-purple-300 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500 transition-all hover:bg-purple-50 group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.txt,.docx,.json,.xlsx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  <svg className="w-12 h-12 mx-auto text-purple-400 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  
                  <p className="mt-4 text-sm text-gray-600 font-medium">
                    Click to upload or drag and drop
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    PDF, TXT, DOCX
                  </p>
                </div>

                {/* Selected Files */}
                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700">Selected files:</p>
                    {files.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-sm text-gray-700 truncate">{file.name}</span>
                        </div>

                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Progress */}
                {uploadProgress > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Processing...</span>
                      <span className="font-medium text-purple-600">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                <button
                  onClick={handleUpload}
                  disabled={files.length === 0 || uploading}
                  className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                >
                  {uploading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing please wait...
                    </span>
                  ) : (
                    <>🚀 Process Documents</>
                  )}
                </button>
              </div>

           
            </div>

            {/* Chat Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
                
                {/* Chat Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">AI Assistant</h3>
                      <p className="text-xs text-gray-500">Ask me anything about your documents</p>
                    </div>
                  </div>
                  
                  {messages.length > 0 && (
                    <button
                      onClick={clearChat}
                      className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                    >
                      Clear Chat
                    </button>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No messages yet</h3>
                        <p className="text-sm text-gray-500 max-w-md">
                          Upload some documents and start asking questions!<br />
                          I can help you find information quickly.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {messages.map((message, idx) => (
                        <div
                          key={idx}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[80%] ${
                            message.role === 'user'
                              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                              : message.role === 'system'
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-gray-100 text-gray-800'
                          } rounded-2xl px-4 py-3 shadow-sm`}>
                            <div className="flex items-start space-x-2">
                              {message.role === 'assistant' && (
                                <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                              )}
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {loading && (
                        <div className="flex justify-start">
                          <div className="bg-gray-100 rounded-2xl px-4 py-3">
                            <div className="flex space-x-2">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </>
                  )}
                </div>

                {/* Input */}
                <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask a question about your documents..."
                      className="flex-1 px-4 py-3  border border-gray-300 rounded-xl bg-white  text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      disabled={loading}
                    />
                    <button
                      type="submit"
                      disabled={loading || !input.trim()}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
                    >
                      <span>Send</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>

    
      </div>
    </>
  )
}
