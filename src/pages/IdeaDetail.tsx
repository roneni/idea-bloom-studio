import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Sparkles,
  Clock,
  Lightbulb,
  Pencil,
  Trash2,
  Archive,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { AiSuggestionsPanel } from '@/components/ideas/AiSuggestionsPanel';
import { useIdeas } from '@/hooks/useIdeas';
import { useAiSuggestions } from '@/hooks/useAiSuggestions';
import { formatDistanceToNow } from 'date-fns';

export default function IdeaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { ideas, isLoading: ideasLoading, updateIdea, deleteIdea } = useIdeas();
  const {
    groupedSuggestions,
    isLoading: suggestionsLoading,
    generateSuggestions,
    acceptSuggestion,
    dismissSuggestion,
  } = useAiSuggestions(id);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const idea = ideas.find((i) => i.id === id);

  if (ideasLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <p className="text-muted-foreground">Idea not found</p>
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const timeAgo = formatDistanceToNow(new Date(idea.updated_at), { addSuffix: true });
  const createdAgo = formatDistanceToNow(new Date(idea.created_at), { addSuffix: true });

  const handleStartEdit = () => {
    setEditTitle(idea.title);
    setEditContent(idea.content || '');
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    updateIdea.mutate({
      id: idea.id,
      title: editTitle,
      content: editContent || null,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteIdea.mutate(idea.id);
    navigate('/dashboard');
  };

  const handleArchive = () => {
    updateIdea.mutate({ id: idea.id, status: 'archived' });
    navigate('/dashboard');
  };

  const handleBrainstorm = () => {
    generateSuggestions.mutate({
      ideaId: idea.id,
      title: idea.title,
      content: idea.content || undefined,
    });
  };

  const hasSuggestions =
    groupedSuggestions.refinements.length > 0 ||
    groupedSuggestions.whatIfs.length > 0 ||
    groupedSuggestions.nextSteps.length > 0 ||
    groupedSuggestions.verdicts.length > 0;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Top bar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 glass border-b border-border/50"
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleStartEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleArchive}>
              <Archive className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDelete} className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.nav>

      <main className="container mx-auto px-4 py-8 max-w-3xl space-y-8">
        {/* Idea Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {isEditing ? (
            <div className="space-y-4">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-2xl font-bold bg-card/50"
                placeholder="Idea title..."
              />
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[120px] bg-card/50"
                placeholder="Describe your idea..."
              />
              <div className="flex gap-2">
                <Button onClick={handleSaveEdit} disabled={!editTitle.trim()}>
                  Save Changes
                </Button>
                <Button variant="ghost" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 mt-1">
                  <Lightbulb className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-foreground">{idea.title}</h1>
                  <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Updated {timeAgo}
                    </span>
                    <span>Created {createdAgo}</span>
                    {idea.priority && (
                      <Badge
                        variant="outline"
                        className={
                          idea.priority === 'high'
                            ? 'border-orange-300 text-orange-600'
                            : idea.priority === 'low'
                            ? 'border-muted text-muted-foreground'
                            : ''
                        }
                      >
                        {idea.priority} priority
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {idea.content && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="p-4 rounded-xl bg-card/50 border border-border/50"
                >
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {idea.content}
                  </p>
                </motion.div>
              )}
            </>
          )}
        </motion.div>

        {/* Brainstorm Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-foreground">
              <Sparkles className="h-5 w-5 text-primary" />
              Super-Mentor Brainstorm
            </h2>
            <Button
              onClick={handleBrainstorm}
              disabled={generateSuggestions.isPending}
              className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
            >
              {generateSuggestions.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {hasSuggestions ? 'Brainstorm Again' : 'Get Feedback'}
                </>
              )}
            </Button>
          </div>

          {!hasSuggestions && !suggestionsLoading && !generateSuggestions.isPending && (
            <div className="text-center py-12 rounded-xl border border-dashed border-border/50 bg-card/30">
              <Sparkles className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground mb-1">No brainstorm feedback yet</p>
              <p className="text-sm text-muted-foreground/60">
                Hit "Get Feedback" and the Super-Mentor will share refinements, what-ifs, and next steps.
              </p>
            </div>
          )}

          <AiSuggestionsPanel
            groupedSuggestions={groupedSuggestions}
            isLoading={suggestionsLoading || generateSuggestions.isPending}
            onAccept={(id) => acceptSuggestion.mutate(id)}
            onDismiss={(id) => dismissSuggestion.mutate(id)}
          />
        </motion.div>
      </main>
    </div>
  );
}
