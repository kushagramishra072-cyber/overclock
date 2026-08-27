import { useState } from "react";
import FloatingModal from "./FloatingModal";
import { Mail, Copy, Check, ExternalLink, Send } from "lucide-react";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");
  const email = "kushagramishra468@gmail.com";

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenMailApp = () => {
    const subject = encodeURIComponent("Overclock Feedback");
    const body = encodeURIComponent(message ? message : "Hi Kushagra,\n\nI have feedback about Overclock:\n\n");
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  const handleOpenGmail = () => {
    const subject = encodeURIComponent("Overclock Feedback");
    const body = encodeURIComponent(message ? message : "Hi Kushagra,\n\nI have feedback about Overclock:\n\n");
    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <FloatingModal isOpen={isOpen} onClose={onClose} title="💌 Send Feedback" size="md">
      <div className="space-y-5">
        <p className="text-sm text-muted-foreground">
          We'd love to hear your thoughts, feature requests, or bug reports to make Overclock even better!
        </p>

        {/* Quick Message Box */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Your Message (Optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your feedback or thoughts here..."
            className="w-full h-28 p-3 text-sm rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-primary/50 resize-none"
          />
        </div>

        {/* Primary Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleOpenMailApp}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <Send className="w-4 h-4" />
            Open Mail App (Recommended)
          </button>

          <button
            onClick={handleOpenGmail}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 font-medium text-sm transition-colors border border-white/10"
          >
            <ExternalLink className="w-4 h-4 text-primary" />
            Open in Gmail Web
          </button>

          <button
            onClick={handleCopyEmail}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground text-xs font-medium transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-semibold">Copied {email} to clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Email ({email})
              </>
            )}
          </button>
        </div>
      </div>
    </FloatingModal>
  );
}
