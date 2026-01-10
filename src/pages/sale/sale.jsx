import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf'; // For PDF generation
import "jspdf-autotable"; // Ensure you import the jsPDF autoTable plugin
import PopupAlert from "../../components/popupAlert/PopupAlert"; // Import PopupAlert component
import './sale.css'; // Import the CSS file here

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ADMIN_ACCESS_TOKEN =
    localStorage.getItem("adminToken") || import.meta.env.VITE_ADMIN_ACCESS_TOKEN;

const SalePage = () => {
    const [billNumber, setBillNumber] = useState('');
    const [formData, setFormData] = useState({
        billNo: billNumber,
        clientName: '',
        phoneNumber: '',
        description: '',
        purchaseCategory: 'silage',
        noOfBales: 0,
        weightinKgs: 0,
        pricePerKg: 0,
        discount: 0,
        amountPaid: 0,
        driverName: '',
        driverPhoneNumber: '',
        vehicleNumber: '',
        location: '',
        transportationCost: 0,
        totalAmount: 0,
        remainingAmount: 0,
    });
    const [popup, setPopup] = useState({
        open: false,
        message: "",
        status: 200,
        loading: false,
    });

    const pdfPreviewRef = useRef(null); // Reference to iframe for preview

    useEffect(() => {
        // Fetch bill number via GET API
        axios.get(`${API_BASE_URL}admin/sale/bill-number`, {
            headers: { Authorization: `Bearer ${ADMIN_ACCESS_TOKEN}` },
        })
            .then(response => {
                setBillNumber(response.data.data); // Assuming the API returns the bill number
            });
    }, []);

    useEffect(() => {
        // Generate real-time PDF preview whenever formData changes
        generatePDF();
    }, [formData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const calculateAmounts = () => {
        const totalAmount = formData.weightinKgs * formData.pricePerKg - (formData.discount);
        const remainingAmount = totalAmount - formData.amountPaid;
        setFormData({
            ...formData,
            totalAmount,
            remainingAmount,
        });
    };

    useEffect(() => {
        calculateAmounts(); // Recalculate on field change
    }, [formData.noOfBales, formData.weightinKgs, formData.pricePerKg, formData.discount, formData.amountPaid]);

    const generatePDF = () => {
        const doc = new jsPDF();

        // Function to add the logo
        const addLogo = () => {
            doc.addImage('/AAS.jpeg', 'PNG', 10, 10, 50, 20); // Modify the path if needed
        };

        // Function to add bill summary section with background and styled text
        const addBillSummary = () => {
            const titleColor = [0, 0, 255]; // Dark blue color for title
            const sectionColor = [173, 216, 230]; // Light blue background for the section (sky blue)
            const textColor = [0, 0, 0]; // Black text for the content
            const secondaryTextColor = [70, 130, 180]; // Steel blue for secondary text (e.g., "Phone Number")

            // Draw a background for the bill summary section (full width and adjusted height)
            const sectionHeight = 65; // Adjust the height based on the content size
            doc.setFillColor(...sectionColor);
            doc.rect(0, 30, doc.internal.pageSize.width, sectionHeight, 'F'); // Fill background

            // Add the title with dark blue color
            doc.setFontSize(16);
            doc.setTextColor(...titleColor); // Dark blue color for the title
            doc.text('Bill Summary', 10, 40); // Title position

            // Add the content
            doc.setFontSize(12);
            doc.setTextColor(...textColor); // Black text for the content

            // Add Date, Bill Number, User Name with black color
            doc.text('Date: ' + new Date().toLocaleDateString(), 10, 50);
            doc.text('Bill Number: ' + billNumber, 10, 60);
            doc.text('User Name: Ahmad', 10, 70); // Hardcoded user name

            // Phone Number in a secondary color (steel blue)
            doc.setTextColor(...secondaryTextColor); // Steel blue color for the phone number
            doc.text('Phone Number: 0303 0017919 / 0300 6598685', 10, 80);

            // Reset text color to black for the thank you note
            doc.setTextColor(...textColor); // Black for the thank you note
            doc.text('Thank you for your business. Please review the details below.', 10, 90);
        };

        // Function to add form data to the PDF using two columns
        const addFormData = () => {
            const titleColor = [0, 0, 255]; // Blue color for titles
            const sectionHeaderColor = [0, 0, 0]; // Black color for section headers
            const sectionTextColor = [0, 0, 0]; // Black text for content

            // Add 'BILL' title (larger and bold for emphasis)
            doc.setFontSize(18);
            doc.setFont('times', 'bold');
            doc.setTextColor(...titleColor);
            doc.text('BILL', doc.internal.pageSize.width / 2 - 25, 100); // Centered title

            // Add line after the title
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.5);
            doc.line(10, 105, doc.internal.pageSize.width - 10, 105); // Horizontal line

            // **Client Information Section** (Left Column)
            doc.setFontSize(14);
            doc.setFont('times', 'bold');
            doc.setTextColor(...sectionHeaderColor); // Black color for section headers
            doc.text('Client InformationPurchase Details', 10, 120);

            // Client information details (Left Column)
            doc.setFontSize(12);
            doc.setFont('times', 'normal');
            doc.setTextColor(...sectionTextColor); // Black text for content
            doc.text('Purchase Category: SILAGE', 10, 130);
            doc.text('Number of Bales: ' + formData.noOfBales, 10, 140);
            doc.text('Weight in Kg: ' + formData.weightinKgs, 10, 150);
            doc.text('Price per Kg: ' + formData.pricePerKg, 10, 160);
            doc.text('Discount (%): ' + formData.discount, 10, 170);


            // Update yPosition for the next section
            let yPositionLeft = 175;

            // **Purchase Details Section** (Right Column)
            doc.setFontSize(14);
            doc.setFont('times', 'bold');
            doc.setTextColor(...sectionHeaderColor); // Black color for section headers
            doc.text('Client Information', doc.internal.pageSize.width / 2 + 10, yPositionLeft);

            // Purchase details (Right Column)
            doc.setFontSize(12);
            doc.setFont('times', 'normal');
            doc.setTextColor(...sectionTextColor); // Black text for content
            doc.text('Client Name: ' + formData.clientName, doc.internal.pageSize.width / 2 + 10, yPositionLeft + 10);
            doc.text('Phone Number: ' + formData.phoneNumber, doc.internal.pageSize.width / 2 + 10, yPositionLeft + 20);
            doc.text('Description: ' + formData.description, doc.internal.pageSize.width / 2 + 10, yPositionLeft + 30);


            // **Payment Information Section** (Left Column)
            doc.setFontSize(14);
            doc.setFont('times', 'bold');
            doc.setTextColor(...sectionHeaderColor); // Black color for section headers
            doc.text('Payment Information', 10, yPositionLeft + 60);

            // Payment details (Left Column)
            doc.setFontSize(12);
            doc.setFont('times', 'normal');
            doc.setTextColor(...sectionTextColor); // Black text for content
            doc.text('Total Amount: ' + formData.totalAmount, 10, yPositionLeft + 70);
            doc.text('Amount Paid: ' + formData.amountPaid, 10, yPositionLeft + 80);
            doc.text('Remaining Amount: ' + formData.remainingAmount, 10, yPositionLeft + 90);

            // Update yPosition for next sections
            let yPositionRight = 119.5;

            // **Driver Details Section** (Right Column)
            doc.setFontSize(14);
            doc.setFont('times', 'bold');
            doc.setTextColor(...sectionHeaderColor); // Black color for section headers
            doc.text('Driver Details', doc.internal.pageSize.width / 2 + 10, yPositionRight);

            // Driver details (Right Column)
            doc.setFontSize(12);
            doc.setFont('times', 'normal');
            doc.setTextColor(...sectionTextColor); // Black text for content
            doc.text('Driver Name: ' + formData.driverName, doc.internal.pageSize.width / 2 + 10, yPositionRight + 7);
            doc.text('Driver Phone Number: ' + formData.driverPhoneNumber, doc.internal.pageSize.width / 2 + 10, yPositionRight + 15);
            doc.text('Vehicle Number: ' + formData.vehicleNumber, doc.internal.pageSize.width / 2 + 10, yPositionRight + 22);
            doc.text('Location: ' + formData.location, doc.internal.pageSize.width / 2 + 10, yPositionRight + 29);
            doc.text('Transportation Cost: ' + formData.transportationCost, doc.internal.pageSize.width / 2 + 10, yPositionRight + 35);

            // Add a horizontal line after each section
            doc.setDrawColor(0, 0, 0);
            doc.line(10, yPositionLeft + 55, doc.internal.pageSize.width - 10, yPositionLeft + 55); // Horizontal line
        };

        // Function to add the "PAID" stamp
        const addPaidStamp = () => {
            if (formData.remainingAmount > 0) {

                console.log('Total and Paid Amounts are equal. Adding PAID stamp.');
                const stampWidth = 80;
                const stampHeight = 0;

                const imagePath = '/not-paid.png';
                try {
                    doc.addImage(imagePath, 'PNG', 10, 160, stampWidth, stampHeight);
                } catch (error) {
                    console.error('Error adding image:', error);
                }
            }
            else {
                const stampWidth = 80;
                const stampHeight = 0;

                const imagePath = '/stamp_paid.png';
                try {
                    doc.addImage(imagePath, 'PNG', 10, 160, stampWidth, stampHeight);
                } catch (error) {
                    console.error('Error adding image:', error);
                }
            }

        };

        // Add logo to the PDF
        addLogo();

        // Add Bill Summary section
        addBillSummary();

        // Add form data to the PDF
        addFormData();

        // Add PAID stamp if amounts match
        addPaidStamp();

        // Set the PDF preview
        const pdfPreviewUrl = doc.output('bloburl');
        if (pdfPreviewRef.current) {
            pdfPreviewRef.current.src = pdfPreviewUrl; // Update iframe source with the generated PDF
        }
        return doc
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                `${API_BASE_URL}admin/sale`,
                {
                    ...formData,
                    billNo: billNumber,
                    purchasedItems: 'silage',
                },
                {
                    headers: { Authorization: `Bearer ${ADMIN_ACCESS_TOKEN}` },
                }
            );

            setPopup({
                open: true,
                message: response.data?.message || "Sale created successfully!",
                status: response.status,
                loading: false,
            });

            const doc = generatePDF(); // SAME PDF AS PREVIEW
            doc.save(`Bill${billNumber}_${formData.clientName}.pdf`);

        } catch (error) {
            console.error("Error submitting sale data", error);

            setPopup({
                open: true,
                message: error.response?.data?.message || "Something went wrong",
                status: error.response?.status || 500,
                loading: false,
            });
        } finally {

        }
    };


    return (
        <div className="sale-page">
            <form className="sale-form" onSubmit={handleSubmit}>
                <div>
                    <label>Bill Number</label>
                    <input type="text" value={billNumber} disabled />
                </div>
                <div>
                    <label>Client Name</label>
                    <input type="text" name="clientName" value={formData.clientName} onChange={handleChange} />
                </div>
                <div>
                    <label>Phone Number</label>
                    <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
                </div>
                <div>
                    <label>Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange}></textarea>
                </div>
                <div>
                    <label>Purchase Category</label>
                    <input
                        type="text"
                        name="purchaseCategory"
                        value="Silage"
                        disabled
                    />
                </div>

                <div>
                    <label>Number of Bales</label>
                    <input type="number" name="noOfBales" value={formData.noOfBales} onChange={handleChange} />
                </div>
                <div>
                    <label>Weight in Kg</label>
                    <input type="number" name="weightinKgs" value={formData.weightinKgs} onChange={handleChange} />
                </div>
                <div>
                    <label>Price per Kg</label>
                    <input type="number" name="pricePerKg" value={formData.pricePerKg} onChange={handleChange} />
                </div>
                <div>
                    <label>Discount (%)</label>
                    <input type="number" name="discount" value={formData.discount} onChange={handleChange} />
                </div>
                <div>
                    <label>Total Amount</label>
                    <input type="text" value={formData.totalAmount} disabled />
                </div>
                <div>
                    <label>Amount Paid</label>
                    <input type="number" name="amountPaid" value={formData.amountPaid} onChange={handleChange} />
                </div>
                <div>
                    <label>Remaining Amount</label>
                    <input type="text" value={formData.remainingAmount} disabled />
                </div>
                <div>
                    <label>Driver Name</label>
                    <input type="text" name="driverName" value={formData.driverName} onChange={handleChange} />
                </div>
                <div>
                    <label>Driver Phone Number</label>
                    <input type="text" name="driverPhoneNumber" value={formData.driverPhoneNumber} onChange={handleChange} />
                </div>
                <div>
                    <label>Vehicle Number</label>
                    <input type="text" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange} />
                </div>
                <div>
                    <label>Location</label>
                    <input type="text" name="location" value={formData.location} onChange={handleChange} />
                </div>
                <div>
                    <label>Transportation Cost</label>
                    <input type="number" name="transportationCost" value={formData.transportationCost} onChange={handleChange} />
                </div>
                <button type="submit">Submit and Print</button>
            </form>

            {/* PDF Preview Section */}
            <div className="pdf-preview">
                <h3>Real-time PDF Preview</h3>
                <iframe
                    ref={pdfPreviewRef}
                    width="100%"
                    height="500px"
                    title="PDF Preview"
                />
            </div>
            <PopupAlert
                open={popup.open}
                message={popup.message}
                status={popup.status}
                loading={popup.loading}
                onClose={() => setPopup({ ...popup, open: false })}
            />
        </div>
    );
};

export default SalePage;
