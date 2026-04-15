import { useState, useEffect, useRef } from 'react';
import { Play, Pause, X } from 'lucide-react';
import type { VideoSegment } from '../types';

interface TeleprompterViewProps {
  segments: VideoSegment[];
  onExit: () => void;
}

export default function TeleprompterView({ segments, onExit }: TeleprompterViewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExit]);

  useEffect(() => {
    if (!isPlaying) return;

    const animate = () => {
      if (scrollContainerRef.current) {
        const now = performance.now();
        if (startTimeRef.current === 0) {
          startTimeRef.current = now - pausedTimeRef.current * 1000;
        }

        const elapsed = (now - startTimeRef.current) / 1000;
        setElapsedTime(elapsed);

        const container = scrollContainerRef.current;
        const maxScroll = container.scrollHeight - container.clientHeight;

        // Calculate scroll based on elapsed time and speed (px per second)
        const pixelsPerSecond = 50 * speed;
        const newScroll = (elapsed * pixelsPerSecond) % (maxScroll + 1);

        container.scrollTop = newScroll;
        setScrollPosition(newScroll);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, speed]);

  const togglePlayPause = () => {
    if (isPlaying) {
      pausedTimeRef.current = elapsedTime;
      startTimeRef.current = 0;
    } else {
      pausedTimeRef.current = elapsedTime;
    }
    setIsPlaying(!isPlaying);
  };

  const handleContainerClick = () => {
    togglePlayPause();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const currentSegmentIndex = segments.findIndex((seg) => {
    // Rough estimate based on scroll position
    return segments.indexOf(seg) === Math.floor(scrollPosition / 300);
  });

  return (
    <div className="fixed inset-0 bg-black flex flex-col z-50">
      {/* Exit button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={onExit}
          className="p-2 hover:bg-white/10 rounded transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Main content area */}
      <div
        ref={scrollContainerRef}
        onClick={handleContainerClick}
        className="flex-1 overflow-y-auto cursor-pointer"
      >
        <div className="min-h-full flex flex-col justify-center items-center p-8">
          <div className="max-w-4xl w-full">
            {segments.map((segment, index) => (
              <div key={segment.id} className="mb-12">
                {/* Segment title separator */}
                <div className="text-center mb-8">
                  <h2 className="text-xl text-white/40 font-serif">
                    {segment.title}
                  </h2>
                  {segment.speakerName && (
                    <p className="text-sm text-white/30 mt-1">{segment.speakerName}</p>
                  )}
                </div>

                {/* Script text */}
                <div className="text-center">
                  <p className="text-5xl font-serif text-white leading-relaxed whitespace-pre-wrap">
                    {segment.script}
                  </p>
                </div>

                {/* Spacing between segments */}
                {index < segments.length - 1 && (
                  <div className="my-16 flex justify-center">
                    <div className="w-32 h-1 bg-white/10 rounded"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Control bar */}
      <div className="bg-black/80 border-t border-white/10 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          {/* Play/Pause */}
          <button
            onClick={togglePlayPause}
            className="p-2 hover:bg-white/10 rounded transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Time display */}
          <div className="text-white font-mono text-sm">
            {formatTime(elapsedTime)}
          </div>

          {/* Speed control */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-white/70">Speed:</label>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-24 cursor-pointer"
            />
            <span className="text-xs text-white/70 w-10">{speed.toFixed(1)}x</span>
          </div>

          {/* Current segment indicator */}
          <div className="ml-auto text-xs text-white/50">
            Segment {Math.max(1, currentSegmentIndex + 1)} of {segments.length}
          </div>
        </div>
      </div>

      {/* Instructions overlay (shown briefly) */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 text-white/40 text-sm pointer-events-none">
        Click to play/pause • ESC to exit
      </div>
    </div>
  );
}
