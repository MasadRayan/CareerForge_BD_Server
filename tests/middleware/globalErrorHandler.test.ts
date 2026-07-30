import multer from "multer";
import AppError from "../../src/utils/AppError.js";
import globalHandler from "../../src/middleware/globalErrorHandler.js";

const createRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const trigger = (err: unknown) => {
  const req = {} as any;
  const res = createRes();
  const next = jest.fn();
  globalHandler(err, req, res, next);
  return { res, next };
};

const expectedJson = (success: boolean, message: string) => ({
  success,
  message,
});

describe("globalErrorHandler", () => {
  it("returns 400 for AppError with statusCode 400", () => {
    const { res } = trigger(new AppError("Bad request", 400));
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expectedJson(false, "Bad request"),
    );
  });

  it("returns 404 for AppError with statusCode 404", () => {
    const { res } = trigger(new AppError("Not found", 404));
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expectedJson(false, "Not found"),
    );
  });

  it("returns 429 for AppError with statusCode 429", () => {
    const { res } = trigger(new AppError("Too many requests", 429));
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith(
      expectedJson(false, "Too many requests"),
    );
  });

  it("returns 400 for multer LIMIT_FILE_SIZE error", () => {
    const { res } = trigger(new multer.MulterError("LIMIT_FILE_SIZE"));
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expectedJson(false, "File too large. Maximum size is 5MB."),
    );
  });

  it("returns 400 for multer error with other code", () => {
    const { res } = trigger(new multer.MulterError("LIMIT_UNEXPECTED_FILE"));
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expectedJson(false, "Unexpected field"),
    );
  });

  it("returns 500 for regular Error", () => {
    const { res } = trigger(new Error("Something went wrong"));
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expectedJson(false, "Something went wrong"),
    );
  });

  it("returns 500 with Internal Server Error for a thrown string", () => {
    const { res } = trigger("string error");
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expectedJson(false, "Internal Server Error"),
    );
  });

  it("returns 500 with Internal Server Error for null thrown", () => {
    const { res } = trigger(null);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expectedJson(false, "Internal Server Error"),
    );
  });
});
