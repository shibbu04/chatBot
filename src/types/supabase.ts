export interface Database {
    public: {
      Tables: {
        messages: {
          Row: {
            id: string;
            text: string;
            isBot: boolean;
            created_at: string;
          };
          Insert: {
            id?: string;
            text: string;
            isBot: boolean;
            created_at?: string;
          };
          Update: {
            id?: string;
            text?: string;
            isBot?: boolean;
            created_at?: string;
          };
        };
      };
    };
  }