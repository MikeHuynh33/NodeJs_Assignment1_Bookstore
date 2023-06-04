// Import essential libraries
const express = require("express");
const app = express();
const path = require("path");
// Enject pug
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
// set Directory in public folder
app.use(express.static(path.join(__dirname, "public")));
// Add Json convert
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
require("dotenv").config();
// Set Up Mongo DB connection
const { MongoClient } = require("mongodb");
const client = new MongoClient(process.env.MONGODB_URL);
async function connection() {
  db = client.db("assignment1");
  return db;
}
// Add new Order to database.
async function addOrder(newOrder) {
  db = await connection();
  try {
    db.collection("books_order_transaction").insertOne(newOrder);
  } catch (err) {
    return err;
  }
  return "Successful";
}
// List all Orders from database.
async function listOrder() {
  db = await connection();
  let result = db.collection("books_order_transaction").find({});
  let res = await result.toArray();
  return res;
}
// Handle Get request "/" and render Index.pug
app.get("/", (req, res) => {
  res.render("index", { title: "Home" });
});
// Handle Get request "/Books" and render Books.pug
app.get("/Books", (req, res) => {
  // Call API
  let searchBookName = req.query.bookName;
  const apiKey = process.env.API_KEY;
  if (searchBookName) {
    let url =
      "https://www.googleapis.com/books/v1/volumes?q=" +
      searchBookName +
      "&key=" +
      apiKey;
    fetch(url)
      .then((result) => {
        return result.json();
      })
      .then((data) => {
        res.render("books", { title: "Books", data: data });
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    res.render("books", { title: "Books" });
  }
});
// Handle POST reuest "/Books/TransactionProcess" from books.js
app.post("/Books/TransactionProcess", async (req, res) => {
  const data = req.body;
  let orderNumber = data.order[0].orderId;
  //remove orderId
  data.order.shift();
  let rewriteJson = {
    orderNumer: orderNumber,
    orderDetail: data.order,
  };
  let errorhandler = await addOrder(rewriteJson);
  if (errorhandler == "Successful") {
    res.status(200).json({ message: "Transaction processed successfully" });
  } else {
    res.status(500).json({ message: "Transaction processed Unsuccessfully" });
  }
});
app.get("/Lists", async (req, res) => {
  let listOfOrder = await listOrder();
  res.render("list", { title: "Lists", listOfOrder: listOfOrder });
});
app.listen(process.env.port || 3000);
console.log("Running at Port 3000");
