import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, ChevronRight, Library as LibraryIcon, ArrowLeft, LogOut } from 'lucide-react';
import { books } from './data/chapters';
import LoginPage from './components/LoginPage';
import { authService, highlightService } from './services/api';

const Library = ({ onSelectBook, user }) => {
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
          <div className="flex items-center justify-center gap-4 mb-4 opacity-70">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-title text-xl shadow-lg border-2 border-white/20">
              {user?.fullName?.charAt(0) || user?.username?.charAt(0) || '?'}
            </div>
            <div className="text-left">
              <div className="text-xs uppercase tracking-widest opacity-50">Welcome back</div>
              <div className="font-hand text-xl">{user?.fullName || user?.username || 'Fellow Reader'}</div>
            </div>
          </div>
          <motion.h1 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="font-hand text-7xl text-[#d4af37] mb-2 drop-shadow-lg"
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

const OpenBook = ({ book, onBackToLibrary, user }) => {
  // Combine parts and chapters into a flat list for navigation
  const allChapters = book.parts.flatMap(p => p.chapters.map(c => ({...c, partName: p.name})));
  
  const [activeChapterId, setActiveChapterId] = useState(() => {
    const saved = localStorage.getItem(`last_read_chapter_${book.slug}`);
    return saved ? parseInt(saved) : allChapters[0].id;
  });
  
  const [viewMode, setViewMode] = useState('toc');
  const [searchQuery, setSearchQuery] = useState('');
  const [highlights, setHighlights] = useState(() => {
    const saved = localStorage.getItem(`highlights_${book.slug}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [selection, setSelection] = useState({ text: '', visible: false, x: 0, y: 0 });

  useEffect(() => {
    if (user) {
        highlightService.getUserHighlights(user.id).then(setHighlights).catch(console.error);
    }
  }, [user]);

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
      if (e.target.closest('.highlight-tooltip')) return;

      if (!e.target.closest('.chapter-body')) {
        setSelection(s => ({ ...s, visible: false }));
        return;
      }

      const sel = window.getSelection();
      const text = sel.toString().trim();
      
      if (text.length > 0 && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelection({
          text,
          visible: true,
          x: rect.left + rect.width / 2,
          y: rect.top - 10
        });
      } else {
        setSelection(s => ({ ...s, visible: false }));
      }
    };
    
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
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
    window.getSelection().removeAllRanges();
  };
  
  const activeChapter = allChapters.find(c => c.id === activeChapterId) || allChapters[0];
  const leftPageNumber = activeChapter.id * 2 - 1;
  const rightPageNumber = activeChapter.id * 2;

  const renderWithHighlights = (text, chId) => {
    const chapterHighlights = highlights.filter(h => h.chapterId === chId);
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
      className="w-full h-full flex flex-col"
    >
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={onBackToLibrary}
          className="text-xs uppercase tracking-widest flex items-center gap-1 opacity-50 hover:opacity-100 hover:text-accent transition-all"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <ArrowLeft size={14} /> Library
        </button>
        <div className="text-right flex items-center gap-2 group">
          <div className="text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity text-accent">{user?.fullName}</div>
          <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-bold text-accent border border-accent/30 lowercase">
            {user?.username?.charAt(0) || 'u'}
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-8 mb-8 border-b pb-4">
         <button 
           onClick={() => setViewMode('toc')}
           className={`font-title title-small ${viewMode === 'toc' ? 'text-accent' : 'text-muted'}`}
           style={{ background: 'none', border: 'none', cursor: 'pointer' }}
         >
           Contents
         </button>
         <button 
           onClick={() => setViewMode('highlights')}
           className={`font-title title-small ${viewMode === 'highlights' ? 'text-accent' : 'text-muted'}`}
           style={{ background: 'none', border: 'none', cursor: 'pointer' }}
         >
           Highlights ({highlights.length})
         </button>
      </div>
      
      {viewMode === 'toc' ? (
        <div className="flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
          {book.parts.map(part => (
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
                     {activeChapterId === ch.id && <Bookmark size={16} color="var(--color-accent)" />}
                   </li>
                 ))}
               </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
          <input 
            type="text" 
            placeholder="Search highlights..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border-b border-black/10 bg-transparent font-body outline-none"
            style={{ fontSize: '0.9rem', color: 'var(--color-ink)' }}
          />
          {highlights.filter(h => h.text.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
             <p className="text-muted text-center italic mt-12">No highlights found.</p>
          ) : (
             highlights
               .filter(h => h.text.toLowerCase().includes(searchQuery.toLowerCase()))
               .map((h, i) => {
                 const ch = allChapters.find(c => c.id === h.chapterId);
                 const jumpAction = () => {
                   setActiveChapterId(ch?.id || allChapters[0].id); 
                   setViewMode('toc');
                   setTimeout(() => {
                     const el = document.getElementById(`mark-${h.id}`);
                     if (el) {
                       const container = el.closest('.page-right');
                       if (container) {
                          const offsetTop = el.offsetTop - container.offsetTop - (container.clientHeight / 2);
                          container.scrollTo({ top: offsetTop, behavior: 'smooth' });
                       }
                       const oldBg = el.style.backgroundColor;
                       el.style.transition = 'background-color 0.4s ease';
                       el.style.backgroundColor = 'rgba(245, 158, 11, 0.7)';
                       setTimeout(() => el.style.backgroundColor = oldBg, 800);
                     }
                   }, 500);
                 };

                 return (
                   <div key={h.id || i} className="mb-6 border-b border-black/5 pb-4 relative group">
                      <p 
                        className="font-hand text-accent pr-6 cursor-pointer hover:opacity-80 transition-opacity" 
                        style={{ fontSize: '1.4rem', lineHeight: '1.3' }}
                        onClick={jumpAction}
                        title={`Jump to Chapter ${ch?.id}`}
                      >
                        “{h.text}”
                      </p>
                      <button 
                        onClick={async () => {
                          if (user && h.id) await highlightService.delete(h.id);
                          setHighlights(highlights.filter(x => x !== h));
                        }}
                        className="absolute top-0 right-0 hover:text-red-800 transition-colors"
                        title="Delete highlight"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--color-muted)' }}
                      >
                        ×
                      </button>
                      <p 
                         className="text-xs text-muted mt-2 uppercase tracking-widest cursor-pointer hover:text-accent font-bold" 
                         onClick={jumpAction}
                      >
                         — Jump to Chapter {ch?.id}
                      </p>
                   </div>
                 );
               })
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
        className="w-full h-full flex flex-col"
      >
         <div className="mb-8 border-b pb-4">
           <div className="text-muted text-sm uppercase tracking-widest">{activeChapter.partName}</div>
           <h1 className="font-title title-large mt-4" style={{ lineHeight: '1.2' }}>{activeChapter.title}</h1>
           <p className="font-hand mt-4" style={{ fontSize: '1.5rem', color: 'var(--color-accent)' }}>
             “{activeChapter.meta}”
           </p>
         </div>
         
         <div className="font-body text-body flex flex-col gap-4 chapter-body overflow-y-auto pr-2 custom-scrollbar">
           {activeChapter.content ? (
             activeChapter.content.map((p, i) => (
               <p key={i} className="mb-4 text-justify" style={{ textIndent: '2rem', lineHeight: '2' }}>
                  {renderWithHighlights(p, activeChapter.id)}
               </p>
             ))
           ) : (
             <p className="text-muted text-center mt-12 pt-12 italic">
               ( The ink has faded on this memory... )
             </p>
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

       <div className="book-page page-left">
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

  if (!user) {
    return <LoginPage onLogin={(u) => {
      setUser(u);
      localStorage.setItem('library_user', JSON.stringify(u));
    }} />;
  }

  return (
    <div style={{ perspective: '2000px', width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
      <button 
         onClick={handleLogout}
         style={{
            position: 'fixed',
            top: '30px',
            right: '30px',
            zIndex: 1000,
            padding: '12px',
            backgroundColor: 'rgba(166, 58, 36, 0.1)',
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s'
         }}
         title="Logout"
         className="hover-bright"
      >
        <LogOut color="var(--color-accent)" size={20} />
      </button>

      <AnimatePresence mode="wait">
        {!activeBookSlug ? (
          <motion.div 
            key="library"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Library 
              user={user}
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
            user={user}
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

