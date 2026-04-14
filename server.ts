import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { Resend } from 'resend';
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Helper function to calculate shipping rates based on custom zones
  const calculateShippingRates = async (cp_destino: string, provincia: string) => {
    const provNorm = provincia.toLowerCase().trim();
    
    let priceDomicilio = 10000; // Default para todas las provincias

    if (['salta', 'córdoba', 'cordoba'].includes(provNorm)) {
      priceDomicilio = 3000;
    }

    return [
      { id: "domicilio", name: "Envío a Domicilio", price: priceDomicilio },
      { id: "taller", name: "Retiro por el taller", price: 0 }
    ];
  };

  // Mercado Pago Endpoint
  app.post("/api/create-preference", async (req, res) => {
    try {
      const { items, origin, shippingMethod, payer } = req.body;
      
      const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
      if (!accessToken) {
        return res.status(500).json({ error: "MERCADO_PAGO_ACCESS_TOKEN no está configurado." });
      }

      const client = new MercadoPagoConfig({ accessToken });
      const preference = new Preference(client);

      const mpItems = items.map((item: any) => ({
        title: `${item.product.name} - ${item.color} - Talle ${item.size}`,
        unit_price: item.price,
        quantity: item.quantity,
        currency_id: 'ARS'
      }));

      // Recalculate shipping cost in backend
      let finalShippingCost = 0;
      let finalShippingMethod = shippingMethod || 'Estándar';

      if (payer && payer.postalCode && payer.province && shippingMethod) {
        const rates = await calculateShippingRates(payer.postalCode, payer.province);
        const selectedRate = rates.find(r => r.name === shippingMethod);
        if (selectedRate) {
          finalShippingCost = selectedRate.price;
        }
      }

      if (finalShippingCost > 0) {
        mpItems.push({
          title: `Envío - ${finalShippingMethod}`,
          unit_price: finalShippingCost,
          quantity: 1,
          currency_id: 'ARS'
        });
      }

      const baseUrl = origin || `${req.protocol}://${req.get('host')}`;

      // Build payer object for Mercado Pago
      let mpPayer: any = undefined;
      if (payer) {
        mpPayer = {
          name: payer.firstName,
          surname: payer.lastName,
          email: payer.email,
          phone: {
            area_code: "",
            number: payer.phone
          },
          address: {
            zip_code: payer.postalCode,
            street_name: payer.street,
            street_number: payer.number
          }
        };
        if (payer.dni) {
          mpPayer.identification = {
            type: "DNI",
            number: payer.dni
          };
        }
      }

      const response = await preference.create({
        body: {
          items: mpItems,
          payer: mpPayer,
          back_urls: {
            success: `${baseUrl}/?status=success`,
            failure: `${baseUrl}/?status=failure`,
            pending: `${baseUrl}/?status=pending`,
          },
          auto_return: "approved",
        }
      });

      res.json({ init_point: response.init_point });
    } catch (error: any) {
      console.error("Error creating preference:", error);
      
      // Extract more details from the Mercado Pago error if available
      const mpError = error.cause || error.message;
      const details = error.response?.data || mpError;
      
      res.status(500).json({ 
        error: "Error al crear la preferencia de pago", 
        details: typeof details === 'object' ? JSON.stringify(details) : details 
      });
    }
  });

  // Cotizar Envío (Lógica Propia)
  app.post("/api/shipping/rates", async (req, res) => {
    try {
      const { cp_destino, provincia } = req.body;
      
      const rates = await calculateShippingRates(cp_destino, provincia);

      res.json({ rates });
    } catch (error: any) {
      console.error("Error fetching rates:", error);
      res.status(500).json({ error: "Error al cotizar el envío" });
    }
  });

  // Enviar Email con Resend
  app.post("/api/send-email", async (req, res) => {
    if (!resend) {
      console.warn("RESEND_API_KEY no está configurada. Simulando envío de email:", req.body);
      return res.json({ success: true, simulated: true });
    }

    const { type, to, customerName, trackingCode, orderId } = req.body;

    try {
      let subject = '';
      let html = '';

      if (type === 'shipped') {
        subject = '¡Tu pedido de mhum está en camino! 🚚';
        html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h1 style="font-weight: 300; color: #1a1a1a;">¡Hola ${customerName}!</h1>
            <p>Te avisamos que tu pedido <strong>#${orderId.slice(-6).toUpperCase()}</strong> ya fue despachado y está en camino.</p>
            ${trackingCode ? `
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0;">Podés seguir tu envío con este código/link:</p>
              <p style="font-size: 18px; font-weight: bold; margin: 10px 0 0 0;">${trackingCode}</p>
            </div>
            ` : ''}
            <p>¡Gracias por elegir mhum!</p>
            <p style="font-size: 12px; color: #666; margin-top: 40px;">Si tenés alguna duda, podés responder a este correo.</p>
          </div>
        `;
      } else if (type === 'order_placed') {
        subject = '¡Recibimos tu pedido en mhum! ✨';
        html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h1 style="font-weight: 300; color: #1a1a1a;">¡Hola ${customerName}!</h1>
            <p>Recibimos tu pedido <strong>#${orderId.slice(-6).toUpperCase()}</strong> correctamente.</p>
            <p>Una vez que se acredite el pago (si aún no lo hiciste), comenzaremos a prepararlo.</p>
            <p>Te enviaremos otro correo cuando tu pedido sea despachado.</p>
            <p>¡Gracias por elegir mhum!</p>
          </div>
        `;
      }

      const data = await resend.emails.send({
        from: 'mhum <pedidos@mhum.com.ar>', // Cambiar por el dominio real verificado en Resend
        to: [to],
        subject: subject,
        html: html,
      });

      res.json({ success: true, data });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: 'Error sending email' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
