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

const getRepresentative = async (req, res) => {
  const selectedSellerId = req.query.selectedSeller;
  console.log(selectedSellerId)
  try {
    // Look for the Authorization model using the selectedSellerId
    const user = await UserModel.findOne({ nameOfEntity: selectedSellerId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If the user is found, use the user's _id in further processing
    const userId = user._id;

    const authorizations = await AuthoRizeModel.find({ createdBy: userId });

    if (!authorizations || authorizations.length === 0) {
      // If no authorizations are found, set namesOfUser to an empty array
      const namesOfUser = [];
      return res.status(200).json({ namesOfUser });
    }

    // Extract the names from the matched authorizations
    const namesOfUser = authorizations.map((authorization) => authorization.nameOfUser);

    // Respond with the names of the user from matched authorizations
    return res.status(200).json({ namesOfUser });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
const getRepresentative2 = async (req, res) => {
  const selectedSellerId = req.query.selectedSeller;
  console.log(selectedSellerId)
  try {
    // Look for the Authorization model using the selectedSellerId
    const user = await UserModel.findOne({ nameOfEntity: selectedSellerId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If the user is found, use the user's _id in further processing
    const userId = user._id;

    const authorizations = await AuthoRizeModel.find({ createdBy: userId });

    if (!authorizations || authorizations.length === 0) {
      // If no authorizations are found, set namesOfUser to an empty array
      const namesOfUser = [];
      return res.status(200).json({ namesOfUser });
    }

    // Extract the names from the matched authorizations
    const namesOfUser = authorizations.map((authorization) => authorization.nameOfUser);

    // Respond with the names of the user from matched authorizations
    return res.status(200).json({ namesOfUser });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

const retrieveEmail = async (req, res) => {
  const selectedValue = req.body.selectedValue; // Assuming selectedValue is sent in the request body

  try {
    // Assuming authorizeModel is your Mongoose model
    const authorization = await AuthoRizeModel.findOne({ nameOfUser: selectedValue });

    if (authorization) {
      // If a match is found, send the email
      return res.status(200).json({ selectedBuyeremail: authorization.email });
    } else {
      return res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};



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
    const doc = new PDFDocument();
    const initialX = doc.x
    const pdfFilePath = `public/approvedcontracts/contract_${contractData.contractNumber}.pdf`;
    const pdfStream = fs.createWriteStream(pdfFilePath);
    // Assuming contractData.createdAt is a Date object
    const tradeDate = contractData?.createdAt.toISOString().substring(0, 10);
    doc.pipe(pdfStream);
    doc.fontSize(14).text(`Trade Confirmation (Contract Number:${contractData?.contractNumber})`, { align: 'center', underline: true, bold: true });
    doc.moveDown();
    doc.fontSize(11).text(`Trade Date:${tradeDate}`);
    doc.moveDown();
    const pageWidth = 595; // Width of the page in points (adjust as needed)
    const margin = 50; // Increased margin for both sides
    const boxHeight = 60; // Decreased height for the boxes
    const boxWidth = (pageWidth - margin) / 2.125; // Width for each box
    // const sellerDoc = await AuthoRizeModel.find({ nameOfUser: contractData?.seller })
    // if (sellerDoc) {
    //   const sellerAddress = sellerDoc.
    // }

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
    // doc.text('Seller Represented by Mr ', { continued: true });
    // doc.text(contractData?.seller, { underline: true, continued: true });
    // doc.text(' hereby agrees to sell and Buyer Represented By Mr ', { underline: false, continued: true });
    // doc.text(contractData?.buyer, { underline: true, continued: true });
    // doc.text(' agrees to purchase the commodity in accordance with the following terms and conditions', { underline: false });
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
    doc.text(`Applicable Trade Rules: This Trade Confirmation shall be governed by All India Grain Merchant Association Rules.`)
    doc.moveDown()
    doc.text(`Dispute Resolution: Arbitration as provided under All India Grain Merchants Association Rules.`)
    doc.moveDown()
    doc.fontSize(8).text(`proposed and digitally signed by `, { align: 'left' })
    doc.text(`Mr.${contractData?.seller} on behalf of`, { align: 'left' })
    doc.text(`M/s (NOT DEFINED) in the capacity of seller`, { align: 'left' })
    const updatedAtDate = new Date(contractData?.updatedAt);

    const hour = updatedAtDate.getHours();
    const minute = updatedAtDate.getMinutes();
    const createdAtDate = new Date(contractData?.createdAt);
    const date1 = new Date(contractData.updatedAt);
    const formattedDate1 = date1.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const date = new Date(contractData.createdAt);
    const formattedDate = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const hour1 = createdAtDate.getHours();
    const minute1 = createdAtDate.getMinutes();
    doc.text(`on ${formattedDate1} at ${hour}:${minute}`, { align: 'left' })
    doc.moveUp(4)
    doc.fontSize(8).text(`proposed and digitally signed by `, { align: 'center' })
    doc.text(`Mr.${contractData?.createdby} `, { align: 'center' })
    doc.text(` in the`, { align: 'center' })
    doc.text(`capacity of broker`, { align: 'center' })
    doc.text(`on ${formattedDate} at ${hour1}:${minute1}`, { align: 'center' })
    doc.moveUp(5)
    doc.fontSize(8).text(`proposed and digitally signed by `, { align: 'right' })
    doc.text(`Mr.${contractData?.buyer} `, { align: 'right' })
    doc.text(` in the capacity of buyer`, { align: 'right' })
    doc.text(`on ${formattedDate1} at ${hour}:${minute}`, { align: 'right' })
    doc.moveDown()
    doc.moveDown()
    doc.moveDown()
    doc.moveDown()
    doc.moveDown()
    doc.moveDown()

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
    doc.text(`on ${formattedDate1} at ${hour}:${minute}`, { align: 'left' })
    doc.moveUp(4)
    doc.fontSize(8).text(`proposed and digitally signed by `, { align: 'center' })
    doc.text(`Mr.${contractData?.createdby} `, { align: 'center' })
    doc.text(` in the`, { align: 'center' })
    doc.text(`capacity of broker`, { align: 'center' })
    doc.text(`on ${formattedDate} at ${hour1}:${minute1}`, { align: 'center' })
    doc.moveUp(5)
    doc.fontSize(8).text(`proposed and digitally signed by `, { align: 'right' })
    doc.text(`Mr.${contractData?.buyer} `, { align: 'right' })
    doc.text(` in the capacity of buyer`, { align: 'right' })
    doc.text(`on ${formattedDate1} at ${hour}:${minute}`, { align: 'right' })
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
    const selleremail1 = contractData?.sellerEmail
    const contractno = contractData?.contractNumber
    contractData.pdfFile = shortPdfFileName;
    contractData.number = contractData?.contractNumber
    await contractData.save()

    const createdBy = req.user.createdBy;
    console.log(req.user)
    // Finding the user in the UserModel
    const user = await UserModel.findById(createdBy);


    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const nameOfEntity = user.nameOfEntity;

    // Checking if 'nameOfEntity' matches 'seller' in contractData
    if (nameOfEntity === contractData.seller) {
      contractData.approve1 = true;
      await contractData.save()
    }
    if (nameOfEntity === contractData.buyer) {
      contractData.approve2 = true;
      await contractData.save()
    }

    // Check for 'approve1' and 'approve2'
    if (contractData.approve1 && contractData.approve2) {
      contractData.status = 'approve';
      await sendEmail(buyeremail1, "Contract Accepted", { contractno, price1, usersname, volumne, frontendpdf, commodity1, price1, priceperIns, seller1, buyer1 }, "./template/accept.handlebars")
      await sendEmail(selleremail1, "Contract Accepted", { contractno, price1, usersname, volumne, frontendpdf, commodity1, price1, priceperIns, seller1, buyer1 }, "./template/accept.handlebars")
      await contractData.save();

      return res.json({ message: 'Contract accepted successfully.' });

    }

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




// let contractCounter = 0;

// function generateShortContractNumber() {
//   // Increment the counter for each new contract
//   contractCounter++;

//   // Ensure the counter is 4 digits by taking the last 4 digits
//   const paddedCounter = ('0000' + (contractCounter % 10000)).slice(-4);

//   return paddedCounter;
// }
const crypto = require('crypto');

function generateShortContractNumber() {
  // Generate a unique value, for example, using a timestamp
  const uniqueValue = Date.now().toString();

  // Calculate a hash using SHA-1
  const hash = crypto.createHash('sha1').update(uniqueValue).digest('hex');

  // Take the first 4 characters of the hash and convert to a number
  const number = parseInt(hash.slice(0, 4), 16);

  // Ensure it's a 4-digit number
  return ('000' + number).slice(-4);
}

const uniqueNumber = generateShortContractNumber();
console.log(uniqueNumber);



const createContact = async (req, res) => {
  try {
    const {
      seller,
      sellerRepresentative,
      sellerEmail,
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
      deliveryPeriodto,
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
      sellerEmail,
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
      deliveryPeriodto: new Date(deliveryPeriodto),
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
    const tradeDate = contractData?.createdAt;
    doc.pipe(pdfStream);
    doc.fontSize(14).text(`Trade Confirmation (Contract Number:${contractData?.contractNumber})`, { align: 'center', underline: true, bold: true });
    doc.moveDown();
    // doc.fontSize(11).text(`Contract Number:${contractData?.contractNumber}`, { underline: true, align: 'right' });
    // Assuming tradeDate is a Date object

    const formattedDate3 = tradeDate.toLocaleDateString('en-GB');
    doc.fontSize(11).text(`Trade Date:${formattedDate3}`);
    doc.moveDown();

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
    doc.text('Seller:', sellerX + 10, sellerY + 10, { continued: true });
    doc.text(contractData?.seller, { continued: true });
    doc.moveDown();

    const buyerTextX = buyerX - 100; // X position for "Buyer Data"
    const buyerTextY = sellerY + 10; // Y position for "Buyer Data"
    doc.text('Buyer:', buyerTextX + 10, buyerTextY, { continued: true });
    doc.text(contractData?.buyer, { continued: false });
    console.log(seller)
    console.log(buyer)

    // Assuming seller's name is in contractData
    async function findUserByName(name) {
      try {
        return await UserModel.findOne({ nameOfEntity: name });
      } catch (error) {
        console.error("Error finding user:", error.message);
        return null;
      }
    }

    const matchedSeller = await findUserByName(seller);
    const matchedBuyer = await findUserByName(buyer);

    console.log(matchedSeller)
    console.log(matchedBuyer?.address)

    const buyerName = contractData?.buyer;

    // Move down after the boxes and buyer data
    doc.moveDown(4);
    doc.text('Address:', sellerX + 10, sellerY + 30, { continued: true });
    doc.text(`${matchedSeller?.address?.landmark},${matchedSeller?.address?.city},${matchedSeller?.address?.pin}`, { continued: true });
    doc.moveDown();

    doc.text('Address:', buyerTextX - 30, buyerTextY + 20, { continued: true });
    doc.text(`${matchedBuyer?.address?.landmark},${matchedBuyer?.address?.city},${matchedBuyer?.address?.pin}`, { continued: false });
    doc.x = initialX
    doc.moveDown(3);
    doc.text('Seller Represented by Mr ', { continued: true });
    doc.text(contractData?.sellerRepresentative, { underline: true, continued: true });
    doc.text(' hereby agrees to sell and Buyer Represented By Mr ', { underline: false, continued: true });
    doc.text(contractData?.buyerRepresentative, { underline: true, continued: true });
    doc.text(' agrees to purchase the commodity in accordance with the following terms and conditions:-', { underline: false });
    doc.moveDown()
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
    doc.text('Delivery Period: From ', { continued: true, align: 'left' })
    // const formattedDate3 = tradeDate.toLocaleDateString('en-GB');
    doc.text(contractData?.deliveryPeriod.toLocaleDateString('en-GB'), { continued: true })
    doc.text(' to ', { continued: true, })
    doc.text(contractData?.deliveryPeriodto.toLocaleDateString('en-GB'), { continued: true })
    doc.text(`Delivery Basis: ${contractData?.deliveryBasis}`, { continued: false, bold: false, align: 'center' })
    doc.moveDown()
    doc.text('Mode of Transport: ', { bold: true, continued: true, align: 'left' })
    doc.text(contractData?.modeOfTransport)
    doc.moveDown()
    doc.text('Price: Rs.', { bold: true, continued: true, })
    doc.text(contractData?.price, { continued: true })
    doc.text('/- per ', { underline: false, continued: true });

    doc.text(contractData?.pricePerIns, { underline: false, continued: false })

    doc.moveDown()
    doc.text('Payment Term: ', { bold: true, continued: true })
    doc.text(`${contractData?.paymentTerm}`)
    doc.moveDown()
    doc.text('Free Time: ', { continued: true, align: 'left' })
    doc.text(`${contractData?.freeTime} ${contractData?.freeTimePerIns}`, { continued: false })
    doc.moveDown()
    doc.text('Detention Charges: Rs.', { continued: true })
    doc.text(contractData?.detentionOrDemurrageCharges, { continued: true })
    doc.text('/- ', { underline: false, continued: true });
    doc.text(`${detentionOrDemurrageChargesPerIns} `, { underline: false, continued: false, bold: false })
    doc.moveDown()

    // Existing content...
    doc.text('Other Terms: ', { bold: true, continued: true, });
    doc.text(` ${contractData?.otherTerms} `);
    doc.moveDown();
    doc.text(`Applicable Trade Rules: This Trade Confirmation shall be governed by All India Grain Merchant Association Rules.`);
    doc.moveDown();
    doc.text(`Dispute Resolution: Arbitration as provided under All India Grain Merchants Association Rules.`);

    const createdByUserId2 = req.user.createdBy;
    const user2 = await UserModel.findById(createdByUserId2);
    if (!user2) {
      return res.status(404).json({ error: 'User not found' });
    } else {
      // Continue adding footer-related content here if needed
    }

    const createdAtDate = new Date(contractData?.createdAt);
    const date = new Date(contractData.createdAt);
    const formattedDate = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const hour = createdAtDate.getHours();
    const minute = createdAtDate.getMinutes();

    const footerText = `proposed and digitally signed by Mr.${req.user.nameOfUser} on behalf of ${user2?.nameOfEntity} in the capacity of broker on ${formattedDate} at ${hour}:${minute}`;

    function addLineBreaks(text) {
      const words = text.split(' ');
      const wordsPerLine = Math.floor(Math.random() * 3) + 3; // Generate a random number of words per line between 3 to 5
      let newText = '';
      for (let i = 0; i < words.length; i += wordsPerLine) {
        newText += words.slice(i, i + wordsPerLine).join(' ') + '\n';
      }
      return newText;
    }

    const modifiedFooterText = addLineBreaks(footerText);
    const footerHeight = doc.heightOfString(modifiedFooterText, { width: doc.page.width });
    const maxContentHeight = doc.page.height - footerHeight - 70; // Adjust as needed

    // Check if there's enough space for the footer
    if (footerHeight < maxContentHeight) {
      // Position the footer at the bottom of the page
      doc.fontSize(9).text(modifiedFooterText, {
        align: 'center',
        width: doc.page.width - 130,
        lineGap: 3, // Adjust line gap for readability
        height: footerHeight + 10,
        characterSpacing: 0, // Adjust character spacing if needed
      });
    } else {
      // Add a new page and place the footer
      doc.addPage().fontSize(9).text(modifiedFooterText, {
        align: 'center',
        width: doc.page.width - 130,
        lineGap: 3, // Adjust line gap for readability
        height: footerHeight + 10,
        characterSpacing: 1, // Adjust character spacing if needed
      });
    }



    doc.moveDown()
    doc.moveDown()
    doc.moveDown()

    doc.moveDown()


    doc.fontSize(11).text(`Contract Number: ${contractData?.contractNumber} `, { bold: true, underline: true, align: 'right' });
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
    doc.text(`Mr.${req.user.nameOfUser} `, { align: 'center' })
    const createdByUserId1 = req.user.createdBy;
    const user1 = await UserModel.findById(createdByUserId1);
    if (!user1) {
      return res.status(404).json({ error: 'User not found' });
    } else {
      doc.text(`on behalf of ${user1?.nameOfEntity} `, { align: 'center' })
    }
    doc.text(` in the capacity of broker`, { align: 'center' })
    doc.text(`on ${formattedDate} at ${hour}:${minute} `, { align: 'center' })
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
    // doc.link(buttonXLeft, buttonY, buttonWidth, buttonHeight, `http://localhost:3000/contract/accept/${numberOfContract}`);

    doc.text('Accept', buttonXLeft + 5, buttonY + 5, { width: buttonWidth - 10, align: 'center' });

    // Center-aligned button with link
    doc.rect(buttonXCenter, buttonY, buttonWidth, buttonHeight).stroke();
    doc.link(buttonXCenter, buttonY, buttonWidth, buttonHeight, `https://arbi-front-five.vercel.app/contract/reject/${numberOfContract}`);
    // doc.link(buttonXCenter, buttonY, buttonWidth, buttonHeight, `http://localhost:3000/contract/reject/${numberOfContract}`);

    doc.text('Reject', buttonXCenter + 5, buttonY + 5, { width: buttonWidth - 10, align: 'center' });

    // Right-aligned button with link
    doc.rect(buttonXRight, buttonY, buttonWidth, buttonHeight).stroke();
    doc.link(buttonXRight, buttonY, buttonWidth, buttonHeight, `https://arbi-front-five.vercel.app/contract/change/${numberOfContract}`);
    // doc.link(buttonXRight, buttonY, buttonWidth, buttonHeight, `http://localhost:3000/contract/change/${numberOfContract}`);

    doc.text('Request for Change', buttonXRight + 5, buttonY + 5, { width: buttonWidth - 10, align: 'center' });
    doc.end();

    const shortPdfFileName = path.basename(pdfFilePath, path.extname(pdfFilePath));

    // console.log(`PDF file saved with short name: ${shortPdfFileName}`); pdfStream.on('finish', () => {
    //   console.log(`PDF file saved at: ${pdfFilePath} `);
    // });
    const frontendpdf = `https://arbi-front-five.vercel.app/contract/${numberOfContract}`
    // const frontendpdf = `http://localhost:3000/contract/${numberOfContract}`

    const createdByUserId = req.user.createdBy;
    const user = await UserModel.findById(createdByUserId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    } else {
      const usersname = user.nameOfEntity; // Access the nameOfEntity field
      const volumne = contractData?.volume
      const volumeIns = contractData?.volumePerIns
      const commodity1 = contractData?.commodity
      const price1 = contractData?.price
      const priceperIns = contractData?.pricePerIns
      const seller1 = contractData?.seller
      const buyer1 = contractData?.buyer
      const buyeremail1 = contractData?.buyeremail
      const sellerEmail1 = contractData?.sellerEmail
      contractData.pdfFile = shortPdfFileName;
      contractData.number = contractData?.contractNumber;
      contractData.createdby = req.user.nameOfUser
      await contractData.save()
      const contractNo = contractData?.contractNumber
      await sendEmail(buyeremail1, "You have a new Proposal", { price1, contractNo, usersname, volumne, volumePerIns, frontendpdf, commodity1, price1, priceperIns, seller1, buyer1 }, "./template/contract.handlebars")
      await sendEmail(sellerEmail1, "You have a new Proposal", { price1, contractNo, usersname, volumne, volumePerIns, frontendpdf, commodity1, price1, priceperIns, seller1, buyer1 }, "./template/contract.handlebars")
      return res.status(201).json({
        status: 'success',
        data: contractData,
      });
    }


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
    // Fetch users with register equal to 1 and retrieve only the 'nameOfEntity' field
    const users = await UserModel.find({ registerAs: '1' }, 'nameOfEntity');
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
const getPendingContract = async (req, res) => {
  try {
    const userName = req.user.nameOfUser; // Assuming the user's name is accessible through req.user.nameOfUser

    // Assuming ContractModel has fields 'createdBy' and 'status'
    const pendingContracts = await ContractModel.find({
      $and: [
        { status: 'approve' },
        {
          $or: [
            { createdby: userName },
            { seller: userName },
            { buyer: userName }
          ]
        }
      ]
    });

    if (pendingContracts.length === 0) {
      return res.status(404).json({
        status: 'failure',
        error: 'No pending contracts found for the user'
      });
    }

    // Assuming each pending contract has a 'pdfFile' field
    const pdfFiles = pendingContracts.map(contract => contract.pdfFile);

    return res.status(200).json({
      status: 'success',
      data: {
        pdfFiles: pdfFiles
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'failure',
      error: 'An error occurred while fetching the pending contracts'
    });
  }
};
const getExecutedContract = async (req, res) => {
  try {
    const userName = req.user.nameOfUser; // Assuming the user's name is accessible through req.user.nameOfUser

    // Assuming ContractModel has fields 'createdBy' and 'status'
    const pendingContracts = await ContractModel.find({
      $and: [
        { status: 'approve' },
        {
          $or: [
            { createdby: userName },
            { seller: userName },
            { buyer: userName }
          ]
        }
      ]
    });
    if (pendingContracts.length === 0) {
      return res.status(404).json({
        status: 'failure',
        error: 'No pending contracts found for the user'
      });
    }

    // Assuming each pending contract has a 'pdfFile' field
    const pdfFiles = pendingContracts.map(contract => contract.pdfFile);

    return res.status(200).json({
      status: 'success',
      data: {
        pdfFiles: pdfFiles
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'failure',
      error: 'An error occurred while fetching the pending contracts'
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
  getRepresentative,
  getRepresentative2,
  retrieveEmail,
  getPendingContract,
  getExecutedContract
};
