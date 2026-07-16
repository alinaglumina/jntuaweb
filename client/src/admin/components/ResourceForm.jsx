import { useForm, Controller } from 'react-hook-form';
import { FormField, Input, Textarea, Select, Checkbox, FileUpload, RichTextEditor, Button } from '../../components/ui/index.js';

// Builds a create/edit form from a resource's field defs, using the UI kit.
// html → RichTextEditor, file/image → FileUpload, plus text/select/date/checkbox.
export default function ResourceForm({ fields, initial, onSubmit, onCancel, busy, error }) {
  const defaults = {};
  for (const f of fields) {
    if (f.type === 'file' || f.type === 'image') continue;
    if (f.type === 'date' && initial?.[f.name]) defaults[f.name] = String(initial[f.name]).slice(0, 10);
    else defaults[f.name] = initial?.[f.name] ?? (f.type === 'checkbox' ? (f.default ?? false) : '');
  }
  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm({ defaultValues: defaults });

  const submit = (values) => {
    const out = { ...values };
    for (const f of fields) if ((f.type === 'file' || f.type === 'image') && !(out[f.name] instanceof File)) delete out[f.name];
    onSubmit(out);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      {fields.map((f) => {
        if (f.type === 'file' || f.type === 'image') {
          return <FileUpload key={f.name} label={f.label} accept={f.type === 'image' ? 'image/*' : undefined}
            current={initial?.[f.name]} onFile={(file) => setValue(f.name, file)} />;
        }
        if (f.type === 'checkbox') return <Controller key={f.name} name={f.name} control={control} render={({ field }) => <Checkbox label={f.label} checked={!!field.value} onChange={field.onChange} />} />;
        if (f.type === 'html') {
          return (
            <FormField key={f.name} label={f.label} required={f.required} error={errors[f.name] && `${f.label} is required`}>
              <Controller name={f.name} control={control} rules={{ required: f.required }}
                render={({ field }) => <RichTextEditor value={field.value} onChange={field.onChange} />} />
            </FormField>
          );
        }
        return (
          <FormField key={f.name} label={f.label} required={f.required} error={errors[f.name] && `${f.label} is required`}>
            {f.type === 'select' ? <Select options={f.options} {...register(f.name, { required: f.required })} />
              : f.type === 'textarea' ? <Textarea {...register(f.name, { required: f.required })} />
              : <Input type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'} {...register(f.name, { required: f.required })} />}
          </FormField>
        );
      })}
      {error && <div className="rounded-md bg-crimson/10 px-3 py-2 text-sm text-crimson-700">{error.message}</div>}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={busy}>Cancel</Button>
        <Button type="submit" size="sm" loading={busy}>Save</Button>
      </div>
    </form>
  );
}
