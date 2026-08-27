import { useState } from "react";
import HomeButton from "@/components/HomeButton";
import FeedbackModal from "@/components/FeedbackModal";
import { Mail, Heart, Zap, Shield } from "lucide-react";

export default function About() {
  const currentYear = new Date().getFullYear();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <div className="mx-auto max-w-3xl px-4 lg:px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">About Overclock</h1>
            <p className="text-sm text-muted-foreground">
              Your premium student operating system
            </p>
          </div>
          <HomeButton />
        </div>

        {/* Hero Section */}
        <div className="glass p-8 rounded-2xl mb-8 text-center">
          <div className="text-5xl mb-4">⚡</div>
          <h2 className="text-2xl font-bold mb-3">Built for Students Who Thrive</h2>
          <p className="text-foreground/80 mb-6">
            Overclock is a premium student productivity platform designed to help you manage your academics, exams, and well-being with precision and style.
          </p>
          <div className="inline-block px-4 py-2 rounded-full bg-primary/20 border border-primary/50">
            <p className="text-sm font-semibold text-primary">Version 1.0</p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="glass p-6 rounded-2xl">
            <div className="flex items-start gap-3">
              <Zap className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Lightning Fast</h3>
                <p className="text-sm text-foreground/70">
                  Optimized for speed. Every interaction feels instant and responsive.
                </p>
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-2xl">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Your Data, Your Control</h3>
                <p className="text-sm text-foreground/70">
                  All your data is stored locally. Complete privacy and control.
                </p>
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-2xl">
            <div className="flex items-start gap-3">
              <Heart className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Built with Care</h3>
                <p className="text-sm text-foreground/70">
                  Every detail is crafted to support your academic journey.
                </p>
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-2xl">
            <div className="flex items-start gap-3">
              <Zap className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Always Growing</h3>
                <p className="text-sm text-foreground/70">
                  Regularly updated with new features and improvements based on your feedback.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* What's Inside */}
        <div className="glass p-8 rounded-2xl mb-8">
          <h3 className="text-xl font-bold mb-4">What's Inside</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold mt-0.5">✓</span>
              <span className="text-foreground/80"><strong>Tasks:</strong> Organize and track your assignments with visual priority indicators</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold mt-0.5">✓</span>
              <span className="text-foreground/80"><strong>Exams:</strong> Plan your exams with color-coded subjects and calendar view</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold mt-0.5">✓</span>
              <span className="text-foreground/80"><strong>Schedule:</strong> Visualize your weekly timetable with block-based layouts</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold mt-0.5">✓</span>
              <span className="text-foreground/80"><strong>Crisis Mode:</strong> AI-powered emergency study plans for last-minute prep</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold mt-0.5">✓</span>
              <span className="text-foreground/80"><strong>Focus Timer:</strong> A smart timer that adapts to your study rhythm</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold mt-0.5">✓</span>
              <span className="text-foreground/80"><strong>Sleep Tracking:</strong> Monitor your sleep patterns and optimize rest</span>
            </li>
          </ul>
        </div>

        {/* Created By */}
        <div className="glass p-8 rounded-2xl mb-8 border-primary/30 bg-primary/10">
          <h3 className="text-xl font-bold mb-4">Built by Kushagra</h3>
          <p className="text-foreground/80 mb-6">
            Overclock was created to solve real problems that students face every day. If you find it helpful, you're the reason it exists. Thank you for being here.
          </p>
        </div>

        {/* Contact Section */}
        <div className="glass p-8 rounded-2xl mb-8">
          <h3 className="text-xl font-bold mb-4">Get in Touch</h3>
          <p className="text-foreground/80 mb-6">
            Found a bug? Have an idea for a new feature? We'd love to hear from you!
          </p>
          
          <button
            type="button"
            onClick={() => setIsFeedbackOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-primary hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            <Mail className="w-5 h-5" />
            Send Feedback
          </button>

          <p className="text-xs text-muted-foreground mt-4">
            Email: <span className="text-primary font-semibold">kushagramishra468@gmail.com</span>
          </p>
        </div>

        <FeedbackModal
          isOpen={isFeedbackOpen}
          onClose={() => setIsFeedbackOpen(false)}
        />

        {/* Footer */}
        <div className="text-center space-y-2 pb-8">
          <p className="text-sm text-muted-foreground">
            Overclock v1.0 • {currentYear}
          </p>
          <p className="text-xs text-muted-foreground/70">
            Made with <span className="text-red-500">❤️</span> for students
          </p>
        </div>
      </div>
    </div>
  );
}
