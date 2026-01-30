export type IdeaColor = 'purple' | 'blue' | 'cyan' | 'green' | 'yellow' | 'orange' | 'pink' | 'red';

export type IdeaStatus = 'active' | 'archived' | 'completed';

export type IdeaPriority = 'low' | 'medium' | 'high';

export type SuggestionType = 'refinement' | 'what_if' | 'next_step' | 'connection' | 'tool';

export interface Idea {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  color: IdeaColor;
  status: IdeaStatus;
  priority: IdeaPriority | null;
  created_at: string;
  updated_at: string;
  last_activity_at: string;
  reminder_days: number | null;
  board_position: number;
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: IdeaColor;
  created_at: string;
}

export interface IdeaTag {
  id: string;
  idea_id: string;
  tag_id: string;
  created_at: string;
}

export interface IdeaConnection {
  id: string;
  user_id: string;
  idea_id_1: string;
  idea_id_2: string;
  connection_type: string;
  created_at: string;
}

export interface AISuggestion {
  id: string;
  idea_id: string;
  suggestion_type: SuggestionType;
  content: string;
  is_accepted: boolean;
  created_at: string;
}

export interface IdeaNote {
  id: string;
  idea_id: string;
  content: string;
  is_ai_generated: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  default_reminder_days: number;
  created_at: string;
  updated_at: string;
}

export interface IdeaWithTags extends Idea {
  tags?: Tag[];
}

// Color mappings for Tailwind classes
export const ideaColorClasses: Record<IdeaColor, { bg: string; text: string; border: string; shadow: string }> = {
  purple: {
    bg: 'bg-idea-purple',
    text: 'text-idea-purple',
    border: 'border-idea-purple',
    shadow: 'shadow-idea-purple',
  },
  blue: {
    bg: 'bg-idea-blue',
    text: 'text-idea-blue',
    border: 'border-idea-blue',
    shadow: 'shadow-idea-blue',
  },
  cyan: {
    bg: 'bg-idea-cyan',
    text: 'text-idea-cyan',
    border: 'border-idea-cyan',
    shadow: 'shadow-idea-cyan',
  },
  green: {
    bg: 'bg-idea-green',
    text: 'text-idea-green',
    border: 'border-idea-green',
    shadow: 'shadow-[0_4px_20px_-4px_hsl(142_76%_45%/0.3)]',
  },
  yellow: {
    bg: 'bg-idea-yellow',
    text: 'text-idea-yellow',
    border: 'border-idea-yellow',
    shadow: 'shadow-[0_4px_20px_-4px_hsl(48_96%_53%/0.3)]',
  },
  orange: {
    bg: 'bg-idea-orange',
    text: 'text-idea-orange',
    border: 'border-idea-orange',
    shadow: 'shadow-[0_4px_20px_-4px_hsl(25_95%_53%/0.3)]',
  },
  pink: {
    bg: 'bg-idea-pink',
    text: 'text-idea-pink',
    border: 'border-idea-pink',
    shadow: 'shadow-[0_4px_20px_-4px_hsl(330_81%_60%/0.3)]',
  },
  red: {
    bg: 'bg-idea-red',
    text: 'text-idea-red',
    border: 'border-idea-red',
    shadow: 'shadow-[0_4px_20px_-4px_hsl(0_84%_60%/0.3)]',
  },
};
