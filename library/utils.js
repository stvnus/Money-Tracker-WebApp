export const currencyFormatter = (amount) => {
  const formatter = Intl.NumberFormat("id-ID", {
    currency: "IDR",
    style: "currency",
  });

  return formatter.format(amount);
};



