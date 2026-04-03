import os

path = r'src/App.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Header Tabs (Remove Highlights, keep Contents and Bookmarks)
old_tabs = """        <div className="flex-1 flex justify-center gap-10">
          <button 
            onClick={() => setViewMode('toc')}
            className={`font-title title-small ${viewMode === 'toc' ? 'text-accent' : 'text-muted'}`}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.95rem', whiteSpace: 'nowrap' }}
          >
            Contents
          </button>
          <button 
            onClick={() => setViewMode('highlights')}
            className={`font-title title-small ${viewMode === 'highlights' ? 'text-accent' : 'text-muted'}`}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.95rem', whiteSpace: 'nowrap' }}
          >
            Highlights ({highlights.length})
          </button>
          <button 
            onClick={() => setViewMode('bookmarks')}
            className={`font-title title-small ${viewMode === 'bookmarks' ? 'text-accent' : 'text-muted'}`}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.95rem', whiteSpace: 'nowrap' }}
          >
            Bookmarks ({bookmarks.length})
          </button>
        </div>"""

new_tabs = """        <div className="flex-1 flex justify-center gap-10">
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
        </div>"""

# 2. Update Combined View (Bookmarks + Highlights folder)
# We find the start of the TOC/Highlights view block
# It starts with {viewMode === 'toc' ? (
old_view_start = "{viewMode === 'toc' ? ("
# And goes until the end of the second block.

# I'll just use a more targeted replacement for the whole renderLeftPageContent return if possible.

new_combined_view = """      {viewMode === 'toc' ? (
        <div className="flex flex-col gap-6">
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
                      {bookmarks.some(b => b.chapterId === ch.id) && <Bookmark size={16} fill="var(--color-accent)" color="var(--color-accent)" className="ml-1" />}
                    </li>
                  ))}
                </ul>
             </div>
          ))}
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
                <div key={ch.id} className="mb-6">
                   <div 
                      className="flex items-center justify-between group cursor-pointer hover:bg-black/5 p-2 rounded"
                      onClick={() => { setActiveChapterId(ch.id); setViewMode('toc'); }}
                   >
                      <div className="flex items-center gap-2">
                         <Bookmark size={14} fill={isBookmarked ? "var(--color-accent)" : "none"} color="var(--color-accent)" />
                         <span className="font-title font-bold text-sm">{ch.id}. {ch.title}</span>
                      </div>
                      <span className="text-[10px] uppercase tracking-tighter opacity-40 group-hover:opacity-100">{chHighlights.length} highlights</span>
                   </div>

                   {chHighlights.length > 0 && (
                     <div className="mt-4 ml-6 border-l-2 border-accent/10 pl-4 flex flex-col gap-4">
                        {chHighlights.map((h, i) => (
                          <div key={h.id || i} className="relative group/h">
                             <p 
                                className="font-hand text-accent leading-tight text-lg cursor-pointer hover:opacity-80"
                                onClick={() => {
                                   setActiveChapterId(ch.id); 
                                   setViewMode('toc');
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
                               className="absolute -right-2 top-0 opacity-0 group-hover/h:opacity-100 text-muted transition-opacity"
                               style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
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
      )}"""

# 3. Chapter Header (Right Page) Bookmark Toggle
new_chapter_header = """          <div className="mb-8 border-b pb-4">
            <div className="flex justify-between items-start">
               <div>
                  <div className="text-muted text-sm uppercase tracking-widest">{activeChapter.partName}</div>
                  <h1 className="font-title title-large mt-4" style={{ lineHeight: '1.2' }}>{activeChapter.title}</h1>
               </div>
               <button 
                  onClick={() => toggleBookmark(activeChapter.id)}
                  className="p-2 transition-all hover:scale-110"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  title={bookmarks.some(b => b.chapterId === activeChapter.id) ? "Remove Bookmark" : "Bookmark Chapter"}
               >
                  <Bookmark 
                    size={28} 
                    fill={bookmarks.some(b => b.chapterId === activeChapter.id) ? "var(--color-accent)" : "none"} 
                    color="var(--color-accent)" 
                  />
               </button>
            </div>
            <p className="font-hand mt-4" style={{ fontSize: '1.5rem', color: 'var(--color-accent)' }}>
              â€œ{activeChapter.meta}â€ 
            </p>
          </div>"""

# Replace Tabs
if old_tabs in content:
    content = content.replace(old_tabs, new_tabs)
else:
    print("Warning: old_tabs not found exactly. Trying relaxed match for tabs.")
    # Relaxed match for tabs (case where previous edit partially succeeded)
    import re
    content = re.sub(r'<div className="flex-1 flex justify-center gap-10">.*?Bookmarks.*?</div>', new_tabs, content, flags=re.DOTALL)

# Replace the View Block
import re
# Find the whole block from {viewMode === 'toc' ? (  to the final )} of renderLeftPageContent
# Actually, I'll just find the block by markers
view_pattern = r'\{viewMode === \'toc\' \? \(.*? \)\}\s*</motion.div>'
content = re.sub(r'\{viewMode === \'toc\' \? \(.*?\)\s*\}\s*</motion\.div>', new_combined_view + "\n    </motion.div>", content, flags=re.DOTALL)

# Replace Chapter Header
chapter_header_pattern = r'<div className="mb-8 border-b pb-4">.*?activeChapter\.meta.*?</div>'
content = re.sub(chapter_header_pattern, new_chapter_header, content, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Success")
