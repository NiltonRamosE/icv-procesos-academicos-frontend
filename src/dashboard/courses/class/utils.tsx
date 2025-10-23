// utils.ts
import { 
  Video,
  FileText,
  Image,
  FileType,
  Presentation,
  BookOpen
} from "lucide-react";

export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric'
  });
};

export const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit'
  });
};

export const getStatusColor = (status: string) => {
  const colors: { [key: string]: string } = {
    'SCHEDULED': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'IN_PROGRESS': 'bg-green-500/10 text-green-500 border-green-500/20',
    'COMPLETED': 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    'CANCELLED': 'bg-red-500/10 text-red-500 border-red-500/20'
  };
  return colors[status] || colors['SCHEDULED'];
};

export const getStatusLabel = (status: string) => {
  const labels: { [key: string]: string } = {
    'SCHEDULED': 'Programada',
    'IN_PROGRESS': 'En Progreso',
    'COMPLETED': 'Completada',
    'CANCELLED': 'Cancelada'
  };
  return labels[status] || status;
};

export const getFileName = (url: string) => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const fileName = pathname.split('/').pop() || url;
    return decodeURIComponent(fileName);
  } catch {
    return url;
  }
};

export const getTypeIcon = (type: string) => {
  const t = type.toUpperCase();
  if (t === 'VIDEO') return <Video className="h-5 w-5" />;
  if (t === 'PDF') return <FileText className="h-5 w-5" />;
  if (t === 'DOCX' || t === 'DOC') return <FileType className="h-5 w-5" />;
  if (t === 'XLSX' || t === 'XLS') return <FileType className="h-5 w-5" />;
  if (t === 'PPTX' || t === 'PPT') return <Presentation className="h-5 w-5" />;
  if (t === 'IMAGEN' || t === 'JPG' || t === 'PNG') return <Image className="h-5 w-5" />;
  return <BookOpen className="h-5 w-5" />;
};

export const isVideoUrl = (url: string): boolean => {
  return url.includes('youtube.com') || 
         url.includes('youtu.be') || 
         url.includes('vimeo.com') ||
         url.match(/\.(mp4|webm|ogg)$/i) !== null;
};

export const getVideoEmbedUrl = (url: string): string => {
  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes('vimeo.com/')) {
    const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
    return `https://player.vimeo.com/video/${videoId}`;
  }
  return url;
};

export const getYoutubeThumbnail = (url: string): string | null => {
  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
  return null;
};