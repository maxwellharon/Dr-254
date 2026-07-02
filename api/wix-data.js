// api/wix-data.js
export default async function handler(req, res) {
    // Handle CORS preflight routing
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(200).end();
    }

    const { method } = req;
    const { collection, id } = req.query;

    if (!collection) {
        return res.status(400).json({ error: 'Missing collection parameter mapping' });
    }

    // Double-check your Vercel Dashboard Environment settings if these log as undefined!
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': process.env.WIX_API_KEY,
        'wix-account-id': process.env.WIX_ACCOUNT_ID,
        'wix-site-id': process.env.WIX_SITE_ID
    };

    try {
        if (method === 'GET') {
            const response = await fetch('https://www.wixapis.com/wix-data/v1/items/query', {
                method: 'POST',
                headers,
                body: JSON.stringify({ dataCollectionId: collection })
            });
            const data = await response.json();
            return res.status(response.ok ? 200 : response.status).json(data);
        }

        else if (method === 'POST') {
            const body = req.body || {};
            if (!body.item) {
                return res.status(400).json({ error: 'Missing item data matrix in payload body' });
            }
            const response = await fetch('https://www.wixapis.com/wix-data/v1/items', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    dataCollectionId: collection,
                    dataItem: body.item
                })
            });
            const data = await response.json();
            return res.status(response.ok ? 200 : response.status).json(data);
        }

        else if (method === 'DELETE') {
            if (!id) {
                return res.status(400).json({ error: 'Missing specific unique id parameter' });
            }
            const response = await fetch(`https://www.wixapis.com/wix-data/v1/items/${id}`, {
                method: 'DELETE',
                headers,
                body: JSON.stringify({})
            });
            if (response.ok) {
                return res.status(200).json({ success: true });
            }
            const err = await response.json();
            return res.status(response.status).json(err);
        }

        else if (method === 'PATCH') {
            const body = req.body || {};
            if (!body.items || !Array.isArray(body.items)) {
                return res.status(400).json({ error: 'Missing batch items array structure' });
            }
            const response = await fetch('https://www.wixapis.com/wix-data/v1/bulk/items/insert', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    dataCollectionId: collection,
                    dataItems: body.items
                })
            });
            const data = await response.json();
            return res.status(response.ok ? 200 : response.status).json(data);
        }

        else {
            return res.status(405).json({ error: 'Requested CRUD method signature not supported' });
        }
    } catch (error) {
        console.error('Production Serverless Core Proxy Error:', error);
        return res.status(500).json({ error: error.message });
    }
}