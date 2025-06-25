import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NumberInput } from "@/components/ui/NumberInput";
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
            <NumberInput
              value={parseFloat(gbaValue) || 0}
              onChange={(value) => {
                setGbaValue(value.toString());
                handleInputChange("gba", value);
              }}
              placeholder="Enter GBA"
              allowDecimals={true}
              showCommas={true}
              suffix=" sqft"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Stories</label>
            <NumberInput
              value={parseInt(storiesValue) || 0}
              onChange={(value) => {
                setStoriesValue(value.toString());
                handleInputChange("stories", value);
              }}
              placeholder="Enter stories"
              allowDecimals={false}
              showCommas={false}
              min={1}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Project Length (months)</label>
            <NumberInput
              value={parseInt(projectLengthValue) || 0}
              onChange={(value) => {
                setProjectLengthValue(value.toString());
                handleInputChange("projectLength", value);
              }}
              placeholder="Enter months"
              allowDecimals={false}
              showCommas={false}
              min={1}
              suffix=" months"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Absorption Period (months)</label>
            <NumberInput
              value={parseInt(absorptionPeriodValue) || 0}
              onChange={(value) => {
                setAbsorptionPeriodValue(value.toString());
                handleInputChange("absorptionPeriod", value);
              }}
              placeholder="Enter months"
              allowDecimals={false}
              showCommas={false}
              min={1}
              suffix=" months"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 