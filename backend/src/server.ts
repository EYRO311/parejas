import app from './app';
import { env } from './config/env';

app.listen(env.PORT, () => {
  console.log(`Backend de Finanzas en Pareja escuchando en :${env.PORT}`);
});
