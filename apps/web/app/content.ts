import pkg from '@flipbook/writer/package.json';

const titleWithoutName = 'QR Codes of infinite size';
const title = `Flipbook - ${titleWithoutName}`;
const url = 'https://flipbook.codes';

export const meta = {
  titleWithoutName,
  title,
  description:
    'Flipbook is a superset of QR codes that allows for infinitely sized payloads. Download apps, rich-text, and more without the need for an internet connection.',
  url,
  logotype: {
    url: `${url}/logotype.svg`,
    width: 3200,
    height: 800,
    alt: title,
  },
};

export const homepage = {
  title: 'Scan a Flipbook QR Code',
  description:
    '"Flipbooks" are a superset of QR codes in the form of an animated GIF. This allows for digital information of any size to betransferred without the need for an internet connection. Flipbooks can be used to download apps, music, movies, rich-text, and more.',
  version: `Beta Release v${pkg.version}`,
  camera: 'Scan with Camera',
  upload: 'Upload File',
  screen: 'Scan on Screen',
};

export const writer = {
  github: 'View on Github',
};
