import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle2, User } from 'lucide-react';
import { Comment } from '../types';
import { api } from '../services/api';

interface CommentSectionProps {
  articleId: string;
  articleTitle: string;
  comments: Comment[];
  onCommentAdded: () => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  articleId,
  articleTitle,
  comments = [],
  onCommentAdded
}) => {
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName || !content) return;
    setSubmitting(true);
    try {
      await api.createComment({
        articleId,
        articleTitle,
        authorName,
        authorEmail,
        content
      });
      setSubmitted(true);
      setContent('');
      onCommentAdded();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const approvedComments = (comments || []).filter((c) => c?.status === 'approved');

  return (
    <div className="mt-12 pt-8 border-t border-white/10">
      <div className="flex items-center space-x-2 text-xl font-bold font-serif text-white mb-6">
        <MessageSquare className="w-6 h-6 text-emerald-400" />
        <span>Audience Reaction & Discussion ({approvedComments.length})</span>
      </div>

      {/* Comment Form */}
      <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 mb-8 shadow-xl">
        <h4 className="text-sm font-bold text-white mb-4">
          Join the Conversation
        </h4>

        {submitted && (
          <div className="mb-4 p-3 bg-emerald-500/20 text-emerald-300 text-xs rounded-xl border border-emerald-500/30 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Your comment has been submitted and posted!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Adebayo Ogunlesi"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full bg-white/5 backdrop-blur-md text-white placeholder-slate-400 text-xs rounded-xl px-4 py-2.5 border border-white/10 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Your Email Address (Optional, kept private)
              </label>
              <input
                type="email"
                placeholder="adebayo@example.com"
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
                className="w-full bg-white/5 backdrop-blur-md text-white placeholder-slate-400 text-xs rounded-xl px-4 py-2.5 border border-white/10 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Your Comment / Opinion *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Share your respectful thoughts on this article..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-white/5 backdrop-blur-md text-white placeholder-slate-400 text-xs rounded-xl p-4 border border-white/10 focus:outline-none focus:border-emerald-500"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Posting...' : 'Post Comment'}</span>
          </button>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {approvedComments.length === 0 ? (
          <p className="text-xs text-slate-400 italic">
            No comments yet. Be the first to express your view on this story!
          </p>
        ) : (
          approvedComments.map((cmt) => (
            <div
              key={cmt.id}
              className="p-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-md space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-white">{cmt.authorName}</span>
                </div>
                <span className="text-[11px] text-slate-400">
                  {new Date(cmt.createdAt).toLocaleDateString('en-NG', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <p className="text-slate-300 text-xs pl-9 leading-relaxed">
                {cmt.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
