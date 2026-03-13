/**
 * formatDate
 * Converts a backend ISO date string to readable format or input-compatible format
 * @param date - ISO string or Date object
 * @param forInput - boolean, true if for <input type="date">, false for display
 * @returns string
 */
export function formatDate(date?: string | Date, forInput = false): string {
  if (!date) return "";

  const d = new Date(date);
  const pad = (n: number) => n.toString().padStart(2, "0");

  if (forInput) {
    // For input type="date": YYYY-MM-DD
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  } else {
    // For display: DD/MM/YYYY
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  }
}


// Example: product price = 1000, discount = 10, type = "percentage"
export const calculateDiscount = (product: any) => {
  if (!product.discount || product.discount <= 0) return 0;

  if (product.discountType === "percentage") {
    return (product.price * product.discount) / 100;
  } else if (product.discountType === "fixed") {
    return product.discount;
  }
  return 0;
};




export const getStatusVariant = (
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'active':
      return 'default';
    case 'inactive':
      return 'outline';
    default:
      return 'secondary';
  }
};


export const orderStages = ["placed", "confirmed", "shipped", "delivered", "cancelled"];
// export const stages = [ "placed", "pending_payment", "payment_failed", "confirmed", "processing", "packed", "shipped", "out_for_delivery", "delivered", "cancelled", "return_requested", "returned", "refunded"];