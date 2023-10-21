import puppeteer, { ElementHandle, Page } from 'puppeteer';

interface PropertyData {
    img: string | null;
    title: string | null;
    location: string;
    body: string | null;
    price: string | null;
    area: string | null;
    code: string | null;
  }

async function openWebPage(): Promise<PropertyData[]> {
    const browser = await puppeteer.launch({ headless: false, slowMo: 600 }); // Cambiado a false para visualizar el navegador
    const page = await browser.newPage();
    await page.goto('https://www.ciencuadras.com/arriendo');
    let allData: PropertyData[] = [];

    const data = await page.evaluate(() => {
      const elements = document.querySelectorAll('ciencuadras-list-cards');
      console.log(`elements`, elements);
      const results: PropertyData[] = [];
      
      elements.forEach((element) => {
        // Aquí puedes extraer los datos del elemento
        // Por ejemplo, si tiene un atributo 'data-id':
        const id = element.getAttribute('data-id');
        
        // Añade los datos extraídos a tu array de resultados
        results.push({
          // Tus campos aquí, por ejemplo:
          id: id,
        });
      });
      
      return results;
    });
  
    allData = [...allData, ...data];
  
    await browser.close();

    

    await browser.close();  
    return allData;
  }

export async function GET(req: Request, res: Response) {
    const method = req.method;
    if (method === 'GET') {
      const data =  await openWebPage();
      console.log('data', data);  
      return new Response(JSON.stringify({ message: 'Ok', data, count: data.length }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
      
    } else {
      return new Response('Hello, Next.js 500!', {
        status: 500,
      });
    }
  }