const ContractModel = require("../models/ContractModel");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment-timezone");
const AuthoRizeModel = require("../models/AuthoRizeModel");
const UserModel = require("../models/UserModel");
moment.tz.setDefault("Asia/Kolkata");
const PDFDocument = require('pdfkit');
const fs = require('fs');
const sendEmail = require("../utils/email/sendEmail");
const path = require("path");


const acceptContract = async (req, res) => {
  try {
    const { contractnumber } = req.body;
    // Search for the contract using the contractNumber
    const contractData = await ContractModel.findOne({ contractNumber: contractnumber });
    if (!contractData) {
      return res.status(404).json({ message: 'Contract not found.' });
    }

    if (contractData.status !== 'none') {
      return res.status(400).json({ message: 'Contract has already been processed.' });
    }
    contractData.status = 'approve';
    await contractData.save();
    const doc = new PDFDocument();
    const initialX = doc.x
    const pdfFilePath = `public/approvedcontracts/contract_${contractData.contractNumber}.pdf`;
    const pdfStream = fs.createWriteStream(pdfFilePath);
    // Assuming contractData.createdAt is a Date object
    const tradeDate = contractData?.createdAt.toISOString().substring(0, 10);
    doc.pipe(pdfStream);
    doc.fontSize(14).text('Trade Confirmation', { align: 'center', underline: true, bold: true });
    doc.moveDown();
    doc.fontSize(11).text(`Contract Number:${contractData?.contractNumber}`, { underline: true, align: 'right' });
    doc.moveDown();
    doc.fontSize(11).text(`Trade Date:${tradeDate}`);
    doc.moveDown();
    doc.text('Seller Represented by Mr ', { continued: true });
    doc.text(contractData?.seller, { underline: true, continued: true });
    doc.text(' hereby agrees to sell and Buyer Represented By Mr ', { underline: false, continued: true });
    doc.text(contractData?.buyer, { underline: true, continued: true });
    doc.text(' agrees to purchase the commodity in accordance with the following terms and conditions', { underline: false });
    const pageWidth = 595; // Width of the page in points (adjust as needed)
    const margin = 50; // Increased margin for both sides
    const boxHeight = 60; // Decreased height for the boxes
    const boxWidth = (pageWidth - margin) / 2.125; // Width for each box

    // Calculate positions for seller and buyer sections with increased margins
    const sellerX = margin; // Add margin to the left side
    const sellerY = doc.y + 10; // Start below the previous content
    const buyerX = sellerX + boxWidth; // No additional margin between boxes

    // Draw the boxes with the updated boxHeight
    doc.rect(sellerX, sellerY, boxWidth, boxHeight).stroke();
    doc.rect(buyerX, sellerY, boxWidth, boxHeight).stroke();

    // Add text for seller and buyer with proper alignment and continuation
    doc.text('Seller Data:', sellerX + 10, sellerY + 10, { continued: true });
    doc.text(contractData?.seller, { continued: true });
    doc.moveDown();

    const buyerTextX = buyerX - 100; // X position for "Buyer Data"
    const buyerTextY = sellerY + 10; // Y position for "Buyer Data"
    doc.text('Buyer Data:', buyerTextX, buyerTextY, { continued: true });
    doc.text(contractData?.buyer, { continued: false });

    // Move down after the boxes and buyer data
    doc.moveDown(4);
    doc.x = initialX
    doc.text('Commodity: ', { bold: true, continued: true })
    doc.text(contractData?.commodity)
    doc.moveDown()
    doc.text('Quality Specifications: As per Attachment A')
    doc.moveDown()
    doc.text('Rebate Schedule: As per Attachment A')
    doc.moveDown()
    doc.text('Volume: ', { bold: true, continued: true })
    doc.text(contractData?.volume + ' ' + contractData?.volumePerIns)
    doc.moveDown()
    doc.text('Incoterm: ', { bold: true, continued: true })
    doc.text(contractData?.incoterm)
    doc.moveDown()
    doc.text('Origin: ', { bold: true, continued: true })
    doc.text(contractData?.origin, { continued: true })
    doc.text(`Destination: ${contractData?.destination}`, { bold: true, continued: false, align: 'center' })
    doc.moveDown()
    doc.text('Delivery Period: ', { continued: true, align: 'left' })
    doc.text(contractData?.deliveryPeriod.toISOString().substring(0, 10), { continued: true })
    doc.text(`Delivery Basis: ${contractData?.deliveryBasis}`, { continued: false, bold: false, align: 'center' })
    doc.moveDown()
    doc.text('Mode of Transport: ', { bold: true, continued: true, align: 'left' })
    doc.text(contractData?.modeOfTransport)
    doc.moveDown()
    doc.text('Price: ', { bold: true, continued: true, })
    doc.text(`Rs.${contractData?.price} per ${contractData?.pricePerIns}`)
    doc.moveDown()
    doc.text('Payment Term: ', { bold: true, continued: true, })
    doc.text(`Within ${contractData?.paymentTerm} after ${contractData?.deliveryBasis}`)
    doc.moveDown()
    doc.text('Free Time: ', { continued: true, align: 'left' })
    doc.text(`${contractData?.freeTime} ${contractData?.freeTimePerIns}`, { continued: true })
    doc.text(`Detention Charges: Rs${contractData?.detentionOrDemurrageCharges} ${contractData?.detentionOrDemurrageChargesPerIns}`, { continued: false, bold: false, align: 'center' })
    doc.moveDown()
    doc.text('Other Terms: ', { bold: true, continued: true, })
    doc.text(` ${contractData?.otherTerms}`)
    doc.moveDown()
    doc.text(`Applicable Trade Rules: This trade Confirmation shall be governed by Arbitrade Rules of Grain Trade dated (NOT DEFINED) ("${contractData?.applicableRules}" read with Amendment dated (NOT DEFINED) to the rules between the parties)`)
    doc.moveDown()
    doc.text(`Dispute Resolution: Arbitration conducted by Arbitrade India (See Rule (NOT DEFINED) of Arbitrade Rules of Grains Trade dated (NOT DEFINED))`)
    doc.moveDown()
    doc.fontSize(8).text(`proposed and digitally signed by `, { align: 'left' })
    doc.text(`Mr.${contractData?.seller} on behalf of`, { align: 'left' })
    doc.text(`M/s (NOT DEFINED) in the capacity of seller`, { align: 'left' })
    const updatedAtDate = new Date(contractData?.updatedAt);

    const hour = updatedAtDate.getHours();
    const minute = updatedAtDate.getMinutes();
    const createdAtDate = new Date(contractData?.createdAt);

    const hour1 = createdAtDate.getHours();
    const minute1 = createdAtDate.getMinutes();
    doc.text(`on ${updatedAtDate.toISOString().substring(0, 10)}at ${hour}:${minute}`, { align: 'left' })
    doc.moveUp(4)
    doc.fontSize(8).text(`proposed and digitally signed by `, { align: 'center' })
    doc.text(`Mr.${contractData?.createdby} on behalf of`, { align: 'center' })
    doc.text(`M/s (NOT DEFINED) in the`, { align: 'center' })
    doc.text(`capacity of broker`, { align: 'center' })
    doc.text(`on ${createdAtDate.toISOString().substring(0, 10)}at ${hour1}:${minute1}`, { align: 'center' })
    doc.moveUp(5)
    doc.fontSize(8).text(`proposed and digitally signed by `, { align: 'right' })
    doc.text(`Mr.${contractData?.buyer} on behalf of`, { align: 'right' })
    doc.text(`M/s (NOT DEFINED) in the capacity of buyer`, { align: 'right' })
    doc.text(`on ${updatedAtDate.toISOString().substring(0, 10)}at ${hour}:${minute}`, { align: 'right' })
    doc.moveDown(4)
    doc.fontSize(11).text(`Contract Number: ${contractData?.contractNumber}`, { bold: true, underline: true, align: 'right' });
    doc.moveDown()
    doc.fontSize(13).text(`Attachment A`, { bold: true, underline: true, align: 'center' });
    doc.moveDown()
    const headers = ['Sr. No', 'Description', 'Parameters', 'Rebate Schedule'];
    const tableRows = [
      ['1', 'Foreign Matter(organic/inorganic matter)', '2% (Max)', 'Discount for 1:1 for above 2% & upto 3%.More than 3% to be rejected'],
      ['2', 'Damaged Kernel(Other than infestation damaged)', '2% (Max)', 'Discount for 1:0:5 for above 2% & upto 4%.More than 4% to be rejected'],
      ['3', 'Shrunken,Shrivelled and broken grains', '4% (Max)', 'Discount for 1:1 for above 4% & upto 6%.More than 6% to be rejected'],
      ['4', 'Infestation Damaged Kernel', '1%', ''],
      ['5', 'Total defects consisting of Sr. No 1,2,3 and 4', '9%(Acceptable upto 13%),', 'Rejected above 13%'],
      ['6', 'Moisture', '11%,', 'Acceptable upto 13%,with rebate 1:1,above 13% to be rejected'],




    ];
    const columnWidths = [50, 180, 150, 145]; // Adjust the values based on your layout
    const rowHeight = 42;

    doc.fontSize(10).font('Helvetica');

    // Draw table headers
    doc.y += 10;
    let startX = 50;
    headers.forEach((header, columnIndex) => {
      doc.rect(startX, doc.y, columnWidths[columnIndex], rowHeight).stroke();
      doc.text(header, startX + 5, doc.y + 5, { width: columnWidths[columnIndex] - 10, align: 'center', bold: true });
      startX += columnWidths[columnIndex];
      doc.moveUp(1.44);
    });

    doc.y += rowHeight;

    // Draw table rows
    tableRows.forEach((row, rowIndex) => {
      startX = 50; // Reset x-coordinate for each row
      row.forEach((cell, columnIndex) => {
        doc.rect(startX, doc.y, columnWidths[columnIndex], rowHeight).stroke();
        const cellY = doc.y
        doc.text(cell, startX + 5, cellY + 5, { width: columnWidths[columnIndex] - 10, align: 'center', bold: true });
        doc.y = cellY
        startX += columnWidths[columnIndex];
      });
      doc.y += rowHeight;
    });
    doc.x = initialX
    doc.moveDown(5)
    doc.fontSize(8).text(`proposed and digitally signed by `, { align: 'left' })
    doc.text(`Mr.${contractData?.seller} on behalf of`, { align: 'left' })
    doc.text(`M/s (NOT DEFINED) in the capacity of seller`, { align: 'left' })
    doc.text(`on ${updatedAtDate.toISOString().substring(0, 10)}at ${hour}:${minute}`, { align: 'left' })
    doc.moveUp(4)
    doc.fontSize(8).text(`proposed and digitally signed by `, { align: 'center' })
    doc.text(`Mr.${contractData?.createdby} on behalf of`, { align: 'center' })
    doc.text(`M/s (NOT DEFINED) in the`, { align: 'center' })
    doc.text(`capacity of broker`, { align: 'center' })
    doc.text(`on ${createdAtDate.toISOString().substring(0, 10)}at ${hour1}:${minute1}`, { align: 'center' })
    doc.moveUp(5)
    doc.fontSize(8).text(`proposed and digitally signed by `, { align: 'right' })
    doc.text(`Mr.${contractData?.buyer} on behalf of`, { align: 'right' })
    doc.text(`M/s (NOT DEFINED) in the capacity of buyer`, { align: 'right' })
    doc.text(`on ${updatedAtDate.toISOString().substring(0, 10)}at ${hour}:${minute}`, { align: 'right' })
    doc.moveDown(4)
    doc.end();

    const shortPdfFileName = path.basename(pdfFilePath, path.extname(pdfFilePath));

    // console.log(`PDF file saved with short name: ${shortPdfFileName}`); pdfStream.on('finish', () => {
    //   console.log(`PDF file saved at: ${pdfFilePath} `);
    // });
    const frontendpdf = `https://arbi-front-five.vercel.app/contract/${contractData?.contractNumber}`
    const usersname = contractData?.createdby
    const volumne = contractData?.volume
    const volumeIns = contractData?.volumePerIns
    const commodity1 = contractData?.commodity
    const price1 = contractData?.price
    const priceperIns = contractData?.pricePerIns
    const seller1 = contractData?.seller
    const buyer1 = contractData?.buyer
    const buyeremail1 = contractData?.buyeremail
    contractData.pdfFile = shortPdfFileName;
    contractData.number = contractData?.contractNumber
    await contractData.save()
    await sendEmail(buyeremail1, "Contract Accpeted", { price1, usersname, volumne, frontendpdf, commodity1, price1, priceperIns, seller1, buyer1 }, "./template/contract.handlebars")

    return res.json({ message: 'Contract accepted successfully.' });
  } catch (error) {
    console.error('Error accepting contract:', error);
    return res.status(500).json({ message: 'An error occurred while accepting the contract.' });
  }
};


