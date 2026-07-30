import { mockPrisma, resetPrismaMocks } from "../__mocks__/prisma";

jest.mock("../../src/lib/prisma", () => ({
  prisma: mockPrisma,
}));
jest.mock("../../src/lib/cv.parser", () => ({
  parseCVText: jest.fn(),
}));
jest.mock("../../src/config/cloudinary", () => ({
  uploadCVBuffer: jest.fn(),
  deleteCVFile: jest.fn(),
  publicIdFromUrl: jest.fn(),
}));

import { cvService } from "../../src/module/cv/cv.service";

const { parseCVText } = jest.requireMock("../../src/lib/cv.parser");
const { uploadCVBuffer, deleteCVFile, publicIdFromUrl } = jest.requireMock("../../src/config/cloudinary");

const mockFile = {
  buffer: Buffer.from("test"),
  mimetype: "application/pdf",
  originalname: "test.pdf",
};

const mockCreatedCV = {
  id: "cv-1",
  user_id: "user-1",
  version_number: 1,
  file_url: "",
  raw_text: "Parsed CV text",
  uploaded_at: new Date("2025-01-01"),
};

const mockUpdatedCV = {
  ...mockCreatedCV,
  file_url: "https://cloudinary.com/test.pdf",
};

const mockCVList = [
  {
    id: "cv-1",
    version_number: 1,
    file_url: "https://cloudinary.com/test.pdf",
    uploaded_at: new Date("2025-01-01"),
  },
];

const mockSingleCV = {
  id: "cv-1",
  user_id: "user-1",
  version_number: 1,
  file_url: "https://cloudinary.com/test.pdf",
  raw_text: "Parsed CV text",
  uploaded_at: new Date("2025-01-01"),
};

describe("cvService.createCVInDB", () => {
  beforeEach(() => {
    resetPrismaMocks();
    parseCVText.mockReset();
    uploadCVBuffer.mockReset();
  });

  it("creates a CV with file upload and prunes old versions", async () => {
    parseCVText.mockResolvedValue("Parsed CV text");
    mockPrisma.cVs.findFirst.mockResolvedValue(null);
    mockPrisma.cVs.create.mockResolvedValue(mockCreatedCV);
    uploadCVBuffer.mockResolvedValue("https://cloudinary.com/test.pdf");
    mockPrisma.cVs.update.mockResolvedValue(mockUpdatedCV);
    mockPrisma.cVs.findMany.mockResolvedValue([mockUpdatedCV]);

    const result = await cvService.createCVInDB("user-1", mockFile);

    expect(parseCVText).toHaveBeenCalledWith(mockFile.buffer, mockFile.mimetype);
    expect(mockPrisma.cVs.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { user_id: "user-1" },
        orderBy: { version_number: "desc" },
        select: { version_number: true },
      }),
    );
    expect(mockPrisma.cVs.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          user_id: "user-1",
          version_number: 1,
          file_url: "",
          raw_text: "Parsed CV text",
        }),
      }),
    );
    expect(uploadCVBuffer).toHaveBeenCalledWith(mockFile.buffer, "cvs/user-1/cv-1");
    expect(mockPrisma.cVs.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "cv-1" },
        data: { file_url: "https://cloudinary.com/test.pdf" },
      }),
    );
    expect(mockPrisma.cVs.findMany).toHaveBeenCalled();
    expect(result.file_url).toBe("https://cloudinary.com/test.pdf");
  });

  it("throws 502 when cloudinary upload fails and rolls back the DB row", async () => {
    parseCVText.mockResolvedValue("Parsed CV text");
    mockPrisma.cVs.findFirst.mockResolvedValue(null);
    mockPrisma.cVs.create.mockResolvedValue(mockCreatedCV);
    uploadCVBuffer.mockRejectedValue(new Error("Upload failed"));
    mockPrisma.cVs.delete.mockResolvedValue({ id: "cv-1" });

    await expect(
      cvService.createCVInDB("user-1", mockFile),
    ).rejects.toThrow("Failed to upload CV file. Please try again.");

    expect(mockPrisma.cVs.delete).toHaveBeenCalledWith({ where: { id: "cv-1" } });
  });
});

