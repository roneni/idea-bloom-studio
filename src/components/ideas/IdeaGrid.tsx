import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Loader2 } from 'lucide-react';
import { IdeaCard } from './IdeaCard';
import type { Idea } from '@/types/idea';

interface IdeaGridProps {
  ideas: Idea[];
  isLoading?: boolean;
  onIdeaClick?: (idea: Idea) => void;
  onIdeaDelete?: (id: string) => void;
  onIdeaArchive?: (id: string) => void;
}

export function IdeaGrid({ ideas, isLoading, onIdeaClick, onIdeaDelete, onIdeaArchive }: IdeaGridProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your ideas...</p>
      </div>
    );
  }

  if (ideas.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="relative mb-6">
          <motion.div
            animate={{ 
              rotate: [0, -5, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3
            }}
            className="p-6 rounded-full bg-gradient-to-br from-primary/20 via-purple-500/20 to-blue-500/20"
          >
            <Lightbulb className="h-12 w-12 text-primary" />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-primary/10"
          />
        </div>
        <h3 className="text-xl font-semibold mb-2">No ideas yet</h3>
        <p className="text-muted-foreground max-w-md">
          Capture your first idea and let AI help you develop it. 
          Great things start with a single thought!
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <AnimatePresence mode="popLayout">
        {ideas.map((idea, index) => (
          <motion.div
            key={idea.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.05 }}
          >
            <IdeaCard
              idea={idea}
              onClick={() => onIdeaClick?.(idea)}
              onDelete={() => onIdeaDelete?.(idea.id)}
              onArchive={() => onIdeaArchive?.(idea.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
