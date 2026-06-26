import { AppError } from "./AppError";

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden — insufficient permissions") {
    super(message, 403);
  }
}
