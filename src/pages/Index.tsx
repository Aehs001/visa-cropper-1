
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { visaDimensions } from '@/config/visaDimensions';
import { cropImage } from '@/utils/imageProcessing';
import { UploadCloud, Download, Image as ImageIcon } from 'lucide-react';

export default function Index() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles?.length > 0) {
      const file = acceptedFiles[0];
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        setOriginalImage(reader.result as string);
        setCroppedImage(null);
      };
      reader.readAsDataURL(file);
      toast.success('Image uploaded successfully');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1
  });

  const handleCrop = async () => {
    if (!originalImage || !selectedCountry) {
      toast.error('Please select both an image and a country');
      return;
    }

    const dimensions = visaDimensions.find(d => d.country === selectedCountry);
    if (!dimensions) {
      toast.error('Invalid country selection');
      return;
    }

    setIsProcessing(true);
    try {
      const cropped = await cropImage(
        originalImage,
        dimensions.width,
        dimensions.height
      );
      setCroppedImage(cropped);
      toast.success('Image cropped successfully');
    } catch (error) {
      toast.error('Failed to crop image');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!croppedImage) return;
    
    const link = document.createElement('a');
    link.href = croppedImage;
    link.download = `visa-photo-${selectedCountry.toLowerCase()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Image downloaded successfully');
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Visa Photo Cropper
          </h1>
          <p className="text-gray-600">
            Upload your photo and select a country to get properly sized visa photos
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div 
              {...getRootProps()} 
              className={`dropzone ${isDragActive ? 'border-primary' : ''}`}
            >
              <input {...getInputProps()} />
              <div className="text-center p-6 space-y-4">
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                <div className="space-y-1">
                  <p className="text-gray-600">
                    {isDragActive ? 
                      'Drop your image here' : 
                      'Drag & drop your image here'}
                  </p>
                  <p className="text-sm text-gray-500">
                    or click to select a file
                  </p>
                </div>
              </div>
            </div>

            {originalImage && (
              <div className="preview-container aspect-square">
                <img
                  src={originalImage}
                  alt="Original"
                  className="rounded-lg"
                />
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="glass-panel rounded-lg p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Select Country
                </label>
                <Select
                  value={selectedCountry}
                  onValueChange={setSelectedCountry}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a country" />
                  </SelectTrigger>
                  <SelectContent>
                    {visaDimensions.map((dim) => (
                      <SelectItem key={dim.country} value={dim.country}>
                        {dim.country} - {dim.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={handleCrop}
                  disabled={!originalImage || !selectedCountry || isProcessing}
                  className="w-full"
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  {isProcessing ? 'Processing...' : 'Crop Image'}
                </Button>

                {croppedImage && (
                  <>
                    <div className="preview-container">
                      <img
                        src={croppedImage}
                        alt="Cropped"
                        className="rounded-lg"
                      />
                    </div>
                    <Button
                      onClick={handleDownload}
                      variant="secondary"
                      className="w-full"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
