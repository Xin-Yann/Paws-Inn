const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs');

async function createReceiptPDF(paymentData) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([400, 1050.89]);
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    page.drawText('Paws Inn', {
        x: 160,
        y: height - 50,
        size: 18,
        font,
        color: rgb(0, 0, 0),
    });

    const addressLine1 = '2-1-13, Medan Rajawali,';
    const addressLine2 = 'SOLARIA RESIDENCES, 11900 Bayan Lepas, Penang';

    page.drawText(addressLine1, {
        x: 133,
        y: height - 86,
        size: 12,
        font,
        color: rgb(0, 0, 0),
    });

    page.drawText(addressLine2, {
        x: 55,
        y: height - 116,
        size: 12,
        font,
        color: rgb(0, 0, 0),
    });


    page.drawLine({
        start: { x: 30, y: height - 150 },
        end: { x: 380, y: height - 150 },
        thickness: 1,
        color: rgb(0, 0, 0),
    });

    page.drawText(`Transaction ID: ${paymentData.transactionId}`, {
        x: 50,
        y: height - 185,
        size: 11,
        font,
        color: rgb(0, 0, 0),
    });

    page.drawText(`Date: ${new Date(paymentData.paymentDate).toISOString().split('T')[0]}`, {
        x: 50,
        y: height - 215,
        size: 11,
        font,
        color: rgb(0, 0, 0),
    });


    page.drawText(`Member Id: ${paymentData.memberDetails.membershipId}`, {
        x: 50,
        y: height - 245,
        size: 11,
        font,
        color: rgb(0, 0, 0),
    });

    page.drawText(`Member Name: ${paymentData.memberDetails.name}`, {
        x: 50,
        y: height - 275,
        size: 11,
        font,
        color: rgb(0, 0, 0),
    });

    page.drawText(`Points: ${paymentData.memberDetails.points}`, {
        x: 50,
        y: height - 305,
        size: 11,
        font,
        color: rgb(0, 0, 0),
    });

    page.drawText(`Redeemed Points: ${paymentData.pointsRedeemed}`, {
        x: 50,
        y: height - 335,
        size: 11,
        font,
        color: rgb(0, 0, 0),
    });

    page.drawText(`Earned Points: ${paymentData.newPoints}`, {
        x: 50,
        y: height - 365,
        size: 11,
        font,
        color: rgb(0, 0, 0),
    });

    page.drawLine({
        start: { x: 30, y: height - 395 },
        end: { x: 380, y: height - 395 },
        thickness: 1,
        color: rgb(0, 0, 0),
    });

    const tableStartY = height - 415;
    page.drawText('Item', {
        x: 50,
        y: tableStartY,
        size: 10,
        font,
        color: rgb(0, 0, 0),
    });

    page.drawText('Qty', {
        x: 180,
        y: tableStartY,
        size: 10,
        font,
        color: rgb(0, 0, 0),
    });

    page.drawText('Price (RM)', {
        x: 230,
        y: tableStartY,
        size: 10,
        font,
        color: rgb(0, 0, 0),
    });

    page.drawText('Amount (RM)', {
        x: 300,
        y: tableStartY,
        size: 10,
        font,
        color: rgb(0, 0, 0),
    });

    page.drawLine({
        start: { x: 30, y: tableStartY - 15 },
        end: { x: 380, y: tableStartY - 15 },
        thickness: 1,
        color: rgb(0, 0, 0),
    });

    let currentY = tableStartY - 40;
    const maxTextWidth = 110; // Max width for product name in points
    const textWrapMargin = 50; // Margin to the right side for text wrapping
    const lineSpacing = 12; // Line height for each line of text

    paymentData.cartItems.forEach(item => {
        const productName = item.name;
        const quantity = item.quantity.toString(); // Convert to string
        const price = item.price.toFixed(2).toString(); // Convert to string
        const amount = (item.price * item.quantity).toFixed(2).toString(); // Convert to string

        const productNameLines = wrapText(productName, maxTextWidth, font, 10);

        // Calculate the number of lines and the maximum row height
        const maxLines = productNameLines.length;
        const rowHeight = maxLines * lineSpacing;
        productNameLines.forEach((line, index) => {
            page.drawText(line, {
                x: 50,
                y: currentY - index * 15,
                size: 10,
                font,
                color: rgb(0, 0, 0),
                maxWidth: maxTextWidth,
            });
        });

        page.drawText(quantity, {
            x: 185,
            y: currentY,
            size: 10,
            font,
            color: rgb(0, 0, 0),
        });

        page.drawText(price, {
            x: 240,
            y: currentY,
            size: 10,
            font,
            color: rgb(0, 0, 0),
        });

        page.drawText(amount, {
            x: 315,
            y: currentY,
            size: 10,
            font,
            color: rgb(0, 0, 0),
        });

        currentY -= Math.max(20, productNameLines.length * 10); // Adjust the space based on the number of lines
        currentY -= rowHeight + 5;
    });

    page.drawLine({
        start: { x: 30, y: currentY },
        end: { x: 380, y: currentY },
        thickness: 1,
        color: rgb(0, 0, 0),
    });

    const spacing = 30; // Spacing between totals

    currentY -= spacing;

    const valueOffset = 340; // X position for values, adjust as needed
    const valueSize = 336;

    // Function to format value for alignment
    function formatValue(value) {
        return value.toFixed(2); // Ensure two decimal places
    }

    // Function to calculate x position for right alignment
    function getRightAlignedX(value) {
        // Use a fixed width font size (6 pixels per character as an approximation)
        return valueOffset - (value.length * 6);
    }

    function getRightAlign(value) {
        // Use a fixed width font size (6 pixels per character as an approximation)
        return valueSize - (value.length * 6);
    }

    page.drawText(`Subtotal:`, {
        x: 50,
        y: currentY,
        size: 11,
        font,
        color: rgb(0, 0, 0),
    });

    page.drawText(formatValue(paymentData.subtotal), {
        x: getRightAlignedX(formatValue(paymentData.subtotal)),
        y: currentY,
        size: 11,
        font,
        color: rgb(0, 0, 0),
    });

    page.drawText(`Sales Tax (10%):`, {
        x: 50,
        y: currentY - 25,
        size: 11,
        font,
        color: rgb(0, 0, 0),
    });

    page.drawText(formatValue(paymentData.salesTax), {
        x: getRightAlignedX(formatValue(paymentData.salesTax)),
        y: currentY - 25,
        size: 11,
        font,
        color: rgb(0, 0, 0),
    });

    page.drawText(`Discount:`, {
        x: 50,
        y: currentY - 50,
        size: 11,
        font,
        color: rgb(0, 0, 0),
    });

    page.drawText(formatValue(paymentData.salesTax), {
        x: getRightAlignedX(formatValue(paymentData.salesTax)),
        y: currentY - 50,
        size: 11,
        font,
        color: rgb(0, 0, 0),
    });

    page.drawText(`Point Discount:`, {
        x: 50,
        y: currentY - 75,
        size: 11,
        font,
        color: rgb(0, 0, 0),
    });

    page.drawText(formatValue(paymentData.totalPrice), {
        x: getRightAlignedX(formatValue(paymentData.totalPrice)),
        y: currentY - 75,
        size: 11,
        font,
        color: rgb(0, 0, 0),
    });

    page.drawLine({
        start: { x: 30, y: currentY - 100 },
        end: { x: 380, y: currentY - 100 },
        thickness: 1,
        color: rgb(0, 0, 0),
    });

    currentY -= spacing;

    page.drawText(`Total Price:`, {
        x: 50,
        y: currentY - 100,
        size: 13,
        font,
        color: rgb(0, 0, 0),
    });

    page.drawText(formatValue(paymentData.change), {
        x: getRightAlign(formatValue(paymentData.change)),
        y: currentY - 100,
        size: 13,
        font,
        color: rgb(0, 0, 0),
    });

    page.drawText(`Cash:`, {
        x: 50,
        y: currentY - 128,
        size: 11,
        font,
        color: rgb(0, 0, 0),
    });

    page.drawText(formatValue(paymentData.totalPrice), {
        x: getRightAlignedX(formatValue(paymentData.totalPrice)),
        y: currentY - 128,
        size: 11,
        font,
        color: rgb(0, 0, 0),
    });

    page.drawText(`Change:`, {
        x: 50,
        y: currentY - 158,
        size: 11,
        font,
        color: rgb(0, 0, 0),
    });

    page.drawText(formatValue(paymentData.totalPrice), {
        x: getRightAlignedX(formatValue(paymentData.totalPrice)),
        y: currentY - 158,
        size: 11,
        font,
        color: rgb(0, 0, 0),
    });

    page.drawLine({
        start: { x: 30, y: currentY - 182 },
        end: { x: 380, y: currentY - 182 },
        thickness: 1,
        color: rgb(0, 0, 0),
    });

    page.drawText(`Note:`, {
        x: 50,
        y: currentY - 205,
        size: 10,
        font,
        color: rgb(0, 0, 0),
    });

    page.drawText(`1. Good sold are non-refundable. `, {
        x: 50,
        y: currentY - 228,
        size: 10,
        font,
        color: rgb(0, 0, 0),
    });

    page.drawText(`2. Strictly no exchange for any product.`, {
        x: 50,
        y: currentY - 248,
        size: 10,
        font,
        color: rgb(0, 0, 0),
    });

    page.drawText(`**This is a computer-generated invoice no signature is required.**`, {
        x: 70,
        y: currentY - 320,
        size: 9,
        font,
        color: rgb(128 / 255, 128 / 255, 128 / 255), // Normalize RGB values

    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes).toString('base64');
}

