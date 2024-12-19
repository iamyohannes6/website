const fetch = require('node-fetch');

const PINTEREST_APP_ID = process.env.PINTEREST_APP_ID;
const PINTEREST_ACCESS_TOKEN = process.env.PINTEREST_ACCESS_TOKEN;

const BOARD_IDS = [
    'iamyohannes6/made-by-me-winball-betting',
    'iamyohannes6/made-by-me-clubs',
    'iamyohannes6/made-by-me-graphic-designs'
];

exports.handler = async (event) => {
    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Methods': 'GET, OPTIONS'
            }
        };
    }

    console.log('Pinterest function started');
    console.log('App ID:', PINTEREST_APP_ID);
    console.log('Token available:', !!PINTEREST_ACCESS_TOKEN);

    if (!PINTEREST_ACCESS_TOKEN || !PINTEREST_APP_ID) {
        console.error('Pinterest credentials not configured');
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                error: 'Pinterest API not configured'
            })
        };
    }

    try {
        console.log('Fetching pins from boards:', BOARD_IDS);
        
        // Fetch pins from all boards
        const allPins = await Promise.all(
            BOARD_IDS.map(async boardId => {
                const url = `https://api.pinterest.com/v5/boards/${boardId}/pins`;
                console.log('Fetching from URL:', url);
                
                try {
                    const response = await fetch(url, {
                        headers: {
                            'Authorization': `Bearer ${PINTEREST_ACCESS_TOKEN}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error(`Error fetching board ${boardId}:`, errorText);
                        return { items: [] };
                    }
                    
                    return await response.json();
                } catch (error) {
                    console.error(`Error fetching board ${boardId}:`, error);
                    return { items: [] };
                }
            })
        );

        console.log('Raw API responses:', JSON.stringify(allPins, null, 2));

        // Combine and shuffle pins from all boards
        const combinedPins = allPins
            .flatMap(response => response.items || [])
            .filter(pin => {
                if (!pin.media?.images?.original) {
                    console.log('Filtered out pin missing image:', pin);
                    return false;
                }
                return true;
            })
            .map(pin => ({
                id: pin.id,
                title: pin.title || '',
                description: pin.description || '',
                imageUrl: pin.media.images.original.url,
                link: pin.link || `https://pinterest.com/pin/${pin.id}`
            }));

        console.log('Processed pins count:', combinedPins.length);

        // Shuffle the pins
        const shuffledPins = combinedPins.sort(() => Math.random() - 0.5);

        // Return only the first 12 pins
        const selectedPins = shuffledPins.slice(0, 12);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify({
                success: true,
                pins: selectedPins
            })
        };
    } catch (error) {
        console.error('Pinterest API Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                error: 'Failed to fetch Pinterest pins',
                details: error.message
            })
        };
    }
};
