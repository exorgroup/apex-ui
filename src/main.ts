import { createApp } from 'vue';
import ApexUI from '@exorgroup/apex-ui';
import '../../apex-ui/src/styles/tokens.css';
import '../../apex-ui/src/styles/apex-ui.css';
import './docs.css';
import App from './App.vue';
import { docsCan } from './docsCan';

/*
 * `can` is registered here rather than nearer the demo that shows it, because
 * this is where a real app registers it: once, at install, so every gated
 * control asks the same question and no call site repeats the check.
 */
createApp(App)
  .use(ApexUI, { size: 'md', labelPlacement: 'top', can: docsCan })
  .mount('#app');
