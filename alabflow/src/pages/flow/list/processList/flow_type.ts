export interface User {
    user: boolean;
    id: number;
    isActive: boolean;
    email: string;
    name: string;
    surname: string;
    createdAt: string;
  }
  
  // export interface FlowStatus {
  //   id: number;
  //   name: string;
  //   isFinal: boolean;
  //   isDefault: boolean;
  // }

  export interface ClientFlowStatus {
    id: number;
    flowStatus: {
      id: number;
      name: string;
      isEditable: boolean;
    };
  }
  
  
  export interface Item {
    details?: any;
    createdAt: string | number | Date;
    // flowStatus?: FlowStatus | null; // Umożliwienie braku flowStatus
    clientFlowStatuses?: ClientFlowStatus[]; // Nowy typ do obsługi listy statusów
    description: string;
    user: User;
    id: number;
    currentStage: string;
    flow: string;
    rpwdlNip?: string;
    rpwdlName?: string;
    gusNIP?: string;
    gusName?: string;
    name?: string;
    nip?: string;
  }
  
 export interface ApiResponse {
    _meta: {
      page: number;
      pages: number;
      items: number;
      itemsPerPage: number;
    };
    items: EnrichedItem[];
  }
  
  export interface ApplicationDetails {
    id: number;
    name: string;
    description: string;
    currentStage: string;
    stageHistory: string[];
  }

  // Rozszerzasz interfejs Item o te szczegóły
  export interface EnrichedItem extends Item {
    details: ApplicationDetails;
    flowStatus?: string; // Dodaj pole flowStatus jako opcjonalne
  }
  