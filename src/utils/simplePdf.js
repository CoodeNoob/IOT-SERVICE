function pdfEscape(text) {
    return String(text)
        .replace(/\\/g, '\\\\')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)');
}

function buildSimplePdfFromLines(lines) {
    const pageWidth = 612;
    const pageHeight = 792;
    const marginLeft = 72;
    const marginTop = 72;
    const fontSize = 12;
    const lineHeight = 14;

    let y = pageHeight - marginTop;
    let content = `BT\n/F1 ${fontSize} Tf\n`;

    for (const line of lines) {
        if (y < marginTop) break;
        const escaped = pdfEscape(line);
        content += `1 0 0 1 ${marginLeft} ${y} Tm (${escaped}) Tj\n`;
        y -= lineHeight;
    }

    content += 'ET\n';

    const objects = [];
    objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
    objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
    objects.push(
        `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] ` +
        `/Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`
    );
    objects.push('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n');
    objects.push(
        `5 0 obj\n<< /Length ${Buffer.byteLength(content, 'utf8')} >>\nstream\n${content}endstream\nendobj\n`
    );

    let pdf = '%PDF-1.4\n';
    const offsets = [0];

    for (const obj of objects) {
        offsets.push(Buffer.byteLength(pdf, 'utf8'));
        pdf += obj;
    }

    const startXref = Buffer.byteLength(pdf, 'utf8');
    const size = objects.length + 1;

    pdf += `xref\n0 ${size}\n`;
    pdf += '0000000000 65535 f \n';

    for (let i = 1; i < offsets.length; i++) {
        const off = String(offsets[i]).padStart(10, '0');
        pdf += `${off} 00000 n \n`;
    }

    pdf += `trailer\n<< /Size ${size} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;

    return Buffer.from(pdf, 'utf8');
}

module.exports = {
    buildSimplePdfFromLines
};

