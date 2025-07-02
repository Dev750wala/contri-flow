export interface ControllerReturnType {
  statusCode: number;
  success: boolean;
  message: string;
  error?: unknown;
  data?: unknown;
}
