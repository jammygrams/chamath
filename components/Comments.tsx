import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { getFingerprint } from '@/lib/fingerprint'
import { uniqueNamesGenerator, Config, adjectives, animals } from 'unique-names-generator';

const generateUsername = (fingerprint: string) => {
  const config: Config = {
    dictionaries: [adjectives, animals],
    separator: ' ',
    length: 2,
    seed: fingerprint,
  }
  return uniqueNamesGenerator(config)
}

interface Comment {
  id: number
  content: string
  created_at: string
  fingerprint: string
}

export default function Comments({ predictionId }: { predictionId: number }) {
  const [isOpen, setIsOpen] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentCount, setCommentCount] = useState<number>(0)
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')
  const [userFingerprint, setUserFingerprint] = useState<string | null>(null)

  const fetchComments = useCallback(async () => {
    const { data, count } = await supabase
      .from('comments')
      .select('*', { count: 'exact' })
      .eq('prediction_id', predictionId)
      .order('created_at', { ascending: true })

    if (data) setComments(data)
    if (count !== null) setCommentCount(count)
  }, [predictionId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    const fingerprint = await getFingerprint()
    const { error } = await supabase
      .from('comments')
      .insert({
        prediction_id: predictionId,
        content: newComment.trim(),
        fingerprint
      })

    if (!error) {
      setNewComment('')
      fetchComments()
    }
  }

  const handleEdit = async (commentId: number) => {
    if (!editContent.trim()) return
    const { error } = await supabase
      .rpc('handle_comment_edit', {
        p_comment_id: commentId,
        p_fingerprint: userFingerprint,
        p_content: editContent.trim()
      })

    if (!error) {
      setEditingId(null)
      fetchComments()
    }
  }

  const handleDelete = async (commentId: number) => {
    if (!confirm('Are you sure you want to delete this comment?')) return
    
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('fingerprint', userFingerprint)

    if (!error) {
      fetchComments()
    }
  }

  useEffect(() => {
    getFingerprint().then(setUserFingerprint)

    // Initial fetch
    fetchComments()

    // Subscribe to changes
    const subscription = supabase
      .channel(`comments-${predictionId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'comments',
        filter: `prediction_id=eq.${predictionId}`
      }, fetchComments)
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [predictionId, fetchComments])

  const formatTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    return text.split(urlRegex).map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            {part}
          </a>
        )
      }
      return part
    })
  }

  return (
    <div className="mt-4 border-t border-gray-700 pt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-300"
      >
        <span className="text-sm font-medium">
          Sources and discussion ({commentCount})
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-4 space-y-4">
          {isLoading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : comments.length > 0 ? (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-700/50 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-blue-400">
                        {generateUsername(comment.fingerprint)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {comment.fingerprint === userFingerprint && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingId(comment.id)
                            setEditContent(comment.content)
                          }}
                          className="text-xs text-gray-400 hover:text-gray-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  {editingId === comment.id ? (
                    <div>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full bg-gray-700 rounded p-2 text-gray-200 placeholder-gray-500 resize-none mb-2"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(comment.id)}
                          disabled={!editContent.trim()}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 text-sm bg-gray-600 text-white rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-200 break-words">
                      {formatTextWithLinks(comment.content)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No comments yet. Be the first to add a source or comment!</p>
          )}

          <form onSubmit={handleSubmit} className="mt-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a source or comment..."
              className="w-full bg-gray-700 rounded p-3 text-gray-200 placeholder-gray-500 resize-none"
              rows={3}
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  )
}