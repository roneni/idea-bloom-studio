import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreHorizontal, Lightbulb, Clock, Sparkles, ChevronDown, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AiSuggestionsPanel } from './AiSuggestionsPanel';
import { useAiSuggestions } from '@/hooks/useAiSuggestions';
import type { Idea, IdeaColor } from '@/types/idea';
import { formatDistanceToNow } from 'date-fns';

interface IdeaCardProps {
  idea: Idea;
  onClick?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
}

const colorStyles: Record<IdeaColor, { gradient: string; border: string; shadow: string; badge: string }> = {
  purple: {
    gradient: 'from-purple-500/10 to-purple-600/5',
    border: 'border-purple-200 dark:border-purple-800/50',
    shadow: 'hover:shadow-[0_8px_30px_-8px_hsl(262_83%_58%/0.3)]',
    badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
  },
  blue: {
    gradient: 'from-blue-500/10 to-blue-600/5',
    border: 'border-blue-200 dark:border-blue-800/50',
    shadow: 'hover:shadow-[0_8px_30px_-8px_hsl(217_91%_60%/0.3)]',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  },
  cyan: {
    gradient: 'from-cyan-500/10 to-cyan-600/5',
    border: 'border-cyan-200 dark:border-cyan-800/50',
    shadow: 'hover:shadow-[0_8px_30px_-8px_hsl(190_95%_50%/0.3)]',
    badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300',
  },
  green: {
    gradient: 'from-green-500/10 to-green-600/5',
    border: 'border-green-200 dark:border-green-800/50',
    shadow: 'hover:shadow-[0_8px_30px_-8px_hsl(142_76%_45%/0.3)]',
    badge: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
  },
  yellow: {
    gradient: 'from-yellow-500/10 to-yellow-600/5',
    border: 'border-yellow-200 dark:border-yellow-800/50',
    shadow: 'hover:shadow-[0_8px_30px_-8px_hsl(48_96%_53%/0.3)]',
    badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
  },
  orange: {
    gradient: 'from-orange-500/10 to-orange-600/5',
    border: 'border-orange-200 dark:border-orange-800/50',
    shadow: 'hover:shadow-[0_8px_30px_-8px_hsl(25_95%_53%/0.3)]',
    badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
  },
  pink: {
    gradient: 'from-pink-500/10 to-pink-600/5',
    border: 'border-pink-200 dark:border-pink-800/50',
    shadow: 'hover:shadow-[0_8px_30px_-8px_hsl(330_81%_60%/0.3)]',
    badge: 'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300',
  },
  red: {
    gradient: 'from-red-500/10 to-red-600/5',
    border: 'border-red-200 dark:border-red-800/50',
    shadow: 'hover:shadow-[0_8px_30px_-8px_hsl(0_84%_60%/0.3)]',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  },
};

export function IdeaCard({ idea, onClick, onDelete, onArchive }: IdeaCardProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { groupedSuggestions, isLoading: suggestionsLoading, generateSuggestions, acceptSuggestion, dismissSuggestion } = useAiSuggestions(idea.id);
  
  const styles = colorStyles[idea.color as IdeaColor] || colorStyles.purple;
  const timeAgo = formatDistanceToNow(new Date(idea.updated_at), { addSuffix: true });
  
  const hasSuggestions = 
    groupedSuggestions.refinements.length > 0 ||
    groupedSuggestions.whatIfs.length > 0 ||
    groupedSuggestions.nextSteps.length > 0;
  
  const pendingSuggestions = [
    ...groupedSuggestions.refinements,
    ...groupedSuggestions.whatIfs,
    ...groupedSuggestions.nextSteps,
  ].filter(s => s.is_accepted === null).length;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`
          relative cursor-pointer overflow-hidden
          bg-gradient-to-br ${styles.gradient}
          ${styles.border} ${styles.shadow}
          transition-all duration-300
          backdrop-blur-sm
        `}
        onClick={onClick}
      >
        {/* Color accent bar */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
          idea.color === 'purple' ? 'from-purple-500 to-violet-500' :
          idea.color === 'blue' ? 'from-blue-500 to-indigo-500' :
          idea.color === 'cyan' ? 'from-cyan-500 to-teal-500' :
          idea.color === 'green' ? 'from-green-500 to-emerald-500' :
          idea.color === 'yellow' ? 'from-yellow-400 to-amber-500' :
          idea.color === 'orange' ? 'from-orange-500 to-red-500' :
          idea.color === 'pink' ? 'from-pink-500 to-rose-500' :
          'from-red-500 to-rose-600'
        }`} />

        <CardHeader className="pb-2 pt-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${styles.badge}`}>
                <Lightbulb className="h-4 w-4" />
              </div>
              <h3 className="font-semibold text-foreground leading-tight line-clamp-2">
                {idea.title}
              </h3>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onArchive?.(); }}>
                  Archive
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                  className="text-destructive"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-3">
          {idea.content && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {idea.content}
            </p>
          )}

          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{timeAgo}</span>
            </div>
            <div className="flex items-center gap-2">
              {idea.priority === 'high' && (
                <Badge variant="outline" className="text-xs px-1.5 py-0 border-orange-300 text-orange-600 dark:border-orange-700 dark:text-orange-400">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Priority
                </Badge>
              )}
              {(hasSuggestions || suggestionsLoading) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSuggestions(!showSuggestions);
                  }}
                >
                  {suggestionsLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3 text-primary" />
                      {pendingSuggestions > 0 && (
                        <span className="text-primary font-medium">{pendingSuggestions}</span>
                      )}
                      <ChevronDown className={`h-3 w-3 transition-transform ${showSuggestions ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* AI Suggestions Panel */}
          <AnimatePresence>
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <AiSuggestionsPanel
                  groupedSuggestions={groupedSuggestions}
                  isLoading={suggestionsLoading}
                  onAccept={(id) => acceptSuggestion.mutate(id)}
                  onDismiss={(id) => dismissSuggestion.mutate(id)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
