import { extractPhones } from "../facebook/facebokUtils";

const tests = [
  "King size Solid wood Bed with Mattress for sale\
Selling a solid wood King size bed with 8 inch spring mattress which is in excellent condition.\
Bed size: 72 X 78 inches\
Mattress: Repose Extrabond Luxury pocketed spring mattress 8 inch.\
Selling Price: INR 20,000\
Location: Norbert Church Road, Kasavanahalli, 560035\
Mobile/WhatsApp: 8369231820\
DM for more details",
];

for (const string of tests) {
  extractPhones(string).forEach((phone) =>
    console.log("Extracted phone: ", phone)
  );
}
