const http = require('http');
const https = require('https');
const { MongoClient, ObjectId } = require('mongodb');

// SMS Helper function to interface with Text.lk SMS API
function sendSMS(recipient, message) {
    return new Promise((resolve) => {
        if (!recipient) {
            console.warn("SMS warning: No recipient provided.");
            return resolve({ status: 'error', message: 'No recipient phone number provided' });
        }

        // Clean up recipient phone number (keep digits only)
        let cleanPhone = recipient.replace(/\D/g, '');
        
        // Convert Sri Lankan numbers to 94XXXXXXXXX format
        if (cleanPhone.startsWith('0')) {
            cleanPhone = '94' + cleanPhone.substring(1);
        } else if (cleanPhone.length === 9 && cleanPhone.startsWith('7')) {
            cleanPhone = '94' + cleanPhone;
        }

        const apiToken = '5929|TFHn3o63Xur8hpFiQ2xXRWOz8rA3okn8qF9LHlWA646ab2e8';
        const senderId = 'TextLKDemo';

        const postData = JSON.stringify({
            recipient: cleanPhone,
            sender_id: senderId,
            type: 'plain',
            message: message
        });

        const options = {
            hostname: 'app.text.lk',
            path: '/api/v3/sms/send',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        console.log(`Sending SMS to ${cleanPhone}: "${message}"`);

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    console.log(`SMS Sent. API Response:`, parsed);
                    resolve(parsed);
                } catch (e) {
                    console.error(`SMS Parse Error:`, data);
                    resolve({ status: 'error', message: 'Failed to parse response' });
                }
            });
        });

        req.on('error', (e) => {
            console.error("SMS Gateway Error:", e);
            resolve({ status: 'error', message: e.message });
        });

        req.write(postData);
        req.end();
    });
}

// MongoDB URI
const uri = "mongodb+srv://cs_admin:MyPassword123@cluster0.n4ahdav.mongodb.net/?appName=Cluster0"; 
const client = new MongoClient(uri);

