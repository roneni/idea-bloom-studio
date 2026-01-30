import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Idea, IdeaColor, IdeaStatus, IdeaPriority } from '@/types/idea';
import { toast } from 'sonner';

export function useIdeas() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: ideas = [], isLoading, error } = useQuery({
    queryKey: ['ideas', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('user_id', user.id)
        .order('board_position', { ascending: true });

      if (error) throw error;
      return data as Idea[];
    },
    enabled: !!user,
  });

  const createIdea = useMutation({
    mutationFn: async (newIdea: { title: string; content?: string; color?: IdeaColor }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('ideas')
        .insert({
          user_id: user.id,
          title: newIdea.title,
          content: newIdea.content || null,
          color: newIdea.color || 'purple',
          board_position: ideas.length,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Idea;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
      toast.success('Idea captured! ✨');
    },
    onError: (error) => {
      toast.error('Failed to save idea');
      console.error('Create idea error:', error);
    },
  });

  const updateIdea = useMutation({
    mutationFn: async (update: { id: string } & Partial<Pick<Idea, 'title' | 'content' | 'color' | 'status' | 'priority' | 'reminder_days' | 'board_position'>>) => {
      const { id, ...updates } = update;
      
      const { data, error } = await supabase
        .from('ideas')
        .update({ ...updates, last_activity_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Idea;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
    },
    onError: (error) => {
      toast.error('Failed to update idea');
      console.error('Update idea error:', error);
    },
  });

  const deleteIdea = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ideas')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
      toast.success('Idea deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete idea');
      console.error('Delete idea error:', error);
    },
  });

  return {
    ideas,
    isLoading,
    error,
    createIdea,
    updateIdea,
    deleteIdea,
  };
}
