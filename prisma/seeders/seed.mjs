import { PrismaClient } from "@prisma/client";
import Bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";
import { v4 as uuid4 } from "uuid";

const prisma = new PrismaClient();

async function CreateAdmin() {
  console.log("Start seeding ...");
  const salt = await Bcrypt.genSalt(10);
  const hashedPassword = await Bcrypt.hash("admin", salt);

  // Check if admin exist
  const userExists = await prisma.user.findUnique({
    where: {
      email: "admin@admin.pl",
    },
  });

  if (!userExists) {
    console.log("Creating admin ...");
    const ADMIN = await prisma.user.create({
      data: {
        email: "admin@admin.pl",
        phone: "123456789",
        password: hashedPassword,
        company: "Admin Test Company",
        nip: "11122233",
        country: "Polska",
        city: "Warszawa",
        address: "Adminowa 30",
        role: "ADMIN",
      },
    });
  } else {
    console.log("User already exists ", userExists);
  }
}

async function CreateFakeOrders() {
  const ammountOfOrders = 10000;
  const ORDERS_AMMOUNT = await prisma.order.count();

  if (ORDERS_AMMOUNT <= ammountOfOrders) {
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
          // commodityPrice,
          // commodityPaymentType,
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
        orderPaymentType: "Przelew",
        packages: {
          create: orderPackages,
        },
      };

      await prisma.order.create({ data: order });
    }
  } else {
    console.log("Dummy orders already exist ", ORDERS_AMMOUNT);
  }
}

async function CreateDummyContent() {
  await CreateAdmin();
  await CreateFakeOrders();
}

CreateDummyContent()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });