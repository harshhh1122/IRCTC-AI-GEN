export type TicketIntent = "EMERGENCY_TATKAL" | "LEISURE_PLAN" | "CORPORATE_TRANSIT" | "GENERAL_BOOKING";

export interface TrainOption {
  trainName: string;
  trainNo: string;
  depTime: string;
  arrTime: string;
  probability: string;
  fare: number;
  reasoning: string;
}

export interface IRCTCResponse {
  replyMessage: string;
  hasActionablePlan: boolean;
  intent: TicketIntent;
  origin: string;
  destination: string;
  quota: string;
  trainName: string;
  trainNo: string;
  depTime: string;
  arrTime: string;
  probability: string;
  reasoning: string;
  selectedClass?: string;
  selectedBerth?: string;
  travelDate?: string;
  trainOptions?: TrainOption[];
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai" | "system";
  text: string;
  timestamp: string;
}
