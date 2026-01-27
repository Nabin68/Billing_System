import { useState } from "react";
import { updateProduct } from "../../api/items";

function ProductRow({ product, index, onUpdate }) {
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ ...product });

  function recalc(field, value) {
    const copy = { ...form, [field]: value };

    if (field === "cost_price" || field === "margin_percent") {
      copy.selling_price =
        copy.cost_price + (copy.cost_price * copy.margin_percent) / 100;
    }

    setForm(copy);
  }

  async function save() {
    await updateProduct(product.id, form);
    onUpdate(form);
    setEdit(false);
  }

  return (
    <tr className="border-t">
      <td className="text-center">{index + 1}</td>

      {["name", "quantity", "cost_price", "margin_percent", "selling_price"].map(field => (
        <td key={field}>
          {edit ? (
            <input
              value={form[field]}
              onChange={e => recalc(field, Number(e.target.value) || e.target.value)}
              className="border px-2 py-1 w-full"
            />
          ) : (
            form[field]
          )}
        </td>
      ))}

      <td className="text-center">
        {edit ? (
          <>
            <button onClick={save} className="text-green-600 mr-2">Save</button>
            <button onClick={() => setEdit(false)}>Cancel</button>
          </>
        ) : (
          <button onClick={() => setEdit(true)}>✏️ Edit</button>
        )}
      </td>
    </tr>
  );
}

export default ProductRow;
