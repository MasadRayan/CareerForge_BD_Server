/// <reference types="node" />
/// <reference types="node" />
import { v2 as cloudinary } from "cloudinary";
export declare const uploadCVBuffer: (buffer: Buffer, publicId: string) => Promise<string>;
export declare const deleteCVFile: (publicId: string) => Promise<void>;
export declare const publicIdFromUrl: (url: string) => string | null;
export { cloudinary };
//# sourceMappingURL=cloudinary.d.ts.map