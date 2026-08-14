const express = require("express");
const mysql2 = require("mysql2/promise");

const app = express();
app.use(express.json());
const port = 3000;

const db = mysql2.createPool({
  host: "127.0.0.1",
  port: 3306,
  user: "root",
  password: "",
  database: "nodeAssignment4",

  waitForConnections: true,
  queueLimit: 0,
  connectionLimit: 4,
});

async function bootstrapDB(app, port = 3000) {
  try {
    const [data, fields] = await db.query(`SELECT 1+1 AS RESULT`);
    console.log(`DB connected `);
    app.listen(port, () =>
      console.log(`Example app listening on port ${port}!`),
    );
  } catch (error) {
    console.log(`Fail to connect on DB `, error.message);
  }
}

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// PRODUCTS
// Create product
app.post("/products", async (req, res, next) => {
  const { ProductName, Price, StockQuantity, SupplierID } = req.body;
  const [result] = await db.query(
    "INSERT INTO Products (ProductName, Price, StockQuantity, SupplierID) VALUES (?, ?, ?, ?)",
    [ProductName, Price, StockQuantity, SupplierID],
  );
  res.status(201).json({ ProductID: result.insertId, ...req.body });
});
// select all products
app.get("/products", async (req, res, next) => {
  const [rows] = await db.query("SELECT * FROM Products");
  res.json(rows);
});
// get product by id
app.get("/products/:id", async (req, res, next) => {
  const[rows] = await db.query("SELECT * FROM Products WHERE ProductID = ?", [
    req.params.id,
  ]);
  if (rows.length === 0) return res.status(404).json({ error: "Not found" });
  res.json(rows[0]);
});
// UPDATE product
app.put("/products/:id", async (req, res) => {
  const { ProductName, Price, StockQuantity, SupplierID } = req.body;
  await db.query(
    "UPDATE Products SET ProductName=?, Price=?, StockQuantity=?, SupplierID=? WHERE ProductID=?",
    [ProductName, Price, StockQuantity, SupplierID, req.params.id],
  );
  res.json({ message: "Product updated" });
});
// DELETE product
app.delete("/products/:id", async (req, res) => {
  await db.query("DELETE FROM Products WHERE ProductID=?", [req.params.id]);
  res.json({ message: "Product deleted" });
});




// Suppliers
// create supplier
app.post("/suppliers", async (req, res, next) => {
  const { SupplierName, ContactNumber } = req.body;
  const [result] = await db.query(
    "INSERT INTO Suppliers ( SupplierName, ContactNumber ) VALUES ( ?, ?)",
    [SupplierName, ContactNumber],
  );
  res.status(201).json({ SupplierID: result.insertId, ...req.body });
});
// select all suppliers
app.get("/suppliers", async (req, res, next) => {
  const [rows] = await db.query("SELECT * FROM Suppliers");
  res.json(rows);
});
// UPDATE supplier
app.put("/suppliers/:id", async (req, res) => {
  const {SupplierName, ContactNumber } = req.body;
  await db.query(
    "UPDATE Suppliers SET SupplierName=?, ContactNumber=?",
    [SupplierName, ContactNumber],
  );
  res.json({ message: "Supplier updated" });
});
// DELETE supplier
app.delete("/suppliers/:id", async (req, res) => {
  await db.query("DELETE FROM Suppliers WHERE SupplierID=?", [req.params.id]);
  res.json({ message: "Supplier deleted" });
});




//Sales
// record sale
app.post("/sales", async (req, res, next) => {
  const { ProductID	,QuantitySold,SaleDate } = req.body;
  const [result] = await db.query(
    "INSERT INTO Sales ( ProductID,QuantitySold,SaleDate ) VALUES ( ?, ?, ?)",
    [ProductID,QuantitySold,SaleDate],
  );
  res.status(201).json({ SaleID: result.insertId, ...req.body });
});
// select all Sales
app.get("/sales", async (req, res, next) => {
  const [rows] = await db.query("SELECT * FROM Sales");
  res.json(rows);
});
// get Sale by id
app.get("/sales/:id", async (req, res, next) => {
  const[rows] = await db.query("SELECT * FROM Sales WHERE SaleID = ?", [
    req.params.id,
  ]);
  if (rows.length === 0) return res.status(404).json({ error: "Not found" });
  res.json(rows[0]);
});



