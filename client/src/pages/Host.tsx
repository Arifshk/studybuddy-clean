import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CheckCircle, Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useStore } from "@/store/useStore";
import { CreateSessionData } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { uploadLocationImages } from "@/lib/firebaseService";
import { DynamicTileInput } from "@/components/DynamicTileInput";
import { ImageUpload } from "@/components/ImageUpload";

const hostSessionSchema = z.object({
  courseCode: z.array(z.string()).min(1, "At least one course is required"),
  building: z.array(z.string()).min(1, "At least one building is required"),
  floor: z.string().min(1, "Floor is required"),
  area: z.string().optional(),
  capacity: z.string().min(1, "Capacity is required"),
  duration: z.string().min(1, "Duration is required"),
  notes: z.string().max(100, "Notes must be 100 characters or less").optional(),
  public: z.boolean().default(true),
  isScheduled: z.boolean().default(false),
  scheduledDate: z.date().optional(),
  startTime: z.string().optional(),
  locationImages: z.array(z.instanceof(File))
    .max(3, "Maximum 3 images allowed")
    .optional()
    .refine((files) => !files || files.every(file => file.size <= 5 * 1024 * 1024), {
      message: "Each image must be smaller than 5MB"
    })
    .refine((files) => !files || files.every(file => 
      ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)
    ), {
      message: "Only JPEG, PNG, and WebP images are allowed"
    }),
}).refine((data) => {
  // If scheduled, require date and time
  if (data.isScheduled) {
    if (!data.scheduledDate) return false;
    if (!data.startTime) return false;
    
    // Check if scheduled date is in the future
    const now = new Date();
    const scheduledDateTime = new Date(data.scheduledDate);
    const [hours, minutes] = data.startTime.split(':').map(Number);
    scheduledDateTime.setHours(hours, minutes, 0, 0);
    
    if (scheduledDateTime <= now) return false;
  }
  return true;
}, {
  message: "Scheduled sessions must have a future date and time",
  path: ["scheduledDate"]
});

type HostSessionFormData = z.infer<typeof hostSessionSchema>;

// Common Laurier courses - this would normally come from an API
const COURSES = [
  "AC111", "AC120", "AC210", "AC220", "AC310", "AC320", "AC415", "AC430",
  "BU111", "BU121", "BU127", "BU201", "BU231", "BU247", "BU352", "BU354", "BU362", "BU375", "BU385", "BU398", "BU453", "BU481", "BU491",
  "CP102", "CP104", "CP164", "CP213", "CP216", "CP264", "CP312", "CP313", "CP315", "CP316", "CP317", "CP363", "CP372", "CP373", "CP400", "CP411", "CP414", "CP423", "CP460", "CP468", "CP476", "CP493",
  "DATA205", "DATA206", "DATA301", "DATA302", "DATA401", "DATA402",
  "EC120", "EC140", "EC201", "EC205", "EC206", "EC225", "EC238", "EC255", "EC280", "EC285", "EC301", "EC302", "EC327", "EC336", "EC349", "EC375", "EC395", "EC401", "EC421", "EC435", "EC455",
  "EN101", "EN110", "EN111", "EN155", "EN206", "EN208", "EN209", "EN210", "EN211", "EN238", "EN255", "EN256", "EN270", "EN280", "EN285", "EN301", "EN315", "EN317", "EN325", "EN355", "EN375", "EN380", "EN390",
  "FI270", "FI301", "FI302", "FI310", "FI320", "FI401", "FI402", "FI475", "FI495",
  "HI109", "HI110", "HI115", "HI129", "HI201", "HI206", "HI220", "HI226", "HI235", "HI240", "HI245", "HI250", "HI301", "HI315", "HI320", "HI335", "HI345", "HI375", "HI380", "HI395",
  "MA103", "MA104", "MA110", "MA122", "MA129", "MA201", "MA205", "MA238", "MA240", "MA260", "MA270", "MA303", "MA304", "MA310", "MA320", "MA333", "MA340", "MA355", "MA370", "MA371", "MA375", "MA395", "MA401", "MA420", "MA440", "MA475",
  "MK210", "MK301", "MK302", "MK320", "MK401", "MK410", "MK415", "MK420", "MK475", "MK490",
  "PC131", "PC132", "PC141", "PC142", "PC210", "PC231", "PC232", "PC241", "PC242", "PC270", "PC275", "PC310", "PC320", "PC331", "PC335", "PC341", "PC342", "PC370", "PC375", "PC410", "PC420", "PC441", "PC470", "PC475",
  "PS101", "PS102", "PS201", "PS205", "PS210", "PS220", "PS240", "PS261", "PS270", "PS280", "PS290", "PS301", "PS305", "PS310", "PS315", "PS320", "PS325", "PS340", "PS345", "PS350", "PS355", "PS365", "PS370", "PS375", "PS380", "PS385", "PS390", "PS395", "PS401", "PS410", "PS415", "PS420", "PS425", "PS430", "PS435", "PS440", "PS445", "PS450", "PS455", "PS460", "PS465", "PS470", "PS475", "PS480", "PS485", "PS490", "PS495",
  "STAT231", "STAT260", "STAT330", "STAT331", "STAT337", "STAT340", "STAT350", "STAT355", "STAT430", "STAT431", "STAT437", "STAT455", "STAT475"
];

