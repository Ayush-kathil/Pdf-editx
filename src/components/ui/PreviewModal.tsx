import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize, Minimize, Download } from 'lucide-react';
import { useToast } from '@/components/ui/toast-provider';
import { ShareButton } from '@/components/ui/ShareButton';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileSrc: string | null;
  fileType: 'pdf' | 'image' | 'video' | null;
  fileName?: string;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  fileSrc,
  fileType,
  fileName = 'file',
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleDownload = () => {
    if (!fileSrc) return;
    const link = document.createElement('a');
    link.href = fileSrc;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (!fileSrc) return;
    try {
      const response = await fetch(fileSrc);
      const blob = await response.blob();
      const file = new File([blob], fileName, { type: blob.type });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: fileName,
        });
      } else {
        toast('Sharing not supported on this device/browser', 'error');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast('Failed to prepare file for sharing', 'error');
    }
  };

  if (!isOpen || !fileSrc) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12 bg-black/80 backdrop-blur-sm">
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`relative flex flex-col bg-card overflow-hidden shadow-2xl ring-1 ring-border-main ${
            isFullscreen
              ? 'w-screen h-screen rounded-none'
              : 'w-full max-w-6xl h-[85vh] rounded-3xl'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border-main bg-element/50 backdrop-blur shrink-0">
            <h3 className="text-lg font-semibold text-txt-primary truncate pr-4 max-w-[60%] sm:max-w-[70%]">
              Preview: {fileName}
            </h3>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <ShareButton
                onShare={handleShare}
                className="p-2 text-txt-secondary hover:text-txt-primary hover:bg-element-hover rounded-xl transition-colors"
                label=""
              />
              <button
                onClick={handleDownload}
                className="p-2 text-txt-secondary hover:text-txt-primary hover:bg-element-hover rounded-xl transition-colors"
                title="Download"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-2 text-txt-secondary hover:text-txt-primary hover:bg-element-hover rounded-xl transition-colors"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5" />
                ) : (
                  <Maximize className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={onClose}
                className="p-2 text-txt-secondary hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden relative bg-page/50 flex items-center justify-center p-2 sm:p-4">
            {fileType === 'image' && (
              <img
                src={fileSrc}
                alt={fileName}
                className="w-full h-full object-contain"
              />
            )}
            
            {fileType === 'video' && (
              <video
                src={fileSrc}
                controls
                className="w-full h-full object-contain"
              />
            )}
            
            {fileType === 'pdf' && (
              <iframe
                src={`${fileSrc}#toolbar=0&navpanes=0&scrollbar=0`}
                className="w-full h-full rounded-xl border border-border-main bg-white"
                title="PDF Preview"
              />
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
