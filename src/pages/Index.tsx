import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { visaDimensions } from '@/config/visaDimensions';
import { cropImage, verifyDimensions } from '@/utils/imageProcessing';
import { UploadCloud, Download, Image as ImageIcon, Search, Crop } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

export default function Index() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [open, setOpen] = useState(false);
  const [manualCropOpen, setManualCropOpen] = useState(false);
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0, scale: 1 });
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [previewImage, setPreviewImage] = useState<HTMLImageElement | null>(null);

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

  const handleCrop = async (manual = false) => {
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
        dimensions.height,
        manual ? cropPosition : undefined
      );
      
      const { isCorrect, actualWidth, actualHeight } = await verifyDimensions(cropped, dimensions.width, dimensions.height);
      
      if (!isCorrect) {
        toast.error(`Warning: Cropped image dimensions (${actualWidth}x${actualHeight}) don't match required dimensions (${dimensions.width}x${dimensions.height})`);
      }
      
      setCroppedImage(cropped);
      toast.success('Image cropped successfully');
      if (manual) setManualCropOpen(false);
    } catch (error) {
      toast.error('Failed to crop image');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (originalImage) {
      const img = new Image();
      img.onload = () => setPreviewImage(img);
      img.src = originalImage;
    }
  }, [originalImage]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!previewImage) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setDragStart({
      x: e.clientX - rect.left - cropPosition.x,
      y: e.clientY - rect.top - cropPosition.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragStart || !previewImage) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - dragStart.x;
    const y = e.clientY - rect.top - dragStart.y;

    setCropPosition(prev => ({
      ...prev,
      x,
      y
    }));
  };

  const handleMouseUp = () => {
    setDragStart(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!previewImage) return;
    
    const scaleDelta = e.deltaY * -0.001;
    setCropPosition(prev => ({
      ...prev,
      scale: Math.max(0.1, Math.min(3, prev.scale + scaleDelta))
    }));
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

  const getRequirementsTable = () => {
    if (!selectedCountry || !croppedImage) return null;
    
    const dimensions = visaDimensions.find(d => d.country === selectedCountry);
    if (!dimensions) return null;

    return (
      <div className="requirements-table mt-6 border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <tbody className="divide-y">
            <tr className="bg-gray-50">
              <td className="px-4 py-3 font-medium">Country</td>
              <td className="px-4 py-3">{dimensions.country}</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">Document Type</td>
              <td className="px-4 py-3">Visa Photo</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="px-4 py-3 font-medium">Size</td>
              <td className="px-4 py-3">Width: {dimensions.width}px, Height: {dimensions.height}px</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">Background color</td>
              <td className="px-4 py-3">White</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="px-4 py-3 font-medium">File format</td>
              <td className="px-4 py-3">JPEG</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">Resolution</td>
              <td className="px-4 py-3">600 DPI recommended</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const selectedDimensions = visaDimensions.find(d => d.country === selectedCountry);
  const regions = ["Americas", "Europe", "Asia", "Africa", "Middle East"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto p-6 md:p-8 lg:p-12 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
            Visa Photo Cropper
          </h1>
          <p className="text-lg text-gray-600/90 max-w-2xl mx-auto">
            Create perfectly sized visa photos that meet official requirements for any country
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          <div className="space-y-8">
            <div 
              {...getRootProps()} 
              className={`dropzone group relative overflow-hidden ${
                isDragActive ? 'ring-2 ring-purple-400 border-purple-400' : ''
              } hover:border-purple-400/70 hover:bg-purple-50/50 transition-all duration-300 rounded-2xl border-2 border-dashed border-gray-200`}
            >
              <input {...getInputProps()} />
              <div className="text-center p-10 space-y-4">
                <UploadCloud className="mx-auto h-14 w-14 text-gray-400 group-hover:text-purple-500/70 transition-colors" />
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

          <div className="space-y-8">
            <div className="glass-panel rounded-2xl p-8 bg-white/80 backdrop-blur-sm border border-gray-100 shadow-xl shadow-purple-100/20">
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
                    <div className="rounded-xl bg-purple-50/50 p-4 text-sm text-purple-800 border border-purple-100">
                      <p className="font-medium mb-1">{selectedDimensions.country} Visa Photo Requirements:</p>
                      <p className="text-purple-700/90">{selectedDimensions.description}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <Button
                    onClick={() => handleCrop(false)}
                    disabled={!originalImage || !selectedCountry || isProcessing}
                    className="w-full py-6 text-base font-medium bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    <ImageIcon className="mr-2 h-5 w-5" />
                    {isProcessing ? 'Processing...' : 'Auto Crop Image'}
                  </Button>

                  <Button
                    onClick={() => setManualCropOpen(true)}
                    disabled={!originalImage || !selectedCountry || isProcessing}
                    variant="outline"
                    className="w-full py-6 text-base font-medium"
                  >
                    <Crop className="mr-2 h-5 w-5" />
                    Manual Crop
                  </Button>

                  <Dialog open={manualCropOpen} onOpenChange={setManualCropOpen}>
                    <DialogContent className="max-w-[90vw] w-full">
                      <DialogTitle>Manual Crop</DialogTitle>
                      <div className="space-y-6 p-4">
                        <div 
                          className="relative w-full h-[60vh] overflow-hidden bg-gray-100 rounded-lg"
                          onMouseDown={handleMouseDown}
                          onMouseMove={handleMouseMove}
                          onMouseUp={handleMouseUp}
                          onMouseLeave={handleMouseUp}
                          onWheel={handleWheel}
                        >
                          {originalImage && previewImage && selectedDimensions && (
                            <>
                              <img
                                src={originalImage}
                                alt="Preview"
                                className="absolute cursor-move"
                                style={{
                                  transform: `translate(${cropPosition.x}px, ${cropPosition.y}px) scale(${cropPosition.scale})`,
                                  transformOrigin: 'center',
                                  transition: dragStart ? 'none' : 'transform 0.1s ease-out'
                                }}
                              />
                              <div 
                                className="absolute pointer-events-none"
                                style={{
                                  width: `${selectedDimensions.width}px`,
                                  height: `${selectedDimensions.height}px`,
                                  left: '50%',
                                  top: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
                                }}
                              >
                                <div className="absolute inset-0 border-2 border-blue-500">
                                  <div className="absolute -left-1 -top-1 w-4 h-4 border-l-4 border-t-4 border-blue-500"></div>
                                  <div className="absolute -right-1 -top-1 w-4 h-4 border-r-4 border-t-4 border-blue-500"></div>
                                  <div className="absolute -left-1 -bottom-1 w-4 h-4 border-l-4 border-b-4 border-blue-500"></div>
                                  <div className="absolute -right-1 -bottom-1 w-4 h-4 border-r-4 border-b-4 border-blue-500"></div>
                                  <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/70"></div>
                                  <div className="absolute right-1/3 top-0 bottom-0 w-px bg-white/70"></div>
                                  <div className="absolute top-1/3 left-0 right-0 h-px bg-white/70"></div>
                                  <div className="absolute bottom-1/3 left-0 right-0 h-px bg-white/70"></div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                        <div className="space-y-4">
                          <p className="text-sm text-gray-500">
                            Drag image to position • Scroll to zoom • Grid lines help with composition
                          </p>
                          <Button onClick={() => handleCrop(true)} disabled={isProcessing}>
                            {isProcessing ? 'Processing...' : 'Apply Manual Crop'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {croppedImage && (
                    <div className="space-y-6">
                      <div className="preview-container rounded-2xl bg-white shadow-lg border border-gray-100">
                        <div className="p-4 border-b border-gray-100">
                          <h3 className="text-sm font-medium text-gray-700">
                            Cropped Image with Guidelines
                          </h3>
                        </div>
                        <div className="p-6">
                          <img
                            src={croppedImage}
                            alt="Cropped"
                            className="rounded-lg max-h-[500px] mx-auto"
                          />
                          {getRequirementsTable()}
                        </div>
                      </div>
                      <Button
                        onClick={handleDownload}
                        className="w-full py-6 text-base font-medium bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-900 hover:to-gray-800"
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
