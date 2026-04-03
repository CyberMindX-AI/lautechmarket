import { useState, useEffect, useRef } from "react";
import {
  Zap,
  Shield,
  ShoppingBag,
  CheckCircle2,
  ArrowRight,
  Star,
  Users,
  Trophy,
  ChevronDown,
  Globe,
  Smartphone,
  Store,
  Share2
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from "@/lib/supabase";

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
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
};

const FEATURES = [
  {
    icon: ShoppingBag,
    title: "Marketplace",
    description: "Buy and sell physical products within the LAUTECH community safely. From textbooks to electronics.",
  },
  {
    icon: Star,
    title: "Brands",
    description: "Discover and support verified campus-grown businesses and student entrepreneurs in Ogbomoso.",
  },
  {
    icon: Store,
    title: "Services",
    description: "Book essential student services — tutoring, laundry, hair styling, and more from trusted providers.",
  },
];

const PRIZE_STEPS = [
  {
    step: 1,
    title: "Sign Up",
    description: "Use your school email and phone number to join.",
  },
  {
    step: 2,
    title: "Get Your Link",
    description: "The system generates your unique referral link.",
  },
  {
    step: 3,
    title: "Spread the Word",
    description: "Share on WhatsApp, Twitter, and with friends.",
  },
  {
    step: 4,
    title: "Win Big",
    description: "Climb the leaderboard and win a share of ₦300k.",
  },
];

