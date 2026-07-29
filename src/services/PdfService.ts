import { extractText } from "unpdf";
import { PdfPage } from "../types/pdf";

export class PdfService {
  async extractPages(buffer: ArrayBuffer): Promise<PdfPage[]> {
    const result = await extractText(new Uint8Array(buffer));

    return result.text.map((pageText, index) => ({
      pageNumber: index + 1,
      text: pageText.trim(),
    }));
  }
}