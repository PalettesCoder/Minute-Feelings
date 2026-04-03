import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, ChevronRight, Library as LibraryIcon, ArrowLeft, LogOut, ShieldCheck, User as UserIcon, ChevronDown, Menu, X, Search, Sparkles } from 'lucide-react';
import { books as staticBooks } from './data/chapters';
import LoginPage from './components/LoginPage';
import AdminPortal from './components/AdminPortal';
import { authService, highlightService, bookmarkService, bookService } from './services/api';

const Library = ({ onSelectBook, user, onAdminClick, books }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setShowDropdown(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="scrapbook-desk">
      <div className="desk-lighting" />
      <div className="desk-texture" />
      
      <div className="desk-decor">
        <div className="coffee-stain" />
        <div className="pencil-sketch" />
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 w-full max-w-7xl mx-auto px-12 pt-16 pb-32 flex flex-col items-center"
      >
        <header className="mb-20 text-center relative">
          <div className="flex items-center justify-center gap-6 mb-4">
            {user?.role === 'admin' && (
              <button 
                onClick={onAdminClick}
                className="px-4 py-2 bg-accent/20 text-accent font-title text-sm rounded-full border border-accent/30 hover:bg-accent/30 transition-all mr-4 flex items-center gap-2"
              >
                <LibraryIcon size={16} /> Admin Portal
              </button>
            )}
            <div className="relative">
              <div 
                className="flex items-center gap-4 group cursor-pointer hover:opacity-80 transition-all px-4 py-2 rounded-full border border-transparent hover:border-black/5 hover:bg-black/5"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white font-title text-2xl shadow-xl border-2 border-white/20">
                  {user?.fullName?.charAt(0) || user?.username?.charAt(0) || '?'}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-[10px] uppercase tracking-widest opacity-40">Active Reader</div>
                  <div className="font-hand text-2xl flex items-center gap-2">
                    {user?.fullName || user?.username || 'Fellow Reader'}
                    <ChevronDown size={16} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {showDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 mt-4 w-56 bg-[#fcfaf2] border border-black/10 rounded shadow-2xl z-[100] p-2 flex flex-col gap-1 overflow-hidden"
                    style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}
                  >
                    <div className="washi-tape-small" />
                    
                    <div className="px-4 py-3 border-b mb-1">
                      <div className="text-[10px] uppercase tracking-[0.2em] opacity-40">{user?.username}</div>
                      <div className="font-title text-sm truncate uppercase tracking-tighter opacity-60 text-[9px]">{user?.role || 'Reader'}</div>
                    </div>

                    {user?.role === 'admin' && (
                      <button 
                        onClick={() => { onAdminClick(); setShowDropdown(false); }}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-accent/5 text-accent rounded transition-colors text-left"
                      >
                        <ShieldCheck size={18} />
                        <span className="font-title text-xs uppercase tracking-widest font-bold">Admin Portal</span>
                      </button>
                    )}

                    <button 
                      onClick={() => {
                         localStorage.removeItem('library_user');
                         window.location.reload();
                      }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600/70 hover:text-red-600 rounded transition-colors text-left w-full"
                    >
                      <LogOut size={18} />
                      <span className="font-title text-xs uppercase tracking-widest font-bold">Close Library</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <motion.h1 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="font-hand text-6xl text-[#d4af37] mb-2 drop-shadow-lg"
          >
            Minute Feelings
          </motion.h1>
          <p className="font-title text-sm uppercase tracking-[0.4em] opacity-40 mt-4">The Scribbled Library</p>
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-32 h-px bg-white/10" />
        </header>

        <div className="scrapbook-grid">
          {books.map((book, i) => {
            const rotations = [-3, 2, -1.5, 4, -2.5];
            const rot = rotations[i % rotations.length];
            
            return (
              <motion.div 
                 key={book.slug}
                 initial={{ opacity: 0, scale: 0.9, rotate: rot - 5, y: 30 }}
                 animate={{ opacity: 1, scale: 1, rotate: rot, y: 0 }}
                 transition={{ delay: i * 0.1, duration: 0.6 }}
                 className="scrapbook-card group"
                 onClick={() => onSelectBook(book.slug)}
              >
                 <div className="washi-tape" />
                 <div className="card-shadow" />
                 <div className="card-inner" style={{ background: book.coverColor }}>
                    <div className="paper-texture" />
                    <div className="card-content">
                       <span className="card-subtitle">{book.subtitle}</span>
                       <h2 className="card-title font-hand">{book.title}</h2>
                       <div className="card-footer">
                          <span className="card-author">by {book.author}</span>
                          <span className="card-action">Read story →</span>
                       </div>
                    </div>
                 </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

const BookCover = ({ book, onOpen }) => {
  return (
    <motion.div 
      className="book-container cover-container"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 1.1, opacity: 0, rotateY: -90 }}
      transition={{ duration: 0.8 }}
      onClick={onOpen}
      style={{ perspective: 2000 }}
    >
      <div className="cover-inner" style={{ background: book.coverColor }}>
         <h3 className="font-title mb-4 tracking-widest text-sm" style={{ color: '#d4af37' }}>{book.subtitle}</h3>
         <h1 className="font-title title-large" style={{ color: '#d4af37' }}>{book.title}</h1>
         <div className="mt-12 font-hand" style={{ fontSize: '2rem', opacity: 0.8 }}>
            A true story
         </div>
         <div className="mt-12 text-sm uppercase tracking-widest opacity-50 flex items-center gap-2">
            Click to open <ChevronRight size={16} />
         </div>
      </div>
    </motion.div>
  );
};

const OpenBook = ({ book, onBackToLibrary, user, onAdminClick }) => {
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);
  
  if (!book) {
    return (
      <div className="flex items-center justify-center w-full h-full text-accent font-title uppercase tracking-widest text-sm">
        Opening Archive...
      </div>
    );
  }

  // Combine parts and chapters into a flat list for navigation
  // Handle both static parts structure and API flat chapters structure
  const allChapters = book.parts 
    ? book.parts.flatMap(p => p.chapters.map(c => ({...c, partName: p.name})))
    : (book.chapters || []).map(c => ({
        ...c, 
        partName: "Stories", 
        content: typeof c.contentJson === 'string' ? JSON.parse(c.contentJson) : c.content
      }));
  
  const [activeChapterId, setActiveChapterId] = useState(() => {
    const saved = localStorage.getItem(`last_read_chapter_${book.slug}`);
    return saved ? parseInt(saved) : allChapters[0]?.id || 0;
  });
  
  const [viewMode, setViewMode] = useState('toc');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const readerDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
        if (readerDropdownRef.current && !readerDropdownRef.current.contains(event.target)) {
            setShowDropdown(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [highlights, setHighlights] = useState(() => {
    const saved = localStorage.getItem(`highlights_${book.slug}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [selection, setSelection] = useState({ text: '', visible: false, x: 0, y: 0 });
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    if (user) {
        highlightService.getUserHighlights(user.id).then(setHighlights).catch(console.error);
        bookmarkService.getUserBookmarks(user.id).then(setBookmarks).catch(console.error);
    }
  }, [user, book.slug]);

  const toggleBookmark = async (chapterId) => {
    if (!user) return;
    const isBookmarked = bookmarks.some(b => b.chapterId === chapterId);
    if (isBookmarked) {
        await bookmarkService.delete(user.id, chapterId);
        setBookmarks(bookmarks.filter(b => b.chapterId !== chapterId));
    } else {
        const saved = await bookmarkService.create(user.id, chapterId);
        setBookmarks([...bookmarks, saved]);
    }
  };

  useEffect(() => {
    if (!user) {
        localStorage.setItem(`highlights_${book.slug}`, JSON.stringify(highlights));
    }
  }, [highlights, book.slug, user]);

  useEffect(() => {
    localStorage.setItem(`last_read_chapter_${book.slug}`, activeChapterId.toString());
  }, [activeChapterId, book.slug]);

  useEffect(() => {
    const handleMouseUp = (e) => {
      // Don't close if we clicked the tooltip itself
      if (e.target.closest('.highlight-tooltip')) return;

      // Small delay to ensure the browser's selection is fully updated
      setTimeout(() => {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();
        
        if (selectedText && selectedText.length > 2) {
          try {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            
            // Ensure we're highlighting in the right page content area
            const isInsideReader = e.target.closest('.page-right');
            
            if (isInsideReader) {
              setSelection({
                text: selectedText,
                x: rect.left + rect.width / 2,
                y: rect.top - 10,
                visible: true
              });
            } else {
              setSelection(s => ({ ...s, visible: false }));
            }
          } catch (err) {
            console.error("Selection error:", err);
          }
        } else {
          setSelection(s => ({ ...s, visible: false }));
        }
      }, 50);
    };
    
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keyup', handleMouseUp); // Also handle keyboard selection
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keyup', handleMouseUp);
    };
  }, []);

  const saveHighlight = async () => {
    if (selection.text) {
      if (highlights.some(h => h.text === selection.text)) {
        const hToDelete = highlights.find(h => h.text === selection.text);
        if (user && hToDelete.id) await highlightService.delete(hToDelete.id);
        setHighlights(highlights.filter(h => h.text !== selection.text));
      } else {
        const newH = { id: Date.now(), text: selection.text, chapterId: activeChapterId, date: new Date().toISOString() };
        if (user) {
            const saved = await highlightService.create(user.id, activeChapterId, selection.text);
            newH.id = saved.id;
        }
        setHighlights([newH, ...highlights]);
      }
    }
    setSelection({ ...selection, visible: false });
  };
  const activeChapter = allChapters.find(c => c.id === activeChapterId) || allChapters[0];
  const leftPageNumber = activeChapter.id * 2 - 1;
  const rightPageNumber = activeChapter.id * 2;

  const renderWithHighlights = (text, chapterId) => {
    if (!text) return '';
    const chapterHighlights = highlights.filter(h => h.chapterId === chapterId);
    
    // If it looks like HTML (from the new rich editor), we render it directly
    // Note: highlighting inside rich text is complex, so we prioritize the rich formatting for now
    if (text.trim().startsWith('<') && text.trim().endsWith('>')) {
      return <div dangerouslySetInnerHTML={{ __html: text }} className="rich-content" />;
    }

    if (chapterHighlights.length === 0) return text;

    const escapedTexts = chapterHighlights
      .map(h => h.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .sort((a, b) => b.length - a.length);

    if (escapedTexts.length === 0) return text;

    const regex = new RegExp(`(${escapedTexts.join('|')})`, 'g');
    const parts = String(text).split(regex);

    return parts.map((part, i) => {
      const match = chapterHighlights.find(h => h.text === part);
      if (match) {
        return (
          <mark 
            key={i} 
            id={`mark-${match.id}`}
            style={{ 
              backgroundColor: 'rgba(245, 158, 11, 0.25)', 
              color: 'inherit',
              borderRadius: '4px',
              padding: '2px 0px',
              boxShadow: '0 0 8px rgba(245, 158, 11, 0.1)'
            }}
          >
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  // Render Left Page Content
  const renderLeftPageContent = () => (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full"
    >
      <div className="flex justify-between items-center mb-10 border-b pb-4">
        {/* Left: Back button */}
        <div className="flex-none">
          <button 
            onClick={onBackToLibrary}
            className="p-2 rounded-full opacity-50 hover:opacity-100 hover:bg-black/5 hover:text-accent transition-all"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            title="Back to Library"
          >
            <ArrowLeft size={18} />
          </button>
        </div>

        {/* Center: Tabs */}
        <div className="flex-1 flex justify-center gap-10">
          <button 
            onClick={() => setViewMode('toc')}
            className={`font-title title-small ${viewMode === 'toc' ? 'text-accent' : 'text-muted'}`}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.95rem', whiteSpace: 'nowrap' }}
          >
            Contents
          </button>
          <button 
            onClick={() => setViewMode('bookmarks')}
            className={`font-title title-small ${viewMode === 'bookmarks' ? 'text-accent' : 'text-muted'}`}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.95rem', whiteSpace: 'nowrap' }}
          >
            Bookmarks ({bookmarks.length + highlights.length})
          </button>
        </div>

        {/* Right: Profile Dropdown */}
        <div className="flex-none flex items-center justify-end gap-3">
          <div className="relative" ref={readerDropdownRef}>
            <div 
              className="flex items-center gap-2 group cursor-pointer hover:bg-black/5 p-1 px-2 rounded-full transition-all"
              onClick={() => setShowDropdown(!showDropdown)}
              title={user?.fullName || 'Profile'}
            >
              <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-bold text-accent border border-accent/30 lowercase">
                {user?.username?.charAt(0) || 'u'}
              </div>
            </div>

            <AnimatePresence>
              {showDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: 5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.95 }}
                  className="absolute top-full right-0 mt-2 w-48 bg-[#fcfaf2] border border-black/10 rounded shadow-xl z-50 p-2 flex flex-col gap-1"
                  style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}
                >
                  <div className="px-3 py-2 border-b mb-1">
                    <div className="text-[10px] font-bold text-accent uppercase tracking-wider">{user?.fullName}</div>
                    <div className="text-[8px] opacity-40 uppercase tracking-widest mt-0.5">
                      {user?.role || 'Reader'} Role
                    </div>
                  </div>
                  
                  {user?.role === 'admin' && (
                    <button 
                      onClick={() => { onAdminClick(); setShowDropdown(false); }}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-accent/5 text-accent rounded transition-colors text-left cursor-pointer"
                    >
                      <ShieldCheck size={14} />
                      <span className="font-title text-[10px] uppercase tracking-widest font-bold">Admin Panel</span>
                    </button>
                  )}

                  <button 
                    onClick={() => {
                      localStorage.removeItem('library_user');
                      window.location.reload();
                    }}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600/60 hover:text-red-600 rounded transition-colors text-left w-full cursor-pointer"
                  >
                    <LogOut size={14} />
                    <span className="font-title text-[10px] uppercase tracking-widest font-bold">Exit Library</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {viewMode === 'toc' ? (
        <div className="flex flex-col gap-6">
          {book.parts ? book.parts.map(part => (
            <div key={part.id}>
                <h3 className="font-title title-small mb-2 text-accent">{part.name}</h3>
                <ul className="flex flex-col gap-2">
                  {part.chapters.map(ch => (
                    <li 
                      key={ch.id} 
                      className={`nav-item ${activeChapterId === ch.id ? 'active' : ''}`}
                      onClick={() => setActiveChapterId(ch.id)}
                    >
                      <span className="font-body text-body" style={{ fontSize: '1rem' }}>
                       {ch.id}. {ch.title}
                      </span>
                    </li>
                  ))}
                </ul>
             </div>
          )) : (
            <div>
              <h3 className="font-title title-small mb-2 text-accent">Stories</h3>
              <ul className="flex flex-col gap-2">
                {allChapters.map(ch => (
                  <li 
                    key={ch.id} 
                    className={`nav-item ${activeChapterId === ch.id ? 'active' : ''}`}
                    onClick={() => setActiveChapterId(ch.id)}
                  >
                    <span className="font-body text-body" style={{ fontSize: '1rem' }}>
                     {ch.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-2 border-b pb-2 mb-4">
             <input 
                type="text" 
                placeholder="Search bookmarks & highlights..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent font-body outline-none text-xs"
                style={{ color: 'var(--color-ink)' }}
             />
          </div>

          {allChapters
            .filter(ch => bookmarks.some(b => b.chapterId === ch.id) || highlights.some(h => h.chapterId === ch.id))
            .filter(ch => {
                if (!searchQuery) return true;
                const chapterMatches = ch.title.toLowerCase().includes(searchQuery.toLowerCase());
                const highlightsMatch = highlights.some(h => h.chapterId === ch.id && h.text.toLowerCase().includes(searchQuery.toLowerCase()));
                return chapterMatches || highlightsMatch;
            })
            .map(ch => {
              const chHighlights = highlights.filter(h => h.chapterId === ch.id && (!searchQuery || h.text.toLowerCase().includes(searchQuery.toLowerCase())));
              const isBookmarked = bookmarks.some(b => b.chapterId === ch.id);
              
              return (
                <div key={ch.id} className="mb-6 px-1">
                   <div 
                      className="flex items-center justify-between group cursor-pointer hover:bg-black/5 p-2 rounded transition-colors"
                      onClick={() => { setActiveChapterId(ch.id); }}
                   >
                      <div className="flex items-center gap-3">
                         <span className="font-title font-bold text-sm">{ch.id}. {ch.title}</span>
                      </div>
                      <span className="text-[10px] uppercase tracking-tighter opacity-40 group-hover:opacity-100">{chHighlights.length} highlights</span>
                   </div>

                   {chHighlights.length > 0 && (
                     <div className="mt-4 ml-6 border-l-2 border-accent/10 pl-6 flex flex-col gap-5">
                        {chHighlights.map((h, i) => (
                          <div key={h.id || i} className="relative group/h">
                             <p 
                                className="font-hand text-accent leading-tight text-lg cursor-pointer hover:opacity-80 pr-4"
                                onClick={(e) => {
                                   e.stopPropagation();
                                   setActiveChapterId(ch.id); 
                                   setTimeout(() => {
                                     const el = document.getElementById(`mark-${h.id}`);
                                     if (el) {
                                       const container = el.closest('.page-right');
                                       if (container) {
                                          const offsetTop = el.offsetTop - container.offsetTop - (container.clientHeight / 2);
                                          container.scrollTo({ top: offsetTop, behavior: 'smooth' });
                                       }
                                     }
                                   }, 500);
                                }}
                             >
                               “{h.text}”
                             </p>
                             <button 
                               onClick={async (e) => {
                                 e.stopPropagation();
                                 if (user && h.id) await highlightService.delete(h.id);
                                 setHighlights(highlights.filter(x => x !== h));
                               }}
                               className="absolute -right-1 top-0 opacity-0 group-hover/h:opacity-100 text-muted hover:text-red-600 transition-opacity"
                               style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                             >
                               ×
                             </button>
                          </div>
                        ))}
                     </div>
                   )}
                </div>
              );
            })
          }
          {allChapters.filter(ch => bookmarks.some(b => b.chapterId === ch.id) || highlights.some(h => h.chapterId === ch.id)).length === 0 && (
             <p className="text-muted text-center italic mt-12">No bookmarks or highlights yet.</p>
          )}
        </div>
      )}
    </motion.div>
  );

  // Render Chapter Content (Right Page)
  const renderChapterContent = () => {
    return (
      <motion.div 
        key={activeChapter.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4 }}
        className="w-full"
      >
          <div className="mb-8 border-b pb-4">
             <div className="text-muted text-sm uppercase tracking-widest">{activeChapter.partName}</div>
             <h1 className="font-title title-large mt-4" style={{ lineHeight: '1.2' }}>{activeChapter.title}</h1>
             <p className="font-hand mt-4" style={{ fontSize: '1.5rem', color: 'var(--color-accent)' }}>
               “{activeChapter.meta}”
             </p>
          </div>
          
          <div className="font-body text-body flex flex-col gap-4 chapter-body">
            {/* Mobile ToC Toggle - Custom class for reliability */}
            <div className="mobile-only-flex items-center justify-between mb-6 p-3 bg-accent/5 rounded-lg border border-accent/10 cursor-pointer" onClick={() => setIsMobileTocOpen(true)}>
              <div className="flex items-center gap-2 text-accent font-title text-sm uppercase tracking-widest font-bold">
                <Menu size={18} />
                <span>Table of Contents</span>
              </div>
              <div className="text-[10px] opacity-40 uppercase tracking-tighter">Chapter {activeChapter.id}</div>
            </div>

            {activeChapter.content ? (
              activeChapter.content.map((p, i) => (
                <div key={i} className="mb-4 text-justify" style={{ textIndent: p.trim().startsWith('<') ? '0' : '2rem', lineHeight: '2' }}>
                   {renderWithHighlights(p, activeChapter.id)}
                </div>
              ))
            ) : (
              <p className="italic text-muted center font-title mt-20 opacity-30">Archive empty...</p>
            )}
          </div>
      </motion.div>
    );
  };

  return (
    <motion.div 
      className="book-container bg-[#faf5eb]"
      initial={{ scale: 0.9, opacity: 0, rotateX: 10 }}
      animate={{ scale: 1, opacity: 1, rotateX: 0 }}
      transition={{ duration: 0.6 }}
      style={{ perspective: 2000 }}
    >
       <div className="book-spine" />
       
       {selection.visible && (
        <div 
          className="highlight-tooltip"
          style={{
            position: 'fixed',
            left: selection.x,
            top: selection.y,
            transform: 'translate(-50%, -100%)',
            zIndex: 1000
          }}
        >
          <button 
            onClick={saveHighlight}
            style={{
               background: highlights.some(h => h.text === selection.text) ? '#8b3a3a' : 'var(--color-accent)',
               color: '#fff',
               padding: '6px 14px',
               borderRadius: '4px',
               border: '1px solid rgba(0,0,0,0.1)',
               cursor: 'pointer',
               fontSize: '12px',
               fontFamily: "'Playfair Display', serif",
               fontWeight: 'bold',
               boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
               textTransform: 'uppercase',
               letterSpacing: '0.1em'
            }}
          >
            {highlights.some(h => h.text === selection.text) ? 'Delete Highlight' : 'Save Highlight'}
          </button>
        </div>
       )}

       <div className={`book-page page-left ${isMobileTocOpen ? 'mobile-visible' : 'mobile-hidden'}`}>
          {/* Close button for mobile ToC */}
          <button 
            className="mobile-only-block absolute top-4 right-4 p-2 text-accent hover:bg-accent/5 rounded-full z-50 cursor-pointer"
            onClick={() => setIsMobileTocOpen(false)}
          >
            <X size={24} />
          </button>
          
          {renderLeftPageContent()}
          <div className="page-number left">{leftPageNumber}</div>
       </div>

       <div className="book-page page-right">
          <AnimatePresence mode="wait">
            {renderChapterContent()}
          </AnimatePresence>
          <div className="page-number right">{rightPageNumber}</div>
       </div>
    </motion.div>
  );
};

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('library_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeBookSlug, setActiveBookSlug] = useState(() => {
    return localStorage.getItem('active_book_slug');
  });

  const [isOpen, setIsOpen] = useState(() => {
    return localStorage.getItem(`book_is_open_${activeBookSlug}`) === 'true';
  });

  const [isAdminView, setIsAdminView] = useState(false);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookService.getAll().then(data => {
        setBooks(data.length > 0 ? data : staticBooks);
        setLoading(false);
    }).catch(() => {
        setBooks(staticBooks);
        setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (activeBookSlug) {
      localStorage.setItem('active_book_slug', activeBookSlug);
    } else {
      localStorage.removeItem('active_book_slug');
    }
  }, [activeBookSlug]);

  useEffect(() => {
    if (activeBookSlug) {
      localStorage.setItem(`book_is_open_${activeBookSlug}`, isOpen.toString());
    }
  }, [isOpen, activeBookSlug]);

  const selectedBook = books.find(b => b.slug === activeBookSlug);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('library_user');
  };

  /*
  if (!user) {
    return <LoginPage onLogin={(u) => {
      setUser(u);
      localStorage.setItem('library_user', JSON.stringify(u));
    }} />;
  }
  */

  // Bypassing login for now to allow viewing
  const mockUser = user || { id: 1, email: 'palettescoder@gmail.com', role: 'admin', fullName: 'Development Admin', username: 'palettescoder' };
  const activeUser = mockUser;

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-screen text-accent font-title uppercase tracking-[0.4em] text-xs">
        Preparing the library...
      </div>
    );
  }

  if (isAdminView && activeUser?.role === 'admin') {
    return <AdminPortal onBack={() => setIsAdminView(false)} />;
  }

  return (
    <div style={{ perspective: '2000px', width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>

      <AnimatePresence mode="wait">
        {!activeBookSlug ? (
          <motion.div 
            key="library"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Library 
              user={activeUser}
              books={books}
              onAdminClick={() => setIsAdminView(true)}
              onSelectBook={(slug) => {
                setActiveBookSlug(slug);
                setIsOpen(true); // Immediate open
              }} 
            />
          </motion.div>
        ) : !isOpen ? (
          <BookCover 
            key={`${activeBookSlug}-cover`} 
            book={selectedBook} 
            onOpen={() => setIsOpen(true)} 
          />
        ) : (
          <OpenBook 
            key={`${activeBookSlug}-open`} 
            book={selectedBook} 
            user={activeUser}
            onAdminClick={() => setIsAdminView(true)}
            onBackToLibrary={() => {
              setActiveBookSlug(null);
              setIsOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
