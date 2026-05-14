import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { 
  Search, 
  MoreVertical, 
  Send, 
  Check, 
  CheckCheck, 
  Smile, 
  Paperclip, 
  Camera, 
  Mic, 
  User, 
  ArrowLeft,
  Settings,
  Grid,
  MessageSquare,
  Users,
  FileText,
  Download,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import io from 'socket.io-client';

const Messages = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [availableContacts, setAvailableContacts] = useState([]);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchParams] = useSearchParams();
  const userIdFromUrl = searchParams.get('userId');
  
  const socket = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const currentUserId = String(
    user?._id || 
    user?.id || 
    localStorage.getItem("userId") || 
    ""
  ).trim();

  const commonEmojis = ['😊', '😂', '😍', '👍', '🙏', '🔥', '🤔', '😎', '🙌', '🎉', '💡', '✅', '❌', '❤️', '💯'];

  useEffect(() => {
    fetchConversations();
    fetchAvailableContacts();
    
    socket.current = io('https://localhost:5000');
    socket.current.emit('join', currentUserId);

    socket.current.on('new_message', (msg) => {
      handleIncomingMessage(msg);
    });

    socket.current.on('display_typing', ({ senderId, typing }) => {
      if (activeChat?._id === senderId) {
        setOtherUserTyping(typing);
      }
    });

    return () => {
        if (socket.current) socket.current.disconnect();
    };
  }, [user?._id, user?.id, activeChat?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, otherUserTyping]);

  useEffect(() => {
    if (activeChat) {
      fetchChat(activeChat._id);
      setOtherUserTyping(false);
      setShowChatMenu(false);
    }
  }, [activeChat]);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages/conversations');
      setConversations(res.data);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    }
  };

  const fetchAvailableContacts = async () => {
    try {
      const res = await api.get('/messages/available-contacts');
      setAvailableContacts(res.data);
      
      // Auto-select contact if userId is in URL
      if (userIdFromUrl) {
        const contact = res.data.find(c => String(c._id) === userIdFromUrl);
        if (contact) {
          setActiveChat(contact);
        }
      }
    } catch (err) {
      console.error('Failed to fetch available contacts:', err);
    }
  };

  const fetchChat = async (otherUserId) => {
    setIsLoading(true);
    try {
      const res = await api.get(`/messages/${otherUserId}`);
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to load chat:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = async () => {
    if (!activeChat) return;
    if (!window.confirm('Are you sure you want to delete all messages in this chat? This cannot be undone.')) return;
    
    try {
      await api.delete(`/messages/${activeChat._id}`);
      setMessages([]);
      setShowChatMenu(false);
      fetchConversations();
    } catch (err) {
      console.error('Failed to clear chat:', err);
    }
  };

  const handleIncomingMessage = (msg) => {
    const msgSenderId = String(msg.sender?._id || msg.sender?.id || msg.sender).trim();
    const msgRecipientId = String(msg.recipient?._id || msg.recipient?.id || msg.recipient).trim();
    
    console.log("INCOMING MESSAGE:", msg);
    console.log("PARSED SENDER:", msgSenderId);
    console.log("PARSED RECIPIENT:", msgRecipientId);

    setMessages(prev => {
        const isDuplicate = prev.some(m => m._id === msg._id);
        if (isDuplicate) return prev;

        const isRelevant = 
            (msgSenderId === String(activeChat?._id)) || 
            (msgSenderId === currentUserId && msgRecipientId === String(activeChat?._id));
        
        console.log("IS RELEVANT:", isRelevant);
        if (isRelevant) {
            return [...prev, msg];
        }
        return prev;
    });
    fetchConversations();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!activeChat || (!newMessage.trim() && !selectedFile)) return;

    const formData = new FormData();
    formData.append('recipientId', activeChat._id);
    if (newMessage.trim()) formData.append('text', newMessage);
    if (selectedFile) formData.append('file', selectedFile);

    setNewMessage('');
    setSelectedFile(null);
    setShowEmojiPicker(false);
    
    try {
      await api.post('/messages/send', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } catch (err) {
      console.error('Send failed:', err);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!activeChat) return;

    socket.current.emit('typing', {
      recipientId: activeChat._id,
      senderId: currentUserId,
      typing: e.target.value.length > 0
    });
  };

  const onFileSelect = (e) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const selectContact = (contact) => {
    setActiveChat(contact);
    setShowContacts(false);
  };

  const addEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
  };

  const filteredConversations = conversations.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredContacts = availableContacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen flex flex-col bg-[#f0f2f5] dark:bg-[#0c1317]">
      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex-1 flex overflow-hidden pt-[72px]">
        <Sidebar isOpen={isSidebarOpen} />
        
        <main className={`flex-1 flex transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
          
          {/* Left Sidebar (Conversations / Contacts) */}
          <div className="w-full md:w-[400px] border-r border-[#d1d7db] dark:border-[#222d34] flex flex-col bg-white dark:bg-[#111b21] z-20 relative overflow-hidden">
            
            <AnimatePresence mode="wait">
               {!showContacts ? (
                 <motion.div 
                    key="conversations"
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -300, opacity: 0 }}
                    className="flex flex-col h-full"
                 >
                    {/* Sidebar Header - CLEANED UP */}
                    <div className="h-16 px-4 py-2 bg-[#f0f2f5] dark:bg-[#202c33] flex items-center justify-between shadow-sm">
                       <div className="w-10 h-10 rounded-full bg-slate-300 overflow-hidden border border-white/20">
                          {user?.profilePicture ? (
                            <img src={`https://localhost:5000/${user.profilePicture}`} alt="me" className="w-full h-full object-cover" />
                          ) : <User size={24} className="m-auto mt-2 text-slate-500" />}
                       </div>
                       <div className="flex items-center space-x-6">
                          <button 
                            onClick={() => setShowContacts(true)}
                            className="text-[10px] font-black text-indigo-600 dark:text-emerald-500 uppercase tracking-[0.2em] hover:opacity-70 transition-all px-3 py-1.5 bg-indigo-50 dark:bg-emerald-500/10 rounded-lg border border-indigo-100 dark:border-emerald-500/20"
                          >
                             SELECT CONTACT
                          </button>
                       </div>
                    </div>

                    {/* Search */}
                    <div className="p-2 bg-white dark:bg-[#111b21]">
                        <div className="relative flex items-center">
                           <Search size={18} className="absolute left-3 text-[#54656f] dark:text-[#aebac1]" />
                           <input 
                              type="text"
                              placeholder="Search conversations"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full bg-[#f0f2f5] dark:bg-[#202c33] pl-10 pr-4 py-1.5 rounded-lg text-sm outline-none dark:text-[#e9edef]"
                           />
                        </div>
                    </div>

                    {/* Conversation List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                       {filteredConversations.length > 0 ? (
                         filteredConversations.map((conv) => (
                           <div 
                              key={conv._id}
                              onClick={() => selectContact(conv)}
                              className={`flex items-center px-4 py-3 cursor-pointer hover:bg-[#f5f6f6] dark:hover:bg-[#202c33] transition-colors ${activeChat?._id === conv._id ? 'bg-[#ebebeb] dark:bg-[#2a3942]' : ''}`}
                           >
                              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800">
                                 {conv.profilePicture ? (
                                    <img src={`https://localhost:5000/${conv.profilePicture}`} alt="p" className="w-full h-full object-cover" />
                                 ) : (
                                    <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400 font-bold uppercase text-lg">
                                       {conv.name.charAt(0)}
                                    </div>
                                 )}
                              </div>
                              <div className="ml-4 flex-1 border-b border-[#f0f2f5] dark:border-[#222d34] pb-3">
                                 <div className="flex justify-between items-center mb-1">
                                    <h3 className="text-base font-medium text-[#111b21] dark:text-[#e9edef] truncate">{conv.name}</h3>
                                    <span className="text-[11px] text-[#667781] dark:text-[#8696a0]">
                                       {conv.lastMessageDate ? new Date(conv.lastMessageDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </span>
                                 </div>
                                 <div className="flex justify-between items-center text-xs text-[#667781] dark:text-[#8696a0]">
                                    <p className="truncate max-w-[200px]">{conv.lastMessage || 'Click to converse'}</p>
                                    {conv.unreadCount > 0 && (
                                       <span className="bg-[#25d366] text-white rounded-full w-5 h-5 flex items-center justify-center font-bold text-[10px]">{conv.unreadCount}</span>
                                    )}
                                 </div>
                              </div>
                           </div>
                         ))
                       ) : (
                        <div className="p-12 text-center opacity-40">
                           <MessageSquare size={32} className="mx-auto mb-4" />
                           <p className="text-xs font-black uppercase tracking-widest">No Active Nodes</p>
                        </div>
                       )}
                    </div>
                 </motion.div>
               ) : (
                 <motion.div 
                    key="contacts"
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 300, opacity: 0 }}
                    className="flex flex-col h-full bg-white dark:bg-[#111b21]"
                 >
                    {/* Contacts Header */}
                    <div className="h-28 bg-[#008069] dark:bg-[#202c33] flex items-end p-4 pb-5 space-x-6 text-white shrink-0">
                       <ArrowLeft 
                          size={24} 
                          className="cursor-pointer mb-0.5" 
                          onClick={() => setShowContacts(false)} 
                       />
                       <h2 className="text-lg font-medium tracking-tight">New Conversation</h2>
                    </div>

                    <div className="p-2 bg-white dark:bg-[#111b21]">
                        <div className="relative flex items-center">
                           <Search size={18} className="absolute left-3 text-[#54656f] dark:text-[#aebac1]" />
                           <input 
                              type="text"
                              placeholder="Search Personnel"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full bg-[#f0f2f5] dark:bg-[#202c33] pl-10 pr-4 py-1.5 rounded-lg text-sm outline-none dark:text-[#e9edef]"
                           />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                       <div className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-[#008069] dark:text-[#00a884] border-b border-slate-50 dark:border-slate-800">Live Registry</div>
                       {filteredContacts.map(contact => (
                          <div 
                             key={contact._id}
                             onClick={() => selectContact(contact)}
                             className="flex items-center px-4 py-3 cursor-pointer hover:bg-[#f5f6f6] dark:hover:bg-[#202c33] border-b border-transparent hover:border-[#f0f2f5] dark:hover:border-[#222d34]"
                          >
                             <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-slate-50 dark:border-slate-800">
                                {contact.profilePicture ? (
                                   <img src={`https://localhost:5000/${contact.profilePicture}`} alt="p" className="w-full h-full object-cover" />
                                ) : (
                                   <div className="w-full h-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 font-bold uppercase">
                                      {contact.name.charAt(0)}
                                   </div>
                                )}
                             </div>
                             <div className="ml-4 flex-1">
                                <h3 className="text-base font-medium text-[#111b21] dark:text-[#e9edef] truncate">{contact.name}</h3>
                                <p className="text-xs text-[#667781] dark:text-[#8696a0] truncate capitalize">{contact.role}</p>
                             </div>
                          </div>
                       ))}
                    </div>
                 </motion.div>
               )}
            </AnimatePresence>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col relative">
             {activeChat ? (
                <>
                   {/* Chat Header */}
                   <div className="h-16 px-4 py-2 bg-[#f0f2f5] dark:bg-[#202c33] flex items-center justify-between border-l border-[#d1d7db] dark:border-[#222d34] shrink-0 z-50">
                      <div className="flex items-center cursor-pointer">
                         <ArrowLeft className="md:hidden mr-3 text-[#54656f]" onClick={() => setActiveChat(null)} />
                         <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20">
                            {activeChat.profilePicture ? (
                               <img src={`https://localhost:5000/${activeChat.profilePicture}`} alt="p" className="w-full h-full object-cover" />
                            ) : (
                               <div className="w-full h-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-slate-500 font-bold uppercase">
                                  {activeChat.name.charAt(0)}
                               </div>
                            )}
                         </div>
                         <div className="ml-3">
                            <h2 className="text-base font-medium text-[#111b21] dark:text-[#e9edef] leading-none">{activeChat.name}</h2>
                            <p className="text-xs text-[#667781] dark:text-[#8696a0] mt-1 italic">
                               {otherUserTyping ? 'typing...' : (activeChat.isOnline ? 'Online' : 'Last seen recently')}
                            </p>
                         </div>
                      </div>
                      <div className="flex items-center space-x-6 text-[#54656f] dark:text-[#aebac1] relative">
                         <div className="relative">
                            <MoreVertical size={20} className="cursor-pointer" onClick={() => setShowChatMenu(!showChatMenu)} />
                            <AnimatePresence>
                               {showChatMenu && (
                                  <motion.div 
                                     initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                     animate={{ opacity: 1, scale: 1, y: 0 }}
                                     exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                     className="absolute right-0 mt-3 w-52 bg-white dark:bg-[#233138] rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 z-[100] overflow-hidden"
                                  >
                                     <button 
                                        onClick={clearChat}
                                        className="w-full text-left px-5 py-4 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#182229] transition-all border-b border-slate-50 dark:border-slate-800"
                                     >
                                        Delete all the chats
                                     </button>
                                     <button 
                                        onClick={() => setActiveChat(null)}
                                        className="w-full text-left px-5 py-4 text-[11px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
                                     >
                                        Close chat
                                     </button>
                                  </motion.div>
                               )}
                            </AnimatePresence>
                         </div>
                      </div>
                   </div>


                   {/* Chat Messages */}
                   <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-4 bg-slate-50 dark:bg-slate-950 z-10 custom-scrollbar relative">
                      <AnimatePresence initial={false}>
                        {messages.map((m, idx) => {
                          const senderId = String(
                            m?.sender?._id || 
                            m?.sender?.id || 
                            m?.sender
                          ).trim();
                          
                          const isMe = currentUserId === senderId;
                          
                          // Debugging
                          console.log("CURRENT USER:", currentUserId);
                          console.log("MESSAGE SENDER:", senderId);
                          console.log("MESSAGE:", m);
                          console.log("IS ME:", isMe);
                          const showDate = idx === 0 || new Date(messages[idx-1].createdAt).toDateString() !== new Date(m.createdAt).toDateString();
                          
                          return (
                            <React.Fragment key={m._id || idx}>
                              {showDate && (
                                <div className="flex justify-center my-8 relative z-10">
                                   <span className="px-4 py-1 bg-white/90 dark:bg-[#202c33]/90 backdrop-blur-sm rounded-xl text-[9px] font-black text-slate-500 dark:text-slate-400 shadow-sm uppercase tracking-[0.2em]">
                                     {new Date(m.createdAt).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                                   </span>
                                </div>
                              )}
                              
                                <motion.div 
                                  initial={{ opacity: 0, y: 15, scale: 0.95 }} 
                                  animate={{ opacity: 1, y: 0, scale: 1 }} 
                                  className={`flex w-full mb-2 ${isMe ? "justify-end" : "justify-start"}`}
                                >
                                 <div className={`max-w-[85%] md:max-w-[70%] relative px-5 py-4 shadow-lg ${
                                    isMe 
                                    ? 'bg-indigo-600 text-white rounded-[1.5rem] rounded-tr-none' 
                                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-[1.5rem] rounded-tl-none border border-slate-100 dark:border-slate-700'
                                 }`}>
                                    {m.file && (
                                       <div className="mb-3 rounded-lg overflow-hidden bg-black/5 dark:bg-white/5 p-1 border border-black/10">
                                          {m.fileType?.startsWith('image/') ? (
                                             <img src={`https://localhost:5000/${m.file}`} alt="file" className="w-full max-h-[300px] object-cover rounded-md cursor-pointer hover:scale-[1.02] transition-transform" />
                                          ) : (
                                             <div className="flex items-center space-x-4 p-3 pr-10 relative">
                                                <div className="p-2 bg-indigo-600 text-white rounded-lg"><FileText size={20} /></div>
                                                <div className="flex-1 truncate">
                                                   <p className="text-xs font-bold truncate max-w-[150px]">{m.fileName}</p>
                                                   <p className="text-[9px] opacity-50 uppercase font-black">{m.fileType?.split('/')[1] || 'FILE'}</p>
                                                </div>
                                                <a href={`https://localhost:5000/${m.file}`} target="_blank" rel="noreferrer" className="absolute right-2 p-2 hover:bg-black/10 rounded-full transition-colors"><Download size={16} /></a>
                                             </div>
                                          )}
                                       </div>
                                    )}
                                    <p className="text-[14px] leading-relaxed whitespace-pre-wrap font-normal">{m.text}</p>
                                    <div className="mt-2 flex items-center justify-end space-x-1 float-right ml-6">
                                       <span className={`text-[9px] font-black uppercase tracking-widest ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                       </span>
                                       {isMe && <CheckCheck size={14} className="text-white/70" />}
                                    </div>

                                 </div>
                              </motion.div>
                            </React.Fragment>
                          );
                        })}
                      </AnimatePresence>
                      
                      {otherUserTyping && (
                        <div className="flex justify-start relative z-10 pl-2">
                           <div className="bg-white/90 dark:bg-[#202c33]/90 px-4 py-3 rounded-2xl flex space-x-1.5 shadow-sm">
                              <span className="w-1.5 h-1.5 bg-[#8696a0] rounded-full animate-bounce"></span>
                              <span className="w-1.5 h-1.5 bg-[#8696a0] rounded-full animate-bounce delay-150"></span>
                              <span className="w-1.5 h-1.5 bg-[#8696a0] rounded-full animate-bounce delay-300"></span>
                           </div>
                        </div>
                      )}
                      
                       {messages.length === 0 && !isLoading && (
                         <div className="h-full flex flex-col items-center justify-center opacity-20">
                            <MessageSquare size={48} className="mb-4" />
                            <p className="text-xs font-black uppercase tracking-[0.3em]">Temporal void detected. Start the exchange.</p>
                         </div>
                       )}
                       <div ref={messagesEndRef} />
                   </div>

                   {/* Message Input Area */}
                   <div className="bg-white dark:bg-slate-900 px-6 py-4 flex flex-col space-y-4 shrink-0 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] border-t border-slate-100 dark:border-slate-800">
                      
                      {/* Selection Previews */}
                      {selectedFile && (
                          <div className="bg-white dark:bg-[#2a3942] p-3 rounded-2xl flex items-center justify-between border border-emerald-500 animate-in slide-in-from-bottom-2">
                             <div className="flex items-center space-x-4">
                                {selectedFile.type.startsWith('image/') ? <ImageIcon className="text-emerald-500" size={18} /> : <FileText className="text-emerald-500" size={18} />}
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate max-w-[200px]">{selectedFile.name}</span>
                             </div>
                             <button onClick={() => setSelectedFile(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full text-slate-400"><X size={16} /></button>
                          </div>
                      )}

                      <div className="flex items-center space-x-4">
                        <div className="flex space-x-5 text-slate-400 dark:text-slate-500 relative">
                           <Smile size={22} className="cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => setShowEmojiPicker(!showEmojiPicker)} />
                           <Paperclip size={22} className="cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => fileInputRef.current?.click()} />
                           <input type="file" ref={fileInputRef} onChange={onFileSelect} className="hidden" />

                           {showEmojiPicker && (
                              <div className="absolute bottom-12 left-0 bg-white dark:bg-[#233138] p-3 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 grid grid-cols-5 gap-2 z-[100] w-[200px]">
                                 {commonEmojis.map(e => (
                                    <button key={e} onClick={() => addEmoji(e)} className="text-xl hover:scale-125 transition-transform">{e}</button>
                                 ))}
                              </div>
                           )}
                        </div>
                        
                        <form onSubmit={handleSendMessage} className="flex-1 flex items-center bg-white dark:bg-[#2a3942] px-5 py-2.5 rounded-2xl border border-transparent focus-within:border-emerald-500/30 transition-all">
                           <input 
                              type="text"
                              placeholder="Draft an academic response..."
                              value={newMessage}
                              onChange={handleTyping}
                              onFocus={() => setShowEmojiPicker(false)}
                              className="w-full bg-transparent text-sm outline-none dark:text-[#e9edef] dark:placeholder:text-[#8696a0]"
                           />
                           <button 
                              type="submit"
                              className={`ml-4 p-1 hover:scale-110 transition-all ${newMessage.trim() || selectedFile ? 'text-[#00a884]' : 'text-slate-300 dark:text-slate-600'}`}
                           >
                              <Send size={24} strokeWidth={2.5} />
                           </button>
                        </form>
                      </div>
                   </div>
                </>
             ) : (
               <div className="flex-1 flex flex-col items-center justify-center bg-[#f8f9fa] dark:bg-[#222e35] border-l border-[#d1d7db] dark:border-[#222d34]">
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md text-center px-10">
                     <div className="w-64 h-64 mx-auto mb-10 opacity-60">
                        <svg viewBox="0 0 327 232" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <path d="M163.5 0C118.49 0 82 36.49 82 81.5C82 126.51 118.49 163 163.5 163C208.51 163 245 126.51 245 81.5C245 36.49 208.51 0 163.5 0Z" fill={theme === 'dark' ? '#2f3b43' : '#e1e9eb'}/>
                           <circle cx="163" cy="81" r="30" fill={theme === 'dark' ? '#111b21' : '#fff'} />
                        </svg>
                     </div>
                     <h1 className="text-3xl font-light text-[#41525d] dark:text-[#e9edef] mb-4 tracking-tight">Learn Sphere Messaging</h1>
                     <p className="text-sm text-[#667781] dark:text-[#8696a0] leading-relaxed font-medium">
                        Send and receive localized academic intelligence.<br/>
                        Securely exchange documents with instructors and peers.
                     </p>
                  </motion.div>
                  <div className="absolute bottom-8 flex items-center space-x-2 text-[#667781] dark:text-[#8696a0] text-[10px] font-black uppercase tracking-widest opacity-40">
                     <Grid size={14} />
                     <span>Classroom Shield Active</span>
                  </div>
               </div>
             )}
          </div>

        </main>
      </div>
    </div>
  );
};

export default Messages;
