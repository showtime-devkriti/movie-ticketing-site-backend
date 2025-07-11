
function generateSeats(rows, colsPerRow, classArray) {
  const layout = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const seatClass = classArray[i] || 'Silver'; // fallback
    for (let j = 1; j <= colsPerRow; j++) {
      layout.push({
        seatid: `${row}${j}`,
        row,
        column: j,
        seatClass
      });
    }
  }
  return layout;
}


function bigLayout1() {
  // 10 rows (A-J), 15 seats per row
  const classes = ['Silver', 'Silver', 'Silver', 'Gold', 'Gold', 'Gold', 'Platinum', 'Platinum', 'Diamond', 'Diamond'];
  return generateSeats(['A','B','C','D','E','F','G','H','I','J'], 15, classes);
}

function bigLayout2() {
  // 12 rows (A-L), variable seat class zones
  const classes = ['Silver','Silver','Silver','Silver','Gold','Gold','Gold','Platinum','Platinum','Diamond','Diamond','Diamond'];
  return generateSeats(['A','B','C','D','E','F','G','H','I','J','K','L'], 14, classes);
}

function bigLayout3() {
  // 8 rows (A-H), wider (20 seats per row)
  const classes = ['Silver','Silver','Gold','Gold','Gold','Platinum','Diamond','Diamond'];
  return generateSeats(['A','B','C','D','E','F','G','H'], 20, classes);
}

function bigLayout4() {
  // 15 rows (A-O), theater style tiers
  const classes = [
    'Silver','Silver','Silver',
    'Gold','Gold','Gold',
    'Platinum','Platinum','Platinum',
    'Diamond','Diamond','Diamond','Diamond','Diamond','Diamond'
  ];
  return generateSeats(
    'ABCDEFGHIJKLMNO'.split(''),
    16,
    classes
  );
}

module.exports = {
  bigLayout1,
  bigLayout2,
  bigLayout3,
  bigLayout4
};