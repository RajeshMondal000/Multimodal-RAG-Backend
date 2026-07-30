import { DocumentParser } from "../../types/parser";

import { GeminiService } from "../GeminiService";

import { PdfParser } from "./PdfParser";
import { ImageParser } from "./ImageParser";
import { DocxParser } from "./DocxParser";
import { TxtParser } from "./TxtParser";
import { CsvParser } from "./CsvParser";
import { ExcelParser } from "./ExcelParser";
import { MarkdownParser } from "./MarkdownParser";
import { HtmlParser } from "./HtmlParser";

type ParserCreator = (
    gemini: GeminiService
) => DocumentParser;

export class ParserFactory {

    static detectType(file: File): string {

        if (
            file.type &&
            file.type !== "application/octet-stream"
        ) {
            return file.type;
        }

        const name = file.name.toLowerCase();

        if (name.endsWith(".pdf")) {
            return "application/pdf";
        }

        if (name.endsWith(".docx")) {
            return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        }

        if (name.endsWith(".csv")) {
            return "text/csv";
        }

        if (name.endsWith(".txt")) {
            return "text/plain";
        }

        if (name.endsWith(".md")) {
            return "text/markdown";
        }

        if (name.endsWith(".html") || name.endsWith(".htm")) {
            return "text/html";
        }

        if (name.endsWith(".xlsx")) {
            return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        }

        if (name.endsWith(".png")) {
            return "image/png";
        }

        if (name.endsWith(".jpg") || name.endsWith(".jpeg")) {
            return "image/jpeg";
        }

        if (name.endsWith(".webp")) {
            return "image/webp";
        }

        return file.type;
    }
    private static readonly registry =
        new Map<string, ParserCreator>();

    private static readonly imageTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
    ];

    static {

        // PDF
        this.registry.set(
            "application/pdf",
            () => new PdfParser()
        );

        // Images
        for (const type of this.imageTypes) {
            this.registry.set(
                type,
                (gemini) => new ImageParser(gemini)
            );
        }

        // DOCX
        this.registry.set(
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            () => new DocxParser()
        );

        //CSV
        this.registry.set(
            "text/csv",
            (gemini) => new CsvParser()
        );

        //TXT
        this.registry.set(
            "text/plain",
            (gemini) => new TxtParser()
        );

        //XSLX
        this.registry.set(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            (gemini) => new ExcelParser()
        );

        //Markdown
        this.registry.set(
            "text/markdown",
            (gemini) => new MarkdownParser()
        );

        //HTML
        this.registry.set(
            "text/html",
            (gemini) => new HtmlParser()
        );
    }

    static getParser(
        mimeType: string,
        gemini: GeminiService
    ): DocumentParser {

        const creator = this.registry.get(mimeType);

        if (!creator) {
            throw new Error(
                `Unsupported file type: ${mimeType}`
            );
        }

        return creator(gemini);
    }

    static supports(mimeType: string): boolean {
        return this.registry.has(mimeType);
    }

    static supportedTypes(): string[] {
        return [...this.registry.keys()];
    }

}