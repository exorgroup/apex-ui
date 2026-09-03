import { describe, it, expect } from 'vitest';
import { useApexDialog, __dialogHide, __dialogDestroy, __dialogState } from '../src/core/dialog';
import { defineComponent } from 'vue';

const Stub = defineComponent({ render: () => null });

describe('the dialog service contract the Add New docs rely on', () => {
  it('close(data) carries the record to onClose once the dialog is destroyed', () => {
    const seen: unknown[] = [];
    const d = useApexDialog();
    const handle = d.open(Stub, { onClose: ({ data }) => seen.push(data) });

    // What a form does: dialogRef.close(record).
    __dialogHide(handle.id, { value: 'sliema', label: 'Sliema' });
    // onClose deliberately waits for the leave transition to finish, so
    // nothing has fired yet.
    expect(seen).toEqual([]);

    // ApexDialog calls this from @after-hide.
    __dialogDestroy(handle.id);
    expect(seen).toEqual([{ value: 'sliema', label: 'Sliema' }]);
  });

  it('dismissing without data reports undefined, so a handler can tell them apart', () => {
    const seen: unknown[] = [];
    const d = useApexDialog();
    const handle = d.open(Stub, { onClose: ({ data }) => seen.push(data) });
    __dialogHide(handle.id);
    __dialogDestroy(handle.id);
    expect(seen).toEqual([undefined]);
  });

  it('a second dialog stacks above the first and closes independently', () => {
    const order: string[] = [];
    const d = useApexDialog();
    const first = d.open(Stub, { onClose: () => order.push('first') });
    const second = d.open(Stub, { onClose: () => order.push('second') });
    expect(__dialogState.instances.length).toBe(2);
    // The inner one closes; the outer is untouched.
    __dialogHide(second.id); __dialogDestroy(second.id);
    expect(order).toEqual(['second']);
    expect(__dialogState.instances.length).toBe(1);
    __dialogHide(first.id); __dialogDestroy(first.id);
    expect(order).toEqual(['second', 'first']);
  });
});
