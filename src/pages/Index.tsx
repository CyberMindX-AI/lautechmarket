import { useState, useEffect, useRef } from "react";
import { Zap, Shield, BarChart3, CheckCircle2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const useInView = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
};

const AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Sam",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Jess",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Chris",
];

const FEATURES = [
  {
    icon: Zap,
    title: "Instant Listings",
    description: "Post items in seconds. Snap a photo, set your price, and reach buyers across campus instantly.",
  },
  {
    icon: Shield,
    title: "Verified Students Only",
    description: "Every user is a verified LAUTECH student. Trade with confidence knowing who you're dealing with.",
  },
  {
    icon: BarChart3,
    title: "Campus Deals",
    description: "Find the best prices on textbooks, gadgets, food, and everything students need — all in one place.",
  },
];

const Index = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const socialRef = useInView();
  const featuresRef = useInView();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setSubmitted(true);
    toast.success("You're on the list! We'll be in touch soon.");
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[30%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] animate-glow-pulse" />
        <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] rounded-full bg-accent/10 blur-[120px] animate-glow-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="inline-block px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-sm text-primary mb-4">
            🎓 Made for LAUTECH Students
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
            Buy & sell on <span className="text-gradient">LAUTECH campus</span> with ease.
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto">
            The student marketplace built for LAUTECH. Textbooks, gadgets, food, services — find it all or sell yours today.
          </p>

          {!submitted ? (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto w-full"
            >
              <Input
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-secondary border-border/50 text-foreground placeholder:text-muted-foreground"
              />
              <Button type="submit" size="lg" className="w-full sm:w-auto h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2">
                Join the Waitlist <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          ) : (
            <div className="flex items-center justify-center gap-2 text-primary animate-fade-up">
              <CheckCircle2 className="w-6 h-6" />
              <span className="text-lg font-medium">You're in! Check your inbox soon.</span>
            </div>
          )}
        </div>
      </section>

      {/* Social Proof */}
      <section
        ref={socialRef.ref}
        className={`py-20 px-6 flex flex-col items-center gap-6 transition-all duration-700 ${
          socialRef.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="flex -space-x-3">
          {AVATARS.map((src, i) => (
            <img
              key={i}
              src={src}
              alt="Early adopter"
              className="w-10 h-10 rounded-full border-2 border-background"
            />
          ))}
        </div>
        <p className="text-muted-foreground text-lg">
          <span className="text-foreground font-bold">2,147</span> LAUTECH students already on the waitlist
        </p>
      </section>

      {/* Features */}
      <section
        ref={featuresRef.ref}
        className={`py-24 px-6 max-w-5xl mx-auto transition-all duration-700 ${
          featuresRef.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
          What's <span className="text-gradient">coming</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, description }, i) => (
            <div
              key={i}
              className="glass rounded-xl p-8 hover:scale-[1.03] transition-transform duration-300 group"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{title}</h3>
              <p className="text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border/30 text-center">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
          <a href="#" className="hover:text-foreground transition-colors">Twitter / X</a>
          <span>Built with ❤️</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
