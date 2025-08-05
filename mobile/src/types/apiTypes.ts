export type DetectionItem = {
    id: string;
    label: string;
    time: string;
    thumbnail: string;
    confidence: number;
    riskLevel: string;
    location: string;
    objectCount: number;
  };
  
  export type AlertItem = {
    id: string;
    type: string;
    time: string;
    detectionId: string;
    severity: string;
  };