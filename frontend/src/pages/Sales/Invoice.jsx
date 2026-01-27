import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

const BASE_URL = "http://127.0.0.1:8000";
const ITEMS_PER_PAGE = 15; // ✅ Reduced to 15 for guaranteed page fitting

function Invoice() {
  const { billId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchInvoice() {
      try {
        const res = await fetch(`${BASE_URL}/sales/${billId}`);
        if (!res.ok) throw new Error("Failed to fetch invoice");
        const data = await res.json();
        setInvoice(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchInvoice();
  }, [billId]);

  function handleBack() {
    if (location.state?.from === "customer-details") {
      navigate(`/customers/${location.state.customerId}`);
    } else if (location.state?.from === "sales-history") {
      navigate("/sales/history");
    } else if (location.state?.from === "new-sale") {
      navigate("/sales/new");
    } else {
      navigate("/dashboard");
    }
  }

  if (loading) return <div className="p-6">Loading invoice...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!invoice) return null;

  // ✅ Split items into pages
  const pages = [];
  for (let i = 0; i < invoice.items.length; i += ITEMS_PER_PAGE) {
    pages.push(invoice.items.slice(i, i + ITEMS_PER_PAGE));
  }

  // ✅ Render a single page (used for both screen and print)
  const renderPage = (pageItems, pageIndex, isPrint = false) => (
    <div 
      className={isPrint ? "invoice-page" : "bg-white border rounded shadow-sm p-6"}
      style={isPrint ? {} : {}}
    >
      {/* HEADER */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        borderBottom: '2px solid #000',
        paddingBottom: '8px',
        marginBottom: '12px'
      }}>
        <div>
          <h1 style={{ fontSize: isPrint ? '18px' : '20px', fontWeight: 'bold', margin: 0 }}>
            Bibek & Nabin Traders
          </h1>
          <p style={{ fontSize: isPrint ? '11px' : '14px', margin: '2px 0', color: '#666' }}>
            Hardware & Sanitary Store
          </p>
        </div>

        <div style={{ textAlign: 'right', fontSize: isPrint ? '11px' : '13px' }}>
          <p style={{ margin: '2px 0' }}>
            <b>Date:</b> {new Date(invoice.created_at).toLocaleDateString()}
          </p>
          <p style={{ margin: '2px 0' }}>
            <b>Time:</b> {new Date(invoice.created_at).toLocaleTimeString()}
          </p>
          <p style={{ margin: '2px 0' }}>
            <b>Bill No:</b> #{invoice.id}
          </p>
          {pages.length > 1 && (
            <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#666' }}>
              Page {pageIndex + 1} of {pages.length}
            </p>
          )}
        </div>
      </div>

      {/* CUSTOMER - Only on first page */}
      {pageIndex === 0 && (
        <div style={{ marginBottom: '12px', fontSize: isPrint ? '11px' : '13px' }}>
          <p style={{ margin: '2px 0' }}>
            <b>Customer:</b> {invoice.customer_name || "Walk-in"}
          </p>
          {invoice.customer_phone && (
            <p style={{ margin: '2px 0' }}>
              <b>Phone:</b> {invoice.customer_phone}
            </p>
          )}
          {invoice.customer_address && (
            <p style={{ margin: '2px 0' }}>
              <b>Address:</b> {invoice.customer_address}
            </p>
          )}
        </div>
      )}

      {/* ITEMS TABLE */}
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse',
        border: '1px solid #333',
        fontSize: isPrint ? '10px' : '13px',
        marginTop: '8px'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#e8e8e8' }}>
            <th style={{ padding: '6px', border: '1px solid #333', textAlign: 'center' }}>S.No</th>
            <th style={{ padding: '6px', border: '1px solid #333', textAlign: 'left' }}>Item</th>
            <th style={{ padding: '6px', border: '1px solid #333', textAlign: 'right' }}>Qty</th>
            <th style={{ padding: '6px', border: '1px solid #333', textAlign: 'right' }}>Price</th>
            <th style={{ padding: '6px', border: '1px solid #333', textAlign: 'right' }}>Discount</th>
            <th style={{ padding: '6px', border: '1px solid #333', textAlign: 'right' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {pageItems.map((item, idx) => {
            const globalIndex = pageIndex * ITEMS_PER_PAGE + idx;
            
            return (
              <tr key={idx}>
                <td style={{ padding: '5px', border: '1px solid #333', textAlign: 'center', fontWeight: '500' }}>
                  {globalIndex + 1}
                </td>
                <td style={{ padding: '5px', border: '1px solid #333' }}>{item.item_name}</td>
                <td style={{ padding: '5px', border: '1px solid #333', textAlign: 'right' }}>{item.quantity}</td>
                <td style={{ padding: '5px', border: '1px solid #333', textAlign: 'right' }}>₹{item.price}</td>
                <td style={{ padding: '5px', border: '1px solid #333', textAlign: 'right' }}>{item.discount_percent}%</td>
                <td style={{ padding: '5px', border: '1px solid #333', textAlign: 'right' }}>₹{item.final_price}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* TOTALS - Only on last page */}
      {pageIndex === pages.length - 1 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          marginTop: '16px',
          pageBreakInside: 'avoid'
        }}>
          <div style={{ width: '220px', fontSize: isPrint ? '11px' : '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Subtotal</span>
              <span>₹{invoice.total_amount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Discount</span>
              <span>₹{invoice.total_discount}</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontWeight: 'bold',
              borderTop: '1px solid #333',
              paddingTop: '6px',
              marginTop: '4px',
              marginBottom: '4px'
            }}>
              <span>Final</span>
              <span>₹{invoice.rounded_final_amount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Paid</span>
              <span>₹{invoice.amount_paid}</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              color: '#dc2626', 
              fontWeight: '600' 
            }}>
              <span>Due</span>
              <span>₹{invoice.due_amount}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* ============ SCREEN VERSION ============ */}
      <div className="print:hidden flex justify-center bg-gray-100 p-6">
        <div className="w-full max-w-3xl">
          {/* Breadcrumb Navigation */}
          {location.state?.from === "customer-details" && (
            <nav className="text-sm text-gray-500 mb-3">
              <span
                onClick={() => navigate("/customers")}
                className="cursor-pointer hover:underline text-blue-600"
              >
                Customers
              </span>
              <span className="mx-2">/</span>
              <span
                onClick={() => navigate(`/customers/${location.state.customerId}`)}
                className="cursor-pointer hover:underline text-blue-600"
              >
                Customer
              </span>
              <span className="mx-2">/</span>
              <span className="text-gray-700 font-medium">
                Invoice #{invoice.id}
              </span>
            </nav>
          )}

          {/* BACK BUTTON */}
          <button
            onClick={handleBack}
            className="bg-gray-300 px-4 py-2 rounded mb-4 hover:bg-gray-400"
          >
            ← Back
          </button>

          {/* SCREEN PREVIEW */}
          {pages.map((pageItems, pageIndex) => (
            <div key={pageIndex} className={pageIndex > 0 ? 'mt-6 mb-6' : 'mb-6'}>
              {renderPage(pageItems, pageIndex, false)}
            </div>
          ))}

          {/* PRINT BUTTON */}
          <div className="text-center mt-6 mb-8">
            <button
              onClick={() => {
                // Force print settings before opening dialog
                setTimeout(() => window.print(), 100);
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 font-medium"
            >
              🖨️ Print Invoice
            </button>
            <p className="text-sm text-gray-600 mt-2">
              💡 Tip: In print dialog, set Scale to 100% and Margins to "None"
            </p>
          </div>
        </div>
      </div>

      {/* ============ PRINT VERSION ============ */}
      {pages.map((pageItems, pageIndex) => (
        <div key={`print-${pageIndex}`} className="hidden print:block">
          {renderPage(pageItems, pageIndex, true)}
        </div>
      ))}
    </>
  );
}

export default Invoice;