import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Book as BookIcon, Type, FileText, Palette, Save, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { bookService } from '../services/api';

const AdminPortal = ({ onBack }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('books'); // 'books' or 'chapters'
  const [message, setMessage] = useState({ type: '', text: '' });

  const quillModules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['clean']
    ],
  }), []);

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet',
    'clean'
  ];

  // New Book Form State
  const [newBook, setNewBook] = useState({
    title: '',
    slug: '',
    subtitle: '',
    author: '',
    coverColor: '#5d4037'
  });

  // New Chapter Form State
  const [newChapter, setNewChapter] = useState({
    bookId: '',
    title: '',
    meta: '',
    content: ''
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const data = await bookService.getAll();
      setBooks(data);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleCreateBook = async (e) => {
    e.preventDefault();
    try {
      await bookService.create(newBook);
      showMessage('success', 'Book created successfully!');
      setNewBook({ title: '', slug: '', subtitle: '', author: '', coverColor: '#5d4037' });
      fetchBooks();
    } catch (error) {
      console.error(error);
      showMessage('error', error.response?.data || 'Failed to create book');
    }
  };

  const handleCreateChapter = async (e) => {
    e.preventDefault();
    if (!newChapter.content || newChapter.content === '<p><br></p>') {
      showMessage('error', 'Story content cannot be empty');
      return;
    }

    try {
      // Split by paragraphs to keep the array structure in DB if desired, 
      // but Quill produces HTML so we'll store each <p> block if possible
      // or just store the whole HTML as a single block in the array.
      const contentArray = [newChapter.content]; 
      
      const chapterData = {
        ...newChapter,
        contentJson: JSON.stringify(contentArray)
      };
      await bookService.createChapter(newChapter.bookId, chapterData);
      showMessage('success', 'Rich story published to archive!');
      setNewChapter({ bookId: '', title: '', meta: '', content: '' });
    } catch (error) {
      console.error(error);
      showMessage('error', error.response?.data || 'Failed to add story');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full gap-3 text-accent">
        <Loader2 className="animate-spin" />
        <span className="font-title tracking-widest uppercase text-sm">Accessing Archives...</span>
      </div>
    );
  }

  return (
    <div className="book-container bg-[#faf5eb] flex flex-col p-8 overflow-y-auto">
      <div className="flex items-center justify-between mb-8 border-b pb-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-title text-2xl font-bold text-accent">Admin Archive Control</h1>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab('books')}
            className={`px-4 py-2 rounded font-title text-sm uppercase tracking-widest transition-all ${activeTab === 'books' ? 'admin-tab-active' : 'admin-tab-inactive'}`}
          >
            Add Book
          </button>
          <button 
            onClick={() => setActiveTab('chapters')}
            className={`px-4 py-2 rounded font-title text-sm uppercase tracking-widest transition-all ${activeTab === 'chapters' ? 'admin-tab-active' : 'admin-tab-inactive'}`}
          >
            Add Story
          </button>
        </div>
      </div>

      {message.text && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-md mb-6 text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
        >
          {message.text}
        </motion.div>
      )}

      {activeTab === 'books' ? (
        <form onSubmit={handleCreateBook} className="max-w-2xl mx-auto w-full flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-widest font-bold opacity-60">Title</label>
              <div className="relative">
                <BookIcon className="absolute left-3 top-1/2 -translate-y-1/2 opacity-20" size={18} />
                <input 
                  required
                  type="text" 
                  value={newBook.title}
                  onChange={e => setNewBook({...newBook, title: e.target.value})}
                  className="w-full bg-white border border-black/10 rounded p-3 pl-10 font-body outline-none focus:border-accent"
                  placeholder="The Eternal Whisper"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-widest font-bold opacity-60">Slug (URL id)</label>
              <div className="relative">
                <Type className="absolute left-3 top-1/2 -translate-y-1/2 opacity-20" size={18} />
                <input 
                  required
                  type="text" 
                  value={newBook.slug}
                  onChange={e => setNewBook({...newBook, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                  className="w-full bg-white border border-black/10 rounded p-3 pl-10 font-body outline-none focus:border-accent"
                  placeholder="eternal-whisper"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest font-bold opacity-60">Subtitle</label>
            <input 
              type="text" 
              value={newBook.subtitle}
              onChange={e => setNewBook({...newBook, subtitle: e.target.value})}
              className="w-full bg-white border border-black/10 rounded p-3 font-body outline-none focus:border-accent"
              placeholder="A collection of forgotten echoes"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-widest font-bold opacity-60">Author</label>
              <input 
                type="text" 
                value={newBook.author}
                onChange={e => setNewBook({...newBook, author: e.target.value})}
                className="w-full bg-white border border-black/10 rounded p-3 font-body outline-none focus:border-accent"
                placeholder="Veera"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-widest font-bold opacity-60">Cover Color</label>
              <div className="flex gap-2">
                <input 
                  type="color" 
                  value={newBook.coverColor}
                  onChange={e => setNewBook({...newBook, coverColor: e.target.value})}
                  className="h-12 w-20 p-1 bg-white border border-black/10 rounded cursor-pointer"
                />
                <input 
                  type="text" 
                  value={newBook.coverColor}
                  onChange={e => setNewBook({...newBook, coverColor: e.target.value})}
                  className="flex-1 bg-white border border-black/10 rounded p-3 font-body font-mono text-sm uppercase"
                />
              </div>
            </div>
          </div>

          <button type="submit" className="mt-4 bg-accent text-white font-title py-4 rounded-md shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
            <Save size={20} />
            Add New Book to Library
          </button>
        </form>
      ) : (
        <form onSubmit={handleCreateChapter} className="max-w-3xl mx-auto w-full flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest font-bold opacity-60">Select Archive (Book)</label>
            <select 
              required
              value={newChapter.bookId}
              onChange={e => setNewChapter({...newChapter, bookId: e.target.value})}
              className="w-full bg-white border border-black/10 rounded p-3 font-body outline-none focus:border-accent appearance-none"
            >
              <option value="">Select a book...</option>
              {books.map(book => (
                <option key={book.id} value={book.id}>{book.title}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-widest font-bold opacity-60">Chapter Title</label>
              <input 
                required
                type="text" 
                value={newChapter.title}
                onChange={e => setNewChapter({...newChapter, title: e.target.value})}
                className="w-full bg-white border border-black/10 rounded p-3 font-body outline-none focus:border-accent"
                placeholder="The Rain in June"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-widest font-bold opacity-60">Meta/Tagline</label>
              <input 
                type="text" 
                value={newChapter.meta}
                onChange={e => setNewChapter({...newChapter, meta: e.target.value})}
                className="w-full bg-white border border-black/10 rounded p-3 font-body outline-none focus:border-accent"
                placeholder="Wet pavement and cold tea."
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 quill-container">
            <label className="text-xs uppercase tracking-widest font-bold opacity-60 flex items-center gap-2">
              <Sparkles size={14} className="text-accent" />
              Rich Story Editor
            </label>
            <div className="bg-white rounded-md overflow-hidden min-h-[350px]">
                <ReactQuill 
                  key="admin-story-editor"
                  theme="snow"
                  value={newChapter.content}
                  onChange={content => setNewChapter({...newChapter, content})}
                  placeholder="The ink flows from your mind... Start writing here."
                  modules={quillModules}
                  formats={quillFormats}
                  style={{ height: '300px', border: 'none' }}
                />
            </div>
          </div>
          
          <div className="mt-12" /> {/* Spacer for quill height */}

          <button type="submit" className="mt-4 bg-accent text-white font-title py-4 rounded-md shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
            <Plus size={20} />
            Publish Story to Archive
          </button>
        </form>
      )}

      <div className="mt-12 opacity-30 text-center font-hand text-xl">
        Ink & Paper Admin Panel — Restricted Access
      </div>
    </div>
  );
};

export default AdminPortal;
