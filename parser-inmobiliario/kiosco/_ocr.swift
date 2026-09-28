import Foundation
import Vision
import AppKit

// Uso: _ocr <imagen>
// Salida TSV: x \t y \t w \t h \t texto   (coordenadas normalizadas, y desde arriba)

let args = CommandLine.arguments
guard args.count > 1 else {
    FileHandle.standardError.write("uso: _ocr <imagen>\n".data(using: .utf8)!)
    exit(2)
}
guard let image = NSImage(contentsOfFile: args[1]),
      let cg = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
    FileHandle.standardError.write("no se pudo cargar la imagen\n".data(using: .utf8)!)
    exit(1)
}

let request = VNRecognizeTextRequest()
request.recognitionLevel = .accurate
request.usesLanguageCorrection = true
request.recognitionLanguages = ["es-ES", "es-AR", "en-US"]

let handler = VNImageRequestHandler(cgImage: cg, options: [:])
do {
    try handler.perform([request])
} catch {
    FileHandle.standardError.write("error OCR: \(error)\n".data(using: .utf8)!)
    exit(1)
}

guard let observations = request.results else { exit(0) }
for obs in observations {
    guard let candidate = obs.topCandidates(1).first else { continue }
    let b = obs.boundingBox
    let yTop = 1.0 - b.origin.y - b.size.height
    print(String(format: "%.4f\t%.4f\t%.4f\t%.4f\t%@", b.origin.x, yTop, b.size.width, b.size.height, candidate.string))
}
