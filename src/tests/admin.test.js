// 1. Crear usuario admin
await User.create({ username: 'admin', password: '1234', isAdmin: true });

// 2. Login y obtener token
const res = await request(app)
  .post('/api/login')
  .send({ username: 'admin', password: '1234' });
const token = res.body.token;

// 3. Usar token en la ruta protegida
const response = await request(app)
  .get('/api/admin/posts') 
  .set('Authorization', `Bearer ${token}`);

console.log(response.body);
