/**
 * Links & Notes Component - Left Sidebar
 */

import React, { useState } from 'react';

export default function LinksNotes({ user, userProgress, onUpdate }) {
    const [activeTab, setActiveTab] = useState('notes');
    const [noteText, setNoteText] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [linkTitle, setLinkTitle] = useState('');
    const [editingNote, setEditingNote] = useState(null);

    const notes = userProgress?.notes || [];
    const links = userProgress?.links || [];

    const addNote = () => {
        if (noteText.trim()) {
            if (editingNote) {
                // Update existing note
                const newNotes = notes.map(n => 
                    n.id === editingNote.id 
                        ? { ...n, text: noteText, updatedAt: new Date().toISOString() }
                        : n
                );
                onUpdate({ notes: newNotes });
                setEditingNote(null);
            } else {
                // Add new note
                const newNotes = [...notes, {
                    id: Date.now().toString(),
                    text: noteText,
                    createdAt: new Date().toISOString()
                }];
                onUpdate({ notes: newNotes });
            }
            setNoteText('');
        }
    };

    const editNote = (note) => {
        setNoteText(note.text);
        setEditingNote(note);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target.result;
                const newNote = {
                    id: Date.now().toString(),
                    text: `[File: ${file.name}]\n${content.substring(0, 500)}...`,
                    createdAt: new Date().toISOString(),
                    fileName: file.name
                };
                onUpdate({ notes: [...notes, newNote] });
            };
            reader.readAsText(file);
        }
    };

    const deleteNote = (id) => {
        const newNotes = notes.filter(n => n.id !== id);
        onUpdate({ notes: newNotes });
    };

    const addLink = () => {
        if (linkUrl.trim() && linkTitle.trim()) {
            const newLinks = [...links, {
                id: Date.now().toString(),
                title: linkTitle,
                url: linkUrl,
                createdAt: new Date().toISOString()
            }];
            onUpdate({ links: newLinks });
            setLinkUrl('');
            setLinkTitle('');
        }
    };

    const deleteLink = (id) => {
        const newLinks = links.filter(l => l.id !== id);
        onUpdate({ links: newLinks });
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex border-b">
                <button
                    onClick={() => setActiveTab('notes')}
                    className={`flex-1 px-4 py-2 font-semibold transition-all ${
                        activeTab === 'notes'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    📝 Notes
                </button>
                <button
                    onClick={() => setActiveTab('links')}
                    className={`flex-1 px-4 py-2 font-semibold transition-all ${
                        activeTab === 'links'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    🔗 Links
                </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
                {activeTab === 'notes' ? (
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={noteText}
                                    onChange={(e) => setNoteText(e.target.value)}
                                    placeholder={editingNote ? "Edit note..." : "Add a note..."}
                                    className="flex-1 px-3 py-2 border rounded text-sm"
                                    onKeyPress={(e) => e.key === 'Enter' && addNote()}
                                />
                                <button
                                    onClick={addNote}
                                    className="px-3 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                                >
                                    {editingNote ? 'Save' : 'Add'}
                                </button>
                                {editingNote && (
                                    <button
                                        onClick={() => {
                                            setEditingNote(null);
                                            setNoteText('');
                                        }}
                                        className="px-3 py-2 bg-gray-400 text-white rounded text-sm hover:bg-gray-500"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-600 cursor-pointer hover:text-purple-600">
                                    <input
                                        type="file"
                                        accept=".txt,.md,.doc,.docx"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                    📎 Upload File
                                </label>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {notes.length > 0 ? (
                                notes.map(note => (
                                    <div key={note.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-300 transition-all">
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="flex-1">
                                                <div className="text-sm text-gray-800 break-words">{note.text}</div>
                                                {note.fileName && (
                                                    <div className="text-xs text-gray-500 mt-1">📎 {note.fileName}</div>
                                                )}
                                                <div className="text-xs text-gray-400 mt-1">
                                                    {new Date(note.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => editNote(note)}
                                                    className="text-blue-500 hover:text-blue-700 px-2 py-1 text-xs"
                                                    title="Edit note"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => deleteNote(note.id)}
                                                    className="text-red-500 hover:text-red-700 px-2 py-1 text-xs"
                                                    title="Delete note"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm text-gray-500 text-center py-4">No notes yet. Add your first note above!</div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <input
                                type="text"
                                value={linkTitle}
                                onChange={(e) => setLinkTitle(e.target.value)}
                                placeholder="Link title..."
                                className="w-full px-3 py-2 border rounded text-sm"
                            />
                            <input
                                type="url"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full px-3 py-2 border rounded text-sm"
                            />
                            <button
                                onClick={addLink}
                                className="w-full px-3 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                            >
                                Add Link
                            </button>
                        </div>
                        <div className="space-y-2">
                            {links.length > 0 ? (
                                links.map(link => (
                                    <div key={link.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all">
                                        <div className="flex justify-between items-start gap-2">
                                            <a
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 hover:underline flex-1 font-medium text-sm break-words"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                🔗 {link.title}
                                            </a>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteLink(link.id);
                                                }}
                                                className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0 px-2 py-1 hover:bg-red-50 rounded"
                                                title="Delete link"
                                            >
                                                ×
                                            </button>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1 break-all">{link.url}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm text-gray-500 text-center py-4">No links yet. Add study resources above!</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

