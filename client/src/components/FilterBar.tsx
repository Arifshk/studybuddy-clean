import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";

export interface FilterState {
  courseCode: string;
  building: string;
  floor: string;
  publicOnly: boolean;
}

interface FilterBarProps {
  onFilterChange: (filters: FilterState) => void;
  className?: string;
}

const COURSES = [
  { code: "BU111", name: "BU111 - Intro to Business" },
  { code: "CP102", name: "CP102 - Computer Programming" },
  { code: "EC120", name: "EC120 - Intro to Economics" },
  { code: "MA103", name: "MA103 - Calculus I" },
  { code: "DATA205", name: "DATA205 - Data Analytics" },
  { code: "STAT231", name: "STAT231 - Statistics" },
  { code: "PS101", name: "PS101 - Introduction to Psychology" },
];

const BUILDINGS = [
  "Library",
  "Lazaridis Hall", 
  "Peters",
  "Science",
  "Arts",
  "Athletic Complex"
];

const FLOORS = ["1", "2", "3", "4", "5"];

export function FilterBar({ onFilterChange, className }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterState>({
    courseCode: "all",
    building: "all", 
    floor: "all",
    publicOnly: true
  });

  const handleFilterChange = (key: keyof FilterState, value: string | boolean) => {
    // Convert "all" back to empty string for filtering logic
    const filterValue = typeof value === 'string' && value === 'all' ? '' : value;
    const newFilters = { ...filters, [key]: filterValue };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <Card className={`p-6 ${className}`} data-testid="filter-bar">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="course-filter">Course</Label>
          <Select
            value={filters.courseCode}
            onValueChange={(value) => handleFilterChange("courseCode", value)}
          >
            <SelectTrigger data-testid="select-course">
              <SelectValue placeholder="All Courses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {COURSES.map((course) => (
                <SelectItem key={course.code} value={course.code}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="building-filter">Building</Label>
          <Select
            value={filters.building}
            onValueChange={(value) => handleFilterChange("building", value)}
          >
            <SelectTrigger data-testid="select-building">
              <SelectValue placeholder="All Buildings" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Buildings</SelectItem>
              {BUILDINGS.map((building) => (
                <SelectItem key={building} value={building}>
                  {building}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="floor-filter">Floor</Label>
          <Select
            value={filters.floor}
            onValueChange={(value) => handleFilterChange("floor", value)}
          >
            <SelectTrigger data-testid="select-floor">
              <SelectValue placeholder="All Floors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Floors</SelectItem>
              {FLOORS.map((floor) => (
                <SelectItem key={floor} value={floor}>
                  Floor {floor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="public-filter"
              checked={filters.publicOnly}
              onCheckedChange={(checked) => handleFilterChange("publicOnly", checked as boolean)}
              data-testid="checkbox-public-only"
            />
            <Label htmlFor="public-filter" className="text-sm font-medium">
              Public only
            </Label>
          </div>
        </div>
      </div>
    </Card>
  );
}
