import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { IdeaColor } from '@/types/idea';

interface QuickCaptureProps {
  onSubmit: (data: { title: string; content?: string; color: IdeaColor }) => void;
  isLoading?: boolean;
}

const colors: { value: IdeaColor; label: string; class: string }[] = [
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'cyan', label: 'Cyan', class: 'bg-cyan-500' },
  { value: 'green', label: 'Green', class: 'bg-green-500' },
  { value: 'yellow', label: 'Yellow', class: 'bg-yellow-500' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { value: 'pink', label: 'Pink', class: 'bg-pink-500' },
  { value: 'red', label: 'Red', class: 'bg-red-500' },
];

export function QuickCapture({ onSubmit, isLoading }: QuickCaptureProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState<IdeaColor>('purple');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      content: content.trim() || undefined,
      color: selectedColor,
    });

    setTitle('');
    setContent('');
    setSelectedColor('purple');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            size="lg"
            className="
              relative overflow-hidden
              bg-gradient-to-r from-primary via-purple-600 to-blue-600
              hover:from-primary/90 hover:via-purple-600/90 hover:to-blue-600/90
              text-primary-foreground font-semibold
              shadow-lg shadow-primary/25
              transition-all duration-300
            "
          >
            <Plus className="h-5 w-5 mr-2" />
            Capture Idea
            <Sparkles className="h-4 w-4 ml-2 animate-pulse" />
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20">
              <Sparkles className="h-5 w-5 text-primary" />
            </span>
            Capture Your Idea
          </DialogTitle>
          <DialogDescription>
            Write down your idea. AI will help you develop it after you save.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Input
              placeholder="What's your idea?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-medium"
              autoFocus
            />
          </div>
          <div>
            <Textarea
              placeholder="Add some details (optional)..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Choose a color
            </label>
            <div className="flex gap-2 flex-wrap">
              {colors.map((color) => (
                <motion.button
                  key={color.value}
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedColor(color.value)}
                  className={`
                    w-8 h-8 rounded-full ${color.class}
                    transition-all duration-200
                    ${selectedColor === color.value 
                      ? 'ring-2 ring-offset-2 ring-foreground' 
                      : 'opacity-60 hover:opacity-100'
                    }
                  `}
                  title={color.label}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || isLoading}>
              {isLoading ? 'Saving...' : 'Save Idea'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
