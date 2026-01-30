import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Lightbulb, Brain, Bell, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const features = [
  {
    icon: Lightbulb,
    title: 'Capture Ideas',
    description: 'Quick capture for fleeting thoughts. Never lose a creative spark again.',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Brain,
    title: 'AI Brainstorming',
    description: 'Get proactive suggestions to develop and refine your ideas.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Zap,
    title: 'Smart Organization',
    description: 'AI automatically groups related ideas and suggests connections.',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    icon: Bell,
    title: 'Gentle Reminders',
    description: 'Never let ideas go stale. Get nudges to keep developing them.',
    color: 'from-green-500 to-emerald-500',
  },
];

export default function LandingPage() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-subtle overflow-hidden">
      {/* Hero Section */}
      <div className="relative">
        {/* Animated background elements */}
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 right-[10%] w-96 h-96 rounded-full bg-primary/5 blur-3xl"
        />
        <motion.div
          animate={{ 
            rotate: -360,
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          className="absolute top-40 left-[5%] w-80 h-80 rounded-full bg-purple-500/5 blur-3xl"
        />
        <motion.div
          animate={{ 
            y: [0, -20, 0],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-[20%] w-64 h-64 rounded-full bg-cyan-500/5 blur-3xl"
        />

        {/* Navigation */}
        <nav className="relative z-10 container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              IdeaFlow
            </span>
          </div>
          <Link to={user ? '/dashboard' : '/auth'}>
            <Button variant="outline" className="gap-2">
              {loading ? 'Loading...' : user ? 'Dashboard' : 'Sign In'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 pt-20 pb-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <Sparkles className="h-4 w-4" />
              AI-Powered Idea Development
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 max-w-4xl mx-auto"
          >
            Capture ideas.
            <br />
            <span className="bg-gradient-to-r from-primary via-purple-600 to-cyan-500 bg-clip-text text-transparent">
              Let AI develop them.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Your personal AI-powered idea hub. Capture creative thoughts, 
            get intelligent suggestions, and never lose a brilliant idea again.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to={user ? '/dashboard' : '/auth'}>
              <Button size="lg" className="bg-gradient-to-r from-primary via-purple-600 to-blue-600 hover:opacity-90 text-lg px-8 h-14">
                {user ? 'Go to Dashboard' : 'Get Started Free'}
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <section className="relative py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need for your ideas
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From capture to development, IdeaFlow helps you at every step
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-6 rounded-2xl bg-card border border-border/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-purple-600 to-blue-600 p-12 md:p-16 text-center"
          >
            {/* Background shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to capture your ideas?
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                Start building your idea hub today. It's free to get started.
              </p>
              <Link to={user ? '/dashboard' : '/auth'}>
                <Button size="lg" variant="secondary" className="text-lg px-8 h-14">
                  {user ? 'Go to Dashboard' : 'Start for Free'}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>© 2025 IdeaFlow. Built with ❤️ for creative minds.</p>
        </div>
      </footer>
    </div>
  );
}
