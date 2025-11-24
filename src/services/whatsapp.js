const axios = require("axios");

const token = "EAAUqZBIllJz8BPTd1G4oQ2M6O1Km1iXx9ZBfJwzvrKKeKuyAL70o83Gg5Ijx8v7CXE19mfQleHPQtGy0Y9bpey2jAPvt99mqCDRglx4AqKFVECzDZBFIRDZAXa4ZAPMIM4iS16NgD9SeLwrmpZAUuoZAjVfsnEtnqFo3y9auOZBGpUpGfkwmNlYMTj1Ohe0FwdAwrYl7UPZBhrMjpArimyYDJFrGypc27mzfUvjafCA9nngZDZD";
const phoneNumberId = "768446373020479";
// const to = "1 555 167 9178"; // without '+' for WhatsApp Cloud API (test number)
const to = "918347337661"; // without '+' for WhatsApp Cloud API (test number)


const appSecrate="ec69ca6d621991f061e738cdb951bdc9"
const appId = "1454621828917055"

async function sendWhatsAppMessage() {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: { body: "Hello from Node.js WhatsApp API 🚀" },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Message sent:", response.data);
  } catch (error) {
    console.error("Error sending message:", error.response?.data || error.message);
  }
}

sendWhatsAppMessage();


// npm install whatsapp-web.js qrcode-terminal
// const { Client } = require("whatsapp-web.js");
// const qrcode = require("qrcode-terminal");

// const client = new Client();

// client.on("qr", (qr) => {
//   qrcode.generate(qr, { small: true });
// });

// client.on("ready", () => {
//   console.log("WhatsApp is ready!");

//   // Send message
//   client.sendMessage("918347337661@c.us", "Hello from Node.js 🚀");
// });

// client.initialize();



// templet 2
// const axios = require("axios");

// const token = "YOUR_PERMANENT_ACCESS_TOKEN";
// const phoneNumberId = "YOUR_PHONE_NUMBER_ID";

// async function sendInvoice(to, name, invoiceId, amount, invoiceUrl) {
//   try {
//     const response = await axios.post(
//       `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
//       {
//         messaging_product: "whatsapp",
//         to: to, // customer number with country code
//         type: "template",
//         template: {
//           name: "invoice_notification", // your approved template name
//           language: { code: "en" },
//           components: [
//             {
//               type: "body",
//               parameters: [
//                 { type: "text", text: name },
//                 { type: "text", text: invoiceId },
//                 { type: "text", text: amount },
//                 { type: "text", text: invoiceUrl },
//               ],
//             },
//           ],
//         },
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );
//     console.log("Invoice sent:", response.data);
//   } catch (error) {
//     console.error("Error sending invoice:", error.response?.data || error.message);
//   }
// }

// // Example call
// sendInvoice(
//   "918160047249", // customer WhatsApp number
//   "Mayur",
//   "INV-1234",
//   "1500",
//   "https://yourapp.com/invoice/INV-1234"
// );
