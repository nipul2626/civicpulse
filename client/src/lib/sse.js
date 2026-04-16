// src/lib/sse.js — add this file to the frontend

const SSE_URL = import.meta.env.VITE_API_BASE_URL;

export function connectSSE(orgId, channels = ['needs', 'tasks', 'queue', 'heatmap']) {
    const url = `${SSE_URL}/api/sse/stream?channels=${channels.join(',')}&orgId=${orgId}`;
    const es = new EventSource(url);

    es.addEventListener('connected', (e) => {
        console.log('SSE connected:', JSON.parse(e.data));
    });

    // Need scored by AI — update the need card in real time
    es.addEventListener('need:scored', (e) => {
        const data = JSON.parse(e.data);
        // Update your React state / store with the new urgency score
        console.log('Need scored:', data.needId, 'urgency:', data.urgencyScore);
    });

    // Need status changed — refresh coordinator dashboard
    es.addEventListener('need:updated', (e) => {
        const data = JSON.parse(e.data);
        console.log('Need updated:', data.needId, 'status:', data.status);
    });

    // New need submitted — update heatmap
    es.addEventListener('heatmap:new-need', (e) => {
        const data = JSON.parse(e.data);
        console.log('New need on heatmap:', data.lat, data.lng);
    });

    // Need resolved — remove from heatmap
    es.addEventListener('heatmap:need-resolved', (e) => {
        const data = JSON.parse(e.data);
        console.log('Need resolved, remove from heatmap:', data.needId);
    });

    // Task status changed — update kanban board
    es.addEventListener('task:updated', (e) => {
        const data = JSON.parse(e.data);
        console.log('Task updated:', data.taskId, 'status:', data.status);
    });

    // Queue position update — show to community member after submission
    es.addEventListener('queue:status', (e) => {
        const data = JSON.parse(e.data);
        console.log('Queue depth:', data.pendingCount, 'wait:', data.avgWaitSeconds, 's');
    });

    es.onerror = () => {
        console.log('SSE disconnected — browser will auto-reconnect');
    };

    return es; // call es.close() to disconnect
}

// Usage in a React component:
// useEffect(() => {
//   const es = connectSSE(orgId);
//   return () => es.close(); // cleanup on unmount
// }, [orgId]);