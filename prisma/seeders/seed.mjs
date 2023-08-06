import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import { v4 as uuid4 } from "uuid";

const prisma = new PrismaClient();

async function main() {
  const ammountOfOrders = 100000;

  // let orders = [];

  for (let i = 0; i < ammountOfOrders; i++) {
    const orderId = uuid4();
    const userId = 1;
    const status = faker.helpers.arrayElement(["Producent", "Magazyn", "Dostawa", "Zrealizowane", "Anulowane"]);
    const orderType = faker.helpers.arrayElement(["Zwrot", "Odbior", "Dostawa"]);
    const orderCountry = "Polska";
    const currency = "PLN";
    const orderStreet = faker.location.street();
    const orderStreetNumber = faker.number.int({ min: 1, max: 100 }).toString();
    const orderFlatNumber = faker.number.int({ min: 1, max: 100 }).toString();
    const orderCity = faker.location.city();
    const orderPostCode = faker.location.zipCode();
    const orderState = faker.location.state();
    const orderNote = faker.lorem.sentence();
    const recipientName = faker.person.firstName();
    const recipientPhone = faker.phone.number("###-###-###");
    const recipientEmail = faker.internet.email();
    const createdAt = faker.date.past();
    const updatedAt = faker.date.recent();
    let orderPackages = [];

    for (let i = 0; i < faker.number.int({ min: 1, max: 5 }); i++) {
      const packageId = uuid4();
      const commodityType = faker.helpers.arrayElement(["Paczka", "Paleta", "Gabaryt"]);
      const commodityName = faker.commerce.productName();
      const commodityPaymentType = faker.helpers.arrayElement(["Pobranie", "Przelew"]);
      let commodityPrice;
      const commodityNote = faker.lorem.sentence(2);

      if (commodityPaymentType === "Pobranie") {
        commodityPrice = faker.number.int({ min: 1, max: 10000 });
      } else {
        commodityPrice = 0;
      }

      orderPackages.push({
        packageId,
        commodityName,
        commodityPrice,
        commodityPaymentType,
        commodityNote,
        commodityType,
      });
    }

    const order = {
      orderId: orderId,
      userId: userId,
      status: status,
      orderType: orderType,
      orderCountry: orderCountry,
      orderStreet: orderStreet,
      orderStreetNumber: orderStreetNumber,
      orderFlatNumber: orderFlatNumber,
      orderCity: orderCity,
      orderPostCode: orderPostCode,
      orderState: orderState,
      orderNote: orderNote,
      recipientName: recipientName,
      recipientPhone: recipientPhone,
      recipientEmail: recipientEmail,
      createdAt: createdAt,
      updatedAt: updatedAt,
      currency: currency,
      packages: {
        create: orderPackages,
      },
    };

    await prisma.order.create({ data: order });

    // orders.push(order);
  }

  // const addOrders = async () => await prisma.order.createMany({ data: orders });
  // addOrders();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