describe("cvService.getAllCVsFromDB", () => {
  beforeEach(() => {
    resetPrismaMocks();
    parseCVText.mockReset();
    uploadCVBuffer.mockReset();
    deleteCVFile.mockReset();
    publicIdFromUrl.mockReset();
  });

  it("returns a list of CVs without raw_text", async () => {
    mockPrisma.cVs.findMany.mockResolvedValue(mockCVList);

    const result = await cvService.getAllCVsFromDB("user-1");

    expect(result).toHaveLength(1);
    expect(result[0]).not.toHaveProperty("raw_text");
    expect(mockPrisma.cVs.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { user_id: "user-1" },
        orderBy: { version_number: "desc" },
        select: {
          id: true,
          version_number: true,
          file_url: true,
          uploaded_at: true,
        },
      }),
    );
  });
});

describe("cvService.getASingleCV", () => {
  beforeEach(() => {
    resetPrismaMocks();
    parseCVText.mockReset();
    uploadCVBuffer.mockReset();
    deleteCVFile.mockReset();
    publicIdFromUrl.mockReset();
  });

  it("returns a single CV when found", async () => {
    mockPrisma.cVs.findFirst.mockResolvedValue(mockSingleCV);

    const result = await cvService.getASingleCV("user-1", "cv-1");

    expect(result.id).toBe("cv-1");
    expect(result.raw_text).toBe("Parsed CV text");
    expect(mockPrisma.cVs.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "cv-1", user_id: "user-1" },
      }),
    );
  });

  it("throws 404 when CV is not found", async () => {
    mockPrisma.cVs.findFirst.mockResolvedValue(null);

    await expect(
      cvService.getASingleCV("user-1", "nonexistent"),
    ).rejects.toThrow("CV not found");
  });
});

describe("cvService.deleteCVFromDB", () => {
  beforeEach(() => {
    resetPrismaMocks();
    parseCVText.mockReset();
    uploadCVBuffer.mockReset();
    deleteCVFile.mockReset();
    publicIdFromUrl.mockReset();
  });

  it("deletes a CV and its cloudinary file", async () => {
    mockPrisma.cVs.findFirst.mockResolvedValue(mockSingleCV);
    publicIdFromUrl.mockReturnValue("public-id-123");
    deleteCVFile.mockResolvedValue(undefined);
    mockPrisma.cVs.delete.mockResolvedValue({ id: "cv-1" });

    await cvService.deleteCVFromDB("user-1", "cv-1");

    expect(publicIdFromUrl).toHaveBeenCalledWith(mockSingleCV.file_url);
    expect(deleteCVFile).toHaveBeenCalledWith("public-id-123");
    expect(mockPrisma.cVs.delete).toHaveBeenCalledWith({ where: { id: "cv-1" } });
  });

  it("throws 404 when CV to delete is not found", async () => {
    mockPrisma.cVs.findFirst.mockResolvedValue(null);

    await expect(
      cvService.deleteCVFromDB("user-1", "nonexistent"),
    ).rejects.toThrow("CV not found");
  });

  it("still deletes DB row when cloudinary publicId is null", async () => {
    mockPrisma.cVs.findFirst.mockResolvedValue(mockSingleCV);
    publicIdFromUrl.mockReturnValue(null);
    mockPrisma.cVs.delete.mockResolvedValue({ id: "cv-1" });

    await cvService.deleteCVFromDB("user-1", "cv-1");

    expect(publicIdFromUrl).toHaveBeenCalledWith(mockSingleCV.file_url);
    expect(deleteCVFile).not.toHaveBeenCalled();
    expect(mockPrisma.cVs.delete).toHaveBeenCalledWith({ where: { id: "cv-1" } });
  });
});
