import { DocumentParser } from "../../types/parser";

import { GeminiService } from "../GeminiService";

import { PdfParser } from "./PdfParser";
import { ImageParser } from "./ImageParser";

export class ParserFactory {

    static getParser(
        mimeType: string,
        gemini: GeminiService
    ): DocumentParser {

        switch (mimeType) {

            case "application/pdf":
                return new PdfParser();

            case "image/png":
            case "image/jpeg":
            case "image/jpg":
            case "image/webp":
                return new ImageParser(gemini);

            default:
                throw new Error(
                    `Unsupported file type: ${mimeType}`
                );

        }

    }

}