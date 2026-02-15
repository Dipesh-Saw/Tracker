const platforms = ["PEGA", "WISE"];

const Queue = ["Queue1", "Queue2", "Queue3"];

const documentType = {
  Queue1: ["DC", "Probate", "Trust Cert", "AOD"],
  Queue2: ["Apple", "Banana", "Cherry", "Mango"],
  Queue3: ["Car", "Bike", "Truck", "Plane"],
};
const hello = "Hello";

const Objects = { platforms, Queue, documentType, hello };

module.exports = { Objects };