const rejectContract = async (req, res) => {
  try {
    const { contractnumber } = req.body;
    // Search for the contract using the contractNumber
    const contractData = await ContractModel.findOne({ contractNumber: contractnumber });
    if (!contractData) {
      return res.status(404).json({ message: 'Contract not found.' });
    }

    if (contractData.status !== 'none') {
      return res.status(400).json({ message: 'Contract has already been processed.' });
    }
    contractData.status = 'reject';
    await contractData.save();



    // console.log(`PDF file saved with short name: ${shortPdfFileName}`); pdfStream.on('finish', () => {
    //   console.log(`PDF file saved at: ${pdfFilePath} `);
    // });
    // const frontendpdf = `http://localhost:3000/contract/${contractData?.contractNumber}`
    // const usersname = contractData?.createdby
    // const volumne = contractData?.volume
    // const volumeIns = contractData?.volumePerIns
    // const commodity1 = contractData?.commodity
    // const price1 = contractData?.price
    // const priceperIns = contractData?.pricePerIns
    // const seller1 = contractData?.seller
    // const buyer1 = contractData?.buyer
    const buyeremail1 = contractData?.buyeremail
    // // contractData.pdfFile = shortPdfFileName;
    // contractData.number = contractData?.contractNumber
    // await contractData.save()
    await sendEmail(buyeremail1, "Contract Rejected")
    return res.json({ message: 'Contract Rejected successfully.' });
  } catch (error) {
    console.error('Error Rejecting contract:', error);
    return res.status(500).json({ message: 'An error occurred while Rejected the contract.' });
  }
};