// Wilfrid Laurier University buildings and locations
const BUILDINGS = [
  "Aird Centre", "Arts Building", "Athletic Complex", "Balsillie School",
  "Bricker Academic Building", "Central Teaching Building", "Clara Conrad Hall",
  "Concourse Building", "Conrad Hall", "Dr. Alvin Woods Building",
  "Euler Hall", "Faculty of Music Building", "Frank C. Peters Building",
  "Graduate Student Centre", "Hazel McCallion Academic Learning Centre",
  "John Aird Centre", "King Street Residence", "Lazaridis Hall",
  "Library", "Little House Residence", "MacDonald House Residence",
  "Memorial Hall", "Paul Martin Centre", "Peters Building",
  "Residence Commons", "Science Building", "Seminary Building",
  "Student Services Building", "Turret Building", "University Stadium",
  "Waterloo Lutheran Seminary", "Willison Hall", "Woods Building"
];

const AREAS = [
  "Quiet Zone",
  "Group Area",
  "Computer Lab",
  "Study Rooms"
];

export function Host() {
  const [, setLocation] = useLocation();
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdSession, setCreatedSession] = useState<any>(null);
  const { addSession } = useStore();
  const { toast } = useToast();

  const form = useForm<HostSessionFormData>({
    resolver: zodResolver(hostSessionSchema),
    defaultValues: {
      courseCode: [],
      building: [],
      floor: "",
      area: "",
      capacity: "",
      duration: "",
      notes: "",
      public: true,
      isScheduled: false,
      scheduledDate: undefined,
      startTime: "",
      locationImages: [],
    },
  });

  const onSubmit = async (data: HostSessionFormData) => {
    try {
      // Upload images first if any are provided
      let locationImageUrls: string[] = [];
      if (data.locationImages && data.locationImages.length > 0) {
        try {
          locationImageUrls = await uploadLocationImages(data.locationImages);
        } catch (imageError) {
          toast({
            title: "Image upload failed",
            description: "Session will be created without images. You can add them later.",
            variant: "destructive",
          });
        }
      }

      const sessionData: CreateSessionData = {
        courseCode: data.courseCode[0] || "", // Take first course for now
        building: data.building[0] || "", // Take first building for now  
        floor: data.floor,
        area: data.area,
        capacity: parseInt(data.capacity),
        duration: parseInt(data.duration),
        notes: data.notes,
        public: data.public,
        locationImages: locationImageUrls,
        isScheduled: data.isScheduled,
        scheduledDate: data.scheduledDate,
        startTime: data.startTime,
      };

      const sessionId = await addSession(sessionData);
      
      // Create a session object for display
      const createdSessionForDisplay = {
        id: sessionId,
        ...sessionData,
        attendeeCount: 1,
        endsAt: `in ${sessionData.duration}m`,
        host: { name: "You", initials: "YU" }
      };
      
      setCreatedSession(createdSessionForDisplay);
      setShowSuccess(true);
      toast({
        title: "Session created!",
        description: "Your study session is now live and visible to other students.",
      });
    } catch (error) {
      toast({
        title: "Error creating session",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  if (showSuccess && createdSession) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card data-testid="success-state">
            <CardContent className="pt-8">
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Session Created!
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Your study session is now live and visible to other students.
                  </p>
                </div>

                {/* Session Preview */}
                <div className="bg-muted rounded-lg p-4 text-left">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-sm font-medium">
                        {createdSession.courseCode}
                      </span>
                      <span className="bg-card text-foreground px-2 py-1 rounded text-sm border">
                        {createdSession.building} Floor {createdSession.floor}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Capacity: {createdSession.attendeeCount}/{createdSession.capacity}
                    </p>
                    {createdSession.notes && (
                      <p className="text-sm text-muted-foreground italic">
                        "{createdSession.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <Button 
                  onClick={() => setLocation("/app")}
                  className="bg-primary text-primary-foreground hover:opacity-90"
                  data-testid="button-go-to-sessions"
                >
                  Go to Sessions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Host a Study Session</h1>
          <p className="text-muted-foreground">Create a new study group for your course</p>
        </div>

        <Card data-testid="host-form">
          <CardContent className="pt-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="courseCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Code *</FormLabel>
                        <FormControl>
                          <DynamicTileInput
                            value={field.value}
                            onChange={field.onChange}
                            suggestions={COURSES}
                            placeholder="Type course code (e.g., BU111, CP102)..."
                            maxItems={3}
                            data-testid="input-host-course"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="building"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Building *</FormLabel>
                        <FormControl>
                          <DynamicTileInput
                            value={field.value}
                            onChange={field.onChange}
                            suggestions={BUILDINGS}
                            placeholder="Type building name (e.g., Library, Lazaridis)..."
                            maxItems={2}
                            data-testid="input-host-building"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="floor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Floor *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-host-floor">
                              <SelectValue placeholder="Select floor..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {["1", "2", "3", "4", "5"].map((floor) => (
                              <SelectItem key={floor} value={floor}>
                                Floor {floor}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="area"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Area (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-host-area">
                              <SelectValue placeholder="Select area..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {AREAS.map((area) => (
                              <SelectItem key={area} value={area}>
                                {area}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacity *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-host-capacity">
                              <SelectValue placeholder="Select capacity..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[2, 3, 4, 5, 6, 7, 8].map((capacity) => (
                              <SelectItem key={capacity} value={capacity.toString()}>
                                {capacity} people
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-host-duration">
                              <SelectValue placeholder="Select duration..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="60">60 minutes</SelectItem>
                            <SelectItem value="90">90 minutes</SelectItem>
                            <SelectItem value="120">120 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Scheduling Options */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="isScheduled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-schedule-later"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Schedule for later</FormLabel>
                          <p className="text-xs text-muted-foreground">
                            Choose a specific date and time for your study session
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  {form.watch("isScheduled") && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                      <FormField
                        control={form.control}
                        name="scheduledDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date *</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                    data-testid="button-select-date"
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date < new Date() || date < new Date("1900-01-01")
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="startTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Time *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type="time"
                                  {...field}
                                  className="w-full"
                                  data-testid="input-start-time"
                                />
                                <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="e.g., Case prep, quiet please..."
                          className="resize-none"
                          rows={3}
                          maxLength={100}
                          data-testid="textarea-host-notes"
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        {field.value?.length || 0}/100 characters
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Location Images Upload */}
                <FormField
                  control={form.control}
                  name="locationImages"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location Photos (Optional)</FormLabel>
                      <FormControl>
                        <ImageUpload
                          images={field.value || []}
                          onChange={field.onChange}
                          maxImages={3}
                          maxSizeMB={5}
                          data-testid="input-location-images"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="public"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-host-public"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Make this session public</FormLabel>
                        <p className="text-xs text-muted-foreground">
                          Public sessions are visible to all students
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    className="flex-1 bg-primary text-primary-foreground hover:opacity-90"
                    data-testid="button-create-session"
                  >
                    Create Session
                  </Button>
                  <Link href="/app">
                    <Button 
                      type="button" 
                      variant="outline"
                      data-testid="button-cancel-host"
                    >
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
