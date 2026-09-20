import { it } from 'vitest';
import { cleanPastedHtml } from '../src/core/editor/paste';

it('scratch real clipboard', () => {
  const real = '<html>\r\n<body>\r\n<!--StartFragment--><p data-pm-slice="1 1 []">COPYME</p><!--EndFragment-->\r\n</body>\r\n</html>';
  console.log('OUT:', JSON.stringify(cleanPastedHtml(real)));
  console.log('OUT2:', JSON.stringify(cleanPastedHtml('<!--StartFragment--><p data-pm-slice="1 1 []">COPYME</p><!--EndFragment-->')));
  console.log('OUT3:', JSON.stringify(cleanPastedHtml('<p data-pm-slice="1 1 []">COPYME</p>')));
});
