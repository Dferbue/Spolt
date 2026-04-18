import { readFileSync } from 'fs';

async function test() {
    const apiKey = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzcG9sdHNlcnZpY2VAZ21haWwuY29tIiwianRpIjoiMzEyOTBkYmQtNDZmYy00ODAwLTg0ZDUtYzMyZjkzNzU4ZjAyIiwiaXNzIjoiQUVNRVQiLCJpYXQiOjE3NzYyNjc3NzYsInVzZXJJZCI6IjMxMjkwZGJkLTQ2ZmMtNDgwMC04NGQ1LWMzMmY5Mzc1OGYwMiIsInJvbGUiOiIifQ.lBgWP0g26kbjUGgZLSg-EyY31w577axMAl-bEvDRjCM";
    const url = `https://opendata.aemet.es/opendata/api/maestro/municipios?api_key=${apiKey}`;
    try {
        const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
        const val = await res.json();
        console.log("Val: ", val);
        const resData = await fetch(val.datos);
        const municipios = await resData.json();
        
        console.log("Total:", municipios.length);
        const malaga = municipios.find((m: any) => m.nombre.toLowerCase().includes('málaga'));
        console.log("Malaga raw:", malaga);
        
        // Let's test distancing
        let closestId = '28079';
        let minDistance = Infinity;
        const userLat = 36.7212;
        const userLon = -4.4213;

        for (const muni of municipios) {
            if (!muni.latitud_dec || !muni.longitud_dec) continue;

            const mLat = parseFloat(muni.latitud_dec.toString().replace(',', '.'));
            const mLon = parseFloat(muni.longitud_dec.toString().replace(',', '.'));

            const R = 6371; 
            const dLat = (mLat - userLat) * Math.PI / 180;
            const dLon = (mLon - userLon) * Math.PI / 180;
            const a = 
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(userLat * Math.PI / 180) * Math.cos(mLat * Math.PI / 180) * 
                Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            const dist = R * c; 

            if (dist < minDistance) {
                minDistance = dist;
                closestId = muni.id.replace('id', '');
            }
        }
        console.log("Closest to 36.7212, -4.4213 is:", closestId, "at distance:", minDistance);

    } catch (e) {
        console.error(e);
    }
}

test();
