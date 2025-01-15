import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { getFingerprint } from '@/lib/fingerprint'

interface Comment {
  id: number
  content: string
  created_at: string
  fingerprint: string
}

export default function Comments({ predictionId }: { predictionId: number }) {
  const [isOpen, setIsOpen] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('prediction_id', predictionId)
      .order('created_at', { ascending: true })

    if (data) setComments(data)
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

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      fetchComments().finally(() => setIsLoading(false))
    }
  }, [isOpen, fetchComments])

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
          Sources and discussion ({comments.length})
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
                  <p className="text-gray-200 break-words">
                    {formatTextWithLinks(comment.content)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </p>
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