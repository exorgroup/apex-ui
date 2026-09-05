import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexUI from '../src/index';
import ApexAlert from '../src/components/ApexAlert.vue';
import ApexConfirmPopup from '../src/components/ApexConfirmPopup.vue';
import { useApexAlert, __alertState } from '../src/core/alert';

/**
 * One service, two hosts.
 *
 * A request carrying a `target` is anchored and belongs to ApexConfirmPopup; a
 * request without one belongs to ApexAlert. Both are mounted at once in a real
 * app, so the split has to be exclusive — if each host only checked "am I
 * open?", every confirm would render twice, once centred and once anchored,
 * and the page-render guard would not notice because both drew fine.
 */

const alert = useApexAlert();

const panel = () => document.querySelector('.apex-alert');
const popup = () => document.querySelector('.apex-cpop');

let hosts: ReturnType<typeof mount>;

beforeEach(() => {
  /* Both mounted, as an app shell would. */
  hosts = mount({
    components: { ApexAlert, ApexConfirmPopup },
    template: '<div><ApexAlert /><ApexConfirmPopup /></div>',
  }, { global: { plugins: [ApexUI] }, attachTo: document.body });
});
afterEach(() => { alert.close(); hosts.unmount(); document.body.innerHTML = ''; });

describe('routing by target', () => {
  it('sends an unanchored confirm to the alert, and only there', async () => {
    alert.confirm({ title: 'Delete area?' });
    await hosts.vm.$nextTick();
    expect(panel(), 'the centred alert answers').toBeTruthy();
    expect(popup(), 'and the popup stays out of it').toBeFalsy();
  });

  it('sends an anchored confirm to the popup, and only there', async () => {
    const btn = document.createElement('button');
    document.body.appendChild(btn);

    alert.confirm({ message: 'Delete this row?', target: btn });
    await hosts.vm.$nextTick();
    expect(popup(), 'the anchored popup answers').toBeTruthy();
    expect(panel(), 'and the alert stays out of it').toBeFalsy();
  });

  it('run() is dialog-only even when a target is passed', async () => {
    /* The rule we settled: a staged flow cannot follow a popup anchored to the
       button that was just pressed. run() drops the anchor, so this lands in
       the alert. */
    const btn = document.createElement('button');
    document.body.appendChild(btn);

    let release!: () => void;
    const held = new Promise<void>((r) => { release = r; });
    const p = alert.run({ confirm: { title: 'Go?', target: btn }, action: () => held });
    await hosts.vm.$nextTick();

    expect(panel(), 'the alert answers a staged flow').toBeTruthy();
    expect(popup()).toBeFalsy();

    release();
    await Promise.resolve(); await Promise.resolve();
    alert.close(); await p.catch(() => {});
  });
});

describe('the popup shares the alert\'s buttons', () => {
  it('builds the same default pair, gated the same way', async () => {
    const btn = document.createElement('button');
    document.body.appendChild(btn);

    alert.confirm({ message: 'Delete?', cancelText: 'Keep', acceptLabel: 'Delete it', target: btn });
    await hosts.vm.$nextTick();

    const labels = [...document.querySelectorAll('.apex-cpop__actions button')]
      .map((b) => b.textContent?.trim());
    expect(labels).toEqual(['Keep', 'Delete it']);
  });

  it('settles the shared service, so the caller\'s promise resolves', async () => {
    /* The popup used to call its own service's `custom()`. Now it presses the
       same handler the alert does — if that wiring were wrong the popup would
       look right and the await would never return. */
    const btn = document.createElement('button');
    document.body.appendChild(btn);

    const p = alert.confirm({ message: 'Delete?', cancelText: 'Keep', target: btn });
    await hosts.vm.$nextTick();

    const accept = [...document.querySelectorAll('.apex-cpop__actions button')].at(-1) as HTMLElement;
    accept.click();
    expect(await p).toBe(true);
    expect(__alertState.open).toBe(false);
  });

  it('hides a denied button in the popup too', async () => {
    hosts.unmount();
    hosts = mount({
      components: { ApexConfirmPopup },
      template: '<ApexConfirmPopup />',
    }, {
      global: { plugins: [[ApexUI, { can: (a: string) => a !== 'delete' }]] },
      attachTo: document.body,
    });

    const btn = document.createElement('button');
    document.body.appendChild(btn);
    alert.confirm({
      message: 'Manage',
      target: btn,
      buttons: [
        { label: 'Rename', can: 'update', resource: 'rows' },
        { label: 'Delete', can: 'delete', resource: 'rows', role: 'accept' },
      ],
    });
    await hosts.vm.$nextTick();

    const labels = [...document.querySelectorAll('.apex-cpop__actions button')]
      .map((b) => b.textContent?.trim());
    expect(labels, 'the same gate applies wherever the buttons appear').toEqual(['Rename']);
  });
});
