import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AiSuggestion {
  id: string;
  idea_id: string;
  suggestion_type: 'refinement' | 'what_if' | 'next_step' | 'verdict';
  content: string;
  is_accepted: boolean | null;
  created_at: string;
}

export function useAiSuggestions(ideaId?: string) {
  const queryClient = useQueryClient();

  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ['ai-suggestions', ideaId],
    queryFn: async () => {
      if (!ideaId) return [];

      const { data, error } = await supabase
        .from('ai_suggestions')
        .select('*')
        .eq('idea_id', ideaId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AiSuggestion[];
    },
    enabled: !!ideaId,
  });

  const generateSuggestions = useMutation({
    mutationFn: async ({ ideaId, title, content }: { ideaId: string; title: string; content?: string }) => {
      const { data, error } = await supabase.functions.invoke('brainstorm', {
        body: { ideaId, title, content },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      return data.suggestions;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ai-suggestions', variables.ideaId] });
      toast.success('AI suggestions ready! ✨', {
        description: 'Check out the brainstorming ideas below',
      });
    },
    onError: (error) => {
      console.error('AI suggestion error:', error);
      toast.error('Could not generate suggestions', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    },
  });

  const acceptSuggestion = useMutation({
    mutationFn: async (suggestionId: string) => {
      const { error } = await supabase
        .from('ai_suggestions')
        .update({ is_accepted: true })
        .eq('id', suggestionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-suggestions'] });
    },
  });

  const dismissSuggestion = useMutation({
    mutationFn: async (suggestionId: string) => {
      const { error } = await supabase
        .from('ai_suggestions')
        .update({ is_accepted: false })
        .eq('id', suggestionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-suggestions'] });
    },
  });

  // Group suggestions by type
  const groupedSuggestions = {
    refinements: suggestions.filter(s => s.suggestion_type === 'refinement'),
    whatIfs: suggestions.filter(s => s.suggestion_type === 'what_if'),
    nextSteps: suggestions.filter(s => s.suggestion_type === 'next_step'),
    verdicts: suggestions.filter(s => s.suggestion_type === 'verdict'),
  };

  return {
    suggestions,
    groupedSuggestions,
    isLoading,
    generateSuggestions,
    acceptSuggestion,
    dismissSuggestion,
  };
}
