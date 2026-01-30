-- Create ideas table
CREATE TABLE public.ideas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  color TEXT NOT NULL DEFAULT 'purple',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reminder_days INTEGER DEFAULT NULL,
  board_position INTEGER DEFAULT 0
);

-- Create tags table
CREATE TABLE public.tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'blue',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create idea_tags junction table
CREATE TABLE public.idea_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(idea_id, tag_id)
);

-- Create idea_connections table for linking related ideas
CREATE TABLE public.idea_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  idea_id_1 UUID NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
  idea_id_2 UUID NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
  connection_type TEXT DEFAULT 'related',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(idea_id_1, idea_id_2)
);

-- Create ai_suggestions table for storing AI-generated suggestions
CREATE TABLE public.ai_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('refinement', 'what_if', 'next_step', 'connection', 'tool')),
  content TEXT NOT NULL,
  is_accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create idea_notes table for brainstorming notes
CREATE TABLE public.idea_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  default_reminder_days INTEGER DEFAULT 7,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idea_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idea_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idea_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ideas
CREATE POLICY "Users can view their own ideas" ON public.ideas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own ideas" ON public.ideas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own ideas" ON public.ideas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own ideas" ON public.ideas FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for tags
CREATE POLICY "Users can view their own tags" ON public.tags FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own tags" ON public.tags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tags" ON public.tags FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tags" ON public.tags FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for idea_tags (based on idea ownership)
CREATE POLICY "Users can view tags on their ideas" ON public.idea_tags FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.ideas WHERE ideas.id = idea_tags.idea_id AND ideas.user_id = auth.uid()));
CREATE POLICY "Users can add tags to their ideas" ON public.idea_tags FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.ideas WHERE ideas.id = idea_tags.idea_id AND ideas.user_id = auth.uid()));
CREATE POLICY "Users can remove tags from their ideas" ON public.idea_tags FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.ideas WHERE ideas.id = idea_tags.idea_id AND ideas.user_id = auth.uid()));

-- RLS Policies for idea_connections
CREATE POLICY "Users can view their connections" ON public.idea_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create connections" ON public.idea_connections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete connections" ON public.idea_connections FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for ai_suggestions (based on idea ownership)
CREATE POLICY "Users can view suggestions for their ideas" ON public.ai_suggestions FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.ideas WHERE ideas.id = ai_suggestions.idea_id AND ideas.user_id = auth.uid()));
CREATE POLICY "System can create suggestions" ON public.ai_suggestions FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.ideas WHERE ideas.id = ai_suggestions.idea_id AND ideas.user_id = auth.uid()));
CREATE POLICY "Users can update suggestions on their ideas" ON public.ai_suggestions FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.ideas WHERE ideas.id = ai_suggestions.idea_id AND ideas.user_id = auth.uid()));

-- RLS Policies for idea_notes (based on idea ownership)
CREATE POLICY "Users can view notes on their ideas" ON public.idea_notes FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.ideas WHERE ideas.id = idea_notes.idea_id AND ideas.user_id = auth.uid()));
CREATE POLICY "Users can add notes to their ideas" ON public.idea_notes FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.ideas WHERE ideas.id = idea_notes.idea_id AND ideas.user_id = auth.uid()));
CREATE POLICY "Users can update notes on their ideas" ON public.idea_notes FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.ideas WHERE ideas.id = idea_notes.idea_id AND ideas.user_id = auth.uid()));
CREATE POLICY "Users can delete notes from their ideas" ON public.idea_notes FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.ideas WHERE ideas.id = idea_notes.idea_id AND ideas.user_id = auth.uid()));

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_ideas_updated_at
  BEFORE UPDATE ON public.ideas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_idea_notes_updated_at
  BEFORE UPDATE ON public.idea_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_ideas_user_id ON public.ideas(user_id);
CREATE INDEX idx_ideas_status ON public.ideas(status);
CREATE INDEX idx_ideas_last_activity ON public.ideas(last_activity_at);
CREATE INDEX idx_tags_user_id ON public.tags(user_id);
CREATE INDEX idx_idea_tags_idea_id ON public.idea_tags(idea_id);
CREATE INDEX idx_idea_tags_tag_id ON public.idea_tags(tag_id);
CREATE INDEX idx_ai_suggestions_idea_id ON public.ai_suggestions(idea_id);
CREATE INDEX idx_idea_notes_idea_id ON public.idea_notes(idea_id);
CREATE INDEX idx_idea_connections_ideas ON public.idea_connections(idea_id_1, idea_id_2);