async function startServer() {
    try {
        await client.connect();
        console.log("Database connected successfully!");

        const server = http.createServer(async (req, res) => {
            // CORS Headers
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PATCH, DELETE');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

            if (req.method === 'OPTIONS') {
                res.writeHead(200); res.end(); return;
            }

            // --- REGISTER API ---
            if (req.method === 'POST' && req.url === '/api/register') {
                let body = '';
                req.on('data', chunk => { body += chunk; });
                req.on('end', async () => {
                    const userData = JSON.parse(body);
                    await client.db("csbat_db").collection("users").insertOne(userData);
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: "success" }));
                });
                return;
            }

            // --- LOGIN API ---
            if (req.method === 'POST' && req.url === '/api/login') {
                let body = '';
                req.on('data', chunk => { body += chunk; });
                req.on('end', async () => {
                    const { email, password } = JSON.parse(body);
                    const user = await client.db("csbat_db").collection("users").findOne({ email, password });
                    if (user) {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ status: "success" }));
                    } else {
                        res.writeHead(401, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ status: "error", message: "Invalid credentials" }));
                    }
                });
                return;
            }

            // --- GET USER API (Dashboard සඳහා) ---
            if (req.method === 'GET' && req.url.startsWith('/api/user')) {
                const email = new URLSearchParams(req.url.split('?')[1]).get('email');
                const user = await client.db("csbat_db").collection("users").findOne({ email });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(user || {}));
                return;
            }

            // --- UPDATE USER API ---
            if (req.method === 'POST' && req.url === '/api/update') {
                let body = '';
                req.on('data', chunk => { body += chunk; });
                req.on('end', async () => {
                    const { email, fullName, phone, address, city, postalCode } = JSON.parse(body);
                    await client.db("csbat_db").collection("users").updateOne(
                        { email }, 
                        { $set: { fullName, phone, address, city, postalCode } }
                    );
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: "success" }));
                });
                return;
            }

            // --- GET PRODUCTS API ---
            if (req.method === 'GET' && req.url === '/api/products') {
                const collection = client.db("csbat_db").collection("products");
                const productsList = await collection.find({}).toArray();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(productsList));
                return;
            }

            // --- ADD PRODUCT API ---
            if (req.method === 'POST' && req.url === '/api/products') {
                let body = '';
                req.on('data', chunk => { body += chunk; });
                req.on('end', async () => {
                    const productData = JSON.parse(body);
                    await client.db("csbat_db").collection("products").insertOne(productData);
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: "success" }));
                });
                return;
            }

            // --- DELETE PRODUCT API ---
            if (req.method === 'POST' && req.url === '/api/products/delete') {
                let body = '';
                req.on('data', chunk => { body += chunk; });
                req.on('end', async () => {
                    const { id } = JSON.parse(body);
                    await client.db("csbat_db").collection("products").deleteOne({ _id: new ObjectId(id) });
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: "success" }));
                });
                return;
            }

            // --- UPDATE PRODUCT API ---
            if (req.method === 'POST' && req.url === '/api/products/update') {
                let body = '';
                req.on('data', chunk => { body += chunk; });
                req.on('end', async () => {
                    try {
                        const { id, name, category, price, woodType, description, tag, image, batHeight, batWeight, edgeSize, stockCount } = JSON.parse(body);
                        const updateFields = { name, category, price, woodType, description, tag, image, batHeight, batWeight, edgeSize };
                        if (stockCount !== undefined) updateFields.stockCount = parseInt(stockCount) || 0;
                        await client.db("csbat_db").collection("products").updateOne(
                            { _id: new ObjectId(id) },
                            { $set: updateFields }
                        );
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ status: "success" }));
                    } catch (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: err.message }));
                    }
                });
                return;
            }

            // --- GET REVIEWS API ---
            if (req.method === 'GET' && req.url === '/api/reviews') {
                try {
                    const reviews = await client.db("csbat_db").collection("reviews").find({}).sort({ date: -1 }).toArray();
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(reviews));
                } catch (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: err.message }));
                }
                return;
            }

            // --- ADD REVIEW API ---
            if (req.method === 'POST' && req.url === '/api/reviews') {
                let body = '';
                req.on('data', chunk => { body += chunk; });
                req.on('end', async () => {
                    try {
                        const reviewData = JSON.parse(body);
                        // Ensure a date is set
                        if (!reviewData.date) reviewData.date = new Date().toISOString();
                        await client.db("csbat_db").collection("reviews").insertOne(reviewData);
                        res.writeHead(201, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ status: "success" }));
                    } catch (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: err.message }));
                    }
                });
                return;
            }

            // --- GET ORDERS API ---
            if (req.method === 'GET' && req.url === '/api/orders') {
                try {
                    const orders = await client.db("csbat_db").collection("orders").find({}).sort({ date: -1 }).toArray();
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(orders));
                } catch (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: err.message }));
                }
                return;
            }

            // --- ADD ORDER API ---
            if (req.method === 'POST' && req.url === '/api/orders') {
                let body = '';
                req.on('data', chunk => { body += chunk; });
                req.on('end', async () => {
                    try {
                        const orderData = JSON.parse(body);
                        if (!orderData.date) orderData.date = new Date().toISOString();
                        orderData.status = orderData.status || 'order'; // default status
                        
                        // Generate custom 8-character order ID (e.g. CS000001)
                        const count = await client.db("csbat_db").collection("orders").countDocuments();
                        let nextNum = count + 1;
                        let customId = `CS${String(nextNum).padStart(6, '0')}`;
                        
                        // Ensure uniqueness in case of gaps or deletions
                        while (true) {
                            const existing = await client.db("csbat_db").collection("orders").findOne({ _id: customId });
                            if (!existing) break;
                            nextNum++;
                            customId = `CS${String(nextNum).padStart(6, '0')}`;
                        }
                        
                        orderData._id = customId;
                        
                        const result = await client.db("csbat_db").collection("orders").insertOne(orderData);
                        
                        // --- STOCK COUNT DECREMENT ---
                        // Decrement stockCount for each product in the order based on cartItems data
                        if (orderData.cartItems && Array.isArray(orderData.cartItems)) {
                            for (const cartItem of orderData.cartItems) {
                                const productId = cartItem.productId;
                                const qty = parseInt(cartItem.quantity) || 1;
                                if (productId) {
                                    try {
                                        await client.db("csbat_db").collection("products").updateOne(
                                            { _id: new ObjectId(productId) },
                                            { $inc: { stockCount: -qty } }
                                        );
                                        console.log(`Stock decremented for product ${productId} by ${qty}`);
                                    } catch (stockErr) {
                                        console.error(`Failed to decrement stock for product ${productId}:`, stockErr);
                                    }
                                }
                            }
                        }
                        
                        // Send SMS notification to customer upon order placement
                        const orderId = result.insertedId.toString();
                        let smsMsg = '';
                        if (orderData.status === 'pending_payment') {
                            smsMsg = `Dear ${orderData.client || 'Customer'}, your order at CS Bat Labs has been received (ID: ${orderId}). It is pending bank transfer slip review. We will notify you once confirmed.`;
                        } else {
                            smsMsg = `Dear ${orderData.client || 'Customer'}, thank you for your order with CS Bat Labs! Your order (ID: ${orderId}) is confirmed. We will begin processing your bat soon.`;
                        }
                        
                        if (orderData.phone) {
                            sendSMS(orderData.phone, smsMsg).catch(err => console.error("SMS notification failed:", err));
                        } else {
                            console.warn("Could not send order confirmation SMS: no phone number provided.");
                        }

                        res.writeHead(201, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ status: "success", orderId: result.insertedId }));
                    } catch (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: err.message }));
                    }
                });
                return;
            }

            // --- UPDATE ORDER STATUS API ---
            if (req.method === 'POST' && req.url === '/api/orders/update-status') {
                let body = '';
                req.on('data', chunk => { body += chunk; });
                req.on('end', async () => {
                    try {
                        const { id, status } = JSON.parse(body);
                        
                        // Safely parse ObjectId if valid, otherwise use the string id directly
                        const queryId = (ObjectId.isValid(id) && id.length === 24) ? new ObjectId(id) : id;
                        
                        // Fetch the order from DB first to get client name and phone number
                        const order = await client.db("csbat_db").collection("orders").findOne({ _id: queryId });
                        
                        if (!order) {
                            res.writeHead(404, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ status: "error", message: "Order not found" }));
                            return;
                        }

                        // Let's add confirmDate if status is changing to 'confirm'
                        const updateFields = { status };
                        if (status === 'confirm') {
                            updateFields.confirmDate = new Date().toISOString();
                        }
                        
                        await client.db("csbat_db").collection("orders").updateOne(
                            { _id: queryId },
                            { $set: updateFields }
                        );

                        // Send status update SMS if the status has actually changed
                        if (order.status !== status && order.phone) {
                            let statusMsg = '';
                            switch(status) {
                                case 'confirm':
                                    statusMsg = `Dear ${order.client || 'Customer'}, your order at CS Bat Labs (ID: ${id}) has been confirmed! Production will begin shortly.`;
                                    break;
                                case 'customize':
                                    statusMsg = `Dear ${order.client || 'Customer'}, your CS Bat order (ID: ${id}) is now in the production phase. Customizer specs are being applied.`;
                                    break;
                                case 'finish':
                                    statusMsg = `Dear ${order.client || 'Customer'}, your customized CS Bat (ID: ${id}) is complete and ready for dispatch. We will ship it shortly.`;
                                    break;
                                case 'deliveried':
                                    statusMsg = `Dear ${order.client || 'Customer'}, your CS Bat order (ID: ${id}) has been delivered successfully! Thank you for choosing CS Bat Labs. Play hard!`;
                                    break;
                                case 'payment_failed':
                                    statusMsg = `Dear ${order.client || 'Customer'}, order (ID: ${id}) payment verification has failed. Please verify receipt details or contact support.`;
                                    break;
                                case 'pending_payment':
                                    statusMsg = `Dear ${order.client || 'Customer'}, your order (ID: ${id}) is pending payment review.`;
                                    break;
                                case 'order':
                                    statusMsg = `Dear ${order.client || 'Customer'}, your order (ID: ${id}) status is pending.`;
                                    break;
                            }

                            if (statusMsg) {
                                sendSMS(order.phone, statusMsg).catch(err => console.error("Status update SMS failed:", err));
                            }
                        }

                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ status: "success" }));
                    } catch (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: err.message }));
                    }
                });
                return;
            }

            // --- GET BANK DETAILS API ---
            if (req.method === 'GET' && req.url === '/api/bank-details') {
                try {
                    const settings = await client.db("csbat_db").collection("settings").findOne({ key: 'bank_details' });
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(settings ? settings.data : null));
                } catch (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: err.message }));
                }
                return;
            }

            // --- SAVE BANK DETAILS API ---
            if (req.method === 'POST' && req.url === '/api/bank-details') {
                let body = '';
                req.on('data', chunk => { body += chunk; });
                req.on('end', async () => {
                    try {
                        const bankData = JSON.parse(body);
                        await client.db("csbat_db").collection("settings").updateOne(
                            { key: 'bank_details' },
                            { $set: { key: 'bank_details', data: bankData, updatedAt: new Date().toISOString() } },
                            { upsert: true }
                        );
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ status: "success" }));
                    } catch (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: err.message }));
                    }
                });
                return;
            }

            res.end('Server is Running!');
        });

        server.listen(5001, () => console.log('Server running on port 5001'));
    } catch (e) {
        console.error("Database error:", e);
    }
}
startServer();