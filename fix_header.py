import os

path = r'src/App.jsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_header = """          <div className="mb-8 border-b pb-4">
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
              {activeChapter.meta}
            </p>
          </div>
"""

# Find the section to replace
# We look for the div that starts the chapter header
start_idx = -1
for i, line in enumerate(lines):
    if '<div className="mb-8 border-b pb-4">' in line and 'activeChapter.partName' in lines[i+1]:
        start_idx = i
        break

if start_idx != -1:
    # Find the end of this div (it ends at the next <p> or </div> after the meta)
    end_idx = start_idx
    while '</div>' not in lines[end_idx] or 'activeChapter.meta' not in lines[end_idx-1]:
        end_idx += 1
        if end_idx >= len(lines): break
    
    # We found it. Now replace lines from start_idx to end_idx with new_header
    # Wait, the meta might be in a p tag.
    # Let's just find the closing </div> of the chapter header.
    # The header is from <div className="mb-8 ..."> to </div>
    # It has 3 inner lines in original.
    
    del lines[start_idx:end_idx+1]
    lines.insert(start_idx, new_header)

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(lines)
