'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Quote,
  List,
  ListOrdered,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Eye,
  Edit3,
  FileCode,
  Sparkles,
  Loader2,
  Minus,
  Highlighter,
  Subscript as SubIcon,
  Superscript as SupIcon,
  Copy,
  Check,
  CornerLeftDown,
} from '@/components/ui/platform-icons';
import { blogApi } from '@/lib/api-blog';
import { toast } from 'react-hot-toast';

interface MediumEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function MediumEditor({
  value,
  onChange,
  placeholder = 'Tell your story...',
}: MediumEditorProps) {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'html'>(
    'editor'
  );
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [copiedHtml, setCopiedHtml] = useState(false);

  // Synchronize external value with contentEditable div when initializing or switching tabs
  useEffect(() => {
    if (editorRef.current && activeTab === 'editor') {
      if (editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value, activeTab]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const executeCommand = (command: string, valueArg: string = '') => {
    if (activeTab !== 'editor') return;
    document.execCommand(command, false, valueArg);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  const handleHeading = (tag: 'h1' | 'h2' | 'h3' | 'h4') => {
    executeCommand('formatBlock', `<${tag}>`);
  };

  const handleBlockquote = () => {
    executeCommand('formatBlock', '<blockquote>');
  };

  const handleInsertHr = () => {
    executeCommand('insertHorizontalRule');
  };

  const handleInsertSubscript = () => {
    executeCommand('subscript');
  };

  const handleInsertSuperscript = () => {
    executeCommand('superscript');
  };

  const handleInsertHighlight = () => {
    executeCommand('hiliteColor', '#fef08a');
  };

  const handleAddLink = () => {
    if (!linkUrl) return;
    executeCommand('createLink', linkUrl);
    setLinkUrl('');
    setShowLinkInput(false);
  };

  const handleInsertNewParagraph = () => {
    if (editorRef.current) {
      editorRef.current.focus();
      const p = document.createElement('p');
      p.innerHTML = '<br>';
      editorRef.current.appendChild(p);

      // Move cursor inside new paragraph
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(p);
      range.collapse(true);
      selection?.removeAllRanges();
      selection?.addRange(range);
      handleInput();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image file size must be 10 MB or less');
      return;
    }

    try {
      setIsUploading(true);
      const uploaded = await blogApi.uploadImage(file);

      // Custom figure HTML with editable figcaption placeholder and a clean follow-up paragraph
      const defaultCaption = 'Enter image title/description here';
      const imgHtml = `<figure class="my-6 block"><img src="${uploaded.url}" alt="Article Image" class="w-full rounded-md shadow-sm my-4 max-h-[520px] object-cover" /><figcaption class="text-center text-xs text-neutral-500 mt-2 font-medium" contenteditable="true" data-placeholder="${defaultCaption}">${defaultCaption}</figcaption></figure><p><br/></p>`;

      if (editorRef.current) {
        editorRef.current.focus();
        document.execCommand('insertHTML', false, imgHtml);
        handleInput();
      } else {
        onChange((value || '') + imgHtml);
      }
      toast.success('Image inserted into story');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  /**
   * Keyboard Navigation & Figcaption Enter key handler:
   * When user presses Enter inside <figcaption>, navigate cursor out to a new <p> after <figure>
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const selection = window.getSelection();
    if (!selection || !selection.anchorNode) return;

    let currentNode: Node | null = selection.anchorNode;

    // Check if user is inside a <figcaption> or <figure>
    while (currentNode && currentNode !== editorRef.current) {
      if (currentNode.nodeName === 'FIGCAPTION' || currentNode.nodeName === 'FIGURE') {
        if (e.key === 'Enter' || e.key === 'ArrowDown') {
          // If Enter is pressed inside figcaption, prevent line break inside caption and create new paragraph after figure
          if (e.key === 'Enter') {
            e.preventDefault();
          }

          const figureElement = (currentNode.nodeName === 'FIGURE' ? currentNode : currentNode.parentElement) as HTMLElement | null;
          if (figureElement && figureElement.parentElement) {
            // Find or create next paragraph
            let nextElement: Element | null = figureElement.nextElementSibling;
            if (!nextElement || nextElement.tagName !== 'P') {
              const newP = document.createElement('p');
              newP.innerHTML = '<br>';
              figureElement.parentElement.insertBefore(newP, figureElement.nextSibling);
              nextElement = newP;
            }

            // Move cursor to next element
            const range = document.createRange();
            range.selectNodeContents(nextElement);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
            handleInput();
            return;
          }
        }
        break;
      }
      currentNode = currentNode.parentNode;
    }
  };

  const copyHtmlCode = () => {
    navigator.clipboard.writeText(value || '');
    setCopiedHtml(true);
    toast.success('HTML copied to clipboard');
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  // Generate line numbers for HTML code editor view
  const htmlLines = (value || '').split('\n');

  return (
    <div className="border border-neutral-200 rounded-md bg-white overflow-hidden shadow-sm">
      {/* Editor Top Bar & Toolbar */}
      <div className="border-b border-neutral-200 bg-neutral-50/80 p-3 flex flex-wrap items-center justify-between gap-3">
        {/* Formatting Tools */}
        {activeTab === 'editor' ? (
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => executeCommand('bold')}
              className="p-2 rounded-md text-neutral-600 hover:bg-neutral-200/80 hover:text-neutral-900 transition"
              title="Bold (Ctrl+B)"
            >
              <Bold size={16} />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('italic')}
              className="p-2 rounded-md text-neutral-600 hover:bg-neutral-200/80 hover:text-neutral-900 transition"
              title="Italic (Ctrl+I)"
            >
              <Italic size={16} />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('underline')}
              className="p-2 rounded-md text-neutral-600 hover:bg-neutral-200/80 hover:text-neutral-900 transition"
              title="Underline (Ctrl+U)"
            >
              <Underline size={16} />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('strikeThrough')}
              className="p-2 rounded-md text-neutral-600 hover:bg-neutral-200/80 hover:text-neutral-900 transition"
              title="Strikethrough"
            >
              <Strikethrough size={16} />
            </button>
            <button
              type="button"
              onClick={handleInsertHighlight}
              className="p-2 rounded-md text-slate-700 bg-amber-50 hover:bg-amber-100 transition"
              title="Highlight Mark"
            >
              <Highlighter size={16} />
            </button>

            <div className="w-px h-5 bg-neutral-300 mx-1" />

            <button
              type="button"
              onClick={() => handleHeading('h1')}
              className="p-2 rounded-md text-neutral-600 hover:bg-neutral-200/80 hover:text-neutral-900 transition font-bold text-xs"
              title="Heading 1"
            >
              <Heading1 size={16} />
            </button>
            <button
              type="button"
              onClick={() => handleHeading('h2')}
              className="p-2 rounded-md text-neutral-600 hover:bg-neutral-200/80 hover:text-neutral-900 transition font-bold text-xs"
              title="Heading 2"
            >
              <Heading2 size={16} />
            </button>
            <button
              type="button"
              onClick={() => handleHeading('h3')}
              className="p-2 rounded-md text-neutral-600 hover:bg-neutral-200/80 hover:text-neutral-900 transition font-bold text-xs"
              title="Heading 3"
            >
              <Heading3 size={16} />
            </button>
            <button
              type="button"
              onClick={() => handleHeading('h4')}
              className="p-2 rounded-md text-neutral-600 hover:bg-neutral-200/80 hover:text-neutral-900 transition font-bold text-xs"
              title="Heading 4"
            >
              <Heading4 size={16} />
            </button>

            <div className="w-px h-5 bg-neutral-300 mx-1" />

            <button
              type="button"
              onClick={handleBlockquote}
              className="p-2 rounded-md text-neutral-600 hover:bg-neutral-200/80 hover:text-neutral-900 transition"
              title="Blockquote"
            >
              <Quote size={16} />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('insertUnorderedList')}
              className="p-2 rounded-md text-neutral-600 hover:bg-neutral-200/80 hover:text-neutral-900 transition"
              title="Bullet List"
            >
              <List size={16} />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('insertOrderedList')}
              className="p-2 rounded-md text-neutral-600 hover:bg-neutral-200/80 hover:text-neutral-900 transition"
              title="Numbered List"
            >
              <ListOrdered size={16} />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('formatBlock', '<pre>')}
              className="p-2 rounded-md text-neutral-600 hover:bg-neutral-200/80 hover:text-neutral-900 transition"
              title="Code Block"
            >
              <Code size={16} />
            </button>

            <div className="w-px h-5 bg-neutral-300 mx-1" />

            <button
              type="button"
              onClick={handleInsertSubscript}
              className="p-2 rounded-md text-neutral-600 hover:bg-neutral-200/80 hover:text-neutral-900 transition"
              title="Subscript (<sub>)"
            >
              <SubIcon size={16} />
            </button>
            <button
              type="button"
              onClick={handleInsertSuperscript}
              className="p-2 rounded-md text-neutral-600 hover:bg-neutral-200/80 hover:text-neutral-900 transition"
              title="Superscript (<sup>)"
            >
              <SupIcon size={16} />
            </button>
            <button
              type="button"
              onClick={handleInsertHr}
              className="p-2 rounded-md text-neutral-600 hover:bg-neutral-200/80 hover:text-neutral-900 transition"
              title="Horizontal Rule (<hr>)"
            >
              <Minus size={16} />
            </button>

            <div className="w-px h-5 bg-neutral-300 mx-1" />

            {/* Link Input button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLinkInput(!showLinkInput)}
                className="p-2 rounded-md text-neutral-600 hover:bg-neutral-200/80 hover:text-neutral-900 transition"
                title="Insert Link"
              >
                <LinkIcon size={16} />
              </button>
              {showLinkInput && (
                <div className="absolute top-11 left-0 z-30 bg-white border border-neutral-200 shadow-sm rounded-md p-3 flex items-center gap-2 w-80">
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="flex-1 text-xs border border-neutral-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-600"
                  />
                  <button
                    type="button"
                    onClick={handleAddLink}
                    className="px-3.5 py-2 bg-brand-600 text-white rounded-md text-xs font-bold hover:bg-brand-700 transition"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            {/* Image Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="p-2 rounded-md text-brand-600 bg-brand-50 hover:bg-brand-100 transition flex items-center gap-1.5 text-xs font-bold"
              title="Insert Inline Image"
            >
              {isUploading ? (
                <Loader2 size={16} className="animate-spin text-brand-600" />
              ) : (
                <ImageIcon size={16} />
              )}
              <span className="hidden sm:inline">Add Image</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleImageUpload}
            />

          </div>
        ) : activeTab === 'html' ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={copyHtmlCode}
              className="px-3 py-1.5 rounded-md bg-neutral-800 text-neutral-200 hover:bg-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              {copiedHtml ? <Check size={14} className="text-slate-400" /> : <Copy size={14} />}
              <span>{copiedHtml ? 'Copied!' : 'Copy Code'}</span>
            </button>
            <span className="text-xs text-neutral-400 font-mono">
              {(value || '').length} chars · {htmlLines.length} lines
            </span>
          </div>
        ) : (
          <div className="text-xs font-bold text-neutral-500 flex items-center gap-1.5">
            <Sparkles size={14} className="text-brand-600" />
            <span>Visual Article Preview</span>
          </div>
        )}

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-white border border-neutral-200 rounded-md p-1 shadow-xs ml-auto">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition ${
              activeTab === 'editor'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Edit3 size={13} />
            <span>Write</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition ${
              activeTab === 'preview'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Eye size={13} />
            <span>Preview</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('html')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition ${
              activeTab === 'html'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <FileCode size={13} />
            <span>HTML</span>
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="p-6 min-h-[380px] max-h-[620px] overflow-y-auto">
        {/* WRITE MODE */}
        {activeTab === 'editor' && (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            className="blog-article-content focus:outline-none min-h-[320px] text-slate-800 text-base leading-relaxed"
            data-placeholder={placeholder}
            style={{
              fontFamily: "'Palatino Linotype', 'Georgia', serif",
            }}
          />
        )}

        {/* PREVIEW MODE */}
        {activeTab === 'preview' && (
          <div className="blog-article-content max-w-none">
            {value ? (
              <div
                dangerouslySetInnerHTML={{ __html: value }}
                className="text-slate-800 leading-relaxed"
              />
            ) : (
              <div className="py-16 text-center text-neutral-400 text-xs font-semibold">
                Article is empty. Switch back to Write mode to compose your story.
              </div>
            )}
          </div>
        )}

        {/* HTML CODE VIEW (HIGH CONTRAST DARK CODE EDITOR WITH LINE NUMBERS) */}
        {activeTab === 'html' && (
          <div className="relative flex rounded-md bg-[#0d1117] border border-slate-800 overflow-hidden font-mono text-xs shadow-inner">
            {/* Line Numbers Gutter */}
            <div className="select-none bg-[#161b22] text-slate-500 py-4 px-3 text-right border-r border-slate-800 min-w-[40px] leading-6 font-mono text-xs">
              {htmlLines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Code Input Area */}
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 bg-transparent text-slate-300 p-4 outline-none resize-none leading-6 font-mono text-xs selection:bg-purple-900 selection:text-white min-h-[340px]"
              placeholder="<p>Write raw HTML content here...</p>"
              spellCheck={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}
