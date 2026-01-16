import Link from 'next/link';
import {
  Film,
  Tv,
  BookOpen,
  Music,
  CheckCircle2,
  Share2,
  Sparkles,
  ArrowRight,
  Library,
  Wand2,
  Heart,
  Zap
} from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: Film,
      emoji: '🎬',
      title: 'Movies',
      description: 'Blockbusters, indie gems, guilty pleasures — queue them all!',
      color: 'text-movies',
      bgColor: 'bg-movies/20',
      borderColor: 'border-movies/40',
    },
    {
      icon: Tv,
      emoji: '📺',
      title: 'TV Shows',
      description: 'Binge-worthy series waiting for their moment to shine.',
      color: 'text-tv',
      bgColor: 'bg-tv/20',
      borderColor: 'border-tv/40',
    },
    {
      icon: BookOpen,
      emoji: '📚',
      title: 'Books',
      description: 'Adventures, mysteries, and worlds yet to be explored.',
      color: 'text-books',
      bgColor: 'bg-books/20',
      borderColor: 'border-books/40',
    },
    {
      icon: Music,
      emoji: '🎵',
      title: 'Music Albums',
      description: 'Albums that deserve your undivided attention.',
      color: 'text-music',
      bgColor: 'bg-music/20',
      borderColor: 'border-music/40',
    },
  ];

  const benefits = [
    {
      icon: CheckCircle2,
      emoji: '✨',
      title: 'Feel the Satisfaction',
      description: 'Mark items as done and watch your progress sparkle!',
      gradient: 'from-success to-accent',
    },
    {
      icon: Share2,
      emoji: '🎁',
      title: 'Share the Magic',
      description: 'Let friends discover your curated collections.',
      gradient: 'from-secondary to-primary',
    },
    {
      icon: Sparkles,
      emoji: '🔮',
      title: 'Filter & Sort',
      description: 'Find exactly what you\'re in the mood for, always.',
      gradient: 'from-primary to-accent',
    },
  ];

  return (
    <div className="min-h-screen relative">
      {/* Starfield background */}
      <div className="starfield" />

      {/* Floating decorative emojis */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <span className="emoji-float" style={{ top: '10%', left: '5%', animationDelay: '0s' }}>🎬</span>
        <span className="emoji-float" style={{ top: '20%', right: '10%', animationDelay: '1s' }}>📚</span>
        <span className="emoji-float" style={{ top: '60%', left: '8%', animationDelay: '2s' }}>🎵</span>
        <span className="emoji-float" style={{ top: '70%', right: '5%', animationDelay: '3s' }}>📺</span>
        <span className="emoji-float" style={{ top: '40%', left: '3%', animationDelay: '4s' }}>🍿</span>
        <span className="emoji-float" style={{ top: '85%', right: '15%', animationDelay: '5s' }}>🎧</span>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-strong">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl gradient-magic flex items-center justify-center shadow-lg group-hover:animate-wiggle transition-transform">
                <Library className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text-rainbow">
                MyBacklog
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="group px-5 py-2.5 text-sm font-semibold text-white gradient-primary rounded-2xl hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all hover:-translate-y-0.5"
              >
                <span className="flex items-center gap-2">
                  Get Started
                  <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[100px] float" />
        <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-secondary/30 rounded-full blur-[100px] float-delayed" />
        <div className="absolute bottom-0 left-1/2 w-[300px] h-[300px] bg-accent/20 rounded-full blur-[80px] float-slow" />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Fun tagline */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-primary/20 border border-primary/30 text-sm font-medium text-primary-light animate-bounce">
            <Wand2 className="w-4 h-4" />
            Your entertainment, organized magically ✨
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-text-primary leading-tight">
            Never Forget{' '}
            <span className="gradient-text-rainbow">
              What You Want to Enjoy
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Movies to watch. Shows to binge. Books to devour. Albums to savor.
            <br />
            <span className="text-primary-light font-medium">Your escape plan, perfectly organized.</span>
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="group flex items-center gap-3 px-8 py-4 text-lg font-bold text-white gradient-primary rounded-2xl hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] transition-all hover:-translate-y-1 animate-pulse-glow"
            >
              <span>Start Your Adventure</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#features"
              className="group flex items-center gap-2 px-8 py-4 text-lg font-semibold text-text-secondary hover:text-text-primary border-2 border-border-default rounded-2xl hover:border-primary-light hover:bg-bg-elevated transition-all hover:-translate-y-1"
            >
              <span>See the Magic</span>
              <Sparkles className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>

          {/* Fun stats */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-center">
            <div className="group">
              <div className="text-3xl font-bold text-primary-light group-hover:scale-110 transition-transform">🎬 📺 📚 🎵</div>
              <div className="text-sm text-text-muted mt-1">4 Categories</div>
            </div>
            <div className="w-px h-10 bg-border-subtle hidden sm:block" />
            <div className="group">
              <div className="text-3xl font-bold text-accent group-hover:scale-110 transition-transform">∞</div>
              <div className="text-sm text-text-muted mt-1">Unlimited Lists</div>
            </div>
            <div className="w-px h-10 bg-border-subtle hidden sm:block" />
            <div className="group">
              <div className="text-3xl font-bold text-secondary group-hover:scale-110 transition-transform">💯</div>
              <div className="text-sm text-text-muted mt-1">Free Forever</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="features" className="relative py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-4xl mb-4 block">🎨</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary">
              All Your Escapes, One Cozy Place
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              Four magical categories for all your entertainment dreams.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, emoji, title, description, color, bgColor, borderColor }, index) => (
              <div
                key={title}
                className={`group p-6 card card-hover border ${borderColor}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 ${bgColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <span className="text-2xl">{emoji}</span>
                  </div>
                </div>
                <h3 className={`text-lg font-bold ${color} mb-2`}>{title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative py-24 px-4 sm:px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-4xl mb-4 block">⚡</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary">
              Superpowers Included
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              Simple tools that make tracking feel like fun, not work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map(({ icon: Icon, emoji, title, description, gradient }) => (
              <div key={title} className="text-center group">
                <div className={`relative w-20 h-20 mx-auto mb-6 bg-gradient-to-br ${gradient} rounded-3xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all shadow-lg`}>
                  <span className="text-4xl">{emoji}</span>
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-3">{title}</h3>
                <p className="text-text-muted leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-4xl mb-4 block">🚀</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary">
              Simple as 1, 2, 3
            </h2>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-movies/20 border-2 border-movies/40 flex items-center justify-center text-2xl font-bold text-movies">1</div>
              <h3 className="font-bold text-text-primary mb-2">Find Something</h3>
              <p className="text-sm text-text-muted">Search for movies, shows, books, or albums</p>
            </div>

            <div className="hidden md:block text-4xl text-text-muted">→</div>

            <div className="flex-1 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center text-2xl font-bold text-primary">2</div>
              <h3 className="font-bold text-text-primary mb-2">Add to Backlog</h3>
              <p className="text-sm text-text-muted">One click and it's saved for later</p>
            </div>

            <div className="hidden md:block text-4xl text-text-muted">→</div>

            <div className="flex-1 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/20 border-2 border-success/40 flex items-center justify-center text-2xl font-bold text-success">3</div>
              <h3 className="font-bold text-text-primary mb-2">Enjoy & Complete</h3>
              <p className="text-sm text-text-muted">Mark done when you've experienced it 🎉</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative p-12 sm:p-16 rounded-[2rem] overflow-hidden gradient-border-animated">
            <div className="relative z-10">
              <span className="text-6xl mb-6 block">🌟</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
                Ready for Your Next Adventure?
              </h2>
              <p className="text-lg text-text-secondary mb-8 max-w-xl mx-auto">
                Join the escape artists who never lose track of their next great experience.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-3 px-10 py-4 text-lg font-bold text-white gradient-primary rounded-2xl hover:shadow-[0_0_50px_rgba(139,92,246,0.5)] transition-all hover:-translate-y-1"
              >
                <span>Create Free Account</span>
                <Heart className="w-5 h-5" />
              </Link>
              <p className="mt-4 text-sm text-text-muted">
                No credit card required. Free forever. Pinky promise 🤞
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-10 px-4 sm:px-6 border-t border-border-subtle">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl gradient-magic flex items-center justify-center">
              <Library className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text-rainbow">MyBacklog</span>
          </div>
          <p className="text-sm text-text-muted flex items-center gap-2">
            Made with <Heart className="w-4 h-4 text-secondary" /> for entertainment lovers
          </p>
          <p className="text-sm text-text-muted">
            © {new Date().getFullYear()} MyBacklog
          </p>
        </div>
      </footer>
    </div>
  );
}
