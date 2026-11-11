"use client";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { ActionForm } from "./action-form";
import { locations } from "@/config/locations";
import { resellerPortal } from "@/config/reseller";
import { submitRequest } from "@/app/revendedor/solicitar/actions";
export function RequestForm({ token, unit }: { token: string; unit: string }) {
  const [rows, setRows] = useState([
      { id: 0, product: "", sku: "", quantity: "1" },
    ]),
    [sequence, setSequence] = useState(1);
  const [selectedUnit, setUnit] = useState(unit),
    [notes, setNotes] = useState(""),
    [acknowledged, setAcknowledged] = useState(false);
  function change(
    id: number,
    field: "product" | "sku" | "quantity",
    value: string,
  ) {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  }
  return (
    <ActionForm action={submitRequest} label="Registrar minha solicitação">
      <input type="hidden" name="token" value={token} />
      <label htmlFor="request-unit">
        Qual unidade vai atender você?
        <select
          id="request-unit"
          name="unit"
          value={selectedUnit}
          onChange={(event) => setUnit(event.target.value)}
          required
        >
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.city} · {location.stateCode}
            </option>
          ))}
        </select>
      </label>
      <div className="portal-request-items">
        {rows.map((row, index) => (
          <div className="portal-request-item" key={row.id}>
            <div className="portal-item-title">
              <h2>Produto {index + 1}</h2>
              {rows.length > 1 && (
                <button
                  type="button"
                  className="portal-remove"
                  onClick={() =>
                    setRows(rows.filter((item) => item.id !== row.id))
                  }
                  aria-label={`Remover produto ${index + 1}`}
                >
                  <Trash2 size={18} aria-hidden="true" />
                  Remover
                </button>
              )}
            </div>
            <label htmlFor={`product-${row.id}`}>
              Nome do produto
              <input
                name="product"
                id={`product-${row.id}`}
                value={row.product}
                onChange={(event) =>
                  change(row.id, "product", event.target.value)
                }
                minLength={2}
                maxLength={160}
                placeholder="Como aparece no catálogo"
                required
              />
            </label>
            <div className="portal-two-fields">
              <label htmlFor={`sku-${row.id}`}>
                Código, se souber
                <input
                  name="sku"
                  id={`sku-${row.id}`}
                  value={row.sku}
                  onChange={(event) =>
                    change(row.id, "sku", event.target.value)
                  }
                  maxLength={80}
                />
              </label>
              <label htmlFor={`quantity-${row.id}`}>
                Quantidade
                <input
                  name="quantity"
                  id={`quantity-${row.id}`}
                  value={row.quantity}
                  onChange={(event) =>
                    change(row.id, "quantity", event.target.value)
                  }
                  type="number"
                  min={1}
                  max={99}
                  step={1}
                  required
                />
              </label>
            </div>
          </div>
        ))}
      </div>
      {rows.length < resellerPortal.requestLimit && (
        <button
          className="button button-secondary"
          type="button"
          onClick={() => {
            setRows([
              ...rows,
              { id: sequence, product: "", sku: "", quantity: "1" },
            ]);
            setSequence(sequence + 1);
          }}
        >
          <Plus size={18} aria-hidden="true" />
          Adicionar produto
        </button>
      )}
      <label htmlFor="request-notes">
        Observações para a equipe <span className="portal-hint">Opcional</span>
        <textarea
          id="request-notes"
          name="notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          maxLength={1000}
        />
      </label>
      <label className="portal-checkbox">
        <input
          type="checkbox"
          name="acknowledgment"
          checked={acknowledged}
          onChange={(event) => setAcknowledged(event.target.checked)}
          required
        />
        <span>
          Entendo que a loja confirmará valores, disponibilidade e entrega. O
          envio registra uma solicitação para atendimento pela unidade
          escolhida.
        </span>
      </label>
    </ActionForm>
  );
}
