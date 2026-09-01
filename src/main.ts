import { createApp } from 'vue';
import ApexUI from '@exorgroup/apex-ui';
import '../../apex-ui/src/styles/tokens.css';
import '../../apex-ui/src/styles/apex-ui.css';
import './docs.css';
import App from './App.vue';

createApp(App).use(ApexUI, { size: 'md', labelPlacement: 'top' }).mount('#app');
