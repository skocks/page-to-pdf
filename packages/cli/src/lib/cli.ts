import { promises } from 'fs';
import { chromium } from 'playwright';
import * as yargs from 'yargs';

interface Argvs {
  page: string;
  outfile: string;
  customjs?: string;
  customcss?: string;
  format: string;
  scale: number;
}

export async function main() {
  const { page, outfile, customjs, customcss, scale, format }: Argvs =
    initArguments();

  await execute(page, outfile, { format, scale }, customjs, customcss);
}

async function execute(
  visitedPage: string,
  outfile: string,
  config: { format: string; scale: number },
  customjs?: string,
  customcss?: string
) {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(visitedPage);
  if (customjs) {
    await page.addScriptTag({ path: customjs });
  }
  if (customcss) {
    await page.addStyleTag({ path: customcss });
  }

  const pdf = await page.pdf({
    format: config.format,
    landscape: true,
    scale: config.scale,
  });
  await promises.writeFile(outfile, pdf);

  await browser.close();
}

function initArguments() {
  return yargs
    .option('page', {
      alias: 'p',
      description: 'Set the page to render to pdf.',
      type: 'string',
    })
    .option('outfile', {
      alias: 'o',
      description: 'Define the output pdf filename.',
      type: 'string',
    })
    .option('format', {
      alias: 'f',
      description: 'Define the format for rendered pdf.',
      type: 'string',
      default: 'A4',
    })
    .option('scale', {
      alias: 's',
      description: 'Define the scale [0-1] for rendered pdf.',
      type: 'number',
      default: 0.7,
    })
    .demandOption(['page', 'outfile'])
    .help()
    .version().argv;
}
