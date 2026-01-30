import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DashboardHeader } from '@/components/ideas/DashboardHeader';
import { IdeaGrid } from '@/components/ideas/IdeaGrid';
import { QuickCapture } from '@/components/ideas/QuickCapture';
import { useAuth } from '@/hooks/useAuth';
import { useIdeas } from '@/hooks/useIdeas';
import type { Idea } from '@/types/idea';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { ideas, isLoading, createIdea, updateIdea, deleteIdea } = useIdeas();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  // Filter and sort ideas
  const filteredIdeas = useMemo(() => {
    let result = ideas.filter(idea => idea.status === 'active');

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(idea =>
        idea.title.toLowerCase().includes(query) ||
        idea.content?.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'alphabetical':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'priority':
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        result.sort((a, b) => 
          (priorityOrder[a.priority || 'medium'] || 1) - (priorityOrder[b.priority || 'medium'] || 1)
        );
        break;
      case 'recent':
      default:
        result.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    }

    return result;
  }, [ideas, searchQuery, sortBy]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleIdeaClick = (idea: Idea) => {
    // TODO: Navigate to idea detail page
    console.log('Open idea:', idea.id);
  };

  const handleIdeaDelete = (id: string) => {
    deleteIdea.mutate(id);
  };

  const handleIdeaArchive = (id: string) => {
    updateIdea.mutate({ id, status: 'archived' });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 glass border-b border-border/50"
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              IdeaFlow
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.email}
            </span>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Header with Quick Capture */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <DashboardHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            totalIdeas={filteredIdeas.length}
          />
          <div className="shrink-0">
            <QuickCapture
              onSubmit={(data) => createIdea.mutate(data)}
              isLoading={createIdea.isPending}
            />
          </div>
        </div>

        {/* Ideas Grid */}
        <IdeaGrid
          ideas={filteredIdeas}
          isLoading={isLoading}
          onIdeaClick={handleIdeaClick}
          onIdeaDelete={handleIdeaDelete}
          onIdeaArchive={handleIdeaArchive}
        />
      </main>
    </div>
  );
}
