

# Waitlist Landing Page

## What We're Building
A bold, modern single-page waitlist landing page for your SaaS launch. It will feature a dark gradient background, animated hero section with email capture, social proof, feature preview cards, and a clean footer -- all frontend-only.

---

## Sections

### Hero
- Big gradient headline + short tagline
- Email input with validation + "Join the Waitlist" button
- Success animation (checkmark + toast) on submit
- Animated background gradient

### Social Proof
- Avatar stack of "early adopters"
- Counter showing "2,147 people already on the waitlist"

### Feature Highlights
- 3 glassmorphism cards with icons (Zap, Shield, BarChart3 from lucide-react)
- Hover scale animations
- Grid layout (1 col mobile, 3 col desktop)

### Footer
- Links: Privacy, Twitter/X
- "Built with heart" tagline

---

## Design
- Dark background with vibrant purple/blue gradient accents
- Gradient text on headline
- Glassmorphism (semi-transparent, backdrop-blur) on cards
- Fade-in animations on scroll using Intersection Observer
- Fully responsive

---

## Technical Details

### Files to create
- **src/pages/Index.tsx** -- rewrite with full waitlist page (Hero, Social Proof, Features, Footer sections)

### Files to modify
- **src/index.css** -- add dark theme as default, custom gradient and glow keyframes
- **tailwind.config.ts** -- add custom animation keyframes (float, glow-pulse)

### Approach
- All in one page component with inline sections (no routing changes needed)
- Email validation via simple regex, state managed with useState
- Toast notification via existing sonner integration
- Scroll animations via a small useEffect + IntersectionObserver hook
- No new dependencies required -- uses existing lucide-react icons, sonner toasts, and Tailwind utilities

