// VideoGallery.tsx
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Video, Play } from "lucide-react";
import { type Material } from "@/dashboard/courses/class/types";
import { getFileName, isVideoUrl, getVideoEmbedUrl, getYoutubeThumbnail } from "@/dashboard/courses/class/utils";

interface VideoGalleryProps {
  videos: Material[];
}

export const VideoGallery = ({ videos }: VideoGalleryProps) => {
  const [selectedVideo, setSelectedVideo] = useState<Material | null>(null);

  if (videos.length === 0) return null;

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b">
          <Video className="h-5 w-5 text-red-500" />
          <h3 className="font-semibold text-lg">Videos</h3>
          <Badge variant="outline">{videos.length}</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => {
            const thumbnail = getYoutubeThumbnail(video.material_url);
            
            return (
              <button
                key={video.id}
                onClick={() => setSelectedVideo(video)}
                className="group relative aspect-video rounded-lg overflow-hidden border-2 hover:border-primary transition-all bg-muted"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="bg-primary rounded-full p-4 group-hover:scale-110 transition-transform">
                    <Play className="h-8 w-8 text-primary-foreground fill-current" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                  <p className="text-white font-medium text-sm line-clamp-2">
                    {getFileName(video.material_url)}
                  </p>
                </div>
                {thumbnail && (
                  <img 
                    src={thumbnail}
                    alt="Video thumbnail"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl w-full p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="pr-8">
              {selectedVideo && getFileName(selectedVideo.material_url)}
            </DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full bg-black">
            {selectedVideo && isVideoUrl(selectedVideo.material_url) ? (
              <iframe
                src={getVideoEmbedUrl(selectedVideo.material_url)}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            ) : (
              <video
                src={selectedVideo?.material_url}
                controls
                className="w-full h-full"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};