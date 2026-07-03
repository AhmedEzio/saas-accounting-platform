/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { aiApi } from "@/services/ai";
import OverviewShell from "@/components/overview/OverviewShell";
import useOverviewLang from "@/components/overview/useOverviewLang";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ChatPage() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();
  
  // Translation & Localization
  const [lang, setLang] = useState("en");
  const { dir, isRtl, t } = useOverviewLang(lang);

  // Layout & UI State
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Loading & Action States
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isDeletingSession, setIsDeletingSession] = useState(null);
  
  // Toast notifications state
  const [toasts, setToasts] = useState([]);

  // Create chat modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  const [showMobileHistory, setShowMobileHistory] = useState(false);

  // Refs for UI control
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Authenticate user
  useEffect(() => {
    if (!authLoading && !token) {
      router.push("/login");
    }
  }, [authLoading, router, token]);

  // Toast manager
  const showToast = useCallback((message, type = "error") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  // Create a new chat session
  const handleNewChat = useCallback(async (title = "New Chat", autoSelect = true) => {
    if (!token) return;
    try {
      const response = await aiApi.createSession(title);
      const newSession = response?.data;
      if (newSession) {
        setSessions((prev) => [newSession, ...prev]);
        if (autoSelect) {
          setActiveSessionId(newSession._id);
          setMessages([]);
        }
        return newSession;
      }
    } catch (err) {
      showToast(err?.response?.data?.message || t("chat.error"));
    }
  }, [token, showToast, t]);

  // Delete a session
  const handleDeleteSession = useCallback(async (sessionId, e) => {
    e.stopPropagation();
    if (!token) return;
    if (!window.confirm(isRtl ? "هل أنت متأكد من حذف هذه المحادثة؟" : "Are you sure you want to delete this session?")) return;
    
    setIsDeletingSession(sessionId);
    try {
      await aiApi.deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s._id !== sessionId));
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        setMessages([]);
      }
      showToast(isRtl ? "تم حذف المحادثة بنجاح" : "Session deleted successfully", "success");
    } catch (err) {
      showToast(err?.response?.data?.message || t("chat.error"));
    } finally {
      setIsDeletingSession(null);
    }
  }, [token, activeSessionId, isRtl, showToast, t]);

  // Fetch recent sessions on mount/auth
  const loadSessions = useCallback(async () => {
    if (!token) return;
    setLoadingSessions(true);
    try {
      const response = await aiApi.getUserSessions();
      const loadedSessions = response?.data || [];
      setSessions(loadedSessions);
    } catch (err) {
      showToast(err?.response?.data?.message || t("chat.error"));
    } finally {
      setLoadingSessions(false);
    }
  }, [token, activeSessionId, t, showToast, handleNewChat]);

  useEffect(() => {
    let active = true;
    if (token) {
      queueMicrotask(() => {
        if (active) loadSessions();
      });
    }
    return () => {
      active = false;
    };
  }, [token, loadSessions]);

  // Fetch messages for active session
  useEffect(() => {
    let active = true;
    const fetchMessages = async () => {
      if (!token || !activeSessionId) return;
      
      setLoadingMessages(true);
      try {
        const response = await aiApi.getSessionMessages(activeSessionId);
        // messages are returned in response.data.result
        const messageList = response?.data?.result || [];
        if (active) {
          setMessages(messageList);
        }
      } catch (err) {
        if (active) {
          showToast(err?.response?.data?.message || t("chat.error"));
        }
      } finally {
        if (active) {
          setLoadingMessages(false);
        }
      }
    };

    queueMicrotask(() => {
      fetchMessages();
    });

    return () => {
      active = false;
    };
  }, [activeSessionId, token, t, showToast]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Image Selection Handler
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast(isRtl ? "يرجى تحديد ملف صورة صالح." : "Please select a valid image file.");
      return;
    }

    setSelectedImage(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  // Remove Selected Image
  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Send Message Handler
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();

    const trimmedText = inputText.trim();
    if (!trimmedText && !selectedImage) return;
    if (isSending || !token || !activeSessionId) return;

    setIsSending(true);
    
    // Construct local user message object to display instantly
    const userMsgId = "local-" + Date.now();
    const userMessage = {
      _id: userMsgId,
      sessionId: activeSessionId,
      content: trimmedText,
      from: "user",
      createdAt: new Date().toISOString(),
      // Attach local preview URL if image is attached
      file: imagePreview ? { url: imagePreview } : null,
      fileUrl: imagePreview || null,
    };

    // Append user message immediately and start typing indicator
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    const backupImage = selectedImage;
    const backupPreview = imagePreview;

    // Clear previews instantly
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    try {
      const formData = new FormData();
      formData.append("question", trimmedText);
      if (backupImage) {
        formData.append("file", backupImage);
      }

      const response = await aiApi.sendMessage(activeSessionId, formData);
      
      // Append the AI answer
      const aiMessage = {
        _id: "ai-" + Date.now(),
        sessionId: activeSessionId,
        content: response?.answer || response?.content || response?.message || (typeof response === "string" ? response : JSON.stringify(response)),
        from: "ai",
        createdAt: new Date().toISOString(),
      };
      
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      showToast(err?.response?.data?.message || t("chat.error"));
      // Remove the optimistic user message if delivery failed (optional, let's keep it but show error)
    } finally {
      setIsTyping(false);
      setIsSending(false);
      if (backupPreview) {
        URL.revokeObjectURL(backupPreview);
      }
    }
  };

  // Handle starter questions click
  const handleStarterClick = (questionText) => {
    setInputText(questionText);
  };

  const starterQuestions = [
    {
      en: "List my outstanding invoice balances",
      ar: "اعرض فواتيري المستحقة غير المدفوعة",
    },
    {
      en: "How do I add a new client?",
      ar: "كيف أقوم بإضافة عميل جديد؟",
    },
    {
      en: "Analyze my recent monthly cash flow",
      ar: "حلل تدفقاتي النقدية الشهرية الأخيرة",
    },
  ];

  return (
    <div dir={dir} lang={lang}>
      <OverviewShell
        user={user}
        router={router}
        lang={lang}
        setLang={setLang}
        isRtl={isRtl}
        t={t}
        mobileNavOpen={mobileNavOpen}
        setMobileNavOpen={setMobileNavOpen}
        activeKey="chat"
      >
        {/* Core Chat Layout Container */}
        <div className="mx-auto max-w-7xl">
          <div className="flex h-[calc(100vh-10rem)] min-h-[500px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300">
            
            {/* Sidebar: Chat History */}
            <aside className="hidden w-72 flex-col border-r border-gray-100 bg-gray-50/40 sm:flex shrink-0">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <svg className="h-4 w-4 text-[#1b2b6b]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {isRtl ? "المحادثات الأخيرة" : "Recent Chats"}
                </h2>
                <button
                  onClick={() => {
                    setNewChatName("");
                    setShowCreateModal(true);
                  }}
                  className="inline-flex h-8 items-center gap-1 rounded-lg bg-[#1b2b6b] px-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#162358] focus:outline-none"
                  aria-label={t("chat.newChat")}
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span>{t("chat.newChat")}</span>
                </button>
              </div>

              {/* Chat Sessions list */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {loadingSessions ? (
                  <div className="flex flex-col items-center justify-center py-10 space-y-2 text-xs text-gray-400">
                    <svg className="animate-spin h-5 w-5 text-[#1b2b6b]" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <span>{isRtl ? "تحميل المحادثات..." : "Loading sessions..."}</span>
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-10 text-xs text-gray-400">
                    {t("chat.noSessions")}
                  </div>
                ) : (
                  sessions.map((session) => {
                    const isActive = session._id === activeSessionId;
                    return (
                      <div key={session._id} className="relative group">
                        <button
                          onClick={() => setActiveSessionId(session._id)}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-medium transition-all focus:outline-none pr-8 ${
                            isActive
                              ? "bg-[#e8ebf7] text-[#1b2b6b] shadow-sm font-semibold border-l-4 border-[#1b2b6b]"
                              : "text-gray-600 hover:bg-gray-100/70"
                          } ${isRtl ? "text-right pl-8 pr-3" : "text-left"}`}
                        >
                          <svg className={`h-4 w-4 shrink-0 ${isActive ? "text-[#1b2b6b]" : "text-gray-400"}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span className="truncate flex-1">{session.title || "New Chat"}</span>
                        </button>
                        <button
                          onClick={(e) => handleDeleteSession(session._id, e)}
                          disabled={isDeletingSession === session._id}
                          className={`absolute ${isRtl ? "left-2" : "right-2"} top-1/2 -translate-y-1/2 p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50`}
                          aria-label={isRtl ? "حذف" : "Delete"}
                        >
                          {isDeletingSession === session._id ? (
                            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                          ) : (
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </aside>

            {/* Main Chat Thread Area */}
            <section className="flex flex-1 flex-col bg-white">
              {/* Active Session Header */}
              <div className="flex h-14 items-center justify-between border-b border-gray-100 px-6">
                <div className="flex items-center gap-3">
                  {/* Mobile Chat History Toggle Button */}
                  <button
                    onClick={() => setShowMobileHistory(true)}
                    className="sm:hidden inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 focus:outline-none"
                    aria-label={t("chat.history")}
                    type="button"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>

                  <div>
                    <h1 className="text-sm font-bold text-gray-900">{t("chat.title")}</h1>
                    {activeSessionId && (
                      <p className="text-[10px] text-gray-400">
                        {sessions.find((s) => s._id === activeSessionId)?.title || ""}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Mobile new chat shortcut */}
                <button
                  onClick={() => {
                    setNewChatName("");
                    setShowCreateModal(true);
                  }}
                  className="sm:hidden inline-flex h-8 items-center gap-1 rounded-lg bg-[#1b2b6b] px-2.5 text-xs font-semibold text-white shadow-sm"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span>{t("chat.newChat")}</span>
                </button>
              </div>

              {/* Messages viewport */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
                {!activeSessionId ? (
                  <div className="flex h-full flex-col items-center justify-center text-center p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-[#1b2b6b] shadow-sm mb-4">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path d="M9.813 15.904L9 21l5.904-1.813a9.86 9.86 0 004.254-.95c4.97-1.33 8.842-5.202 10.172-10.172a9.86 9.86 0 00-.95-4.254L21 3l-5.1 5.904a9.86 9.86 0 00-4.254.95C6.676 11.184 2.804 15.056 1.474 20.026a9.86 9.86 0 00.95 4.254L9.813 15.904z" />
                      </svg>
                    </div>
                    <h3 className="text-base font-bold text-gray-800 mb-1">{isRtl ? "مرحباً بك في مساعد Finora!" : "Welcome to Finora AI Assistant!"}</h3>
                    <p className="max-w-md text-xs text-gray-500 mb-6">{isRtl ? "قم بإنشاء محادثة جديدة للبدء." : "Create a new chat session to get started."}</p>
                    
                    <button
                      onClick={() => {
                        setNewChatName("");
                        setShowCreateModal(true);
                      }}
                      className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#1b2b6b] px-6 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#162358] focus:outline-none"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      {t("chat.newChat")}
                    </button>
                  </div>
                ) : loadingMessages && messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-gray-400 space-y-2 text-sm">
                    <svg className="animate-spin h-6 w-6 text-[#1b2b6b]" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <span>{isRtl ? "جارٍ تحميل الرسائل..." : "Loading messages..."}</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-[#1b2b6b] mb-4">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-base font-bold text-gray-800 mb-1">{isRtl ? "ابدأ المحادثة" : "Start the conversation"}</h3>
                    <p className="max-w-md text-xs text-gray-500 mb-6">
                      {isRtl
                        ? "اطرح أي سؤال حول حساباتك وفواتيرك وتحليلاتك المالية."
                        : "Ask anything about your accounting, clients, invoices, and financial reports."}
                    </p>

                    {/* Starter prompts grid */}
                    <div className="grid gap-3 max-w-lg w-full sm:grid-cols-3">
                      {starterQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleStarterClick(isRtl ? q.ar : q.en)}
                          className="rounded-xl border border-gray-200 bg-white p-3 text-center text-xs text-gray-600 shadow-sm transition hover:border-[#1b2b6b] hover:text-[#1b2b6b] focus:outline-none"
                        >
                          {isRtl ? q.ar : q.en}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => {
                      const isUser = msg.from === "user";
                      return (
                        <div
                          key={msg._id}
                          className={`flex items-start gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                        >
                          {/* Bot Avatar */}
                          {!isUser && (
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e8ebf7] text-[#1b2b6b] shadow-sm font-extrabold text-xs">
                              F
                            </div>
                          )}

                          {/* Message content block */}
                          <div className="flex flex-col max-w-[75%] gap-1">
                            <div
                              className={`rounded-2xl px-4 py-2.5 text-xs shadow-sm leading-relaxed ${
                                isUser
                                  ? `bg-[#1b2b6b] text-white ${isRtl ? "rounded-tl-none" : "rounded-tr-none"}`
                                  : `bg-white border border-gray-100 text-gray-800 ${isRtl ? "rounded-tr-none" : "rounded-tl-none"}`
                              }`}
                            >
                              {/* Display attached image if exists */}
                              {(msg.imageUrl || msg.fileUrl || msg.file?.url) && (
                                <div className="mb-2 overflow-hidden rounded-lg border border-white/20 max-w-sm">
                                  <img
                                    src={msg.imageUrl || msg.fileUrl || msg.file?.url}
                                    alt="Uploaded Attachment"
                                    className="max-h-60 object-contain w-full"
                                  />
                                </div>
                              )}
                              
                              <div className={`prose prose-sm max-w-none ${isUser ? "prose-invert" : ""}`}>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {msg.content}
                                </ReactMarkdown>
                              </div>
                            </div>
                            
                            {/* Message date indicator */}
                            <span className={`text-[9px] text-gray-400 px-1 ${isUser ? "self-end" : "self-start"}`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {/* User Avatar */}
                          {isUser && (
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1b2b6b] text-white shadow-sm font-semibold text-xs">
                              {user?.name ? user.name[0].toUpperCase() : "U"}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Typing Bouncing Dots */}
                    {isTyping && (
                      <div className="flex items-start gap-3 justify-start">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e8ebf7] text-[#1b2b6b] shadow-sm font-extrabold text-xs">
                          F
                        </div>
                        <div className="flex flex-col max-w-[75%] gap-1">
                          <div className={`rounded-2xl rounded-tl-none bg-white border border-gray-100 px-4 py-3 text-xs shadow-sm flex items-center gap-1`}>
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0ms' }} />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '150ms' }} />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '300ms' }} />
                          </div>
                          <span className="text-[9px] text-gray-400 px-1">{t("chat.typing")}</span>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Chat Send Message Footer Form */}
              {activeSessionId && (
                <div className="border-t border-gray-100 p-4 bg-white">
                  
                  {/* Attached Image Thumbnail Pre-Send View */}
                  {imagePreview && (
                    <div className="mb-3 flex items-center gap-2 p-2 rounded-xl bg-gray-50 border border-gray-100 w-fit max-w-full">
                      <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-gray-200">
                        <img src={imagePreview} alt="Attachment Preview" className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 max-w-40">
                        <p className="truncate text-xs font-semibold text-gray-700">{selectedImage?.name}</p>
                        <p className="text-[10px] text-gray-400">{(selectedImage?.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <button
                        onClick={handleRemoveImage}
                        type="button"
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-red-100 hover:text-red-600 transition"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
                    {/* File Attachment Input Trigger */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-[#1b2b6b] transition focus:outline-none"
                      title={isRtl ? "إرفاق صورة" : "Attach image"}
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                    </button>

                    {/* Chat Text Input field */}
                    <div className="relative flex-1">
                      <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        placeholder={t("chat.placeholder")}
                        rows="1"
                        className={`block w-full min-h-11 max-h-32 resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-800 placeholder:text-gray-400 focus:bg-white focus:border-[#1b2b6b] focus:ring-1 focus:ring-[#1b2b6b] outline-none transition ${
                          isRtl ? "text-right" : "text-left"
                        }`}
                      />
                    </div>

                    {/* Send Button */}
                    <button
                      type="submit"
                      disabled={isSending || (!inputText.trim() && !selectedImage)}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1b2b6b] text-white hover:bg-[#162358] disabled:bg-gray-100 disabled:text-gray-300 transition-all focus:outline-none shadow-sm"
                    >
                      {isSending ? (
                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                      ) : (
                        <svg className={`h-5 w-5 ${isRtl ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </section>

          </div>
        </div>

        {/* Create Chat Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all border border-gray-100 animate-slide-in">
              <h3 className="text-sm font-bold text-gray-900 mb-4">{t("chat.createModalTitle")}</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const title = newChatName.trim() || "New Chat";
                setShowCreateModal(false);
                await handleNewChat(title, true);
              }}>
                <label className="block text-xs font-medium text-gray-500 mb-2">
                  {t("chat.createModalLabel")}
                </label>
                <input
                  type="text"
                  required
                  value={newChatName}
                  onChange={(e) => setNewChatName(e.target.value)}
                  placeholder={t("chat.createModalPlaceholder")}
                  className={`block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-xs text-gray-800 placeholder:text-gray-400 focus:bg-white focus:border-[#1b2b6b] focus:ring-1 focus:ring-[#1b2b6b] outline-none mb-6 ${
                    isRtl ? "text-right" : "text-left"
                  }`}
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setNewChatName("");
                    }}
                    className="min-h-10 rounded-xl border border-gray-200 bg-white px-4 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
                  >
                    {t("chat.createModalCancel")}
                  </button>
                  <button
                    type="submit"
                    className="min-h-10 rounded-xl bg-[#1b2b6b] px-5 text-xs font-bold text-white shadow-sm hover:bg-[#162358] transition"
                  >
                    {t("chat.createModalCreate")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Mobile Chat History Drawer */}
        {showMobileHistory && (
          <div className="fixed inset-0 z-50 flex sm:hidden">
            {/* Backdrop overlay */}
            <div
              onClick={() => setShowMobileHistory(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            />

            {/* Slide-out Panel */}
            <div
              className={`relative flex w-full max-w-xs flex-col bg-white h-full shadow-2xl transition-transform duration-300 ${
                isRtl ? "mr-auto animate-slide-in-right" : "ml-auto animate-slide-in-left"
              }`}
              dir={dir}
            >
              {/* Header inside Mobile History drawer */}
              <div className="flex h-14 items-center justify-between border-b border-gray-100 px-4 shrink-0">
                <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <svg className="h-5 w-5 text-[#1b2b6b]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t("chat.history")}
                </h2>
                <button
                  onClick={() => setShowMobileHistory(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none"
                  type="button"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Sessions list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50/30">
                {sessions.length === 0 ? (
                  <div className="text-center py-10 text-xs text-gray-400">
                    {t("chat.noSessions")}
                  </div>
                ) : (
                  sessions.map((session) => {
                    const isActive = session._id === activeSessionId;
                    return (
                      <div key={session._id} className="relative group">
                        <button
                          onClick={() => {
                            setActiveSessionId(session._id);
                            setShowMobileHistory(false);
                          }}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-all focus:outline-none pr-8 ${
                            isActive
                              ? "bg-[#e8ebf7] text-[#1b2b6b] shadow-sm font-semibold border-l-4 border-[#1b2b6b]"
                              : "text-gray-600 hover:bg-gray-100/70"
                          } ${isRtl ? "text-right pl-8 pr-3" : "text-left"}`}
                        >
                          <svg className={`h-4 w-4 shrink-0 ${isActive ? "text-[#1b2b6b]" : "text-gray-400"}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span className="truncate flex-1">{session.title || "New Chat"}</span>
                        </button>
                        <button
                          onClick={(e) => handleDeleteSession(session._id, e)}
                          disabled={isDeletingSession === session._id}
                          className={`absolute ${isRtl ? "left-2" : "right-2"} top-1/2 -translate-y-1/2 p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50`}
                          aria-label={isRtl ? "حذف" : "Delete"}
                        >
                          {isDeletingSession === session._id ? (
                            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                          ) : (
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Global Slide-In Toast Notification Alert System */}
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-xs font-semibold text-white shadow-lg pointer-events-auto transition-all duration-300 transform translate-y-0 animate-fade-in ${
                toast.type === "error" ? "bg-red-500" : "bg-green-500"
              }`}
              style={{ animation: 'slideIn 0.3s ease-out forwards' }}
            >
              <span className="text-sm shrink-0">{toast.type === "error" ? "⚠️" : "✅"}</span>
              <span className="break-words">{toast.message}</span>
            </div>
          ))}
        </div>

        {/* Dynamic inline styles for slideIn keyframes animation */}
        <style jsx global>{`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes slideInLeft {
            from {
              transform: translateX(-100%);
            }
            to {
              transform: translateX(0);
            }
          }
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
            }
            to {
              transform: translateX(0);
            }
          }
          .animate-slide-in-left {
            animation: slideInLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .animate-slide-in-right {
            animation: slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}</style>
      </OverviewShell>
    </div>
  );
}
