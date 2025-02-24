
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { visaDimensions } from '@/config/visaDimensions';
import { cropImage } from '@/utils/imageProcessing';
import { UploadCloud, Download, Image as ImageIcon, Search } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function Index() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [open, setOpen] = useState(false);

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

  const selectedDimensions = visaDimensions.find(d => d.country === selectedCountry);

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Visa Photo Cropper
          </h1>
          <p className="text-gray-600 text-lg">
            Create perfectly sized visa photos for any country
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div 
              {...getRootProps()} 
              className={`dropzone group ${isDragActive ? 'border-primary ring-2 ring-primary/20' : ''} 
              hover:border-primary/70 hover:bg-secondary/80 transition-all duration-300`}
            >
              <input {...getInputProps()} />
              <div className="text-center p-8 space-y-4">
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400 group-hover:text-primary/70 transition-colors" />
                <div className="space-y-2">
                  <p className="text-gray-600 font-medium">
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
              <div className="preview-container aspect-square bg-white p-4 rounded-xl shadow-sm">
                <img
                  src={originalImage}
                  alt="Original"
                  className="rounded-lg max-h-[500px] mx-auto"
                />
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="glass-panel rounded-xl p-6 space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  Select Country
                </label>
                <Button 
                  variant="outline" 
                  onClick={() => setOpen(true)}
                  className="w-full justify-between"
                >
                  {selectedCountry || "Search for a country..."}
                  <Search className="ml-2 h-4 w-4" />
                </Button>

                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogContent className="max-w-[500px] p-0">
                    <Command>
                      <CommandInput placeholder="Search for a country..." />
                      <CommandEmpty>No country found.</CommandEmpty>
                      {["Americas", "Europe", "Asia", "Africa", "Middle East"].map((region) => (
                        <CommandGroup key={region} heading={region}>
                          {visaDimensions
                            .filter((dim) => dim.region === region)
                            .map((dim) => (
                              <CommandItem
                                key={dim.country}
                                onSelect={() => {
                                  setSelectedCountry(dim.country);
                                  setOpen(false);
                                }}
                              >
                                {dim.country}
                                <span className="ml-2 text-xs text-gray-500">
                                  {dim.description}
                                </span>
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      ))}
                    </Command>
                  </DialogContent>
                </Dialog>

                {selectedDimensions && (
                  <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
                    <p className="font-medium">{selectedDimensions.country} Visa Photo Requirements:</p>
                    <p>{selectedDimensions.description}</p>
                  </div>
                )}
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
                    <div className="preview-container bg-white p-4 rounded-xl">
                      <img
                        src={croppedImage}
                        alt="Cropped"
                        className="rounded-lg max-h-[500px] mx-auto"
                      />
                    </div>
                    <Button
                      onClick={handleDownload}
                      variant="secondary"
                      className="w-full"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Photo
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
