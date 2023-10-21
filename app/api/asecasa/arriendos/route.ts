// import puppeteer from 'puppeteer';

// interface PropertyData {
//   img: string | null;
//   title: string | null;
//   location: string;
//   body: string | null;
//   price: string | null;
//   area: string | null;
//   code: string | null;
// }

// async function openWebPage(): Promise<PropertyData[]> {
//   try {
//     const browser = await puppeteer.launch({ headless: "new" });
//     const page = await browser.newPage();
//     await page.goto('https://www.asecasa.com/inmuebles.php?destino=1');
//     await page.waitForSelector('#results');
  
//     const data = await page.evaluate(() => {
//       const results: PropertyData[] = [];
//       // ... (tu código aquí)
//       const propertyRows = document.querySelectorAll('.property-row');
    
//       propertyRows.forEach((row) => {
//         const img = row.querySelector('img')?.src;
//         const title = row.querySelector('.property-row-title a')?.textContent?.trim();
//         const locationList = row.querySelectorAll('.property-row-location li');
//         const location = Array.from(locationList).map(li => {
//           if (li?.textContent) {
//             return li.textContent.trim();
//           }
//           return '';
//         }).join(' ');
        
  
//         const body = row.querySelector('.property-row-body p')?.textContent?.trim();
  
//         const metaItems = row.querySelectorAll('.property-row-meta-item strong');
//         const price = metaItems[0]?.textContent?.trim();
//         const area = metaItems[1]?.textContent?.trim();
//         const code = metaItems[2]?.textContent?.trim();
  
//         results.push({
//           img: img ?? null,
//           title: title ?? null,
//           location: location,  // asumimos que siempre es un string
//           body: body ?? null,
//           price: price ?? null,
//           area: area ?? null,
//           code: code ?? null
//         });
        
//       });
//       return results;
//     });

//     await browser.close();
//     return data;
//   } catch (error) {
//     console.error("Error en openWebPage:", error);
//     return [];
//   }
// }

// export async function GET(req: Request, res: Response) {
//     const method = req.method;
//     if (method === 'GET') {
//       const data =  await openWebPage();
//       console.log('data', data);  
//       return new Response(JSON.stringify({ message: 'Ok', data }), {
//         status: 200,
//         headers: { 'Content-Type': 'application/json' },
//       });
      
//     } else {
//       return new Response('Hello, Next.js 500!', {
//         status: 500,
//       });
//     }
//   }
  

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

async function scrapeSinglePage(page: Page): Promise<PropertyData[]> {
  return page.evaluate(() => {
    const results: PropertyData[] = [];
    const propertyRows = document.querySelectorAll('.property-row');

    propertyRows.forEach((row) => {
      const img = row.querySelector('img')?.src ?? null;
      const title = row.querySelector('.property-row-title a')?.textContent?.trim() ?? null;
      const locationList = row.querySelectorAll('.property-row-location li');
      const location = Array.from(locationList).map(li => li?.textContent?.trim() ?? '').join(' ');
      const body = row.querySelector('.property-row-body p')?.textContent?.trim() ?? null;
      const metaItems = row.querySelectorAll('.property-row-meta-item strong');
      const price = metaItems[0]?.textContent?.trim() ?? null;
      const area = metaItems[1]?.textContent?.trim() ?? null;
      const code = metaItems[2]?.textContent?.trim() ?? null;

      results.push({
        img,
        title,
        location,
        body,
        price,
        area,
        code
      });
    });

    return results;
  });
}

async function openWebPage(): Promise<PropertyData[]> {
  const browser = await puppeteer.launch({ headless: false, slowMo: 600 }); // Cambiado a false para visualizar el navegador
  const page = await browser.newPage();
  await page.goto('https://www.asecasa.com/inmuebles.php?destino=1');
  await page.waitForSelector('#results');

  let allData: PropertyData[] = [];

  let hasNextPage = true;
  while (hasNextPage) {
    const data = await scrapeSinglePage(page);
    allData = [...allData, ...data];

    const lastButton = await page.$('.last');
    if (lastButton) {
      const nextButton = await page.$('.pagination li.active + li a'); // Selecciona el siguiente <li> después del <li> activo
      if (nextButton) {
        await nextButton.click();
        await page.waitForTimeout(6000); // Espera para que la página se cargue
      } else {
        hasNextPage = false;
      }
    } else {
      hasNextPage = false;
    }
  }

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