const Index = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    role: "buyer"
  });
  const [submitted, setSubmitted] = useState(false);
  const [view, setView] = useState<"signup" | "check-status">("signup");
  const [statusPhone, setStatusPhone] = useState("");
  const [referralLink, setReferralLink] = useState("");
  const [leaderboard, setLeaderboard] = useState<{ name: string; referrals: number; rank: number }[]>([]);
  
  // Fetch Leaderboard from real data
  const fetchLeaderboard = async () => {
    try {
      // 1. Get all students that have been referred
      const { data: referees, error: countError } = await supabase
        .from('waitlist')
        .select('referred_by');

      if (countError) throw countError;

      // 2. Count referrals per code
      const referralCounts: Record<string, number> = {};
      referees.forEach(({ referred_by }) => {
        if (referred_by) {
          referralCounts[referred_by] = (referralCounts[referred_by] || 0) + 1;
        }
      });

      // 3. Get student names for those codes
      const codes = Object.keys(referralCounts);
      const { data: referrers, error: userError } = await supabase
        .from('waitlist')
        .select('full_name, referral_code')
        .in('referral_code', codes);

      if (userError) throw userError;

      // 4. Map names to counts and sort
      const formattedData = referrers.map((user) => ({
        name: user.full_name,
        referrals: referralCounts[user.referral_code] || 0,
        rank: 0,
      }))
      .sort((a, b) => b.referrals - a.referrals)
      .slice(0, 5)
      .map((user, i) => ({ ...user, rank: i + 1 }));

      setLeaderboard(formattedData);
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const heroRef = useInView();
  const prizeRef = useInView();
  const featuresRef = useInView();
  const leaderboardRef = useInView();

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (statusPhone.length < 11) {
      toast.error("Please enter a valid phone number.");
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('waitlist')
        .select('*')
        .eq('phone_number', statusPhone)
        .single();

      if (error || !data) {
        toast.error("User not found on the waitlist.");
        return;
      }

      const { count } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact' })
        .eq('referred_by', data.referral_code);

      toast.info(`Status Check: You currently have ${count || 0} verified referrals! Your code is "${data.referral_code}".`);
    } catch (err) {
      toast.error("Could not check status. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailLower = formData.email.toLowerCase().trim();
    const isSchoolEmail = emailLower.endsWith("@student.lautech.edu.ng") || emailLower.endsWith("@lautech.edu.ng");

    if (!isSchoolEmail) {
      toast.error("Please use your official LAUTECH school email.");
      return;
    }

    if (formData.phoneNumber.length < 11) {
      toast.error("Please enter a valid phone number.");
      return;
    }

    const ref = searchParams.get("ref") || "";
    // Clean code: Name + 4 random characters
    const safeName = formData.fullName.split(' ')[0].replace(/[^a-zA-Z]/g, '').toLowerCase();
    const referralCode = `${safeName}-${Math.random().toString(36).substring(2, 6)}`;

    try {
      const { error } = await supabase
        .from('waitlist')
        .insert({
          full_name: formData.fullName,
          email: formData.email,
          phone_number: formData.phoneNumber,
          role: formData.role,
          referral_code: referralCode,
          referred_by: ref
        });

      if (error) {
        if (error.code === '23505') {
          toast.error("You are already on the list with this email or phone.");
        } else {
          throw error;
        }
        return;
      }

      setReferralLink(`${window.location.origin}?ref=${referralCode}`);
      setSubmitted(true);
      toast.success("Welcome! Start sharing to win big.");
      fetchLeaderboard();
    } catch (err) {
      console.error(err);
      toast.error("Technical error. Check your connection or try again.");
    }
  };

  const scrollToSignup = () => {
    setView("signup");
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Navbar - Exactly like the reference */}
      <nav className="fixed top-0 w-full z-50 px-6 py-6 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center font-bold text-white shadow-lg shadow-primary/40 group-hover:scale-110 transition-transform">L</div>
            <span className="hidden sm:block text-xl font-bold tracking-tight text-white/90">LAUTECH<span className="text-primary italic">Market</span></span>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">
              LAUTECH Edition
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section
        ref={heroRef.ref}
        className="relative pt-40 pb-20 px-6 min-h-screen flex flex-col items-center justify-center text-center overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/10 blur-[120px] rounded-full -z-10 opacity-30" />

        <div className={`max-w-4xl mx-auto space-y-8 transition-all duration-1000 ${heroRef.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            <Globe className="w-3 h-3" /> LAUTECH PRIDE
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter leading-[0.85] mb-4 sm:mb-6">
            LAUTECH Commerce.<br />
            <span className="text-gradient">Without the Chaos.</span>
          </h1>

          <p className="text-base sm:text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-tight font-medium px-4">
            The verified marketplace for Ladokites. Join the waitlist for the <span className="text-primary font-black">₦300,000 CASH PRIZE POOL</span>.
          </p>

          <div className="mt-14 w-full max-w-lg mx-auto relative">
            {/* Subtle glow behind the form */}
            <div className="absolute -inset-4 bg-primary/20 blur-3xl opacity-20 -z-10" />

            {view === "signup" ? (
              !submitted ? (
                <div className="bg-[#0b0c10] p-6 sm:p-10 rounded-2xl text-left space-y-6 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] border border-white/5">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-white/50 uppercase tracking-widest">Full Name</label>
                      <Input
                        placeholder="User Tarra"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="h-12 bg-white/[0.02] border-white/10 text-white placeholder:text-white/10 rounded-lg focus:border-primary/50 text-base"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-white/50 uppercase tracking-widest">Campus Email</label>
                      <Input
                        type="email"
                        placeholder="user@student.lautech.edu.ng"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="h-12 bg-white/[0.02] border-white/10 text-white placeholder:text-white/10 rounded-lg focus:border-primary/50 text-base"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-white/50 uppercase tracking-widest">Phone Number</label>
                      <Input
                        type="tel"
                        placeholder="08012345678"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        className="h-12 bg-white/[0.02] border-white/10 text-white placeholder:text-white/10 rounded-lg focus:border-primary/50 text-base"
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-semibold text-white/50 uppercase tracking-widest">I am a... <span className="text-primary">*</span></label>
                      <div className="flex flex-wrap gap-3">
                        {["Buyer", "Seller", "Service Provider"].map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setFormData({ ...formData, role: r.toLowerCase() })}
                            className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${formData.role === r.toLowerCase()
                              ? "bg-primary text-white border-primary shadow-lg shadow-primary/30 scale-105"
                              : "bg-white/[0.02] text-white/40 border-white/10 hover:border-white/20"
                              }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button type="submit" size="lg" className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black rounded-xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98] mt-4 text-base uppercase tracking-widest shadow-lg">
                      Join Waitlist
                    </Button>
                  </form>

                  <p className="text-center text-xs text-white/40 pt-2 font-medium">
                    Already joined? <button type="button" onClick={() => setView("check-status")} className="text-primary font-bold hover:underline transition-all">Check Status</button>
                  </p>
                </div>
              ) : (
                <div className="p-6 sm:p-10 glass rounded-[2.5rem] animate-fade-up border-primary/20 text-center space-y-6 shadow-2xl">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 scale-animate">
                    <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-black tracking-tighter italic">Welcome, {formData.fullName.split(' ')[0]}!</h3>
                  <p className="text-base sm:text-lg text-muted-foreground leading-tight font-medium italic">
                    You're officially on the list.<br />
                    <span className="text-white">Share your link to climb the ranks:</span>
                  </p>
                  <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between gap-3 sm:gap-4 overflow-hidden">
                    <code className="text-[10px] sm:text-xs text-primary font-bold truncate flex-1 text-left">{referralLink}</code>
                    <Button size="sm" className="h-9 sm:h-10 bg-primary hover:bg-primary/80 shrink-0" onClick={() => {
                       navigator.clipboard.writeText(referralLink);
                       toast.success("Link copied!");
                    }}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="pt-4 sm:pt-6">
                    <Button variant="outline" className="rounded-xl border-primary/20 text-primary font-bold uppercase tracking-widest text-[10px] sm:text-xs px-6 sm:px-8" onClick={() => setSubmitted(false)}>Back</Button>
                  </div>
                </div>
              )
            ) : (
              /* Check Status View */
              <div className="animate-fade-up space-y-12">
                 <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Check Status</div>
                 <form onSubmit={handleCheckStatus} className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-md mx-auto">
                    <div className="w-full relative group">
                       <Input 
                         type="tel"
                         placeholder="Enter Phone Number"
                         value={statusPhone}
                         onChange={(e) => setStatusPhone(e.target.value)}
                         className="h-14 bg-transparent border-[#12bdae]/30 text-white placeholder:text-white/20 rounded-lg focus:border-[#12bdae] focus:ring-1 focus:ring-[#12bdae]/50 pl-6 pr-6 text-base italic transition-all group-hover:border-[#12bdae]/50"
                       />
                    </div>
                    <Button type="submit" className="h-14 px-8 bg-[#12bdae] hover:bg-[#12bdae]/90 text-white font-black rounded-lg shadow-[0_0_20px_rgba(18,189,174,0.3)] min-w-[160px] uppercase tracking-widest text-[11px] whitespace-nowrap active:scale-95 transition-all">
                       Check Status
                    </Button>
                 </form>
                 <button onClick={() => setView("signup")} className="text-[10px] font-black text-white/30 uppercase tracking-widest hover:text-white transition-colors underline underline-offset-8">
                    Back to Signup
                 </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Prize Pool */}
      <section
        id="rules"
        ref={prizeRef.ref}
        className="py-24 px-6 border-y border-white/5 bg-white/[0.02]"
      >
        <div className={`max-w-6xl mx-auto transition-all duration-1000 ${prizeRef.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl sm:text-5xl font-bold leading-tight">
                📜 The LAUTECH<br />
                <span className="text-primary">300K Peace Prize</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                We are giving away <span className="text-primary font-bold">₦300,000</span> to the Top 20 students who help us build the LAUTECH Market community.
              </p>

              <div className="space-y-4">
                {PRIZE_STEPS.map((step) => (
                  <div key={step.step} className="flex gap-4 p-4 glass rounded-xl border-white/5 hover:border-primary/20 transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                      {step.step}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{step.title}</h4>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass p-8 rounded-3xl border-primary/10 relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/30 blur-[100px] rounded-full" />
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Trophy className="text-accent" /> Prize Distribution
              </h3>
              <div className="space-y-4 relative">
                <div className="flex justify-between items-center p-4 bg-primary/10 rounded-xl border border-primary/20">
                  <span className="font-bold">1st Place</span>
                  <span className="text-2xl font-black text-accent text-gradient">₦100,000</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10">
                  <span className="font-bold">2nd Place</span>
                  <span className="text-xl font-bold">₦50,000</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10">
                  <span className="font-bold">3rd Place</span>
                  <span className="text-xl font-bold">₦30,000</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10">
                  <span className="font-bold">4th - 20th</span>
                  <span className="text-xl font-bold text-muted-foreground">₦7,000 ea.</span>
                </div>
                <p className="text-xs text-muted-foreground mt-6 italic text-center">
                  *Referrals only count if the person validates their LAUTECH email.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" ref={featuresRef.ref} className="py-24 px-6">
        <div className={`max-w-6xl mx-auto transition-all duration-1000 ${featuresRef.isVisible ? "opacity-100" : "opacity-0"}`}>
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl font-bold">Core Features</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Trading with other students has never been this seamless.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((feature, i) => (
              <div key={i} className="glass-card p-10 rounded-3xl hover:-translate-y-2 transition-all duration-300 group">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 group-hover:bg-primary/20 transition-colors">
                   <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed italic">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leaderboard */}
      <section id="leaderboard" ref={leaderboardRef.ref} className="py-24 px-6 bg-primary/5">
        <div className={`max-w-3xl mx-auto transition-all duration-1000 ${leaderboardRef.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">🏆 Current Leaders</h2>
            <p className="text-muted-foreground">The top referrers competing for the prize.</p>
          </div>

          <div className="glass rounded-3xl overflow-hidden border-white/5 min-h-[400px]">
             {leaderboard.length > 0 ? (
                 leaderboard.map((user, i) => (
                    <div key={i} className={`flex items-center justify-between p-6 animate-fade-up ${i !== leaderboard.length - 1 ? "border-b border-white/5" : ""}`} style={{ animationDelay: `${i * 100}ms` }}>
                      <div className="flex items-center gap-4">
                        <span className={`w-8 font-bold ${i < 3 ? "text-accent" : "text-muted-foreground"}`}>#{user.rank}</span>
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold">
                          {user.name[0]}
                        </div>
                        <span className="font-semibold">{user.name}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-primary">{user.referrals}</span>
                        <span className="text-[10px] uppercase text-muted-foreground tracking-widest">Referrals</span>
                      </div>
                    </div>
                  ))
             ) : (
                <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
                   <Users className="w-12 h-12 text-white/10" />
                   <p className="text-muted-foreground font-medium">Competition just started!<br /><span className="text-white">Be the first on the board.</span></p>
                </div>
             )}
          </div>

          <div className="mt-16 text-center">
            <Button 
              size="lg" 
              onClick={scrollToSignup} 
              className="rounded-full bg-foreground text-background hover:bg-foreground/90 px-12 h-16 font-black uppercase tracking-widest text-xs gap-3 shadow-2xl transition-all hover:scale-105 active:scale-95"
            >
              <Users className="w-4 h-4" /> Start Competing
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ / Rules */}
      <section className="py-24 px-6 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1" className="border-white/5">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">How do I win the prize?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Sign up, get your link, and invite classmates. The students with the most verified referrals (people who join the waitlist with a LAUTECH email) win!
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2" className="border-white/5">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">When will the app launch?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              We're currently in the final stages of beta testing in the Ogbomoso campus. Early access will be granted to the top referrers first!
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3" className="border-white/5">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">Is my data safe?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Absolutely. We only use your school email for verification purposes within the LAUTECH community.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 text-center bg-[#050505]">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-8">
          <div className="flex items-center gap-2 opacity-50">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center font-bold text-[10px] text-white">L</div>
            <span className="font-bold text-sm tracking-tight">LAUTECH Market</span>
          </div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/20">
            &copy; 2026 Built for LAUTECH Students. All rights reserved.
          </p>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-white/40">
            <a href="#" className="hover:text-primary transition-colors">Twitter / X</a>
            <a href="#" className="hover:text-primary transition-colors">Discord</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
