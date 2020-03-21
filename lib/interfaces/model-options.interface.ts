export type ModelOptions = {
  create?: boolean;
  throughput?:
    | {
        read?: number;
        write?: number;
      }
    | number
    | string;
  prefix?: string;
  suffix?: string;
  waitForActive?: {
    enabled?: boolean;
    check?: {
      timeout?: number;
      frequency?: number;
    };
  };
  update?: boolean;
  expires?:
    | {
        ttl?: number;
        attribute?: string;
        items?: {
          returnExpired?: boolean;
        };
      }
    | number;
};
