import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Send, Heart, Reply } from "lucide-react";

interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: number;
  likes: number;
  replies: Comment[];
}

interface CommentBoxProps {
  slug: string;
  episodeId: string;
}

export function CommentBox({ slug, episodeId }: CommentBoxProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const storageKey = `comments_${slug}_${episodeId}`;

  // Load comments from localStorage
  useEffect(() => {
    const savedComments = localStorage.getItem(storageKey);
    if (savedComments) {
      try {
        setComments(JSON.parse(savedComments));
      } catch (error) {
        console.error('Error parsing comments:', error);
      }
    }
  }, [storageKey]);

  // Save comments to localStorage
  const saveComments = (updatedComments: Comment[]) => {
    setComments(updatedComments);
    localStorage.setItem(storageKey, JSON.stringify(updatedComments));
  };

  const addComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      text: newComment,
      author: "Anonymous Reader", // In real app, this would be from auth
      timestamp: Date.now(),
      likes: 0,
      replies: []
    };

    const updatedComments = [...comments, comment];
    saveComments(updatedComments);
    setNewComment("");
  };

  const addReply = (parentId: string) => {
    if (!replyText.trim()) return;

    const reply: Comment = {
      id: Date.now().toString(),
      text: replyText,
      author: "Anonymous Reader",
      timestamp: Date.now(),
      likes: 0,
      replies: []
    };

    const updatedComments = comments.map(comment =>
      comment.id === parentId
        ? { ...comment, replies: [...comment.replies, reply] }
        : comment
    );

    saveComments(updatedComments);
    setReplyText("");
    setReplyingTo(null);
  };

  const likeComment = (commentId: string, isReply: boolean = false, parentId?: string) => {
    const updatedComments = comments.map(comment => {
      if (isReply && comment.id === parentId) {
        return {
          ...comment,
          replies: comment.replies.map(reply =>
            reply.id === commentId ? { ...reply, likes: reply.likes + 1 } : reply
          )
        };
      }
      return comment.id === commentId ? { ...comment, likes: comment.likes + 1 } : comment;
    });

    saveComments(updatedComments);
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Comments ({comments.length})
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-auto"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Add new comment */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts about this episode..."
              className="flex-1"
              rows={3}
            />
            <Button onClick={addComment} size="sm">
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* Comments list */}
          {isExpanded && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {comments.map((comment) => (
                <div key={comment.id} className="space-y-2">
                  <div className="bg-muted p-3 rounded">
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                      <span className="font-medium">{comment.author}</span>
                      <span>{formatTimestamp(comment.timestamp)}</span>
                    </div>
                    <p className="text-sm">{comment.text}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => likeComment(comment.id)}
                        className="text-xs"
                      >
                        <Heart className="w-3 h-3 mr-1" />
                        {comment.likes}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyingTo(comment.id)}
                        className="text-xs"
                      >
                        <Reply className="w-3 h-3 mr-1" />
                        Reply
                      </Button>
                    </div>
                  </div>

                  {/* Replies */}
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="ml-6 bg-muted/50 p-3 rounded">
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                        <span className="font-medium">{reply.author}</span>
                        <span>{formatTimestamp(reply.timestamp)}</span>
                      </div>
                      <p className="text-sm">{reply.text}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => likeComment(reply.id, true, comment.id)}
                        className="text-xs mt-2"
                      >
                        <Heart className="w-3 h-3 mr-1" />
                        {reply.likes}
                      </Button>
                    </div>
                  ))}

                  {/* Reply input */}
                  {replyingTo === comment.id && (
                    <div className="ml-6 flex gap-2">
                      <Textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        className="flex-1"
                        rows={2}
                      />
                      <div className="flex flex-col gap-1">
                        <Button onClick={() => addReply(comment.id)} size="sm">
                          <Send className="w-4 h-4" />
                        </Button>
                        <Button onClick={() => setReplyingTo(null)} variant="outline" size="sm">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}