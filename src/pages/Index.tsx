
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { visaDimensions } from '@/config/visaDimensions';
import { cropImage } from '@/utils/imageProcessing';
import { UploadCloud, Download, Image as ImageIcon, Search } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

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
  const regions = ["Americas", "Europe", "Asia", "Africa", "Middle East"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30">
      <div className="max-w-6xl mx-auto p-6 md:p-8 lg:p-12 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
            Visa Photo Cropper
          </h1>
          <p className="text-lg text-gray-600/90 max-w-2xl mx-auto">
            Create perfectly sized visa photos that meet official requirements for any country
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left Column - Upload and Original Image */}
          <div className="space-y-8">
            <div 
              {...getRootProps()} 
              className={`dropzone group relative overflow-hidden ${
                isDragActive ? 'ring-2 ring-blue-400 border-blue-400' : ''
              } hover:border-blue-400/70 hover:bg-blue-50/50 transition-all duration-300 rounded-2xl border-2 border-dashed border-gray-200`}
            >
              <input {...getInputProps()} />
              <div className="text-center p-10 space-y-4">
                <UploadCloud className="mx-auto h-14 w-14 text-gray-400 group-hover:text-blue-500/70 transition-colors" />
                <div className="space-y-2">
                  <p className="text-gray-700 font-medium">
                    {isDragActive ? 'Drop your image here' : 'Drag & drop your image here'}
                  </p>
                  <p className="text-sm text-gray-500">
                    or click to select a file
                  </p>
                </div>
              </div>
            </div>

            {originalImage && (
              <div className="preview-container overflow-hidden rounded-2xl bg-white shadow-lg border border-gray-100">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-sm font-medium text-gray-700">Original Image</h3>
                </div>
                <div className="p-6">
                  <img
                    src={originalImage}
                    alt="Original"
                    className="rounded-lg max-h-[500px] mx-auto"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Controls and Cropped Image */}
          <div className="space-y-8">
            <div className="glass-panel rounded-2xl p-8 bg-white/80 backdrop-blur-sm border border-gray-100 shadow-xl shadow-gray-100/20">
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">
                    Select Country
                  </label>
                  <Button 
                    variant="outline" 
                    onClick={() => setOpen(true)}
                    className="w-full justify-between bg-white hover:bg-gray-50/80"
                  >
                    {selectedCountry || "Search for a country..."}
                    <Search className="ml-2 h-4 w-4 text-gray-500" />
                  </Button>

                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="max-w-[500px] p-0">
                      <DialogTitle className="sr-only">Search Countries</DialogTitle>
                      <Command className="rounded-lg border-none">
                        <CommandInput placeholder="Search for a country..." />
                        <CommandList>
                          <CommandEmpty>No country found.</CommandEmpty>
                          {regions.map((region) => (
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
                        </CommandList>
                      </Command>
                    </DialogContent>
                  </Dialog>

                  {selectedDimensions && (
                    <div className="rounded-xl bg-blue-50/50 p-4 text-sm text-blue-800 border border-blue-100">
                      <p className="font-medium mb-1">{selectedDimensions.country} Visa Photo Requirements:</p>
                      <p className="text-blue-700/90">{selectedDimensions.description}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <Button
                    onClick={handleCrop}
                    disabled={!originalImage || !selectedCountry || isProcessing}
                    className="w-full py-6 text-base font-medium"
                  >
                    <ImageIcon className="mr-2 h-5 w-5" />
                    {isProcessing ? 'Processing...' : 'Crop Image'}
                  </Button>

                  {croppedImage && (
                    <div className="space-y-6">
                      <div className="preview-container rounded-2xl bg-white shadow-lg border border-gray-100">
                        <div className="p-4 border-b border-gray-100">
                          <h3 className="text-sm font-medium text-gray-700">Cropped Image</h3>
                        </div>
                        <div className="p-6">
                          <img
                            src={croppedImage}
                            alt="Cropped"
                            className="rounded-lg max-h-[500px] mx-auto"
                          />
                        </div>
                      </div>
                      <Button
                        onClick={handleDownload}
                        variant="secondary"
                        className="w-full py-6 text-base font-medium bg-gray-900 text-white hover:bg-gray-800"
                      >
                        <Download className="mr-2 h-5 w-5" />
                        Download Photo
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
