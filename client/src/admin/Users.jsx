import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import api from '../lib/axios.js';
import { Loading, ErrorState } from '../components/AsyncState.jsx';
import { ConfirmDialog } from '../components/ui/index.js';

export default function Users() {
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const { register, handleSubmit, reset } = useForm({ defaultValues: { role: 'director' } });

  const { data = [], isLoading, isError, error } = useQuery({ queryKey: ['users'], queryFn: () => api.get('/admin/users').then((d) => d.items ?? []) });
  const create = useMutation({ mutationFn: (v) => api.post('/admin/users', v), onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setAdding(false); reset(); } });
  const del = useMutation({ mutationFn: (id) => api.delete(`/admin/users/${id}`), onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setConfirm(null); } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl"><i className="fa-solid fa-users-gear mr-2 text-crimson" /> Users</h1>
        <button className="btn-primary text-sm" onClick={() => setAdding((v) => !v)}><i className="fa-solid fa-user-plus" /> Add user</button>
      </div>

      {adding && (
        <form onSubmit={handleSubmit((v) => create.mutate(v))} className="card mb-6 grid gap-3 p-4 md:grid-cols-3">
          <input className="field" placeholder="Username" {...register('username', { required: true })} />
          <input className="field" placeholder="Full name" {...register('fullName')} />
          <input className="field" type="password" placeholder="Password" {...register('password', { required: true })} />
          <input className="field" placeholder="Email" {...register('email')} />
          <select className="field" {...register('role')}><option value="director">Director</option><option value="admin">Admin</option></select>
          <input className="field" placeholder="Directorate key (e.g. otpri)" {...register('directorate')} />
          {create.isError && <p className="text-sm text-crimson md:col-span-3">{create.error.message}</p>}
          <div className="md:col-span-3"><button className="btn-primary text-sm" disabled={create.isPending}>{create.isPending ? 'Creating…' : 'Create user'}</button></div>
        </form>
      )}

      {isLoading ? <Loading /> : isError ? <ErrorState error={error} /> : (
        <div className="overflow-x-auto rounded-lg bg-white shadow-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-navy/5 text-navy"><tr><th className="px-4 py-3">Username</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Directorate</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((u) => (
                <tr key={u._id} className="hover:bg-navy/5">
                  <td className="px-4 py-3 font-medium">{u.username}</td>
                  <td className="px-4 py-3">{u.fullName || '—'}</td>
                  <td className="px-4 py-3"><span className={`rounded px-2 py-0.5 text-xs ${u.role === 'admin' ? 'bg-crimson/10 text-crimson-700' : 'bg-navy/10 text-navy'}`}>{u.role}</span></td>
                  <td className="px-4 py-3">{u.directorate || '—'}</td>
                  <td className="px-4 py-3 text-right"><button className="text-crimson hover:text-crimson-700" onClick={() => setConfirm(u)}><i className="fa-solid fa-trash" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmDialog open={!!confirm} title={`Delete user “${confirm?.username}”?`} onConfirm={() => del.mutate(confirm._id)} onCancel={() => setConfirm(null)} busy={del.isPending} />
    </div>
  );
}