// modifications
// add category to product table
app.post("/schema/add-category", async (req, res, next) => {
  await db.query(
"ALTER TABLE Products ADD COLUMN Category VARCHAR(100)"
  );
    res.json({ message: 'Category column added' });
});
// delete category from product table
app.post("/schema/delete-category", async (req, res, next) => {
  await db.query(
"ALTER TABLE Products DROP COLUMN Category"
  );
    res.json({ message: 'Category column removed' });
});
// Change ContactNumber to VARCHAR(15).
app.post("/schema/contact-varchar15", async (req, res, next) => {
  await db.query(
"ALTER TABLE Suppliers MODIFY COLUMN ContactNumber VARCHAR(15)")
  res.json({ message: 'ContactNumber changed to VARCHAR(15)' });
});
// Add a NOT NULL constraint to ProductName.
app.post('/schema/productname-notnull', async (req, res) => {
  await db.query('ALTER TABLE Products MODIFY ProductName VARCHAR(255) NOT NULL');
  res.json({ message: 'NOT NULL constraint added to ProductName' });
});

// SEED DATA 
app.post('/seed', async (req, res) => {
  const [supplierResult] = await db.query(
    'INSERT INTO Suppliers (SupplierName, ContactNumber) VALUES (?, ?)',
    ['FreshFoods', '01001234567']
  );
  const supplierId = supplierResult.insertId;

  const [milkResult] = await db.query(
    'INSERT INTO Products (ProductName, Price, StockQuantity, SupplierID) VALUES (?, ?, ?, ?)',
    ['Milk', 15.00, 50, supplierId]
  );
  await db.query(
    'INSERT INTO Products (ProductName, Price, StockQuantity, SupplierID) VALUES (?, ?, ?, ?)',
    ['Bread', 10.00, 30, supplierId]
  );
  await db.query(
    'INSERT INTO Products (ProductName, Price, StockQuantity, SupplierID) VALUES (?, ?, ?, ?)',
    ['Eggs', 20.00, 40, supplierId]
  );

  await db.query(
    'INSERT INTO Sales (ProductID, QuantitySold, SaleDate) VALUES (?, ?, ?)',
    [milkResult.insertId, 2, '2025-05-20']
  );

  res.json({ message: 'Seed data inserted' });
});

//  UPDATE / DELETE

app.put('/products/bread/price', async (req, res) => {
  await db.query("UPDATE Products SET Price=25.00 WHERE ProductName='Bread'");
  res.json({ message: 'Bread price updated to 25.00' });
});

app.delete('/products/eggs', async (req, res) => {
  await db.query("DELETE FROM Products WHERE ProductName='Eggs'");
  res.json({ message: 'Eggs deleted' });
});


// 8. REPORTING 


// Total quantity sold per product
app.get('/reports/total-sold', async (req, res) => {
  const [rows] = await db.query(`
    SELECT p.ProductID, p.ProductName, SUM(s.QuantitySold) AS TotalSold
    FROM Sales s
    JOIN Products p ON s.ProductID = p.ProductID
    GROUP BY p.ProductID, p.ProductName
  `);
  res.json(rows);
});

// Product with highest stock quantity
app.get('/reports/highest-stock', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM Products ORDER BY StockQuantity DESC LIMIT 1');
  res.json(rows[0]);
});

// Suppliers whose names start with 'F'
app.get('/reports/suppliers-f', async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Suppliers WHERE SupplierName LIKE 'F%'");
  res.json(rows);
});

// Products never sold
app.get('/reports/never-sold', async (req, res) => {
  const [rows] = await db.query(`
    SELECT p.*
    FROM Products p
    LEFT JOIN Sales s ON p.ProductID = s.ProductID
    WHERE s.SaleID IS NULL
  `);
  res.json(rows);
});

// All sales with product name, quantity, date
app.get('/reports/sales-detail', async (req, res) => {
  const [rows] = await db.query(`
    SELECT p.ProductName, s.QuantitySold, s.SaleDate
    FROM Sales s
    JOIN Products p ON s.ProductID = p.ProductID
  `);
  res.json(rows);
});


bootstrapDB(app, port);
