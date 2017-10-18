function parseSize(text) {
  // strip irrelevant characters
  let strippedText = text.replace(/[,\s]/g, '').toLowerCase();
  // ensure ends with "b"
  if (strippedText.substring(strippedText.length - 1) !== 'b')
    strippedText += 'b';

  let value = strippedText.substring(0, strippedText.length - 2);
  let unit = strippedText.substring(strippedText.length - 2);
  switch (unit) {
    case 'kb':
      return value / 1024;
    case 'mb':
      return value;
    case 'gb':
      return value * 1024;
  }
}

export { parseSize };