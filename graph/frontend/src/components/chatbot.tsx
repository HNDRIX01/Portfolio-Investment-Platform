"use client"

import type React from "react"
import { useState, useRef, useEffect, type ChangeEvent, type KeyboardEvent } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { MessageSquare, Send, X, Minimize2, User, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"

// Create a local alias that tells TypeScript our Input supports both HTML input props and ref.
const TypedInput = Input as React.ForwardRefExoticComponent<
  React.InputHTMLAttributes<HTMLInputElement> & React.RefAttributes<HTMLInputElement>
>

type Message = {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "👋 Hi there! How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  // Updated handleSendMessage to call the backend
  const handleSendMessage = async () => {
    if (inputValue.trim() === "") return

    // Store the message value to send, then clear the input
    const messageToSend = inputValue
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageToSend,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    try {
      const response = await fetch("http://localhost:8000/chatbot/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToSend }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Error processing request")
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.assistant,
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          content: "Sorry, there was an error processing your message.",
          sender: "bot",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  // Auto-scroll to bottom when messages change or typing indicator appears
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  // Format time to display in chat
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50">
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col w-[90vw] sm:w-80 md:w-96 h-[70vh] sm:h-[500px] max-h-[600px] rounded-xl shadow-2xl overflow-hidden"
            style={{
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(209, 213, 219, 0.3)",
            }}
          >
            {/* Decorative background elements */}
            <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary rounded-full opacity-20"></div>
              <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/30 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary/40 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-20 left-10 w-40 h-40 bg-primary/50 rounded-full blur-xl"></div>

              {/* Decorative dots */}
              <div className="absolute top-20 left-10 w-2 h-2 bg-primary rounded-full"></div>
              <div className="absolute top-32 right-20 w-3 h-3 bg-primary/70 rounded-full"></div>
              <div className="absolute bottom-40 left-1/3 w-2 h-2 bg-primary/50 rounded-full"></div>
              <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-secondary rounded-full"></div>

              {/* Decorative lines */}
              <div className="absolute top-0 left-1/4 w-px h-20 bg-gradient-to-b from-transparent via-primary/30 to-transparent"></div>
              <div className="absolute bottom-0 right-1/3 w-px h-24 bg-gradient-to-t from-transparent via-primary/20 to-transparent"></div>
              <div className="absolute top-1/3 right-10 h-px w-16 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
            </div>

            {/* Content container */}
            <div className="relative flex flex-col w-full h-full z-10">
              {/* Chat header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center h-9 w-9 rounded-full bg-primary-foreground/10">
                    <Bot size={20} className="text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">AI Assistant</h3>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleChat}
                    className="h-8 w-8 rounded-full text-primary-foreground hover:text-primary-foreground/90 hover:bg-primary-foreground/10"
                  >
                    <Minimize2 size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleChat}
                    className="h-8 w-8 rounded-full text-primary-foreground hover:text-primary-foreground/90 hover:bg-primary-foreground/10"
                  >
                    <X size={16} />
                  </Button>
                </div>
              </div>

              {/* Chat messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn("flex", message.sender === "user" ? "justify-end" : "justify-start")}
                    >
                      <div
                        className={cn(
                          "flex gap-2 max-w-[85%]",
                          message.sender === "user" ? "flex-row-reverse items-end" : "items-start",
                        )}
                      >
                        {message.sender === "bot" ? (
                          <div className="flex-shrink-0 mt-1">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                              <Bot size={16} className="text-primary" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex-shrink-0 mt-1">
                            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                              <User size={16} className="text-secondary-foreground" />
                            </div>
                          </div>
                        )}
                        <div className="space-y-1">
                          <div
                            className={cn(
                              "rounded-2xl px-4 py-2 text-sm break-words shadow-sm",
                              message.sender === "user"
                                ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-tr-none"
                                : "bg-white/80 backdrop-blur-sm rounded-tl-none border",
                            )}
                          >
                            {message.sender === "bot" ? (
                              <div className="markdown-content">
                                <ReactMarkdown
                                  components={{
                                    // Style headings
                                    h1: ({ node, ...props }) => <h1 className="text-lg font-bold my-2" {...props} />,
                                    h2: ({ node, ...props }) => <h2 className="text-md font-bold my-2" {...props} />,
                                    h3: ({ node, ...props }) => <h3 className="text-sm font-bold my-1" {...props} />,

                                    // Style lists
                                    ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2" {...props} />,
                                    ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-2" {...props} />,
                                    li: ({ node, ...props }) => <li className="my-1" {...props} />,

                                    // Style emphasis
                                    strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                                    em: ({ node, ...props }) => <em className="italic" {...props} />,

                                    // Style paragraphs
                                    p: ({ node, ...props }) => <p className="my-1" {...props} />,
                                  }}
                                >
                                  {message.content}
                                </ReactMarkdown>
                              </div>
                            ) : (
                              message.content
                            )}
                          </div>
                          <div
                            className={cn(
                              "text-xs text-muted-foreground",
                              message.sender === "user" ? "text-right mr-1" : "ml-1",
                            )}
                          >
                            {formatTime(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex gap-2 max-w-[85%] items-start">
                        <div className="flex-shrink-0 mt-1">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Bot size={16} className="text-primary" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="rounded-2xl rounded-tl-none px-4 py-2 bg-white/80 backdrop-blur-sm border shadow-sm">
                            <div className="flex items-center space-x-1">
                              <div
                                className="h-2 w-2 rounded-full bg-primary/60 animate-bounce"
                                style={{ animationDelay: "0ms" }}
                              ></div>
                              <div
                                className="h-2 w-2 rounded-full bg-primary/60 animate-bounce"
                                style={{ animationDelay: "150ms" }}
                              ></div>
                              <div
                                className="h-2 w-2 rounded-full bg-primary/60 animate-bounce"
                                style={{ animationDelay: "300ms" }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Chat input */}
              <div className="p-3 bg-white/60 backdrop-blur-sm border-t">
                <div className="flex items-center space-x-2 bg-white rounded-full border px-4 py-1 shadow-sm">
                  <TypedInput
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent py-2 px-0"
                  />
                  <Button
                    onClick={handleSendMessage}
                    size="icon"
                    disabled={inputValue.trim() === ""}
                    className={cn(
                      "h-8 w-8 rounded-full transition-all",
                      inputValue.trim() === ""
                        ? "bg-muted text-muted-foreground"
                        : "bg-primary text-primary-foreground",
                    )}
                  >
                    <Send size={16} />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="shadow-lg rounded-full"
          >
            <Button
              onClick={toggleChat}
              size="icon"
              className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <div className="relative">
                <MessageSquare size={24} className="text-primary-foreground" />
                {/* Notification dot */}
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-gray-400 rounded-full border-2 border-white"></span>
              </div>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

