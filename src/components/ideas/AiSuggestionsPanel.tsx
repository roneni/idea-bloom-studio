import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Lightbulb, HelpCircle, ArrowRight, Check, X, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { AiSuggestion } from '@/hooks/useAiSuggestions';

interface AiSuggestionsPanelProps {
  groupedSuggestions: {
    refinements: AiSuggestion[];
    whatIfs: AiSuggestion[];
    nextSteps: AiSuggestion[];
    verdicts: AiSuggestion[];
  };
  isLoading?: boolean;
  onAccept?: (id: string) => void;
  onDismiss?: (id: string) => void;
}

const suggestionConfig = {
  refinement: {
    icon: Lightbulb,
    label: 'Refinements',
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-200 dark:border-amber-800/50',
  },
  what_if: {
    icon: HelpCircle,
    label: 'What If...',
    gradient: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-200 dark:border-purple-800/50',
  },
  next_step: {
    icon: ArrowRight,
    label: 'Next Steps',
    gradient: 'from-green-500 to-emerald-500',
    bg: 'bg-green-500/10',
    border: 'border-green-200 dark:border-green-800/50',
  },
  verdict: {
    icon: MessageSquare,
    label: "Mentor's Verdict",
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-200 dark:border-blue-800/50',
  },
};

function SuggestionCard({
  suggestion,
  onAccept,
  onDismiss,
}: {
  suggestion: AiSuggestion;
  onAccept?: (id: string) => void;
  onDismiss?: (id: string) => void;
}) {
  const config = suggestionConfig[suggestion.suggestion_type];
  const Icon = config.icon;
  const isActedOn = suggestion.is_accepted !== null;
  const isVerdict = suggestion.suggestion_type === 'verdict';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`
        relative p-3 rounded-lg border
        ${config.bg} ${config.border}
        ${isActedOn ? 'opacity-50' : ''}
        ${isVerdict ? 'ring-1 ring-blue-500/30' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        <div className={`p-1.5 rounded-md bg-gradient-to-br ${config.gradient}`}>
          <Icon className="h-3.5 w-3.5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm text-foreground leading-relaxed ${isVerdict ? 'italic' : ''}`}>
            {suggestion.content}
          </p>
        </div>
        {!isActedOn && !isVerdict && (
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-100"
              onClick={() => onAccept?.(suggestion.id)}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => onDismiss?.(suggestion.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        {suggestion.is_accepted === true && (
          <Badge variant="outline" className="shrink-0 text-green-600 border-green-300">
            <Check className="h-3 w-3 mr-1" /> Applied
          </Badge>
        )}
      </div>
    </motion.div>
  );
}

function SuggestionSection({
  type,
  suggestions,
  onAccept,
  onDismiss,
}: {
  type: 'refinement' | 'what_if' | 'next_step' | 'verdict';
  suggestions: AiSuggestion[];
  onAccept?: (id: string) => void;
  onDismiss?: (id: string) => void;
}) {
  const config = suggestionConfig[type];
  const Icon = config.icon;

  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className={`p-1 rounded bg-gradient-to-r ${config.gradient}`}>
          <Icon className="h-3 w-3 text-white" />
        </div>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {config.label}
        </span>
      </div>
      <AnimatePresence mode="popLayout">
        {suggestions.map((suggestion) => (
          <SuggestionCard
            key={suggestion.id}
            suggestion={suggestion}
            onAccept={onAccept}
            onDismiss={onDismiss}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

export function AiSuggestionsPanel({
  groupedSuggestions,
  isLoading,
  onAccept,
  onDismiss,
}: AiSuggestionsPanelProps) {
  const hasSuggestions =
    groupedSuggestions.refinements.length > 0 ||
    groupedSuggestions.whatIfs.length > 0 ||
    groupedSuggestions.nextSteps.length > 0 ||
    groupedSuggestions.verdicts.length > 0;

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center gap-3 p-6 rounded-xl bg-gradient-to-br from-primary/5 to-purple-500/5 border border-primary/20"
      >
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">Super-Mentor is thinking...</span>
      </motion.div>
    );
  }

  if (!hasSuggestions) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 p-4 rounded-xl bg-gradient-to-br from-primary/5 via-purple-500/5 to-blue-500/5 border border-primary/20"
    >
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-purple-500">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <h3 className="font-semibold text-foreground">Super-Mentor Feedback</h3>
      </div>

      <div className="space-y-4">
        {/* Verdict first - it's the main take */}
        <SuggestionSection
          type="verdict"
          suggestions={groupedSuggestions.verdicts}
          onAccept={onAccept}
          onDismiss={onDismiss}
        />
        <SuggestionSection
          type="refinement"
          suggestions={groupedSuggestions.refinements}
          onAccept={onAccept}
          onDismiss={onDismiss}
        />
        <SuggestionSection
          type="what_if"
          suggestions={groupedSuggestions.whatIfs}
          onAccept={onAccept}
          onDismiss={onDismiss}
        />
        <SuggestionSection
          type="next_step"
          suggestions={groupedSuggestions.nextSteps}
          onAccept={onAccept}
          onDismiss={onDismiss}
        />
      </div>
    </motion.div>
  );
}
