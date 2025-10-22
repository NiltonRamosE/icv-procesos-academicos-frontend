import React, { useState, type ChangeEvent } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, ImageIcon } from "lucide-react";

interface CloudinaryProps {
  onUpload?: (url: string) => void;
}

const Cloudinary: React.FC<CloudinaryProps> = ({ onUpload }) => {
  const preset_name = "incadev";
  const cloud_name = "dshi5w2wt";

  const [image, setImage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const uploadImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const data = new FormData();
    data.append('file', files[0]);
    data.append('upload_preset', preset_name);

    setLoading(true);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, {
        method: 'POST',
        body: data,
      });

      const file = await response.json();
      setImage(file.secure_url);

      // Aquí notificas al padre con la URL
      if (onUpload) onUpload(file.secure_url);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="image-upload" className="text-sm font-medium">
          Cargar Imagen
        </Label>
        
        <div className="relative">
          <input
            id="image-upload"
            type="file"
            name="file"
            accept="image/png, image/jpeg"
            onChange={uploadImage}
            className="sr-only"
            disabled={loading}
          />
          
          <label
            htmlFor="image-upload"
            className={`
              flex flex-col items-center justify-center
              w-full h-32 px-4 py-6
              border-2 border-dashed rounded-lg
              cursor-pointer transition-all
              ${loading 
                ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
                : 'border-gray-300 hover:border-primary hover:bg-accent/50'
              }
            `}
          >
            {loading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Subiendo imagen...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">
                    Haz clic para cargar
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG o JPEG (MAX. 10MB)
                  </p>
                </div>
              </div>
            )}
          </label>
        </div>
      </div>

      {image && !loading && (
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ImageIcon className="h-4 w-4 text-primary" />
                <span>Vista Previa</span>
              </div>
              
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                <img 
                  src={image} 
                  alt="Imagen subida" 
                  className="h-full w-full object-cover"
                />
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Imagen cargada exitosamente</span>
                <a 
                  href={image} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Ver original
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Cloudinary;