function wrapText(text, maxWidth, font, fontSize) {
    const words = text.split(' ');
    let lines = [];
    let currentLine = '';

    for (const word of words) {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const width = font.widthOfTextAtSize(testLine, fontSize);
        if (width > maxWidth) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }

    lines.push(currentLine);
    return lines;
}

// Example usage
(async () => {
    const paymentData = {
        transactionId: '1234567890',
        paymentDate: '2024-08-12',
        memberDetails: {
            membershipId: 'MEM123456',
            name: 'John Doe',
            points: 1500,
        },
        cartItems: [
            { barcode: '123456789012', name: 'Dog Food 4lbs', type: 'Dry Food', price: 0.00, quantity: 0 },
            { barcode: '123456789012', name: 'Dog Food 4lbs fewgrhhwshgsgfrbheh', type: 'Dry Food', price: 0.00, quantity: 0 },
            { barcode: '123456789012', name: 'Dog Food 4lbs', type: 'Dry Food', price: 0.00, quantity: 0 },
            { barcode: '123456789012', name: 'Dog Food 4lbs', type: 'Dry Food', price: 0.00, quantity: 0 },
            { barcode: '123456789012', name: 'Dog Food 4lbs', type: 'Dry Food', price: 0.00, quantity: 0 },

        ],
        subtotal: 182.00,
        salesTax: 12.30,
        totalPrice: 13.00,
        change: 133.00,
        redeemedPoints: 13,
        earnedPoints: 0,
    };

    const pdfBase64 = await createReceiptPDF(paymentData);
    fs.writeFileSync('receipt.pdf', Buffer.from(pdfBase64, 'base64'));
    console.log('PDF created and saved as receipt.pdf');
})();
