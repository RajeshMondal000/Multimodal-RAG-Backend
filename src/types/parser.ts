export interface ParsedPage {
    pageNumber: number;
    title?: string;
    text: string;
}

export interface DocumentParser {
    parse(file: File): Promise<ParsedPage[]>;
}