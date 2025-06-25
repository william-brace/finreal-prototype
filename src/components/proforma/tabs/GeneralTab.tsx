import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React from "react";

interface Props {
  gbaValue: string;
  setGbaValue: (v: string) => void;
  storiesValue: string;
  setStoriesValue: (v: string) => void;
  projectLengthValue: string;
  setProjectLengthValue: (v: string) => void;
  absorptionPeriodValue: string;
  setAbsorptionPeriodValue: (v: string) => void;
  proformaTypeValue: string;
  setProformaTypeValue: (v: string) => void;
  handleInputChange: (field: string, value: number | string) => void;
}

//test comment

export function GeneralTab({
  gbaValue,
  setGbaValue,
  storiesValue,
  setStoriesValue,
  projectLengthValue,
  setProjectLengthValue,
  absorptionPeriodValue,
  setAbsorptionPeriodValue,
  proformaTypeValue,
  setProformaTypeValue,
  handleInputChange,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>General Information</CardTitle>
            <CardDescription>Salient project details</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Proforma Type</label>
            <Select 
              value={proformaTypeValue} 
              onValueChange={(value) => {
                setProformaTypeValue(value);
                handleInputChange("proformaType", value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select proforma type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="condo">Condo</SelectItem>
                <SelectItem value="purpose-built-rental">Purpose Built Rental</SelectItem>
                <SelectItem value="land-development">Land Development</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">GBA (sqft)</label>
            <Input
              type="number"
              step="any"
              value={gbaValue}
              onChange={(e) => setGbaValue(e.target.value)}
              onBlur={() => handleInputChange("gba", parseFloat(gbaValue) || 0)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Stories</label>
            <Input
              type="number"
              value={storiesValue}
              onChange={(e) => setStoriesValue(e.target.value)}
              onBlur={() => handleInputChange("stories", parseInt(storiesValue) || 0)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Project Length (months)</label>
            <Input
              type="number"
              value={projectLengthValue}
              onChange={(e) => setProjectLengthValue(e.target.value)}
              onBlur={() => handleInputChange("projectLength", parseInt(projectLengthValue) || 0)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Absorption Period (months)</label>
            <Input
              type="number"
              value={absorptionPeriodValue}
              onChange={(e) => setAbsorptionPeriodValue(e.target.value)}
              onBlur={() => handleInputChange("absorptionPeriod", parseInt(absorptionPeriodValue) || 0)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 