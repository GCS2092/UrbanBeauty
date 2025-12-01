'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeftIcon, 
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  CheckIcon,
  CheckCircleIcon,
  BoltIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { CheckIcon as CheckIconSolid } from '@heroicons/react/24/solid';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { useConversations, useMessages, useCreateConversation, useSendMessage } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { useQuickReplies } from '@/hooks/useQuickReplies';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get('userId');
  const { user } = useAuth();
  const { data: conversations = [], isLoading } = useConversations();
  const { mutate: createConversation } = useCreateConversation();
  const { mutate: sendMessage, isPending: isSending } = useSendMessage();
  
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Quick replies pour les prestataires
  const canUseQuickReplies = user?.role === 'COIFFEUSE' || user?.role === 'MANICURISTE' || user?.role === 'VENDEUSE' || user?.role === 'ADMIN';
  const { data: quickReplies = [] } = useQuickReplies();

  const { data: messages = [] } = useMessages(selectedConversationId || '');

  // Filtrer les conversations
  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery.trim()) return true;
    const name = conv.otherParticipant.profile 
      ? `${conv.otherParticipant.profile.firstName} ${conv.otherParticipant.profile.lastName}`
      : conv.otherParticipant.email;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Si un userId est fourni dans l'URL, créer ou ouvrir la conversation
  useEffect(() => {
    // Attendre que les conversations soient chargées
    if (!isLoading && targetUserId && user?.id && targetUserId !== user.id) {
      const existingConversation = conversations.find(
        (c) => c.otherParticipant.id === targetUserId
      );
      
      if (existingConversation) {
        setSelectedConversationId(existingConversation.id);
        setShowMobileChat(true);
        router.replace('/dashboard/chat');
      } else {
        // Créer la conversation si elle n'existe pas
        createConversation(
          { participant2Id: targetUserId },
          {
            onSuccess: (conversation) => {
              setSelectedConversationId(conversation.id);
              setShowMobileChat(true);
              router.replace('/dashboard/chat');
            },
            onError: (error) => {
              console.error('Erreur création conversation:', error);
            },
          }
        );
      }
    }
  }, [targetUserId, user?.id, createConversation, router, conversations, isLoading]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when conversation selected
  useEffect(() => {
    if (selectedConversationId) {
      inputRef.current?.focus();
    }
  }, [selectedConversationId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim() || !selectedConversationId || isSending) return;

    sendMessage(
      {
        conversationId: selectedConversationId,
        data: { content: messageContent },
      },
      {
        onSuccess: () => {
          setMessageContent('');
          inputRef.current?.focus();
        },
      }
    );
  };

  // Gérer les raccourcis de réponses rapides
  const handleMessageChange = (value: string) => {
    setMessageContent(value);
    
    // Vérifier si c'est un raccourci
    if (canUseQuickReplies && value.startsWith('/')) {
      const matchingReply = quickReplies.find(
        (r) => r.shortcut && r.shortcut.toLowerCase() === value.toLowerCase()
      );
      if (matchingReply) {
        setMessageContent(matchingReply.content);
        setShowQuickReplies(false);
      }
    }
  };

  // Insérer une réponse rapide
  const handleQuickReplySelect = (content: string) => {
    setMessageContent(content);
    setShowQuickReplies(false);
    inputRef.current?.focus();
  };

  const handleSelectConversation = (convId: string) => {
    setSelectedConversationId(convId);
    setShowMobileChat(true);
  };

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  const formatMessageDate = (date: Date) => {
    if (isToday(date)) return format(date, 'HH:mm');
    if (isYesterday(date)) return 'Hier';
    return format(date, 'dd/MM/yy');
  };

  const getParticipantName = (conv: typeof conversations[0]) => {
    return conv.otherParticipant.profile
      ? `${conv.otherParticipant.profile.firstName} ${conv.otherParticipant.profile.lastName}`
      : conv.otherParticipant.email;
  };

  const getParticipantAvatar = (conv: typeof conversations[0]) => {
    return conv.otherParticipant.profile?.avatar;
  };

  const getRoleLabel = (role?: string) => {
    if (role === 'VENDEUSE') return '🛍️ Vendeuse';
    if (role === 'COIFFEUSE') return '💇‍♀️ Coiffeuse';
    if (role === 'MANICURISTE') return '💅 Manicuriste';
    if (role === 'CLIENT') return '👤 Client';
    return '';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Mobile: Show either conversations list OR chat */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div className={`${showMobileChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 lg:w-96 bg-white border-r border-gray-200`}>
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-pink-500 to-rose-500">
            <div className="flex items-center justify-between mb-4">
              <Link href="/dashboard" className="text-white/80 hover:text-white">
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <h1 className="text-lg font-bold text-white">Messages</h1>
              <div className="w-5"></div>
            </div>
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white/90 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">Aucune conversation</p>
                <p className="text-sm text-gray-400 mt-1">
                  Contactez un vendeur ou une coiffeuse pour commencer
                </p>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => handleSelectConversation(conversation.id)}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                    selectedConversationId === conversation.id ? 'bg-pink-50' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {getParticipantAvatar(conversation) ? (
                      <Image
                        src={getParticipantAvatar(conversation)!}
                        alt=""
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {getParticipantName(conversation).charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    {conversation.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-pink-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <p className={`font-semibold truncate ${conversation.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                        {getParticipantName(conversation)}
                      </p>
                      <span className="text-[10px] text-gray-400">
                        {conversation.lastMessageAt && formatMessageDate(new Date(conversation.lastMessageAt))}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {getRoleLabel(conversation.otherParticipant.role)}
                    </p>
                    {conversation.lastMessage && (
                      <p className={`text-sm truncate mt-1 ${conversation.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                        {conversation.lastMessage}
                      </p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`${!showMobileChat ? 'hidden md:flex' : 'flex'} flex-col flex-1 bg-[#e5ddd5]`}
          style={{ backgroundImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAABYSURBVEiJ7c4xDsAgDATA8/9Pp06BjcnOAHSDJBZWuqssIBqNRp9SROQGOPc6ETEGAB+w89LJ2hV3AAdw8bw8mefr5dYGfNJYOjn3/Z8L+E9z6+Tc/7qAaLTkBflCEHLO0U0wAAAAAElFTkSuQmCC")' }}
        >
          {selectedConversationId ? (
            <>
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-3 flex items-center gap-3 shadow-sm">
                <button 
                  onClick={() => setShowMobileChat(false)}
                  className="md:hidden p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </button>
                
                {getParticipantAvatar(selectedConversation!) ? (
                  <Image
                    src={getParticipantAvatar(selectedConversation!)!}
                    alt=""
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-white font-bold">
                      {getParticipantName(selectedConversation!).charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">
                    {getParticipantName(selectedConversation!)}
                  </p>
                  <p className="text-xs text-white/70">
                    {getRoleLabel(selectedConversation?.otherParticipant.role)}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="bg-white/80 backdrop-blur rounded-xl p-4 text-center">
                      <p className="text-gray-600 text-sm">Commencez la conversation !</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const isOwn = message.senderId === user?.id;
                    const showDate = index === 0 || 
                      format(new Date(message.createdAt), 'yyyy-MM-dd') !== 
                      format(new Date(messages[index - 1].createdAt), 'yyyy-MM-dd');

                    return (
                      <div key={message.id}>
                        {showDate && (
                          <div className="flex justify-center my-4">
                            <span className="bg-white/80 backdrop-blur text-gray-600 text-xs px-3 py-1 rounded-full">
                              {isToday(new Date(message.createdAt)) 
                                ? "Aujourd'hui"
                                : isYesterday(new Date(message.createdAt))
                                  ? "Hier"
                                  : format(new Date(message.createdAt), 'dd MMMM yyyy', { locale: fr })
                              }
                            </span>
                          </div>
                        )}
                        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`relative max-w-[85%] sm:max-w-xs lg:max-w-sm px-3 py-2 rounded-lg shadow-sm ${
                              isOwn
                                ? 'bg-[#dcf8c6] text-gray-900 rounded-tr-none'
                                : 'bg-white text-gray-900 rounded-tl-none'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                            <div className={`flex items-center justify-end gap-1 mt-1 ${isOwn ? 'text-gray-500' : 'text-gray-400'}`}>
                              <span className="text-[10px]">
                                {format(new Date(message.createdAt), 'HH:mm')}
                              </span>
                              {isOwn && (
                                <CheckIconSolid className={`h-3.5 w-3.5 ${message.isRead ? 'text-blue-500' : 'text-gray-400'}`} />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              {/* Quick Replies Panel */}
              {showQuickReplies && canUseQuickReplies && (
                <div className="bg-white border-t border-gray-200 p-3 max-h-48 overflow-y-auto">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-500">Réponses rapides</span>
                    <button 
                      onClick={() => setShowQuickReplies(false)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                  {quickReplies.length === 0 ? (
                    <div className="text-center py-3">
                      <p className="text-xs text-gray-500">Aucune réponse rapide</p>
                      <Link 
                        href="/dashboard/quick-replies" 
                        className="text-xs text-purple-600 hover:underline"
                      >
                        Créer des réponses
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {quickReplies.map((reply) => (
                        <button
                          key={reply.id}
                          onClick={() => handleQuickReplySelect(reply.content)}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-purple-50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">{reply.title}</span>
                            {reply.shortcut && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded font-mono">
                                {reply.shortcut}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate mt-0.5">{reply.content}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSendMessage} className="bg-white/95 backdrop-blur p-3 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  {/* Quick Replies Button */}
                  {canUseQuickReplies && (
                    <button
                      type="button"
                      onClick={() => setShowQuickReplies(!showQuickReplies)}
                      className={`p-2.5 rounded-full transition-colors ${
                        showQuickReplies 
                          ? 'bg-purple-100 text-purple-600' 
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                      title="Réponses rapides"
                    >
                      <BoltIcon className="h-5 w-5" />
                    </button>
                  )}
                  <input
                    ref={inputRef}
                    type="text"
                    value={messageContent}
                    onChange={(e) => handleMessageChange(e.target.value)}
                    placeholder={canUseQuickReplies ? "Tapez un message ou /raccourci..." : "Tapez un message..."}
                    className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                  <button
                    type="submit"
                    disabled={!messageContent.trim() || isSending}
                    className="p-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PaperAirplaneIcon className="h-5 w-5" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="hidden md:flex flex-col items-center justify-center h-full">
              <div className="bg-white/80 backdrop-blur rounded-2xl p-8 text-center max-w-sm">
                <ChatBubbleLeftRightIcon className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">Messages</h2>
                <p className="text-gray-500 text-sm">
                  Sélectionnez une conversation pour commencer à discuter
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <ChatContent />
    </ProtectedRoute>
  );
}
