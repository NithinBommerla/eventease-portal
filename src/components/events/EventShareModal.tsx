
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Facebook, Twitter, Linkedin, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface EventShareModalProps {
  eventId: string;
  eventTitle: string;
}

export const EventShareModal = ({ eventId, eventTitle }: EventShareModalProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const eventUrl = `${window.location.origin}/event/${eventId}`;
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      toast({
        title: "Link copied!",
        description: "Event link has been copied to clipboard",
      });
    } catch (error) {
      console.error("Failed to copy:", error);
      toast({
        title: "Copy failed",
        description: "Failed to copy the link. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const openShareWindow = (url: string) => {
    window.open(
      url,
      "share-dialog",
      "width=600,height=400,location=no,menubar=no,toolbar=no"
    );
    setOpen(false);
  };
  
  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`;
    openShareWindow(url);
  };
  
  const shareOnTwitter = () => {
    const text = `Check out this event: ${eventTitle}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(eventUrl)}`;
    openShareWindow(url);
  };
  
  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}`;
    openShareWindow(url);
  };
  
  const shareByEmail = () => {
    const subject = `Check out this event: ${eventTitle}`;
    const body = `I found this interesting event and thought you might like it: ${eventUrl}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setOpen(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share this event</DialogTitle>
          <DialogDescription>
            Share this event with friends and colleagues
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2">
            <Input
              value={eventUrl}
              readOnly
              className="flex-1"
            />
            <Button size="sm" variant="outline" onClick={handleCopyLink}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={shareOnFacebook} variant="outline" className="gap-2">
              <Facebook className="h-4 w-4" />
              Facebook
            </Button>
            <Button onClick={shareOnTwitter} variant="outline" className="gap-2">
              <Twitter className="h-4 w-4" />
              Twitter
            </Button>
            <Button onClick={shareOnLinkedIn} variant="outline" className="gap-2">
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </Button>
            <Button onClick={shareByEmail} variant="outline" className="gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
