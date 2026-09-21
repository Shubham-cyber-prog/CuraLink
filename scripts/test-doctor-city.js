const http = require('http');

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Testing GET /api/doctors and city filtering...');
  
  // 1. All doctors
  const allRes = await get('http://localhost:5000/api/doctors');
  console.log('1. All Doctors Count:', allRes.data.data.length);
  console.log('   Doctors:', allRes.data.data.map(d => ({ name: d.name, city: d.city })));

  // 2. City = Hisar
  const hisarRes = await get('http://localhost:5000/api/doctors?city=Hisar');
  console.log('2. Hisar Doctors Count:', hisarRes.data.data.length);
  console.log('   Doctors:', hisarRes.data.data.map(d => ({ name: d.name, city: d.city })));

  // 3. City = New Delhi (case-insensitive "new delhi")
  const delhiRes = await get('http://localhost:5000/api/doctors?city=new%20delhi');
  console.log('3. New Delhi Doctors Count:', delhiRes.data.data.length);
  console.log('   Doctors:', delhiRes.data.data.map(d => ({ name: d.name, city: d.city })));

  // 4. City = Mumbai (no doctors)
  const mumbaiRes = await get('http://localhost:5000/api/doctors?city=Mumbai');
  console.log('4. Mumbai Doctors Count:', mumbaiRes.data.data.length);

  // 5. Verified endpoint with city
  const verifiedRes = await get('http://localhost:5000/api/doctors/verified?city=hisar');
  console.log('5. /doctors/verified?city=hisar Count:', verifiedRes.data.data.length);
}

run().catch(console.error);