function generateShortContractNumber() {
  const timestamp = Date.now().toString(36); // Convert current timestamp to base36
  const randomPart = Math.random().toString(36).substr(2, 5); // Generate a random string

  return `${timestamp}-${randomPart}`;
}
const createContact = async (req, res) => {
  try {
    const {
      seller,
      sellerRepresentative,
      buyer,
      buyeremail,
      buyerRepresentative,
      commodity,
      qualityParameters,
      rebateSchedule,
      volume,
      volumePerIns,
      volumeRate,
      incoterm,
      origin,
      destination,
      modeOfTransport,
      deliveryPeriod,
      deliveryBasis,
      price,
      pricePerIns,
      paymentTerm,
      freeTime,
      freeTimePerIns,
      detentionOrDemurrageCharges,
      detentionOrDemurrageChargesPerIns,
      otherTerms,
      applicableRules,
      Amendment,
      disputeResolution,
      MPIN
    } = req.body;

    // Verify MPIN
    const userId = req.user._id; // Assuming this is how you store user ID in the request object

    // Fetch user data from the database
    const userData = await AuthoRizeModel.findById(userId);
    if (!userData) {
      return res.status(404).json({ status: "failure", error: "User not found" });
    }

    const storedMPIN = userData.mPassword;

    if (MPIN !== storedMPIN) {
      return res.status(401).json({ status: "failure", error: "Invalid MPIN" });
    }

    // MPIN is valid, proceed with creating the contract
    const data = new ContractModel({
      seller,
      sellerRepresentative,
      buyer,
      buyeremail,
      buyerRepresentative,
      commodity,
      qualityParameters,
      rebateSchedule,
      volume,
      volumePerIns,
      volumeRate,
      incoterm,
      origin,
      destination,
      modeOfTransport,
      deliveryPeriod: new Date(deliveryPeriod),
      deliveryBasis,
      price,
      pricePerIns,
      paymentTerm,
      freeTime,
      freeTimePerIns,
      detentionOrDemurrageCharges,
      detentionOrDemurrageChargesPerIns,
      otherTerms,
      applicableRules,
      Amendment,
      disputeResolution,
      contractNumber: generateShortContractNumber(),
      userId: req.user._id
    });

    const contractData = await data.save();
    // Generate PDF with contract data
    const doc = new PDFDocument();
    const initialX = doc.x
    const pdfFilePath = `public/contracts/contract_${contractData.contractNumber}.pdf`;
    const pdfStream = fs.createWriteStream(pdfFilePath);
    // Assuming contractData.createdAt is a Date object
    const tradeDate = contractData?.createdAt.toISOString().substring(0, 10);
    doc.pipe(pdfStream);
    doc.fontSize(14).text('Trade Confirmation', { align: 'center', underline: true, bold: true });
    doc.moveDown();
    doc.fontSize(11).text(`Contract Number:${contractData?.contractNumber}`, { underline: true, align: 'right' });
    doc.moveDown();
    doc.fontSize(11).text(`Trade Date:${tradeDate}`);
    doc.moveDown();
    doc.text('Seller Represented by Mr ', { continued: true });
    doc.text(contractData?.seller, { underline: true, continued: true });
    doc.text(' hereby agrees to sell and Buyer Represented By Mr ', { underline: false, continued: true });
    doc.text(contractData?.buyer, { underline: true, continued: true });
    doc.text(' agrees to purchase the commodity in accordance with the following terms and conditions', { underline: false });
    const pageWidth = 595; // Width of the page in points (adjust as needed)
    const margin = 50; // Increased margin for both sides
    const boxHeight = 60; // Decreased height for the boxes
    const boxWidth = (pageWidth - margin) / 2.125; // Width for each box

    // Calculate positions for seller and buyer sections with increased margins
    const sellerX = margin; // Add margin to the left side
    const sellerY = doc.y + 10; // Start below the previous content
    const buyerX = sellerX + boxWidth; // No additional margin between boxes

    // Draw the boxes with the updated boxHeight
    doc.rect(sellerX, sellerY, boxWidth, boxHeight).stroke();
    doc.rect(buyerX, sellerY, boxWidth, boxHeight).stroke();

    // Add text for seller and buyer with proper alignment and continuation
    doc.text('Seller Data:', sellerX + 10, sellerY + 10, { continued: true });
    doc.text(contractData?.seller, { continued: true });
    doc.moveDown();

    const buyerTextX = buyerX - 100; // X position for "Buyer Data"
    const buyerTextY = sellerY + 10; // Y position for "Buyer Data"
    doc.text('Buyer Data:', buyerTextX, buyerTextY, { continued: true });
    doc.text(contractData?.buyer, { continued: false });

    // Move down after the boxes and buyer data
    doc.moveDown(4);
    doc.x = initialX
    doc.text('Commodity: ', { bold: true, continued: true })
    doc.text(contractData?.commodity)
    doc.moveDown()
    doc.text('Quality Specifications: As per Attachment A')
    doc.moveDown()
    doc.text('Rebate Schedule: As per Attachment A')
    doc.moveDown()
    doc.text('Volume: ', { bold: true, continued: true })
    doc.text(contractData?.volume + ' ' + contractData?.volumePerIns)
    doc.moveDown()
    doc.text('Incoterm: ', { bold: true, continued: true })
    doc.text(contractData?.incoterm)
    doc.moveDown()
    doc.text('Origin: ', { bold: true, continued: true })
    doc.text(contractData?.origin, { continued: true })
    doc.text(`Destination: ${contractData?.destination}`, { bold: true, continued: false, align: 'center' })
    doc.moveDown()
    doc.text('Delivery Period: ', { continued: true, align: 'left' })
    doc.text(contractData?.deliveryPeriod.toISOString().substring(0, 10), { continued: true })
    doc.text(`Delivery Basis: ${contractData?.deliveryBasis}`, { continued: false, bold: false, align: 'center' })
    doc.moveDown()
    doc.text('Mode of Transport: ', { bold: true, continued: true, align: 'left' })
    doc.text(contractData?.modeOfTransport)
    doc.moveDown()
    doc.text('Price: ', { bold: true, continued: true, })
    doc.text(`Rs.${contractData?.price} per ${contractData?.pricePerIns}`)
    doc.moveDown()
    doc.text('Payment Term: ', { bold: true, continued: true, })
    doc.text(`Within ${contractData?.paymentTerm} after ${contractData?.deliveryBasis}`)
    doc.moveDown()
    doc.text('Free Time: ', { continued: true, align: 'left' })
    doc.text(`${contractData?.freeTime} ${contractData?.freeTimePerIns}`, { continued: true })
    doc.text(`Detention Charges: Rs${contractData?.detentionOrDemurrageCharges} ${detentionOrDemurrageChargesPerIns}`, { continued: false, bold: false, align: 'center' })
    doc.moveDown()
    doc.text('Other Terms: ', { bold: true, continued: true, })
    doc.text(` ${contractData?.otherTerms}`)
    doc.moveDown()
    doc.text(`Applicable Trade Rules: This trade Confirmation shall be governed by Arbitrade Rules of Grain Trade dated (NOT DEFINED) ("${contractData?.applicableRules}" read with Amendment dated (NOT DEFINED) to the rules between the parties)`)
    doc.moveDown()
    doc.text(`Dispute Resolution: Arbitration conducted by Arbitrade India (See Rule (NOT DEFINED) of Arbitrade Rules of Grains Trade dated (NOT DEFINED))`)
    doc.moveDown()
    doc.fontSize(9).text(`proposed and digitally signed by `, { align: 'center' })
    doc.text(`Mr.${req.user.nameOfUser} on behalf of`, { align: 'center' })
    doc.text(`M/s (NOT DEFINED) in the capacity of broker`, { align: 'center' })
    const createdAtDate = new Date(contractData?.createdAt);
    const hour = createdAtDate.getHours();
    const minute = createdAtDate.getMinutes();
    doc.text(`on ${contractData?.createdAt.toISOString().substring(0, 10)}at ${hour}:${minute}`, { align: 'center' })

    doc.fontSize(11).text(`Contract Number: ${contractData?.contractNumber}`, { bold: true, underline: true, align: 'right' });
    doc.moveDown()
    doc.fontSize(13).text(`Attachment A`, { bold: true, underline: true, align: 'center' });
    doc.moveDown()
    const headers = ['Sr. No', 'Description', 'Parameters', 'Rebate Schedule'];
    const tableRows = [
      ['1', 'Foreign Matter(organic/inorganic matter)', '2% (Max)', 'Discount for 1:1 for above 2% & upto 3%.More than 3% to be rejected'],
      ['2', 'Damaged Kernel(Other than infestation damaged)', '2% (Max)', 'Discount for 1:0:5 for above 2% & upto 4%.More than 4% to be rejected'],
      ['3', 'Shrunken,Shrivelled and broken grains', '4% (Max)', 'Discount for 1:1 for above 4% & upto 6%.More than 6% to be rejected'],
      ['4', 'Infestation Damaged Kernel', '1%', ''],
      ['5', 'Total defects consisting of Sr. No 1,2,3 and 4', '9%(Acceptable upto 13%),', 'Rejected above 13%'],
      ['6', 'Moisture', '11%,', 'Acceptable upto 13%,with rebate 1:1,above 13% to be rejected'],




    ];
    const columnWidths = [50, 180, 150, 145]; // Adjust the values based on your layout
    const rowHeight = 42;

    doc.fontSize(10).font('Helvetica');

    // Draw table headers
    doc.y += 10;
    let startX = 50;
    headers.forEach((header, columnIndex) => {
      doc.rect(startX, doc.y, columnWidths[columnIndex], rowHeight).stroke();
      doc.text(header, startX + 5, doc.y + 5, { width: columnWidths[columnIndex] - 10, align: 'center', bold: true });
      startX += columnWidths[columnIndex];
      doc.moveUp(1.44);
    });

    doc.y += rowHeight;

    // Draw table rows
    tableRows.forEach((row, rowIndex) => {
      startX = 50; // Reset x-coordinate for each row
      row.forEach((cell, columnIndex) => {
        doc.rect(startX, doc.y, columnWidths[columnIndex], rowHeight).stroke();
        const cellY = doc.y
        doc.text(cell, startX + 5, cellY + 5, { width: columnWidths[columnIndex] - 10, align: 'center', bold: true });
        doc.y = cellY
        startX += columnWidths[columnIndex];
      });
      doc.y += rowHeight;
    });
    doc.x = initialX
    doc.moveDown(5)
    doc.fontSize(9).text(`proposed and digitally signed by `, { align: 'center' })
    doc.text(`Mr.${req.user.nameOfUser} on behalf of`, { align: 'center' })
    doc.text(`M/s (NOT DEFINED) in the capacity of broker`, { align: 'center' })
    doc.text(`on ${contractData?.createdAt.toISOString().substring(0, 10)}at ${hour}:${minute}`, { align: 'center' })
    doc.moveDown(4)
    // Add buttons
    const buttonWidth = 100;
    const buttonHeight = 20;
    const buttonXLeft = doc.page.margins.left;
    const buttonXCenter = (doc.page.width - buttonWidth) / 2;
    const buttonXRight = doc.page.width - doc.page.margins.right - buttonWidth;

    const buttonY = doc.y;
    const numberOfContract = contractData?.contractNumber

    // Left-aligned button
    doc.rect(buttonXLeft, buttonY, buttonWidth, buttonHeight).stroke();
    doc.link(buttonXLeft, buttonY, buttonWidth, buttonHeight, `https://arbi-front-five.vercel.app/contract/accept/${numberOfContract}`);
    doc.text('Accept', buttonXLeft + 5, buttonY + 5, { width: buttonWidth - 10, align: 'center' });

    // Center-aligned button with link
    doc.rect(buttonXCenter, buttonY, buttonWidth, buttonHeight).stroke();
    doc.link(buttonXCenter, buttonY, buttonWidth, buttonHeight, `https://arbi-front-five.vercel.app/contract/reject/${numberOfContract}`);
    doc.text('Reject', buttonXCenter + 5, buttonY + 5, { width: buttonWidth - 10, align: 'center' });

    // Right-aligned button with link
    doc.rect(buttonXRight, buttonY, buttonWidth, buttonHeight).stroke();
    doc.link(buttonXRight, buttonY, buttonWidth, buttonHeight, `https://arbi-front-five.vercel.app/contract/change/${numberOfContract}`);
    doc.text('Request for Change', buttonXRight + 5, buttonY + 5, { width: buttonWidth - 10, align: 'center' });
    doc.end();

    const shortPdfFileName = path.basename(pdfFilePath, path.extname(pdfFilePath));

    // console.log(`PDF file saved with short name: ${shortPdfFileName}`); pdfStream.on('finish', () => {
    //   console.log(`PDF file saved at: ${pdfFilePath} `);
    // });
    const frontendpdf = `https://arbi-front-five.vercel.app/contract/${numberOfContract}`
    const usersname = req.user.nameOfUser
    const volumne = contractData?.volume
    const volumeIns = contractData?.volumePerIns
    const commodity1 = contractData?.commodity
    const price1 = contractData?.price
    const priceperIns = contractData?.pricePerIns
    const seller1 = contractData?.seller
    const buyer1 = contractData?.buyer
    const buyeremail1 = contractData?.buyeremail
    contractData.pdfFile = shortPdfFileName;
    contractData.number = contractData?.contractNumber;
    contractData.createdby = req.user.nameOfUser
    await contractData.save()
    await sendEmail(buyeremail1, "You have a new Proposal", { price1, usersname, volumne, volumePerIns, frontendpdf, commodity1, price1, priceperIns, seller1, buyer1 }, "./template/contract.handlebars")
    return res.status(201).json({
      status: 'success',
      data: contractData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "failure", error: error.message });
  }
};

const verifyStatus = async (req, res) => {
  try {
    const { status, _id } = req.body;
    const updatedUser = await ContractModel.findOneAndUpdate({ _id }, { status }, { new: true });
    res.status(200).json({
      status: "success",
      data: updatedUser
    })
  } catch (error) {
    res.status(500).json({ status: "failure", error: error.message });
  }
};

const getAllAdminNames = async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await UserModel.find({}, 'nameOfEntity'); // Assuming 'name' is the field you want to retrieve
    // Extract names from users
    const userNames = users.map(user => user.nameOfEntity);
    return res.status(200).json({
      status: 'success',
      data: userNames
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'failure',
      error: 'An error occurred while fetching user names'
    });
  }
};
const getAllAuthNames = async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await AuthoRizeModel.find({}, 'nameOfUser'); // Assuming 'name' is the field you want to retrieve
    // Extract names from users
    const userNames = users.map(user => user.nameOfUser);
    return res.status(200).json({
      status: 'success',
      data: userNames
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'failure',
      error: 'An error occurred while fetching user names'
    });
  }
};


module.exports = {
  createContact,
  verifyStatus,
  getAllAdminNames,
  getAllAuthNames,
  acceptContract,
  rejectContract,
};
