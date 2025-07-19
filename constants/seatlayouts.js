function generateSeats(seatlayout) {
  const layout = [];
  let currentRowCharCode = 'A'.charCodeAt(0); // Start from A

  for (const { class: seatClass, rows, columns } of seatlayout) {
    for (let i = 0; i < rows; i++) {
      const rowLetter = String.fromCharCode(currentRowCharCode++);
      for (let j = 1; j <= columns; j++) {
        layout.push({
          seatid: `${rowLetter}${j}`,
          row: rowLetter,
          column: j,
          seatClass,
        });
      }
    }
  }

  return layout;
}
module.exports = { generateSeats };
