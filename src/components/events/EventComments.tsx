
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EventComment } from "@/types/comment";
import { User } from "@/types/user";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, formatDistanceToNow } from "date-fns";

interface EventCommentsProps {
  eventId: string;
  currentUser: User | null;
}

export const EventComments = ({ eventId, currentUser }: EventCommentsProps) => {
  const [comments, setComments] = useState<EventComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const { toast } = useToast();
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  // Fetch comments on load
  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true);
      try {
        // First get all comments
        const { data: commentsData, error: commentsError } = await supabase
          .from("event_comments")
          .select("*")
          .eq("event_id", eventId)
          .order("created_at", { ascending: false });
        
        if (commentsError) throw commentsError;
        
        // Then get user profiles for these comments
        const userIds = [...new Set(commentsData.map(comment => comment.user_id))];
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .in("id", userIds);
        
        if (profilesError) throw profilesError;
        
        // Map profiles to comments
        const profilesMap = new Map();
        profilesData.forEach(profile => {
          profilesMap.set(profile.id, profile);
        });
        
        // Combine the data
        const commentsWithProfiles = commentsData.map(comment => {
          const profile = profilesMap.get(comment.user_id);
          return {
            ...comment,
            username: profile?.username,
            avatar_url: profile?.avatar_url
          };
        });
        
        setComments(commentsWithProfiles);
      } catch (error) {
        console.error("Error fetching comments:", error);
        toast({
          title: "Error loading comments",
          description: "Failed to load comments. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();

    // Set up real-time subscription
    const channel = supabase
      .channel('event-comments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_comments',
          filter: `event_id=eq.${eventId}`
        },
        async () => {
          // Refetch comments when changes occur
          await fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, toast]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to comment on events",
        variant: "destructive",
      });
      return;
    }
    
    if (!newComment.trim()) {
      toast({
        title: "Empty comment",
        description: "Please enter a comment before submitting",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from("event_comments")
        .insert({
          event_id: eventId,
          user_id: currentUser.id,
          content: newComment.trim(),
        });
      
      if (error) throw error;
      
      setNewComment("");
      commentInputRef.current?.focus();
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error adding comment",
        description: "Failed to add your comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteComment = async (commentId: string) => {
    if (!currentUser) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from("event_comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", currentUser.id);
      
      if (error) throw error;
      
      toast({
        title: "Comment deleted",
        description: "Your comment has been removed",
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Error deleting comment",
        description: "Failed to delete your comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Comments</h3>
      
      {currentUser && (
        <form onSubmit={handleSubmitComment} className="space-y-2">
          <Textarea
            ref={commentInputRef}
            placeholder="Share your thoughts about this event..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-24 resize-none"
            disabled={isLoading}
          />
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isLoading || !newComment.trim()}
              size="sm"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Post Comment
                </span>
              )}
            </Button>
          </div>
        </form>
      )}
      
      {!currentUser && (
        <div className="bg-muted p-4 text-center rounded-md">
          Please sign in to leave a comment
        </div>
      )}
      
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Be the first to comment on this event!
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src={comment.avatar_url || ""} alt={comment.username || "User"} />
                    <AvatarFallback>{comment.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{comment.username || "Anonymous"}</p>
                    <p className="text-xs text-muted-foreground">
                      {comment.created_at && (
                        <span title={format(new Date(comment.created_at), "PPpp")}>
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                
                {currentUser && currentUser.id === comment.user_id && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDeleteComment(comment.id)}
                    title="Delete comment"
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
              
              <p className="text-sm whitespace-pre-line">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
