async function test() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@nemuspace.id',
        password: 'password'
      })
    });
    console.log('Status:', res.status);
    console.log('Headers:', res.headers);
    const text = await res.text();
    console.log('Data:', text);
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
