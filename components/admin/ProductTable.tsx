import { Edit3, Trash2 } from 'lucide-react';

export default function ProductTable({ data, onEdit, onDelete }: any) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="p-4 text-xs font-bold text-gray-400 uppercase">Product</th>
            <th className="p-4 text-xs font-bold text-gray-400 uppercase text-center">Price</th>
            <th className="p-4 text-xs font-bold text-gray-400 uppercase text-center">Stock</th>
            <th className="p-4 text-xs font-bold text-gray-400 uppercase text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((p: any) => (
            <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50 transition">
              <td className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden border p-1">
                  <img src={p.image} className="w-full h-full object-contain" alt={p.name} />
                </div>
                <span className="font-bold text-slate-700 text-sm">{p.name}</span>
              </td>
              <td className="p-4 text-center text-sm font-bold text-slate-700">Rs {p.price.toLocaleString()}</td>
              <td className="p-4 text-center">
                <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">{p.stock} In Stock</span>
              </td>
              <td className="p-4 text-right">
                <div className="flex justify-end gap-2">
                  <button onClick={() => onEdit(p)} className="p-2 hover:bg-blue-50 text-blue-500 rounded-lg transition"><Edit3 size={18}/></button>
                  <button onClick={() => onDelete(p.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition"><Trash2 size={18}/></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}